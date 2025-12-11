/*
 * Table of Contents
 * 01. Config & Globals
 * 02. Utilities & Cache
 * 03. Project Data (parse/load)
 * 04. Project UI (filters/summary/table/charts/modals)
 * 05. News & Downloads
 * 06. Scoreboard
 * 07. Org Structure
 * 08. Motion (section appear / count up)
 * 09. Calendar
 * 10. Page wiring (DOMContentLoaded)
 */

/* 1) CONFIG */
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfcEartu_DeoGQXOJ7_rYPGizNtDhYJEaXivywadNZibj1rch9WKC1GF1yNbZ3zRgQ4Efjj8jrTOrf/pub?output=csv";

const ORG_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ84XOAc7rrKIloXHL5o_0ekzKdi4cQlPMUCGRPb6equG5WAguoaR2fa5ip3j7cT9noG5u9Ozv-VDot/pub?output=csv";

const DOWNLOAD_SHEET =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTburYaUshqF-DOvbwOEinWik0KXNwqqJLfO6frlxUn1iEsLu5RzkNoum4KgnWeSwBdo4--B1eScRD5/pub?output=csv";

const SCORE_SHEET =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_oiV1Ntv0x8UuRBKyvl9tTaUxrKkvImEmyFUU4oPp0pSKnLHOjJIz574Te4l25Y2IKFbLMaFlp3UW/pub?gid=968526742&single=true&output=csv";

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
  DOWNLOADS: "sgcu_cache_downloads"
};

/* 2) Globals */
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
let tableBodyEl;
let tableCaptionEl;
let footerYearEl;
let projectSearchInput;
let projectSearchClearBtn;
let budgetByMonthChart;
let statusPieChart;
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
let currentSort = { key: null, direction: "asc" };
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
let staffCredentials = {};
let staffAuthUser = null;
let loginBtnEl;
let logoutBtnEl;
let mobileLogoutBtnEl;
let userInfoEl;
let loginPageGoogleBtnEl;
let loginPageLogoutBtnEl;
let loginPageStatusEl;
let staffLoginFormEl;
let staffLoginUsernameEl;
let staffLoginPasswordEl;
let staffLoginErrorEl;
let kpiOnTimeEl;
let kpiOnTimeCaptionEl;
let kpiBudgetUsageEl;
let kpiBudgetUsageCaptionEl;
let kpiClosedProjectsEl;
let kpiClosedProjectsCaptionEl;
let kpiMonthlyCaptionEl;
let homeKpiChart = null;
let navLinksAll = [];
let statusViewEl;
let calendarViewEl;
let projectTableAreaEl;
let projectTableLockEl;
let viewToggleBtns = [];
let isUserAuthenticated = false;
let authWasAuthenticated = false;

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

Chart.register(centerTextPlugin);

/* 4) Helper */
function simplifyStatus(statusRaw) {
  const s = (statusRaw || "").toString();
  if (!s) return "แบบร่าง";
  if (s.includes("ไม่อนุมัติ")) return "ไม่อนุมัติ";
  if (s.includes("โครงการรับเงินแล้ว")) return "อนุมัติแล้ว";
  if (s.includes("รอส่งเอกสาร") || s.includes("รอผู้ช่วยตรวจสอบ")) return "รออนุมัติ";
  if (s.includes("ส่งให้ชมรมกลับเพื่อแก้ไข") || s.includes("ชมรมรับเอกสารแก้ไข")) return "แบบร่าง";
  return "แบบร่าง";
}

function parseBudget(text) {
  if (!text) return 0;
  const cleaned = text.toString().replace(/,/g, "").replace(/[^\d.-]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

function isProjectClosed(project) {
  const close = (project.statusClose || "").trim();
  const decree = (project.statusCloseDecree || "").trim();
  return close === "ส่งกิจการนิสิตเรียบร้อย" || decree === "ปิดโครงการเรียบร้อย";
}

function getCloseDurationDays(project) {
  const raw = project.closeDurationText ?? project.closeDuration ?? null;
  if (raw === null || raw === undefined) return null;
  const num = parseFloat(raw.toString().replace(/[^\d.-]/g, ""));
  return isNaN(num) ? null : num;
}

// ===== LocalStorage Cache Helpers =====
function canUseLocalStorage() {
  try {
    return typeof localStorage !== "undefined";
  } catch (err) {
    return false;
  }
}

function getCache(key, ttlMs) {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const ts = parsed.ts ? Number(parsed.ts) : 0;
    if (!ts || Date.now() - ts > ttlMs) return null;
    return parsed.data || null;
  } catch (err) {
    console.warn("อ่าน cache ไม่ได้ - app.js:222", err);
    return null;
  }
}

function setCache(key, data) {
  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch (err) {
    console.warn("เขียน cache ไม่ได้ - app.js:232", err);
  }
}

function classifyOrgSimple(orgName, code) {
  const owner = (orgName || "").toString();
  const c = (code || "").toString();

  if (owner.includes("สภานิสิต") || c.startsWith("SCCU")) return "สภานิสิต";
  if (owner.includes("องค์การบริหารสโมสรนิสิต") || c.startsWith("SGCU")) return "องค์การบริหารสโมสรนิสิต";
  if (owner.includes("ชมรมฝ่ายศิลปะและวัฒนธรรม")) return "ชมรมฝ่ายศิลปะและวัฒนธรรม";
  if (owner.includes("ชมรมฝ่ายวิชาการ")) return "ชมรมฝ่ายวิชาการ";
  if (owner.includes("ชมรมฝ่ายกีฬา")) return "ชมรมฝ่ายกีฬา";
  if (owner.includes("ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์")) return "ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์";
  return "ชมรมอื่น ๆ";
}

function findColIndex(headerRow, candidateSubstringsList) {
  if (!headerRow) return -1;
  for (const substrings of candidateSubstringsList) {
    for (let i = 0; i < headerRow.length; i++) {
      const cell = (headerRow[i] || "").toString();
      if (substrings.every((sub) => cell.includes(sub))) {
        return i;
      }
    }
  }
  return -1;
}

function extractProjectsFromRows(dataRows, headerRow) {
  if (!dataRows || dataRows.length === 0) return [];

  const idxCode = findColIndex(headerRow, [["รหัส", "โครงการ"]]);
  const idxName = findColIndex(headerRow, [["ชื่อ", "โครงการ"]]);
  const idxStatusForChart = findColIndex(headerRow, [["สถานะ", "ปิด"], ["สถานะ"]]);
  const idxBudget = findColIndex(headerRow, [
    ["งบประมาณ", "ได้รับ", "100"],
    ["งบประมาณ", "อนุมัติ"],
    ["งบประมาณ"],
    ["วงเงิน"]
  ]);

  const COL_ORG_NAME = 4;
  const COL_ORG_BIG = 5;
  const COL_STATUS_MAIN = 7;

  const COL_COUNCIL_TYPE = 8;
  const COL_COUNCIL_SESSION = 9;
  const COL_COUNCIL_MEETINGNO = 10;

  const COL_APPROVE_DATE = 11;
  const COL_LASTWORK_DATE = 12;
  const COL_FUND_SOURCE = 13;
  const COL_BUDGET_100 = 14;

  const COL_TRANSFER_STATUS = 16;
  const COL_TRANSFER_DOCNO = 17;
  const COL_TRANSFER_DIFF_TXT = 20;
  const COL_TRANSFER_DIFF_VAL = 21;
  const COL_TRANSFER_NET = 22;

  const COL_ADV_STATUS = 24;
  const COL_ADV_DOCNO = 25;
  const COL_ADV_DUE = 28;
  const COL_ADV_PERCENT = 29;
  const COL_ADV_AMOUNT = 30;

  const COL_CLOSE_CHECKER = 34;
  const COL_ACTUAL_BUDGET = 35;
  const COL_CLOSE_DUE = 36;

  const COL_DAYS = 39;
  const COL_STATUS_CLOSE = 43;     // AR
  const COL_STATUS_CLOSE_DEC = 44; // AS

  const COL_REMAIN_BUDGET = 49;
  const COL_USAGE_PERCENT = 50;
  const COL_CLOSE_DURATION = 51;
  const COL_DECREE_NO = 52;

  return dataRows
    .filter((row) => {
      const code = (idxCode >= 0 ? row[idxCode] : "").toString().trim();
      const name = (idxName >= 0 ? row[idxName] : "").toString().trim();
      return code !== "" && name !== "";
    })
    .map((row) => {
      const name = (idxName >= 0 ? row[idxName] : "").toString();
      const year = "2568";
      const code = (idxCode >= 0 ? row[idxCode] : "").toString();

      const orgName = (row[COL_ORG_NAME] || "").toString();
      const orgBig = (row[COL_ORG_BIG] || "").toString();

      const statusMainRaw = (row[COL_STATUS_MAIN] || "").toString();
      const statusCloseRaw = (row[COL_STATUS_CLOSE] || "").toString();       // AR
      const statusCloseDec = (row[COL_STATUS_CLOSE_DEC] || "").toString();   // AS

      const daysRaw = row[COL_DAYS];
      let daysToDeadline = null;
      if (daysRaw !== undefined && daysRaw !== null && daysRaw !== "") {
        const d = parseFloat(daysRaw);
        daysToDeadline = isNaN(d) ? null : d;
      }

      const statusForChartRaw = (idxStatusForChart >= 0 ? row[idxStatusForChart] : "").toString();
      const budgetText = (idxBudget >= 0 ? row[idxBudget] : "").toString();
      const orgGroup = orgBig || classifyOrgSimple(orgName, code);

      const councilType = (row[COL_COUNCIL_TYPE] || "").toString().trim();
      const councilSession = (row[COL_COUNCIL_SESSION] || "").toString().trim();
      const councilMeetNo = (row[COL_COUNCIL_MEETINGNO] || "").toString().trim();

      let councilSessionText = "-";
      if (councilType || councilSession || councilMeetNo) {
        councilSessionText =
          `ผ่านที่ประชุมสภาสมัย${councilType || ""}ที่ ` +
          `${councilSession || ""} ครั้งที่ ${councilMeetNo || ""}`;
      }

      const approveDate = (row[COL_APPROVE_DATE] || "").toString();
      const lastWorkDate = (row[COL_LASTWORK_DATE] || "").toString();
      const fundSource = (row[COL_FUND_SOURCE] || "").toString();

      const budget100Text = (row[COL_BUDGET_100] || "").toString();
      const budget100Val = parseBudget(budget100Text);

      const transferStatus = (row[COL_TRANSFER_STATUS] || "").toString();
      const transferDocNo = (row[COL_TRANSFER_DOCNO] || "").toString();
      const transferDiffTxt = (row[COL_TRANSFER_DIFF_TXT] || "").toString().trim();
      const transferDiffValRaw = row[COL_TRANSFER_DIFF_VAL];

      let transferDiffAmount = null;
      if (transferDiffValRaw !== undefined && transferDiffValRaw !== null && transferDiffValRaw !== "") {
        transferDiffAmount = parseBudget(transferDiffValRaw.toString());
        if (isNaN(transferDiffAmount)) transferDiffAmount = null;
      }

      let transferDiffDisplay = "-";
      if (transferDiffTxt || transferDiffAmount !== null) {
        const amtStr =
          transferDiffAmount !== null ? transferDiffAmount.toLocaleString("th-TH") : "";
        transferDiffDisplay = `${transferDiffTxt} ${amtStr} บาท`.trim();
      }

      const transferNetText = (row[COL_TRANSFER_NET] || "").toString();
      const transferNetVal = parseBudget(transferNetText);

      const advStatus = (row[COL_ADV_STATUS] || "").toString();
      const advDocNo = (row[COL_ADV_DOCNO] || "").toString();
      const advDueDate = (row[COL_ADV_DUE] || "").toString();

      let advPercent = null;
      if (row[COL_ADV_PERCENT] !== undefined && row[COL_ADV_PERCENT] !== null && row[COL_ADV_PERCENT] !== "") {
        const p = parseFloat(row[COL_ADV_PERCENT]);
        advPercent = isNaN(p) ? null : p;
      }

      const advAmountText = (row[COL_ADV_AMOUNT] || "").toString();
      const advAmountVal = parseBudget(advAmountText);

      const closeChecker = (row[COL_CLOSE_CHECKER] || "").toString();
      const actualBudgetTxt = (row[COL_ACTUAL_BUDGET] || "").toString();
      const actualBudgetVal = parseBudget(actualBudgetTxt);
      const closeDueDate = (row[COL_CLOSE_DUE] || "").toString();

      const remainBudgetTxt = (row[COL_REMAIN_BUDGET] || "").toString();
      const remainBudgetVal = parseBudget(remainBudgetTxt);

      let usagePercent = null;
      if (row[COL_USAGE_PERCENT] !== undefined && row[COL_USAGE_PERCENT] !== null && row[COL_USAGE_PERCENT] !== "") {
        const u = parseFloat(row[COL_USAGE_PERCENT]);
        usagePercent = isNaN(u) ? null : u;
      }

      const closeDurationText = (row[COL_CLOSE_DURATION] || "").toString();
      const decreeNo = (row[COL_DECREE_NO] || "").toString();

      return {
        code,
        name,
        year,
        orgGroup,
        orgName,
        status: simplifyStatus(statusForChartRaw),
        statusMain: statusMainRaw,            // H
        statusClose: statusCloseRaw,          // AR
        statusCloseDecree: statusCloseDec,    // AS
        daysToDeadline,
        budget: parseBudget(budgetText),

        approvalStatus: statusMainRaw,
        councilSessionText,
        approveDate,
        lastWorkDate,
        fundSource,
        approvedBudget100: budget100Val,

        transferStatus,
        transferDocNo,
        transferDiffAmount,
        transferDiffDisplay,
        transferNet: transferNetVal,

        advanceStatus: advStatus,
        advanceDocNo: advDocNo,
        advanceDueDate: advDueDate,
        advancePercent: advPercent,
        advanceAmount: advAmountVal,

        closeChecker,
        closeDueDate,
        actualBudget: actualBudgetVal,
        remainingBudget: remainBudgetVal,
        usagePercent,
        closeDurationText,
        decreeNo,
        closeStatusAdvance: statusCloseRaw,
        closeStatusDecree: statusCloseDec
      };
    });
}

/* 5) Load from Google Sheets (with localStorage cache) */
async function loadProjectsFromSheet() {
  try {
    const cached = getCache(CACHE_KEYS.PROJECTS, CACHE_TTL_MS);
    if (cached && Array.isArray(cached) && cached.length) {
      projects = cached;
      console.log("[SGCU] ใช้ cache โครงการ (localStorage) - app.js:462");
      return;
    }

    console.log("[SGCU] โหลดข้อมูลโครงการจาก Google Sheets ... - app.js:466");
    const res = await fetch(SHEET_CSV_URL);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: false
    });

    const rows = parsed.data;
    if (!rows || rows.length < 2) {
      projects = getFallbackProjects();
    } else {
      const headerRow = rows[1] || [];
      const dataRows = rows.slice(2);
      projects = extractProjectsFromRows(dataRows, headerRow);
    }
    setCache(CACHE_KEYS.PROJECTS, projects);
  } catch (err) {
    console.error("โหลดข้อมูลจากชีตไม่ได้ ใช้ข้อมูลจำลองแทน - app.js:485", err);
    projects = getFallbackProjects();
  }
}

