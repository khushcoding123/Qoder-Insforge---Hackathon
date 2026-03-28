// TradeMentor AI — Content Script (Chart Detection & Context Extraction)
(function () {
  'use strict';

  // ─── Trading Site Registry ────────────────────────────────────────────────

  const TRADING_DOMAINS = [
    'tradingview.com', 'finance.yahoo.com', 'finviz.com', 'stockcharts.com',
    'barchart.com', 'investing.com', 'marketwatch.com', 'cnbc.com',
    'bloomberg.com', 'wsj.com', 'schwab.com', 'tdameritrade.com',
    'thinkorswim.com', 'etrade.com', 'fidelity.com', 'ibkr.com',
    'interactivebrokers.com', 'robinhood.com', 'webull.com', 'tastytrade.com',
    'tradestation.com', 'ninjatrader.com', 'tradier.com', 'alpaca.markets',
    'coinbase.com', 'binance.com', 'kraken.com', 'bitstamp.net',
    'forex.com', 'oanda.com', 'ig.com', 'cmc-markets.com',
    'macrotrends.net', 'bigcharts.marketwatch.com', 'prophet.net'
  ];

  const SITE_NAMES = {
    'tradingview.com': 'TradingView',
    'finance.yahoo.com': 'Yahoo Finance',
    'yahoo.com': 'Yahoo Finance',
    'finviz.com': 'Finviz',
    'stockcharts.com': 'StockCharts',
    'barchart.com': 'Barchart',
    'investing.com': 'Investing.com',
    'marketwatch.com': 'MarketWatch',
    'cnbc.com': 'CNBC',
    'bloomberg.com': 'Bloomberg',
    'schwab.com': 'Charles Schwab',
    'robinhood.com': 'Robinhood',
    'webull.com': 'Webull',
    'coinbase.com': 'Coinbase',
    'binance.com': 'Binance',
    'kraken.com': 'Kraken',
    'tastytrade.com': 'Tastytrade',
    'alpaca.markets': 'Alpaca Markets',
    'ibkr.com': 'Interactive Brokers',
    'interactivebrokers.com': 'Interactive Brokers',
    'macrotrends.net': 'Macrotrends',
    'forex.com': 'FOREX.com',
    'oanda.com': 'OANDA'
  };

  const CHART_URL_KEYWORDS = [
    '/chart', '/charts', '/stock', '/stocks', '/ticker', '/symbol',
    '/market', '/markets', '/trade', '/trading', '/quote', '/quotes',
    '/crypto', '/forex', '/futures', '/options', '/coin'
  ];

  const CHART_CLASS_PATTERNS = [
    'chart', 'candlestick', 'tradingview', 'highcharts',
    'lightweight-chart', 'price-chart', 'stock-chart', 'market-chart',
    'candle', 'ohlc', 'ticker-chart', 'kline'
  ];

  const TIMEFRAME_PATTERNS = [
    /\b(1m|3m|5m|10m|15m|30m|1h|2h|4h|6h|12h|1d|1w|1M)\b/,
    /\b(1 ?min|3 ?min|5 ?min|15 ?min|30 ?min|1 ?hour|4 ?hour|daily|weekly|monthly)\b/i,
    /\b(intraday|daily|weekly|monthly|yearly|annual)\b/i,
    /\b(D|W|M|Y|H4|H1|M15|M5|M1)\b/
  ];

  // Common English words that look like tickers but aren't
  const NOISE_WORDS = new Set([
    'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
    'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
    'ITS', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'DID', 'MAY',
    'OWN', 'JUST', 'LIKE', 'ALSO', 'BACK', 'COME', 'FROM', 'GIVE', 'HAVE',
    'HIGH', 'LIVE', 'LOOK', 'MAKE', 'MOVE', 'OPEN', 'OVER', 'PART', 'SHOW',
    'SUCH', 'TAKE', 'THAN', 'THAT', 'THEM', 'THEN', 'THEY', 'THIS', 'TURN',
    'VERY', 'WANT', 'WEEK', 'WERE', 'WHEN', 'WITH', 'WORD', 'WORK', 'YEAR',
    'BEEN', 'WELL', 'EVEN', 'MORE', 'MOST', 'SOME', 'TIME', 'LONG', 'DOWN',
    'ONLY', 'TELL', 'BOTH', 'LIFE', 'LAST', 'GOOD', 'GREAT', 'HELP', 'HOLD',
    'HOME', 'INTO', 'KEEP', 'KNOW', 'LESS', 'LINE', 'LOSE', 'LOVE', 'MUCH',
    'MUST', 'NAME', 'NEAR', 'NEED', 'NEXT', 'ONCE', 'PLAN', 'REAL', 'REST',
    'RISE', 'RULE', 'SAID', 'SALE', 'SEND', 'SIDE', 'SIZE', 'SLOW', 'SOON',
    'STAY', 'STEP', 'STOP', 'SURE', 'TALK', 'TEAM', 'TEST', 'TOLD', 'TOOL',
    'TRUE', 'UNIT', 'UPON', 'USED', 'USER', 'WALL', 'WAIT', 'WALK', 'WHAT',
    'WILL', 'WISH', 'ZERO', 'AREA', 'BASE', 'BILL', 'BOOK', 'BORN', 'CALL',
    'CASE', 'CASH', 'CITY', 'COST', 'DEAL', 'DEBT', 'DOES', 'DONE', 'DRAW',
    'DROP', 'EARN', 'EASY', 'ELSE', 'FAST', 'FEEL', 'FILL', 'FIND', 'FIRM',
    'FIVE', 'FLAT', 'FLOW', 'FOOD', 'FORM', 'FOUR', 'FREE', 'FULL', 'FUND',
    'GAIN', 'GAME', 'GAVE', 'GOAL', 'GOES', 'GOLD', 'GONE', 'GROW', 'HALF',
    'HAND', 'HARD', 'HEAD', 'HERE', 'HIRE', 'HUGE', 'IDEA', 'JOIN', 'KIND',
    'LACK', 'LAND', 'LATE', 'LEFT', 'LINK', 'LOAN', 'LOCK', 'LOSS', 'LOST',
    'MADE', 'MAIN', 'MARK', 'MEAN', 'MEET', 'MIND', 'MISS', 'MODE', 'NOTE',
    'PAID', 'PASS', 'PAST', 'PATH', 'PICK', 'POOR', 'POST', 'PURE', 'RATE',
    'RELY', 'RENT', 'RISK', 'ROLE', 'ROOT', 'SAVE', 'SEEN', 'SELF', 'SELL',
    'SETS', 'SIGN', 'SLIM', 'SORT', 'SPAN', 'SPOT', 'STEM', 'SUIT', 'SWAP',
    'SYNC', 'TERM', 'TICK', 'TIPS', 'TOLL', 'TOPS', 'TOWN', 'TYPE', 'VIEW',
    'VOTE', 'WIDE', 'WINS', 'ZONE', 'BULL', 'BEAR', 'ETF', 'IPO', 'EPS',
    'SEC', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'BTC',
    'ETH', 'API', 'CSS', 'FAQ', 'HTML', 'JSON', 'PDF', 'PNG', 'RSS', 'SQL',
    'SVG', 'URL', 'XML', 'MIN', 'MAX', 'AVG', 'SMA', 'EMA', 'RSI', 'MACD',
    'ATR', 'ADX', 'CCI', 'OBV', 'PPO', 'ROC', 'VWAP', 'CLOSE', 'PRICE',
    'CHART', 'STOCK', 'TRADE', 'MARKET', 'SHARE', 'INDEX', 'CHANGE', 'VOLUME',
    'ASK', 'BID', 'LOW', 'HIGH', 'OPEN', 'PREV', 'PCT', 'CHG'
  ]);

  // ─── Detection Logic ──────────────────────────────────────────────────────

  function detectContext() {
    const url = window.location.href;
    const domain = window.location.hostname.replace(/^www\./, '');
    const path = window.location.pathname.toLowerCase();
    const title = document.title;

    const isTradingSite = TRADING_DOMAINS.some(d => domain.includes(d));
    const hasChartUrl = CHART_URL_KEYWORDS.some(k => path.includes(k));
    const { found: chartDetected, details: chartElements, chartType } = detectChartElements();
    const tickers = extractTickers(title + ' ' + url);
    const timeframeHints = extractTimeframes(title + ' ' + (document.body?.innerText?.slice(0, 1000) || ''));
    const siteName = getSiteName(domain);

    return {
      url,
      domain,
      pageTitle: title,
      siteName,
      isTradingSite,
      hasChartUrl,
      chartDetected: chartDetected || hasChartUrl,
      chartType,
      chartElements,
      tickers: tickers.slice(0, 5),
      timeframeHints,
      isSupported: isTradingSite || chartDetected || hasChartUrl
    };
  }

  function detectChartElements() {
    const details = [];
    let found = false;
    let chartType = null;

    // Specific library fingerprints (highest confidence)
    const libraryChecks = [
      { selector: '[class*="tradingview"], [id*="tradingview"], .tv-lightweight-charts', name: 'TradingView' },
      { selector: '.highcharts-container, [data-highcharts-chart]', name: 'Highcharts' },
      { selector: '.lightweight-charts, [class*="lightweight"]', name: 'Lightweight Charts' },
      { selector: '[class*="stockchart"], [class*="stock-chart"]', name: 'Stock Chart' },
      { selector: '[class*="candlestick"], [class*="candle-stick"]', name: 'Candlestick' },
      { selector: '[class*="kline"]', name: 'K-Line Chart' }
    ];

    for (const { selector, name } of libraryChecks) {
      try {
        if (document.querySelector(selector)) {
          found = true;
          chartType = chartType || name;
          details.push(name);
        }
      } catch (_) {}
    }

    // Generic chart containers
    const genericSelectors = [
      '#chart', '.chart', '.chart-container', '.chart-wrapper',
      '[id*="chart"]', '[class*="price-chart"]', '[data-widget-type="chart"]'
    ];

    for (const sel of genericSelectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.offsetWidth > 100 && el.offsetHeight > 100) {
          found = true;
          details.push('chart-container');
          break;
        }
      } catch (_) {}
    }

    // Canvas elements (most chart libraries render to canvas)
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      if (canvas.width > 200 && canvas.height > 100) {
        const classStr = (canvas.className + ' ' +
          (canvas.parentElement?.className || '') +
          (canvas.closest('[class]')?.className || '')).toLowerCase();

        const isChartCanvas = CHART_CLASS_PATTERNS.some(p => classStr.includes(p)) || canvas.width > 400;
        if (isChartCanvas) {
          found = true;
          details.push(`canvas(${canvas.width}x${canvas.height})`);
        }
      }
    });

    // Inline HTML fingerprints
    if (!found) {
      const html = document.documentElement.innerHTML;
      if (html.includes('tradingview')) { found = true; chartType = chartType || 'TradingView'; }
      else if (html.includes('highcharts')) { found = true; chartType = chartType || 'Highcharts'; }
      else if (html.includes('lightweight-chart')) { found = true; chartType = chartType || 'Lightweight Charts'; }
      else if (html.includes('chartjs') || html.includes('chart.js')) { found = true; chartType = chartType || 'Chart.js'; }
      else if (html.includes('d3') && html.includes('path') && canvases.length === 0) {
        found = true; chartType = chartType || 'D3.js';
      }
    }

    return { found, details: [...new Set(details)], chartType };
  }

  function extractTickers(text) {
    // Match 1–5 uppercase letters, optionally with / for forex pairs (BTC/USD)
    const matches = text.match(/\b([A-Z]{1,5}(?:\/[A-Z]{1,5})?)\b/g) || [];
    return [...new Set(
      matches.filter(m => {
        const base = m.split('/')[0];
        return (
          base.length >= 2 &&
          base.length <= 5 &&
          !NOISE_WORDS.has(base) &&
          /^[A-Z]+$/.test(base)
        );
      })
    )];
  }

  function extractTimeframes(text) {
    const hits = [];
    for (const pattern of TIMEFRAME_PATTERNS) {
      const m = text.match(new RegExp(pattern.source, pattern.flags + (pattern.flags.includes('g') ? '' : 'g')));
      if (m) hits.push(...m);
    }
    return [...new Set(hits)].slice(0, 3);
  }

  function getSiteName(domain) {
    for (const [key, name] of Object.entries(SITE_NAMES)) {
      if (domain.includes(key)) return name;
    }
    // Capitalise first segment as fallback
    const seg = domain.split('.').slice(-2, -1)[0] || domain;
    return seg.charAt(0).toUpperCase() + seg.slice(1);
  }

  // ─── Communication ────────────────────────────────────────────────────────

  function sendContext() {
    const context = detectContext();
    chrome.runtime.sendMessage({ type: 'PAGE_CONTEXT', context }).catch(() => {});
  }

  // Send immediately, and again after dynamic content (SPAs, lazy charts) loads
  sendContext();
  setTimeout(sendContext, 1500);
  setTimeout(sendContext, 4000);

  // Respond to panel's direct context request
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'GET_PAGE_CONTEXT') {
      sendResponse(detectContext());
      return true;
    }
  });

})();
