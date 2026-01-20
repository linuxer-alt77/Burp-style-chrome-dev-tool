// Main panel controller
// Manages the UI and coordinates between different modules

console.log("HTTP Request Repeater panel loaded");

// State management
const state = {
  capturing: false,
  requests: [],
  selectedRequest: null,
  currentResponse: null,
  theme: "dark",
};

// Initialize the panel
document.addEventListener("DOMContentLoaded", () => {
  console.log("Panel DOM loaded, initializing...");
  initializeUI();
  loadSettings();
  setupEventListeners();
});

// Initialize UI components
function initializeUI() {
  // Set initial theme
  document.documentElement.setAttribute("data-theme", state.theme);

  // Initialize empty states
  updateRequestCount();
  updateStatusBar("Ready");
}

// Load settings from storage
async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get(["theme", "autoCapture"]);
    if (settings.theme) {
      state.theme = settings.theme;
      document.documentElement.setAttribute("data-theme", state.theme);
    }
    if (settings.autoCapture) {
      startCapture();
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Toolbar buttons
  document
    .getElementById("btn-capture")
    ?.addEventListener("click", toggleCapture);
  document
    .getElementById("btn-clear")
    ?.addEventListener("click", clearRequests);
  document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);
  document.getElementById("btn-send")?.addEventListener("click", sendRequest);
  document
    .getElementById("btn-duplicate")
    ?.addEventListener("click", duplicateRequest);

  // Tab switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", (e) => switchTab(e.target));
  });

  // Search filter
  document
    .getElementById("search-requests")
    ?.addEventListener("input", filterRequests);
}

// Toggle network capture
async function toggleCapture() {
  state.capturing = !state.capturing;
  const btn = document.getElementById("btn-capture");

  if (state.capturing) {
    btn?.classList.add("active");
    btn.innerHTML = '<span class="icon">⏹</span> Stop';
    await startCapture();
  } else {
    btn?.classList.remove("active");
    btn.innerHTML = '<span class="icon">⏺</span> Capture';
    await stopCapture();
  }

  updateStatusBar(state.capturing ? "Capturing..." : "Ready");
}

// Start capturing network requests
async function startCapture() {
  console.log("Starting network capture...");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "START_CAPTURE",
    });
    if (response.success) {
      state.capturing = true;
      setupNetworkListener();
    }
  } catch (error) {
    console.error("Failed to start capture:", error);
  }
}

// Stop capturing network requests
async function stopCapture() {
  console.log("Stopping network capture...");

  try {
    const response = await chrome.runtime.sendMessage({ type: "STOP_CAPTURE" });
    if (response.success) {
      state.capturing = false;
    }
  } catch (error) {
    console.error("Failed to stop capture:", error);
  }
}

// Setup network request listener
function setupNetworkListener() {
  // This will be implemented to use chrome.devtools.network
  chrome.devtools.network.onRequestFinished.addListener((request) => {
    if (state.capturing) {
      addCapturedRequest(request);
    }
  });
}

// Add captured request to the list
function addCapturedRequest(request) {
  const requestData = {
    id: Date.now(),
    method: request.request.method,
    url: request.request.url,
    headers: request.request.headers,
    timestamp: new Date().toISOString(),
  };

  state.requests.unshift(requestData);
  renderRequestList();
  updateRequestCount();
}

// Render the request list
function renderRequestList() {
  const listContainer = document.getElementById("request-list");
  if (!listContainer) return;

  if (state.requests.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <p>No requests captured yet.</p>
        <p class="hint">Click "Capture" to start monitoring network traffic.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = state.requests
    .map(
      (req) => `
    <div class="request-item" data-id="${req.id}">
      <div class="request-method method-${req.method.toLowerCase()}">${req.method}</div>
      <div class="request-url" title="${req.url}">${new URL(req.url).pathname}</div>
      <div class="request-time">${new Date(req.timestamp).toLocaleTimeString()}</div>
    </div>
  `,
    )
    .join("");

  // Add click listeners to request items
  listContainer.querySelectorAll(".request-item").forEach((item) => {
    item.addEventListener("click", () => selectRequest(item.dataset.id));
  });
}

// Select a request from the list
function selectRequest(requestId) {
  state.selectedRequest = state.requests.find(
    (r) => r.id === parseInt(requestId),
  );
  if (state.selectedRequest) {
    displayRequest(state.selectedRequest);
    highlightSelectedRequest(requestId);
  }
}

// Display selected request in editor
function displayRequest(request) {
  const rawEditor = document.getElementById("raw-request");
  if (rawEditor) {
    const rawRequest = `${request.method} ${new URL(request.url).pathname} HTTP/1.1\nHost: ${new URL(request.url).host}\n${formatHeaders(request.headers)}\n\n${request.body || ""}`;
    rawEditor.value = rawRequest;
  }
}

// Format headers for display
function formatHeaders(headers) {
  if (!headers) return "";
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

// Highlight selected request in list
function highlightSelectedRequest(requestId) {
  document.querySelectorAll(".request-item").forEach((item) => {
    item.classList.remove("selected");
    if (item.dataset.id === requestId) {
      item.classList.add("selected");
    }
  });
}

// Send custom request
async function sendRequest() {
  updateStatusBar("Sending request...");

  // Get request data from editor
  const rawRequest = document.getElementById("raw-request")?.value;
  if (!rawRequest) {
    updateStatusBar("No request to send");
    return;
  }

  // Parse and send request (simplified)
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SEND_REQUEST",
      request: parseRawRequest(rawRequest),
    });

    if (response.success) {
      displayResponse(response.response);
      updateStatusBar("Request sent successfully");
    } else {
      updateStatusBar("Request failed: " + response.error);
    }
  } catch (error) {
    console.error("Failed to send request:", error);
    updateStatusBar("Request failed");
  }
}

