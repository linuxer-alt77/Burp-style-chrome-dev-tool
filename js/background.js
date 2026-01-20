// Background service worker
// Handles communication between DevTools panel and network operations

console.log('[Background] HTTP Request Repeater service worker loaded');

// ============================================
// STATE MANAGEMENT
// ============================================

// Store captured requests organized by domain
const capturedRequests = new Map(); // Map<domain, Array<request>>
let allRequests = []; // Flat array for quick access
let isCapturing = false;
let maxStoredRequests = 1000;

// Connected DevTools panels (support multiple tabs)
const connectedPanels = new Map(); // Map<tabId, port>

// ============================================
// MESSAGE ROUTING
// ============================================

/**
 * Main message listener - routes messages to appropriate handlers
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Received message:', message.type, message);

  try {
    switch (message.type) {
      case 'START_CAPTURE':
        handleStartCapture(message, sendResponse);
        break;

      case 'STOP_CAPTURE':
        handleStopCapture(message, sendResponse);
        break;

      case 'GET_REQUESTS':
        handleGetRequests(message, sendResponse);
        break;

      case 'GET_REQUESTS_BY_DOMAIN':
        handleGetRequestsByDomain(message, sendResponse);
        break;

      case 'CLEAR_REQUESTS':
        handleClearRequests(message, sendResponse);
        break;

      case 'CAPTURE_REQUEST':
        handleCaptureRequest(message, sendResponse);
        return true; // Async response

      case 'SEND_REQUEST':
        handleSendRequest(message, sendResponse);
        return true; // Async response

      case 'DELETE_REQUEST':
        handleDeleteRequest(message, sendResponse);
        break;

      case 'SAVE_REQUEST':
        handleSaveRequest(message, sendResponse);
        return true; // Async response

      case 'GET_SETTINGS':
        handleGetSettings(message, sendResponse);
        return true; // Async response

      case 'UPDATE_SETTINGS':
        handleUpdateSettings(message, sendResponse);
        return true; // Async response

      default:
        console.warn('[Background] Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[Background] Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }

  return false;
});

// ============================================
// CONNECTION HANDLING
// ============================================

/**
 * Handle long-lived connections from DevTools panels
 */
chrome.runtime.onConnect.addListener((port) => {
  console.log('[Background] Panel connected:', port.name);

  if (port.name.startsWith('devtools-panel-')) {
    const tabId = parseInt(port.name.split('-')[2]);
    connectedPanels.set(tabId, port);

    // Handle disconnection
    port.onDisconnect.addListener(() => {
      console.log('[Background] Panel disconnected:', tabId);
      connectedPanels.delete(tabId);
    });

    // Handle messages from panel
    port.onMessage.addListener((message) => {
      console.log('[Background] Message from panel:', message);
      // Handle panel-specific messages here
    });
  }
});

// ============================================
// MESSAGE HANDLERS
// ============================================

/**
 * Start capturing network requests
 */
function handleStartCapture(message, sendResponse) {
  isCapturing = true;
  console.log('[Background] Capture started');
  sendResponse({ success: true, capturing: true });
}

/**
 * Stop capturing network requests
 */
function handleStopCapture(message, sendResponse) {
  isCapturing = false;
  console.log('[Background] Capture stopped');
  sendResponse({ success: true, capturing: false });
}

/**
 * Get all captured requests
 */
function handleGetRequests(message, sendResponse) {
  sendResponse({
    success: true,
    requests: allRequests,
    count: allRequests.length,
  });
}

/**
 * Get requests organized by domain
 */
function handleGetRequestsByDomain(message, sendResponse) {
  const requestsByDomain = {};

  capturedRequests.forEach((requests, domain) => {
    requestsByDomain[domain] = requests;
  });

  sendResponse({
    success: true,
    requestsByDomain,
    domains: Array.from(capturedRequests.keys()),
  });
}

/**
 * Clear all captured requests
 */
function handleClearRequests(message, sendResponse) {
  capturedRequests.clear();
  allRequests = [];
  console.log('[Background] All requests cleared');
  sendResponse({ success: true });
}

/**
 * Handle captured request from DevTools
 */
