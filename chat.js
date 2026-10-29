// BNC AI chat assistant popup. Talks to /api/chat (Netlify Function) and falls back to WhatsApp.
(function () {
  const ENDPOINT = "/api/chat";
  const WA = "https://wa.me/17473364515?text=" + encodeURIComponent("Hi BNC, I have a question about my clothing brand.");
  const STORE = "bnc-chat-v1";
  const GREETING = "Hi! I'm BNC's assistant. Ask me anything about building or growing your clothing brand: design, Shopify, print on demand, SEO or ads. What are you working on?";
  const CHIPS = ["What do you do?", "How much does it cost?", "I want a free audit", "Should I run ads yet?"];

  let history = [];
  try { history = JSON.parse(sessionStorage.getItem(STORE) || "[]"); } catch (_) { history = []; }
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch (_) {} };
  const track = (event, extra) => { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event }, extra || {})); } catch (_) {} };

  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  // Minimal, safe markdown: [text](url) links and **bold**. Only http(s), site-relative and anchor links.
  function render(text) {
    let out = esc(text);
    out = out.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|#)[^)\s]*)\)/g, (m, label, url) => {
      const external = /^https?:/.test(url) && !/bncapparel\.site/.test(url);
      return `<a href="${url}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
    });
    return out.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  }

  const launch = document.createElement("button");
  launch.className = "bnc-chat-launch";
  launch.type = "button";
  launch.setAttribute("aria-label", "Chat with BNC's AI assistant");
  launch.innerHTML = '<span class="bnc-chat-launch__dot" aria-hidden="true">✦</span><span class="bnc-chat-launch__label">Ask BNC AI</span>';

  const panel = document.createElement("section");
  panel.className = "bnc-chat";
  panel.hidden = true;
  panel.setAttribute("aria-label", "BNC AI assistant");
  panel.innerHTML = `
    <div class="bnc-chat__head">
      <div class="bnc-chat__avatar" aria-hidden="true">BNC</div>
      <div class="bnc-chat__title"><b>BNC assistant</b><span>AI · replies instantly</span></div>
      <button class="bnc-chat__close" type="button" aria-label="Close chat">✕</button>
    </div>
    <div class="bnc-chat__log" role="log" aria-live="polite"></div>
    <div class="bnc-chat__chips"></div>
    <form class="bnc-chat__form">
      <label class="hp" for="bnc-chat-input" style="position:absolute;left:-9999px">Your message</label>
      <textarea id="bnc-chat-input" rows="1" placeholder="Ask about your brand…" maxlength="1500"></textarea>
      <button type="submit" aria-label="Send">↑</button>
    </form>
    <p class="bnc-chat__note">AI assistant, it can make mistakes. Prefer a person? <a href="${WA}" target="_blank" rel="noopener">WhatsApp</a></p>`;

  document.body.append(launch, panel);
  const log = panel.querySelector(".bnc-chat__log");
  const chips = panel.querySelector(".bnc-chat__chips");
  const form = panel.querySelector(".bnc-chat__form");
  const input = panel.querySelector("textarea");
  const sendBtn = form.querySelector("button");

  function bubble(role, text) {
    const div = document.createElement("div");
    div.className = "bnc-msg " + (role === "user" ? "bnc-msg--user" : "bnc-msg--bot");
    div.innerHTML = render(text);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }
  function drawChips() {
    chips.innerHTML = "";
    if (history.some((m) => m.role === "user")) return;
    CHIPS.forEach((c) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = c;
      b.addEventListener("click", () => send(c));
      chips.appendChild(b);
    });
  }
  function drawAll() {
    log.innerHTML = "";
    bubble("assistant", GREETING);
    history.forEach((m) => bubble(m.role, m.content));
    drawChips();
  }

  let busy = false;
  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true; sendBtn.disabled = true;
    history.push({ role: "user", content: text }); save();
    bubble("user", text); drawChips();
    input.value = "";
    const typing = document.createElement("div");
    typing.className = "bnc-msg bnc-msg--bot bnc-msg--typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(typing); log.scrollTop = log.scrollHeight;
    if (history.filter((m) => m.role === "user").length === 1) track("ai_chat_start");
    let reply;
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reply) reply = data.reply;
      else if (res.status === 429) reply = "I'm getting a lot of questions right now. Try again in a minute, or message BNC on [WhatsApp](" + WA + ").";
    } catch (_) {}
    typing.remove();
    if (!reply) reply = "I can't answer right now. You can message BNC directly on [WhatsApp](" + WA + ") or request a [free audit](/#audit).";
    history.push({ role: "assistant", content: reply }); save();
    bubble("assistant", reply);
    track("ai_chat_message");
    busy = false; sendBtn.disabled = false;
    input.focus();
  }

  function open() {
    panel.hidden = false; launch.classList.add("is-open");
    const t = document.querySelector(".bnc-chat-teaser"); if (t) t.remove();
    drawAll(); input.focus();
    track("ai_chat_open");
  }
  function close() { panel.hidden = true; launch.classList.remove("is-open"); launch.focus(); }

  launch.addEventListener("click", open);
  panel.querySelector(".bnc-chat__close").addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });
  form.addEventListener("submit", (e) => { e.preventDefault(); send(input.value); });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  log.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (a.getAttribute("href").startsWith("/#") && (location.pathname === "/" || location.pathname.endsWith("index.html"))) close();
    if (/wa\.me/.test(a.href)) track("whatsapp_click", { link_location: "ai_chat" });
  });

  // One gentle teaser per session, after 25 seconds, only if the chat was never opened.
  try {
    if (!sessionStorage.getItem(STORE + "-teased") && !history.length) {
      setTimeout(() => {
        if (!panel.hidden) return;
        sessionStorage.setItem(STORE + "-teased", "1");
        const t = document.createElement("div");
        t.className = "bnc-chat-teaser";
        t.innerHTML = '<button type="button" aria-label="Dismiss">✕</button>Building a clothing brand? Ask me anything, I reply instantly.';
        t.addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") t.remove(); else open(); });
        document.body.appendChild(t);
      }, 25000);
    }
  } catch (_) {}
})();
