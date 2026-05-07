/* Staff content management: Firestore-backed news editor */
function initContentManagementStaffPage() {
  const activePage = document.querySelector(".page-view.active")?.dataset?.page || "";
  const hashPage = (window.location.hash || "").replace("#", "");
  const activeContentPage = activePage.startsWith("content-") ? activePage : hashPage;

  document.querySelectorAll("[data-content-target-page]").forEach((button) => {
    if (button.dataset.contentNavReady === "true") return;
    button.dataset.contentNavReady = "true";
    button.addEventListener("click", () => {
      const page = button.dataset.contentTargetPage || "";
      if (!page) return;
      window.location.hash = `#${page}`;
    });
  });

  if (activeContentPage === "content-documents-staff") {
    initContentDocumentsStaffPage();
    return;
  }

  if (activeContentPage !== "content-news-staff") return;

  const pageEl = document.querySelector('.page-view[data-page="content-news-staff"]');
  if (!pageEl || pageEl.dataset.contentManagementReady === "true") return;

  const form = document.getElementById("contentNewsForm");
  const tableBody = document.getElementById("contentNewsTableBody");
  const tableCaption = document.getElementById("contentNewsTableCaption");
  const messageEl = document.getElementById("contentNewsMessage");
  const formMessageEl = document.getElementById("contentNewsFormMessage");
  if (!form || !tableBody || !tableCaption) return;

  pageEl.dataset.contentManagementReady = "true";

  const appConfig = typeof SGCU_APP_CONFIG === "object" && SGCU_APP_CONFIG ? SGCU_APP_CONFIG : {};
  const NEWS_COLLECTION = appConfig.firestore?.collections?.newsItems || "newsItems";
  const NEWS_CACHE_KEY = appConfig.cache?.keys?.NEWS || "sgcu_cache_news";
  const store = () => window.sgcuFirestore || {};
  const auth = () => window.sgcuAuth?.auth || null;

  const fields = {
    id: document.getElementById("contentNewsId"),
    title: document.getElementById("contentNewsTitle"),
    date: document.getElementById("contentNewsDate"),
    academicYear: document.getElementById("contentNewsAcademicYear"),
    category: document.getElementById("contentNewsCategory"),
    audience: document.getElementById("contentNewsAudience"),
    expireDate: document.getElementById("contentNewsExpireDate"),
    previewUrl: document.getElementById("contentNewsPreviewUrl"),
    summary: document.getElementById("contentNewsSummary"),
    status: document.getElementById("contentNewsStatus"),
    pinned: document.getElementById("contentNewsPinned")
  };

  const buttons = {
    refresh: document.getElementById("contentNewsRefreshBtn"),
    exportCsv: document.getElementById("contentNewsExportBtn"),
    importCsv: document.getElementById("contentNewsImportBtn"),
    importFile: document.getElementById("contentNewsImportFile"),
    createNew: document.getElementById("contentNewsNewBtn"),
    archive: document.getElementById("contentNewsArchiveBtn"),
    reset: document.getElementById("contentNewsResetBtn")
  };

  const filters = {
    query: document.getElementById("contentNewsSearchInput"),
    status: document.getElementById("contentNewsStatusFilter"),
    category: document.getElementById("contentNewsCategoryFilter"),
    audience: document.getElementById("contentNewsAudienceFilter"),
    reset: document.getElementById("contentNewsFilterReset")
  };

  const state = {
    items: [],
    source: "sheets",
    listStatus: "",
    filters: {
      query: "",
      status: "all",
      category: "all",
      audience: "all"
    },
    isLoading: false,
    isSaving: false
  };

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");

  const setMessage = (text, type = "") => {
    [messageEl, formMessageEl].forEach((el) => {
      if (!el) return;
      el.textContent = text || "";
      el.dataset.state = type || "";
    });
  };

  const normalizeDateValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
    if (typeof value.toDate === "function") {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "";
    }
    return "";
  };

  const normalizeNewsDoc = (docSnap) => {
    const data = docSnap.data() || {};
    return {
      id: docSnap.id,
      title: (data.title || "").toString(),
      summary: (data.summary || "").toString(),
      date: normalizeDateValue(data.date || data.publishedAt || data.createdAt),
      academicYear: (data.academicYear || data.year || "").toString(),
      category: (data.category || "").toString(),
      audience: (data.audience || "").toString(),
      previewUrl: (data.previewUrl || data.url || "").toString(),
      expireDate: normalizeDateValue(data.expireDate),
      pinned: data.pinned === true,
      status: (data.status || "published").toString()
    };
  };

  const sortItems = (items) =>
    items.sort((a, b) => {
      if ((b.pinned ? 1 : 0) !== (a.pinned ? 1 : 0)) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      return (b.date || "").localeCompare(a.date || "");
    });

  const slugify = (value) => {
    const base = (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[^a-z0-9ก-๙]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72);
    return base || `news-${Date.now()}`;
  };

  const isTruthyCsvValue = (value) => {
    const normalized = (value || "").toString().trim().toLowerCase();
    return ["true", "yes", "y", "1", "ใช่", "ปักหมุด", "pin", "pinned"].includes(normalized);
  };

  const clearNewsCache = () => {
    try {
      localStorage.removeItem(NEWS_CACHE_KEY);
    } catch (_) {
      // ignore storage failures
    }
  };

  const normalizeFilterText = (value) =>
    (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "");

  const syncFilterSelectOptions = (selectEl, values, defaultLabel) => {
    if (!selectEl) return;
    const currentValue = selectEl.value || "all";
    selectEl.innerHTML = `<option value="all">${defaultLabel}</option>${values
      .map((value) => `<option value="${esc(value)}">${esc(value)}</option>`)
      .join("")}`;
    selectEl.value = values.includes(currentValue) ? currentValue : "all";
  };

  const syncFilterOptions = () => {
    const categories = Array.from(new Set(state.items.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "th"));
    const audiences = Array.from(new Set(state.items.map((item) => item.audience).filter(Boolean))).sort((a, b) => a.localeCompare(b, "th"));
    syncFilterSelectOptions(filters.category, categories, "ทุกหมวด");
    syncFilterSelectOptions(filters.audience, audiences, "ทุกฝ่าย");
    state.filters.category = filters.category?.value || "all";
    state.filters.audience = filters.audience?.value || "all";
  };

  const getFilteredItems = () => {
    const query = normalizeFilterText(state.filters.query);
    return state.items.filter((item) => {
      if (state.filters.status !== "all" && (item.status || "published") !== state.filters.status) return false;
      if (state.filters.category !== "all" && item.category !== state.filters.category) return false;
      if (state.filters.audience !== "all" && item.audience !== state.filters.audience) return false;
      if (!query) return true;
      return normalizeFilterText([item.title, item.summary, item.category, item.audience, item.date, item.academicYear].join(" ")).includes(query);
    });
  };

  const setFormDisabled = (disabled) => {
    Array.from(form.elements).forEach((el) => {
      if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
        el.disabled = disabled;
      }
    });
  };

  const resetForm = () => {
    form.reset();
    if (fields.id) fields.id.value = "";
    if (fields.status) fields.status.value = "published";
    if (fields.date && !fields.date.value) fields.date.value = new Date().toISOString().slice(0, 10);
    setMessage("");
  };

  const fillForm = (item) => {
    if (!item) return;
    fields.id.value = item.id || "";
    fields.title.value = item.title || "";
    fields.date.value = item.date || "";
    fields.academicYear.value = item.academicYear || "";
    fields.category.value = item.category || "";
    fields.audience.value = item.audience || "";
    fields.expireDate.value = item.expireDate || "";
    fields.previewUrl.value = item.previewUrl || "";
    fields.summary.value = item.summary || "";
    fields.status.value = item.status || "published";
    fields.pinned.checked = !!item.pinned;
    setMessage(`กำลังแก้ข่าว: ${item.title}`, "info");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    fields.title.focus();
  };

  const readFormPayload = () => {
    const title = fields.title.value.trim();
    if (!title) {
      throw new Error("กรุณากรอกชื่อข่าว");
    }
    return {
      title,
      summary: fields.summary.value.trim(),
      date: fields.date.value.trim(),
      academicYear: fields.academicYear.value.trim(),
      category: fields.category.value.trim(),
      audience: fields.audience.value.trim(),
      previewUrl: fields.previewUrl.value.trim(),
      expireDate: fields.expireDate.value.trim(),
      pinned: fields.pinned.checked,
      status: fields.status.value || "published"
    };
  };

  const toExportRows = (items = state.items) =>
    items.map((item, index) => ({
      "เลขรันเอกสาร": item.id || `NEWS-${index + 1}`,
      "วันที่ประกาศ": item.date || "",
      "ปีการศึกษา": item.academicYear || "",
      "ชื่อข่าว": item.title || "",
      "สรุปข่าว": item.summary || "",
      "ลิงก์แนบ": item.previewUrl || "",
      "หมวดข่าว": item.category || "",
      "ฝ่ายที่รับผิดชอบ": item.audience || "",
      "วันหมดอายุ": item.expireDate || "",
      "ปักหมุด": item.pinned ? "TRUE" : "",
      "สถานะ": item.status || "published"
    }));

  const exportNewsCsv = () => {
    if (!window.sgcuCsvExport?.download) {
      setMessage("ไม่พบตัวช่วย Export CSV", "error");
      return;
    }
    const headers = [
      "เลขรันเอกสาร",
      "วันที่ประกาศ",
      "ปีการศึกษา",
      "ชื่อข่าว",
      "สรุปข่าว",
      "ลิงก์แนบ",
      "หมวดข่าว",
      "ฝ่ายที่รับผิดชอบ",
      "วันหมดอายุ",
      "ปักหมุด",
      "สถานะ"
    ];
    const ok = window.sgcuCsvExport.download({
      headers,
      rows: toExportRows(getFilteredItems()),
      fileName: "sgcu-news-firestore"
    });
    if (ok) setMessage("Export CSV ข่าวแล้ว", "success");
  };

  const getCsvCell = (row, keys, fallbackIndex = -1) => {
    for (const key of keys) {
      const value = row?.[key];
      if (value != null && value.toString().trim() !== "") return value.toString().trim();
    }
    if (fallbackIndex >= 0 && Array.isArray(row)) {
      return (row[fallbackIndex] || "").toString().trim();
    }
    return "";
  };

  const normalizeImportRow = (row, index) => {
    const title = getCsvCell(row, ["ชื่อข่าว", "title", "Title"], 3);
    if (!title) return null;
    const rawStatus = getCsvCell(row, ["สถานะ", "status", "Status"], 10);
    const status = ["published", "draft", "archived"].includes(rawStatus) ? rawStatus : "published";
    const explicitId = getCsvCell(row, ["id", "docId", "เลขรันเอกสาร"], 0);
    return {
      docId: explicitId ? slugify(explicitId) : slugify(`${getCsvCell(row, ["วันที่ประกาศ", "date"], 1)}-${title}-${index + 1}`),
      payload: {
        title,
        date: getCsvCell(row, ["วันที่ประกาศ", "date", "Date"], 1),
        academicYear: getCsvCell(row, ["ปีการศึกษา", "academicYear", "year"], 2),
        summary: getCsvCell(row, ["สรุปข่าว", "summary", "Summary"], 4),
        previewUrl: getCsvCell(row, ["ลิงก์แนบ", "previewUrl", "url"], 5),
        category: getCsvCell(row, ["หมวดข่าว", "category", "Category"], 6),
        audience: getCsvCell(row, ["ฝ่ายที่รับผิดชอบ", "กลุ่มเป้าหมาย", "audience", "Audience"], 7),
        expireDate: getCsvCell(row, ["วันหมดอายุ", "expireDate"], 8),
        pinned: isTruthyCsvValue(getCsvCell(row, ["ปักหมุด", "pinned", "Pinned"], 9)),
        status
      }
    };
  };

  const importNewsCsvFile = async (file) => {
    const firestore = store();
    const currentUser = auth()?.currentUser;
    if (!file) return;
    if (!firestore.db || !firestore.doc || !firestore.setDoc || !firestore.serverTimestamp) {
      setMessage("ระบบยังไม่พร้อม import เข้า Firestore", "error");
      return;
    }
    try {
      setMessage("กำลังอ่าน CSV...", "info");
      await window.sgcuVendorLoader?.ensurePapa?.();
      if (!window.Papa) throw new Error("ไม่พบ PapaParse สำหรับอ่าน CSV");

      const csvText = await file.text();
      const parsed = window.Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true
      });
      if (parsed.errors?.length) {
        throw new Error(`อ่าน CSV ไม่สำเร็จ: ${parsed.errors[0].message}`);
      }

      let importedCount = 0;
      const editorEmail = currentUser?.email || "";
      const rows = (parsed.data || [])
        .slice(1)
        .map((row, index) => normalizeImportRow(row, index))
        .filter(Boolean);
      if (!rows.length) throw new Error("ไม่พบแถวข่าวที่มีชื่อข่าวใน CSV");

      for (const row of rows) {
        await firestore.setDoc(
          firestore.doc(firestore.db, NEWS_COLLECTION, row.docId),
          {
            ...row.payload,
            updatedAt: firestore.serverTimestamp(),
            updatedBy: editorEmail,
            importedAt: firestore.serverTimestamp(),
            importedBy: editorEmail
          },
          { merge: true }
        );
        importedCount += 1;
      }

      clearNewsCache();
      await loadNewsItems();
      setMessage(`Import ข่าว ${importedCount.toLocaleString("th-TH")} รายการแล้ว`, "success");
    } catch (error) {
      console.error("Import ข่าว CSV ไม่สำเร็จ - app.content-management.js", error);
      setMessage(error.message || "Import CSV ไม่สำเร็จ", "error");
    } finally {
      if (buttons.importFile) buttons.importFile.value = "";
    }
  };

  const renderRows = () => {
    const visibleItems = getFilteredItems();
    const loadStatus = state.listStatus ? ` · ${state.listStatus}` : "";
    tableCaption.textContent = `แสดง ${visibleItems.length.toLocaleString("th-TH")} จาก ${state.items.length.toLocaleString("th-TH")} ข่าวจาก Firestore${loadStatus}`;
    if (!state.items.length) {
      tableBody.innerHTML = `<tr><td colspan="4">ยังไม่มีข่าวใน Firestore</td></tr>`;
      return;
    }
    if (!visibleItems.length) {
      tableBody.innerHTML = `<tr><td colspan="4">ไม่พบข่าวตามตัวกรอง</td></tr>`;
      return;
    }
    tableBody.innerHTML = visibleItems
      .map((item) => `
        <tr class="content-news-row" data-news-id="${esc(item.id)}" tabindex="0" role="button" aria-label="แก้ไขข่าว ${esc(item.title || "")}">
          <td>
            <strong>${esc(item.title || "-")}</strong>
            ${item.pinned ? `<span class="content-admin-pill">PIN</span>` : ""}
            ${item.summary ? `<small>${esc(item.summary)}</small>` : ""}
          </td>
          <td>${esc(item.date || "-")}</td>
          <td>${esc(item.category || "-")}</td>
          <td><span class="content-admin-status is-${esc(item.status || "published")}">${esc(item.status || "published")}</span></td>
        </tr>
      `)
      .join("");
  };

  const loadNewsItems = async () => {
    const firestore = store();
    if (!firestore.db || !firestore.collection || !firestore.getDocs) {
      setMessage("ระบบยังไม่เชื่อมต่อ Firestore", "error");
      return;
    }
    state.isLoading = true;
    state.listStatus = "";
    tableCaption.textContent = "กำลังโหลดข่าว...";
    tableBody.innerHTML = `<tr><td colspan="4">กำลังโหลดข่าว...</td></tr>`;
    try {
      const snapshot = await firestore.getDocs(firestore.collection(firestore.db, NEWS_COLLECTION));
      const items = [];
      snapshot.forEach((docSnap) => {
        const item = normalizeNewsDoc(docSnap);
        if (item.title) items.push(item);
      });
      state.items = sortItems(items);
      state.listStatus = "โหลดข่าวจาก Firestore แล้ว";
      syncFilterOptions();
      renderRows();
      setMessage("");
    } catch (error) {
      console.error("โหลดข่าว Firestore ไม่สำเร็จ - app.content-management.js", error);
      tableBody.innerHTML = `<tr><td colspan="4">ไม่สามารถโหลดข่าวจาก Firestore ได้</td></tr>`;
      tableCaption.textContent = "โหลดข่าวไม่สำเร็จ";
      setMessage("ไม่สามารถโหลดข่าวได้ ตรวจสิทธิ์ Staff และ Firestore Rules", "error");
    } finally {
      state.isLoading = false;
    }
  };

  const saveNewsItem = async (event) => {
    event.preventDefault();
    const firestore = store();
    const currentUser = auth()?.currentUser;
    if (!firestore.db || !firestore.collection || !firestore.doc || !firestore.addDoc || !firestore.setDoc || !firestore.serverTimestamp) {
      setMessage("ระบบยังไม่พร้อมบันทึก Firestore", "error");
      return;
    }
    state.isSaving = true;
    setFormDisabled(true);
    try {
      const payload = readFormPayload();
      const editorEmail = currentUser?.email || "";
      const id = fields.id.value.trim();
      const savePayload = {
        ...payload,
        updatedAt: firestore.serverTimestamp(),
        updatedBy: editorEmail
      };
      if (id) {
        await firestore.setDoc(firestore.doc(firestore.db, NEWS_COLLECTION, id), savePayload, { merge: true });
      } else {
        await firestore.addDoc(firestore.collection(firestore.db, NEWS_COLLECTION), {
          ...savePayload,
          createdAt: firestore.serverTimestamp(),
          createdBy: editorEmail
        });
      }
      clearNewsCache();
      resetForm();
      await loadNewsItems();
      setMessage("บันทึกข่าวแล้ว และล้าง cache ข่าวในเครื่องนี้แล้ว", "success");
    } catch (error) {
      console.error("บันทึกข่าว Firestore ไม่สำเร็จ - app.content-management.js", error);
      setMessage(error.message || "บันทึกข่าวไม่สำเร็จ", "error");
    } finally {
      state.isSaving = false;
      setFormDisabled(false);
    }
  };

  const archiveCurrentItem = async () => {
    if (!fields.id.value.trim()) {
      fields.status.value = "archived";
      return;
    }
    fields.status.value = "archived";
    form.requestSubmit();
  };

  tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("[data-news-id]");
    if (!row) return;
    const item = state.items.find((candidate) => candidate.id === row.dataset.newsId);
    fillForm(item);
  });
  tableBody.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = event.target.closest("[data-news-id]");
    if (!row) return;
    event.preventDefault();
    const item = state.items.find((candidate) => candidate.id === row.dataset.newsId);
    fillForm(item);
  });
  form.addEventListener("submit", saveNewsItem);
  buttons.refresh?.addEventListener("click", () => void loadNewsItems());
  buttons.exportCsv?.addEventListener("click", exportNewsCsv);
  buttons.importCsv?.addEventListener("click", () => buttons.importFile?.click());
  buttons.importFile?.addEventListener("change", (event) => {
    const file = event.target.files?.[0] || null;
    void importNewsCsvFile(file);
  });
  filters.query?.addEventListener("input", () => {
    state.filters.query = filters.query.value.trim();
    renderRows();
  });
  filters.status?.addEventListener("change", () => {
    state.filters.status = filters.status.value || "all";
    renderRows();
  });
  filters.category?.addEventListener("change", () => {
    state.filters.category = filters.category.value || "all";
    renderRows();
  });
  filters.audience?.addEventListener("change", () => {
    state.filters.audience = filters.audience.value || "all";
    renderRows();
  });
  filters.reset?.addEventListener("click", () => {
    if (filters.query) filters.query.value = "";
    if (filters.status) filters.status.value = "all";
    if (filters.category) filters.category.value = "all";
    if (filters.audience) filters.audience.value = "all";
    state.filters = {
      query: "",
      status: "all",
      category: "all",
      audience: "all"
    };
    renderRows();
  });
  buttons.createNew?.addEventListener("click", () => {
    resetForm();
    fields.title.focus();
  });
  buttons.reset?.addEventListener("click", resetForm);
  buttons.archive?.addEventListener("click", () => void archiveCurrentItem());

  resetForm();
  void loadNewsItems();
}

