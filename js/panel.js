/**
 * rep+ Panel Controller
 * Manages the DevTools panel UI with split-pane layout, resizable dividers,
 * domain-grouped request list, and request/response editing
 */

import { Editor } from './components/editor.js';
import { ReplayHandler } from './components/replay.js';
import { FilterSystem } from './components/filters.js';

console.log('[rep+] Panel loaded');

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  capturing: false,
  requests: new Map(), // Map<domain, Array<request>>
  selectedRequest: null,
  currentResponse: null,
  theme: 'dark',
  expandedDomains: new Set(),
  searchTerm: '',
  isResizing: false,
  // Components
  editor: null,
  replay: null,
  filters: null,
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[rep+] Initializing panel...');
  initializeUI();
  loadSettings();
  setupEventListeners();
  setupResizers();
  loadRequests();
  connectToBackground();
});

function initializeUI() {
  document.documentElement.setAttribute('data-theme', state.theme);
  updateRequestCount();
  updateStatusIndicator('Ready', false);
}

async function loadSettings() {
  try {
    const result = await chrome.runtime.sendMessage({
      type: 'GET_SETTINGS',
    });

    if (result.success && result.settings) {
      state.theme = result.settings.theme || 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);

      if (result.settings.autoCapture) {
        startCapture();
      }
    }
  } catch (error) {
    console.error('[rep+] Failed to load settings:', error);
  }
}

async function loadRequests() {
  try {
    const result = await chrome.runtime.sendMessage({
      type: 'GET_REQUESTS_BY_DOMAIN',
    });

    if (result.success && result.requests) {
      state.requests = new Map(Object.entries(result.requests));
      renderRequestList();
      updateRequestCount();
    }
  } catch (error) {
    console.error('[rep+] Failed to load requests:', error);
  }
}

function connectToBackground() {
  // Listen for new requests from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'REQUEST_CAPTURED':
        handleNewRequest(message.request);
        break;
      case 'CAPTURE_STARTED':
        state.capturing = true;
        updateCaptureButton();
        updateStatusIndicator('Capturing...', true);
        break;
      case 'CAPTURE_STOPPED':
        state.capturing = false;
        updateCaptureButton();
        updateStatusIndicator('Ready', false);
        break;
    }
  });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Initialize Components
  state.editor = new Editor();
  state.replay = new ReplayHandler(state.editor);
  state.filters = new FilterSystem(({ query, method }) => {
    state.searchTerm = query.toLowerCase();
    state.methodFilter = method.toUpperCase();
    renderRequestList();
  });

  // Toolbar buttons
  document.getElementById('btn-capture').addEventListener('click', toggleCapture);
  document.getElementById('btn-clear').addEventListener('click', clearAllRequests);
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);
  document.getElementById('btn-settings').addEventListener('click', openSettings);

  // Request editor buttons
  // Note: btn-send is now handled by ReplayHandler
  document.getElementById('btn-duplicate').addEventListener('click', duplicateRequest);
  document.getElementById('btn-save').addEventListener('click', saveRequest);

  // Tabs are now handled by Editor component and Replay component
  // ... but we might keep some legacy handlers if needed for other tabs like 'Params' or 'Body' specific logic

  // Request editor tabs
  document.getElementById('add-header').addEventListener('click', () => addKeyValueRow('headers'));
  document.getElementById('add-param').addEventListener('click', () => addKeyValueRow('params'));

  // Method and URL
  document.getElementById('request-method').addEventListener('change', handleMethodChange);
  document.getElementById('request-url').addEventListener('input', handleUrlChange);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

function setupTabs() {
  // Request editor tabs
  document.querySelectorAll('.request-editor .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab('.request-editor', tabName);
    });
  });

  // Response viewer tabs
  document.querySelectorAll('.response-viewer .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab('.response-viewer', tabName);
    });
  });
}

function switchTab(container, tabName) {
  const containerEl = document.querySelector(container);

  // Update tab buttons
  containerEl.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  containerEl.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab panes
  containerEl.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
  containerEl.querySelector(`#tab-${tabName}`).classList.add('active');
}

// ============================================
// RESIZABLE DIVIDERS
// ============================================

