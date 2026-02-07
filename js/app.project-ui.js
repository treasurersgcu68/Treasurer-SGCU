/* Project Status UI: filters, summary cards, tables, dashboard KPIs */
function initOrgTypeOptions() {
  if (!orgTypeSelect) return;  // ✅ กัน null

  while (orgTypeSelect.options.length > 1) {
    orgTypeSelect.remove(1);
  }
  const groups = orgFilters.length
    ? Array.from(new Set(orgFilters.map((o) => o.group).filter(Boolean)))
    : Array.from(new Set(projects.map((p) => p.orgGroup).filter(Boolean)));
  groups.sort();
  groups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    orgTypeSelect.appendChild(opt);
  });
}

function initOrgOptions() {
  if (!orgSelect || !orgTypeSelect) return;  // ✅ กัน null

  while (orgSelect.options.length > 1) {
    orgSelect.remove(1);
  }
  const selectedGroup = orgTypeSelect.value;
  const sourceList = orgFilters.length
    ? orgFilters.filter((o) => (selectedGroup === "all" ? true : o.group === selectedGroup))
    : projects.filter((p) => (selectedGroup === "all" ? true : p.orgGroup === selectedGroup));
  const orgNames = Array.from(
    new Set(
      sourceList
        .map((item) => (orgFilters.length ? item.name : item.orgName))
        .filter(Boolean)
    )
  );
  orgNames.sort();
  orgNames.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    orgSelect.appendChild(opt);
  });
}

const EXCLUDED_PENDING_STATUSES = new Set([
  "ไม่รับรองจากที่ประชุมนายก",
  "สภาไม่รับหลักการ",
  "ไม่ผ่านกมธ.วิสามัญ",
  "สภาไม่อนุมัติงบ",
  "ไม่ผ่านสภาใหญ่",
  "อนุมัติโครงการ",
  "ยกเลิกโครงการ",
  ""
]);

function filterProjects() {
  const year = yearSelect ? yearSelect.value : "all";
  const orgGroup = orgTypeSelect ? orgTypeSelect.value : "all";
  const org = orgSelect ? orgSelect.value : "all";
  const searchTerm = projectSearchInput ? projectSearchInput.value.trim().toLowerCase() : "";

  return projects.filter((p) => {
    const yearMatch = year === "all" || p.year === year;
    const groupMatch = orgGroup === "all" || p.orgGroup === orgGroup;
    const orgMatch = org === "all" || p.orgName === org;
    let searchText = "";
    if (searchTerm) {
      searchText = p.searchText;
      if (!searchText) {
        searchText = [
          p.code,
          p.name,
          p.orgName,
          p.orgGroup,
          p.statusMain,
          p.status
        ]
          .map((v) => (v || "").toString().toLowerCase())
          .join(" ");
        p.searchText = searchText;
      }
    }
    const searchMatch = !searchTerm || searchText.includes(searchTerm);

    return yearMatch && groupMatch && orgMatch && searchMatch;
  });
}

function updateSummaryCards(filtered) {
  const total = filtered.length;
  let pending = 0;
  let approved = 0;
  let closed = 0;
  let totalBudget = 0;

  filtered.forEach((p) => {
    const statusMain = (p.statusMain || "").trim();
    if (statusMain && !EXCLUDED_PENDING_STATUSES.has(statusMain)) {
      pending += 1;
    }
    if (statusMain === "อนุมัติโครงการ") {
      approved += 1;
    }
    if ((p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย") {
      closed += 1;
    }
    totalBudget += p.budget || 0;
  });

  // 🔧 เช็คว่ามี element ก่อน
  if (totalProjectsEl)   totalProjectsEl.textContent   = total;
  if (pendingProjectsEl) pendingProjectsEl.textContent = pending;
  if (approvedProjectsEl) approvedProjectsEl.textContent = approved;
  if (closedProjectsEl)  closedProjectsEl.textContent  = closed;
  if (totalBudgetEl)     totalBudgetEl.textContent     = formatMoney(totalBudget);

  return { total, pending, approved, closed, totalBudget };
}

function syncDashboardFilterOptions(selectEl, values) {
  if (!selectEl) return "all";
  const current = selectEl.value || "all";
  const uniqueValues = Array.from(
    new Set(values.map((v) => (v || "").toString().trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "th-TH"));

  while (selectEl.options.length) {
    selectEl.remove(0);
  }

  const baseOption = document.createElement("option");
  baseOption.value = "all";
  baseOption.textContent = "ทั้งหมด";
  selectEl.appendChild(baseOption);

  uniqueValues.forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    selectEl.appendChild(opt);
  });

  if (uniqueValues.includes(current)) {
    selectEl.value = current;
  } else {
    selectEl.value = "all";
  }

  return selectEl.value;
}

