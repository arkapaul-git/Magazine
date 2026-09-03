/* ═══════════════════════════════════════════════════════════════
   dom-helpers.js — Shared DOM Utility Functions
   Shortcuts for querySelector, class manipulation, event binding.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Select a single element.
 * @param {string} selector - CSS selector
 * @param {Element} [parent=document] - Parent to search within
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Select all matching elements as an Array.
 * @param {string} selector - CSS selector
 * @param {Element} [parent=document] - Parent to search within
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Run callback when DOM is ready.
 * @param {Function} fn
 */
export function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/**
 * Add event listener with optional delegation.
 * @param {Element} el - Element to listen on
 * @param {string} event - Event name
 * @param {string|Function} selectorOrHandler - CSS selector for delegation, or handler
 * @param {Function} [handler] - Handler function (if delegating)
 */
export function on(el, event, selectorOrHandler, handler) {
  if (typeof selectorOrHandler === 'function') {
    el.addEventListener(event, selectorOrHandler);
  } else {
    el.addEventListener(event, (e) => {
      const target = e.target.closest(selectorOrHandler);
      if (target && el.contains(target)) {
        handler.call(target, e);
      }
    });
  }
}

/**
 * Toggle a class on an element.
 * @param {Element} el
 * @param {string} className
 * @param {boolean} [force]
 */
export function toggleClass(el, className, force) {
  if (el) {
    el.classList.toggle(className, force);
  }
}

/**
 * Create an element with optional attributes and children.
 * @param {string} tag
 * @param {Object} [attrs]
 * @param  {...(string|Element)} children
 * @returns {Element}
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'className') el.className = val;
    else if (key === 'innerHTML') el.innerHTML = val;
    else el.setAttribute(key, val);
  });
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  });
  return el;
}
