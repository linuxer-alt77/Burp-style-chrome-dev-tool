// DevTools page initialization script
// This script runs when DevTools is opened and creates the custom panel

chrome.devtools.panels.create(
  "HTTP Repeater", // Panel title
  "icons/icon32.png", // Icon path
  "panel.html", // HTML page for the panel
  (panel) => {
    console.log("HTTP Request Repeater panel created");

    // Panel event listeners
    panel.onShown.addListener((window) => {
      console.log("Panel shown");
      // Notify panel that it's visible
      window.postMessage({ type: "PANEL_SHOWN" }, "*");
    });

    panel.onHidden.addListener(() => {
      console.log("Panel hidden");
    });
  },
);

// Set up communication with the inspected page
chrome.devtools.network.onRequestFinished.addListener((request) => {
  // This will be used to capture network requests
  console.log("Network request finished:", request);
});
