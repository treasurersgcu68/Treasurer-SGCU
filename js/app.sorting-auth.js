/* Sorting + auth gating for Project Status */
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
        if (v1 < v2) return direction === "asc" ? -1 : 1;
        if (v1 > v2) return direction === "asc" ? 1 : -1;
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
  const publicAllowed = new Set(["home", "project-status", "news", "financial-docs", "login"]);
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
}

function syncDesktopNavGroupVisibility() {
  const navGroups = Array.from(document.querySelectorAll(".desktop-nav .nav-group"));
  navGroups.forEach((group) => {
    const links = Array.from(group.querySelectorAll(".nav-group-menu a[data-page]"));
    const hasVisibleLink = links.some((link) => link.style.display !== "none");
    const toggle = group.querySelector(".nav-group-toggle");
    const menu = group.querySelector(".nav-group-menu");

    if (hasVisibleLink) {
      group.style.display = "";
      return;
    }

    group.style.display = "none";
    group.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (menu) {
      menu.classList.remove("show");
      menu.setAttribute("aria-hidden", "true");
    }
  });
}

function syncRoleNavContainers() {
  const isStaffMode = !!staffAuthUser && staffViewMode === "staff";
  const desktopGeneral = document.getElementById("desktopNavGeneral");
  const desktopStaff = document.getElementById("desktopNavStaff");

  if (desktopGeneral) desktopGeneral.style.display = isStaffMode ? "none" : "flex";
  if (desktopStaff) desktopStaff.style.display = isStaffMode ? "flex" : "none";
}

function getAllowedPagesForCurrentState() {
  const publicAllowed = new Set(["home", "project-status", "news", "financial-docs", "login"]);
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

  if (staffAuthUser && staffViewMode === "staff") {
    return getAllowedPagesForRoles(staffAuthUser.role);
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
    role: (profile.role || "").toString().trim() || "0"
  };
}

function normalizeRoleCode(value) {
  const raw = (value || "").toString().trim();
  if (!raw) return "0";
  if (/^\d+$/.test(raw)) return String(Number.parseInt(raw, 10));
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "0";
  return String(Number.parseInt(digits, 10));
}

function normalizeRoleCodes(value) {
  const parts = Array.isArray(value)
    ? value
    : (value || "").toString().split(",");
  const normalized = parts
    .map((item) => normalizeRoleCode(item))
    .filter(Boolean);
  return normalized.length ? Array.from(new Set(normalized)) : ["0"];
}

function getAllowedPagesForRoles(roleValue) {
  const roleAllowedMap = {
    "0": ["project-status-staff", "dashboard-staff", "borrow-assets-staff", "meeting-room-staff", "login"],
    "1": ["project-status-staff", "dashboard-staff", "login"],
    "4": ["borrow-assets-staff", "meeting-room-staff", "login"],
    "9": ["meeting-room-staff", "login"]
  };
  const allowed = new Set(["login"]);
  normalizeRoleCodes(roleValue).forEach((roleKey) => {
    const pages = roleAllowedMap[roleKey] || [];
    pages.forEach((page) => allowed.add(page));
  });
  return allowed;
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

  const allowedStaffPages = getAllowedPagesForRoles(staffUser.role);

  navLinksAll.forEach((link) => {
    const page = link.dataset.page || "";
    link.style.display = allowedStaffPages.has(page) ? "" : "none";
  });
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

function updateNavLabelsForStaff(isStaff) {
  // Kept for backward compatibility with older calls.
  // New nav structure uses dedicated role menus, so labels/pages are static.
}

function initAuthUI() {
  if (!window.sgcuAuth) {
    const panel = document.getElementById("authPanel");
    if (panel) {
      panel.style.display = "none";
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
      ? `สวัสดี ${firebaseUser.displayName || firebaseUser.email || ""}`
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
      resolveSessionStart(user);
    } else {
      clearAuthSession();
    }
    refreshAuthDisplay(user);
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
  function handleLogout() {
    staffAuthUser = null;
    staffViewMode = "normal";
    refreshAuthDisplay(auth.currentUser);
    clearAuthSession();
    signOut(auth).catch((err) => {
      console.error("logout error  app.js:3632 - app.sorting-auth.js:506", err);
    });

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
  refreshAuthDisplayFn = refreshAuthDisplay;
}
