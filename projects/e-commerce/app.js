/* ============================================
   KANZA MARKET — Données produits (fictifs)
   ============================================ */

const CATEGORY_LABELS = {
  telephones: "Téléphones",
  ordinateurs: "Ordinateurs",
  vetements: "Vêtements",
  chaussures: "Chaussures",
  accessoires: "Accessoires",
};

const CATEGORY_COLORS = {
  telephones: "var(--cat-tel)",
  ordinateurs: "var(--cat-pc)",
  vetements: "var(--cat-vet)",
  chaussures: "var(--cat-chaussure)",
  accessoires: "var(--cat-access)",
};

const PRODUCTS = [
  { id: "p1", cat: "telephones", name: "Nova X12 128 Go", price: 249900, oldPrice: null, rating: 4.6, badge: "new", desc: "Écran 6,5\" AMOLED, triple capteur photo 50 Mpx et batterie longue durée pour un usage intensif au quotidien." },
  { id: "p2", cat: "telephones", name: "Nova Lite 64 Go", price: 129900, oldPrice: 159900, rating: 4.3, badge: "promo", desc: "Un smartphone fiable et abordable, écran 6,1\" et double capteur photo, idéal pour un usage quotidien." },
  { id: "p3", cat: "telephones", name: "Pulse Z Pro 256 Go", price: 349900, oldPrice: null, rating: 4.8, badge: null, desc: "Le haut de gamme de la marque : écran 120Hz, charge rapide 65W et résistance à l'eau IP68." },
  { id: "p4", cat: "ordinateurs", name: "UltraBook 14 i5", price: 549900, oldPrice: null, rating: 4.5, badge: "new", desc: "Ultrabook léger (1,2 kg), processeur i5, 16 Go de RAM et SSD 512 Go — parfait pour le travail nomade." },
  { id: "p5", cat: "ordinateurs", name: "WorkStation 15 i7", price: 799900, oldPrice: 899900, rating: 4.7, badge: "promo", desc: "Puissance et confort d'affichage 15,6\" Full HD, processeur i7 et 32 Go de RAM pour le multitâche exigeant." },
  { id: "p6", cat: "ordinateurs", name: "EcoBook 11 Essentiel", price: 229900, oldPrice: null, rating: 4.1, badge: null, desc: "Un compagnon léger pour la bureautique et la navigation, autonomie de 10 heures." },
  { id: "p7", cat: "vetements", name: "Veste urbaine Trail", price: 27500, oldPrice: null, rating: 4.4, badge: "new", desc: "Veste coupe-vent déperlante, coupe ajustée, idéale pour les journées changeantes." },
  { id: "p8", cat: "vetements", name: "T-shirt coton Essential", price: 8900, oldPrice: null, rating: 4.2, badge: null, desc: "Coton peigné doux et respirant, coupe régulière, disponible en plusieurs coloris." },
  { id: "p9", cat: "vetements", name: "Jean slim Heritage", price: 22900, oldPrice: 27900, rating: 4.5, badge: "promo", desc: "Denim résistant à coupe slim, confortable pour un usage quotidien." },
  { id: "p10", cat: "chaussures", name: "Stride Air Running", price: 34900, oldPrice: null, rating: 4.6, badge: "new", desc: "Chaussures de running légères, amorti réactif et maintien latéral renforcé." },
  { id: "p11", cat: "chaussures", name: "Urban Classic Sneakers", price: 27900, oldPrice: 32900, rating: 4.3, badge: "promo", desc: "Sneakers intemporelles en cuir synthétique, semelle confort pour un usage toute la journée." },
  { id: "p12", cat: "chaussures", name: "Trek Boots Explorer", price: 41900, oldPrice: null, rating: 4.7, badge: null, desc: "Chaussures de randonnée résistantes à l'eau, adhérence renforcée sur tous les terrains." },
  { id: "p13", cat: "accessoires", name: "Écouteurs SoundWave Pro", price: 39900, oldPrice: null, rating: 4.5, badge: "new", desc: "Écouteurs sans fil à réduction de bruit active, 30h d'autonomie avec le boîtier." },
  { id: "p14", cat: "accessoires", name: "Montre connectée Pulse Fit", price: 44900, oldPrice: 54900, rating: 4.4, badge: "promo", desc: "Suivi du rythme cardiaque, du sommeil et des activités sportives, étanche 5 ATM." },
  { id: "p15", cat: "accessoires", name: "Sac à dos UrbanCommute", price: 19900, oldPrice: null, rating: 4.2, badge: null, desc: "Compartiment rembourré pour ordinateur 15\", tissu résistant à l'eau, poches multiples." },
  { id: "p16", cat: "accessoires", name: "Batterie externe PowerBank 20K", price: 14900, oldPrice: null, rating: 4.3, badge: null, desc: "20 000 mAh, charge rapide double USB-C, de quoi recharger un téléphone plusieurs fois." },
];

