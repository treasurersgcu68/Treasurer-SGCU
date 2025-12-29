/* Core config + shared globals (used across modules) */

/* Config: sheet endpoints */
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfcEartu_DeoGQXOJ7_rYPGizNtDhYJEaXivywadNZibj1rch9WKC1GF1yNbZ3zRgQ4Efjj8jrTOrf/pub?output=csv";

const ORG_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ84XOAc7rrKIloXHL5o_0ekzKdi4cQlPMUCGRPb6equG5WAguoaR2fa5ip3j7cT9noG5u9Ozv-VDot/pub?output=csv";

const DOWNLOAD_SHEET =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTburYaUshqF-DOvbwOEinWik0KXNwqqJLfO6frlxUn1iEsLu5RzkNoum4KgnWeSwBdo4--B1eScRD5/pub?output=csv";

const SCORE_SHEET =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_oiV1Ntv0x8UuRBKyvl9tTaUxrKkvImEmyFUU4oPp0pSKnLHOjJIz574Te4l25Y2IKFbLMaFlp3UW/pub?gid=676554954&single=true&output=csv";

const NEWS_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLaBypwNGVEZHCjCxQDSLn8s7tTx1EKAIKuYjL7oIx7_fmssMnAcq9hpLyC4N5TvwIhrzwtZxxCAe0/pub?output=csv"; 

const ORG_FILTER_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3mW8GVPRgbiURGAx59WyB3TZT5GbKoXJxHxmgpU2LRd_jgow9JBwXVjtjJRvfIgYYL5MKLLuZEddd/pub?output=csv";

const DEFAULT_BASE_GROUPS = [
  "ชมรมฝ่ายศิลปะและวัฒนธรรม",
  "ชมรมฝ่ายวิชาการ",
  "ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์",
  "ชมรมฝ่ายกีฬา",
  "องค์การบริหารสโมสรนิสิต",
  "สภานิสิต",
  "องค์การบริหารสโมสรนิสิต, สภานิสิต"
];

// Cache
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 นาที
const CACHE_KEYS = {
  PROJECTS: "sgcu_cache_projects",
  NEWS: "sgcu_cache_news",
  DOWNLOADS: "sgcu_cache_downloads",
  ORG_FILTERS: "sgcu_cache_org_filters",
  SCOREBOARD: "sgcu_cache_scoreboard"
};

/* Globals: shared state */
let projects = [];
let newsItems = [];

