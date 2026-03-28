// TradeMentor AI — Panel Script
'use strict';

// ─── State ────────────────────────────────────────────────────────────────────

let state = 'init';
let tabContext = null;
// conversationHistory holds only {role, content} for the Claude API
let conversationHistory = [];
let isAwaitingResponse = false;

// ─── DOM References ───────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

const statusBadge    = $('status-badge');
const statusText     = $('status-text');
const contextBanner  = $('context-banner');
const contextSite    = $('context-site');
const contextDetails = $('context-details');
const noApiKeyState  = $('no-api-key-state');
const noChartState   = $('no-chart-state');
const detectingState = $('detecting-state');
const chatArea       = $('chat-area');
const messagesEl     = $('messages');
const quickActions   = $('quick-actions');
const inputArea      = $('input-area');
const userInput      = $('user-input');
const sendBtn        = $('send-btn');
const analyzeBtn     = $('analyze-btn');
const newSessionBtn  = $('new-session-btn');
const settingsBtn    = $('settings-btn');
const openSettingsBtn = $('open-settings-btn');
const forceStartBtn  = $('force-start-btn');

// ─── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (!apiKey) { setState('no-api-key'); return; }

  setState('detecting');

  try {
    const resp = await chrome.runtime.sendMessage({ type: 'GET_CONTEXT' });
    tabContext = resp?.context || null;

    if (tabContext?.isSupported) {
      setState('ready');
    } else {
      setState('no-chart');
    }
  } catch (_) {
    setState('no-chart');
  }
}

// ─── State Machine ────────────────────────────────────────────────────────────

function setState(newState) {
  state = newState;

  // Hide everything
  noApiKeyState.classList.add('hidden');
  detectingState.classList.add('hidden');
  noChartState.classList.add('hidden');
  chatArea.classList.add('hidden');
  quickActions.classList.add('hidden');
  inputArea.classList.add('hidden');
  contextBanner.classList.add('hidden');
  statusBadge.className = 'status-badge';

  switch (newState) {
    case 'no-api-key':
      statusBadge.classList.add('status-error');
      statusText.textContent = 'Setup Required';
      noApiKeyState.classList.remove('hidden');
      break;

    case 'detecting':
      statusBadge.classList.add('status-detecting');
      statusText.textContent = 'Detecting…';
      detectingState.classList.remove('hidden');
      break;

    case 'no-chart':
      statusBadge.classList.add('status-no-chart');
      statusText.textContent = 'No Chart';
      noChartState.classList.remove('hidden');
      chatArea.classList.remove('hidden');
      inputArea.classList.remove('hidden');
      if (conversationHistory.length === 0) showWelcome(false);
      break;

    case 'ready':
      statusBadge.classList.add('status-ready');
      statusText.textContent = 'Chart Detected';
      updateContextBanner();
      contextBanner.classList.remove('hidden');
      chatArea.classList.remove('hidden');
      inputArea.classList.remove('hidden');
      if (conversationHistory.length === 0) {
        quickActions.classList.remove('hidden');
        showWelcome(true);
      }
      break;

    case 'analyzing':
      statusBadge.classList.add('status-analyzing');
      statusText.textContent = 'Analyzing…';
      contextBanner.classList.remove('hidden');
      chatArea.classList.remove('hidden');
      inputArea.classList.remove('hidden');
      break;

    case 'coaching':
      statusBadge.classList.add('status-coaching');
      statusText.textContent = 'Coaching Active';
      contextBanner.classList.remove('hidden');
      chatArea.classList.remove('hidden');
      inputArea.classList.remove('hidden');
      break;

    case 'error':
      statusBadge.classList.add('status-error');
      statusText.textContent = 'Error';
      chatArea.classList.remove('hidden');
      inputArea.classList.remove('hidden');
      break;
  }
}

// ─── Context Banner ───────────────────────────────────────────────────────────

function updateContextBanner() {
  if (!tabContext) return;

  const siteName = tabContext.siteName || tabContext.domain || 'Trading Site';
  contextSite.textContent = siteName;

  const parts = [];
  if (tabContext.tickers?.length) parts.push(tabContext.tickers.slice(0, 3).join(' · '));
  if (tabContext.chartType)       parts.push(tabContext.chartType);
  if (tabContext.timeframeHints?.length) parts.push(tabContext.timeframeHints[0]);
  contextDetails.textContent = parts.join('  ·  ') || 'Chart detected';
}

// ─── Welcome Message ──────────────────────────────────────────────────────────

function showWelcome(chartDetected) {
  const el = document.createElement('div');
  el.className = 'msg-welcome';

  const ticker = tabContext?.tickers?.[0];
  const site   = tabContext?.siteName || tabContext?.domain || 'this site';

  if (chartDetected) {
    el.innerHTML = `
      <div class="welcome-tag">CHART DETECTED</div>
      <div class="welcome-title">Ready to coach${ticker ? ` on ${ticker}` : ''}</div>
      <p>I can see you're on <strong>${site}</strong>${ticker ? ` viewing <strong>${ticker}</strong>` : ''}.</p>
      <p>Click <strong>Analyze</strong> to capture the chart with AI vision, or ask me a question to start the coaching session.</p>
    `;
  } else {
    el.innerHTML = `
      <div class="welcome-tag">COACHING MODE</div>
      <div class="welcome-title">TradeMentor AI</div>
      <p>Navigate to a trading chart, or describe what you're looking at and I'll coach you through it.</p>
    `;
  }

  messagesEl.appendChild(el);
  scrollToBottom();
}

