/* Charts: status summary + trends (Chart.js) */
function wrapChartAxisLabel(label, maxChars = 22, maxLines = 3) {
  const text = (label || "").toString().replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxChars) return text;

  const words =
    typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
      ? text
          .split(/(\s+)/)
          .flatMap((part) => {
            if (!part) return [];
            if (/^\s+$/.test(part)) return [" "];
            return Array.from(new Intl.Segmenter("th", { granularity: "word" }).segment(part))
              .map((segment) => segment.segment)
              .filter(Boolean);
          })
      : text.split(/(\s+)/).filter(Boolean);
  const lines = [];
  let current = "";

  const pushCurrent = () => {
    if (current) {
      lines.push(current.trim());
      current = "";
    }
  };

  words.forEach((word) => {
    if (!word) return;
    if (/^\s+$/.test(word)) {
      if (current && !current.endsWith(" ")) current += " ";
      return;
    }
    if (word.length > maxChars) {
      pushCurrent();
      lines.push(word);
      return;
    }
    const next = current ? `${current}${word}` : word;
    if (next.length > maxChars) {
      pushCurrent();
      current = word;
    } else {
      current = next;
    }
  });

  pushCurrent();
  if (lines.length <= maxLines) return lines;

  const visible = lines.slice(0, maxLines);
  const last = visible[visible.length - 1] || "";
  visible[visible.length - 1] =
    last.length >= maxChars * 1.5 ? `${last.slice(0, Math.max(1, maxChars - 1))}…` : `${last}…`;
  return visible;
}

function getClosureAxisWrappedLabel(label) {
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  return wrapChartAxisLabel(label, isMobile ? 22 : 30, isMobile ? 3 : 2);
}

function getWrappedLineCount(wrappedLabel) {
  return Array.isArray(wrappedLabel) ? wrappedLabel.length : 1;
}

