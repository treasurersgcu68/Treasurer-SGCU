/* Sorting + auth gating for Project Status */
const lastProjectStatusRefreshSignatureByContext = {
  public: "",
  staff: ""
};
const lastProjectStatusProjectsRefByContext = {
  public: null,
  staff: null
};

function buildProjectStatusRefreshSignature(ctxKey) {
  const ctx = projectStatusContexts[ctxKey] || {};
  return [
    ctx.yearSelect?.value || "all",
    ctx.orgTypeSelect?.value || "all",
    ctx.orgSelect?.value || "all",
    (ctx.projectSearchInput?.value || "").trim().toLowerCase(),
    ctx.projectStatusFilterEl?.value || "all",
    (ctx.projectBudgetMinInput?.value || "").trim(),
    (ctx.projectBudgetMaxInput?.value || "").trim(),
    ctx.longestOpenAssistantFilterEl?.value || "all",
    ctx.longestOpenStatusFilterEl?.value || "all",
    currentSort?.key || "",
    currentSort?.direction || "asc"
  ].join("||");
}

function sortProjects(projects, key, direction) {
  const sorted = [...projects];

  sorted.sort((a, b) => {
    let v1, v2;

    switch (key) {
      case "year":
        v1 = Number(a.year || 0);
        v2 = Number(b.year || 0);
        break;
      case "status":
        v1 = (a.statusMain || "").toString();
        v2 = (b.statusMain || "").toString();
        if (v1.localeCompare(v2, "th-TH") < 0) return direction === "asc" ? -1 : 1;
        if (v1.localeCompare(v2, "th-TH") > 0) return direction === "asc" ? 1 : -1;
        return 0;
      case "budget":
        v1 = Number(a.budget || 0);
        v2 = Number(b.budget || 0);
        break;
      default:
        return 0;
    }

    if (v1 < v2) return direction === "asc" ? -1 : 1;
    if (v1 > v2) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

function refreshProjectStatus(ctxKey = activeProjectStatusContext) {
  if (!Array.isArray(projects)) return;

  setActiveProjectStatusContext(ctxKey);
  const signature = buildProjectStatusRefreshSignature(ctxKey);
  if (
    lastProjectStatusRefreshSignatureByContext[ctxKey] === signature &&
    lastProjectStatusProjectsRefByContext[ctxKey] === projects
  ) {
    syncChartsToContext(ctxKey);
    return;
  }

  let filtered = filterProjects();

  if (currentSort && currentSort.key) {
    filtered = sortProjects(filtered, currentSort.key, currentSort.direction);
  }

  const summary = updateSummaryCards(filtered);
  updateDashboardInsights(filtered, summary);
  updateTable(filtered);
  updateClosureStatusChart(filtered);
  updateApprovedBudgetPie(filtered);
  updateTrendLineChart(filtered);
  if (ctxKey === "staff") {
    renderHomeKpis(filtered);
  }

  if (tableCaptionEl) {
    tableCaptionEl.textContent = `แสดง ${filtered.length} โครงการ`;
  }

  lastProjectStatusRefreshSignatureByContext[ctxKey] = signature;
  lastProjectStatusProjectsRefByContext[ctxKey] = projects;
  syncChartsToContext(ctxKey);
}


function setLoading(isLoading, ctxKey = activeProjectStatusContext) {
  const ctx = projectStatusContexts[ctxKey] || {};
  const budgetCanvas = ctx.budgetChartCanvas;
  const statusCanvas = ctx.statusPieCanvas;

  const budgetSkel = ctx.budgetChartSkeletonEl;
  const statusSkel = ctx.statusPieSkeletonEl;
  const tableSkel = ctx.projectTableSkeletonEl;
  const calendarSkel = ctx.calendarSkeletonEl;

  if (budgetSkel) budgetSkel.style.display = isLoading ? "block" : "none";
  if (statusSkel) statusSkel.style.display = isLoading ? "block" : "none";
  if (tableSkel) tableSkel.style.display = isLoading ? "block" : "none";
  if (calendarSkel) calendarSkel.style.display = isLoading ? "grid" : "none";

  if (budgetCanvas) budgetCanvas.style.visibility = isLoading ? "hidden" : "visible";
  if (statusCanvas) statusCanvas.style.visibility = isLoading ? "hidden" : "visible";
  if (ctx.tableBodyEl) ctx.tableBodyEl.style.visibility = isLoading ? "hidden" : "visible";
  if (ctx.calendarContainerEl) ctx.calendarContainerEl.style.visibility = isLoading ? "hidden" : "visible";
}

function toggleProjectStatusAccess(isAuthenticated, ctxKey = activeProjectStatusContext) {
  const ctx = projectStatusContexts[ctxKey] || {};
  if (ctx.projectTableAreaEl) {
    ctx.projectTableAreaEl.style.display = isAuthenticated ? "block" : "none";
  }
  if (ctx.projectTableLockEl) {
    ctx.projectTableLockEl.style.display = isAuthenticated ? "none" : "block";
  }
}

function updateNavVisibility(isAuthenticated) {
  if (!navLinksAll.length) return;
  const allowedPages = getAllowedPagesForCurrentState();
  const publicAllowed = new Set(["home", "about", "project-status", "news", "financial-docs", "login"]);
  navLinksAll.forEach((link) => {
    const mode = link.dataset.visible || "public";
    const page = link.dataset.page || "";
    if (!allowedPages.has(page)) {
      link.style.display = "none";
      return;
    }
    if (!isAuthenticated && !publicAllowed.has(page)) {
      link.style.display = "none";
    } else if (mode === "public-only") {
      link.style.display = isAuthenticated ? "none" : "";
    } else {
      link.style.display = "";
    }
  });
  syncDesktopNavGroupVisibility();
  syncMobileNavGroupVisibility();
}

function syncDesktopNavGroupVisibility() {
  const navGroups = Array.from(document.querySelectorAll(".desktop-nav .nav-group"));
  navGroups.forEach((group) => {
    const toggleBtn = group.querySelector(".nav-group-toggle");
    const menu = group.querySelector(".nav-group-menu");
    if (!toggleBtn || !menu) return;
    const links = Array.from(menu.querySelectorAll("a[data-page]"));
    const hasVisibleLinks = links.some((link) => link.style.display !== "none");

    group.style.display = hasVisibleLinks ? "" : "none";
    if (hasVisibleLinks) return;

    // Ensure hidden groups are also closed/reset.
    group.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    menu.classList.remove("show");
    menu.setAttribute("aria-hidden", "true");
  });
}

function syncMobileNavGroupVisibility() {
  const mobileGroups = Array.from(document.querySelectorAll(".mobile-menu .mobile-menu-group"));
  mobileGroups.forEach((group) => {
    const links = Array.from(group.querySelectorAll("a[data-page]"));
    const hasVisibleLinks = links.some((link) => link.style.display !== "none");
    group.style.display = hasVisibleLinks ? "" : "none";
    if (!hasVisibleLinks) group.removeAttribute("open");
  });
}

function syncRoleNavContainers() {
  const isStaffMode = !!staffAuthUser && staffViewMode === "staff";
  const desktopGeneral = document.getElementById("desktopNavGeneral");
  const desktopStaff = document.getElementById("desktopNavStaff");

  if (desktopGeneral) desktopGeneral.style.display = isStaffMode ? "none" : "flex";
  if (desktopStaff) desktopStaff.style.display = isStaffMode ? "flex" : "none";
}

function normalizeStaffRoleCode(role) {
  const raw = (role || "").toString().trim();
  if (!raw) return "0";
  const normalized = raw.replace(/^0+(?=\d)/, "");
  return normalized || "0";
}

function getAllowedPagesForCurrentState() {
  const publicAllowed = new Set(["home", "about", "project-status", "news", "financial-docs", "login"]);
  const isAffairsProfile = currentUserProfileType === "affairs";
  if (!isUserAuthenticated) {
    return publicAllowed;
  }

  const allowed = new Set(publicAllowed);
  const protectedAllowed = [
    "dashboard-staff",
    "borrow-assets",
    "borrow-assets-staff",
    "project-status-staff",
    "meeting-room-booking",
    "meeting-room-staff"
  ];
  protectedAllowed.forEach((page) => allowed.add(page));
  if (isAffairsProfile) {
    allowed.delete("borrow-assets");
    allowed.delete("borrow-assets-staff");
  }

  if (staffAuthUser && staffViewMode === "staff") {
    const roleAllowedMap = {
      "0": ["project-status-staff", "dashboard-staff", "borrow-assets-staff", "meeting-room-staff", "login"],
      "1": ["project-status-staff", "dashboard-staff", "meeting-room-staff", "login"],
      "4": ["borrow-assets-staff", "login"],
      "9": ["meeting-room-staff", "login"]
    };
    const roleAllowed = roleAllowedMap[normalizeStaffRoleCode(staffAuthUser.role)] ||
      ["project-status-staff", "dashboard-staff", "borrow-assets-staff", "meeting-room-staff", "login"];
    const filteredRoleAllowed = isAffairsProfile
      ? roleAllowed.filter((page) => page !== "borrow-assets" && page !== "borrow-assets-staff")
      : roleAllowed;
    return new Set(filteredRoleAllowed);
  }

  if (staffViewMode !== "staff") {
    allowed.delete("dashboard-staff");
    allowed.delete("borrow-assets-staff");
    allowed.delete("project-status-staff");
    allowed.delete("meeting-room-staff");
  }

  return allowed;
}

function getStaffProfileByEmail(email) {
  const normalized = (email || "").toString().trim().toLowerCase();
  if (!normalized || !staffEmails.has(normalized)) return null;
  const profile = staffProfilesByEmail[normalized] || {};
  return {
    email: normalized,
    position: profile.position || "",
    nick: profile.nick || "",
    role: normalizeStaffRoleCode(profile.role)
  };
}

function isCurrentNavVisible() {
  if (!navLinksAll.length) return true;
  const currentPage = (window.location.hash || "#home").replace("#", "");
  const currentLink = navLinksAll.find((link) => link.dataset.page === currentPage);
  return currentLink ? currentLink.style.display !== "none" && currentLink.offsetParent !== null : true;
}

function getCurrentPageFromHash() {
  return (window.location.hash || "#home").replace("#", "");
}

function isNavPageVisible(page) {
  return getAllowedPagesForCurrentState().has(page);
}

function getModeMappedPage(currentPage, mode) {
  const toStaff = {
    "project-status": "project-status-staff",
    "borrow-assets": "borrow-assets-staff",
    "meeting-room-booking": "meeting-room-staff"
  };
  const toNormal = {
    "project-status-staff": "project-status",
    "borrow-assets-staff": "borrow-assets",
    "meeting-room-staff": "meeting-room-booking"
  };
  const map = mode === "staff" ? toStaff : toNormal;
  return map[currentPage] || "";
}

function applyStaffViewMode() {
  const staffMode = !!staffAuthUser && staffViewMode === "staff";
  updateNavVisibility(isUserAuthenticated);
  syncRoleNavContainers();
  updateNavForStaff(staffMode ? staffAuthUser : null);

  if (staffModeToggleEl) {
    staffModeToggleEl.style.display = staffAuthUser ? "flex" : "none";
  }
  staffModeBtns.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.staffMode === staffViewMode);
  });

  if (!isCurrentNavVisible()) {
    goToFirstVisibleNavPageWithPreference(null);
  }
}

