# Architecture Documentation

## System Architecture Overview

This document describes the architecture of the HTTP Request Repeater Chrome DevTools extension.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    DevTools Window                          │    │
│  │                                                              │    │
│  │  ┌────────────────────────────────────────────────────┐   │    │
│  │  │         HTTP Repeater Panel (panel.html)           │   │    │
│  │  │                                                      │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │    │
│  │  │  │ Request List │  │   Request    │  │ Response │ │   │    │
│  │  │  │   Component  │  │   Editor     │  │  Viewer  │ │   │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────┘ │   │    │
│  │  │           │                │                │       │   │    │
│  │  │           └────────────────┴────────────────┘       │   │    │
│  │  │                         │                           │   │    │
│  │  │                    panel.js                         │   │    │
│  │  └────────────────────────┬───────────────────────────┘   │    │
│  │                            │                                │    │
│  │                     chrome.runtime                         │    │
│  │                         messages                            │    │
│  │                            │                                │    │
│  └────────────────────────────┼────────────────────────────────┘    │
│                                │                                     │
│                                ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Background Service Worker (background.js)           │  │
│  │                                                                │  │
│  │  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐ │  │
│  │  │    Message     │  │    Network      │  │   Storage    │ │  │
│  │  │    Handler     │  │    Manager      │  │   Manager    │ │  │
│  │  └────────────────┘  └─────────────────┘  └──────────────┘ │  │
│  │           │                  │                    │          │  │
│  └───────────┼──────────────────┼────────────────────┼──────────┘  │
│              │                  │                    │              │
│              │                  ▼                    ▼              │
│              │         ┌──────────────┐    ┌──────────────────┐   │
│              │         │ Fetch API    │    │ chrome.storage   │   │
│              │         │ HTTP Requests│    │ Local/Sync       │   │
│              │         └──────────────┘    └──────────────────┘   │
│              │                                                      │
│              ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              DevTools API (devtools.js)                       │ │
│  │                                                                │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │       chrome.devtools.network.onRequestFinished        │ │ │
│  │  │             (Network Request Capture)                   │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  │                            │                                  │ │
│  └────────────────────────────┼──────────────────────────────────┘ │
│                                │                                    │
│                                ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Inspected Page                           │   │
│  │                 (Target Website/App)                        │   │
│  │                                                              │   │
│  │                  HTTP/HTTPS Network Traffic                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. DevTools Panel (panel.html + panel.js)

**Responsibilities:**

- Display user interface
- Handle user interactions
- Render request list
- Provide request editing interface
- Display responses
- Manage UI state

**Key Components:**

