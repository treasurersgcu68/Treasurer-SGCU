/* Feature loader: page -> scripts + on-demand loading */
(function initFeatureLoader() {
  if (window.sgcuFeatureLoader) return;

  const config = {
    vendorScripts: {
      chart: "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js",
      papa: "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"
    },
    pageScripts: {
      home: [
        "js/features/news/app.news.js?v=20260417-1",
        "js/features/news/app.scoreboard.js?v=20260501-1"
      ],
      news: "js/features/news/app.news.js?v=20260417-1",
      "financial-docs": "js/features/docs/app.downloads.js?v=20260501-1",
      "borrow-assets": "js/features/borrow/app.borrow-assets.js?v=20260417-6",
      "borrow-assets-staff": "js/features/borrow/app.borrow-assets.js?v=20260417-6",
      "meeting-room-booking": "js/features/booking/app.meeting-room-booking.js?v=20260415-15",
      "meeting-room-staff": "js/features/booking/app.meeting-room-staff.js?v=20260415-4",
      "budget-approval-request": "js/features/budget/app.budget-request.js?v=20260414-1",
      login: [
        "js/features/staff/app.staff-access.js?v=20260430-7",
        "js/features/budget/app.budget-request.js?v=20260414-2"
      ],
      "staff-application": "js/features/staff/app.staff-access.js?v=20260430-7",
      "staff-approval": "js/features/staff/app.staff-access.js?v=20260430-7"
    },
    idlePrefetchPages: [
      "home",
      "news",
      "financial-docs"
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

  const ensureVendorLoaded = async (key, globalName) => {
    if (globalName && window[globalName]) {
      if (key === "chart" && typeof window.registerCenterTextPlugin === "function") {
        window.registerCenterTextPlugin();
      }
      return;
    }
    const src = config.vendorScripts[key];
    if (!src) return;
    await loadScriptOnce(src);
    if (key === "chart" && typeof window.registerCenterTextPlugin === "function") {
      window.registerCenterTextPlugin();
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
  window.sgcuVendorLoader = {
    ensureChart: () => ensureVendorLoaded("chart", "Chart"),
    ensurePapa: () => ensureVendorLoaded("papa", "Papa")
  };
})();
