/* Charts: status summary + trends (Chart.js) */
function initCharts(ctxKey = activeProjectStatusContext) {
  setActiveProjectStatusContext(ctxKey);
  const ctx = projectStatusContexts[ctxKey];
  if (!ctx) return;

  const budgetCanvas = ctx.budgetChartCanvas;
  const statusCanvas = ctx.statusPieCanvas;
  const trendCanvas = ctx.trendLineCanvas;
  if (!budgetCanvas || !statusCanvas) return;

  if (ctx.budgetByMonthChart) {
    ctx.budgetByMonthChart.destroy();
    ctx.budgetByMonthChart = null;
  }
  if (ctx.statusPieChart) {
    ctx.statusPieChart.destroy();
    ctx.statusPieChart = null;
  }
  if (ctx.trendLineChart) {
    ctx.trendLineChart.destroy();
    ctx.trendLineChart = null;
  }

  const budgetCtx = budgetCanvas.getContext("2d");
  const statusCtx = statusCanvas.getContext("2d");
  const trendCtx = trendCanvas ? trendCanvas.getContext("2d") : null;
  const makeStackDataset = (label, backgroundColor, datasetIndex) => ({
    label,
    data: [],
    backgroundColor,
    stack: "status",
    borderSkipped: false,
    pointStyle: "rectRounded",
    borderRadius(ctx) {
      const i = ctx.dataIndex;
      const ds = ctx.chart.data.datasets;
      const curr = ds[datasetIndex]?.data?.[i] || 0;
      const hasRightSegment = ds
        .slice(datasetIndex + 1)
        .some((s) => (s?.data?.[i] || 0) > 0);
      const isRight = curr > 0 && !hasRightSegment;
      return {
        topLeft: 0,
        bottomLeft: 0,
        topRight: isRight ? 10 : 0,
        bottomRight: isRight ? 10 : 0
      };
    }
  });

  budgetByMonthChart = new Chart(budgetCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        makeStackDataset("ยังไม่อนุมัติ", "#d1d5db", 0),
        makeStackDataset("โครงการที่อนุมัติแล้ว", "#fbbf24", 1),
        makeStackDataset("โครงการที่วันเลยจัดแล้ว", "#f97316", 2),
        makeStackDataset("โครงการที่เลยกำหนดส่งปิดแล้ว", "#ef4444", 3),
        makeStackDataset("โครงการที่ปิดแล้ว", "#22c55e", 4),
        makeStackDataset("ยกเลิกโครงการ", "#6b7280", 5),
        makeStackDataset("ไม่ส่งปิดโครงการ", "#111827", 6)
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
          onClick(e, legendItem, legend) {
            Chart.defaults.plugins.legend.onClick.call(this, e, legendItem, legend);
            updateClosureXAxisMax(legend.chart);
            legend.chart.update();
          },
          labels: {
            font: { size: 11 },
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10
          }
        },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { stepSize: 1 }
        },
        y: {
          stacked: true,
          ticks: {
            autoSkip: false
          }
        }
      }
    }
  });

  statusPieChart = new Chart(statusCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            "#f9a8d4",
            "#bfdbfe",
            "#bbf7d0",
            "#fed7aa",
            "#fecaca",
            "#ddd6fe",
            "#fef3c7"
          ],
          borderColor: "#ffffff",
          borderWidth: 1,
          pointStyle: "circle"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 11 },
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10
          }
        },
        centerText: {
          text: "0%",
          subText: "",
          color: "#111827",
          fontSize: 22,
          subFontSize: 11,
          fontFamily: "Kanit"
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          titleColor: "#111827",
          bodyColor: "#374151",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          displayColors: false,
          bodyFont: { family: "'Kanit', sans-serif", size: 12 },
          callbacks: {
            title: () => [],
            label: (ctx) => {
              const label = ctx.label || "";
              const value = ctx.parsed || 0;
              const dataset = ctx.dataset;
              const total = dataset.data.reduce((a, b) => a + b, 0);
              const percent = total > 0 ? (value / total) * 100 : 0;
              const percentText = percent.toFixed(1);
              return [
                `• ${label}`,
                `  งบอนุมัติ: ${formatMoney(value)} บาท (${percentText}%)`
              ];
            }
          }
        }
      },
      cutout: "65%"
    }
  });

  if (trendCtx) {
    trendLineChart = new Chart(trendCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "โครงการค้างปิด",
            data: [],
            borderColor: "#ec4899",
            backgroundColor: "rgba(236, 72, 153, 0.18)",
            pointBackgroundColor: "#ec4899",
            pointRadius: 3,
            pointHoverRadius: 4,
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          x: {
            ticks: { font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 11 } }
          }
        }
      }
    });
  }

  syncChartsToContext(ctxKey);
}

