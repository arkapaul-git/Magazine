/* ═══════════════════════════════════════════════════════════════
   mobile-menu.js — Mobile Hamburger Menu Toggle
   Opens/closes the mobile navigation drawer.
   ═══════════════════════════════════════════════════════════════ */

import { $, toggleClass } from '../utils/dom-helpers.js';

export function initMobileMenu() {
  const toggle = $('.mobile-menu-toggle');
  const menu = $('.mobile-menu');
  const overlay = $('.mobile-menu-overlay');
  const close = $('.mobile-menu-close');

  if (!toggle || !menu) return;

  function openMenu() {
    toggleClass(menu, 'open', true);
    if (overlay) toggleClass(overlay, 'active', true);
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleClass(menu, 'open', false);
    if (overlay) toggleClass(overlay, 'active', false);
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close on nav link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}
