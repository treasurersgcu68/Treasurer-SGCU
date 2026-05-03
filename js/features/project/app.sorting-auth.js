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
  if (!raw) return "";
  const normalized = raw.replace(/^0+(?=\d)/, "");
  return normalized || "0";
}

function hasStaffRoleToken(roleValue, roleToken) {
  const target = normalizeStaffRoleCode(roleToken);
  const tokens = (roleValue || "")
    .toString()
    .split(",")
    .map((item) => normalizeStaffRoleCode(item))
    .filter(Boolean);
  return tokens.includes(target);
}

const STAFF_HEAD_OVERRIDES = new Set([]);
const STAFF_PAGE_OPTIONS = [
  "dashboard-staff",
  "project-status-staff",
  "borrow-assets-staff",
  "meeting-room-staff",
  "budget-approval-request",
  "staff-approval",
  "login"
];
let unsubscribeCurrentStaffApproval = null;
let unsubscribeStaffPositionAccess = null;
let staffPositionAccessByName = {};
let staffPositionAccessByCode = {};
const currentStaffApprovalState = {
  email: "",
  hasApproved: false,
  approvedDivisionCodesYY: []
};

function normalizeDivisionCodeYY(value) {
  const raw = (value || "").toString().trim();
  if (!raw) return "";
  return raw.padStart(2, "0").slice(-2);
}

function resolveStaffDivisionCodeYY(profile) {
  const directYY = normalizeDivisionCodeYY(profile?.divisionCodeYY || profile?.positionCodeYY || "");
  if (directYY) return directYY;
  const positionCode = (profile?.positionCode || "").toString().trim();
  const match = positionCode.match(/^SGCU\d{2}\.10\.(\d{2})\.\d{2}-\d{3}$/i);
  if (match?.[1]) return normalizeDivisionCodeYY(match[1]);
  const positionText = (profile?.position || "").toString().trim().replace(/\s+/g, " ");
  if (positionText) {
    if (positionText === "เหรัญญิก" || positionText === "เลขานุการฝ่ายเหรัญญิก") return "00";
    if (positionText === "ผู้ช่วยเหรัญญิก") return "01";
    if (positionText.includes("บริหารและพัฒนางบประมาณ")) return "02";
    if (positionText.includes("หาทุนและสิทธิประโยชน์")) return "03";
    if (positionText.includes("กายภาพและพัสดุ")) return "04";
    if (positionText.includes("สำนักบริหารกิจการนิสิต")) return "09";
    if (positionText.includes("เหรัญญิก")) return "00";
  }
  return "";
}

function resolveStaffDivisionCodesYY(profile) {
  const codes = new Set();
  const positions = Array.isArray(profile?.positions) ? profile.positions : [];
  positions.forEach((entry) => {
    const byField = normalizeDivisionCodeYY(entry?.yy || entry?.positionCodeYY || entry?.divisionCodeYY || "");
    if (byField) {
      codes.add(byField);
      return;
    }
    const byCode = normalizeDivisionCodeYY(
      (entry?.code || entry?.positionCode || "").toString().match(/^SGCU\d{2}\.10\.(\d{2})\.\d{2}-\d{3}$/i)?.[1] || ""
    );
    if (byCode) codes.add(byCode);
  });
  const legacy = resolveStaffDivisionCodeYY(profile);
  if (legacy) codes.add(legacy);
  return Array.from(codes);
}

function resolveDivisionCodeYYFromPositionLabel(positionText) {
  const text = (positionText || "").toString().trim().replace(/\s+/g, " ");
  if (!text) return "";
  if (text === "เหรัญญิก" || text === "เลขานุการฝ่ายเหรัญญิก") return "00";
  if (text === "ผู้ช่วยเหรัญญิก") return "01";
  if (text.includes("บริหารและพัฒนางบประมาณ")) return "02";
  if (text.includes("หาทุนและสิทธิประโยชน์")) return "03";
  if (text.includes("กายภาพและพัสดุ")) return "04";
  if (text.includes("สำนักบริหารกิจการนิสิต")) return "09";
  if (text.includes("เหรัญญิก")) return "00";
  return "";
}

