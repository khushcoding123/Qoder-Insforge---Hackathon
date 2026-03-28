// TradeMentor AI — Options Page Script
'use strict';

const apiKeyInput = document.getElementById('api-key-input');
const saveBtn     = document.getElementById('save-btn');
const clearBtn    = document.getElementById('clear-btn');
const saveStatus  = document.getElementById('save-status');
const keyDot      = document.getElementById('key-dot');
const keyLabel    = document.getElementById('key-label');
const toggleVis   = document.getElementById('toggle-vis');

// ─── Load Saved Key ────────────────────────────────────────────────────────────

async function loadSavedKey() {
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (apiKey) {
    // Show masked version
    const masked = apiKey.slice(0, 10) + '…' + apiKey.slice(-4);
    keyDot.className = 'key-dot saved';
    keyLabel.innerHTML = `<strong>API key saved</strong> <span style="font-family:monospace;font-size:11px">${masked}</span>`;
    apiKeyInput.placeholder = 'Enter new key to replace…';
  } else {
    keyDot.className = 'key-dot missing';
    keyLabel.textContent = 'No API key saved';
    apiKeyInput.placeholder = 'sk-ant-api03-…';
  }
}

loadSavedKey();

// ─── Toggle Visibility ────────────────────────────────────────────────────────

toggleVis.addEventListener('click', () => {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleVis.textContent = 'Hide';
  } else {
    apiKeyInput.type = 'password';
    toggleVis.textContent = 'Show';
  }
});

// ─── Save ─────────────────────────────────────────────────────────────────────

saveBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();

  if (!key) {
    setStatus('Enter an API key first.', 'error');
    return;
  }

  if (!key.startsWith('sk-ant-')) {
    setStatus('Invalid key format — should start with sk-ant-…', 'error');
    return;
  }

  saveBtn.disabled = true;
  setStatus('Saving…', 'saving');

  try {
    await chrome.storage.local.set({ apiKey: key });
    apiKeyInput.value = '';
    apiKeyInput.type = 'password';
    toggleVis.textContent = 'Show';
    setStatus('✓ API key saved successfully', 'ok');
    loadSavedKey();
  } catch (err) {
    setStatus('Failed to save: ' + err.message, 'error');
  } finally {
    saveBtn.disabled = false;
  }
});

// ─── Clear ────────────────────────────────────────────────────────────────────

clearBtn.addEventListener('click', async () => {
  if (!confirm('Remove the saved API key?')) return;
  await chrome.storage.local.remove(['apiKey']);
  apiKeyInput.value = '';
  setStatus('API key removed.', 'saving');
  loadSavedKey();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setStatus(msg, type) {
  saveStatus.textContent = msg;
  saveStatus.className = `status-${type}`;
  if (type === 'ok') {
    setTimeout(() => { saveStatus.textContent = ''; }, 4000);
  }
}

// Allow Enter key to save
apiKeyInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveBtn.click();
});
