/* ═══════════════════════════════════════════════════════════════
   smooth-scroll.js — Smooth Scroll for Anchor Links
   ═══════════════════════════════════════════════════════════════ */

import { $$ } from '../utils/dom-helpers.js';

export function initSmoothScroll() {
  const links = $$('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}