// โหลดตัวเลือก filter จากชีตภายนอก: คอลัมน์ A = ประเภทองค์กร, คอลัมน์ B = ฝ่าย/ชมรม
async function loadOrgFilters() {
  try {
    const res = await fetch(ORG_FILTER_CSV_URL);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true
    });

    const rows = parsed.data || [];
    const dataRows = rows.slice(1); // เริ่มจากแถวที่ 2 ของชีต

    orgFilters = dataRows
      .map((row) => ({
        group: (row[0] || "").toString().trim(),
        name: (row[1] || "").toString().trim()
      }))
      .filter((r) => r.group !== "" && r.name !== "");
  } catch (err) {
    console.error("โหลด org filter ไม่สำเร็จ ใช้ข้อมูลจาก projects แทน - app.js:511", err);
    orgFilters = [];
  }
}

function getFallbackProjects() {
  return [
    {
      code: "SGCU-01.005",
      name: "โครงการองค์การบริหารสโมสรนิสิตสัญจร ปีการศึกษา 2568",
      year: "2568",
      orgGroup: "องค์การบริหารสโมสรนิสิต",
      orgName: "องค์การบริหารสโมสรนิสิตจุฬาฯ",
      status: "รออนุมัติ",
      statusMain: "เสนอที่ประชุมนายก",
      statusClose: "",
      statusCloseDecree: "",
      daysToDeadline: 20,
      budget: 1649.65,
      approvedBudget100: 1649.65,
      actualBudget: 0,
      lastWorkDate: "2024-11-20",
      closeDueDate: "2024-12-01",
      closeDurationText: "8"
    },
    {
      code: "SGCU-05.001",
      name: "โครงการสานสัมพันธ์นิสิต ปีการศึกษา 2568",
      year: "2568",
      orgGroup: "องค์การบริหารสโมสรนิสิต",
      orgName: "ฝ่ายนิสิตสัมพันธ์",
      status: "อนุมัติแล้ว",
      statusMain: "อนุมัติโครงการ",
      statusClose: "",
      statusCloseDecree: "",
      daysToDeadline: 5,
      budget: 114493,
      approvedBudget100: 114493,
      actualBudget: 40320,
      lastWorkDate: "2024-09-30",
      closeDueDate: "2024-10-05",
      closeDurationText: "16"
    },
    {
      code: "PHT-09.001",
      name: "โครงการตัวอย่าง PHT ปีการศึกษา 2568",
      year: "2568",
      orgGroup: "ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์",
      orgName: "ชมรมไอเซค (AIESEC)",
      status: "อนุมัติแล้ว",
      statusMain: "อนุมัติโครงการ",
      statusClose: "ส่งกิจการนิสิตเรียบร้อย",
      statusCloseDecree: "ปิดโครงการเรียบร้อย",
      daysToDeadline: -3,
      budget: 95398.6,
      approvedBudget100: 95398.6,
      actualBudget: 90210,
      lastWorkDate: "2024-08-18",
      closeDueDate: "2024-08-25",
      closeDurationText: "10"
    }
  ];
}

/* 6) Filter + Summary + Table */
function initOrgTypeOptions() {
  if (!orgTypeSelect) return;  // ✅ กัน null

  while (orgTypeSelect.options.length > 1) {
    orgTypeSelect.remove(1);
  }
  const groups = orgFilters.length
    ? Array.from(new Set(orgFilters.map((o) => o.group).filter(Boolean)))
    : Array.from(new Set(projects.map((p) => p.orgGroup).filter(Boolean)));
  groups.sort();
  groups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    orgTypeSelect.appendChild(opt);
  });
}

function initOrgOptions() {
  if (!orgSelect || !orgTypeSelect) return;  // ✅ กัน null

  while (orgSelect.options.length > 1) {
    orgSelect.remove(1);
  }
  const selectedGroup = orgTypeSelect.value;
  const sourceList = orgFilters.length
    ? orgFilters.filter((o) => (selectedGroup === "all" ? true : o.group === selectedGroup))
    : projects.filter((p) => (selectedGroup === "all" ? true : p.orgGroup === selectedGroup));
  const orgNames = Array.from(
    new Set(
      sourceList
        .map((item) => (orgFilters.length ? item.name : item.orgName))
        .filter(Boolean)
    )
  );
  orgNames.sort();
  orgNames.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    orgSelect.appendChild(opt);
  });
}

function filterProjects() {
  const year = yearSelect ? yearSelect.value : "all";
  const orgGroup = orgTypeSelect ? orgTypeSelect.value : "all";
  const org = orgSelect ? orgSelect.value : "all";
  const searchTerm = projectSearchInput ? projectSearchInput.value.trim().toLowerCase() : "";

  return projects.filter((p) => {
    const yearMatch = year === "all" || p.year === year;
    const groupMatch = orgGroup === "all" || p.orgGroup === orgGroup;
    const orgMatch = org === "all" || p.orgName === org;
    const searchMatch =
      !searchTerm ||
      [
        p.code,
        p.name,
        p.orgName,
        p.orgGroup,
        p.statusMain,
        p.status
      ]
        .map((v) => (v || "").toString().toLowerCase())
        .some((txt) => txt.includes(searchTerm));

    return yearMatch && groupMatch && orgMatch && searchMatch;
  });
}

function updateSummaryCards(filtered) {
  const total = filtered.length;

  const excludedStatuses = [
    "ไม่รับรองจากที่ประชุมนายก",
    "สภาไม่รับหลักการ",
    "ไม่ผ่านกมธ.วิสามัญ",
    "สภาไม่อนุมัติงบ",
    "ไม่ผ่านสภาใหญ่",
    "อนุมัติโครงการ",
    "ยกเลิกโครงการ",
    ""
  ];

  const pending = filtered.filter((p) => {
    const s = (p.statusMain || "").trim();
    if (s === "") return false;
    return !excludedStatuses.includes(s);
  }).length;

  const approved = filtered.filter(
    (p) => (p.statusMain || "").trim() === "อนุมัติโครงการ"
  ).length;

  const closed = filtered.filter(
    (p) => (p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย"
  ).length;

  const totalBudget = filtered.reduce((sum, p) => sum + (p.budget || 0), 0);

  // 🔧 เช็คว่ามี element ก่อน
  if (totalProjectsEl)   totalProjectsEl.textContent   = total;
  if (pendingProjectsEl) pendingProjectsEl.textContent = pending;
  if (approvedProjectsEl) approvedProjectsEl.textContent = approved;
  if (closedProjectsEl)  closedProjectsEl.textContent  = closed;
  if (totalBudgetEl)     totalBudgetEl.textContent     = totalBudget.toLocaleString("th-TH");
}

function renderHomeKpis() {
  if (!projects || !projects.length) return;

  const closedProjects = projects.filter(isProjectClosed);

  const onTimeCount = closedProjects.filter((p) => {
    const dur = getCloseDurationDays(p);
    if (dur !== null) {
      return dur <= 14; // ระยะเวลาปิดโครงการ (คอลัมน์ AZ) ไม่เกิน 14 วันถือว่าตรงเวลา
    }

    // fallback ถ้าไม่มีค่า duration ใช้ lastWorkDate เทียบ closeDueDate
    const due = parseProjectDate(p.closeDueDate);
    const last = parseProjectDate(p.lastWorkDate);
    if (!due || !last) return false;
    return last.getTime() <= due.getTime();
  }).length;

  const onTimePercent = closedProjects.length
    ? (onTimeCount / closedProjects.length) * 100
    : 0;

  if (kpiOnTimeEl) {
    kpiOnTimeEl.textContent = `${onTimePercent.toFixed(1)}%`;
  }
  if (kpiOnTimeCaptionEl) {
    kpiOnTimeCaptionEl.textContent = closedProjects.length
      ? `${onTimeCount} จาก ${closedProjects.length} โครงการปิดภายใน 14 วัน`
      : "ยังไม่มีโครงการที่ปิดแล้ว";
  }

  const totalApproved = projects.reduce(
    (sum, p) => sum + (p.approvedBudget100 ?? p.budget ?? 0),
    0
  );
  const totalActual = projects.reduce(
    (sum, p) => sum + (p.actualBudget ?? 0),
    0
  );

  const usagePercent = totalApproved ? (totalActual / totalApproved) * 100 : 0;

  if (kpiBudgetUsageEl) {
    kpiBudgetUsageEl.textContent = `${usagePercent.toFixed(1)}%`;
  }
  if (kpiBudgetUsageCaptionEl) {
    kpiBudgetUsageCaptionEl.textContent =
      `${totalActual.toLocaleString("th-TH")} จาก ${totalApproved.toLocaleString("th-TH")} บาท`;
  }

  if (kpiClosedProjectsEl) {
    kpiClosedProjectsEl.textContent = closedProjects.length.toLocaleString("th-TH");
  }
  if (kpiClosedProjectsCaptionEl) {
    kpiClosedProjectsCaptionEl.textContent =
      `จาก ${projects.length.toLocaleString("th-TH")} โครงการทั้งหมด`;
  }

  const monthly = new Map();
  projects.forEach((p) => {
    const d = parseProjectDate(p.lastWorkDate);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthly.has(key)) {
      monthly.set(key, { date: d, approved: 0, actual: 0 });
    }
    const bucket = monthly.get(key);
    bucket.approved += p.approvedBudget100 ?? p.budget ?? 0;
    bucket.actual += p.actualBudget ?? 0;
  });

  const monthNamesShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const entries = Array.from(monthly.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const labels = entries.map(([, bucket]) => {
    const m = bucket.date.getMonth();
    const y = bucket.date.getFullYear().toString().slice(-2);
    return `${monthNamesShort[m]} ${y}`;
  });
  const approvedData = entries.map(([, bucket]) => Math.round(bucket.approved));
  const actualData = entries.map(([, bucket]) => Math.round(bucket.actual));

  if (kpiMonthlyCaptionEl) {
    kpiMonthlyCaptionEl.textContent = labels.length
      ? "ใช้วันที่สิ้นสุดการปฏิบัติงานของโครงการเป็นฐานเวลา"
      : "ยังไม่มีวันที่สิ้นสุดการปฏิบัติงานของโครงการ";
  }

  if (!labels.length) {
    if (homeKpiChart) {
      homeKpiChart.destroy();
      homeKpiChart = null;
    }
    return;
  }

  const ctx = document.getElementById("homeKpiChart");
  if (!ctx) return;

  const chartData = {
    labels,
    datasets: [
      {
        label: "งบอนุมัติ",
        data: approvedData,
        backgroundColor: "rgba(236, 72, 153, 0.18)",
        borderColor: "#ec4899",
        borderWidth: 1.5,
        borderRadius: 8
      },
      {
        label: "ใช้จริง",
        data: actualData,
        backgroundColor: "rgba(52, 211, 153, 0.18)",
        borderColor: "#22c55e",
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString("th-TH")
        }
      }
    },
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            const val = ctx.parsed.y || 0;
            return `${label}: ${val.toLocaleString("th-TH")} บาท`;
          }
        }
      }
    }
  };

  if (homeKpiChart) {
    homeKpiChart.data = chartData;
    homeKpiChart.options = options;
    homeKpiChart.update();
  } else {
    homeKpiChart = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options
    });
  }
}

function statusMainToBadgeClass(statusMain) {
  const s = (statusMain || "").trim();

  const approvedStatuses = ["อนุมัติโครงการ"];
  const rejectedStatuses = [
    "ไม่รับรองจากที่ประชุมนายก",
    "สภาไม่รับหลักการ",
    "ไม่ผ่านกมธ.วิสามัญ",
    "สภาไม่อนุมัติงบ",
    "ไม่ผ่านสภาใหญ่",
    "ยกเลิกโครงการ"
  ];
  const pendingStatuses = [
    "ส่งขออนุมัติกิจการนิสิต",
    "ผ่านที่ประชุมนายกหรืออนุกรรมการ",
    "ผ่านสภารับหลักการ",
    "ผ่านกมธ.วิสามัญ",
    "ผ่านสภาอนุมัติงบ",
    "ผ่านสภาใหญ่",
    "รอแก้ไข"
  ];

  if (approvedStatuses.includes(s)) return "badge badge-approved";
  if (rejectedStatuses.includes(s)) return "badge badge-rejected";
  if (pendingStatuses.includes(s)) return "badge badge-pending";
  return "badge badge-draft";
}

/**
 * ใช้เฉพาะ "รายการโครงการ" ตาม logic:
 * if (วันนี้ยังไม่เลยกำหนด) → ใช้ H + สีตามเดิม
 * else (วันนี้เลยกำหนด)
 *   if (AR = "ส่งกิจการนิสิตเรียบร้อย" && AS != "รอปิดโครงการ")
 *      → ใช้ AS (เขียว)
 *   else → ใช้ AR (ส้ม)
 */
function getDisplayStatusForList(project) {
  const baseStatus = (project.statusMain || "").trim();           // H
  const statusAR = (project.statusClose || "").trim();            // AR
  const statusAS = (project.statusCloseDecree || "").trim();      // AS
  const d = typeof project.daysToDeadline === "number" && !isNaN(project.daysToDeadline)
    ? project.daysToDeadline
    : null;

  // ถ้ายังไม่เลยกำหนด (หรือไม่มีข้อมูลวัน) → ใช้ H และสีตามเดิม
  if (d === null || d >= 0) {
    return {
      text: baseStatus || "-",
      badgeClass: statusMainToBadgeClass(baseStatus)
    };
  }

  // วันนี้เลยกำหนดแล้ว
  if (statusAR === "ส่งกิจการนิสิตเรียบร้อย" && statusAS !== "รอปิดโครงการ" && statusAS) {
    // ใช้ AS สีเขียว
    return {
      text: statusAS,
      badgeClass: "badge badge-approved"
    };
  }

  if (statusAR) {
    // ใช้ AR สีส้ม
    return {
      text: statusAR,
      badgeClass: "badge badge-pending"
    };
  }

  // fallback ถ้า AR/AS ว่าง ให้กลับไปใช้ H
  return {
    text: baseStatus || "-",
    badgeClass: statusMainToBadgeClass(baseStatus)
  };
}

