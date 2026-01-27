/**
 * Editor Component
 * Manages the Request/Response views and Raw Request editing
 */
export class Editor {
  constructor() {
    this.container = document.querySelector('.split-pane.center-pane');
    this.requestTab = document.getElementById('tab-mode-request');
    this.responseTab = document.getElementById('tab-mode-response');
    this.requestView = document.getElementById('view-request');
    this.responseView = document.getElementById('view-response');
    this.rawEditor = document.getElementById('raw-request');

    // Layout state
    this.layout = 'vertical'; // vertical (side-by-side) or horizontal (top-bottom)

    this.initialize();
  }

  initialize() {
    this.setupTabs();
    this.setupLayoutToggle();
  }

  setupTabs() {
    if (!this.requestTab || !this.responseTab) return;

    this.requestTab.addEventListener('click', () => this.switchView('request'));
    this.responseTab.addEventListener('click', () => this.switchView('response'));
  }

  setupLayoutToggle() {
    const btnLayout = document.getElementById('btn-layout');
    if (btnLayout) {
      btnLayout.addEventListener('click', () => this.toggleLayout());
    }
  }

  switchView(mode) {
    if (mode === 'request') {
      this.requestTab.classList.add('active');
      this.responseTab.classList.remove('active');
      this.requestView.style.display = 'flex';
      this.responseView.style.display = 'none';
      // Hide the response viewer empty state if switching to request
      // But we might want to keep state
    } else {
      this.requestTab.classList.remove('active');
      this.responseTab.classList.add('active');
      this.requestView.style.display = 'none';
      this.responseView.style.display = 'flex';
    }
  }

  toggleLayout() {
    const splitContainer = document.querySelector('.split-pane-container');
    const resizer = document.querySelector('.resizer');

    if (this.layout === 'vertical') {
      this.layout = 'horizontal';
      splitContainer.classList.add('layout-horizontal');
      resizer.setAttribute('data-direction', 'vertical');
      // Update icon?
    } else {
      this.layout = 'vertical';
      splitContainer.classList.remove('layout-horizontal');
      resizer.setAttribute('data-direction', 'horizontal');
    }
  }

  /**
   * Converts a Request object to a Raw HTTP string
   * @param {Object} request
   */
  loadRequest(request) {
    if (!request) return;

    const rawText = this.requestToRaw(request);
    if (this.rawEditor) {
      this.rawEditor.value = rawText;
    }

    // Also update other views if necessary, but we focus on Raw Tab
    this.switchView('request');
  }

  requestToRaw(request) {
    let raw = `${request.method} ${request.url} HTTP/1.1\n`;

    // Headers
    if (request.requestHeaders) {
      request.requestHeaders.forEach((h) => {
        raw += `${h.name}: ${h.value}\n`;
      });
    } else if (request.headers) {
      // Handle different structures
      for (const [key, value] of Object.entries(request.headers)) {
        raw += `${key}: ${value}\n`;
      }
    }

    raw += '\n'; // Empty line before body

    // Body
    if (request.postData && request.postData.text) {
      raw += request.postData.text;
    } else if (request.body) {
      raw += request.body;
    }

    return raw;
  }
}
