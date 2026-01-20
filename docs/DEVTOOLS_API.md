# Chrome DevTools API Documentation

This document provides an overview of the Chrome DevTools API capabilities and how they will be used in the HTTP Request Repeater extension.

## Table of Contents

1. [Overview](#overview)
2. [Key APIs](#key-apis)
3. [Network Request Capture](#network-request-capture)
4. [Message Passing Architecture](#message-passing-architecture)
5. [Implementation Details](#implementation-details)
6. [Security Considerations](#security-considerations)

---

## Overview

Chrome DevTools extensions run in a separate context from regular Chrome extensions. They have access to special APIs that allow them to:

- Inspect network traffic
- Access the inspected page's resources
- Create custom panels in DevTools
- Communicate with background scripts

## Key APIs

### 1. chrome.devtools.panels

Creates custom panels in the Chrome DevTools interface.

**Key Methods:**

- `chrome.devtools.panels.create(title, iconPath, pagePath, callback)`
  - Creates a new panel in DevTools
  - Returns a Panel object with `onShown` and `onHidden` events
  - The panel loads the specified HTML page

**Example:**

```javascript
chrome.devtools.panels.create(
  "HTTP Repeater",
  "icons/icon32.png",
  "panel.html",
  (panel) => {
    panel.onShown.addListener((window) => {
      // Panel is now visible
    });
  },
);
```

### 2. chrome.devtools.network

Provides access to network request information in the inspected page.

**Key Methods:**

- `chrome.devtools.network.onRequestFinished.addListener(callback)`
  - Fires when a network request is completed
  - Provides HAR (HTTP Archive) format data
  - Includes request/response headers, body, timing, etc.

**HAR Request Object Structure:**

```javascript
{
  request: {
    method: "GET",
    url: "https://example.com/api/data",
    httpVersion: "HTTP/1.1",
    headers: [
      { name: "User-Agent", value: "..." },
      { name: "Accept", value: "..." }
    ],
    queryString: [
      { name: "param", value: "value" }
    ],
    postData: {
      mimeType: "application/json",
      text: "{...}"
    }
  },
  response: {
    status: 200,
    statusText: "OK",
    httpVersion: "HTTP/1.1",
    headers: [...],
    content: {
      mimeType: "application/json",
      size: 1234,
      text: "{...}"
    },
    redirectURL: ""
  },
  timings: {
    blocked: 0,
    dns: 0,
    connect: 0,
    send: 0,
    wait: 100,
    receive: 50,
    ssl: 0
  }
}
```

**Methods Available:**

- `getContent(callback)` - Retrieves the response body

  ```javascript
  request.getContent((content, encoding) => {
    console.log(content); // Response body
    console.log(encoding); // "base64" or empty string
  });
  ```

- `onNavigated.addListener(url)` - Fires when the inspected page navigates
- `getHAR(callback)` - Gets the entire HAR log

### 3. chrome.devtools.inspectedWindow

Provides access to the inspected window (the page being debugged).

**Key Methods:**

- `chrome.devtools.inspectedWindow.eval(expression, options, callback)`
  - Evaluates JavaScript in the context of the inspected page
  - Can access page variables and functions
- `chrome.devtools.inspectedWindow.reload(options)`
  - Reloads the inspected page
  - Can inject scripts, ignore cache, etc.

**Properties:**

- `tabId` - The ID of the tab being inspected

### 4. chrome.runtime

Handles message passing between different parts of the extension.

**Key Methods:**

- `chrome.runtime.sendMessage(message, callback)`
  - Sends a message to other parts of the extension
  - Works between DevTools, background scripts, and content scripts

- `chrome.runtime.onMessage.addListener(callback)`
  - Listens for messages from other extension components

- `chrome.runtime.connect()`
  - Creates a long-lived connection for continuous communication

### 5. chrome.storage

Stores data persistently across browser sessions.

**Key Methods:**

- `chrome.storage.local.set(items, callback)` - Store data locally
- `chrome.storage.local.get(keys, callback)` - Retrieve stored data
- `chrome.storage.sync.set(items, callback)` - Sync data across devices
- `chrome.storage.onChanged.addListener(callback)` - Listen for storage changes

**Quotas:**

- `storage.local`: 10 MB
- `storage.sync`: 100 KB (8 KB per item)

---

## Network Request Capture

### Capturing Requests

The extension captures HTTP requests using `chrome.devtools.network.onRequestFinished`:

```javascript
chrome.devtools.network.onRequestFinished.addListener((request) => {
  // Extract request details
  const requestData = {
    method: request.request.method,
    url: request.request.url,
    headers: request.request.headers,
    postData: request.request.postData,
  };

  // Get response body
  request.getContent((content, encoding) => {
    const responseData = {
      status: request.response.status,
      statusText: request.response.statusText,
      headers: request.response.headers,
      body: content,
      encoding: encoding,
    };

    // Send to background for storage
    chrome.runtime.sendMessage({
      type: "CAPTURE_REQUEST",
      request: requestData,
      response: responseData,
    });
  });
});
```

### Filtering Requests

Common filters to implement:

```javascript
function shouldCaptureRequest(request) {
  const url = new URL(request.request.url);

  // Filter by domain
  if (!url.hostname.includes("example.com")) {
    return false;
  }

  // Filter by method
  if (!["GET", "POST", "PUT", "DELETE"].includes(request.request.method)) {
    return false;
  }

  // Filter by content type
  const contentType = request.response.headers.find(
    (h) => h.name.toLowerCase() === "content-type",
  );
  if (contentType && !contentType.value.includes("json")) {
    return false;
  }

  return true;
}
```

### Handling Different Content Types

```javascript
function processResponseContent(content, mimeType, encoding) {
  // Handle base64 encoded content
  if (encoding === "base64") {
    content = atob(content);
  }

  // Parse based on content type
  if (mimeType.includes("application/json")) {
    return JSON.parse(content);
  } else if (mimeType.includes("text/html")) {
    return { type: "html", content };
  } else if (mimeType.includes("image/")) {
    return { type: "image", dataUrl: `data:${mimeType};base64,${content}` };
  }

  return content;
}
```

---

## Message Passing Architecture

### Communication Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  DevTools Panel │ ◄─────► │ Background       │ ◄─────► │ Content Script  │
│  (panel.html)   │         │ Service Worker   │         │ (inspected page)│
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
   User Interface           Network Operations
   - Display requests       - Send HTTP requests
   - Edit requests          - Store data
   - View responses         - Process responses
```

### Message Types

Define clear message types for communication:

```javascript
// Message type definitions
const MessageTypes = {
  // From Panel to Background
  START_CAPTURE: "START_CAPTURE",
  STOP_CAPTURE: "STOP_CAPTURE",
  SEND_REQUEST: "SEND_REQUEST",
  GET_REQUESTS: "GET_REQUESTS",
  CLEAR_REQUESTS: "CLEAR_REQUESTS",
  SAVE_REQUEST: "SAVE_REQUEST",
  DELETE_REQUEST: "DELETE_REQUEST",

  // From Background to Panel
  REQUEST_CAPTURED: "REQUEST_CAPTURED",
  REQUEST_SENT: "REQUEST_SENT",
  REQUEST_FAILED: "REQUEST_FAILED",
  CAPTURE_STATUS: "CAPTURE_STATUS",

  // Settings
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  GET_SETTINGS: "GET_SETTINGS",
};
```

### Sending Messages from Panel

```javascript
// From DevTools panel to background
async function sendCustomRequest(requestData) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SEND_REQUEST",
      request: requestData,
    });

    if (response.success) {
      console.log("Request sent:", response.data);
      return response.data;
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error("Failed to send request:", error);
    throw error;
  }
}
```

### Handling Messages in Background

```javascript
// In background service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "SEND_REQUEST":
      handleCustomRequest(message.request)
        .then((response) => sendResponse({ success: true, data: response }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message }),
        );
      return true; // Keep channel open for async response

    case "GET_REQUESTS":
      chrome.storage.local.get("capturedRequests", (result) => {
        sendResponse({ success: true, data: result.capturedRequests || [] });
      });
      return true;

    case "START_CAPTURE":
      isCapturing = true;
      sendResponse({ success: true, capturing: true });
      break;

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return false;
});
```

### Long-lived Connections

For continuous communication (e.g., streaming request data):

```javascript
// In panel
const port = chrome.runtime.connect({ name: "devtools-panel" });