function updateTable(filteredProjects) {
  const tbody = document.getElementById("projectTableBody");
  tbody.innerHTML = "";

  filteredProjects.forEach((p) => {
    const tr = document.createElement("tr");
    tr.className = "project-row";

    const budgetVal = p.budget || 0;
    let budgetColor = "";
    if (budgetVal >= 1000000) {
      budgetColor = "color:#facc15; font-weight:700;";
    } else if (budgetVal >= 500000) {
      budgetColor = "color:#a855f7; font-weight:600;";
    } else if (budgetVal >= 100000) {
      budgetColor = "color:#3b82f6; font-weight:600;";
    } else {
      budgetColor = "color:inherit;";
    }

    const budgetText = budgetVal.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const displayStatus = getDisplayStatusForList(p);

    const statusBadge = `
      <span class="${displayStatus.badgeClass}">
        ${displayStatus.text || "-"}
      </span>
    `;

    tr.innerHTML = `
      <td class="col-code">${p.code || ""}</td>
      <td class="col-name">${p.name || ""}</td>
      <td class="col-org">${p.orgName || ""}</td>
      <td class="col-year">${p.year || ""}</td>
      <td class="col-status">${statusBadge}</td>
      <td class="col-budget" style="${budgetColor}">${budgetText}</td>
    `;

    tr.addEventListener("click", () => openProjectModal(p));
    tbody.appendChild(tr);
  });
}

function formatDaysToDeadline(days) {
  if (days === null || days === undefined || isNaN(days)) return "-";
  if (days > 0) return `เหลืออีก ${days} วันก่อนครบกำหนดปิดโครงการ`;
  if (days === 0) return `ครบกำหนดปิดโครงการวันนี้`;
  return `เกินกำหนดปิดโครงการมาแล้ว ${Math.abs(days)} วัน`;
}

/* 7) Modal: รายละเอียดโครงการ */
function openProjectModal(project) {
  if (!projectModalEl) return;

  const code = project.code || "-";
  const name = project.name || "-";
  const yearStr = project.year ? `ปีการศึกษา ${project.year}` : "-";
  const orgName = project.orgName || "-";
  const orgGroup = project.orgGroup || "-";
  const approveStatus = project.approvalStatus || project.statusMain || "-";

  // title + badge ด้านบน
  projectModalTitleEl.textContent = name;
  projectModalTitleBadgeEl.textContent = code || "";

  const tags = [];
  if (orgGroup) tags.push(orgGroup);
  if (orgName) tags.push(orgName);

  projectModalHeaderRowEl.innerHTML = `
    <div class="modal-header-maincode">
      <strong>${code}</strong> · ${yearStr}
    </div>
    <div class="modal-header-tags">
      ${tags.map((t) => `<span class="modal-tag">${t}</span>`).join("")}
    </div>
  `;

  // เตรียมข้อมูลที่ใช้ต่อ
  const councilSessionText = project.councilSessionText || "-";
  const approveDate = project.approveDate || "-";
  const lastWorkDate = project.lastWorkDate || "-";
  const fundSource = project.fundSource || "-";
  const approvedBudget100 =
    project.approvedBudget100 != null ? project.approvedBudget100 : project.budget || 0;
  const approvedBudget100Text =
    approvedBudget100.toLocaleString("th-TH") + " บาท";

  const transferStatus = project.transferStatus || "-";
  const transferDocNo = project.transferDocNo || "-";
  const transferDiffDisplay = project.transferDiffDisplay || "-";
  const transferNetText =
    project.transferNet != null
      ? project.transferNet.toLocaleString("th-TH") + " บาท"
      : "-";

  const advanceStatus = project.advanceStatus || "-";
  const advanceDocNo = project.advanceDocNo || "-";
  const advanceDue = project.advanceDueDate || "-";
  const advancePercentText =
    project.advancePercent != null
      ? project.advancePercent.toFixed(0) + "%"
      : "-";
  const advanceAmountText =
    project.advanceAmount != null
      ? project.advanceAmount.toLocaleString("th-TH") + " บาท"
      : "-";

  const closeChecker = (project.closeChecker || "").trim();
  const closeDueDate = project.closeDueDate || "-";
  const actualBudgetText =
    project.actualBudget != null
      ? project.actualBudget.toLocaleString("th-TH") + " บาท"
      : "-";
  const remainingBudgetText =
    project.remainingBudget != null
      ? project.remainingBudget.toLocaleString("th-TH") + " บาท"
      : "-";
  const usagePercentText =
    project.usagePercent != null
      ? project.usagePercent.toFixed(2) + "%"
      : "-";
  const closeDurationText =
    project.closeDurationText || formatDaysToDeadline(project.daysToDeadline);
  const decreeNo = project.decreeNo || "-";
  const closeStatusAdvance = project.closeStatusAdvance || "-";
  const closeStatusDecree = project.closeStatusDecree || project.statusClose || "-";

  // ผู้สอบตรวจเอกสาร + contact box
  let closeCheckerHtml = "-";
  if (closeChecker) {
    const contact = assistantContactsByName[closeChecker];
    if (contact) {
      const bodyLines = [];

      if (contact.phone) {
        bodyLines.push(`
          <div>
            <span class="label">โทร</span>
            <a class="value" href="tel:${contact.phone}">${contact.phone}</a>
          </div>
        `);
      }
      if (contact.line) {
        bodyLines.push(`
          <div>
            <span class="label">LINE</span>
            <span class="value">${contact.line}</span>
          </div>
        `);
      }
      if (bodyLines.length === 0) {
        bodyLines.push(`
          <div>
            <span class="value">ยังไม่ได้บันทึกช่องทางการติดต่อเพิ่มเติม</span>
          </div>
        `);
      }

      closeCheckerHtml = `
        <button type="button" class="assistant-contact-link" data-assistant-name="${closeChecker}">
          ${closeChecker}
        </button>
        <div class="assistant-contact-box" data-assistant-box="${closeChecker}">
          <div class="assistant-contact-box-header">
            <span class="assistant-contact-title">ช่องทางการติดต่อ</span>
            <span class="assistant-contact-role">${contact.position || ""}</span>
          </div>
          <div class="assistant-contact-box-body">
            ${bodyLines.join("")}
          </div>
        </div>
      `;
    } else {
      closeCheckerHtml = closeChecker;
    }
  }

  // === layout แบบการ์ดตามภาพ ===
  const html = `
    <div class="modal-sections">

      <!-- 1) ข้อมูลโครงการ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-info">
            <span>📁</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">ข้อมูลโครงการ</div>
            <div class="modal-section-caption">
              ข้อมูลพื้นฐานของโครงการจากระบบจัดทำโครงการ
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">รหัสโครงการ</div>
            <div class="modal-item-value">${code}</div>
          </div>
          <div>
            <div class="modal-item-label">ชื่อโครงการ</div>
            <div class="modal-item-value">${name}</div>
          </div>
          <div>
            <div class="modal-item-label">ผู้รับผิดชอบโครงการ</div>
            <div class="modal-item-value">${orgName}</div>
          </div>
          <div>
            <div class="modal-item-label">ฝ่ายที่รับผิดชอบโครงการ</div>
            <div class="modal-item-value">${orgGroup}</div>
          </div>
          <div>
            <div class="modal-item-label">ปีการศึกษา</div>
            <div class="modal-item-value">${yearStr}</div>
          </div>
        </div>
      </section>
      
      <div> <br/> </div>

      <!-- 2) อนุมัติ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-approve">
            <span>✅</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">อนุมัติ</div>
            <div class="modal-section-caption">
              สถานะการอนุมัติและรายละเอียดจากที่ประชุมสภา
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">สถานะการอนุมัติ</div>
            <div class="modal-item-value">${approveStatus}</div>
          </div>
          <div>
            <div class="modal-item-label">ผ่านที่ประชุมสภาสมัยที่ / ครั้งที่</div>
            <div class="modal-item-value">${councilSessionText}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่อนุมัติโครงการ</div>
            <div class="modal-item-value">${approveDate}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่ปฏิบัติงานวันสุดท้าย</div>
            <div class="modal-item-value">${lastWorkDate}</div>
          </div>
          <div>
            <div class="modal-item-label">แหล่งงบประมาณ (กองทุน)</div>
            <div class="modal-item-value">${fundSource}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณที่ได้รับอนุมัติ (100%)</div>
            <div class="modal-item-value">${approvedBudget100Text}</div>
          </div>
        </div>
      </section>

      <div> <br/> </div>

      <!-- 3) โอนงบประมาณ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-transfer">
            <span>💸</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">โอนงบประมาณ</div>
            <div class="modal-section-caption">
              สถานะการโอนงบประมาณและส่วนต่างของการโอน
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">สถานะโอนงบประมาณ</div>
            <div class="modal-item-value">${transferStatus}</div>
          </div>
          <div>
            <div class="modal-item-label">เลขรันเอกสารโอนงบประมาณ</div>
            <div class="modal-item-value">${transferDocNo}</div>
          </div>
          <div>
            <div class="modal-item-label">ส่วนต่างการโอนงบประมาณ</div>
            <div class="modal-item-value">${transferDiffDisplay}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณสุทธิ</div>
            <div class="modal-item-value">${transferNetText}</div>
          </div>
        </div>
      </section>

      <div> <br/> </div>

      <!-- 4) ยืมรองจ่าย -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-advance">
            <span>🧾</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">ยืมรองจ่าย</div>
            <div class="modal-section-caption">
              รายละเอียดการยืมรองจ่ายและกำหนดคืนรองจ่าย
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">สถานะยืมรองจ่าย</div>
            <div class="modal-item-value">${advanceStatus}</div>
          </div>
          <div>
            <div class="modal-item-label">เลขรันเอกสารยืมรองจ่าย</div>
            <div class="modal-item-value">${advanceDocNo}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่ต้องคืนรองจ่าย</div>
            <div class="modal-item-value">${advanceDue}</div>
          </div>
          <div>
            <div class="modal-item-label">ร้อยละการยืมรองจ่าย</div>
            <div class="modal-item-value">${advancePercentText}</div>
          </div>
          <div>
            <div class="modal-item-label">จำนวนเงินยืมรองจ่าย</div>
            <div class="modal-item-value">${advanceAmountText}</div>
          </div>
        </div>
      </section>

      <div> <br/> </div>

      <!-- 5) ส่งปิดโครงการ -->
      <section class="modal-section">
        <div class="modal-section-header">
          <div class="modal-section-icon icon-close">
            <span>📚</span>
          </div>
          <div class="modal-section-header-text">
            <div class="modal-section-title">ส่งปิดโครงการ</div>
            <div class="modal-section-caption">
              สถานะการส่งปิดโครงการและข้อมูลการใช้งบประมาณจริง
            </div>
          </div>
        </div>
        <div class="modal-section-grid">
          <div>
            <div class="modal-item-label">ผู้สอบตรวจสอบเอกสาร</div>
            <div class="modal-item-value">${closeCheckerHtml}</div>
          </div>
          <div>
            <div class="modal-item-label">วันที่ต้องส่งเอกสารสรุปโครงการ</div>
            <div class="modal-item-value">${closeDueDate}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณที่ใช้จริง</div>
            <div class="modal-item-value">${actualBudgetText}</div>
          </div>
          <div>
            <div class="modal-item-label">งบประมาณคงเหลือ</div>
            <div class="modal-item-value">${remainingBudgetText}</div>
          </div>
          <div>
            <div class="modal-item-label">% การใช้งบประมาณ</div>
            <div class="modal-item-value">${usagePercentText}</div>
          </div>
          <div>
            <div class="modal-item-label">ระยะเวลาในการส่งสรุปโครงการ</div>
            <div class="modal-item-value">${closeDurationText}</div>
          </div>
          <div>
            <div class="modal-item-label">เลขฎีกา</div>
            <div class="modal-item-value">${decreeNo}</div>
          </div>
          <div>
            <div class="modal-item-label">สถานะปิดโครงการ (ยืมรองจ่าย)</div>
            <div class="modal-item-value">${closeStatusAdvance}</div>
          </div>
          <div>
            <div class="modal-item-label">สถานะปิดโครงการ (ฎีกา)</div>
            <div class="modal-item-value">${closeStatusDecree}</div>
          </div>
        </div>
      </section>

    </div>
  `;

  projectModalBodyEl.innerHTML = html;
  projectModalEl.classList.add("show");

  // toggle กล่อง contact ผู้ช่วยเหรัญญิก
  const links = projectModalBodyEl.querySelectorAll(".assistant-contact-link");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      const name = link.dataset.assistantName;
      const box = projectModalBodyEl.querySelector(
        `.assistant-contact-box[data-assistant-box="${name}"]`
      );
      if (box) {
        box.classList.toggle("show");
      }
    });
  });
}


function closeProjectModal() {
  if (!projectModalEl) return;
  projectModalEl.classList.remove("show");
}

/* 8) Charts */
function initCharts() {
  const budgetCanvas = document.getElementById("budgetByMonthChart");
  const statusCanvas = document.getElementById("statusPieChart");
  if (!budgetCanvas || !statusCanvas) return;

  const budgetCtx = budgetCanvas.getContext("2d");
  const statusCtx = statusCanvas.getContext("2d");

  budgetByMonthChart = new Chart(budgetCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "โครงการที่อนุมัติแล้ว",
          data: [],
          backgroundColor: "#fbbf24",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const y = ds[0].data[i] || 0;
            const o = ds[1].data[i] || 0;
            const r = ds[2].data[i] || 0;
            const g = ds[3].data[i] || 0;
            const isRight = y > 0 && o === 0 && r === 0 && g === 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        },
        {
          label: "โครงการที่วันเลยจัดแล้ว",
          data: [],
          backgroundColor: "#f97316",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const o = ds[1].data[i] || 0;
            const r = ds[2].data[i] || 0;
            const g = ds[3].data[i] || 0;
            const isRight = o > 0 && r === 0 && g === 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        },
        {
          label: "โครงการที่เลยกำหนดส่งปิดแล้ว",
          data: [],
          backgroundColor: "#ef4444",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const r = ds[2].data[i] || 0;
            const g = ds[3].data[i] || 0;
            const isRight = r > 0 && g === 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        },
        {
          label: "โครงการที่ปิดแล้ว",
          data: [],
          backgroundColor: "#22c55e",
          stack: "status",
          borderSkipped: false,
          pointStyle: "rectRounded",
          borderRadius(ctx) {
            const i = ctx.dataIndex;
            const ds = ctx.chart.data.datasets;
            const g = ds[3].data[i] || 0;
            const isRight = g > 0;
            return {
              topLeft: 0,
              bottomLeft: 0,
              topRight: isRight ? 10 : 0,
              bottomRight: isRight ? 10 : 0
            };
          }
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 11 },
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10
          }
        },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { stepSize: 1 }
        },
        y: { stacked: true }
      }
    }
  });

  statusPieChart = new Chart(statusCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            "#f9a8d4",
            "#bfdbfe",
            "#bbf7d0",
            "#fed7aa",
            "#fecaca",
            "#ddd6fe",
            "#fef3c7"
          ],
          borderColor: "#ffffff",
          borderWidth: 1,
          pointStyle: "circle"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 11 },
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10
          }
        },
        centerText: {
          text: "0%",
          subText: "",
          color: "#111827",
          fontSize: 22,
          subFontSize: 11,
          fontFamily: "Kanit"
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.label || "";
              const value = ctx.parsed || 0;
              const dataset = ctx.dataset;
              const total = dataset.data.reduce((a, b) => a + b, 0);
              const percent = total > 0 ? (value / total) * 100 : 0;
              const percentText = percent.toFixed(1);
              const line1 = label;
              const line2 = `งบที่ได้รับอนุมัติ: ${value.toLocaleString("th-TH")} บาท`;
              const line3 = `คิดเป็น ${percentText}% ของงบทั้งหมดในกราฟนี้`;
              return [line1, line2, line3];
            }
          }
        }
      },
      cutout: "55%"
    }
  });
}

