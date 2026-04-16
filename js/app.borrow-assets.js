/* Borrow assets: request flow + assets tables + staff approval queue */
function initBorrowAssetsApp() {
  if (window.__sgcuBorrowAssetsInitialized) return;
  window.__sgcuBorrowAssetsInitialized = true;
  const borrowAssetList = document.getElementById("borrowAssetList");
  const addBorrowAssetRow = document.getElementById("addBorrowAssetRow");
  const borrowRequestForm = document.querySelector("#assetsOverview .borrow-request-form");
  const borrowSubmitBtn = borrowRequestForm
    ? borrowRequestForm.querySelector('button.btn-primary[type="button"]')
    : null;

  const borrowProjectName = document.getElementById("borrowProjectName");
  const borrowProjectNameOther = document.getElementById("borrowProjectNameOther");
  const borrowProjectDept = document.getElementById("borrowProjectDept");
  const borrowProjectDeptOther = document.getElementById("borrowProjectDeptOther");
  const borrowProjectDetail = document.getElementById("borrowProjectDetail");
  const borrowPickupDate = document.getElementById("borrowPickupDate");
  const borrowReturnDate = document.getElementById("borrowReturnDate");
  const borrowProfileFullNameEl = document.getElementById("borrowProfileFullName");
  const borrowProfileNicknameEl = document.getElementById("borrowProfileNickname");
  const borrowProfileStudentIdEl = document.getElementById("borrowProfileStudentId");
  const borrowProfileFacultyYearEl = document.getElementById("borrowProfileFacultyYear");
  const borrowProfilePhoneEl = document.getElementById("borrowProfilePhone");
  const borrowProfileLineIdEl = document.getElementById("borrowProfileLineId");

  const borrowAssetsTableBody = document.getElementById("borrowAssetsTableBody");
  const borrowAssetsTableBodyStaff = document.getElementById("borrowAssetsTableBodyStaff");
  const borrowAssetsSearch = document.getElementById("borrowAssetsSearch");
  const borrowAssetsSearchClear = document.getElementById("borrowAssetsSearchClear");
  const borrowAssetsSearchStaff = document.getElementById("borrowAssetsSearchStaff");
  const borrowAssetsSearchStaffClear = document.getElementById("borrowAssetsSearchStaffClear");
  const borrowAssetsTypeFilter = document.getElementById("borrowAssetsTypeFilter");
  const borrowAssetsTypeFilterStaff = document.getElementById("borrowAssetsTypeFilterStaff");
  const borrowAssetsCount = document.getElementById("borrowAssetsCount");
  const borrowAssetsCountStaff = document.getElementById("borrowAssetsCountStaff");

  const myRequestsTableBody = document.getElementById("myBorrowRequestsTableBody");
  const borrowOverviewCards = document.getElementById("borrowOverviewCards");
  const borrowFollowupTableBody = document.getElementById("borrowFollowupTableBody");
  const staffQueueTableBody =
    document.getElementById("staffBorrowQueueTableBody") ||
    document.querySelector("#staffBorrowQueue .table-wrapper tbody");
  const staffBorrowOverviewCards = document.getElementById("staffBorrowOverviewCards");
  const staffBorrowFollowupTableBody = document.getElementById("staffBorrowFollowupTableBody");
  const staffHistoryTableBody = document.getElementById("staffBorrowHistoryTableBody");
  const staffRequestPanelTitleEl = document.getElementById("staffRequestPanelTitle");
  const staffRequestPanelCaptionEl = document.getElementById("staffRequestPanelCaption");
  const staffSummaryCards = Array.from(
    document.querySelectorAll("#staffBorrowQueue .cards[data-role='legacy-staff-summary'] .card-value")
  );

  const hasBorrowFormSection = !!(borrowAssetList && addBorrowAssetRow);
  const BORROW_PROFILE_STORAGE_KEY = "sgcu_user_profile_by_email_v1";
  const LEGACY_BORROW_PROFILE_STORAGE_KEY = "sgcu_borrow_profile_by_email_v1";
  const USER_PROFILE_COLLECTION = "userProfiles";

  const USE_CSV_ASSET_CATALOG = true;
  const ENABLE_ASSET_AVAILABILITY_CHECK =
    typeof globalThis.ENABLE_ASSET_AVAILABILITY_CHECK === "boolean"
      ? globalThis.ENABLE_ASSET_AVAILABILITY_CHECK
      : false;
  const BORROW_ASSETS_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQcx0zotyWntFscUtgXHg4dkJQ6xI16Xrasy58sQfr-29iwgdpujpuvLC7poHH3TG4KR6P36A-bLyZR/pub?gid=0&single=true&output=csv";
  const BORROW_REQUEST_COLLECTION = "borrowAssetRequests";
  const BORROW_REQUEST_COLLECTION_FALLBACK = "borrowAssetsRequests";
  const BORROW_ASSET_STOCK_COLLECTION = "borrowAssetStockReservations";
  const BORROW_REQUEST_COLLECTIONS = [
    BORROW_REQUEST_COLLECTION,
    BORROW_REQUEST_COLLECTION_FALLBACK
  ];
  const STATUS_PENDING = "pending";
  const STATUS_APPROVED = "approved";
  const STATUS_RECEIVED = "received";
  const STATUS_REJECTED = "rejected";
  const STATUS_CANCELLED = "cancelled";
  const STATUS_RETURNED = "returned";
  const STAFF_REQUEST_TAB_STATUSES = new Set([STATUS_PENDING, STATUS_APPROVED, STATUS_RECEIVED]);
  const STAFF_HISTORY_TAB_STATUSES = new Set([STATUS_REJECTED, STATUS_CANCELLED, STATUS_RETURNED]);
  const BORROW_FOLLOWUP_SOON_DAYS = 3;

  const safeEscape = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");

  let firestore = window.sgcuFirestore || {};
  let hasFirestore = false;
  let unsubscribeBorrowRequests = [];
  let borrowRequests = [];
  let borrowRequestsSnapshotCount = 0;
  let currentUserEmail = "";
  const assetMap = new Map();
  const assetRowMap = new Map();
  let borrowAssetsRows = [];
  let activeBorrowProfile = null;
  const collectionSnapshotRows = new Map();
  const collectionSnapshotCounts = new Map();
  const collectionSnapshotErrors = new Map();
  let staffActionInFlight = false;

  const resolveFirestoreBridge = () => {
    firestore = window.sgcuFirestore || {};
    hasFirestore = !!(
      firestore.db &&
      firestore.collection &&
      firestore.addDoc &&
      firestore.onSnapshot &&
      firestore.doc &&
      firestore.updateDoc &&
      firestore.deleteDoc &&
      firestore.serverTimestamp
    );
    return hasFirestore;
  };
  resolveFirestoreBridge();

  const borrowMessageEl = (() => {
    if (!borrowRequestForm || !borrowSubmitBtn) return null;
    const existing = document.getElementById("borrowRequestMessage");
    if (existing) return existing;
    const message = document.createElement("p");
    message.id = "borrowRequestMessage";
    message.className = "section-text-sm";
    message.style.marginTop = "10px";
    borrowSubmitBtn.insertAdjacentElement("afterend", message);
    return message;
  })();

  const setBorrowMessage = (text, color = "#374151") => {
    if (!borrowMessageEl) return;
    borrowMessageEl.textContent = text || "";
    borrowMessageEl.style.color = color;
  };

  const staffQueueMessageEl = (() => {
    if (!staffQueueTableBody) return null;
    const wrapper = staffQueueTableBody.closest(".table-wrapper");
    if (!wrapper) return null;
    const existing = document.getElementById("borrowStaffQueueMessage");
    if (existing) return existing;
    const message = document.createElement("p");
    message.id = "borrowStaffQueueMessage";
    message.className = "section-text-sm";
    message.style.marginTop = "10px";
    wrapper.insertAdjacentElement("afterend", message);
    return message;
  })();

  const setStaffQueueMessage = (text, color = "#374151") => {
    if (!staffQueueMessageEl) return;
    staffQueueMessageEl.textContent = text || "";
    staffQueueMessageEl.style.color = color;
  };

  const normalizeBool = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "y";
  };

  const parseNumber = (value) => {
    const num = Number(String(value || "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(num) ? num : null;
  };

  const OTHER_ORG_VALUE = "__other__";
  const collectBorrowOrgTypeOptions = () => {
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

  const collectBorrowOrgNameOptions = (orgType) => {
    const selectedType = (orgType || "").toString().trim();
    if (!selectedType || selectedType === OTHER_ORG_VALUE) return [];
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

  const toggleBorrowProjectNameOther = () => {
    if (!borrowProjectNameOther || !borrowProjectName) return;
    const showOther = borrowProjectName.value === OTHER_ORG_VALUE;
    borrowProjectNameOther.style.display = showOther ? "" : "none";
    borrowProjectNameOther.required = showOther;
    if (!showOther) {
      borrowProjectNameOther.value = "";
    }
  };

  const toggleBorrowProjectDeptOther = (showOther) => {
    if (!(borrowProjectDept instanceof HTMLSelectElement)) return;
    borrowProjectDept.disabled = !!showOther;
    borrowProjectDept.required = !showOther;
    if (showOther) {
      borrowProjectDept.value = "";
    }
    if (borrowProjectDeptOther) {
      borrowProjectDeptOther.style.display = showOther ? "" : "none";
      borrowProjectDeptOther.required = !!showOther;
      if (!showOther) {
        borrowProjectDeptOther.value = "";
      }
    }
  };

  const populateBorrowProjectTypeOptions = () => {
    if (!(borrowProjectName instanceof HTMLSelectElement)) return;
    const currentValue = borrowProjectName.value;
    while (borrowProjectName.options.length) {
      borrowProjectName.remove(0);
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "เลือกประเภทองค์กร";
    placeholder.disabled = true;
    placeholder.selected = true;
    borrowProjectName.appendChild(placeholder);

    const options = collectBorrowOrgTypeOptions();
    options.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      borrowProjectName.appendChild(option);
    });

    const otherOption = document.createElement("option");
    otherOption.value = OTHER_ORG_VALUE;
    otherOption.textContent = "อื่น ๆ";
    borrowProjectName.appendChild(otherOption);

    if (currentValue) {
      const hasCurrent = Array.from(borrowProjectName.options).some((opt) => opt.value === currentValue);
      if (hasCurrent) {
        borrowProjectName.value = currentValue;
      } else if (borrowProjectNameOther && currentValue !== OTHER_ORG_VALUE) {
        borrowProjectName.value = OTHER_ORG_VALUE;
        borrowProjectNameOther.value = currentValue;
      }
    }
    toggleBorrowProjectNameOther();
  };

  const populateBorrowProjectDeptOptions = () => {
    if (!(borrowProjectDept instanceof HTMLSelectElement)) return;
    const selectedType = (borrowProjectName?.value || "").toString().trim();
    const shouldUseOther = selectedType === OTHER_ORG_VALUE;
    const currentValue = borrowProjectDept.value;

    while (borrowProjectDept.options.length) {
      borrowProjectDept.remove(0);
    }
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = shouldUseOther
      ? "ระบุฝ่าย / ชมรมด้านล่าง"
      : (selectedType ? "เลือกฝ่าย / ชมรม" : "เลือกประเภทองค์กรก่อน");
    borrowProjectDept.appendChild(placeholder);

    if (!shouldUseOther && selectedType) {
      const options = collectBorrowOrgNameOptions(selectedType);
      options.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        borrowProjectDept.appendChild(option);
      });
      if (currentValue) {
        const hasCurrent = Array.from(borrowProjectDept.options).some((opt) => opt.value === currentValue);
        if (hasCurrent) borrowProjectDept.value = currentValue;
      }
    }
    toggleBorrowProjectDeptOther(shouldUseOther);
  };

  const getBorrowProjectNameValueForSubmit = () => {
    const selected = (borrowProjectName?.value || "").toString().trim();
    if (selected === OTHER_ORG_VALUE) {
      return (borrowProjectNameOther?.value || "").toString().trim();
    }
    return selected;
  };

  const getBorrowProjectDeptValueForSubmit = () => {
    const selectedType = (borrowProjectName?.value || "").toString().trim();
    if (selectedType === OTHER_ORG_VALUE) {
      return (borrowProjectDeptOther?.value || "").toString().trim();
    }
    return (borrowProjectDept?.value || "").toString().trim();
  };

  const normalizeOrgCode = (value) => {
    const raw = (value || "").toString().trim().toUpperCase().replace(/\s+/g, "");
    if (!raw) return "";
    const normalized = raw
      .replace(/-/g, ".")
      .replace(/\.{2,}/g, ".")
      .replace(/^\./, "")
      .replace(/\.$/, "");
    if (!/^[A-Z0-9.]+$/.test(normalized)) return "";
    return normalized;
  };

  const hasBorrowOrgCodeData = () => {
    const rows =
      typeof orgFilters !== "undefined" && Array.isArray(orgFilters) ? orgFilters : [];
    return rows.some((item) => normalizeOrgCode(item?.code || ""));
  };

  const ensureBorrowOrgCodeData = async () => {
    if (hasBorrowOrgCodeData()) return;
    if (typeof loadOrgFilters === "function") {
      try {
        await loadOrgFilters();
      } catch (_) {
        // ignore and fallback
      }
    }
    if (hasBorrowOrgCodeData()) return;
    if (typeof ensureProjectDataLoaded === "function") {
      try {
        await ensureProjectDataLoaded();
      } catch (_) {
        // ignore and fallback
      }
    }
  };

  const resolveBorrowOrgCode = () => {
    const selectedType = (borrowProjectName?.value || "").toString().trim();
    if (!selectedType || selectedType === OTHER_ORG_VALUE) return "CU.00";
    const selectedDept = getBorrowProjectDeptValueForSubmit();
    const rows =
      typeof orgFilters !== "undefined" && Array.isArray(orgFilters) ? orgFilters : [];
    if (!rows.length) return "";
    const exact = rows.find((item) => {
      const group = (item?.group || "").toString().trim();
      const name = (item?.name || "").toString().trim();
      return group === selectedType && name === selectedDept;
    });
    const exactCode = normalizeOrgCode(exact?.code || "");
    if (exactCode) return exactCode;
    const firstByGroup = rows.find((item) => {
      const group = (item?.group || "").toString().trim();
      return group === selectedType && normalizeOrgCode(item?.code || "");
    });
    const groupCode = normalizeOrgCode(firstByGroup?.code || "");
    return groupCode || "";
  };

  const getBorrowTermYearTwoDigits = (date = new Date()) => {
    const d = date instanceof Date ? date : new Date();
    if (Number.isNaN(d.getTime())) return "00";
    const beYear = d.getFullYear() + 543;
    const month = d.getMonth(); // 0-11
    const termStartYear = month >= 5 ? beYear : beYear - 1; // เริ่มนับวาระ 1 มิ.ย.
    return String(termStartYear % 100).padStart(2, "0");
  };

  const getNextBorrowRequestRunning = (prefix) => {
    const normalizedPrefix = (prefix || "").toString().trim();
    if (!normalizedPrefix) return "001";
    const expectedPrefix = `${normalizedPrefix}.`;
    let maxRunning = 0;
    borrowRequests.forEach((item) => {
      const requestNo = (item?.requestNo || "").toString().trim().toUpperCase();
      if (!requestNo.startsWith(expectedPrefix)) return;
      const runningText = requestNo.slice(expectedPrefix.length);
      if (!/^\d+$/.test(runningText)) return;
      const runningNum = Number(runningText);
      if (Number.isFinite(runningNum) && runningNum > maxRunning) {
        maxRunning = runningNum;
      }
    });
    return String(maxRunning + 1).padStart(3, "0");
  };

  const generateBorrowRequestNo = () => {
    const termYY = getBorrowTermYearTwoDigits(new Date());
    const orgCode = resolveBorrowOrgCode();
    if (!orgCode) return "";
    const prefix = `B${termYY}.${orgCode}`;
    const running = getNextBorrowRequestRunning(prefix);
    return `${prefix}.${running}`;
  };

  const readCurrentUserEmail = () =>
    (window.sgcuAuth?.auth?.currentUser?.email || "").toString().trim().toLowerCase();

  const readBorrowProfiles = () => {
    try {
      const rawPrimary = window.localStorage?.getItem(BORROW_PROFILE_STORAGE_KEY);
      const rawLegacy = window.localStorage?.getItem(LEGACY_BORROW_PROFILE_STORAGE_KEY);
      const raw = rawPrimary || rawLegacy;
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!rawPrimary && rawLegacy) {
        try {
          window.localStorage?.setItem(BORROW_PROFILE_STORAGE_KEY, JSON.stringify(parsed || {}));
        } catch (_) {
          // ignore local cache write errors
        }
      }
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  };

  const BORROW_PROFILE_EMPTY_TEXT = "ยังไม่พบข้อมูล";
  const setBorrowProfileText = (el, value) => {
    if (!el) return;
    const text = (value || "").toString().trim();
    el.textContent = text || BORROW_PROFILE_EMPTY_TEXT;
    el.classList.toggle("is-empty", !text);
  };

  const applyBorrowProfileToForm = (profile) => {
    if (!profile || typeof profile !== "object") return;
    activeBorrowProfile = {
      firstName: (profile.firstName || "").toString().trim(),
      lastName: (profile.lastName || "").toString().trim(),
      nickname: (profile.nickname || "").toString().trim(),
      studentId: (profile.studentId || "").toString().trim(),
      faculty: (profile.faculty || "").toString().trim(),
      year: (profile.year || "").toString().trim(),
      phone: (profile.phone || "").toString().trim(),
      lineId: (profile.lineId || "").toString().trim()
    };
    const fullName = [activeBorrowProfile.firstName, activeBorrowProfile.lastName].filter(Boolean).join(" ");
    setBorrowProfileText(borrowProfileFullNameEl, fullName);
    setBorrowProfileText(borrowProfileNicknameEl, activeBorrowProfile.nickname);
    setBorrowProfileText(borrowProfileStudentIdEl, activeBorrowProfile.studentId);
    if (borrowProfileFacultyYearEl) {
      const facultyYear = [activeBorrowProfile.faculty, activeBorrowProfile.year ? `ชั้นปี ${activeBorrowProfile.year}` : ""]
        .filter(Boolean)
        .join(" / ");
      setBorrowProfileText(borrowProfileFacultyYearEl, facultyYear);
    }
    setBorrowProfileText(borrowProfilePhoneEl, activeBorrowProfile.phone);
    setBorrowProfileText(borrowProfileLineIdEl, activeBorrowProfile.lineId);
  };

  const restoreBorrowProfileForCurrentUser = () => {
    const email = (currentUserEmail || "").toString().trim().toLowerCase();
    if (!email) {
      activeBorrowProfile = null;
      setBorrowProfileText(borrowProfileFullNameEl, "");
      setBorrowProfileText(borrowProfileNicknameEl, "");
      setBorrowProfileText(borrowProfileStudentIdEl, "");
      setBorrowProfileText(borrowProfileFacultyYearEl, "");
      setBorrowProfileText(borrowProfilePhoneEl, "");
      setBorrowProfileText(borrowProfileLineIdEl, "");
      return;
    }
    const profile = readBorrowProfiles()[email];
    if (!profile) {
      setBorrowProfileText(borrowProfileFullNameEl, "");
      setBorrowProfileText(borrowProfileNicknameEl, "");
      setBorrowProfileText(borrowProfileStudentIdEl, "");
      setBorrowProfileText(borrowProfileFacultyYearEl, "");
      setBorrowProfileText(borrowProfilePhoneEl, "");
      setBorrowProfileText(borrowProfileLineIdEl, "");
      return;
    }
    applyBorrowProfileToForm(profile);
  };

  const getBorrowProfileForSubmit = async () => {
    const email = (currentUserEmail || "").toString().trim().toLowerCase();
    if (!email) return null;
    if (activeBorrowProfile && activeBorrowProfile.firstName && activeBorrowProfile.lastName) {
      return activeBorrowProfile;
    }
    const local = readBorrowProfiles()[email];
    if (local) {
      applyBorrowProfileToForm(local);
      return activeBorrowProfile;
    }
    const remote = await readBorrowProfileFromFirestore();
    if (remote) {
      applyBorrowProfileToForm(remote);
      return activeBorrowProfile;
    }
    return null;
  };

  const readBorrowProfileFromFirestore = async () => {
    const firestoreBridge = window.sgcuFirestore || {};
    const authUser = window.sgcuAuth?.auth?.currentUser || null;
    const email = (authUser?.email || "").toString().trim().toLowerCase();
    const uid = (authUser?.uid || "").toString().trim();
    if (!email || !uid) return null;
    if (!firestoreBridge.db || !firestoreBridge.doc || !firestoreBridge.getDoc) return null;
    try {
      const ref = firestoreBridge.doc(firestoreBridge.db, USER_PROFILE_COLLECTION, uid);
      const snap = await firestoreBridge.getDoc(ref);
      if (!snap?.exists()) return null;
      const data = snap.data() || {};
      if (!data || typeof data !== "object") return null;
      const profiles = readBorrowProfiles();
      profiles[email] = {
        ...(profiles[email] || {}),
        ...data,
        updatedAt: Date.now()
      };
      try {
        window.localStorage?.setItem(BORROW_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
        window.localStorage?.setItem(LEGACY_BORROW_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
      } catch (_) {
        // ignore local cache write errors
      }
      return profiles[email];
    } catch (_) {
      return null;
    }
  };

  const hasStaffPermission = () => {
    if (typeof staffAuthUser !== "undefined" && !!staffAuthUser) return true;
    const email = readCurrentUserEmail();
    const currentHash = (window.location.hash || "").replace("#", "").trim();
    const isStaffBorrowPage = currentHash === "borrow-assets-staff";
    return !!email && isStaffBorrowPage;
  };

  const ensureStaffPermission = (silent = false) => {
    const ok = hasStaffPermission();
    if (!ok && !silent) {
      setStaffQueueMessage("บัญชีนี้ไม่มีสิทธิ์จัดการคิวคำขอ (Staff เท่านั้น)", "#b91c1c");
    }
    return ok;
  };

  const toYmd = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDateYmd = (value) => {
    const text = (value || "").toString().trim();
    if (!text) return null;
    const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = parseDateYmd(value);
    if (!date) return value;
    return date.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatDateRange = (pickupDate, returnDate) =>
    `${formatDate(pickupDate)} - ${formatDate(returnDate)}`;

  const getDayDiffFromToday = (value) => {
    const date = parseDateYmd(value);
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.round((date.getTime() - today.getTime()) / 86400000);
  };

  const summarizeAssetsInline = (assets = []) => {
    const list = Array.isArray(assets) ? assets : [];
    if (!list.length) return "-";
    return list
      .map((asset) => {
        const name = (asset?.name || asset?.code || "-").toString().trim();
        const qty = Number(asset?.qty || 0);
        const qtyText = Number.isFinite(qty) ? String(qty) : "0";
        const unit = (asset?.unit || "").toString().trim();
        return `${name} ${qtyText}${unit ? ` ${unit}` : ""}`.trim();
      })
      .join(", ");
  };

  const buildBorrowFollowupMeta = (item) => {
    if (!item || (item.status !== STATUS_APPROVED && item.status !== STATUS_RECEIVED)) {
      return {
        dayDiff: null,
        overdue: false,
        dueSoon: false,
        statusText: "ยังไม่ถึงขั้นติดตาม",
        badgeClass: "badge-approved"
      };
    }
    const dayDiff = getDayDiffFromToday(item.returnDate);
    if (dayDiff == null) {
      return {
        dayDiff: null,
        overdue: false,
        dueSoon: true,
        statusText: "ต้องติดตาม (ไม่พบวันคืน)",
        badgeClass: "badge-warning"
      };
    }
    if (dayDiff < 0) {
      return {
        dayDiff,
        overdue: true,
        dueSoon: true,
        statusText: `เกินกำหนด ${Math.abs(dayDiff)} วัน`,
        badgeClass: "badge-rejected"
      };
    }
    if (dayDiff === 0) {
      return {
        dayDiff,
        overdue: false,
        dueSoon: true,
        statusText: "ครบกำหนดวันนี้",
        badgeClass: "badge-warning"
      };
    }
    if (dayDiff <= BORROW_FOLLOWUP_SOON_DAYS) {
      return {
        dayDiff,
        overdue: false,
        dueSoon: true,
        statusText: `ครบกำหนดใน ${dayDiff} วัน`,
        badgeClass: "badge-pending"
      };
    }
    return {
      dayDiff,
      overdue: false,
      dueSoon: false,
      statusText: "ยังไม่ถึงกำหนดติดตาม",
      badgeClass: "badge-approved"
    };
  };

  const renderBorrowOverviewCards = (container, stats = {}) => {
    if (!container) return;
    const cards = [
      { title: "ยืมค้างทั้งหมด", value: stats.borrowed || 0, caption: "อนุมัติแล้วและยังไม่คืน" },
      { title: "เกินกำหนดคืน", value: stats.overdue || 0, caption: "ควรเร่งติดตามทันที" },
      { title: "ใกล้ครบกำหนด", value: stats.dueSoon || 0, caption: `ภายใน ${BORROW_FOLLOWUP_SOON_DAYS} วัน` },
      { title: "รออนุมัติ", value: stats.pending || 0, caption: "ยังอยู่ในคิวพิจารณา" }
    ];
    container.innerHTML = cards.map((card) => `
      <article class="card card-hover">
        <div class="card-title">${safeEscape(card.title)}</div>
        <div class="card-value">${safeEscape(String(card.value))}</div>
        <div class="card-caption">${safeEscape(card.caption)}</div>
      </article>
    `).join("");
  };

  const renderMyBorrowOverview = () => {
    if (!borrowOverviewCards && !borrowFollowupTableBody) return;
    if (!currentUserEmail) {
      renderBorrowOverviewCards(borrowOverviewCards, {
        borrowed: 0,
        overdue: 0,
        dueSoon: 0,
        pending: 0
      });
      if (borrowFollowupTableBody) {
        borrowFollowupTableBody.innerHTML = `
          <tr>
            <td colspan="3">กรุณาเข้าสู่ระบบเพื่อดูภาพรวมพัสดุที่ยืม</td>
          </tr>
        `;
      }
      return;
    }
    const mine = borrowRequests
      .filter((item) => !item.isDeleted)
      .filter((item) => (item.requesterEmail || "") === currentUserEmail);
    const pending = mine.filter((item) => item.status === STATUS_PENDING).length;
    const borrowed = mine.filter((item) => item.status === STATUS_APPROVED || item.status === STATUS_RECEIVED).length;
    const overdue = mine.filter((item) => buildBorrowFollowupMeta(item).overdue).length;
    const dueSoon = mine.filter((item) => {
      const meta = buildBorrowFollowupMeta(item);
      return meta.dueSoon && !meta.overdue;
    }).length;
    renderBorrowOverviewCards(borrowOverviewCards, { pending, borrowed, overdue, dueSoon });

    if (!borrowFollowupTableBody) return;
    const followups = mine
      .map((item) => ({ item, meta: buildBorrowFollowupMeta(item) }))
      .filter((entry) => entry.meta.dueSoon)
      .sort((a, b) => {
        if (a.meta.overdue !== b.meta.overdue) return a.meta.overdue ? -1 : 1;
        const aDiff = a.meta.dayDiff == null ? -9999 : a.meta.dayDiff;
        const bDiff = b.meta.dayDiff == null ? -9999 : b.meta.dayDiff;
        return aDiff - bDiff;
      });
    if (!followups.length) {
      borrowFollowupTableBody.innerHTML = `
        <tr>
          <td colspan="3">ยังไม่มีรายการที่ต้องติดตาม</td>
        </tr>
      `;
      return;
    }
    borrowFollowupTableBody.innerHTML = followups.map(({ item, meta }) => `
      <tr>
        <td>
          <div class="borrow-followup-item">${safeEscape(summarizeAssetsInline(item.assets))}</div>
          <div class="borrow-followup-item-sub">เลขที่คำขอ: ${safeEscape(item.requestNo || item.id || "-")}</div>
        </td>
        <td>${safeEscape(formatDate(item.returnDate || ""))}</td>
        <td><span class="badge ${safeEscape(meta.badgeClass)}">${safeEscape(meta.statusText)}</span></td>
      </tr>
    `).join("");
  };

  const renderStaffBorrowOverview = () => {
    if (!staffBorrowOverviewCards && !staffBorrowFollowupTableBody) return;
    const allItems = borrowRequests.filter((item) => !item.isDeleted);
    const pending = allItems.filter((item) => item.status === STATUS_PENDING).length;
    const borrowed = allItems.filter((item) => item.status === STATUS_APPROVED || item.status === STATUS_RECEIVED).length;
    const overdue = allItems.filter((item) => buildBorrowFollowupMeta(item).overdue).length;
    const dueSoon = allItems.filter((item) => {
      const meta = buildBorrowFollowupMeta(item);
      return meta.dueSoon && !meta.overdue;
    }).length;
    renderBorrowOverviewCards(staffBorrowOverviewCards, { pending, borrowed, overdue, dueSoon });

    if (!staffBorrowFollowupTableBody) return;
    const followups = allItems
      .map((item) => ({ item, meta: buildBorrowFollowupMeta(item) }))
      .filter((entry) => entry.meta.dueSoon)
      .sort((a, b) => {
        if (a.meta.overdue !== b.meta.overdue) return a.meta.overdue ? -1 : 1;
        const aDiff = a.meta.dayDiff == null ? -9999 : a.meta.dayDiff;
        const bDiff = b.meta.dayDiff == null ? -9999 : b.meta.dayDiff;
        return aDiff - bDiff;
      });
    if (!followups.length) {
      staffBorrowFollowupTableBody.innerHTML = `
        <tr>
          <td colspan="5">ยังไม่มีรายการที่ต้องติดตาม</td>
        </tr>
      `;
      return;
    }
    staffBorrowFollowupTableBody.innerHTML = followups.map(({ item, meta }) => {
      const requesterName = [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "-";
      return `
        <tr class="borrow-staff-row">
          <td>${safeEscape(item.requestNo || item.id || "-")}</td>
          <td>${safeEscape(requesterName)}</td>
          <td>${safeEscape(summarizeAssetsInline(item.assets))}</td>
          <td>${safeEscape(formatDate(item.returnDate || ""))}</td>
          <td><span class="badge ${safeEscape(meta.badgeClass)}">${safeEscape(meta.statusText)}</span></td>
        </tr>
      `;
    }).join("");
  };

  const timestampToMillis = (ts) => {
    if (!ts) return 0;
    if (typeof ts === "number" && Number.isFinite(ts)) return ts;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (typeof ts.seconds === "number") {
      return (ts.seconds * 1000) + Math.floor((ts.nanoseconds || 0) / 1000000);
    }
    return 0;
  };

  const normalizeRequestStatus = (value) => {
    const normalized = (value || STATUS_PENDING).toString().trim().toLowerCase();
    if (
      normalized === STATUS_PENDING ||
      normalized === STATUS_APPROVED ||
      normalized === STATUS_RECEIVED ||
      normalized === STATUS_REJECTED ||
      normalized === STATUS_CANCELLED ||
      normalized === STATUS_RETURNED
    ) {
      return normalized;
    }
    return STATUS_PENDING;
  };

  const isReservedStockStatus = (status) => {
    const normalized = normalizeRequestStatus(status);
    return normalized === STATUS_APPROVED || normalized === STATUS_RECEIVED;
  };

  const toSafeInt = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.trunc(num));
  };

  const buildAssetQtyByCode = (assets = []) => {
    const qtyByCode = new Map();
    if (!Array.isArray(assets)) return qtyByCode;
    assets.forEach((asset) => {
      const code = (asset?.code || "").toString().trim().toUpperCase();
      if (!code) return;
      const qty = toSafeInt(asset?.qty);
      if (!qty) return;
      qtyByCode.set(code, (qtyByCode.get(code) || 0) + qty);
    });
    return qtyByCode;
  };

  const buildReservationDeltas = (prevStatus, nextStatus, assets = []) => {
    const wasReserved = isReservedStockStatus(prevStatus);
    const willBeReserved = isReservedStockStatus(nextStatus);
    if (wasReserved === willBeReserved) return new Map();
    const sign = willBeReserved ? 1 : -1;
    const qtyByCode = buildAssetQtyByCode(assets);
    const deltas = new Map();
    qtyByCode.forEach((qty, code) => {
      deltas.set(code, qty * sign);
    });
    return deltas;
  };

  const applyStockDeltasInTransaction = async (transaction, deltas, actorEmail = "") => {
    if (!deltas.size) return;
    for (const [code, delta] of deltas.entries()) {
      if (!code || !delta) continue;
      const catalogRow = assetRowMap.get(code);
      const maxRemaining = Number(catalogRow?.remaining);
      const hasFiniteLimit = Number.isFinite(maxRemaining) && maxRemaining >= 0;
      if (!hasFiniteLimit) continue;

      const stockRef = firestore.doc(firestore.db, BORROW_ASSET_STOCK_COLLECTION, code);
      const stockSnap = await transaction.get(stockRef);
      const currentReserved = toSafeInt(stockSnap.data()?.reserved);
      let nextReserved = currentReserved + delta;

      if (ENABLE_ASSET_AVAILABILITY_CHECK && delta > 0 && nextReserved > maxRemaining) {
        const err = new Error(`พัสดุ ${code} คงเหลือไม่พอ`);
        err.code = "resource-exhausted";
        err.assetCode = code;
        err.available = Math.max(0, maxRemaining - currentReserved);
        throw err;
      }
      if (nextReserved < 0) nextReserved = 0;

      transaction.set(
        stockRef,
        {
          code,
          reserved: nextReserved,
          maxRemaining,
          updatedBy: actorEmail || "",
          updatedAt: firestore.serverTimestamp()
        },
        { merge: true }
      );
    }
  };

  const normalizeDeletedFlag = (value) => {
    if (typeof value === "boolean") return value;
    const normalized = (value || "").toString().trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "y";
  };

  const statusBadge = (status) => {
    if (status === STATUS_APPROVED) {
      return '<span class="badge badge-approved">อนุมัติแล้ว</span>';
    }
    if (status === STATUS_RECEIVED) {
      return '<span class="badge badge-approved">รับของแล้ว</span>';
    }
    if (status === STATUS_REJECTED) {
      return '<span class="badge badge-rejected">ไม่อนุมัติ</span>';
    }
    if (status === STATUS_CANCELLED) {
      return '<span class="badge badge-warning">ยกเลิก</span>';
    }
    if (status === STATUS_RETURNED) {
      return '<span class="badge badge-approved">คืนแล้ว</span>';
    }
    return '<span class="badge badge-pending">รออนุมัติ</span>';
  };

  const buildSearchText = (row) => {
    if (row.searchText) return row.searchText;
    const searchText = [
      row.type,
      row.code,
      row.name,
      row.location,
      row.remaining,
      row.unit,
      row.approvedText,
      row.note
    ]
      .map((value) => (value == null ? "" : String(value).toLowerCase()))
      .join(" ");
    row.searchText = searchText;
    return searchText;
  };

  const filterBorrowAssetsRows = ({ term, type }) => {
    const normalized = term.trim().toLowerCase();
    const normalizedType = type === "all" ? "" : type.trim().toLowerCase();
    return borrowAssetsRows.filter((row) => {
      const typeMatch =
        !normalizedType || (row.type || "").toLowerCase() === normalizedType;
      const searchMatch =
        !normalized || buildSearchText(row).includes(normalized);
      return typeMatch && searchMatch;
    });
  };

  const renderBorrowAssetsTable = (rows) => {
    if (!borrowAssetsTableBody) return;
    if (!rows.length) {
      borrowAssetsTableBody.innerHTML = `
        <tr>
          <td colspan="6">ไม่พบรายการพัสดุ</td>
        </tr>
      `;
      return;
    }
    borrowAssetsTableBody.innerHTML = rows
      .map((row) => {
        const remainingText =
          row.remaining != null
            ? `${row.remaining}${row.unit ? ` ${row.unit}` : ""}`
            : "-";
        return `
          <tr>
            <td>${safeEscape(row.type || "-")}</td>
            <td>${safeEscape(row.code || "-")}</td>
            <td>${safeEscape(row.name || "-")}</td>
            <td>${safeEscape(row.location || "-")}</td>
            <td>${safeEscape(remainingText)}</td>
            <td>${safeEscape(row.note || "-")}</td>
          </tr>
        `;
      })
      .join("");
  };

  const renderBorrowAssetsTableStaff = (rows) => {
    if (!borrowAssetsTableBodyStaff) return;
    if (!rows.length) {
      borrowAssetsTableBodyStaff.innerHTML = `
        <tr>
          <td colspan="11">ไม่พบรายการพัสดุ</td>
        </tr>
      `;
      return;
    }
    borrowAssetsTableBodyStaff.innerHTML = rows
      .map((row) => `
        <tr>
          <td>${safeEscape(row.type || "-")}</td>
          <td>${safeEscape(row.code || "-")}</td>
          <td>${safeEscape(row.name || "-")}</td>
          <td>${safeEscape(row.location || "-")}</td>
          <td>${safeEscape(row.total != null ? row.total : "-")}</td>
          <td>${safeEscape(row.approvedText || "-")}</td>
          <td>${safeEscape(row.borrowed != null ? row.borrowed : "-")}</td>
          <td>${safeEscape(row.damaged != null ? row.damaged : "-")}</td>
          <td>${safeEscape(row.remaining != null ? row.remaining : "-")}</td>
          <td>${safeEscape(row.unit || "-")}</td>
          <td>${safeEscape(row.note || "-")}</td>
        </tr>
      `)
      .join("");
  };

  const applyBorrowAssetsFilters = () => {
    if (borrowAssetsTableBody) {
      const term = borrowAssetsSearch ? borrowAssetsSearch.value : "";
      const type = borrowAssetsTypeFilter ? borrowAssetsTypeFilter.value : "all";
      const rows = filterBorrowAssetsRows({ term, type });
      renderBorrowAssetsTable(rows);
      if (borrowAssetsCount) {
        borrowAssetsCount.textContent = `พบ ${rows.length} รายการ`;
      }
    }
    if (borrowAssetsTableBodyStaff) {
      const term = borrowAssetsSearchStaff ? borrowAssetsSearchStaff.value : "";
      const type = borrowAssetsTypeFilterStaff ? borrowAssetsTypeFilterStaff.value : "all";
      const rows = filterBorrowAssetsRows({ term, type });
      renderBorrowAssetsTableStaff(rows);
      if (borrowAssetsCountStaff) {
        borrowAssetsCountStaff.textContent = `พบ ${rows.length} รายการ`;
      }
    }
  };

  const syncTypeOptions = (types) => {
    const sorted = Array.from(new Set(types)).sort((a, b) => a.localeCompare(b, "th"));
    const populateSelect = (selectEl) => {
      if (!selectEl) return;
      while (selectEl.options.length > 1) {
        selectEl.remove(1);
      }
      sorted.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        selectEl.appendChild(option);
      });
    };
    populateSelect(borrowAssetsTypeFilter);
    populateSelect(borrowAssetsTypeFilterStaff);
  };

  const loadBorrowAssets = () => {
    if (!USE_CSV_ASSET_CATALOG) {
      borrowAssetsRows = [];
      assetMap.clear();
      assetRowMap.clear();
      if (borrowAssetsTableBody) {
        borrowAssetsTableBody.innerHTML = `
          <tr>
            <td colspan="6">ปิดการใช้งานข้อมูลพัสดุจาก CSV ชั่วคราว</td>
          </tr>
        `;
      }
      if (borrowAssetsTableBodyStaff) {
        borrowAssetsTableBodyStaff.innerHTML = `
          <tr>
            <td colspan="11">ปิดการใช้งานข้อมูลพัสดุจาก CSV ชั่วคราว</td>
          </tr>
        `;
      }
      if (borrowAssetsCount) borrowAssetsCount.textContent = "ปิดการใช้งาน CSV ชั่วคราว";
      if (borrowAssetsCountStaff) borrowAssetsCountStaff.textContent = "ปิดการใช้งาน CSV ชั่วคราว";
      return;
    }
    if (!window.Papa || !window.fetch) return;
    fetch(BORROW_ASSETS_CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        const result = window.Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });
        if (result.errors && result.errors.length) return;
        const rows = result.data
          .map((item) => {
            const type = (item["ประเภท"] || "").trim();
            const code = (item["รหัสพัสดุ"] || "").trim().toUpperCase();
            const name = (item["รายการ"] || "").trim();
            const location = (item["ที่เก็บ"] || "").trim();
            const approved = normalizeBool(item["อนุมัติการยืม"]);
            const approvedText = (item["อนุมัติการยืม"] || "").toString().trim();
            const total = parseNumber(item["จำนวนทั้งหมด"]);
            const borrowed = parseNumber(item["ยืมอยู่"]);
            const damaged = parseNumber(item["ชำรุด"]);
            const remaining = parseNumber(item["คงเหลือ"]);
            const unit = (item["หน่วย"] || "").trim();
            const note = (item["หมายเหตุ"] || "").trim();
            return {
              type,
              code,
              name,
              location,
              approved,
              approvedText,
              total,
              borrowed,
              damaged,
              remaining,
              unit,
              note
            };
          })
          .filter((row) => row.code || row.name);

        borrowAssetsRows = rows;
        assetMap.clear();
        assetRowMap.clear();
        rows.forEach((row) => {
          if (row.code && row.name) {
            assetMap.set(row.code, row.name);
            assetRowMap.set(row.code, row);
          }
        });
        syncTypeOptions(rows.map((row) => row.type).filter(Boolean));
        applyBorrowAssetsFilters();
        if (borrowAssetList) {
          borrowAssetList.querySelectorAll("[data-asset-row]").forEach((row) => {
            const codeInput = row.querySelector('[data-asset-field="code"]');
            if (codeInput) codeInput.dispatchEvent(new Event("input"));
          });
        }
      })
      .catch(() => {
        if (borrowAssetsTableBody) {
          borrowAssetsTableBody.innerHTML = `
            <tr>
              <td colspan="6">ไม่สามารถโหลดรายการพัสดุได้</td>
            </tr>
          `;
        }
        if (borrowAssetsTableBodyStaff) {
          borrowAssetsTableBodyStaff.innerHTML = `
            <tr>
              <td colspan="11">ไม่สามารถโหลดรายการพัสดุได้</td>
            </tr>
          `;
        }
      });
  };

  const updateRowIds = (row, index) => {
    row.querySelectorAll("[data-asset-field]").forEach((input) => {
      const field = input.dataset.assetField;
      const id = `borrowAsset${field.charAt(0).toUpperCase()}${field.slice(1)}-${index}`;
      input.id = id;
      const label = row.querySelector(`[data-asset-label="${field}"]`);
      if (label) label.setAttribute("for", id);
    });
  };

  const bindRow = (row) => {
    const codeInput = row.querySelector('[data-asset-field="code"]');
    const nameInput = row.querySelector('[data-asset-field="name"]');
    const warning = row.querySelector("[data-asset-warning]");
    const removeBtn = row.querySelector("[data-asset-remove]");
    if (!codeInput || !nameInput) return;

    const setWarningState = (visible, text = "", color = "#b91c1c") => {
      if (!warning) return;
      warning.textContent = text;
      warning.style.color = color;
      warning.hidden = !visible;
    };

    const setNameManualMode = (manualMode) => {
      nameInput.readOnly = !manualMode;
      nameInput.required = true;
      nameInput.placeholder = manualMode
        ? "กรอกชื่อพัสดุ"
        : "ระบบจะแสดงชื่อพัสดุอัตโนมัติ";
    };

    const updateName = () => {
      if (!USE_CSV_ASSET_CATALOG) {
        setNameManualMode(true);
        setWarningState(false);
        return;
      }
      const code = codeInput.value.trim().toUpperCase();
      if (!code) {
        setNameManualMode(true);
        setWarningState(false);
        return;
      }
      const name = assetMap.get(code);
      if (name) {
        nameInput.value = name;
        setNameManualMode(false);
        setWarningState(false);
        return;
      }
      setNameManualMode(true);
      setWarningState(
        true,
        "ไม่พบรหัสพัสดุในรายการ สามารถกรอกชื่อพัสดุแทนได้",
        "#92400e"
      );
    };

    codeInput.addEventListener("input", updateName);
    codeInput.addEventListener("blur", updateName);
    codeInput.required = false;
    if (!USE_CSV_ASSET_CATALOG) {
      setNameManualMode(true);
      setWarningState(false);
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        const rows = borrowAssetList.querySelectorAll("[data-asset-row]");
        if (rows.length <= 1) return;
        row.remove();
      });
    }
  };

  const resetAssetRows = () => {
    if (!borrowAssetList) return;
    const rows = Array.from(borrowAssetList.querySelectorAll("[data-asset-row]"));
    if (!rows.length) return;
    rows.slice(1).forEach((row) => row.remove());
    const firstRow = rows[0];
    updateRowIds(firstRow, 1);
    firstRow.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
    const warning = firstRow.querySelector("[data-asset-warning]");
    if (warning) warning.hidden = true;
    const removeBtn = firstRow.querySelector("[data-asset-remove]");
    if (removeBtn) removeBtn.hidden = true;
  };

  const collectAssetItems = () => {
    if (!borrowAssetList) {
      return { ok: false, message: "ไม่พบฟอร์มรายการพัสดุ" };
    }
    const rows = Array.from(borrowAssetList.querySelectorAll("[data-asset-row]"));
    const assetItems = [];
    const requestByCode = new Map();

    for (const row of rows) {
      const codeInput = row.querySelector('[data-asset-field="code"]');
      const nameInput = row.querySelector('[data-asset-field="name"]');
      const qtyInput = row.querySelector('[data-asset-field="qty"]');
      const warning = row.querySelector("[data-asset-warning]");
      if (!codeInput || !nameInput || !qtyInput) continue;

      const code = codeInput.value.trim().toUpperCase();
      const qty = Number(qtyInput.value);
      const mappedName = assetMap.get(code);
      const assetRow = assetRowMap.get(code);
      if (USE_CSV_ASSET_CATALOG) {
        const typedName = nameInput.value.trim();
        if (!code) {
          if (!typedName) {
            return { ok: false, message: "กรุณากรอกชื่อพัสดุเมื่อไม่ระบุรหัสพัสดุ" };
          }
          if (warning) warning.hidden = true;
        } else if (!mappedName || !assetRow) {
          if (!typedName) {
            if (warning) warning.hidden = false;
            return { ok: false, message: "ไม่พบรหัสพัสดุ กรุณากรอกชื่อพัสดุแทน" };
          }
          if (warning) {
            warning.hidden = false;
            warning.textContent = "ไม่พบรหัสพัสดุในรายการ ระบบจะใช้ชื่อพัสดุที่กรอกแทน";
            warning.style.color = "#92400e";
          }
        } else {
          nameInput.value = mappedName;
          if (warning) warning.hidden = true;
        }
      } else {
        if (!code || !nameInput.value.trim()) {
          return { ok: false, message: "กรุณากรอกรหัสพัสดุและชื่อพัสดุให้ครบ" };
        }
        if (warning) warning.hidden = true;
      }
      if (!Number.isFinite(qty) || qty <= 0) {
        qtyInput.focus();
        return { ok: false, message: `จำนวนของ ${code} ต้องมากกว่า 0` };
      }
      if (USE_CSV_ASSET_CATALOG && ENABLE_ASSET_AVAILABILITY_CHECK) {
        if (code && assetRow) {
          if (assetRow.remaining != null) {
            const currentRequested = requestByCode.get(code) || 0;
            const nextRequested = currentRequested + qty;
            if (nextRequested > assetRow.remaining) {
              qtyInput.focus();
              return {
                ok: false,
                message: `พัสดุ ${code} คงเหลือ ${assetRow.remaining} ${assetRow.unit || ""}`.trim()
              };
            }
            requestByCode.set(code, nextRequested);
          }
        }
      }

      assetItems.push({
        code,
        name: USE_CSV_ASSET_CATALOG
          ? ((mappedName && assetRow) ? mappedName : nameInput.value.trim())
          : nameInput.value.trim(),
        qty: Math.trunc(qty),
        unit: USE_CSV_ASSET_CATALOG ? ((code && assetRow) ? (assetRow.unit || "") : "") : ""
      });
    }

    if (!assetItems.length) {
      return { ok: false, message: "กรุณาเพิ่มรายการพัสดุอย่างน้อย 1 รายการ" };
    }
    return { ok: true, items: assetItems };
  };

  const renderMyRequests = () => {
    if (!myRequestsTableBody) return;
    if (!currentUserEmail) {
      myRequestsTableBody.innerHTML = `
        <tr>
          <td colspan="4">กรุณาเข้าสู่ระบบด้วยอีเมลจุฬาฯ เพื่อดูสถานะคำขอของตนเอง</td>
        </tr>
      `;
      return;
    }
    const list = borrowRequests
      .filter((item) => !item.isDeleted)
      .filter((item) => (item.requesterEmail || "") === currentUserEmail)
      .sort((a, b) => (b.submittedAtMs || 0) - (a.submittedAtMs || 0));
    if (!list.length) {
      myRequestsTableBody.innerHTML = `
        <tr>
          <td colspan="4">ยังไม่มีคำขอยืมพัสดุ</td>
        </tr>
      `;
      return;
    }
    myRequestsTableBody.innerHTML = list.map((item) => {
      const itemsText = (item.assets || [])
        .map((asset) => `${safeEscape(asset.name || asset.code || "-")} ${safeEscape(asset.qty || 0)} ${safeEscape(asset.unit || "")}`.trim())
        .join("<br />");
      const noteText =
        (item.status === STATUS_APPROVED && !item.staffNote)
          ? "รับพัสดุตามเวลาที่ระบุในระบบ"
          : (item.status === STATUS_RECEIVED && !item.staffNote)
            ? "รับพัสดุเรียบร้อยแล้ว"
          : (item.status === STATUS_CANCELLED && !item.staffNote)
            ? "ยกเลิกคำขอโดยเจ้าหน้าที่"
          : (item.status === STATUS_RETURNED && !item.staffNote)
            ? "ส่งคืนพัสดุเรียบร้อยแล้ว"
            : (item.status === STATUS_PENDING && !item.staffNote)
              ? "เจ้าหน้าที่กำลังตรวจสอบคำขอ"
              : (item.staffNote || "-");
      return `
        <tr
          class="borrow-my-request-row"
          data-request-id="${safeEscape(item.id || "")}"
          data-request-source="${safeEscape(item.sourceCollection || "")}"
          tabindex="0"
          role="button"
          aria-label="ดูรายละเอียดคำขอ ${safeEscape(item.id || "-")}"
        >
          <td>${itemsText}</td>
          <td>${safeEscape(formatDateRange(item.pickupDate, item.returnDate))}</td>
          <td>${statusBadge(item.status)}</td>
          <td>${safeEscape(noteText)}</td>
        </tr>
      `;
    }).join("");
  };

  const renderStaffSummary = () => {
    if (staffSummaryCards.length < 3) return;
    const dayKeyBangkok = (dateObj) => {
      if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return "";
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(dateObj);
    };
    const todayYmd = dayKeyBangkok(new Date());
    const approvedToday = borrowRequests.filter((item) =>
      (item.status === STATUS_APPROVED || item.status === STATUS_RECEIVED) &&
      dayKeyBangkok(new Date(item.updatedAtMs || 0)) === todayYmd
    ).length;
    const pendingCount = borrowRequests.filter((item) => item.status === STATUS_PENDING).length;
    const borrowedCount = borrowRequests.filter((item) => item.status === STATUS_APPROVED || item.status === STATUS_RECEIVED).length;
    staffSummaryCards[0].textContent = String(approvedToday);
    staffSummaryCards[1].textContent = String(pendingCount);
    staffSummaryCards[2].textContent = String(borrowedCount);
  };

  const borrowStatusOptionLabel = (value) => {
    if (value === STATUS_APPROVED) return "อนุมัติแล้ว";
    if (value === STATUS_RECEIVED) return "รับของแล้ว";
    if (value === STATUS_REJECTED) return "ไม่อนุมัติ";
    if (value === STATUS_CANCELLED) return "ยกเลิก";
    if (value === STATUS_RETURNED) return "คืนแล้ว";
    if (value === "delete") return "ลบคำขอ";
    return "รออนุมัติ";
  };

  const borrowStatusSelectClass = (value) => {
    if (value === STATUS_APPROVED || value === STATUS_RECEIVED || value === STATUS_RETURNED) return "is-approved";
    if (value === STATUS_REJECTED) return "is-rejected";
    if (value === STATUS_CANCELLED) return "is-cancel-requested";
    if (value === "delete") return "is-delete";
    return "is-pending";
  };

  const renderRequesterCell = (item) => {
    const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "-";
    const projectMeta = [item.projectName, item.projectDept].filter(Boolean).join(" • ");
    const activityMeta = (item.projectDetail || "").toString().trim();
    const contactMeta = [item.phone, item.lineId ? `Line: ${item.lineId}` : ""]
      .filter(Boolean)
      .join(" • ");
    return `
      <div class="borrow-staff-requester">
        <div class="borrow-staff-requester-name">${safeEscape(fullName)}</div>
        ${projectMeta ? `<div class="borrow-staff-requester-meta">${safeEscape(projectMeta)}</div>` : ""}
        ${activityMeta ? `<div class="borrow-staff-requester-meta">${safeEscape(activityMeta)}</div>` : ""}
        ${contactMeta ? `<div class="borrow-staff-requester-contact">${safeEscape(contactMeta)}</div>` : ""}
      </div>
    `;
  };

  const renderAssetsCell = (assets = [], staffNote = "") => {
    const list = Array.isArray(assets) ? assets : [];
    if (!list.length) {
      return `<div class="borrow-staff-items-empty">ไม่มีรายการพัสดุ</div>`;
    }
    const totalQty = list.reduce((sum, asset) => {
      const qty = Number(asset?.qty || 0);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
    const rowsHtml = list.map((asset) => {
      const name = asset?.name || asset?.code || "-";
      const qty = Number(asset?.qty || 0);
      const qtyText = Number.isFinite(qty) ? String(qty) : "0";
      return `
        <div class="borrow-staff-item-row">
          <span class="borrow-staff-item-name">${safeEscape(name)}</span>
          <span class="borrow-staff-item-qty">${safeEscape(qtyText)} ${safeEscape(asset?.unit || "")}</span>
        </div>
      `;
    }).join("");
    const noteLine = (staffNote || "").toString().trim()
      ? `<div class="borrow-staff-items-note">หมายเหตุ: ${safeEscape(staffNote)}</div>`
      : "";
    return `
      <div class="borrow-staff-items">
        ${rowsHtml}
        <div class="borrow-staff-items-total">รวม ${safeEscape(totalQty)} ชิ้น</div>
        ${noteLine}
      </div>
    `;
  };

  const renderPeriodCell = (item) => `
    <div class="borrow-staff-period">
      <div class="borrow-staff-period-row"><span class="borrow-staff-period-label">รับ</span><span>${safeEscape(formatDate(item.pickupDate || ""))}</span></div>
      <div class="borrow-staff-period-row"><span class="borrow-staff-period-label">คืน</span><span>${safeEscape(formatDate(item.returnDate || ""))}</span></div>
    </div>
  `;

  const renderFollowupCell = (item) => {
    const meta = buildBorrowFollowupMeta(item);
    if ((item?.status !== STATUS_APPROVED && item?.status !== STATUS_RECEIVED) || !meta.dueSoon) return "-";
    return `<span class="badge ${safeEscape(meta.badgeClass)}">${safeEscape(meta.statusText)}</span>`;
  };

  let staffRequestTabMode = "queue";
  const setStaffRequestPanelMeta = () => {
    if (staffRequestPanelTitleEl) {
      staffRequestPanelTitleEl.textContent = staffRequestTabMode === "history"
        ? "ประวัติการขอ"
        : "รายการขอยืมพัสดุ";
    }
    if (staffRequestPanelCaptionEl) {
      staffRequestPanelCaptionEl.textContent = staffRequestTabMode === "history"
        ? "แสดงคำขอที่ดำเนินการแล้ว"
        : "ตรวจสอบรายละเอียดก่อนกดอนุมัติ/ตีกลับ";
    }
  };

  const renderStaffQueue = () => {
    if (!staffQueueTableBody) return;
    setStaffRequestPanelMeta();
    const list = [...borrowRequests]
      .filter((item) => !item.isDeleted)
      .filter((item) => STAFF_REQUEST_TAB_STATUSES.has(item.status))
      .sort((a, b) => (b.submittedAtMs || 0) - (a.submittedAtMs || 0));
    if (staffRequestTabMode !== "queue") {
      renderStaffSummary();
      return;
    }
    if (!list.length) {
      staffQueueTableBody.innerHTML = `
        <tr>
          <td colspan="6">ยังไม่มีคำขอในระบบ</td>
        </tr>
      `;
      renderStaffSummary();
      return;
    }

    staffQueueTableBody.innerHTML = list.map((item) => {
      const actionHtml = `
        <select
          class="staff-status-select borrow-staff-status-select ${borrowStatusSelectClass(item.status)}"
          data-role="borrow-status-select"
          data-id="${safeEscape(item.id)}"
          data-source="${safeEscape(item.sourceCollection || "")}"
          aria-label="จัดการสถานะคำขอยืมพัสดุ"
        >
          <option value="${STATUS_PENDING}" ${item.status === STATUS_PENDING ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_PENDING)}</option>
          <option value="${STATUS_APPROVED}" ${item.status === STATUS_APPROVED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_APPROVED)}</option>
          <option value="${STATUS_RECEIVED}" ${item.status === STATUS_RECEIVED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_RECEIVED)}</option>
          <option value="${STATUS_REJECTED}" ${item.status === STATUS_REJECTED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_REJECTED)}</option>
          <option value="${STATUS_CANCELLED}" ${item.status === STATUS_CANCELLED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_CANCELLED)}</option>
          <option value="${STATUS_RETURNED}" ${item.status === STATUS_RETURNED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_RETURNED)}</option>
          <option value="delete">${borrowStatusOptionLabel("delete")}</option>
        </select>
      `;

      return `
        <tr class="borrow-staff-row" data-request-id="${safeEscape(item.id)}" data-request-source="${safeEscape(item.sourceCollection || "")}">
          <td>${safeEscape(formatDate(item.createdDate || ""))}</td>
          <td>${renderRequesterCell(item)}</td>
          <td>${renderAssetsCell(item.assets, "")}</td>
          <td>${renderPeriodCell(item)}</td>
          <td>${renderFollowupCell(item)}</td>
          <td><div class="borrow-staff-actions">${actionHtml}</div></td>
        </tr>
      `;
    }).join("");
    renderStaffSummary();
  };

  const renderStaffHistory = () => {
    if (!staffQueueTableBody) return;
    const historyList = [...borrowRequests]
      .filter((item) => !item.isDeleted)
      .filter((item) => STAFF_HISTORY_TAB_STATUSES.has(item.status))
      .sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
    if (staffRequestTabMode !== "history") {
      if (staffHistoryTableBody) {
        if (!historyList.length) {
          staffHistoryTableBody.innerHTML = `
            <tr>
              <td colspan="6">ยังไม่มีประวัติคำขอ</td>
            </tr>
          `;
        } else {
          staffHistoryTableBody.innerHTML = "";
        }
      }
      return;
    }
    if (!historyList.length) {
      staffQueueTableBody.innerHTML = `
        <tr>
          <td colspan="6">ยังไม่มีประวัติคำขอ</td>
        </tr>
      `;
      if (staffHistoryTableBody) {
        staffHistoryTableBody.innerHTML = staffQueueTableBody.innerHTML;
      }
      return;
    }
    const html = historyList.map((item) => {
      const actionHtml = `
        <select
          class="staff-status-select borrow-staff-status-select ${borrowStatusSelectClass(item.status)}"
          data-role="borrow-status-select"
          data-id="${safeEscape(item.id)}"
          data-source="${safeEscape(item.sourceCollection || "")}"
          aria-label="จัดการสถานะคำขอยืมพัสดุ"
        >
          <option value="${STATUS_PENDING}" ${item.status === STATUS_PENDING ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_PENDING)}</option>
          <option value="${STATUS_APPROVED}" ${item.status === STATUS_APPROVED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_APPROVED)}</option>
          <option value="${STATUS_RECEIVED}" ${item.status === STATUS_RECEIVED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_RECEIVED)}</option>
          <option value="${STATUS_REJECTED}" ${item.status === STATUS_REJECTED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_REJECTED)}</option>
          <option value="${STATUS_CANCELLED}" ${item.status === STATUS_CANCELLED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_CANCELLED)}</option>
          <option value="${STATUS_RETURNED}" ${item.status === STATUS_RETURNED ? "selected" : ""}>${borrowStatusOptionLabel(STATUS_RETURNED)}</option>
          <option value="delete">${borrowStatusOptionLabel("delete")}</option>
        </select>
      `;
      return `
        <tr
          class="borrow-staff-row borrow-history-row"
          data-request-id="${safeEscape(item.id)}"
          data-request-source="${safeEscape(item.sourceCollection || "")}"
          tabindex="0"
          role="button"
          aria-label="ดูรายละเอียดคำขอ ${safeEscape(item.requestNo || item.id || "-")}"
        >
          <td>${safeEscape(formatDate(item.createdDate || ""))}</td>
          <td>${renderRequesterCell(item)}</td>
          <td>${renderAssetsCell(item.assets, item.staffNote || "")}</td>
          <td>${renderPeriodCell(item)}</td>
          <td>${renderFollowupCell(item)}</td>
          <td><div class="borrow-staff-actions">${actionHtml}</div></td>
        </tr>
      `;
    }).join("");
    staffQueueTableBody.innerHTML = html;
    if (staffHistoryTableBody) {
      staffHistoryTableBody.innerHTML = html;
    }
  };

  const setStaffQueueStatusMessage = (text) => {
    if (!staffQueueTableBody) return;
    staffQueueTableBody.innerHTML = `
      <tr>
        <td colspan="6">${safeEscape(text || "-")}</td>
      </tr>
    `;
  };

  const borrowActionModalEl = (() => {
    const existing = document.getElementById("borrowStaffActionModal");
    if (existing) return existing;
    const modal = document.createElement("div");
    modal.id = "borrowStaffActionModal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-labelledby", "borrowStaffActionTitle");
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <div>
            <div id="borrowStaffActionTitle" class="modal-title">จัดการคำขอยืมพัสดุ</div>
            <div id="borrowStaffActionSubtitle" class="modal-subtitle">ข้อความนี้จะแสดงให้ผู้ยื่นคำขอเห็น</div>
          </div>
          <button id="borrowStaffActionClose" class="modal-close" type="button" aria-label="ปิด">✕</button>
        </div>
        <div class="modal-body">
          <div class="borrow-form-field">
            <label id="borrowStaffActionLabel" for="borrowStaffActionInput" class="login-label">รายละเอียด</label>
            <textarea
              id="borrowStaffActionInput"
              class="login-input borrow-action-reason-input"
              rows="5"
              placeholder="กรอกรายละเอียด"
              maxlength="500"
            ></textarea>
            <div class="borrow-action-reason-meta">
              <div id="borrowStaffActionHelper" class="section-text-sm borrow-action-reason-helper"></div>
              <div id="borrowStaffActionCounter" class="section-text-sm borrow-action-reason-counter">0/500</div>
            </div>
            <div id="borrowStaffActionError" class="section-text-sm borrow-action-reason-error" aria-live="polite"></div>
          </div>
          <div class="modal-actions">
            <button id="borrowStaffActionCancel" class="btn-ghost" type="button">ยกเลิก</button>
            <button id="borrowStaffActionSubmit" class="btn-primary" type="button">ยืนยัน</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  })();
  const borrowActionTitleEl = document.getElementById("borrowStaffActionTitle");
  const borrowActionSubtitleEl = document.getElementById("borrowStaffActionSubtitle");
  const borrowActionLabelEl = document.getElementById("borrowStaffActionLabel");
  const borrowActionInputEl = document.getElementById("borrowStaffActionInput");
  const borrowActionHelperEl = document.getElementById("borrowStaffActionHelper");
  const borrowActionCounterEl = document.getElementById("borrowStaffActionCounter");
  const borrowActionErrorEl = document.getElementById("borrowStaffActionError");
  const borrowActionSubmitEl = document.getElementById("borrowStaffActionSubmit");
  const borrowActionCancelEl = document.getElementById("borrowStaffActionCancel");
  const borrowActionCloseEl = document.getElementById("borrowStaffActionClose");

  const askBorrowStatusReason = async ({
    promptText = "",
    title = "ระบุเหตุผล",
    subtitle = "ข้อความนี้จะแสดงให้ผู้ยื่นคำขอเห็น",
    initialValue = "",
    placeholder = "กรุณาระบุเหตุผล",
    helperText = "",
    requiredMessage = "กรุณาระบุเหตุผล",
    submitLabel = "ยืนยัน",
    maxLength = 500
  } = {}) => {
    const fallbackPrompt = () => {
      if (typeof window.prompt !== "function") return null;
      const input = window.prompt(promptText || title || "กรุณาระบุเหตุผล", initialValue || "");
      const reason = (input || "").toString().trim();
      return reason || null;
    };
    if (
      !borrowActionModalEl ||
      !borrowActionTitleEl ||
      !borrowActionSubtitleEl ||
      !borrowActionLabelEl ||
      !borrowActionInputEl ||
      !borrowActionHelperEl ||
      !borrowActionCounterEl ||
      !borrowActionErrorEl ||
      !borrowActionSubmitEl ||
      !borrowActionCancelEl ||
      !borrowActionCloseEl ||
      typeof openDialog !== "function" ||
      typeof closeDialog !== "function"
    ) {
      return fallbackPrompt();
    }

    return new Promise((resolve) => {
      let settled = false;
      const done = (value) => {
        if (settled) return;
        settled = true;
        borrowActionSubmitEl.removeEventListener("click", onSubmit);
        borrowActionCancelEl.removeEventListener("click", onCancel);
        borrowActionCloseEl.removeEventListener("click", onCancel);
        borrowActionModalEl.removeEventListener("click", onBackdropClick);
        borrowActionInputEl.removeEventListener("keydown", onKeydown);
        borrowActionInputEl.removeEventListener("input", onInput);
        resolve(value);
      };
      const onSubmit = () => {
        const reason = (borrowActionInputEl.value || "").toString().trim();
        if (!reason) {
          borrowActionErrorEl.textContent = requiredMessage;
          borrowActionInputEl.focus();
          return;
        }
        borrowActionErrorEl.textContent = "";
        closeDialog(borrowActionModalEl);
        done(reason);
      };
      const onCancel = () => {
        borrowActionErrorEl.textContent = "";
        closeDialog(borrowActionModalEl);
        done(null);
      };
      const onBackdropClick = (event) => {
        if (event.target === borrowActionModalEl) {
          onCancel();
        }
      };
      const onKeydown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
          return;
        }
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          onSubmit();
        }
      };
      const onInput = () => {
        borrowActionErrorEl.textContent = "";
        const max = Number(borrowActionInputEl.getAttribute("maxlength") || 0);
        const length = (borrowActionInputEl.value || "").length;
        if (borrowActionCounterEl) {
          borrowActionCounterEl.textContent = max > 0 ? `${length}/${max}` : String(length);
        }
      };

      borrowActionTitleEl.textContent = title || "ระบุเหตุผล";
      borrowActionSubtitleEl.textContent = subtitle || "";
      borrowActionSubtitleEl.style.display = subtitle ? "" : "none";
      borrowActionLabelEl.textContent = promptText || "กรุณาระบุเหตุผล";
      borrowActionInputEl.placeholder = placeholder || "";
      borrowActionInputEl.value = (initialValue || "").toString();
      const normalizedMaxLength = Number(maxLength);
      if (Number.isFinite(normalizedMaxLength) && normalizedMaxLength > 0) {
        borrowActionInputEl.setAttribute("maxlength", String(Math.floor(normalizedMaxLength)));
      } else {
        borrowActionInputEl.removeAttribute("maxlength");
      }
      borrowActionHelperEl.textContent = helperText || "";
      borrowActionHelperEl.style.display = helperText ? "" : "none";
      borrowActionErrorEl.textContent = "";
      borrowActionSubmitEl.textContent = submitLabel || "ยืนยัน";
      onInput();

      borrowActionSubmitEl.addEventListener("click", onSubmit);
      borrowActionCancelEl.addEventListener("click", onCancel);
      borrowActionCloseEl.addEventListener("click", onCancel);
      borrowActionModalEl.addEventListener("click", onBackdropClick);
      borrowActionInputEl.addEventListener("keydown", onKeydown);
      borrowActionInputEl.addEventListener("input", onInput);

      openDialog(borrowActionModalEl, { focusSelector: "#borrowStaffActionInput" });
      window.setTimeout(() => {
        borrowActionInputEl.focus();
        borrowActionInputEl.select();
      }, 0);
    });
  };

  const borrowDeleteConfirmModalEl = (() => {
    const existing = document.getElementById("borrowDeleteConfirmModal");
    if (existing) return existing;
    const modal = document.createElement("div");
    modal.id = "borrowDeleteConfirmModal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-labelledby", "borrowDeleteConfirmTitle");
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <div>
            <div id="borrowDeleteConfirmTitle" class="modal-title">ยืนยันการลบคำขอ</div>
            <div class="modal-subtitle">รายการนี้จะถูกซ่อนออกจากคิวและประวัติการขอ</div>
          </div>
          <button id="borrowDeleteConfirmClose" class="modal-close" type="button" aria-label="ปิด">✕</button>
        </div>
        <div class="modal-body">
          <div id="borrowDeleteConfirmMessage" class="section-text-sm borrow-delete-confirm-message"></div>
          <div class="borrow-delete-confirm-warning">การลบไม่สามารถกู้คืนผ่านหน้าจอนี้ได้</div>
          <div class="modal-actions">
            <button id="borrowDeleteConfirmCancel" class="btn-ghost" type="button">ยกเลิก</button>
            <button id="borrowDeleteConfirmSubmit" class="btn-primary borrow-delete-confirm-submit" type="button">ลบคำขอ</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  })();
  const borrowDeleteConfirmMessageEl = document.getElementById("borrowDeleteConfirmMessage");
  const borrowDeleteConfirmSubmitEl = document.getElementById("borrowDeleteConfirmSubmit");
  const borrowDeleteConfirmCancelEl = document.getElementById("borrowDeleteConfirmCancel");
  const borrowDeleteConfirmCloseEl = document.getElementById("borrowDeleteConfirmClose");

  const confirmBorrowDelete = async (requestId = "", sourceCollection = "") => {
    const requestItem = getBorrowRequestByKey(requestId, sourceCollection);
    const requestNo = (requestItem?.requestNo || requestItem?.id || requestId || "-").toString().trim();
    const requesterName = [requestItem?.firstName || "", requestItem?.lastName || ""].filter(Boolean).join(" ").trim() || "-";
    const dateRange = formatDateRange(requestItem?.pickupDate || "", requestItem?.returnDate || "");
    const fallbackText = `ยืนยันการลบคำขอ ${requestNo} หรือไม่`;
    const fallbackConfirm = () =>
      typeof window.confirm === "function" ? window.confirm(fallbackText) : false;

    if (
      !borrowDeleteConfirmModalEl ||
      !borrowDeleteConfirmMessageEl ||
      !borrowDeleteConfirmSubmitEl ||
      !borrowDeleteConfirmCancelEl ||
      !borrowDeleteConfirmCloseEl ||
      typeof openDialog !== "function" ||
      typeof closeDialog !== "function"
    ) {
      return fallbackConfirm();
    }

    return new Promise((resolve) => {
      let settled = false;
      const done = (value) => {
        if (settled) return;
        settled = true;
        borrowDeleteConfirmSubmitEl.removeEventListener("click", onSubmit);
        borrowDeleteConfirmCancelEl.removeEventListener("click", onCancel);
        borrowDeleteConfirmCloseEl.removeEventListener("click", onCancel);
        borrowDeleteConfirmModalEl.removeEventListener("click", onBackdropClick);
        borrowDeleteConfirmModalEl.removeEventListener("keydown", onKeydown);
        resolve(value);
      };
      const onSubmit = () => {
        closeDialog(borrowDeleteConfirmModalEl);
        done(true);
      };
      const onCancel = () => {
        closeDialog(borrowDeleteConfirmModalEl);
        done(false);
      };
      const onBackdropClick = (event) => {
        if (event.target === borrowDeleteConfirmModalEl) onCancel();
      };
      const onKeydown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
      };

      borrowDeleteConfirmMessageEl.innerHTML = `
        <strong>คำขอ:</strong> ${safeEscape(requestNo)}<br />
        <strong>ผู้ยื่น:</strong> ${safeEscape(requesterName)}<br />
        <strong>ช่วงยืม:</strong> ${safeEscape(dateRange)}
      `;
      borrowDeleteConfirmSubmitEl.addEventListener("click", onSubmit);
      borrowDeleteConfirmCancelEl.addEventListener("click", onCancel);
      borrowDeleteConfirmCloseEl.addEventListener("click", onCancel);
      borrowDeleteConfirmModalEl.addEventListener("click", onBackdropClick);
      borrowDeleteConfirmModalEl.addEventListener("keydown", onKeydown);

      openDialog(borrowDeleteConfirmModalEl, { focusSelector: "#borrowDeleteConfirmCancel" });
    });
  };

  const getBorrowRequestByKey = (requestId, sourceCollection = "") => {
    return borrowRequests.find((item) => {
      if (item.id !== requestId) return false;
      if (!sourceCollection) return true;
      return (item.sourceCollection || "") === sourceCollection;
    }) || null;
  };

  const borrowDetailModalEl = (() => {
    const existing = document.getElementById("borrowRequestDetailModal");
    if (existing) return existing;
    const modal = document.createElement("div");
    modal.id = "borrowRequestDetailModal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div id="borrowRequestDetailTitle" class="modal-title">รายละเอียดคำขอยืมพัสดุ</div>
          <button id="borrowRequestDetailClose" class="modal-close" type="button" aria-label="ปิด">×</button>
        </div>
        <div id="borrowRequestDetailBody" class="modal-body borrow-request-detail-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  })();
  const borrowDetailBodyEl = document.getElementById("borrowRequestDetailBody");
  const borrowDetailCloseEl = document.getElementById("borrowRequestDetailClose");
  let activeBorrowDetailId = "";
  let activeBorrowDetailSource = "";

  const borrowStatusLabel = (status) => {
    if (status === STATUS_APPROVED) return "อนุมัติแล้ว";
    if (status === STATUS_RECEIVED) return "รับของแล้ว";
    if (status === STATUS_REJECTED) return "ไม่อนุมัติ";
    if (status === STATUS_CANCELLED) return "ยกเลิก";
    if (status === STATUS_RETURNED) return "คืนแล้ว";
    return "รออนุมัติ";
  };

  const renderBorrowDetailBody = (item, statusMessage = "", statusColor = "#374151") => {
    if (!borrowDetailBodyEl || !item) return;
    const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ").trim() || "-";
    const requestDateText = item.createdDate
      ? formatDate(item.createdDate)
      : (item.submittedAtMs ? new Date(item.submittedAtMs).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }) : "-");
    const updatedDateText = item.updatedAtMs
      ? new Date(item.updatedAtMs).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
      : "-";
    const assets = Array.isArray(item.assets) ? item.assets : [];
    const assetsCount = assets.reduce((sum, asset) => {
      const qty = Number(asset?.qty || 0);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0);
    const assetsRows = assets.length
      ? assets.map((asset, index) => {
        const qtyNum = Number(asset.qty || 0);
        const qtyText = Number.isFinite(qtyNum) ? String(qtyNum) : "0";
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${safeEscape(asset.code || "-")}</td>
            <td>${safeEscape(asset.name || "-")}</td>
            <td>${safeEscape(qtyText)}</td>
            <td>${safeEscape(asset.unit || "-")}</td>
          </tr>
        `;
      }).join("")
      : `
        <tr>
          <td colspan="5" class="borrow-request-assets-empty">ไม่มีรายการพัสดุ</td>
        </tr>
      `;
    const canManageStatus = ensureStaffPermission(true);
    const safeMessage = safeEscape(statusMessage || "");
    const studentMeta = [item.faculty, item.year ? `ชั้นปี ${item.year}` : "",item.studentId].filter(Boolean).join(" • ");
    const requesterEmailMeta = (item.requesterEmail || "").toString().trim();
    const contactMeta = [item.phone, item.lineId ? `Line: ${item.lineId}` : ""].filter(Boolean).join(" • ");
    const projectMeta = [item.projectName, item.projectDept].filter(Boolean).join(" • ");
    const activityMeta = (item.projectDetail || "").toString().trim();
    borrowDetailBodyEl.innerHTML = `
      <div class="borrow-request-detail-shell">
        <div class="borrow-request-detail-hero">
          <div class="borrow-request-detail-hero-main">
            <div class="borrow-request-detail-hero-label">ผู้ยื่นคำขอ</div>
            <div class="borrow-request-detail-hero-name">${safeEscape(fullName)}</div>
            ${requesterEmailMeta ? `<div class="borrow-request-detail-hero-meta">อีเมล: ${safeEscape(requesterEmailMeta)}</div>` : ""}
            ${studentMeta ? `<div class="borrow-request-detail-hero-meta">${safeEscape(studentMeta)}</div>` : ""}
            ${projectMeta ? `<div class="borrow-request-detail-hero-meta">${safeEscape(projectMeta)}</div>` : ""}
            ${activityMeta ? `<div class="borrow-request-detail-hero-meta">${safeEscape(activityMeta)}</div>` : ""}
            ${contactMeta ? `<div class="borrow-request-detail-hero-meta">${safeEscape(contactMeta)}</div>` : ""}
          </div>
          <div class="borrow-request-detail-hero-side">
            <div class="borrow-request-detail-hero-label">สถานะปัจจุบัน</div>
            <div class="borrow-request-detail-hero-badge">${statusBadge(item.status)}</div>
          </div>
        </div>

        <div class="borrow-request-detail-summary">
          <div class="borrow-request-summary-card">
            <div class="borrow-request-summary-label">เลขที่คำขอ</div>
            <div class="borrow-request-summary-value borrow-request-code">${safeEscape(item.requestNo || item.id || "-")}</div>
          </div>
          <div class="borrow-request-summary-card">
            <div class="borrow-request-summary-label">ช่วงยืม</div>
            <div class="borrow-request-summary-value">${safeEscape(formatDateRange(item.pickupDate, item.returnDate))}</div>
          </div>
          <div class="borrow-request-summary-card">
            <div class="borrow-request-summary-label">จำนวนที่ขอ</div>
            <div class="borrow-request-summary-value">${safeEscape(String(assetsCount))} ชิ้น</div>
          </div>
          <div class="borrow-request-summary-card">
            <div class="borrow-request-summary-label">วันที่อัปเดตล่าสุด</div>
            <div class="borrow-request-summary-value">${safeEscape(updatedDateText)}</div>
          </div>
        </div>

        <div class="borrow-request-detail-grid">
          <div class="borrow-request-detail-item borrow-request-detail-item-full"><span class="borrow-request-detail-label">หมายเหตุ Staff</span><span class="borrow-request-detail-value">${safeEscape(item.staffNote || "ยังไม่มีหมายเหตุ")}</span></div>
        </div>

        <div class="borrow-request-detail-section">
          <div class="borrow-request-detail-section-title">รายการพัสดุ</div>
          <div class="borrow-request-assets-wrap">
            <table class="borrow-request-assets-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>รหัส</th>
                  <th>รายการ</th>
                  <th>จำนวน</th>
                  <th>หน่วย</th>
                </tr>
              </thead>
              <tbody>
                ${assetsRows}
              </tbody>
            </table>
          </div>
        </div>

        ${canManageStatus
          ? `
            <div class="borrow-request-detail-section">
              <div class="borrow-request-detail-section-title">ปรับสถานะการอนุมัติ</div>
              <div class="borrow-request-detail-controls">
                  <select
                    id="borrowRequestDetailStatusSelect"
                  class="staff-status-select"
                    data-request-id="${safeEscape(item.id || "")}"
                    data-request-source="${safeEscape(item.sourceCollection || "")}"
                    aria-label="ปรับสถานะคำขอยืมพัสดุ"
                  >
                    <option value="${STATUS_PENDING}" ${item.status === STATUS_PENDING ? "selected" : ""}>${borrowStatusLabel(STATUS_PENDING)}</option>
                    <option value="${STATUS_APPROVED}" ${item.status === STATUS_APPROVED ? "selected" : ""}>${borrowStatusLabel(STATUS_APPROVED)}</option>
                    <option value="${STATUS_RECEIVED}" ${item.status === STATUS_RECEIVED ? "selected" : ""}>${borrowStatusLabel(STATUS_RECEIVED)}</option>
                    <option value="${STATUS_REJECTED}" ${item.status === STATUS_REJECTED ? "selected" : ""}>${borrowStatusLabel(STATUS_REJECTED)}</option>
                    <option value="${STATUS_CANCELLED}" ${item.status === STATUS_CANCELLED ? "selected" : ""}>${borrowStatusLabel(STATUS_CANCELLED)}</option>
                    <option value="${STATUS_RETURNED}" ${item.status === STATUS_RETURNED ? "selected" : ""}>${borrowStatusLabel(STATUS_RETURNED)}</option>
                  </select>
                  <textarea
                    id="borrowRequestDetailNoteInput"
                    class="login-input borrow-request-detail-note"
                    rows="3"
                  placeholder="หมายเหตุสำหรับผู้ขอ (ถ้ามี)"
                  >${safeEscape(item.staffNote || "")}</textarea>
                <div class="borrow-request-detail-actions">
                  <button
                    id="borrowRequestDetailApplyStatus"
                    class="btn-primary"
                    type="button"
                    data-request-id="${safeEscape(item.id || "")}"
                    data-request-source="${safeEscape(item.sourceCollection || "")}"
                  >
                    บันทึกสถานะ
                  </button>
                  <span
                    id="borrowRequestDetailStatusMessage"
                    class="section-text-sm"
                    style="color:${safeEscape(statusColor)};"
                  >${safeMessage}</span>
                </div>
              </div>
            </div>
          `
          : ""
        }
      </div>
    `;
  };

  const openBorrowDetailModal = (item) => {
    if (!borrowDetailModalEl || !borrowDetailBodyEl || !item) return;
    activeBorrowDetailId = item.id || "";
    activeBorrowDetailSource = item.sourceCollection || "";
    renderBorrowDetailBody(item);
    if (typeof openDialog === "function") {
      openDialog(borrowDetailModalEl, { focusSelector: "#borrowRequestDetailClose" });
    } else {
      borrowDetailModalEl.classList.add("show");
      borrowDetailModalEl.setAttribute("aria-hidden", "false");
    }
  };

  const closeBorrowDetailModal = () => {
    activeBorrowDetailId = "";
    activeBorrowDetailSource = "";
    if (!borrowDetailModalEl) return;
    if (typeof closeDialog === "function") {
      closeDialog(borrowDetailModalEl);
    } else {
      borrowDetailModalEl.classList.remove("show");
      borrowDetailModalEl.setAttribute("aria-hidden", "true");
    }
  };
  if (borrowDetailCloseEl) {
    borrowDetailCloseEl.addEventListener("click", closeBorrowDetailModal);
  }
  if (borrowDetailModalEl) {
    borrowDetailModalEl.addEventListener("click", (event) => {
      if (event.target === borrowDetailModalEl) closeBorrowDetailModal();
    });
  }
  if (borrowDetailBodyEl) {
    borrowDetailBodyEl.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      if (target.id !== "borrowRequestDetailApplyStatus") return;
      if (!ensureStaffPermission()) return;
      const requestId = target.dataset.requestId || activeBorrowDetailId;
      const sourceCollection = target.dataset.requestSource || activeBorrowDetailSource;
      if (!requestId) return;
      const select = borrowDetailBodyEl.querySelector("#borrowRequestDetailStatusSelect");
      const noteInput = borrowDetailBodyEl.querySelector("#borrowRequestDetailNoteInput");
      if (!(select instanceof HTMLSelectElement)) return;
      const noteText = noteInput instanceof HTMLTextAreaElement
        ? (noteInput.value || "").toString().trim()
        : "";
      const nextStatus = normalizeRequestStatus(select.value);
      const messageEl = borrowDetailBodyEl.querySelector("#borrowRequestDetailStatusMessage");
      target.disabled = true;
      if (messageEl instanceof HTMLElement) {
        messageEl.textContent = "กำลังบันทึกสถานะ...";
        messageEl.style.color = "#6b7280";
      }
      try {
        await updateBorrowRequestStatus(requestId, nextStatus, noteText, sourceCollection);
        const targetItem = getBorrowRequestByKey(requestId, sourceCollection);
        if (targetItem) {
          targetItem.status = nextStatus;
          targetItem.staffNote = noteText;
          targetItem.updatedAtMs = Date.now();
        }
        renderBorrowRequests();
        const latest = getBorrowRequestByKey(requestId, sourceCollection);
        if (latest) {
          renderBorrowDetailBody(latest, "บันทึกสถานะเรียบร้อยแล้ว", "#047857");
        }
      } catch (error) {
        const code = (error?.code || "").toString().trim();
        if (messageEl instanceof HTMLElement) {
          messageEl.textContent = code === "permission-denied"
            ? "ไม่มีสิทธิ์บันทึกสถานะนี้ (Firestore Rules)"
            : code === "resource-exhausted"
              ? "พัสดุคงเหลือไม่พอสำหรับการอนุมัติ กรุณาตรวจสอบจำนวนอีกครั้ง"
            : "บันทึกสถานะไม่สำเร็จ กรุณาลองใหม่";
          messageEl.style.color = "#b91c1c";
        }
      } finally {
        target.disabled = false;
      }
    });
  }

  const renderBorrowRequests = () => {
    renderMyRequests();
    renderMyBorrowOverview();
    renderStaffBorrowOverview();
    renderStaffQueue();
    renderStaffHistory();
  };

  const normalizeBorrowRequest = (id, data) => {
    const safeData = data && typeof data === "object" ? data : {};
    const createdAtMs = timestampToMillis(data.createdAt) || Number(data.submittedAtMs) || 0;
    const updatedAtMs = timestampToMillis(data.updatedAt) || createdAtMs;
    const rawAssets = Array.isArray(safeData.assets) ? safeData.assets : [];
    const assets = rawAssets
      .map((asset) => {
        if (!asset || typeof asset !== "object") return null;
        const code = (asset.code || "").toString().trim();
        const name = (asset.name || "").toString().trim();
        const qtyNum = Number(asset.qty);
        const qty = Number.isFinite(qtyNum) ? Math.max(0, Math.trunc(qtyNum)) : 0;
        const unit = (asset.unit || "").toString().trim();
        if (!code && !name) return null;
        return { code, name, qty, unit };
      })
      .filter(Boolean);
    return {
      id,
      requestNo: (safeData.requestNo || "").toString().trim().toUpperCase(),
      status: normalizeRequestStatus(safeData.status),
      isDeleted: normalizeDeletedFlag(safeData.isDeleted),
      sourceCollection: BORROW_REQUEST_COLLECTION,
      requesterEmail: (safeData.requesterEmail || "").toString().trim().toLowerCase(),
      firstName: (safeData.firstName || "").toString().trim(),
      lastName: (safeData.lastName || "").toString().trim(),
      nickname: (safeData.nickname || "").toString().trim(),
      studentId: (safeData.studentId || "").toString().trim(),
      faculty: (safeData.faculty || "").toString().trim(),
      year: (safeData.year || "").toString().trim(),
      phone: (safeData.phone || "").toString().trim(),
      lineId: (safeData.lineId || "").toString().trim(),
      projectName: (safeData.projectName || "").toString().trim(),
      projectDept: (safeData.projectDept || "").toString().trim(),
      projectDetail: (safeData.projectDetail || "").toString().trim(),
      pickupDate: (safeData.pickupDate || "").toString().trim(),
      returnDate: (safeData.returnDate || "").toString().trim(),
      assets,
      staffNote: (safeData.staffNote || "").toString().trim(),
      createdDate: (safeData.createdDate || "").toString().trim(),
      updatedAtMs,
      submittedAtMs: createdAtMs
    };
  };

  const subscribeBorrowRequests = () => {
    resolveFirestoreBridge();
    if (!hasFirestore) {
      borrowRequests = [];
      renderBorrowRequests();
      setStaffQueueStatusMessage("ระบบฐานข้อมูลยังไม่พร้อม (กำลังเชื่อมต่อ Firestore)");
      setStaffQueueMessage("กำลังเชื่อมต่อฐานข้อมูล...", "#6b7280");
      return;
    }
    if (Array.isArray(unsubscribeBorrowRequests) && unsubscribeBorrowRequests.length) {
      unsubscribeBorrowRequests.forEach((fn) => {
        try {
          fn();
        } catch (_) {
          // ignore
        }
      });
    }
    unsubscribeBorrowRequests = [];

    const mergeAndRender = () => {
      const merged = [];
      collectionSnapshotRows.forEach((docs) => {
        docs.forEach((docItem) => merged.push(docItem));
      });
      borrowRequestsSnapshotCount = merged.length;
      borrowRequests = merged.sort((a, b) => (b.submittedAtMs || 0) - (a.submittedAtMs || 0));
      renderBorrowRequests();
    };

    BORROW_REQUEST_COLLECTIONS.forEach((name) => {
      collectionSnapshotRows.set(name, []);
      collectionSnapshotCounts.set(name, 0);
      collectionSnapshotErrors.set(name, "");
    });

    BORROW_REQUEST_COLLECTIONS.forEach((collectionName) => {
      const colRef = firestore.collection(firestore.db, collectionName);
      const unsubscribe = firestore.onSnapshot(
        colRef,
        (snapshot) => {
          collectionSnapshotErrors.set(collectionName, "");
          collectionSnapshotCounts.set(collectionName, Number(snapshot.size || 0));
          const normalized = [];
          const badDocIds = [];
          snapshot.docs.forEach((docSnap) => {
            try {
              const item = normalizeBorrowRequest(docSnap.id, docSnap.data() || {});
              item.sourceCollection = collectionName;
              normalized.push(item);
            } catch (err) {
              badDocIds.push(docSnap.id);
              console.error("borrow request doc malformed - app.borrow-assets.js:2004", collectionName, docSnap.id, err);
            }
          });
          collectionSnapshotRows.set(collectionName, normalized);
          mergeAndRender();
          const visibleCount = borrowRequestsSnapshotCount;
          if (visibleCount > 0) {
            setStaffQueueMessage(`โหลดคำขอสำเร็จ ${visibleCount} รายการ`, "#047857");
          } else {
            setStaffQueueMessage("", "#374151");
          }
          if (badDocIds.length) {
            setStaffQueueStatusMessage(
              `ข้ามข้อมูลที่รูปแบบผิด ${badDocIds.length} รายการ (ID: ${badDocIds.join(", ")})`
            );
          }
        },
        (error) => {
          const code = (error?.code || "").toString();
          const loggedIn = !!readCurrentUserEmail();
          collectionSnapshotErrors.set(collectionName, code || "unknown");
          collectionSnapshotRows.set(collectionName, []);
          collectionSnapshotCounts.set(collectionName, 0);
          mergeAndRender();
          const totalNow = borrowRequestsSnapshotCount;
          if (totalNow > 0) {
            return;
          }
          if (code === "permission-denied") {
            if (hasStaffPermission() && loggedIn) {
              setStaffQueueStatusMessage(
                `บัญชี Staff นี้ยังไม่มีสิทธิ์อ่านข้อมูลใน ${collectionName} (Firestore Rules)`
              );
            } else if (!loggedIn) {
              setStaffQueueStatusMessage("กรุณาเข้าสู่ระบบก่อนดูคิวคำขอ");
            } else {
              setStaffQueueStatusMessage("บัญชีนี้ยังไม่มีสิทธิ์อ่านข้อมูลคิวคำขอ");
            }
            return;
          }
          setStaffQueueStatusMessage("ไม่สามารถโหลดคิวคำขอได้ในขณะนี้");
          setStaffQueueMessage("โหลดคิวคำขอไม่สำเร็จ กรุณาลองใหม่", "#b91c1c");
          console.error("borrow assets subscribe failed - app.borrow-assets.js:2046", collectionName, error);
        }
      );
      unsubscribeBorrowRequests.push(unsubscribe);
    });
  };

  const submitBorrowRequest = async () => {
    if (!borrowRequestForm || !borrowSubmitBtn) return;
    if (!borrowRequestForm.reportValidity()) return;

    currentUserEmail = readCurrentUserEmail();
    if (!currentUserEmail) {
      setBorrowMessage("กรุณาเข้าสู่ระบบก่อนส่งคำขอยืมพัสดุ", "#b91c1c");
      return;
    }
    if (!resolveFirestoreBridge()) {
      setBorrowMessage("ระบบฐานข้อมูลยังไม่พร้อม กรุณาลองใหม่อีกครั้ง", "#b91c1c");
      return;
    }
    const pickupDateObj = parseDateYmd(borrowPickupDate?.value || "");
    const returnDateObj = parseDateYmd(borrowReturnDate?.value || "");
    if (!pickupDateObj || !returnDateObj) {
      setBorrowMessage("กรุณาเลือกวันที่รับและวันที่คืนพัสดุให้ครบถ้วน", "#b91c1c");
      return;
    }
    if (returnDateObj.getTime() < pickupDateObj.getTime()) {
      setBorrowMessage("วันที่คืนพัสดุต้องไม่ก่อนวันที่รับพัสดุ", "#b91c1c");
      return;
    }
    const pickupDay = pickupDateObj.getDay();
    if (pickupDay !== 1 && pickupDay !== 4) {
      setBorrowMessage("วันที่รับพัสดุต้องเป็นวันจันทร์หรือวันพฤหัสบดีเท่านั้น", "#b91c1c");
      return;
    }

    const assetsResult = collectAssetItems();
    if (!assetsResult.ok) {
      setBorrowMessage(assetsResult.message || "ข้อมูลรายการพัสดุไม่ถูกต้อง", "#b91c1c");
      return;
    }
    const requesterProfile = await getBorrowProfileForSubmit();
    if (!requesterProfile) {
      setBorrowMessage("ไม่พบข้อมูลผู้ใช้งาน กรุณากรอกและบันทึกที่หน้าเข้าสู่ระบบก่อน", "#b91c1c");
      return;
    }
    if (
      !requesterProfile.firstName ||
      !requesterProfile.lastName ||
      !requesterProfile.nickname ||
      !requesterProfile.studentId ||
      !requesterProfile.faculty ||
      !requesterProfile.year ||
      !requesterProfile.phone ||
      !requesterProfile.lineId
    ) {
      setBorrowMessage("ข้อมูลผู้ใช้งานยังไม่ครบ กรุณาอัปเดตที่หน้าเข้าสู่ระบบก่อน", "#b91c1c");
      return;
    }
    await ensureBorrowOrgCodeData();
    const nextRequestNo = generateBorrowRequestNo();
    if (!nextRequestNo) {
      setBorrowMessage(
        "ไม่พบรหัสองค์กรจากข้อมูลกลาง (คอลัมน์ C) กรุณาตรวจสอบประเภทองค์กร/ฝ่ายหรือเลือก 'อื่น ๆ'",
        "#b91c1c"
      );
      return;
    }

    const payload = {
      requestNo: nextRequestNo,
      firstName: requesterProfile.firstName,
      lastName: requesterProfile.lastName,
      nickname: requesterProfile.nickname,
      studentId: requesterProfile.studentId,
      faculty: requesterProfile.faculty,
      year: requesterProfile.year,
      phone: requesterProfile.phone,
      lineId: requesterProfile.lineId,
      projectName: getBorrowProjectNameValueForSubmit(),
      projectDept: getBorrowProjectDeptValueForSubmit(),
      projectDetail: borrowProjectDetail?.value.trim() || "",
      pickupDate: borrowPickupDate?.value || "",
      returnDate: borrowReturnDate?.value || "",
      assets: assetsResult.items,
      requesterEmail: currentUserEmail,
      status: STATUS_PENDING,
      staffNote: "",
      createdDate: toYmd(new Date()),
      submittedAtMs: Date.now(),
      createdAt: firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp()
    };

    borrowSubmitBtn.disabled = true;
    setBorrowMessage("กำลังส่งคำขอ...", "#374151");
    try {
      await firestore.addDoc(
        firestore.collection(firestore.db, BORROW_REQUEST_COLLECTION),
        payload
      );
      if (borrowRequestForm) borrowRequestForm.reset();
      toggleBorrowProjectNameOther();
      populateBorrowProjectDeptOptions();
      resetAssetRows();
      setBorrowMessage("ส่งคำขอเรียบร้อยแล้ว สามารถติดตามสถานะได้ด้านล่าง", "#15803d");
    } catch (error) {
      const code = (error?.code || "").toString();
      const hasLogin = !!readCurrentUserEmail();
      if (code === "permission-denied") {
        if (!hasLogin) {
          setBorrowMessage("กรุณาเข้าสู่ระบบก่อนส่งคำขอ", "#b91c1c");
        } else {
          setBorrowMessage(
            "บัญชีนี้ยังไม่มีสิทธิ์เขียนข้อมูลในระบบ (Firestore Rules) กรุณาติดต่อผู้ดูแลระบบ",
            "#b91c1c"
          );
        }
      } else {
        setBorrowMessage("ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "#b91c1c");
      }
      console.error("borrow request submit failed - app.borrow-assets.js:2167", error);
    } finally {
      borrowSubmitBtn.disabled = false;
    }
  };

  const updateBorrowRequestStatus = async (requestId, nextStatus, noteText = "", sourceCollection = "") => {
    if (!requestId) return;
    if (!resolveFirestoreBridge()) return;
    const requestItem = getBorrowRequestByKey(requestId, sourceCollection);
    const targetCollection = requestItem?.sourceCollection || sourceCollection || BORROW_REQUEST_COLLECTION;
    const trimmedNote = (noteText || "").toString().trim();
    const targetStatus = normalizeRequestStatus(nextStatus);
    const actorEmail = readCurrentUserEmail();
    const docRef = firestore.doc(firestore.db, targetCollection, requestId);
    const payload = {
      status: targetStatus,
      staffNote: trimmedNote,
      staffUpdatedBy: actorEmail,
      updatedAt: firestore.serverTimestamp()
    };
    if (typeof firestore.runTransaction !== "function") {
      await firestore.updateDoc(docRef, payload);
      return;
    }

    await firestore.runTransaction(firestore.db, async (transaction) => {
      const requestSnap = await transaction.get(docRef);
      if (!requestSnap.exists()) {
        const err = new Error("ไม่พบคำขอในระบบ");
        err.code = "not-found";
        throw err;
      }
      const data = requestSnap.data() || {};
      const currentStatus = normalizeRequestStatus(data.status);
      const deltas = buildReservationDeltas(currentStatus, targetStatus, data.assets || []);
      await applyStockDeltasInTransaction(transaction, deltas, actorEmail);
      transaction.update(docRef, payload);
    });
  };

  const deleteBorrowRequest = async (requestId, sourceCollection = "") => {
    if (!requestId) return;
    if (!resolveFirestoreBridge()) return;
    const requestItem = getBorrowRequestByKey(requestId, sourceCollection);
    const targetCollection = requestItem?.sourceCollection || sourceCollection || BORROW_REQUEST_COLLECTION;
    const docRef = firestore.doc(firestore.db, targetCollection, requestId);
    const actorEmail = readCurrentUserEmail();
    if (typeof firestore.runTransaction === "function") {
      await firestore.runTransaction(firestore.db, async (transaction) => {
        const requestSnap = await transaction.get(docRef);
        if (!requestSnap.exists()) return;
        const data = requestSnap.data() || {};
        const deltas = buildReservationDeltas(data.status, STATUS_CANCELLED, data.assets || []);
        await applyStockDeltasInTransaction(transaction, deltas, actorEmail);
        transaction.update(docRef, {
          isDeleted: true,
          status: STATUS_CANCELLED,
          staffNote: "ลบคำขอโดยเจ้าหน้าที่",
          deletedBy: actorEmail,
          deletedAt: firestore.serverTimestamp(),
          updatedAt: firestore.serverTimestamp()
        });
      });
      if (requestItem) {
        requestItem.isDeleted = true;
        requestItem.status = STATUS_CANCELLED;
        requestItem.staffNote = "ลบคำขอโดยเจ้าหน้าที่";
      }
      return;
    }
    try {
      await firestore.deleteDoc(docRef);
      if (requestItem) {
        requestItem.isDeleted = true;
      }
    } catch (error) {
      const code = (error?.code || "").toString().trim().toLowerCase();
      if (
        code === "permission-denied" &&
        firestore.updateDoc &&
        firestore.serverTimestamp
      ) {
        await firestore.updateDoc(docRef, {
          isDeleted: true,
          status: STATUS_CANCELLED,
          staffNote: "ลบคำขอโดยเจ้าหน้าที่",
          deletedBy: readCurrentUserEmail(),
          deletedAt: firestore.serverTimestamp(),
          updatedAt: firestore.serverTimestamp()
        });
        if (requestItem) {
          requestItem.isDeleted = true;
          requestItem.status = STATUS_CANCELLED;
          requestItem.staffNote = "ลบคำขอโดยเจ้าหน้าที่";
        }
        return;
      }
      throw error;
    }
  };

  if (hasBorrowFormSection) {
    void ensureBorrowOrgCodeData().then(() => {
      populateBorrowProjectTypeOptions();
      populateBorrowProjectDeptOptions();
    });
    populateBorrowProjectTypeOptions();
    populateBorrowProjectDeptOptions();
    if (borrowProjectName) {
      borrowProjectName.addEventListener("change", () => {
        toggleBorrowProjectNameOther();
        populateBorrowProjectDeptOptions();
      });
      borrowProjectName.addEventListener("focus", () => {
        populateBorrowProjectTypeOptions();
        populateBorrowProjectDeptOptions();
      });
    }
    if (borrowProjectDept) {
      borrowProjectDept.addEventListener("focus", populateBorrowProjectDeptOptions);
    }
    const firstRow = borrowAssetList.querySelector("[data-asset-row]");
    if (firstRow) {
      updateRowIds(firstRow, 1);
      bindRow(firstRow);
    }

    addBorrowAssetRow.addEventListener("click", () => {
      const rowTemplate = borrowAssetList.querySelector("[data-asset-row]");
      if (!rowTemplate) return;
      const newRow = rowTemplate.cloneNode(true);
      const nextIndex = borrowAssetList.querySelectorAll("[data-asset-row]").length + 1;
      updateRowIds(newRow, nextIndex);
      newRow.querySelectorAll("input").forEach((input) => {
        input.value = "";
      });
      const warning = newRow.querySelector("[data-asset-warning]");
      if (warning) warning.hidden = true;
      const removeBtn = newRow.querySelector("[data-asset-remove]");
      if (removeBtn) removeBtn.hidden = false;
      borrowAssetList.appendChild(newRow);
      bindRow(newRow);
    });

    if (borrowSubmitBtn) {
      borrowSubmitBtn.addEventListener("click", submitBorrowRequest);
    }
  }

  if (staffQueueTableBody) {
    staffQueueTableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button[data-action][data-request-id]");
      if (!(button instanceof HTMLButtonElement)) return;
      const action = button.dataset.action || "";
      const requestId = button.dataset.requestId || "";
      const sourceCollection = button.dataset.requestSource || "";
      if (!action || !requestId) return;
      if (action === "detail") {
        const item = getBorrowRequestByKey(requestId, sourceCollection);
        if (item) openBorrowDetailModal(item);
        return;
      }
      if (!ensureStaffPermission()) return;
      if (staffActionInFlight) return;
      staffActionInFlight = true;

      button.disabled = true;
      setStaffQueueMessage("กำลังอัปเดตสถานะคำขอ...", "#6b7280");
      try {
        if (action === "approve") {
          await updateBorrowRequestStatus(requestId, STATUS_APPROVED, "อนุมัติการยืมเรียบร้อย", sourceCollection);
          setStaffQueueMessage("อนุมัติคำขอเรียบร้อย", "#047857");
        } else if (action === "reject") {
          const reason = await askBorrowStatusReason({
            promptText: "กรุณาระบุเหตุผลที่ไม่อนุมัติ",
            title: "ไม่อนุมัติคำขอ",
            subtitle: "เหตุผลนี้จะแสดงให้ผู้ยื่นคำขอเห็นเพื่อใช้ประกอบการแก้ไข",
            placeholder: "เช่น อุปกรณ์ไม่พร้อมให้ยืมในช่วงวันดังกล่าว",
            helperText: "ระบุเหตุผลให้ชัดเจน กระชับ และเข้าใจง่าย",
            requiredMessage: "กรุณาระบุเหตุผลที่ไม่อนุมัติ",
            submitLabel: "บันทึก"
          });
          if (!reason || !reason.trim()) return;
          await updateBorrowRequestStatus(requestId, STATUS_REJECTED, reason.trim(), sourceCollection);
          setStaffQueueMessage("ไม่อนุมัติคำขอเรียบร้อย", "#047857");
        } else if (action === "cancel") {
          const reason = await askBorrowStatusReason({
            promptText: "กรุณาระบุเหตุผลการยกเลิกคำขอ",
            title: "ยกเลิกคำขอ",
            subtitle: "ข้อความนี้จะแสดงให้ผู้ยื่นคำขอเห็น",
            initialValue: "ยกเลิกคำขอโดยเจ้าหน้าที่",
            placeholder: "เช่น คำขอซ้ำกับรายการเดิม",
            helperText: "โปรดอธิบายเหตุผลการยกเลิกให้ผู้ยื่นคำขอเข้าใจ",
            requiredMessage: "กรุณาระบุเหตุผลการยกเลิกคำขอ",
            submitLabel: "บันทึก"
          });
          if (!reason || !reason.trim()) return;
          await updateBorrowRequestStatus(requestId, STATUS_CANCELLED, reason.trim(), sourceCollection);
          setStaffQueueMessage("ยกเลิกคำขอเรียบร้อย", "#047857");
        } else if (action === "returned") {
          await updateBorrowRequestStatus(requestId, STATUS_RETURNED, "ส่งคืนพัสดุเรียบร้อย", sourceCollection);
          setStaffQueueMessage("บันทึกคืนพัสดุเรียบร้อย", "#047857");
        } else if (action === "delete") {
          const confirmed = await confirmBorrowDelete(requestId, sourceCollection);
          if (!confirmed) return;
          await deleteBorrowRequest(requestId, sourceCollection);
          renderBorrowRequests();
          setStaffQueueMessage("ลบคำขอเรียบร้อย", "#047857");
        }
      } catch (error) {
        const code = (error?.code || "").toString().trim();
        setStaffQueueMessage(
          code === "resource-exhausted"
            ? "อนุมัติไม่สำเร็จ: พัสดุคงเหลือไม่พอ"
            : "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่",
          "#b91c1c"
        );
        console.error("borrow request status update failed - app.borrow-assets.js:2389", error);
      } finally {
        button.disabled = false;
        staffActionInFlight = false;
      }
    });

    const onBorrowStatusSelectChange = async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (target.dataset.role !== "borrow-status-select") return;
      if (!ensureStaffPermission()) return;
      const requestId = target.dataset.id || "";
      const sourceCollection = target.dataset.source || "";
      const nextValue = (target.value || "").toString().trim().toLowerCase();
      if (!requestId || !nextValue) return;
      const requestItem = getBorrowRequestByKey(requestId, sourceCollection);
      if (!requestItem) return;

      const prevValue = requestItem.status;
      target.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
      target.classList.add(borrowStatusSelectClass(nextValue));

      if (nextValue === "delete") {
        const confirmed = await confirmBorrowDelete(requestId, sourceCollection);
        if (!confirmed) {
          target.value = prevValue;
          target.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
          target.classList.add(borrowStatusSelectClass(prevValue));
          return;
        }
        try {
          await deleteBorrowRequest(requestId, sourceCollection);
          renderBorrowRequests();
          setStaffQueueMessage("ลบคำขอเรียบร้อย", "#047857");
          return;
        } catch (error) {
          target.value = prevValue;
          target.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
          target.classList.add(borrowStatusSelectClass(prevValue));
          const code = (error?.code || "").toString().trim();
          setStaffQueueMessage(
            code === "permission-denied"
              ? "ไม่มีสิทธิ์ลบคำขอ (Firestore Rules)"
              : "ลบคำขอไม่สำเร็จ กรุณาลองใหม่",
            "#b91c1c"
          );
          return;
        }
      }

      if (![STATUS_PENDING, STATUS_APPROVED, STATUS_RECEIVED, STATUS_REJECTED, STATUS_CANCELLED, STATUS_RETURNED].includes(nextValue)) {
        target.value = prevValue;
        target.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
        target.classList.add(borrowStatusSelectClass(prevValue));
        return;
      }
      if (prevValue === nextValue) return;

      let noteText = (requestItem.staffNote || "").toString().trim();
      if (nextValue === STATUS_REJECTED) {
        const reason = await askBorrowStatusReason({
          promptText: "กรุณาระบุเหตุผลที่ไม่อนุมัติ",
          title: "ไม่อนุมัติคำขอ",
          subtitle: "เหตุผลนี้จะแสดงให้ผู้ยื่นคำขอเห็นเพื่อใช้ประกอบการแก้ไข",
          initialValue: noteText,
          placeholder: "เช่น อุปกรณ์ไม่พร้อมให้ยืมในช่วงวันดังกล่าว",
          helperText: "ระบุเหตุผลให้ชัดเจน กระชับ และเข้าใจง่าย",
          requiredMessage: "กรุณาระบุเหตุผลที่ไม่อนุมัติ",
          submitLabel: "บันทึก"
        });
        if (!reason || !reason.trim()) {
          target.value = prevValue;
          target.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
          target.classList.add(borrowStatusSelectClass(prevValue));
          return;
        }
        noteText = reason.trim();
      } else if (nextValue === STATUS_CANCELLED) {
        const reason = await askBorrowStatusReason({
          promptText: "กรุณาระบุเหตุผลการยกเลิกคำขอ",
          title: "ยกเลิกคำขอ",
          subtitle: "ข้อความนี้จะแสดงให้ผู้ยื่นคำขอเห็น",
          initialValue: noteText || "ยกเลิกคำขอโดยเจ้าหน้าที่",
          placeholder: "เช่น คำขอซ้ำกับรายการเดิม",
          helperText: "โปรดอธิบายเหตุผลการยกเลิกให้ผู้ยื่นคำขอเข้าใจ",
          requiredMessage: "กรุณาระบุเหตุผลการยกเลิกคำขอ",
          submitLabel: "บันทึก"
        });
        if (!reason || !reason.trim()) {
          target.value = prevValue;
          target.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
          target.classList.add(borrowStatusSelectClass(prevValue));
          return;
        }
        noteText = reason.trim();
      } else if (nextValue === STATUS_APPROVED && !noteText) {
        noteText = "อนุมัติการยืมเรียบร้อย";
      } else if (nextValue === STATUS_RECEIVED && !noteText) {
        noteText = "รับพัสดุเรียบร้อยแล้ว";
      } else if (nextValue === STATUS_RETURNED && !noteText) {
        noteText = "ส่งคืนพัสดุเรียบร้อย";
      }

      try {
        await updateBorrowRequestStatus(requestId, nextValue, noteText, sourceCollection);
        setStaffQueueMessage("อัปเดตสถานะเรียบร้อย", "#047857");
      } catch (error) {
        target.value = prevValue;
        target.classList.remove("is-pending", "is-approved", "is-rejected", "is-cancel-requested", "is-delete");
        target.classList.add(borrowStatusSelectClass(prevValue));
        const code = (error?.code || "").toString().trim();
        setStaffQueueMessage(
          code === "permission-denied"
            ? "ไม่มีสิทธิ์อัปเดตสถานะคำขอนี้ (Firestore Rules)"
            : code === "resource-exhausted"
              ? "อนุมัติไม่สำเร็จ: พัสดุคงเหลือไม่พอ"
            : "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่",
          "#b91c1c"
        );
      }
    };

    staffQueueTableBody.addEventListener("change", onBorrowStatusSelectChange);
    if (staffHistoryTableBody) {
      staffHistoryTableBody.addEventListener("change", onBorrowStatusSelectChange);
    }

    staffQueueTableBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("button, select, option, input, textarea, [data-role]")) return;
      const row = target.closest("tr[data-request-id]");
      if (!row) return;
      const requestId = row.getAttribute("data-request-id") || "";
      const sourceCollection = row.getAttribute("data-request-source") || "";
      if (!requestId) return;
      const item = getBorrowRequestByKey(requestId, sourceCollection);
      if (item) openBorrowDetailModal(item);
    });

    if (staffHistoryTableBody) {
      staffHistoryTableBody.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest("button, select, option, input, textarea, [data-role]")) return;
        const row = target.closest("tr[data-request-id]");
        if (!row) return;
        const requestId = row.getAttribute("data-request-id") || "";
        const sourceCollection = row.getAttribute("data-request-source") || "";
        if (!requestId) return;
        const item = getBorrowRequestByKey(requestId, sourceCollection);
        if (item) openBorrowDetailModal(item);
      });

      staffHistoryTableBody.addEventListener("keydown", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const row = target.closest("tr[data-request-id]");
        if (!row) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        const requestId = row.getAttribute("data-request-id") || "";
        const sourceCollection = row.getAttribute("data-request-source") || "";
        if (!requestId) return;
        const item = getBorrowRequestByKey(requestId, sourceCollection);
        if (item) openBorrowDetailModal(item);
      });
    }
  }

  if (myRequestsTableBody) {
    myRequestsTableBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("button, select, option, input, textarea, a")) return;
      const row = target.closest("tr[data-request-id]");
      if (!row) return;
      const requestId = row.getAttribute("data-request-id") || "";
      const sourceCollection = row.getAttribute("data-request-source") || "";
      if (!requestId) return;
      const item = getBorrowRequestByKey(requestId, sourceCollection);
      if (item) openBorrowDetailModal(item);
    });

    myRequestsTableBody.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const row = target.closest("tr[data-request-id]");
      if (!row) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const requestId = row.getAttribute("data-request-id") || "";
      const sourceCollection = row.getAttribute("data-request-source") || "";
      if (!requestId) return;
      const item = getBorrowRequestByKey(requestId, sourceCollection);
      if (item) openBorrowDetailModal(item);
    });
  }

  if (myRequestsTableBody) {
    myRequestsTableBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("button, select, option, input, textarea, a")) return;
      const row = target.closest("tr[data-request-id]");
      if (!row) return;
      const requestId = row.getAttribute("data-request-id") || "";
      const sourceCollection = row.getAttribute("data-request-source") || "";
      if (!requestId) return;
      const item = getBorrowRequestByKey(requestId, sourceCollection);
      if (item) openBorrowDetailModal(item);
    });

    myRequestsTableBody.addEventListener("keydown", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const row = target.closest("tr[data-request-id]");
      if (!row) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const requestId = row.getAttribute("data-request-id") || "";
      const sourceCollection = row.getAttribute("data-request-source") || "";
      if (!requestId) return;
      const item = getBorrowRequestByKey(requestId, sourceCollection);
      if (item) openBorrowDetailModal(item);
    });
  }

  loadBorrowAssets();

  if (borrowAssetsSearch) {
    borrowAssetsSearch.addEventListener("input", applyBorrowAssetsFilters);
  }
  if (borrowAssetsSearchClear && borrowAssetsSearch) {
    borrowAssetsSearchClear.addEventListener("click", () => {
      borrowAssetsSearch.value = "";
      applyBorrowAssetsFilters();
    });
  }
  if (borrowAssetsSearchStaff) {
    borrowAssetsSearchStaff.addEventListener("input", applyBorrowAssetsFilters);
  }
  if (borrowAssetsSearchStaffClear && borrowAssetsSearchStaff) {
    borrowAssetsSearchStaffClear.addEventListener("click", () => {
      borrowAssetsSearchStaff.value = "";
      applyBorrowAssetsFilters();
    });
  }
  if (borrowAssetsTypeFilter) {
    borrowAssetsTypeFilter.addEventListener("change", applyBorrowAssetsFilters);
  }
  if (borrowAssetsTypeFilterStaff) {
    borrowAssetsTypeFilterStaff.addEventListener("change", applyBorrowAssetsFilters);
  }

  const staffTabBtns = document.querySelectorAll(".tab-btn[data-assets-staff-tab]");
  const staffBorrowQueue = document.getElementById("staffBorrowQueue");
  const staffBorrowHistory = document.getElementById("staffBorrowHistory");
  if (staffTabBtns.length && staffBorrowQueue && staffBorrowHistory) {
    staffBorrowHistory.style.display = "none";
    staffBorrowHistory.classList.remove("section-visible");
    staffBorrowQueue.style.display = "block";
    staffBorrowQueue.classList.add("section-visible");
    staffTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.assetsStaffTab;
        staffRequestTabMode = target === "history" ? "history" : "queue";
        staffTabBtns.forEach((b) => {
          const matched = (b.dataset.assetsStaffTab || "") === target;
          b.classList.toggle("is-active", matched);
        });
        setStaffRequestPanelMeta();
        renderBorrowRequests();
      });
    });
  }

  currentUserEmail = readCurrentUserEmail();
  restoreBorrowProfileForCurrentUser();
  void readBorrowProfileFromFirestore().then((profile) => {
    if (profile) applyBorrowProfileToForm(profile);
  });
  renderBorrowRequests();
  setStaffQueueStatusMessage("กำลังโหลดคิวคำขอ...");
  subscribeBorrowRequests();

  let firestoreRetryTimer = null;
  const scheduleFirestoreRetry = () => {
    if (firestoreRetryTimer) {
      window.clearTimeout(firestoreRetryTimer);
      firestoreRetryTimer = null;
    }
    if (resolveFirestoreBridge()) return;
    firestoreRetryTimer = window.setTimeout(() => {
      subscribeBorrowRequests();
      scheduleFirestoreRetry();
    }, 1200);
  };
  scheduleFirestoreRetry();

  if (window.sgcuAuth?.auth && typeof window.sgcuAuth.onAuthStateChanged === "function") {
    window.sgcuAuth.onAuthStateChanged(window.sgcuAuth.auth, () => {
      currentUserEmail = readCurrentUserEmail();
      restoreBorrowProfileForCurrentUser();
      void readBorrowProfileFromFirestore().then((profile) => {
        if (profile) applyBorrowProfileToForm(profile);
      });
      renderBorrowRequests();
      if (!currentUserEmail) setStaffQueueStatusMessage("กรุณาเข้าสู่ระบบก่อนดูคิวคำขอ");
      subscribeBorrowRequests();
      scheduleFirestoreRetry();
    });
  }

  window.addEventListener("sgcu:user-profile-updated", (event) => {
    const detail = event?.detail || {};
    const email = (detail.email || "").toString().trim().toLowerCase();
    if (!email || email !== currentUserEmail) return;
    applyBorrowProfileToForm(detail.profile || {});
  });

  window.addEventListener("beforeunload", () => {
    if (Array.isArray(unsubscribeBorrowRequests) && unsubscribeBorrowRequests.length) {
      unsubscribeBorrowRequests.forEach((fn) => {
        try {
          fn();
        } catch (_) {
          // ignore
        }
      });
      unsubscribeBorrowRequests = [];
    }
    if (firestoreRetryTimer) {
      window.clearTimeout(firestoreRetryTimer);
      firestoreRetryTimer = null;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBorrowAssetsApp, { once: true });
} else {
  initBorrowAssetsApp();
}