```
┌─────────────────────────────────────────────────────────┐
│                   Panel Controller                       │
│                     (panel.js)                           │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              State Manager                       │   │
│  │  - capturing: boolean                            │   │
│  │  - requests: Array<Request>                      │   │
│  │  - selectedRequest: Request | null               │   │
│  │  - currentResponse: Response | null              │   │
│  │  - theme: 'dark' | 'light'                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │           UI Components                          │   │
│  │                                                   │   │
│  │  ┌─────────────────┐  ┌────────────────────┐   │   │
│  │  │  Request List   │  │  Request Editor    │   │   │
│  │  │  - Filter       │  │  - Raw view        │   │   │
│  │  │  - Sort         │  │  - Headers view    │   │   │
│  │  │  - Select       │  │  - Params view     │   │   │
│  │  └─────────────────┘  │  - Body view       │   │   │
│  │                        └────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │        Response Viewer                   │   │   │
│  │  │  - Raw view                              │   │   │
│  │  │  - Headers view                          │   │   │
│  │  │  - Preview (formatted JSON/HTML/XML)     │   │   │
│  │  │  - Status indicators                     │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Message Dispatcher                      │   │
│  │  - sendToBackground()                            │   │
│  │  - receiveFromBackground()                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2. Background Service Worker (background.js)

**Responsibilities:**

- Handle HTTP request sending
- Store captured requests
- Manage extension state
- Route messages between components
- Handle CORS and network issues

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│            Background Service Worker                     │
│                 (background.js)                          │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Message Handler                         │   │
│  │  - START_CAPTURE                                 │   │
│  │  - STOP_CAPTURE                                  │   │
│  │  - SEND_REQUEST                                  │   │
│  │  - GET_REQUESTS                                  │   │
│  │  - CLEAR_REQUESTS                                │   │
│  │  - SAVE_REQUEST                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Network Manager                         │   │
│  │                                                   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │      Request Sender                      │   │   │
│  │  │  - fetch() API wrapper                   │   │   │
│  │  │  - Request formatting                    │   │   │
│  │  │  - Response parsing                      │   │   │
│  │  │  - Error handling                        │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │      Request Processor                   │   │   │
│  │  │  - Parse raw HTTP                        │   │   │
│  │  │  - Format headers                        │   │   │
│  │  │  - Encode/decode body                    │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Storage Manager                         │   │
│  │                                                   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │   Request Storage                        │   │   │
│  │  │   - capturedRequests: Array              │   │   │
│  │  │   - Max 1000 items (configurable)        │   │   │
│  │  │   - FIFO eviction                        │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │   Settings Storage                       │   │   │
│  │  │   - theme                                │   │   │
│  │  │   - autoCapture                          │   │   │
│  │  │   - filters                              │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 3. DevTools Page (devtools.js)

**Responsibilities:**

- Create the DevTools panel
- Capture network requests
- Forward captured requests to background
- Manage DevTools lifecycle events

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│              DevTools Controller                         │
│                  (devtools.js)                           │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Panel Creator                            │   │
│  │  - chrome.devtools.panels.create()               │   │
│  │  - Panel lifecycle management                    │   │
│  │  - onShown / onHidden events                     │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                               │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │       Network Capture Module                     │   │
│  │                                                   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  onRequestFinished Listener              │   │   │
│  │  │  - Captures all network requests         │   │   │
│  │  │  - Extracts HAR data                     │   │   │
│  │  │  - Filters requests                      │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  Request Parser                          │   │   │
│  │  │  - Parse HAR format                      │   │   │
│  │  │  - Extract request data                  │   │   │
│  │  │  - Get response content                  │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                   │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │  Request Forwarder                       │   │   │
│  │  │  - Send to panel via messages            │   │   │
│  │  │  - Send to background for storage        │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Network Request Capture Flow

```
┌───────────────┐
│ Inspected Page│
│  makes HTTP   │
│   request     │
└───────┬───────┘
        │
        ▼
┌────────────────────────────────────┐
│  Chrome Network Stack              │
│  (browser's internal network)      │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│ chrome.devtools.network            │
│   .onRequestFinished               │
│   (devtools.js)                    │
└────────────────┬───────────────────┘
                 │
                 ├─ Extract: method, URL, headers
                 ├─ Call: request.getContent()
                 └─ Parse: HAR data
                 │
                 ▼
┌────────────────────────────────────┐
│  Check if capturing is enabled     │
│  (state.capturing === true)        │
└────────────────┬───────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Apply Filters│
         │  - Domain     │
         │  - Method     │
         │  - Status     │
         └───────┬───────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  Send to Background via            │
│  chrome.runtime.sendMessage()      │
│  Type: CAPTURE_REQUEST             │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  Background Service Worker         │
│  - Store in capturedRequests[]     │
│  - Save to chrome.storage          │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  Notify Panel (if connected)       │
│  - Update request list             │
│  - Increment counter               │
└────────────────────────────────────┘
```

### Custom Request Send Flow

```
┌────────────────────────────────────┐
│  User edits request in Panel       │
│  - Modifies URL                    │
│  - Changes headers                 │
│  - Updates body                    │
│  - Clicks "Send"                   │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  panel.js: sendRequest()           │
│  - Parse raw request text          │
│  - Format into request object      │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  chrome.runtime.sendMessage()      │
│  Type: SEND_REQUEST                │
│  Data: { method, url, headers,     │
│          body }                     │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  background.js: handleCustomRequest│
│  - Validate request data           │
│  - Apply default headers           │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  Execute fetch() API               │
│  - Set method, headers, body       │
│  - Configure CORS mode             │
│  - Include credentials             │
└────────────────┬───────────────────┘
                 │
          ┌──────┴──────┐
          │             │
          ▼             ▼
     ┌─────────┐   ┌─────────────┐
     │ Success │   │   Error     │
     └────┬────┘   └──────┬──────┘
          │               │
          │               ├─ CORS Error
          │               ├─ Network Error
          │               └─ Timeout
          │               │
          ▼               ▼
┌──────────────────────────────────────┐
│  Parse Response                       │
│  - Extract status, headers            │
│  - Read body (text/json/blob)         │
│  - Calculate response time            │
│  - Get response size                  │
└────────────────┬──────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Send response back to Panel         │
│  chrome.runtime.sendMessage callback  │
│  Success: true/false                  │
│  Data: response object                │
└────────────────┬──────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Panel: Display Response              │
│  - Update status badge                │
│  - Show headers                       │
│  - Display body (formatted)           │
│  - Show timing info                   │
└──────────────────────────────────────┘
```

---

## Message Protocol

### Message Types and Schemas

```typescript
// Type definitions for messages

// Panel → Background
interface StartCaptureMessage {
  type: "START_CAPTURE";
}

interface StopCaptureMessage {
  type: "STOP_CAPTURE";
}

interface SendRequestMessage {
  type: "SEND_REQUEST";
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
  };
}

