/* Budget approval request form */
function initBudgetApprovalRequestPage() {
  if (window.__sgcuBudgetApprovalRequestInitialized) return;
  window.__sgcuBudgetApprovalRequestInitialized = true;

  const formEl = document.getElementById("budgetApprovalForm");
  const submitBtnEl = document.getElementById("budgetApprovalSubmitBtn");
  const messageEl = document.getElementById("budgetApprovalMessage");
  const myRequestsTableBodyEl = document.getElementById("budgetApprovalMyRequestsTableBody");
  const myRequestsCaptionEl = document.getElementById("budgetApprovalListCaption");
  const orgTypeEl = document.getElementById("budgetOrgType");
  const orgDeptEl = document.getElementById("budgetOrgDept");
  const projectNameEl = document.getElementById("budgetProjectName");
  const descriptionEl = document.getElementById("budgetProjectDescription");
  const locationEl = document.getElementById("budgetActivityLocation");
  const prepStartDateEl = document.getElementById("budgetPrepStartDate");
  const operationEndDateEl = document.getElementById("budgetOperationEndDate");
  const studentOperatorsEl = document.getElementById("budgetStudentOperators");
  const studentParticipantsEl = document.getElementById("budgetStudentParticipants");
  const estimatedExpenseEl = document.getElementById("budgetEstimatedExpense");

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

  const LOGIN_PROFILE_STORAGE_KEY = "sgcu_borrow_profile_by_email_v1";
  const REQUEST_COLLECTION = "budgetApprovalRequests";
  let unsubscribeMyRequests = null;

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

  const populateBudgetOrgTypeOptions = () => {
    const currentValue = orgTypeEl.value;
    while (orgTypeEl.options.length) {
      orgTypeEl.remove(0);
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "เลือกประเภทองค์กร";
    placeholder.disabled = true;
    placeholder.selected = true;
    orgTypeEl.appendChild(placeholder);

    collectBudgetOrgTypeOptions().forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      orgTypeEl.appendChild(option);
    });

    if (currentValue) {
      const hasCurrent = Array.from(orgTypeEl.options).some((opt) => opt.value === currentValue);
      if (hasCurrent) {
        orgTypeEl.value = currentValue;
      }
    }
  };

  const populateBudgetOrgDeptOptions = () => {
    const selectedType = (orgTypeEl.value || "").toString().trim();
    const currentValue = orgDeptEl.value;

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
      const options = collectBudgetOrgNameOptions(selectedType);
      options.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        orgDeptEl.appendChild(option);
      });
      if (currentValue) {
        const hasCurrent = Array.from(orgDeptEl.options).some((opt) => opt.value === currentValue);
        if (hasCurrent) orgDeptEl.value = currentValue;
      }
    }
    orgDeptEl.disabled = !selectedType;
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

  const readCurrentUserEmail = () =>
    (window.sgcuAuth?.auth?.currentUser?.email || "").toString().trim().toLowerCase();

  const renderMyRequestsRows = (rows) => {
    const items = Array.isArray(rows) ? rows : [];
    if (!items.length) {
      myRequestsTableBodyEl.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color:#6b7280;">ยังไม่มีรายการคำขออนุมัติงบประมาณ</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = "ยังไม่มีรายการ";
      return;
    }

    myRequestsTableBodyEl.innerHTML = items.map((item) => {
      const orgType = escapeHtml(item.organizationType || "-");
      const orgName = escapeHtml(item.organizationName || "-");
      const projectName = escapeHtml(item.projectName || "-");
      const startDate = formatDateDisplay(item.prepStartDate);
      const endDate = formatDateDisplay(item.operationEndDate);
      return `
        <tr>
          <td style="text-align:center;">${formatTimestampDisplay(item.createdAt)}</td>
          <td style="text-align:left;">${orgType}<br><span class="section-text-sm">${orgName}</span></td>
          <td style="text-align:left;">${projectName}</td>
          <td style="text-align:center;">${startDate} - ${endDate}</td>
          <td style="text-align:right;">${formatCurrency(item.estimatedExpense)}</td>
          <td style="text-align:center;">${statusBadgeHtml(item.status)}</td>
        </tr>
      `;
    }).join("");
    myRequestsCaptionEl.textContent = `แสดง ${items.length} รายการ`;
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
          <td colspan="6" style="text-align:center; color:#6b7280;">กรุณาเข้าสู่ระบบเพื่อดูรายการที่ขอไปทั้งหมด</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = "ต้องเข้าสู่ระบบก่อน";
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
          <td colspan="6" style="text-align:center; color:#6b7280;">ระบบฐานข้อมูลยังไม่พร้อมใช้งาน</td>
        </tr>
      `;
      myRequestsCaptionEl.textContent = "ไม่สามารถโหลดรายการได้";
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
            <td colspan="6" style="text-align:center; color:#b91c1c;">ไม่สามารถโหลดรายการได้ กรุณาลองใหม่อีกครั้ง</td>
          </tr>
        `;
        myRequestsCaptionEl.textContent = "โหลดรายการไม่สำเร็จ";
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
      const raw = window.localStorage?.getItem(LOGIN_PROFILE_STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      const byEmail = parsed && typeof parsed === "object" ? parsed : {};
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

    return {
      requestType: "budget_approval",
      status: "pending",
      organizationType: getBudgetOrgTypeValueForSubmit(),
      organizationName: getBudgetOrgDeptValueForSubmit(),
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

  const setFormEnabled = (enabled) => {
    const disabled = !enabled;
    formEl.querySelectorAll("input, textarea, select, button").forEach((el) => {
      el.disabled = disabled;
    });
    submitBtnEl.disabled = disabled;
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

  void ensureBudgetOrgOptionDataLoaded().finally(() => {
    populateBudgetOrgTypeOptions();
    populateBudgetOrgDeptOptions();
  });
  subscribeMyRequests();

  if (window.sgcuAuth?.auth && typeof window.sgcuAuth.onAuthStateChanged === "function") {
    window.sgcuAuth.onAuthStateChanged(window.sgcuAuth.auth, () => {
      subscribeMyRequests();
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
      firestore.addDoc &&
      firestore.serverTimestamp
    );

    if (!canWrite) {
      setFormMessage("ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง", "#b45309");
      return;
    }

    setFormEnabled(false);
    setFormMessage("กำลังส่งคำขออนุมัติงบประมาณ...", "#1d4ed8");

    try {
      const payload = buildRequestPayload();
      await firestore.addDoc(
        firestore.collection(firestore.db, REQUEST_COLLECTION),
        {
          ...payload,
          createdAt: firestore.serverTimestamp(),
          updatedAt: firestore.serverTimestamp()
        }
      );

      formEl.reset();
      populateBudgetOrgTypeOptions();
      populateBudgetOrgDeptOptions();
      setFormMessage("ส่งคำขออนุมัติงบประมาณเรียบร้อยแล้ว", "#047857");
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
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBudgetApprovalRequestPage, { once: true });
} else {
  initBudgetApprovalRequestPage();
}
