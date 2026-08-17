/* ============================================
   Icons (lucide)
   ============================================ */

if (window.lucide) {
  lucide.createIcons();
}

/* ============================================
   Scroll reveal (IntersectionObserver)
   ============================================ */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll("[data-reveal]").forEach(el => revealObserver.observe(el));

/* ============================================
   Animated stat counters
   ============================================ */

function animateCount(el, target, duration = 1400) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statsWrap = document.querySelector(".mission-stats");
if (statsWrap) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".stat-value").forEach(el => {
        animateCount(el, Number(el.dataset.count));
      });
      statsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  statsObserver.observe(statsWrap);
}
