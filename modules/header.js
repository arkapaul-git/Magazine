/* ═══════════════════════════════════════════════════════════════
   header.js — Sticky Header Scroll Detection
   Adds/removes .scrolled class on the main header.
   ═══════════════════════════════════════════════════════════════ */

import { $ } from '../utils/dom-helpers.js';

export function initHeader() {
  const header = $('.main-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 50;

  function updateHeader() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  // Initial check
  updateHeader();

  // Throttled scroll listener
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
