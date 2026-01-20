# Design & UI Documentation

This document describes the user interface design, wireframes, and visual styling for the HTTP Request Repeater Chrome DevTools extension.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Schemes](#color-schemes)
3. [Layout Wireframes](#layout-wireframes)
4. [Component Designs](#component-designs)
5. [Interaction Patterns](#interaction-patterns)
6. [Responsive Behavior](#responsive-behavior)
7. [Accessibility](#accessibility)

---

## Design Philosophy

### Core Principles

1. **Familiar & Professional**: Follow Chrome DevTools design patterns for consistency
2. **Information Density**: Display maximum relevant information without clutter
3. **Quick Access**: Critical actions within 1-2 clicks
4. **Dark-First**: Optimized for dark theme (developer preference)
5. **Keyboard Friendly**: Support keyboard shortcuts for power users

### Target Users

- **Web Developers**: Testing API endpoints during development
- **Security Researchers**: Analyzing and modifying HTTP traffic
- **QA Engineers**: Reproducing and debugging issues
- **API Testers**: Similar to Postman/Insomnia users

---

## Color Schemes

### Dark Theme (Primary)

```css
/* Dark Theme Variables */
:root[data-theme="dark"] {
  /* Background Colors */
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --bg-tertiary: #2d2d30;
  --bg-hover: #37373d;
  --bg-active: #007acc;

  /* Text Colors */
  --text-primary: #cccccc;
  --text-secondary: #858585;
  --text-muted: #6a6a6a;
  --text-link: #4fc3f7;
  --text-success: #4ec9b0;
  --text-warning: #dcdcaa;
  --text-error: #f48771;

  /* Border Colors */
  --border-primary: #3e3e42;
  --border-secondary: #2d2d30;
  --border-focus: #007acc;

  /* Status Colors */
  --status-1xx: #61afef; /* Informational - Blue */
  --status-2xx: #98c379; /* Success - Green */
  --status-3xx: #d19a66; /* Redirect - Orange */
  --status-4xx: #e5c07b; /* Client Error - Yellow */
  --status-5xx: #e06c75; /* Server Error - Red */

  /* Method Colors */
  --method-get: #61afef; /* Blue */
  --method-post: #98c379; /* Green */
  --method-put: #d19a66; /* Orange */
  --method-delete: #e06c75; /* Red */
  --method-patch: #c678dd; /* Purple */
  --method-options: #56b6c2; /* Cyan */
  --method-head: #abb2bf; /* Gray */

  /* UI Elements */
  --button-primary-bg: #0e639c;
  --button-primary-hover: #1177bb;
  --button-primary-text: #ffffff;
  --button-secondary-bg: #3a3a3c;
  --button-secondary-hover: #4a4a4c;

  /* Editor Colors */
  --editor-bg: #1e1e1e;
  --editor-gutter: #252526;
  --editor-line-number: #858585;
  --editor-selection: #264f78;
  --editor-cursor: #aeafad;

  /* Scrollbar */
  --scrollbar-track: #1e1e1e;
  --scrollbar-thumb: #424242;
  --scrollbar-thumb-hover: #4e4e4e;

  /* Shadow */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
}
```

### Light Theme (Secondary)

```css
/* Light Theme Variables */
:root[data-theme="light"] {
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f3f3f3;
  --bg-tertiary: #e8e8e8;
  --bg-hover: #e8e8e8;
  --bg-active: #0078d4;

  /* Text Colors */
  --text-primary: #383838;
  --text-secondary: #717171;
  --text-muted: #999999;
  --text-link: #006ab1;
  --text-success: #13a10e;
  --text-warning: #c19c00;
  --text-error: #d13438;

  /* Border Colors */
  --border-primary: #d4d4d4;
  --border-secondary: #e8e8e8;
  --border-focus: #0078d4;

  /* Status Colors */
  --status-1xx: #0078d4; /* Blue */
  --status-2xx: #13a10e; /* Green */
  --status-3xx: #ff8c00; /* Orange */
  --status-4xx: #ffb900; /* Yellow */
  --status-5xx: #d13438; /* Red */

  /* Method Colors */
  --method-get: #0078d4;
  --method-post: #13a10e;
  --method-put: #ff8c00;
  --method-delete: #d13438;
  --method-patch: #8764b8;
  --method-options: #00b7c3;
  --method-head: #717171;

  /* UI Elements */
  --button-primary-bg: #0078d4;
  --button-primary-hover: #106ebe;
  --button-primary-text: #ffffff;
  --button-secondary-bg: #f3f3f3;
  --button-secondary-hover: #e1e1e1;

  /* Editor Colors */
  --editor-bg: #ffffff;
  --editor-gutter: #f3f3f3;
  --editor-line-number: #717171;
  --editor-selection: #add6ff;
  --editor-cursor: #000000;

  /* Scrollbar */
  --scrollbar-track: #f3f3f3;
  --scrollbar-thumb: #c8c8c8;
  --scrollbar-thumb-hover: #a6a6a6;

  /* Shadow */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

---

## Layout Wireframes

### Main Panel Layout (Three-Column)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Toolbar                                                                 │
│  [⏺ Capture] [🗑 Clear]              [Settings ⚙] [Theme Toggle 🌓]    │
├────────────────┬──────────────────────────────┬───────────────────────────┤
│                │                              │                           │
│  Request List  │      Request Editor         │    Response Viewer        │
│   (25% width)  │       (40% width)            │      (35% width)          │
│                │                              │                           │
│ ┌────────────┐ │ ┌──────────────────────────┐│ ┌───────────────────────┐│
│ │ Search     │ │ │ [Raw][Headers][Params]   ││ │ Status: 200 OK        ││
│ │ [Filter..] │ │ │ [Body]                   ││ │ Time: 145ms           ││
│ └────────────┘ │ └──────────────────────────┘│ │ Size: 1.2 KB          ││
│                │                              │ └───────────────────────┘│
│ ┌────────────┐ │ ┌──────────────────────────┐│ ┌───────────────────────┐│
│ │ POST /api  │ │ │                          ││ │ [Raw][Headers]        ││
│ │ 201 145ms  │ │ │  POST /api/users HTTP/1.1││ │ [Preview]             ││
│ └────────────┘ │ │  Host: api.example.com   ││ └───────────────────────┘│
│                │ │  Content-Type: app/json  ││                           │
│ ┌────────────┐ │ │                          ││ ┌───────────────────────┐│
│ │ GET /data  │ │ │  {                       ││ │                       ││
│ │ 200 98ms   │ │ │    "name": "John"        ││ │  {                    ││
│ └────────────┘ │ │  }                       ││ │    "id": 123,         ││
│                │ │                          ││ │    "status": "ok"     ││
│ ┌────────────┐ │ └──────────────────────────┘│ │  }                    ││
│ │ PUT /user  │ │                              │ │                       ││
│ │ 200 132ms  │ │ ┌──────────────────────────┐│ │                       ││
│ └────────────┘ │ │                          ││ │                       ││
│                │ │   [▶ Send] [📋 Duplicate]││ │                       ││
│      ...       │ │                          ││ │                       ││
│                │ └──────────────────────────┘│ │                       ││
│                │                              │ │                       ││
└────────────────┴──────────────────────────────┴───────────────────────────┤
│  Status Bar: Ready                              1,234 requests captured   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Request List Item

```
┌──────────────────────────────────────────┐
│ ┌────┐  /api/users?page=1               │
│ │POST│  api.example.com                  │
│ └────┘  201 · 145ms · 12:34:56          │
└──────────────────────────────────────────┘
  │
  └─ Hover State: Highlight background
  └─ Selected State: Blue left border + darker bg
  └─ Click: Load into editor
```

### Request Editor - Tab Views

#### Raw Tab

```
┌────────────────────────────────────────────┐
│ [Raw] [Headers] [Params] [Body]            │
├────────────────────────────────────────────┤
│                                            │
│ POST /api/users HTTP/1.1                   │
│ Host: api.example.com                      │
│ Content-Type: application/json             │
│ Authorization: Bearer token123             │
│                                            │
│ {                                          │
│   "name": "John Doe",                      │
│   "email": "john@example.com"              │
│ }                                          │
│                                            │
└────────────────────────────────────────────┘
```

#### Headers Tab

```
┌────────────────────────────────────────────┐
│ [Raw] [Headers] [Params] [Body]            │
├────────────────────────────────────────────┤
│                                            │
│ ┌──────────────────┬────────────────────┐ │
│ │ Key              │ Value              │ │
│ ├──────────────────┼────────────────────┤ │
│ │ Content-Type     │ application/json   │ │
│ │ Authorization    │ Bearer token123    │ │
│ │ Accept           │ */*                │ │
│ │ [+ Add Header]                        │ │
│ └──────────────────┴────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

### Response Viewer

```
┌────────────────────────────────────────────┐
│ Status: 200 OK  Time: 145ms  Size: 1.2KB  │
├────────────────────────────────────────────┤
│ [Raw] [Headers] [Preview]                  │
├────────────────────────────────────────────┤
│                                            │
│ {                                          │
│   "id": 123,                               │
│   "name": "John Doe",                      │
│   "email": "john@example.com",             │
│   "created_at": "2026-01-21T12:00:00Z"     │
│ }                                          │
│                                            │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

---

## Component Designs

### 1. Toolbar Component

```
┌───────────────────────────────────────────────────────────────┐
│  ┌──────────┐ ┌───────┐              ┌──────┐ ┌──────┐      │
│  │⏺ Capture │ │🗑Clear│              │  ⚙   │ │  🌓  │      │
│  └──────────┘ └───────┘              └──────┘ └──────┘      │
└───────────────────────────────────────────────────────────────┘
   Primary       Secondary              Icon     Icon
   Button        Button                 Button   Button
```

**States:**

- **Capture Button**:
  - Default: "⏺ Capture" (gray)
  - Active: "⏹ Stop" (red, pulsing animation)
  - Disabled: Grayed out

### 2. Request List Item

```
┌─────────────────────────────────────────────┐
│ ┌──────┐                                    │
│ │ POST │  /api/users                        │
│ └──────┘  api.example.com                   │
│            201 · 145ms · 12:34:56           │
└─────────────────────────────────────────────┘

  └─ Method Badge: Color-coded, rounded corners
  └─ URL: Truncated with ellipsis
  └─ Domain: Muted text
  └─ Meta: Status (color-coded) · Duration · Time
```

**Color Coding:**

- POST = Green
- GET = Blue
- PUT = Orange
- DELETE = Red
- Status 2xx = Green
- Status 4xx/5xx = Red

### 3. Tab Navigation

```
┌────────────────────────────────────────────┐
│ [Raw*] [Headers] [Params] [Body]           │
└────────────────────────────────────────────┘
   └─ Active tab: Blue underline + bold text
   └─ Hover: Background highlight
   └─ Inactive: Gray text
```

### 4. Status Badge

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 200 OK   │  │ 404 Not  │  │ 500 Int. │
│          │  │  Found   │  │  Error   │
└──────────┘  └──────────┘  └──────────┘
   Green         Orange         Red

   └─ Rounded corners
   └─ Padding: 4px 8px
   └─ Font: Bold, 12px
```

### 5. Code Editor (Textarea Styled)

```
┌────────────────────────────────────────────┐
│ 1  POST /api/users HTTP/1.1                │
│ 2  Host: api.example.com                   │
│ 3  Content-Type: application/json          │
│ 4                                          │
│ 5  {                                       │
│ 6    "name": "John"                        │
│ 7  }                                       │
│ 8                                          │
│ 9                                          │
│                                            │
└────────────────────────────────────────────┘

└─ Line numbers in gutter
└─ Monospace font (Consolas, Monaco, 'Courier New')
└─ Syntax highlighting (future enhancement)
└─ Auto-indent
```

### 6. Empty States

#### No Requests Captured

```
┌────────────────────────────────────────────┐
│                                            │
│              📡                            │
│                                            │
│      No requests captured yet.             │
│                                            │
│  Click "Capture" to start monitoring       │
│        network traffic.                    │
│                                            │
└────────────────────────────────────────────┘
```

#### No Response Yet

```
┌────────────────────────────────────────────┐
│                                            │
│              ⏳                            │
│                                            │
│         No response yet.                   │
│                                            │
│   Send a request to see the response here. │
│                                            │
└────────────────────────────────────────────┘
```

---

## Interaction Patterns

### 1. Request Selection Flow

```
User clicks request in list
    │
    ├─ Visual feedback: Highlight item (immediate)
    │
    ├─ Load request into editor (< 50ms)
    │   └─ Populate all tabs (Raw, Headers, Params, Body)
    │
    └─ Clear previous response
        └─ Show "No response yet" state
```

### 2. Request Send Flow

```
User clicks "Send" button
    │
    ├─ Button state: Loading spinner
    │
    ├─ Disable send button (prevent double-click)
    │
    ├─ Status bar: "Sending request..."
    │
    ├─ Send to background worker
    │
    ├─ Wait for response...
    │
    ├─ On Success:
    │   ├─ Update response viewer
    │   ├─ Show status badge (green)
    │   ├─ Display timing info
    │   └─ Status bar: "Request completed"
    │
    └─ On Error:
        ├─ Show error message
        ├─ Status badge (red)
        └─ Status bar: "Request failed"
```

### 3. Filter/Search Pattern

```
User types in search box
    │
    ├─ Debounce 300ms (wait for user to stop typing)
    │
    ├─ Filter request list by:
    │   ├─ URL (contains search term)
    │   ├─ Method (exact match)
    │   └─ Status code (exact match)
    │
    └─ Update list (hide non-matching items)
        └─ Show "No results" if empty
```

### 4. Theme Toggle

```
User clicks theme button
    │
    ├─ Toggle theme state: dark ↔ light
    │
    ├─ Update CSS custom properties
    │
    ├─ Smooth transition (0.3s)
    │
    └─ Save preference to storage
```

---

## Responsive Behavior

### Panel Resizing

```
Wide (> 1400px): 25% | 40% | 35%
Medium (900-1400px): 30% | 35% | 35%
Narrow (< 900px): Stack vertically
    ┌─────────────────────┐
    │   Request List      │
    ├─────────────────────┤
    │   Request Editor    │
    ├─────────────────────┤
    │   Response Viewer   │
    └─────────────────────┘
```

### Resizable Panels

- Add resize handles between panels
- User can drag to adjust widths
- Minimum width: 250px per panel
- Save preferences to storage

```
┌──────────┃ ← Drag handle
│ Request  ┃
│ List     ┃
└──────────┃
```

### Collapsible Sections

- Request list can collapse to icon bar
- Response viewer can collapse
- Provides more space for editor

```
Collapsed Request List:
┌─┐
│≡│  Show list
│⏺│  Capture
│🗑│  Clear
└─┘
```

---

## Accessibility

### Keyboard Shortcuts

```
Ctrl/Cmd + Enter  : Send request
Ctrl/Cmd + K      : Focus search
Ctrl/Cmd + D      : Duplicate request
Ctrl/Cmd + L      : Clear all requests
Ctrl/Cmd + T      : Toggle theme
Ctrl/Cmd + ,      : Open settings
Escape            : Clear search/deselect
Arrow Up/Down     : Navigate request list
Tab               : Cycle through tabs
```

### ARIA Labels

```html
<button aria-label="Start capturing network requests">Capture</button>

<input
  type="text"
  aria-label="Filter requests by URL or method"
  placeholder="Filter requests..."
/>

<div role="tabpanel" aria-labelledby="tab-raw">
  <!-- Tab content -->
</div>
```

### Focus Management

- Visible focus indicators (blue outline)
- Logical tab order
- Focus trapped in modals
- Skip to main content link

### Screen Reader Support

- Status updates announced
- Error messages announced
- Loading states announced
- Dynamic content changes announced

```html
<div role="status" aria-live="polite" aria-atomic="true">
  Request sent successfully. Status: 200 OK
</div>
```

---

## Icon Design

### Extension Icons

#### 16x16 (Toolbar)

```
Simple design:
- Blue square with rounded corners
- White "HTTP" text or arrow symbol
- High contrast for small size
```

#### 32x32 (DevTools Panel)

```
More detailed:
- Blue gradient background
- "HTTP" text at top
- Circular arrows (repeat symbol)
- Clear at 32x32 resolution
```

#### 48x48 (Extension Management)

```
Same as 32x32 but sharper
- More padding
- Bolder lines
```

#### 128x128 (Chrome Web Store)

```
Full detail:
- Gradient background (#4A90E2 → #357ABD)
- Large "HTTP" text
- Circular arrows with arrow heads
- Professional, modern look
- Shadows for depth
```

### UI Icons

**Toolbar Icons:**

- ⏺ Capture: Record circle
- ⏹ Stop: Square
- 🗑 Clear: Trash bin
- ⚙ Settings: Gear/cog
- 🌓 Theme: Sun/moon

**Action Icons:**

- ▶ Send: Play/right arrow
- 📋 Duplicate: Copy/clipboard
- 💾 Save: Floppy disk
- 📥 Export: Download arrow
- 📤 Import: Upload arrow

---

## Mockups

### Dark Theme Full Layout

```
█████████████████████████████████████████████████████████████████████████████
█  HTTP Request Repeater               Dark Theme            [⚙] [🌓] [×]  █
█████████████████████████████████████████████████████████████████████████████
█ [⏺ Capture] [🗑 Clear]                                                    █
█████████████████████████████████████████████████████████████████████████████
█                │                              │                           █
█  Requests      │      Request Editor          │    Response               █
█                │                              │                           █
█ ┌────────────┐│ [Raw] [Headers] [Params]     │ Status: 200 OK            █
█ │ Filter...  ││ [Body]            [▶ Send]    │ Time: 145ms               █
█ └────────────┘│                               │ Size: 1.2 KB              █
█ ┏━━━━━━━━━━━┓│ POST /api/users HTTP/1.1      │ ┌───────────────────────┐ █
█ ┃POST /users┃│ Host: api.example.com         │ │ [Raw] [Headers]       │ █
█ ┃201 · 145ms┃│ Content-Type: application/json│ │ [Preview]             │ █
█ ┗━━━━━━━━━━━┛│                               │ └───────────────────────┘ █
█ ┌───────────┐│ {                             │ {                         █
█ │GET /data  ││   "name": "John Doe",         │   "id": 123,              █
█ │200 · 98ms ││   "email": "john@example.com" │   "name": "John Doe",     █
█ └───────────┘│ }                             │   "email": "john@...",    █
█ ┌───────────┐│                               │   "status": "active"      █
█ │PUT /user  ││                               │ }                         █
█ │200 · 132ms││                               │                           █
█ └───────────┘│                               │                           █
█     ...      │                               │                           █
█              │                               │                           █
█████████████████████████████████████████████████████████████████████████████
█ Ready                                         1,234 requests captured    █
█████████████████████████████████████████████████████████████████████████████
```

### Light Theme Comparison

```
Same layout but with:
- White background
- Light gray panels
- Dark text
- Blue accent colors
- Subtle shadows
```

---

## CSS Structure

### Recommended CSS Organization

```
css/
├── base/
│   ├── reset.css          # CSS reset
│   ├── variables.css      # CSS custom properties
│   └── typography.css     # Font styles
├── components/
│   ├── toolbar.css        # Toolbar styles
│   ├── request-list.css   # Request list
│   ├── request-editor.css # Editor component
│   ├── response-viewer.css# Response display
│   ├── tabs.css           # Tab navigation
│   ├── buttons.css        # Button styles
│   ├── badges.css         # Status badges
│   └── empty-state.css    # Empty states
├── themes/
│   ├── dark.css           # Dark theme
│   └── light.css          # Light theme
└── panel.css              # Main entry point
```

---

## Implementation Priority

### Phase 1: Core UI

1. Basic layout (3-column)
2. Dark theme colors
3. Toolbar with buttons
4. Request list (simple)
5. Basic editor (textarea)
6. Basic response viewer

### Phase 2: Enhanced UI

1. Tab navigation
2. Styled request items
3. Status badges
4. Empty states
5. Search/filter
6. Theme toggle

### Phase 3: Advanced Features

1. Resizable panels
2. Syntax highlighting
3. Light theme
4. Keyboard shortcuts
5. Context menus
6. Animations

---

## Next Steps

1. Create `css/panel.css` with base styles
2. Implement dark theme colors
3. Style request list component
4. Create request editor styles
5. Design response viewer
6. Add interactive states (hover, active, focus)
7. Test accessibility
8. Implement theme toggle
9. Add animations and transitions
10. Test on different screen sizes

---

## References

- Chrome DevTools Design: https://developers.google.com/web/tools/chrome-devtools
- Material Design (for inspiration): https://material.io/design
- VS Code Theme Colors: https://code.visualstudio.com/api/references/theme-color
- Burp Suite UI: https://portswigger.net/burp/documentation/desktop/tools/repeater
