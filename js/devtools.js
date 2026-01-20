// DevTools page initialization script
// This script runs when DevTools is opened and creates the custom panel

console.log('[DevTools] Initializing rep+ panel...');

// Store the panel reference globally
let repPanel = null;
let panelWindow = null;
let isCapturing = false;

// Create the DevTools panel
chrome.devtools.panels.create(
  'rep+', // Panel title
  'icons/icon32.png', // Icon path
  'panel.html', // HTML page for the panel
  (panel) => {
    repPanel = panel;
    console.log('[DevTools] rep+ panel created successfully');

    // Panel lifecycle event handlers
    panel.onShown.addListener((extPanelWindow) => {
      panelWindow = extPanelWindow;
      console.log('[DevTools] Panel shown');

      // Notify panel window that it's visible
      if (panelWindow) {
        panelWindow.postMessage(
          {
            type: 'DEVTOOLS_PANEL_SHOWN',
            tabId: chrome.devtools.inspectedWindow.tabId,
          },
          '*'
        );
      }
    });

    panel.onHidden.addListener(() => {
      console.log('[DevTools] Panel hidden');
      panelWindow = null;
    });
  }
);

// Network request capture implementation
chrome.devtools.network.onRequestFinished.addListener((harEntry) => {
  // Only capture if actively capturing
  if (!isCapturing) return;

  try {
    console.log('[DevTools] Request finished:', harEntry.request.url);

    // Parse HAR entry and extract request details
    const requestData = parseHARRequest(harEntry);

    // Get response body content (async operation)
    harEntry.getContent((content, encoding) => {
      requestData.response.body = content;
      requestData.response.bodyEncoding = encoding;

      // Send captured request to background worker
      chrome.runtime.sendMessage(
        {
          type: 'CAPTURE_REQUEST',
          data: requestData,
          tabId: chrome.devtools.inspectedWindow.tabId,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[DevTools] Error sending captured request:', chrome.runtime.lastError);
          } else {
            console.log('[DevTools] Request captured successfully:', requestData.id);
          }
        }
      );
    });
  } catch (error) {
    console.error('[DevTools] Error processing network request:', error);
  }
});

/**
 * Parse HAR (HTTP Archive) format data
 * Extracts request and response details from HAR entry
 */
function parseHARRequest(harEntry) {
  const request = harEntry.request;
  const response = harEntry.response;
  const timings = harEntry.timings;

  // Generate unique ID for this request
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Parse URL
  const url = new URL(request.url);

  // Extract request details
  const requestData = {
    id: requestId,
    timestamp: new Date(harEntry.startedDateTime).getTime(),

    // Request information
    request: {
      method: request.method,
      url: request.url,
      httpVersion: request.httpVersion,

      // Headers as object for easier manipulation
      headers: parseHeaders(request.headers),
      headersArray: request.headers, // Keep original array format

      // Query string parameters
      queryString: parseQueryString(request.queryString),

      // POST data
      postData: request.postData
        ? {
            mimeType: request.postData.mimeType,
            text: request.postData.text || '',
            params: request.postData.params || [],
          }
        : null,

      // Cookies
      cookies: request.cookies,

      // Body size
      bodySize: request.bodySize,
      headersSize: request.headersSize,
    },

    // Response information
    response: {
      status: response.status,
      statusText: response.statusText,
      httpVersion: response.httpVersion,

      // Headers
      headers: parseHeaders(response.headers),
      headersArray: response.headers,

      // Cookies
      cookies: response.cookies,

      // Content info
      content: {
        mimeType: response.content.mimeType,
        size: response.content.size,
        compression: response.content.compression,
      },

      // Redirect URL if any
      redirectURL: response.redirectURL,

      // Body will be set after getContent() call
      body: null,
      bodyEncoding: null,

      // Size info
      bodySize: response.bodySize,
      headersSize: response.headersSize,
    },

    // Timing information
    timings: {
      blocked: timings.blocked,
      dns: timings.dns,
      connect: timings.connect,
      send: timings.send,
      wait: timings.wait,
      receive: timings.receive,
      ssl: timings.ssl,

      // Total time
      total: Object.values(timings).reduce((sum, time) => {
        return sum + (time > 0 ? time : 0);
      }, 0),
    },

    // Parsed URL components
    urlParts: {
      protocol: url.protocol.replace(':', ''),
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    },

    // Server IP and connection info
    serverIPAddress: harEntry.serverIPAddress,
    connection: harEntry.connection,

    // Cache info
    cache: harEntry.cache,
  };

  return requestData;
}

/**
 * Convert headers array to object format
 */
function parseHeaders(headersArray) {
  const headers = {};
  if (headersArray && Array.isArray(headersArray)) {
    headersArray.forEach((header) => {
      // Handle duplicate headers by creating array
      if (headers[header.name]) {
        if (Array.isArray(headers[header.name])) {
          headers[header.name].push(header.value);
        } else {
          headers[header.name] = [headers[header.name], header.value];
        }
      } else {
        headers[header.name] = header.value;
      }
    });
  }
  return headers;
}

/**
 * Parse query string parameters
 */
function parseQueryString(queryStringArray) {
  const params = {};
  if (queryStringArray && Array.isArray(queryStringArray)) {
    queryStringArray.forEach((param) => {
      params[param.name] = param.value;
    });
  }
  return params;
}

/**
 * Start capturing network requests
 */
function startCapture() {
  isCapturing = true;
  console.log('[DevTools] Network capture started');

  // Notify panel
  if (panelWindow) {
    panelWindow.postMessage({ type: 'CAPTURE_STARTED' }, '*');
  }
}

/**
 * Stop capturing network requests
 */
function stopCapture() {
  isCapturing = false;
  console.log('[DevTools] Network capture stopped');

  // Notify panel
  if (panelWindow) {
    panelWindow.postMessage({ type: 'CAPTURE_STOPPED' }, '*');
  }
}

// Listen for messages from the panel
window.addEventListener('message', (event) => {
  if (event.data.type === 'START_CAPTURE') {
    startCapture();
  } else if (event.data.type === 'STOP_CAPTURE') {
    stopCapture();
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACKGROUND_TO_DEVTOOLS') {
    // Forward message to panel window
    if (panelWindow) {
      panelWindow.postMessage(message.data, '*');
    }
    sendResponse({ success: true });
  }
  return true;
});

console.log('[DevTools] Initialization complete');