function resizeClosureChart(numLabels) {
  const canvas = document.getElementById("budgetByMonthChart");
  if (!canvas) return;
  const container = canvas.parentElement;
  if (!container) return;

  const baseHeight = 260;
  const perLabel = 26;
  const newHeight = Math.max(baseHeight, numLabels * perLabel);
  container.style.height = newHeight + "px";

  if (budgetByMonthChart) budgetByMonthChart.resize();
}

function updateClosureXAxisMax(yellowData, orangeData, redData, greenData) {
  if (!budgetByMonthChart) return;
  const totals = yellowData.map(
    (_, i) => (yellowData[i] || 0) + (orangeData[i] || 0) + (redData[i] || 0) + (greenData[i] || 0)
  );
  const maxTotal = totals.length ? Math.max(...totals) : 0;
  budgetByMonthChart.options.scales.x.max = Math.max(4, maxTotal);
}

function getChartOrgGroups() {
  if (orgFilters.length) {
    return Array.from(new Set(orgFilters.map((o) => o.group).filter(Boolean)));
  }
  return [...DEFAULT_BASE_GROUPS];
}

function getOrgsByGroup(group) {
  if (!group) return [];
  if (orgFilters.length) {
    return Array.from(
      new Set(
        orgFilters
          .filter((o) => o.group === group)
          .map((o) => o.name)
          .filter(Boolean)
      )
    );
  }
  return Array.from(
    new Set(
      projects
        .filter((p) => p.orgGroup === group)
        .map((p) => p.orgName)
        .filter(Boolean)
    )
  );
}

function updateClosureStatusChart(filtered) {
  if (!budgetByMonthChart) return;

  const approvedProjects = filtered.filter(
    (p) => (p.statusMain || "").trim() === "อนุมัติโครงการ"
  );

  const orgGroupFilter = orgTypeSelect.value;
  const orgFilter = orgSelect.value;
  const isGlobalView = orgGroupFilter === "all" && orgFilter === "all";

  if (isGlobalView) {
    const baseGroups = getChartOrgGroups();

    const statsByGroup = {};
    baseGroups.forEach((g) => {
      statsByGroup[g] = { totalApproved: 0, orange: 0, red: 0, green: 0 };
    });

    approvedProjects.forEach((p) => {
      const groupName = baseGroups.includes(p.orgGroup) ? p.orgGroup : null;
      if (!groupName) return;

      const g = statsByGroup[groupName];
      g.totalApproved++;

      const isClosed = (p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย";
      const d =
        typeof p.daysToDeadline === "number" && !isNaN(p.daysToDeadline)
          ? p.daysToDeadline
          : null;

      if (isClosed) {
        g.green++;
        return;
      }
      if (d !== null) {
        if (d < 0) {
          g.red++;
          return;
        }
        if (d >= 0 && d <= 14) {
          g.orange++;
          return;
        }
      }
    });

    const labels = baseGroups;
    const yellowData = [];
    const orangeData = [];
    const redData = [];
    const greenData = [];

    labels.forEach((label) => {
      const g = statsByGroup[label] || {
        totalApproved: 0,
        orange: 0,
        red: 0,
        green: 0
      };
      const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green, 0);
      yellowData.push(yellow);
      orangeData.push(g.orange);
      redData.push(g.red);
      greenData.push(g.green);
    });

    budgetByMonthChart.data.labels = labels;
    budgetByMonthChart.data.datasets[0].data = yellowData;
    budgetByMonthChart.data.datasets[1].data = orangeData;
    budgetByMonthChart.data.datasets[2].data = redData;
    budgetByMonthChart.data.datasets[3].data = greenData;

    updateClosureXAxisMax(yellowData, orangeData, redData, greenData);
    resizeClosureChart(labels.length);
    budgetByMonthChart.update();
    return;
  }

  const allowedOrgs = orgFilter === "all" ? getOrgsByGroup(orgGroupFilter) : [orgFilter];
  const groups = {};
  allowedOrgs.forEach((org) => {
    groups[org] = { totalApproved: 0, orange: 0, red: 0, green: 0 };
  });

  approvedProjects.forEach((p) => {
    const org = p.orgName || "(ไม่ระบุ)";
    if (allowedOrgs.length && !allowedOrgs.includes(org)) return;
    if (!groups[org]) {
      groups[org] = { totalApproved: 0, orange: 0, red: 0, green: 0 };
    }
    const g = groups[org];
    g.totalApproved++;

    const isClosed = (p.statusClose || "").trim() === "ส่งกิจการนิสิตเรียบร้อย";
    const d =
      typeof p.daysToDeadline === "number" && !isNaN(p.daysToDeadline)
        ? p.daysToDeadline
        : null;

    if (isClosed) {
      g.green++;
      return;
    }
    if (d !== null) {
      if (d < 0) {
        g.red++;
        return;
      }
      if (d >= 0 && d <= 14) {
        g.orange++;
        return;
      }
    }
  });

  const labels = Object.keys(groups);
  const yellowData = [];
  const orangeData = [];
  const redData = [];
  const greenData = [];

  labels.forEach((org) => {
    const g = groups[org];
    const yellow = Math.max(g.totalApproved - g.orange - g.red - g.green, 0);
    yellowData.push(yellow);
    orangeData.push(g.orange);
    redData.push(g.red);
    greenData.push(g.green);
  });

  budgetByMonthChart.data.labels = labels;
  budgetByMonthChart.data.datasets[0].data = yellowData;
  budgetByMonthChart.data.datasets[1].data = orangeData;
  budgetByMonthChart.data.datasets[2].data = redData;
  budgetByMonthChart.data.datasets[3].data = greenData;

  updateClosureXAxisMax(yellowData, orangeData, redData, greenData);
  resizeClosureChart(labels.length);
  budgetByMonthChart.update();
}

/* 9) Pie: สัดส่วนงบประมาณที่ได้รับอนุมัติ */
function updateApprovedBudgetPie(filtered) {
  if (!statusPieChart) return;

  const includedStatuses = [
    "ผ่านสภาใหญ่",
    "ส่งขออนุมัติกิจการนิสิต",
    "อนุมัติโครงการ",
    "ยกเลิกโครงการ"
  ];

  const yearFilter = yearSelect ? yearSelect.value : "all";
  const orgGroupFilter = orgTypeSelect ? orgTypeSelect.value : "all";
  const orgFilter = orgSelect ? orgSelect.value : "all";

  let baseAllProjects = projects.filter(
    (p) => yearFilter === "all" || p.year === yearFilter
  );

  let baseApprovedProjects = baseAllProjects.filter((p) =>
    includedStatuses.includes((p.statusMain || "").trim())
  );

  let labels = [];
  let data = [];
  let highlightLabel = null;

  const baseColors = [
    "#f9a8d4",
    "#bfdbfe",
    "#bbf7d0",
    "#fed7aa",
    "#fecaca",
    "#ddd6fe",
    "#fef3c7"
  ];
  const highlightColor = "#fb7185";

  let sumApproved = 0;
  let sumBase = 0;

  const baseGroups = getChartOrgGroups();

  if (orgGroupFilter === "all" && orgFilter === "all") {
    const budgetByGroup = {};
    baseGroups.forEach((g) => (budgetByGroup[g] = 0));

    baseApprovedProjects.forEach((p) => {
      if (budgetByGroup[p.orgGroup] !== undefined) {
        budgetByGroup[p.orgGroup] += p.budget || 0;
      }
    });

    baseGroups.forEach((g) => {
      if (budgetByGroup[g] > 0) {
        labels.push(g);
        data.push(budgetByGroup[g]);
      }
    });

    sumApproved = baseApprovedProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
  } else if (orgGroupFilter !== "all" && orgFilter === "all") {
    const budgetByGroup = {};
    baseGroups.forEach((g) => (budgetByGroup[g] = 0));

    baseApprovedProjects.forEach((p) => {
      if (budgetByGroup[p.orgGroup] !== undefined) {
        budgetByGroup[p.orgGroup] += p.budget || 0;
      }
    });

    baseGroups.forEach((g) => {
      if (budgetByGroup[g] > 0) {
        labels.push(g);
        data.push(budgetByGroup[g]);
      }
    });

    highlightLabel = orgGroupFilter;

    const groupApproved = baseAllProjects
      .filter((p) => p.orgGroup === orgGroupFilter)
      .filter((p) => includedStatuses.includes((p.statusMain || "").trim()));

    sumApproved = groupApproved.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
  } else if (orgGroupFilter !== "all" && orgFilter !== "all") {
    const allowedOrgs = getOrgsByGroup(orgGroupFilter);
    const budgetByClub = {};

    baseApprovedProjects
      .filter((p) => p.orgGroup === orgGroupFilter)
      .forEach((p) => {
        const name = p.orgName || "(ไม่ระบุ)";
        if (allowedOrgs.length && !allowedOrgs.includes(name)) return;
        budgetByClub[name] = (budgetByClub[name] || 0) + (p.budget || 0);
      });

    const orderedLabels = allowedOrgs.length ? allowedOrgs : Object.keys(budgetByClub);
    labels = orderedLabels.filter((l) =>
      allowedOrgs.length ? budgetByClub[l] > 0 || l === orgFilter : true
    );
    data = labels.map((l) => budgetByClub[l] || 0);
    highlightLabel = orgFilter;

    const clubApproved = baseAllProjects
      .filter((p) => p.orgGroup === orgGroupFilter && p.orgName === orgFilter)
      .filter((p) => includedStatuses.includes((p.statusMain || "").trim()));

    sumApproved = clubApproved.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects
      .filter((p) => p.orgGroup === orgGroupFilter)
      .reduce((a, p) => a + (p.budget || 0), 0);
  } else if (orgGroupFilter === "all" && orgFilter !== "all") {
    const budgetByGroup = {};
    baseGroups.forEach((g) => (budgetByGroup[g] = 0));

    baseApprovedProjects.forEach((p) => {
      if (budgetByGroup[p.orgGroup] !== undefined) {
        budgetByGroup[p.orgGroup] += p.budget || 0;
      }
    });

    baseGroups.forEach((g) => {
      if (budgetByGroup[g] > 0) {
        labels.push(g);
        data.push(budgetByGroup[g]);
      }
    });

    const selectedOrgGroupFromFilters = orgFilters.find((o) => o.name === orgFilter);
    const selectedOrgProject = projects.find((p) => p.orgName === orgFilter);
    const selectedOrgGroup = selectedOrgGroupFromFilters
      ? selectedOrgGroupFromFilters.group
      : selectedOrgProject
      ? selectedOrgProject.orgGroup
      : null;
    highlightLabel = selectedOrgGroup || null;

    const clubApproved = baseAllProjects
      .filter((p) => p.orgName === orgFilter)
      .filter((p) => includedStatuses.includes((p.statusMain || "").trim()));

    sumApproved = clubApproved.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
    sumBase = baseAllProjects.reduce(
      (a, p) => a + (p.budget || 0),
      0
    );
  }

  const bgColors = labels.map((l, i) =>
    l === highlightLabel ? highlightColor : baseColors[i % baseColors.length]
  );
  const offsets = labels.map((l) => (l === highlightLabel ? 15 : 0));

  statusPieChart.data.labels = labels;
  statusPieChart.data.datasets[0].data = data;
  statusPieChart.data.datasets[0].backgroundColor = bgColors;
  statusPieChart.data.datasets[0].offset = offsets;

  if (highlightLabel) {
    const idx = labels.indexOf(highlightLabel);
    if (idx !== -1) {
      const targetVal = data[idx];
      const sortedDesc = [...data].sort((a, b) => b - a);
      const rank = sortedDesc.findIndex((v) => v === targetVal) + 1;
      const totalPositive =
        sortedDesc.filter((v) => v > 0).length || labels.length;

      const percent =
        sumBase > 0 ? Math.round((sumApproved / sumBase) * 100) : 0;
      statusPieChart.options.plugins.centerText.text = percent + "%";
      statusPieChart.options.plugins.centerText.subText =
        `อันดับ ${rank} จาก ${totalPositive}`;
    } else {
      statusPieChart.options.plugins.centerText.text = "0%";
      statusPieChart.options.plugins.centerText.subText = "";
    }
  } else {
    const percent =
      sumBase > 0 ? Math.round((sumApproved / sumBase) * 100) : 0;
    statusPieChart.options.plugins.centerText.text = percent + "%";
    statusPieChart.options.plugins.centerText.subText = "";
  }

  statusPieChart.update();
}

/* 10) Sorting + refresh */
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

function updateHomeHeroSummary(total, approved, pending) {
  const totalEl = document.getElementById("homeTotalProjects");
  const approvedEl = document.getElementById("homeApprovedProjects");
  const pendingEl = document.getElementById("homePendingProjects");
  if (!totalEl || !approvedEl || !pendingEl) return;
}

function refreshProjectStatus() {
  if (!Array.isArray(projects)) return;

  let filtered = filterProjects();

  if (currentSort && currentSort.key) {
    filtered = sortProjects(filtered, currentSort.key, currentSort.direction);
  }

  updateSummaryCards(filtered);
  updateTable(filtered);
  updateClosureStatusChart(filtered);
  updateApprovedBudgetPie(filtered);

  if (tableCaptionEl) {
    tableCaptionEl.textContent = `แสดง ${filtered.length} โครงการ`;
  }

  const total = filtered.length;
  const approved = filtered.filter(
    (p) => (p.statusMain || "").trim() === "อนุมัติโครงการ"
  ).length;
  const pending = filtered.filter((p) => {
    const s = (p.statusMain || "").trim();
    return s !== "" && s !== "อนุมัติโครงการ";
  }).length;

  updateHomeHeroSummary(total, approved, pending);
}


