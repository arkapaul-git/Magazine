/* ═══════════════════════════════════════════════════════════════
   sidebar.js — Dashboard Sidebar Toggle & Active State
   Handles collapse/expand on mobile and active link highlighting.
   ═══════════════════════════════════════════════════════════════ */

import { $, $$, toggleClass } from '../utils/dom-helpers.js';

export function initSidebar() {
  const sidebar = $('.sidebar');
  const sidebarToggle = $('.sidebar-toggle');
  const overlay = $('.sidebar-overlay');

  if (!sidebar) return;

  // Toggle sidebar on mobile
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      toggleClass(sidebar, 'open');
      if (overlay) toggleClass(overlay, 'active');
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Close sidebar on overlay click
  if (overlay) {
    overlay.addEventListener('click', () => {
      toggleClass(sidebar, 'open', false);
      toggleClass(overlay, 'active', false);
      document.body.style.overflow = '';
    });
  }

  // Active link highlighting
  const navItems = $$('.nav-item, .nav-child-site', sidebar);
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Close sidebar on mobile after click
      if (window.innerWidth <= 1024) {
        toggleClass(sidebar, 'open', false);
        if (overlay) toggleClass(overlay, 'active', false);
        document.body.style.overflow = '';
      }
    });
  });
}