function setupResizers() {
  const resizers = document.querySelectorAll('.resizer');

  resizers.forEach((resizer, index) => {
    let startX, startWidth, leftPane, rightPane;

    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      state.isResizing = true;
      document.body.classList.add('resizing-active');
      resizer.classList.add('resizing');

      startX = e.clientX;

      // Get adjacent panes
      const allPanes = Array.from(document.querySelectorAll('.split-pane'));
      leftPane = allPanes[index];
      rightPane = allPanes[index + 1];

      startWidth = leftPane.getBoundingClientRect().width;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    function handleMouseMove(e) {
      if (!state.isResizing) return;

      const delta = e.clientX - startX;
      const newWidth = startWidth + delta;

      // Get min/max constraints
      const minWidth = parseInt(leftPane.dataset.minWidth || 200);
      const maxWidth = parseInt(leftPane.dataset.maxWidth || 99999);

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        leftPane.style.width = `${newWidth}px`;
      }
    }

    function handleMouseUp() {
      state.isResizing = false;
      document.body.classList.remove('resizing-active');
      resizer.classList.remove('resizing');

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
  });
}

// ============================================
// REQUEST LIST RENDERING
// ============================================

function renderRequestList() {
  const requestList = document.getElementById('request-list');
  const emptyState = document.getElementById('empty-state-requests');

  // Clear existing content
  requestList.innerHTML = '';

  if (state.requests.size === 0) {
    requestList.appendChild(emptyState);
    return;
  }

  // Hide empty state
  if (emptyState.parentNode === requestList) {
    emptyState.remove();
  }

  // Group by domain
  state.requests.forEach((requests, domain) => {
    const filteredRequests = filterRequests(requests);
    if (filteredRequests.length === 0) return;

    const domainGroup = createDomainGroup(domain, filteredRequests);
    requestList.appendChild(domainGroup);
  });

  updateDomainCount();
}

function filterRequests(requests) {
  // Use filter component logic
  const query = state.searchTerm;
  const method = state.methodFilter;

  return requests.filter((req) => {
    // Basic legacy filter was just search term
    // Now we use FilterSystem.matches
    return FilterSystem.matches(req, { query, method });
  });
}

function createDomainGroup(domain, requests) {
  const group = document.createElement('div');
  group.className = 'domain-group';

  const isExpanded = state.expandedDomains.has(domain);

  // Domain header
  const header = document.createElement('div');
  header.className = 'domain-header';
  header.innerHTML = `
    <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
    <span class="domain-name">${escapeHtml(domain)}</span>
    <span class="domain-count">${requests.length}</span>
  `;

  header.addEventListener('click', () => toggleDomain(domain));

  // Domain requests
  const requestsContainer = document.createElement('div');
  requestsContainer.className = 'domain-requests';
  requestsContainer.style.display = isExpanded ? 'block' : 'none';

  requests.forEach((request) => {
    const requestItem = createRequestItem(request);
    requestsContainer.appendChild(requestItem);
  });

  group.appendChild(header);
  group.appendChild(requestsContainer);

  return group;
}

function createRequestItem(request) {
  const item = document.createElement('div');
  item.className = 'request-item';
  item.dataset.requestId = request.id;

  if (state.selectedRequest?.id === request.id) {
    item.classList.add('selected');
  }

  const method = request.method || 'GET';
  const url = new URL(request.url);
  const path = url.pathname + url.search;
  const status = request.response?.status || '';
  const statusClass = getStatusClass(status);

  item.innerHTML = `
    <div class="request-method ${method.toLowerCase()}">${escapeHtml(method)}</div>
    <div class="request-path" title="${escapeHtml(request.url)}">${escapeHtml(path)}</div>
    ${status ? `<div class="request-status ${statusClass}">${status}</div>` : ''}
    <div class="request-time">${formatTime(request.timestamp)}</div>
  `;

  // Insert badge
  const methodEl = item.querySelector('.request-method');
  methodEl.innerHTML = '';
  methodEl.appendChild(FilterSystem.createMethodBadge(request.method));

  item.addEventListener('click', () => selectRequest(request));

  // Context menu
  item.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showRequestContextMenu(e, request);
  });

  return item;
}