function updateDashboardInsights(filtered, summary) {
  if (!summary) return;
  if (
    !closureRateEl &&
    !approvalRateEl &&
    !avgBudgetEl &&
    !activeOrgCountEl &&
    !topOrgNameEl &&
    !recentProjectsListEl &&
    !longestOpenListEl &&
    !longestOpenTableCaptionEl &&
    !longestOpenTableBodyEl
  ) {
    return;
  }

  const total = summary.total || 0;
  const closed = summary.closed || 0;
  const approved = summary.approved || 0;
  const totalBudget = summary.totalBudget || 0;

  const closureRate = total ? (closed / total) * 100 : 0;
  const approvalRate = total ? (approved / total) * 100 : 0;
  const avgBudget = total ? totalBudget / total : 0;

  if (closureRateEl) closureRateEl.textContent = `${closureRate.toFixed(1)}%`;
  if (closureRateCaptionEl) {
    closureRateCaptionEl.textContent = total
      ? `${closed} จาก ${total} โครงการปิดแล้ว`
      : "ยังไม่มีโครงการในตัวกรองนี้";
  }
  if (closureRateBarEl) {
    closureRateBarEl.style.width = `${Math.min(closureRate, 100)}%`;
  }
  if (closureRateDonutCanvas) {
    const closedList = filtered.filter(p => (p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย");
    closureRateDonutChart = updateDonutChart(
      closureRateDonutChart,
      closureRateDonutCanvas,
      closureRate,
      "#ec4899",
      getDonutTooltipLines(closedList)
    );
  }

  if (approvalRateEl) approvalRateEl.textContent = `${approvalRate.toFixed(1)}%`;
  if (approvalRateCaptionEl) {
    approvalRateCaptionEl.textContent = total
      ? `${approved} จาก ${total} โครงการอนุมัติแล้ว`
      : "ยังไม่มีโครงการในตัวกรองนี้";
  }
  if (approvalRateBarEl) {
    approvalRateBarEl.style.width = `${Math.min(approvalRate, 100)}%`;
  }
  if (approvalRateDonutCanvas) {
    const approvedList = filtered.filter(p => (p.statusMain || "").trim() === "อนุมัติโครงการ");
    approvalRateDonutChart = updateDonutChart(
      approvalRateDonutChart,
      approvalRateDonutCanvas,
      approvalRate,
      "#f472b6",
      getDonutTooltipLines(approvedList)
    );
  }

  if (avgBudgetEl) avgBudgetEl.textContent = formatMoney(avgBudget);
  if (avgBudgetCaptionEl) {
    avgBudgetCaptionEl.textContent = `งบรวม ${formatMoney(totalBudget)} บาท`;
  }

  if (activeOrgCountEl || activeOrgCaptionEl) {
    const activeOrgs = new Set(
      filtered.map((p) => (p.orgName || "").trim()).filter(Boolean)
    );
    const allOrgCount = orgFilters.length
      ? new Set(orgFilters.map((o) => (o.name || "").trim()).filter(Boolean)).size
      : activeOrgs.size;

    if (activeOrgCountEl) {
      activeOrgCountEl.textContent = activeOrgs.size.toLocaleString("th-TH");
    }
    if (activeOrgCaptionEl) {
      activeOrgCaptionEl.textContent = allOrgCount
        ? `จากทั้งหมด ${allOrgCount.toLocaleString("th-TH")} หน่วยงาน`
        : "จำนวนหน่วยงานทั้งหมดไม่ระบุ";
    }
  }

  if (topOrgNameEl || topOrgBudgetEl) {
    const orgTotals = new Map();
    filtered.forEach((p) => {
      const name = (p.orgName || "").trim() || "(ไม่ระบุฝ่าย/ชมรม)";
      const budget = Number(p.budget || 0);
      orgTotals.set(name, (orgTotals.get(name) || 0) + budget);
    });

    let topOrg = null;
    orgTotals.forEach((value, name) => {
      if (!topOrg || value > topOrg.total) {
        topOrg = { name, total: value };
      }
    });

    if (topOrgNameEl) {
      topOrgNameEl.textContent = topOrg ? topOrg.name : "-";
    }
    if (topOrgBudgetEl) {
      topOrgBudgetEl.textContent = topOrg
        ? `${formatMoney(topOrg.total)} บาท`
        : "ยังไม่มีข้อมูล";
    }
  }

  const renderRankList = (listEl, items, emptyText) => {
    if (!listEl) return;
    listEl.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "rank-list-empty";
      li.textContent = emptyText;
      listEl.appendChild(li);
      return;
    }

    items.forEach((item) => {
      const li = document.createElement("li");
      const title = document.createElement("span");
      const value = document.createElement("span");
      title.className = "rank-item-title";
      value.className = "rank-item-value";
      title.textContent = item.title;
      value.textContent = item.value;
      li.append(title, value);
      listEl.appendChild(li);
    });
  };

  const recentItems = [...filtered]
    .map((p) => {
      let date = p.lastWorkDateObj;
      if (!date) {
        date = parseProjectDate(p.lastWorkDate);
        if (date) p.lastWorkDateObj = date;
      }
      return date ? { project: p, date } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.date - a.date)
    .slice(0, 3)
    .map(({ project, date }) => {
      const name = (project.name || "").trim() || "(ไม่ระบุชื่อโครงการ)";
      const code = (project.code || "").trim();
      return {
        title: code ? `${name} (${code})` : name,
        value: date.toLocaleDateString("th-TH")
      };
    });

  renderRankList(recentProjectsListEl, recentItems, "ยังไม่มีวันที่อัปเดตโครงการ");

  const today = new Date();
  const openItemsRaw = [...filtered]
    .filter((p) => !isProjectClosed(p))
    .filter((p) => {
      const status = (p.statusMain || "")
        .toString()
        .replace(/\u200B/g, "")
        .replace(/\s+/g, "")
        .trim();
      return !status.includes("ยกเลิกโครงการ");
    })
    .map((p) => {
      let dueDate = p.closeDueDateObj;
      if (!dueDate) {
        dueDate = parseProjectDate(p.closeDueDate);
        if (dueDate) p.closeDueDateObj = dueDate;
      }
      if (!dueDate) return null;
      const days = Math.max(0, Math.floor((today - dueDate) / (24 * 60 * 60 * 1000)));
      if (days <= 0) return null;
      const statusText = (p.statusClose || "").trim() || "-";
      return {
        code: (p.code || "").trim(),
        name: (p.name || "").trim() || "(ไม่ระบุชื่อโครงการ)",
        org: (p.orgName || "").trim() || "(ไม่ระบุฝ่าย/ชมรม)",
        assistant: (p.closeChecker || "").trim() || "-",
        status: statusText,
        statusBadge: `<span class="${statusCloseToBadgeClass(statusText)}">${statusText}</span>`,
        days
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.days - a.days)
    .map((item) => ({
      ...item,
      title: item.code ? `${item.name} (${item.code})` : item.name,
      value: `ค้าง ${item.days.toLocaleString("th-TH")} วัน`
    }));

  const assistantFilterValue = syncDashboardFilterOptions(
    longestOpenAssistantFilterEl,
    openItemsRaw.map((item) => item.assistant)
  );
  const statusFilterValue = syncDashboardFilterOptions(
    longestOpenStatusFilterEl,
    openItemsRaw.map((item) => item.status)
  );

  let openItems = openItemsRaw;
  if (assistantFilterValue !== "all") {
    openItems = openItems.filter((item) => item.assistant === assistantFilterValue);
  }
  if (statusFilterValue !== "all") {
    openItems = openItems.filter((item) => item.status === statusFilterValue);
  }

  if (longestOpenTableCaptionEl) {
    longestOpenTableCaptionEl.textContent = `แสดงผล ${openItems.length.toLocaleString("th-TH")} โครงการ`;
  }

  renderRankList(longestOpenListEl, openItems, "ยังไม่มีโครงการที่ค้างปิด");

  if (longestOpenTableBodyEl) {
    longestOpenTableBodyEl.innerHTML = "";
    if (!openItems.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5" class="table-empty" style="text-align:center; color:#9ca3af;">ยังไม่มีโครงการที่ค้างปิด</td>`;
      longestOpenTableBodyEl.appendChild(tr);
    } else {
      openItems.forEach((item) => {
        const tr = document.createElement("tr");
        const orgText = item.org ? `<span class="kpi-caption">${item.org}</span>` : "";
        tr.innerHTML = `
          <td class="col-code" data-label="รหัสโครงการ">${item.code}</td>
          <td class="col-name" data-label="ชื่อโครงการ">${item.name}<br>${orgText}</td>
          <td class="col-assistant" data-label="ผู้รับผิดชอบ">${item.assistant}</td>
          <td class="col-status" data-label="สถานะปิดโครงการ">${item.statusBadge || item.status}</td>
          <td class="col-budget" data-label="ยอดวันที่ค้าง" style="text-align:right;">${item.days} วัน</td>
        `;
        longestOpenTableBodyEl.appendChild(tr);
      });
    }
  }
}

function updateTrendLineChart(filtered) {
  if (!trendLineChart) return;

  const buckets = new Map();
  const today = new Date();
  filtered.forEach((p) => {
    if ((p.statusMain || "").trim() === "ยกเลิกโครงการ") return;
    if (isProjectClosed(p)) return;
    let dueDate = p.closeDueDateObj;
    if (!dueDate) {
      dueDate = parseProjectDate(p.closeDueDate);
      if (dueDate) p.closeDueDateObj = dueDate;
    }
    if (!dueDate || dueDate > today) return;
    const key = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets.has(key)) {
      buckets.set(key, { date: new Date(dueDate.getFullYear(), dueDate.getMonth(), 1), count: 0 });
    }
    buckets.get(key).count += 1;
  });

  const entries = Array.from(buckets.values()).sort((a, b) => a.date - b.date);
  const trimmed = entries.slice(-10);
  const monthNamesShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const labels = trimmed.map(({ date }) => {
    const year = date.getFullYear().toString().slice(-2);
    return `${monthNamesShort[date.getMonth()]} ${year}`;
  });
  const data = trimmed.map((entry) => entry.count);

  trendLineChart.data.labels = labels;
  trendLineChart.data.datasets[0].data = data;
  trendLineChart.update();
}

function updateDonutChart(existingChart, canvasEl, percent, color, tooltipLines = null) {
  if (!canvasEl) return existingChart;
  const value = Math.max(0, Math.min(percent || 0, 100));
  const data = {
    labels: ["value", "rest"],
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [color, "#f3f4f6"],
        borderWidth: 0
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: !!tooltipLines,
        filter: (item) => item.dataIndex === 0,
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
          label: () => tooltipLines || []
        }
      },
      centerText: {
        text: `${value.toFixed(1)}%`,
        subText: "",
        color: "#111827",
        fontFamily: "Kanit",
        fontSize: 20,
        subFontSize: 11
      }
    }
  };

  if (existingChart) {
    existingChart.data = data;
    existingChart.options = options;
    existingChart.update();
    return existingChart;
  }

  return new Chart(canvasEl.getContext("2d"), {
    type: "doughnut",
    data,
    options
  });
}

