// Minimal jQuery shim for backwards compatibility
// This provides basic jQuery functionality for legacy code
import 'devbridge-autocomplete';

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

  // Handle $(window) specifically
  if (selector === window) {
    return {
      on: (event, handler) => window.addEventListener(event, handler),
      off: (event, handler) => window.removeEventListener(event, handler),
      trigger: (event, data) => window.dispatchEvent(new CustomEvent(event, { detail: data }))
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
      click: (handler) => {
        if (handler) {
          element.addEventListener('click', handler);
          return this;
        } else {
          element.click();
          return this;
        }
      },
      addClass: (className) => {
        element.classList.add(className);
        return this;
      },
      removeClass: (className) => {
        element.classList.remove(className);
        return this;
      },
      toggleClass: (className) => {
        element.classList.toggle(className);
        return this;
      },
      append: (content) => {
        if (typeof content === 'string') {
          element.insertAdjacentHTML('beforeend', content);
        } else {
          element.appendChild(content);
        }
        return this;
      },
      autocomplete: function(options) {
        // Use devbridge-autocomplete functionality directly
        try {
          // Create a minimal jQuery-like wrapper for devbridge-autocomplete
          const jqElement = {
            0: element,
            length: 1,
            addClass: (className) => { element.classList.add(className); return jqElement; },
            removeClass: (className) => { element.classList.remove(className); return jqElement; },
            attr: (name, value) => value !== undefined ? element.setAttribute(name, value) : element.getAttribute(name),
            val: (value) => {
              if (value !== undefined) {
                element.value = value;
                return jqElement;
              }
              return element.value;
            },
            focus: () => { element.focus(); return jqElement; },
            on: (event, handler) => { element.addEventListener(event, handler); return jqElement; },
            off: (event, handler) => { element.removeEventListener(event, handler); return jqElement; },
            trigger: (event, data) => { element.dispatchEvent(new CustomEvent(event, { detail: data })); return jqElement; }
          };
          
          // Use the imported devbridge-autocomplete functionality
          if (window.DevbridgeAutocomplete) {
            new window.DevbridgeAutocomplete(jqElement, options);
            return this;
          } else if (window.jQuery && window.jQuery.fn.autocomplete) {
            return window.jQuery(element).autocomplete(options);
          }
        } catch (e) {
          console.warn('Failed to initialize autocomplete:', e);
        }
        
        // Enhanced fallback: implement basic dropdown functionality
        if (options && options.lookup) {
          $._setupBasicAutocomplete(element, options);
        }
        return this;
      }
    };
  }

  if (typeof selector === 'string') {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return null;
    if (elements.length === 1) {
      const element = elements[0];
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
        click: (handler) => {
          if (handler) {
            element.addEventListener('click', handler);
            return this;
          } else {
            element.click();
            return this;
          }
        },
        addClass: (className) => {
          element.classList.add(className);
          return this;
        },
        removeClass: (className) => {
          element.classList.remove(className);
          return this;
        },
        toggleClass: (className) => {
          element.classList.toggle(className);
          return this;
        },
        append: (content) => {
          if (typeof content === 'string') {
            element.insertAdjacentHTML('beforeend', content);
          } else {
            element.appendChild(content);
          }
          return this;
        },
        autocomplete: function(options) {
          // Use devbridge-autocomplete functionality directly
          try {
            // Create a minimal jQuery-like wrapper for devbridge-autocomplete
            const jqElement = {
              0: element,
              length: 1,
              addClass: (className) => { element.classList.add(className); return jqElement; },
              removeClass: (className) => { element.classList.remove(className); return jqElement; },
              attr: (name, value) => value !== undefined ? element.setAttribute(name, value) : element.getAttribute(name),
              val: (value) => {
                if (value !== undefined) {
                  element.value = value;
                  return jqElement;
                }
                return element.value;
              },
              focus: () => { element.focus(); return jqElement; },
              on: (event, handler) => { element.addEventListener(event, handler); return jqElement; },
              off: (event, handler) => { element.removeEventListener(event, handler); return jqElement; },
              trigger: (event, data) => { element.dispatchEvent(new CustomEvent(event, { detail: data })); return jqElement; }
            };
            
            // Use the imported devbridge-autocomplete functionality
            if (window.DevbridgeAutocomplete) {
              new window.DevbridgeAutocomplete(jqElement, options);
              return this;
            } else if (window.jQuery && window.jQuery.fn.autocomplete) {
              return window.jQuery(element).autocomplete(options);
            }
          } catch (e) {
            console.warn('Failed to initialize autocomplete:', e);
          }
          
          // Enhanced fallback: implement basic dropdown functionality
          if (options && options.lookup) {
            return $._setupBasicAutocomplete(element, options);
          }
          return this;
        }
      };
    } else {
      // Multiple elements - return methods that operate on all
      return {
        removeClass: (className) => {
          elements.forEach(el => el.classList.remove(className));
          return this;
        },
        addClass: (className) => {
          elements.forEach(el => el.classList.add(className));
          return this;
        },
        toggleClass: (className) => {
          elements.forEach(el => el.classList.toggle(className));
          return this;
        },
        hide: () => {
          elements.forEach(el => el.style.display = 'none');
          return this;
        },
        show: () => {
          elements.forEach(el => el.style.display = '');
          return this;
        },
        click: (handler) => {
          if (handler) {
            elements.forEach(el => el.addEventListener('click', handler));
            return this;
          } else {
            elements.forEach(el => el.click());
            return this;
          }
        },
        on: (event, handler) => {
          elements.forEach(el => el.addEventListener(event, handler));
          return this;
        }
      };
    }
  }

  return null;
};