function setLoading(isLoading) {
  const budgetCanvas = document.getElementById("budgetByMonthChart");
  const statusCanvas = document.getElementById("statusPieChart");

  if (budgetChartSkeletonEl) {
    budgetChartSkeletonEl.style.display = isLoading ? "block" : "none";
  }
  if (statusPieSkeletonEl) {
    statusPieSkeletonEl.style.display = isLoading ? "block" : "none";
  }
  if (projectTableSkeletonEl) {
    projectTableSkeletonEl.style.display = isLoading ? "block" : "none";
  }
  if (calendarSkeletonEl) {
    calendarSkeletonEl.style.display = isLoading ? "grid" : "none";
  }

  if (budgetCanvas) {
    budgetCanvas.style.visibility = isLoading ? "hidden" : "visible";
  }
  if (statusCanvas) {
    statusCanvas.style.visibility = isLoading ? "hidden" : "visible";
  }
  if (tableBodyEl) {
    tableBodyEl.style.visibility = isLoading ? "hidden" : "visible";
  }
  const calendarContainer = document.getElementById("calendarContainer");
  if (calendarContainer) {
    calendarContainer.style.visibility = isLoading ? "hidden" : "visible";
  }
}

function toggleProjectStatusAccess(isAuthenticated) {
  if (projectTableAreaEl) {
    projectTableAreaEl.style.display = isAuthenticated ? "block" : "none";
  }
  if (projectTableLockEl) {
    projectTableLockEl.style.display = isAuthenticated ? "none" : "block";
  }
}

function updateNavVisibility(isAuthenticated) {
  if (!navLinksAll.length) return;
  const publicAllowed = new Set(["home", "project-status", "financial-docs", "login"]);
  navLinksAll.forEach((link) => {
    const mode = link.dataset.visible || "public";
    const page = link.dataset.page || "";
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

function updateNavForStaff(staffUser) {
  if (!navLinksAll.length || !staffUser) return;

  const roleAllowedMap = {
    "00": new Set(["project-status-staff", "borrow-assets-staff", "meeting-room-staff"]),
    "01": new Set(["project-status-staff"]),
    "04": new Set(["borrow-assets-staff", "meeting-room-staff"])
  };

  const allowedStaffPages = roleAllowedMap[staffUser.role || ""] ||
    new Set(["project-status-staff", "borrow-assets-staff", "meeting-room-staff"]);

  navLinksAll.forEach((link) => {
    const page = link.dataset.page || "";
    link.style.display = allowedStaffPages.has(page) ? "" : "none";
  });
}

function getPreferredPageForState(isAuth, staffUser) {
  if (!isAuth) {
    return "home";
  }
  if (staffUser) {
    const role = staffUser.role || "";
    if (role === "01") return "project-status-staff";
    if (role === "04") return "borrow-assets-staff";
    // default / 00
    return "project-status-staff";
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
      staff: "borrow-assets for Staff",
      staffPage: "borrow-assets-staff"
    },
    "meeting-room": {
      default: "Meeting Room",
      staff: "meeting-room for Staff",
      staffPage: "meeting-room-staff"
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

  function deriveStaffRole(username) {
    if (!username) return "";
    const parts = username.split(/[.\-]/);
    return parts[1] || ""; // 10.XX.YY-ZZZ -> take XX
  }

  function refreshAuthDisplay(firebaseUser) {
    const hasFirebase = !!firebaseUser;
    const hasStaff = !!staffAuthUser;
    const isAuth = hasFirebase || hasStaff;
    isUserAuthenticated = isAuth;
    const staffLabel = hasStaff
      ? [staffAuthUser.username, staffAuthUser.position].filter(Boolean).join(" ")
      : "";
    const nameText = hasFirebase
      ? `สวัสดี ${firebaseUser.displayName || firebaseUser.email || ""}`
      : hasStaff
        ? `Staff : ${staffLabel}${staffAuthUser.nick ? ` (${staffAuthUser.nick})` : ""}`
        : "";

    if (userInfoEl) userInfoEl.textContent = nameText;
    if (logoutBtnEl) logoutBtnEl.style.display = isAuth ? "inline-block" : "none";
    if (mobileLogoutBtnEl) mobileLogoutBtnEl.style.display = isAuth ? "block" : "none";
    if (loginPageStatusEl) loginPageStatusEl.textContent = nameText;
    if (loginPageGoogleBtnEl) {
      loginPageGoogleBtnEl.style.display = isAuth ? "none" : "inline-block";
    }
    if (loginPageLogoutBtnEl) {
      loginPageLogoutBtnEl.style.display = isAuth ? "inline-block" : "none";
    }
    updateNavLabelsForStaff(hasStaff);
    updateNavVisibility(isAuth);
    updateNavForStaff(hasStaff ? staffAuthUser : null);
    toggleProjectStatusAccess(isAuth);

    // เปลี่ยนหน้าไปยังเมนูแรกตามสถานะปัจจุบัน (login/logout)
    const preferredPage = getPreferredPageForState(isAuth, hasStaff ? staffAuthUser : null);
    goToFirstVisibleNavPageWithPreference(preferredPage);
    authWasAuthenticated = isAuth;
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
    refreshAuthDisplay(auth.currentUser);
    signOut(auth).catch((err) => {
      console.error("logout error - app.js:2249", err);
    });

    const hamburger = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    if (hamburger && mobileMenu) {
      hamburger.classList.remove("open");
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

  if (staffLoginFormEl && staffLoginUsernameEl && staffLoginPasswordEl && staffLoginErrorEl) {
    staffLoginFormEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      staffLoginErrorEl.textContent = "";
      const username = staffLoginUsernameEl.value.trim().toLowerCase();
      const pw = staffLoginPasswordEl.value;
      if (!username || !pw) {
        staffLoginErrorEl.textContent = "กรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน";
        return;
      }

      if (!Object.keys(staffCredentials).length) {
        staffLoginErrorEl.textContent = "กำลังโหลดข้อมูลผู้ใช้ staff โปรดลองใหม่";
        return;
      }

      const staffInfo = staffCredentials[username];
      if (!staffInfo) {
        staffLoginErrorEl.textContent = "ไม่พบชื่อผู้ใช้นี้ กรุณาตรวจสอบอีกครั้ง";
        return;
      }
      if (staffInfo.password !== pw) {
        staffLoginErrorEl.textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        return;
      }

      staffAuthUser = {
        username,
        position: staffInfo.position || "",
        nick: staffInfo.nick || "",
        role: deriveStaffRole(username)
      };
      refreshAuthDisplay(auth.currentUser);
      staffLoginFormEl.reset();
      staffLoginErrorEl.textContent = "";
    });
  }
}

/* 11) Org Structure (About Page) */
function toggleOrgStructureLoading(isLoading) {
  const container = document.getElementById("org-structure-content");
  if (orgStructureSkeletonEl) {
    orgStructureSkeletonEl.style.display = isLoading ? "grid" : "none";
  }
  if (container) {
    container.style.display = isLoading ? "none" : "";
  }
}

async function loadOrgStructure() {
  toggleOrgStructureLoading(true);
  const el = document.getElementById("org-structure-content");
  try {
    const res = await fetch(ORG_SHEET_CSV);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: false
    });

    const rows = parsed.data;
    renderOrgStructure(rows);
  } catch (err) {
    console.error("ERROR: โหลดข้อมูลโครงสร้างองค์กรไม่ได้ - app.js:2336", err);
    if (el) {
      el.innerHTML = `<p style="color:#dc2626;">ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้</p>`;
    }
  } finally {
    toggleOrgStructureLoading(false);
  }
}

function renderOrgStructure(rows) {
  const container = document.getElementById("org-structure-content");
  if (!container) return;

  if (!rows || rows.length < 2) {
    container.innerHTML = `<p>ไม่พบข้อมูลในชีต</p>`;
    return;
  }

  const dataRows = rows.slice(1);

  // ====== คอลัมน์ในชีตโครงสร้างองค์กร ======
  const COL_POS    = 3;   // ตำแหน่ง
  const COL_PREFIX = 4;   // คำนำหน้า
  const COL_FIRST  = 5;   // ชื่อ
  const COL_LAST   = 6;   // นามสกุล
  const COL_NICK   = 7;   // ชื่อเล่น (ใช้เป็น key)
  const COL_YEAR   = 9;   // J ชั้นปี
  const COL_FAC    = 10;  // K คณะ
  const COL_LINE   = 12;
  const COL_PHONE  = 13;
  const COL_PHOTO  = 26;  // ชื่อไฟล์รูป หรือ URL
  const COL_STAFF_USERNAME = 28; // AC
  const COL_STAFF_PASSWORD = 29; // AD

  const COL_ASSISTANT_KEY = COL_NICK; // ใช้ชื่อเล่นเป็น key

  const fullName = (r) =>
    [r[COL_PREFIX], r[COL_FIRST], r[COL_LAST]].filter(Boolean).join(" ").trim();

  const nickNameText = (r) =>
    r[COL_NICK] ? `(${r[COL_NICK]})` : "";

  const initials = (r) => {
    const f = (r[COL_FIRST] || "").charAt(0);
    const l = (r[COL_LAST] || "").charAt(0);
    const s = (f + l).toUpperCase();
    return s || "SG";
  };

  const AVATAR_BASE_PATH = "img/org/";

  function buildAvatarUrlFromCell(raw) {
    if (!raw) return "";

    let val = raw.toString().trim();
    if (!val) return "";

    // ถ้าเป็นลิงก์ Google Drive / URL
    if (/^https?:\/\//i.test(val)) {
      const mFile = val.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
      if (mFile && mFile[1]) {
        return `https://drive.google.com/uc?export=view&id=${mFile[1]}`;
      }
      const mId = val.match(/[?&]id=([^&]+)/);
      if (mId && mId[1]) {
        return `https://drive.google.com/uc?export=view&id=${mId[1]}`;
      }
      return val;
    }

    // ถ้าเป็นชื่อไฟล์ธรรมดา
    val = val.replace(/\s+/g, "");
    if (!val.includes(".")) {
      val = `${val}.jpg`;
    }
    return `${AVATAR_BASE_PATH}${val}`;
  }

  function avatarHTML(r, size) {
    const url = buildAvatarUrlFromCell(r[COL_PHOTO]);
    const cls = size === "sm" ? "org-node-circle sm" : "org-node-circle";
    if (url) {
      return `
        <div class="${cls}">
          <img src="${url}" alt="${fullName(r)}" loading="lazy">
        </div>
      `;
    }
    return `<div class="${cls}">${initials(r)}</div>`;
  }

  // ====== peopleByPos + assistantContactsByName (global) ======
  assistantContactsByName = {}; // reset global
  staffCredentials = {}; // reset global

  const peopleByPos = {};
  for (const r of dataRows) {
    const pos = (r[COL_POS] || "").trim();
    if (!pos) continue;

    const key = (r[COL_ASSISTANT_KEY] || "").toString().trim();
    const avatarUrl = buildAvatarUrlFromCell(r[COL_PHOTO]);

    if (key) {
      assistantContactsByName[key] = {
        key,
        fullName: fullName(r),
        nick: r[COL_NICK] || "",
        position: pos,
        phone: (r[COL_PHONE] || "").toString().trim(),
        line: (r[COL_LINE] || "").toString().trim(),
        faculty: (r[COL_FAC] || "").toString().trim(),
        year: (r[COL_YEAR] || "").toString().trim(), 
        avatarUrl
      };
    }

    if (!peopleByPos[pos]) peopleByPos[pos] = [];
    peopleByPos[pos].push(r);

    const staffUser = (r[COL_STAFF_USERNAME] || "").toString().trim().toLowerCase();
    const staffPass = (r[COL_STAFF_PASSWORD] || "").toString().trim();
    const staffNick = (r[COL_NICK] || "").toString().trim();
    if (staffUser && staffPass) {
      staffCredentials[staffUser] = {
        password: staffPass,
        position: pos,
        nick: staffNick
      };
    }
  }

  function getPerson(position, index = 0) {
    const list = peopleByPos[position] || [];
    return list[index] || null;
  }

  function personKey(r) {
    const nick = (r[COL_NICK] || "").toString().trim();
    if (nick) return nick;
    return fullName(r);
  }

  function renderPersonNode(r, opts = {}) {
    if (!r) return "";

    const key = personKey(r);
    const size = opts.size || "lg";

    return `
      <button class="org-node" type="button" data-person-key="${key}">
        ${avatarHTML(r, size === "sm" ? "sm" : "lg")}
        <div class="org-node-role">${(r[COL_POS] || "").trim()}</div>
        <div class="org-node-name">${fullName(r)}</div>
        <div class="org-node-nick">${nickNameText(r)}</div>
      </button>
    `;
  }

  // กล่องผู้ช่วย: fixed label ตามรูป, ไม่ผูก popup
  function renderAssistantBox(labelText) {
    if (!labelText) return "";
    return `
      <div class="org-node-assistant-box">
        ${labelText}
      </div>
    `;
  }

  // ====== ดึงคนตามตำแหน่งหลัก ๆ ตามรูปโครงสร้าง ======
  const treasurer   = getPerson("เหรัญญิก", 0);

  const secretary1  = getPerson("เลขานุการฝ่ายเหรัญญิก", 0);
  const secretary2  = getPerson("เลขานุการฝ่ายเหรัญญิก", 1);

  const headBudget  = getPerson("ประธานฝ่ายบริหารและพัฒนางบประมาณ", 0);
  const headFund    = getPerson("ประธานฝ่ายหาทุนและสิทธิประโยชน์", 0);

  // ประธานฝ่ายกายภาพและพัสดุ 2 คน
  const headAsset1  = getPerson("ประธานฝ่ายกายภาพและพัสดุ", 0);
  const headAsset2  = getPerson("ประธานฝ่ายกายภาพและพัสดุ", 1);

  const depBudget   = getPerson("รองประธานฝ่ายบริหารและพัฒนางบประมาณ", 0);
  const depFunds    = peopleByPos["รองประธานฝ่ายหาทุนและสิทธิประโยชน์"] || []; // อาจมีหลายคน
  const depAsset    = getPerson("รองประธานฝ่ายกายภาพและพัสดุ", 0);

  // ====== ประกอบ HTML Org Tree ======
  let html = `
    <div class="org-tree">

      <!-- Level 1: เหรัญญิก -->
      <div class="org-level">
        ${treasurer
          ? renderPersonNode(treasurer, { size: "lg" })
          : "<p>ไม่พบข้อมูลเหรัญญิก</p>"}
      </div>

      <!-- เส้นลงมาเชื่อมกับเลขาฯ -->
      <div class="org-line-vertical"></div>

      <!-- Level 2: เลขานุการ 2 คน -->
      <div class="org-level org-level-secretaries">
        ${secretary1 ? renderPersonNode(secretary1, { size: "sm" }) : ""}
        ${secretary2 ? renderPersonNode(secretary2, { size: "sm" }) : ""}
      </div>

      <!-- เส้นแนวนอนเชื่อมไปยัง 3 ประธาน -->
      <div class="org-connector-wide"></div>

      <!-- Level 3: ผู้ช่วยเหรัญญิก + สามประธาน -->
      <div class="org-level org-level-main-branches">

        <!-- LEFT: ผู้ช่วยเหรัญญิก -->
        <div class="org-left-asst">
          ${renderAssistantBox("ผู้ช่วยเหรัญญิก")}
        </div>

        <!-- RIGHT: สามสาขา -->
        <div class="org-right-branches">

          <!-- Branch: บริหารและพัฒนางบประมาณ -->
          <div class="org-branch org-branch-budget">
            <div class="org-branch-head">
              ${headBudget ? renderPersonNode(headBudget, { size: "lg" }) : ""}
            </div>
            <div class="org-branch-dep">
              ${depBudget ? renderPersonNode(depBudget, { size: "sm" }) : ""}
            </div>
            <div class="org-branch-assistant">
              ${renderAssistantBox("ผู้ช่วยฝ่ายบริหารและพัฒนางบประมาณ")}
            </div>
          </div>

          <!-- Branch: หาทุนและสิทธิประโยชน์ -->
          <div class="org-branch org-branch-fund">
            <div class="org-branch-head">
              ${headFund ? renderPersonNode(headFund, { size: "lg" }) : ""}
            </div>
            <div class="org-branch-dep org-level-depfund">
              ${depFunds.map(p => renderPersonNode(p, { size: "sm" })).join("")}
            </div>
            <div class="org-branch-assistant">
              ${renderAssistantBox("ผู้ช่วยฝ่ายหาทุนและสิทธิประโยชน์")}
            </div>
          </div>

          <!-- Branch: กายภาพและพัสดุ (ประธาน 2 คน) -->
          <div class="org-branch org-branch-asset">
            <div class="org-branch-head org-level-asset-heads">
              ${headAsset1 ? renderPersonNode(headAsset1, { size: "lg" }) : ""}
              ${headAsset2 ? renderPersonNode(headAsset2, { size: "lg" }) : ""}
            </div>
            <div class="org-branch-dep">
              ${depAsset ? renderPersonNode(depAsset, { size: "sm" }) : ""}
            </div>
            <div class="org-branch-assistant">
              ${renderAssistantBox("ผู้ช่วยฝ่ายกายภาพและพัสดุ")}
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // ผูก popup ให้เฉพาะปุ่มคน (วงกลม)
  initOrgPersonPopup();
}

function initOrgPersonPopup() {
  const modal = document.getElementById("personModal");
  if (!modal) return;

  const closeBtn = document.getElementById("personModalClose");
  const avatarEl = document.getElementById("personModalAvatar");
  const nameEl   = document.getElementById("personModalName");
  const nickEl   = document.getElementById("personModalNick");
  const posEl    = document.getElementById("personModalPosition");
  const contactEl= document.getElementById("personModalContact");

  function openModalForKey(key) {
    const info = assistantContactsByName[key];
    if (!info) return;

    // avatar
    avatarEl.innerHTML = "";
    if (info.avatarUrl) {
      avatarEl.innerHTML = `<img src="${info.avatarUrl}" alt="${info.fullName}">`;
    } else {
      const initials = (info.fullName || "SG")
        .split(" ")
        .map((s) => s.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
      avatarEl.textContent = initials;
    }

    posEl.textContent  = info.position || "";
    nameEl.textContent = info.fullName || key;
    nickEl.textContent = info.nick ? `(${info.nick})` : "";

    const rows = [];

    if (info.faculty) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">คณะ</div>
          <div class="person-modal-contact-value">${info.faculty}</div>
        </div>
      `);
    }

    // ✅ แถวชั้นปี
    if (info.year) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">ชั้นปี</div>
          <div class="person-modal-contact-value">ปี ${info.year}</div>
        </div>
      `);
    }

    if (info.phone) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">โทร</div>
          <div class="person-modal-contact-value">
            <a href="tel:${info.phone}">${info.phone}</a>
          </div>
        </div>
      `);
    }

    if (info.line) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-label">LINE</div>
          <div class="person-modal-contact-value">${info.line}</div>
        </div>
      `);
    }

    if (!rows.length) {
      rows.push(`
        <div class="person-modal-contact-row">
          <div class="person-modal-contact-value">
            ยังไม่มีข้อมูลช่องทางการติดต่อเพิ่มเติม
          </div>
        </div>
      `);
    }

    contactEl.innerHTML = rows.join("");

    modal.classList.add("show");
  }

  // ผูก event กับทุก node ที่มี data-person-key
  document
  .querySelectorAll(".org-node[data-person-key]")
  .forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.personKey;
      if (!key) return;
      openModalForKey(key);
    });
  });

  function closeModal() {
    modal.classList.remove("show");
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("person-modal-backdrop")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* ===== ข่าวและประกาศจากฝ่ายเหรัญญิก ===== */

// ลิงก์ดาวน์โหลด/preview ใช้ทั้งหน้า News และหน้าดาวน์โหลด
function toDownloadUrl(url, label) {
  if (!url) return "#";
  const trimmed = url.trim();

  if (trimmed.includes("drive.google.com")) {
    const mFile = trimmed.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
    if (mFile && mFile[1]) {
      return `https://drive.google.com/uc?export=download&id=${mFile[1]}`;
    }

    const mId = trimmed.match(/[?&]id=([^&]+)/);
    if (mId && mId[1]) {
      return `https://drive.google.com/uc?export=download&id=${mId[1]}`;
    }

    return trimmed;
  }

  return trimmed;
}

