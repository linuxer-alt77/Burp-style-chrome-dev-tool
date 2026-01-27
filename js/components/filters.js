/**
 * Filters Component
 * Manages search, filtering and method badges
 */

export class FilterSystem {
  constructor(onFilterChange) {
    this.onFilterChange = onFilterChange;
    this.searchInput = document.getElementById('search-requests');
    this.methodFilter = document.getElementById('filter-method');
    this.searchTimeout = null;

    this.initialize();
  }

  initialize() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleInput(e));
    }
    if (this.methodFilter) {
      this.methodFilter.addEventListener('change', (e) => this.handleInput(e));
    }
  }

  handleInput(event) {
    const query = this.searchInput ? this.searchInput.value : '';
    const method = this.methodFilter ? this.methodFilter.value : '';

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      if (this.onFilterChange) {
        this.onFilterChange({ query, method });
      }
    }, 300);
  }

  /**
   * Helper to render method badge
   * @param {string} method
   */
  static createMethodBadge(method) {
    const span = document.createElement('span');
    span.className = `method-badge method-${method.toLowerCase()}`;
    span.textContent = method;
    return span;
  }

  static matches(request, filters) {
    if (!filters) return true;
    const { query, method } = filters;

    let matchesQuery = true;
    if (query) {
      const q = query.toLowerCase();
      matchesQuery =
        request.url.toLowerCase().includes(q) || request.method.toLowerCase().includes(q);
    }

    let matchesMethod = true;
    if (method) {
      matchesMethod = request.method.toUpperCase() === method.toUpperCase();
    }

    return matchesQuery && matchesMethod;
  }
}
