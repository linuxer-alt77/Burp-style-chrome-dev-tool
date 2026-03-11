// highlight.js loader
export async function loadHighlightJs() {
  if (!window.hljs) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.onload = () => {
      // Optionally load JSON language
      if (!window.hljs.getLanguage('json')) {
        const jsonScript = document.createElement('script');
        jsonScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/json.min.js';
        document.head.appendChild(jsonScript);
      }
    };
    document.head.appendChild(script);
  }
}

export function highlightCode(element, language = 'json') {
  if (window.hljs && element) {
    element.classList.add('hljs');
    element.classList.add(language);
    window.hljs.highlightElement(element);
  }
}
