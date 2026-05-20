(function initSgcuHealthCheck() {
  if (window.sgcuHealthCheck) return;

  const CHECK_TIMEOUT_MS = 6000;
  const SHEET_TIMEOUT_MS = 8000;
  const state = {
    rows: [],
    running: false,
    initialized: false
  };

  const $ = (id) => document.getElementById(id);
  const normalizeText = (value) => (value == null ? "" : String(value).trim());
  const escapeHtml = (value) =>
    normalizeText(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&#39;");

  const getConfig = () => (window.SGCU_APP_CONFIG && typeof window.SGCU_APP_CONFIG === "object")
    ? window.SGCU_APP_CONFIG
    : {};

  const getCollections = () => getConfig().firestore?.collections || {};
  const getFirestore = () => window.sgcuFirestore || {};
  const getCurrentUser = () => window.sgcuAuth?.auth?.currentUser || null;

  const statusLabel = {
    ok: "ผ่าน",
    warn: "ควรตรวจต่อ",
    error: "ผิดปกติ",
    pending: "กำลังตรวจ"
  };

  const toErrorMessage = (error) => {
    if (!error) return "ไม่ทราบสาเหตุ";
    const code = normalizeText(error.code);
    const message = normalizeText(error.message);
    return [code, message].filter(Boolean).join(": ") || "ไม่ทราบสาเหตุ";
  };

  const withTimeout = (promise, timeoutMs = CHECK_TIMEOUT_MS) =>
    new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("timeout")), timeoutMs);
      Promise.resolve(promise)
        .then(resolve)
        .catch(reject)
        .finally(() => window.clearTimeout(timer));
    });

  const makeRow = (name, status, detail, action = "") => ({
    name,
    status,
    detail,
    action
  });

  const render = () => {
    const body = $("systemHealthTableBody");
    const caption = $("systemHealthCaption");
    const okCountEl = $("systemHealthOkCount");
    const warnCountEl = $("systemHealthWarnCount");
    const errorCountEl = $("systemHealthErrorCount");
    const copyBtn = $("systemHealthCopyBtn");
    if (!body) return;

    const rows = state.rows;
    const okCount = rows.filter((row) => row.status === "ok").length;
    const warnCount = rows.filter((row) => row.status === "warn").length;
    const errorCount = rows.filter((row) => row.status === "error").length;

    if (okCountEl) okCountEl.textContent = okCount.toLocaleString("th-TH");
    if (warnCountEl) warnCountEl.textContent = warnCount.toLocaleString("th-TH");
    if (errorCountEl) errorCountEl.textContent = errorCount.toLocaleString("th-TH");
    if (copyBtn) copyBtn.disabled = !rows.length || state.running;
    if (caption) {
      caption.textContent = state.running
        ? "กำลังตรวจระบบ..."
        : rows.length
          ? `ตรวจล่าสุด ${new Date().toLocaleString("th-TH")} พบผิดปกติ ${errorCount.toLocaleString("th-TH")} รายการ`
          : "กดตรวจระบบเพื่อดูว่าส่วนสำคัญพร้อมใช้งานหรือมีจุดที่ต้องแก้";
    }

    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="4">ยังไม่ได้ตรวจระบบ</td></tr>';
      return;
    }

    body.innerHTML = rows.map((row) => `
      <tr class="system-health-row is-${escapeHtml(row.status)}">
        <td data-label="ส่วนที่ตรวจ">${escapeHtml(row.name)}</td>
        <td data-label="สถานะ"><span class="system-health-badge is-${escapeHtml(row.status)}">${escapeHtml(statusLabel[row.status] || row.status)}</span></td>
        <td data-label="รายละเอียด">${escapeHtml(row.detail)}</td>
        <td data-label="สิ่งที่ควรทำ">${escapeHtml(row.action || "-")}</td>
      </tr>
    `).join("");
  };

  const setStatus = (text, tone = "") => {
    const el = $("systemHealthStatus");
    if (!el) return;
    el.textContent = text || "";
    el.dataset.tone = tone || "";
    el.hidden = !text;
  };

  const checkFirebaseBootstrap = async () => {
    const store = getFirestore();
    const auth = window.sgcuAuth || {};
    const missing = [];
    if (!store.db) missing.push("Firestore db");
    if (!store.doc || !store.collection || !store.getDoc || !store.getDocs) missing.push("Firestore helpers");
    if (!auth.auth || !auth.onAuthStateChanged) missing.push("Auth helpers");
    if (missing.length) {
      return makeRow("Firebase SDK", "error", `ยังโหลดไม่ครบ: ${missing.join(", ")}`, "รีเฟรชหน้าเว็บ ถ้ายังไม่หายให้ตรวจ network หรือ Firebase script");
    }
    return makeRow("Firebase SDK", "ok", "โหลด Auth และ Firestore bridge แล้ว", "");
  };

  const checkAuthSession = async () => {
    const user = getCurrentUser();
    if (!user) {
      return makeRow("บัญชีผู้ดูแล", "error", "ยังไม่ได้เข้าสู่ระบบ", "เข้าสู่ระบบด้วยบัญชี staff แล้วตรวจอีกครั้ง");
    }
    const email = normalizeText(user.email).toLowerCase();
    return makeRow("บัญชีผู้ดูแล", "ok", `เข้าสู่ระบบเป็น ${email || user.uid || "บัญชี Firebase"}`, "");
  };

  const checkRuntimeConfig = async () => {
    if (!window.sgcuRuntimeConfigReady) {
      return makeRow("Runtime config", "warn", "ไม่พบตัวโหลด appSettings/global", "ตรวจว่า app.runtime-config.js โหลดอยู่ในหน้าเว็บ");
    }
    try {
      const data = await withTimeout(window.sgcuRuntimeConfigReady, CHECK_TIMEOUT_MS);
      if (!data) {
        return makeRow("Runtime config", "warn", "ไม่พบ appSettings/global หรืออ่านไม่ได้ แต่ config ตั้งต้นยังใช้งานได้", "ถ้าต้องแก้ค่า runtime ให้สร้าง/ตรวจ document appSettings/global");
      }
      if (data.enabled === false) {
        return makeRow("Runtime config", "warn", "appSettings/global ถูกปิด enabled=false", "เปิด enabled หรือยืนยันว่าตั้งใจใช้ config ในโค้ด");
      }
      return makeRow("Runtime config", "ok", "อ่าน appSettings/global แล้ว", "");
    } catch (error) {
      return makeRow("Runtime config", "warn", toErrorMessage(error), "ตรวจ Firestore rules และ document appSettings/global");
    }
  };

  const checkDocumentRead = async ({ label, collection, docId, requireExists = false, action = "" }) => {
    const store = getFirestore();
    if (!store.db || !store.doc || !store.getDoc) {
      return makeRow(label, "error", "Firestore helper ไม่พร้อม", "ตรวจ Firebase SDK");
    }
    try {
      const ref = store.doc(store.db, collection, docId);
      const snap = await withTimeout(store.getDoc(ref));
      if (!snap.exists()) {
        return makeRow(
          label,
          requireExists ? "warn" : "ok",
          `อ่าน ${collection}/${docId} ได้ แต่ยังไม่มี document`,
          action || "สร้างข้อมูลถ้าฟีเจอร์นี้ต้องใช้"
        );
      }
      return makeRow(label, "ok", `อ่าน ${collection}/${docId} ได้`, "");
    } catch (error) {
      return makeRow(label, "error", toErrorMessage(error), action || "ตรวจสิทธิ์ Firestore rules และบัญชี staff");
    }
  };

  const checkCollectionRead = async ({ label, collection, orderBy = "", action = "" }) => {
    const store = getFirestore();
    if (!store.db || !store.collection || !store.getDocs) {
      return makeRow(label, "error", "Firestore helper ไม่พร้อม", "ตรวจ Firebase SDK");
    }
    try {
      const parts = [store.collection(store.db, collection)];
      if (orderBy && store.orderBy) parts.push(store.orderBy(orderBy, "desc"));
      if (store.limit) parts.push(store.limit(1));
      const ref = store.query ? store.query(...parts) : parts[0];
      const snap = await withTimeout(store.getDocs(ref));
      return makeRow(label, "ok", `อ่าน collection ${collection} ได้ (${snap.size || 0} ตัวอย่าง)`, "");
    } catch (error) {
      const message = toErrorMessage(error);
      const needsIndex = message.includes("index");
      return makeRow(
        label,
        needsIndex ? "warn" : "error",
        message,
        needsIndex ? "เปิดลิงก์สร้าง index จาก console/Firebase error" : (action || "ตรวจ Firestore rules และสิทธิ์ staff")
      );
    }
  };

  const checkSheet = async ({ label, url, action = "" }) => {
    const sheetUrl = normalizeText(url);
    if (!sheetUrl) {
      return makeRow(label, "warn", "ยังไม่ได้ตั้งค่าลิงก์", action || "เพิ่มลิงก์ใน config หรือย้ายไปจัดการผ่าน Staff UI");
    }
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SHEET_TIMEOUT_MS);
    try {
      const response = await fetch(sheetUrl, {
        cache: "no-store",
        signal: controller.signal
      });
      if (!response.ok) {
        return makeRow(label, "error", `โหลดไม่ได้ HTTP ${response.status}`, action || "ตรวจ published CSV และ permission ของ Google Sheets");
      }
      const text = await response.text();
      const size = text.length;
      if (!size) {
        return makeRow(label, "warn", "โหลดได้แต่ไฟล์ว่าง", "ตรวจชีตต้นทางและการ publish เป็น CSV");
      }
      return makeRow(label, "ok", `โหลด CSV ได้ ${size.toLocaleString("th-TH")} ตัวอักษร`, "");
    } catch (error) {
      const detail = error?.name === "AbortError" ? "timeout" : toErrorMessage(error);
      return makeRow(label, "error", detail, action || "ตรวจลิงก์ published CSV, permission และ network");
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const checkLocalStorage = async () => {
    const key = "sgcu_health_check_probe";
    try {
      window.localStorage?.setItem(key, String(Date.now()));
      const value = window.localStorage?.getItem(key);
      window.localStorage?.removeItem(key);
      if (!value) {
        return makeRow("Browser localStorage", "warn", "เขียนแล้วอ่านกลับไม่ได้", "ให้ผู้ใช้ปิด private mode หรือเคลียร์ storage");
      }
      return makeRow("Browser localStorage", "ok", "เขียน อ่าน และลบค่า cache ได้", "");
    } catch (error) {
      return makeRow("Browser localStorage", "warn", toErrorMessage(error), "ผู้ใช้บางเครื่องอาจต้องเปิด storage permission หรือเคลียร์ cache");
    }
  };

  const checkServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
      return makeRow("Service worker", "warn", "browser นี้ไม่รองรับ service worker", "ใช้ browser รุ่นใหม่เมื่อต้องตรวจ cache");
    }
    try {
      const registration = await withTimeout(navigator.serviceWorker.getRegistration(), CHECK_TIMEOUT_MS);
      const scriptUrl = registration?.active?.scriptURL || registration?.waiting?.scriptURL || registration?.installing?.scriptURL || "";
      if (!registration) {
        return makeRow("Service worker", "warn", "ยังไม่มี registration", "รีเฟรชหน้าเว็บหรือ deploy ใหม่ถ้า cache ไม่อัปเดต");
      }
      return makeRow("Service worker", "ok", scriptUrl ? `ลงทะเบียนแล้ว: ${scriptUrl}` : "ลงทะเบียนแล้ว", "");
    } catch (error) {
      return makeRow("Service worker", "warn", toErrorMessage(error), "ตรวจ cache/version ถ้าผู้ใช้เห็นไฟล์เก่า");
    }
  };

  const checkCacheStorage = async () => {
    if (!("caches" in window)) {
      return makeRow("Cache storage", "warn", "browser นี้ไม่รองรับ Cache API", "ข้ามได้ถ้าไม่ได้ debug cache");
    }
    try {
      const keys = await withTimeout(window.caches.keys(), CHECK_TIMEOUT_MS);
      return makeRow("Cache storage", "ok", keys.length ? `พบ cache ${keys.join(", ")}` : "ยังไม่มี cache key", "");
    } catch (error) {
      return makeRow("Cache storage", "warn", toErrorMessage(error), "ลองล้าง site data ถ้า asset ไม่อัปเดต");
    }
  };

  const runChecks = async () => {
    if (state.running) return;
    state.running = true;
    const runBtn = $("systemHealthRunBtn");
    if (runBtn) runBtn.disabled = true;
    state.rows = [makeRow("Health Check", "pending", "กำลังตรวจระบบ...", "")];
    setStatus("กำลังตรวจระบบ...", "");
    render();

    const config = getConfig();
    const collections = getCollections();
    const user = getCurrentUser();
    const staffEmail = normalizeText(user?.email).toLowerCase();
    const tasks = [
      checkFirebaseBootstrap(),
      checkAuthSession(),
      checkRuntimeConfig(),
      checkDocumentRead({
        label: "appSettings/global",
        collection: collections.appSettings || "appSettings",
        docId: "global",
        action: "สร้าง document ถ้าต้องตั้ง runtime config"
      }),
      staffEmail
        ? checkDocumentRead({
            label: "สิทธิ์ staff profile",
            collection: collections.staffProfiles || "staffProfiles",
            docId: staffEmail,
            requireExists: true,
            action: "ให้ Head Staff ตรวจ staffProfiles ของอีเมลนี้"
          })
        : Promise.resolve(makeRow("สิทธิ์ staff profile", "error", "ไม่มีอีเมลผู้ใช้ปัจจุบัน", "เข้าสู่ระบบใหม่")),
      checkCollectionRead({ label: "ข่าวสาร", collection: collections.newsItems || "newsItems" }),
      checkCollectionRead({ label: "เอกสารการเงิน", collection: collections.downloadDocuments || "downloadDocuments" }),
      checkCollectionRead({ label: "ทะเบียนองค์กร", collection: collections.organizationCatalog || "organizationCatalog" }),
      checkCollectionRead({ label: "คำของบประมาณ", collection: collections.budgetApprovalRequests || "budgetApprovalRequests" }),
      checkDocumentRead({
        label: "ตั้งค่างบประมาณ",
        collection: collections.budgetApprovalSettings || "budgetApprovalSettings",
        docId: config.firestore?.docs?.budgetApprovalSettings || "global",
        action: "ตรวจ budgetApprovalSettings/global ถ้าหน้ายื่นงบทำงานผิดปกติ"
      }),
      checkCollectionRead({ label: "คำขอยืมพัสดุ", collection: collections.borrowAssetRequests || "borrowAssetRequests" }),
      checkCollectionRead({ label: "ห้องประชุม", collection: collections.meetingRooms || "meetingRooms" }),
      checkCollectionRead({ label: "คำขอจองห้อง", collection: collections.meetingRoomBookings || "meetingRoomBookings" }),
      checkCollectionRead({ label: "Activity Log", collection: collections.auditLogs || "auditLogs", orderBy: "timestamp" }),
      checkSheet({
        label: "Google Sheets: Project Status",
        url: config.sheets?.projectSources,
        action: "ตรวจ publish CSV หรืออัปเดตลิงก์ projectSources"
      }),
      checkSheet({
        label: "Google Sheets: พัสดุ",
        url: config.sheets?.borrowAssets,
        action: "ตรวจ publish CSV หรือย้าย catalog ไป Firestore"
      }),
      checkLocalStorage(),
      checkServiceWorker(),
      checkCacheStorage()
    ];

    const results = await Promise.allSettled(tasks);
    state.rows = results.map((result, index) => {
      if (result.status === "fulfilled") return result.value;
      return makeRow(`ตรวจรายการที่ ${index + 1}`, "error", toErrorMessage(result.reason), "แจ้งผู้ดูแลระบบพร้อมสรุปนี้");
    });

    const errorCount = state.rows.filter((row) => row.status === "error").length;
    const warnCount = state.rows.filter((row) => row.status === "warn").length;
    setStatus(
      errorCount
        ? `ตรวจเสร็จ พบผิดปกติ ${errorCount.toLocaleString("th-TH")} รายการ`
        : warnCount
          ? `ตรวจเสร็จ มี ${warnCount.toLocaleString("th-TH")} รายการที่ควรตรวจต่อ`
          : "ตรวจเสร็จ ระบบหลักพร้อมใช้งาน",
      errorCount ? "error" : warnCount ? "warn" : "ok"
    );
    state.running = false;
    if (runBtn) runBtn.disabled = false;
    render();
  };

  const copySummary = async () => {
    if (!state.rows.length || state.running) return;
    const lines = [
      `SGCU Health Check - ${new Date().toLocaleString("th-TH")}`,
      ...state.rows.map((row) => `[${statusLabel[row.status] || row.status}] ${row.name}: ${row.detail}${row.action ? ` | แนะนำ: ${row.action}` : ""}`)
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setStatus("คัดลอกสรุป health check แล้ว", "ok");
    } catch (error) {
      setStatus(`คัดลอกไม่สำเร็จ: ${toErrorMessage(error)}`, "warn");
    }
  };

  const init = () => {
    if (!document.getElementById("systemHealthTableBody")) return;
    if (!state.initialized) {
      state.initialized = true;
      $("systemHealthRunBtn")?.addEventListener("click", runChecks);
      $("systemHealthCopyBtn")?.addEventListener("click", copySummary);
    }
    render();
    if (!state.rows.length && !state.running) {
      void runChecks();
    }
  };

  window.sgcuHealthCheck = {
    init,
    run: runChecks,
    getRows: () => state.rows.slice()
  };

  window.addEventListener("sgcu:page-active", (event) => {
    if (event?.detail?.page === "system-data-staff") init();
  });
})();
