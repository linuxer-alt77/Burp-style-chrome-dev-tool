// Background service worker
// Handles communication between DevTools panel and network operations

console.log("HTTP Request Repeater background service worker loaded");

// Store captured requests
let capturedRequests = [];
let isCapturing = false;

// Listen for messages from DevTools panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message);

  switch (message.type) {
    case "START_CAPTURE":
      isCapturing = true;
      sendResponse({ success: true, capturing: true });
      break;

    case "STOP_CAPTURE":
      isCapturing = false;
      sendResponse({ success: true, capturing: false });
      break;

    case "GET_REQUESTS":
      sendResponse({ requests: capturedRequests });
      break;

    case "CLEAR_REQUESTS":
      capturedRequests = [];
      sendResponse({ success: true });
      break;

    case "SEND_REQUEST":
      // Handle custom request sending
      handleCustomRequest(message.request)
        .then((response) => sendResponse({ success: true, response }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message }),
        );
      return true; // Keep channel open for async response

    default:
      console.warn("Unknown message type:", message.type);
  }

  return false;
});

// Function to send custom HTTP requests
async function handleCustomRequest(requestData) {
  console.log("Sending custom request:", requestData);

  try {
    const response = await fetch(requestData.url, {
      method: requestData.method || "GET",
      headers: requestData.headers || {},
      body: requestData.body || null,
      mode: "cors",
      credentials: "include",
    });

    const responseData = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
      url: response.url,
      timestamp: Date.now(),
    };

    return responseData;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

// Store request for later use
function storeRequest(requestData) {
  if (isCapturing) {
    capturedRequests.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...requestData,
    });

    // Limit stored requests to prevent memory issues
    if (capturedRequests.length > 1000) {
      capturedRequests.shift();
    }
  }
}

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log("HTTP Request Repeater installed:", details.reason);

  if (details.reason === "install") {
    // First time installation
    chrome.storage.local.set({
      theme: "dark",
      autoCapture: false,
      maxRequests: 1000,
    });
  }
});
