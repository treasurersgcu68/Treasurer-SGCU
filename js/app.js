/* 1) CONFIG */
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSfcEartu_DeoGQXOJ7_rYPGizNtDhYJEaXivywadNZibj1rch9WKC1GF1yNbZ3zRgQ4Efjj8jrTOrf/pub?output=csv";

const ORG_SHEET_CSV =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS13cn7ANONHSbu5D2SS3ymR25MmtZE9OMnF6K7PHEIDRgfZa926v4C1AcqQXrV7NjlzwyWuT2jtFpH/pub?output=csv";

const DOWNLOAD_SHEET =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTburYaUshqF-DOvbwOEinWik0KXNwqqJLfO6frlxUn1iEsLu5RzkNoum4KgnWeSwBdo4--B1eScRD5/pub?output=csv";

/* cache สำหรับข้อมูลโครงการจาก Google Sheets */
const SHEET_CACHE_KEY = "sgcu_projects_cache_v1";
const SHEET_CACHE_TTL_MS = 1000 * 60 * 15; // อายุ cache 15 นาที

/* 2) Globals */
let projects = [];

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
let budgetByMonthChart;
let statusPieChart;
let projectModalEl;
let budgetChartSkeletonEl;
let statusPieSkeletonEl;
let projectTableSkeletonEl;
let projectModalTitleEl;
let projectModalTitleBadgeEl;
let projectModalHeaderRowEl;
let projectModalBodyEl;
let projectModalCloseEl;
let currentSort = { key: null, direction: "asc" };
let assistantContactsByName = {};

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
  // 1) ลองอ่านจาก localStorage ก่อน
  try {
    const cachedRaw = localStorage.getItem(SHEET_CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (
        cached &&
        Array.isArray(cached.projects) &&
        typeof cached.timestamp === "number"
      ) {
        const age = Date.now() - cached.timestamp;
        if (age >= 0 && age <= SHEET_CACHE_TTL_MS) {
          // cache ยังไม่หมดอายุ → ใช้เลย
          projects = cached.projects;
          console.log(
            "[SGCU] ใช้ข้อมูลโครงการจาก localStorage cache (อายุ",
            Math.round(age / 1000),
            "วินาที)"
          );
          return;
        }
      }
    }
  } catch (e) {
    console.warn("[SGCU] อ่าน cache จาก localStorage ไม่ได้ / format ผิด - app.js:350", e);
  }

  // 2) ถ้าไม่มี cache หรือ cache หมดอายุ → ดึงจาก Google Sheets ตามปกติ
  try {
    console.log("[SGCU] โหลดข้อมูลโครงการจาก Google Sheets ... - app.js:355");
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

    // 3) เซฟลง localStorage เพื่อใช้ในรอบต่อไป
    try {
      const payload = {
        timestamp: Date.now(),
        projects
      };
      localStorage.setItem(SHEET_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("[SGCU] เซฟ cache ลง localStorage ไม่ได้ - app.js:381", e);
    }
  } catch (err) {
    console.error(
      "โหลดข้อมูลจากชีตไม่ได้ ใช้ข้อมูลจำลองแทน",
      err
    );
    projects = getFallbackProjects();
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
      budget: 1649.65
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
      budget: 114493
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
      budget: 95398.6
    }
  ];
}

/* 6) Filter + Summary + Table */
function initOrgTypeOptions() {
  while (orgTypeSelect.options.length > 1) {
    orgTypeSelect.remove(1);
  }
  const groups = Array.from(new Set(projects.map((p) => p.orgGroup).filter(Boolean)));
  groups.sort();
  groups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    orgTypeSelect.appendChild(opt);
  });
}

function initOrgOptions() {
  while (orgSelect.options.length > 1) {
    orgSelect.remove(1);
  }
  const selectedGroup = orgTypeSelect.value;
  const filteredForOrg = projects.filter((p) =>
    selectedGroup === "all" ? true : p.orgGroup === selectedGroup
  );
  const orgNames = Array.from(new Set(filteredForOrg.map((p) => p.orgName).filter(Boolean)));
  orgNames.sort();
  orgNames.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    orgSelect.appendChild(opt);
  });
}