function toggleDomain(domain) {
  if (state.expandedDomains.has(domain)) {
    state.expandedDomains.delete(domain);
  } else {
    state.expandedDomains.add(domain);
  }
  renderRequestList();
}

// ============================================
// REQUEST SELECTION & EDITING
// ============================================

function selectRequest(request) {
  state.selectedRequest = request;

  // Update selection in list
  document.querySelectorAll('.request-item').forEach((item) => {
    item.classList.toggle('selected', item.dataset.requestId === request.id);
  });

  // Show editor, hide empty state
  document.getElementById('empty-state-editor').style.display = 'none';
  document.getElementById('request-editor').style.display = 'block';

  // Populate editor
  populateEditor(request);

  // Show response if available
  if (request.response) {
    populateResponse(request.response);
    document.getElementById('empty-state-response').style.display = 'none';
  }

  // Update status bar
  updateSelectedInfo(request);
}

function populateEditor(request) {
  // Method and URL
  document.getElementById('request-method').value = request.method || 'GET';
  document.getElementById('request-url').value = request.url || '';

  // Raw request - Delegated to Editor Component
  if (state.editor) {
    state.editor.loadRequest(request);
  } else {
    // Fallback
    const rawRequest = buildRawRequest(request);
    document.getElementById('raw-request').value = rawRequest;
  }

  // Headers
  populateKeyValueEditor('headers', request.headers || {});

  // Query params
  try {
    const url = new URL(request.url); // Use request.url not url
    const params = Object.fromEntries(url.searchParams);
    populateKeyValueEditor('params', params);
  } catch (e) {}

  // Body
  document.getElementById('body-editor').value = request.body || '';
}

function buildRawRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  let raw = `${request.method} ${path} HTTP/1.1\r\n`;
  raw += `Host: ${url.host}\r\n`;

  if (request.headers) {
    for (const [key, value] of Object.entries(request.headers)) {
      if (key.toLowerCase() !== 'host') {
        raw += `${key}: ${value}\r\n`;
      }
    }
  }

  raw += '\r\n';

  if (request.body) {
    raw += request.body;
  }

  return raw;
}

function populateKeyValueEditor(type, data) {
  const container = document.getElementById(`${type}-editor`);
  container.innerHTML = '';

  for (const [key, value] of Object.entries(data)) {
    addKeyValueRow(type, key, value);
  }
}

function addKeyValueRow(type, key = '', value = '') {
  const container = document.getElementById(`${type}-editor`);

  const row = document.createElement('div');
  row.className = 'key-value-row';
  row.innerHTML = `
    <input type="checkbox" class="row-enabled" checked>
    <input type="text" class="row-key" placeholder="Key" value="${escapeHtml(key)}">
    <input type="text" class="row-value" placeholder="Value" value="${escapeHtml(value)}">
    <button class="btn-remove-row" title="Remove">×</button>
  `;

  row.querySelector('.btn-remove-row').addEventListener('click', () => row.remove());

  container.appendChild(row);
}

function populateResponse(response) {
  // Status badge
  const statusBadge = document.getElementById('response-status');
  const statusClass = getStatusClass(response.status);
  statusBadge.textContent = `${response.status} ${response.statusText || ''}`;
  statusBadge.className = `status-badge ${statusClass}`;

  // Time and size
  document.getElementById('response-time').textContent = `${response.time || 0}ms`;
  document.getElementById('response-size').textContent = formatSize(response.size || 0);

  // Raw response
  let rawResponse = `HTTP/1.1 ${response.status} ${response.statusText}\r\n`;
  if (response.headers) {
    for (const [key, value] of Object.entries(response.headers)) {
      rawResponse += `${key}: ${value}\r\n`;
    }
  }
  rawResponse += '\r\n';
  rawResponse += response.body || '';

  document.getElementById('response-raw').textContent = rawResponse;

  // Response headers
  const headersContainer = document.getElementById('response-headers');
  headersContainer.innerHTML = '';
  if (response.headers) {
    for (const [key, value] of Object.entries(response.headers)) {
      const headerRow = document.createElement('div');
      headerRow.className = 'header-row';
      headerRow.innerHTML = `
        <span class="header-key">${escapeHtml(key)}:</span>
        <span class="header-value">${escapeHtml(value)}</span>
      `;
      headersContainer.appendChild(headerRow);
    }
  }

  // Preview
  const preview = document.getElementById('response-preview');
  preview.innerHTML = '';

  const contentType = response.headers?.['content-type'] || '';

  if (contentType.includes('application/json')) {
    try {
      const json = JSON.parse(response.body);
      preview.innerHTML = `<pre>${escapeHtml(JSON.stringify(json, null, 2))}</pre>`;
    } catch {
      preview.textContent = response.body;
    }
  } else if (contentType.includes('text/html')) {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.srcdoc = response.body;
    preview.appendChild(iframe);
  } else if (contentType.includes('image/')) {
    const img = document.createElement('img');
    img.src = `data:${contentType};base64,${response.body}`;
    img.style.maxWidth = '100%';
    preview.appendChild(img);
  } else {
    preview.textContent = response.body;
  }
}