// Parse raw HTTP request (simplified)
function parseRawRequest(rawRequest) {
  const lines = rawRequest.split("\n");
  const [method, path] = lines[0].split(" ");
  const headers = {};
  let host = "";

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") break;
    const [key, value] = lines[i].split(": ");
    headers[key] = value;
    if (key.toLowerCase() === "host") host = value;
  }

  return {
    method,
    url: `https://${host}${path}`,
    headers,
  };
}

// Display response
function displayResponse(response) {
  state.currentResponse = response;

  // Update status badge
  const statusBadge = document.getElementById("response-status");
  if (statusBadge) {
    statusBadge.textContent = `${response.status} ${response.statusText}`;
    statusBadge.className = `status-badge status-${Math.floor(response.status / 100)}xx`;
  }

  // Display raw response
  const rawViewer = document.getElementById("response-raw");
  if (rawViewer) {
    rawViewer.textContent = response.body;
  }

  // Display headers
  const headersViewer = document.getElementById("response-headers");
  if (headersViewer) {
    headersViewer.textContent = formatHeaders(response.headers);
  }
}

// Clear all requests
async function clearRequests() {
  if (confirm("Clear all captured requests?")) {
    state.requests = [];
    state.selectedRequest = null;
    state.currentResponse = null;

    await chrome.runtime.sendMessage({ type: "CLEAR_REQUESTS" });

    renderRequestList();
    updateRequestCount();
    clearEditor();
    clearResponse();
    updateStatusBar("Requests cleared");
  }
}

// Clear editor
function clearEditor() {
  const rawEditor = document.getElementById("raw-request");
  if (rawEditor) rawEditor.value = "";
}

// Clear response viewer
function clearResponse() {
  document.getElementById("response-raw").textContent = "";
  document.getElementById("response-headers").textContent = "";
  document.getElementById("response-status").textContent = "";
}

// Duplicate current request
function duplicateRequest() {
  if (state.selectedRequest) {
    const duplicate = { ...state.selectedRequest, id: Date.now() };
    state.requests.unshift(duplicate);
    renderRequestList();
    updateRequestCount();
  }
}

// Toggle theme
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", state.theme);
  chrome.storage.local.set({ theme: state.theme });
}

// Switch tabs
function switchTab(tabElement) {
  const tabParent = tabElement.closest(".tabs");
  const contentParent = tabParent.nextElementSibling;
  const tabName = tabElement.dataset.tab;

  // Update tab buttons
  tabParent
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  tabElement.classList.add("active");

  // Update tab content
  contentParent.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active");
  });
  contentParent.querySelector(`#tab-${tabName}`)?.classList.add("active");
}

// Filter requests
function filterRequests(event) {
  const searchTerm = event.target.value.toLowerCase();
  const items = document.querySelectorAll(".request-item");

  items.forEach((item) => {
    const url = item.querySelector(".request-url")?.textContent.toLowerCase();
    if (url && url.includes(searchTerm)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

// Update request count
function updateRequestCount() {
  const counter = document.getElementById("request-count");
  if (counter) {
    counter.textContent = `${state.requests.length} request${state.requests.length !== 1 ? "s" : ""} captured`;
  }
}

// Update status bar
function updateStatusBar(message) {
  const statusText = document.getElementById("status-text");
  if (statusText) {
    statusText.textContent = message;
  }
}