function filterProjects() {
  const year = yearSelect.value;
  const orgGroup = orgTypeSelect.value;
  const org = orgSelect.value;

  return projects.filter((p) => {
    const yearMatch = year === "all" || p.year === year;
    const groupMatch = orgGroup === "all" || p.orgGroup === orgGroup;
    const orgMatch = org === "all" || p.orgName === org;
    return yearMatch && groupMatch && orgMatch;
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

  totalProjectsEl.textContent = total;
  pendingProjectsEl.textContent = pending;
  approvedProjectsEl.textContent = approved;
  closedProjectsEl.textContent = closed;
  totalBudgetEl.textContent = totalBudget.toLocaleString("th-TH");

  const homeTotal = document.getElementById("homeTotalProjects");
  const homeApproved = document.getElementById("homeApprovedProjects");
  const homePending = document.getElementById("homePendingProjects");
  if (homeTotal)   homeTotal.textContent = total;
  if (homeApproved) homeApproved.textContent = approved;
  if (homePending) homePending.textContent = pending;
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
      <td>${p.code || ""}</td>
      <td>${p.name || ""}</td>
      <td>${p.orgName || ""}</td>
      <td style="text-align:center;">${p.year || ""}</td>
      <td style="text-align:center;">${statusBadge}</td>
      <td style="text-align:right; ${budgetColor}">${budgetText}</td>
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

  // สร้าง HTML สำหรับ "ผู้สอบตรวจสอบเอกสาร"
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
      // ถ้าไม่มี contact map ให้แสดงชื่อเฉย ๆ
      closeCheckerHtml = closeChecker;
    }
  }


  const html = `
    <div class="modal-sections">
      <!-- 1) ข้อมูลโครงการ -->
      <section class="modal-section">
        <div class="modal-section-title">
          <span class="icon">📁</span> ข้อมูลโครงการ
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

      <!-- 2) อนุมัติ -->
      <section class="modal-section">
        <div class="modal-section-title">
          <span class="icon">✅</span> อนุมัติ
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

      <!-- 3) โอนงบประมาณ -->
      <section class="modal-section">
        <div class="modal-section-title">
          <span class="icon">💸</span> โอนงบประมาณ
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

      <!-- 4) ยืมรองจ่าย -->
      <section class="modal-section">
        <div class="modal-section-title">
          <span class="icon">🧾</span> ยืมรองจ่าย
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

      <!-- 5) ส่งปิดโครงการ -->
      <section class="modal-section">
        <div class="modal-section-title">
          <span class="icon">📚</span> ส่งปิดโครงการ
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

  // ติด event toggle ให้ลิงก์ผู้ช่วยเหรัญญิก
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

function updateClosureStatusChart(filtered) {
  if (!budgetByMonthChart) return;

  const approvedProjects = filtered.filter(
    (p) => (p.statusMain || "").trim() === "อนุมัติโครงการ"
  );

  const orgGroupFilter = orgTypeSelect.value;
  const orgFilter = orgSelect.value;
  const isGlobalView = orgGroupFilter === "all" && orgFilter === "all";

  if (isGlobalView) {
    const baseGroups = [
      "ชมรมฝ่ายศิลปะและวัฒนธรรม",
      "ชมรมฝ่ายวิชาการ",
      "ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์",
      "ชมรมฝ่ายกีฬา",
      "องค์การบริหารสโมสรนิสิต",
      "สภานิสิต",
      "องค์การบริหารสโมสรนิสิต, สภานิสิต"
    ];

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

  const groups = {};
  approvedProjects.forEach((p) => {
    const org = p.orgName || "(ไม่ระบุ)";
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
  const orgGroupFilter = orgTypeSelect.value;
  const orgFilter = orgSelect.value;

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

  const baseGroups = [
    "ชมรมฝ่ายศิลปะและวัฒนธรรม",
    "ชมรมฝ่ายวิชาการ",
    "ชมรมฝ่ายพัฒนาสังคมและบำเพ็ญประโยชน์",
    "ชมรมฝ่ายกีฬา",
    "องค์การบริหารสโมสรนิสิต",
    "สภานิสิต",
    "องค์การบริหารสโมสรนิสิต, สภานิสิต"
  ];

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
    const budgetByClub = {};

    baseApprovedProjects
      .filter((p) => p.orgGroup === orgGroupFilter)
      .forEach((p) => {
        const name = p.orgName || "(ไม่ระบุ)";
        budgetByClub[name] = (budgetByClub[name] || 0) + (p.budget || 0);
      });

    labels = Object.keys(budgetByClub);
    data = labels.map((l) => budgetByClub[l]);
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

    const selectedOrgProject = projects.find((p) => p.orgName === orgFilter);
    const selectedOrgGroup = selectedOrgProject ? selectedOrgProject.orgGroup : null;
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

  totalEl.textContent = total;
  approvedEl.textContent = approved;
  pendingEl.textContent = pending;
}

function refreshProjectStatus() {
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

  // ★ อัปเดต Hero บนหน้า Home
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

  if (budgetCanvas) {
    budgetCanvas.style.visibility = isLoading ? "hidden" : "visible";
  }
  if (statusCanvas) {
    statusCanvas.style.visibility = isLoading ? "hidden" : "visible";
  }
  if (tableBodyEl) {
    tableBodyEl.style.visibility = isLoading ? "hidden" : "visible";
  }
}

/* 11) Org Structure (About Page) */
async function loadOrgStructure() {
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
    console.error("ERROR: โหลดข้อมูลโครงสร้างองค์กรไม่ได้ - app.js:1654", err);
    const el = document.getElementById("org-structure-content");
    if (el) {
      el.innerHTML = `<p style="color:#dc2626;">ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้</p>`;
    }
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
  const COL_NICK   = 7;   // (คอลัมน์ H) ใช้เป็น key สำหรับ contact
  const COL_LINE   = 12;
  const COL_PHONE  = 13;
  const COL_PHOTO  = 26;  // ชื่อไฟล์รูป หรือ URL

  const COL_ASSISTANT_KEY = COL_NICK; // ใช้ H เป็น key

  const SLOT = {
    R1C1: "เลขานุการฝ่ายเหรัญญิก",
    R1C2: "ประธานฝ่ายบริหารและพัฒนางบประมาณ",
    R1C3: "ประธานฝ่ายหาทุนและสิทธิประโยชน์",
    R1C4: "ประธานฝ่ายกายภาพและพัสดุ",

    R2C1: "เลขานุการฝ่ายเหรัญญิก",
    R2C2: "รองประธานฝ่ายบริหารและพัฒนางบประมาณ",
    R2C3: "รองประธานฝ่ายหาทุนและสิทธิประโยชน์",
    R2C4: "ประธานฝ่ายกายภาพและพัสดุ",

    R3C3: "รองประธานฝ่ายหาทุนและสิทธิประโยชน์"
  };

  const MAIN_POSITION = "เหรัญญิก";

  const fullName = (r) =>
    [r[COL_PREFIX], r[COL_FIRST], r[COL_LAST]].filter(Boolean).join(" ");

  const nickName = (r) => (r[COL_NICK] ? `(${r[COL_NICK]})` : "");

  const initials = (r) => {
    const f = (r[COL_FIRST] || "").charAt(0);
    const l = (r[COL_LAST] || "").charAt(0);
    return (f + l).toUpperCase();
  };

  const contactBlock = (r) => {
    let html = `<div class="org-contact">`;
    if (r[COL_PHONE]) {
      html += `<div class="org-contact-row">
        <span class="org-contact-label">โทร.</span>
        <a class="org-contact-text" href="tel:${r[COL_PHONE]}">${r[COL_PHONE]}</a>
      </div>`;
    }
    if (r[COL_LINE]) {
      html += `<div class="org-contact-row">
        <span class="org-contact-label">LINE</span>
        <span class="org-contact-text">${r[COL_LINE]}</span>
      </div>`;
    }
    html += `</div>`;
    return html;
  };

  // ====== สร้าง URL รูปจากค่าคอลัมน์รูป ======
  const AVATAR_BASE_PATH = "img/org/";  // relative จาก index.html

  function buildAvatarUrlFromCell(raw) {
    if (!raw) return "";

    let val = raw.toString().trim();
    if (!val) return "";

    // เคสเป็น URL (http/https)
    if (/^https?:\/\//i.test(val)) {
      // รองรับ Google Drive แบบ /file/d/.../view และ ?id=...
      const mFile = val.match(/https:\/\/drive\.google\.com\/file\/d\/([^/]+)\//);
      if (mFile && mFile[1]) {
        return `https://drive.google.com/uc?export=view&id=${mFile[1]}`;
      }
      const mId = val.match(/[?&]id=([^&]+)/);
      if (mId && mId[1]) {
        return `https://drive.google.com/uc?export=view&id=${mId[1]}`;
      }
      // URL อื่น ๆ ใช้ตรง ๆ
      return val;
    }

    // เคสเป็นชื่อไฟล์โลคัล เช่น "10", "10.jpg", "10.01.01-002.jpg"
    // ตัด whitespace แปลก ๆ
    val = val.replace(/\s+/g, "");

    // ถ้าไม่มีจุดเลย (ไม่มีนามสกุลไฟล์) → เติม .jpg ให้
    if (!val.includes(".")) {
      val = `${val}.jpg`;
    }

    return `${AVATAR_BASE_PATH}${val}`;
  }

  const avatarHTML = (r, size = "lg") => {
    const rawPhoto = r[COL_PHOTO];
    const url = buildAvatarUrlFromCell(rawPhoto);
    const baseClass = size === "sm" ? "org-avatar-sm" : "org-avatar";

    if (url) {
      return `
        <div class="${baseClass}">
          <img src="${url}" alt="${fullName(r)}" class="org-avatar-img" loading="lazy">
        </div>
      `;
    }

    // ถ้าไม่มีรูป → fallback เป็น initial
    return `<div class="${baseClass}">${initials(r)}</div>`;
  };

  // ====== สร้าง map จาก "ค่าคอลัมน์ H" → contact (ทุกตำแหน่ง) ======
  assistantContactsByName = {};   // reset global map

  const peopleByPos = {};
  for (const r of dataRows) {
    const pos = (r[COL_POS] || "").trim();
    if (!pos) continue;

    // ใครก็ตามที่มีค่าในคอลัมน์ H ให้ map ไว้ใช้เป็น contact
    const key = (r[COL_ASSISTANT_KEY] || "").toString().trim();
    if (key) {
      assistantContactsByName[key] = {
        key,
        fullName: fullName(r),
        position: pos,
        phone: (r[COL_PHONE] || "").toString().trim(),
        line: (r[COL_LINE] || "").toString().trim()
      };
    }

    if (!peopleByPos[pos]) peopleByPos[pos] = [];
    peopleByPos[pos].push(r);
  }

  // ====== เริ่มประกอบ HTML แสดงโครงสร้าง ======
  let html = ``;

  const main = peopleByPos[MAIN_POSITION]?.[0];
  if (main) {
    html += `
      <section class="org-main-section">
        <article class="org-main-card">
          ${avatarHTML(main, "lg")}
          <div>
            <div class="org-main-position">${MAIN_POSITION}</div>
            <div class="org-main-name">
              ${fullName(main)}
              <span class="org-main-nickname-inline">${nickName(main)}</span>
            </div>
            ${contactBlock(main)}
          </div>
        </article>
      </section>
    `;
  }

  html += `<div class="org-grid-4">`;

  const GRID_ORDER = [
    "R1C1","R1C2","R1C3","R1C4",
    "R2C1","R2C2","R2C3","R2C4",
    "BLANK","BLANK","R3C3","BLANK"
  ];

  for (const slot of GRID_ORDER) {
    if (slot === "BLANK") {
      html += `<div></div>`;
      continue;
    }

    const posName = SLOT[slot];
    const items = peopleByPos[posName] || [];

    if (items.length === 0) {
      html += `<div></div>`;
      continue;
    }

    const person = items.shift();

    // รายชื่อ Position ที่ต้องเป็นสี Highlight
    const HIGHLIGHT_POS = new Set([
      "ประธานฝ่ายบริหารและพัฒนางบประมาณ",
      "ประธานฝ่ายหาทุนและสิทธิประโยชน์",
      "ประธานฝ่ายกายภาพและพัสดุ"
    ]);

    const isHighlight = HIGHLIGHT_POS.has(posName);

    html += `
      <article class="org-card ${isHighlight ? "org-card-highlight" : ""}">
        ${avatarHTML(person, "sm")}
        <div>
          <div class="org-card-position">${posName}</div>
          <div class="org-card-name">
            ${fullName(person)}
            <span class="org-card-nickname-inline">${nickName(person)}</span>
          </div>
          ${contactBlock(person)}
        </div>
      </article>
    `;
  }

  html += `</div>`;

  container.innerHTML = html;
}