let yearSelect;
let orgTypeSelect;
let orgSelect;
let totalProjectsEl;
let pendingProjectsEl;
let approvedProjectsEl;
let closedProjectsEl;
let totalBudgetEl;
let filterBarEl;
let closureRateEl;
let closureRateCaptionEl;
let closureRateBarEl;
let approvalRateEl;
let approvalRateCaptionEl;
let approvalRateBarEl;
let closureRateDonutCanvas;
let approvalRateDonutCanvas;
let kpiOnTimeDonutCanvas;
let kpiBudgetUsageDonutCanvas;
let avgBudgetEl;
let avgBudgetCaptionEl;
let activeOrgCountEl;
let activeOrgCaptionEl;
let topOrgNameEl;
let topOrgBudgetEl;
let recentProjectsListEl;
let longestOpenListEl;
let longestOpenTableCaptionEl;
let longestOpenTableBodyEl;
let tableBodyEl;
let tableCaptionEl;
let lastTableProjects = [];
let footerYearEl;
let projectSearchInput;
let projectSearchClearBtn;
let budgetByMonthChart;
let statusPieChart;
let trendLineChart;
let closureRateDonutChart;
let approvalRateDonutChart;
let kpiOnTimeDonutChart;
let kpiBudgetUsageDonutChart;
let projectModalEl;
let budgetChartSkeletonEl;
let statusPieSkeletonEl;
let projectTableSkeletonEl;
let orgStructureSkeletonEl;
let projectModalTitleEl;
let projectModalTitleBadgeEl;
let projectModalHeaderRowEl;
let projectModalBodyEl;
let projectModalCloseEl;
let pdfRootEl;
let currentSort = { key: null, direction: "asc" };
let projectStatusContexts = {};
let activeProjectStatusContext = "public";
let assistantContactsByName = {};
let newsListEl;
let newsModalEl;
let newsModalTitleEl;
let newsModalBodyEl;
let newsModalCloseEl;
let homeNewsSkeletonEl;
let newsListSkeletonEl;
let downloadSkeletonEl;
let calendarSkeletonEl;
let orgFilters = [];
let staffAuthUser = null;
let staffEmails = new Set();
let staffProfilesByEmail = {};
let staffViewMode = "normal";
let refreshAuthDisplayFn = null;
let loginBtnEl;
let logoutBtnEl;
let mobileLogoutBtnEl;
let userInfoEl;
let loginPageGoogleBtnEl;
let loginPageLogoutBtnEl;
let loginPageStatusEl;
let staffModeToggleEl;
let staffModeBtns = [];
let kpiOnTimeEl;
let kpiOnTimeCaptionEl;
let kpiBudgetUsageEl;
let kpiBudgetUsageCaptionEl;
let kpiClosedProjectsEl;
let kpiClosedProjectsCaptionEl;
let kpiMonthlyCaptionEl;
let kpiOnTimeBarEl;
let kpiBudgetUsageBarEl;
let kpiClosedProjectsBarEl;
let kpiOnTimeStaffEl;
let kpiOnTimeCaptionStaffEl;
let kpiBudgetUsageStaffEl;
let kpiBudgetUsageCaptionStaffEl;
let kpiClosedProjectsStaffEl;
let kpiClosedProjectsCaptionStaffEl;
let homeKpiChart = null;
let homeHeatmapEl;
let homeHeatmapMonthsEl;
let navLinksAll = [];
let statusViewEl;
let calendarViewEl;
let dashboardViewEl;
let projectTableAreaEl;
let projectTableLockEl;
let viewToggleBtns = [];
let calendarYearSelectEl;
let calendarOrgSelectEl;
let calendarStatusSelectEl;
let calendarPanelTitleEl;
let calendarContainerEl;
let prevMonthBtnEl;
let nextMonthBtnEl;
let isUserAuthenticated = false;
let markLoaderStep = null;
let updateLoaderProgress = null;
let projectsLoadPromise = null;
let projectsLoaded = false;
let appAlertEl;
let appAlertTextEl;
let appAlertRetryEl;
let appLoaderErrorEl;
let appLoaderErrorTextEl;
let appLoaderRetryEl;
let projectsLastUpdatedEl;
let projectsLastUpdatedStaffEl;

// Motion globals
let sectionObserver = null;
let hasInitCountup = false;

// Accessibility helpers (focus trap + dialog state)
const focusTrapHandlers = new Map();
let activeModalEl = null;
let lastModalFocusedEl = null;
let lastMenuFocusedEl = null;

const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), input:not([disabled]):not([type='hidden']), " +
  "select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute("disabled")
  );
}

