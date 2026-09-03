/* ═══════════════════════════════════════════════════════════════
   scroll-reveal.js — IntersectionObserver Fade-In
   Adds .revealed class to .reveal elements when they
   enter the viewport.
   ═══════════════════════════════════════════════════════════════ */

import { $$ } from '../utils/dom-helpers.js';

export function initScrollReveal() {
  const elements = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (elements.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}
