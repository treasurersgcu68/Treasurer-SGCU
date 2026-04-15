/* App init + wiring (DOMContentLoaded) */
function runHeroSubtitleTyping() {
  const subtitle = document.querySelector(".home-hero-subtitle");
  if (!subtitle || subtitle.dataset.typingReady === "true") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const fullText = subtitle.textContent.replace(/\s+/g, " ").trim();
  if (!fullText) return;

  subtitle.dataset.typingReady = "true";
  subtitle.textContent = "";

  const cursor = document.createElement("span");
  cursor.className = "typing-cursor";
  cursor.setAttribute("aria-hidden", "true");
  subtitle.appendChild(cursor);

  let index = 0;
  const speedMs = 28;
  const typingTimer = window.setInterval(() => {
    subtitle.insertBefore(document.createTextNode(fullText[index]), cursor);
    index += 1;
    if (index >= fullText.length) {
      window.clearInterval(typingTimer);
      window.setTimeout(() => cursor.remove(), 600);
    }
  }, speedMs);
}

async function initDailyVisitorCounter() {
  const dashboardVisitorCountEl = document.getElementById("dashboardVisitorCount");
  const dashboardVisitorAllTimeCountEl = document.getElementById("dashboardVisitorAllTimeCount");
  if (!dashboardVisitorCountEl || !dashboardVisitorAllTimeCountEl) return;

  const setCounterText = (dailyValue, allTimeValue) => {
    dashboardVisitorCountEl.textContent = dailyValue;
    dashboardVisitorAllTimeCountEl.textContent = allTimeValue;
  };

  setCounterText("...", "...");
  try {
    const result = await window.sgcuVisitorCounter?.syncDailyVisitorCount?.();
    const numericDaily = Number(result?.dailyTotal);
    const numericAllTime = Number(result?.allTimeTotal);
    if (
      !Number.isFinite(numericDaily) || numericDaily < 0 ||
      !Number.isFinite(numericAllTime) || numericAllTime < 0
    ) {
      setCounterText("-", "-");
      return;
    }
    setCounterText(
      numericDaily.toLocaleString("th-TH"),
      numericAllTime.toLocaleString("th-TH")
    );
  } catch (err) {
    setCounterText("-", "-");
    console.warn("visitor counter error", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // ===== 1) เก็บ DOM element ที่ใช้ซ้ำ =====
  yearSelect = document.getElementById("yearSelect");
  orgTypeSelect = document.getElementById("orgTypeSelect");
  orgSelect = document.getElementById("orgSelect");
  projectSearchInput = document.getElementById("projectSearchInput");
  projectSearchClearBtn = document.getElementById("projectSearchClear");
  totalProjectsEl = document.getElementById("totalProjects");
  pendingProjectsEl = document.getElementById("pendingProjects");
  approvedProjectsEl = document.getElementById("approvedProjects");
  closedProjectsEl = document.getElementById("closedProjects");
  totalBudgetEl = document.getElementById("totalBudget");
  tableBodyEl = document.getElementById("projectTableBody");
  tableCaptionEl = document.getElementById("tableCaption");
  footerYearEl = document.getElementById("footerYear");

  projectModalEl = document.getElementById("projectModal");
  projectModalTitleEl = document.getElementById("projectModalTitle");
  projectModalTitleBadgeEl = document.getElementById("projectModalTitleBadge");
  projectModalHeaderRowEl = document.getElementById("projectModalHeaderRow");
  projectModalBodyEl = document.getElementById("projectModalBody");
  projectModalCloseEl = document.getElementById("projectModalClose");
  pdfRootEl = document.getElementById("pdfRoot");
  budgetChartSkeletonEl = document.getElementById("budgetChartSkeleton");
  statusPieSkeletonEl = document.getElementById("statusPieSkeleton");
  projectTableSkeletonEl = document.getElementById("projectTableSkeleton");
  calendarSkeletonEl = document.getElementById("calendarSkeleton");
  orgStructureSkeletonEl = document.getElementById("orgStructureSkeleton");
  loginBtnEl = document.getElementById("loginBtn");
  logoutBtnEl = document.getElementById("logoutBtn");
  mobileLogoutBtnEl = document.getElementById("mobileLogoutBtn");
  userInfoEl = document.getElementById("userInfo");
  loginPageGoogleBtnEl = document.getElementById("loginPageGoogleBtn");
  loginPageLogoutBtnEl = document.getElementById("loginPageLogoutBtn");
  loginPageStatusEl = document.getElementById("loginPageStatus");
  staffModeToggleEl = document.getElementById("staffModeToggle");
  staffModeBtns = Array.from(document.querySelectorAll("[data-staff-mode]"));
  navLinksAll = Array.from(document.querySelectorAll("header nav a[data-visible]"));
  viewToggleBtns = Array.from(document.querySelectorAll(".view-toggle-btn"));
  
  newsListEl        = document.getElementById("newsList");
  newsModalEl       = document.getElementById("newsModal");
  newsModalTitleEl  = document.getElementById("newsModalTitle");
  newsModalBodyEl   = document.getElementById("newsModalBody");
  newsModalCloseEl  = document.getElementById("newsModalClose");
  homeNewsSkeletonEl = document.getElementById("homeNewsSkeleton");
  newsListSkeletonEl = document.getElementById("newsListSkeleton");

  downloadSkeletonEl = document.getElementById("downloadSkeleton");
  kpiOnTimeEl = document.getElementById("kpiOnTime");
  kpiOnTimeCaptionEl = document.getElementById("kpiOnTimeCaption");
  kpiBudgetUsageEl = document.getElementById("kpiBudgetUsage");
  kpiBudgetUsageCaptionEl = document.getElementById("kpiBudgetUsageCaption");
  kpiClosedProjectsEl = document.getElementById("kpiClosedProjects");
  kpiClosedProjectsCaptionEl = document.getElementById("kpiClosedProjectsCaption");
  kpiMonthlyCaptionEl = document.getElementById("kpiMonthlyCaption");
  kpiOnTimeBarEl = document.getElementById("kpiOnTimeBar");
  kpiBudgetUsageBarEl = document.getElementById("kpiBudgetUsageBar");
  kpiClosedProjectsBarEl = document.getElementById("kpiClosedProjectsBar");
  kpiOnTimeStaffEl = document.getElementById("kpiOnTimeStaff");
  kpiOnTimeCaptionStaffEl = document.getElementById("kpiOnTimeCaptionStaff");
  kpiBudgetUsageStaffEl = document.getElementById("kpiBudgetUsageStaff");
  kpiBudgetUsageCaptionStaffEl = document.getElementById("kpiBudgetUsageCaptionStaff");
  kpiClosedProjectsStaffEl = document.getElementById("kpiClosedProjectsStaff");
  kpiClosedProjectsCaptionStaffEl = document.getElementById("kpiClosedProjectsCaptionStaff");
  homeHeatmapEl = document.getElementById("homeHeatmap");
  homeHeatmapMonthsEl = document.getElementById("homeHeatmapMonths");
  appAlertEl = document.getElementById("appAlert");
  appAlertTextEl = document.getElementById("appAlertText");
  appAlertRetryEl = document.getElementById("appAlertRetry");
  projectsLastUpdatedEl = document.getElementById("projectsLastUpdated");
  projectsLastUpdatedStaffEl = document.getElementById("projectsLastUpdatedStaff");
  const appLoaderEl = document.getElementById("appLoader");
  const appLoaderPercentEl = document.getElementById("appLoaderPercent");
  const appLoaderBarEl = document.getElementById("appLoaderBar");
  appLoaderErrorEl = document.getElementById("appLoaderError");
  appLoaderErrorTextEl = document.getElementById("appLoaderErrorText");
  appLoaderRetryEl = document.getElementById("appLoaderRetry");
  scheduleIdleTask(() => runBackgroundTask(initDailyVisitorCounter, "visitors"));
  let loaderPercent = 0;

  const setLoaderPercent = (value) => {
    const next = Math.max(loaderPercent, Math.min(100, Math.round(value)));
    loaderPercent = next;
    if (appLoaderPercentEl) {
      appLoaderPercentEl.textContent = next.toString();
    }
    if (appLoaderBarEl) {
      appLoaderBarEl.style.width = `${next}%`;
    }
  };

  const hasLoaderUi = Boolean(appLoaderPercentEl);
  const loaderStepKeys = new Set();
  if (hasLoaderUi) {
    loaderStepKeys.add("downloads");
    loaderStepKeys.add("news");
    loaderStepKeys.add("projects");
    loaderStepKeys.add("orgFilters");
    if (document.getElementById("scorePodium") && document.getElementById("scoreRunners")) {
      loaderStepKeys.add("scoreboard");
    }
    if (document.getElementById("org-structure-content")) {
      loaderStepKeys.add("orgStructure");
    }
  }
  const loaderStepTotal = Math.max(loaderStepKeys.size, 1);
  const loaderStepProgress = new Map();
  loaderStepKeys.forEach((key) => loaderStepProgress.set(key, 0));

  const updateLoaderTotal = () => {
    if (!hasLoaderUi) return;
    let sum = 0;
    loaderStepKeys.forEach((key) => {
      sum += loaderStepProgress.get(key) || 0;
    });
    const avg = sum / loaderStepTotal;
    setLoaderPercent(5 + avg * 95);
  };

  updateLoaderProgress = (key, value) => {
    if (!hasLoaderUi || !loaderStepKeys.has(key)) return;
    const current = loaderStepProgress.get(key) || 0;
    const next = Math.max(current, Math.min(1, value));
    loaderStepProgress.set(key, next);
    updateLoaderTotal();
  };

  markLoaderStep = (key) => {
    updateLoaderProgress(key, 1);
  };

  if (hasLoaderUi) {
    setLoaderPercent(5);
  }

  if (appAlertRetryEl) {
    appAlertRetryEl.addEventListener("click", () => window.location.reload());
  }
  if (appLoaderRetryEl) {
    appLoaderRetryEl.addEventListener("click", () => window.location.reload());
  }
  updateAppAlert();
  runHeroSubtitleTyping();

  projectStatusContexts = {
    public: buildProjectStatusContext("", "public"),
    staff: buildProjectStatusContext("Staff", "staff")
  };
  setActiveProjectStatusContext("public");

  initAuthUI();
  updateNavVisibility(false);
  toggleProjectStatusAccess(false, "public");
  toggleProjectStatusAccess(false, "staff");
  staffModeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      setStaffViewMode(btn.dataset.staffMode);
    });
  });
  if (staffModeToggleEl) {
    staffModeToggleEl.style.display = "none";
  }

  // ===== 2) โหลดดาวน์โหลดเอกสาร + ข่าว + คะแนนแบบ background =====
  scheduleIdleTask(() => runBackgroundTask(loadDownloadDocuments, "downloads"));
  scheduleIdleTask(() => runBackgroundTask(loadNewsFromSheet, "news"));
  scheduleIdleTask(() => runBackgroundTask(initScoreboard, "scoreboard"));

  
  // ===== 3) ตั้งปีใน footer =====
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }

  // ===== 4) ระบบสลับหน้าแบบ SPA =====
  const navLinks = document.querySelectorAll("header nav a[data-page]");
  const pageViews = document.querySelectorAll(".page-view");
  let currentPage = null;
  let pendingConsentPage = null;
  let consentAuthIdentity = { uid: "", email: "" };
  const globalConsentKeyPrefix = "globalServiceConsent-v2";
  const globalConsentPersistentKeyPrefix = "globalServiceConsent-persistent-v2";
  const consentRequiredPages = new Set(["borrow-assets", "meeting-room-booking"]);
  const globalConsentModal = document.getElementById("globalConsentModal");
  const globalConsentConfirm = document.getElementById("globalConsentConfirm");
  const globalConsentCancel = document.getElementById("globalConsentCancel");
  const globalConsentClose = document.getElementById("globalConsentClose");
  const globalConsentRules = document.getElementById("globalConsentRules");
  const globalConsentPdpa = document.getElementById("globalConsentPdpa");
  const loginViewConsentBtn = document.getElementById("loginViewConsentBtn");
  const featureLoaderConfig = window.sgcuFeatureLoaderConfig || {};
  const pageFeatureScriptMap = featureLoaderConfig.pageScripts || {};
  const idlePrefetchPages = Array.isArray(featureLoaderConfig.idlePrefetchPages)
    ? featureLoaderConfig.idlePrefetchPages
    : [];
  const loadedFeatureScripts = new Map();

  const loadFeatureScriptOnce = async (src) => {
    const scriptSrc = (src || "").toString().trim();
    if (!scriptSrc) return;
    if (loadedFeatureScripts.has(scriptSrc)) {
      await loadedFeatureScripts.get(scriptSrc);
      return;
    }
    const promise = new Promise((resolve, reject) => {
      const scriptEl = document.createElement("script");
      scriptEl.src = scriptSrc;
      scriptEl.defer = true;
      scriptEl.async = false;
      scriptEl.onload = () => resolve();
      scriptEl.onerror = () => reject(new Error(`failed to load ${scriptSrc}`));
      document.body.appendChild(scriptEl);
    }).catch((error) => {
      loadedFeatureScripts.delete(scriptSrc);
      throw error;
    });
    loadedFeatureScripts.set(scriptSrc, promise);
    await promise;
  };

  const ensurePageFeatureLoaded = async (page) => {
    const scriptSrc = pageFeatureScriptMap[page];
    if (!scriptSrc) return;
    await loadFeatureScriptOnce(scriptSrc);
  };

  const prefetchFeatureScriptsInIdle = () => {
    if (!idlePrefetchPages.length) return;
    scheduleIdleTask(() => {
      const pages = idlePrefetchPages.filter((page) => page && page !== currentPage);
      pages.forEach((page) => {
        const scriptSrc = pageFeatureScriptMap[page];
        if (!scriptSrc) return;
        void loadFeatureScriptOnce(scriptSrc).catch(() => {
          // ignore prefetch failures; normal navigation loader will retry and report
        });
      });
    }, 2500);
  };

  const getConsentSubjects = () => {
    const user = window.sgcuAuth?.auth?.currentUser || null;
    const uidFromEvent = (consentAuthIdentity?.uid || "").toString().trim();
    const emailFromEvent = (consentAuthIdentity?.email || "").toString().trim().toLowerCase();
    const uidFromAuth = (user?.uid || "").toString().trim();
    const emailFromAuth = (user?.email || "").toString().trim().toLowerCase();
    const subjects = [];
    if (uidFromEvent) subjects.push(`uid:${uidFromEvent}`);
    if (uidFromAuth && uidFromAuth !== uidFromEvent) subjects.push(`uid:${uidFromAuth}`);
    if (emailFromEvent) subjects.push(`email:${emailFromEvent}`);
    if (emailFromAuth && emailFromAuth !== emailFromEvent) subjects.push(`email:${emailFromAuth}`);
    if (!subjects.length) subjects.push("anonymous");
    return subjects;
  };

  const hasGlobalConsent = () => {
    const subjects = getConsentSubjects();
    const sessionKeys = subjects.map((subject) => `${globalConsentKeyPrefix}:${subject}`);
    const persistentKeys = subjects.map((subject) => `${globalConsentPersistentKeyPrefix}:${subject}`);
    const acceptedInSession =
      Boolean(window.sessionStorage) &&
      sessionKeys.some((key) => sessionStorage.getItem(key) === "accepted");
    const acceptedPersisted =
      Boolean(window.localStorage) &&
      persistentKeys.some((key) => localStorage.getItem(key) === "accepted");

    // If consent is already present in any key, sync it across current user keys.
    if (!acceptedInSession && acceptedPersisted && window.sessionStorage) {
      sessionKeys.forEach((key) => sessionStorage.setItem(key, "accepted"));
    }
    if (!acceptedPersisted && acceptedInSession && window.localStorage) {
      persistentKeys.forEach((key) => localStorage.setItem(key, "accepted"));
    }

    return Boolean(acceptedInSession || acceptedPersisted);
  };

  const isConsentCheckReady = () => {
    const user = window.sgcuAuth?.auth?.currentUser || null;
    const hasEventIdentity =
      Boolean((consentAuthIdentity?.uid || "").toString().trim()) ||
      Boolean((consentAuthIdentity?.email || "").toString().trim());
    return Boolean(user || hasEventIdentity);
  };

  const writeGlobalConsentAccepted = () => {
    const subjects = getConsentSubjects();
    const sessionKeys = subjects.map((subject) => `${globalConsentKeyPrefix}:${subject}`);
    const persistentKeys = subjects.map((subject) => `${globalConsentPersistentKeyPrefix}:${subject}`);
    if (window.sessionStorage) {
      sessionKeys.forEach((key) => sessionStorage.setItem(key, "accepted"));
    }
    if (window.localStorage) {
      persistentKeys.forEach((key) => localStorage.setItem(key, "accepted"));
    }
  };

  const updateGlobalConsentState = () => {
    if (!globalConsentConfirm || !globalConsentRules || !globalConsentPdpa) return;
    globalConsentConfirm.disabled = !(globalConsentRules.checked && globalConsentPdpa.checked);
  };

  const showGlobalConsentModal = () => {
    if (!globalConsentModal) return;
    if (globalConsentRules) globalConsentRules.checked = false;
    if (globalConsentPdpa) globalConsentPdpa.checked = false;
    updateGlobalConsentState();
    globalConsentModal.classList.add("show");
    globalConsentModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-modal");
  };

  const hideGlobalConsentModal = () => {
    if (!globalConsentModal) return;
    globalConsentModal.classList.remove("show");
    globalConsentModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-modal");
  };

  if (globalConsentRules) {
    globalConsentRules.addEventListener("change", updateGlobalConsentState);
  }
  if (globalConsentPdpa) {
    globalConsentPdpa.addEventListener("change", updateGlobalConsentState);
  }
  if (globalConsentConfirm) {
    globalConsentConfirm.addEventListener("click", () => {
      writeGlobalConsentAccepted();
      hideGlobalConsentModal();
      if (pendingConsentPage) {
        const target = pendingConsentPage;
        pendingConsentPage = null;
        void switchPage(target, { fromHash: true, bypassConsent: true });
      }
    });
  }
  if (globalConsentCancel) {
    globalConsentCancel.addEventListener("click", () => {
      hideGlobalConsentModal();
      pendingConsentPage = null;
      if (!currentPage) {
        void switchPage("home", { fromHash: true, bypassConsent: true });
      }
    });
  }
  if (globalConsentClose) {
    globalConsentClose.addEventListener("click", () => {
      hideGlobalConsentModal();
      pendingConsentPage = null;
      if (!currentPage) {
        void switchPage("home", { fromHash: true, bypassConsent: true });
      }
    });
  }
  if (loginViewConsentBtn) {
    loginViewConsentBtn.addEventListener("click", () => {
      pendingConsentPage = null;
      showGlobalConsentModal();
    });
  }

  window.addEventListener("sgcu:auth-state", (event) => {
    const isAuthenticated = Boolean(event?.detail?.isAuthenticated);
    const uid = (event?.detail?.uid || "").toString().trim();
    const email = (event?.detail?.email || "").toString().trim().toLowerCase();
    consentAuthIdentity = { uid, email };
    if (!isAuthenticated) {
      pendingConsentPage = null;
      hideGlobalConsentModal();
      return;
    }
    if (!hasGlobalConsent()) {
      showGlobalConsentModal();
      return;
    }
    hideGlobalConsentModal();
  });
  if (window.sgcuAuth?.auth?.currentUser && !hasGlobalConsent()) {
    showGlobalConsentModal();
  }

  async function switchPage(page, { fromHash = false, bypassConsent = false } = {}) {
    const previousPage = currentPage;
    const targetPage = page;
    const pageExists = Array.from(pageViews).some((section) => section.dataset.page === targetPage);
    if (!pageExists) {
      return;
    }

    // Route guard: กันการเข้าหน้า protected/staff ผ่าน hash โดยตรง
    if (!isNavPageVisible(targetPage)) {
      const preferredPage = getPreferredPageForState(isUserAuthenticated);
      const fallbackCandidates = isUserAuthenticated
        ? [
            currentPage,
            preferredPage,
            "home",
            "dashboard-staff",
            "project-status",
            "project-status-staff",
            "login"
          ]
        : ["home", "login"];
      const fallback =
        fallbackCandidates.find((candidate) => isNavPageVisible(candidate)) ||
        navLinksAll.find((link) => link.style.display !== "none")?.dataset.page;

      if (!fallback || fallback === targetPage) return;

      if (fromHash) {
        if (history.replaceState) {
          history.replaceState(null, "", `#${fallback}`);
        } else {
          window.location.hash = `#${fallback}`;
        }
      }
      await switchPage(fallback, { fromHash: true, bypassConsent: true });
      return;
    }

    if (
      !bypassConsent &&
      consentRequiredPages.has(targetPage) &&
      isConsentCheckReady() &&
      !hasGlobalConsent()
    ) {
      pendingConsentPage = targetPage;
      showGlobalConsentModal();
      if (currentPage) {
        if (fromHash) {
          if (history.replaceState) {
            history.replaceState(null, "", "#" + currentPage);
          } else {
            window.location.hash = "#" + currentPage;
          }
        }
        return;
      }
      await switchPage("home", { fromHash: true, bypassConsent: true });
      return;
    }
    if (targetPage === "dashboard-staff" && staffViewMode !== "staff") {
      await switchPage("project-status-staff", { fromHash });
      return;
    }

    try {
      await ensurePageFeatureLoaded(targetPage);
      clearLoadError("feature-loader");
    } catch (error) {
      console.error("page feature script failed to load - app.init.js:487", targetPage, error);
      recordLoadError("feature-loader", "ไม่สามารถโหลดฟีเจอร์ของหน้านี้ได้", { showRetry: true });
      return;
    }

    pageViews.forEach((section) => {
      const isTarget = section.dataset.page === targetPage;
      if (isTarget) {
        section.classList.add("active");
        // reset animation state ให้เล่นใหม่ทุกครั้ง
        section.classList.remove("section-visible");
        section.classList.add("section-appear");
        requestAnimationFrame(() => {
          section.classList.add("section-visible");
        });
      } else {
        section.classList.remove("active");
        section.classList.remove("section-visible");
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.page === page);
    });

    if (page === "project-status") {
      setActiveProjectStatusContext("public");
    } else if (page === "project-status-staff") {
      setActiveProjectStatusContext("staff");
    } else if (page === "dashboard-staff") {
      setActiveProjectStatusContext("staff");
    }

    refreshMotionForActivePage();

    if (shouldLoadProjectDataForPage(page)) {
      await ensureProjectDataLoaded();
      ensureProjectStatusInitialized(
        page === "project-status" ? "public" : "staff"
      );
      if (page === "project-status") {
        refreshProjectStatus("public");
      } else {
        refreshProjectStatus("staff");
      }
    }

    const filterBar = document.getElementById("filterBarStaff");
    if (filterBar) {
      const hostStatus = document.getElementById("filterBarHostStaff");
      const hostDashboard = document.getElementById("filterBarHostDashboardStaff");
      if (page === "dashboard-staff" && hostDashboard) {
        hostDashboard.appendChild(filterBar);
        filterBar.style.display = "grid";
      } else if (page === "project-status-staff" && hostStatus) {
        hostStatus.appendChild(filterBar);
      } else if (hostStatus) {
        hostStatus.appendChild(filterBar);
      }
    }

    // sync URL hash กับ page ปัจจุบัน (ไม่ทำตอนมาจาก hashchange)
    if (!fromHash) {
      if (history.replaceState) {
        history.replaceState(null, "", "#" + page);
      } else {
        window.location.hash = "#" + page;
      }
    }

    currentPage = page;
    if (window.localStorage) {
      localStorage.setItem("lastActivePage", page);
    }

    if (previousPage && previousPage !== page) {
      window.sgcuAnalytics?.trackPageView?.(page);
    }
  }

  // คลิกเมนูด้านบน
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (!page) return;
      void switchPage(page);
    });
  });

  // ตั้งค่าหน้าเริ่มจาก URL hash หรือจาก .page-view.active
  const initialHash = window.location.hash.replace("#", "");
  const defaultPage =
    document.querySelector(".page-view.active")?.dataset.page ||
    navLinks[0]?.dataset.page ||
    "home";

  const storedPage = window.localStorage
    ? localStorage.getItem("lastActivePage")
    : "";
  const isValidPage = (page) =>
    Array.from(pageViews).some((sec) => sec.dataset.page === page);

  const initialPage = isValidPage(initialHash)
    ? initialHash
    : isValidPage(storedPage)
      ? storedPage
      : defaultPage;

  await switchPage(initialPage, { fromHash: true });
  prefetchFeatureScriptsInIdle();

  // รองรับเปลี่ยน hash ด้วยตนเอง (#about, #status ฯลฯ)
  window.addEventListener("hashchange", () => {
    const hashPage = window.location.hash.replace("#", "");
    if (!hashPage) return;
    if (Array.from(pageViews).some((sec) => sec.dataset.page === hashPage)) {
      void switchPage(hashPage, { fromHash: true });
    }
  });

  // ===== 10) Hamburger + เมนูมือถือ =====
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuGroups = Array.from(document.querySelectorAll(".mobile-menu-group"));
  const navGroupToggles = Array.from(document.querySelectorAll(".nav-group-toggle"));
  const navGroupMenus = Array.from(document.querySelectorAll(".nav-group-menu"));

  const closeDesktopNavGroups = () => {
    navGroupToggles.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
      const host = btn.closest(".nav-group");
      if (host) host.classList.remove("is-open");
    });
    navGroupMenus.forEach((menu) => {
      menu.classList.remove("show");
      menu.setAttribute("aria-hidden", "true");
    });
  };

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");

    document.addEventListener("click", (e) => {
      if (!mobileMenu.classList.contains("show")) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (mobileMenu.contains(target) || hamburgerBtn.contains(target)) return;
      setMobileMenuState(mobileMenu, hamburgerBtn, false);
    });
  }
  if (mobileMenuGroups.length) {
    mobileMenuGroups.forEach((group) => {
      const summary = group.querySelector("summary");
      if (!summary) return;
      summary.addEventListener("click", () => {
        const willOpen = !group.hasAttribute("open");
        if (!willOpen) return;
        mobileMenuGroups.forEach((otherGroup) => {
          if (otherGroup !== group) otherGroup.removeAttribute("open");
        });
      });
    });
  }
  if (navGroupToggles.length) {
    closeDesktopNavGroups();

    navGroupToggles.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        const host = btn.closest(".nav-group");
        const menu = host?.querySelector(".nav-group-menu");
        if (!host || !menu) return;
        const isOpen = menu.classList.contains("show");
        closeDesktopNavGroups();
        if (!isOpen) {
          btn.setAttribute("aria-expanded", "true");
          host.classList.add("is-open");
          menu.classList.add("show");
          menu.setAttribute("aria-hidden", "false");
        }
      });
    });

    navGroupMenus.forEach((menu) => {
      menu.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof HTMLAnchorElement && target.dataset.page) {
          closeDesktopNavGroups();
        }
      });
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".nav-group")) return;
      closeDesktopNavGroups();
    });
  }


  // ปุ่มลัดที่หน้า Hero: มี data-goto-page (เช่น “ดูสถานะโครงการทั้งหมด”)
  document.querySelectorAll("[data-goto-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.gotoPage;
      if (!page) return;
      if (!isUserAuthenticated && !isNavPageVisible(page)) {
        void switchPage("login");
        return;
      }
      void switchPage(page);
    });
  });

  // ===== 5) Modal รายละเอียดโครงการ =====
  if (projectModalCloseEl) {
    projectModalCloseEl.addEventListener("click", closeProjectModal);
  }
  if (projectModalEl) {
    projectModalEl.addEventListener("click", (e) => {
      if (e.target === projectModalEl) {
        closeProjectModal();
      }
    });
  }

  // ===== X) Modal ข่าว/ประกาศ =====
  if (newsModalCloseEl) {
    newsModalCloseEl.addEventListener("click", closeNewsModal);
  }
  if (newsModalEl) {
    newsModalEl.addEventListener("click", (e) => {
      if (e.target === newsModalEl) {
        closeNewsModal();
      }
    });
  }

  // ปุ่ม Esc: ปิดโมดัลที่เปิดอยู่ หรือปิดเมนูมือถือ
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (activeModalEl) {
      closeDialog(activeModalEl);
      return;
    }
    const menuEl = document.getElementById("mobileMenu");
    const buttonEl = document.getElementById("hamburgerBtn");
    if (menuEl && buttonEl && menuEl.classList.contains("show")) {
      setMobileMenuState(menuEl, buttonEl, false);
    }
    closeDesktopNavGroups();
  });

  // ===== 6) Event เปลี่ยน filter ของ Project Status (public/staff) =====
  ["public", "staff"].forEach((key) => {
    const ctx = projectStatusContexts[key];
    if (!ctx) return;

    if (ctx.yearSelect) {
      ctx.yearSelect.addEventListener("change", () => {
        setActiveProjectStatusContext(key);
        refreshProjectStatus(key);
      });
    }
    if (ctx.orgTypeSelect) {
      ctx.orgTypeSelect.addEventListener("change", () => {
        setActiveProjectStatusContext(key);
        initOrgOptions();
        refreshProjectStatus(key);
      });
    }
    if (ctx.orgSelect) {
      ctx.orgSelect.addEventListener("change", () => {
        setActiveProjectStatusContext(key);
        refreshProjectStatus(key);
      });
    }
    if (ctx.projectSearchInput) {
      const debouncedSearch = debounce(() => {
        setActiveProjectStatusContext(key);
        refreshProjectStatus(key);
      }, 180);
      ctx.projectSearchInput.addEventListener("input", debouncedSearch);
    }
    if (ctx.projectSearchClearBtn && ctx.projectSearchInput) {
      ctx.projectSearchClearBtn.addEventListener("click", () => {
        setActiveProjectStatusContext(key);
        ctx.projectSearchInput.value = "";
        refreshProjectStatus(key);
        ctx.projectSearchInput.focus();
      });
    }
    if (ctx.longestOpenAssistantFilterEl) {
      ctx.longestOpenAssistantFilterEl.addEventListener("change", () => {
        setActiveProjectStatusContext(key);
        refreshProjectStatus(key);
      });
    }
    if (ctx.longestOpenStatusFilterEl) {
      ctx.longestOpenStatusFilterEl.addEventListener("change", () => {
        setActiveProjectStatusContext(key);
        refreshProjectStatus(key);
      });
    }
  });

  // ===== 7) โหลดโครงสร้างองค์กร (Home section) แบบ background =====
  scheduleIdleTask(() => runBackgroundTask(loadOrgStructure, "orgStructure"));

  // ===== 8) Sorting ตารางโครงการ (public/staff) =====
  ["public", "staff"].forEach((key) => {
    const ctx = projectStatusContexts[key];
    if (!ctx || !ctx.tableBodyEl) return;

    const ths = ctx.tableBodyEl.closest("table")?.querySelectorAll("th.sortable") || [];
    ths.forEach((th) => {
      th.addEventListener("click", () => {
        const sortKey = th.dataset.sort;
        setActiveProjectStatusContext(key);
        if (currentSort.key === sortKey) {
          currentSort.direction =
            currentSort.direction === "asc" ? "desc" : "asc";
        } else {
          currentSort.key = sortKey;
          currentSort.direction = "asc";
        }

        ths.forEach((x) => x.classList.remove("sort-asc", "sort-desc"));
        th.classList.add(
          currentSort.direction === "asc" ? "sort-asc" : "sort-desc"
        );

        refreshProjectStatus(key);
      });
    });
  });

  // ===== 9) Toggle ระหว่าง Status / Calendar (public + staff) =====
  ["public", "staff"].forEach((key) => {
    const ctx = projectStatusContexts[key];
    if (!ctx || !ctx.viewToggleBtns || !ctx.statusViewEl || !ctx.calendarViewEl) return;

    ctx.viewToggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!isUserAuthenticated && key === "staff") return;
        setActiveProjectStatusContext(key);
        const target = btn.dataset.view; // 'status' หรือ 'calendar' หรือ '-staff'

        ctx.viewToggleBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const isCalendar = target.includes("calendar");
        const isDashboard = target.includes("dashboard");
        if (ctx.statusViewEl) {
          ctx.statusViewEl.style.display = isCalendar || isDashboard ? "none" : "block";
        }
        if (ctx.calendarViewEl) {
          ctx.calendarViewEl.style.display = isCalendar ? "block" : "none";
        }
        if (ctx.dashboardViewEl) {
          ctx.dashboardViewEl.style.display = isDashboard ? "block" : "none";
        }
        if (ctx.filterBarEl) {
          ctx.filterBarEl.style.display = isCalendar ? "none" : "grid";
        }
        if (isCalendar) {
          generateCalendar();
        }
      });
    });
  });


  // ===== 10) Tabs Borrow & Return Assets =====
  const assetTabBtns = document.querySelectorAll(".tab-btn[data-assets-tab]");
  const assetsOverview = document.getElementById("assetsOverview");
  const assetsList = document.getElementById("assetsList");

  if (assetTabBtns.length && assetsOverview && assetsList) {
    assetTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.assetsTab; // 'overview' | 'list'
        assetTabBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        if (target === "overview") {
          assetsOverview.style.display = "block";
          assetsList.style.display = "none";
          assetsOverview.classList.add("section-visible");
          assetsList.classList.remove("section-visible");
        } else {
          assetsOverview.style.display = "none";
          assetsList.style.display = "block";
          assetsList.classList.add("section-visible");
          assetsOverview.classList.remove("section-visible");
        }
      });
    });
  }

  // ===== 10.5) Borrow form: derive faculty from student ID =====
  const borrowStudentId = document.getElementById("borrowStudentId");
  const borrowStudentIdWarning = document.getElementById("borrowStudentIdWarning");
  const borrowFaculty = document.getElementById("borrowFaculty");
  const borrowFacultyWarning = document.getElementById("borrowFacultyWarning");
  const borrowYear = document.getElementById("borrowYear");
  const borrowYearWarning = document.getElementById("borrowYearWarning");
  if (borrowStudentId && borrowFaculty && borrowYear) {
    const facultyMap = {
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
      "40": "สำนักทรัพยากรทางการเกษตร",
      "56": "สถาบันนวัตกรรมบูรณาการฯ"
    };

    const updateBorrowFaculty = () => {
      const rawValue = borrowStudentId.value;
      const digits = rawValue.replace(/\D/g, "");
      const hasNonDigits = rawValue.trim() !== "" && digits.length !== rawValue.replace(/\s/g, "").length;
      if (borrowStudentIdWarning) {
        if (hasNonDigits) {
          borrowStudentIdWarning.textContent = "กรุณากรอกตัวเลขเท่านั้น";
          borrowStudentIdWarning.hidden = false;
        } else {
          borrowStudentIdWarning.hidden = true;
        }
      }
      if (digits.length < 10) {
        borrowFaculty.value = "";
        borrowFaculty.dataset.facultyCode = "";
        if (borrowFacultyWarning) {
          borrowFacultyWarning.hidden = true;
        }
        borrowYear.value = "";
        borrowYear.dataset.yearLevel = "";
        if (borrowYearWarning) {
          borrowYearWarning.hidden = true;
        }
        return;
      }
      const code = digits.slice(-2);
      const label = facultyMap[code];
      borrowFaculty.value = label ? label : "";
      borrowFaculty.dataset.facultyCode = label ? code : "";
      if (borrowFacultyWarning) {
        borrowFacultyWarning.hidden = !!label;
      }

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
      borrowYear.value = isValidYearLevel ? String(yearLevel) : "";
      borrowYear.dataset.yearLevel = isValidYearLevel ? String(yearLevel) : "";
      if (borrowYearWarning) {
        borrowYearWarning.hidden = isValidYearLevel;
      }
    };

    borrowStudentId.addEventListener("input", updateBorrowFaculty);
    borrowStudentId.addEventListener("blur", updateBorrowFaculty);
    updateBorrowFaculty();
  }

  // === Scope pills: คลิกแล้ว highlight การ์ดทีมที่เกี่ยวข้อง ===
  const scopePills = document.querySelectorAll(".scope-pill[data-scope-target]");
  const scopeCards = document.querySelectorAll(".scope-team-card[data-scope]");

  const syncScopeCards = (target) => {
    scopePills.forEach((pill) => {
      const isActive = pill.dataset.scopeTarget === target;
      pill.classList.toggle("scope-pill-active", isActive);
      pill.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    scopeCards.forEach((card) => {
      const isActive = card.dataset.scope === target;
      if (isActive) {
        card.classList.remove("scope-team-exit");
        card.classList.add("scope-team-active");
        card.hidden = false;
      } else if (!card.hidden) {
        card.classList.remove("scope-team-active");
        card.classList.add("scope-team-exit");
        window.setTimeout(() => {
          card.hidden = true;
          card.classList.remove("scope-team-exit");
        }, 200);
      }
    });
  };

  const initialScope =
    document.querySelector(".scope-pill-active")?.dataset.scopeTarget
    || scopePills[0]?.dataset.scopeTarget;

  if (initialScope) {
    syncScopeCards(initialScope);
  }

  scopePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const target = pill.dataset.scopeTarget;
      if (!target) {
        return;
      }

      syncScopeCards(target);

      // เลื่อนสายตาไปหา card ที่ถูกเลือก (เฉพาะบนจอเล็กจะช่วยให้เห็นชัด)
      const activeCard = document.querySelector(
        `.scope-team-card[data-scope="${target}"]`
      );
      if (activeCard && window.innerWidth < 900) {
        const rect = activeCard.getBoundingClientRect();
        const headerEl = document.querySelector(".site-header");
        const headerOffset = headerEl ? headerEl.getBoundingClientRect().height + 12 : 0;
        const viewTop = headerOffset;
        const viewBottom = window.innerHeight - 12;
        const isAbove = rect.top < viewTop;
        const isBelow = rect.bottom > viewBottom;

        if (isAbove || isBelow) {
          const targetY = window.scrollY + rect.top - headerOffset;
          window.scrollTo({ top: targetY, behavior: "smooth" });
        }
      }
    });
  });

  // เรียก motion ครั้งแรกสำหรับหน้าเริ่มต้น
  refreshMotionForActivePage();

  if (appLoaderEl) {
    requestAnimationFrame(() => {
      setLoaderPercent(100);
      appLoaderEl.classList.add("is-hidden");
      appLoaderEl.setAttribute("aria-busy", "false");
      markLoaderStep = null;
      updateLoaderProgress = null;
    });
  }
});