port.onMessage.addListener((message) => {
  if (message.type === "REQUEST_CAPTURED") {
    addRequestToUI(message.request);
  }
});

port.postMessage({ type: "PANEL_READY" });

// In background
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "devtools-panel") {
    port.onMessage.addListener((message) => {
      if (message.type === "PANEL_READY") {
        // Panel is ready to receive requests
        devtoolsPort = port;
      }
    });
  }
});

// Send to panel when request is captured
if (devtoolsPort) {
  devtoolsPort.postMessage({
    type: "REQUEST_CAPTURED",
    request: capturedRequest,
  });
}
```

---

## Implementation Details

### 1. Sending Custom HTTP Requests

Since DevTools extensions can't directly make arbitrary HTTP requests (CORS restrictions), we use the background service worker:

```javascript
// In background.js
async function sendHTTPRequest(requestData) {
  const { method, url, headers, body } = requestData;

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: body,
      mode: "cors",
      credentials: "include",
      cache: "no-cache",
    });

    // Extract response data
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const contentType = response.headers.get("content-type") || "";
    let responseBody;

    if (contentType.includes("application/json")) {
      responseBody = await response.json();
    } else if (contentType.includes("text/")) {
      responseBody = await response.text();
    } else {
      responseBody = await response.blob();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      url: response.url,
      timestamp: Date.now(),
      duration: performance.now() - startTime,
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}
```

### 2. Handling CORS Issues

For requests that fail due to CORS, we need to inform the user:

```javascript
function handleCORSError(error, url) {
  return {
    success: false,
    error: "CORS",
    message: `CORS policy blocked the request to ${url}. This is a browser security feature.`,
    suggestions: [
      "Use a CORS proxy for testing",
      "Disable web security in Chrome (for development only)",
      "Configure CORS headers on the target server",
    ],
  };
}
```

### 3. Request/Response Storage

Store captured requests efficiently:

```javascript
// Storage structure
{
  capturedRequests: [
    {
      id: 'unique-id-123',
      timestamp: '2026-01-21T12:34:56.789Z',
      method: 'POST',
      url: 'https://api.example.com/data',
      headers: { /* ... */ },
      body: '{"key":"value"}',
      response: {
        status: 200,
        headers: { /* ... */ },
        body: '{"result":"success"}',
        duration: 145
      }
    }
  ],
  settings: {
    theme: 'dark',
    autoCapture: false,
    maxStoredRequests: 1000,
    filters: {
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      domains: ['*.example.com']
    }
  }
}
```

### 4. Performance Considerations

**Limiting Stored Requests:**

```javascript
const MAX_REQUESTS = 1000;