function formatPrice(value) {
  return value.toLocaleString("fr-FR") + " FCFA";
}

/* ============================================
   Sélection "comparer" (case à cocher)
   ============================================ */

const compareSelection = new Set();

function toggleCompare(id, checkboxEl) {
  if (compareSelection.has(id)) compareSelection.delete(id);
  else compareSelection.add(id);

  checkboxEl.classList.toggle("is-checked", compareSelection.has(id));

  const note = document.getElementById("compareNote");
  const countEl = document.getElementById("compareCount");
  countEl.textContent = compareSelection.size;
  note.hidden = compareSelection.size === 0;
}

/* ============================================
   Icônes produit (SVG par catégorie)
   ============================================ */

function productIcon(cat) {
  const color = CATEGORY_COLORS[cat];
  const icons = {
    telephones: `<svg viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="2.5"><rect x="20" y="6" width="24" height="52" rx="5"/><line x1="20" y1="46" x2="44" y2="46"/><circle cx="32" cy="52" r="1.6" fill="${color}"/></svg>`,
    ordinateurs: `<svg viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="2.5"><rect x="10" y="12" width="44" height="28" rx="3"/><path d="M4 50 L60 50 L54 40 L10 40 Z"/></svg>`,
    vetements: `<svg viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"><path d="M22 10 L32 16 L42 10 L54 18 L46 28 L42 24 L42 54 L22 54 L22 24 L18 28 L10 18 Z"/></svg>`,
    chaussures: `<svg viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"><path d="M8 46 C8 40 14 38 20 34 C26 30 28 22 32 22 C36 22 36 28 40 30 C46 33 56 32 58 40 C59 44 57 46 52 46 Z"/><line x1="8" y1="46" x2="58" y2="46"/></svg>`,
    accessoires: `<svg viewBox="0 0 64 64" fill="none" stroke="${color}" stroke-width="2.5"><circle cx="32" cy="32" r="18"/><path d="M32 22 L32 32 L40 38"/></svg>`,
  };
  return icons[cat] || icons.accessoires;
}

/* ============================================
   Icônes lucide
   ============================================ */

if (window.lucide) lucide.createIcons();

/* ============================================
   État panier
   ============================================ */

let cart = [];

function cartTotalItems() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartSubtotal() {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

function addToCart(id, qty = 1) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id, qty });
  renderCart();
  const product = PRODUCTS.find(p => p.id === id);
  showToast(`${product.name} ajouté au panier`);
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

/* ============================================
   Réactivité 3D — tilt au survol (réutilisable)
   ============================================ */

function attachTilt(elements, maxTilt = 8) {
  elements.forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - py) * maxTilt * 2;
      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}

/* ============================================
   Stack technique recommandée
   ============================================ */

