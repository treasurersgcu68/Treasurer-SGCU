/* Motion helpers: section appear + count up */
let homePanelObserver = null;
let hasInitPressMotion = false;

function initSectionAppearObserver() {
  const sections = document.querySelectorAll(".section-appear");
  if (!sections.length) return;

  if (sectionObserver) {
    sectionObserver.disconnect();
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach((sec) => sectionObserver.observe(sec));
}

function initHomePanelMotion() {
  const homePage = document.querySelector('.page-view[data-page="home"]');
  const homeSnapContainer = homePage?.querySelector(".home-snap-container");
  const panels = Array.from(homePage?.querySelectorAll(".home-snap-panel") || []);
  if (!homePage || !homePage.classList.contains("active") || !homeSnapContainer || !panels.length) return;

  if (homePanelObserver) {
    homePanelObserver.disconnect();
  }

  const revealPanel = (panel) => panel.classList.add("home-panel-visible");
  panels.forEach((panel) => panel.classList.remove("home-panel-visible"));

  if (!("IntersectionObserver" in window)) {
    panels.forEach(revealPanel);
    return;
  }

  homePanelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealPanel(entry.target);
      });
    },
    {
      root: homeSnapContainer,
      threshold: 0.28,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  panels.forEach((panel, index) => {
    if (index === 0) revealPanel(panel);
    homePanelObserver.observe(panel);
  });
}

function initPressMotion() {
  if (hasInitPressMotion) return;
  hasInitPressMotion = true;

  const interactiveSelector = [
    ".btn-primary",
    ".btn-secondary",
    ".btn-ghost",
    ".scope-pill",
    ".home-news-link",
    ".home-scroll-hint",
    ".tab-btn",
    ".mobile-bottom-item"
  ].join(",");

  document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const control = target.closest(interactiveSelector);
    if (!(control instanceof HTMLElement) || control.hasAttribute("disabled")) return;

    control.classList.add("is-pressing");
    window.setTimeout(() => control.classList.remove("is-pressing"), 180);

    if (!control.matches(".btn-primary, .btn-secondary, .scope-pill")) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = control.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.9;
    const ripple = document.createElement("span");
    ripple.className = "motion-ripple";
    control.classList.add("has-motion-ripple");
    ripple.style.setProperty("--ripple-size", `${size}px`);
    ripple.style.setProperty("--ripple-x", `${event.clientX - rect.left}px`);
    ripple.style.setProperty("--ripple-y", `${event.clientY - rect.top}px`);
    control.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
}

function initCountupOnVisible() {
  const elements = document.querySelectorAll("[data-countup]");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseFloat(el.dataset.countup || "0") || 0;
        const duration = 900;
        const startTime = performance.now();

        function animate(now) {
          const t = Math.min((now - startTime) / duration, 1);
          const eased = t * (2 - t); // ease-out
          const value = Math.floor(target * eased);
          el.textContent = value.toLocaleString("th-TH");
          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toLocaleString("th-TH");
          }
        }
        requestAnimationFrame(animate);

        obs.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  elements.forEach((el) => observer.observe(el));
  hasInitCountup = true;
}

/* เรียกใหม่ทุกครั้งที่เปลี่ยนหน้า (เผื่อ DOM เปลี่ยน) */
function refreshMotionForActivePage() {
  initPressMotion();
  initSectionAppearObserver();
  initHomePanelMotion();
  if (!hasInitCountup) {
    initCountupOnVisible();
  }
}