function enableFocusTrap(container) {
  if (!container || focusTrapHandlers.has(container)) return;
  const handler = (e) => {
    if (e.key !== "Tab") return;
    const focusables = getFocusableElements(container);
    if (!focusables.length) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const isShift = e.shiftKey;
    if (isShift && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!isShift && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };
  container.addEventListener("keydown", handler);
  focusTrapHandlers.set(container, handler);
}

function disableFocusTrap(container) {
  const handler = focusTrapHandlers.get(container);
  if (!handler) return;
  container.removeEventListener("keydown", handler);
  focusTrapHandlers.delete(container);
}

function openDialog(modalEl, options = {}) {
  if (!modalEl) return;
  lastModalFocusedEl = document.activeElement;
  modalEl.classList.add("show");
  modalEl.setAttribute("aria-hidden", "false");
  if (!modalEl.hasAttribute("tabindex")) modalEl.setAttribute("tabindex", "-1");
  document.body.classList.add("has-modal");
  activeModalEl = modalEl;

  enableFocusTrap(modalEl);

  const target = options.focusSelector
    ? modalEl.querySelector(options.focusSelector)
    : null;
  const fallback = getFocusableElements(modalEl)[0];
  const focusTarget = target || fallback || modalEl;
  if (focusTarget && typeof focusTarget.focus === "function") {
    focusTarget.focus({ preventScroll: true });
  }
}

function closeDialog(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove("show");
  modalEl.setAttribute("aria-hidden", "true");
  disableFocusTrap(modalEl);
  if (activeModalEl === modalEl) activeModalEl = null;
  document.body.classList.remove("has-modal");
  if (lastModalFocusedEl && typeof lastModalFocusedEl.focus === "function") {
    lastModalFocusedEl.focus({ preventScroll: true });
  }
}

function setMobileMenuState(menuEl, buttonEl, isExpanded) {
  if (!menuEl || !buttonEl) return;
  menuEl.classList.toggle("show", isExpanded);
  menuEl.setAttribute("aria-hidden", isExpanded ? "false" : "true");
  buttonEl.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  if (!menuEl.hasAttribute("tabindex")) menuEl.setAttribute("tabindex", "-1");

  if (isExpanded) {
    lastMenuFocusedEl = document.activeElement;
    enableFocusTrap(menuEl);
    const focusable = getFocusableElements(menuEl);
    if (focusable[0]) {
      focusable[0].focus({ preventScroll: true });
    } else {
      menuEl.focus({ preventScroll: true });
    }
  } else {
    disableFocusTrap(menuEl);
    if (lastMenuFocusedEl && typeof lastMenuFocusedEl.focus === "function") {
      lastMenuFocusedEl.focus({ preventScroll: true });
    }
  }
}

/* 3) Plugin: Center Text in Doughnut */
const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart, args, options) {
    const datasetMeta = chart.getDatasetMeta(0);
    if (!datasetMeta || !datasetMeta.data || datasetMeta.data.length === 0) return;

    const active = chart._active || [];
    if (active.length > 0) return;

    const { ctx } = chart;
    const centerX = datasetMeta.data[0].x;
    const centerY = datasetMeta.data[0].y;

    const text = options.text || "";
    const subText = options.subText || "";
    if (!text) return;

    ctx.save();
    ctx.fillStyle = options.color || "#111827";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const fontFamily = options.fontFamily || "Kanit";
    const mainSize = options.fontSize || 20;
    const subSize = options.subFontSize || 11;

    if (subText) {
      ctx.font = `${mainSize}px ${fontFamily}`;
      ctx.fillText(text, centerX, centerY - 6);

      ctx.font = `${subSize}px ${fontFamily}`;
      ctx.fillText(subText, centerX, centerY + mainSize * 0.4);
    } else {
      ctx.font = `${mainSize}px ${fontFamily}`;
      ctx.fillText(text, centerX, centerY);
    }

    ctx.restore();
  }
};

Chart.register(centerTextPlugin);

