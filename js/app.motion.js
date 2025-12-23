/* Motion helpers: section appear + count up */

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
  initSectionAppearObserver();
  if (!hasInitCountup) {
    initCountupOnVisible();
  }
}

