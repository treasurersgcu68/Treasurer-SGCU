/* Scoreboard: SGCU-10.001 */
const SCOREBOARD_BASE_SCORE = 100;

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
  renderScoreSkeleton(podiumEl, runnersEl);

  return Promise.resolve()
    .then(async () => {
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("scoreboard", 0.15);
      }
      if (typeof ensureProjectDataLoaded === "function") {
        await ensureProjectDataLoaded();
      }
      if (typeof updateLoaderProgress === "function") {
        updateLoaderProgress("scoreboard", 0.75);
      }

      const scoreCacheKey = getScoreboardCacheKey();
      const cached = getCache(scoreCacheKey, CACHE_TTL_MS);
      if (cached && Array.isArray(cached) && cached.length) {
        return cached;
      }

      const items = buildScoreboardFromProjects(projects || []);
      if (items.length) {
        setCache(scoreCacheKey, items);
      }
      return items;
    })
    .then((items) => {
      if (!items.length) {
        renderLoadState(podiumEl, "empty", "ยังไม่มีข้อมูลคะแนน");
        runnersEl.innerHTML = "";
        return;
      }

      const podium = items.slice(0, 3);
      const runners = items.slice(3, 8);

      renderScorePodium(podiumEl, podium);
      renderScoreRunners(runnersEl, runners);
    })
    .catch((err) => {
      console.error("Error calculating project scoreboard - app.scoreboard.js", err);
      recordLoadError("scoreboard", "โหลดคะแนนไม่สำเร็จ", { showRetry: true });
      if (podiumEl) {
        setInlineError(podiumEl, "ไม่สามารถโหลดผลคะแนนได้ในขณะนี้", {
          retryButtonId: "scoreboardRetryButton",
          onRetry: () => initScoreboard()
        });
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

function getScoreboardCacheKey() {
  const year = (typeof selectedProjectSourceYear === "string" ? selectedProjectSourceYear : "").trim();
  return `${CACHE_KEYS.SCOREBOARD}:project-derived:v1:${year || "active"}`;
}

function buildScoreboardFromProjects(projectList) {
  const grouped = new Map();
  const list = Array.isArray(projectList) ? projectList : [];

  list.forEach((project) => {
    const code = normalizeScoreOrgName(project?.code);
    if (!code) return;
    if (!isScoreboardEligibleProject(project)) return;

    const org = normalizeScoreOrgName(project?.orgName || project?.orgGroup);
    if (!org) return;

    const score = calculateProjectScore(project);
    if (!Number.isFinite(score)) return;

    const current = grouped.get(org) || { org, score: SCOREBOARD_BASE_SCORE, projectCount: 0 };
    current.score += score;
    current.projectCount += 1;
    grouped.set(org, current);
  });

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      score: Math.round(item.score * 100) / 100
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.org.localeCompare(b.org, "th");
    });
}

function calculateProjectScore(project) {
  const budget = Number(project?.approvedBudget100 ?? project?.budget ?? 0);
  if (!Number.isFinite(budget)) return 0;

  const days = resolveProjectCloseDurationDays(project);
  if (!Number.isFinite(days)) return 0;

  const earlyMultiplier = getScoreEarlyMultiplier(budget);
  const lateMultiplier = getScoreLateMultiplier(budget);
  const earlyScore = days <= 14 ? (14 - days) * earlyMultiplier : 0;
  const latePenalty = days >= 15 ? 2 * (days - 14) * lateMultiplier : 0;

  return earlyScore - latePenalty;
}

function isScoreboardEligibleProject(project) {
  return (project?.statusClose || "").toString().trim() === "ส่งกิจการนิสิตเรียบร้อย";
}

function resolveProjectCloseDurationDays(project) {
  const rawDuration = project?.closeDurationText ?? project?.closeDuration ?? "";
  const durationText = (rawDuration ?? "").toString().trim();
  if (durationText !== "") {
    const duration = parseFloat(durationText.replace(/,/g, "").replace(/[^\d.-]/g, ""));
    return Number.isFinite(duration) ? duration : null;
  }

  const dueDate =
    project?.closeDueDateObj instanceof Date
      ? project.closeDueDateObj
      : (typeof parseProjectDate === "function" ? parseProjectDate(project?.closeDueDate) : null);
  if (!(dueDate instanceof Date) || Number.isNaN(dueDate.getTime())) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  return Math.floor((todayStart.getTime() - dueStart.getTime()) / 86400000);
}

function getScoreEarlyMultiplier(budget) {
  if (budget < 10000) return 1.125;
  if (budget < 25000) return 1.25;
  if (budget < 150000) return 1.5;
  if (budget < 1000000) return 2;
  return 4;
}

function getScoreLateMultiplier(budget) {
  if (budget < 10000) return 4;
  if (budget < 25000) return 2;
  if (budget < 150000) return 1.5;
  if (budget < 1000000) return 1.25;
  return 1.125;
}

function renderScoreSkeleton(podiumEl, runnersEl) {
  podiumEl.innerHTML = `
    <div class="score-loading-status" role="status" aria-live="polite">กำลังโหลดผลคะแนน...</div>
    <div class="score-podium-card score-skeleton-card second" aria-hidden="true">
      <div class="score-skeleton-medal"></div>
      <div class="score-skeleton-line score-skeleton-line-rank"></div>
      <div class="score-skeleton-line score-skeleton-line-name"></div>
      <div class="score-skeleton-line score-skeleton-line-score"></div>
    </div>
    <div class="score-podium-card score-skeleton-card first" aria-hidden="true">
      <div class="score-skeleton-badge"></div>
      <div class="score-skeleton-medal"></div>
      <div class="score-skeleton-line score-skeleton-line-rank"></div>
      <div class="score-skeleton-line score-skeleton-line-name"></div>
      <div class="score-skeleton-line score-skeleton-line-score"></div>
    </div>
    <div class="score-podium-card score-skeleton-card third" aria-hidden="true">
      <div class="score-skeleton-medal"></div>
      <div class="score-skeleton-line score-skeleton-line-rank"></div>
      <div class="score-skeleton-line score-skeleton-line-name"></div>
      <div class="score-skeleton-line score-skeleton-line-score"></div>
    </div>
  `;

  runnersEl.style.display = "flex";
  runnersEl.innerHTML = `
    <span class="score-skeleton-title" aria-hidden="true"></span>
    <span class="score-skeleton-chip" aria-hidden="true"></span>
    <span class="score-skeleton-chip" aria-hidden="true"></span>
    <span class="score-skeleton-chip" aria-hidden="true"></span>
    <span class="score-skeleton-chip score-skeleton-chip-short" aria-hidden="true"></span>
  `;
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
