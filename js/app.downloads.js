/* ดาวน์โหลดเอกสารการเงิน */

function toggleDownloadSkeleton(isLoading) {
  const downloadSkeletonEl = document.getElementById("downloadSkeleton");
  const downloadListEl = document.getElementById("downloadList");
  if (downloadSkeletonEl) {
    downloadSkeletonEl.style.display = isLoading ? "grid" : "none";
  }
  if (downloadListEl) {
    downloadListEl.style.display = isLoading ? "none" : "";
  }
}

function createDownloadHeader(titleText) {
  const header = document.createElement("div");
  header.className = "download-card-header";

  const bar = document.createElement("span");
  bar.className = "download-card-bar";
  header.appendChild(bar);

  const title = document.createElement("h3");
  title.className = "download-card-title";
  title.textContent = titleText;
  header.appendChild(title);

  return header;
}

function createDownloadListItem(doc) {
  const li = document.createElement("li");
  li.className = "download-item";

  const main = document.createElement("div");
  main.className = "download-main";
  li.appendChild(main);

  const title = document.createElement("div");
  title.className = "download-title";
  title.textContent = doc.org ? `${doc.name} (${doc.org})` : doc.name;
  main.appendChild(title);

  const buttons = document.createElement("div");
  buttons.className = "download-buttons";
  main.appendChild(buttons);

  addDownloadButton(buttons, "EX", doc.exUrl);
  addDownloadButton(buttons, "PDF", doc.pdfUrl);
  addDownloadButton(buttons, "DOCX", doc.docxUrl);
  addDownloadButton(buttons, "XLSX", doc.xlsxUrl);

  const desc = document.createElement("div");
  desc.className = "download-desc";
  desc.textContent = doc.desc || "";
  li.appendChild(desc);

  return li;
}

/* สร้างปุ่มดาวน์โหลด 1 ปุ่ม (EX / PDF / DOCX / XLSX) */
function addDownloadButton(wrapper, label, url) {
  if (!url || url === "-" || url === "--" || url === "") return;

  const a = document.createElement("a");
  a.className = "download-btn";
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.href = toDownloadUrl(url, label.toLowerCase());
  a.textContent = `⬇ ${label}`;
  wrapper.appendChild(a);
}

function applyDownloadCategoryFilter(listEl, selected) {
  if (!listEl) return;
  const target = selected || "all";
  listEl.querySelectorAll(".download-section-card").forEach((section) => {
    const category = (section.dataset.category || "").trim();
    const isVisible = target === "all" || category === target;
    section.style.display = isVisible ? "" : "none";
  });
}

function initDownloadCategoryFilter(listEl) {
  const selectEl = document.getElementById("downloadCategorySelect");
  if (!selectEl || !listEl) return;

  const sections = Array.from(listEl.querySelectorAll(".download-section-card"));
  const categories = [];

  sections.forEach((section) => {
    let category = (section.dataset.category || "").trim();
    if (!category) {
      const titleEl = section.querySelector(".download-card-title");
      category = (titleEl ? titleEl.textContent : "").trim();
      if (category) {
        section.dataset.category = category;
      }
    }
    if (category && !categories.includes(category)) {
      categories.push(category);
    }
  });

  const currentValue = selectEl.value || "all";
  selectEl.innerHTML = '<option value="all">ทุกประเภท</option>';
  categories.forEach((category) => {
    const opt = document.createElement("option");
    opt.value = category;
    opt.textContent = category;
    selectEl.appendChild(opt);
  });

  selectEl.value = categories.includes(currentValue) ? currentValue : "all";

  if (!selectEl.dataset.bound) {
    selectEl.addEventListener("change", (event) => {
      applyDownloadCategoryFilter(listEl, event.target.value);
    });
    selectEl.dataset.bound = "true";
  }

  applyDownloadCategoryFilter(listEl, selectEl.value);
}