function renderHomeHeatmap(sourceProjects = projects, container = homeHeatmapEl, monthsRow = homeHeatmapMonthsEl) {
  if (!container || !monthsRow) return;

  container.innerHTML = "";
  monthsRow.innerHTML = "";
  if (!sourceProjects || !sourceProjects.length) return;

  const today = new Date();
  const currentMonth = today.getMonth();
  const startYear = currentMonth >= 5 ? today.getFullYear() : today.getFullYear() - 1;
  const endYear = startYear + 1;
  const monthNames = ["มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค."];

  const eventsByDate = {};
  let maxCount = 0;
  sourceProjects
    .filter((p) => (p.statusMain || "").trim() !== "ยกเลิกโครงการ")
    .forEach((p) => {
      let date = p.lastWorkDateObj;
      if (!date) {
        date = parseProjectDate(p.lastWorkDate);
        if (date) p.lastWorkDateObj = date;
      }
      if (!date || date < new Date(startYear, 5, 1) || date > new Date(endYear, 4, 31)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      if (!eventsByDate[key]) eventsByDate[key] = [];
      eventsByDate[key].push({
        title: p.name || "(ไม่ระบุชื่อโครงการ)",
        code: p.code || "-",
        start: date,
        org: p.orgName || "(ไม่ระบุฝ่าย/ชมรม)",
        status: mapProjectStatusToCalendarStatus(p),
        note: `รหัสโครงการ: ${p.code || "-"}`,
        budgetSource: p.fundSource || "-",
        year: p.year || "-"
      });
    });

  const yearStart = new Date(startYear, 5, 1);
  const yearEnd = new Date(endYear, 4, 31);
  const startOfGrid = new Date(yearStart);
  startOfGrid.setDate(yearStart.getDate() - yearStart.getDay());
  const endOfGrid = new Date(yearEnd);
  endOfGrid.setDate(yearEnd.getDate() + (6 - yearEnd.getDay()));

  for (let d = new Date(yearStart); d <= yearEnd; d.setDate(d.getDate() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = (eventsByDate[key] || []).length;
    if (count > maxCount) maxCount = count;
  }

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.ceil((endOfGrid - startOfGrid + 24 * 60 * 60 * 1000) / weekMs);
  const monthLabelPositions = {};
  for (let i = 0; i < 12; i++) {
    const month = (i + 5) % 12;
    const labelYear = month >= 5 ? startYear : endYear;
    const firstOfMonth = new Date(labelYear, month, 1);
    const diffWeeks = Math.floor((firstOfMonth - startOfGrid) / weekMs);
    if (diffWeeks >= 0 && diffWeeks < totalWeeks) {
      monthLabelPositions[diffWeeks] = monthNames[i];
    }
  }

  for (let week = 0; week < totalWeeks; week++) {
    const label = document.createElement("span");
    label.textContent = monthLabelPositions[week] || "";
    monthsRow.appendChild(label);
  }

  for (let week = 0; week < totalWeeks; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(startOfGrid);
      date.setDate(startOfGrid.getDate() + week * 7 + day);
      const isInYear = date >= yearStart && date <= yearEnd;

      const cell = document.createElement("div");
      cell.className = "heatmap-cell";

      if (!isInYear) {
        cell.classList.add("heatmap-cell-empty");
        container.appendChild(cell);
        continue;
      }

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const events = eventsByDate[key] || [];
      const count = events.length;
      const level = getHeatmapLevel(count, maxCount);
      cell.classList.add(`heat-${level}`);

      if (date.toDateString() === today.toDateString()) {
        cell.classList.add("heatmap-cell-today");
      }
      if (count > 0) {
        cell.classList.add("has-events");
        cell.title = `${date.toLocaleDateString("th-TH")} — ${count} โครงการ`;
        cell.addEventListener("click", () => {
          openCalendarDayModal(date, events);
        });
      } else {
        cell.title = date.toLocaleDateString("th-TH");
      }

      container.appendChild(cell);
    }
  }
}

function renderHomeKpis(sourceProjects = projects) {
  const data = Array.isArray(sourceProjects) ? sourceProjects : projects;
  if (!data || !data.length) return;

  const closedProjects = data.filter(isProjectClosed);

  const onTimeProjects = closedProjects.filter((p) => {
    const dur = getCloseDurationDays(p);
    if (dur !== null) {
      return dur <= 14; // ระยะเวลาปิดโครงการ (คอลัมน์ AZ) ไม่เกิน 14 วันถือว่าตรงเวลา
    }

    // fallback ถ้าไม่มีค่า duration ใช้ lastWorkDate เทียบ closeDueDate
    let due = p.closeDueDateObj;
    if (!due) {
      due = parseProjectDate(p.closeDueDate);
      if (due) p.closeDueDateObj = due;
    }
    let last = p.lastWorkDateObj;
    if (!last) {
      last = parseProjectDate(p.lastWorkDate);
      if (last) p.lastWorkDateObj = last;
    }
    if (!due || !last) return false;
    return last.getTime() <= due.getTime();
  });
  const onTimeCount = onTimeProjects.length;

  const onTimePercent = closedProjects.length
    ? (onTimeCount / closedProjects.length) * 100
    : 0;

  if (kpiOnTimeEl) {
    kpiOnTimeEl.textContent = `${onTimePercent.toFixed(1)}%`;
  }
  if (kpiOnTimeCaptionEl) {
    kpiOnTimeCaptionEl.textContent = closedProjects.length
      ? `${onTimeCount} จาก ${closedProjects.length} โครงการปิดภายใน 14 วัน`
      : "ยังไม่มีโครงการที่ปิดแล้ว";
  }
  if (kpiOnTimeBarEl) {
    kpiOnTimeBarEl.style.width = `${Math.min(onTimePercent, 100)}%`;
  }
  if (kpiOnTimeDonutCanvas) {
    kpiOnTimeDonutChart = updateDonutChart(
      kpiOnTimeDonutChart,
      kpiOnTimeDonutCanvas,
      onTimePercent,
      "#ec4899",
      getDonutTooltipLines(onTimeProjects)
    );
  }
  if (kpiOnTimeStaffEl) {
    kpiOnTimeStaffEl.textContent = `${onTimePercent.toFixed(1)}%`;
  }
  if (kpiOnTimeCaptionStaffEl) {
    kpiOnTimeCaptionStaffEl.textContent = closedProjects.length
      ? `${onTimeCount} จาก ${closedProjects.length} โครงการปิดภายใน 14 วัน`
      : "ยังไม่มีโครงการที่ปิดแล้ว";
  }

  const totalApproved = data.reduce(
    (sum, p) => sum + (p.approvedBudget100 ?? p.budget ?? 0),
    0
  );
  const totalActual = data.reduce(
    (sum, p) => sum + (p.actualBudget ?? 0),
    0
  );

  const usagePercent = totalApproved ? (totalActual / totalApproved) * 100 : 0;

  if (kpiBudgetUsageEl) {
    kpiBudgetUsageEl.textContent = `${usagePercent.toFixed(1)}%`;
  }
  if (kpiBudgetUsageCaptionEl) {
    kpiBudgetUsageCaptionEl.textContent =
      `${formatMoney(totalActual)} จาก ${formatMoney(totalApproved)} บาท`;
  }
  if (kpiBudgetUsageBarEl) {
    kpiBudgetUsageBarEl.style.width = `${Math.min(usagePercent, 100)}%`;
  }
  if (kpiBudgetUsageDonutCanvas) {
    kpiBudgetUsageDonutChart = updateDonutChart(
      kpiBudgetUsageDonutChart,
      kpiBudgetUsageDonutCanvas,
      usagePercent,
      "#f472b6",
      getDonutTooltipLines(data, "actualBudget")
    );
  }
  if (kpiBudgetUsageStaffEl) {
    kpiBudgetUsageStaffEl.textContent = `${usagePercent.toFixed(1)}%`;
  }
  if (kpiBudgetUsageCaptionStaffEl) {
    kpiBudgetUsageCaptionStaffEl.textContent =
      `${formatMoney(totalActual)} จาก ${formatMoney(totalApproved)} บาท`;
  }

  if (kpiClosedProjectsEl) {
    kpiClosedProjectsEl.textContent = closedProjects.length.toLocaleString("th-TH");
  }
  if (kpiClosedProjectsCaptionEl) {
    kpiClosedProjectsCaptionEl.textContent =
      `จาก ${data.length.toLocaleString("th-TH")} โครงการทั้งหมด`;
  }
  if (kpiClosedProjectsBarEl) {
    const closedPercent = data.length ? (closedProjects.length / data.length) * 100 : 0;
    kpiClosedProjectsBarEl.style.width = `${Math.min(closedPercent, 100)}%`;
  }
  if (kpiClosedProjectsStaffEl) {
    kpiClosedProjectsStaffEl.textContent = closedProjects.length.toLocaleString("th-TH");
  }
  if (kpiClosedProjectsCaptionStaffEl) {
    kpiClosedProjectsCaptionStaffEl.textContent =
      `จาก ${data.length.toLocaleString("th-TH")} โครงการทั้งหมด`;
  }

  const monthly = new Map();
  data.forEach((p) => {
    let d = p.lastWorkDateObj;
    if (!d) {
      d = parseProjectDate(p.lastWorkDate);
      if (d) p.lastWorkDateObj = d;
    }
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly.has(key)) {
      monthly.set(key, { date: d, approved: 0, actual: 0 });
    }
    const bucket = monthly.get(key);
    bucket.approved += p.approvedBudget100 ?? p.budget ?? 0;
    bucket.actual += p.actualBudget ?? 0;
  });

  const monthNamesShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const entries = Array.from(monthly.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const labels = entries.map(([, bucket]) => {
    const m = bucket.date.getMonth();
    const y = bucket.date.getFullYear().toString().slice(-2);
    return `${monthNamesShort[m]} ${y}`;
  });
  const approvedData = entries.map(([, bucket]) => Math.round(bucket.approved));
  const actualData = entries.map(([, bucket]) => Math.round(bucket.actual));

  if (kpiMonthlyCaptionEl) {
    kpiMonthlyCaptionEl.textContent = labels.length
      ? "ใช้วันที่สิ้นสุดการปฏิบัติงานของโครงการเป็นฐานเวลา"
      : "ยังไม่มีวันที่สิ้นสุดการปฏิบัติงานของโครงการ";
  }
  renderHomeHeatmap(data, homeHeatmapEl, homeHeatmapMonthsEl);

  if (!labels.length) {
    if (homeKpiChart) {
      homeKpiChart.destroy();
      homeKpiChart = null;
    }
    return;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "งบอนุมัติ",
        data: approvedData,
        backgroundColor: "rgba(236, 72, 153, 0.18)",
        borderColor: "#ec4899",
        borderWidth: 1.5,
        borderRadius: 8
      },
      {
        label: "ใช้จริง",
        data: actualData,
        backgroundColor: "rgba(34, 197, 94, 0.18)",
        borderColor: "#22c55e",
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatMoney(value)
        }
      }
    },
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            const val = ctx.parsed.y || 0;
            return `${label}: ${formatMoney(val)} บาท`;
          }
        }
      }
    }
  };

  if (homeKpiChart) {
    homeKpiChart.data = chartData;
    homeKpiChart.options = options;
    homeKpiChart.update();
  } else {
    const ctx = document.getElementById("homeKpiChart");
    if (!ctx) return;
    homeKpiChart = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options
    });
  }
}

