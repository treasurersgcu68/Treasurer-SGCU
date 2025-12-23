/* App init + wiring (DOMContentLoaded) */
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
  const appLoaderEl = document.getElementById("appLoader");
  const appLoaderPercentEl = document.getElementById("appLoaderPercent");
  const appLoaderBarEl = document.getElementById("appLoaderBar");
  appLoaderErrorEl = document.getElementById("appLoaderError");
  appLoaderErrorTextEl = document.getElementById("appLoaderErrorText");
  appLoaderRetryEl = document.getElementById("appLoaderRetry");
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
  async function switchPage(page, { fromHash = false } = {}) {
    const targetPage = page;
    if (targetPage === "dashboard-staff" && staffViewMode !== "staff") {
      await switchPage("project-status-staff", { fromHash });
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

  const initialPage = Array.from(pageViews).some(
    (sec) => sec.dataset.page === initialHash
  )
    ? initialHash
    : defaultPage;

  await switchPage(initialPage, { fromHash: true });

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
  const hamburgerToggle = hamburgerBtn
    ? hamburgerBtn.querySelector("input[type='checkbox']")
    : null;
  const mobileNavLinks = mobileMenu
    ? mobileMenu.querySelectorAll("a[data-page]")
    : [];

  if (hamburgerBtn && mobileMenu && hamburgerToggle) {
    hamburgerBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");

    const syncMobileMenu = (isExpanded) => {
      setMobileMenuState(mobileMenu, hamburgerBtn, isExpanded);
    };

    // เปิด/ปิดกล่องเมนู
    hamburgerToggle.addEventListener("change", () => {
      syncMobileMenu(hamburgerToggle.checked);
    });

    hamburgerBtn.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      hamburgerToggle.checked = !hamburgerToggle.checked;
      syncMobileMenu(hamburgerToggle.checked);
    });

    // เวลาเลือกเมนูจากกล่อง ให้สลับหน้า + ปิดกล่อง
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (!page) return;
        void switchPage(page);
        hamburgerToggle.checked = false;
        syncMobileMenu(false);
      });
    });
  }


  // ปุ่มลัดที่หน้า Hero: มี data-goto-page (เช่น “ดูสถานะโครงการทั้งหมด”)
  document.querySelectorAll("[data-goto-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.gotoPage;
      if (!page) return;
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
    const toggleEl = buttonEl ? buttonEl.querySelector("input[type='checkbox']") : null;
    if (menuEl && buttonEl && toggleEl && menuEl.classList.contains("show")) {
      toggleEl.checked = false;
      setMobileMenuState(menuEl, buttonEl, false);
    }
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
        } else {
          assetsOverview.style.display = "none";
          assetsList.style.display = "block";
        }
      });
    });
  }

  // === Scope pills: คลิกแล้ว highlight การ์ดทีมที่เกี่ยวข้อง ===
  const scopePills = document.querySelectorAll(".scope-pill[data-scope-target]");
  const scopeCards = document.querySelectorAll(".scope-team-card[data-scope]");

  scopePills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const target = pill.dataset.scopeTarget;

      // toggle active pill
      scopePills.forEach((p) => p.classList.remove("scope-pill-active"));
      pill.classList.add("scope-pill-active");

      // toggle highlight card
      scopeCards.forEach((card) => {
        card.classList.toggle(
          "scope-team-active",
          card.dataset.scope === target
        );
      });

      // เลื่อนสายตาไปหา card ที่ถูกเลือก (เฉพาะบนจอเล็กจะช่วยให้เห็นชัด)
      const activeCard = document.querySelector(
        `.scope-team-card[data-scope="${target}"]`
      );
      if (activeCard && window.innerWidth < 900) {
        activeCard.scrollIntoView({ behavior: "smooth", block: "start" });
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