interface GetRequestsMessage {
  type: "GET_REQUESTS";
  filter?: {
    method?: string;
    domain?: string;
    status?: number;
  };
}

interface ClearRequestsMessage {
  type: "CLEAR_REQUESTS";
}

// Background → Panel
interface CaptureStatusResponse {
  success: boolean;
  capturing: boolean;
}

interface RequestsResponse {
  success: boolean;
  requests: CapturedRequest[];
}

interface SendRequestResponse {
  success: boolean;
  response?: HttpResponse;
  error?: string;
}

// DevTools → Background
interface CaptureRequestMessage {
  type: "CAPTURE_REQUEST";
  request: {
    id: string;
    timestamp: string;
    method: string;
    url: string;
    headers: Array<{ name: string; value: string }>;
    postData?: {
      mimeType: string;
      text: string;
    };
  };
  response: {
    status: number;
    statusText: string;
    headers: Array<{ name: string; value: string }>;
    content: {
      mimeType: string;
      text: string;
      size: number;
      encoding?: string;
    };
  };
}
```

---

## Storage Schema

### Chrome Storage Local

```json
{
  "capturedRequests": [
    {
      "id": "req_1737475200000",
      "timestamp": "2026-01-21T12:00:00.000Z",
      "method": "POST",
      "url": "https://api.example.com/users",
      "requestHeaders": {
        "Content-Type": "application/json",
        "Authorization": "[REDACTED]"
      },
      "requestBody": "{\"name\":\"John\",\"email\":\"john@example.com\"}",
      "responseStatus": 201,
      "responseStatusText": "Created",
      "responseHeaders": {
        "Content-Type": "application/json"
      },
      "responseBody": "{\"id\":123,\"name\":\"John\"}",
      "responseDuration": 145,
      "responseSize": 1234
    }
  ],
  "settings": {
    "theme": "dark",
    "autoCapture": false,
    "maxRequests": 1000,
    "filters": {
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
      "domains": [],
      "statusCodes": []
    },
    "redactSensitiveData": true,
    "sensitiveHeaders": ["authorization", "cookie", "x-api-key"]
  },
  "savedRequests": [
    {
      "id": "saved_1737475200000",
      "name": "Create User - Production",
      "folder": "User Management",
      "request": {
        "method": "POST",
        "url": "https://api.example.com/users",
        "headers": {},
        "body": ""
      }
    }
  ]
}
```

---

## Extension Lifecycle

### Installation Flow

```
Extension Installed
    │
    ▼
chrome.runtime.onInstalled fires
    │
    ├─ Initialize default settings
    │  - theme: "dark"
    │  - autoCapture: false
    │  - maxRequests: 1000
    │
    ├─ Create storage structure
    │  - capturedRequests: []
    │  - savedRequests: []
    │
    └─ Background worker ready
```

### DevTools Panel Lifecycle

```
User opens DevTools (F12)
    │
    ▼
devtools.html loads
    │
    ▼
devtools.js executes
    │
    ├─ Create panel: chrome.devtools.panels.create()
    │
    ├─ Setup network listener: onRequestFinished
    │
    └─ Panel created
        │
        ▼
    User clicks "HTTP Repeater" tab
        │
        ▼
    panel.onShown fires
        │
        ▼
    panel.html loads
        │
        ▼
    panel.js initializes
        │
        ├─ Load settings from storage
        ├─ Setup event listeners
        ├─ Connect to background
        └─ Render initial UI
```

### Capture Lifecycle

```
User clicks "Capture" button
    │
    ▼
panel.js: toggleCapture()
    │
    ├─ Update UI (button state)
    │
    ▼
Send message to background
Type: START_CAPTURE
    │
    ▼
background.js: Set isCapturing = true
    │
    ▼