// Static methods
$.extend = Object.assign;
$.map = (array, callback) => array.map(callback);

// Shared autocomplete setup method
$._setupBasicAutocomplete = function(element, options) {
  let dropdownContainer = null;
  
  const createDropdown = () => {
    dropdownContainer = document.createElement('div');
    dropdownContainer.style.cssText = `
      position: absolute;
      background: #1a1a1a;
      border: 1px solid #555;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(dropdownContainer);
  };
  
  const showSuggestions = (suggestions) => {
    if (!dropdownContainer) createDropdown();
    
    dropdownContainer.innerHTML = '';
    
    if (suggestions.length === 0) {
      if (options.showNoSuggestionNotice && options.noSuggestionNotice) {
        const noResultDiv = document.createElement('div');
        noResultDiv.textContent = options.noSuggestionNotice;
        noResultDiv.style.cssText = 'padding: 8px; color: #999; font-style: italic;';
        dropdownContainer.appendChild(noResultDiv);
      }
    } else {
      suggestions.slice(0, options.lookupLimit || 10).forEach((suggestion, index) => {
        const suggestionDiv = document.createElement('div');
        
        if (options.formatResult) {
          const formatted = options.formatResult(suggestion, element.value);
          suggestionDiv.innerHTML = formatted.value || suggestion.value;
        } else {
          suggestionDiv.textContent = suggestion.value;
        }
        
        suggestionDiv.style.cssText = `
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #333;
          color: #fff;
        `;
        
        if (index === 0 && options.autoSelectFirst) {
          suggestionDiv.style.backgroundColor = '#444';
          suggestionDiv.classList.add('selected');
        }
        
        suggestionDiv.addEventListener('mouseenter', () => {
          dropdownContainer.querySelectorAll('div').forEach(d => {
            d.style.backgroundColor = '';
            d.classList.remove('selected');
          });
          suggestionDiv.style.backgroundColor = '#444';
          suggestionDiv.classList.add('selected');
        });
        
        suggestionDiv.addEventListener('click', () => {
          if (options.onSelect) {
            options.onSelect(suggestion);
          }
          dropdownContainer.style.display = 'none';
        });
        
        dropdownContainer.appendChild(suggestionDiv);
      });
    }
    
    // Position dropdown
    const rect = element.getBoundingClientRect();
    dropdownContainer.style.left = rect.left + 'px';
    dropdownContainer.style.top = (rect.bottom + 2) + 'px';
    dropdownContainer.style.minWidth = rect.width + 'px';
    dropdownContainer.style.display = 'block';
  };
  
  const hideDropdown = () => {
    if (dropdownContainer) {
      dropdownContainer.style.display = 'none';
    }
  };
  
  element.addEventListener('input', (e) => {
    const value = e.target.value.toLowerCase();
    if (value.length === 0) {
      hideDropdown();
      return;
    }
    
    const filtered = options.lookup.filter(item => 
      item.value.toLowerCase().includes(value)
    );
    
    showSuggestions(filtered);
  });
  
  element.addEventListener('keydown', (e) => {
    if (!dropdownContainer || dropdownContainer.style.display === 'none') return;
    
    const selected = dropdownContainer.querySelector('.selected');
    const suggestions = dropdownContainer.querySelectorAll('div');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = selected ? Array.from(suggestions).indexOf(selected) + 1 : 0;
      if (nextIndex < suggestions.length) {
        if (selected) {
          selected.classList.remove('selected');
          selected.style.backgroundColor = '';
        }
        suggestions[nextIndex].classList.add('selected');
        suggestions[nextIndex].style.backgroundColor = '#444';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = selected ? Array.from(suggestions).indexOf(selected) - 1 : suggestions.length - 1;
      if (prevIndex >= 0) {
        if (selected) {
          selected.classList.remove('selected');
          selected.style.backgroundColor = '';
        }
        suggestions[prevIndex].classList.add('selected');
        suggestions[prevIndex].style.backgroundColor = '#444';
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected) {
        selected.click();
      }
    } else if (e.key === 'Escape') {
      hideDropdown();
    }
  });
  
  element.addEventListener('blur', () => {
    // Delay hiding to allow click events on suggestions
    setTimeout(hideDropdown, 150);
  });
  
  return $;
};

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