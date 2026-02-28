/* ข่าวและประกาศจากฝ่ายเหรัญญิก */

const HOME_NEWS_PREVIEW_LIMIT = 4;
const NEWS_PAGE_SIZE = 9;
const newsFilterState = {
  query: "",
  year: "all",
  category: "all",
  audience: "all",
  sort: "latest"
};
let newsFilterInitialized = false;
let newsVisibleCount = NEWS_PAGE_SIZE;

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

    const csvText = await fetchTextWithProgress(NEWS_SHEET_CSV, (ratio) => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("news", ratio);
      }
    });

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
    console.error("โหลดข่าว/ประกาศจากชีตไม่ได้  NEWS - app.js:4229", err);
    recordLoadError("news", "โหลดข่าว/ประกาศไม่สำเร็จ", { showRetry: true });
    newsItems = [];
    setInlineError(newsListEl, "ไม่สามารถโหลดข่าว/ประกาศได้ในขณะนี้");
    setInlineError(document.getElementById("homeNewsPreview"), "ไม่สามารถโหลดข่าว/ประกาศได้ในขณะนี้");
  } finally {
    toggleNewsSkeleton(false);
    if (typeof markLoaderStep === "function") {
      markLoaderStep("news");
    }
  }
}

function renderNewsList() {
  if (!newsListEl) return;

  initNewsFilters();
  syncNewsFilterOptions();
  updateNewsLoadMoreVisibility(false);

  if (!newsItems.length) {
    updateNewsFilterSummary(0, 0);
    newsListEl.innerHTML = `
      <div class="panel" style="background:#0f172a; color:#e5e7eb;">
        <div class="panel-title" style="margin-bottom:6px;">ยังไม่มีข่าวหรือประกาศ</div>
        <div class="panel-caption">เมื่อมีการเพิ่มประกาศจากชีตจะแสดงที่นี่อัตโนมัติ</div>
      </div>
    `;
    renderHomeNewsPreview();
    return;
  }

  const processedItems = getProcessedNewsItems();
  const filteredItems = processedItems.slice(0, newsVisibleCount);
  updateNewsFilterSummary(filteredItems.length, processedItems.length, newsItems.length);

  if (!processedItems.length) {
    newsListEl.innerHTML = `
      <div class="news-empty-state">
        <strong>ไม่พบข่าวที่ตรงกับตัวกรอง</strong>
        <span>ลองเปลี่ยนคำค้นหรือกดล้างตัวกรองเพื่อดูรายการทั้งหมด</span>
      </div>
    `;
    renderHomeNewsPreview();
    return;
  }

  const html = filteredItems
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

  updateNewsLoadMoreVisibility(processedItems.length > filteredItems.length);
  renderHomeNewsPreview();
}

function initNewsFilters() {
  if (newsFilterInitialized) return;

  const searchInput = document.getElementById("newsSearchInput");
  const yearFilter = document.getElementById("newsYearFilter");
  const categoryFilter = document.getElementById("newsCategoryFilter");
  const audienceFilter = document.getElementById("newsAudienceFilter");
  const sortSelect = document.getElementById("newsSortSelect");
  const resetButton = document.getElementById("newsFilterReset");
  const loadMoreButton = document.getElementById("newsLoadMoreBtn");

  if (!searchInput || !yearFilter || !categoryFilter || !audienceFilter || !sortSelect || !resetButton || !loadMoreButton) return;

  searchInput.addEventListener("input", () => {
    newsFilterState.query = searchInput.value.trim();
    resetNewsVisibleCount();
    renderNewsList();
  });
  yearFilter.addEventListener("change", () => {
    newsFilterState.year = yearFilter.value;
    resetNewsVisibleCount();
    renderNewsList();
  });
  categoryFilter.addEventListener("change", () => {
    newsFilterState.category = categoryFilter.value;
    resetNewsVisibleCount();
    renderNewsList();
  });
  audienceFilter.addEventListener("change", () => {
    newsFilterState.audience = audienceFilter.value;
    resetNewsVisibleCount();
    renderNewsList();
  });
  sortSelect.addEventListener("change", () => {
    newsFilterState.sort = sortSelect.value;
    resetNewsVisibleCount();
    renderNewsList();
  });
  resetButton.addEventListener("click", () => {
    newsFilterState.query = "";
    newsFilterState.year = "all";
    newsFilterState.category = "all";
    newsFilterState.audience = "all";
    newsFilterState.sort = "latest";
    resetNewsVisibleCount();
    searchInput.value = "";
    yearFilter.value = "all";
    categoryFilter.value = "all";
    audienceFilter.value = "all";
    sortSelect.value = "latest";
    renderNewsList();
  });
  loadMoreButton.addEventListener("click", () => {
    newsVisibleCount += NEWS_PAGE_SIZE;
    renderNewsList();
  });

  newsFilterInitialized = true;
}

