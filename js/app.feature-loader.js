/* Feature loader: page -> scripts + on-demand loading */
(function initFeatureLoader() {
  if (window.sgcuFeatureLoader) return;

  const config = {
    pageScripts: {
      home: [
        "js/app.news.js?v=20260417-1",
        "js/app.scoreboard.js?v=20260417-1"
      ],
      news: "js/app.news.js?v=20260417-1",
      "financial-docs": "js/app.downloads.js?v=20260417-1",
      "borrow-assets": "js/app.borrow-assets.js?v=20260417-6",
      "borrow-assets-staff": "js/app.borrow-assets.js?v=20260417-6",
      "meeting-room-booking": "js/app.meeting-room-booking.js?v=20260415-15",
      "meeting-room-staff": "js/app.meeting-room-staff.js?v=20260415-4",
      "budget-approval-request": "js/app.budget-request.js?v=20260414-1"
    },
    idlePrefetchPages: [
      "home",
      "news",
      "financial-docs",
      "borrow-assets",
      "meeting-room-booking",
      "borrow-assets-staff",
      "meeting-room-staff",
      "budget-approval-request"
    ]
  };

  const loadedFeatureScripts = new Map();

  const toScriptList = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => (item || "").toString().trim()).filter(Boolean);
    }
    const one = (value || "").toString().trim();
    return one ? [one] : [];
  };

  const loadScriptOnce = async (src) => {
    const scriptSrc = (src || "").toString().trim();
    if (!scriptSrc) return;
    if (loadedFeatureScripts.has(scriptSrc)) {
      await loadedFeatureScripts.get(scriptSrc);
      return;
    }

    const promise = new Promise((resolve, reject) => {
      const scriptEl = document.createElement("script");
      scriptEl.src = scriptSrc;
      scriptEl.defer = true;
      scriptEl.async = false;
      scriptEl.onload = () => resolve();
      scriptEl.onerror = () => reject(new Error(`failed to load ${scriptSrc}`));
      document.body.appendChild(scriptEl);
    }).catch((error) => {
      loadedFeatureScripts.delete(scriptSrc);
      throw error;
    });

    loadedFeatureScripts.set(scriptSrc, promise);
    await promise;
  };

  const ensurePageLoaded = async (page) => {
    const scripts = toScriptList(config.pageScripts[page]);
    for (const src of scripts) {
      await loadScriptOnce(src);
    }
  };

  const scheduleIdle = (task, timeout = 2000) => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(() => task(), { timeout });
    } else {
      window.setTimeout(task, 0);
    }
  };

  const prefetchInIdle = (currentPage = "") => {
    const pages = Array.isArray(config.idlePrefetchPages) ? config.idlePrefetchPages : [];
    if (!pages.length) return;

    scheduleIdle(() => {
      pages
        .filter((page) => page && page !== currentPage)
        .forEach((page) => {
          const scripts = toScriptList(config.pageScripts[page]);
          scripts.forEach((src) => {
            void loadScriptOnce(src).catch(() => {
              // ignore idle prefetch failures; page navigation will retry
            });
          });
        });
    }, 2500);
  };

  window.sgcuFeatureLoaderConfig = config;
  window.sgcuFeatureLoader = {
    config,
    ensurePageLoaded,
    prefetchInIdle
  };
})();
