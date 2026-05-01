/* Data loading (Google Sheets + localStorage cache) */
function isPublishedHtmlSheetUrl(url) {
  return /\/pubhtml(?:$|[/?#])/i.test((url || "").toString());
}

function parsePublishedSheetRows(htmlText) {
  if (typeof DOMParser === "undefined") return [];
  const doc = new DOMParser().parseFromString(htmlText || "", "text/html");
  const table = doc.querySelector("table.waffle") || doc.querySelector("table");
  if (!table) return [];

  return Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.children)
      .filter((cell) => cell.tagName.toLowerCase() === "td")
      .flatMap((cell) => {
        const span = Math.max(parseInt(cell.getAttribute("colspan") || "1", 10), 1);
        const text = (cell.textContent || "").replace(/\u200b/g, "").trim();
        return Array(span).fill(text);
      })
  );
}

function parsePublishedSheetIndex(htmlText) {
  const source = (htmlText || "").toString();
  const sheets = [];
  const itemRe = /items\.push\(\{name:\s*"((?:\\.|[^"\\])*)",\s*pageUrl:\s*"((?:\\.|[^"\\])*)",\s*gid:\s*"([^"]+)"/g;
  let match;
  while ((match = itemRe.exec(source)) !== null) {
    try {
      sheets.push({
        name: JSON.parse(`"${match[1]}"`),
        pageUrl: JSON.parse(`"${match[2]}"`),
        gid: match[3]
      });
    } catch (_) {
      // Skip malformed sheet metadata and keep parsing the remaining tabs.
    }
  }
  return sheets;
}

function buildPublishedSheetUrl(baseUrl, gid) {
  const cleanBase = (baseUrl || "").toString().split("#")[0].split("?")[0].replace(/\/$/, "");
  return `${cleanBase}/sheet?headers=false&gid=${encodeURIComponent(gid)}`;
}

function normalizePublishedSheetUrl(url) {
  const value = (url || "")
    .toString()
    .replace(/\\u003d/g, "=")
    .replace(/\\x3d/g, "=")
    .replace(/\\\//g, "/");
  return value || "";
}

async function getPublishedHtmlWorkbookSheets(url, onProgress) {
  const indexHtml = await fetchTextWithProgress(url, (ratio) => {
    if (typeof onProgress === "function") onProgress(Math.min(ratio * 0.25, 0.25));
  });
  const sheets = parsePublishedSheetIndex(indexHtml);
  const projectSheet =
    sheets.find((sheet) => (sheet.name || "").trim() === "ตารางสถานะ") ||
    sheets[0] ||
    { gid: "1357605440", pageUrl: buildPublishedSheetUrl(url, "1357605440") };
  const contactSheet =
    sheets.find((sheet) => (sheet.name || "").trim().toUpperCase() === "CONTACT") ||
    { gid: "427464098", pageUrl: buildPublishedSheetUrl(url, "427464098") };

  return { projectSheet, contactSheet };
}

async function loadRowsFromPublishedHtmlWorkbook(url, onProgress) {
  const { projectSheet, contactSheet } = await getPublishedHtmlWorkbookSheets(url, onProgress);
  const projectUrl = normalizePublishedSheetUrl(projectSheet.pageUrl) || buildPublishedSheetUrl(url, projectSheet.gid);
  const contactUrl = normalizePublishedSheetUrl(contactSheet.pageUrl) || buildPublishedSheetUrl(url, contactSheet.gid);

  const projectHtml = await fetchTextWithProgress(projectUrl, (ratio) => {
    if (typeof onProgress === "function") onProgress(0.25 + Math.min(ratio * 0.55, 0.55));
  });
  const contactHtml = await fetchTextWithProgress(contactUrl, (ratio) => {
    if (typeof onProgress === "function") onProgress(0.8 + Math.min(ratio * 0.2, 0.2));
  });

  return {
    projectRows: parsePublishedSheetRows(projectHtml),
    contactRows: parsePublishedSheetRows(contactHtml)
  };
}

function applyProjectContactRows(contactRows) {
  if (!Array.isArray(contactRows) || contactRows.length < 2) return;

  const nextContacts = {};
  contactRows.slice(1).forEach((row) => {
    const position = (row[0] || "").toString().trim(); // ชีท 2 คอลัมน์ A
    const prefix = (row[1] || "").toString().trim();
    const first = (row[2] || "").toString().trim();
    const last = (row[3] || "").toString().trim();
    const nick = (row[4] || "").toString().trim(); // ชีท 2 คอลัมน์ E
    if (!nick) return;

    const contactInfo = {
      key: nick,
      fullName: [prefix, first, last].filter(Boolean).join(" ").trim(),
      nick,
      position,
      phone: (row[10] || "").toString().trim(), // ชีท 2 คอลัมน์ K
      line: (row[9] || "").toString().trim(), // ชีท 2 คอลัมน์ J
      faculty: (row[7] || "").toString().trim(),
      year: (row[6] || "").toString().trim(),
      email: (row[8] || "").toString().trim(),
      avatarUrl: ""
    };

    nextContacts[nick] = contactInfo;
    if (contactInfo.fullName) {
      nextContacts[contactInfo.fullName] = contactInfo;
    }
  });

  if (Object.keys(nextContacts).length) {
    assistantContactsByName = {
      ...assistantContactsByName,
      ...nextContacts
    };
  }
}

async function loadProjectContactsFromCsv(url) {
  const contactUrl = (url || "").toString().trim();
  if (!contactUrl) return;
  await window.sgcuVendorLoader?.ensurePapa?.();
  const csvText = await fetchTextWithProgress(contactUrl);
  const parsed = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: false
  });
  applyProjectContactRows(parsed.data || []);
}

