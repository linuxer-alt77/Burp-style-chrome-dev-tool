# Getting Started with rep+ HTTP Request Repeater

This guide will help you load and test the Chrome extension.

## Prerequisites

- Google Chrome version 88 or higher
- Basic understanding of Chrome DevTools
- A website to test with (we'll use httpbin.org)

## Step 1: Load the Extension

1. **Open Chrome Extensions Page:**
   - Navigate to `chrome://extensions/` in Chrome
   - Or click the puzzle icon in toolbar → "Manage Extensions"

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load Unpacked Extension:**
   - Click the "Load unpacked" button
   - Navigate to this project folder
   - Select the folder containing `manifest.json`
   - Click "Select Folder"

4. **Verify Installation:**
   - You should see "rep+ HTTP Request Repeater" in the extensions list
   - The extension should have a green "On" toggle
   - No errors should be displayed

## Step 2: Open the DevTools Panel

1. **Open a Test Website:**
   - Navigate to: `https://httpbin.org/`
   - This is a free HTTP request testing service

2. **Open Chrome DevTools:**
   - Press `F12` (or `Ctrl+Shift+I` / `Cmd+Option+I` on Mac)
   - Or right-click on the page → "Inspect"

3. **Find the rep+ Panel:**
   - Look for the **"rep+"** tab in the DevTools panel
   - It should be next to Elements, Console, Network, etc.
   - If you don't see it, click the `>>` arrows to find hidden panels

4. **Click the rep+ Tab:**
   - The panel should load and display:
     - Toolbar at the top with Capture button
     - Three panels (left: request list, center: editor, right: response)
     - Status bar at the bottom
   - Default state should show "No requests captured yet"

## Step 3: Capture Your First Request

1. **Start Capturing:**
   - Click the **"Capture"** button in the toolbar
   - Or press `Ctrl+R`
   - Button should change to **"Stop"** with a red color
   - Status indicator should show "Capturing..." with an animated dot

2. **Trigger a Request:**
   - In the httpbin.org page, click on any endpoint link (e.g., "GET /get")
   - This will make an HTTP request

3. **View Captured Request:**
   - The request should appear in the left panel
   - It will be grouped under the domain "httpbin.org"
   - Click on the domain header to expand/collapse

4. **Stop Capturing:**
   - Click the **"Stop"** button
   - Or press `Ctrl+R` again
   - Status should return to "Ready"

## Step 4: Inspect a Request

1. **Select a Request:**
   - Click on any request item in the left panel
   - The item should highlight
   - Center panel should populate with request details

2. **Explore the Editor:**
   - **Method dropdown**: Shows the HTTP method (GET, POST, etc.)
   - **URL bar**: Shows the full request URL
   - **Tabs**:
     - **Raw**: Complete HTTP request as text
     - **Headers**: All request headers
     - **Params**: URL query parameters
     - **Body**: Request body (for POST/PUT)

3. **Check the Response:**
   - Right panel shows the response (if available)
   - **Status badge**: HTTP status code with color coding
   - **Timing**: Response time in milliseconds
   - **Size**: Response size
   - **Tabs**:
     - **Raw**: Complete HTTP response
     - **Headers**: Response headers
     - **Preview**: Rendered preview (JSON/HTML/images)

## Step 5: Edit and Send a Request

1. **Make Changes:**
   - Change the method (e.g., from GET to POST)
   - Modify the URL path
   - Add/edit headers:
     - Click "Add Header" button
     - Enter key: `X-Custom-Header`
     - Enter value: `test-value`
   - Add query parameters if needed

2. **Send the Request:**
   - Click the **"Send"** button (or press `Ctrl+Enter`)
   - Button will show "Sending..." briefly
   - Wait for the response

3. **View the New Response:**
   - Right panel updates with the new response
   - Check the status code and response body
   - Compare with the original response

## Step 6: Test Advanced Features

### Domain Grouping

1. Capture requests from multiple websites
2. Notice they're grouped by domain
3. Click domain headers to expand/collapse
4. Count badge shows number of requests per domain

### Search and Filter

1. Type in the search box at the top of the left panel
2. Filter by:
   - URL path (e.g., `/get`)
   - HTTP method (e.g., `GET`)
   - Status code (e.g., `200`)
3. Results update in real-time

### Resizable Panels

1. Hover over the vertical dividers between panels
2. Cursor changes to resize cursor
3. Click and drag to adjust panel widths
4. Release to set the new width

### Theme Toggle

1. Click the theme toggle button (🌓 icon)
2. UI switches between dark and light mode
3. Try both themes to see which you prefer

### Keyboard Shortcuts

- `Ctrl+R` - Start/stop capture
- `Ctrl+L` - Clear all requests (asks for confirmation)
- `Ctrl+T` - Toggle theme
- `Ctrl+D` - Duplicate selected request
- `Ctrl+Enter` - Send request

### Request Duplication

1. Select a request
2. Click the **"Duplicate"** button (📋 icon)
3. Or press `Ctrl+D`
4. A copy of the request appears in the list
5. Edit the copy independently

## Step 7: Test Different Request Types

### GET Request

```
1. Go to: https://httpbin.org/get
2. Capture the request
3. Send it again - should get same response
```

### POST Request with Body

```
1. Go to: https://httpbin.org/post
2. Capture the request
3. In the editor:
   - Change method to POST
   - Go to Body tab
   - Enter: {"name": "John", "age": 30}
4. Add header: Content-Type: application/json
5. Send the request
6. Check response shows your JSON data
```

### Request with Headers

```
1. Select any captured request
2. Go to Headers tab
3. Add custom headers:
   - X-Custom-Header: MyValue
   - X-Test: 123
4. Send the request
5. Check response headers section
```

### Request with Query Parameters

```
1. Select a GET request
2. Go to Params tab
3. Add parameters:
   - Key: name, Value: John
   - Key: city, Value: NYC
4. Notice URL updates automatically
5. Send the request
```

## Troubleshooting

### Panel Doesn't Appear

- **Check extension is loaded:** Go to `chrome://extensions/` and verify
- **Reload extension:** Click the reload icon on the extension card
- **Check for errors:** Click "Service Worker" link under the extension
- **Refresh DevTools:** Close and reopen DevTools (F12)

### Requests Not Captured

- **Ensure capture is started:** Button should show "Stop" not "Capture"
- **Trigger a real request:** Click links or submit forms on the page
- **Check permissions:** Extension needs `<all_urls>` permission
- **Try a simple site:** Start with httpbin.org to verify basic functionality

### Cannot Edit/Send Requests

- **Check request is selected:** Should have blue highlight
- **Look for errors:** Open DevTools for the panel (right-click panel → Inspect)
- **Verify URL is valid:** Must be a complete HTTP/HTTPS URL
- **Check network connectivity:** Ensure you're online

### Resizers Don't Work

- **Try different cursor position:** Hover directly over the divider line
- **Check for console errors:** Right-click panel → Inspect → Console
- **Reload the panel:** Close and reopen DevTools

### Theme Won't Change

- **Click theme button:** Look for 🌓 icon in toolbar
- **Check storage permission:** Extension needs `storage` permission
- **Clear extension storage:** Go to `chrome://extensions/` → Details → Site Settings

## Tips for Effective Use

1. **Start capture before loading pages** - Don't miss initial requests
2. **Use search to find specific requests** - Filter by URL patterns
3. **Duplicate requests before editing** - Keep original for comparison
4. **Check Raw tab for complete request** - See exactly what will be sent
5. **Use keyboard shortcuts** - Much faster than clicking
6. **Organize by domain** - Collapse domains you're not interested in
7. **Clear old requests regularly** - Keeps the list manageable

## Testing Workflow Example

**Scenario:** Test an API endpoint with different parameters

1. Load extension and open DevTools
2. Navigate to API documentation page
3. Start capture (`Ctrl+R`)
4. Make a sample API call from the docs
5. Request appears in left panel
6. Select request and examine structure
7. Duplicate request (`Ctrl+D`)
8. Edit parameters in Params tab
9. Send request (`Ctrl+Enter`)
10. Compare responses
11. Repeat with different values
12. Save successful requests for later

## Next Steps

Once you're comfortable with the basics:

1. **Read the Documentation:**
   - `/docs/DEVTOOLS_API.md` - Technical API details
   - `/docs/ARCHITECTURE.md` - System architecture
   - `/docs/DESIGN.md` - UI/UX specifications

2. **Explore Advanced Features:**
   - Request collections (future feature)
   - Import/export functionality (future feature)
   - Custom request templates (future feature)

3. **Provide Feedback:**
   - Report bugs via GitHub issues
   - Suggest features
   - Contribute to the project

## Support

If you encounter issues:

1. Check this guide first
2. Review the troubleshooting section
3. Check the README.md for common issues
4. Open an issue on GitHub with:
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Screenshots if applicable
   - Console errors from DevTools

## Summary

You should now be able to:

- ✅ Load the extension in Chrome
- ✅ Open the rep+ DevTools panel
- ✅ Capture HTTP requests
- ✅ Inspect request/response details
- ✅ Edit and send modified requests
- ✅ Use advanced features (search, themes, shortcuts)
- ✅ Troubleshoot common issues

Happy testing! 🚀
