/* Pie chart: สัดส่วนงบประมาณที่ได้รับอนุมัติ */
function updateStatusPieCenterText(text, subText = "") {
  const centerEl = document.getElementById("statusPieCenterText");
  if (!centerEl || !statusPieChart) return;

  const mainEl = centerEl.querySelector(".status-pie-center-main");
  const subEl = centerEl.querySelector(".status-pie-center-sub");
  if (mainEl) mainEl.textContent = text || "";
  if (subEl) subEl.textContent = subText || "";

  centerEl.hidden = !text;
  if (!text) return;

  const canvas = statusPieChart.canvas;
  const chartInner = centerEl.offsetParent;
  const arc = statusPieChart.getDatasetMeta(0)?.data?.[0];
  if (!canvas || !chartInner || !arc) return;

  bindStatusPieCenterTextEvents(canvas);

  const canvasRect = canvas.getBoundingClientRect();
  const innerRect = chartInner.getBoundingClientRect();
  centerEl.style.left = `${canvasRect.left - innerRect.left + arc.x}px`;
  centerEl.style.top = `${canvasRect.top - innerRect.top + arc.y}px`;
  syncStatusPieCenterTextVisibility();
}

function repositionStatusPieCenterText() {
  const centerEl = document.getElementById("statusPieCenterText");
  if (!centerEl || centerEl.hidden) return;
  const text = centerEl.querySelector(".status-pie-center-main")?.textContent || "";
  const subText = centerEl.querySelector(".status-pie-center-sub")?.textContent || "";
  updateStatusPieCenterText(text, subText);
}

function syncStatusPieCenterTextVisibility(forceVisible = false) {
  const centerEl = document.getElementById("statusPieCenterText");
  if (!centerEl || centerEl.hidden || !statusPieChart) return;

  const activeElements = statusPieChart.getActiveElements?.() || [];
  const tooltipVisible = Number(statusPieChart.tooltip?.opacity || 0) > 0;
  centerEl.classList.toggle(
    "is-suppressed",
    !forceVisible && (activeElements.length > 0 || tooltipVisible)
  );
}

function bindStatusPieCenterTextEvents(canvas) {
  if (!canvas || canvas.dataset.statusPieCenterEvents === "bound") return;
  canvas.dataset.statusPieCenterEvents = "bound";

  const scheduleSync = () => {
    window.requestAnimationFrame(() => syncStatusPieCenterTextVisibility());
  };

  canvas.addEventListener("pointermove", scheduleSync, { passive: true });
  canvas.addEventListener("pointerdown", scheduleSync, { passive: true });
  canvas.addEventListener(
    "pointerleave",
    () => {
      window.requestAnimationFrame(() => syncStatusPieCenterTextVisibility(true));
    },
    { passive: true }
  );
}

window.addEventListener(
  "resize",
  () => {
    window.requestAnimationFrame(repositionStatusPieCenterText);
  },
  { passive: true }
);