function addRequest(request) {
  capturedRequests.unshift(request);

  if (capturedRequests.length > MAX_REQUESTS) {
    capturedRequests = capturedRequests.slice(0, MAX_REQUESTS);
  }

  // Save to storage
  chrome.storage.local.set({ capturedRequests });
}
```

**Efficient Updates:**

```javascript
// Use virtual scrolling for large lists
// Only render visible request items
function renderVisibleRequests(scrollTop, containerHeight) {
  const itemHeight = 50;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

  const visibleRequests = capturedRequests.slice(startIndex, endIndex);
  // Render only visible items
}
```

---

## Security Considerations

### 1. Content Security Policy (CSP)

The extension must comply with Chrome's CSP:

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

This means:

- No inline scripts (use external .js files)
- No `eval()` or `new Function()`
- No inline event handlers (use addEventListener)

### 2. Sanitizing User Input

When displaying responses, especially HTML:

```javascript
// Use DOMPurify to sanitize HTML before display
function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "div", "span"],
    ALLOWED_ATTR: ["href", "class", "id"],
  });
}

// Display sanitized content
responseViewer.innerHTML = sanitizeHTML(response.body);
```

### 3. Handling Sensitive Data

```javascript
// Redact sensitive headers
const SENSITIVE_HEADERS = ["authorization", "cookie", "x-api-key"];

function redactSensitiveHeaders(headers) {
  return headers.map((header) => {
    if (SENSITIVE_HEADERS.includes(header.name.toLowerCase())) {
      return {
        ...header,
        value: "[REDACTED]",
      };
    }
    return header;
  });
}
```

### 4. Permissions

Request only necessary permissions:

```json
{
  "permissions": [
    "storage", // For storing requests
    "webRequest" // For observing requests (optional)
  ],
  "host_permissions": [
    "<all_urls>" // Required for sending custom requests
  ]
}
```

---

## References

- [Chrome DevTools Extension API](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [chrome.devtools.network](https://developer.chrome.com/docs/extensions/reference/devtools_network/)
- [chrome.devtools.panels](https://developer.chrome.com/docs/extensions/reference/devtools_panels/)
- [Message Passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [HAR Specification](http://www.softwareishard.com/blog/har-12-spec/)
- [Content Security Policy](https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/#content-security-policy)

---

## Next Steps

1. Implement network request capture in `devtools.js`
2. Create request storage system in `background.js`
3. Build UI for displaying captured requests
4. Implement request editing functionality
5. Add custom request sending capability
6. Create response viewer with syntax highlighting
7. Add filters and search functionality
8. Implement export/import features (HAR format)