// แปลงลิงก์เป็น URL สำหรับฝัง preview ใน iframe
function toPreviewUrl(url) {
  if (!url) return "";
  const u = url.trim();
  if (!u) return "";

  const mFile = u.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (mFile && mFile[1]) {
    return `https://drive.google.com/file/d/${mFile[1]}/preview`;
  }

  if (u.includes("docs.google.com/document")) {
    return u.replace(/\/edit.*$/, "/preview");
  }
  if (u.includes("docs.google.com/spreadsheets")) {
    return u.replace(/\/edit.*$/, "/preview");
  }
  if (u.includes("docs.google.com/presentation")) {
    return u.replace(/\/edit.*$/, "/preview");
  }

  return u;
}

function toggleNewsSkeleton(isLoading) {
  const homePreview = document.getElementById("homeNewsPreview");
  if (homeNewsSkeletonEl) {
    homeNewsSkeletonEl.style.display = isLoading ? "grid" : "none";
  }
  if (homePreview) {
    homePreview.style.display = isLoading ? "none" : "";
  }
  if (newsListSkeletonEl) {
    newsListSkeletonEl.style.display = isLoading ? "grid" : "none";
  }
  if (newsListEl) {
    newsListEl.style.display = isLoading ? "none" : "";
  }
}

function toggleDownloadSkeleton(isLoading) {
  const downloadListEl = document.getElementById("downloadList");
  if (downloadSkeletonEl) {
    downloadSkeletonEl.style.display = isLoading ? "grid" : "none";
  }
  if (downloadListEl) {
    downloadListEl.style.display = isLoading ? "none" : "";
  }
}

async function loadNewsFromSheet() {
  try {
    toggleNewsSkeleton(true);

    const cached = getCache(CACHE_KEYS.NEWS, CACHE_TTL_MS);
    if (cached && Array.isArray(cached) && cached.length) {
      newsItems = cached;
      renderNewsList();
      return;
    }

    const res = await fetch(NEWS_SHEET_CSV);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true
    });

    const rows = parsed.data || [];
    newsItems = [];

    if (rows.length < 2) return;

    // ข้าม header แถวแรก
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const dateStr     = (row[1] || "").trim(); // B      
      const year        = (row[2] || "").trim(); // C
      const title       = (row[3] || "").trim(); // D      
      const summary     = (row[4] || "").trim(); // E
      const previewUrl  = (row[5] || "").trim(); // F
      const category    = (row[6] || "").trim(); // G
      const audience    = (row[7] || "").trim(); // H
      const expireDate  = (row[8] || "").trim(); // I      
      const pinnedRaw   = (row[9] || "").trim(); // J

      if (!title) continue;

      newsItems.push({
        id: `NEWS-${i}`,    // key ง่าย ๆ
        title,
        date: dateStr,
        year,
        category,
        audience,
        summary,
        previewUrl,
        expireDate,
        pinned: /true/i.test(pinnedRaw) || pinnedRaw === "1" // TRUE / true / 1
      });
    }

    // เรียง: ปักหมุดขึ้นก่อนเสมอ แล้วเรียงตามวันที่ออก (ล่าสุดก่อน)
    newsItems.sort((a, b) => {
      const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (pinDiff !== 0) return pinDiff;

      const dA = parseNewsDate(a.date);
      const dB = parseNewsDate(b.date);
      const tA = dA ? dA.getTime() : 0;
      const tB = dB ? dB.getTime() : 0;

      if (tA === tB) return 0;
      return tB - tA; // ใหม่กว่าก่อน
    });

    setCache(CACHE_KEYS.NEWS, newsItems);
    renderNewsList();
  } catch (err) {
    console.error("โหลดข่าว/ประกาศจากชีตไม่ได้  NEWS - app.js:2872", err);
  } finally {
    toggleNewsSkeleton(false);
  }
}

function renderNewsList() {
  if (!newsListEl) return;

  if (!newsItems.length) {
    newsListEl.innerHTML = `
      <div class="panel" style="background:#0f172a; color:#e5e7eb;">
        <div class="panel-title" style="margin-bottom:6px;">ยังไม่มีข่าวหรือประกาศ</div>
        <div class="panel-caption">เมื่อมีการเพิ่มประกาศจากชีตจะแสดงที่นี่อัตโนมัติ</div>
      </div>
    `;
    return;
  }

  const html = newsItems
    .map((item) => {
      const dateText = item.date || "-";
      const pinned = item.pinned
        ? `<span class="news-pill news-pill-pinned">PIN</span>`
        : "";
      const category = item.category
        ? `<span class="news-tag">${item.category}</span>`
        : "";
      const audience = item.audience
        ? `<span class="news-tag">${item.audience}</span>`
        : "";

      return `
        <article class="news-card" data-news-id="${item.id}">
          <header class="news-card-header">
            <div class="news-card-title-row">
              ${pinned}
              <div class="news-card-title">${item.title}</div>
            </div>
            <div class="news-card-meta">
              <span>${dateText}</span>
              ${item.year ? `<span>ปีการศึกษา ${item.year}</span>` : ""}
              ${category}
              ${audience}
            </div>
          </header>
          ${
            item.summary
              ? `<p class="news-card-summary">${item.summary}</p>`
              : ""
          }
          <button class="news-card-btn" type="button">ดูรายละเอียด</button>
        </article>
      `;
    })
    .join("");

  newsListEl.innerHTML = html;

  newsListEl.querySelectorAll("[data-news-id]").forEach((card) => {
    const id = card.getAttribute("data-news-id");
    card.addEventListener("click", () => openNewsModal(id));
  });

  renderHomeNewsPreview();
}

function openNewsModal(newsId) {
  if (!newsModalEl || !newsModalTitleEl || !newsModalBodyEl) return;
  const item = newsItems.find((n) => n.id === newsId);
  if (!item) return;

  newsModalTitleEl.textContent = item.title || "รายละเอียดข่าว/ประกาศ";

  const previewUrl = toPreviewUrl(item.previewUrl);
  const previewHtml = previewUrl
    ? `
      <div class="news-preview-frame">
        <iframe src="${previewUrl}" title="news-preview" allow="fullscreen"></iframe>
      </div>
    `
    : "";

  const downloadHtml = item.previewUrl
    ? `
      <a class="download-btn" style="margin-top:10px;" target="_blank" href="${toDownloadUrl(item.previewUrl, "download")}">
        ⬇ ดาวน์โหลดไฟล์
      </a>
    `
    : "";

  newsModalBodyEl.innerHTML = `
    ${item.summary ? `<p class="news-card-summary" style="margin-top:12px;">${item.summary}</p>` : ""}
    ${downloadHtml}
    ${previewHtml}
  `;

  newsModalEl.classList.add("show");
}

function closeNewsModal() {
  if (!newsModalEl) return;
  newsModalEl.classList.remove("show");
}

function renderHomeNewsPreview() {
  const container = document.getElementById("homeNewsPreview");
  if (!container) return;

  if (!newsItems.length) {
    container.innerHTML = `
      <article class="home-news-card">
        <div class="home-news-tag news-info">ประกาศ</div>
        <h3>ยังไม่มีข่าวใหม่</h3>
        <p>เมื่อมีข่าวหรือประกาศใหม่จะแสดงที่นี่</p>
      </article>
    `;
    return;
  }

  const topNews = newsItems.slice(0, 2);
  const cardsHtml = topNews
    .map((item) => {
      const pinnedTag = item.pinned ? `<div class="home-news-tag">PIN</div>` : "";
      const dateText = item.date ? `<div class="home-news-date">${item.date}</div>` : "";
      const summary = item.summary ? `<p>${item.summary}</p>` : "";

      return `
        <article class="home-news-card" data-news-id="${item.id}">
          ${pinnedTag}
          ${dateText}
          <h3>${item.title}</h3>
          ${summary}
          <button class="home-news-link" type="button" data-news-id="${item.id}">
            ดูรายละเอียด →
          </button>
        </article>
      `;
    })
    .join("");

  const seeAllCard = `
    <article class="home-news-card home-news-more" data-goto-page="news">
      <div class="home-news-tag news-info">News</div>
      <h3>ดูข่าวทั้งหมด</h3>
      <p>เปิดหน้ารวมข่าวและประกาศทั้งหมด</p>
      <button class="home-news-link" type="button" data-goto-page="news">
        เปิดหน้า News →
      </button>
    </article>
  `;

  container.innerHTML = cardsHtml + seeAllCard;

  container.querySelectorAll("[data-news-id]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const id = el.getAttribute("data-news-id");
      if (id) openNewsModal(id);
    });
  });
}

// parse วันที่แบบง่าย ๆ (dd/mm/yyyy หรือ yyyy-mm-dd)
function parseNewsDate(text) {
  if (!text) return null;
  const s = text.toString().trim();
  if (!s) return null;

  let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const mon = parseInt(m[2], 10) - 1;
    const yr  = parseInt(m[3], 10);
    const d   = new Date(yr, mon, day);
    return isNaN(d.getTime()) ? null : d;
  }

  m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const yr  = parseInt(m[1], 10);
    const mon = parseInt(m[2], 10) - 1;
    const day = parseInt(m[3], 10);
    const d   = new Date(yr, mon, day);
    return isNaN(d.getTime()) ? null : d;
  }

  const direct = new Date(s);
  return isNaN(direct.getTime()) ? null : direct;
}