// ===== Helpers: Project Status contexts (public / staff) =====
function buildProjectStatusContext(suffix = "", key = "public") {
  const get = (idBase) => document.getElementById(idBase + suffix);
  const sectionPage = key === "staff" ? "project-status-staff" : "project-status";
  const sectionEl = document.querySelector(`section[data-page="${sectionPage}"]`);

  return {
    key,
    suffix,
    yearSelect: get("yearSelect"),
    orgTypeSelect: get("orgTypeSelect"),
    orgSelect: get("orgSelect"),
    projectSearchInput: get("projectSearchInput"),
    projectSearchClearBtn: get("projectSearchClear"),
    filterBarEl: get("filterBar"),
    totalProjectsEl: get("totalProjects"),
    pendingProjectsEl: get("pendingProjects"),
    approvedProjectsEl: get("approvedProjects"),
    closedProjectsEl: get("closedProjects"),
    totalBudgetEl: get("totalBudget"),
    closureRateEl: get("closureRate"),
    closureRateCaptionEl: get("closureRateCaption"),
    closureRateBarEl: get("closureRateBar"),
    closureRateDonutCanvas: get("closureRateDonut"),
    approvalRateEl: get("approvalRate"),
    approvalRateCaptionEl: get("approvalRateCaption"),
    approvalRateBarEl: get("approvalRateBar"),
    approvalRateDonutCanvas: get("approvalRateDonut"),
    kpiOnTimeDonutCanvas: get("kpiOnTimeDonut"),
    kpiBudgetUsageDonutCanvas: get("kpiBudgetUsageDonut"),
    avgBudgetEl: get("avgBudget"),
    avgBudgetCaptionEl: get("avgBudgetCaption"),
    activeOrgCountEl: get("activeOrgCount"),
    activeOrgCaptionEl: get("activeOrgCaption"),
    topOrgNameEl: get("topOrgName"),
    topOrgBudgetEl: get("topOrgBudget"),
    recentProjectsListEl: get("recentProjectsList"),
    longestOpenListEl: get("longestOpenList"),
    longestOpenTableCaptionEl: get("longestOpenTableCaption"),
    longestOpenTableBodyEl: get("longestOpenTableBody"),
    tableBodyEl: get("projectTableBody"),
    tableCaptionEl: get("tableCaption"),
    budgetChartSkeletonEl: get("budgetChartSkeleton"),
    statusPieSkeletonEl: get("statusPieSkeleton"),
    projectTableSkeletonEl: get("projectTableSkeleton"),
    calendarSkeletonEl: get("calendarSkeleton"),
    projectTableAreaEl: get("projectTableArea"),
    projectTableLockEl: get("projectTableLock"),
    statusViewEl: get("statusView"),
    dashboardViewEl: get("dashboardView"),
    calendarViewEl: get("calendarView"),
    budgetChartCanvas: get("budgetByMonthChart"),
    statusPieCanvas: get("statusPieChart"),
    trendLineCanvas: get("trendLineChart"),
    calendarYearSelectEl: get("calendarYearSelect"),
    calendarOrgSelectEl: get("calendarOrgSelect"),
    calendarStatusSelectEl: get("calendarStatusSelect"),
    calendarPanelTitleEl: get("calendarPanelTitle"),
    calendarContainerEl: get("calendarContainer"),
    prevMonthBtnEl: get("prevMonthBtn"),
    nextMonthBtnEl: get("nextMonthBtn"),
    viewToggleBtns: sectionEl
      ? Array.from(sectionEl.querySelectorAll(".view-toggle-btn"))
      : [],
    budgetByMonthChart: null,
    statusPieChart: null,
    trendLineChart: null,
    currentSort: { key: null, direction: "asc" },
    currentCalendarDate: new Date(),
    isInitialized: false
  };
}

