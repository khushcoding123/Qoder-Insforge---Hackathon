// TradeMentor Extension Popup

let accessToken = null;
let apiBase = "http://localhost:3000";
let strategy = null;
let conversationHistory = [];
let isStreaming = false;
let rulesOpen = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loginView = document.getElementById("login-view");
const noStrategyView = document.getElementById("no-strategy-view");
const coachView = document.getElementById("coach-view");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginBtnText = document.getElementById("login-btn-text");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const strategyNameHeader = document.getElementById("strategy-name-header");
const sbName = document.getElementById("sb-name");
const sbTags = document.getElementById("sb-tags");
const rulesPanel = document.getElementById("rules-panel");
const rulesContent = document.getElementById("rules-content");
const showRulesBtn = document.getElementById("show-rules-btn");
const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msg-input");
const sendBtn = document.getElementById("send-btn");

// ── Init ──────────────────────────────────────────────────────────────────────
(async function init() {
  const stored = await getAuth();
  accessToken = stored.accessToken;
  apiBase = stored.apiBase || "http://localhost:3000";

  if (!accessToken) {
    showView("login");
    return;
  }

  await loadStrategyAndShowCoach();
})();

// ── Auth ──────────────────────────────────────────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setLoginLoading(true);
  hideError();

  try {
    const res = await fetch(`${apiBase}/api/extension/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      showError(data.error || "Sign in failed.");
      return;
    }

    accessToken = data.accessToken;
    await setAuth(accessToken);
    await loadStrategyAndShowCoach();

  } catch {
    showError("Cannot connect to TradeMentor. Make sure the app is running.");
  } finally {
    setLoginLoading(false);
  }
});

logoutBtn.addEventListener("click", async () => {
  await clearAuth();
  accessToken = null;
  strategy = null;
  conversationHistory = [];
  showView("login");
  strategyNameHeader.classList.add("hidden");
  logoutBtn.classList.add("hidden");
});

// ── Strategy loading ──────────────────────────────────────────────────────────
async function loadStrategyAndShowCoach() {
  try {
    const res = await fetch(`${apiBase}/api/extension/strategy`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 404) {
      showView("no-strategy");
      return;
    }

    if (!res.ok) {
      // Token may be expired — go back to login
      await clearAuth();
      showView("login");
      return;
    }

    strategy = await res.json();
    renderStrategyBar();
    showView("coach");
    logoutBtn.classList.remove("hidden");

  } catch {
    showView("no-strategy");
  }
}

function renderStrategyBar() {
  if (!strategy) return;

  strategyNameHeader.textContent = strategy.strategyName;
  strategyNameHeader.classList.remove("hidden");
  sbName.textContent = strategy.strategyName;

  const tags = [strategy.assetClass, strategy.tradingStyle, strategy.riskTolerance?.split("(")[0]?.trim()]
    .filter(Boolean)
    .join(" · ");
  sbTags.textContent = tags;

  // Show abbreviated blueprint in rules panel
  rulesContent.textContent = strategy.blueprintText;
}

showRulesBtn.addEventListener("click", () => {
  rulesOpen = !rulesOpen;
  rulesPanel.classList.toggle("hidden", !rulesOpen);
  showRulesBtn.textContent = rulesOpen ? "Rules ↑" : "Rules ↓";
});

// ── Chat ──────────────────────────────────────────────────────────────────────
sendBtn.addEventListener("click", sendMessage);

msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

document.querySelectorAll(".quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const msg = btn.dataset.msg;
    if (msg) {
      msgInput.value = msg;
      sendMessage();
    }
  });
});

async function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || isStreaming || !accessToken) return;

  msgInput.value = "";
  isStreaming = true;
  sendBtn.disabled = true;

  // Remove welcome message on first real message
  const welcome = messagesEl.querySelector(".welcome-msg");
  if (welcome) welcome.remove();

  appendUserMessage(text);
  const assistantBubble = appendAssistantMessage("", true);

  conversationHistory.push({ role: "user", content: text });

  try {
    const res = await fetch(`${apiBase}/api/ai/extension`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: text,
        conversationHistory: conversationHistory.slice(-6),
      }),
    });

    if (!res.ok) {
      updateBubble(assistantBubble, "Error: " + (await res.text()));
      isStreaming = false;
      sendBtn.disabled = false;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      updateBubble(assistantBubble, fullText, true);
      scrollMessages();
    }

    updateBubble(assistantBubble, fullText, false);
    conversationHistory.push({ role: "assistant", content: fullText });

  } catch (err) {
    updateBubble(assistantBubble, "Connection error. Is TradeMentor running?");
  } finally {
    isStreaming = false;
    sendBtn.disabled = false;
    scrollMessages();
  }
}

function appendUserMessage(text) {
  const div = document.createElement("div");
  div.className = "msg msg-user";
  div.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
  messagesEl.appendChild(div);
  scrollMessages();
  return div;
}

function appendAssistantMessage(text, streaming = false) {
  const div = document.createElement("div");
  div.className = "msg msg-assistant";

  const bubble = document.createElement("div");
  bubble.className = `msg-bubble${streaming ? " streaming" : ""}`;

  if (streaming && !text) {
    bubble.innerHTML = `<div class="typing-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  } else {
    bubble.innerHTML = formatResponse(text);
  }

  div.appendChild(bubble);
  messagesEl.appendChild(div);
  scrollMessages();
  return bubble;
}

function updateBubble(bubble, text, streaming = false) {
  bubble.className = `msg-bubble${streaming ? " streaming" : ""}`;
  bubble.innerHTML = formatResponse(text);
}

function formatResponse(text) {
  // Highlight YES/PARTIAL/NO alignment
  let html = escapeHtml(text);
  html = html.replace(/\bYES\b/g, '<span class="alignment-yes">YES</span>');
  html = html.replace(/\bPARTIAL\b/g, '<span class="alignment-partial">PARTIAL</span>');
  html = html.replace(/\bNO\b/g, '<span class="alignment-no">NO</span>');
  // Bold markdown **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Newlines to <br>
  html = html.replace(/\n/g, "<br>");
  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scrollMessages() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showView(view) {
  loginView.classList.add("hidden");
  noStrategyView.classList.add("hidden");
  coachView.classList.add("hidden");

  if (view === "login") loginView.classList.remove("hidden");
  else if (view === "no-strategy") noStrategyView.classList.remove("hidden");
  else if (view === "coach") coachView.classList.remove("hidden");
}

function setLoginLoading(loading) {
  loginBtn.disabled = loading;
  loginBtnText.textContent = loading ? "Signing in..." : "Sign In";
}

function showError(msg) {
  loginError.textContent = msg;
  loginError.classList.remove("hidden");
}

function hideError() {
  loginError.classList.add("hidden");
}

// ── Chrome storage helpers ────────────────────────────────────────────────────
function getAuth() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_AUTH" }, (res) => {
      resolve(res || { accessToken: null, apiBase: "http://localhost:3000" });
    });
  });
}

function setAuth(token) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "SET_AUTH", accessToken: token, apiBase }, resolve);
  });
}

function clearAuth() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "CLEAR_AUTH" }, resolve);
  });
}
