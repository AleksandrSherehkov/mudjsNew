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
 * Query selector replacement for $()
 */
export function $(selector) {
  if (typeof selector === 'string') {
    return document.querySelector(selector);
  } else if (selector instanceof Element) {
    return selector;
  } else if (typeof selector === 'function') {
    // Handle $(function() {}) pattern
    onDocumentReady(selector);
    return null;
  }
  return null;
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
  return parentElement ? Array.from(parentElement.querySelectorAll(selector)) : [];
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