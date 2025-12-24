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
  const publicAllowed = new Set(["home", "project-status", "financial-docs", "login"]);
  navLinksAll.forEach((link) => {
    const mode = link.dataset.visible || "public";
    const page = link.dataset.page || "";
    if (page === "dashboard-staff" && staffViewMode !== "staff") {
      link.style.display = "none";
      return;
    }
    if (!isAuthenticated && !publicAllowed.has(page)) {
      link.style.display = "none";
      return;
    }

    if (mode === "protected") {
      link.style.display = isAuthenticated ? "" : "none";
    } else if (mode === "public-only") {
      link.style.display = isAuthenticated ? "none" : "";
    } else {
      link.style.display = "";
    }
  });
}

function getStaffProfileByEmail(email) {
  const normalized = (email || "").toString().trim().toLowerCase();
  if (!normalized || !staffEmails.has(normalized)) return null;
  const profile = staffProfilesByEmail[normalized] || {};
  return {
    email: normalized,
    position: profile.position || "",
    nick: profile.nick || "",
    role: profile.role || "00"
  };
}

function isCurrentNavVisible() {
  if (!navLinksAll.length) return true;
  const currentPage = (window.location.hash || "#home").replace("#", "");
  const currentLink = navLinksAll.find((link) => link.dataset.page === currentPage);
  return currentLink ? currentLink.style.display !== "none" : true;
}

function getCurrentPageFromHash() {
  return (window.location.hash || "#home").replace("#", "");
}

function isNavPageVisible(page) {
  if (!navLinksAll.length) return false;
  const link = navLinksAll.find((navLink) => navLink.dataset.page === page);
  return link ? link.style.display !== "none" : false;
}

function getModeMappedPage(currentPage, mode) {
  const toStaff = {
    "project-status": "project-status-staff",
    "borrow-assets": "borrow-assets-staff"
  };
  const toNormal = {
    "project-status-staff": "project-status",
    "borrow-assets-staff": "borrow-assets"
  };
  const map = mode === "staff" ? toStaff : toNormal;
  return map[currentPage] || "";
}

function applyStaffViewMode() {
  const staffMode = !!staffAuthUser && staffViewMode === "staff";
  updateNavLabelsForStaff(staffMode);
  updateNavVisibility(isUserAuthenticated);
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
    "00": new Set(["project-status-staff", "dashboard-staff", "borrow-assets-staff", "login"]),
    "01": new Set(["project-status-staff", "dashboard-staff", "login"]),
    "04": new Set(["borrow-assets-staff", "login"])
  };

  const allowedStaffPages = roleAllowedMap[staffUser.role || ""] ||
    new Set(["project-status-staff", "dashboard-staff", "borrow-assets-staff", "login"]);

  navLinksAll.forEach((link) => {
    const page = link.dataset.page || "";
    link.style.display = allowedStaffPages.has(page) ? "" : "none";
  });
}

function getPreferredPageForState(isAuth) {
  if (isAuth) {
    return "login";
  }
  return "home";
}

function goToFirstVisibleNavPageWithPreference(preferredPage) {
  if (!navLinksAll.length) return;

  function isVisible(link) {
    return link && link.style.display !== "none";
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
  const labelMap = {
    "project-status": {
      default: "Project Status",
      staff: "Project Status for Staff",
      staffPage: "project-status-staff"
    },
    "borrow-assets": {
      default: "Borrow & Return Assets",
      staff: "Borrow & Return Assets For Staff",
      staffPage: "borrow-assets-staff"
    }
  };

  Object.entries(labelMap).forEach(([page, labels]) => {
    const targetPage = isStaff ? labels.staffPage : page;
    const targetLabel = isStaff ? labels.staff : labels.default;
    document
      .querySelectorAll(`a[data-page="${page}"], a[data-page="${labels.staffPage}"]`)
      .forEach((el) => {
        el.textContent = targetLabel;
        el.dataset.page = targetPage;
      });
  });
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

    // เปลี่ยนหน้าไปยังเมนูแรกตามสถานะปัจจุบัน (login/logout)
    const preferredPage = getPreferredPageForState(isAuth, hasStaff ? staffAuthUser : null);
    goToFirstVisibleNavPageWithPreference(preferredPage);
  }

  onAuthStateChanged(auth, (user) => {
    refreshAuthDisplay(user);
  });

  function handleGoogleLogin() {
    signInWithPopup(auth, new GoogleAuthProvider()).catch((err) => {
      alert(`ล็อกอินไม่สำเร็จ: ${err.message || err}`);
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
    signOut(auth).catch((err) => {
      console.error("logout error  app.js:3632 - app.sorting-auth.js:325", err);
    });

    const hamburger = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const hamburgerToggle = hamburger
      ? hamburger.querySelector("input[type='checkbox']")
      : null;
    if (hamburger && mobileMenu && hamburgerToggle) {
      hamburgerToggle.checked = false;
      mobileMenu.classList.remove("show");
      hamburger.setAttribute("aria-expanded", "false");
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
