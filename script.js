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

// ---------- 3D T-shirt hero ----------
const heroState = { scroll: 0 };
(function tee() {
  const stage = document.getElementById("teeStage");
  const canvas = document.getElementById("teeGl");
  if (typeof THREE === "undefined") { stage.classList.add("no-gl"); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { stage.classList.add("no-gl"); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.1, 10.5);

  // Lights: soft studio with an orange rim
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2622, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(-3, 4, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff4a1c, 1.1); rim.position.set(4, 1, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc7d6ff, 0.35); fill.position.set(3, -2, 5); scene.add(fill);

  // Tee silhouette (same outline as the site's tee icon), puffed up with a deep bevel
  const s = new THREE.Shape();
  s.moveTo(70, -26); s.quadraticCurveTo(100, -46, 130, -26);
  s.lineTo(166, -42); s.quadraticCurveTo(178, -58, 190, -84); s.lineTo(160, -98); s.lineTo(150, -84);
  s.lineTo(151, -182); s.quadraticCurveTo(100, -192, 49, -182);
  s.lineTo(50, -84); s.lineTo(40, -98); s.lineTo(10, -84); s.quadraticCurveTo(22, -58, 34, -42);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 10, bevelEnabled: true, bevelThickness: 11, bevelSize: 7, bevelSegments: 10, curveSegments: 28 });
  geo.center();
  geo.scale(0.02, 0.02, 0.02);
  geo.computeBoundingBox();
  const front = geo.boundingBox.max.z;

  // Knit texture used as a bump map so the cotton catches light
  const knit = document.createElement("canvas"); knit.width = knit.height = 128;
  const k = knit.getContext("2d");
  k.fillStyle = "#808080"; k.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 4) { k.fillStyle = x % 8 ? "#6a6a6a" : "#9a9a9a"; k.fillRect(x, 0, 2, 128); }
  for (let i = 0; i < 1400; i++) { k.fillStyle = `rgba(${Math.random() > .5 ? 255 : 0},0,0,.08)`; k.fillRect(Math.random() * 128, Math.random() * 128, 1, 1); }
  const knitTex = new THREE.CanvasTexture(knit);
  knitTex.wrapS = knitTex.wrapT = THREE.RepeatWrapping; knitTex.repeat.set(0.09, 0.09);

  const cloth = new THREE.MeshStandardMaterial({ color: 0x1b1b1a, roughness: 0.92, metalness: 0, bumpMap: knitTex, bumpScale: 0.012 });
  const shirt = new THREE.Mesh(geo, cloth);

  // Rib collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 12, 40, Math.PI), cloth);
  collar.rotation.z = Math.PI; collar.scale.set(1, 0.42, 1);
  collar.position.set(0, (-26 + 109) * 0.02 - 0.02, front - 0.08);

  // Print: a transparent canvas decal on the chest
  const pc = document.createElement("canvas"); pc.width = pc.height = 512;
  const pctx = pc.getContext("2d");
  const printTex = new THREE.CanvasTexture(pc); printTex.encoding = THREE.sRGBEncoding; printTex.anisotropy = 4;
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.45), new THREE.MeshStandardMaterial({ map: printTex, transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2 }));
  decal.position.set(0, (-92 + 109) * 0.02, front + 0.004);

  // Neck label
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.14), new THREE.MeshStandardMaterial({ color: 0xff4a1c, roughness: 0.6 }));
  label.position.set(0, (-40 + 109) * 0.02, front - 0.05);

  // Hanger
  const metal = new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.25, metalness: 0.9 });
  const hanger = new THREE.Group();
  const bar = (x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 10), metal);
    m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
    m.rotation.z = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
    return m;
  };
  const shoulderY = (-40 + 109) * 0.02;
  hanger.add(bar(-1.55, shoulderY - 0.2, 0, shoulderY + 0.45), bar(0, shoulderY + 0.45, 1.55, shoulderY - 0.2));
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 10, 30, Math.PI * 1.4), metal);
  hook.position.set(0.02, shoulderY + 0.78, 0); hook.rotation.z = -0.5;
  hanger.add(hook, bar(0, shoulderY + 0.45, 0, shoulderY + 0.62));
  hanger.position.z = -0.05;

  const group = new THREE.Group();
  group.add(shirt, collar, decal, label, hanger);
  group.position.y = -0.15;
  scene.add(group);

  // Prints (original BNC designs drawn on canvas)
  let ink = "#ece8dd";
  const display = '800 150px "Bricolage Grotesque", "Arial Black", Arial, sans-serif';
  const prints = [
    () => { // Wordmark
      pctx.fillStyle = ink; pctx.textAlign = "center"; pctx.textBaseline = "middle";
      pctx.font = display; pctx.fillText("BNC", 256, 220);
      pctx.font = '500 30px "JetBrains Mono", monospace'; pctx.fillText("APPAREL STUDIO", 256, 320);
      pctx.fillStyle = "#ff4a1c"; pctx.fillRect(166, 360, 180, 8);
    },
    () => { // Badge
      pctx.strokeStyle = ink; pctx.lineWidth = 8;
      pctx.beginPath(); pctx.arc(256, 256, 200, 0, Math.PI * 2); pctx.stroke();
      pctx.beginPath(); pctx.arc(256, 256, 130, 0, Math.PI * 2); pctx.stroke();
      const txt = "WE BUILD CLOTHING BRANDS THAT SELL • ";
      pctx.fillStyle = ink; pctx.font = '600 30px "JetBrains Mono", monospace'; pctx.textAlign = "center"; pctx.textBaseline = "middle";
      for (let i = 0; i < txt.length; i++) {
        const ang = (i / txt.length) * Math.PI * 2 - Math.PI / 2;
        pctx.save(); pctx.translate(256 + Math.cos(ang) * 166, 256 + Math.sin(ang) * 166); pctx.rotate(ang + Math.PI / 2);
        pctx.fillText(txt[i], 0, 0); pctx.restore();
      }
      pctx.fillStyle = "#ff4a1c"; pctx.font = '800 96px "Bricolage Grotesque", Arial, sans-serif'; pctx.fillText("B", 256, 262);
    },
    () => { // Script
      pctx.fillStyle = "#ff4a1c"; pctx.textAlign = "center"; pctx.textBaseline = "middle";
      pctx.font = 'italic 400 190px "Instrument Serif", Georgia, serif'; pctx.fillText("sell.", 250, 230);
      pctx.strokeStyle = ink; pctx.lineWidth = 7; pctx.lineCap = "round";
      pctx.beginPath(); pctx.moveTo(110, 330); pctx.bezierCurveTo(200, 300, 320, 360, 410, 318); pctx.stroke();
      pctx.fillStyle = ink; pctx.font = '500 26px "JetBrains Mono", monospace'; pctx.fillText("BUILT BY BNC", 256, 400);
    },
  ];
  let printIdx = 0;
  function drawPrint() { pctx.clearRect(0, 0, 512, 512); prints[printIdx](); printTex.needsUpdate = true; }
  if (document.fonts) document.fonts.ready.then(drawPrint);

  function setColor(hex) {
    cloth.color.set(hex).convertSRGBToLinear();
    const c = new THREE.Color(hex);
    ink = (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) > 0.55 ? "#141312" : "#ece8dd";
    drawPrint();
  }
  setColor("#1b1b1a");
  label.material.color.convertSRGBToLinear();
  stage.querySelectorAll(".swatch").forEach((b) => b.addEventListener("click", () => {
    stage.querySelectorAll(".swatch").forEach((x) => x.classList.toggle("is-on", x === b));
    setColor(b.dataset.color); spin += 0.9;
  }));
  stage.querySelectorAll(".print").forEach((b) => b.addEventListener("click", () => {
    stage.querySelectorAll(".print").forEach((x) => x.classList.toggle("is-on", x === b));
    printIdx = +b.dataset.print; drawPrint(); spin += 0.9;
  }));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 420 ? 12.5 : 10.5;
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  // Drag to spin, otherwise a gentle sway like it's hanging on a rail
  let rotY = -0.35, velocity = 0, dragging = false, lastX = 0, spin = 0, mx = 0, my = 0;
  canvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", (e) => { if (!dragging) return; velocity = (e.clientX - lastX) * 0.012; rotY += velocity; lastX = e.clientX; });
  const stop = () => (dragging = false);
  canvas.addEventListener("pointerup", stop); canvas.addEventListener("pointercancel", stop);
  document.getElementById("hero").addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(stage);
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    if (!dragging) {
      velocity *= 0.94;
      const sway = Math.sin(t * 0.7) * 0.45 + mx * 0.5;
      spin *= 0.95;
      rotY += velocity + (sway - rotY) * 0.03 + spin * 0.12;
    }
    group.rotation.y = rotY + heroState.scroll * Math.PI;
    group.rotation.z = Math.sin(t * 0.9) * 0.025;
    group.rotation.x = -my * 0.15;
    group.position.y = -0.15 + Math.sin(t * 1.3) * 0.06;
    renderer.render(scene, camera);
  }
  if (reduce) { frame(); stage.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => requestAnimationFrame(frame))); return; }
  (function loop() { if (visible) frame(); requestAnimationFrame(loop); })();
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
  document.querySelectorAll(".wcard[data-full]").forEach((card) => {
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