function initCharts(ctxKey = activeProjectStatusContext) {
  setActiveProjectStatusContext(ctxKey);
  const ctx = projectStatusContexts[ctxKey];
  if (!ctx) return;

  const budgetCanvas = ctx.budgetChartCanvas;
  const statusCanvas = ctx.statusPieCanvas;
  const trendCanvas = ctx.trendLineCanvas;
  if (!budgetCanvas && !statusCanvas && !trendCanvas) return;

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

  const budgetCtx = budgetCanvas ? budgetCanvas.getContext("2d") : null;
  const statusCtx = statusCanvas ? statusCanvas.getContext("2d") : null;
  const trendCtx = trendCanvas ? trendCanvas.getContext("2d") : null;
  const isMobileChart = window.matchMedia("(max-width: 720px)").matches;
  const closureYAxisWidth = isMobileChart ? 118 : 170;
  const makeStackDataset = (label, backgroundColor, datasetIndex) => ({
    label,
    data: [],
    backgroundColor,
    stack: "status",
    borderSkipped: false,
    pointStyle: "rectRounded",
    borderRadius(ctx) {
      const i = ctx.dataIndex;
      const chart = ctx.chart;
      const ds = ctx.chart.data.datasets;
      const curr = ds[datasetIndex]?.data?.[i] || 0;
      const hasRightSegment = ds
        .some((s, idx) => idx > datasetIndex && chart.isDatasetVisible(idx) && (s?.data?.[i] || 0) > 0);
      const isRight = curr > 0 && !hasRightSegment;
      return {
        topLeft: 0,
        bottomLeft: 0,
        topRight: isRight ? 10 : 0,
        bottomRight: isRight ? 10 : 0
      };
    }
  });

  if (budgetCtx) {
    budgetByMonthChart = new Chart(budgetCtx, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          makeStackDataset("ยังไม่อนุมัติ", "#d1d5db", 0),
          makeStackDataset("โครงการที่อนุมัติแล้ว", "#fbbf24", 1),
          makeStackDataset("โครงการที่วันเลยจัดแล้ว", "#f97316", 2),
          makeStackDataset("โครงการที่เลยกำหนดส่งปิดแล้ว", "#ef4444", 3),
          makeStackDataset("ปิดโครงการแล้ว (ฝั่งนิสิต)", "#86efac", 4),
          makeStackDataset("ปิดโครงการสมบูรณ์", "#22c55e", 5),
          makeStackDataset("ยกเลิกโครงการ", "#6b7280", 6),
          makeStackDataset("ไม่ส่งปิดโครงการ", "#111827", 7)
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
          tooltip: { enabled: true },
          externalAxisLabels: {
            y: {
              enabled: true,
              width: closureYAxisWidth,
              gap: 8,
              formatter: (label) => getClosureAxisWrappedLabel(label)
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { stepSize: 1 }
          },
          y: {
            stacked: true,
            afterFit(scale) {
              scale.width = closureYAxisWidth;
            },
            ticks: {
              display: false,
              autoSkip: false,
              padding: 6,
              callback(value) {
                return getClosureAxisWrappedLabel(this.getLabelForValue(value));
              }
            }
          }
        }
      }
    });
  }

  if (statusCtx) {
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
  }

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
          tooltip: { enabled: true },
          externalAxisLabels: {
            x: {
              enabled: true,
              height: 46,
              gap: 6,
              alignEdges: true,
              className: "chart-external-axis-month",
              formatter: (label) => formatMonthAxisLabel(label)
            }
          }
        },
        scales: {
          x: {
            afterFit(scale) {
              scale.height = Math.max(scale.height || 0, 54);
            },
            ticks: { display: false, font: { size: 11 } }
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
  const labels = budgetByMonthChart?.data?.labels || [];
  const maxWrappedLines = labels.reduce((max, label) => {
    return Math.max(max, getWrappedLineCount(getClosureAxisWrappedLabel(label)));
  }, 1);
  const baseHeight = isMobile ? 340 : 260;
  const perLabel = isMobile
    ? Math.max(34, 20 + maxWrappedLines * 14)
    : Math.max(26, 14 + maxWrappedLines * 13);
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
  const sortThaiDescending = (list) => list.sort((a, b) => b.localeCompare(a, "th"));
  const yearOrgFilters = typeof getProjectOrgFiltersForYear === "function"
    ? getProjectOrgFiltersForYear()
    : (Array.isArray(orgFilters) ? orgFilters : []);
  if (yearOrgFilters.length) {
    return sortThaiDescending(Array.from(new Set(yearOrgFilters.map((o) => o.group).filter(Boolean))));
  }
  return sortThaiDescending([...DEFAULT_BASE_GROUPS]);
}

function getOrgsByGroup(group) {
  if (!group) return [];
  const yearOrgFilters = typeof getProjectOrgFiltersForYear === "function"
    ? getProjectOrgFiltersForYear()
    : (Array.isArray(orgFilters) ? orgFilters : []);
  if (yearOrgFilters.length) {
    return Array.from(
      new Set(
        yearOrgFilters
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
    if (isProjectCancelled(p)) return "gray";
    if (mainStatus !== "อนุมัติโครงการ" && mainStatus !== "ยกเลิกโครงการ") {
      return "pending";
    }
    if (isProjectFullyClosed(p)) return "greenDark";
    if (isProjectStudentClosed(p)) return "greenLight";

    const d =
      typeof p.daysToDeadline === "number" && !isNaN(p.daysToDeadline)
        ? p.daysToDeadline
        : null;
    if (d !== null && d < 0) return "red";
    if (d !== null && d >= 0 && d <= 14) return "orange";
    return "yellow";
  };

  const createClosureStats = () => ({
    pending: 0,
    yellow: 0,
    orange: 0,
    red: 0,
    greenLight: 0,
    greenDark: 0,
    gray: 0,
    black: 0
  });

  const addProjectToClosureStats = (stats, project) => {
    const bucket = classifyClosureBucket(project);
    if (Object.prototype.hasOwnProperty.call(stats, bucket)) {
      stats[bucket]++;
    }
  };

  const applyClosureChartData = (labels, statsByLabel) => {
    const pendingData = [];
    const yellowData = [];
    const orangeData = [];
    const redData = [];
    const greenLightData = [];
    const greenDarkData = [];
    const grayData = [];
    const blackData = [];

    labels.forEach((label) => {
      const stats = statsByLabel[label] || createClosureStats();
      pendingData.push(stats.pending);
      yellowData.push(stats.yellow);
      orangeData.push(stats.orange);
      redData.push(stats.red);
      greenLightData.push(stats.greenLight);
      greenDarkData.push(stats.greenDark);
      grayData.push(stats.gray);
      blackData.push(stats.black);
    });

    budgetByMonthChart.data.labels = labels;
    budgetByMonthChart.data.datasets[0].data = pendingData;
    budgetByMonthChart.data.datasets[1].data = yellowData;
    budgetByMonthChart.data.datasets[2].data = orangeData;
    budgetByMonthChart.data.datasets[3].data = redData;
    budgetByMonthChart.data.datasets[4].data = greenLightData;
    budgetByMonthChart.data.datasets[5].data = greenDarkData;
    budgetByMonthChart.data.datasets[6].data = grayData;
    budgetByMonthChart.data.datasets[7].data = blackData;

    updateClosureXAxisMax();
    resizeClosureChart(labels.length);
    budgetByMonthChart.update();
  };

  const orgGroupFilter = orgTypeSelect.value;
  const orgFilter = orgSelect.value;
  const isGlobalView = orgGroupFilter === "all" && orgFilter === "all";

  if (isGlobalView) {
    const baseGroups = getChartOrgGroups();

    const statsByGroup = {};
    baseGroups.forEach((g) => {
      statsByGroup[g] = createClosureStats();
    });

    closureTrackedProjects.forEach((p) => {
      const groupName = baseGroups.includes(p.orgGroup) ? p.orgGroup : null;
      if (!groupName) return;
      addProjectToClosureStats(statsByGroup[groupName], p);
    });

    const labels = baseGroups;
    applyClosureChartData(labels, statsByGroup);
    return;
  }

  const allowedOrgs = orgFilter === "all" ? getOrgsByGroup(orgGroupFilter) : [orgFilter];
  const groups = {};
  allowedOrgs.forEach((org) => {
    groups[org] = createClosureStats();
  });

  closureTrackedProjects.forEach((p) => {
    const org = p.orgName || "(ไม่ระบุ)";
    if (allowedOrgs.length && !allowedOrgs.includes(org)) return;
    if (!groups[org]) {
      groups[org] = createClosureStats();
    }
    addProjectToClosureStats(groups[org], p);
  });

  const labels = Object.keys(groups);
  applyClosureChartData(labels, groups);
}

function downloadClosureStatusChartPng(ctxKey = activeProjectStatusContext) {
  setActiveProjectStatusContext(ctxKey);
  const chart = budgetByMonthChart;
  const sourceCanvas = chart?.canvas;
  if (!chart || !sourceCanvas) return;

  chart.update("none");

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = sourceCanvas.width;
  exportCanvas.height = sourceCanvas.height;
  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) return;

  exportCtx.fillStyle = "#ffffff";
  exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  exportCtx.drawImage(sourceCanvas, 0, 0);
  drawClosureExportYAxisLabels(exportCtx, chart, sourceCanvas);

  const yearValue = (yearSelect?.value || selectedProjectSourceYear || "all").toString().trim() || "all";
  const orgGroupValue = (orgTypeSelect?.value || "all").toString().trim() || "all";
  const orgValue = (orgSelect?.value || "all").toString().trim() || "all";
  const fileSafe = (value) =>
    value
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "all";

  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL("image/png");
  link.download = [
    "sgcu-project-status-overview",
    fileSafe(yearValue),
    fileSafe(orgGroupValue),
    fileSafe(orgValue)
  ].join("-") + ".png";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function drawClosureExportYAxisLabels(exportCtx, chart, sourceCanvas) {
  const labels = chart?.data?.labels || [];
  const scale = chart?.scales?.y;
  const chartArea = chart?.chartArea;
  if (!labels.length || !scale || !chartArea) return;

  const pixelRatio = sourceCanvas.width / Math.max(chart.width || sourceCanvas.clientWidth || 1, 1);
  const gap = Number(chart.options?.plugins?.externalAxisLabels?.y?.gap) || 8;
  const x = Math.max(0, chartArea.left - gap);
  const lineHeight = 14;

  exportCtx.save();
  exportCtx.scale(pixelRatio, pixelRatio);
  exportCtx.fillStyle = "#6b7280";
  exportCtx.font = "600 11px Kanit, sans-serif";
  exportCtx.textAlign = "right";
  exportCtx.textBaseline = "middle";

  labels.forEach((label, index) => {
    const lines = normalizeExternalAxisLines(getClosureAxisWrappedLabel(label));
    if (!lines.length) return;
    const y = scale.getPixelForValue(index);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, lineIndex) => {
      exportCtx.fillText(line, x, startY + lineIndex * lineHeight);
    });
  });

  exportCtx.restore();
}
