// Minimal jQuery shim for backwards compatibility
// This provides basic jQuery functionality for legacy code

const $ = (selector) => {
  if (typeof selector === 'function') {
    // Handle $(document).ready()
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', selector);
    } else {
      selector();
    }
    return;
  }

  if (typeof selector === 'string') {
    const element = document.querySelector(selector);
    if (!element) return null;

    return {
      // Basic DOM manipulation
      on: (event, handler) => element.addEventListener(event, handler),
      off: (event, handler) => element.removeEventListener(event, handler),
      trigger: (event, data) => element.dispatchEvent(new CustomEvent(event, { detail: data })),
      val: () => element.value,
      text: () => element.textContent,
      html: () => element.innerHTML,
      attr: (name, value) => value !== undefined ? element.setAttribute(name, value) : element.getAttribute(name),
      css: (property, value) => {
        if (value !== undefined) {
          element.style[property] = value;
          return this;
        }
        return getComputedStyle(element)[property];
      },
      hide: () => { element.style.display = 'none'; return this; },
      show: () => { element.style.display = ''; return this; },
      focus: () => { element.focus(); return this; }
    };
  }

  return null;
};

// Static methods
$.extend = Object.assign;
$.map = (array, callback) => array.map(callback);

// Ajax stub (for compatibility)
$.get = (url, data, dataType) => {
  return fetch(url)
    .then(response => {
      if (dataType === 'json') {
        return response.json();
      }
      return response.text();
    });
};

$.ajax = (options) => {
  return fetch(options.url)
    .then(response => response.text());
};

export default $;