# Highlight.js Integration, JSON Pretty-Printer, and View Toggles Documentation

## Overview
This document describes the implementation of three features in the Burp-style Chrome DevTools extension:
- Syntax highlighting using Highlight.js
- JSON pretty-printer for request and response editors
- View toggles for switching between raw and pretty JSON display

## Highlight.js Integration
- The file `js/components/highlight.js` was added.
- It provides two functions:
  - `loadHighlightJs()`: Dynamically loads Highlight.js and its JSON language support.
  - `highlightCode(element, language)`: Applies syntax highlighting to a given DOM element.
- The Highlight.js stylesheet is included in `panel.html` via CDN.

## JSON Pretty-Printer
- The function `prettifyJsonInEditors()` was added to `js/panel.js`.
- It prettifies JSON in:
  - The request body editor (`body-editor`)
  - The response raw viewer (`response-raw`)
- If invalid JSON is detected, an alert is shown.
- Syntax highlighting is applied after prettifying.

## View Toggles
- View toggles allow switching between raw and pretty JSON views in the response panel.
- The function `showResponseView(view)` was added to `js/panel.js`.
  - When toggling to the preview view, it attempts to parse and pretty-print JSON from the raw response.
  - If successful, it displays the pretty JSON with syntax highlighting.
  - If not, it shows an error message.

## Usage
- Click the "Prettify JSON" button to format JSON in editors.
- Use the response viewer tabs to switch between raw and pretty JSON views.

## Files Modified/Added
- `panel.html`: Added Highlight.js stylesheet.
- `js/panel.js`: Integrated Highlight.js, JSON pretty-printer, and view toggles.
- `js/components/highlight.js`: New module for Highlight.js loading and highlighting.

## Example
```js
import { loadHighlightJs, highlightCode } from './components/highlight.js';

// Load Highlight.js on DOMContentLoaded
loadHighlightJs();

// Prettify and highlight JSON
function prettifyJsonInEditors() {
  // ...existing code...
  highlightCode(responseRaw, 'json');
}
```

## Author
Feature implemented by Member 1.

---
For further details, see the code comments and this documentation.