// ============================================
// ACTIONS
// ============================================

async function toggleCapture() {
  if (state.capturing) {
    await stopCapture();
  } else {
    await startCapture();
  }
}

async function startCapture() {
  try {
    const result = await chrome.runtime.sendMessage({ type: 'START_CAPTURE' });
    if (result.success) {
      state.capturing = true;
      updateCaptureButton();
      updateStatusIndicator('Capturing...', true);
    }
  } catch (error) {
    console.error('[rep+] Failed to start capture:', error);
  }
}

async function stopCapture() {
  try {
    const result = await chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' });
    if (result.success) {
      state.capturing = false;
      updateCaptureButton();
      updateStatusIndicator('Ready', false);
    }
  } catch (error) {
    console.error('[rep+] Failed to stop capture:', error);
  }
}

async function clearAllRequests() {
  if (!confirm('Clear all captured requests?')) return;

  try {
    const result = await chrome.runtime.sendMessage({ type: 'CLEAR_REQUESTS' });
    if (result.success) {
      state.requests.clear();
      state.selectedRequest = null;
      renderRequestList();
      updateRequestCount();
      clearEditor();
    }
  } catch (error) {
    console.error('[rep+] Failed to clear requests:', error);
  }
}

async function sendRequest() {
  if (!state.selectedRequest) return;

  const btn = document.getElementById('btn-send');
  btn.disabled = true;
  btn.innerHTML = '<span class="icon">⏳</span> Sending...';

  try {
    // Gather current editor state
    const method = document.getElementById('request-method').value;
    const url = document.getElementById('request-url').value;
    const headers = getKeyValueData('headers');
    const body = document.getElementById('body-editor').value;

    const result = await chrome.runtime.sendMessage({
      type: 'SEND_REQUEST',
      request: {
        ...state.selectedRequest,
        method,
        url,
        headers,
        body,
      },
    });

    if (result.success && result.response) {
      state.currentResponse = result.response;
      populateResponse(result.response);
      document.getElementById('empty-state-response').style.display = 'none';
    }
  } catch (error) {
    console.error('[rep+] Failed to send request:', error);
    alert('Failed to send request: ' + error.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="icon">▶</span> Send';
  }
}

function getKeyValueData(type) {
  const container = document.getElementById(`${type}-editor`);
  const rows = container.querySelectorAll('.key-value-row');
  const data = {};

  rows.forEach((row) => {
    const enabled = row.querySelector('.row-enabled').checked;
    const key = row.querySelector('.row-key').value.trim();
    const value = row.querySelector('.row-value').value;

    if (enabled && key) {
      data[key] = value;
    }
  });

  return data;
}

function duplicateRequest() {
  if (!state.selectedRequest) return;

  const duplicate = {
    ...state.selectedRequest,
    id: generateId(),
    timestamp: Date.now(),
  };

  // Add to list
  const domain = new URL(duplicate.url).hostname;
  if (!state.requests.has(domain)) {
    state.requests.set(domain, []);
  }
  state.requests.get(domain).push(duplicate);

  renderRequestList();
  selectRequest(duplicate);
}

async function saveRequest() {
  if (!state.selectedRequest) return;

  try {
    const result = await chrome.runtime.sendMessage({
      type: 'SAVE_REQUEST',
      request: state.selectedRequest,
    });

    if (result.success) {
      alert('Request saved!');
    }
  } catch (error) {
    console.error('[rep+] Failed to save request:', error);
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);

  chrome.runtime.sendMessage({
    type: 'UPDATE_SETTINGS',
    settings: { theme: state.theme },
  });
}

function openSettings() {
  // TODO: Implement settings modal
  alert('Settings panel coming soon!');
}

// ============================================
// UTILITIES
// ============================================

function handleNewRequest(request) {
  const domain = new URL(request.url).hostname;

  if (!state.requests.has(domain)) {
    state.requests.set(domain, []);
    state.expandedDomains.add(domain);
  }

  state.requests.get(domain).unshift(request);

  renderRequestList();
  updateRequestCount();
}

function handleSearch(e) {
  state.searchTerm = e.target.value;
  renderRequestList();
}

function handleMethodChange() {
  // Update raw request when method changes
  if (state.selectedRequest) {
    const raw = buildRawRequest({
      ...state.selectedRequest,
      method: document.getElementById('request-method').value,
    });
    document.getElementById('raw-request').value = raw;
  }
}

function handleUrlChange() {
  // Update raw request when URL changes
  if (state.selectedRequest) {
    const raw = buildRawRequest({
      ...state.selectedRequest,
      url: document.getElementById('request-url').value,
    });
    document.getElementById('raw-request').value = raw;
  }
}

function handleKeyboardShortcuts(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'r':
        e.preventDefault();
        toggleCapture();
        break;
      case 'l':
        e.preventDefault();
        clearAllRequests();
        break;
      case 't':
        e.preventDefault();
        toggleTheme();
        break;
      case 'd':
        e.preventDefault();
        duplicateRequest();
        break;
      case 'Enter':
        e.preventDefault();
        sendRequest();
        break;
    }
  }
}

