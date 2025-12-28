/* ดาวน์โหลดเอกสารการเงิน */

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

async function loadDownloadDocuments() {
  const listEl = document.getElementById("downloadList");
  if (!listEl) {
    if (typeof markLoaderStep === "function") {
      markLoaderStep("downloads");
    }
    return;
  }

  try {
    toggleDownloadSkeleton(true);

    const cached = getCache(CACHE_KEYS.DOWNLOADS, CACHE_TTL_MS);
    if (cached && typeof cached === "string" && cached.trim()) {
      listEl.innerHTML = cached;
      initDownloadCategoryFilter(listEl);
      return;
    }

    const csvText = await fetchTextWithProgress(DOWNLOAD_SHEET, (ratio) => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("downloads", ratio);
      }
    });
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
      section.dataset.category = categoryName;

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

    initDownloadCategoryFilter(listEl);

    // เก็บ cache เป็น HTML string เพื่อลด render ซ้ำ
    setCache(CACHE_KEYS.DOWNLOADS, listEl.innerHTML);
  } catch (err) {
    console.error("โหลดชีตดาวน์โหลดเอกสารไม่ได้ - app.js:4572", err);
    recordLoadError("downloads", "โหลดรายการดาวน์โหลดไม่สำเร็จ", { showRetry: true });
    setInlineError(listEl, "ไม่สามารถโหลดข้อมูลจาก Google Sheets ได้");
  } finally {
    toggleDownloadSkeleton(false);
    listEl.style.display = listEl.innerHTML.trim() ? "" : "none";
    if (typeof markLoaderStep === "function") {
      markLoaderStep("downloads");
    }
  }
}
