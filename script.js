// ===== SETTINGS: edit these two lines =====
// 1. Create a free form at https://formspree.io, paste its endpoint here (e.g. "https://formspree.io/f/abcdwxyz").
//    Leads then land in your inbox automatically.
const FORM_ENDPOINT = "";
// 2. Your contact email. Used for the footer link and as a fallback if FORM_ENDPOINT is empty.
const CONTACT_EMAIL = "hello@bncapparel.site";
// ==========================================

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("footerEmail").href = "mailto:" + CONTACT_EMAIL;

// ----- Ad readiness check -----
const checklist = document.getElementById("checklist");
const boxes = checklist.querySelectorAll("input[type=checkbox]");
const scoreNum = document.getElementById("scoreNum");
const meterFill = document.getElementById("meterFill");
const verdict = document.getElementById("verdict");
const checkCta = document.getElementById("checkCta");

function updateCheck() {
  const score = [...boxes].filter((b) => b.checked).length;
  scoreNum.textContent = score;
  meterFill.style.width = (score / boxes.length) * 100 + "%";
  let color = "var(--high)";
  let text;
  if (score === 0) {
    text = "Tick the boxes to see your result.";
  } else if (score <= 3) {
    text = "Hold off on ads for now. Spending before these foundations are in place usually means paying to learn what the store isn't ready for. The audit will show you what to fix first.";
    checkCta.textContent = "Show me what to fix first";
  } else if (score <= 5) {
    color = "var(--med)";
    text = "You're close. A couple of gaps could quietly eat your ad budget. Fix those and your first campaigns will work much harder.";
    checkCta.textContent = "Find my gaps for free";
  } else {
    color = "#3fbf5f";
    text = "Strong foundations. You're in a good spot to test ads. The audit can confirm it and point out where to start.";
    checkCta.textContent = "Confirm I'm ready";
  }
  meterFill.style.background = color;
  verdict.textContent = text;
}
boxes.forEach((b) => b.addEventListener("change", updateCheck));

// ----- Lead form -----
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
  if (form._gotcha.value) return; // bot

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
      <h3>Got it, ${escapeHtml(data.get("name").split(" ")[0])}.</h3>
      <p>I'll take a proper look at <b>${escapeHtml(data.get("brand"))}</b> and send your top fixes within 48 hours.</p>
      <p class="small">While you wait: check your homepage on your phone. Can a stranger tell who it's for in 5 seconds?</p>`;
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Send me my free audit";
    statusEl.className = "form__status err";
    statusEl.innerHTML = `Something went wrong. Email me directly at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ----- Mobile sticky CTA: hide while the audit form is on screen -----
const sticky = document.querySelector(".sticky-cta");
const auditSection = document.getElementById("audit");
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => sticky.classList.toggle("hide", entry.isIntersecting), { threshold: 0.1 }).observe(auditSection);
}
