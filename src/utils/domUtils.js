// Utility functions to replace common jQuery patterns with native DOM APIs

/**
 * Document ready replacement for $(document).ready()
 */
export function onDocumentReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Query selector replacement for $() that returns a jQuery-like object
 */
export function $(selector) {
  if (typeof selector === 'function') {
    // Handle $(function() {}) pattern
    onDocumentReady(selector);
    return null;
  }
  
  const elements = typeof selector === 'string' 
    ? document.querySelectorAll(selector)
    : (selector instanceof Element ? [selector] : []);
  
  // Return a jQuery-like object with chainable methods
  return {
    elements: Array.from(elements),
    
    on(event, handler) {
      this.elements.forEach(el => {
        el.addEventListener(event, handler);
      });
      return this;
    },
    
    off(event, handler) {
      this.elements.forEach(el => {
        el.removeEventListener(event, handler);
      });
      return this;
    },
    
    trigger(eventName, detail) {
      this.elements.forEach(el => {
        const event = new CustomEvent(eventName, { detail, bubbles: true });
        el.dispatchEvent(event);
      });
      return this;
    },
    
    val(value) {
      if (value === undefined) {
        return this.elements[0] ? this.elements[0].value : undefined;
      } else {
        this.elements.forEach(el => {
          el.value = value;
        });
        return this;
      }
    },
    
    addClass(className) {
      this.elements.forEach(el => {
        el.classList.add(className);
      });
      return this;
    },
    
    removeClass(className) {
      this.elements.forEach(el => {
        el.classList.remove(className);
      });
      return this;
    },
    
    attr(name, value) {
      if (value === undefined) {
        return this.elements[0] ? this.elements[0].getAttribute(name) : undefined;
      } else {
        this.elements.forEach(el => {
          el.setAttribute(name, value);
        });
        return this;
      }
    },
    
    html(content) {
      if (content === undefined) {
        return this.elements[0] ? this.elements[0].innerHTML : undefined;
      } else {
        this.elements.forEach(el => {
          el.innerHTML = content;
        });
        return this;
      }
    },
    
    text(content) {
      if (content === undefined) {
        return this.elements[0] ? this.elements[0].textContent : undefined;
      } else {
        this.elements.forEach(el => {
          el.textContent = content;
        });
        return this;
      }
    },
    
    css(property, value) {
      if (typeof property === 'object') {
        this.elements.forEach(el => {
          Object.keys(property).forEach(key => {
            el.style[key] = property[key];
          });
        });
      } else if (value === undefined) {
        return this.elements[0] ? getComputedStyle(this.elements[0])[property] : undefined;
      } else {
        this.elements.forEach(el => {
          el.style[property] = value;
        });
      }
      return this;
    },
    
    show() {
      this.elements.forEach(el => {
        el.style.display = '';
      });
      return this;
    },
    
    hide() {
      this.elements.forEach(el => {
        el.style.display = 'none';
      });
      return this;
    },
    
    focus() {
      if (this.elements[0] && typeof this.elements[0].focus === 'function') {
        this.elements[0].focus();
      }
      return this;
    },
    
    get length() {
      return this.elements.length;
    },
    
    get(index) {
      return this.elements[index];
    },
    
    first() {
      return this.elements[0];
    },
    
    each(callback) {
      this.elements.forEach((element, index) => {
        callback.call(element, index, element);
      });
      return this;
    }
  };
}

/**
 * Query selector all replacement for $()
 */
export function $$(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Event delegation helper to replace $('body').on(event, selector, handler)
 */
export function onDelegate(container, event, selector, handler) {
  const containerElement = typeof container === 'string' ? document.querySelector(container) : container;
  
  containerElement.addEventListener(event, function(e) {
    if (e.target.matches(selector) || e.target.closest(selector)) {
      const target = e.target.closest(selector) || e.target;
      handler.call(target, e);
    }
  });
}

/**
 * Simple event triggering replacement for $(element).trigger()
 */
export function trigger(element, eventName, detail) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    const event = new CustomEvent(eventName, { detail, bubbles: true });
    targetElement.dispatchEvent(event);
  }
}

/**
 * Add event listener replacement for $(element).on()
 */
export function on(element, event, handler) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    targetElement.addEventListener(event, handler);
  }
}

/**
 * Remove event listener replacement for $(element).off()
 */
export function off(element, event, handler) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    targetElement.removeEventListener(event, handler);
  }
}