async function loadProjectsFromSheet() {
  try {
    const isPublishedHtml = isPublishedHtmlSheetUrl(SHEET_CSV_URL);
    const cached = getCache(CACHE_KEYS.PROJECTS, CACHE_TTL_MS);
    if (cached && Array.isArray(cached) && cached.length) {
      projects = cached;
      hydrateProjectsCache(projects);
      if (isPublishedHtml) {
        try {
          await loadProjectContactsFromPublishedHtml(SHEET_CSV_URL);
        } catch (err) {
          console.error("โหลดข้อมูลติดต่อจากชีตโครงการไม่สำเร็จ - app.data.js", err);
        }
      } else if (PROJECT_CONTACTS_CSV_URL) {
        try {
          await loadProjectContactsFromCsv(PROJECT_CONTACTS_CSV_URL);
        } catch (err) {
          console.error("โหลดข้อมูลติดต่อจากชีต 2 ไม่สำเร็จ - app.data.js", err);
        }
      }
      console.log("[SGCU] ใช้ cache โครงการ (localStorage) - app.js:891");
      const cacheTs = getCacheTimestamp(CACHE_KEYS.PROJECTS);
      updateProjectsLastUpdatedDisplay(cacheTs || "ใช้ข้อมูลแคช");
      return;
    }

    console.log("[SGCU] โหลดข้อมูลโครงการจาก Google Sheets ... - app.js:895");
    let rows = [];
    if (isPublishedHtml) {
      const workbookRows = await loadRowsFromPublishedHtmlWorkbook(SHEET_CSV_URL, (ratio) => {
        if (typeof updateLoaderProgress === "function") {
          updateLoaderProgress("projects", ratio);
        }
      });
      rows = workbookRows.projectRows;
      applyProjectContactRows(workbookRows.contactRows);
    } else {
      await window.sgcuVendorLoader?.ensurePapa?.();
      const csvText = await fetchTextWithProgress(SHEET_CSV_URL, (ratio) => {
        if (typeof updateLoaderProgress === "function") {
          updateLoaderProgress("projects", ratio);
        }
      });

      const parsed = Papa.parse(csvText, {
        header: false,
        skipEmptyLines: false
      });
      rows = parsed.data;
      try {
        await loadProjectContactsFromCsv(PROJECT_CONTACTS_CSV_URL);
      } catch (err) {
        console.error("โหลดข้อมูลติดต่อจากชีท 2 ไม่สำเร็จ - app.data.js", err);
      }
    }

    if (!rows || rows.length < 2) {
      projects = getFallbackProjects();
    } else {
      const headerRow = rows[1] || [];
      const dataRows = rows.slice(2);
      projects = extractProjectsFromRows(dataRows, headerRow);
    }
    setCache(CACHE_KEYS.PROJECTS, projects);
    updateProjectsLastUpdatedDisplay(Date.now());
  } catch (err) {
    console.error("โหลดข้อมูลจากชีตไม่ได้ ใช้ข้อมูลจำลองแทน - app.js:917", err);
    recordLoadError(
      "projects",
      "โหลดข้อมูลโครงการไม่สำเร็จ กำลังใช้ข้อมูลสำรอง",
      { showRetry: true, showLoader: true }
    );
    updateProjectsLastUpdatedDisplay("ไม่สามารถอัปเดตได้");
    projects = getFallbackProjects();
  } finally {
    if (typeof markLoaderStep === "function") {
      markLoaderStep("projects");
    }
  }
}

async function loadProjectContactsFromPublishedHtml(url) {
  const { contactSheet } = await getPublishedHtmlWorkbookSheets(url);
  const contactUrl = normalizePublishedSheetUrl(contactSheet.pageUrl) || buildPublishedSheetUrl(url, contactSheet.gid);
  const contactHtml = await fetchTextWithProgress(contactUrl);
  const rows = parsePublishedSheetRows(contactHtml);
  applyProjectContactRows(rows);
}