/* ===== ดาวน์โหลดเอกสาร ===== */

/* สร้างปุ่มดาวน์โหลด 1 ปุ่ม (EX / PDF / DOCX / XLSX) */
function addDownloadButton(wrapper, label, url) {
  if (!url || url === "-" || url === "--" || url === "") return;

  const a = document.createElement("a");
  a.className = "download-btn";
  a.target = "_blank";
  a.href = toDownloadUrl(url, label.toLowerCase());
  a.textContent = `⬇ ${label}`;
  wrapper.appendChild(a);
}

async function loadDownloadDocuments() {
  const listEl = document.getElementById("downloadList");
  if (!listEl) return;

  try {
    toggleDownloadSkeleton(true);

    const cached = getCache(CACHE_KEYS.DOWNLOADS, CACHE_TTL_MS);
    if (cached && typeof cached === "string" && cached.trim()) {
      listEl.innerHTML = cached;
      return;
    }

    const res = await fetch(DOWNLOAD_SHEET);
    const csvText = await res.text();
    const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
    const rows = parsed.data;

    // เคลียร์ก่อน
    listEl.innerHTML = "";

    if (!rows || rows.length < 2) return;

    // โครงสร้างกลุ่มหมวดหมู่
    const categories = {};

    rows.slice(1).forEach((row) => {
      const name = (row[0] || "").trim(); // A ชื่อเอกสาร
      const desc = (row[1] || "").trim(); // B รายละเอียด
      const org = (row[2] || "").trim(); // C องค์กร
      const exUrl = (row[3] || "").trim(); // D EX URL
      const pdfUrl = (row[4] || "").trim(); // E PDF URL
      const docxUrl = (row[5] || "").trim(); // F DOCX URL
      const xlsxUrl = (row[6] || "").trim(); // G XLSX URL
      const category = (row[7] || "").trim() || "อื่น ๆ"; // H หมวดหมู่

      if (!name) return;

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push({
        name,
        desc,
        org,
        exUrl,
        pdfUrl,
        docxUrl,
        xlsxUrl
      });
    });

    // Render ออกหน้าเว็บ – 1 การ์ดต่อ 1 หมวด
    for (const categoryName in categories) {
      const section = document.createElement("section");
      section.className = "download-section-card";

      section.innerHTML = `
        <div class="download-card-header">
          <span class="download-card-bar"></span>
          <h3 class="download-card-title">${categoryName}</h3>
        </div>
        <ul class="download-card-list"></ul>
      `;

      const ul = section.querySelector(".download-card-list");

      categories[categoryName].forEach((doc) => {
        const li = document.createElement("li");
        li.className = "download-item";

        li.innerHTML = `
          <div class="download-item">
            <div class="download-main">
              <!-- ซ้าย: ชื่อไฟล์ -->
              <div class="download-title">
                ${doc.name} ${doc.org ? `(${doc.org})` : ""}
              </div>

              <!-- ขวา: ปุ่มดาวน์โหลด -->
              <div class="download-buttons">
                <!-- ใส่ปุ่มด้วย JS ภายหลัง -->
              </div>
            </div>

            <!-- แถวล่าง: คำอธิบาย -->
            <div class="download-desc">
              ${doc.desc ? doc.desc : ""}
            </div>
          </div>
        `;     

        const btnWrap = li.querySelector(".download-buttons");

        addDownloadButton(btnWrap, "EX", doc.exUrl);
        addDownloadButton(btnWrap, "PDF", doc.pdfUrl);
        addDownloadButton(btnWrap, "DOCX", doc.docxUrl);
        addDownloadButton(btnWrap, "XLSX", doc.xlsxUrl);

        ul.appendChild(li);
      });

      listEl.appendChild(section);
    }

    // เก็บ cache เป็น HTML string เพื่อลด render ซ้ำ
    setCache(CACHE_KEYS.DOWNLOADS, listEl.innerHTML);
  } catch (err) {
    console.error("โหลดชีตดาวน์โหลดเอกสารไม่ได้ - app.js:3186", err);
    listEl.innerHTML = `<div style="color:#dc2626;">ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้</div>`;
  } finally {
    toggleDownloadSkeleton(false);
    listEl.style.display = listEl.innerHTML.trim() ? "" : "none";
  }
}

/* ================= SCOREBOARD SGCU-10.001 ================= */

function initScoreboard() {
  const podiumEl = document.getElementById("scorePodium");
  const runnersEl = document.getElementById("scoreRunners");
  if (!podiumEl || !runnersEl) return;

  podiumEl.innerHTML = `<div class="score-loading">กำลังโหลดผลคะแนน...</div>`;
  runnersEl.innerHTML = "";

  Papa.parse(SCORE_SHEET, {
    download: true,
    complete: (results) => {
      const rows = results.data || [];
      if (rows.length < 2) return;

      const items = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const org = (row[28] || "").trim();
        const scoreVal = parseFloat(row[29]);

        if (!org || Number.isNaN(scoreVal)) continue;
        items.push({ org, score: scoreVal });
      }

      if (!items.length) return;

      items.sort((a, b) => b.score - a.score);

      const podium = items.slice(0, 3);
      const runners = items.slice(3, 8);

      renderScorePodium(podiumEl, podium);
      renderScoreRunners(runnersEl, runners);
    },
    error: (err) => {
      console.error("Error loading SCORE_SHEET - app.js:3233", err);
    }
  });
}

function renderScorePodium(container, podium) {
  if (!podium.length) return;

  const first = podium[0];
  const second = podium[1];
  const third = podium[2];

  container.innerHTML = `
    ${second ? `
      <div class="score-podium-card second">
        <div class="score-medal second">2</div>
        <div class="score-rank-label">รองชนะเลิศอันดับ 1</div>
        <div class="score-org-name">${second.org}</div>
        <div class="score-org-score">${second.score.toLocaleString()} คะแนน</div>
      </div>
    ` : ""}

    ${first ? `
      <div class="score-podium-card first">
        <div class="score-medal first">1</div>
        <div class="score-rank-label">ชนะเลิศ</div>
        <div class="score-org-name">${first.org}</div>
        <div class="score-org-score">${first.score.toLocaleString()} คะแนน</div>
      </div>
    ` : ""}

    ${third ? `
      <div class="score-podium-card third">
        <div class="score-medal third">3</div>
        <div class="score-rank-label">รองชนะเลิศอันดับ 2</div>
        <div class="score-org-name">${third.org}</div>
        <div class="score-org-score">${third.score.toLocaleString()} คะแนน</div>
      </div>
    ` : ""}
  `;

  adjustScoreOrgNameFont();
}

function renderScoreRunners(container, runners) {
  if (!runners.length) {
    container.style.display = "none";
    return;
  }

  const chips = runners
    .map((item, idx) => {
      const rank = idx + 4;
      return `
        <div class="score-runner-chip">
          <span class="score-runner-rank">${rank}</span>
          <span>${item.org}</span>
          <span style="opacity:0.85;">· ${item.score.toLocaleString()} คะแนน</span>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <span class="score-runners-title">Runners-up</span>
    ${chips}
  `;
}

function adjustScoreOrgNameFont() {
  const names = document.querySelectorAll(".score-org-name");

  names.forEach((el) => {
    const len = el.textContent.trim().length;

    el.classList.remove("score-org-name--long", "score-org-name--very-long");

    if (len > 40) {
      el.classList.add("score-org-name--very-long");
    } else if (len > 25) {
      el.classList.add("score-org-name--long");
    }
  });
}


/* ===== Motion Helpers: section appear + count up ===== */

function initSectionAppearObserver() {
  const sections = document.querySelectorAll(".section-appear");
  if (!sections.length) return;

  if (sectionObserver) {
    sectionObserver.disconnect();
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));
}

function initCountupOnVisible() {
  const elements = document.querySelectorAll("[data-countup]");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseFloat(el.dataset.countup || "0") || 0;
        const duration = 900;
        const startTime = performance.now();

        function animate(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = t * (2 - t); // ease-out
          const value = Math.floor(target * eased);
          el.textContent = value.toLocaleString("th-TH");
          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toLocaleString("th-TH");
          }
        }
        requestAnimationFrame(animate);

        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  elements.forEach((el) => observer.observe(el));
  hasInitCountup = true;
}

/* เรียกใหม่ทุกครั้งที่เปลี่ยนหน้า (เผื่อ DOM เปลี่ยน) */
function refreshMotionForActivePage() {
  initSectionAppearObserver();
  if (!hasInitCountup) {
    initCountupOnVisible();
  }
}


/* 12) Init */
window.addEventListener("load", async () => {
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
  staffLoginFormEl = document.getElementById("staffLoginForm");
  staffLoginUsernameEl = document.getElementById("staffLoginUsername");
  staffLoginPasswordEl = document.getElementById("staffLoginPassword");
  staffLoginErrorEl = document.getElementById("staffLoginError");
  navLinksAll = Array.from(document.querySelectorAll("header nav a[data-visible]"));
  statusViewEl = document.getElementById("statusView");
  calendarViewEl = document.getElementById("calendarView");
  projectTableAreaEl = document.getElementById("projectTableArea");
  projectTableLockEl = document.getElementById("projectTableLock");
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

  initAuthUI();
  updateNavVisibility(false);
  toggleProjectStatusAccess(false);

  // ===== 2) โหลดรายการดาวน์โหลดเอกสาร =====
  await loadDownloadDocuments();

  // ===== 2.1) โหลดข่าวและประกาศจากฝ่ายเหรัญญิก =====
  await loadNewsFromSheet();

  
  // ===== 3) ตั้งปีใน footer =====
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }

  // ===== 4) ระบบสลับหน้าแบบ SPA =====
  const navLinks = document.querySelectorAll("header nav a[data-page]");
  const pageViews = document.querySelectorAll(".page-view");

  function switchPage(page, { fromHash = false } = {}) {
    pageViews.forEach((section) => {
      const isTarget = section.dataset.page === page;
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

    // sync URL hash กับ page ปัจจุบัน (ไม่ทำตอนมาจาก hashchange)
    if (!fromHash) {
      if (history.replaceState) {
        history.replaceState(null, "", "#" + page);
      } else {
        window.location.hash = "#" + page;
      }
    }

    refreshMotionForActivePage();
  }

  // คลิกเมนูด้านบน
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (!page) return;
      switchPage(page);
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

  switchPage(initialPage, { fromHash: true });

  // รองรับเปลี่ยน hash ด้วยตนเอง (#about, #status ฯลฯ)
  window.addEventListener("hashchange", () => {
    const hashPage = window.location.hash.replace("#", "");
    if (!hashPage) return;
    if (Array.from(pageViews).some((sec) => sec.dataset.page === hashPage)) {
      switchPage(hashPage, { fromHash: true });
    }
  });

  // ===== 10) Hamburger + เมนูสามขีด =====
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileNavLinks = mobileMenu
    ? mobileMenu.querySelectorAll("a[data-page]")
    : [];

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.setAttribute("aria-expanded", "false");

    // เปิด/ปิดกล่องเมนู
    hamburgerBtn.addEventListener("click", () => {
      hamburgerBtn.classList.toggle("open");
      mobileMenu.classList.toggle("show");
      const expanded = hamburgerBtn.classList.contains("open");
      hamburgerBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    // เวลาเลือกเมนูจากกล่อง ให้สลับหน้า + ปิดกล่อง
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (!page) return;
        switchPage(page);
        hamburgerBtn.classList.remove("open");
        mobileMenu.classList.remove("show");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      });
    });
  }


  // ปุ่มลัดที่หน้า Hero: มี data-goto-page (เช่น “ดูสถานะโครงการทั้งหมด”)
  document.querySelectorAll("[data-goto-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.gotoPage;
      if (!page) return;
      switchPage(page);
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProjectModal();
      closeNewsModal();
    }
  });

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

  // ===== 6) โหลดข้อมูลโครงการ + Dashboard + Calendar =====
  setLoading(true);
  try {
    await loadProjectsFromSheet();              // ดึงข้อมูลจาก SHEET_CSV_URL (ปี 2568 ตามที่ fix ไว้)
    if (!projects || projects.length === 0) {   // กันกรณีโหลดไม่ได้/ข้อมูลว่าง
      projects = getFallbackProjects();
    }

    await loadOrgFilters();                     // โหลดตัวเลือก filter ประเภท/ฝ่าย

    initOrgTypeOptions();                       // เติม options ประเภทองค์กร
    initOrgOptions();                           // เติมรายชื่อองค์กร
    initCharts();                               // สร้างกราฟ Chart.js
    refreshProjectStatus();                     // อัปเดตการ์ดสรุป + ตาราง + กราฟสถานะปิดโครงการ
    initCalendar();                             // สร้างปฏิทินจาก projects (ใช้วันที่คอลัมน์ M แล้ว)
    initScoreboard();                           // 🔹 โหลดและแสดงผล Scoreboard SGCU-10.001
    renderHomeKpis();                           // KPI หน้าแรก
  } catch (err) {
    console.error("โหลดข้อมูลหน้า Project Status ไม่สำเร็จ  ใช้ข้อมูลสำรองแทน - app.js:3630", err);
    projects = getFallbackProjects();
    await loadOrgFilters();
    initOrgTypeOptions();
    initOrgOptions();
    initCharts();
    refreshProjectStatus();
    initCalendar();
    renderHomeKpis();
  } finally {
    setLoading(false);
  }

  // ===== 7) Event เปลี่ยน filter ของ Dashboard =====
  if (yearSelect) {
    yearSelect.addEventListener("change", refreshProjectStatus);
  }
  if (orgTypeSelect) {
    orgTypeSelect.addEventListener("change", () => {
      initOrgOptions();
      refreshProjectStatus();
    });
  }
  if (orgSelect) {
    orgSelect.addEventListener("change", refreshProjectStatus);
  }
  if (projectSearchInput) {
    projectSearchInput.addEventListener("input", () => {
      refreshProjectStatus();
    });
  }
  if (projectSearchClearBtn && projectSearchInput) {
    projectSearchClearBtn.addEventListener("click", () => {
      projectSearchInput.value = "";
      refreshProjectStatus();
      projectSearchInput.focus();
    });
  }

  // ===== 8) โหลดโครงสร้างองค์กร (About Page) =====
  await loadOrgStructure();

  // ===== 9) Sorting ตารางโครงการ =====
  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) {
        currentSort.direction =
          currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.key = key;
        currentSort.direction = "asc";
      }

      document
        .querySelectorAll("th.sortable")
        .forEach((x) => x.classList.remove("sort-asc", "sort-desc"));

      th.classList.add(
        currentSort.direction === "asc" ? "sort-asc" : "sort-desc"
      );

      refreshProjectStatus();
    });
  });

  // ===== 10) Toggle ระหว่าง Status / Calendar ในหน้า Project Status =====
  const toggleBtns = document.querySelectorAll(".view-toggle-btn");

  if (toggleBtns.length && statusViewEl && calendarViewEl) {
    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!isUserAuthenticated) return;
        const target = btn.dataset.view; // 'status' หรือ 'calendar'

        // เปลี่ยนปุ่ม active
        toggleBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        if (target === "calendar") {
          // โชว์เฉพาะปฏิทิน
          statusViewEl.style.display = "none";
          calendarViewEl.style.display = "block";

          // เผื่อมี filter เปลี่ยน → วาดใหม่อีกรอบก็ได้
          generateCalendar();
        } else {
          // โชว์เฉพาะสรุปสถานะโครงการ
          statusViewEl.style.display = "block";
          calendarViewEl.style.display = "none";
        }
      });
    });
  }


  // ===== 11) Tabs Borrow & Return Assets =====
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

  // ===== 12) Tabs Meeting Room =====
  const meetingTabBtns = document.querySelectorAll(".tab-btn[data-meeting-tab]");
  const meetingToday = document.getElementById("meetingToday");
  const meetingWeek = document.getElementById("meetingWeek");

  if (meetingTabBtns.length && meetingToday && meetingWeek) {
    meetingTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.meetingTab; // 'today' | 'week'
        meetingTabBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        if (target === "today") {
          meetingToday.style.display = "block";
          meetingWeek.style.display = "none";
        } else {
          meetingToday.style.display = "none";
          meetingWeek.style.display = "block";
        }
      });
    });
  }

  // ===== 13) Tabs Login Page =====
  const loginTabBtns = document.querySelectorAll(".tab-btn[data-login-tab]");
  const loginGooglePanel = document.getElementById("loginGooglePanel");
  const loginStaffPanel = document.getElementById("loginStaffPanel");

  if (loginTabBtns.length && loginGooglePanel && loginStaffPanel) {
    loginTabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.loginTab; // 'google' | 'staff'
        loginTabBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        if (target === "staff") {
          loginGooglePanel.style.display = "none";
          loginStaffPanel.style.display = "block";
        } else {
          loginGooglePanel.style.display = "block";
          loginStaffPanel.style.display = "none";
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
});