function setStaffViewMode(mode) {
  if (mode !== "staff" && mode !== "normal") return;
  if (staffViewMode === mode) return;
  const previousPage = getCurrentPageFromHash();
  staffViewMode = mode;
  applyStaffViewMode();
  const mappedPage = getModeMappedPage(previousPage, staffViewMode);
  if (mappedPage) {
    goToFirstVisibleNavPageWithPreference(mappedPage);
    return;
  }
  if (!isNavPageVisible(previousPage)) {
    goToFirstVisibleNavPageWithPreference(null);
  }
}

function updateNavForStaff(staffUser) {
  if (!navLinksAll.length || !staffUser) return;
  if (staffViewMode !== "staff") return;

  const roleAllowedMap = {
    "0": new Set(["project-status-staff", "dashboard-staff", "borrow-assets-staff", "meeting-room-staff", "login"]),
    "1": new Set(["project-status-staff", "dashboard-staff", "meeting-room-staff", "login"]),
    "4": new Set(["borrow-assets-staff", "login"]),
    "9": new Set(["meeting-room-staff", "login"])
  };

  const allowedStaffPages = roleAllowedMap[normalizeStaffRoleCode(staffUser.role)] ||
    new Set(["project-status-staff", "dashboard-staff", "borrow-assets-staff", "meeting-room-staff", "login"]);

  navLinksAll.forEach((link) => {
    const page = link.dataset.page || "";
    link.style.display = allowedStaffPages.has(page) ? "" : "none";
  });
  syncDesktopNavGroupVisibility();
  syncMobileNavGroupVisibility();
}