function statusMainToBadgeClass(statusMain) {
  const s = (statusMain || "").trim();

  const approvedStatuses = ["อนุมัติโครงการ"];
  const rejectedStatuses = [
    "ไม่รับรองจากที่ประชุมนายก",
    "สภาไม่รับหลักการ",
    "ไม่ผ่านกมธ.วิสามัญ",
    "สภาไม่อนุมัติงบ",
    "ไม่ผ่านสภาใหญ่",
    "ยกเลิกโครงการ"
  ];
  const pendingStatuses = [
    "ส่งขออนุมัติกิจการนิสิต",
    "ผ่านที่ประชุมนายกหรืออนุกรรมการ",
    "ผ่านสภารับหลักการ",
    "ผ่านกมธ.วิสามัญ",
    "ผ่านสภาอนุมัติงบ",
    "ผ่านสภาใหญ่",
    "รอแก้ไข"
  ];

  if (approvedStatuses.includes(s)) return "badge badge-approved";
  if (rejectedStatuses.includes(s)) return "badge badge-rejected";
  if (pendingStatuses.includes(s)) return "badge badge-pending";
  return "badge badge-draft";
}

function statusCloseToBadgeClass(statusClose) {
  const s = (statusClose || "").trim();

  if (s.includes("ผ่านเหรัญญิก") || s.includes("รอส่งกิจการนิสิต")) {
    return "badge badge-approved";
  }
  if (s.includes("ผ่านผู้ช่วยเหรัญญิก") || s.includes("เหรัญญิกตรวจสอบ")) {
    return "badge badge-warning";
  }
  return "badge badge-rejected";
}

