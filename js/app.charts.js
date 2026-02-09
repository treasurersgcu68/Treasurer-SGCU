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
        makeStackDataset("โครงการที่อนุมัติแล้ว", "#fbbf24", 0),
        makeStackDataset("โครงการที่วันเลยจัดแล้ว", "#f97316", 1),
        makeStackDataset("โครงการที่เลยกำหนดส่งปิดแล้ว", "#ef4444", 2),
        makeStackDataset("โครงการที่ปิดแล้ว", "#22c55e", 3),
        makeStackDataset("ยกเลิกโครงการ", "#9ca3af", 4),
        makeStackDataset("ไม่ส่งปิดโครงการ", "#111827", 5)
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
        y: { stacked: true }
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

  const baseHeight = 260;
  const perLabel = 26;
  const newHeight = Math.max(baseHeight, numLabels * perLabel);
  container.style.height = newHeight + "px";

  if (budgetByMonthChart) budgetByMonthChart.resize();
}

function updateClosureXAxisMax(yellowData, orangeData, redData, greenData, grayData, blackData) {
  if (!budgetByMonthChart) return;
  const totals = yellowData.map(
    (_, i) =>
      (yellowData[i] || 0) +
      (orangeData[i] || 0) +
      (redData[i] || 0) +
      (greenData[i] || 0) +
      (grayData[i] || 0) +
      (blackData[i] || 0)
  );
  const maxTotal = totals.length ? Math.max(...totals) : 0;
  budgetByMonthChart.options.scales.x.max = Math.max(4, maxTotal);
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

  const closureTrackedProjects = filtered.filter((p) => {
    const statusMain = (p.statusMain || "").trim();
    return statusMain === "อนุมัติโครงการ" || statusMain === "ยกเลิกโครงการ";
  });

  const isNoCloseSubmission = (p) =>
    (p.statusClose || "").trim() === "ไม่ส่งปิดโครงการ";

  const classifyClosureBucket = (p) => {
    const mainStatus = (p.statusMain || "").trim();
    if (mainStatus === "ยกเลิกโครงการ") return "gray";
    if (isNoCloseSubmission(p)) return "black";

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
      statsByGroup[g] = { totalApproved: 0, orange: 0, red: 0, green: 0, gray: 0, black: 0 };
    });

    closureTrackedProjects.forEach((p) => {
      const groupName = baseGroups.includes(p.orgGroup) ? p.orgGroup : null;
      if (!groupName) return;

      const g = statsByGroup[groupName];
      const bucket = classifyClosureBucket(p);
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
    const yellowData = [];
    const orangeData = [];
    const redData = [];
    const greenData = [];
    const grayData = [];
    const blackData = [];

    labels.forEach((label) => {
      const g = statsByGroup[label] || {
        totalApproved: 0,
        orange: 0,
        red: 0,
        green: 0,
        gray: 0,
        black: 0
      };
      const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green - g.black, 0);
      yellowData.push(yellow);
      orangeData.push(g.orange);
      redData.push(g.red);
      greenData.push(g.green);
      grayData.push(g.gray);
      blackData.push(g.black);
    });

    budgetByMonthChart.data.labels = labels;
    budgetByMonthChart.data.datasets[0].data = yellowData;
    budgetByMonthChart.data.datasets[1].data = orangeData;
    budgetByMonthChart.data.datasets[2].data = redData;
    budgetByMonthChart.data.datasets[3].data = greenData;
    budgetByMonthChart.data.datasets[4].data = grayData;
    budgetByMonthChart.data.datasets[5].data = blackData;

    updateClosureXAxisMax(yellowData, orangeData, redData, greenData, grayData, blackData);
    resizeClosureChart(labels.length);
    budgetByMonthChart.update();
    return;
  }

  const allowedOrgs = orgFilter === "all" ? getOrgsByGroup(orgGroupFilter) : [orgFilter];
  const groups = {};
  allowedOrgs.forEach((org) => {
    groups[org] = { totalApproved: 0, orange: 0, red: 0, green: 0, gray: 0, black: 0 };
  });

  closureTrackedProjects.forEach((p) => {
    const org = p.orgName || "(ไม่ระบุ)";
    if (allowedOrgs.length && !allowedOrgs.includes(org)) return;
    if (!groups[org]) {
      groups[org] = { totalApproved: 0, orange: 0, red: 0, green: 0, gray: 0, black: 0 };
    }
    const g = groups[org];
    const bucket = classifyClosureBucket(p);
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
  const yellowData = [];
  const orangeData = [];
  const redData = [];
  const greenData = [];
  const grayData = [];
  const blackData = [];

  labels.forEach((org) => {
    const g = groups[org];
    const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green - g.black, 0);
    yellowData.push(yellow);
    orangeData.push(g.orange);
    redData.push(g.red);
    greenData.push(g.green);
    grayData.push(g.gray);
    blackData.push(g.black);
  });

  budgetByMonthChart.data.labels = labels;
  budgetByMonthChart.data.datasets[0].data = yellowData;
  budgetByMonthChart.data.datasets[1].data = orangeData;
  budgetByMonthChart.data.datasets[2].data = redData;
  budgetByMonthChart.data.datasets[3].data = greenData;
  budgetByMonthChart.data.datasets[4].data = grayData;
  budgetByMonthChart.data.datasets[5].data = blackData;

  updateClosureXAxisMax(yellowData, orangeData, redData, greenData, grayData, blackData);
  resizeClosureChart(labels.length);
  budgetByMonthChart.update();
}
