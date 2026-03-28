// TradeMentor AI — Background Service Worker
'use strict';

// Per-tab context store
const tabContexts = new Map();

// ─── Extension Setup ─────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Make side panel open on toolbar action click
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  setDynamicIcon();
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (e) {
    // Fallback: panel may already be open
  }
});

// ─── Dynamic Icon (no PNG files needed) ──────────────────────────────────────

function setDynamicIcon() {
  try {
    const sizes = [16, 32, 48, 128];
    const imageData = {};
    sizes.forEach(size => {
      imageData[size] = drawIcon(size);
    });
    chrome.action.setIcon({ imageData });
  } catch (e) {
    // OffscreenCanvas not available in all contexts; ignore
  }
}

function drawIcon(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;

  // Background
  ctx.fillStyle = '#0A0A0F';
  roundRect(ctx, 0, 0, s, s, s * 0.18);
  ctx.fill();

  // Cyan accent bar (chart line)
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = s * 0.08;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(s * 0.12, s * 0.72);
  ctx.lineTo(s * 0.32, s * 0.45);
  ctx.lineTo(s * 0.52, s * 0.58);
  ctx.lineTo(s * 0.72, s * 0.28);
  ctx.lineTo(s * 0.88, s * 0.38);
  ctx.stroke();

  // Purple dot at peak
  ctx.fillStyle = '#7C3AED';
  ctx.beginPath();
  ctx.arc(s * 0.72, s * 0.28, s * 0.1, 0, Math.PI * 2);
  ctx.fill();

  return ctx.getImageData(0, 0, s, s);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Message Routing ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'PAGE_CONTEXT':
      handlePageContext(message, sender);
      return false;

    case 'GET_CONTEXT':
      handleGetContext(sendResponse);
      return true;

    case 'CLAUDE_MESSAGE':
      handleClaudeMessage(message, sendResponse);
      return true;

    case 'CAPTURE_AND_ANALYZE':
      handleCaptureAndAnalyze(message, sendResponse);
      return true;

    default:
      return false;
  }
});

// ─── Context Handlers ─────────────────────────────────────────────────────────

function handlePageContext(message, sender) {
  const tabId = sender.tab?.id;
  if (tabId) {
    tabContexts.set(tabId, { ...message.context, timestamp: Date.now() });
  }
}

async function handleGetContext(sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const context = tab?.id ? tabContexts.get(tab.id) || null : null;
    sendResponse({ context });
  } catch (e) {
    sendResponse({ context: null });
  }
}

// ─── Claude API Handlers ──────────────────────────────────────────────────────

async function getApiKey() {
  const result = await chrome.storage.local.get(['apiKey']);
  return result.apiKey || null;
}

function buildSystemPrompt(context) {
  const contextBlock = context
    ? `
Current page context detected by the extension:
- Site: ${context.siteName || context.domain || 'Unknown'}
- Page title: ${context.pageTitle || 'Unknown'}
- Chart detected: ${context.chartDetected ? 'Yes' : 'No'}
- Chart type: ${context.chartType || 'Unknown'}
- Detected tickers: ${context.tickers?.join(', ') || 'None'}
- Timeframe hints: ${context.timeframeHints?.join(', ') || 'None'}
- Trading site: ${context.isTradingSite ? 'Yes' : 'Uncertain'}
`
    : 'No specific chart context available — the user may have started coaching manually.';

  return `You are TradeMentor AI, a professional chart-side trading education coach embedded in a Chrome extension. You help traders learn to read charts using the Socratic method — guiding discovery through questions rather than giving direct answers.

${contextBlock}

YOUR COACHING APPROACH:
- Ask ONE focused, specific question per response to guide the user's thinking
- Build progressively: context → trend → structure → entry criteria → risk → invalidation
- Celebrate correct observations; gently redirect misconceptions with a follow-up question
- If analyzing a screenshot, identify what you see (asset, timeframe, pattern, trend) then pivot to coaching
- Keep responses concise: 2–4 sentences + one question, unless the user asks for a deeper explanation

TOPICS TO COACH:
- Trend (higher highs/lows, moving average direction, market structure)
- Support & resistance (prior highs/lows, round numbers, volume nodes, trendlines)
- Chart patterns (flags, wedges, triangles, H&S, double tops/bottoms, cup & handle)
- Candlestick patterns (engulfing, pin bar, doji, inside bar, morning/evening star)
- Momentum (divergence, RSI/MACD context, speed of move, volume confirmation)
- Trade management (entries, stops, targets, risk/reward thinking)
- Psychology (patience, FOMO, revenge trading, following your plan)

ABSOLUTE RULES:
- NEVER give specific buy/sell signals, entry prices, or guaranteed outcomes
- NEVER say "you should buy/sell here" or "this will go up/down"
- Frame everything as educational exploration: "What do you notice...", "How would you describe...", "What might this suggest..."
- If the user asks for a direct signal, redirect: "As a coach I can't give signals, but let's think through what the chart is telling us. What's the trend direction?"
- Adjust depth to experience level: simplify for beginners, go technical for experienced traders

RESPONSE FORMAT:
- Start with a brief observation or validation of what the user said
- Give your coaching point or explanation (1–3 sentences)
- End with ONE clear, specific question
- Use plain text; no headers needed for short responses; use bullet points sparingly for checklists`;
}

async function callClaude(apiKey, systemPrompt, messages, maxTokens = 1024) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    let errMsg = `API error ${response.status}`;
    try {
      const errData = await response.json();
      errMsg = errData.error?.message || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function handleClaudeMessage(message, sendResponse) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) { sendResponse({ error: 'NO_API_KEY' }); return; }

    const { conversationHistory, tabContext } = message;
    const systemPrompt = buildSystemPrompt(tabContext);
    const reply = await callClaude(apiKey, systemPrompt, conversationHistory);
    sendResponse({ reply });
  } catch (err) {
    sendResponse({ error: err.message });
  }
}

async function handleCaptureAndAnalyze(message, sendResponse) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) { sendResponse({ error: 'NO_API_KEY' }); return; }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabContext = tab?.id ? tabContexts.get(tab.id) || null : null;
    const systemPrompt = buildSystemPrompt(tabContext);

    // Attempt screenshot capture
    let screenshotBase64 = null;
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png', quality: 90 });
      screenshotBase64 = dataUrl.replace('data:image/png;base64,', '');
    } catch (captureErr) {
      // Proceed without screenshot
    }

    let userContent;
    if (screenshotBase64) {
      userContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: screenshotBase64 }
        },
        {
          type: 'text',
          text: 'Please analyze this trading chart screenshot. Identify what you see — asset, timeframe (if visible), trend direction, notable chart patterns, key price levels, and any standout candlestick formations. Then begin coaching me by asking one focused question about what I should be paying attention to first.'
        }
      ];
    } else {
      const contextHint = tabContext
        ? `I am viewing ${tabContext.siteName || tabContext.domain || 'a charting site'}.${tabContext.tickers?.length ? ` Detected tickers: ${tabContext.tickers.join(', ')}.` : ''}`
        : 'I am viewing a trading chart.';
      userContent = `${contextHint} I couldn't capture a screenshot, but please begin coaching me. Start by asking me what trend direction I observe and why.`;
    }

    const { conversationHistory = [] } = message;
    const messages = [...conversationHistory, { role: 'user', content: userContent }];
    const reply = await callClaude(apiKey, systemPrompt, messages, 1024);
    sendResponse({ reply });
  } catch (err) {
    sendResponse({ error: err.message });
  }
}

// ─── Tab Cleanup ──────────────────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener((tabId) => {
  tabContexts.delete(tabId);
});