async function handleCaptureRequest(message, sendResponse) {
  try {
    const requestData = message.data;

    // Extract domain from URL
    const domain = requestData.urlParts.hostname;

    // Store request organized by domain
    if (!capturedRequests.has(domain)) {
      capturedRequests.set(domain, []);
    }

    const domainRequests = capturedRequests.get(domain);
    domainRequests.unshift(requestData); // Add to beginning

    // Also add to flat array
    allRequests.unshift(requestData);

    // Enforce max requests limit
    if (allRequests.length > maxStoredRequests) {
      const removed = allRequests.pop();

      // Remove from domain map as well
      const removedDomain = removed.urlParts.hostname;
      const domainReqs = capturedRequests.get(removedDomain);
      if (domainReqs) {
        const index = domainReqs.findIndex((r) => r.id === removed.id);
        if (index !== -1) {
          domainReqs.splice(index, 1);
        }

        // Remove domain if empty
        if (domainReqs.length === 0) {
          capturedRequests.delete(removedDomain);
        }
      }
    }

    console.log(
      `[Background] Request captured: ${requestData.request.method} ${requestData.urlParts.pathname}`
    );
    console.log(
      `[Background] Total requests: ${allRequests.length}, Domains: ${capturedRequests.size}`
    );

    // Notify connected panels about new request
    notifyPanels({
      type: 'REQUEST_CAPTURED',
      request: requestData,
      domain: domain,
    });

    // Save to storage (debounced)
    await saveRequestsToStorage();

    sendResponse({ success: true, requestId: requestData.id });
  } catch (error) {
    console.error('[Background] Error capturing request:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Send custom HTTP request
 */
async function handleSendRequest(message, sendResponse) {
  console.log('[Background] Sending custom request:', message.request);

  const startTime = performance.now();

  try {
    const requestData = message.request;

    // Prepare fetch options
    const fetchOptions = {
      method: requestData.method || 'GET',
      headers: requestData.headers || {},
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache',
    };

    // Add body if present and method supports it
    if (requestData.body && !['GET', 'HEAD'].includes(requestData.method)) {
      fetchOptions.body = requestData.body;
    }

    // Execute request
    const response = await fetch(requestData.url, fetchOptions);
    const duration = performance.now() - startTime;

    // Extract response headers
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Get response body
    const contentType = response.headers.get('content-type') || '';
    let responseBody;

    try {
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
        responseBody = JSON.stringify(responseBody, null, 2);
      } else if (contentType.includes('text/') || contentType.includes('application/xml')) {
        responseBody = await response.text();
      } else {
        // Binary data
        const blob = await response.blob();
        responseBody = `[Binary data: ${blob.size} bytes, type: ${blob.type}]`;
      }
    } catch (error) {
      responseBody = await response.text();
    }

    const responseData = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      url: response.url,
      timestamp: Date.now(),
      duration: Math.round(duration),
      size: responseBody.length,
      type: contentType,
    };

    console.log(`[Background] Request completed: ${response.status} in ${duration.toFixed(0)}ms`);

    sendResponse({ success: true, response: responseData });
  } catch (error) {
    console.error('[Background] Request failed:', error);

    sendResponse({
      success: false,
      error: error.message,
      errorType: error.name,
    });
  }
}

/**
 * Delete a specific request
 */
function handleDeleteRequest(message, sendResponse) {
  const requestId = message.requestId;

  // Find and remove from allRequests
  const index = allRequests.findIndex((r) => r.id === requestId);
  if (index !== -1) {
    const request = allRequests[index];
    allRequests.splice(index, 1);

    // Remove from domain map
    const domain = request.urlParts.hostname;
    const domainRequests = capturedRequests.get(domain);
    if (domainRequests) {
      const domainIndex = domainRequests.findIndex((r) => r.id === requestId);
      if (domainIndex !== -1) {
        domainRequests.splice(domainIndex, 1);
      }

      // Remove domain if empty
      if (domainRequests.length === 0) {
        capturedRequests.delete(domain);
      }
    }

    console.log(`[Background] Request deleted: ${requestId}`);
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: 'Request not found' });
  }
}

/**
 * Save request to persistent storage
 */
async function handleSaveRequest(message, sendResponse) {
  try {
    const result = await chrome.storage.local.get('savedRequests');
    const savedRequests = result.savedRequests || [];

    savedRequests.push({
      ...message.request,
      savedAt: Date.now(),
    });

    await chrome.storage.local.set({ savedRequests });

    console.log('[Background] Request saved to storage');
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Background] Error saving request:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Get extension settings
 */
async function handleGetSettings(message, sendResponse) {
  try {
    const result = await chrome.storage.local.get([
      'theme',
      'autoCapture',
      'maxRequests',
      'filters',
    ]);

    sendResponse({
      success: true,
      settings: {
        theme: result.theme || 'dark',
        autoCapture: result.autoCapture || false,
        maxRequests: result.maxRequests || 1000,
        filters: result.filters || {},
      },
    });
  } catch (error) {
    console.error('[Background] Error getting settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Update extension settings
 */
async function handleUpdateSettings(message, sendResponse) {
  try {
    await chrome.storage.local.set(message.settings);

    // Update runtime settings
    if (message.settings.maxRequests) {
      maxStoredRequests = message.settings.maxRequests;
    }

    console.log('[Background] Settings updated:', message.settings);
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Background] Error updating settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Notify all connected panels about an event
 */
function notifyPanels(message) {
  connectedPanels.forEach((port, tabId) => {
    try {
      port.postMessage(message);
    } catch (error) {
      console.error(`[Background] Error notifying panel ${tabId}:`, error);
      connectedPanels.delete(tabId);
    }
  });
}

/**
 * Save requests to storage (debounced)
 */
let saveTimeout = null;
async function saveRequestsToStorage() {
  // Debounce saves to avoid excessive storage writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    try {
      // Only save most recent requests to avoid storage quota
      const requestsToSave = allRequests.slice(0, 100);

      await chrome.storage.local.set({
        recentRequests: requestsToSave,
        requestCount: allRequests.length,
      });

      console.log('[Background] Requests saved to storage');
    } catch (error) {
      console.error('[Background] Error saving to storage:', error);
    }
  }, 2000);
}

/**
 * Load requests from storage on startup
 */
async function loadRequestsFromStorage() {
  try {
    const result = await chrome.storage.local.get(['recentRequests', 'requestCount']);

    if (result.recentRequests && result.recentRequests.length > 0) {
      allRequests = result.recentRequests;

      // Rebuild domain map
      allRequests.forEach((request) => {
        const domain = request.urlParts.hostname;
        if (!capturedRequests.has(domain)) {
          capturedRequests.set(domain, []);
        }
        capturedRequests.get(domain).push(request);
      });

      console.log(`[Background] Loaded ${allRequests.length} requests from storage`);
    }
  } catch (error) {
    console.error('[Background] Error loading from storage:', error);
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Extension installation handler
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // First time installation - set defaults
    chrome.storage.local.set({
      theme: 'dark',
      autoCapture: false,
      maxRequests: 1000,
      filters: {
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        domains: [],
        statusCodes: [],
      },
    });
  } else if (details.reason === 'update') {
    console.log('[Background] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Load saved requests on startup
loadRequestsFromStorage();

console.log('[Background] Initialization complete');
