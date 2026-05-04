/* System settings: no-code handover configuration */
function initSystemSettingsPage() {
  if (window.__sgcuSystemSettingsInitDone) return;
  window.__sgcuSystemSettingsInitDone = true;

  const pageEl = document.querySelector('.page-view[data-page="system-settings"]');
  const formEl = document.getElementById("systemSettingsForm");
  if (!pageEl || !formEl) return;

  const messageEl = document.getElementById("systemSettingsMessage");
  const updatedAtEl = document.getElementById("systemSettingsUpdatedAt");
  const storeStateEl = document.getElementById("systemSettingsStoreState");
  const previewEl = document.getElementById("systemSettingsPreview");
  const resetBtnEl = document.getElementById("systemSettingsResetBtn");
  const reloadBtnEl = document.getElementById("systemSettingsReloadBtn");
  const saveBtnEl = document.getElementById("systemSettingsSaveBtn");
  const inputs = Array.from(formEl.querySelectorAll("[data-settings-path]"));
  const dataLinkEls = Array.from(pageEl.querySelectorAll("[data-settings-link]"));
  const runtime = window.sgcuRuntimeConfig || {};
  const store = window.sgcuFirestore || {};
  const collectionName = runtime.collection || "appSettings";
  const docId = runtime.docId || "global";

  const defaultConfig = runtime.defaultConfig || SGCU_APP_CONFIG || {};

  const setStatus = (message, tone = "") => {
    if (!messageEl) return;
    messageEl.textContent = message || "";
    messageEl.dataset.tone = tone;
  };

  const setIndicator = (name, tone = "") => {
    const indicator = document.querySelector(`[data-settings-indicator="${name}"]`);
    if (!indicator) return;
    indicator.dataset.tone = tone;
  };

  const setStoreState = (message, tone = "") => {
    if (storeStateEl) storeStateEl.textContent = message;
    setIndicator("store", tone);
  };

  const setSavedState = (message, tone = "") => {
    if (updatedAtEl) updatedAtEl.textContent = message;
    setIndicator("saved", tone);
  };

  const toDateText = (value) => {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : value instanceof Date
          ? value
          : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  const getByPath = (source, path) =>
    path.split(".").reduce((cursor, key) => (cursor && cursor[key] !== undefined ? cursor[key] : undefined), source);

  const setByPath = (target, path, value) => {
    const parts = path.split(".");
    let cursor = target;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        cursor[part] = value;
        return;
      }
      if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
      cursor = cursor[part];
    });
  };

  const clone = (value) => JSON.parse(JSON.stringify(value || {}));

  const buildEditableConfig = (sourceConfig = {}) => {
    const source = sourceConfig || {};
    return {
      cache: {
        ttlMs: Number(source.cache?.ttlMs || 0)
      },
      auth: {
        sessionMaxAgeMs: Number(source.auth?.sessionMaxAgeMs || 0)
      }
    };
  };

  const configToFormModel = (sourceConfig = {}) => {
    const config = buildEditableConfig(sourceConfig);
    return {
      ...config,
      cache: {
        ttlMinutes: Math.max(1, Math.round(Number(config.cache.ttlMs || 0) / 60000) || 3)
      },
      auth: {
        sessionDays: Math.max(1, Math.round(Number(config.auth.sessionMaxAgeMs || 0) / 86400000) || 7)
      }
    };
  };

  const formModelToConfig = () => {
    const model = {};
    inputs.forEach((input) => {
      const path = input.dataset.settingsPath || "";
      if (!path) return;
      const value = input.type === "checkbox" ? input.checked : input.value.trim();
      setByPath(model, path, value);
    });

    const ttlMinutes = Number(model.cache?.ttlMinutes || 3);
    const sessionDays = Number(model.auth?.sessionDays || 7);
    return {
      cache: {
        ttlMs: Math.max(1, ttlMinutes) * 60 * 1000
      },
      auth: {
        sessionMaxAgeMs: Math.max(1, sessionDays) * 24 * 60 * 60 * 1000
      }
    };
  };

  const fillForm = (sourceConfig = {}) => {
    const model = configToFormModel(sourceConfig);
    inputs.forEach((input) => {
      const value = getByPath(model, input.dataset.settingsPath || "");
      if (input.type === "checkbox") {
        input.checked = value === true;
      } else {
        input.value = value === undefined || value === null ? "" : String(value);
      }
    });
    renderPreview(sourceConfig);
    syncDataLinks();
  };

  const renderPreview = (sourceConfig = SGCU_APP_CONFIG) => {
    if (!previewEl) return;
    previewEl.textContent = JSON.stringify(buildEditableConfig(sourceConfig), null, 2);
  };

  const getSettingsRef = () => {
    if (!store.db || !store.doc) return null;
    return store.doc(store.db, collectionName, docId);
  };

  function syncDataLinks() {
    dataLinkEls.forEach((linkEl) => {
      const path = linkEl.dataset.settingsLink || "";
      const url = (getByPath(SGCU_APP_CONFIG, path) || "").toString().trim();
      if (!url) {
        linkEl.setAttribute("href", "#");
        linkEl.setAttribute("aria-disabled", "true");
        linkEl.classList.add("is-disabled");
        const actionEl = linkEl.matches(".settings-data-row") ? linkEl.querySelector("em") : null;
        if (actionEl) actionEl.textContent = "รอลิงก์";
        else linkEl.textContent = "รอลิงก์";
        return;
      }
      linkEl.setAttribute("href", url);
      linkEl.removeAttribute("aria-disabled");
      linkEl.classList.remove("is-disabled");
      const actionEl = linkEl.matches(".settings-data-row") ? linkEl.querySelector("em") : null;
      if (actionEl) {
        actionEl.textContent = "เปิด";
      } else {
        linkEl.textContent = linkEl.classList.contains("settings-quick-primary")
          ? "เปิดสารบัญ Project Status"
          : "เปิด";
      }
    });
  }

  const loadSettings = async () => {
    const ref = getSettingsRef();
    if (!ref || !store.getDoc) {
      fillForm(SGCU_APP_CONFIG);
      setStoreState("ไม่ได้เชื่อมต่อ", "error");
      setSavedState("แสดงค่าในไฟล์เท่านั้น", "warning");
      setStatus("ไม่พบการเชื่อมต่อ Firestore จึงแสดงค่าในไฟล์เท่านั้น", "warning");
      return;
    }

    setStoreState("กำลังเชื่อมต่อ", "warning");
    setStatus("กำลังโหลดการตั้งค่า...");
    try {
      await window.sgcuRuntimeConfigReady;
      const snap = await store.getDoc(ref);
      setStoreState("เชื่อมต่อแล้ว", "success");
      if (!snap.exists()) {
        fillForm(SGCU_APP_CONFIG);
        setSavedState("ยังไม่พบการตั้งค่าจาก Firestore", "warning");
        setStatus("ยังไม่มีค่าที่บันทึกไว้ ระบบกำลังใช้ค่าเริ่มต้นจากไฟล์", "warning");
        return;
      }
      const data = snap.data() || {};
      const remoteConfig = data.config || {};
      if (runtime.applyConfig) runtime.applyConfig(remoteConfig);
      fillForm(SGCU_APP_CONFIG);
      const updatedText = toDateText(data.updatedAt);
      setSavedState(updatedText ? updatedText : "โหลดการตั้งค่าจาก Firestore แล้ว", "success");
      setStatus("โหลดการตั้งค่าสำเร็จ", "success");
    } catch (error) {
      console.error("system settings load failed - app.system-settings.js:184", error);
      fillForm(SGCU_APP_CONFIG);
      setStoreState("โหลดไม่สำเร็จ", "error");
      setSavedState("ตรวจสอบ rules หรือสิทธิ์", "error");
      setStatus("โหลดการตั้งค่าไม่สำเร็จ กรุณาตรวจสอบสิทธิ์หรือ Firestore rules", "error");
    }
  };

  const saveSettings = async () => {
    const ref = getSettingsRef();
    if (!ref || !store.setDoc) {
      setStatus("ไม่สามารถบันทึกได้ เพราะไม่พบการเชื่อมต่อ Firestore", "error");
      return;
    }
    const config = formModelToConfig();
    const normalized = runtime.normalizeSettingsConfig
      ? runtime.normalizeSettingsConfig(config)
      : config;

    if (saveBtnEl) saveBtnEl.disabled = true;
    setStatus("กำลังบันทึก...");
    try {
      await store.setDoc(
        ref,
        {
          enabled: true,
          config: normalized,
          updatedAt: store.serverTimestamp ? store.serverTimestamp() : new Date()
        },
        { merge: true }
      );
      if (runtime.applyConfig) runtime.applyConfig(normalized);
      renderPreview(SGCU_APP_CONFIG);
      setSavedState("บันทึกเมื่อสักครู่", "success");
      setStatus("บันทึกแล้ว รีเฟรชหน้าเว็บเพื่อให้ทุกส่วนใช้ค่าใหม่ครบถ้วน", "success");
    } catch (error) {
      console.error("system settings save failed - app.system-settings.js:222", error);
      setStatus("บันทึกไม่สำเร็จ เฉพาะหัวหน้าสตาฟเท่านั้นที่แก้การตั้งค่าระบบได้", "error");
    } finally {
      if (saveBtnEl) saveBtnEl.disabled = false;
    }
  };

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveSettings();
  });

  if (resetBtnEl) {
    resetBtnEl.addEventListener("click", () => {
      fillForm(clone(defaultConfig));
      setStatus("คืนค่าในฟอร์มเป็นค่าเริ่มต้นจากไฟล์แล้ว กดบันทึกเพื่อใช้ค่านี้จริง", "warning");
    });
  }

  if (reloadBtnEl) {
    reloadBtnEl.addEventListener("click", () => {
      void loadSettings();
    });
  }

  dataLinkEls.forEach((linkEl) => {
    linkEl.addEventListener("click", (event) => {
      if (linkEl.getAttribute("aria-disabled") !== "true") return;
      event.preventDefault();
      setStatus("ยังไม่มีลิงก์สำหรับแหล่งข้อมูลนี้ใน config", "warning");
    });
  });

  void loadSettings();
}

window.initSystemSettingsPage = initSystemSettingsPage;
initSystemSettingsPage();
