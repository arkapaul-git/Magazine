/* ═══════════════════════════════════════════════════════════════
   wizard.js — Multi-Step Wizard Navigation
   Step indicator, panel switching, and button name preview.
   ═══════════════════════════════════════════════════════════════ */

import { $, $$, toggleClass } from '../utils/dom-helpers.js';

export function initWizard() {
  const wizard = $('.wizard');
  if (!wizard) return;

  const panels = $$('.wizard-panel', wizard);
  const circles = $$('.wizard-step-circle', wizard);
  const lines = $$('.wizard-step-line', wizard);
  const nextBtns = $$('[data-wizard-next]', wizard);
  const prevBtns = $$('[data-wizard-prev]', wizard);

  let currentStep = 0;

  function goToStep(step) {
    if (step < 0 || step >= panels.length) return;

    // Update panels
    panels.forEach((panel, i) => {
      toggleClass(panel, 'active', i === step);
    });

    // Update step circles
    circles.forEach((circle, i) => {
      circle.classList.remove('active', 'completed');
      if (i < step) circle.classList.add('completed');
      else if (i === step) circle.classList.add('active');
    });

    // Update connector lines
    lines.forEach((line, i) => {
      toggleClass(line, 'completed', i < step);
    });

    currentStep = step;
  }

  // Next/prev buttons
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => goToStep(currentStep + 1));
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => goToStep(currentStep - 1));
  });

  // Button name live preview
  const buttonNameInput = $('input[name="button_name"]', wizard);
  const previewEl = $('.button-name-preview-item', wizard);

  if (buttonNameInput && previewEl) {
    buttonNameInput.addEventListener('input', () => {
      const value = buttonNameInput.value.trim();
      previewEl.textContent = value || 'Your Button Name';
    });
  }

  // Connection type selection
  const choices = $$('.connection-choice', wizard);
  choices.forEach(choice => {
    choice.addEventListener('click', () => {
      choices.forEach(c => c.classList.remove('selected'));
      choice.classList.add('selected');
    });
  });

  // Initialize first step
  goToStep(0);
}
