/* Budget approval request form */
function initBudgetApprovalRequestPage() {
  if (window.__sgcuBudgetApprovalRequestInitialized) return;
  window.__sgcuBudgetApprovalRequestInitialized = true;

  const formEl = document.getElementById("budgetApprovalForm");
  const submitBtnEl = document.getElementById("budgetApprovalSubmitBtn");
  const cancelEditBtnEl = document.getElementById("budgetApprovalCancelEditBtn");
  const cancelRequestBtnEl = document.getElementById("budgetApprovalCancelRequestBtn");
  const messageEl = document.getElementById("budgetApprovalMessage");
  const myRequestsTableBodyEl = document.getElementById("budgetApprovalMyRequestsTableBody");
  const myRequestsCaptionEl = document.getElementById("budgetApprovalListCaption");
  const exportCsvBtnEl = document.getElementById("budgetApprovalExportCsvBtn");
  const orgTypeEl = document.getElementById("budgetOrgType");
  const orgDeptEl = document.getElementById("budgetOrgDept");
  const orgTypeDisplayEl = document.getElementById("budgetOrgTypeDisplay");
  const orgDeptDisplayEl = document.getElementById("budgetOrgDeptDisplay");
  const orgSummaryProjectCountEl = document.getElementById("budgetOrgSummaryProjectCount");
  const orgSummaryTotalExpenseEl = document.getElementById("budgetOrgSummaryTotalExpense");
  const orgSummaryApprovedExpenseEl = document.getElementById("budgetOrgSummaryApprovedExpense");
  const orgSummaryCaptionEl = document.getElementById("budgetOrgSummaryCaption");
  const requestDeadlineDisplayEl = document.getElementById("budgetRequestDeadlineDisplay");
  const requestDeadlineCaptionEl = document.getElementById("budgetRequestDeadlineCaption");
  const requestRoundDisplayEl = document.getElementById("budgetRequestRoundDisplay");
  const requestRoundCaptionEl = document.getElementById("budgetRequestRoundCaption");
  const requestRoundSelectEl = document.getElementById("budgetRequestRoundSelect");
  const projectNameEl = document.getElementById("budgetProjectName");
  const descriptionEl = document.getElementById("budgetProjectDescription");
  const locationEl = document.getElementById("budgetActivityLocation");
  const prepStartDateEl = document.getElementById("budgetPrepStartDate");
  const operationEndDateEl = document.getElementById("budgetOperationEndDate");
  const studentOperatorsEl = document.getElementById("budgetStudentOperators");
  const studentParticipantsEl = document.getElementById("budgetStudentParticipants");
  const estimatedExpenseEl = document.getElementById("budgetEstimatedExpense");
  const descriptionCounterEl = document.getElementById("budgetProjectDescriptionCounter");
  const representativeApplyBtnEl = document.getElementById("budgetRepresentativeApplyBtn");
  const representativeStatusCaptionEl = document.getElementById("budgetRepresentativeStatusCaption");
  const representativeMessageEl = document.getElementById("budgetRepresentativeMessage");
  const representativeApplicationsBodyEl = document.getElementById("budgetRepresentativeMyApplicationsBody");
  const representativeModalEl = document.getElementById("budgetRepresentativeApplicationModal");
  const representativeModalCloseEl = document.getElementById("budgetRepresentativeApplicationClose");
  const representativeCancelBtnEl = document.getElementById("budgetRepresentativeCancelBtn");
  const representativeFormEl = document.getElementById("budgetRepresentativeApplicationForm");
  const representativeOrgTypeEl = document.getElementById("budgetRepresentativeOrgType");
  const representativeOrgDeptEl = document.getElementById("budgetRepresentativeOrgDept");
  const representativeRoleEl = document.getElementById("budgetRepresentativeRole");
  const representativeRoleOtherEl = document.getElementById("budgetRepresentativeRoleOther");
  const representativeEvidenceEl = document.getElementById("budgetRepresentativeEvidence");
  const representativeSubmitBtnEl = document.getElementById("budgetRepresentativeSubmitBtn");
  const representativeApplicationMessageEl = document.getElementById("budgetRepresentativeApplicationMessage");

  if (
    !formEl ||
    !submitBtnEl ||
    !messageEl ||
    !myRequestsTableBodyEl ||
    !myRequestsCaptionEl ||
    !orgTypeEl ||
    !orgDeptEl ||
    !projectNameEl ||
    !descriptionEl ||
    !locationEl ||
    !prepStartDateEl ||
    !operationEndDateEl ||
    !studentOperatorsEl ||
    !studentParticipantsEl ||
    !estimatedExpenseEl ||
    !requestRoundSelectEl
  ) {
    return;
  }

  const LOGIN_PROFILE_STORAGE_KEY = "sgcu_user_profile_by_email_v1";
  const LEGACY_LOGIN_PROFILE_STORAGE_KEY = "sgcu_borrow_profile_by_email_v1";
  const appConfig = typeof SGCU_APP_CONFIG === "object" && SGCU_APP_CONFIG ? SGCU_APP_CONFIG : {};
  const firestoreCollections = appConfig.firestore?.collections || {};
  const firestoreDocs = appConfig.firestore?.docs || {};
  const REQUEST_COLLECTION = firestoreCollections.budgetApprovalRequests || "budgetApprovalRequests";
  const REPRESENTATIVE_APPLICATION_COLLECTION =
    firestoreCollections.organizationRepresentativeApplications || "organizationRepresentativeApplications";
  const SETTINGS_COLLECTION = firestoreCollections.budgetApprovalSettings || "budgetApprovalSettings";
  const SETTINGS_DOC_ID = firestoreDocs.budgetApprovalSettings || "global";
  let unsubscribeMyRequests = null;
  let unsubscribeRepresentativeApplications = null;
  let unsubscribeBudgetSettings = null;
  let currentRepresentativeApplications = [];
  let currentApprovedRepresentatives = [];
  let representativeApplicationsLoaded = false;
  let editingRequestId = "";
  let latestMyBudgetRequests = [];
  let latestBudgetRequestRows = [];
  let budgetRequestDeadline = "";
  let isBudgetRequestClosed = false;
  let budgetRoundYear = "";
  let budgetRoundNo = "";
  let currentBudgetRoundId = "";
  let activeBudgetRounds = [];

  if (representativeModalEl && representativeModalEl.parentElement !== document.body) {
    document.body.appendChild(representativeModalEl);
  }

  const collectBudgetOrgTypeOptions = () => {
    const fromFilters =
      typeof orgFilters !== "undefined" && Array.isArray(orgFilters)
        ? orgFilters.map((item) => (item?.group || "").toString().trim())
        : [];
    const fromProjects =
      typeof projects !== "undefined" && Array.isArray(projects)
        ? projects.map((item) => (item?.orgGroup || "").toString().trim())
        : [];
    return Array.from(new Set([...fromFilters, ...fromProjects].filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "th"));
  };

  const collectBudgetOrgNameOptions = (orgType) => {
    const selectedType = (orgType || "").toString().trim();
    if (!selectedType) return [];
    const fromFilters =
      typeof orgFilters !== "undefined" && Array.isArray(orgFilters)
        ? orgFilters
          .filter((item) => (item?.group || "").toString().trim() === selectedType)
          .map((item) => (item?.name || "").toString().trim())
        : [];
    const fromProjects =
      typeof projects !== "undefined" && Array.isArray(projects)
        ? projects
          .filter((item) => (item?.orgGroup || "").toString().trim() === selectedType)
          .map((item) => (item?.orgName || "").toString().trim())
        : [];
    return Array.from(new Set([...fromFilters, ...fromProjects].filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "th"));
  };

  const normalizeOrgText = (value) => (value || "").toString().trim();

  const normalizePositiveIntegerText = (value) => {
    const num = Number((value || "").toString().trim());
    return Number.isInteger(num) && num > 0 ? String(num) : "";
  };

  const normalizeRoundName = (value) => (value || "").toString().trim().replace(/\s+/g, " ");

  const buildBudgetRoundId = (year, roundNo) => {
    const y = normalizePositiveIntegerText(year);
    const r = normalizeRoundName(roundNo);
    return y && r ? `${y}-${r}` : "";
  };

  const formatBudgetRoundLabel = (year, roundNo) => {
    const y = normalizePositiveIntegerText(year);
    const r = normalizeRoundName(roundNo);
    return y && r ? `ปี ${y} รอบ ${r}` : "";
  };

  const getRequestRoundId = (item) => (item?.budgetRoundId || item?.currentBudgetRoundId || "").toString().trim();

  const getRequestRoundLabel = (item) => {
    const label = formatBudgetRoundLabel(item?.budgetRoundYear, item?.budgetRoundNo);
    return label || (getRequestRoundId(item) ? getRequestRoundId(item) : "ไม่ระบุรอบ");
  };

  const isCurrentBudgetRoundItem = (item) => {
    if (!currentBudgetRoundId) return true;
    return getRequestRoundId(item) === currentBudgetRoundId;
  };

  const normalizeBudgetActiveRounds = (value, fallback = {}) => {
    const rows = (Array.isArray(value) ? value : [])
      .map((item) => {
        const year = normalizePositiveIntegerText(item?.year || item?.budgetRoundYear);
        const roundNo = normalizeRoundName(item?.roundNo || item?.budgetRoundNo);
        const deadline = (item?.deadline || item?.budgetRequestDeadline || "").toString().trim().slice(0, 10);
        const id = (item?.id || buildBudgetRoundId(year, roundNo)).toString().trim();
        if (!id || !year || !roundNo || !deadline) return null;
        return { id, year, roundNo, deadline, label: formatBudgetRoundLabel(year, roundNo) };
      })
      .filter(Boolean);
    if (rows.length) return rows;
    const year = normalizePositiveIntegerText(fallback.budgetRoundYear);
    const roundNo = normalizeRoundName(fallback.budgetRoundNo);
    const deadline = (fallback.budgetRequestDeadline || "").toString().trim().slice(0, 10);
    const id = (fallback.currentBudgetRoundId || buildBudgetRoundId(year, roundNo)).toString().trim();
    return id && year && roundNo && deadline
      ? [{ id, year, roundNo, deadline, label: formatBudgetRoundLabel(year, roundNo) }]
      : [];
  };

  const getOpenBudgetRounds = () => activeBudgetRounds.filter((round) => {
    const endTime = new Date(`${round.deadline}T23:59:59`).getTime();
    return Number.isFinite(endTime) && Date.now() <= endTime;
  });

  const findActiveRoundById = (id = "") => activeBudgetRounds.find((round) => round.id === id);

  const isRequestRoundOpen = (item) => {
    const round = findActiveRoundById(getRequestRoundId(item));
    if (!round) return false;
    const endTime = new Date(`${round.deadline}T23:59:59`).getTime();
    return Number.isFinite(endTime) && Date.now() <= endTime;
  };

  const getApprovedRepresentativeOptions = () => {
    return Array.isArray(currentApprovedRepresentatives)
      ? currentApprovedRepresentatives
        .map((item) => ({
          id: (item.id || "").toString(),
          organizationType: normalizeOrgText(item.organizationType),
          organizationName: normalizeOrgText(item.organizationName),
          representativeRole: normalizeOrgText(item.representativeRole)
        }))
        .filter((item) => item.organizationType && item.organizationName)
      : [];
  };

  const findApprovedRepresentativeForOrg = (orgType, orgName) => {
    const type = normalizeOrgText(orgType);
    const name = normalizeOrgText(orgName);
    if (!type || !name) return null;
    return getApprovedRepresentativeOptions().find((item) =>
      item.organizationType === type && item.organizationName === name
    ) || null;
  };

  const hasApprovedRepresentativeForRequest = (item) => {
    return !!findApprovedRepresentativeForOrg(item?.organizationType, item?.organizationName);
  };

  const getPrimaryApprovedRepresentative = () => {
    const options = getApprovedRepresentativeOptions();
    if (!options.length) return null;
    // Snapshot query is ordered by createdAt desc, so the first approved item is the latest effective representative.
    return options[0];
  };

  const hasApprovedRepresentativeApplication = () => {
    return Array.isArray(currentRepresentativeApplications) &&
      currentRepresentativeApplications.some((item) =>
        (item.status || "").toString().trim().toLowerCase() === "approved"
      );
  };

  const setDisplayText = (el, value) => {
    if (!el) return;
    const text = (value || "").toString().trim();
    el.textContent = text || "ยังไม่มีสิทธิ์ตัวแทนที่อนุมัติ";
    el.classList.toggle("is-empty", !text);
  };

  const toBudgetAmount = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
  };

  const updateBudgetOrgSummary = () => {
    const representative = getPrimaryApprovedRepresentative();
    const orgType = normalizeOrgText(representative?.organizationType);
    const orgName = normalizeOrgText(representative?.organizationName);
    const rows = Array.isArray(latestMyBudgetRequests) ? latestMyBudgetRequests : [];
    const matchedRows = orgType && orgName
      ? rows.filter((item) =>
        normalizeOrgText(item.organizationType) === orgType &&
        normalizeOrgText(item.organizationName) === orgName
      )
      : [];
    const totalExpense = matchedRows.reduce((sum, item) => sum + toBudgetAmount(item.estimatedExpense), 0);
    const approvedExpense = matchedRows.reduce((sum, item) => sum + toBudgetAmount(item.approvedAmount), 0);
    if (orgSummaryProjectCountEl) orgSummaryProjectCountEl.textContent = String(matchedRows.length);
    if (orgSummaryTotalExpenseEl) orgSummaryTotalExpenseEl.textContent = `${formatCurrency(totalExpense)} บาท`;
    if (orgSummaryApprovedExpenseEl) orgSummaryApprovedExpenseEl.textContent = `${formatCurrency(approvedExpense)} บาท`;
    if (orgSummaryCaptionEl) {
      orgSummaryCaptionEl.textContent = orgType && orgName
        ? `สรุปรายการของ ${orgName} / ${orgType} ตามสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว`
        : "ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว";
    }
  };

  const syncBudgetOrgDisplay = () => {
    const representative = getPrimaryApprovedRepresentative();
    setDisplayText(orgTypeDisplayEl, representative?.organizationType || "");
    setDisplayText(orgDeptDisplayEl, representative?.organizationName || "");
    updateBudgetOrgSummary();
    if (!isBudgetRequestClosed && representativeApplicationsLoaded) {
      setFormEnabled(!!representative);
      if (!representative) {
        setFormMessage("ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว จึงไม่สามารถดู แก้ไข ลดรายการ หรือเพิ่มคำของบขององค์กรได้", "#b91c1c");
      }
    }
  };

  const populateBudgetOrgTypeOptions = () => {
    const previousValue = orgTypeEl.value;
    while (orgTypeEl.options.length) {
      orgTypeEl.remove(0);
    }
    const representativeOptions = getApprovedRepresentativeOptions();
    const primaryRepresentative = getPrimaryApprovedRepresentative();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = representativeOptions.length
      ? "ระบบล็อกตามสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว"
      : "ยังไม่มีองค์กรที่ได้รับอนุมัติให้เป็นตัวแทน";
    placeholder.disabled = true;
    placeholder.selected = true;
    orgTypeEl.appendChild(placeholder);

    if (primaryRepresentative?.organizationType) {
      const option = document.createElement("option");
      option.value = primaryRepresentative.organizationType;
      option.textContent = primaryRepresentative.organizationType;
      orgTypeEl.appendChild(option);
      orgTypeEl.value = primaryRepresentative.organizationType;
    } else if (previousValue) {
      const hasCurrent = Array.from(orgTypeEl.options).some((opt) => opt.value === previousValue);
      if (hasCurrent) orgTypeEl.value = previousValue;
    }
    orgTypeEl.disabled = true;
    syncBudgetOrgDisplay();
  };

  const populateBudgetOrgDeptOptions = () => {
    const currentValue = orgDeptEl.value;
    const primaryRepresentative = getPrimaryApprovedRepresentative();
    const selectedType = primaryRepresentative?.organizationType || "";

    while (orgDeptEl.options.length) {
      orgDeptEl.remove(0);
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = selectedType ? "เลือกฝ่าย / ชมรม" : "เลือกประเภทองค์กรก่อน";
    orgDeptEl.appendChild(placeholder);

    if (selectedType) {
      const organizationName = (primaryRepresentative?.organizationName || "").toString().trim();
      if (organizationName) {
        const option = document.createElement("option");
        option.value = organizationName;
        option.textContent = organizationName;
        orgDeptEl.appendChild(option);
        orgDeptEl.value = organizationName;
      } else if (currentValue) {
        const hasCurrent = Array.from(orgDeptEl.options).some((opt) => opt.value === currentValue);
        if (hasCurrent) orgDeptEl.value = currentValue;
      }
    }
    orgDeptEl.disabled = true;
    syncBudgetOrgDisplay();
  };

  const getBudgetOrgTypeValueForSubmit = () => {
    return (orgTypeEl.value || "").toString().trim();
  };

  const getBudgetOrgDeptValueForSubmit = () => {
    return (orgDeptEl.value || "").toString().trim();
  };

  const ensureBudgetOrgOptionDataLoaded = async () => {
    if (typeof loadOrgFilters === "function") {
      try {
        await loadOrgFilters();
      } catch (_) {
        // ignore and fallback
      }
    }
    if (typeof ensureProjectDataLoaded === "function") {
      try {
        await ensureProjectDataLoaded();
      } catch (_) {
        // ignore and fallback
      }
    }
  };

  const setFormMessage = (text = "", color = "#374151") => {
    messageEl.textContent = text;
    messageEl.style.color = color;
  };

  const setBudgetRequestCloseState = (settings = "") => {
    const data = typeof settings === "object" && settings ? settings : { budgetRequestDeadline: settings };
    budgetRequestDeadline = (data.budgetRequestDeadline || "").toString().trim();
    budgetRoundYear = normalizePositiveIntegerText(data.budgetRoundYear);
    budgetRoundNo = normalizeRoundName(data.budgetRoundNo);
    currentBudgetRoundId = (data.currentBudgetRoundId || buildBudgetRoundId(budgetRoundYear, budgetRoundNo)).toString().trim();
    activeBudgetRounds = normalizeBudgetActiveRounds(data.budgetActiveRounds, data);
    const openRounds = getOpenBudgetRounds();
    const selectedRoundId = requestRoundSelectEl.value;
    requestRoundSelectEl.innerHTML = "";
    if (!openRounds.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "ยังไม่มีรอบที่เปิดรับ";
      opt.disabled = true;
      opt.selected = true;
      requestRoundSelectEl.appendChild(opt);
    } else {
      openRounds.forEach((round) => {
        const opt = document.createElement("option");
        opt.value = round.id;
        opt.textContent = `${round.label} (ถึง ${round.deadline})`;
        requestRoundSelectEl.appendChild(opt);
      });
      requestRoundSelectEl.value = openRounds.some((round) => round.id === selectedRoundId)
        ? selectedRoundId
        : openRounds[0].id;
    }
    const roundLabel = openRounds.length === 1
      ? openRounds[0].label
      : openRounds.length
        ? `เปิด ${openRounds.length} รอบ`
        : "";
    if (requestRoundDisplayEl) {
      requestRoundDisplayEl.textContent = roundLabel || "ยังไม่กำหนด";
      requestRoundDisplayEl.classList.toggle("is-empty", !roundLabel);
    }
    if (requestRoundCaptionEl) {
      requestRoundCaptionEl.textContent = roundLabel
        ? (openRounds.length > 1 ? "เลือกหนึ่งรอบในแบบฟอร์มก่อนส่งคำขอ" : `คำขอใหม่จะถูกบันทึกใน${roundLabel}`)
        : "ยังไม่กำหนดรอบรับคำขอ";
      requestRoundCaptionEl.style.color = roundLabel ? "#047857" : "#b45309";
    }
    if (requestDeadlineDisplayEl) {
      requestDeadlineDisplayEl.textContent = budgetRequestDeadline
        ? formatDateDisplay(budgetRequestDeadline)
        : "ยังไม่กำหนด";
      requestDeadlineDisplayEl.classList.toggle("is-empty", !budgetRequestDeadline);
    }
    isBudgetRequestClosed = !openRounds.length;
    if (!budgetRequestDeadline) {
      if (requestDeadlineCaptionEl) {
        requestDeadlineCaptionEl.textContent = openRounds.length
          ? `ยังเปิดรับคำของบอยู่ ${openRounds.length} รอบ`
          : "ยังไม่กำหนดรอบและวันสิ้นสุดการเปิดรับคำของบ";
        requestDeadlineCaptionEl.style.color = openRounds.length ? "#047857" : "#b45309";
      }
      return;
    }
    if (requestDeadlineCaptionEl) {
      requestDeadlineCaptionEl.textContent = isBudgetRequestClosed
        ? "หมดเขตรับคำของบแล้วทุกผลัด"
        : `ยังเปิดรับคำของบอยู่ ${openRounds.length} รอบ`;
      requestDeadlineCaptionEl.style.color = isBudgetRequestClosed ? "#b91c1c" : "#047857";
    }
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");

  const formatDateDisplay = (value) => {
    const dateText = (value || "").toString().trim();
    if (!dateText) return "-";
    const date = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateText;
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTimestampDisplay = (value) => {
    if (!value) return "-";
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const timestampMillis = (value) => {
    if (!value) return 0;
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
  };

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return "-";
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const updateBudgetDescriptionCounter = () => {
    if (descriptionCounterEl) {
      descriptionCounterEl.textContent = `${descriptionEl.value.length}/3000`;
    }
  };

  const statusBadgeHtml = (status) => {
    const normalized = (status || "pending").toString().trim().toLowerCase();
    if (normalized === "approved") {
      return '<span class="badge badge-approved">ผ่านที่ประชุมนายกหรืออนุกรรมการ</span>';
    }
    if (normalized === "rejected") {
      return '<span class="badge badge-rejected">ไม่อนุมัติ</span>';
    }
    if (normalized === "cancelled") {
      return '<span class="badge badge-warning">ยกเลิกหรือเลื่อนไปผ่านครั้งอื่น</span>';
    }
    return '<span class="badge badge-pending">รออนุมัติ</span>';
  };

  const representativeStatusBadgeHtml = (status) => {
    const normalized = (status || "pending").toString().trim().toLowerCase();
    if (normalized === "approved") {
      return '<span class="badge badge-approved">อนุมัติแล้ว</span>';
    }
    if (normalized === "rejected") {
      return '<span class="badge badge-rejected">ไม่อนุมัติ</span>';
    }
    if (normalized === "cancelled") {
      return '<span class="badge badge-warning">ยกเลิก</span>';
    }
    return '<span class="badge badge-pending">รออนุมัติ</span>';
  };

  const statusText = (status) => {
    const normalized = (status || "pending").toString().trim().toLowerCase();
    if (normalized === "approved") return "ผ่านที่ประชุมนายกหรืออนุกรรมการ";
    if (normalized === "rejected") return "ไม่อนุมัติ";
    if (normalized === "cancelled") return "ยกเลิกหรือเลื่อนไปผ่านครั้งอื่น";
    return "รออนุมัติ";
  };

  const exportMyBudgetRequestsCsv = () => {
    const rows = (Array.isArray(latestMyBudgetRequests) ? latestMyBudgetRequests : []).map((item) => ({
      "รหัสโครงการ": item.projectCodeGenerated || "",
      "รอบรับคำขอ": getRequestRoundLabel(item),
      "ประเภทองค์กร": item.organizationType || "",
      "ฝ่าย / ชมรม": item.organizationName || "",
      "ชื่อโครงการ": item.projectName || "",
      "สถานที่": item.activityLocation || "",
      "วันเริ่มเตรียมงาน": item.prepStartDate || "",
      "วันสุดท้ายปฏิบัติงาน": item.operationEndDate || "",
      "นิสิตผู้ปฏิบัติงาน": item.studentOperators || "",
      "นิสิตผู้เข้าร่วม": item.studentParticipants || "",
      "ยอดขอ": Number(item.estimatedExpense || 0),
      "ยอดอนุมัติ": Number(item.approvedAmount || 0),
      "สถานะ": statusText(item.status),
      "คำอธิบาย": item.projectDescription || item.description || ""
    }));
    window.sgcuCsvExport?.download({
      fileName: "budget-approval-requests",
      headers: [
        "รหัสโครงการ",
        "รอบรับคำขอ",
        "ประเภทองค์กร",
        "ฝ่าย / ชมรม",
        "ชื่อโครงการ",
        "สถานที่",
        "วันเริ่มเตรียมงาน",
        "วันสุดท้ายปฏิบัติงาน",
        "นิสิตผู้ปฏิบัติงาน",
        "นิสิตผู้เข้าร่วม",
        "ยอดขอ",
        "ยอดอนุมัติ",
        "สถานะ",
        "คำอธิบาย"
      ],
      rows
    });
  };

  const setRepresentativeMessage = (text = "", color = "#374151") => {
    if (!representativeMessageEl) return;
    representativeMessageEl.textContent = text;
    representativeMessageEl.style.color = color;
  };

  const setRepresentativeApplicationMessage = (text = "", color = "#374151") => {
    if (!representativeApplicationMessageEl) return;
    representativeApplicationMessageEl.textContent = text;
    representativeApplicationMessageEl.style.color = color;
  };

  const renderRepresentativeRows = (rows) => {
    if (!representativeApplicationsBodyEl) return;
    const items = Array.isArray(rows) ? rows : [];
    if (!items.length) {
      representativeApplicationsBodyEl.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; color:#6b7280;">ยังไม่มีคำขอสมัครเป็นตัวแทนองค์กร</td>
        </tr>
      `;
      if (representativeStatusCaptionEl) {
        representativeStatusCaptionEl.textContent = "ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว";
      }
      setRepresentativeMessage("สมัครเป็นตัวแทนองค์กรเพื่อให้ระบบผูกบัญชีกับชมรมหรือองค์กรก่อนยื่นคำขอ", "#6b7280");
      return;
    }

    representativeApplicationsBodyEl.innerHTML = items.map((item) => {
      const orgType = escapeHtml(item.organizationType || "-");
      const orgName = escapeHtml(item.organizationName || "-");
      const role = escapeHtml(item.representativeRole || "-");
      return `
        <tr>
          <td data-label="เวลายื่นคำขอ"><span class="budget-representative-history-value">${formatTimestampDisplay(item.createdAt)}</span></td>
          <td data-label="องค์กร"><span class="budget-representative-history-value">${orgName}<br><span class="section-text-sm">${orgType}</span></span></td>
          <td data-label="ตำแหน่ง"><span class="budget-representative-history-value">${role}</span></td>
          <td data-label="สถานะ"><span class="budget-representative-history-value">${representativeStatusBadgeHtml(item.status)}</span></td>
        </tr>
      `;
    }).join("");

    const approvedCount = items.filter((item) => (item.status || "").toString().trim().toLowerCase() === "approved").length;
    if (representativeStatusCaptionEl) {
      representativeStatusCaptionEl.textContent = approvedCount
        ? `มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว ${approvedCount} รายการ`
        : `มีคำขอรอพิจารณา ${items.filter((item) => (item.status || "pending").toString().trim().toLowerCase() === "pending").length} รายการ`;
    }
    setRepresentativeMessage(
      approvedCount
        ? "บัญชีนี้ได้รับอนุมัติเป็นตัวแทนองค์กรแล้ว จึงไม่สามารถสมัครเพิ่มได้"
        : "คำขอที่ยังไม่อนุมัติจะยังไม่ถูกใช้เป็นสิทธิ์หลักในแบบฟอร์มของบ",
      approvedCount ? "#047857" : "#6b7280"
    );
  };

  const populateRepresentativeOrgTypeOptions = () => {
    if (!representativeOrgTypeEl) return;
    const currentValue = representativeOrgTypeEl.value;
    while (representativeOrgTypeEl.options.length) {
      representativeOrgTypeEl.remove(0);
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "เลือกประเภทองค์กร";
    placeholder.disabled = true;
    placeholder.selected = true;
    representativeOrgTypeEl.appendChild(placeholder);

    collectBudgetOrgTypeOptions().forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      representativeOrgTypeEl.appendChild(option);
    });

    if (currentValue && Array.from(representativeOrgTypeEl.options).some((opt) => opt.value === currentValue)) {
      representativeOrgTypeEl.value = currentValue;
    }
  };

  const populateRepresentativeOrgDeptOptions = () => {
    if (!representativeOrgTypeEl || !representativeOrgDeptEl) return;
    const selectedType = normalizeOrgText(representativeOrgTypeEl.value);
    const currentValue = representativeOrgDeptEl.value;
    while (representativeOrgDeptEl.options.length) {
      representativeOrgDeptEl.remove(0);
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = selectedType ? "เลือกฝ่าย / ชมรม" : "เลือกประเภทองค์กรก่อน";
    representativeOrgDeptEl.appendChild(placeholder);

    if (selectedType) {
      collectBudgetOrgNameOptions(selectedType).forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        representativeOrgDeptEl.appendChild(option);
      });
    }
    representativeOrgDeptEl.disabled = !selectedType;
    if (currentValue && Array.from(representativeOrgDeptEl.options).some((opt) => opt.value === currentValue)) {
      representativeOrgDeptEl.value = currentValue;
    }
  };

  const openRepresentativeModal = () => {
    if (!representativeModalEl) return;
    populateRepresentativeOrgTypeOptions();
    populateRepresentativeOrgDeptOptions();
    if (!representativeApplicationsLoaded) {
      setRepresentativeApplicationMessage("กำลังตรวจสอบสิทธิ์ตัวแทนองค์กร กรุณารอสักครู่", "#b45309");
    } else if (hasApprovedRepresentativeApplication()) {
      setRepresentativeApplicationMessage("บัญชีนี้ได้รับอนุมัติเป็นตัวแทนองค์กรแล้ว หากส่งคำขอเพิ่มระบบจะไม่รับคำขอซ้ำ", "#b45309");
    } else {
      setRepresentativeApplicationMessage("");
    }
    void ensureBudgetOrgOptionDataLoaded().finally(() => {
      populateRepresentativeOrgTypeOptions();
      populateRepresentativeOrgDeptOptions();
    });
    if (typeof openDialog === "function") {
      openDialog(representativeModalEl, { focusSelector: "#budgetRepresentativeOrgType" });
      return;
    }
    representativeModalEl.classList.add("show");
    representativeModalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal");
  };

  const closeRepresentativeModal = () => {
    if (!representativeModalEl) return;
    if (typeof closeDialog === "function") {
      closeDialog(representativeModalEl);
      return;
    }
    representativeModalEl.classList.remove("show");
    representativeModalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-modal");
  };

  const readCurrentUserEmail = () =>
    (window.sgcuAuth?.auth?.currentUser?.email || "").toString().trim().toLowerCase();

  const renderMyRequestsRows = (rows) => {
    const sourceRows = Array.isArray(rows) ? rows : [];
    const representativeOptions = getApprovedRepresentativeOptions();
    const items = representativeOptions.length
      ? sourceRows.filter((item) => hasApprovedRepresentativeForRequest(item))
      : [];
    latestMyBudgetRequests = items;
    if (!representativeOptions.length) {
      myRequestsTableBodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:#6b7280;">ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว จึงยังไม่สามารถดูรายการคำของบขององค์กรได้</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = representativeApplicationsLoaded
        ? "ต้องมีสิทธิ์ตัวแทนองค์กรก่อน"
        : "กำลังตรวจสอบสิทธิ์ตัวแทนองค์กร...";
      updateBudgetOrgSummary();
      return;
    }
    if (!items.length) {
      myRequestsTableBodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:#6b7280;">ยังไม่มีรายการคำขออนุมัติงบประมาณ</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = "ยังไม่มีรายการ";
      updateBudgetOrgSummary();
      return;
    }

    myRequestsTableBodyEl.innerHTML = items.map((item) => {
      const orgName = escapeHtml(item.organizationName || "-");
      const projectName = escapeHtml(item.projectName || "-");
      const projectCode = escapeHtml(item.projectCodeGenerated || "-");
      const status = (item.status || "pending").toString().trim().toLowerCase();
      const requestedAmount = Number(item.estimatedExpense || 0);
      const approvedAmount = Number(item.approvedAmount || 0);
      const approvedText = status === "pending" && !approvedAmount ? "-" : formatCurrency(approvedAmount);
      const roundLabel = getRequestRoundLabel(item);
      const canEdit = status === "pending" && isRequestRoundOpen(item);
      const rowEditAttrs = canEdit
        ? ` data-budget-edit-id="${escapeHtml(item.id || "")}" tabindex="0" title="คลิกเพื่อแก้ไขรายการ"`
        : "";
      return `
        <tr class="budget-request-history-row${canEdit ? " is-editable" : ""}"${rowEditAttrs}>
          <td style="text-align:center;" data-label="รหัสโครงการ"><code class="budget-request-project-code">${projectCode}</code></td>
          <td style="text-align:left;" data-label="รายการโครงการ">
            <div class="budget-request-history-project-name">${projectName}</div>
            <div class="section-text-sm budget-request-history-project-meta">${orgName} • ${escapeHtml(roundLabel)}</div>
          </td>
          <td style="text-align:right;" data-label="ยอดขอ">${formatCurrency(requestedAmount)}</td>
          <td style="text-align:right;" data-label="ยอดอนุมัติ">${approvedText}</td>
          <td style="text-align:center;" data-label="สถานะ">${statusBadgeHtml(item.status)}</td>
        </tr>
      `;
    }).join("");
    myRequestsCaptionEl.textContent = `แสดง ${items.length} รายการ`;
    updateBudgetOrgSummary();
  };

  const subscribeMyRequests = () => {
    if (typeof unsubscribeMyRequests === "function") {
      try {
        unsubscribeMyRequests();
      } catch (_) {
        // ignore
      }
      unsubscribeMyRequests = null;
    }

    const email = readCurrentUserEmail();
    if (!email) {
      myRequestsTableBodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:#6b7280;">กรุณาเข้าสู่ระบบเพื่อดูรายการที่ขอไปทั้งหมด</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = "ต้องเข้าสู่ระบบก่อน";
      latestMyBudgetRequests = [];
      updateBudgetOrgSummary();
      return;
    }

    const firestore = window.sgcuFirestore || {};
    const canRead = !!(
      firestore.db &&
      firestore.collection &&
      firestore.onSnapshot &&
      firestore.query &&
      firestore.where
    );
    if (!canRead) {
      setBudgetRequestCloseState("");
      myRequestsTableBodyEl.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:#6b7280;">ระบบฐานข้อมูลยังไม่พร้อมใช้งาน</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = "ไม่สามารถโหลดรายการได้";
      latestMyBudgetRequests = [];
      updateBudgetOrgSummary();
      return;
    }

    myRequestsCaptionEl.textContent = "กำลังโหลดรายการ...";
    const listQuery = firestore.query(
      firestore.collection(firestore.db, REQUEST_COLLECTION),
      firestore.where("requester.email", "==", email)
    );
    unsubscribeMyRequests = firestore.onSnapshot(
      listQuery,
      (snapshot) => {
        const rows = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() || {};
          if ((data?.requestType || "budget_approval").toString().trim() !== "budget_approval") return;
          rows.push({
            id: docSnap.id,
            ...data
          });
        });
        latestBudgetRequestRows = rows.sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));
        renderMyRequestsRows(latestBudgetRequestRows);
      },
      () => {
        myRequestsTableBodyEl.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; color:#b91c1c;">ไม่สามารถโหลดรายการได้ กรุณาลองใหม่อีกครั้ง</td>
          </tr>
        `;
        myRequestsCaptionEl.textContent = "โหลดรายการไม่สำเร็จ";
        latestMyBudgetRequests = [];
        latestBudgetRequestRows = [];
      }
    );
  };

  const subscribeBudgetSettings = () => {
    if (typeof unsubscribeBudgetSettings === "function") {
      try {
        unsubscribeBudgetSettings();
      } catch (_) {
        // ignore
      }
      unsubscribeBudgetSettings = null;
    }

    const firestore = window.sgcuFirestore || {};
    const canRead = !!(
      firestore.db &&
      firestore.doc &&
      firestore.onSnapshot
    );
    if (!canRead) {
      setBudgetRequestCloseState("");
      return;
    }

    const docRef = firestore.doc(firestore.db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    unsubscribeBudgetSettings = firestore.onSnapshot(docRef, (snap) => {
      const data = snap?.exists?.() ? (snap.data() || {}) : {};
      setBudgetRequestCloseState(data);
      if (isBudgetRequestClosed) {
        setFormMessage(`หมดเขตรับคำของบแล้ว (${budgetRequestDeadline}) สามารถดูผลได้เท่านั้น`, "#b91c1c");
        setFormEnabled(false);
      } else if (!getOpenBudgetRounds().length) {
        setFormMessage("ยังไม่มีรอบรับคำของบที่เปิดอยู่ จึงยังไม่สามารถยื่นหรือแก้ไขคำขอได้", "#b45309");
        setFormEnabled(false);
      } else {
        const hasRepresentative = !!getPrimaryApprovedRepresentative();
        setFormEnabled(hasRepresentative);
        if (!hasRepresentative && representativeApplicationsLoaded) {
          setFormMessage("ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว จึงไม่สามารถดู แก้ไข ลดรายการ หรือเพิ่มคำของบขององค์กรได้", "#b91c1c");
        }
      }
      renderMyRequestsRows(latestBudgetRequestRows);
    });
  };

  const subscribeRepresentativeApplications = () => {
    if (typeof unsubscribeRepresentativeApplications === "function") {
      try {
        unsubscribeRepresentativeApplications();
      } catch (_) {
        // ignore
      }
      unsubscribeRepresentativeApplications = null;
    }

    currentRepresentativeApplications = [];
    currentApprovedRepresentatives = [];
    representativeApplicationsLoaded = false;

    const email = readCurrentUserEmail();
    if (!email) {
      representativeApplicationsLoaded = true;
      if (representativeApplicationsBodyEl) {
        representativeApplicationsBodyEl.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; color:#6b7280;">กรุณาเข้าสู่ระบบเพื่อสมัครเป็นตัวแทนองค์กร</td>
          </tr>
        `;
      }
      if (representativeStatusCaptionEl) representativeStatusCaptionEl.textContent = "ต้องเข้าสู่ระบบก่อน";
      setRepresentativeMessage("เข้าสู่ระบบแล้วกรอกข้อมูลผู้ใช้ให้ครบก่อนสมัครเป็นตัวแทนองค์กร", "#6b7280");
      populateBudgetOrgTypeOptions();
      populateBudgetOrgDeptOptions();
      renderMyRequestsRows(latestBudgetRequestRows);
      return;
    }

    const firestore = window.sgcuFirestore || {};
    const canRead = !!(
      firestore.db &&
      firestore.collection &&
      firestore.onSnapshot &&
      firestore.query &&
      firestore.orderBy
    );
    if (!canRead) {
      representativeApplicationsLoaded = true;
      if (representativeApplicationsBodyEl) {
        representativeApplicationsBodyEl.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; color:#6b7280;">ระบบฐานข้อมูลยังไม่พร้อมใช้งาน</td>
          </tr>
        `;
      }
      if (representativeStatusCaptionEl) representativeStatusCaptionEl.textContent = "ไม่สามารถโหลดสิทธิ์ตัวแทนได้";
      setRepresentativeMessage("ระบบฐานข้อมูลยังไม่พร้อมใช้งาน", "#b45309");
      renderMyRequestsRows(latestBudgetRequestRows);
      return;
    }

    if (representativeStatusCaptionEl) representativeStatusCaptionEl.textContent = "กำลังโหลดสิทธิ์ตัวแทนองค์กร...";
    const listQuery = firestore.query(
      firestore.collection(firestore.db, REPRESENTATIVE_APPLICATION_COLLECTION),
      firestore.where("applicantEmail", "==", email)
    );
    unsubscribeRepresentativeApplications = firestore.onSnapshot(
      listQuery,
      (snapshot) => {
        const rows = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() || {};
          if ((data?.requestType || "").toString().trim() !== "organization_representative") return;
          const applicantEmail = (data?.applicant?.email || data?.applicantEmail || "").toString().trim().toLowerCase();
          if (applicantEmail !== email) return;
          rows.push({
            id: docSnap.id,
            ...data
          });
        });
        const sortedRows = rows.sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));
        currentRepresentativeApplications = sortedRows;
        currentApprovedRepresentatives = sortedRows.filter((item) =>
          (item.status || "").toString().trim().toLowerCase() === "approved"
        );
        representativeApplicationsLoaded = true;
        renderRepresentativeRows(sortedRows);
        if (hasApprovedRepresentativeApplication() && representativeModalEl?.getAttribute("aria-hidden") === "false") {
          setRepresentativeApplicationMessage("บัญชีนี้ได้รับอนุมัติเป็นตัวแทนองค์กรแล้ว หากส่งคำขอเพิ่มระบบจะไม่รับคำขอซ้ำ", "#b45309");
        }
        populateBudgetOrgTypeOptions();
        populateBudgetOrgDeptOptions();
        renderMyRequestsRows(latestBudgetRequestRows);
        if (editingRequestId) {
          const editingItem = latestBudgetRequestRows.find((item) => item.id === editingRequestId);
          if (!editingItem || !hasApprovedRepresentativeForRequest(editingItem)) {
            clearFormForCreate();
            setFormMessage("สิทธิ์ตัวแทนองค์กรของรายการที่กำลังแก้ไขถูกเปลี่ยนแปลง จึงออกจากโหมดแก้ไขแล้ว", "#b45309");
          }
        }
      },
      () => {
        currentRepresentativeApplications = [];
        currentApprovedRepresentatives = [];
        representativeApplicationsLoaded = true;
        if (representativeApplicationsBodyEl) {
          representativeApplicationsBodyEl.innerHTML = `
            <tr>
              <td colspan="4" style="text-align:center; color:#b91c1c;">ไม่สามารถโหลดคำขอตัวแทนองค์กรได้</td>
            </tr>
          `;
        }
        if (representativeStatusCaptionEl) representativeStatusCaptionEl.textContent = "โหลดสิทธิ์ตัวแทนไม่สำเร็จ";
        setRepresentativeMessage("ไม่สามารถโหลดสิทธิ์ตัวแทนองค์กรได้ กรุณาลองใหม่อีกครั้ง", "#b91c1c");
        renderMyRequestsRows(latestBudgetRequestRows);
      }
    );
  };

  const readCurrentUser = () => {
    const auth = window.sgcuAuth?.auth;
    if (!auth?.currentUser) return null;
    return auth.currentUser;
  };

  const readLocalLoginProfileByEmail = (email) => {
    const normalized = (email || "").toString().trim().toLowerCase();
    if (!normalized) return {};

    try {
      const rawPrimary = window.localStorage?.getItem(LOGIN_PROFILE_STORAGE_KEY);
      const rawLegacy = window.localStorage?.getItem(LEGACY_LOGIN_PROFILE_STORAGE_KEY);
      const raw = rawPrimary || rawLegacy;
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      const byEmail = parsed && typeof parsed === "object" ? parsed : {};
      if (!rawPrimary && rawLegacy) {
        try {
          window.localStorage?.setItem(LOGIN_PROFILE_STORAGE_KEY, JSON.stringify(byEmail));
        } catch (_) {
          // ignore localStorage write errors
        }
      }
      const profile = byEmail[normalized];
      return profile && typeof profile === "object" ? profile : {};
    } catch (_) {
      return {};
    }
  };

  const resolveRequesterDisplayName = (user, profile) => {
    const firstName = (profile?.firstName || "").toString().trim();
    const lastName = (profile?.lastName || "").toString().trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    return (user?.displayName || user?.email || "").toString().trim();
  };

  const buildRequestPayload = () => {
    const user = readCurrentUser();
    const email = (user?.email || "").toString().trim().toLowerCase();
    const profile = readLocalLoginProfileByEmail(email);
    const editingItem = editingRequestId
      ? latestBudgetRequestRows.find((item) => item.id === editingRequestId)
      : null;
    const organizationType = editingItem
      ? normalizeOrgText(editingItem.organizationType)
      : getBudgetOrgTypeValueForSubmit();
    const organizationName = editingItem
      ? normalizeOrgText(editingItem.organizationName)
      : getBudgetOrgDeptValueForSubmit();
    const approvedRepresentative = findApprovedRepresentativeForOrg(organizationType, organizationName);
    const selectedRound = editingItem
      ? findActiveRoundById(getRequestRoundId(editingItem))
      : findActiveRoundById(requestRoundSelectEl.value);

    return {
      requestType: "budget_approval",
      status: "pending",
      organizationType,
      organizationName,
      representative: approvedRepresentative
        ? {
          status: "approved",
          applicationId: approvedRepresentative.id,
          role: approvedRepresentative.representativeRole,
          email
        }
        : {
          status: "unverified",
          applicationId: "",
          role: "",
          email
        },
      projectName: projectNameEl.value.trim(),
      description: descriptionEl.value.trim(),
      activityLocation: locationEl.value.trim(),
      prepStartDate: prepStartDateEl.value,
      operationEndDate: operationEndDateEl.value,
      studentOperators: Number(studentOperatorsEl.value || 0),
      studentParticipants: Number(studentParticipantsEl.value || 0),
      estimatedExpense: Number(estimatedExpenseEl.value || 0),
      budgetRoundYear: selectedRound?.year || budgetRoundYear,
      budgetRoundNo: selectedRound?.roundNo || budgetRoundNo,
      budgetRoundId: selectedRound?.id || currentBudgetRoundId,
      requester: {
        email,
        uid: (user?.uid || "").toString(),
        displayName: resolveRequesterDisplayName(user, profile),
        profileType: (profile?.profileType || "").toString(),
        nickname: (profile?.nickname || "").toString(),
        studentId: (profile?.studentId || "").toString(),
        faculty: (profile?.faculty || "").toString(),
        year: (profile?.year || "").toString(),
        phone: (profile?.phone || "").toString(),
        lineId: (profile?.lineId || "").toString()
      },
      requesterEmail: email
    };
  };

  const validateForm = () => {
    if (isBudgetRequestClosed) {
      setFormMessage(`หมดเขตรับคำของบแล้ว (${budgetRequestDeadline}) สามารถดูผลได้เท่านั้น`, "#b91c1c");
      return false;
    }
    const selectedRound = findActiveRoundById(requestRoundSelectEl.value);
    if (!editingRequestId && !selectedRound) {
      setFormMessage("กรุณาเลือกรอบรับคำขอที่ยังเปิดรับ", "#b91c1c");
      return false;
    }
    const primaryRepresentative = getPrimaryApprovedRepresentative();
    if (!primaryRepresentative) {
      setFormMessage("ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว จึงยังไม่สามารถยื่นของบได้", "#b91c1c");
      return false;
    }
    if (editingRequestId) {
      const editingItem = latestBudgetRequestRows.find((item) => item.id === editingRequestId);
      if (!editingItem || !hasApprovedRepresentativeForRequest(editingItem)) {
        setFormMessage("บัญชีนี้ไม่มีสิทธิ์ตัวแทนองค์กรของรายการนี้แล้ว จึงไม่สามารถบันทึกการแก้ไขได้", "#b91c1c");
        clearFormForCreate();
        renderMyRequestsRows(latestBudgetRequestRows);
        return false;
      }
      if (!isRequestRoundOpen(editingItem)) {
        setFormMessage("รายการนี้อยู่ในรอบที่ปิดแล้ว จึงไม่สามารถบันทึกการแก้ไขได้", "#b91c1c");
        clearFormForCreate();
        renderMyRequestsRows(latestBudgetRequestRows);
        return false;
      }
    }

    const controls = [
      orgTypeEl,
      orgDeptEl,
      requestRoundSelectEl,
      projectNameEl,
      descriptionEl,
      locationEl,
      prepStartDateEl,
      operationEndDateEl,
      studentOperatorsEl,
      studentParticipantsEl,
      estimatedExpenseEl
    ];

    const invalidControl = controls.find((control) => !control.reportValidity());
    if (invalidControl) return false;

    const validateNonNegativeIntegerField = (inputEl, label) => {
      const raw = (inputEl.value || "").toString().trim();
      const numeric = Number(raw);
      const isValid = Number.isInteger(numeric) && numeric >= 0;
      inputEl.setCustomValidity(isValid ? "" : `${label}ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`);
      const ok = inputEl.reportValidity();
      if (!ok) inputEl.focus();
      return ok;
    };

    if (!validateNonNegativeIntegerField(studentOperatorsEl, "จำนวนนิสิตผู้ปฏิบัติงาน")) {
      return false;
    }
    if (!validateNonNegativeIntegerField(studentParticipantsEl, "จำนวนนิสิตผู้เข้าร่วมงาน")) {
      return false;
    }

    const orgTypeValue = getBudgetOrgTypeValueForSubmit();
    if (!orgTypeValue) {
      setFormMessage("กรุณาระบุประเภทองค์กร", "#b91c1c");
      orgTypeEl.focus();
      return false;
    }

    const orgDeptValue = getBudgetOrgDeptValueForSubmit();
    if (!orgDeptValue) {
      setFormMessage("กรุณาระบุฝ่าย / ชมรม", "#b91c1c");
      orgDeptEl.focus();
      return false;
    }

    const startDate = new Date(`${prepStartDateEl.value}T00:00:00`);
    const endDate = new Date(`${operationEndDateEl.value}T00:00:00`);
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate.getTime() < startDate.getTime()
    ) {
      setFormMessage("วันสุดท้ายปฏิบัติงานต้องไม่ก่อนวันเริ่มเตรียมงาน", "#b91c1c");
      operationEndDateEl.focus();
      return false;
    }

    if (Number(estimatedExpenseEl.value || 0) < 0) {
      setFormMessage("ประมาณการรายจ่ายต้องไม่ติดลบ", "#b91c1c");
      estimatedExpenseEl.focus();
      return false;
    }

    return true;
  };

  const setRepresentativeFormEnabled = (enabled) => {
    if (!representativeFormEl) return;
    const disabled = !enabled;
    representativeFormEl.querySelectorAll("input, textarea, select, button").forEach((el) => {
      el.disabled = disabled;
    });
    if (representativeRoleOtherEl && representativeRoleEl?.value !== "อื่น ๆ") {
      representativeRoleOtherEl.disabled = true;
    }
    if (representativeSubmitBtnEl) representativeSubmitBtnEl.disabled = disabled;
  };

  const getRepresentativeRoleValue = () => {
    const selected = normalizeOrgText(representativeRoleEl?.value);
    if (selected === "อื่น ๆ") return normalizeOrgText(representativeRoleOtherEl?.value);
    return selected;
  };

  const validateRepresentativeForm = () => {
    if (!representativeFormEl || !representativeOrgTypeEl || !representativeOrgDeptEl || !representativeRoleEl) return false;
    const controls = [representativeOrgTypeEl, representativeOrgDeptEl, representativeRoleEl];
    const invalidControl = controls.find((control) => !control.reportValidity());
    if (invalidControl) return false;

    if (representativeRoleEl.value === "อื่น ๆ") {
      if (!representativeRoleOtherEl) return false;
      representativeRoleOtherEl.required = true;
      if (!representativeRoleOtherEl.reportValidity()) return false;
    } else if (representativeRoleOtherEl) {
      representativeRoleOtherEl.required = false;
      representativeRoleOtherEl.setCustomValidity("");
    }

    if (!representativeApplicationsLoaded) {
      setRepresentativeApplicationMessage("กำลังตรวจสอบสิทธิ์ตัวแทนองค์กร กรุณารอสักครู่", "#b45309");
      return false;
    }

    if (hasApprovedRepresentativeApplication()) {
      setRepresentativeApplicationMessage("บัญชีนี้ได้รับอนุมัติเป็นตัวแทนองค์กรแล้ว ไม่สามารถสมัครเพิ่มได้", "#b91c1c");
      return false;
    }

    const organizationType = normalizeOrgText(representativeOrgTypeEl.value);
    const organizationName = normalizeOrgText(representativeOrgDeptEl.value);
    const existingActive = currentRepresentativeApplications.find((item) => {
      const status = (item.status || "pending").toString().trim().toLowerCase();
      if (status === "rejected" || status === "cancelled") return false;
      return normalizeOrgText(item.organizationType) === organizationType &&
        normalizeOrgText(item.organizationName) === organizationName;
    });
    if (existingActive) {
      setRepresentativeApplicationMessage("บัญชีนี้มีคำขอหรือสิทธิ์ตัวแทนขององค์กรนี้อยู่แล้ว", "#b91c1c");
      return false;
    }

    return true;
  };

  const buildRepresentativePayload = () => {
    const user = readCurrentUser();
    const email = (user?.email || "").toString().trim().toLowerCase();
    const profile = readLocalLoginProfileByEmail(email);
    return {
      requestType: "organization_representative",
      status: "pending",
      organizationType: normalizeOrgText(representativeOrgTypeEl?.value),
      organizationName: normalizeOrgText(representativeOrgDeptEl?.value),
      representativeRole: getRepresentativeRoleValue(),
      evidenceNote: normalizeOrgText(representativeEvidenceEl?.value),
      applicantUid: (user?.uid || "").toString(),
      applicantEmail: email,
      requestedPosition: `ตัวแทนองค์กร: ${normalizeOrgText(representativeOrgDeptEl?.value)}`,
      requestedDivisionCodeYY: "ORG",
      requestedLevelCodeZZ: "REP",
      requester: {
        email,
        uid: (user?.uid || "").toString(),
        displayName: resolveRequesterDisplayName(user, profile),
        profileType: (profile?.profileType || "").toString(),
        nickname: (profile?.nickname || "").toString(),
        studentId: (profile?.studentId || "").toString(),
        faculty: (profile?.faculty || "").toString(),
        year: (profile?.year || "").toString(),
        phone: (profile?.phone || "").toString(),
        lineId: (profile?.lineId || "").toString()
      },
      applicant: {
        email,
        uid: (user?.uid || "").toString(),
        displayName: resolveRequesterDisplayName(user, profile),
        profileType: (profile?.profileType || "").toString(),
        nickname: (profile?.nickname || "").toString(),
        studentId: (profile?.studentId || "").toString(),
        faculty: (profile?.faculty || "").toString(),
        year: (profile?.year || "").toString(),
        phone: (profile?.phone || "").toString(),
        lineId: (profile?.lineId || "").toString()
      },
      reviewedByEmail: "",
      reviewedAt: null,
      reviewedNote: ""
    };
  };

  const setFormEnabled = (enabled) => {
    const disabled = !enabled;
    formEl.querySelectorAll("input, textarea, select, button").forEach((el) => {
      el.disabled = disabled;
    });
    submitBtnEl.disabled = disabled;
  };

  const setEditMode = (requestId = "") => {
    editingRequestId = (requestId || "").toString().trim();
    const isEditing = !!editingRequestId;
    submitBtnEl.textContent = isEditing ? "บันทึกการแก้ไขคำขอ" : "ยื่นคำขออนุมัติงบประมาณ";
    if (cancelEditBtnEl) cancelEditBtnEl.hidden = !isEditing;
    if (cancelRequestBtnEl) cancelRequestBtnEl.hidden = !isEditing;
  };

  const fillFormFromRequest = (item) => {
    if (!item) return;
    projectNameEl.value = (item.projectName || "").toString();
    descriptionEl.value = (item.description || "").toString();
    locationEl.value = (item.activityLocation || "").toString();
    prepStartDateEl.value = (item.prepStartDate || "").toString();
    operationEndDateEl.value = (item.operationEndDate || "").toString();
    studentOperatorsEl.value = Number(item.studentOperators || 0).toString();
    studentParticipantsEl.value = Number(item.studentParticipants || 0).toString();
    estimatedExpenseEl.value = Number(item.estimatedExpense || 0).toString();
    setFormMessage("กำลังแก้ไขคำขอที่ส่งไปแล้ว เมื่อเสร็จให้กดบันทึกการแก้ไข", "#1d4ed8");
    updateBudgetDescriptionCounter();
  };

  const clearFormForCreate = () => {
    formEl.reset();
    populateBudgetOrgTypeOptions();
    populateBudgetOrgDeptOptions();
    setEditMode("");
    setFormMessage("");
    updateBudgetDescriptionCounter();
  };
  [projectNameEl, locationEl, estimatedExpenseEl, descriptionEl].forEach((inputEl) => {
    inputEl.addEventListener("input", () => {
      setFormMessage("");
      updateBudgetDescriptionCounter();
    });
  });
  prepStartDateEl.addEventListener("change", () => {
    setFormMessage("");
  });
  operationEndDateEl.addEventListener("change", () => {
    setFormMessage("");
  });
  [studentOperatorsEl, studentParticipantsEl].forEach((inputEl) => {
    inputEl.addEventListener("input", () => {
      inputEl.setCustomValidity("");
      setFormMessage("");
    });
  });
  orgTypeEl.addEventListener("change", () => {
    populateBudgetOrgDeptOptions();
    setFormMessage("");
  });
  orgTypeEl.addEventListener("focus", () => {
    populateBudgetOrgTypeOptions();
    populateBudgetOrgDeptOptions();
  });
  orgDeptEl.addEventListener("focus", populateBudgetOrgDeptOptions);

  representativeApplyBtnEl?.addEventListener("click", () => {
    const user = readCurrentUser();
    if (!user?.email) {
      setRepresentativeMessage("กรุณาเข้าสู่ระบบก่อนสมัครเป็นตัวแทนองค์กร", "#b91c1c");
    }
    openRepresentativeModal();
    if (!user?.email) {
      setRepresentativeApplicationMessage("กรุณาเข้าสู่ระบบก่อนสมัครเป็นตัวแทนองค์กร", "#b91c1c");
    }
  });
  const startEditRequest = (requestId = "") => {
    const id = (requestId || "").toString().trim();
    if (!id) return;
    if (isBudgetRequestClosed) {
      setFormMessage(`หมดเขตรับคำของบแล้ว (${budgetRequestDeadline}) ไม่สามารถแก้ไขหรือลดรายการได้`, "#b91c1c");
      return;
    }
    const item = latestMyBudgetRequests.find((row) => row.id === id);
    if (!item) {
      setFormMessage("ไม่พบรายการที่ต้องการแก้ไข", "#b91c1c");
      return;
    }
    if (!hasApprovedRepresentativeForRequest(item)) {
      setFormMessage("บัญชีนี้ไม่มีสิทธิ์ตัวแทนองค์กรของรายการนี้แล้ว จึงไม่สามารถแก้ไขได้", "#b91c1c");
      clearFormForCreate();
      renderMyRequestsRows(latestBudgetRequestRows);
      return;
    }
    if (!isRequestRoundOpen(item)) {
      setFormMessage(`รายการนี้อยู่${getRequestRoundLabel(item)} ซึ่งปิดรับแล้ว จึงแก้ไขไม่ได้`, "#b91c1c");
      return;
    }
    const status = (item.status || "pending").toString().trim().toLowerCase();
    if (status !== "pending") {
      setFormMessage("แก้ไขได้เฉพาะรายการที่ยังรออนุมัติ", "#b91c1c");
      return;
    }
    setEditMode(id);
    requestRoundSelectEl.value = getRequestRoundId(item);
    fillFormFromRequest(item);
    formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelBudgetRequest = async (requestId = "") => {
    const id = (requestId || "").toString().trim();
    if (!id) return;
    if (isBudgetRequestClosed) {
      setFormMessage(`หมดเขตรับคำของบแล้ว (${budgetRequestDeadline}) ไม่สามารถแก้ไขหรือลดรายการได้`, "#b91c1c");
      return;
    }
    const item = latestMyBudgetRequests.find((row) => row.id === id);
    if (!item) {
      setFormMessage("ไม่พบรายการที่ต้องการลดรายการ", "#b91c1c");
      return;
    }
    if (!hasApprovedRepresentativeForRequest(item)) {
      setFormMessage("บัญชีนี้ไม่มีสิทธิ์ตัวแทนองค์กรของรายการนี้แล้ว จึงไม่สามารถลดรายการได้", "#b91c1c");
      clearFormForCreate();
      renderMyRequestsRows(latestBudgetRequestRows);
      return;
    }
    if (!isRequestRoundOpen(item)) {
      setFormMessage(`รายการนี้อยู่${getRequestRoundLabel(item)} ซึ่งปิดรับแล้ว จึงลดรายการไม่ได้`, "#b91c1c");
      return;
    }
    const status = (item.status || "pending").toString().trim().toLowerCase();
    if (status !== "pending") {
      setFormMessage("ลดรายการได้เฉพาะรายการที่ยังรออนุมัติ", "#b91c1c");
      return;
    }
    const ok = window.confirm(`ยืนยันลดรายการงบ "${item.projectName || "-"}" ?`);
    if (!ok) return;

    const firestore = window.sgcuFirestore || {};
    const canUpdate = !!(
      firestore.db &&
      firestore.doc &&
      firestore.updateDoc &&
      firestore.serverTimestamp
    );
    if (!canUpdate) {
      setFormMessage("ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง", "#b45309");
      return;
    }
    setFormMessage("กำลังลดรายการ...", "#1d4ed8");
    try {
      await firestore.updateDoc(
        firestore.doc(firestore.db, REQUEST_COLLECTION, id),
        {
          status: "cancelled",
          updatedAt: firestore.serverTimestamp(),
          cancelledAt: firestore.serverTimestamp()
        }
      );
      if (editingRequestId === id) {
        clearFormForCreate();
      }
      setFormMessage("ลดรายการเรียบร้อยแล้ว", "#047857");
    } catch (error) {
      console.error("cancel budget approval request failed - app.budget-request.js", error);
      setFormMessage("ลดรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "#b91c1c");
    }
  };

  myRequestsTableBodyEl.addEventListener("click", (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) return;
    const editRow = target.closest("[data-budget-edit-id]");
    if (!editRow) return;
    startEditRequest(editRow.getAttribute("data-budget-edit-id") || "");
  });

  myRequestsTableBodyEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    const editRow = target?.closest("[data-budget-edit-id]");
    if (!editRow) return;
    event.preventDefault();
    startEditRequest(editRow.getAttribute("data-budget-edit-id") || "");
  });
  cancelEditBtnEl?.addEventListener("click", () => {
    clearFormForCreate();
  });
  cancelRequestBtnEl?.addEventListener("click", () => {
    void cancelBudgetRequest(editingRequestId);
  });
  representativeModalCloseEl?.addEventListener("click", closeRepresentativeModal);
  representativeCancelBtnEl?.addEventListener("click", closeRepresentativeModal);
  representativeModalEl?.addEventListener("click", (event) => {
    if (event.target === representativeModalEl) closeRepresentativeModal();
  });
  representativeOrgTypeEl?.addEventListener("change", () => {
    populateRepresentativeOrgDeptOptions();
    setRepresentativeApplicationMessage("");
  });
  representativeOrgTypeEl?.addEventListener("focus", () => {
    populateRepresentativeOrgTypeOptions();
    populateRepresentativeOrgDeptOptions();
  });
  representativeOrgDeptEl?.addEventListener("focus", populateRepresentativeOrgDeptOptions);
  representativeRoleEl?.addEventListener("change", () => {
    const needsOther = representativeRoleEl.value === "อื่น ๆ";
    if (representativeRoleOtherEl) {
      representativeRoleOtherEl.disabled = !needsOther;
      representativeRoleOtherEl.required = needsOther;
      if (!needsOther) representativeRoleOtherEl.value = "";
    }
    setRepresentativeApplicationMessage("");
  });
  exportCsvBtnEl?.addEventListener("click", exportMyBudgetRequestsCsv);
  representativeFormEl?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setRepresentativeApplicationMessage("");

    const user = readCurrentUser();
    if (!user?.email) {
      setRepresentativeApplicationMessage("กรุณาเข้าสู่ระบบก่อนสมัครเป็นตัวแทนองค์กร", "#b91c1c");
      return;
    }
    if (!validateRepresentativeForm()) return;

    const firestore = window.sgcuFirestore || {};
    const canWrite = !!(
      firestore.db &&
      firestore.collection &&
      firestore.addDoc &&
      firestore.serverTimestamp
    );
    if (!canWrite) {
      setRepresentativeApplicationMessage("ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง", "#b45309");
      return;
    }

    setRepresentativeFormEnabled(false);
    setRepresentativeApplicationMessage("กำลังส่งคำขอตัวแทนองค์กร...", "#1d4ed8");
    try {
      const payload = buildRepresentativePayload();
      await firestore.addDoc(
        firestore.collection(firestore.db, REPRESENTATIVE_APPLICATION_COLLECTION),
        {
          ...payload,
          createdAt: firestore.serverTimestamp(),
          updatedAt: firestore.serverTimestamp()
        }
      );
      representativeFormEl.reset();
      if (representativeRoleOtherEl) {
        representativeRoleOtherEl.disabled = true;
        representativeRoleOtherEl.required = false;
      }
      populateRepresentativeOrgTypeOptions();
      populateRepresentativeOrgDeptOptions();
      setRepresentativeApplicationMessage("ส่งคำขอสมัครเป็นตัวแทนองค์กรเรียบร้อยแล้ว", "#047857");
      window.setTimeout(closeRepresentativeModal, 650);
    } catch (error) {
      console.error("submit organization representative application failed - app.budget-request.js", error);
      const code = (error?.code || "unknown").toString();
      if (code === "permission-denied") {
        setRepresentativeApplicationMessage("ไม่สามารถส่งคำขอได้: บัญชีนี้ไม่มีสิทธิ์เขียนข้อมูล (permission-denied)", "#b91c1c");
      } else if (code === "unauthenticated") {
        setRepresentativeApplicationMessage("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง", "#b91c1c");
      } else {
        setRepresentativeApplicationMessage("ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "#b91c1c");
      }
    } finally {
      setRepresentativeFormEnabled(true);
    }
  });

  void ensureBudgetOrgOptionDataLoaded().finally(() => {
    populateBudgetOrgTypeOptions();
    populateBudgetOrgDeptOptions();
    populateRepresentativeOrgTypeOptions();
    populateRepresentativeOrgDeptOptions();
  });
  subscribeMyRequests();
  subscribeRepresentativeApplications();
  subscribeBudgetSettings();
  updateBudgetDescriptionCounter();

  if (window.sgcuAuth?.auth && typeof window.sgcuAuth.onAuthStateChanged === "function") {
    window.sgcuAuth.onAuthStateChanged(window.sgcuAuth.auth, () => {
      subscribeMyRequests();
      subscribeRepresentativeApplications();
    });
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormMessage("");

    const user = readCurrentUser();
    if (!user?.email) {
      setFormMessage("กรุณาเข้าสู่ระบบก่อนยื่นคำขออนุมัติงบประมาณ", "#b91c1c");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const firestore = window.sgcuFirestore || {};
    const canWrite = !!(
      firestore.db &&
      firestore.collection &&
      firestore.doc &&
      firestore.updateDoc &&
      firestore.addDoc &&
      firestore.serverTimestamp
    );

    if (!canWrite) {
      setFormMessage("ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง", "#b45309");
      return;
    }

    setFormEnabled(false);
    const isEditing = !!editingRequestId;
    setFormMessage(
      isEditing ? "กำลังบันทึกการแก้ไขคำขอ..." : "กำลังส่งคำขออนุมัติงบประมาณ...",
      "#1d4ed8"
    );

    try {
      const payload = buildRequestPayload();
      if (isEditing) {
        await firestore.updateDoc(
          firestore.doc(firestore.db, REQUEST_COLLECTION, editingRequestId),
          {
            ...payload,
            updatedAt: firestore.serverTimestamp()
          }
        );
        clearFormForCreate();
        setFormMessage("บันทึกการแก้ไขคำขอเรียบร้อยแล้ว", "#047857");
      } else {
        await firestore.addDoc(
          firestore.collection(firestore.db, REQUEST_COLLECTION),
          {
            ...payload,
            createdAt: firestore.serverTimestamp(),
            updatedAt: firestore.serverTimestamp()
          }
        );
        clearFormForCreate();
        setFormMessage("ส่งคำขออนุมัติงบประมาณเรียบร้อยแล้ว", "#047857");
      }
    } catch (error) {
      console.error("submit budget approval request failed - app.budget-request.js", error);
      const code = (error?.code || "unknown").toString();
      if (code === "permission-denied") {
        setFormMessage("ไม่สามารถส่งคำขอได้: บัญชีนี้ไม่มีสิทธิ์เขียนข้อมูล (permission-denied)", "#b91c1c");
      } else if (code === "unauthenticated") {
        setFormMessage("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง", "#b91c1c");
      } else {
        setFormMessage("ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "#b91c1c");
      }
    } finally {
      setFormEnabled(true);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (typeof unsubscribeMyRequests === "function") {
      try {
        unsubscribeMyRequests();
      } catch (_) {
        // ignore
      }
      unsubscribeMyRequests = null;
    }
    if (typeof unsubscribeRepresentativeApplications === "function") {
      try {
        unsubscribeRepresentativeApplications();
      } catch (_) {
        // ignore
      }
      unsubscribeRepresentativeApplications = null;
    }
    if (typeof unsubscribeBudgetSettings === "function") {
      try {
        unsubscribeBudgetSettings();
      } catch (_) {
        // ignore
      }
      unsubscribeBudgetSettings = null;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBudgetApprovalRequestPage, { once: true });
} else {
  initBudgetApprovalRequestPage();
}
