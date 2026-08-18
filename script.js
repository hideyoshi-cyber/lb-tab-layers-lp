/* LB TAB Layers LP 窶・script.js */
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
      if (entry.target.classList.contains('scroll-trigger')) {
        entry.target.classList.add('visible');
      } else {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
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

// Observe images for scroll-scale animation
document.querySelectorAll('.solution-img, .persist-img, .features-img, .faq-img').forEach(el => {
  el.classList.add('scroll-trigger');
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

// ===== Share Buttons =====
(function initShareButtons() {
  const shareSection = document.querySelector('.blog-share-buttons');
  if (!shareSection) return;

  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  // Set share URLs dynamically
  const xBtn = shareSection.querySelector('.share-x');
  if (xBtn) xBtn.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

  const lineBtn = shareSection.querySelector('.share-line');
  if (lineBtn) lineBtn.href = `https://social-plugins.line.me/lineit/share?url=${pageUrl}`;

  const hatenaBtn = shareSection.querySelector('.share-hatena');
  if (hatenaBtn) hatenaBtn.href = `https://b.hatena.ne.jp/entry/${window.location.href}`;

  // Copy button
  const copyBtn = shareSection.querySelector('.share-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.textContent = '✓ コピーしました';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.textContent = '🔗 リンクをコピー';
        }, 2000);
      });
    });
  }
})();

// ===== Mobile PC Banner =====
(function initMobileBanner() {
  const banner = document.querySelector('.mobile-pc-banner');
  if (!banner) return;

  // Close button
  const closeBtn = banner.querySelector('.mobile-pc-banner-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      banner.style.display = 'none';
      document.body.style.paddingBottom = '0';
      sessionStorage.setItem('mobile-banner-closed', '1');
    });
  }

  // If already closed this session, hide
  if (sessionStorage.getItem('mobile-banner-closed')) {
    banner.style.display = 'none';
    document.body.style.paddingBottom = '0';
  }

  // Bookmark guide toggle
  const bookmarkBtn = banner.querySelector('.btn-bookmark');
  const guide = banner.querySelector('.mobile-pc-bookmark-guide');
  if (bookmarkBtn && guide) {
    bookmarkBtn.addEventListener('click', () => {
      guide.classList.toggle('visible');
    });
  }
})();

