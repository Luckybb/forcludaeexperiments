// ===== SETTINGS: edit these two lines =====
// 1. Your booking link (Calendly, WhatsApp, etc). Every "Book a free audit call" button uses it.
const BOOKING_URL = "";
// 2. Your contact email, used for the footer link.
const CONTACT_EMAIL = "hello@bncapparel.site";
// ==========================================

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const isMobile = () => window.innerWidth <= 760;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (reduce) document.documentElement.classList.add("reduce");

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("footerEmail").href = "mailto:" + CONTACT_EMAIL;
if (BOOKING_URL) {
  const book = document.getElementById("bookBtn");
  book.href = BOOKING_URL;
  book.target = "_blank";
  book.rel = "noopener";
}

// ---------- Loader ----------
const loader = document.getElementById("loader");
const loadCount = document.getElementById("loadCount");
function finishLoader() {
  loader.classList.add("done");
  introHero();
}
if (reduce) {
  loader.classList.add("done");
} else {
  let n = 0;
  const t0 = performance.now();
  (function tick(now) {
    n = Math.min(100, Math.round(((now - t0) / 1100) * 100));
    loadCount.textContent = n;
    if (n < 100) requestAnimationFrame(tick);
    else setTimeout(finishLoader, 150);
  })(t0);
}

// ---------- Smooth scroll ----------
let lenis = null;
if (!reduce && typeof Lenis !== "undefined") {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  if (hasGsap) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === "#top" ? 0 : -20 });
    })
  );
}