window.initContentManagementStaffPage = initContentManagementStaffPage;

function initContentDocumentsStaffPage() {
  const pageEl = document.querySelector('.page-view[data-page="content-documents-staff"]');
  if (!pageEl || pageEl.dataset.contentDocumentsReady === "true") return;

  const tableBody = document.getElementById("contentDocumentsTableBody");
  const tableCaption = document.getElementById("contentDocumentsTableCaption");
  const messageEl = document.getElementById("contentDocumentsMessage");
  const form = document.getElementById("contentDocumentsForm");
  const formMessageEl = document.getElementById("contentDocumentsFormMessage");
  if (!tableBody || !tableCaption || !form) return;

  pageEl.dataset.contentDocumentsReady = "true";

  const appConfig = typeof SGCU_APP_CONFIG === "object" && SGCU_APP_CONFIG ? SGCU_APP_CONFIG : {};
  const downloadsSheetUrl = appConfig.sheets?.downloads || window.DOWNLOAD_SHEET || "";
  const DOCUMENTS_COLLECTION = appConfig.firestore?.collections?.downloadDocuments || "downloadDocuments";
  const store = () => window.sgcuFirestore || {};
  const auth = () => window.sgcuAuth?.auth || null;
  const filters = {
    query: document.getElementById("contentDocumentsSearchInput"),
    category: document.getElementById("contentDocumentsCategoryFilter"),
    org: document.getElementById("contentDocumentsOrgFilter"),
    format: document.getElementById("contentDocumentsFormatFilter"),
    reset: document.getElementById("contentDocumentsFilterReset")
  };
  const fields = {
    id: document.getElementById("contentDocumentsId"),
    name: document.getElementById("contentDocumentsName"),
    desc: document.getElementById("contentDocumentsDesc"),
    category: document.getElementById("contentDocumentsCategory"),
    org: document.getElementById("contentDocumentsOrg"),
    status: document.getElementById("contentDocumentsStatus"),
    exUrl: document.getElementById("contentDocumentsExUrl"),
    pdfUrl: document.getElementById("contentDocumentsPdfUrl"),
    docxUrl: document.getElementById("contentDocumentsDocxUrl"),
    xlsxUrl: document.getElementById("contentDocumentsXlsxUrl")
  };
  const buttons = {
    refresh: document.getElementById("contentDocumentsRefreshBtn"),
    importSheet: document.getElementById("contentDocumentsImportSheetBtn"),
    exportCsv: document.getElementById("contentDocumentsExportBtn"),
    archive: document.getElementById("contentDocumentsArchiveBtn"),
    reset: document.getElementById("contentDocumentsResetBtn")
  };
  const state = {
    items: [],
    listStatus: "",
    filters: {
      query: "",
      category: "all",
      org: "all",
      format: "all"
    }
  };

  const esc = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");

  const setMessage = (text, type = "") => {
    [messageEl, formMessageEl].forEach((el) => {
      if (!el) return;
      el.textContent = text || "";
      el.dataset.state = type || "";
    });
  };

  const normalizeFilterText = (value) =>
    (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "");

  const hasLink = (value) => {
    const text = (value || "").toString().trim();
    return !!text && text !== "-" && text !== "--";
  };

  const slugifyDocumentId = (value) => {
    const base = (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[^a-z0-9ก-๙]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72);
    return base || `document-${Date.now()}`;
  };

  const normalizeDocumentFirestoreDoc = (docSnap) => {
    const data = docSnap?.data ? docSnap.data() : {};
    const name = (data.name || data.title || "").toString().trim();
    if (!name) return null;
    const item = {
      id: docSnap.id,
      name,
      desc: (data.desc || data.description || "").toString().trim(),
      org: (data.org || data.organization || "").toString().trim(),
      exUrl: (data.exUrl || data.exampleUrl || "").toString().trim(),
      pdfUrl: (data.pdfUrl || "").toString().trim(),
      docxUrl: (data.docxUrl || "").toString().trim(),
      xlsxUrl: (data.xlsxUrl || "").toString().trim(),
      category: (data.category || "").toString().trim() || "อื่น ๆ",
      status: (data.status || "published").toString()
    };
    item.formats = [
      hasLink(item.exUrl) ? "ex" : "",
      hasLink(item.pdfUrl) ? "pdf" : "",
      hasLink(item.docxUrl) ? "docx" : "",
      hasLink(item.xlsxUrl) ? "xlsx" : ""
    ].filter(Boolean);
    return item;
  };

  const normalizeDocumentRow = (row, index) => {
    const name = (row?.[0] || "").toString().trim();
    if (!name) return null;
    const item = {
      id: `document-${index + 1}`,
      name,
      desc: (row?.[1] || "").toString().trim(),
      org: (row?.[2] || "").toString().trim(),
      exUrl: (row?.[3] || "").toString().trim(),
      pdfUrl: (row?.[4] || "").toString().trim(),
      docxUrl: (row?.[5] || "").toString().trim(),
      xlsxUrl: (row?.[6] || "").toString().trim(),
      category: (row?.[7] || "").toString().trim() || "อื่น ๆ"
    };
    item.formats = [
      hasLink(item.exUrl) ? "ex" : "",
      hasLink(item.pdfUrl) ? "pdf" : "",
      hasLink(item.docxUrl) ? "docx" : "",
      hasLink(item.xlsxUrl) ? "xlsx" : ""
    ].filter(Boolean);
    return item;
  };

  const sortDocuments = (items) =>
    items.sort((a, b) => (a.category || "").localeCompare(b.category || "", "th") || (a.name || "").localeCompare(b.name || "", "th"));

  const setFormDisabled = (disabled) => {
    Array.from(form.elements).forEach((el) => {
      if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
        el.disabled = disabled;
      }
    });
  };

  const resetForm = () => {
    form.reset();
    if (fields.id) fields.id.value = "";
    if (fields.status) fields.status.value = "published";
    setMessage("");
  };

  const fillForm = (item) => {
    if (!item) return;
    fields.id.value = item.id || "";
    fields.name.value = item.name || "";
    fields.desc.value = item.desc || "";
    fields.category.value = item.category || "";
    fields.org.value = item.org || "";
    fields.status.value = item.status || "published";
    fields.exUrl.value = item.exUrl || "";
    fields.pdfUrl.value = item.pdfUrl || "";
    fields.docxUrl.value = item.docxUrl || "";
    fields.xlsxUrl.value = item.xlsxUrl || "";
    setMessage(`กำลังแก้เอกสาร: ${item.name}`, "info");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    fields.name.focus();
  };

  const readFormPayload = () => {
    const name = fields.name.value.trim();
    if (!name) throw new Error("กรุณากรอกชื่อเอกสาร");
    return {
      name,
      desc: fields.desc.value.trim(),
      category: fields.category.value.trim() || "อื่น ๆ",
      org: fields.org.value.trim(),
      status: fields.status.value || "published",
      exUrl: fields.exUrl.value.trim(),
      pdfUrl: fields.pdfUrl.value.trim(),
      docxUrl: fields.docxUrl.value.trim(),
      xlsxUrl: fields.xlsxUrl.value.trim()
    };
  };

  const syncFilterSelectOptions = (selectEl, values, defaultLabel) => {
    if (!selectEl) return;
    const currentValue = selectEl.value || "all";
    selectEl.innerHTML = `<option value="all">${defaultLabel}</option>${values
      .map((value) => `<option value="${esc(value)}">${esc(value)}</option>`)
      .join("")}`;
    selectEl.value = values.includes(currentValue) ? currentValue : "all";
  };

  const syncFilterOptions = () => {
    const categories = Array.from(new Set(state.items.map((item) => item.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, "th"));
    const orgs = Array.from(new Set(state.items.map((item) => item.org).filter(Boolean))).sort((a, b) => a.localeCompare(b, "th"));
    syncFilterSelectOptions(filters.category, categories, "ทุกหมวด");
    syncFilterSelectOptions(filters.org, orgs, "ทุกองค์กร");
    state.filters.category = filters.category?.value || "all";
    state.filters.org = filters.org?.value || "all";
  };

  const getFilteredItems = () => {
    const query = normalizeFilterText(state.filters.query);
    return state.items.filter((item) => {
      if (state.filters.category !== "all" && item.category !== state.filters.category) return false;
      if (state.filters.org !== "all" && item.org !== state.filters.org) return false;
      if (state.filters.format !== "all" && !item.formats.includes(state.filters.format)) return false;
      if (!query) return true;
      return normalizeFilterText([item.name, item.desc, item.org, item.category, item.formats.join(" ")].join(" ")).includes(query);
    });
  };

  const buildLink = (url, label) => {
    if (!hasLink(url)) return "";
    const href = typeof toDownloadUrl === "function" ? toDownloadUrl(url, label.toLowerCase()) : url;
    return `<a class="content-documents-file-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  };

  const renderRows = () => {
    const visibleItems = getFilteredItems();
    const loadStatus = state.listStatus ? ` · ${state.listStatus}` : "";
    const sourceLabel = state.source === "firestore" ? "Firestore" : "Google Sheet";
    tableCaption.textContent = `แสดง ${visibleItems.length.toLocaleString("th-TH")} จาก ${state.items.length.toLocaleString("th-TH")} เอกสารจาก ${sourceLabel}${loadStatus}`;
    if (!state.items.length) {
      tableBody.innerHTML = `<tr><td colspan="4">ยังไม่มีเอกสารใน Sheet</td></tr>`;
      return;
    }
    if (!visibleItems.length) {
      tableBody.innerHTML = `<tr><td colspan="4">ไม่พบเอกสารตามตัวกรอง</td></tr>`;
      return;
    }
    tableBody.innerHTML = visibleItems
      .map((item) => {
        const links = [
          buildLink(item.exUrl, "EX"),
          buildLink(item.pdfUrl, "PDF"),
          buildLink(item.docxUrl, "DOCX"),
          buildLink(item.xlsxUrl, "XLSX")
        ].filter(Boolean).join("");
        return `
          <tr class="content-documents-row" data-document-id="${esc(item.id)}" tabindex="0" role="button" aria-label="แก้ไขเอกสาร ${esc(item.name || "")}">
            <td>
              <strong>${esc(item.name)}</strong>
              ${item.desc ? `<small>${esc(item.desc)}</small>` : ""}
            </td>
            <td>${esc(item.category || "-")}</td>
            <td>${esc(item.org || "-")}</td>
            <td><div class="content-documents-file-links">${links || "-"}</div></td>
          </tr>
        `;
      })
      .join("");
  };

  const loadDocumentsFromFirestore = async () => {
    const firestore = store();
    if (!firestore.db || !firestore.collection || !firestore.getDocs) return null;
    const collectionRef = firestore.collection(firestore.db, DOCUMENTS_COLLECTION);
    const listQuery =
      firestore.query && firestore.where
        ? firestore.query(collectionRef, firestore.where("status", "==", "published"))
        : collectionRef;
    const snapshot = await firestore.getDocs(listQuery);
    const items = [];
    snapshot.forEach((docSnap) => {
      const item = normalizeDocumentFirestoreDoc(docSnap);
      if (item) items.push(item);
    });
    return sortDocuments(items);
  };

  const clearDownloadsCache = () => {
    try {
      localStorage.removeItem(appConfig.cache?.keys?.DOWNLOADS || "sgcu_cache_downloads");
    } catch (_) {
      // ignore storage failures
    }
  };

  const loadDocumentsFromSheet = async () => {
    if (!downloadsSheetUrl) throw new Error("ยังไม่ได้ตั้งค่าลิงก์ Sheet เอกสารการเงิน");
    await window.sgcuVendorLoader?.ensurePapa?.();
    if (!window.Papa) throw new Error("ไม่พบ PapaParse สำหรับอ่าน CSV");
    const response = await fetch(downloadsSheetUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`โหลด Sheet ไม่สำเร็จ (${response.status})`);
    const csvText = await response.text();
    const parsed = window.Papa.parse(csvText, { header: false, skipEmptyLines: true });
    if (parsed.errors?.length) throw new Error(parsed.errors[0].message);
    return (parsed.data || [])
      .slice(1)
      .map((row, index) => normalizeDocumentRow(row, index))
      .filter(Boolean);
  };

  const loadDocuments = async () => {
    state.listStatus = "";
    tableCaption.textContent = "กำลังโหลดเอกสาร...";
    tableBody.innerHTML = `<tr><td colspan="4">กำลังโหลดเอกสาร...</td></tr>`;
    try {
      const firestoreItems = await loadDocumentsFromFirestore();
      if (Array.isArray(firestoreItems) && firestoreItems.length) {
        state.items = firestoreItems;
        state.source = "firestore";
        state.listStatus = "โหลดเอกสารจาก Firestore แล้ว";
      } else {
        state.items = await loadDocumentsFromSheet();
        state.source = "sheets";
        state.listStatus = "โหลดเอกสารจาก Google Sheet แล้ว";
      }
      syncFilterOptions();
      renderRows();
      setMessage("");
    } catch (error) {
      console.error("โหลดเอกสารการเงินไม่สำเร็จ - app.content-management.js", error);
      tableCaption.textContent = "โหลดเอกสารไม่สำเร็จ";
      tableBody.innerHTML = `<tr><td colspan="4">ไม่สามารถโหลดเอกสารจาก Firestore หรือ Google Sheet ได้</td></tr>`;
      setMessage("ตรวจลิงก์ Sheet และสิทธิ์การเผยแพร่ CSV", "error");
    }
  };

  const importSheetToFirestore = async () => {
    const firestore = store();
    const currentUser = auth()?.currentUser;
    if (!firestore.db || !firestore.doc || !firestore.setDoc || !firestore.serverTimestamp) {
      setMessage("ระบบยังไม่พร้อม import เข้า Firestore", "error");
      return;
    }
    try {
      if (buttons.importSheet) buttons.importSheet.disabled = true;
      setMessage("กำลัง import Sheet เข้า Firestore...", "info");
      const items = await loadDocumentsFromSheet();
      if (!items.length) throw new Error("ไม่พบรายการเอกสารใน Sheet");
      const editorEmail = currentUser?.email || "";
      let importedCount = 0;
      const idCounts = {};
      for (const item of items) {
        const baseDocId = slugifyDocumentId(`${item.category}-${item.org}-${item.name}`);
        idCounts[baseDocId] = (idCounts[baseDocId] || 0) + 1;
        const docId = idCounts[baseDocId] > 1 ? `${baseDocId}-${idCounts[baseDocId]}` : baseDocId;
        await firestore.setDoc(
          firestore.doc(firestore.db, DOCUMENTS_COLLECTION, docId),
          {
            name: item.name,
            desc: item.desc,
            org: item.org,
            exUrl: item.exUrl,
            pdfUrl: item.pdfUrl,
            docxUrl: item.docxUrl,
            xlsxUrl: item.xlsxUrl,
            category: item.category,
            status: "published",
            updatedAt: firestore.serverTimestamp(),
            updatedBy: editorEmail,
            importedAt: firestore.serverTimestamp(),
            importedBy: editorEmail
          },
          { merge: true }
        );
        importedCount += 1;
      }
      clearDownloadsCache();
      await loadDocuments();
      setMessage(`Import เอกสาร ${importedCount.toLocaleString("th-TH")} รายการเข้า Firestore แล้ว`, "success");
    } catch (error) {
      console.error("Import เอกสารการเงินเข้า Firestore ไม่สำเร็จ - app.content-management.js", error);
      setMessage(error.message || "Import Sheet เข้า Firestore ไม่สำเร็จ", "error");
    } finally {
      if (buttons.importSheet) buttons.importSheet.disabled = false;
    }
  };

  const exportDocumentsCsv = () => {
    if (!window.sgcuCsvExport?.download) {
      setMessage("ไม่พบตัวช่วย Export CSV", "error");
      return;
    }
    const rows = getFilteredItems().map((item) => ({
      "ชื่อเอกสาร": item.name,
      "รายละเอียด": item.desc,
      "องค์กร": item.org,
      "ลิงก์ EX": item.exUrl,
      "ลิงก์ PDF": item.pdfUrl,
      "ลิงก์ DOCX": item.docxUrl,
      "ลิงก์ XLSX": item.xlsxUrl,
      "หมวดหมู่": item.category
    }));
    const ok = window.sgcuCsvExport.download({
      headers: ["ชื่อเอกสาร", "รายละเอียด", "องค์กร", "ลิงก์ EX", "ลิงก์ PDF", "ลิงก์ DOCX", "ลิงก์ XLSX", "หมวดหมู่"],
      rows,
      fileName: "sgcu-financial-documents"
    });
    if (ok) setMessage("Export CSV เอกสารการเงินแล้ว", "success");
  };

  const saveDocumentItem = async (event) => {
    event.preventDefault();
    const firestore = store();
    const currentUser = auth()?.currentUser;
    if (!firestore.db || !firestore.collection || !firestore.doc || !firestore.addDoc || !firestore.setDoc || !firestore.serverTimestamp) {
      setMessage("ระบบยังไม่พร้อมบันทึก Firestore", "error");
      return;
    }
    setFormDisabled(true);
    try {
      const payload = readFormPayload();
      const editorEmail = currentUser?.email || "";
      const id = fields.id.value.trim();
      const savePayload = {
        ...payload,
        updatedAt: firestore.serverTimestamp(),
        updatedBy: editorEmail
      };
      if (id) {
        await firestore.setDoc(firestore.doc(firestore.db, DOCUMENTS_COLLECTION, id), savePayload, { merge: true });
      } else {
        await firestore.setDoc(firestore.doc(firestore.db, DOCUMENTS_COLLECTION, slugifyDocumentId(`${payload.category}-${payload.org}-${payload.name}`)), {
          ...savePayload,
          createdAt: firestore.serverTimestamp(),
          createdBy: editorEmail
        }, { merge: true });
      }
      clearDownloadsCache();
      resetForm();
      await loadDocuments();
      setMessage("บันทึกเอกสารแล้ว และล้าง cache เอกสารในเครื่องนี้แล้ว", "success");
    } catch (error) {
      console.error("บันทึกเอกสารการเงิน Firestore ไม่สำเร็จ - app.content-management.js", error);
      setMessage(error.message || "บันทึกเอกสารไม่สำเร็จ", "error");
    } finally {
      setFormDisabled(false);
    }
  };

  const archiveCurrentItem = async () => {
    if (!fields.id.value.trim()) {
      fields.status.value = "archived";
      return;
    }
    fields.status.value = "archived";
    form.requestSubmit();
  };

  tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("[data-document-id]");
    if (!row || event.target.closest("a")) return;
    const item = state.items.find((candidate) => candidate.id === row.dataset.documentId);
    fillForm(item);
  });
  tableBody.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = event.target.closest("[data-document-id]");
    if (!row) return;
    event.preventDefault();
    const item = state.items.find((candidate) => candidate.id === row.dataset.documentId);
    fillForm(item);
  });

  form.addEventListener("submit", saveDocumentItem);
  filters.query?.addEventListener("input", () => {
    state.filters.query = filters.query.value.trim();
    renderRows();
  });
  filters.category?.addEventListener("change", () => {
    state.filters.category = filters.category.value || "all";
    renderRows();
  });
  filters.org?.addEventListener("change", () => {
    state.filters.org = filters.org.value || "all";
    renderRows();
  });
  filters.format?.addEventListener("change", () => {
    state.filters.format = filters.format.value || "all";
    renderRows();
  });
  filters.reset?.addEventListener("click", () => {
    if (filters.query) filters.query.value = "";
    if (filters.category) filters.category.value = "all";
    if (filters.org) filters.org.value = "all";
    if (filters.format) filters.format.value = "all";
    state.filters = { query: "", category: "all", org: "all", format: "all" };
    renderRows();
  });
  buttons.refresh?.addEventListener("click", () => void loadDocuments());
  buttons.importSheet?.addEventListener("click", () => void importSheetToFirestore());
  buttons.exportCsv?.addEventListener("click", exportDocumentsCsv);
  buttons.reset?.addEventListener("click", resetForm);
  buttons.archive?.addEventListener("click", () => void archiveCurrentItem());

  resetForm();
  void loadDocuments();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initContentManagementStaffPage, { once: true });
} else {
  initContentManagementStaffPage();
}