const TECH_STACK = [
  { name: "React & Next.js", icon: "layout-dashboard", color: "var(--cat-tel)", desc: "Interface rapide, rendu hybride (SSR/SSG) pour un référencement optimal du catalogue." },
  { name: "Node.js & Express", icon: "server", color: "var(--cat-pc)", desc: "API robuste pour gérer catalogue, commandes et logique métier côté serveur." },
  { name: "PostgreSQL", icon: "database", color: "var(--cat-access)", desc: "Base de données relationnelle fiable pour produits, stocks et historiques de commandes." },
  { name: "Stripe & Mobile Money", icon: "credit-card", color: "var(--primary)", desc: "Paiement carte sécurisé, complété par Orange Money, MTN MoMo et Wave pour le marché local." },
  { name: "Docker & CI/CD", icon: "box", color: "var(--cat-chaussure)", desc: "Déploiements reproductibles et automatisés, du développement à la production." },
  { name: "Vercel / AWS", icon: "cloud", color: "var(--cat-vet)", desc: "Hébergement scalable avec CDN global pour des temps de chargement courts partout." },
];

const techGrid = document.getElementById("techGrid");

function renderTechStack() {
  if (!techGrid) return;
  techGrid.innerHTML = TECH_STACK.map(t => `
    <article class="tech-card" data-reveal style="--tech-glow:${t.color}">
      <div class="tech-sheen"></div>
      <div class="tech-icon"><i data-lucide="${t.icon}"></i></div>
      <h3>${t.name}</h3>
      <p>${t.desc}</p>
    </article>`).join("");

  if (window.lucide) lucide.createIcons();
  document.querySelectorAll("#techGrid [data-reveal]").forEach(el => revealObserver.observe(el));
  attachTilt(document.querySelectorAll(".tech-card"), 8);
}

/* ============================================
   Produits recommandés — graphique dynamique
   ============================================ */

function renderRecommended() {
  const list = document.getElementById("recommendedList");
  if (!list) return;

  const top = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 5);

  list.innerHTML = top.map(p => `
    <div class="rec-row" data-reveal>
      <span class="rec-name">${p.name}</span>
      <div class="rec-track">
        <div class="rec-fill" data-target="${(p.rating / 5) * 100}"></div>
      </div>
      <span class="rec-score">${p.rating.toFixed(1)}/5</span>
    </div>`).join("");

  document.querySelectorAll("#recommendedList [data-reveal]").forEach(el => revealObserver.observe(el));

  // Anime chaque barre jusqu'à sa largeur cible une fois visible
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target.querySelector(".rec-fill");
      requestAnimationFrame(() => { fill.style.width = `${fill.dataset.target}%`; });
      barObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll(".rec-row").forEach(row => barObserver.observe(row));
}

/* ============================================
   Rendu produits
   ============================================ */

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");

function renderProducts() {
  productGrid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card" data-id="${p.id}" data-cat="${p.cat}" data-reveal style="--glow-color:${CATEGORY_COLORS[p.cat]}">
      <div class="product-visual">
        ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === "promo" ? "Promo" : "Nouveau"}</span>` : ""}
        <button class="compare-check" data-action="toggle-compare" aria-label="Sélectionner pour comparaison">
          <svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg>
        </button>
        ${productIcon(p.cat)}
        <div class="product-sheen"></div>
        <button class="quick-view-btn" data-action="quick-view" aria-label="Aperçu rapide"><i data-lucide="eye"></i></button>
      </div>
      <div class="product-body">
        <span class="product-cat" style="color:${CATEGORY_COLORS[p.cat]}">${CATEGORY_LABELS[p.cat]}</span>
        <h3>${p.name}</h3>
        <div class="product-rating">
          <i data-lucide="star"></i>
          <span>${p.rating.toFixed(1)} / 5</span>
        </div>
        <div class="product-price-row">
          <span class="price-now">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ""}
        </div>
        <button class="add-to-cart-btn" data-action="add-cart">
          <i data-lucide="shopping-bag"></i>
          <span class="btn-label">Ajouter au panier</span>
          <span class="btn-spinner" aria-hidden="true"></span>
        </button>
      </div>
    </article>`).join("");

  if (window.lucide) lucide.createIcons();
  document.querySelectorAll("#productGrid [data-reveal]").forEach(el => revealObserver.observe(el));
  attachTilt(document.querySelectorAll(".product-card"), 6);
}

