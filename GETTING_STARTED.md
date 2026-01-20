# Getting Started Guide

Welcome to the HTTP Request Repeater Chrome DevTools Extension! This guide will help you get started quickly.

## Quick Start (5 minutes)

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked" button
4. Navigate to this project folder and select it
5. The extension should now appear in your extensions list

### 2. Open DevTools

1. Navigate to any website (e.g., https://example.com)
2. Open Chrome DevTools:
   - Right-click → "Inspect", or
   - Press F12, or
   - Press Ctrl+Shift+I (Windows/Linux) / Cmd+Option+I (Mac)

### 3. Find the HTTP Repeater Tab

1. Look for the "HTTP Repeater" tab in the DevTools panel
2. If you don't see it, click the ">>" icon to find it in the overflow menu
3. Click on the tab to open the extension

### 4. Start Capturing Requests

1. Click the **"Capture"** button in the toolbar
2. Navigate around the website or trigger some API calls
3. Watch as HTTP requests appear in the left panel
4. Click **"Stop"** when you're done capturing

### 5. Modify and Resend a Request

1. Click on any request in the left panel to select it
2. The request details will appear in the center editor
3. Modify the request:
   - Change the URL
   - Add/edit headers
   - Modify the request body
4. Click the **"Send"** button
5. View the response in the right panel

## First Steps Checklist

- [ ] Extension loaded in Chrome
- [ ] DevTools opened with HTTP Repeater tab visible
- [ ] Captured your first HTTP request
- [ ] Modified and resent a request
- [ ] Viewed the response
- [ ] Tried the theme toggle (🌓 button)

## Tips for Success

### 1. Use Filters

The search box at the top of the request list helps you filter requests:
- Type a URL path: `/api/users`
- Type a method: `POST`
- Type a status code: `200`

### 2. Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts:
- `Ctrl/Cmd + Enter` - Send the current request
- `Ctrl/Cmd + D` - Duplicate the selected request
- `Ctrl/Cmd + L` - Clear all captured requests
- `Arrow Up/Down` - Navigate through the request list

### 3. Raw vs. Structured Editing

Switch between tabs in the request editor:
- **Raw**: Edit the complete HTTP request as text
- **Headers**: Key-value editor for headers
- **Params**: Edit query parameters
- **Body**: Edit the request body

### 4. Response Views

Switch between response tabs:
- **Raw**: See the complete HTTP response
- **Headers**: View response headers
- **Preview**: Formatted view (JSON, HTML, etc.)

## Common Use Cases

### Testing API Endpoints

1. Navigate to your application
2. Capture the API request you want to test
3. Modify parameters or headers
4. Send and verify the response
5. Iterate until you get the expected result

### Debugging Authentication Issues

1. Capture a failing authenticated request
2. Inspect the Authorization header
3. Try different token values
4. Check the response for clues

### Reproducing Bugs

1. Capture the request that triggers the bug
2. Save it for later by duplicating it
3. Modify parameters to test edge cases
4. Share the raw request with your team

### Testing Rate Limiting

1. Capture a request
2. Click "Send" multiple times quickly
3. Observe response codes (429 for rate limiting)
4. Check response headers for rate limit info

## Troubleshooting

### Extension Not Appearing in DevTools

**Problem**: Can't find the HTTP Repeater tab

**Solutions**:
- Check that the extension is enabled in `chrome://extensions/`
- Look in the ">>" overflow menu in DevTools
- Try closing and reopening DevTools
- Refresh the page

### Requests Not Being Captured

**Problem**: The request list stays empty

**Solutions**:
- Make sure the "Capture" button is active (red with "Stop" text)
- Try navigating to a different page
- Check the browser console for errors
- Ensure the page is making HTTP requests

### Can't Send Custom Requests

**Problem**: Getting CORS errors when sending requests

**Solutions**:
- This is a browser security feature
- The target server must allow CORS
- Consider using a CORS proxy for development
- Note: This is expected behavior for cross-origin requests

### Theme Not Persisting

**Problem**: Theme resets after closing DevTools

**Solutions**:
- Check browser console for storage errors
- Ensure the extension has storage permissions
- Try reinstalling the extension

### Icons Not Showing

**Problem**: Extension icons appear broken

**Solutions**:
- The current icons are SVG placeholders
- Convert them to PNG files (see icons/README.md)
- Update the paths in manifest.json

## Next Steps

### For Users

1. **Explore the Documentation**
   - Read [docs/DEVTOOLS_API.md](docs/DEVTOOLS_API.md) for API details
   - Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
   - Check [docs/DESIGN.md](docs/DESIGN.md) for UI/UX information

2. **Customize Your Experience**
   - Try both dark and light themes
   - Adjust panel widths by dragging (coming soon)
   - Set up keyboard shortcuts in Chrome settings

3. **Report Issues**
   - Found a bug? Open an issue on GitHub
   - Have a feature request? Start a discussion
   - Want to contribute? Read the contributing guidelines

### For Developers

1. **Set Up Development Environment**
   ```bash
   npm install
   npm run lint
   ```

2. **Make Your First Change**
   - Start with a simple UI tweak
   - Test thoroughly in Chrome
   - Follow the code style guidelines

3. **Add a Feature**
   - Check the roadmap in README.md
   - Pick an item or propose a new one
   - Submit a pull request

## Resources

### Documentation
- [Main README](README.md) - Project overview
- [Architecture](docs/ARCHITECTURE.md) - System design
- [DevTools API](docs/DEVTOOLS_API.md) - API documentation
- [Design](docs/DESIGN.md) - UI/UX guidelines

### External Resources
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [DevTools Extension Guide](https://developer.chrome.com/docs/extensions/mv3/devtools/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

### Community
- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and ideas
- Email Support - Direct help

## Need Help?

If you're stuck:

1. **Check the documentation** - Most answers are in the docs
2. **Search existing issues** - Someone may have had the same problem
3. **Ask for help** - Create a new issue or discussion
4. **Contact support** - Email for direct assistance

## What's Next?

Now that you're set up, try:

1. Capturing some real API requests from your application
2. Modifying and resending requests to test different scenarios
3. Exploring all the tabs and features
4. Reading the advanced documentation
5. Contributing improvements back to the project

Happy testing! 🚀