function extractApprovedDivisionCodesFromDocs(docs = []) {
  const approvedYY = new Set();
  let hasApproved = false;
  docs.forEach((docSnap) => {
    const data = typeof docSnap?.data === "function" ? (docSnap.data() || {}) : (docSnap || {});
    const status = (data.status || "").toString().trim().toLowerCase();
    if (status !== "approved") return;
    hasApproved = true;
    const codeMatch = (data.approvedPositionCode || "").toString().match(/^SGCU\d{2}\.10\.(\d{2})\.\d{2}-\d{3}$/i);
    const yyFromCode = normalizeDivisionCodeYY(codeMatch?.[1] || "");
    const yyFromLabel = resolveDivisionCodeYYFromPositionLabel(data.approvedPosition || data.requestedPosition || "");
    if (yyFromCode) approvedYY.add(yyFromCode);
    else if (yyFromLabel) approvedYY.add(yyFromLabel);
  });
  return {
    hasApproved,
    divisionCodesYY: Array.from(approvedYY)
  };
}

function isHeadStaffProfile(profile) {
  const yyList = resolveStaffDivisionCodesYY(profile);
  return yyList.includes("00");
}

function normalizeAllowedStaffPages(pages, fallbackYY = "") {
  const list = Array.isArray(pages)
    ? pages.map((item) => (item || "").toString().trim()).filter(Boolean)
    : [];
  const filtered = Array.from(new Set(list.filter((page) => STAFF_PAGE_OPTIONS.includes(page))));
  return filtered.length ? filtered : Array.from(getAllowedStaffPagesByYY(fallbackYY));
}

function getAllowedStaffPagesByYY(yy, roleValue = "") {
  const normalizedYY = normalizeDivisionCodeYY(yy);
  if (normalizedYY === "00") {
    return new Set(["project-status-staff", "dashboard-staff", "borrow-assets-staff", "meeting-room-staff", "budget-approval-request", "staff-approval", "login"]);
  }
  return new Set(["login"]);
}

function getAllowedStaffPagesByYYList(yyList = [], roleValue = "") {
  const list = Array.isArray(yyList) ? yyList : [];
  if (!list.length) return new Set(["login"]);
  const merged = new Set();
  list.forEach((yy) => {
    getAllowedStaffPagesByYY(yy, roleValue).forEach((page) => merged.add(page));
  });
  return merged;
}

function findAllowedPagesFromPositionCatalog(positionName, yy, zz) {
  const normalizedName = (positionName || "").toString().trim().toLowerCase();
  const normalizedYY = normalizeDivisionCodeYY(yy);
  const normalizedZZ = normalizeDivisionCodeYY(zz);
  if (normalizedName && Array.isArray(staffPositionAccessByName[normalizedName])) {
    return staffPositionAccessByName[normalizedName];
  }
  const codeKey = normalizedYY && normalizedZZ ? `${normalizedYY}.${normalizedZZ}` : "";
  if (codeKey && Array.isArray(staffPositionAccessByCode[codeKey])) {
    return staffPositionAccessByCode[codeKey];
  }
  return null;
}

function getAllowedStaffPagesByProfile(profile) {
  const merged = new Set();
  const positions = Array.isArray(profile?.positions) ? profile.positions : [];
  positions.forEach((entry) => {
    const yy = normalizeDivisionCodeYY(entry?.yy || entry?.positionCodeYY || entry?.divisionCodeYY || "");
    const zz = normalizeDivisionCodeYY(entry?.zz || entry?.positionCodeZZ || entry?.levelCodeZZ || "");
    const catalogPages = findAllowedPagesFromPositionCatalog(entry?.name || entry?.position || "", yy, zz);
    const effectivePages = Array.isArray(catalogPages)
      ? normalizeAllowedStaffPages(catalogPages, yy)
      : normalizeAllowedStaffPages(entry?.allowedPages, yy);
    effectivePages.forEach((page) => merged.add(page));
  });

  if (merged.size) return merged;
  return getAllowedStaffPagesByYYList(
    profile?.divisionCodesYY?.length ? profile.divisionCodesYY : [profile?.divisionCodeYY],
    profile?.role
  );
}

