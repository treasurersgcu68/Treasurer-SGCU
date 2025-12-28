/* Scoreboard: SGCU-10.001 */

function initScoreboard() {
  const podiumEl = document.getElementById("scorePodium");
  const runnersEl = document.getElementById("scoreRunners");
  if (!podiumEl || !runnersEl) {
    if (typeof markLoaderStep === "function") {
      markLoaderStep("scoreboard");
    }
    return;
  }

  podiumEl.classList.remove("score-animate-in");
  runnersEl.classList.remove("score-animate-in");
  podiumEl.innerHTML = `
    <div class="score-loading" role="status" aria-live="polite">
      <div class="score-loading-spinner" aria-hidden="true"></div>
      <div class="score-loading-text">กำลังโหลดผลคะแนน...</div>
      <div class="score-loading-bars" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  runnersEl.innerHTML = "";

  const cached = getCache(CACHE_KEYS.SCOREBOARD, CACHE_TTL_MS);
  if (cached && Array.isArray(cached) && cached.length) {
    const podium = cached.slice(0, 3);
    const runners = cached.slice(3, 8);
    renderScorePodium(podiumEl, podium);
    renderScoreRunners(runnersEl, runners);
    if (typeof markLoaderStep === "function") {
      markLoaderStep("scoreboard");
    }
    return;
  }

  fetchTextWithProgress(SCORE_SHEET, (ratio) => {
    if (typeof updateLoaderProgress === "function") {
      updateLoaderProgress("scoreboard", ratio);
    }
  })
    .then((csvText) => {
      const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
      const rows = parsed.data || [];
      if (rows.length < 2) return;

      const headerRow = rows[0] || [];
      const headerOrgIdx = getHeaderIndex(headerRow, [/องค์กร/i, /org/i, /ฝ่าย/i, /ชมรม/i]);
      const headerScoreIdx = getHeaderIndex(headerRow, [/คะแนน/i, /score/i]);
      const useFallback = headerOrgIdx == null || headerScoreIdx == null;
      const orgColIndex = useFallback ? 13 : headerOrgIdx;
      const scoreColIndex = useFallback ? 14 : headerScoreIdx;

      const items = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const org = normalizeScoreOrgName(row[orgColIndex]); // org name
        const scoreVal = parseFloat(row[scoreColIndex]); // score

        if (!org || Number.isNaN(scoreVal)) continue;
        items.push({ org, score: scoreVal });
      }

      if (!items.length) return;

      items.sort((a, b) => b.score - a.score);
      setCache(CACHE_KEYS.SCOREBOARD, items);

      const podium = items.slice(0, 3);
      const runners = items.slice(3, 8);

      renderScorePodium(podiumEl, podium);
      renderScoreRunners(runnersEl, runners);
    })
    .catch((err) => {
      console.error("Error loading SCORE_SHEET - app.js:4641", err);
      recordLoadError("scoreboard", "โหลดคะแนนไม่สำเร็จ", { showRetry: true });
      if (podiumEl) {
        setInlineError(podiumEl, "ไม่สามารถโหลดผลคะแนนได้ในขณะนี้");
      }
      if (runnersEl) {
        runnersEl.innerHTML = "";
      }
    })
    .finally(() => {
      if (typeof markLoaderStep === "function") {
        markLoaderStep("scoreboard");
      }
    });
}

function normalizeScoreOrgName(value) {
  if (value == null) return "";
  const cleaned = String(value)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

function getHeaderIndex(headerRow, patterns) {
  if (!Array.isArray(headerRow)) return null;
  for (let i = 0; i < headerRow.length; i++) {
    const cell = normalizeScoreOrgName(headerRow[i]).toLowerCase();
    if (!cell) continue;
    if (patterns.some((re) => re.test(cell))) {
      return i;
    }
  }
  return null;
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
        <div class="score-champion-badge" aria-label="อันดับ 1">
          <span class="score-champion-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img" focusable="false">
              <path d="M5 6h3l2-3 2 3h3l-2 3 2 3h-5l-2 3-2-3H5l2-3-2-3z" />
            </svg>
          </span>
          <span class="score-champion-text">Champion</span>
        </div>
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
  requestAnimationFrame(() => {
    container.classList.add("score-animate-in");
  });
}

function renderScoreRunners(container, runners) {
  if (!runners.length) {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";

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
  requestAnimationFrame(() => {
    container.classList.add("score-animate-in");
  });
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