function resizeClosureChart(numLabels) {
  const canvas = projectStatusContexts[activeProjectStatusContext]?.budgetChartCanvas;
  if (!canvas) return;
  const container = canvas.parentElement;
  if (!container) return;

  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const baseHeight = isMobile ? 340 : 260;
  const perLabel = isMobile ? 34 : 26;
  const newHeight = Math.max(baseHeight, numLabels * perLabel);
  container.style.height = newHeight + "px";

  if (budgetByMonthChart) budgetByMonthChart.resize();
}

function getNiceProjectCountAxisMax(maxTotal) {
  if (!Number.isFinite(maxTotal) || maxTotal <= 0) return 4;
  if (maxTotal <= 4) return 4;
  const padded = maxTotal * 1.1;
  let step = 1;
  if (padded > 500) step = 100;
  else if (padded > 250) step = 50;
  else if (padded > 100) step = 25;
  else if (padded > 50) step = 10;
  else if (padded > 20) step = 5;
  else if (padded > 10) step = 2;
  return Math.max(4, Math.ceil(padded / step) * step);
}

function updateClosureXAxisMax(chart = budgetByMonthChart) {
  if (!chart) return;
  const labelCount = chart.data.labels?.length || 0;
  const totals = Array.from({ length: labelCount }, (_, i) =>
    chart.data.datasets.reduce((sum, dataset, datasetIndex) => {
      if (!chart.isDatasetVisible(datasetIndex)) return sum;
      return sum + (Number(dataset.data?.[i]) || 0);
    }, 0)
  );
  const maxTotal = totals.length ? Math.max(...totals) : 0;
  chart.options.scales.x.max = getNiceProjectCountAxisMax(maxTotal);
}

function getChartOrgGroups() {
  if (orgFilters.length) {
    return Array.from(new Set(orgFilters.map((o) => o.group).filter(Boolean)));
  }
  return [...DEFAULT_BASE_GROUPS];
}

function getOrgsByGroup(group) {
  if (!group) return [];
  if (orgFilters.length) {
    return Array.from(
      new Set(
        orgFilters
          .filter((o) => o.group === group)
          .map((o) => o.name)
          .filter(Boolean)
      )
    );
  }
  return Array.from(
    new Set(
      projects
        .filter((p) => p.orgGroup === group)
        .map((p) => p.orgName)
        .filter(Boolean)
    )
  );
}

