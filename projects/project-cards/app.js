/* ============================================
   Icônes lucide
   ============================================ */

if (window.lucide) lucide.createIcons();

/* ============================================
   Animation 3 — Titres en reveal progressif
   ============================================ */

function buildLetterSpans(titleEl, baseDelay = 0) {
  const text = titleEl.dataset.fullText;
  titleEl.innerHTML = "";
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.animationDelay = `${baseDelay + i * 28}ms`;
    titleEl.appendChild(span);
  });
}

function replayLetterReveal(titleEl) {
  // Retire puis réapplique les spans pour relancer l'animation à chaque ouverture
  buildLetterSpans(titleEl, 120);
  titleEl.querySelectorAll(".letter").forEach(span => {
    span.style.animation = "none";
    // force reflow pour redémarrer l'animation
    void span.offsetWidth;
    span.style.animation = "";
  });
}

document.querySelectorAll(".card-title").forEach(el => buildLetterSpans(el));

/* ============================================
   Animation 1 — Survol 3D réaliste
   ============================================ */

const MAX_TILT = 10; // degrés

document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    if (card.classList.contains("is-active")) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * MAX_TILT * 2;
    const rotateX = (0.5 - py) * MAX_TILT * 2;

    card.style.transform = `perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.015)`;
    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
  });

  card.addEventListener("mouseleave", () => {
    if (card.classList.contains("is-active")) return;
    card.style.transform = "";
  });
});

/* ============================================
   Animation 2 — Clic (expansion)
   ============================================ */

const cardsRow = document.getElementById("cardsRow");
const backdrop = document.getElementById("backdrop");
const cards = document.querySelectorAll(".project-card");

function openCard(card) {
  cards.forEach(c => c.classList.remove("is-active"));
  cardsRow.classList.add("has-active");
  backdrop.classList.add("is-visible");
  card.style.transform = "";
  card.classList.add("is-active");

  const title = card.querySelector(".card-title");
  replayLetterReveal(title);
}

function closeCards() {
  cards.forEach(c => c.classList.remove("is-active"));
  cardsRow.classList.remove("has-active");
  backdrop.classList.remove("is-visible");
}

cards.forEach(card => {
  card.querySelector('[data-action="open"]').addEventListener("click", () => {
    if (card.classList.contains("is-active")) return;
    openCard(card);
  });

  card.querySelector('[data-action="close"]').addEventListener("click", (e) => {
    e.stopPropagation();
    closeCards();
  });
});

backdrop.addEventListener("click", closeCards);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCards();
});
