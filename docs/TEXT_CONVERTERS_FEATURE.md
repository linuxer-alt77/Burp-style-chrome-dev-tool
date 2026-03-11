# Text Converters & Context Menu Integration

## Overview
This document describes the implementation of text converter utilities (Base64, URL, JWT, Hex) and their integration with the custom context menu in the DevTools panel of the HTTP Request Repeater Chrome extension.

---

## Converter Utilities

**File:** `js/components/converters.js`

Provides functions for encoding/decoding text in various formats:
- `base64Encode(str)`: Encodes a string to Base64.
- `base64Decode(str)`: Decodes a Base64 string.
- `urlEncode(str)`: URL-encodes a string.
- `urlDecode(str)`: Decodes a URL-encoded string.
- `hexEncode(str)`: Converts a string to hexadecimal.
- `hexDecode(hex)`: Converts hexadecimal to string.
- `jwtDecode(token)`: Decodes a JWT token into header, payload, and signature.

---

## Context Menu Integration

**File:** `js/panel.js`

- Adds a custom context menu to each request item in the request list.
- On right-click, shows converter options: Base64 Encode/Decode, URL Encode/Decode, Hex Encode/Decode, JWT Decode.
- When a menu item is selected, the relevant converter function is called on the request body (if present) or URL.
- Results are displayed in a popup dialog.

**Key Functions:**
- `showRequestContextMenu(e, request)`: Renders the context menu at the cursor position.
- `convertText(type, request)`: Calls the appropriate converter and shows the result.

---

## Styling

**File:** `css/panel.css`

- `.context-menu` and `.context-menu-item` classes style the custom menu for a modern DevTools look.

---

## Usage

- Right-click any request in the request list to open the context menu.
- Select a converter action.
- The conversion result is shown in a dialog.

---

## Example

- Right-click a request, select "JWT Decode". The decoded JWT header and payload are shown.

---

## Extensibility

- New converter functions can be added to `converters.js` and referenced in the context menu.
- Menu styling can be customized in `panel.css`.

---

## Related Files
- `js/components/converters.js`: Converter logic
- `js/panel.js`: Context menu integration
- `css/panel.css`: Menu styling
- `README.md`: User documentation

---

## Author
GitHub Copilot (GPT-4.1)

March 11, 2026