// ---------- 3D portfolio ring hero ----------
const heroState = { scroll: 0 };
(function ring() {
  const ringEl = document.getElementById("ring");
  const cards = [...ringEl.children];
  const n = cards.length, step = 360 / n;
  let radius = 0, rot = 0, tiltX = -6, tiltY = 0, tx = -6, ty = 0, hover = false;
  function layout() {
    const w = cards[0].offsetWidth;
    radius = Math.round((w / 2) / Math.tan(Math.PI / n) * 1.28);
    cards.forEach((c, i) => (c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`));
  }
  function draw() {
    ringEl.style.transform = `translateZ(${-radius}px) rotateX(${tiltX}deg) rotateY(${rot}deg)`;
    cards.forEach((c, i) => {
      const a = ((i * step + rot) % 360 + 360) % 360;
      const facing = Math.cos(a * Math.PI / 180);
      c.style.setProperty("--f", facing.toFixed(3));
      c.style.zIndex = Math.round(facing * 100) + 100;
    });
  }
  layout();
  addEventListener("resize", () => { layout(); draw(); });
  const stage = ringEl.parentElement;
  stage.addEventListener("pointerenter", () => (hover = true));
  stage.addEventListener("pointerleave", () => { hover = false; tx = -6; ty = 0; });
  document.getElementById("hero").addEventListener("pointermove", (e) => {
    tx = -6 - (e.clientY / innerHeight - 0.5) * 12;
    ty = (e.clientX / innerWidth - 0.5) * 30;
  });
  if (reduce) { rot = -20; draw(); return; }
  let last = performance.now(), visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(document.getElementById("hero"));
  (function loop(now) {
    const dt = Math.min(50, now - last); last = now;
    if (visible) {
      rot -= dt * (hover ? 0.006 : 0.018) * (1 + heroState.scroll * 6);
      tiltX += (tx - tiltX) * 0.06;
      tiltY += (ty - tiltY) * 0.06;
      ringEl.parentElement.style.transform = `rotateY(${tiltY * 0.3}deg)`;
      draw();
    }
    requestAnimationFrame(loop);
  })(last);
})();

// ---------- Garment art (original SVG illustrations) ----------
const GARMENTS = {
  tee: `<path class="g" d="M70 26 Q100 44 130 26 L168 44 L188 82 L158 96 L150 82 L150 184 Q100 192 50 184 L50 82 L42 96 L12 82 L32 44 Z"/>
        <path class="s" d="M70 26 Q100 52 130 26"/>
        <path class="s" d="M50 82 L50 96 M150 82 L150 96"/>`,
  hoodie: `<path class="g" d="M60 46 L38 54 L18 122 L14 172 L40 176 L48 124 L52 106 L52 186 Q100 194 148 186 L148 106 L152 124 L160 176 L186 172 L182 122 L162 54 L140 46 Z"/>
           <path class="g" d="M60 46 Q60 6 100 6 Q140 6 140 46 Q122 66 100 66 Q78 66 60 46 Z"/>
           <path class="s" d="M76 44 Q100 58 124 44 M92 62 L90 96 M108 62 L110 96"/>
           <path class="s" d="M70 142 L130 142 L138 172 L62 172 Z"/>`,
  cap: `<path class="g" d="M36 124 Q34 50 100 46 Q166 50 164 124 Z"/>
        <path class="g" d="M36 124 Q100 110 192 132 Q184 152 112 146 Q60 142 36 134 Z"/>
        <path class="s" d="M100 46 L100 122 M68 56 Q60 90 62 122 M132 56 Q140 90 138 122"/>
        <circle class="g" cx="100" cy="46" r="5"/>`,
};
document.querySelectorAll(".wcard__art[data-garment]").forEach((el, i) => {
  const kind = el.dataset.garment;
  const cs = getComputedStyle(el);
  const g1 = cs.getPropertyValue("--g1").trim();
  const id = "g" + i;
  const print = kind === "cap"
    ? `<text x="100" y="100" class="p">BNC</text>`
    : `<text x="100" y="${kind === "hoodie" ? 122 : 92}" class="p">BNC</text>`;
  el.innerHTML = `<svg viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${g1}"/><stop offset="1" stop-color="#111"/>
      </linearGradient>
      <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".35" stop-color="#fff" stop-opacity=".28"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".7" fill="#000" fill-opacity=".18"/></pattern>
    </defs>
    <g style="--f:url(#${id}f)">${GARMENTS[kind]}</g>
    <g opacity="1" style="--f:url(#${id}d)">${GARMENTS[kind].replace(/class="s"[^/]*\/>/g, "")}</g>
    <g style="--f:url(#${id}h)">${GARMENTS[kind].replace(/class="s"[^/]*\/>/g, "")}</g>
    ${print}
  </svg>`;
});
const garmentStyle = document.createElement("style");
garmentStyle.textContent = `
  .wcard__art .g { fill: var(--f); stroke: rgba(0,0,0,.35); stroke-width: .8; }
  .wcard__art .s { fill: none; stroke: rgba(255,255,255,.35); stroke-width: 1.2; stroke-dasharray: 3 2.5; }
  .wcard__art .p { font: 800 15px "Bricolage Grotesque", Arial, sans-serif; letter-spacing: -.5px; fill: rgba(255,255,255,.85); text-anchor: middle; }`;
document.head.appendChild(garmentStyle);

// Real portfolio photos: if images/work/<name>.webp exists it replaces the illustration.
document.querySelectorAll(".wcard__art[data-img]").forEach((el) => {
  const img = new Image();
  img.alt = el.closest(".wcard").querySelector("h3").textContent + " portfolio work";
  img.loading = "lazy";
  img.onload = () => { el.innerHTML = ""; el.appendChild(img); el.classList.add("has-img"); };
  img.src = el.dataset.img;
});

// ---------- Portfolio lightbox ----------
(function lightbox() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const close = () => { box.hidden = true; document.documentElement.style.overflow = ""; lenis && lenis.start(); };
  let dragged = false, downX = 0;
  const track = document.getElementById("workTrack");
  track.addEventListener("pointerdown", (e) => { downX = e.clientX; dragged = false; });
  track.addEventListener("pointerup", (e) => { dragged = Math.abs(e.clientX - downX) > 8; });
  document.querySelectorAll(".wcard[data-full], .ring__card").forEach((card) => {
    card.addEventListener("click", () => {
      if (dragged) return;
      img.src = card.dataset.full;
      img.alt = (card.querySelector("h3, span") || card).textContent + " full brand board";
      box.hidden = false;
      box.querySelector(".lightbox__scroll").scrollTop = 0;
      document.documentElement.style.overflow = "hidden";
      lenis && lenis.stop();
      document.getElementById("lightboxClose").focus();
    });
  });
  document.getElementById("lightboxClose").addEventListener("click", close);
  box.addEventListener("click", (e) => { if (e.target === box || e.target.classList.contains("lightbox__scroll")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
})();

// ---------- Collections hover preview ----------
(function collections() {
  const prev = document.getElementById("cpreview");
  if (isTouch) return;
  let px = 0, py = 0, x = 0, y = 0, running = false;
  function follow() {
    x += (px - x) * 0.15; y += (py - y) * 0.15;
    prev.style.transform = `translate(${x - 130}px, ${y - 130}px) scale(${prev.classList.contains("on") ? 1 : 0.6}) rotate(${(px - x) * 0.05}deg)`;
    if (running) requestAnimationFrame(follow);
  }
  document.querySelectorAll("#clist li").forEach((li) => {
    li.addEventListener("pointerenter", () => {
      prev.style.setProperty("--sw", getComputedStyle(li).getPropertyValue("--sw"));
      prev.classList.add("on");
      if (!running) { running = true; follow(); }
    });
    li.addEventListener("pointerleave", () => prev.classList.remove("on"));
  });
  document.getElementById("clist").addEventListener("pointerleave", () => { setTimeout(() => (running = false), 500); });
  addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; });
})();

// ---------- Cursor + magnetic ----------
if (!isTouch && !reduce) {
  const cursor = document.getElementById("cursor");
  const label = document.getElementById("cursorLabel");
  let cx = innerWidth / 2, cy = innerHeight / 2, x = cx, y = cy;
  addEventListener("pointermove", (e) => { cx = e.clientX; cy = e.clientY; });
  (function move() {
    x += (cx - x) * 0.2; y += (cy - y) * 0.2;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(move);
  })();
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("pointerenter", () => { label.textContent = el.dataset.cursor; cursor.classList.add("is-big"); });
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-big"));
  });
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.25;
      const dy = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
      el.style.transform = "";
      setTimeout(() => (el.style.transition = ""), 600);
    });
  });
  // 3D tilt on lookbook cards
  document.querySelectorAll(".wcard:not(.wcard--end)").forEach((card) => {
    const art = card.querySelector("svg, img");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(0)`;
      if (art) art.style.transform = `scale(1.06) translate(${px * 12}px, ${py * 12}px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      if (art) art.style.transform = "";
    });
  });
}

// ---------- Manifesto word split ----------
const mText = document.getElementById("manifestoText");
const words = mText.textContent.trim().split(/\s+/);
mText.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
const wordEls = mText.querySelectorAll(".w");

// ---------- Scroll animations ----------
function introHero() {
  if (!hasGsap || reduce) return;
  gsap.from(".hero__title .word", { yPercent: 115, rotate: 4, duration: 1.4, ease: "expo.out", stagger: 0.12 });
  gsap.from(".hero__stage", { opacity: 0, scale: 0.8, duration: 1.6, ease: "expo.out", delay: 0.2 });
  gsap.from(".hero__tags span, .hero__lead, .hero__cta > *, .hero__chips li", { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.3 });
}

if (hasGsap && !reduce) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero parallax + fabric reacts to scroll
  gsap.to(".hero__copy", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__stage", { yPercent: 12, scale: 0.9, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onUpdate: (s) => (heroState.scroll = s.progress) });

  // Manifesto words light up
  ScrollTrigger.create({
    trigger: mText, start: "top 80%", end: "bottom 45%", scrub: true,
    onUpdate: (s) => {
      const n = Math.round(s.progress * wordEls.length);
      wordEls.forEach((w, i) => w.classList.toggle("on", i < n));
    },
  });

  // Stacking service cards
  const cards = gsap.utils.toArray(".scard");
  cards.forEach((c, i) => {
    c.style.setProperty("--i", i);
    if (i === cards.length - 1) return;
    gsap.to(c, {
      scale: 0.9 + i * 0.01, ease: "none",
      scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 30%", scrub: true },
    });
  });

  // Horizontal lookbook (desktop)
  ScrollTrigger.matchMedia({
    "(min-width: 761px)": function () {
      const track = document.getElementById("workTrack");
      const dist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".work", pin: true, scrub: 1, start: "top top", end: () => "+=" + dist(), invalidateOnRefresh: true },
      });
    },
  });

  // Case study photo parallax
  gsap.utils.toArray("[data-speed]").forEach((el) => {
    gsap.fromTo(el.querySelector("img"), { yPercent: -parseFloat(el.dataset.speed) }, {
      yPercent: parseFloat(el.dataset.speed), ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  // Section reveals
  gsap.utils.toArray(".big, .huge, .prow, .fit__col, .faq details, .checklist label, .clist li, .quote blockquote, .case__facts > div, .shipped li").forEach((el) => {
    gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.from(".label-tag", { rotate: -18, y: 80, duration: 1.4, ease: "elastic.out(1, .6)", scrollTrigger: { trigger: ".label-tag", start: "top 90%" } });
  gsap.from(".footer__big", { yPercent: 40, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });

  // Ticker driven by scroll velocity
  const ticker = document.getElementById("ticker");
  let tx = 0, boost = 0;
  const half = () => ticker.scrollWidth / 2;
  ScrollTrigger.create({ onUpdate: (s) => (boost = Math.min(Math.abs(s.getVelocity()) / 120, 25) * (s.direction || 1)) });
  gsap.ticker.add(() => {
    boost *= 0.92;
    tx -= 1.2 + boost;
    const h = half();
    if (tx <= -h) tx += h;
    if (tx > 0) tx -= h;
    ticker.style.transform = `translateX(${tx}px)`;
  });
}

// ---------- Ad readiness gauge ----------
const boxes = document.querySelectorAll("#checklist input");
const arc = document.getElementById("gaugeArc");
const scoreNum = document.getElementById("scoreNum");
const verdict = document.getElementById("verdict");
const checkCta = document.getElementById("checkCta");
const ARC = 267;
function updateCheck() {
  const score = [...boxes].filter((b) => b.checked).length;
  scoreNum.textContent = score;
  arc.style.strokeDashoffset = ARC - (score / boxes.length) * ARC;
  let color = "#ff4a1c", text = "Tick the boxes to see your result.", cta = "Get my free audit ↗";
  if (score >= 1 && score <= 3) {
    text = "Hold off on ads for now. Spending before these foundations are in place means paying to learn what the store isn't ready for.";
    cta = "Show me what to fix first ↗";
  } else if (score >= 4 && score <= 5) {
    color = "#ffe14d";
    text = "You're close. A couple of gaps could quietly eat your ad budget. Fix those and your first campaigns work much harder.";
    cta = "Find my gaps for free ↗";
  } else if (score >= 6) {
    color = "#c7ff3d";
    text = "Strong foundations. You're in a good spot to test ads. The audit can confirm it and show where to start.";
    cta = "Confirm I'm ready ↗";
  }
  arc.style.stroke = color;
  verdict.textContent = text;
  checkCta.textContent = cta;
}
boxes.forEach((b) => b.addEventListener("change", updateCheck));

// ---------- Mobile sticky CTA: hidden on hero and on the form ----------
const sticky = document.getElementById("stickyCta");
if ("IntersectionObserver" in window) {
  const seen = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => seen.set(en.target.id, en.isIntersecting));
    sticky.classList.toggle("hide", !!(seen.get("hero") || seen.get("audit")));
  }, { threshold: 0.05 });
  io.observe(document.getElementById("hero"));
  io.observe(document.getElementById("audit"));
}

// Nav CTA turns dark while over the orange audit section
if ("IntersectionObserver" in window) {
  const nav = document.querySelector(".nav");
  new IntersectionObserver(([en]) => nav.classList.toggle("on-accent", en.isIntersecting), { rootMargin: "0px 0px -92% 0px" })
    .observe(document.getElementById("audit"));
}