function updateClosureStatusChart(filtered) {
  if (!budgetByMonthChart) return;

  const closureTrackedProjects = filtered.filter((p) =>
    ((p.statusMain || "").trim()) !== "" || isProjectNoClose(p)
  );

  const isNoCloseSubmission = (p) => isProjectNoClose(p);

  const classifyClosureBucket = (p) => {
    const mainStatus = (p.statusMain || "").trim();
    if (isNoCloseSubmission(p)) return "black";
    if (mainStatus !== "อนุมัติโครงการ" && mainStatus !== "ยกเลิกโครงการ") {
      return "pending";
    }
    if (mainStatus === "ยกเลิกโครงการ") return "gray";

    const isClosed = (p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย";
    if (isClosed) return "green";

    const d =
      typeof p.daysToDeadline === "number" && !isNaN(p.daysToDeadline)
        ? p.daysToDeadline
        : null;
    if (d !== null && d < 0) return "red";
    if (d !== null && d >= 0 && d <= 14) return "orange";
    return "yellow";
  };

  const orgGroupFilter = orgTypeSelect.value;
  const orgFilter = orgSelect.value;
  const isGlobalView = orgGroupFilter === "all" && orgFilter === "all";

  if (isGlobalView) {
    const baseGroups = getChartOrgGroups();

    const statsByGroup = {};
    baseGroups.forEach((g) => {
      statsByGroup[g] = { pending: 0, totalApproved: 0, orange: 0, red: 0, green: 0, gray: 0, black: 0 };
    });

    closureTrackedProjects.forEach((p) => {
      const groupName = baseGroups.includes(p.orgGroup) ? p.orgGroup : null;
      if (!groupName) return;

      const g = statsByGroup[groupName];
      const bucket = classifyClosureBucket(p);
      if (bucket === "pending") {
        g.pending++;
        return;
      }
      if (bucket === "gray") {
        g.gray++;
        return;
      }
      if ((p.statusMain || "").trim() === "อนุมัติโครงการ") g.totalApproved++;
      if (bucket === "black") g.black++;
      else if (bucket === "green") g.green++;
      else if (bucket === "red") g.red++;
      else if (bucket === "orange") g.orange++;
    });

    const labels = baseGroups;
    const pendingData = [];
    const yellowData = [];
    const orangeData = [];
    const redData = [];
    const greenData = [];
    const grayData = [];
    const blackData = [];

    labels.forEach((label) => {
      const g = statsByGroup[label] || {
        pending: 0,
        totalApproved: 0,
        orange: 0,
        red: 0,
        green: 0,
        gray: 0,
        black: 0
      };
      pendingData.push(g.pending);
      const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green - g.black, 0);
      yellowData.push(yellow);
      orangeData.push(g.orange);
      redData.push(g.red);
      greenData.push(g.green);
      grayData.push(g.gray);
      blackData.push(g.black);
    });

    budgetByMonthChart.data.labels = labels;
    budgetByMonthChart.data.datasets[0].data = pendingData;
    budgetByMonthChart.data.datasets[1].data = yellowData;
    budgetByMonthChart.data.datasets[2].data = orangeData;
    budgetByMonthChart.data.datasets[3].data = redData;
    budgetByMonthChart.data.datasets[4].data = greenData;
    budgetByMonthChart.data.datasets[5].data = grayData;
    budgetByMonthChart.data.datasets[6].data = blackData;

    updateClosureXAxisMax();
    resizeClosureChart(labels.length);
    budgetByMonthChart.update();
    return;
  }

  const allowedOrgs = orgFilter === "all" ? getOrgsByGroup(orgGroupFilter) : [orgFilter];
  const groups = {};
  allowedOrgs.forEach((org) => {
    groups[org] = { pending: 0, totalApproved: 0, orange: 0, red: 0, green: 0, gray: 0, black: 0 };
  });

  closureTrackedProjects.forEach((p) => {
    const org = p.orgName || "(ไม่ระบุ)";
    if (allowedOrgs.length && !allowedOrgs.includes(org)) return;
    if (!groups[org]) {
      groups[org] = { pending: 0, totalApproved: 0, orange: 0, red: 0, green: 0, gray: 0, black: 0 };
    }
    const g = groups[org];
    const bucket = classifyClosureBucket(p);
    if (bucket === "pending") {
      g.pending++;
      return;
    }
    if (bucket === "gray") {
      g.gray++;
      return;
    }
    if ((p.statusMain || "").trim() === "อนุมัติโครงการ") g.totalApproved++;
    if (bucket === "black") g.black++;
    else if (bucket === "green") g.green++;
    else if (bucket === "red") g.red++;
    else if (bucket === "orange") g.orange++;
  });

  const labels = Object.keys(groups);
  const pendingData = [];
  const yellowData = [];
  const orangeData = [];
  const redData = [];
  const greenData = [];
  const grayData = [];
  const blackData = [];

  labels.forEach((org) => {
    const g = groups[org];
    pendingData.push(g.pending);
    const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green - g.black, 0);
    yellowData.push(yellow);
    orangeData.push(g.orange);
    redData.push(g.red);
    greenData.push(g.green);
    grayData.push(g.gray);
    blackData.push(g.black);
  });

  budgetByMonthChart.data.labels = labels;
  budgetByMonthChart.data.datasets[0].data = pendingData;
  budgetByMonthChart.data.datasets[1].data = yellowData;
  budgetByMonthChart.data.datasets[2].data = orangeData;
  budgetByMonthChart.data.datasets[3].data = redData;
  budgetByMonthChart.data.datasets[4].data = greenData;
  budgetByMonthChart.data.datasets[5].data = grayData;
  budgetByMonthChart.data.datasets[6].data = blackData;

  updateClosureXAxisMax();
  resizeClosureChart(labels.length);
  budgetByMonthChart.update();
}
