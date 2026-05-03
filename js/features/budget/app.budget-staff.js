/* Staff budget approval management */
(function initBudgetStaffManagement() {
  if (window.__sgcuBudgetStaffManagementInitDone) return;
  window.__sgcuBudgetStaffManagementInitDone = true;

  const summaryCaptionEl = document.getElementById("budgetStaffSummaryCaption");
  const orgCountEl = document.getElementById("budgetStaffOrgCount");
  const projectCountEl = document.getElementById("budgetStaffProjectCount");
  const requestedTotalEl = document.getElementById("budgetStaffRequestedTotal");
  const approvedTotalEl = document.getElementById("budgetStaffApprovedTotal");
  const ceilingTotalEl = document.getElementById("budgetStaffCeilingTotal");
  const reductionNeededEl = document.getElementById("budgetStaffReductionNeeded");
  const reductionCaptionEl = document.getElementById("budgetStaffReductionCaption");
  const orgSummaryCaptionEl = document.getElementById("budgetStaffOrgSummaryCaption");
  const orgSummaryGroupEl = document.getElementById("budgetStaffOrgSummaryGroup");
  const orgSummaryOrgEl = document.getElementById("budgetStaffOrgSummaryOrg");
  const reviewGroupEl = document.getElementById("budgetStaffReviewGroup");
  const reviewOrgEl = document.getElementById("budgetStaffReviewOrg");
  const chartCanvasEl = document.getElementById("budgetStaffOrgChart");
  const tabBtnEls = Array.from(document.querySelectorAll("[data-budget-staff-tab]"));
  const tabPanelEls = Array.from(document.querySelectorAll("[data-budget-staff-panel]"));

  const deadlineInputEl = document.getElementById("budgetRequestDeadlineInput");
  const ceilingInputEl = document.getElementById("budgetCeilingInput");
  const groupCeilingListEl = document.getElementById("budgetGroupCeilingList");
  const groupCeilingToggleBtnEl = document.getElementById("budgetGroupCeilingToggleBtn");
  const deadlineStatusEl = document.getElementById("budgetRequestDeadlineStatus");
  const deadlineSaveBtnEl = document.getElementById("budgetRequestDeadlineSaveBtn");
  const runCodeBtnEl = document.getElementById("budgetRunProjectCodeBtn");
  const clearCodeBtnEl = document.getElementById("budgetClearProjectCodeBtn");
  const actionMessageEl = document.getElementById("budgetStaffActionMessage");

  const formEl = document.getElementById("budgetStaffManageForm");
  const saveBtnEl = document.getElementById("budgetStaffManageSaveBtn");
  const cancelEditBtnEl = document.getElementById("budgetStaffManageCancelEditBtn");
  const formMessageEl = document.getElementById("budgetStaffManageMessage");
  const orgTypeInputEl = document.getElementById("budgetStaffOrgTypeInput");
  const orgNameInputEl = document.getElementById("budgetStaffOrgNameInput");
  const projectNameInputEl = document.getElementById("budgetStaffProjectNameInput");
  const activityLocationInputEl = document.getElementById("budgetStaffActivityLocationInput");
  const prepStartDateInputEl = document.getElementById("budgetStaffPrepStartDateInput");
  const operationEndDateInputEl = document.getElementById("budgetStaffOperationEndDateInput");
  const studentOperatorsInputEl = document.getElementById("budgetStaffStudentOperatorsInput");
  const studentParticipantsInputEl = document.getElementById("budgetStaffStudentParticipantsInput");
  const requestedAmountInputEl = document.getElementById("budgetStaffRequestedAmountInput");
  const approvedAmountInputEl = document.getElementById("budgetStaffApprovedAmountInput");
  const statusInputEl = document.getElementById("budgetStaffStatusInput");
  const descriptionInputEl = document.getElementById("budgetStaffDescriptionInput");

  const tableBodyEl = document.getElementById("budgetStaffRequestsBody");

  if (
    !summaryCaptionEl ||
    !orgCountEl ||
    !projectCountEl ||
    !requestedTotalEl ||
    !approvedTotalEl ||
    !ceilingTotalEl ||
    !reductionNeededEl ||
    !reductionCaptionEl ||
    !orgSummaryCaptionEl ||
    !orgSummaryGroupEl ||
    !orgSummaryOrgEl ||
    !reviewGroupEl ||
    !reviewOrgEl ||
    !chartCanvasEl ||
    !tabBtnEls.length ||
    !tabPanelEls.length ||
    !deadlineInputEl ||
    !ceilingInputEl ||
    !groupCeilingListEl ||
    !groupCeilingToggleBtnEl ||
    !deadlineStatusEl ||
    !deadlineSaveBtnEl ||
    !runCodeBtnEl ||
    !clearCodeBtnEl ||
    !actionMessageEl ||
    !formEl ||
    !saveBtnEl ||
    !cancelEditBtnEl ||
    !formMessageEl ||
    !orgTypeInputEl ||
    !orgNameInputEl ||
    !projectNameInputEl ||
    !activityLocationInputEl ||
    !prepStartDateInputEl ||
    !operationEndDateInputEl ||
    !studentOperatorsInputEl ||
    !studentParticipantsInputEl ||
    !requestedAmountInputEl ||
    !approvedAmountInputEl ||
    !statusInputEl ||
    !descriptionInputEl ||
    !tableBodyEl
  ) {
    return;
  }

  const COLLECTION_REQUESTS = "budgetApprovalRequests";
  const COLLECTION_SETTINGS = "budgetApprovalSettings";
  const SETTINGS_DOC_ID = "global";
  const LOCAL_BUDGET_CEILING_KEY = "sgcuBudgetStaffBudgetCeiling";
  const LOCAL_BUDGET_GROUP_CEILINGS_KEY = "sgcuBudgetStaffBudgetGroupCeilings";
  const LOCAL_BUDGET_GROUP_CEILING_OPEN_KEY = "sgcuBudgetStaffBudgetGroupCeilingOpen";

  let unsubscribeRequests = null;
  let requestRows = [];
  let editingId = "";
  let chartInstance = null;
  let budgetCeiling = 0;
  let budgetGroupCeilings = {};
  let isGroupCeilingOpen = true;

  const formatMoney = (value) => {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return "0.00";
    return num.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const normalizeText = (value) => (value || "").toString().trim();

  const readMoneyInput = (value) => {
    const normalized = normalizeText(value).replaceAll(",", "");
    if (!normalized) return 0;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : Number.NaN;
  };

  const toDateOnlyText = (value) => {
    const s = normalizeText(value);
    if (!s) return "";
    return s.length >= 10 ? s.slice(0, 10) : s;
  };

  const readLocalBudgetCeiling = () => {
    try {
      const value = window.localStorage?.getItem(LOCAL_BUDGET_CEILING_KEY) || "";
      const ceiling = readMoneyInput(value);
      return Number.isFinite(ceiling) && ceiling > 0 ? ceiling : 0;
    } catch (_) {
      return 0;
    }
  };

  const writeLocalBudgetCeiling = (value) => {
    try {
      if (value > 0) {
        window.localStorage?.setItem(LOCAL_BUDGET_CEILING_KEY, String(value));
      } else {
        window.localStorage?.removeItem(LOCAL_BUDGET_CEILING_KEY);
      }
    } catch (_) {}
  };

  const normalizeBudgetGroupCeilings = (value) => {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    return Object.entries(source).reduce((next, [group, amount]) => {
      const key = normalizeText(group);
      const ceiling = readMoneyInput(amount);
      if (key && Number.isFinite(ceiling) && ceiling > 0) next[key] = ceiling;
      return next;
    }, {});
  };

  const readLocalBudgetGroupCeilings = () => {
    try {
      const raw = window.localStorage?.getItem(LOCAL_BUDGET_GROUP_CEILINGS_KEY) || "{}";
      return normalizeBudgetGroupCeilings(JSON.parse(raw));
    } catch (_) {
      return {};
    }
  };

  const writeLocalBudgetGroupCeilings = (value) => {
    try {
      const normalized = normalizeBudgetGroupCeilings(value);
      if (Object.keys(normalized).length) {
        window.localStorage?.setItem(LOCAL_BUDGET_GROUP_CEILINGS_KEY, JSON.stringify(normalized));
      } else {
        window.localStorage?.removeItem(LOCAL_BUDGET_GROUP_CEILINGS_KEY);
      }
    } catch (_) {}
  };

  const readLocalGroupCeilingOpen = () => {
    try {
      return window.localStorage?.getItem(LOCAL_BUDGET_GROUP_CEILING_OPEN_KEY) !== "false";
    } catch (_) {
      return true;
    }
  };

  const writeLocalGroupCeilingOpen = (value) => {
    try {
      window.localStorage?.setItem(LOCAL_BUDGET_GROUP_CEILING_OPEN_KEY, value ? "true" : "false");
    } catch (_) {}
  };

  const syncGroupCeilingVisibility = () => {
    groupCeilingListEl.hidden = !isGroupCeilingOpen;
    groupCeilingToggleBtnEl.textContent = isGroupCeilingOpen ? "ซ่อน" : "แสดง";
    groupCeilingToggleBtnEl.setAttribute("aria-expanded", isGroupCeilingOpen ? "true" : "false");
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const statusLabel = (status) => {
    const normalized = normalizeText(status).toLowerCase() || "pending";
    if (normalized === "approved") return "ผ่านที่ประชุมนายกหรืออนุกรรมการ";
    if (normalized === "rejected") return "ไม่อนุมัติ";
    if (normalized === "cancelled") return "ยกเลิกหรือเลื่อนไปผ่านครั้งอื่น";
    return "รออนุมัติ";
  };

  const statusBadge = (status) => {
    const normalized = normalizeText(status).toLowerCase() || "pending";
    if (normalized === "approved") return '<span class="badge badge-approved">ผ่านที่ประชุมนายกหรืออนุกรรมการ</span>';
    if (normalized === "rejected") return '<span class="badge badge-rejected">ไม่อนุมัติ</span>';
    if (normalized === "cancelled") return '<span class="badge badge-warning">ยกเลิกหรือเลื่อนไปผ่านครั้งอื่น</span>';
    return '<span class="badge badge-pending">รออนุมัติ</span>';
  };

  const formatDate = (value) => {
    const dateText = toDateOnlyText(value);
    if (!dateText) return "-";
    const parsed = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateText;
    return parsed.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getCreatedAtTime = (item) => {
    const raw = item?.createdAt;
    if (raw?.seconds) return Number(raw.seconds) * 1000;
    const parsed = Date.parse(raw || "");
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const getDateOnlyTime = (value, fallback = 0) => {
    const dateText = toDateOnlyText(value || "");
    if (!dateText) return fallback;
    const parsed = Date.parse(`${dateText}T00:00:00`);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const getOrgFilterRows = () =>
    typeof orgFilters !== "undefined" && Array.isArray(orgFilters)
      ? orgFilters
      : Array.isArray(globalThis.orgFilters)
        ? globalThis.orgFilters
        : [];

  const resetSelectOptions = (selectEl, firstLabel) => {
    const selected = selectEl.value || "all";
    selectEl.innerHTML = "";
    const first = document.createElement("option");
    first.value = "all";
    first.textContent = firstLabel;
    selectEl.appendChild(first);
    return selected;
  };

  const populateOrgSummaryGroupOptions = () => {
    const selected = resetSelectOptions(orgSummaryGroupEl, "ทุกประเภทองค์กร");
    const filterRows = getOrgFilterRows();
    const groups = filterRows.length
      ? filterRows.map((item) => normalizeText(item?.group)).filter(Boolean)
      : requestRows.map((item) => normalizeText(item.organizationType)).filter(Boolean);
    Array.from(new Set(groups)).sort((a, b) => a.localeCompare(b, "th")).forEach((group) => {
      const opt = document.createElement("option");
      opt.value = group;
      opt.textContent = group;
      orgSummaryGroupEl.appendChild(opt);
    });
    orgSummaryGroupEl.value = Array.from(orgSummaryGroupEl.options).some((opt) => opt.value === selected) ? selected : "all";
  };

  const populateOrgSummaryOrgOptions = () => {
    const selected = resetSelectOptions(orgSummaryOrgEl, "ทุกฝ่าย / ทุกชมรม");
    const group = normalizeText(orgSummaryGroupEl.value) || "all";
    const filterRows = getOrgFilterRows();
    const names = filterRows.length
      ? filterRows
        .filter((item) => group === "all" || normalizeText(item?.group) === group)
        .map((item) => normalizeText(item?.name))
        .filter(Boolean)
      : requestRows
        .filter((item) => group === "all" || normalizeText(item.organizationType) === group)
        .map((item) => normalizeText(item.organizationName))
        .filter(Boolean);
    Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, "th")).forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      orgSummaryOrgEl.appendChild(opt);
    });
    orgSummaryOrgEl.value = Array.from(orgSummaryOrgEl.options).some((opt) => opt.value === selected) ? selected : "all";
  };

  const populateReviewGroupOptions = () => {
    const selected = resetSelectOptions(reviewGroupEl, "ทุกประเภทองค์กร");
    const filterRows = getOrgFilterRows();
    const groups = filterRows.length
      ? filterRows.map((item) => normalizeText(item?.group)).filter(Boolean)
      : requestRows.map((item) => normalizeText(item.organizationType)).filter(Boolean);
    Array.from(new Set(groups)).sort((a, b) => a.localeCompare(b, "th")).forEach((group) => {
      const opt = document.createElement("option");
      opt.value = group;
      opt.textContent = group;
      reviewGroupEl.appendChild(opt);
    });
    reviewGroupEl.value = Array.from(reviewGroupEl.options).some((opt) => opt.value === selected) ? selected : "all";
  };

  const populateReviewOrgOptions = () => {
    const selected = resetSelectOptions(reviewOrgEl, "ทุกฝ่าย / ทุกชมรม");
    const group = normalizeText(reviewGroupEl.value) || "all";
    const filterRows = getOrgFilterRows();
    const names = filterRows.length
      ? filterRows
        .filter((item) => group === "all" || normalizeText(item?.group) === group)
        .map((item) => normalizeText(item?.name))
        .filter(Boolean)
      : requestRows
        .filter((item) => group === "all" || normalizeText(item.organizationType) === group)
        .map((item) => normalizeText(item.organizationName))
        .filter(Boolean);
    Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, "th")).forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      reviewOrgEl.appendChild(opt);
    });
    reviewOrgEl.value = Array.from(reviewOrgEl.options).some((opt) => opt.value === selected) ? selected : "all";
  };

  const getBudgetGroupNames = () => {
    const filterRows = getOrgFilterRows();
    const groups = filterRows.length
      ? filterRows.map((item) => normalizeText(item?.group)).filter(Boolean)
      : requestRows.map((item) => normalizeText(item.organizationType)).filter(Boolean);
    return Array.from(new Set(groups)).sort((a, b) => a.localeCompare(b, "th"));
  };

  const getBudgetGroupRecommendationMap = () => {
    const orgGroupMap = getOrgGroupMap();
    const groupTotals = new Map();
    requestRows.forEach((item) => {
      if (normalizeText(item.requestType || "budget_approval") !== "budget_approval") return;
      const orgName = normalizeText(item.organizationName) || "-";
      const group = orgGroupMap.get(orgName) || normalizeText(item.organizationType);
      if (!group) return;
      groupTotals.set(group, (groupTotals.get(group) || 0) + Number(item.estimatedExpense || 0));
    });
    const totalRequested = Array.from(groupTotals.values()).reduce((sum, amount) => sum + amount, 0);
    return Object.fromEntries(
      getBudgetGroupNames().map((group) => {
        const requested = Number(groupTotals.get(group) || 0);
        const recommended = budgetCeiling > 0 && totalRequested > 0
          ? (budgetCeiling * requested) / totalRequested
          : 0;
        return [group, { requested, recommended }];
      })
    );
  };

  const renderBudgetGroupCeilingInputs = () => {
    const groups = getBudgetGroupNames();
    const recommendations = getBudgetGroupRecommendationMap();
    groupCeilingListEl.innerHTML = groups.length
      ? groups.map((group) => `
        <div class="budget-staff-group-ceiling-row">
          <div>
            <label class="login-label" for="budgetGroupCeiling-${escapeHtml(group)}">${escapeHtml(group)}</label>
            <div class="card-caption">
              ${recommendations[group]?.recommended > 0
                ? `แนะนำเพดาน ${formatMoney(recommendations[group].recommended)} บาท จากยอดขอ ${formatMoney(recommendations[group].requested)} บาท`
                : "แนะนำได้เมื่อมีเพดานรวมและยอดคำขอ"}
            </div>
          </div>
          <input
            id="budgetGroupCeiling-${escapeHtml(group)}"
            class="login-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="ไม่กำหนด"
            data-budget-group-ceiling="${escapeHtml(group)}"
            value="${budgetGroupCeilings[group] > 0 ? escapeHtml(String(budgetGroupCeilings[group])) : ""}"
          />
        </div>
      `).join("")
      : '<div class="section-text-sm">ยังไม่มีข้อมูลประเภทองค์กร</div>';
  };

  const readBudgetGroupCeilingsFromInputs = () => {
    const next = {};
    const inputs = Array.from(groupCeilingListEl.querySelectorAll("[data-budget-group-ceiling]"));
    for (const input of inputs) {
      const group = normalizeText(input.getAttribute("data-budget-group-ceiling"));
      const ceiling = readMoneyInput(input.value);
      if (!Number.isFinite(ceiling) || ceiling < 0) {
        input.focus();
        return { ok: false, message: `เพดานย่อยของ ${group || "ฝ่ายใหญ่"} ต้องเป็นตัวเลขที่ไม่ติดลบ` };
      }
      if (group && ceiling > 0) next[group] = ceiling;
    }
    return { ok: true, value: next };
  };

  const validateBudgetGroupCeilingTotal = (groupCeilings, ceiling) => {
    const groupTotal = Object.values(groupCeilings || {}).reduce((sum, amount) => sum + Number(amount || 0), 0);
    if (groupTotal <= 0) return { ok: true, groupTotal };
    if (ceiling <= 0) {
      return { ok: false, groupTotal, message: "กรุณากำหนดเพดานงบประมาณรวมก่อนกำหนดเพดานย่อย" };
    }
    if (groupTotal > ceiling) {
      return {
        ok: false,
        groupTotal,
        message: `ผลรวมเพดานย่อย ${formatMoney(groupTotal)} บาท เกินเพดานรวม ${formatMoney(ceiling)} บาท ควรลดเพดานย่อยรวมอีก ${formatMoney(groupTotal - ceiling)} บาท`
      };
    }
    return { ok: true, groupTotal };
  };

  const refreshOrgSummaryFilters = async () => {
    if (typeof loadOrgFilters === "function") {
      try { await loadOrgFilters(); } catch (_) {}
    }
    populateOrgSummaryGroupOptions();
    populateOrgSummaryOrgOptions();
    populateReviewGroupOptions();
    populateReviewOrgOptions();
    renderBudgetGroupCeilingInputs();
    updateSummary();
    void renderOrgSummaryChart();
  };

  const sortForDisplay = (rows) => {
    const statusOrder = { pending: 0, approved: 1, rejected: 2, cancelled: 3 };
    return rows.slice().sort((a, b) => {
      const statusA = normalizeText(a.status || "pending").toLowerCase();
      const statusB = normalizeText(b.status || "pending").toLowerCase();
      const orderA = statusOrder[statusA] ?? 9;
      const orderB = statusOrder[statusB] ?? 9;
      if (orderA !== orderB) return orderA - orderB;

      const dateA = Date.parse(`${toDateOnlyText(a.operationEndDate || "")}T00:00:00`) || 0;
      const dateB = Date.parse(`${toDateOnlyText(b.operationEndDate || "")}T00:00:00`) || 0;
      if (dateA !== dateB) return dateA - dateB;

      return getCreatedAtTime(b) - getCreatedAtTime(a);
    });
  };

  const setMessage = (el, text, color = "#374151") => {
    if (!el) return;
    el.textContent = text || "";
    el.style.color = color;
  };

  const setCodeActionBusy = (isBusy) => {
    runCodeBtnEl.disabled = isBusy;
    clearCodeBtnEl.disabled = isBusy;
  };

  const setActiveTab = (tab = "overview") => {
    const nextTab = tab === "review" ? "review" : "overview";
    tabBtnEls.forEach((btn) => {
      const isActive = btn.getAttribute("data-budget-staff-tab") === nextTab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    tabPanelEls.forEach((panel) => {
      const isActive = panel.getAttribute("data-budget-staff-panel") === nextTab;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
    if (nextTab === "overview") {
      window.setTimeout(() => { void renderOrgSummaryChart(); }, 0);
    }
  };

  const getFirestore = () => window.sgcuFirestore || {};

  const setFormMode = (id = "") => {
    editingId = normalizeText(id);
    const isEdit = !!editingId;
    saveBtnEl.textContent = isEdit ? "บันทึกการแก้ไข" : "เพิ่มรายการ";
    cancelEditBtnEl.hidden = !isEdit;
  };

  const resetForm = () => {
    formEl.reset();
    studentOperatorsInputEl.value = "0";
    studentParticipantsInputEl.value = "0";
    approvedAmountInputEl.value = "0";
    statusInputEl.value = "pending";
    setFormMode("");
    setMessage(formMessageEl, "");
  };

  const readFormPayload = () => {
    return {
      organizationType: normalizeText(orgTypeInputEl.value),
      organizationName: normalizeText(orgNameInputEl.value),
      projectName: normalizeText(projectNameInputEl.value),
      description: normalizeText(descriptionInputEl.value),
      activityLocation: normalizeText(activityLocationInputEl.value),
      prepStartDate: toDateOnlyText(prepStartDateInputEl.value),
      operationEndDate: toDateOnlyText(operationEndDateInputEl.value),
      studentOperators: Number(studentOperatorsInputEl.value || 0),
      studentParticipants: Number(studentParticipantsInputEl.value || 0),
      estimatedExpense: Number(requestedAmountInputEl.value || 0),
      approvedAmount: Number(approvedAmountInputEl.value || 0),
      status: normalizeText(statusInputEl.value).toLowerCase() || "pending"
    };
  };

  const validateForm = () => {
    const controls = [
      orgTypeInputEl,
      orgNameInputEl,
      projectNameInputEl,
      activityLocationInputEl,
      prepStartDateInputEl,
      operationEndDateInputEl,
      studentOperatorsInputEl,
      studentParticipantsInputEl,
      requestedAmountInputEl,
      approvedAmountInputEl,
      statusInputEl,
      descriptionInputEl
    ];
    const invalid = controls.find((el) => !el.reportValidity());
    if (invalid) return false;

    const validateWholeNumber = (inputEl, label) => {
      const value = Number(inputEl.value || 0);
      const isValid = Number.isInteger(value) && value >= 0;
      inputEl.setCustomValidity(isValid ? "" : `${label}ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`);
      const ok = inputEl.reportValidity();
      inputEl.setCustomValidity("");
      return ok;
    };

    if (!validateWholeNumber(studentOperatorsInputEl, "จำนวนนิสิตผู้ปฏิบัติงาน")) return false;
    if (!validateWholeNumber(studentParticipantsInputEl, "จำนวนนิสิตผู้เข้าร่วมงาน")) return false;

    if (Number(requestedAmountInputEl.value || 0) < 0 || Number(approvedAmountInputEl.value || 0) < 0) {
      setMessage(formMessageEl, "ยอดเงินต้องไม่ติดลบ", "#b91c1c");
      return false;
    }

    const startTime = getDateOnlyTime(prepStartDateInputEl.value, Number.NaN);
    const endTime = getDateOnlyTime(operationEndDateInputEl.value, Number.NaN);
    if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime < startTime) {
      setMessage(formMessageEl, "วันสุดท้ายปฏิบัติงานต้องไม่ก่อนวันเริ่มเตรียมงาน", "#b91c1c");
      operationEndDateInputEl.focus();
      return false;
    }

    return true;
  };

  const getOrgGroupMap = () => {
    const map = new Map();
    getOrgFilterRows().forEach((item) => {
      const name = normalizeText(item?.name);
      const group = normalizeText(item?.group);
      if (name && group) map.set(name, group);
    });
    return map;
  };

  const getOverviewFilteredRows = () => {
    const groupFilter = normalizeText(orgSummaryGroupEl.value) || "all";
    const orgFilter = normalizeText(orgSummaryOrgEl.value) || "all";
    const orgGroupMap = getOrgGroupMap();
    return requestRows.filter((item) => {
      if (normalizeText(item.requestType || "budget_approval") !== "budget_approval") return false;
      const orgName = normalizeText(item.organizationName) || "-";
      const group = orgGroupMap.get(orgName) || normalizeText(item.organizationType);
      if (groupFilter !== "all" && group !== groupFilter) return false;
      if (orgFilter !== "all" && orgName !== orgFilter) return false;
      return true;
    });
  };

  const getReviewFilteredRows = () => {
    const groupFilter = normalizeText(reviewGroupEl.value) || "all";
    const orgFilter = normalizeText(reviewOrgEl.value) || "all";
    const orgGroupMap = getOrgGroupMap();
    return requestRows.filter((item) => {
      if (normalizeText(item.requestType || "budget_approval") !== "budget_approval") return false;
      const orgName = normalizeText(item.organizationName) || "-";
      const group = orgGroupMap.get(orgName) || normalizeText(item.organizationType);
      if (groupFilter !== "all" && group !== groupFilter) return false;
      if (orgFilter !== "all" && orgName !== orgFilter) return false;
      return true;
    });
  };

  const getSelectedOverviewGroup = () => {
    const groupFilter = normalizeText(orgSummaryGroupEl.value) || "all";
    const orgFilter = normalizeText(orgSummaryOrgEl.value) || "all";
    if (groupFilter !== "all") return groupFilter;
    if (orgFilter === "all") return "";
    const orgGroupMap = getOrgGroupMap();
    const mappedGroup = orgGroupMap.get(orgFilter);
    if (mappedGroup) return mappedGroup;
    const matchedRow = requestRows.find((item) => normalizeText(item.organizationName) === orgFilter);
    return normalizeText(matchedRow?.organizationType);
  };

  const getSelectedOverviewCeiling = () => {
    const selectedGroup = getSelectedOverviewGroup();
    if (selectedGroup && Number(budgetGroupCeilings[selectedGroup] || 0) > 0) {
      return {
        amount: Number(budgetGroupCeilings[selectedGroup] || 0),
        label: `เพดานย่อย ${selectedGroup}`
      };
    }
    return {
      amount: Number(budgetCeiling || 0),
      label: "เพดานรวม"
    };
  };

  const updateSummary = () => {
    const activeRows = getOverviewFilteredRows();
    const orgSet = new Set(activeRows.map((item) => `${normalizeText(item.organizationType)}::${normalizeText(item.organizationName)}`).filter((key) => key !== "::"));
    const requestedSum = activeRows.reduce((sum, item) => sum + Number(item.estimatedExpense || 0), 0);
    const approvedSum = activeRows.reduce((sum, item) => sum + Number(item.approvedAmount || 0), 0);
    const selectedCeiling = getSelectedOverviewCeiling();
    const effectiveCeiling = selectedCeiling.amount;
    const reductionNeeded = effectiveCeiling > 0 ? Math.max(requestedSum - effectiveCeiling, 0) : 0;
    const reductionPercent = requestedSum > 0 ? (reductionNeeded * 100) / requestedSum : 0;
    const remainingCeiling = effectiveCeiling > 0 ? Math.max(effectiveCeiling - requestedSum, 0) : 0;

    orgCountEl.textContent = orgSet.size.toLocaleString("th-TH");
    projectCountEl.textContent = activeRows.length.toLocaleString("th-TH");
    requestedTotalEl.textContent = formatMoney(requestedSum);
    approvedTotalEl.textContent = formatMoney(approvedSum);
    ceilingTotalEl.textContent = effectiveCeiling > 0 ? formatMoney(effectiveCeiling) : "ยังไม่กำหนด";
    reductionNeededEl.textContent = formatMoney(reductionNeeded);
    if (effectiveCeiling <= 0) {
      reductionCaptionEl.textContent = "กำหนดเพดานงบเพื่อให้ระบบคำนวณคำแนะนำ";
    } else if (reductionNeeded > 0) {
      reductionCaptionEl.textContent = `${selectedCeiling.label}: ต้องลด ${formatMoney(reductionNeeded)} บาท (${reductionPercent.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%) ให้เหลือไม่เกิน ${formatMoney(effectiveCeiling)} บาท`;
    } else {
      reductionCaptionEl.textContent = `${selectedCeiling.label}: ยอดของบรวมยังอยู่ในเพดาน เหลือ ${formatMoney(remainingCeiling)} บาท`;
    }

    const pendingCount = activeRows.filter((item) => normalizeText(item.status || "pending").toLowerCase() === "pending").length;
    const groupFilter = normalizeText(orgSummaryGroupEl.value) || "all";
    const orgFilter = normalizeText(orgSummaryOrgEl.value) || "all";
    const filterText = orgFilter !== "all"
      ? orgFilter
      : groupFilter !== "all"
        ? groupFilter
        : "ทุกประเภทองค์กร";
    summaryCaptionEl.textContent = `แสดง ${activeRows.length} โครงการ • รออนุมัติ ${pendingCount} โครงการ • ${filterText}`;
  };

  const buildOrgSummaryRows = () => {
    const groupFilter = normalizeText(orgSummaryGroupEl.value) || "all";
    const orgFilter = normalizeText(orgSummaryOrgEl.value) || "all";
    const isGlobalView = groupFilter === "all" && orgFilter === "all";
    const orgGroupMap = getOrgGroupMap();
    const grouped = new Map();
    requestRows.forEach((item) => {
      if (normalizeText(item.requestType || "budget_approval") !== "budget_approval") return;
      const status = normalizeText(item.status || "pending").toLowerCase();
      const orgName = normalizeText(item.organizationName) || "-";
      const group = orgGroupMap.get(orgName) || normalizeText(item.organizationType);
      if (groupFilter !== "all" && group !== groupFilter) return;
      if (orgFilter !== "all" && orgName !== orgFilter) return;
      const key = isGlobalView ? (group || "ไม่ระบุประเภทองค์กร") : orgName;
      const row = grouped.get(key) || {
        organizationName: key,
        organizationType: group,
        summaryLevel: isGlobalView ? "group" : "organization",
        projects: 0,
        pending: 0,
        requested: 0,
        approved: 0
      };
      row.projects += 1;
      if (status === "pending") row.pending += 1;
      row.requested += Number(item.estimatedExpense || 0);
      row.approved += Number(item.approvedAmount || 0);
      grouped.set(key, row);
    });
    return Array.from(grouped.values()).map((row) => ({
      ...row,
      difference: row.requested - row.approved
    }));
  };

  const renderOrgSummaryChart = async () => {
    await window.sgcuVendorLoader?.ensureChart?.();
    const groupFilter = normalizeText(orgSummaryGroupEl.value) || "all";
    const orgFilter = normalizeText(orgSummaryOrgEl.value) || "all";
    const summaryUnit = groupFilter === "all" && orgFilter === "all" ? "ประเภทองค์กร" : "องค์กร";
    const allRows = buildOrgSummaryRows().sort((a, b) => b.requested - a.requested || b.approved - a.approved);
    const limit = 10;
    const visibleRows = allRows.slice(0, limit);
    const hiddenRows = allRows.slice(limit);
    const rows = visibleRows.slice();

    if (hiddenRows.length) {
      rows.push({
        organizationName: "อื่น ๆ",
        projects: hiddenRows.reduce((sum, row) => sum + row.projects, 0),
        pending: hiddenRows.reduce((sum, row) => sum + row.pending, 0),
        requested: hiddenRows.reduce((sum, row) => sum + row.requested, 0),
        approved: hiddenRows.reduce((sum, row) => sum + row.approved, 0)
      });
    }

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    orgSummaryCaptionEl.textContent = allRows.length
      ? `แสดง Top ${visibleRows.length}${hiddenRows.length ? ` + อื่น ๆ ${hiddenRows.length}` : ""} จาก ${allRows.length} ${summaryUnit}`
      : "ยังไม่มีข้อมูลคำขอ";

    if (!rows.length || typeof window.Chart !== "function") {
      return;
    }

    chartInstance = new window.Chart(chartCanvasEl.getContext("2d"), {
      type: "bar",
      data: {
        labels: rows.map((row) => row.organizationName),
        datasets: [
          {
            label: "ยอดที่ขอ",
            data: rows.map((row) => row.requested),
            backgroundColor: "#f472b6",
            borderRadius: { topRight: 8, bottomRight: 8 },
            borderSkipped: false
          },
          {
            label: "ยอดอนุมัติ",
            data: rows.map((row) => row.approved),
            backgroundColor: "#34d399",
            borderRadius: { topRight: 8, bottomRight: 8 },
            borderSkipped: false
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const row = rows[items?.[0]?.dataIndex || 0];
                return `โครงการ ${Number(row?.projects || 0).toLocaleString("th-TH")} รายการ`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              callback: (value) => Number(value || 0).toLocaleString("th-TH")
            }
          },
          y: {
            ticks: {
              autoSkip: false
            }
          }
        }
      }
    });
  };

  const renderRows = () => {
    if (!requestRows.length) {
      tableBodyEl.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#6b7280;">ยังไม่มีรายการคำของบ</td></tr>';
      updateSummary();
      void renderOrgSummaryChart();
      return;
    }

    const rows = getReviewFilteredRows();
    if (!rows.length) {
      tableBodyEl.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#6b7280;">ไม่พบรายการตามตัวกรอง</td></tr>';
      updateSummary();
      void renderOrgSummaryChart();
      return;
    }

    tableBodyEl.innerHTML = sortForDisplay(rows).map((item) => {
      const id = escapeHtml(item.id || "");
      const orgName = escapeHtml(item.organizationName || "-");
      const requested = Number(item.estimatedExpense || 0);
      const approved = Number(item.approvedAmount || 0);
      const status = normalizeText(item.status || "pending").toLowerCase();
      const approvedText = status === "pending" && !approved ? "-" : formatMoney(approved);
      return `
        <tr class="budget-request-history-row budget-staff-request-row is-editable" data-budget-staff-edit-id="${id}" tabindex="0" title="คลิกเพื่อแก้ไขรายการ">
          <td class="col-code" data-label="รหัสโครงการ"><code class="budget-request-project-code">${escapeHtml(item.projectCodeGenerated || "-")}</code></td>
          <td class="col-project" data-label="รายการโครงการ">
            <div class="budget-request-history-project-name budget-staff-project-name">${escapeHtml(item.projectName || "-")}</div>
            <div class="section-text-sm budget-request-history-project-meta budget-staff-project-meta">
              <span class="budget-staff-org-name">${orgName}</span>
            </div>
          </td>
          <td class="col-money" data-label="ยอดขอ">${formatMoney(requested)}</td>
          <td class="col-money" data-label="ยอดอนุมัติ">${approvedText}</td>
          <td class="col-status" data-label="สถานะ">${statusBadge(item.status)}</td>
        </tr>
      `;
    }).join("");

    updateSummary();
    void renderOrgSummaryChart();
  };

  const subscribeRequests = () => {
    if (typeof unsubscribeRequests === "function") {
      try { unsubscribeRequests(); } catch (_) {}
      unsubscribeRequests = null;
    }

    const firestore = getFirestore();
    const canRead = !!(firestore.db && firestore.collection && firestore.query && firestore.orderBy && firestore.onSnapshot);
    if (!canRead) {
      tableBodyEl.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#6b7280;">ระบบฐานข้อมูลยังไม่พร้อมใช้งาน</td></tr>';
      return;
    }

    const listQuery = firestore.query(
      firestore.collection(firestore.db, COLLECTION_REQUESTS),
      firestore.orderBy("createdAt", "desc")
    );

    unsubscribeRequests = firestore.onSnapshot(listQuery, (snapshot) => {
      const rows = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        if (normalizeText(data.requestType || "budget_approval") !== "budget_approval") return;
        rows.push({ id: docSnap.id, ...data });
      });
      requestRows = rows;
      void refreshOrgSummaryFilters();
      renderRows();
    }, () => {
      tableBodyEl.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#b91c1c;">โหลดรายการไม่สำเร็จ</td></tr>';
    });
  };

  const loadDeadline = async () => {
    const firestore = getFirestore();
    const canRead = !!(firestore.db && firestore.doc && firestore.getDoc);
    if (!canRead) {
      setMessage(deadlineStatusEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }
    try {
      const snap = await firestore.getDoc(firestore.doc(firestore.db, COLLECTION_SETTINGS, SETTINGS_DOC_ID));
      const data = snap.exists() ? (snap.data() || {}) : {};
      const deadline = toDateOnlyText(data.budgetRequestDeadline || "");
      budgetCeiling = readMoneyInput(data.budgetCeiling);
      if (!Number.isFinite(budgetCeiling) || budgetCeiling < 0) budgetCeiling = 0;
      if (budgetCeiling <= 0) budgetCeiling = readLocalBudgetCeiling();
      budgetGroupCeilings = normalizeBudgetGroupCeilings(data.budgetGroupCeilings);
      if (!Object.keys(budgetGroupCeilings).length) budgetGroupCeilings = readLocalBudgetGroupCeilings();
      deadlineInputEl.value = deadline;
      ceilingInputEl.value = budgetCeiling > 0 ? String(budgetCeiling) : "";
      renderBudgetGroupCeilingInputs();
      updateSummary();
      if (!deadline) {
        setMessage(deadlineStatusEl, "ยังไม่กำหนดเส้นตาย", "#6b7280");
      } else {
        const today = new Date();
        const end = new Date(`${deadline}T23:59:59`);
        const isOpen = today.getTime() <= end.getTime();
        setMessage(deadlineStatusEl, isOpen ? `เปิดรับถึง ${deadline}` : `หมดเขตรับคำขอแล้ว (${deadline})`, isOpen ? "#047857" : "#b91c1c");
      }
    } catch (_) {
      budgetCeiling = readLocalBudgetCeiling();
      budgetGroupCeilings = readLocalBudgetGroupCeilings();
      ceilingInputEl.value = budgetCeiling > 0 ? String(budgetCeiling) : "";
      renderBudgetGroupCeilingInputs();
      updateSummary();
      setMessage(deadlineStatusEl, "โหลดการตั้งค่าไม่สำเร็จ", "#b91c1c");
    }
  };

  const saveDeadline = async () => {
    const firestore = getFirestore();
    const canWrite = !!(firestore.db && firestore.doc && firestore.setDoc && firestore.serverTimestamp);
    if (!canWrite) {
      setMessage(actionMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }
    const deadline = toDateOnlyText(deadlineInputEl.value);
    if (!deadline) {
      setMessage(actionMessageEl, "กรุณาเลือกวันสิ้นสุดการเปิดรับ", "#b91c1c");
      return;
    }
    const ceiling = readMoneyInput(ceilingInputEl.value);
    if (!Number.isFinite(ceiling) || ceiling < 0) {
      setMessage(actionMessageEl, "เพดานงบประมาณต้องเป็นตัวเลขที่ไม่ติดลบ", "#b91c1c");
      ceilingInputEl.focus();
      return;
    }
    const groupCeilingsResult = readBudgetGroupCeilingsFromInputs();
    if (!groupCeilingsResult.ok) {
      setMessage(actionMessageEl, groupCeilingsResult.message, "#b91c1c");
      return;
    }
    const groupCeilings = groupCeilingsResult.value;
    const groupTotalValidation = validateBudgetGroupCeilingTotal(groupCeilings, ceiling);
    if (!groupTotalValidation.ok) {
      setMessage(actionMessageEl, groupTotalValidation.message, "#b91c1c");
      return;
    }
    setMessage(actionMessageEl, "กำลังบันทึกการตั้งค่า...", "#1d4ed8");
    try {
      await firestore.setDoc(
        firestore.doc(firestore.db, COLLECTION_SETTINGS, SETTINGS_DOC_ID),
        {
          budgetRequestDeadline: deadline,
          budgetCeiling: ceiling,
          budgetGroupCeilings: groupCeilings,
          updatedAt: firestore.serverTimestamp()
        },
        { merge: true }
      );
      budgetCeiling = ceiling;
      budgetGroupCeilings = groupCeilings;
      writeLocalBudgetCeiling(ceiling);
      writeLocalBudgetGroupCeilings(groupCeilings);
      updateSummary();
      setMessage(actionMessageEl, "บันทึกการตั้งค่าเรียบร้อย", "#047857");
      await loadDeadline();
    } catch (error) {
      try {
        await firestore.setDoc(
          firestore.doc(firestore.db, COLLECTION_SETTINGS, SETTINGS_DOC_ID),
          {
            budgetRequestDeadline: deadline,
            updatedAt: firestore.serverTimestamp()
          },
          { merge: true }
        );
        budgetCeiling = ceiling;
        budgetGroupCeilings = groupCeilings;
        writeLocalBudgetCeiling(ceiling);
        writeLocalBudgetGroupCeilings(groupCeilings);
        updateSummary();
        const code = normalizeText(error?.code);
        const detail = code ? ` (${code})` : "";
        setMessage(actionMessageEl, `บันทึกเส้นตายแล้ว แต่เพดานงบบันทึกเฉพาะเครื่องนี้${detail}`, "#b45309");
        await loadDeadline();
      } catch (fallbackError) {
        budgetCeiling = ceiling;
        budgetGroupCeilings = groupCeilings;
        writeLocalBudgetCeiling(ceiling);
        writeLocalBudgetGroupCeilings(groupCeilings);
        updateSummary();
        const code = normalizeText(fallbackError?.code || error?.code);
        const detail = code ? ` (${code})` : "";
        setMessage(actionMessageEl, `บันทึกเพดานงบเฉพาะเครื่องนี้แล้ว แต่บันทึกเส้นตายไม่สำเร็จ${detail}`, "#b45309");
      }
    }
  };

  const getOrgCodeMap = async () => {
    if (typeof loadOrgFilters === "function") {
      try { await loadOrgFilters(); } catch (_) {}
    }
    const rows =
      typeof orgFilters !== "undefined" && Array.isArray(orgFilters)
        ? orgFilters
        : Array.isArray(globalThis.orgFilters)
          ? globalThis.orgFilters
          : [];
    const map = new Map();
    rows.forEach((item) => {
      const name = normalizeText(item?.name);
      const code = normalizeText(item?.code).toUpperCase();
      if (name && code) map.set(name, code);
    });
    return map;
  };

  const runProjectCodes = async () => {
    const firestore = getFirestore();
    const canWrite = !!(firestore.db && firestore.doc && firestore.updateDoc && firestore.serverTimestamp);
    if (!canWrite) {
      setMessage(actionMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }

    setMessage(actionMessageEl, "กำลังรันรหัสโครงการ...", "#1d4ed8");
    setCodeActionBusy(true);
    try {
      const orgCodeMap = await getOrgCodeMap();
      const byOrg = new Map();
      requestRows.forEach((row) => {
        const status = normalizeText(row.status || "pending").toLowerCase();
        if (status === "cancelled" || status === "rejected") return;
        const orgName = normalizeText(row.organizationName);
        if (!orgName) return;
        const list = byOrg.get(orgName) || [];
        list.push(row);
        byOrg.set(orgName, list);
      });

      const updates = [];
      byOrg.forEach((rows, orgName) => {
        const code = orgCodeMap.get(orgName) || "ORG";
        rows
          .sort((a, b) => {
            const da = getDateOnlyTime(a.operationEndDate);
            const db = getDateOnlyTime(b.operationEndDate);
            if (da !== db) return da - db;
            const sa = getDateOnlyTime(a.prepStartDate, Number.POSITIVE_INFINITY);
            const sb = getDateOnlyTime(b.prepStartDate, Number.POSITIVE_INFINITY);
            if (sa !== sb) return sa - sb;
            return getCreatedAtTime(a) - getCreatedAtTime(b);
          })
          .forEach((row, index) => {
            const sequence = String(index + 1).padStart(3, "0");
            const generated = `${code}.${sequence}`;
            if (normalizeText(row.projectCodeGenerated) === generated) return;
            updates.push({ id: row.id, code: generated });
          });
      });

      for (const item of updates) {
        await firestore.updateDoc(
          firestore.doc(firestore.db, COLLECTION_REQUESTS, item.id),
          {
            projectCodeGenerated: item.code,
            updatedAt: firestore.serverTimestamp()
          }
        );
      }

      setMessage(actionMessageEl, `รันรหัสโครงการสำเร็จ ${updates.length} รายการ`, "#047857");
    } catch (error) {
      console.error("run budget project code failed - app.budget-staff.js", error);
      setMessage(actionMessageEl, "รันรหัสโครงการไม่สำเร็จ", "#b91c1c");
    } finally {
      setCodeActionBusy(false);
    }
  };

  const clearProjectCodes = async () => {
    const firestore = getFirestore();
    const canWrite = !!(firestore.db && firestore.doc && firestore.updateDoc && firestore.serverTimestamp);
    if (!canWrite) {
      setMessage(actionMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }

    const rowsToClear = requestRows.filter((row) => normalizeText(row.projectCodeGenerated));
    if (!rowsToClear.length) {
      setMessage(actionMessageEl, "ยังไม่มีรหัสโครงการที่ต้องยกเลิก", "#6b7280");
      return;
    }

    const ok = window.confirm(`ยืนยันยกเลิกรหัสโครงการที่รันแล้ว ${rowsToClear.length} รายการ ?`);
    if (!ok) return;

    setMessage(actionMessageEl, "กำลังยกเลิกรหัสโครงการ...", "#1d4ed8");
    setCodeActionBusy(true);
    try {
      for (const row of rowsToClear) {
        await firestore.updateDoc(
          firestore.doc(firestore.db, COLLECTION_REQUESTS, row.id),
          {
            projectCodeGenerated: "",
            projectCodeClearedAt: firestore.serverTimestamp(),
            updatedAt: firestore.serverTimestamp()
          }
        );
      }
      setMessage(actionMessageEl, `ยกเลิกรหัสโครงการสำเร็จ ${rowsToClear.length} รายการ`, "#047857");
    } catch (error) {
      console.error("clear budget project code failed - app.budget-staff.js", error);
      setMessage(actionMessageEl, "ยกเลิกรหัสโครงการไม่สำเร็จ", "#b91c1c");
    } finally {
      setCodeActionBusy(false);
    }
  };

  const fillFormForEdit = (row) => {
    if (!row) return;
    orgTypeInputEl.value = normalizeText(row.organizationType);
    orgNameInputEl.value = normalizeText(row.organizationName);
    projectNameInputEl.value = normalizeText(row.projectName);
    activityLocationInputEl.value = normalizeText(row.activityLocation);
    prepStartDateInputEl.value = toDateOnlyText(row.prepStartDate);
    operationEndDateInputEl.value = toDateOnlyText(row.operationEndDate);
    studentOperatorsInputEl.value = Number(row.studentOperators || 0).toString();
    studentParticipantsInputEl.value = Number(row.studentParticipants || 0).toString();
    requestedAmountInputEl.value = Number(row.estimatedExpense || 0).toString();
    approvedAmountInputEl.value = Number(row.approvedAmount || 0).toString();
    statusInputEl.value = normalizeText(row.status || "pending").toLowerCase() || "pending";
    descriptionInputEl.value = normalizeText(row.description);
    setFormMode(row.id);
    setMessage(formMessageEl, "กำลังแก้ไขรายการ", "#1d4ed8");
    formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveForm = async (event) => {
    event.preventDefault();
    setMessage(formMessageEl, "");

    if (!validateForm()) return;

    const firestore = getFirestore();
    const canWrite = !!(firestore.db && firestore.collection && firestore.doc && firestore.addDoc && firestore.updateDoc && firestore.serverTimestamp);
    if (!canWrite) {
      setMessage(formMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }

    const payload = readFormPayload();
    const isEdit = !!editingId;

    try {
      saveBtnEl.disabled = true;
      if (isEdit) {
        await firestore.updateDoc(
          firestore.doc(firestore.db, COLLECTION_REQUESTS, editingId),
          {
            ...payload,
            updatedAt: firestore.serverTimestamp()
          }
        );
        setMessage(formMessageEl, "บันทึกการแก้ไขเรียบร้อย", "#047857");
      } else {
        await firestore.addDoc(
          firestore.collection(firestore.db, COLLECTION_REQUESTS),
          {
            requestType: "budget_approval",
            ...payload,
            projectCodeGenerated: "",
            requester: {
              email: "staff-manual@system",
              displayName: "Staff Manual"
            },
            createdAt: firestore.serverTimestamp(),
            updatedAt: firestore.serverTimestamp()
          }
        );
        setMessage(formMessageEl, "เพิ่มรายการเรียบร้อย", "#047857");
      }
      resetForm();
    } catch (error) {
      console.error("save budget staff request failed - app.budget-staff.js", error);
      setMessage(formMessageEl, "บันทึกรายการไม่สำเร็จ", "#b91c1c");
    } finally {
      saveBtnEl.disabled = false;
    }
  };

  const cancelRow = async (id) => {
    const firestore = getFirestore();
    const canWrite = !!(firestore.db && firestore.doc && firestore.updateDoc && firestore.serverTimestamp);
    if (!canWrite) {
      setMessage(actionMessageEl, "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b91c1c");
      return;
    }

    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, COLLECTION_REQUESTS, id),
        {
          status: "cancelled",
          updatedAt: firestore.serverTimestamp(),
          cancelledAt: firestore.serverTimestamp()
        }
      );
      setMessage(actionMessageEl, "ลดรายการเรียบร้อย", "#047857");
    } catch (error) {
      console.error("cancel budget request failed - app.budget-staff.js", error);
      setMessage(actionMessageEl, "ลดรายการไม่สำเร็จ", "#b91c1c");
    }
  };

  tableBodyEl.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) return;

    const editRow = target.closest("[data-budget-staff-edit-id]");
    if (!editRow) return;
    const id = normalizeText(editRow.getAttribute("data-budget-staff-edit-id"));
    const row = requestRows.find((item) => item.id === id);
    if (!row) return;
    fillFormForEdit(row);
  });

  tableBodyEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const editRow = target?.closest("[data-budget-staff-edit-id]");
    if (!editRow) return;
    event.preventDefault();
    const id = normalizeText(editRow.getAttribute("data-budget-staff-edit-id"));
    const row = requestRows.find((item) => item.id === id);
    if (!row) return;
    fillFormForEdit(row);
  });

  cancelEditBtnEl.addEventListener("click", resetForm);
  formEl.addEventListener("submit", saveForm);
  deadlineSaveBtnEl.addEventListener("click", () => { void saveDeadline(); });
  runCodeBtnEl.addEventListener("click", () => { void runProjectCodes(); });
  clearCodeBtnEl.addEventListener("click", () => { void clearProjectCodes(); });
  groupCeilingToggleBtnEl.addEventListener("click", () => {
    isGroupCeilingOpen = !isGroupCeilingOpen;
    writeLocalGroupCeilingOpen(isGroupCeilingOpen);
    syncGroupCeilingVisibility();
  });
  ceilingInputEl.addEventListener("input", () => {
    const groupCeilingsResult = readBudgetGroupCeilingsFromInputs();
    if (groupCeilingsResult.ok) budgetGroupCeilings = groupCeilingsResult.value;
    const ceiling = readMoneyInput(ceilingInputEl.value);
    budgetCeiling = Number.isFinite(ceiling) && ceiling > 0 ? ceiling : 0;
    renderBudgetGroupCeilingInputs();
    updateSummary();
  });
  orgSummaryGroupEl.addEventListener("change", () => {
    populateOrgSummaryOrgOptions();
    updateSummary();
    void renderOrgSummaryChart();
  });
  orgSummaryOrgEl.addEventListener("change", () => {
    updateSummary();
    void renderOrgSummaryChart();
  });
  reviewGroupEl.addEventListener("change", () => {
    populateReviewOrgOptions();
    renderRows();
  });
  reviewOrgEl.addEventListener("change", renderRows);
  tabBtnEls.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveTab(btn.getAttribute("data-budget-staff-tab") || "overview");
    });
  });

  resetForm();
  isGroupCeilingOpen = readLocalGroupCeilingOpen();
  syncGroupCeilingVisibility();
  setActiveTab("overview");
  void refreshOrgSummaryFilters();
  subscribeRequests();
  void loadDeadline();

  window.addEventListener("beforeunload", () => {
    if (typeof unsubscribeRequests === "function") {
      try { unsubscribeRequests(); } catch (_) {}
      unsubscribeRequests = null;
    }
  });
})();
