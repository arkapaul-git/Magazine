/* ═══════════════════════════════════════════════════════════════
   security.js — Client-Side Security Utilities
   XSS prevention, input sanitization, CSRF token handling,
   and Content Security Policy violation reporting.
   ═══════════════════════════════════════════════════════════════ */

/**
 * Sanitize HTML to prevent XSS attacks.
 * Escapes dangerous characters: < > " ' & ` /
 * @param {string} str - Raw string to sanitize
 * @returns {string} Safe string
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'`/]/g, (char) => map[char]);
}

/**
 * Sanitize user input for use in DOM text content.
 * Strips all HTML tags entirely.
 * @param {string} str - Raw input
 * @returns {string} Clean text
 */
export function stripTags(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Validate and sanitize a URL.
 * Only allows http:, https:, and relative paths.
 * Blocks javascript:, data:, vbscript:, etc.
 * @param {string} url - URL to validate
 * @returns {string|null} Safe URL or null if invalid
 */
export function sanitizeURL(url) {
  if (typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerous = /^(javascript|data|vbscript|file):/i;
  if (dangerous.test(trimmed)) return null;

  // Allow relative URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  // Validate absolute URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a CSRF token (client-side, for demo purposes).
 * In production, this should come from the server.
 * @returns {string} Random token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store and retrieve CSRF token from sessionStorage.
 */
export const csrfToken = {
  _key: '_csrf_token',

  get() {
    let token = sessionStorage.getItem(this._key);
    if (!token) {
      token = generateCSRFToken();
      sessionStorage.setItem(this._key, token);
    }
    return token;
  },

  refresh() {
    const token = generateCSRFToken();
    sessionStorage.setItem(this._key, token);
    return token;
  },

  /** Inject hidden CSRF input into all forms on the page */
  injectIntoForms() {
    const token = this.get();
    document.querySelectorAll('form').forEach((form) => {
      if (!form.querySelector('input[name="_csrf"]')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_csrf';
        input.value = token;
        form.appendChild(input);
      }
    });
  },
};

/**
 * Rate limiter for client-side actions (e.g., form submissions).
 * Prevents rapid-fire clicks / submissions.
 */
export class RateLimiter {
  /**
   * @param {number} maxAttempts - Maximum attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   */
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = [];
  }

  /**
   * Check if an action is allowed.
   * @returns {boolean} True if within limits
   */
  isAllowed() {
    const now = Date.now();
    this.attempts = this.attempts.filter((t) => now - t < this.windowMs);

    if (this.attempts.length >= this.maxAttempts) {
      return false;
    }

    this.attempts.push(now);
    return true;
  }

  /** Get remaining attempts. */
  remaining() {
    const now = Date.now();
    this.attempts = this.attempts.filter((t) => now - t < this.windowMs);
    return Math.max(0, this.maxAttempts - this.attempts.length);
  }

  /** Get seconds until the oldest attempt expires. */
  retryAfter() {
    if (this.attempts.length === 0) return 0;
    const oldest = Math.min(...this.attempts);
    return Math.max(0, Math.ceil((this.windowMs - (Date.now() - oldest)) / 1000));
  }
}

/**
 * Listen for Content Security Policy violations and log them.
 * In production, send these reports to a monitoring service.
 */
export function initCSPReporting() {
  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('[CSP Violation]', {
      directive: event.violatedDirective,
      blockedURI: event.blockedURI,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
    });
  });
}

/**
 * Prevent open redirect attacks.
 * Only allows redirects to same-origin URLs or whitelisted domains.
 * @param {string} url - Target URL
 * @param {string[]} [allowedDomains=[]] - Whitelisted external domains
 * @returns {string} Safe redirect URL (falls back to '/')
 */
export function safeRedirect(url, allowedDomains = []) {
  if (!url || typeof url !== 'string') return '/';

  // Allow relative URLs
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  try {
    const parsed = new URL(url, window.location.origin);

    // Same origin is always safe
    if (parsed.origin === window.location.origin) {
      return parsed.pathname + parsed.search + parsed.hash;
    }

    // Check whitelist
    if (allowedDomains.includes(parsed.hostname)) {
      return url;
    }
  } catch {
    // Invalid URL
  }

  return '/';
}

/**
 * Initialize all client-side security measures.
 */
export function initSecurity() {
  // Inject CSRF tokens into forms
  csrfToken.injectIntoForms();

  // Start CSP violation monitoring
  initCSPReporting();

  // Prevent clickjacking (JS fallback for older browsers)
  if (window.self !== window.top) {
    document.body.style.display = 'none';
    window.top.location = window.self.location;
  }

  console.log('✦ Security layer initialized');
}
