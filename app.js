/* ═══════════════════════════════════════════════════════════════
   app.js — Application Entry Point
   Detects current page and initializes relevant modules.
   ═══════════════════════════════════════════════════════════════ */

import { onReady } from './utils/dom-helpers.js';
import { initHeader } from './modules/header.js';
import { initSlideshow } from './modules/slideshow.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initScrollReveal } from './modules/scroll-reveal.js';
import { initFormValidation } from './modules/form-validation.js';
import { initSidebar } from './modules/sidebar.js';
import { initWizard } from './modules/wizard.js';
import { initThemeToggle } from './modules/theme-toggle.js';
import { initSecurity } from './utils/security.js';

onReady(() => {
  // ── Security layer (must run first) ──
  initSecurity();

  // ── Global modules (run on every page) ──
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initThemeToggle();

  // ── Page-specific modules ──
  // These check for the presence of their target elements
  // before initializing, so it's safe to call them all.
  initSlideshow();
  initFormValidation();
  initSidebar();
  initWizard();

  console.log('✦ Magazine Platform initialized');
});
