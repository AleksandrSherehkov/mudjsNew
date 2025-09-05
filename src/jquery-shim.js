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

  // Handle $(document) specifically
  if (selector === document) {
    return {
      ready: (callback) => {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', callback);
        } else {
          callback();
        }
      },
      on: (event, handler) => document.addEventListener(event, handler),
      off: (event, handler) => document.removeEventListener(event, handler),
      trigger: (event, data) => document.dispatchEvent(new CustomEvent(event, { detail: data }))
    };
  }

  // Handle DOM elements directly
  if (selector && selector.nodeType) {
    const element = selector;

    return {
      // Basic DOM manipulation with event delegation support
      on: (event, selectorOrHandler, handler) => {
        if (typeof selectorOrHandler === 'function') {
          // Simple event binding: .on('click', handler)
          element.addEventListener(event, selectorOrHandler);
        } else {
          // Event delegation: .on('click', '.selector', handler)
          const delegatedHandler = (e) => {
            if (e.target.matches(selectorOrHandler) || e.target.closest(selectorOrHandler)) {
              handler.call(e.target.closest(selectorOrHandler) || e.target, e);
            }
          };
          element.addEventListener(event, delegatedHandler);
        }
      },
      off: (event, handler) => element.removeEventListener(event, handler),
      trigger: (event, data) => element.dispatchEvent(new CustomEvent(event, { detail: data })),
      val: (value) => {
        if (value !== undefined) {
          element.value = value;
          return this;
        }
        return element.value;
      },
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
      focus: () => { element.focus(); return this; },
      data: (key, value) => {
        if (value !== undefined) {
          element.setAttribute('data-' + key, value);
          return this;
        }
        return element.getAttribute('data-' + key);
      },
      closest: (selector) => {
        const closest = element.closest(selector);
        return closest ? $(closest) : null;
      },
      remove: () => { element.remove(); return this; },
      autocomplete: function(options) {
        // Delegate to devbridge-autocomplete if available
        if (window.jQuery && window.jQuery.fn.autocomplete) {
          return window.jQuery(element).autocomplete(options);
        }
        // Fallback: basic autocomplete functionality
        console.warn('devbridge-autocomplete not available, using fallback');
        return this;
      }
    };
  }

  if (typeof selector === 'string') {
    const element = document.querySelector(selector);
    if (!element) return null;

    return {
      // Basic DOM manipulation with event delegation support
      on: (event, selectorOrHandler, handler) => {
        if (typeof selectorOrHandler === 'function') {
          // Simple event binding: .on('click', handler)
          element.addEventListener(event, selectorOrHandler);
        } else {
          // Event delegation: .on('click', '.selector', handler)
          const delegatedHandler = (e) => {
            if (e.target.matches(selectorOrHandler) || e.target.closest(selectorOrHandler)) {
              handler.call(e.target.closest(selectorOrHandler) || e.target, e);
            }
          };
          element.addEventListener(event, delegatedHandler);
        }
      },
      off: (event, handler) => element.removeEventListener(event, handler),
      trigger: (event, data) => element.dispatchEvent(new CustomEvent(event, { detail: data })),
      val: (value) => {
        if (value !== undefined) {
          element.value = value;
          return this;
        }
        return element.value;
      },
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
      focus: () => { element.focus(); return this; },
      data: (key, value) => {
        if (value !== undefined) {
          element.setAttribute('data-' + key, value);
          return this;
        }
        return element.getAttribute('data-' + key);
      },
      closest: (selector) => {
        const closest = element.closest(selector);
        return closest ? $(closest) : null;
      },
      remove: () => { element.remove(); return this; },
      autocomplete: function(options) {
        // Delegate to devbridge-autocomplete if available
        if (window.jQuery && window.jQuery.fn.autocomplete) {
          return window.jQuery(element).autocomplete(options);
        }
        // Fallback: basic autocomplete functionality
        console.warn('devbridge-autocomplete not available, using fallback');
        return this;
      }
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