function getAllowedPagesForCurrentState() {
  const publicAllowed = new Set(["home", "about", "project-status", "news", "financial-docs", "login"]);
  const isAffairsProfile = currentUserProfileType === "affairs";
  if (!isUserAuthenticated) {
    return publicAllowed;
  }

  const allowed = new Set(publicAllowed);
  const protectedAllowed = [
    "borrow-assets",
    "meeting-room-booking",
    "budget-approval-request",
    "staff-application"
  ];
  protectedAllowed.forEach((page) => allowed.add(page));
  if (isAffairsProfile) {
    allowed.delete("borrow-assets");
    allowed.delete("borrow-assets-staff");
  }

  if (staffAuthUser && staffViewMode === "staff") {
    const yyAllowed = getAllowedStaffPagesByProfile(staffAuthUser);
    yyAllowed.add("budget-approval-request");
    if (isAffairsProfile) {
      yyAllowed.delete("borrow-assets");
      yyAllowed.delete("borrow-assets-staff");
    }
    return yyAllowed;
  }

  if (staffViewMode !== "staff") {
    allowed.delete("dashboard-staff");
    allowed.delete("borrow-assets-staff");
    allowed.delete("project-status-staff");
    allowed.delete("meeting-room-staff");
    if (!isHeadStaffProfile(staffAuthUser)) {
      allowed.delete("staff-approval");
    }
  }

  return allowed;
}

