// ===== SETTINGS =====
// Where audit requests are emailed. The first submission sends a one-time activation email
// from FormSubmit to this address: click "Activate" in it and every lead after that arrives.
const LEAD_EMAIL = "info@bncproductionz.com";
const CALENDLY_URL = "https://calendly.com/burhannazir";
const WHATSAPP_URL = "https://wa.me/17473364515?text=" + encodeURIComponent("Hi BNC, I'd like a free audit for my clothing brand.");
// ======================

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
const isMobile = () => window.innerWidth <= 760;
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
if (reduce) document.documentElement.classList.add("reduce");

document.getElementById("year").textContent = new Date().getFullYear();


// ---------- Intro (no loading screen: content shows immediately) ----------
requestAnimationFrame(() => introHero());

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

// ---------- 3D T-shirt hero: real-time cloth simulation ----------
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
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2622, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(-3, 4, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff4a1c, 1.2); rim.position.set(4, 1, -4); scene.add(rim);
  const back = new THREE.DirectionalLight(0xff4a1c, 0.6); back.position.set(-4, 0, -5); scene.add(back);
  const fill = new THREE.DirectionalLight(0xc7d6ff, 0.35); fill.position.set(3, -2, 5); scene.add(fill);

  // Tee outline in 200x200 design units
  const TEE = "M70 26 Q100 46 130 26 L166 42 Q178 58 190 84 L160 98 L150 84 L151 182 Q100 192 49 182 L50 84 L40 98 L10 84 Q22 58 34 42 Z";
  const teePath = new Path2D(TEE);
  const X0 = 10, X1 = 190, Y0 = 26, Y1 = 192, S = 0.02;
  const wx = (x) => (x - 100) * S, wy = (y) => (109 - y) * S;

  // Cloth texture: fabric color, knit ribs, stitching, collar band and the chest print, cut to the tee outline
  const TS = 4, tex = document.createElement("canvas");
  tex.width = (X1 - X0) * TS; tex.height = (Y1 - Y0) * TS;
  const tctx = tex.getContext("2d");
  const clothTex = new THREE.CanvasTexture(tex);
  clothTex.encoding = THREE.sRGBEncoding; clothTex.anisotropy = 4;
  const pc = document.createElement("canvas"); pc.width = pc.height = 512;
  const pctx = pc.getContext("2d");
  let color = "#1b1b1a", ink = "#ece8dd", printIdx = 0;
  const display = '800 150px "Bricolage Grotesque", "Arial Black", Arial, sans-serif';
  const prints = [
    () => {
      pctx.fillStyle = ink; pctx.textAlign = "center"; pctx.textBaseline = "middle";
      pctx.font = display; pctx.fillText("BNC", 256, 220);
      pctx.font = '500 30px "JetBrains Mono", monospace'; pctx.fillText("APPAREL STUDIO", 256, 320);
      pctx.fillStyle = "#ff4a1c"; pctx.fillRect(166, 360, 180, 8);
    },
    () => {
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
    () => {
      pctx.fillStyle = "#ff4a1c"; pctx.textAlign = "center"; pctx.textBaseline = "middle";
      pctx.font = 'italic 400 190px "Instrument Serif", Georgia, serif'; pctx.fillText("sell.", 250, 230);
      pctx.strokeStyle = ink; pctx.lineWidth = 7; pctx.lineCap = "round";
      pctx.beginPath(); pctx.moveTo(110, 330); pctx.bezierCurveTo(200, 300, 320, 360, 410, 318); pctx.stroke();
      pctx.fillStyle = ink; pctx.font = '500 26px "JetBrains Mono", monospace'; pctx.fillText("BUILT BY BNC", 256, 400);
    },
  ];
  function paint() {
    pctx.clearRect(0, 0, 512, 512); prints[printIdx]();
    tctx.setTransform(1, 0, 0, 1, 0, 0);
    tctx.clearRect(0, 0, tex.width, tex.height);
    tctx.setTransform(TS, 0, 0, TS, -X0 * TS, -Y0 * TS);
    tctx.save(); tctx.clip(teePath);
    tctx.fillStyle = color; tctx.fillRect(0, 0, 200, 200);
    const light = ink === "#141312";
    tctx.fillStyle = light ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.035)";
    for (let x = X0; x < X1; x += 1.5) tctx.fillRect(x, 0, 0.6, 200);
    tctx.strokeStyle = light ? "rgba(0,0,0,.22)" : "rgba(255,255,255,.18)";
    tctx.lineWidth = 0.6; tctx.setLineDash([2, 1.6]);
    tctx.beginPath(); tctx.moveTo(49, 176); tctx.quadraticCurveTo(100, 186, 151, 176); tctx.stroke();
    tctx.beginPath(); tctx.moveTo(16, 88); tctx.lineTo(42, 100); tctx.moveTo(184, 88); tctx.lineTo(158, 100); tctx.stroke();
    tctx.beginPath(); tctx.moveTo(34, 42); tctx.quadraticCurveTo(46, 62, 50, 84); tctx.moveTo(166, 42); tctx.quadraticCurveTo(154, 62, 150, 84); tctx.stroke();
    tctx.setLineDash([]);
    tctx.strokeStyle = light ? "rgba(0,0,0,.18)" : "rgba(0,0,0,.45)"; tctx.lineWidth = 5;
    tctx.beginPath(); tctx.moveTo(70, 26); tctx.quadraticCurveTo(100, 46, 130, 26); tctx.stroke();
    tctx.fillStyle = "#ff4a1c"; tctx.fillRect(96, 36, 8, 4);
    tctx.drawImage(pc, 100 - 34, 93 - 34, 68, 68);
    tctx.restore();
    clothTex.needsUpdate = true;
  }

  // Build the cloth: a particle grid clipped to the tee outline
  const COLS = 46, ROWS = 42;
  const tmp = document.createElement("canvas").getContext("2d"); tmp.lineWidth = 9;
  const inside = (x, y) => tmp.isPointInPath(teePath, x, y) || tmp.isPointInStroke(teePath, x, y);
  const idx = [], P = [], UV = [], pinnedList = [];
  for (let r = 0; r <= ROWS; r++) {
    idx[r] = [];
    for (let c = 0; c <= COLS; c++) {
      const x = X0 + (c / COLS) * (X1 - X0), y = Y0 + (r / ROWS) * (Y1 - Y0);
      if (inside(x, y)) {
        idx[r][c] = P.length / 3;
        P.push(wx(x), wy(y), (Math.random() - 0.5) * 0.02);
        UV.push((x - X0) / (X1 - X0), 1 - (y - Y0) / (Y1 - Y0));
      } else idx[r][c] = -1;
    }
  }
  const N = P.length / 3;
  const pos = new Float32Array(P), prev = new Float32Array(P), rest0 = new Float32Array(P);
  const pinned = new Uint8Array(N);
  for (let c = 0; c <= COLS; c++) {
    for (let r = 0; r <= ROWS; r++) {
      const i = idx[r][c];
      if (i < 0) continue;
      const x = X0 + (c / COLS) * (X1 - X0);
      if ((x > 28 && x < 74) || (x > 126 && x < 172)) { pinned[i] = 1; pinnedList.push(i); }
      break;
    }
  }
  const cons = [];
  const link = (r1, c1, r2, c2) => {
    if (r2 > ROWS || c2 > COLS || c2 < 0) return;
    const a = idx[r1][c1], b = idx[r2][c2];
    if (a < 0 || b < 0) return;
    cons.push(a, b, Math.hypot(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1]));
  };
  const tris = [];
  for (let r = 0; r <= ROWS; r++) for (let c = 0; c <= COLS; c++) {
    if (idx[r][c] < 0) continue;
    link(r, c, r, c + 1); link(r, c, r + 1, c);
    link(r, c, r + 1, c + 1); link(r, c, r + 1, c - 1);
    link(r, c, r, c + 2); link(r, c, r + 2 <= ROWS ? r + 2 : ROWS + 1, c);
    if (r < ROWS && c < COLS) {
      const a = idx[r][c], b = idx[r][c + 1], d = idx[r + 1][c], e = idx[r + 1][c + 1];
      if (a >= 0 && b >= 0 && d >= 0 && e >= 0) tris.push(a, d, b, b, d, e);
    }
  }
  const C = new Float32Array(cons);

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3); posAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(UV, 2));
  geo.setIndex(tris);
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ map: clothTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9, metalness: 0 });
  const cloth = new THREE.Mesh(geo, mat);

  // Hanger sits on the pinned shoulder line
  let minX = Infinity, maxX = -Infinity, topY = -Infinity;
  pinnedList.forEach((i) => { minX = Math.min(minX, pos[i * 3]); maxX = Math.max(maxX, pos[i * 3]); topY = Math.max(topY, pos[i * 3 + 1]); });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.25, metalness: 0.9 });
  const hanger = new THREE.Group();
  const bar = (x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 10), metal);
    m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0.02);
    m.rotation.z = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
    return m;
  };
  const apex = topY + 0.42;
  hanger.add(bar(minX - 0.08, wy(46), 0, apex), bar(0, apex, maxX + 0.08, wy(46)), bar(0, apex, 0, apex + 0.17));
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 10, 30, Math.PI * 1.4), metal);
  hook.position.set(0.02, apex + 0.33, 0.02); hook.rotation.z = -0.5;
  hanger.add(hook);

  const group = new THREE.Group();
  group.add(cloth, hanger);
  scene.add(group);

  // ---- Physics (Verlet) ----
  const GRAV = -0.00042, DAMP = 0.982;
  let t = 0;
  const mouse = { x: 0, y: 0, vx: 0, vy: 0, on: false };
  let grab = -1; const grabTarget = new THREE.Vector3();
  function step() {
    t += 1 / 60;
    const gust = 0.00018 + 0.00012 * Math.sin(t * 0.37);
    for (let i = 0; i < N; i++) {
      if (pinned[i]) continue;
      const k = i * 3;
      const x = pos[k], y = pos[k + 1], z = pos[k + 2];
      let ax = 0, ay = GRAV, az = Math.sin(t * 1.6 + x * 1.8 + y * 1.1) * gust + Math.sin(t * 2.7 - y * 2.3) * gust * 0.5;
      if (mouse.on) {
        const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 0.9) {
          const f = (1 - d / 0.9);
          ax += mouse.vx * f * 0.05; ay += mouse.vy * f * 0.05;
          az -= f * f * (0.0012 + Math.hypot(mouse.vx, mouse.vy) * 0.03);
        }
      }
      pos[k] = x + (x - prev[k]) * DAMP + ax;
      pos[k + 1] = y + (y - prev[k + 1]) * DAMP + ay;
      pos[k + 2] = z + (z - prev[k + 2]) * DAMP + az;
      prev[k] = x; prev[k + 1] = y; prev[k + 2] = z;
    }
    if (grab >= 0) { pos[grab * 3] = grabTarget.x; pos[grab * 3 + 1] = grabTarget.y; pos[grab * 3 + 2] = grabTarget.z; }
    for (let it = 0; it < 4; it++) {
      for (let j = 0; j < C.length; j += 3) {
        const a = C[j] * 3, b = C[j + 1] * 3, rest = C[j + 2];
        const dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const diff = (d - rest) / d;
        const pa = pinned[C[j]] || C[j] === grab, pb = pinned[C[j + 1]] || C[j + 1] === grab;
        if (pa && pb) continue;
        const sa = pa ? 0 : pb ? 1 : 0.5, sb = pb ? 0 : pa ? 1 : 0.5;
        pos[a] += dx * diff * sa; pos[a + 1] += dy * diff * sa; pos[a + 2] += dz * diff * sa;
        pos[b] -= dx * diff * sb; pos[b + 1] -= dy * diff * sb; pos[b + 2] -= dz * diff * sb;
      }
      // keep fabric from swinging through the hanger plane too far
      for (let i = 0; i < N; i++) { const k = i * 3 + 2; if (pos[k] > 1.2) pos[k] = 1.2; if (pos[k] < -1.2) pos[k] = -1.2; }
    }
  }
  function ripple(strength) {
    for (let i = 0; i < N; i++) {
      if (pinned[i]) continue;
      const k = i * 3, y = pos[k + 1];
      prev[k + 2] -= Math.sin((1.66 - y) * 3.2) * strength * (1.66 - y) * 0.5;
    }
  }
  for (let i = 0; i < 120; i++) step();

  function setColor(hex) {
    color = hex;
    const c = new THREE.Color(hex);
    ink = (c.r * 0.299 + c.g * 0.587 + c.b * 0.114) > 0.55 ? "#141312" : "#ece8dd";
    paint();
  }
  setColor(color);
  if (document.fonts) document.fonts.ready.then(paint);
  stage.querySelectorAll(".swatch").forEach((b) => b.addEventListener("click", () => {
    stage.querySelectorAll(".swatch").forEach((x) => x.classList.toggle("is-on", x === b));
    setColor(b.dataset.color); ripple(0.05);
  }));
  stage.querySelectorAll(".print").forEach((b) => b.addEventListener("click", () => {
    stage.querySelectorAll(".print").forEach((x) => x.classList.toggle("is-on", x === b));
    printIdx = +b.dataset.print; paint(); ripple(-0.05);
  }));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 420 ? 12.5 : 10.5;
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  // Pointer: wind when moving, grab and pull when pressing
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), hit = new THREE.Vector3();
  function toLocal(e, depth) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion);
    plane.setFromNormalAndCoplanarPoint(n, group.localToWorld(new THREE.Vector3(0, 0, depth)));
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    return group.worldToLocal(hit.clone());
  }
  let lastMove = 0;
  canvas.addEventListener("pointermove", (e) => {
    const p = toLocal(e, 0); if (!p) return;
    const now = performance.now(), dt = Math.max(16, now - lastMove); lastMove = now;
    mouse.vx = mouse.on ? THREE.MathUtils.clamp((p.x - mouse.x) / dt * 16, -0.3, 0.3) : 0;
    mouse.vy = mouse.on ? THREE.MathUtils.clamp((p.y - mouse.y) / dt * 16, -0.3, 0.3) : 0;
    mouse.x = p.x; mouse.y = p.y; mouse.on = true;
    if (grab >= 0) { const q = toLocal(e, 0.6); if (q) grabTarget.copy(q); }
  });
  canvas.addEventListener("pointerleave", () => { mouse.on = false; });
  canvas.addEventListener("pointerdown", (e) => {
    const p = toLocal(e, 0); if (!p) return;
    let best = -1, bd = 0.35;
    for (let i = 0; i < N; i++) {
      if (pinned[i]) continue;
      const d = Math.hypot(pos[i * 3] - p.x, pos[i * 3 + 1] - p.y);
      if (d < bd) { bd = d; best = i; }
    }
    if (best >= 0) { grab = best; grabTarget.set(pos[best * 3], pos[best * 3 + 1], 0.6); canvas.setPointerCapture(e.pointerId); stage.classList.add("is-grabbing"); }
  });
  const release = () => { grab = -1; stage.classList.remove("is-grabbing"); };
  canvas.addEventListener("pointerup", release); canvas.addEventListener("pointercancel", release);
  let mx = 0, my = 0;
  document.getElementById("hero").addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });

  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(stage);
  const clock = new THREE.Clock();
  function frame() {
    const tt = clock.getElapsedTime();
    step();
    mouse.vx *= 0.8; mouse.vy *= 0.8;
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
    group.rotation.y = Math.sin(tt * 0.45) * 0.28 + mx * 0.35 + heroState.scroll * Math.PI * 0.8;
    group.rotation.x = -my * 0.12;
    group.position.y = -0.1 + Math.sin(tt * 1.1) * 0.04;
    renderer.render(scene, camera);
  }
  if (reduce) { for (let i = 0; i < 60; i++) step(); frame(); stage.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => requestAnimationFrame(frame))); return; }
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
  gsap.from(".hero__tags span, .hero__lead, .hero__cta > *, .proof", { y: 24, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.3 });
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

