/* Budget approval request form */
function initBudgetApprovalRequestPage() {
  if (window.__sgcuBudgetApprovalRequestInitialized) return;
  window.__sgcuBudgetApprovalRequestInitialized = true;

  const formEl = document.getElementById("budgetApprovalForm");
  const submitBtnEl = document.getElementById("budgetApprovalSubmitBtn");
  const cancelEditBtnEl = document.getElementById("budgetApprovalCancelEditBtn");
  const messageEl = document.getElementById("budgetApprovalMessage");
  const myRequestsTableBodyEl = document.getElementById("budgetApprovalMyRequestsTableBody");
  const myRequestsCaptionEl = document.getElementById("budgetApprovalListCaption");
  const orgTypeEl = document.getElementById("budgetOrgType");
  const orgDeptEl = document.getElementById("budgetOrgDept");
  const orgTypeDisplayEl = document.getElementById("budgetOrgTypeDisplay");
  const orgDeptDisplayEl = document.getElementById("budgetOrgDeptDisplay");
  const orgSummaryProjectCountEl = document.getElementById("budgetOrgSummaryProjectCount");
  const orgSummaryTotalExpenseEl = document.getElementById("budgetOrgSummaryTotalExpense");
  const orgSummaryPendingCountEl = document.getElementById("budgetOrgSummaryPendingCount");
  const orgSummaryApprovedCountEl = document.getElementById("budgetOrgSummaryApprovedCount");
  const orgSummaryCaptionEl = document.getElementById("budgetOrgSummaryCaption");
  const projectNameEl = document.getElementById("budgetProjectName");
  const descriptionEl = document.getElementById("budgetProjectDescription");
  const locationEl = document.getElementById("budgetActivityLocation");
  const prepStartDateEl = document.getElementById("budgetPrepStartDate");
  const operationEndDateEl = document.getElementById("budgetOperationEndDate");
  const studentOperatorsEl = document.getElementById("budgetStudentOperators");
  const studentParticipantsEl = document.getElementById("budgetStudentParticipants");
  const estimatedExpenseEl = document.getElementById("budgetEstimatedExpense");
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
    !estimatedExpenseEl
  ) {
    return;
  }

  const LOGIN_PROFILE_STORAGE_KEY = "sgcu_user_profile_by_email_v1";
  const LEGACY_LOGIN_PROFILE_STORAGE_KEY = "sgcu_borrow_profile_by_email_v1";
  const REQUEST_COLLECTION = "budgetApprovalRequests";
  const REPRESENTATIVE_APPLICATION_COLLECTION = "organizationRepresentativeApplications";
  let unsubscribeMyRequests = null;
  let unsubscribeRepresentativeApplications = null;
  let currentRepresentativeApplications = [];
  let currentApprovedRepresentatives = [];
  let representativeApplicationsLoaded = false;
  let editingRequestId = "";
  let latestMyBudgetRequests = [];

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
    const pendingCount = matchedRows.filter((item) =>
      (item.status || "pending").toString().trim().toLowerCase() === "pending"
    ).length;
    const approvedCount = matchedRows.filter((item) =>
      (item.status || "").toString().trim().toLowerCase() === "approved"
    ).length;

    if (orgSummaryProjectCountEl) orgSummaryProjectCountEl.textContent = String(matchedRows.length);
    if (orgSummaryTotalExpenseEl) orgSummaryTotalExpenseEl.textContent = `${formatCurrency(totalExpense)} บาท`;
    if (orgSummaryPendingCountEl) orgSummaryPendingCountEl.textContent = String(pendingCount);
    if (orgSummaryApprovedCountEl) orgSummaryApprovedCountEl.textContent = String(approvedCount);
    if (orgSummaryCaptionEl) {
      orgSummaryCaptionEl.textContent = orgType && orgName
        ? `สรุปรายการของ ${orgName} / ${orgType} จากคำขอที่บัญชีนี้ยื่นไว้`
        : "ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว";
    }
  };

  const syncBudgetOrgDisplay = () => {
    const representative = getPrimaryApprovedRepresentative();
    setDisplayText(orgTypeDisplayEl, representative?.organizationType || "");
    setDisplayText(orgDeptDisplayEl, representative?.organizationName || "");
    updateBudgetOrgSummary();
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

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    if (!Number.isFinite(num)) return "-";
    return num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const statusBadgeHtml = (status) => {
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
          <td data-label="สถานะ"><span class="budget-representative-history-value">${statusBadgeHtml(item.status)}</span></td>
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
    const items = Array.isArray(rows) ? rows : [];
    latestMyBudgetRequests = items;
    if (!items.length) {
      myRequestsTableBodyEl.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; color:#6b7280;">ยังไม่มีรายการคำขออนุมัติงบประมาณ</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = "ยังไม่มีรายการ";
      updateBudgetOrgSummary();
      return;
    }

    myRequestsTableBodyEl.innerHTML = items.map((item) => {
      const orgType = escapeHtml(item.organizationType || "-");
      const orgName = escapeHtml(item.organizationName || "-");
      const projectName = escapeHtml(item.projectName || "-");
      const startDate = formatDateDisplay(item.prepStartDate);
      const endDate = formatDateDisplay(item.operationEndDate);
      const status = (item.status || "pending").toString().trim().toLowerCase();
      const canEdit = status === "pending";
      const actionsHtml = canEdit
        ? `
          <button type="button" class="btn-ghost budget-request-edit-btn" data-budget-edit-id="${escapeHtml(item.id || "")}">
            แก้ไข
          </button>
          <button type="button" class="btn-ghost budget-request-cancel-btn" data-budget-cancel-id="${escapeHtml(item.id || "")}">
            ลดรายการ
          </button>
        `
        : '<span class="section-text-sm" style="color:#9ca3af;">-</span>';
      return `
        <tr>
          <td style="text-align:center;">${formatTimestampDisplay(item.createdAt)}</td>
          <td style="text-align:left;">${orgName}<br><span class="section-text-sm">${orgType}</span></td>
          <td style="text-align:left;">${projectName}</td>
          <td style="text-align:center;">${startDate} - ${endDate}</td>
          <td style="text-align:right;">${formatCurrency(item.estimatedExpense)}</td>
          <td style="text-align:center;">${statusBadgeHtml(item.status)}</td>
          <td style="text-align:center; white-space:nowrap;">${actionsHtml}</td>
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
          <td colspan="7" style="text-align:center; color:#6b7280;">กรุณาเข้าสู่ระบบเพื่อดูรายการที่ขอไปทั้งหมด</td>
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
      firestore.orderBy
    );
    if (!canRead) {
      myRequestsTableBodyEl.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; color:#6b7280;">ระบบฐานข้อมูลยังไม่พร้อมใช้งาน</td>
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
      firestore.orderBy("createdAt", "desc")
    );
    unsubscribeMyRequests = firestore.onSnapshot(
      listQuery,
      (snapshot) => {
        const rows = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() || {};
          const requesterEmail = (data?.requester?.email || "").toString().trim().toLowerCase();
          if ((data?.requestType || "budget_approval").toString().trim() !== "budget_approval") return;
          if (requesterEmail !== email) return;
          rows.push({
            id: docSnap.id,
            ...data
          });
        });
        renderMyRequestsRows(rows);
      },
      () => {
        myRequestsTableBodyEl.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; color:#b91c1c;">ไม่สามารถโหลดรายการได้ กรุณาลองใหม่อีกครั้ง</td>
          </tr>
        `;
        myRequestsCaptionEl.textContent = "โหลดรายการไม่สำเร็จ";
        latestMyBudgetRequests = [];
      }
    );
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
      return;
    }

    if (representativeStatusCaptionEl) representativeStatusCaptionEl.textContent = "กำลังโหลดสิทธิ์ตัวแทนองค์กร...";
    const listQuery = firestore.query(
      firestore.collection(firestore.db, REPRESENTATIVE_APPLICATION_COLLECTION),
      firestore.orderBy("createdAt", "desc")
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
        currentRepresentativeApplications = rows;
        currentApprovedRepresentatives = rows.filter((item) =>
          (item.status || "").toString().trim().toLowerCase() === "approved"
        );
        representativeApplicationsLoaded = true;
        renderRepresentativeRows(rows);
        if (hasApprovedRepresentativeApplication() && representativeModalEl?.getAttribute("aria-hidden") === "false") {
          setRepresentativeApplicationMessage("บัญชีนี้ได้รับอนุมัติเป็นตัวแทนองค์กรแล้ว หากส่งคำขอเพิ่มระบบจะไม่รับคำขอซ้ำ", "#b45309");
        }
        populateBudgetOrgTypeOptions();
        populateBudgetOrgDeptOptions();
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
    const organizationType = getBudgetOrgTypeValueForSubmit();
    const organizationName = getBudgetOrgDeptValueForSubmit();
    const approvedRepresentative = findApprovedRepresentativeForOrg(organizationType, organizationName);

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
      }
    };
  };

  const validateForm = () => {
    const primaryRepresentative = getPrimaryApprovedRepresentative();
    if (!primaryRepresentative) {
      setFormMessage("ยังไม่มีสิทธิ์ตัวแทนองค์กรที่อนุมัติแล้ว จึงยังไม่สามารถยื่นของบได้", "#b91c1c");
      return false;
    }

    const controls = [
      orgTypeEl,
      orgDeptEl,
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
  };

  const clearFormForCreate = () => {
    formEl.reset();
    populateBudgetOrgTypeOptions();
    populateBudgetOrgDeptOptions();
    setEditMode("");
    setFormMessage("");
  };
  prepStartDateEl.addEventListener("change", () => setFormMessage(""));
  operationEndDateEl.addEventListener("change", () => setFormMessage(""));
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
  myRequestsTableBodyEl.addEventListener("click", async (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) return;
    const editBtn = target.closest("[data-budget-edit-id]");
    const cancelBtn = target.closest("[data-budget-cancel-id]");

    if (editBtn) {
      const requestId = (editBtn.getAttribute("data-budget-edit-id") || "").toString().trim();
      if (!requestId) return;
      const item = latestMyBudgetRequests.find((row) => row.id === requestId);
      if (!item) {
        setFormMessage("ไม่พบรายการที่ต้องการแก้ไข", "#b91c1c");
        return;
      }
      setEditMode(requestId);
      fillFormFromRequest(item);
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (!cancelBtn) return;
    const requestId = (cancelBtn.getAttribute("data-budget-cancel-id") || "").toString().trim();
    if (!requestId) return;
    const item = latestMyBudgetRequests.find((row) => row.id === requestId);
    if (!item) {
      setFormMessage("ไม่พบรายการที่ต้องการลดรายการ", "#b91c1c");
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
        firestore.doc(firestore.db, REQUEST_COLLECTION, requestId),
        {
          status: "cancelled",
          updatedAt: firestore.serverTimestamp(),
          cancelledAt: firestore.serverTimestamp()
        }
      );
      if (editingRequestId === requestId) {
        clearFormForCreate();
      }
      setFormMessage("ลดรายการเรียบร้อยแล้ว", "#047857");
    } catch (error) {
      console.error("cancel budget approval request failed - app.budget-request.js", error);
      setFormMessage("ลดรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "#b91c1c");
    }
  });
  cancelEditBtnEl?.addEventListener("click", () => {
    clearFormForCreate();
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
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBudgetApprovalRequestPage, { once: true });
} else {
  initBudgetApprovalRequestPage();
}
