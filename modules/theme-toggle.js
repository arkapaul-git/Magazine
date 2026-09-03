/* ═══════════════════════════════════════════════════════════════
   theme-toggle.js — Light/Dark Theme Switcher
   Toggles data-theme attribute and persists to localStorage.
   ═══════════════════════════════════════════════════════════════ */

import { $ } from '../utils/dom-helpers.js';

export function initThemeToggle() {
  const toggleBtn = $('#themeToggleBtn');
  if (!toggleBtn) return;

  // Read saved or system preference
  function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const sunIcon = $('#themeIconSun');
    const moonIcon = $('#themeIconMoon');
    if (sunIcon && moonIcon) {
      sunIcon.style.opacity = theme === 'light' ? '1' : '0';
      moonIcon.style.opacity = theme === 'dark' ? '1' : '0';
    } else {
      toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // Initialize
  const currentTheme = getPreferredTheme();
  setTheme(currentTheme);

  // Toggle on click
  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
  });
}