function getPreferredPageForState(isAuth) {
  if (isAuth && !!staffAuthUser && staffViewMode === "staff") return "dashboard-staff";
  if (isAuth) return "home";
  return "home";
}

function goToFirstVisibleNavPageWithPreference(preferredPage) {
  if (!navLinksAll.length) return;

  function isVisible(link) {
    return link && link.style.display !== "none" && link.offsetParent !== null;
  }

  let targetPage = preferredPage;
  if (targetPage) {
    const preferredLink = navLinksAll.find(
      (link) => link.dataset.page === targetPage && isVisible(link)
    );
    if (!preferredLink) {
      targetPage = null;
    }
  }

  if (!targetPage) {
    const first = navLinksAll.find(isVisible);
    targetPage = first?.dataset.page;
  }

  if (!targetPage) return;

  const targetHash = `#${targetPage}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  } else {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
}

function initAuthUI() {
  if (!window.sgcuAuth) {
    const panel = document.getElementById("authPanel");
    if (panel) {
      panel.style.display = "none";
    }
    if (loginPageStatusEl) {
      loginPageStatusEl.textContent = "ปิดใช้งานการเข้าสู่ระบบ (ระบบยืนยันตัวตนถูกถอดออก)";
    }
    if (loginPageGoogleBtnEl) {
      loginPageGoogleBtnEl.style.display = "none";
      loginPageGoogleBtnEl.disabled = true;
    }
    if (loginPageLogoutBtnEl) {
      loginPageLogoutBtnEl.style.display = "none";
      loginPageLogoutBtnEl.disabled = true;
    }
    if (loginBtnEl) {
      loginBtnEl.style.display = "none";
      loginBtnEl.disabled = true;
    }
    if (logoutBtnEl) {
      logoutBtnEl.style.display = "none";
      logoutBtnEl.disabled = true;
    }
    if (mobileLogoutBtnEl) {
      mobileLogoutBtnEl.style.display = "none";
      mobileLogoutBtnEl.disabled = true;
    }
    return;
  }

  const {
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
  } = window.sgcuAuth;

  if (!auth) return;
  const AUTH_SESSION_KEY = "sgcu_auth_session_started_at";
  const LOGIN_PROFILE_STORAGE_KEY = "sgcu_user_profile_by_email_v1";
  const LEGACY_LOGIN_PROFILE_STORAGE_KEY = "sgcu_borrow_profile_by_email_v1";
  const USER_PROFILE_COLLECTION = "userProfiles";
  const sessionMaxAgeMs =
    typeof AUTH_SESSION_MAX_AGE_MS === "number" &&
    Number.isFinite(AUTH_SESSION_MAX_AGE_MS) &&
    AUTH_SESSION_MAX_AGE_MS > 0
      ? AUTH_SESSION_MAX_AGE_MS
      : 7 * 24 * 60 * 60 * 1000;

  function readAuthSession() {
    try {
      const raw = window.localStorage?.getItem(AUTH_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const startedAt = Number(parsed?.startedAt);
      const uid = (parsed?.uid || "").toString();
      if (!uid || !Number.isFinite(startedAt) || startedAt <= 0) return null;
      return { uid, startedAt };
    } catch (err) {
      return null;
    }
  }

  function writeAuthSession(uid, startedAt) {
    if (!uid || !Number.isFinite(startedAt)) return;
    try {
      window.localStorage?.setItem(
        AUTH_SESSION_KEY,
        JSON.stringify({ uid, startedAt })
      );
    } catch (err) {
      // ignore write errors (private mode / quota)
    }
  }

  function clearAuthSession() {
    try {
      window.localStorage?.removeItem(AUTH_SESSION_KEY);
    } catch (err) {
      // ignore remove errors
    }
  }

  const loginProfileFormEl = document.getElementById("loginProfileForm");
  const loginProfileTypeGroupEl = document.getElementById("loginProfileTypeGroup");
  const loginProfileTypeStudentEl = document.getElementById("loginProfileTypeStudent");
  const loginProfileTypeAffairsEl = document.getElementById("loginProfileTypeAffairs");
  const loginProfileStudentFieldsEl = document.getElementById("loginProfileStudentFields");
  const loginProfileFirstNameEl = document.getElementById("loginProfileFirstName");
  const loginProfileLastNameEl = document.getElementById("loginProfileLastName");
  const loginProfileNicknameEl = document.getElementById("loginProfileNickname");
  const loginProfileStudentIdEl = document.getElementById("loginProfileStudentId");
  const loginProfileStudentIdWarningEl = document.getElementById("loginProfileStudentIdWarning");
  const loginProfileFacultyEl = document.getElementById("loginProfileFaculty");
  const loginProfileFacultyWarningEl = document.getElementById("loginProfileFacultyWarning");
  const loginProfileYearEl = document.getElementById("loginProfileYear");
  const loginProfileYearWarningEl = document.getElementById("loginProfileYearWarning");
  const loginProfilePhoneEl = document.getElementById("loginProfilePhone");
  const loginProfilePhoneLabelEl = document.getElementById("loginProfilePhoneLabel");
  const loginProfileLineIdEl = document.getElementById("loginProfileLineId");
  const loginProfileLineIdLabelEl = document.getElementById("loginProfileLineIdLabel");
  const loginProfileSaveBtnEl = document.getElementById("loginProfileSaveBtn");
  const loginProfileStatusEl = document.getElementById("loginProfileStatus");
  let loginProfileLoadedForEmail = "";
  let loginProfileLoadSeq = 0;
  const loginProfileFacultyMap = {
    "21": "วิศวกรรมศาสตร์",
    "22": "อักษรศาสตร์",
    "23": "วิทยาศาสตร์",
    "24": "รัฐศาสตร์",
    "25": "สถาปัตยกรรมศาสตร์",
    "26": "พาณิชยศาสตร์และการบัญชี",
    "27": "ครุศาสตร์",
    "28": "นิเทศศาสตร์",
    "29": "เศรษฐศาสตร์",
    "30": "แพทยศาสตร์",
    "31": "สัตวแพทย์ศาสตร์",
    "32": "ทันตแพทย์ศาสตร์",
    "33": "เภสัชศาสตร์",
    "34": "นิติศาสตร์",
    "35": "ศิลปกรรมศาสตร์",
    "37": "สหเวชศาสตร์",
    "38": "จิตวิทยา",
    "39": "วิทยาศาสตร์การกีฬา",
    "40": "เกษตรและบูรณาการ",
    "56": "สถาบันนวัตกรรมบูรณาการฯ"
  };

  const profileStore = window.sgcuFirestore || {};

  function canUseRemoteProfileStore() {
    return !!(
      profileStore.db &&
      profileStore.doc &&
      profileStore.getDoc &&
      profileStore.setDoc &&
      profileStore.serverTimestamp
    );
  }

  function buildRemoteProfileRef(firebaseUser) {
    if (!canUseRemoteProfileStore()) return null;
    const uid = (firebaseUser?.uid || "").toString().trim();
    if (!uid) return null;
    return profileStore.doc(profileStore.db, USER_PROFILE_COLLECTION, uid);
  }

  async function readRemoteLoginProfile(firebaseUser) {
    try {
      const ref = buildRemoteProfileRef(firebaseUser);
      if (!ref) return null;
      const snap = await profileStore.getDoc(ref);
      if (!snap?.exists()) return null;
      const data = snap.data() || {};
      return data && typeof data === "object" ? data : null;
    } catch (_) {
      return null;
    }
  }

  async function writeRemoteLoginProfile(firebaseUser, profileData) {
    const ref = buildRemoteProfileRef(firebaseUser);
    if (!ref) return { ok: false, code: "store-not-ready" };
    try {
      await profileStore.setDoc(
        ref,
        {
          ...(profileData || {}),
          uid: (firebaseUser?.uid || "").toString(),
          email: (firebaseUser?.email || "").toString().trim().toLowerCase(),
          updatedAt: profileStore.serverTimestamp()
        },
        { merge: true }
      );
      return { ok: true, code: "" };
    } catch (err) {
      const code = (err?.code || "unknown").toString();
      console.error("save user profile to firestore failed - app.sorting-auth.js:562", err);
      return { ok: false, code };
    }
  }

  function readLoginProfiles() {
    try {
      const rawPrimary = window.localStorage?.getItem(LOGIN_PROFILE_STORAGE_KEY);
      const rawLegacy = window.localStorage?.getItem(LEGACY_LOGIN_PROFILE_STORAGE_KEY);
      const raw = rawPrimary || rawLegacy;
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!rawPrimary && rawLegacy) {
        writeLoginProfiles(parsed);
      }
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function writeLoginProfiles(profiles) {
    const safeProfiles = profiles || {};
    try {
      window.localStorage?.setItem(
        LOGIN_PROFILE_STORAGE_KEY,
        JSON.stringify(safeProfiles)
      );
    } catch (err) {
      // ignore localStorage errors
    }
    try {
      window.localStorage?.setItem(
        LEGACY_LOGIN_PROFILE_STORAGE_KEY,
        JSON.stringify(safeProfiles)
      );
    } catch (err) {
      // ignore localStorage errors
    }
  }

  function setLoginProfileStatus(text, color = "#6b7280") {
    if (!loginProfileStatusEl) return;
    loginProfileStatusEl.textContent = text || "";
    loginProfileStatusEl.style.color = color;
  }

  function setLoginProfileEnabled(enabled) {
    const disabled = !enabled;
    if (loginProfileFormEl) {
      loginProfileFormEl.style.opacity = disabled ? "0.7" : "1";
    }
    if (loginProfileFirstNameEl) loginProfileFirstNameEl.disabled = disabled;
    if (loginProfileLastNameEl) loginProfileLastNameEl.disabled = disabled;
    if (loginProfileNicknameEl) loginProfileNicknameEl.disabled = disabled;
    if (loginProfileStudentIdEl) loginProfileStudentIdEl.disabled = disabled;
    if (loginProfilePhoneEl) loginProfilePhoneEl.disabled = disabled;
    if (loginProfileLineIdEl) loginProfileLineIdEl.disabled = disabled;
    if (loginProfileTypeStudentEl) loginProfileTypeStudentEl.disabled = disabled;
    if (loginProfileTypeAffairsEl) loginProfileTypeAffairsEl.disabled = disabled;
    if (loginProfileSaveBtnEl) loginProfileSaveBtnEl.disabled = disabled;
  }

  function getLoginProfileType() {
    return loginProfileTypeAffairsEl?.checked ? "affairs" : "student";
  }

  function renderLoginProfileTypeTabs() {
    if (!loginProfileTypeGroupEl) return;
    const labels = Array.from(loginProfileTypeGroupEl.querySelectorAll("label.tab-btn"));
    labels.forEach((label) => label.classList.remove("is-active"));
    const activeInput = loginProfileTypeAffairsEl?.checked
      ? loginProfileTypeAffairsEl
      : loginProfileTypeStudentEl;
    const activeLabel = activeInput ? activeInput.closest("label.tab-btn") : null;
    if (activeLabel) activeLabel.classList.add("is-active");
  }

  function applyLoginProfileTypeUI() {
    const isStudent = getLoginProfileType() === "student";
    if (loginProfileStudentFieldsEl) {
      loginProfileStudentFieldsEl.style.display = isStudent ? "" : "none";
    }
    if (loginProfileNicknameEl) loginProfileNicknameEl.required = isStudent;
    if (loginProfileStudentIdEl) loginProfileStudentIdEl.required = isStudent;
    if (loginProfilePhoneEl) {
      if (isStudent) {
        loginProfilePhoneEl.required = true;
        loginProfilePhoneEl.type = "tel";
        loginProfilePhoneEl.pattern = "^0\\d{9}$";
        loginProfilePhoneEl.placeholder = "รูปแบบ: 0xxXXXxxxx";
      } else {
        loginProfilePhoneEl.required = false;
        loginProfilePhoneEl.type = "text";
        loginProfilePhoneEl.removeAttribute("pattern");
        loginProfilePhoneEl.placeholder = "เช่น เบอร์โทร / LINE / Email";
      }
    }
    if (loginProfilePhoneLabelEl) {
      loginProfilePhoneLabelEl.textContent = isStudent
        ? "เบอร์โทรติดต่อกลับ"
        : "ข้อมูลติดต่อกลับ";
    }
    if (loginProfileLineIdEl) {
      loginProfileLineIdEl.required = isStudent;
      loginProfileLineIdEl.placeholder = isStudent ? "Line ID" : "ช่องทางอื่น (ถ้ามี)";
    }
    if (loginProfileLineIdLabelEl) {
      loginProfileLineIdLabelEl.textContent = isStudent
        ? "Line ID"
        : "ข้อมูลติดต่อกลับ (อื่น ๆ)";
    }
    if (!isStudent) {
      if (loginProfileStudentIdWarningEl) loginProfileStudentIdWarningEl.hidden = true;
      if (loginProfileFacultyWarningEl) loginProfileFacultyWarningEl.hidden = true;
      if (loginProfileYearWarningEl) loginProfileYearWarningEl.hidden = true;
    } else {
      updateLoginProfileStudentMeta();
    }
    renderLoginProfileTypeTabs();
  }

  function updateLoginProfileStudentMeta() {
    if (!loginProfileStudentIdEl || !loginProfileFacultyEl || !loginProfileYearEl) return;
    const rawValue = loginProfileStudentIdEl.value || "";
    const digits = rawValue.replace(/\D/g, "");
    const hasNonDigits = rawValue.trim() !== "" && digits.length !== rawValue.replace(/\s/g, "").length;
    if (loginProfileStudentIdWarningEl) {
      if (hasNonDigits) {
        loginProfileStudentIdWarningEl.textContent = "กรุณากรอกตัวเลขเท่านั้น";
        loginProfileStudentIdWarningEl.hidden = false;
      } else {
        loginProfileStudentIdWarningEl.hidden = true;
      }
    }
    if (digits.length < 10) {
      loginProfileFacultyEl.value = "";
      loginProfileYearEl.value = "";
      if (loginProfileFacultyWarningEl) loginProfileFacultyWarningEl.hidden = true;
      if (loginProfileYearWarningEl) loginProfileYearWarningEl.hidden = true;
      return;
    }

    const code = digits.slice(-2);
    const label = loginProfileFacultyMap[code];
    loginProfileFacultyEl.value = label ? label : "";
    if (loginProfileFacultyWarningEl) loginProfileFacultyWarningEl.hidden = !!label;

    const entryYearSuffix = digits.slice(0, 2);
    const entryYear = 2500 + Number(entryYearSuffix);
    const now = new Date();
    const currentYear = now.getFullYear();
    const academicYear = (now.getMonth() + 1 >= 8) ? currentYear : currentYear - 1;
    const academicYearBE = academicYear + 543;
    const yearLevel = Number.isFinite(entryYear)
      ? academicYearBE - entryYear + 1
      : NaN;
    const isValidYearLevel = yearLevel >= 1 && yearLevel <= 8;
    loginProfileYearEl.value = isValidYearLevel ? String(yearLevel) : "";
    if (loginProfileYearWarningEl) loginProfileYearWarningEl.hidden = isValidYearLevel;
  }

  function clearLoginProfileFields() {
    currentUserProfileType = "student";
    if (loginProfileTypeStudentEl) loginProfileTypeStudentEl.checked = true;
    if (loginProfileTypeAffairsEl) loginProfileTypeAffairsEl.checked = false;
    if (loginProfileFirstNameEl) loginProfileFirstNameEl.value = "";
    if (loginProfileLastNameEl) loginProfileLastNameEl.value = "";
    if (loginProfileNicknameEl) loginProfileNicknameEl.value = "";
    if (loginProfileStudentIdEl) loginProfileStudentIdEl.value = "";
    if (loginProfilePhoneEl) loginProfilePhoneEl.value = "";
    if (loginProfileLineIdEl) loginProfileLineIdEl.value = "";
    if (loginProfileFacultyEl) loginProfileFacultyEl.value = "";
    if (loginProfileYearEl) loginProfileYearEl.value = "";
    if (loginProfileStudentIdWarningEl) loginProfileStudentIdWarningEl.hidden = true;
    if (loginProfileFacultyWarningEl) loginProfileFacultyWarningEl.hidden = true;
    if (loginProfileYearWarningEl) loginProfileYearWarningEl.hidden = true;
    applyLoginProfileTypeUI();
  }

  function applyLoginProfileToFields(profile, firebaseUser) {
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const storedType = (safeProfile.profileType || "").toString().trim().toLowerCase();
    const resolvedType = storedType === "affairs" || storedType === "student"
      ? storedType
      : ((safeProfile.studentId || "").toString().trim() ? "student" : "affairs");
    currentUserProfileType = resolvedType;
    if (loginProfileTypeStudentEl) loginProfileTypeStudentEl.checked = resolvedType !== "affairs";
    if (loginProfileTypeAffairsEl) loginProfileTypeAffairsEl.checked = resolvedType === "affairs";

    const displayName = (firebaseUser?.displayName || "").toString().trim();
    const parts = displayName ? displayName.split(/\s+/) : [];
    const fallbackFirstName = parts[0] || "";
    const fallbackLastName = parts.length > 1 ? parts.slice(1).join(" ") : "";

    if (loginProfileFirstNameEl) {
      loginProfileFirstNameEl.value = (safeProfile.firstName || fallbackFirstName || "").toString();
    }
    if (loginProfileLastNameEl) {
      loginProfileLastNameEl.value = (safeProfile.lastName || fallbackLastName || "").toString();
    }
    if (loginProfileNicknameEl) {
      loginProfileNicknameEl.value = (safeProfile.nickname || "").toString();
    }
    if (loginProfileStudentIdEl) {
      loginProfileStudentIdEl.value = (safeProfile.studentId || "").toString();
    }
    if (loginProfilePhoneEl) {
      loginProfilePhoneEl.value = (safeProfile.phone || "").toString();
    }
    if (loginProfileLineIdEl) {
      loginProfileLineIdEl.value = (safeProfile.lineId || "").toString();
    }
    applyLoginProfileTypeUI();
    updateLoginProfileStudentMeta();
    if (isUserAuthenticated) {
      applyStaffViewMode();
    }
  }

  function loadLoginProfileByUser(firebaseUser, options = {}) {
    const forceReload = !!options.forceReload;
    const forceRemote = !!options.forceRemote;
    const email = (firebaseUser?.email || "").toString().trim().toLowerCase();
    if (!email) {
      loginProfileLoadedForEmail = "";
      clearLoginProfileFields();
      return;
    }
    if (!forceReload && !forceRemote && loginProfileLoadedForEmail === email) {
      return;
    }

    const profile = readLoginProfiles()[email] || {};
    applyLoginProfileToFields(profile, firebaseUser);
    if (profile.firstName || profile.lastName || profile.nickname || profile.studentId || profile.phone || profile.lineId) {
      setLoginProfileStatus("โหลดข้อมูลผู้ใช้เดิมแล้ว", "#047857");
    } else {
      setLoginProfileStatus("กรอกข้อมูลผู้ใช้และกดบันทึกได้เลย", "#6b7280");
    }
    loginProfileLoadedForEmail = email;
    if (forceReload) {
      setLoginProfileStatus("กำลังโหลดข้อมูลผู้ใช้ล่าสุดจาก Firebase...", "#0f766e");
    }

    const currentSeq = ++loginProfileLoadSeq;
    void readRemoteLoginProfile(firebaseUser).then((remoteProfile) => {
      const currentEmail = (auth.currentUser?.email || "").toString().trim().toLowerCase();
      if (!remoteProfile || currentSeq !== loginProfileLoadSeq || currentEmail !== email) return;
      applyLoginProfileToFields(remoteProfile, firebaseUser);
      const cached = readLoginProfiles();
      cached[email] = {
        ...(cached[email] || {}),
        ...remoteProfile,
        updatedAt: Date.now()
      };
      writeLoginProfiles(cached);
      window.dispatchEvent(new CustomEvent("sgcu:user-profile-updated", {
        detail: { email, profile: cached[email] }
      }));
    });
  }

  async function saveLoginProfile(firebaseUser) {
    const email = (firebaseUser?.email || "").toString().trim().toLowerCase();
    if (!email) {
      setLoginProfileStatus("กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูลผู้ใช้", "#b91c1c");
      return false;
    }

    const profileType = getLoginProfileType();
    currentUserProfileType = profileType;
    const isStudent = profileType === "student";

    if (
      loginProfileFirstNameEl &&
      !loginProfileFirstNameEl.reportValidity()
    ) return false;
    if (
      loginProfileLastNameEl &&
      !loginProfileLastNameEl.reportValidity()
    ) return false;
    if (isStudent) {
      if (
        loginProfileNicknameEl &&
        !loginProfileNicknameEl.reportValidity()
      ) return false;
      if (
        loginProfileStudentIdEl &&
        !loginProfileStudentIdEl.reportValidity()
      ) return false;
    }
    if (isStudent) {
      if (
        loginProfilePhoneEl &&
        !loginProfilePhoneEl.reportValidity()
      ) return false;
      if (
        loginProfileLineIdEl &&
        !loginProfileLineIdEl.reportValidity()
      ) return false;
    }

    updateLoginProfileStudentMeta();
    if (isStudent && (!loginProfileFacultyEl?.value || !loginProfileYearEl?.value)) {
      setLoginProfileStatus("กรุณาตรวจสอบเลขประจำตัวนิสิตเพื่อให้ระบบระบุคณะและชั้นปี", "#b91c1c");
      return false;
    }

    const firstName = (loginProfileFirstNameEl?.value || "").toString().trim();
    const lastName = (loginProfileLastNameEl?.value || "").toString().trim();
    const nickname = isStudent ? (loginProfileNicknameEl?.value || "").toString().trim() : "";
    const studentId = isStudent ? (loginProfileStudentIdEl?.value || "").toString().trim() : "";
    const faculty = isStudent ? (loginProfileFacultyEl?.value || "").toString().trim() : "";
    const year = isStudent ? (loginProfileYearEl?.value || "").toString().trim() : "";
    const phone = (loginProfilePhoneEl?.value || "").toString().trim();
    const lineId = (loginProfileLineIdEl?.value || "").toString().trim();

    const profiles = readLoginProfiles();
    const existing = profiles[email] && typeof profiles[email] === "object" ? profiles[email] : {};
    profiles[email] = {
      ...existing,
      profileType,
      firstName,
      lastName,
      nickname,
      studentId,
      faculty,
      year,
      phone,
      lineId,
      updatedAt: Date.now()
    };
    writeLoginProfiles(profiles);
    applyStaffViewMode();
    window.dispatchEvent(new CustomEvent("sgcu:user-profile-updated", {
      detail: { email, profile: profiles[email] }
    }));
    if (loginProfileSaveBtnEl) loginProfileSaveBtnEl.disabled = true;
    const remoteResult = await writeRemoteLoginProfile(firebaseUser, profiles[email]);
    if (loginProfileSaveBtnEl) loginProfileSaveBtnEl.disabled = false;
    if (remoteResult.ok) {
      setLoginProfileStatus("บันทึกข้อมูลผู้ใช้เรียบร้อยแล้ว", "#047857");
    } else {
      const code = remoteResult.code || "unknown";
      if (code === "permission-denied") {
        setLoginProfileStatus("บันทึกในเครื่องแล้ว แต่ Firebase ไม่มีสิทธิ์เขียน (permission-denied)", "#b45309");
      } else if (code === "unauthenticated") {
        setLoginProfileStatus("บันทึกในเครื่องแล้ว แต่ Firebase ต้องล็อกอินใหม่ก่อนบันทึก (unauthenticated)", "#b45309");
      } else {
        setLoginProfileStatus(`บันทึกในเครื่องแล้ว แต่บันทึก Firebase ไม่สำเร็จ (${code})`, "#b45309");
      }
    }
    return true;
  }

  function resolveSessionStart(user) {
    const uid = user?.uid || "";
    if (!uid) return null;

    const stored = readAuthSession();
    if (stored && stored.uid === uid) return stored.startedAt;

    const fallbackMs = new Date(user?.metadata?.lastSignInTime || "").getTime();
    const startedAt = Number.isFinite(fallbackMs) && fallbackMs > 0
      ? fallbackMs
      : Date.now();
    writeAuthSession(uid, startedAt);
    return startedAt;
  }

  function refreshAuthDisplay(firebaseUser) {
    const hasFirebase = !!firebaseUser;
    staffAuthUser = hasFirebase ? getStaffProfileByEmail(firebaseUser.email) : null;
    if (!staffAuthUser) {
      staffViewMode = "normal";
    }
    const hasStaff = !!staffAuthUser;
    const isAuth = hasFirebase;
    isUserAuthenticated = isAuth;
    const staffLabel = hasStaff
      ? [staffAuthUser.email, staffAuthUser.position].filter(Boolean).join(" ")
      : "";
    const nameText = hasFirebase
      ? `สวัสดี, ${firebaseUser.displayName || firebaseUser.email || ""}`
      : hasStaff
        ? `Staff : ${staffLabel}${staffAuthUser.nick ? ` (${staffAuthUser.nick})` : ""}`
        : "";

    if (userInfoEl) userInfoEl.textContent = "";
    if (logoutBtnEl) logoutBtnEl.style.display = isAuth ? "inline-block" : "none";
    if (mobileLogoutBtnEl) mobileLogoutBtnEl.style.display = isAuth ? "block" : "none";
    if (loginPageStatusEl) loginPageStatusEl.textContent = nameText;
    if (loginPageGoogleBtnEl) {
      loginPageGoogleBtnEl.style.display = isAuth ? "none" : "inline-block";
    }
    if (loginPageLogoutBtnEl) {
      loginPageLogoutBtnEl.style.display = isAuth ? "inline-block" : "none";
    }
    setLoginProfileEnabled(isAuth);
    loadLoginProfileByUser(firebaseUser);
    if (!isAuth) {
      setLoginProfileStatus("เข้าสู่ระบบก่อนจึงจะบันทึกข้อมูลผู้ใช้ได้", "#6b7280");
    }
    applyStaffViewMode();
    toggleProjectStatusAccess(isAuth, "public");
    toggleProjectStatusAccess(isAuth, "staff");

    // เปลี่ยนหน้าเฉพาะเมื่อหน้าปัจจุบันไม่สามารถมองเห็นได้
    const preferredPage = getPreferredPageForState(isAuth);
    const currentPage = getCurrentPageFromHash();
    if (!isNavPageVisible(currentPage)) {
      goToFirstVisibleNavPageWithPreference(preferredPage);
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const startedAt = resolveSessionStart(user);
      if (startedAt && Date.now() - startedAt >= sessionMaxAgeMs) {
        clearAuthSession();
        signOut(auth).catch((err) => {
          console.error("auto logout error (session expired) - app.sorting-auth.js:970", err);
        });
        refreshAuthDisplay(null);
        window.dispatchEvent(
          new CustomEvent("sgcu:auth-state", {
            detail: { isAuthenticated: false }
          })
        );
        return;
      }
    } else {
      clearAuthSession();
    }
    refreshAuthDisplay(user);
    window.dispatchEvent(
      new CustomEvent("sgcu:auth-state", {
        detail: { isAuthenticated: !!user }
      })
    );
  });

  function handleGoogleLogin() {
    function getAuthErrorMessage(err) {
      const code = err?.code || "";
      const host = window.location.host;
      const protocol = window.location.protocol;
      const currentOrigin = window.location.origin;

      if (code === "auth/unauthorized-domain") {
        return [
          "ล็อกอินไม่สำเร็จ: โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase",
          `โดเมนปัจจุบัน: ${host}`,
          "ให้เพิ่มโดเมนนี้ใน Firebase Console > Authentication > Settings > Authorized domains"
        ].join("\n");
      }

      if (protocol !== "https:" && host !== "localhost") {
        return [
          "ล็อกอินไม่สำเร็จ: หน้าเว็บไม่ได้เปิดผ่าน HTTPS",
          `ต้นทางปัจจุบัน: ${currentOrigin}`,
          "Google/Firebase Sign-in บนโดเมนจริงควรใช้ HTTPS"
        ].join("\n");
      }

      return `ล็อกอินไม่สำเร็จ (${code || "unknown"}): ${err?.message || err}`;
    }

    signInWithPopup(auth, new GoogleAuthProvider()).catch((err) => {
      alert(getAuthErrorMessage(err));
    });
  }

  if (loginBtnEl) {
    loginBtnEl.addEventListener("click", handleGoogleLogin);
  }
  if (loginPageGoogleBtnEl) {
    loginPageGoogleBtnEl.addEventListener("click", handleGoogleLogin);
  }
  if (loginProfileSaveBtnEl) {
    loginProfileSaveBtnEl.addEventListener("click", () => {
      void saveLoginProfile(auth.currentUser);
    });
  }
  [loginProfileFirstNameEl, loginProfileLastNameEl, loginProfileNicknameEl, loginProfilePhoneEl, loginProfileLineIdEl].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (auth.currentUser) {
        setLoginProfileStatus("มีการเปลี่ยนแปลงข้อมูล กดบันทึกเพื่ออัปเดต", "#6b7280");
      }
    });
  });
  if (loginProfileStudentIdEl) {
    loginProfileStudentIdEl.addEventListener("input", () => {
      updateLoginProfileStudentMeta();
      if (auth.currentUser) {
        setLoginProfileStatus("มีการเปลี่ยนแปลงข้อมูล กดบันทึกเพื่ออัปเดต", "#6b7280");
      }
    });
    loginProfileStudentIdEl.addEventListener("blur", updateLoginProfileStudentMeta);
    updateLoginProfileStudentMeta();
  }
  [loginProfileTypeStudentEl, loginProfileTypeAffairsEl].forEach((input) => {
    if (!input) return;
    input.addEventListener("change", () => {
      applyLoginProfileTypeUI();
      if (auth.currentUser) {
        setLoginProfileStatus("มีการเปลี่ยนแปลงข้อมูล กดบันทึกเพื่ออัปเดต", "#6b7280");
      }
    });
  });
  applyLoginProfileTypeUI();
  function handleLogout() {
    staffAuthUser = null;
    staffViewMode = "normal";
    refreshAuthDisplay(auth.currentUser);
    clearAuthSession();
    signOut(auth).catch((err) => {
      console.error("logout error  app.js:3632 - app.sorting-auth.js:1067", err);
    });
    loginProfileLoadedForEmail = "";
    setLoginProfileStatus("ออกจากระบบแล้ว", "#6b7280");

    const hamburger = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (hamburger && mobileMenu) {
      if (typeof setMobileMenuState === "function") {
        setMobileMenuState(mobileMenu, hamburger, false);
      } else {
        mobileMenu.classList.remove("show");
        mobileMenu.setAttribute("aria-hidden", "true");
        hamburger.setAttribute("aria-expanded", "false");
      }
    }
  }

  if (logoutBtnEl) {
    logoutBtnEl.addEventListener("click", handleLogout);
  }
  if (loginPageLogoutBtnEl) {
    loginPageLogoutBtnEl.addEventListener("click", handleLogout);
  }
  if (mobileLogoutBtnEl) {
    mobileLogoutBtnEl.addEventListener("click", handleLogout);
  }

  function initLoginNotificationControls() {
    const enableBtn = document.getElementById("loginNotificationEnableBtn");
    const summaryEl = document.getElementById("loginNotificationSummary");
    if (!enableBtn || !summaryEl) return;

    const renderNotificationState = () => {
      const isSupported = typeof window !== "undefined" && typeof window.Notification !== "undefined";
      const permission = isSupported ? Notification.permission : "unsupported";
      const permissionText = permission === "granted"
        ? "อนุญาตแล้ว"
        : permission === "denied"
          ? "ถูกบล็อก"
          : isSupported ? "ยังไม่อนุญาต" : "ไม่รองรับ";
      summaryEl.textContent = `การแจ้งเตือน: ${permissionText}`;
      summaryEl.style.color = permission === "denied" ? "#b91c1c" : "#6b7280";

      if (!isSupported) {
        enableBtn.disabled = true;
        enableBtn.textContent = "อุปกรณ์ไม่รองรับแจ้งเตือน";
      } else if (permission === "granted") {
        enableBtn.disabled = true;
        enableBtn.textContent = "อนุญาตแจ้งเตือนแล้ว";
      } else {
        enableBtn.disabled = false;
        enableBtn.textContent = "อนุญาตแจ้งเตือน";
      }
    };

    enableBtn.addEventListener("click", () => {
      if (typeof window === "undefined" || typeof window.Notification === "undefined") {
        renderNotificationState();
        return;
      }
      enableBtn.disabled = true;
      Notification.requestPermission()
        .catch(() => {})
        .finally(() => {
          renderNotificationState();
        });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible") return;
      renderNotificationState();
    });
    renderNotificationState();
  }

  initLoginNotificationControls();
  refreshAuthDisplayFn = refreshAuthDisplay;
}