function setActiveProjectStatusContext(key) {
  const ctx = projectStatusContexts[key];
  if (!ctx) return;
  activeProjectStatusContext = key;
  // sync global refs to current context
  yearSelect = ctx.yearSelect;
  orgTypeSelect = ctx.orgTypeSelect;
  orgSelect = ctx.orgSelect;
  projectSearchInput = ctx.projectSearchInput;
  projectSearchClearBtn = ctx.projectSearchClearBtn;
  filterBarEl = ctx.filterBarEl;
  totalProjectsEl = ctx.totalProjectsEl;
  pendingProjectsEl = ctx.pendingProjectsEl;
  approvedProjectsEl = ctx.approvedProjectsEl;
  closedProjectsEl = ctx.closedProjectsEl;
  totalBudgetEl = ctx.totalBudgetEl;
  closureRateEl = ctx.closureRateEl;
  closureRateCaptionEl = ctx.closureRateCaptionEl;
  closureRateBarEl = ctx.closureRateBarEl;
  closureRateDonutCanvas = ctx.closureRateDonutCanvas;
  approvalRateEl = ctx.approvalRateEl;
  approvalRateCaptionEl = ctx.approvalRateCaptionEl;
  approvalRateBarEl = ctx.approvalRateBarEl;
  approvalRateDonutCanvas = ctx.approvalRateDonutCanvas;
  kpiOnTimeDonutCanvas = ctx.kpiOnTimeDonutCanvas;
  kpiBudgetUsageDonutCanvas = ctx.kpiBudgetUsageDonutCanvas;
  avgBudgetEl = ctx.avgBudgetEl;
  avgBudgetCaptionEl = ctx.avgBudgetCaptionEl;
  activeOrgCountEl = ctx.activeOrgCountEl;
  activeOrgCaptionEl = ctx.activeOrgCaptionEl;
  topOrgNameEl = ctx.topOrgNameEl;
  topOrgBudgetEl = ctx.topOrgBudgetEl;
  recentProjectsListEl = ctx.recentProjectsListEl;
  longestOpenListEl = ctx.longestOpenListEl;
  longestOpenTableCaptionEl = ctx.longestOpenTableCaptionEl;
  longestOpenTableBodyEl = ctx.longestOpenTableBodyEl;
  tableBodyEl = ctx.tableBodyEl;
  tableCaptionEl = ctx.tableCaptionEl;
  budgetChartSkeletonEl = ctx.budgetChartSkeletonEl;
  statusPieSkeletonEl = ctx.statusPieSkeletonEl;
  projectTableSkeletonEl = ctx.projectTableSkeletonEl;
  calendarSkeletonEl = ctx.calendarSkeletonEl;
  projectTableAreaEl = ctx.projectTableAreaEl;
  projectTableLockEl = ctx.projectTableLockEl;
  statusViewEl = ctx.statusViewEl;
  dashboardViewEl = ctx.dashboardViewEl;
  calendarViewEl = ctx.calendarViewEl;
  budgetByMonthChart = ctx.budgetByMonthChart;
  statusPieChart = ctx.statusPieChart;
  trendLineChart = ctx.trendLineChart;
  currentSort = ctx.currentSort;
  currentCalendarDate = ctx.currentCalendarDate;
  calendarYearSelectEl = ctx.calendarYearSelectEl;
  calendarOrgSelectEl = ctx.calendarOrgSelectEl;
  calendarStatusSelectEl = ctx.calendarStatusSelectEl;
  calendarPanelTitleEl = ctx.calendarPanelTitleEl;
  calendarContainerEl = ctx.calendarContainerEl;
  prevMonthBtnEl = ctx.prevMonthBtnEl;
  nextMonthBtnEl = ctx.nextMonthBtnEl;
  // sync chart refs if already created
  budgetByMonthChart = ctx.budgetByMonthChart || null;
  statusPieChart = ctx.statusPieChart || null;
  trendLineChart = ctx.trendLineChart || null;
}

function syncChartsToContext(key) {
  const ctx = projectStatusContexts[key];
  if (!ctx) return;
  ctx.budgetByMonthChart = budgetByMonthChart;
  ctx.statusPieChart = statusPieChart;
  ctx.trendLineChart = trendLineChart;
}

/* Initialize Hamburger Menu (Accessibility Fix) */
document.addEventListener("DOMContentLoaded", () => {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener("click", () => {
      const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
      setMobileMenuState(mobileMenu, hamburgerBtn, !isExpanded);
    });

    // Close menu when clicking a link inside
    mobileMenu.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("click", () => {
        setMobileMenuState(mobileMenu, hamburgerBtn, false);
      });
    });
  }
});