function updateCaptureButton() {
  const btn = document.getElementById('btn-capture');
  if (state.capturing) {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-danger');
    btn.innerHTML = '<span class="icon">⏹</span> Stop';
  } else {
    btn.classList.remove('btn-danger');
    btn.classList.add('btn-primary');
    btn.innerHTML = '<span class="icon">⏺</span> Capture';
  }
}

function updateStatusIndicator(text, active) {
  const indicator = document.getElementById('status-indicator');
  const statusText = indicator.querySelector('.status-text');
  statusText.textContent = text;

  if (active) {
    indicator.classList.add('active');
  } else {
    indicator.classList.remove('active');
  }
}

function updateRequestCount() {
  let total = 0;
  state.requests.forEach((requests) => {
    total += requests.length;
  });

  document.getElementById('request-counter').textContent =
    `${total} request${total !== 1 ? 's' : ''}`;
}

function updateDomainCount() {
  document.getElementById('domain-count').textContent =
    `${state.requests.size} domain${state.requests.size !== 1 ? 's' : ''}`;
}

function updateSelectedInfo(request) {
  const info = document.getElementById('selected-request-info');
  info.textContent = `${request.method} ${request.url}`;
}

function clearEditor() {
  document.getElementById('request-method').value = 'GET';
  document.getElementById('request-url').value = '';
  document.getElementById('raw-request').value = '';
  document.getElementById('body-editor').value = '';
  document.getElementById('headers-editor').innerHTML = '';
  document.getElementById('params-editor').innerHTML = '';
  document.getElementById('empty-state-editor').style.display = 'block';
  document.getElementById('request-editor').style.display = 'none';
}

function showRequestContextMenu(e, request) {
  // TODO: Implement context menu
  console.log('Context menu for request:', request);
}

// Helper functions
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusClass(status) {
  if (!status) return '';
  if (status >= 200 && status < 300) return 'status-2xx';
  if (status >= 300 && status < 400) return 'status-3xx';
  if (status >= 400 && status < 500) return 'status-4xx';
  if (status >= 500) return 'status-5xx';
  return '';
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

console.log('[rep+] Panel initialization complete');