function getDonutTooltipLines(projectsList, valueKey = null) {
  const groups = {};
  let total = 0;
  projectsList.forEach((p) => {
    const name = (p.orgGroup || "(ไม่ระบุ)").trim();
    const val = valueKey ? (p[valueKey] || 0) : 1;
    groups[name] = (groups[name] || 0) + val;
    total += val;
  });

  const sorted = Object.entries(groups)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const top = sorted.slice(0, 5);
  const lines = top.map(([n, v]) => {
    const vStr = valueKey ? formatMoney(v) : v.toLocaleString();
    const unit = valueKey ? " บาท" : " โครงการ";
    const pct = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
    return `• ${n}: ${vStr}${unit} (${pct}%)`;
  });

  if (sorted.length > 5) {
    lines.push(`...และอีก ${sorted.length - 5} กลุ่ม`);
  }
  return lines;
}

/**
 * ใช้เฉพาะ "รายการโครงการ" ตาม logic:
 * if (วันนี้ยังไม่เลยกำหนด) → ใช้ H + สีตามเดิม
 * else (วันนี้เลยกำหนด)
 *   if (AR = "ส่งกิจการนิสิตเรียบร้อย" && AS != "รอปิดโครงการ")
 *      → ใช้ AS (เขียว)
 *   else → ใช้ AR (ส้ม)
 */
