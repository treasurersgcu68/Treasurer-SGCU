/* Data loading (Google Sheets + localStorage cache) */
async function loadProjectsFromSheet() {
  try {
    const cached = getCache(CACHE_KEYS.PROJECTS, CACHE_TTL_MS);
    if (cached && Array.isArray(cached) && cached.length) {
      projects = cached;
      hydrateProjectsCache(projects);
      console.log("[SGCU] ใช้ cache โครงการ (localStorage) - app.js:891");
      return;
    }

    console.log("[SGCU] โหลดข้อมูลโครงการจาก Google Sheets ... - app.js:895");
    const csvText = await fetchTextWithProgress(SHEET_CSV_URL, (ratio) => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("projects", ratio);
      }
    });

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
    console.error("โหลดข้อมูลจากชีตไม่ได้ ใช้ข้อมูลจำลองแทน - app.js:917", err);
    recordLoadError(
      "projects",
      "โหลดข้อมูลโครงการไม่สำเร็จ กำลังใช้ข้อมูลสำรอง",
      { showRetry: true, showLoader: true }
    );
    projects = getFallbackProjects();
  } finally {
    if (typeof markLoaderStep === "function") {
      markLoaderStep("projects");
    }
  }
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

// โหลดตัวเลือก filter จากชีตภายนอก: คอลัมน์ A = ประเภทองค์กร, คอลัมน์ B = ฝ่าย/ชมรม
async function loadOrgFilters() {
  try {
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
        name: (row[1] || "").toString().trim()
      }))
      .filter((r) => r.group !== "" && r.name !== "");
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
      renderHomeKpis();                           // KPI สำหรับ dashboard (staff)
    } catch (err) {
      console.error("โหลดข้อมูลหน้า Project Status ไม่สำเร็จ  ใช้ข้อมูลสำรองแทน - app.js:999", err);
      projects = getFallbackProjects();
      await loadOrgFilters();
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
  initCharts(ctxKey);                         // สร้างกราฟ Chart.js
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
