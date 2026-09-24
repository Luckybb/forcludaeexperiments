// ===== SETTINGS: edit these two lines =====
// 1. Create a free form at https://formspree.io, paste its endpoint here (e.g. "https://formspree.io/f/abcdwxyz").
//    Leads then land in your inbox automatically.
const FORM_ENDPOINT = "";
// 2. Your contact email. Used for the footer link and as a fallback if FORM_ENDPOINT is empty.
const CONTACT_EMAIL = "hello@bncapparel.site";
// ==========================================

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const isMobile = () => window.innerWidth <= 760;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (reduce) document.documentElement.classList.add("reduce");

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("footerEmail").href = "mailto:" + CONTACT_EMAIL;

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

// ---------- 3D fabric hero ----------
const heroState = { mouse: { x: 0, y: 0 }, target: { x: 0, y: 0 }, scroll: 0 };
(function fabric() {
  const canvas = document.getElementById("gl");
  const hero = document.getElementById("hero");
  if (typeof THREE === "undefined") { hero.classList.add("no-gl"); return; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (e) { hero.classList.add("no-gl"); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0d0d0c, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  const seg = isMobile() ? 110 : 200;
  const geo = new THREE.PlaneGeometry(12, 8, seg, seg);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uAccent: { value: new THREE.Color("#ff4a1c") },
    },
    vertexShader: `
      uniform float uTime; uniform vec2 uMouse; uniform float uScroll;
      varying vec3 vN; varying vec2 vUv; varying vec3 vView;
      float h(vec2 p){
        float t = uTime;
        float d = sin(p.x*1.1 + t*0.55)*0.42
                + sin(p.y*1.6 - t*0.75)*0.32
                + sin((p.x*0.8 + p.y)*2.5 + t*1.05)*0.14
                + sin((p.x - p.y*1.3)*4.3 - t*0.9)*0.05;
        float md = length(p - uMouse);
        d += sin(md*4.5 - t*3.2) * 0.22 * exp(-md*0.8);
        d += uScroll * sin(p.x*2.2 + p.y + t) * 0.6;
        return d;
      }
      void main(){
        vUv = uv;
        vec3 p = position;
        float e = 0.03;
        float z = h(p.xy);
        float zx = h(p.xy + vec2(e, 0.0));
        float zy = h(p.xy + vec2(0.0, e));
        vec3 n = normalize(vec3(-(zx - z)/e, -(zy - z)/e, 1.0));
        p.z += z;
        vN = normalize(normalMatrix * n);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uAccent;
      varying vec3 vN; varying vec2 vUv; varying vec3 vView;
      void main(){
        vec3 n = normalize(vN);
        vec3 v = normalize(vView);
        vec3 r = reflect(-v, n);
        float y = r.y * 0.5 + 0.5;
        vec3 env = mix(vec3(0.02), vec3(0.93, 0.92, 0.89), smoothstep(0.42, 0.8, y));
        env += vec3(1.0) * smoothstep(0.035, 0.0, abs(r.y - 0.5)) * 0.9;
        env += vec3(1.0) * smoothstep(0.02, 0.0, abs(r.x + 0.35)) * 0.35;
        env = mix(env, uAccent, smoothstep(0.05, 0.6, -r.y) * 0.95);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
        vec3 irid = 0.5 + 0.5 * cos(6.2831 * (fres * 1.4 + vec3(0.0, 0.33, 0.67)) + uTime * 0.25);
        vec3 col = env + irid * fres * 0.4;
        float w = sin(vUv.x * 1400.0) * sin(vUv.y * 1400.0);
        col *= 0.93 + 0.07 * w;
        float edge = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x)
                   * smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.78, vUv.y);
        gl_FragColor = vec4(mix(vec3(0.051, 0.051, 0.047), col, edge), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.set(-0.75, 0.15, 0.35);
  scene.add(mesh);

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 760 ? 10 : 7.5;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    heroState.target.x = ((e.clientX - r.left) / r.width - 0.5) * 9;
    heroState.target.y = -((e.clientY - r.top) / r.height - 0.5) * 6;
  });

  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(hero);
  const clock = new THREE.Clock();
  function render() {
    const t = clock.getElapsedTime();
    heroState.mouse.x += (heroState.target.x - heroState.mouse.x) * 0.06;
    heroState.mouse.y += (heroState.target.y - heroState.mouse.y) * 0.06;
    mat.uniforms.uTime.value = reduce ? 2.0 : t;
    mat.uniforms.uMouse.value.set(heroState.mouse.x, heroState.mouse.y);
    mat.uniforms.uScroll.value = heroState.scroll;
    mesh.rotation.z = 0.35 + heroState.mouse.x * 0.01;
    mesh.rotation.x = -0.75 + heroState.scroll * 0.5;
    renderer.render(scene, camera);
  }
  if (reduce) { render(); return; }
  (function loop() {
    if (visible) render();
    requestAnimationFrame(loop);
  })();
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
document.querySelectorAll(".wcard__art").forEach((el, i) => {
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
    const art = card.querySelector("svg");
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateZ(0)`;
      if (art) art.style.transform = `translate(${px * 18}px, ${py * 18}px) rotate(${px * 4}deg)`;
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
  gsap.from(".hero__tags span, .hero__lead, .hero__cta > *", { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.3 });
}

if (hasGsap && !reduce) {
  gsap.registerPlugin(ScrollTrigger);

  // Hero parallax + fabric reacts to scroll
  gsap.to(".hero__title", { yPercent: -35, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__bottom", { yPercent: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
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

  // Section reveals
  gsap.utils.toArray(".big, .huge, .prow, .fit__col, .faq details, .checklist label").forEach((el) => {
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

// ---------- Lead form ----------
const form = document.getElementById("auditForm");
const statusEl = document.getElementById("formStatus");

// Rough lead score so the best leads stand out in your inbox.
function leadPriority(data) {
  let s = 0;
  const stage = data.get("stage") || "";
  const budget = data.get("budget") || "";
  if (/grow|collection|Scaling/.test(stage)) s += 2;
  if (/few sales/.test(stage)) s += 1;
  if (/\$1,000|\$3,000\+/.test(budget)) s += 2;
  if (/\$300 to/.test(budget)) s += 1;
  if (/Shopify/.test(data.get("platform") || "")) s += 1;
  if (data.get("social")) s += 1;
  return s >= 5 ? "HOT" : s >= 3 ? "WARM" : "COLD";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.className = "form__status";
  statusEl.textContent = "";

  let firstBad = null;
  form.querySelectorAll("[required]").forEach((el) => {
    const bad = !el.checkValidity();
    el.classList.toggle("invalid", bad);
    if (bad && !firstBad) firstBad = el;
  });
  if (firstBad) {
    statusEl.className = "form__status err";
    statusEl.textContent = "Please fill in the highlighted fields.";
    firstBad.focus();
    return;
  }
  if (form._gotcha.value) return;

  const data = new FormData(form);
  const focus = data.getAll("focus").join(", ") || "Not specified";
  data.delete("focus");
  data.set("focus", focus);
  const priority = leadPriority(data);
  data.set("priority", priority);
  data.set("_subject", `[${priority}] Free audit request: ${data.get("brand")}`);

  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Sending…";

  try {
    if (FORM_ENDPOINT) {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Request failed");
    } else {
      const lines = [];
      for (const [k, v] of data.entries()) if (!k.startsWith("_") && v) lines.push(`${k}: ${v}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(data.get("_subject"))}&body=${encodeURIComponent(lines.join("\n"))}`;
    }
    form.classList.add("form--done");
    form.innerHTML = `
      <h3>Got it, <em>${escapeHtml(data.get("name").split(" ")[0])}</em>.</h3>
      <p>I'll take a proper look at <b>${escapeHtml(data.get("brand"))}</b> and send your top fixes within 48 hours.</p>
      <p class="form__note">While you wait: open your homepage on your phone. Can a stranger tell who it's for in 5 seconds?</p>`;
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Send me my free audit ↗";
    statusEl.className = "form__status err";
    statusEl.innerHTML = `That didn't send. Email me directly at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

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