function syncNewsFilterOptions() {
  syncNewsFilterSelect("newsYearFilter", getUniqueNewsValues("year"), "ทั้งหมด");
  syncNewsFilterSelect("newsCategoryFilter", getUniqueNewsValues("category"), "ทั้งหมด");
  syncNewsFilterSelect("newsAudienceFilter", getUniqueNewsValues("audience"), "ทั้งหมด");

  const searchInput = document.getElementById("newsSearchInput");
  const sortSelect = document.getElementById("newsSortSelect");
  if (searchInput && searchInput.value !== newsFilterState.query) {
    searchInput.value = newsFilterState.query;
  }
  if (sortSelect && sortSelect.value !== newsFilterState.sort) {
    sortSelect.value = newsFilterState.sort;
  }
}

function syncNewsFilterSelect(selectId, values, defaultLabel) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const currentValue = select.value || "all";
  const optionsHtml = [
    `<option value="all">${defaultLabel}</option>`,
    ...values.map((value) => `<option value="${escapeNewsHtml(value)}">${escapeNewsHtml(value)}</option>`)
  ].join("");

  select.innerHTML = optionsHtml;

  const nextValue = values.includes(currentValue) ? currentValue : "all";
  select.value = nextValue;

  if (selectId === "newsYearFilter") newsFilterState.year = nextValue;
  if (selectId === "newsCategoryFilter") newsFilterState.category = nextValue;
  if (selectId === "newsAudienceFilter") newsFilterState.audience = nextValue;
}

function getUniqueNewsValues(field) {
  return Array.from(
    new Set(
      newsItems
        .map((item) => (item[field] || "").toString().trim())
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a, "th"));
}

function getFilteredNewsItems() {
  const query = newsFilterState.query.toLowerCase();

  return newsItems.filter((item) => {
    if (newsFilterState.year !== "all" && (item.year || "").trim() !== newsFilterState.year) {
      return false;
    }
    if (newsFilterState.category !== "all" && (item.category || "").trim() !== newsFilterState.category) {
      return false;
    }
    if (newsFilterState.audience !== "all" && (item.audience || "").trim() !== newsFilterState.audience) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      item.title,
      item.summary,
      item.category,
      item.audience,
      item.year,
      item.date
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function getProcessedNewsItems() {
  const filteredItems = getFilteredNewsItems();
  return filteredItems.sort((a, b) => compareNewsItems(a, b, newsFilterState.sort));
}

function compareNewsItems(a, b, mode) {
  if (mode === "title") {
    return (a.title || "").localeCompare((b.title || ""), "th");
  }

  const pinDiff = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
  const timeA = parseNewsDate(a.date)?.getTime() || 0;
  const timeB = parseNewsDate(b.date)?.getTime() || 0;

  if (mode === "oldest") {
    if (timeA !== timeB) return timeA - timeB;
    return (a.title || "").localeCompare((b.title || ""), "th");
  }

  if (mode === "pinned" && pinDiff !== 0) {
    return pinDiff;
  }

  if (timeA !== timeB) {
    return timeB - timeA;
  }
  if (mode === "pinned" && pinDiff !== 0) {
    return pinDiff;
  }
  return (a.title || "").localeCompare((b.title || ""), "th");
}

function updateNewsFilterSummary(visibleCount, filteredCount, totalCount) {
  const summaryEl = document.getElementById("newsFilterSummary");
  if (!summaryEl) return;

  if (!totalCount) {
    summaryEl.textContent = "ยังไม่มีข่าวให้แสดง";
    return;
  }

  if (filteredCount === totalCount && visibleCount === filteredCount) {
    summaryEl.textContent = `แสดงข่าวทั้งหมด ${totalCount} รายการ`;
    return;
  }

  if (visibleCount < filteredCount) {
    summaryEl.textContent = `แสดง ${visibleCount} จาก ${filteredCount} รายการ (${totalCount} ทั้งหมด)`;
    return;
  }

  summaryEl.textContent = `แสดง ${filteredCount} จาก ${totalCount} รายการ`;
}

function updateNewsLoadMoreVisibility(shouldShow) {
  const actionEl = document.querySelector(".news-list-actions");
  const buttonEl = document.getElementById("newsLoadMoreBtn");
  if (!actionEl || !buttonEl) return;
  actionEl.hidden = !shouldShow;
  buttonEl.hidden = !shouldShow;
}

function resetNewsVisibleCount() {
  newsVisibleCount = NEWS_PAGE_SIZE;
}

function escapeNewsHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

  openDialog(newsModalEl, { focusSelector: "#newsModalClose" });
}

function closeNewsModal() {
  if (!newsModalEl) return;
  closeDialog(newsModalEl);
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

  const topNews = newsItems.slice(0, HOME_NEWS_PREVIEW_LIMIT);
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

  container.querySelectorAll("[data-goto-page]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const page = el.dataset.gotoPage;
      if (!page) return;
      const targetHash = `#${page}`;
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      } else {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
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
