# HTTP Request Repeater - Chrome DevTools Extension

A powerful Chrome DevTools extension for capturing, modifying, and repeating HTTP requests - inspired by Burp Suite's Repeater tool.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Chrome](https://img.shields.io/badge/chrome-v88+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

- **Request Capture**: Automatically capture HTTP/HTTPS requests from the inspected page
- **Request Editor**: Modify HTTP requests with an intuitive interface
  - Raw HTTP view
  - Structured headers editor
  - Query parameters editor
  - Request body editor
- **Response Viewer**: View responses with syntax highlighting
  - Raw response view
  - Headers inspection
  - JSON/XML/HTML preview
- **Dark/Light Theme**: Switch between dark and light themes
- **Request History**: Store and browse captured requests
- **Search & Filter**: Quickly find requests by URL, method, or status
- **Keyboard Shortcuts**: Power-user friendly with keyboard shortcuts

## 📋 Requirements

- Chrome Browser version 88 or higher
- Developer Mode enabled in Chrome Extensions

## 🛠️ Installation

### For Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Burp-style-chrome-dev-tool
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the project directory
   - The extension should now appear in your extensions list

4. **Use the extension**
   - Open Chrome DevTools (F12 or Right-click → Inspect)
   - Look for the "HTTP Repeater" tab in DevTools
   - Start capturing and modifying requests!

### For Production

_Coming soon: Chrome Web Store listing_

## 📖 Usage Guide

### Capturing Requests

1. Open Chrome DevTools (F12)
2. Navigate to the "HTTP Repeater" tab
3. Click the "Capture" button to start monitoring network traffic
4. Browse the target website - all HTTP requests will be captured
5. Click "Stop" to stop capturing

### Editing and Sending Requests

1. Select a captured request from the list on the left
2. Modify the request in the center panel:
   - **Raw tab**: Edit the raw HTTP request
   - **Headers tab**: Add/modify/remove headers
   - **Params tab**: Modify query parameters
   - **Body tab**: Edit the request body
3. Click the "Send" button to execute the modified request
4. View the response in the right panel

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Send request
- `Ctrl/Cmd + K` - Focus search
- `Ctrl/Cmd + D` - Duplicate request
- `Ctrl/Cmd + L` - Clear all requests
- `Ctrl/Cmd + T` - Toggle theme
- `Escape` - Clear search/deselect
- `Arrow Up/Down` - Navigate request list

## 📁 Project Structure

```
Burp-style-chrome-dev-tool/
├── manifest.json           # Extension manifest (Manifest V3)
├── devtools.html          # DevTools page entry point
├── panel.html             # Main panel UI
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── package.json           # NPM package configuration
├── LICENSE                # MIT License
│
├── icons/                 # Extension icons
│   ├── icon16.svg
│   ├── icon32.svg
│   ├── icon48.svg
│   └── icon128.svg
│
├── css/                   # Stylesheets
│   ├── panel.css         # Main panel styles
│   └── base/
│       └── variables.css # CSS variables and themes
│
├── js/                    # JavaScript modules
│   ├── background.js     # Background service worker
│   ├── devtools.js       # DevTools initialization
│   └── panel.js          # Main panel controller
│
├── lib/                   # Third-party libraries
│   └── README.md
│
└── docs/                  # Documentation
    ├── DEVTOOLS_API.md   # Chrome DevTools API documentation
    ├── ARCHITECTURE.md   # System architecture
    └── DESIGN.md         # UI/UX design documentation
```

## 🏗️ Architecture

The extension follows Chrome Extension Manifest V3 architecture:

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

**Key Components:**

1. **DevTools Panel** (`panel.html` + `panel.js`)
   - User interface for displaying and editing requests
   - Handles user interactions
   - Renders request list and responses

2. **Background Service Worker** (`background.js`)
   - Handles HTTP request sending
   - Stores captured requests
   - Manages extension state
   - Routes messages between components

3. **DevTools Page** (`devtools.js`)
   - Creates the DevTools panel
   - Captures network requests using `chrome.devtools.network`
   - Forwards captured requests to background worker

For detailed architecture information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🎨 Design

The extension follows Chrome DevTools design patterns with:

- **Dark theme** (default) optimized for developers
- **Light theme** available
- **Three-panel layout**: Request list, Editor, Response viewer
- **Color-coded status indicators** (green for 2xx, red for 5xx, etc.)
- **Method badges** with distinct colors

For detailed design documentation, see [docs/DESIGN.md](docs/DESIGN.md).

## 🔧 Development

### Prerequisites

- Node.js 14+ (for development tools, optional)
- Chrome Browser 88+

### Setup Development Environment

```bash
# Install development dependencies (optional)
npm install

# Run linter
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Create a production build
npm run build

# This will create a .zip file ready for Chrome Web Store submission
```

## 🧪 Testing

### Manual Testing

1. Load the extension in Chrome (see Installation)
2. Open DevTools on any website
3. Test capturing requests
4. Test editing and sending requests
5. Verify response display
6. Test theme switching

### Test Cases

- ✅ Capture GET requests
- ✅ Capture POST requests with JSON body
- ✅ Modify headers and resend
- ✅ Handle CORS errors gracefully
- ✅ Theme toggle persists
- ✅ Request list filtering works
- ✅ Keyboard shortcuts function correctly

## 🐛 Known Issues

- **CORS Limitations**: Browser's CORS policy still applies to custom requests sent from the extension
- **Icon Format**: SVG icons need to be converted to PNG for proper display
- **Response Size**: Very large responses (>10MB) may cause performance issues

## 🗺️ Roadmap

### Version 1.1

- [ ] PNG icon files
- [ ] Syntax highlighting for request/response bodies
- [ ] Export/Import requests (HAR format)
- [ ] Request collections and folders

### Version 1.2

- [ ] Environment variables
- [ ] Pre-request scripts
- [ ] Post-response scripts
- [ ] Request comparison/diff tool

### Version 2.0

- [ ] Request assertions and testing
- [ ] Mock responses
- [ ] WebSocket support
- [ ] GraphQL support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Burp Suite's Repeater tool](https://portswigger.net/burp/documentation/desktop/tools/repeater)
- Chrome DevTools team for excellent APIs
- VS Code for UI/UX inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: your-email@example.com

## 📚 Resources

- [Chrome DevTools Extension API](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Project Documentation](docs/)

---

**Made with ❤️ for web developers and security researchers**

## 🔤 Text Converters & Context Menu

### Supported Conversions
- **Base64 Encode/Decode**
- **URL Encode/Decode**
- **Hex Encode/Decode**
- **JWT Decode**

### How to Use
- **Right-click** any request in the request list to open the context menu.
- Select a converter action (e.g., Base64 Encode, JWT Decode).
- The conversion will be performed on the request body (if present), otherwise the URL.
- Results are shown in a popup dialog.

### Example
- To decode a JWT, right-click a request, choose "JWT Decode". The decoded header, payload, and signature will be displayed.

### Technical Details
- Converter logic is implemented in `js/components/converters.js`.
- Context menu integration is handled in `js/panel.js`.
- Custom context menu styling is in `css/panel.css`.

---
