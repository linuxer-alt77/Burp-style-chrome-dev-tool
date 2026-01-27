# Week 4 Progress Report

**Date:** January 27, 2026
**Team Members:** Member 1, Member 2, Member 3

---

## 🎯 What We Built This Week

This week we significantly enhanced the request inspection and replay capabilities of the extension. We implemented a Raw Request Editor that allows users to manually modify requests in plain text, added a powerful Replay/Send feature using the Fetch API to re-execute modified requests, and introduced a robust Filtering System with visual method badges to help users quickly locate specific network traffic.

---

## 📋 Features Completed

### 1. Raw Request Editor

**What it does:**  
The Raw Request Editor provides a text-based interface where users can view and edit HTTP requests exactly as they appear on the wire. It supports switching between "Request" and "Response" views and includes a split-pane layout toggle for flexible viewing.

**Files changed:**

- `devtools/panel.html` - Added editor UI containers and tabs
- `js/components/editor.js` - Created `Editor` class to manage views and raw text generation
- `js/panel.js` - Integrated `Editor` component

**Key code snippet:**

```javascript
// js/components/editor.js
requestToRaw(request) {
  let raw = `${request.method} ${request.url} HTTP/1.1\n`;

  // Headers
  if (request.requestHeaders) {
      request.requestHeaders.forEach(h => {
          raw += `${h.name}: ${h.value}\n`;
      });
  } // ...
  return raw;
}
```

**How to test it:**

1. Open the extension panel and capture some requests.
2. Click on a request in the list.
3. In the center pane, ensure the "Raw" tab is selected.
4. Verify you see the raw HTTP request text.
5. Click the Layout Toggle icon in the toolbar to switch orientation.

### 2. Request Replay Functionality

**What it does:**  
This feature allows users to take a captured request, modify it in the editor, and send it again. It handles parsing the raw text back into a valid request, executes it using the Fetch API, and displays the real-time response including status, time, and content.

**Files changed:**

- `js/components/replay.js` - Created `ReplayHandler` class
- `js/panel.js` - Integrated `ReplayHandler`
- `devtools/panel.html` - Updated Send button behavior

**Key code snippet:**

```javascript
// js/components/replay.js
async executeRequest(options) {
  const fetchOptions = {
    method: options.method,
    headers: options.headers,
    credentials: 'include', // Important for cookies
  };
  // ...
  const response = await fetch(options.url, fetchOptions);
  // ... returns structured response object
}
```

**How to test it:**

1. Select a request.
2. Edit the URL or body in the Raw Editor.
3. Click the "Send" button (Play icon).
4. Watch the button change to a loading state.
5. View the result in the Response pane on the right.

### 3. Filter System with Method Badges

**What it does:**  
We added a filtering toolbar that lets users search requests by URL or method. We also enhanced the request list with color-coded badges for HTTP methods (GET, POST, etc.) to make scanning the list easier.

**Files changed:**

- `js/components/filters.js` - Created `FilterSystem` class
- `css/panel.css` - Added styles for method badges and filter inputs
- `js/panel.js` - Integrated filter logic into render loop

**Key code snippet:**

```javascript
// js/components/filters.js
static matches(request, filters) {
    // ...
    if (query) {
        matchesQuery = request.url.includes(q) || ...
    }
    if (method) {
        matchesMethod = request.method === method;
    }
    return matchesQuery && matchesMethod;
}
```

**How to test it:**

1. Capture multiple requests with different methods (GET, POST).
2. Type in the search bar to filter by URL.
3. Use the dropdown to filter only "POST" requests.
4. Observe the color-coded badges in the request list.

---

## 🔧 Technical Challenges & Solutions

**Challenge 1: Parsing Raw HTTP Text**

- **Problem:** Converting a raw string from a textarea back into a structured object for `fetch()` is error-prone, especially with varying line endings and headers.
- **Solution:** We implemented a robust line-by-line parser in `ReplayHandler` that strictly separates the Request Line, Headers, and Body, and gracefully handles missing sections.

**Challenge 2: Layout Synchronization**

- **Problem:** Managing the state between the legacy tabular editors (Headers/Params tabs) and the new Raw Text editor was complex.
- **Solution:** For this week, we prioritized the Raw Editor as the source of truth for Replay. We ensured the `Editor` component properly initializes the view when a request is selected.