function getStaffProfileByEmail(email) {
  const normalized = (email || "").toString().trim().toLowerCase();
  if (!normalized) return null;
  const isCurrentUserApproved =
    currentStaffApprovalState.email === normalized && currentStaffApprovalState.hasApproved === true;
  if (!isCurrentUserApproved) return null;
  const hasRealProfile = staffEmails.has(normalized);
  const isOverrideHead = STAFF_HEAD_OVERRIDES.has(normalized) && !hasRealProfile;
  if (!isOverrideHead && !hasRealProfile) return null;
  const profile = staffProfilesByEmail[normalized] || {};
  if (isOverrideHead) {
    return {
      email: normalized,
      position: profile.position || "เหรัญญิก",
      nick: profile.nick || "",
      role: "0",
      divisionCodeYY: "00",
      divisionCodesYY: ["00"],
      positionCodeYY: "00",
      positionCode: (profile.positionCode || "").toString(),
      positions: Array.isArray(profile.positions) ? profile.positions : []
    };
  }
  const approvalYY = Array.isArray(currentStaffApprovalState.approvedDivisionCodesYY)
    ? currentStaffApprovalState.approvedDivisionCodesYY
    : [];
  const profileYY = resolveStaffDivisionCodesYY(profile);
  const mergedYY = Array.from(new Set([...profileYY, ...approvalYY].map((item) => normalizeDivisionCodeYY(item)).filter(Boolean)));
  const effectiveYY = mergedYY[0] || resolveStaffDivisionCodeYY(profile);

  return {
    email: normalized,
    position: profile.position || "",
    nick: profile.nick || "",
    role: (() => {
      const yyList = mergedYY.length ? mergedYY : resolveStaffDivisionCodesYY(profile);
      const baseRole = normalizeStaffRoleCode(profile.role);
      if (baseRole) return baseRole;
      return yyList.includes("00") ? "0" : "1";
    })(),
    divisionCodeYY: effectiveYY,
    divisionCodesYY: mergedYY.length ? mergedYY : resolveStaffDivisionCodesYY(profile),
    positionCodeYY: effectiveYY,
    positionCode: (profile.positionCode || "").toString(),
    positions: Array.isArray(profile.positions) ? profile.positions : []
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
  const suppressStaffApplicationRedirect = window.__sgcuStaffApplicationFlowActive === true;
  updateNavVisibility(isUserAuthenticated);
  syncRoleNavContainers();
  updateNavForStaff(staffMode ? staffAuthUser : null);

  if (staffModeToggleEl) {
    staffModeToggleEl.style.display = staffAuthUser ? "flex" : "none";
  }
  staffModeBtns.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.staffMode === staffViewMode);
  });

  if (!isCurrentNavVisible() && !suppressStaffApplicationRedirect) {
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

  const allowedStaffPages = getAllowedStaffPagesByProfile(staffUser);

  navLinksAll.forEach((link) => {
    const page = link.dataset.page || "";
    link.style.display = allowedStaffPages.has(page) ? "" : "none";
  });

  const desktopGeneral = document.getElementById("desktopNavGeneral");
  const desktopStaff = document.getElementById("desktopNavStaff");
  if (desktopGeneral) desktopGeneral.style.display = "none";
  if (desktopStaff) desktopStaff.style.display = "flex";

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
  const loginProfileCardEl = document.getElementById("loginProfileCard");
  const loginHelpApplyBtnEl = document.getElementById("loginHelpApplyBtn");
  const budgetRepresentativeApplyBtnEl = document.getElementById("budgetRepresentativeApplyBtn");
  const loginHeroEl = document.querySelector(".login-hero");
  const loginHeroContentEl = document.getElementById("loginHeroContent");

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
    if (loginHelpApplyBtnEl) {
      loginHelpApplyBtnEl.hidden = true;
    }
    if (budgetRepresentativeApplyBtnEl) {
      budgetRepresentativeApplyBtnEl.hidden = true;
    }
    if (loginProfileCardEl) {
      loginProfileCardEl.hidden = true;
    }
    if (loginHeroEl) {
      loginHeroEl.classList.remove("is-authenticated");
    }
    if (loginHeroContentEl) {
      loginHeroContentEl.hidden = false;
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
  const STAFF_PROFILE_COLLECTION = "staffProfiles";
  const remoteStaffProfileLoadingEmails = new Set();

  function canUseRemoteProfileStore() {
    return !!(
      profileStore.db &&
      profileStore.doc &&
      profileStore.getDoc &&
      profileStore.setDoc &&
      profileStore.serverTimestamp
    );
  }

  function canUseRemoteStaffProfileStore() {
    return !!(
      profileStore.db &&
      profileStore.doc &&
      profileStore.getDoc
    );
  }

  function watchStaffPositionAccessCatalog() {
    if (typeof unsubscribeStaffPositionAccess === "function") return;
    if (
      !profileStore.db ||
      !profileStore.collection ||
      !profileStore.onSnapshot
    ) return;

    unsubscribeStaffPositionAccess = profileStore.onSnapshot(
      profileStore.collection(profileStore.db, "staffPositionCatalog"),
      (snapshot) => {
        const nextByName = {};
        const nextByCode = {};
        (snapshot?.docs || []).forEach((docSnap) => {
          const data = docSnap.data() || {};
          const nameKey = (data.name || "").toString().trim().toLowerCase();
          const yy = normalizeDivisionCodeYY(data.divisionCodeYY || "");
          const zz = normalizeDivisionCodeYY(data.levelCodeZZ || "");
          const pages = normalizeAllowedStaffPages(data.allowedPages, yy);
          if (nameKey) nextByName[nameKey] = pages;
          if (yy && zz) nextByCode[`${yy}.${zz}`] = pages;
        });
        staffPositionAccessByName = nextByName;
        staffPositionAccessByCode = nextByCode;
        if (auth.currentUser) {
          refreshAuthDisplay(auth.currentUser);
        }
      },
      () => {
        staffPositionAccessByName = {};
        staffPositionAccessByCode = {};
      }
    );
  }

  function resetCurrentStaffApprovalWatcher() {
    if (typeof unsubscribeCurrentStaffApproval === "function") {
      try {
        unsubscribeCurrentStaffApproval();
      } catch (_) {
        // ignore unsubscribe errors
      }
    }
    unsubscribeCurrentStaffApproval = null;
    currentStaffApprovalState.email = "";
    currentStaffApprovalState.hasApproved = false;
    currentStaffApprovalState.approvedDivisionCodesYY = [];
  }

  function watchCurrentStaffApproval(firebaseUser) {
    const firestore = window.sgcuFirestore || {};
    const normalizedEmail = (firebaseUser?.email || "").toString().trim().toLowerCase();
    const normalizedUid = (firebaseUser?.uid || "").toString().trim();
    if (!normalizedEmail) {
      resetCurrentStaffApprovalWatcher();
      refreshAuthDisplay(firebaseUser || null);
      return;
    }
    if (
      !firestore.db ||
      !firestore.collection ||
      !firestore.query ||
      !firestore.where ||
      !firestore.onSnapshot
    ) {
      currentStaffApprovalState.email = normalizedEmail;
      currentStaffApprovalState.hasApproved = true;
      currentStaffApprovalState.approvedDivisionCodesYY = [];
      refreshAuthDisplay(firebaseUser);
      return;
    }
    if (currentStaffApprovalState.email === normalizedEmail && typeof unsubscribeCurrentStaffApproval === "function") {
      return;
    }

    resetCurrentStaffApprovalWatcher();
    currentStaffApprovalState.email = normalizedEmail;
    currentStaffApprovalState.hasApproved = false;
    currentStaffApprovalState.approvedDivisionCodesYY = [];
    const snapshotByKey = new Map();

    const applyMergedState = () => {
      const mergedDocs = Array.from(snapshotByKey.values()).flatMap((snap) => snap?.docs || []);
      const unique = new Map();
      mergedDocs.forEach((docSnap) => {
        const id = (docSnap?.id || "").toString();
        if (!id) return;
        if (!unique.has(id)) unique.set(id, docSnap);
      });
      const resolved = extractApprovedDivisionCodesFromDocs(Array.from(unique.values()));
      currentStaffApprovalState.email = normalizedEmail;
      currentStaffApprovalState.hasApproved = resolved.hasApproved;
      currentStaffApprovalState.approvedDivisionCodesYY = resolved.divisionCodesYY;
      refreshAuthDisplay(auth.currentUser || firebaseUser || null);
    };

    const listeners = [];
    const makeListener = (key, queryRef) => {
      const unsub = firestore.onSnapshot(
        queryRef,
        (snapshot) => {
          snapshotByKey.set(key, snapshot);
          applyMergedState();
        },
        () => {
          snapshotByKey.delete(key);
          applyMergedState();
        }
      );
      listeners.push(unsub);
    };

    const qByEmail = firestore.query(
      firestore.collection(firestore.db, "staffApplications"),
      firestore.where("applicantEmail", "==", normalizedEmail)
    );
    makeListener("email", qByEmail);

    if (normalizedUid) {
      const qByUid = firestore.query(
        firestore.collection(firestore.db, "staffApplications"),
        firestore.where("applicantUid", "==", normalizedUid)
      );
      makeListener("uid", qByUid);
    }

    unsubscribeCurrentStaffApproval = () => {
      listeners.forEach((fn) => {
        try { fn?.(); } catch (_) {}
      });
    };
  }

  async function hydrateStaffProfileFromRemote(email) {
    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    if (!normalizedEmail) return;
    if (remoteStaffProfileLoadingEmails.has(normalizedEmail)) return;
    if (!canUseRemoteStaffProfileStore()) return;
    remoteStaffProfileLoadingEmails.add(normalizedEmail);

    try {
      const ref = profileStore.doc(profileStore.db, STAFF_PROFILE_COLLECTION, normalizedEmail);
      const snap = await profileStore.getDoc(ref);
      if (snap?.exists()) {
        const data = snap.data() || {};
        const remotePositions = Array.isArray(data.positions) ? data.positions : [];
        const derivedRoleFromPositions = resolveStaffDivisionCodesYY({ positions: remotePositions }).includes("00") ? "0" : "";
        const remoteRole = normalizeStaffRoleCode(data.role || derivedRoleFromPositions || "");
        const remotePosition = (data.position || "").toString().trim();
        const remoteNick = (data.nick || "").toString().trim();
        const remotePositionCode = (data.positionCode || "").toString().trim();
        const remoteDivisionCodeYY = resolveStaffDivisionCodeYY({
          positions: remotePositions,
          divisionCodeYY: data.divisionCodeYY,
          positionCodeYY: data.positionCodeYY,
          positionCode: remotePositionCode
        });

        if (staffEmails instanceof Set) {
          staffEmails.add(normalizedEmail);
        }
        staffProfilesByEmail[normalizedEmail] = {
          ...(staffProfilesByEmail[normalizedEmail] || {}),
          position: remotePosition,
          nick: remoteNick,
          role: remoteRole,
          positionCode: remotePositionCode,
          divisionCodeYY: remoteDivisionCodeYY,
          positionCodeYY: remoteDivisionCodeYY,
          positions: remotePositions
        };

        if ((auth.currentUser?.email || "").toString().trim().toLowerCase() === normalizedEmail) {
          refreshAuthDisplay(auth.currentUser);
        }
      }
    } catch (_) {
      // ignore remote profile read failures
    } finally {
      remoteStaffProfileLoadingEmails.delete(normalizedEmail);
    }
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
      console.error("save user profile to firestore failed - app.sorting-auth.js:979", err);
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
    if (hasFirebase) {
      void hydrateStaffProfileFromRemote(firebaseUser.email);
    }
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
    if (loginHelpApplyBtnEl) {
      loginHelpApplyBtnEl.hidden = !isAuth;
    }
    if (budgetRepresentativeApplyBtnEl) {
      budgetRepresentativeApplyBtnEl.hidden = !isAuth;
    }
    if (loginProfileCardEl) {
      loginProfileCardEl.hidden = !isAuth;
    }
    if (loginHeroEl) {
      loginHeroEl.classList.toggle("is-authenticated", isAuth);
    }
    if (loginHeroContentEl) {
      loginHeroContentEl.hidden = isAuth;
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
    if (!isNavPageVisible(currentPage) && window.__sgcuStaffApplicationFlowActive !== true) {
      goToFirstVisibleNavPageWithPreference(preferredPage);
    }
  }

  onAuthStateChanged(auth, (user) => {
    watchCurrentStaffApproval(user || null);
    if (user) {
      const startedAt = resolveSessionStart(user);
      if (startedAt && Date.now() - startedAt >= sessionMaxAgeMs) {
        clearAuthSession();
        signOut(auth).catch((err) => {
          console.error("auto logout error (session expired) - app.sorting-auth.js:1417", err);
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
      resetCurrentStaffApprovalWatcher();
    }
    refreshAuthDisplay(user);
    window.dispatchEvent(
      new CustomEvent("sgcu:auth-state", {
        detail: { isAuthenticated: !!user, uid: (user?.uid || "").toString(), email: (user?.email || "").toString().trim().toLowerCase() }
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
      console.error("logout error  app.js:3632 - app.sorting-auth.js:1515", err);
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
  watchStaffPositionAccessCatalog();
  refreshAuthDisplayFn = refreshAuthDisplay;
}