/**
 * Get/set attribute helper
 */
export function attr(element, name, value) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (!targetElement) return null;
  
  if (value === undefined) {
    return targetElement.getAttribute(name);
  } else {
    targetElement.setAttribute(name, value);
    return targetElement;
  }
}

/**
 * Get/set value helper
 */
export function val(element, value) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (!targetElement) return null;
  
  if (value === undefined) {
    return targetElement.value;
  } else {
    targetElement.value = value;
    return targetElement;
  }
}

/**
 * Add/remove class helpers
 */
export function addClass(element, className) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    targetElement.classList.add(className);
  }
  return targetElement;
}

export function removeClass(element, className) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    targetElement.classList.remove(className);
  }
  return targetElement;
}

/**
 * Show/hide helpers
 */
export function show(element) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    targetElement.style.display = '';
  }
  return targetElement;
}

export function hide(element) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    targetElement.style.display = 'none';
  }
  return targetElement;
}

/**
 * Create element helper to replace $('<div/>')
 */
export function createElement(tag, props = {}) {
  const element = document.createElement(tag);
  
  Object.keys(props).forEach(key => {
    if (key === 'class' || key === 'className') {
      element.className = props[key];
    } else if (key === 'text') {
      element.textContent = props[key];
    } else if (key === 'html') {
      element.innerHTML = props[key];
    } else {
      element.setAttribute(key, props[key]);
    }
  });
  
  return element;
}

/**
 * Append helper
 */
export function append(parent, child) {
  const parentElement = typeof parent === 'string' ? document.querySelector(parent) : parent;
  if (parentElement) {
    if (typeof child === 'string') {
      parentElement.insertAdjacentHTML('beforeend', child);
    } else {
      parentElement.appendChild(child);
    }
  }
  return parentElement;
}

/**
 * Find elements within a parent and call function for each
 */
export function find(parent, selector) {
  const parentElement = typeof parent === 'string' ? document.querySelector(parent) : parent;
  return (parentElement && parentElement.querySelectorAll) ? Array.from(parentElement.querySelectorAll(selector)) : [];
}

/**
 * Each helper to iterate over elements
 */
export function each(elements, callback) {
  if (elements && elements.length !== undefined) {
    Array.from(elements).forEach((element, index) => {
      callback.call(element, index, element);
    });
  }
}

/**
 * Get/set HTML content
 */
export function html(element, content) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (!targetElement) return null;
  
  if (content === undefined) {
    return targetElement.innerHTML;
  } else {
    targetElement.innerHTML = content;
    return targetElement;
  }
}

/**
 * Get text content
 */
export function text(element) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  return targetElement ? targetElement.textContent : '';
}

/**
 * Replace with helper to replace $(element).replaceWith()
 */
export function replaceWith(element, newContent) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement) {
    if (typeof newContent === 'function') {
      // Handle function callback like jQuery
      const result = newContent.call(targetElement);
      if (result instanceof Element) {
        targetElement.parentNode.replaceChild(result, targetElement);
      } else if (typeof result === 'string') {
        targetElement.outerHTML = result;
      }
    } else if (typeof newContent === 'string') {
      targetElement.outerHTML = newContent;
    } else if (newContent instanceof Element) {
      targetElement.parentNode.replaceChild(newContent, targetElement);
    }
  }
}

/**
 * Get contents helper to replace $(element).contents()
 */
export function contents(element) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  return targetElement ? Array.from(targetElement.childNodes) : [];
}

/**
 * Focus helper
 */
export function focus(element) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (targetElement && typeof targetElement.focus === 'function') {
    targetElement.focus();
  }
  return targetElement;
}

/**
 * CSS helper
 */
export function css(element, property, value) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (!targetElement) return null;
  
  if (typeof property === 'object') {
    // Set multiple properties
    Object.keys(property).forEach(key => {
      targetElement.style[key] = property[key];
    });
  } else if (value === undefined) {
    // Get property
    return getComputedStyle(targetElement)[property];
  } else {
    // Set single property
    targetElement.style[property] = value;
  }
  return targetElement;
}

/**
 * Check if element matches selector (for :focus etc)
 */
export function is(element, selector) {
  const targetElement = typeof element === 'string' ? document.querySelector(element) : element;
  if (!targetElement) return false;
  
  if (selector === ':focus') {
    return document.activeElement === targetElement;
  }
  
  return targetElement.matches(selector);
}