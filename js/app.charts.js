/* 8) Charts */
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

  budgetByMonthChart = new Chart(budgetCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "โครงการที่อนุมัติแล้ว",
          data: [],
          backgroundColor: "#fbbf24",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const y = ds[0].data[i] || 0;
            const o = ds[1].data[i] || 0;
            const r = ds[2].data[i] || 0;
            const g = ds[3].data[i] || 0;
            const isRight = y > 0 && o === 0 && r === 0 && g === 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        },
        {
          label: "โครงการที่วันเลยจัดแล้ว",
          data: [],
          backgroundColor: "#f97316",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const o = ds[1].data[i] || 0;
            const r = ds[2].data[i] || 0;
            const g = ds[3].data[i] || 0;
            const isRight = o > 0 && r === 0 && g === 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        },
        {
          label: "โครงการที่เลยกำหนดส่งปิดแล้ว",
          data: [],
          backgroundColor: "#ef4444",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const r = ds[2].data[i] || 0;
            const g = ds[3].data[i] || 0;
            const isRight = r > 0 && g === 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        },
        {
          label: "โครงการที่ปิดแล้ว",
          data: [],
          backgroundColor: "#22c55e",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const g = ds[3].data[i] || 0;
            const isRight = g > 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        }
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
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const value = ctx.parsed || 0;
              const dataset = ctx.dataset;
              const total = dataset.data.reduce((a, b) => a + b, 0);
              const percent = total > 0 ? (value / total) * 100 : 0;
              const percentText = percent.toFixed(1);
              const line1 = label;
              const line2 = `งบที่ได้รับอนุมัติ: ${formatMoney(value)} บาท`;
              const line3 = `คิดเป็น ${percentText}% ของงบทั้งหมดในกราฟนี้`;
              return [line1, line2, line3];
            }
          }
        }
      },
      cutout: "55%"
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

function updateClosureXAxisMax(yellowData, orangeData, redData, greenData) {
  if (!budgetByMonthChart) return;
  const totals = yellowData.map(
    (_, i) => (yellowData[i] || 0) + (orangeData[i] || 0) + (redData[i] || 0) + (greenData[i] || 0)
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

  const approvedProjects = filtered.filter(
    (p) => (p.statusMain || "").trim() === "อนุมัติโครงการ"
  );

  const orgGroupFilter = orgTypeSelect.value;
  const orgFilter = orgSelect.value;
  const isGlobalView = orgGroupFilter === "all" && orgFilter === "all";

  if (isGlobalView) {
    const baseGroups = getChartOrgGroups();

    const statsByGroup = {};
    baseGroups.forEach((g) => {
      statsByGroup[g] = { totalApproved: 0, orange: 0, red: 0, green: 0 };
    });

    approvedProjects.forEach((p) => {
      const groupName = baseGroups.includes(p.orgGroup) ? p.orgGroup : null;
      if (!groupName) return;

      const g = statsByGroup[groupName];
      g.totalApproved++;

      const isClosed = (p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย";
      const d =
        typeof p.daysToDeadline === "number" && !isNaN(p.daysToDeadline)
          ? p.daysToDeadline
          : null;

      if (isClosed) {
        g.green++;
        return;
      }
      if (d !== null) {
        if (d < 0) {
          g.red++;
          return;
        }
        if (d >= 0 && d <= 14) {
          g.orange++;
          return;
        }
      }
    });

    const labels = baseGroups;
    const yellowData = [];
    const orangeData = [];
    const redData = [];
    const greenData = [];

    labels.forEach((label) => {
      const g = statsByGroup[label] || {
        totalApproved: 0,
        orange: 0,
        red: 0,
        green: 0
      };
      const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green, 0);
      yellowData.push(yellow);
      orangeData.push(g.orange);
      redData.push(g.red);
      greenData.push(g.green);
    });

    budgetByMonthChart.data.labels = labels;
    budgetByMonthChart.data.datasets[0].data = yellowData;
    budgetByMonthChart.data.datasets[1].data = orangeData;
    budgetByMonthChart.data.datasets[2].data = redData;
    budgetByMonthChart.data.datasets[3].data = greenData;

    updateClosureXAxisMax(yellowData, orangeData, redData, greenData);
    resizeClosureChart(labels.length);
    budgetByMonthChart.update();
    return;
  }

  const allowedOrgs = orgFilter === "all" ? getOrgsByGroup(orgGroupFilter) : [orgFilter];
  const groups = {};
  allowedOrgs.forEach((org) => {
    groups[org] = { totalApproved: 0, orange: 0, red: 0, green: 0 };
  });

  approvedProjects.forEach((p) => {
    const org = p.orgName || "(ไม่ระบุ)";
    if (allowedOrgs.length && !allowedOrgs.includes(org)) return;
    if (!groups[org]) {
      groups[org] = { totalApproved: 0, orange: 0, red: 0, green: 0 };
    }
    const g = groups[org];
    g.totalApproved++;

    const isClosed = (p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย";
    const d =
      typeof p.daysToDeadline === "number" && !isNaN(p.daysToDeadline)
        ? p.daysToDeadline
        : null;

    if (isClosed) {
      g.green++;
      return;
    }
    if (d !== null) {
      if (d < 0) {
        g.red++;
        return;
      }
      if (d >= 0 && d <= 14) {
        g.orange++;
        return;
      }
    }
  });

  const labels = Object.keys(groups);
  const yellowData = [];
  const orangeData = [];
  const redData = [];
  const greenData = [];

  labels.forEach((org) => {
    const g = groups[org];
    const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green, 0);
    yellowData.push(yellow);
    orangeData.push(g.orange);
    redData.push(g.red);
    greenData.push(g.green);
  });

  budgetByMonthChart.data.labels = labels;
  budgetByMonthChart.data.datasets[0].data = yellowData;
  budgetByMonthChart.data.datasets[1].data = orangeData;
  budgetByMonthChart.data.datasets[2].data = redData;
  budgetByMonthChart.data.datasets[3].data = greenData;

  updateClosureXAxisMax(yellowData, orangeData, redData, greenData);
  resizeClosureChart(labels.length);
  budgetByMonthChart.update();
}