/* ============================================
   Filtres + recherche
   ============================================ */

let activeFilter = "all";

function applyFilters() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  let visibleCount = 0;

  document.querySelectorAll(".product-card").forEach(card => {
    const product = PRODUCTS.find(p => p.id === card.dataset.id);
    const matchCat = activeFilter === "all" || card.dataset.cat === activeFilter;
    const matchSearch = !search || product.name.toLowerCase().includes(search);
    const visible = matchCat && matchSearch;
    card.classList.toggle("is-hidden", !visible);
    if (visible) visibleCount++;
  });

  emptyState.hidden = visibleCount !== 0;
}

document.querySelectorAll(".filter-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach(c => {
      c.classList.remove("is-active");
      c.setAttribute("aria-selected", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-selected", "true");
    activeFilter = chip.dataset.filter;
    applyFilters();
  });
});

document.getElementById("searchInput").addEventListener("input", applyFilters);

document.querySelectorAll("[data-footer-filter]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const filter = link.dataset.footerFilter;
    document.querySelectorAll(".filter-chip").forEach(c => {
      const match = c.dataset.filter === filter;
      c.classList.toggle("is-active", match);
      c.setAttribute("aria-selected", String(match));
    });
    activeFilter = filter;
    applyFilters();
    document.getElementById("boutique").scrollIntoView({ behavior: "smooth" });
  });
});

/* ============================================
   Interaction sur la grille (délégation d'événements)
   ============================================ */

productGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;
  const product = PRODUCTS.find(p => p.id === card.dataset.id);
  const actionBtn = e.target.closest("[data-action]");
  const action = actionBtn?.dataset.action;

  if (action === "add-cart") {
    if (actionBtn.classList.contains("is-loading")) return;
    actionBtn.classList.add("is-loading");
    setTimeout(() => {
      actionBtn.classList.remove("is-loading");
      addToCart(product.id);
    }, 550);
  } else if (action === "quick-view") {
    openQuickView(product);
  } else if (action === "toggle-compare") {
    toggleCompare(product.id, actionBtn);
  } else {
    openQuickView(product);
  }
});

/* ============================================
   Quick view modal
   ============================================ */

const quickViewOverlay = document.getElementById("quickViewOverlay");
const quickViewCard = document.getElementById("quickViewCard");

function openQuickView(product) {
  quickViewCard.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid var(--border);">
      <span class="product-cat" style="color:${CATEGORY_COLORS[product.cat]}">${CATEGORY_LABELS[product.cat]}</span>
      <button class="drawer-close" data-action="close-modal" aria-label="Fermer">✕</button>
    </div>
    <div style="padding:24px 24px 28px; display:flex; gap:22px; flex-wrap:wrap;">
      <div style="flex:0 0 200px; height:200px; background:var(--bg-page); border-radius:14px; display:flex; align-items:center; justify-content:center;">
        <div style="width:100px; height:100px;">${productIcon(product.cat)}</div>
      </div>
      <div style="flex:1; min-width:220px;">
        <h3 style="font-family:var(--font-display); font-size:21px; margin:0 0 8px;">${product.name}</h3>
        <div class="product-rating" style="margin-bottom:12px;"><i data-lucide="star"></i><span>${product.rating.toFixed(1)} / 5</span></div>
        <p style="font-size:13.5px; color:var(--ink-600); line-height:1.6; margin:0 0 18px;">${product.desc}</p>
        <div class="product-price-row" style="margin-bottom:18px;">
          <span class="price-now" style="font-size:22px;">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="price-old">${formatPrice(product.oldPrice)}</span>` : ""}
        </div>
        <button class="add-to-cart-btn" style="max-width:220px;" data-action="modal-add">
          <i data-lucide="shopping-bag"></i>
          <span class="btn-label">Ajouter au panier</span>
          <span class="btn-spinner" aria-hidden="true"></span>
        </button>
      </div>
    </div>`;

  quickViewCard.dataset.productId = product.id;
  quickViewOverlay.classList.add("is-open");
  if (window.lucide) lucide.createIcons();
}