function getDisplayStatusForList(project) {
  const baseStatus = (project.statusMain || "").trim();           // H
  const statusAR = (project.statusClose || "").trim();            // AR
  const statusAS = (project.statusCloseDecree || "").trim();      // AS
  const d = typeof project.daysToDeadline === "number" && !isNaN(project.daysToDeadline)
    ? project.daysToDeadline
    : null;

  // ถ้ายังไม่เลยกำหนด (หรือไม่มีข้อมูลวัน) → ใช้ H และสีตามเดิม
  if (d === null || d >= 0) {
    return {
      text: baseStatus || "-",
      badgeClass: statusMainToBadgeClass(baseStatus)
    };
  }

  // วันนี้เลยกำหนดแล้ว
  if (statusAR === "ส่งกิจการนิสิตเรียบร้อย" && statusAS !== "รอปิดโครงการ" && statusAS) {
    // ใช้ AS สีเขียว
    return {
      text: statusAS,
      badgeClass: "badge badge-approved"
    };
  }

  if (statusAR) {
    // ใช้ AR สีส้ม
    return {
      text: statusAR,
      badgeClass: "badge badge-pending"
    };
  }

  // fallback ถ้า AR/AS ว่าง ให้กลับไปใช้ H
  return {
    text: baseStatus || "-",
    badgeClass: statusMainToBadgeClass(baseStatus)
  };
}