// ─── Message Rendering ────────────────────────────────────────────────────────

function appendMessage(role, text, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = `message message-${role === 'user' ? 'user' : 'ai'}`;

  if (role === 'assistant') {
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.innerHTML = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1 8.5l2.5-4 2 2.5 2.5-4 2 2" stroke="#00E5FF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    wrap.appendChild(avatar);
  }

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble' + (opts.error ? ' error' : '');

  if (opts.loading) {
    wrap.className = 'message message-ai message-loading';
    bubble.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
    wrap.dataset.loadingId = opts.loadingId || 'loading';
  } else {
    bubble.innerHTML = formatMessageText(text);
  }

  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function removeLoading(loadingId = 'loading') {
  const el = messagesEl.querySelector(`[data-loading-id="${loadingId}"]`);
  if (el) el.remove();
}

function formatMessageText(text) {
  // Basic markdown-like formatting for a clean output
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Bullet lists
    .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((<li>.*?<\/li>\n?)+)/gs, '<ul>$1</ul>')
    // Line breaks to paragraphs
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => (p.startsWith('<ul>') ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`))
    .join('');
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ─── Send Message ─────────────────────────────────────────────────────────────

async function sendMessage(text) {
  if (!text.trim() || isAwaitingResponse) return;
  text = text.trim();

  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;
  quickActions.classList.add('hidden');

  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  const loadingId = 'msg-' + Date.now();
  appendMessage('assistant', '', { loading: true, loadingId });
  isAwaitingResponse = true;
  setState(conversationHistory.length > 2 ? 'coaching' : 'analyzing');

  try {
    const resp = await chrome.runtime.sendMessage({
      type: 'CLAUDE_MESSAGE',
      conversationHistory,
      tabContext
    });

    removeLoading(loadingId);

    if (resp.error) {
      handleApiError(resp.error);
    } else {
      appendMessage('assistant', resp.reply);
      conversationHistory.push({ role: 'assistant', content: resp.reply });
      setState('coaching');
    }
  } catch (err) {
    removeLoading(loadingId);
    handleApiError(err.message);
  } finally {
    isAwaitingResponse = false;
    updateSendBtn();
  }
}

// ─── Analyze Chart (Vision) ───────────────────────────────────────────────────

async function analyzeChart() {
  if (isAwaitingResponse) return;

  analyzeBtn.disabled = true;
  quickActions.classList.add('hidden');
  setState('analyzing');

  // Show user "action" message
  const userLabel = 'Captured chart for AI analysis';
  appendMessage('user', userLabel);

  const loadingId = 'analyze-' + Date.now();
  appendMessage('assistant', '', { loading: true, loadingId });
  isAwaitingResponse = true;

  try {
    const resp = await chrome.runtime.sendMessage({
      type: 'CAPTURE_AND_ANALYZE',
      conversationHistory,
      tabContext
    });

    removeLoading(loadingId);

    if (resp.error) {
      handleApiError(resp.error);
    } else {
      appendMessage('assistant', resp.reply);
      // Store simplified versions in history so follow-ups have context
      conversationHistory.push({ role: 'user', content: userLabel });
      conversationHistory.push({ role: 'assistant', content: resp.reply });
      setState('coaching');
    }
  } catch (err) {
    removeLoading(loadingId);
    handleApiError(err.message);
  } finally {
    isAwaitingResponse = false;
    analyzeBtn.disabled = false;
    updateSendBtn();
  }
}

// ─── Error Handling ───────────────────────────────────────────────────────────

function handleApiError(errMsg) {
  if (errMsg === 'NO_API_KEY') {
    appendMessage('assistant',
      'No API key found. Click ⚙ to open Settings and add your Anthropic API key.',
      { error: true });
    setState('error');
    return;
  }
  appendMessage('assistant',
    `Something went wrong: ${errMsg}\n\nCheck your API key in Settings or try again.`,
    { error: true });
  if (state !== 'coaching') setState('error');
}

// ─── New Session ──────────────────────────────────────────────────────────────

function resetSession() {
  conversationHistory = [];
  messagesEl.innerHTML = '';
  isAwaitingResponse = false;
  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;
  analyzeBtn.disabled = false;

  if (tabContext?.isSupported) {
    setState('ready');
  } else {
    setState('no-chart');
  }
}

// ─── Input Helpers ────────────────────────────────────────────────────────────

function updateSendBtn() {
  sendBtn.disabled = !userInput.value.trim() || isAwaitingResponse;
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

userInput.addEventListener('input', () => {
  // Auto-resize
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
  updateSendBtn();
});

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) sendMessage(userInput.value);
  }
});

sendBtn.addEventListener('click', () => sendMessage(userInput.value));

analyzeBtn.addEventListener('click', analyzeChart);

newSessionBtn.addEventListener('click', resetSession);

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

openSettingsBtn?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

forceStartBtn?.addEventListener('click', () => {
  tabContext = tabContext || { isSupported: true };
  tabContext.isSupported = true;
  setState('ready');
});

// Quick action chips
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const msg = btn.dataset.msg;
    if (msg) sendMessage(msg);
  });
});

// ─── Storage change listener (API key saved in options) ───────────────────────

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.apiKey) {
    if (changes.apiKey.newValue && state === 'no-api-key') {
      init();
    }
  }
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

init();