/*******************************************************
 *  Calendar System — ใช้ข้อมูลจาก projects เดิม
 *  ไม่ต้องโหลดชีตเพิ่ม / ไม่ต้องมี URL ใหม่
 *******************************************************/

let calendarEvents = [];
let currentCalendarDate = new Date();

/**
 * แปลง string วันที่จากชีต → Date object
 * รองรับ:
 *  - 2025-12-01
 *  - 01/12/2025 หรือ 1/12/2025
 */
function parseProjectDate(text) {
  if (!text) return null;
  const s = text.toString().trim();
  if (!s) return null;

  // 1) รูปแบบ ISO: 2025-09-12 หรือ 2025/09/12
  let m = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const year  = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;  // 0-based
    const day   = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // 2) รูปแบบ dd/mm/yyyy หรือ dd-mm-yyyy  (กรณี 12/9/2025, 12-09-2025)
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const day   = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year  = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // 3) กรณีอื่น ๆ ที่มีชื่อเดือน เช่น "12 Sep 2025" ค่อยให้ JS parse
  const direct = new Date(s);
  return isNaN(direct.getTime()) ? null : direct;
}


/**
 * แปลง status จากข้อมูลโครงการ → pending / approved / closed
 */
function mapProjectStatusToCalendarStatus(p) {
  const main = (p.statusMain || "").trim();
  const ar = (p.statusClose || "").trim();
  const as = (p.statusCloseDecree || "").trim();

  // ปิดโครงการแล้ว
  if (ar === "ส่งกิจการนิสิตเรียบร้อย" || as === "ปิดโครงการเรียบร้อย") {
    return "closed";
  }

  // อนุมัติโครงการแล้ว
  if (main === "อนุมัติโครงการ") {
    return "approved";
  }

  // อย่างอื่นถือเป็น pending
  return "pending";
}


function buildCalendarEventsFromProjects() {
  if (!Array.isArray(projects) || projects.length === 0) {
    calendarEvents = [];
    return;
  }

  calendarEvents = projects
    // ตัดโครงการที่ "ยกเลิกโครงการ" ออกเหมือนเดิม
    .filter((p) => (p.statusMain || "").trim() !== "ยกเลิกโครงการ")
    .map((p) => {
      // ✅ ใช้วันที่จากคอลัมน์ M เท่านั้น (lastWorkDate)
      const dateStr = p.lastWorkDate;
      const parsedDate = parseProjectDate(dateStr);

      if (!parsedDate) return null; // ถ้า M ว่าง/อ่านไม่ได้ → ไม่เอาใส่ปฏิทิน

      const status = mapProjectStatusToCalendarStatus(p);

      return {
        title: p.name || "(ไม่ระบุชื่อโครงการ)",
        start: parsedDate,
        end: parsedDate,
        org: p.orgName || "(ไม่ระบุฝ่าย/ชมรม)",
        year: p.year || "ไม่ระบุ",
        status,
        note: `รหัสโครงการ: ${p.code || "-"}`,
        budgetSource: p.fundSource || "-"
      };
    })
    .filter(Boolean);
}


/**
 * เตรียม Filter (ปี / องค์กร) จาก calendarEvents
 */
function initCalendarFilters() {
  const yearSelect = document.getElementById("calendarYearSelect");
  const orgSelect = document.getElementById("calendarOrgSelect");

  if (!yearSelect || !orgSelect) return;

  // reset options (เหลือค่า all ไว้)
  yearSelect.innerHTML = `<option value="all">ทุกปีการศึกษา</option>`;
  orgSelect.innerHTML = `<option value="all">ทุกฝ่าย / ทุกชมรม</option>`;

  const years = Array.from(new Set(calendarEvents.map((e) => e.year).filter(Boolean)));
  years.sort();
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  });

  const orgs = Array.from(new Set(calendarEvents.map((e) => e.org).filter(Boolean)));
  orgs.sort();
  orgs.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    orgSelect.appendChild(opt);
  });
}

/**
 * คืนรายการ events ที่อยู่ในวัน date และผ่านเงื่อนไข filter
 */
function getEventsForDate(date) {
  const yearSel = document.getElementById("calendarYearSelect");
  const orgSel = document.getElementById("calendarOrgSelect");
  const statusSel = document.getElementById("calendarStatusSelect");

  const yearFilter = yearSel ? yearSel.value : "all";
  const orgFilter = orgSel ? orgSel.value : "all";
  const statusFilter = statusSel ? statusSel.value : "all";

  return calendarEvents.filter((ev) => {
    // วันเดียวกัน (เทียบเฉพาะ Y/M/D)
    const d = ev.start;
    const sameDay =
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate();

    if (!sameDay) return false;
    if (yearFilter !== "all" && ev.year !== yearFilter) return false;
    if (orgFilter !== "all" && ev.org !== orgFilter) return false;
    if (statusFilter !== "all" && ev.status !== statusFilter) return false;

    return true;
  });
}

/**
 * อัปเดตหัวปฏิทิน (ชื่อเดือน + ปี)
 */
function updateCalendarHeader() {
  const panel = document.getElementById("calendarPanelTitle");
  if (!panel) return;

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const y = currentCalendarDate.getFullYear();
  const m = currentCalendarDate.getMonth();

  panel.textContent = `ปฏิทินกิจกรรม — ${monthNames[m]} ${y}`;
}

/**
 * วาดปฏิทินตาม currentCalendarDate
 */
function generateCalendar() {
  const container = document.getElementById("calendarContainer");
  if (!container) return;

  container.innerHTML = "";

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // วันแรกของเดือน
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0=Sun,1=Mon,...

  // จำนวนวันในเดือน
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // เติมช่องว่างก่อนวันที่ 1
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day calendar-day-empty";
    container.appendChild(emptyCell);
  }

  // เติมวันที่ 1..daysInMonth
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    const header = document.createElement("div");
    header.className = "calendar-day-header";
    header.textContent = day;
    cell.appendChild(header);

    const thisDate = new Date(year, month, day);
    const isToday =
      thisDate.getFullYear() === todayY &&
      thisDate.getMonth() === todayM &&
      thisDate.getDate() === todayD;
    if (isToday) {
      cell.classList.add("calendar-day-today");
      const pill = document.createElement("span");
      pill.className = "calendar-today-pill";
      pill.textContent = "วันนี้";
      header.appendChild(pill);
    }

    const todaysEvents = getEventsForDate(thisDate);
    const MAX_EVENTS = 4;
    const visibleEvents = todaysEvents.slice(0, MAX_EVENTS);

    if (todaysEvents.length) {
      cell.classList.add("calendar-day-has-events");
    }

    visibleEvents.forEach((ev) => {
      const evDiv = document.createElement("div");
      evDiv.className = `calendar-event ${ev.status}`;
      evDiv.textContent = ev.title;
      evDiv.title = ev.title;

      evDiv.addEventListener("click", () => openCalendarModal(ev));

      cell.appendChild(evDiv);
    });

    const remaining = todaysEvents.length - MAX_EVENTS;
    if (remaining > 0) {
      const moreDiv = document.createElement("div");
      moreDiv.className = "calendar-event calendar-more";
      moreDiv.textContent = `และอื่น ๆ อีก ${remaining} โครงการ`;
      moreDiv.addEventListener("click", () => openCalendarDayModal(thisDate, todaysEvents));
      cell.appendChild(moreDiv);
    }

    // คลิกที่หัววันเพื่อดูรายการทั้งหมดของวันนั้น
    if (todaysEvents.length > 0) {
      header.addEventListener("click", () => {
        openCalendarDayModal(thisDate, todaysEvents);
      });
    }

    container.appendChild(cell);
  }

  updateCalendarHeader();
}

/**
 * เปิด Modal รายละเอียดกิจกรรม
 */
function openCalendarModal(ev) {
  const modal = document.getElementById("calendarModal");
  const titleEl = document.getElementById("calendarModalTitle");
  const bodyEl = document.getElementById("calendarModalBody");
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.textContent = ev.title;

  const fmt = (d) =>
    d && d instanceof Date && !isNaN(d.getTime())
      ? d.toLocaleDateString("th-TH")
      : "-";

  bodyEl.innerHTML = `
    <div class="modal-section">
      <div class="modal-section-title">
        <span class="icon">📅</span> รายละเอียดกิจกรรม
      </div>
      <div class="modal-section-grid">
        <div>
          <div class="modal-item-label">ชื่อโครงการ / กิจกรรม</div>
          <div class="modal-item-value">${ev.title}</div>
        </div>
        <div>
          <div class="modal-item-label">วันที่</div>
          <div class="modal-item-value">${fmt(ev.start)}</div>
        </div>
        <div>
          <div class="modal-item-label">ฝ่าย / ชมรม</div>
          <div class="modal-item-value">${ev.org}</div>
        </div>
        <div>
          <div class="modal-item-label">แหล่งงบประมาณ</div>
          <div class="modal-item-value">${ev.budgetSource || "-"}</div>
        </div>
        <div>
          <div class="modal-item-label">ปีการศึกษา</div>
          <div class="modal-item-value">${ev.year}</div>
        </div>
        <div>
          <div class="modal-item-label">สถานะ</div>
          <div class="modal-item-value">
            ${
              ev.status === "closed"
                ? "ปิดโครงการแล้ว"
                : ev.status === "approved"
                ? "อนุมัติโครงการแล้ว"
                : "อยู่ระหว่างดำเนินการ"
            }
          </div>
        </div>
        ${
          ev.note
            ? `
        <div>
          <div class="modal-item-label">หมายเหตุ</div>
          <div class="modal-item-value">${ev.note}</div>
        </div>`
            : ""
        }
      </div>
    </div>
  `;

  modal.classList.add("show");
}

function openCalendarDayModal(dateObj, events) {
  const modal = document.getElementById("calendarModal");
  const titleEl = document.getElementById("calendarModalTitle");
  const bodyEl = document.getElementById("calendarModalBody");
  if (!modal || !titleEl || !bodyEl) return;
  if (!dateObj || !Array.isArray(events) || !events.length) return;

  const dateText = dateObj.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  titleEl.textContent = `โครงการวันที่ ${dateText}`;

  const cards = events
    .map((ev, idx) => {
      const fmt = (d) =>
        d && d instanceof Date && !isNaN(d.getTime())
          ? d.toLocaleDateString("th-TH")
          : "-";
      return `
        <div class="modal-section modal-section-clickable" data-day-idx="${idx}">
          <div class="modal-section-header">
            <div class="modal-section-icon icon-calendar">📌</div>
            <div class="modal-section-header-text">
              <div class="modal-section-title">${ev.title}</div>
              <div class="modal-section-caption">${ev.org || "-"}</div>
            </div>
          </div>
          <div class="modal-section-grid">
            <div>
              <div class="modal-item-label">วันที่</div>
              <div class="modal-item-value">${fmt(ev.start)}</div>
            </div>
            <div>
              <div class="modal-item-label">สถานะ</div>
              <div class="modal-item-value">
                ${
                  ev.status === "closed"
                    ? "ปิดโครงการแล้ว"
                    : ev.status === "approved"
                    ? "อนุมัติโครงการแล้ว"
                    : "อยู่ระหว่างดำเนินการ"
                }
              </div>
            </div>
            <div>
              <div class="modal-item-label">หมายเหตุ</div>
              <div class="modal-item-value">${ev.note || "-"}</div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  bodyEl.innerHTML = cards;
  // คลิกการ์ดแต่ละรายการเพื่อเปิดรายละเอียดโครงการเดียว
  bodyEl.querySelectorAll("[data-day-idx]").forEach((card) => {
    const idx = Number(card.getAttribute("data-day-idx"));
    const ev = events[idx];
    if (!ev) return;
    card.addEventListener("click", () => openCalendarModal(ev));
  });
  modal.classList.add("show");
}

function closeCalendarModal() {
  const modal = document.getElementById("calendarModal");
  if (!modal) return;
  modal.classList.remove("show");
}

/**
 * initCalendar — เรียกหลังจาก loadProjectsFromSheet() เสร็จ
 */
function initCalendar() {
  const prevBtn = document.getElementById("prevMonthBtn");
  const nextBtn = document.getElementById("nextMonthBtn");
  const modal = document.getElementById("calendarModal");
  const modalClose = document.getElementById("calendarModalClose");

  // สร้าง events จาก projects
  buildCalendarEventsFromProjects();
  // ตั้งค่า filter
  initCalendarFilters();
  // วาดปฏิทินครั้งแรก
  generateCalendar();

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      generateCalendar();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      generateCalendar();
    });
  }

  ["calendarYearSelect", "calendarOrgSelect", "calendarStatusSelect"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", () => {
        generateCalendar();
      });
    }
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeCalendarModal);
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeCalendarModal();
      }
    });
  }
}