function closeQuickView() { quickViewOverlay.classList.remove("is-open"); }

quickViewCard.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  const action = btn?.dataset.action;
  if (action === "close-modal") closeQuickView();
  if (action === "modal-add") {
    if (btn.classList.contains("is-loading")) return;
    btn.classList.add("is-loading");
    setTimeout(() => {
      addToCart(quickViewCard.dataset.productId);
      closeQuickView();
    }, 550);
  }
});

quickViewOverlay.addEventListener("click", (e) => { if (e.target === quickViewOverlay) closeQuickView(); });

/* ============================================
   Cart drawer
   ============================================ */

const cartOverlay = document.getElementById("cartOverlay");
const cartBody = document.getElementById("cartBody");
const cartCountEl = document.getElementById("cartCount");
const cartSubtotalEl = document.getElementById("cartSubtotal");

function renderCart() {
  cartCountEl.textContent = cartTotalItems();

  if (cart.length === 0) {
    cartBody.innerHTML = `<p class="cart-empty">Votre panier est vide pour le moment.</p>`;
  } else {
    cartBody.innerHTML = cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.id);
      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-visual">${productIcon(product.cat)}</div>
          <div class="cart-item-info">
            <h4>${product.name}</h4>
            <span>${formatPrice(product.price)}</span>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="qty-minus">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="qty-plus">+</button>
          </div>
          <button class="cart-item-remove" data-action="remove" aria-label="Retirer">✕</button>
        </div>`;
    }).join("");
  }

  cartSubtotalEl.textContent = formatPrice(cartSubtotal());
}

cartBody.addEventListener("click", (e) => {
  const row = e.target.closest(".cart-item");
  if (!row) return;
  const id = row.dataset.id;
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "qty-plus") updateQty(id, 1);
  if (action === "qty-minus") updateQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

document.getElementById("cartToggle").addEventListener("click", () => cartOverlay.classList.add("is-open"));
document.getElementById("cartClose").addEventListener("click", () => cartOverlay.classList.remove("is-open"));
cartOverlay.addEventListener("click", (e) => { if (e.target === cartOverlay) cartOverlay.classList.remove("is-open"); });

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Votre panier est vide");
    return;
  }
  showToast("Commande simulée — merci pour cette démo !");
  cart = [];
  renderCart();
  cartOverlay.classList.remove("is-open");
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  closeQuickView();
  cartOverlay.classList.remove("is-open");
});

/* ============================================
   Newsletter (simulation)
   ============================================ */

document.getElementById("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("Merci pour votre inscription !");
  document.getElementById("newsletterEmail").value = "";
});

/* ============================================
   Toast
   ============================================ */

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

/* ============================================
   Nav mobile
   ============================================ */

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("is-open")));

/* ============================================
   Scroll reveal
   ============================================ */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

document.querySelectorAll("[data-reveal]").forEach(el => revealObserver.observe(el));

/* ============================================
   Compteurs animés (stats hero)
   ============================================ */

function animateCount(el, target, duration = 1400, suffixIsSlash = false) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = suffixIsSlash ? (value / 10).toFixed(1) : value.toLocaleString("fr-FR");
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const heroStats = document.querySelector(".hero-stats");
if (heroStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll(".stat-value").forEach((el, i) => {
        animateCount(el, Number(el.dataset.count), 1400, i === 1);
      });
      statsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  statsObserver.observe(heroStats);
}

/* ============================================
   Init
   ============================================ */

renderProducts();
renderTechStack();
renderRecommended();
applyFilters();
renderCart();