function setDownloadListState(listEl, type, message, options = {}) {
  if (!listEl) return;
  const safeType = (type || "").toString().trim();
  const text = (message || "").toString().trim();
  if (!safeType || !text) return;
  const canRetry = !!options.showRetry;
  listEl.innerHTML = "";
  const panel = document.createElement("div");
  panel.className = "panel";
  panel.style.background = "#f8fafc";

  const caption = document.createElement("div");
  caption.className = "panel-caption";
  caption.style.color = "#475569";
  caption.textContent = text;
  panel.appendChild(caption);

  if (canRetry) {
    const retryBtn = document.createElement("button");
    retryBtn.id = "downloadRetryButton";
    retryBtn.className = "btn-ghost";
    retryBtn.type = "button";
    retryBtn.style.marginTop = "8px";
    retryBtn.textContent = "ลองใหม่";
    retryBtn.addEventListener("click", () => {
      void loadDownloadDocuments();
    });
    panel.appendChild(retryBtn);
  }

  listEl.appendChild(panel);
}

async function loadDownloadDocuments() {
  const listEl = document.getElementById("downloadList");
  const categorySelectEl = document.getElementById("downloadCategorySelect");
  if (!listEl) {
    if (typeof markLoaderStep === "function") {
      markLoaderStep("downloads");
    }
    return;
  }

  try {
    toggleDownloadSkeleton(true);
    listEl.setAttribute("aria-busy", "true");
    if (categorySelectEl) categorySelectEl.disabled = true;

    const cached = getCache(CACHE_KEYS.DOWNLOADS, CACHE_TTL_MS);
    if (cached && typeof cached === "string" && cached.trim()) {
      listEl.innerHTML = cached;
      initDownloadCategoryFilter(listEl);
      if (categorySelectEl) categorySelectEl.disabled = false;
      return;
    }

    await window.sgcuVendorLoader?.ensurePapa?.();
    const csvText = await fetchTextWithProgress(DOWNLOAD_SHEET, (ratio) => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("downloads", ratio);
      }
    });
    const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
    const rows = parsed.data;

    // เคลียร์ก่อน
    listEl.innerHTML = "";

    if (!rows || rows.length < 2) {
      setDownloadListState(listEl, "empty", "ยังไม่มีเอกสารดาวน์โหลด");
      if (categorySelectEl) categorySelectEl.disabled = false;
      return;
    }

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
    const categoryNames = Object.keys(categories);
    if (!categoryNames.length) {
      setDownloadListState(listEl, "empty", "ยังไม่มีเอกสารดาวน์โหลด");
      if (categorySelectEl) categorySelectEl.disabled = false;
      return;
    }

    for (const categoryName of categoryNames) {
      const section = document.createElement("section");
      section.className = "download-section-card";
      section.dataset.category = categoryName;
      section.appendChild(createDownloadHeader(categoryName));
      const ul = document.createElement("ul");
      ul.className = "download-card-list";
      section.appendChild(ul);

      categories[categoryName].forEach((doc) => {
        ul.appendChild(createDownloadListItem(doc));
      });

      listEl.appendChild(section);
    }

    initDownloadCategoryFilter(listEl);

    // เก็บ cache เป็น HTML string เพื่อลด render ซ้ำ
    setCache(CACHE_KEYS.DOWNLOADS, listEl.innerHTML);
    if (categorySelectEl) categorySelectEl.disabled = false;
  } catch (err) {
    console.error("โหลดชีตดาวน์โหลดเอกสารไม่ได้ - app.js:4572", err);
    recordLoadError("downloads", "โหลดรายการดาวน์โหลดไม่สำเร็จ", { showRetry: true });
    setDownloadListState(listEl, "error", "ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้", { showRetry: true });
    if (categorySelectEl) categorySelectEl.disabled = true;
  } finally {
    toggleDownloadSkeleton(false);
    listEl.removeAttribute("aria-busy");
    listEl.style.display = "";
    if (typeof markLoaderStep === "function") {
      markLoaderStep("downloads");
    }
  }
}
