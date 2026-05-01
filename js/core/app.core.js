/* Core shared globals (used across modules) */

const APP_CONFIG = SGCU_APP_CONFIG;

/* Backward-compatible config aliases */
const SHEET_CSV_URL = APP_CONFIG.sheets.projects;
const PROJECT_CONTACTS_CSV_URL = APP_CONFIG.sheets.projectContacts || "";
const ORG_STRUCTURE_SHEET_CSV = APP_CONFIG.sheets.orgStructure;
const DOWNLOAD_SHEET = APP_CONFIG.sheets.downloads;
const SCORE_SHEET = APP_CONFIG.sheets.scoreboard;
const NEWS_SHEET_CSV = APP_CONFIG.sheets.news;
const ORG_FILTER_CSV_URL = APP_CONFIG.sheets.orgFilters;
const DEFAULT_BASE_GROUPS = APP_CONFIG.org.defaultBaseGroups;

// Auth/session defaults (can be overridden from global config before scripts run)
const AUTH_SESSION_MAX_AGE_MS =
  typeof globalThis.AUTH_SESSION_MAX_AGE_MS === "number" &&
  Number.isFinite(globalThis.AUTH_SESSION_MAX_AGE_MS) &&
  globalThis.AUTH_SESSION_MAX_AGE_MS > 0
    ? globalThis.AUTH_SESSION_MAX_AGE_MS
    : APP_CONFIG.auth.sessionMaxAgeMs;

// Backward-compat for legacy auth sheet column mapping
const COL_STAFF_EMAIL_LEGACY =
  typeof globalThis.COL_STAFF_EMAIL_LEGACY === "number" &&
  Number.isFinite(globalThis.COL_STAFF_EMAIL_LEGACY)
    ? globalThis.COL_STAFF_EMAIL_LEGACY
    : APP_CONFIG.auth.staffEmailLegacyColumn;

// Cache
const CACHE_TTL_MS = APP_CONFIG.cache.ttlMs;
const CACHE_KEYS = APP_CONFIG.cache.keys;

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
let longestOpenAssistantFilterEl;
let longestOpenStatusFilterEl;
let longestOpenTableCaptionEl;
let longestOpenTableBodyEl;
let lastLongestOpenProjects = [];
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
let currentUserProfileType = "student";
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

function registerCenterTextPlugin() {
  if (typeof Chart === "undefined" || !Chart.register) return;
  if (Chart.registry?.plugins?.get?.("centerText")) return;
  Chart.register(centerTextPlugin);
}

registerCenterTextPlugin();

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
    longestOpenAssistantFilterEl: get("longestOpenAssistantFilter"),
    longestOpenStatusFilterEl: get("longestOpenStatusFilter"),
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
  longestOpenAssistantFilterEl = ctx.longestOpenAssistantFilterEl;
  longestOpenStatusFilterEl = ctx.longestOpenStatusFilterEl;
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
