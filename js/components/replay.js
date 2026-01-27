/**
 * Replay Component
 * Handles parsing raw requests and executing them via Fetch API
 */
export class ReplayHandler {
  constructor(editorInstance) {
    this.editor = editorInstance;
    this.sendBtn = document.getElementById('btn-send');

    this.initialize();
  }

  initialize() {
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.handleSend());
    }
  }

  async handleSend() {
    const rawText = document.getElementById('raw-request').value;
    if (!rawText) return;

    this.setLoading(true);

    try {
      const requestOptions = this.parseRawRequest(rawText);
      const response = await this.executeRequest(requestOptions);
      this.displayResponse(response);
    } catch (error) {
      this.displayError(error);
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.sendBtn.innerHTML = '<span class="icon">⏳</span> Sending...';
      this.sendBtn.disabled = true;
    } else {
      this.sendBtn.innerHTML = '<span class="icon">▶</span> Send';
      this.sendBtn.disabled = false;
    }
  }

  /**
   * Parses Raw HTTP text into an object for fetch()
   * @param {string} rawText
   */
  parseRawRequest(rawText) {
    const lines = rawText.split('\n');
    if (lines.length === 0) throw new Error('Empty request');

    // Request Line: METHOD URL PROTOCOL
    const requestLine = lines[0].trim().split(/\s+/);
    if (requestLine.length < 2) throw new Error('Invalid Request Line');

    const method = requestLine[0].toUpperCase();
    let url = requestLine[1];

    // Extract headers
    const headers = {};
    let lineIndex = 1;
    for (; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex].trim();
      if (line === '') break; // Empty line marks start of body

      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        headers[key] = value;
      }
    }

    // Extract Body
    const bodyLines = lines.slice(lineIndex + 1);
    const body = bodyLines.join('\n');

    // Make sure URL is absolute
    if (!url.startsWith('http')) {
      // Try to find Host header
      const hostKey = Object.keys(headers).find((k) => k.toLowerCase() === 'host');
      if (hostKey) {
        url = `http://${headers[hostKey]}${url}`; // Default to http, fetch might fail if https is needed but we can't guess easily without previous context.
        // Better approach: if we have the original request context, we use the protocol from there.
        // For now, assume http unless 'https' is formatted or we can infer.
      } else {
        throw new Error('URL must be absolute or Host header must be present');
      }
    }

    return { method, url, headers, body: body || undefined };
  }

  async executeRequest(options) {
    const startTime = performance.now();

    try {
      const fetchOptions = {
        method: options.method,
        headers: options.headers,
        credentials: 'include', // Important for cookies
      };

      if (options.method !== 'GET' && options.method !== 'HEAD' && options.body) {
        fetchOptions.body = options.body;
      }

      const response = await fetch(options.url, fetchOptions);
      const endTime = performance.now();

      const bodyText = await response.text();

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: bodyText,
        time: (endTime - startTime).toFixed(2),
      };
    } catch (error) {
      throw error;
    }
  }

  displayResponse(response) {
    // Switch to response tab
    if (this.editor) {
      this.editor.switchView('response');
    }

    // Populate Status
    const statusEl = document.getElementById('response-status');
    if (statusEl) {
      statusEl.textContent = `${response.status} ${response.statusText}`;
      statusEl.className = `status-badge status-${Math.floor(response.status / 100)}xx`;
    }

    // Populate Time
    const timeEl = document.getElementById('response-time');
    if (timeEl) timeEl.textContent = `${response.time}ms`;

    // Populate Body
    const rawResponseEl = document.getElementById('response-raw');
    if (rawResponseEl) {
      rawResponseEl.textContent = response.body;
    }

    // Hide empty state
    const emptyState = document.getElementById('empty-state-response');
    if (emptyState) emptyState.style.display = 'none';
  }

  displayError(error) {
    alert(`Request Failed: ${error.message}`);
  }
}