function updateTable(filteredProjects) {
  const tbody = tableBodyEl;
  if (!tbody) return;

  let html = "";
  filteredProjects.forEach((p, idx) => {
    const budgetVal = p.budget || 0;
    let budgetColor = "";
    if (budgetVal >= 1000000) {
      budgetColor = "color:#facc15; font-weight:700;";
    } else if (budgetVal >= 500000) {
      budgetColor = "color:#a855f7; font-weight:600;";
    } else if (budgetVal >= 100000) {
      budgetColor = "color:#3b82f6; font-weight:600;";
    } else {
      budgetColor = "color:inherit;";
    }

    const budgetText = formatMoney(budgetVal);
    const displayStatus = getDisplayStatusForList(p);
    const statusBadge = `<span class="${displayStatus.badgeClass}">${displayStatus.text || "-"}</span>`;
    const orgName = (p.orgName || "").trim();
    const orgMarkup = orgName ? `<div class="project-org">${orgName}</div>` : "";

    html += `
      <tr class="project-row" data-project-idx="${idx}">
        <td class="col-code">${p.code || ""}</td>
        <td class="col-name">
          <div class="project-name">${p.name || ""}</div>
          ${orgMarkup}
        </td>
        <td class="col-year">${p.year || ""}</td>
        <td class="col-status">${statusBadge}</td>
        <td class="col-budget" style="${budgetColor}">${budgetText}</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
  lastTableProjects = filteredProjects;

  if (!tbody.dataset.boundClick) {
    tbody.addEventListener("click", (e) => {
      const row = e.target.closest("tr[data-project-idx]");
      if (!row || !tbody.contains(row)) return;
      const idx = Number(row.dataset.projectIdx);
      const project = lastTableProjects[idx];
      if (project) openProjectModal(project);
    });
    tbody.dataset.boundClick = "true";
  }
}

function formatDaysToDeadline(days) {
  if (days === null || days === undefined || isNaN(days)) return "-";
  if (days > 0) return `เหลืออีก ${days} วันก่อนครบกำหนดปิดโครงการ`;
  if (days === 0) return `ครบกำหนดปิดโครงการวันนี้`;
  return `เกินกำหนดปิดโครงการมาแล้ว ${Math.abs(days)} วัน`;
}