function buildAvatarUrlFromCell(raw) {
  if (!raw) return "";

  let val = raw.toString().trim();

  // เคสเป็น URL → ใช้ตามเดิม
  if (/^https?:\/\//i.test(val)) return val;

  // ตัด space แปลก ๆ
  val = val.replace(/\s+/g, "");

  // ถ้าไม่มี .jpg → เติมให้
  if (!val.includes(".")) {
    val += ".jpg";
  }

  return `${AVATAR_BASE_PATH}${val}`;
}

const AVATAR_BASE_PATH = "img/org/"; // ชี้เข้าโฟลเดอร์

const avatarHTML = (r, size = "lg") => {
  const photoFile = (r[COL_PHOTO] || "").toString().trim();
  const baseClass = size === "sm" ? "org-avatar-sm" : "org-avatar";

  if (photoFile) {
    const url = `${AVATAR_BASE_PATH}${photoFile}`; // => "img/org/10.jpg"
    return `
      <div class="${baseClass}">
        <img src="${url}" alt="${fullName(r)}" class="org-avatar-img" loading="lazy">
      </div>
    `;
  }
  return `<div class="${baseClass}">${initials(r)}</div>`;
};


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
    const res = await fetch(DOWNLOAD_SHEET);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
    const rows = parsed.data;

    // เคลียร์ก่อน
    listEl.innerHTML = "";

    if (!rows || rows.length < 2) return;

    // โครงสร้างกลุ่มหมวดหมู่
    const categories = {};

    rows.slice(1).forEach(row => {
      const name      = (row[0] || "").trim();            // A ชื่อเอกสาร
      const desc      = (row[1] || "").trim();            // B รายละเอียด
      const org       = (row[2] || "").trim();            // C องค์กร
      const exUrl     = (row[3] || "").trim();            // D EX URL
      const pdfUrl    = (row[4] || "").trim();            // E PDF URL
      const docxUrl   = (row[5] || "").trim();            // F DOCX URL
      const xlsxUrl   = (row[6] || "").trim();            // G XLSX URL
      const category  = (row[7] || "").trim() || "อื่น ๆ";  // H หมวดหมู่

      if (!name) return;

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push({
        name, desc, org, exUrl, pdfUrl, docxUrl, xlsxUrl
      });
    });

    // Render ออกหน้าเว็บ
    for (const categoryName in categories) {
      // ชื่อหมวด
      const categoryHeader = document.createElement("h3");
      categoryHeader.className = "download-category";
      categoryHeader.textContent = categoryName;

      // รายการในหมวดนี้
      const ul = document.createElement("ul");
      ul.className = "download-list";

      categories[categoryName].forEach(doc => {
        const li = document.createElement("li");
        li.className = "download-item";

        li.innerHTML = `
          <div class="download-main">
            <div class="download-title">${doc.name}</div>
            <div class="download-desc">
              ${doc.desc ? `${doc.desc}<br>` : ""}
              ${doc.org ? `เอกสารสำหรับ: <strong>${doc.org}</strong>` : ""}
            </div>
          </div>

          <!-- แบบตัวอักษรเรียงขวา -->
          <div class="download-inline"></div>

          <!-- ปุ่มแบบเดิม (อยู่ด้านล่าง) -->
          <div class="download-buttons"></div>
        `;

        const btnWrap = li.querySelector(".download-buttons");

        addDownloadButton(btnWrap, "EX",   doc.exUrl);
        addDownloadButton(btnWrap, "PDF",  doc.pdfUrl);
        addDownloadButton(btnWrap, "DOCX", doc.docxUrl);
        addDownloadButton(btnWrap, "XLSX", doc.xlsxUrl);

        ul.appendChild(li);
      });

      listEl.appendChild(categoryHeader);
      listEl.appendChild(ul);
    }

  } catch (err) {
    console.error("โหลดชีตดาวน์โหลดเอกสารไม่ได้ - app.js:2018", err);
    listEl.innerHTML = `<div style="color:#dc2626;">ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้</div>`;
  }
}

