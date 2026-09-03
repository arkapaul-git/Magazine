/* ═══════════════════════════════════════════════════════════════
   slideshow.js — Hero Background Image Slideshow
   Cycles through .slide elements every 6 seconds.
   ═══════════════════════════════════════════════════════════════ */

import { $$ } from '../utils/dom-helpers.js';

export function initSlideshow() {
  const slides = $$('.slide');
  if (slides.length === 0) return;

  let currentIndex = 0;
  const INTERVAL = 6000;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev');
      if (i === index) {
        slide.classList.add('active');
      }
    });

    // Mark the previous slide
    const prevIndex = (index - 1 + slides.length) % slides.length;
    slides[prevIndex].classList.add('prev');
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  // Start auto-rotation
  let timer = setInterval(nextSlide, INTERVAL);

  // Pause on hover
  const hero = slides[0]?.closest('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', () => {
      timer = setInterval(nextSlide, INTERVAL);
    });
  }

  // Initialize first slide
  showSlide(0);
}
