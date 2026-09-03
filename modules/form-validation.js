/* ═══════════════════════════════════════════════════════════════
   form-validation.js — Client-Side Form Validation
   Real-time validation for sign-up and sign-in forms.
   ═══════════════════════════════════════════════════════════════ */

import { $, $$ } from '../utils/dom-helpers.js';
import { sanitizeHTML, stripTags, RateLimiter } from '../utils/security.js';
import { signup, signin } from './api.js';

const validators = {
  required: (value) => value.trim() !== '' ? null : 'This field is required',

  email: (value) => {
    if (!value.trim()) return 'Email is required';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : 'Please enter a valid email';
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  },

  confirmPassword: (value, form) => {
    const password = $('input[name="password"]', form)?.value;
    if (!value) return 'Please confirm your password';
    return value === password ? null : 'Passwords do not match';
  },

  name: (value) => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  },

  buttonName: (value) => {
    if (!value.trim()) return 'Button name is required';
    if (value.trim().length > 24) return 'Button name must be 24 characters or less';
    return null;
  },

  url: (value) => {
    if (!value.trim()) return null; // Optional
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
};

function showError(input, message) {
  input.classList.add('is-error');
  input.classList.remove('is-valid');
  const errorEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errorEl) errorEl.textContent = message;
}

function showValid(input) {
  input.classList.remove('is-error');
  input.classList.add('is-valid');
  const errorEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errorEl) errorEl.textContent = '';
}

function clearState(input) {
  input.classList.remove('is-error', 'is-valid');
  const errorEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errorEl) errorEl.textContent = '';
}

function validateField(input, form) {
  const rules = (input.dataset.validate || '').split(',').map(r => r.trim()).filter(Boolean);
  for (const rule of rules) {
    const validator = validators[rule];
    if (!validator) continue;
    const error = validator(input.value, form);
    if (error) {
      showError(input, error);
      return false;
    }
  }
  if (input.value.trim()) showValid(input);
  else clearState(input);
  return true;
}

export function initFormValidation() {
  const forms = $$('form[data-validate]');

  // Rate limiter: max 5 form submissions per minute
  const submitLimiter = new RateLimiter(5, 60000);

  forms.forEach(form => {
    const inputs = $$('input[data-validate], textarea[data-validate], select[data-validate]', form);

    // Real-time validation on blur
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input, form));
      input.addEventListener('input', () => {
        if (input.classList.contains('is-error')) {
          validateField(input, form);
        }
      });
    });

    // Sanitize inputs on paste (strip HTML tags)
    inputs.forEach(input => {
      input.addEventListener('paste', (e) => {
        setTimeout(() => {
          if (input.type !== 'password') {
            input.value = stripTags(input.value);
          }
        }, 0);
      });
    });

    // Validate all on submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Rate limit check
      if (!submitLimiter.isAllowed()) {
        const retryIn = submitLimiter.retryAfter();
        const submitBtn = $('button[type="submit"]', form);
        if (submitBtn) {
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = `⏳ Too many attempts. Wait ${retryIn}s`;
          submitBtn.disabled = true;
          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
          }, retryIn * 1000);
        }
        return;
      }

      // Sanitize all non-password inputs before validation
      inputs.forEach(input => {
        if (input.type !== 'password') {
          input.value = stripTags(input.value);
        }
      });

      let allValid = true;

      inputs.forEach(input => {
        if (!validateField(input, form)) {
          allValid = false;
        }
      });

      if (allValid) {
        const submitBtn = $('button[type="submit"]', form);
        const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
        
        if (submitBtn) {
          submitBtn.innerHTML = 'Loading...';
          submitBtn.disabled = true;
        }

        try {
          // Check if this is sign up or sign in
          const isSignUp = form.closest('.auth-card') && form.querySelector('input[name="name"]');
          const email = $('input[name="email"]', form)?.value;
          const password = $('input[name="password"]', form)?.value;
          
          if (email && password) {
            if (isSignUp) {
              await signup(email, password);
              if (submitBtn) submitBtn.innerHTML = '✓ Account Created!';
              setTimeout(() => window.location.href = 'signin.html', 1500);
            } else {
              await signin(email, password);
              if (submitBtn) submitBtn.innerHTML = '✓ Signed In!';
              setTimeout(() => window.location.href = 'dashboard.html', 1500);
            }
          } else {
             if (submitBtn) {
               submitBtn.innerHTML = '✓ Success!';
               setTimeout(() => {
                 submitBtn.innerHTML = originalText;
                 submitBtn.disabled = false;
               }, 2000);
             }
          }
        } catch (error) {
           console.error(error);
           alert(error.message);
           if (submitBtn) {
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
           }
        }
      }
    });
  });
}