/* 12) Init */
window.addEventListener("load", async () => {
  // ===== 1) เก็บ DOM element ที่ใช้ซ้ำ =====
  yearSelect = document.getElementById("yearSelect");
  orgTypeSelect = document.getElementById("orgTypeSelect");
  orgSelect = document.getElementById("orgSelect");
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

  // ===== 2) โหลดรายการดาวน์โหลดเอกสาร =====
  await loadDownloadDocuments();

  // ===== 3) ตั้งปีใน footer =====
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }

  // ===== 4) ระบบสลับหน้าแบบ SPA =====
  const navLinks = document.querySelectorAll("header nav a[data-page]");
  const pageViews = document.querySelectorAll(".page-view");

  function switchPage(page) {
    // สลับเนื้อหา
    pageViews.forEach((section) => {
      section.classList.toggle("active", section.dataset.page === page);
    });
    // สลับ active บนเมนู
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.page === page);
    });
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
    if (e.key === "Escape") closeProjectModal();
  });

  // ===== 6) โหลดข้อมูลโครงการ + Dashboard + Calendar =====
  setLoading(true);

  await loadProjectsFromSheet();    // ดึงข้อมูลจาก SHEET_CSV_URL (ปี 2568 ตามที่ fix ไว้)
  initOrgTypeOptions();             // เติม options ประเภทองค์กร
  initOrgOptions();                 // เติมรายชื่อองค์กร
  initCharts();                     // สร้างกราฟ Chart.js
  refreshProjectStatus();           // อัปเดตการ์ดสรุป + ตาราง + กราฟสถานะปิดโครงการ
  initCalendar();                   // สร้างปฏิทินจาก projects (ใช้วันที่คอลัมน์ M แล้ว)

  setLoading(false);

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

  // ลองให้ Date แปลงตรง ๆ ก่อน (กรณีเป็นรูปแบบ ISO หรือที่ JS อ่านได้)
  const direct = new Date(s);
  if (!isNaN(direct.getTime())) return direct;

  // ลองรูปแบบ dd/mm/yyyy
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
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
        note: `รหัสโครงการ: ${p.code || "-"}`
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
  const panel = document.querySelector('[data-page="calendar"] .panel-header .panel-title');
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
    const todaysEvents = getEventsForDate(thisDate);

    todaysEvents.forEach((ev) => {
      const evDiv = document.createElement("div");
      evDiv.className = `calendar-event ${ev.status}`;
      evDiv.textContent = ev.title;
      evDiv.title = ev.title;

      evDiv.addEventListener("click", () => openCalendarModal(ev));

      cell.appendChild(evDiv);
    });

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