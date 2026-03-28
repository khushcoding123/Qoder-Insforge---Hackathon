// Background service worker — manages auth token and API base URL

const DEFAULT_API_BASE = "http://localhost:3000";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["apiBase"], (result) => {
    if (!result.apiBase) {
      chrome.storage.local.set({ apiBase: DEFAULT_API_BASE });
    }
  });
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_AUTH") {
    chrome.storage.local.get(["accessToken", "apiBase"], (result) => {
      sendResponse({
        accessToken: result.accessToken || null,
        apiBase: result.apiBase || DEFAULT_API_BASE,
      });
    });
    return true; // keep channel open for async
  }

  if (message.type === "SET_AUTH") {
    chrome.storage.local.set({
      accessToken: message.accessToken,
      apiBase: message.apiBase || DEFAULT_API_BASE,
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "CLEAR_AUTH") {
    chrome.storage.local.remove(["accessToken"], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