function updateApprovedBudgetPie(filtered) {
  if (!statusPieChart) return;

  const includedStatuses = [
    "ผ่านสภาใหญ่",
    "ส่งขออนุมัติกิจการนิสิต",
    "อนุมัติโครงการ",
    "ยกเลิกโครงการ"
  ];

  const yearFilter = yearSelect ? yearSelect.value : "all";
  const orgGroupFilter = orgTypeSelect ? orgTypeSelect.value : "all";
  const orgFilter = orgSelect ? orgSelect.value : "all";

  let baseAllProjects = projects.filter(
    (p) => yearFilter === "all" || p.year === yearFilter
  );

  let baseApprovedProjects = baseAllProjects.filter((p) =>
    includedStatuses.includes((p.statusMain || "").trim())
  );

  let labels = [];
  let data = [];
  let highlightLabel = null;

  const baseColors = [
    "#f9a8d4",
    "#bfdbfe",
    "#bbf7d0",
    "#fed7aa",
    "#fecaca",
    "#ddd6fe",
    "#fef3c7"
  ];
  const highlightColor = "#fb7185";

  let sumApproved = 0;
  let sumBase = 0;

  const baseGroups = getChartOrgGroups();

  if (orgGroupFilter === "all" && orgFilter === "all") {
    const budgetByGroup = {};
    baseGroups.forEach((g) => (budgetByGroup[g] = 0));

    baseApprovedProjects.forEach((p) => {
      if (budgetByGroup[p.orgGroup] !== undefined) {
        budgetByGroup[p.orgGroup] += p.budget || 0;
      }
    });

    baseGroups.forEach((g) => {
      if (budgetByGroup[g] > 0) {
        labels.push(g);
        data.push(budgetByGroup[g]);
      }
    });

    sumApproved = baseApprovedProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
  } else if (orgGroupFilter !== "all" && orgFilter === "all") {
    const budgetByGroup = {};
    baseGroups.forEach((g) => (budgetByGroup[g] = 0));

    baseApprovedProjects.forEach((p) => {
      if (budgetByGroup[p.orgGroup] !== undefined) {
        budgetByGroup[p.orgGroup] += p.budget || 0;
      }
    });

    baseGroups.forEach((g) => {
      if (budgetByGroup[g] > 0) {
        labels.push(g);
        data.push(budgetByGroup[g]);
      }
    });

    highlightLabel = orgGroupFilter;

    const groupApproved = baseAllProjects
      .filter((p) => p.orgGroup === orgGroupFilter)
      .filter((p) => includedStatuses.includes((p.statusMain || "").trim()));

    sumApproved = groupApproved.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
  } else if (orgGroupFilter !== "all" && orgFilter !== "all") {
    const allowedOrgs = getOrgsByGroup(orgGroupFilter);
    const budgetByClub = {};

    baseApprovedProjects
      .filter((p) => p.orgGroup === orgGroupFilter)
      .forEach((p) => {
        const name = p.orgName || "(ไม่ระบุ)";
        if (allowedOrgs.length && !allowedOrgs.includes(name)) return;
        budgetByClub[name] = (budgetByClub[name] || 0) + (p.budget || 0);
      });

    const orderedLabels = allowedOrgs.length ? allowedOrgs : Object.keys(budgetByClub);
    labels = orderedLabels.filter((l) =>
      allowedOrgs.length ? budgetByClub[l] > 0 || l === orgFilter : true
    );
    data = labels.map((l) => budgetByClub[l] || 0);
    highlightLabel = orgFilter;

    const clubApproved = baseAllProjects
      .filter((p) => p.orgGroup === orgGroupFilter && p.orgName === orgFilter)
      .filter((p) => includedStatuses.includes((p.statusMain || "").trim()));

    sumApproved = clubApproved.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects
      .filter((p) => p.orgGroup === orgGroupFilter)
      .reduce((a, p) => a + (p.budget || 0), 0);
  } else if (orgGroupFilter === "all" && orgFilter !== "all") {
    const budgetByGroup = {};
    baseGroups.forEach((g) => (budgetByGroup[g] = 0));

    baseApprovedProjects.forEach((p) => {
      if (budgetByGroup[p.orgGroup] !== undefined) {
        budgetByGroup[p.orgGroup] += p.budget || 0;
      }
    });

    baseGroups.forEach((g) => {
      if (budgetByGroup[g] > 0) {
        labels.push(g);
        data.push(budgetByGroup[g]);
      }
    });

    const selectedOrgGroupFromFilters = orgFilters.find((o) => o.name === orgFilter);
    const selectedOrgProject = projects.find((p) => p.orgName === orgFilter);
    const selectedOrgGroup = selectedOrgGroupFromFilters
      ? selectedOrgGroupFromFilters.group
      : selectedOrgProject
      ? selectedOrgProject.orgGroup
      : null;
    highlightLabel = selectedOrgGroup || null;

    const clubApproved = baseAllProjects
      .filter((p) => p.orgName === orgFilter)
      .filter((p) => includedStatuses.includes((p.statusMain || "").trim()));

    sumApproved = clubApproved.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
  }

  const bgColors = labels.map((l, i) =>
    l === highlightLabel ? highlightColor : baseColors[i % baseColors.length]
  );
  const offsets = labels.map((l) => (l === highlightLabel ? 15 : 0));

  statusPieChart.data.labels = labels;
  statusPieChart.data.datasets[0].data = data;
  statusPieChart.data.datasets[0].backgroundColor = bgColors;
  statusPieChart.data.datasets[0].offset = offsets;

  let centerText = "";
  let centerSubText = "";

  if (highlightLabel) {
    const idx = labels.indexOf(highlightLabel);
    if (idx !== -1) {
      const targetVal = data[idx];
      const percent =
        sumBase > 0 ? Math.round((sumApproved / sumBase) * 100) : 0;

      centerText = percent + "%";

      if (targetVal > 0) {
        const positiveValues = data.filter((v) => v > 0);
        const rankedValues = [...new Set(positiveValues)].sort((a, b) => b - a);
        const rank = rankedValues.findIndex((v) => v === targetVal) + 1;

        centerSubText = rank > 0 ? `อันดับงบ ${rank}/${positiveValues.length}` : "";
      } else {
        centerSubText = "ไม่มีงบอนุมัติ";
      }
    } else {
      centerText = "0%";
    }
  } else {
    const percent =
      sumBase > 0 ? Math.round((sumApproved / sumBase) * 100) : 0;
    centerText = percent + "%";
  }

  if (statusPieChart.options.plugins.centerText) {
    statusPieChart.options.plugins.centerText.text = "";
    statusPieChart.options.plugins.centerText.subText = "";
  }
  statusPieChart.update("none");
  updateStatusPieCenterText(centerText, centerSubText);
}