Response to panel: {capturing: true}
    │
    ▼
devtools.js: Network requests start being captured
    │
    ├─ For each request:
    │   ├─ Parse HAR data
    │   ├─ Send to background
    │   └─ Background stores & notifies panel
    │
    └─ Panel updates request list in real-time
```

---

## Security Architecture

### Data Flow Security

```
┌─────────────────────────────────────────┐
│          Inspected Page                  │
│      (Untrusted Context)                 │
│                                           │
│  ⚠️  Cannot directly access extension    │
└─────────────────┬───────────────────────┘
                  │
         Network Requests
                  │
                  ▼
┌─────────────────────────────────────────┐
│    DevTools Network API                  │
│   (Isolated from page context)           │
│                                           │
│  ✓ Read-only access to network data     │
│  ✓ Cannot modify actual requests         │
└─────────────────┬───────────────────────┘
                  │
            HAR Data (sanitized)
                  │
                  ▼
┌─────────────────────────────────────────┐
│      DevTools Extension Context          │
│         (devtools.js)                    │
│                                           │
│  ✓ Isolated from page                   │
│  ✓ CSP enforced                          │
│  ✓ No eval() allowed                     │
└─────────────────┬───────────────────────┘
                  │
          chrome.runtime messages
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Background Service Worker             │
│         (background.js)                  │
│                                           │
│  ✓ Can make HTTP requests               │
│  ✓ Access to storage                     │
│  ✓ Validate all inputs                   │
│  ✓ Sanitize sensitive data               │
└─────────────────┬───────────────────────┘
                  │
          chrome.storage (encrypted)
                  │
                  ▼
┌─────────────────────────────────────────┐
│        Chrome Storage                    │
│                                           │
│  ✓ Encrypted at rest                    │
│  ✓ Sandboxed per extension               │
│  ✓ Quota limits enforced                 │
└─────────────────────────────────────────┘
```

### Security Boundaries

1. **Content Security Policy (CSP)**
   - No inline scripts
   - No eval() or Function()
   - Only load resources from extension

2. **Message Validation**
   - All messages are type-checked
   - Unknown message types are rejected
   - Input sanitization on all user data

3. **Sensitive Data Handling**
   - Authorization headers redacted by default
   - Cookies masked in display
   - API keys hidden
   - Option to disable redaction for debugging

4. **CORS Handling**
   - Requests sent from background worker
   - Inherits browser's CORS policy
   - Clear error messages for CORS failures

---

## Performance Considerations

### Request Storage Optimization

```
┌───────────────────────────────────────┐
│   Incoming Network Request             │
└─────────────────┬─────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Apply Filters │ ← User-defined filters
         └────────┬───────┘
                  │
         ┌────────▼───────────────┐
         │ Size Check              │
         │ < Max requests (1000)?  │
         └────────┬───────────────┘
                  │
         ┌────────▼───────────────┐
         │ Store in Memory         │
         │ capturedRequests[]      │
         └────────┬───────────────┘
                  │
         ┌────────▼───────────────┐
         │ Debounced Storage Write │
         │ Save every 5 seconds    │
         │ or 50 new requests      │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │ chrome.storage.local   │
         └────────────────────────┘
```

### UI Rendering Optimization

- **Virtual Scrolling**: Only render visible request items
- **Debounced Search**: Delay filter application by 300ms
- **Lazy Loading**: Load response bodies on demand
- **Request Limiting**: Cap at 1000 stored requests (configurable)

---

## Future Enhancements

1. **Request Collections**
   - Save commonly used requests
   - Organize into folders
   - Export/import collections

2. **HAR Export/Import**
   - Export captured requests as HAR file
   - Import HAR files for analysis

3. **Request Diffing**
   - Compare two requests side-by-side
   - Highlight differences

4. **Response Assertions**
   - Test response status, headers, body
   - JSON path assertions
   - Regex matching

5. **Scripting**
   - Pre-request scripts (set variables)
   - Post-response scripts (extract data)
   - Environment variables

6. **Advanced Filtering**
   - Regex URL patterns
   - Response size filters
   - Duration filters
   - Custom JavaScript filters

---

## References

- Chrome Extension Architecture: https://developer.chrome.com/docs/extensions/mv3/architecture-overview/
- DevTools Extension Architecture: https://developer.chrome.com/docs/extensions/mv3/devtools/
- Service Worker Lifecycle: https://developer.chrome.com/docs/extensions/mv3/service_workers/
