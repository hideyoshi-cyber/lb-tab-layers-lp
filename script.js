/* LB TAB Layers LP — script.js */
'use strict';

// ===== Scroll-based header styling =====
const header = document.getElementById('site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 60) {
    header.style.borderBottomColor = 'rgba(39, 39, 42, 0.8)';
  } else {
    header.style.borderBottomColor = 'rgba(39, 39, 42, 0.3)';
  }
  lastScroll = y;
}, { passive: true });

// ===== Intersection Observer for fade-in =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe cards for animation
document.querySelectorAll('.pain-card, .persist-card, .feat-card, .theme-card, .price-card, .privacy-item, .faq-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const headerH = header.offsetHeight;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// ===== Track CTA clicks (console logging for now) =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.id || btn.textContent.trim();
    console.log('[LP] CTA click:', id);
  });
});