// ---------- Lead form (free audit) ----------
const form = document.getElementById("auditForm");
const statusEl = document.getElementById("formStatus");

// Rough lead score so the best leads stand out in your inbox subject line.
function leadPriority(d) {
  let s = 0;
  const stage = d.stage || "", budget = d.budget || "";
  if (/grow|collection|Scaling/.test(stage)) s += 2;
  if (/few sales/.test(stage)) s += 1;
  if (/\$1,000|\$3,000\+/.test(budget)) s += 2;
  if (/\$300 to/.test(budget)) s += 1;
  if (/\.|@/.test(d.link || "")) s += 1;
  return s >= 4 ? "HOT" : s >= 2 ? "WARM" : "COLD";
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
  if (form._honey.value) return;

  const fd = new FormData(form);
  const d = Object.fromEntries(fd.entries());
  d.need = fd.getAll("need").join(", ") || "Not specified";
  const priority = leadPriority(d);
  const payload = {
    Priority: priority,
    Name: d.name, Email: d.email, Brand: d.brand, Link: d.link,
    Stage: d.stage, Budget: d.budget, Needs: d.need, Message: d.message || "",
    Page: location.href,
    _subject: `[${priority}] Free audit request: ${d.brand}`,
    _replyto: d.email, _template: "table", _captcha: "false",
  };

  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.textContent = "Sending…";
  let sent = false;
  try {
    const res = await fetch("https://formsubmit.co/ajax/" + LEAD_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    sent = res.ok;
  } catch (err) { sent = false; }

  if (!sent) {
    btn.disabled = false;
    btn.textContent = "Get my free audit ↗";
    const body = Object.entries(payload).filter(([k]) => !k.startsWith("_")).map(([k, v]) => `${k}: ${v}`).join("\n");
    statusEl.className = "form__status err";
    statusEl.innerHTML = `That didn't go through. <a href="mailto:${LEAD_EMAIL}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}">Send it by email</a> or <a href="${WHATSAPP_URL}" target="_blank" rel="noopener">message me on WhatsApp</a>.`;
    return;
  }

  // Funnel step 2: turn the request into a booked call while intent is highest
  const first = escapeHtml((d.name || "").split(" ")[0]);
  const cal = CALENDLY_URL + "?name=" + encodeURIComponent(d.name || "") + "&email=" + encodeURIComponent(d.email || "");
  form.classList.add("form--done");
  form.innerHTML = `
    <div class="form__steps" aria-hidden="true"><span>1. Your brand</span><span class="on">2. Your audit</span><span>3. Quick call</span></div>
    <h3>Got it, <em>${first}</em>.</h3>
    <p>I'll review <b>${escapeHtml(d.brand)}</b> and email your top fixes within 48 hours.</p>
    <p class="muted">Want them faster? Grab a 15 minute slot and I'll walk you through the audit live.</p>
    <div class="done__btns">
      <a class="pill pill--accent pill--lg" href="${cal}" target="_blank" rel="noopener">Book my audit call ↗</a>
      <a class="pill pill--wa" href="${WHATSAPP_URL}" target="_blank" rel="noopener">WhatsApp instead ↗</a>
    </div>
    <p class="form__note">While you wait: open your homepage on your phone. Can a stranger tell who it's for in 5 seconds?</p>`;
  try { window.dataLayer && window.dataLayer.push({ event: "generate_lead", lead_priority: priority }); } catch (_) {}
});

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