function hydrateProjectsCache(list) {
  if (!Array.isArray(list)) return;
  list.forEach((p) => {
    if (!p || typeof p !== "object") return;
    let lastDate = p.lastWorkDateObj;
    if (!(lastDate instanceof Date) || isNaN(lastDate.getTime())) {
      lastDate = parseProjectDate(lastDate || p.lastWorkDate);
      p.lastWorkDateObj = lastDate;
    }

    let closeDate = p.closeDueDateObj;
    if (!(closeDate instanceof Date) || isNaN(closeDate.getTime())) {
      closeDate = parseProjectDate(closeDate || p.closeDueDate);
      p.closeDueDateObj = closeDate;
    }

    if (!p.searchText) {
      p.searchText = [
        p.code,
        p.name,
        p.orgName,
        p.orgGroup,
        p.statusMain,
        p.status
      ]
        .map((v) => (v || "").toString().toLowerCase())
        .join(" ");
    }
  });
}

// โหลดตัวเลือก filter จากชีตภายนอก: คอลัมน์ A = ประเภทองค์กร, คอลัมน์ B = ฝ่าย/ชมรม, คอลัมน์ C = รหัสองค์กร
async function loadOrgFilters() {
  try {
    const cached = getCache(CACHE_KEYS.ORG_FILTERS, CACHE_TTL_MS);
    if (cached && Array.isArray(cached) && cached.length) {
      const hasOrgCode = cached.some((item) =>
        (item?.code || "").toString().trim() !== ""
      );
      if (hasOrgCode) {
        orgFilters = cached;
        return;
      }
    }

    await window.sgcuVendorLoader?.ensurePapa?.();
    const csvText = await fetchTextWithProgress(ORG_FILTER_CSV_URL, (ratio) => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("orgFilters", ratio);
      }
    });

    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true
    });

    const rows = parsed.data || [];
    const dataRows = rows.slice(1); // เริ่มจากแถวที่ 2 ของชีต

    orgFilters = dataRows
      .map((row) => ({
        group: (row[0] || "").toString().trim(),
        name: (row[1] || "").toString().trim(),
        code: (row[2] || "").toString().trim().toUpperCase()
      }))
      .filter((r) => r.group !== "" && r.name !== "");

    setCache(CACHE_KEYS.ORG_FILTERS, orgFilters);
  } catch (err) {
    console.error("โหลด org filter ไม่สำเร็จ ใช้ข้อมูลจาก projects แทน - app.js:955", err);
    recordLoadError(
      "orgFilters",
      "โหลดตัวเลือกฝ่าย/ชมรมไม่สำเร็จ กำลังใช้ข้อมูลจากโครงการ",
      { showRetry: true }
    );
    orgFilters = [];
  } finally {
    if (typeof markLoaderStep === "function") {
      markLoaderStep("orgFilters");
    }
  }
}

function shouldLoadProjectDataForPage(page) {
  return ["project-status", "project-status-staff", "dashboard-staff"].includes(page);
}

async function ensureProjectDataLoaded() {
  if (projectsLoaded) return;
  if (projectsLoadPromise) return projectsLoadPromise;

  projectsLoadPromise = (async () => {
    setLoading(true, "public");
    setLoading(true, "staff");
    try {
      await loadProjectsFromSheet();              // ดึงข้อมูลจาก SHEET_CSV_URL
      if (!projects || projects.length === 0) {   // กันกรณีโหลดไม่ได้/ข้อมูลว่าง
        projects = getFallbackProjects();
      }

      await loadOrgFilters();                     // โหลดตัวเลือก filter ประเภท/ฝ่าย
      await window.sgcuVendorLoader?.ensureChart?.();
      renderHomeKpis();                           // KPI สำหรับ dashboard (staff)
    } catch (err) {
      console.error("โหลดข้อมูลหน้า Project Status ไม่สำเร็จ  ใช้ข้อมูลสำรองแทน - app.js:999", err);
      projects = getFallbackProjects();
      await loadOrgFilters();
      await window.sgcuVendorLoader?.ensureChart?.();
      renderHomeKpis();
    } finally {
      setLoading(false, "public");
      setLoading(false, "staff");
      projectsLoaded = true;
    }
  })();

  return projectsLoadPromise;
}

function ensureProjectStatusInitialized(ctxKey = activeProjectStatusContext) {
  const ctx = projectStatusContexts[ctxKey];
  if (!ctx || ctx.isInitialized) return;

  setActiveProjectStatusContext(ctxKey);
  initOrgTypeOptions();                       // เติม options ประเภทองค์กร
  initOrgOptions();                           // เติมรายชื่อองค์กร
  if (typeof Chart !== "undefined") {
    initCharts(ctxKey);                       // สร้างกราฟ Chart.js
  }
  initCalendar(ctxKey);                       // สร้างปฏิทินจาก projects (ใช้วันที่คอลัมน์ M แล้ว)
  ctx.isInitialized = true;
}

function getFallbackProjects() {
  const fallback = [
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

  fallback.forEach((p) => {
    p.lastWorkDateObj = parseProjectDate(p.lastWorkDate);
    p.closeDueDateObj = parseProjectDate(p.closeDueDate);
    p.searchText = [
      p.code,
      p.name,
      p.orgName,
      p.orgGroup,
      p.statusMain,
      p.status
    ]
      .map((v) => (v || "").toString().toLowerCase())
      .join(" ");
  });

  return fallback;
}
