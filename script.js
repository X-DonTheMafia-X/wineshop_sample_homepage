/* ═══════════════════════════════════════════════════════════════
   VIGNE & CO. — SCRIPT.JS
   Systems:
     01. DOM Ready gate
     02. Navbar — scroll glass + active link spy
     03. Burger + mobile drawer
     04. Nav dropdown (desktop)
     05. Mobile order sub-group accordion
     06. Wine card slider — drag, auto-scroll, dots, arrows
     07. Scroll-reveal (IntersectionObserver)
     08. Stats counter animation
     09. Parallax — hero orb & watermark
     10. Page routing (data-page links → future pages)
     11. Contact form — live validation + toast
     12. Custom gold cursor trail
     13. Active nav highlight on scroll
     14. Magnetic CTA button effect
     15. Search — live expand & keyboard
     16. Hours badge — open/closed live status
     17. Tilt on service cards (mouse-move 3D)
     18. Add-to-cart micro-feedback
     19. Keyboard accessibility
     20. Init
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   01. DOM READY GATE
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  init();
});


/* ─────────────────────────────────────────────────────────────
   UTILITY HELPERS
───────────────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* ─────────────────────────────────────────────────────────────
   02. NAVBAR — SCROLL GLASS + ACTIVE LINK SPY
───────────────────────────────────────────────────────────── */
function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  let lastY = 0;
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;

        // Glass effect threshold
        if (y > 30) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // Hide navbar on fast scroll down, reveal on scroll up
        if (y > lastY + 6 && y > 120) {
          navbar.style.transform = 'translateY(-100%)';
          navbar.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
        } else if (y < lastY - 2) {
          navbar.style.transform = 'translateY(0)';
        }

        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}


/* ─────────────────────────────────────────────────────────────
   03. BURGER + MOBILE DRAWER
───────────────────────────────────────────────────────────── */
function initBurger() {
  const burger     = qs('#burger');
  const mobileMenu = qs('#mobile-menu');
  if (!burger || !mobileMenu) return;

  function toggleMenu(force) {
    const isOpen = force !== undefined ? force : !burger.classList.contains('open');

    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      mobileMenu.classList.add('open');
      mobileMenu.style.display = 'flex';
      // Animate in with staggered links
      qsa('.mobile-link, .mobile-group-toggle', mobileMenu).forEach((el, i) => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateX(-14px)';
        el.style.transition = `opacity 0.3s ${i * 0.04}s ease, transform 0.3s ${i * 0.04}s ease`;
        requestAnimationFrame(() => {
          el.style.opacity   = '1';
          el.style.transform = 'translateX(0)';
        });
      });
    } else {
      mobileMenu.classList.remove('open');
      // Delay hiding to let CSS transition out
      setTimeout(() => {
        if (!mobileMenu.classList.contains('open')) {
          mobileMenu.style.display = 'none';
        }
      }, 300);
    }
  }

  burger.addEventListener('click', () => toggleMenu());

  // Close on mobile link click
  qsa('.mobile-link', mobileMenu).forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleMenu(false);
  });

  // Initially hidden
  mobileMenu.style.display = 'none';
}


/* ─────────────────────────────────────────────────────────────
   04. NAV DROPDOWN (DESKTOP)
───────────────────────────────────────────────────────────── */
function initNavDropdown() {
  const dropdown = qs('#nav-dropdown-order');
  const btn      = qs('#order-dropdown-btn');
  if (!dropdown || !btn) return;

  function openDropdown() {
    dropdown.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  });

  // Hover intent — open on hover, close when mouse leaves the whole dropdown
  dropdown.addEventListener('mouseenter', openDropdown);
  dropdown.addEventListener('mouseleave', closeDropdown);

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) closeDropdown();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });
}


/* ─────────────────────────────────────────────────────────────
   05. MOBILE ORDER SUB-GROUP ACCORDION
───────────────────────────────────────────────────────────── */
function initMobileAccordion() {
  const toggle    = qs('#mobile-order-toggle');
  const group     = qs('#mobile-group-order');
  const itemsWrap = qs('#mobile-order-items');
  if (!toggle || !group || !itemsWrap) return;

  toggle.addEventListener('click', () => {
    const isOpen = group.classList.contains('open');
    group.classList.toggle('open', !isOpen);
    toggle.setAttribute('aria-expanded', !isOpen);

    if (!isOpen) {
      itemsWrap.style.maxHeight = itemsWrap.scrollHeight + 'px';
      itemsWrap.style.opacity   = '1';
      itemsWrap.style.overflow  = 'hidden';
      itemsWrap.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
    } else {
      itemsWrap.style.maxHeight = '0';
      itemsWrap.style.opacity   = '0';
    }
  });

  // Initial state
  itemsWrap.style.maxHeight = '0';
  itemsWrap.style.opacity   = '0';
  itemsWrap.style.overflow  = 'hidden';
  itemsWrap.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
  itemsWrap.style.display   = 'flex';
  itemsWrap.style.flexDirection = 'column';
}


/* ─────────────────────────────────────────────────────────────
   06. WINE CARD SLIDER
       — drag, touch, auto-scroll, dots, arrows, pause on hover
───────────────────────────────────────────────────────────── */
function initSlider() {
  const track   = qs('#slider-track');
  const dotsCtx = qs('#slider-dots');
  const prevBtn = qs('#prev-btn');
  const nextBtn = qs('#next-btn');
  if (!track) return;

  const cards       = qsa('.wine-card', track);
  const total       = cards.length;
  let   current     = 0;
  let   autoTimer   = null;
  let   isDragging  = false;
  let   startX      = 0;
  let   scrollStart = 0;
  let   hasDragged  = false;

  // ── Build dots ──
  if (dotsCtx) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsCtx.appendChild(dot);
    });
  }

  function getDots() {
    return dotsCtx ? qsa('.slider-dot', dotsCtx) : [];
  }

  function updateDots(index) {
    getDots().forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function getCardWidth() {
    if (!cards[0]) return 0;
    const style = getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 24;
    return cards[0].offsetWidth + gap;
  }

  function goTo(index, animate = true) {
    current = clamp(index, 0, total - 1);
    const offset = current * getCardWidth();
    track.style.transition = animate
      ? 'transform 0.6s cubic-bezier(0.22,1,0.36,1)'
      : 'none';
    track.style.transform = `translateX(-${offset}px)`;
    updateDots(current);

    // Dim non-active cards subtly
    cards.forEach((c, i) => {
      c.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      if (i === current) {
        c.style.opacity = '1';
        c.style.transform = 'scale(1)';
      } else {
        c.style.opacity = '0.7';
        c.style.transform = 'scale(0.97)';
      }
    });
  }

  function next() { goTo(current < total - 1 ? current + 1 : 0); }
  function prev() { goTo(current > 0        ? current - 1 : total - 1); }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  // ── Auto scroll ──
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => next(), 4500);
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }
  function resetAuto() {
    stopAuto();
    startAuto();
  }

  // Pause on hover
  track.closest('.slider-wrapper')?.addEventListener('mouseenter', stopAuto);
  track.closest('.slider-wrapper')?.addEventListener('mouseleave', startAuto);

  // ── Drag (mouse) ──
  track.addEventListener('mousedown', (e) => {
    isDragging  = true;
    hasDragged  = false;
    startX      = e.clientX;
    scrollStart = current;
    track.style.transition = 'none';
    track.style.cursor = 'grabbing';
    stopAuto();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) hasDragged = true;
    const liveOffset = scrollStart * getCardWidth() - dx;
    track.style.transform = `translateX(-${liveOffset}px)`;
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    const dx = e.clientX - startX;

    if (Math.abs(dx) > 60) {
      dx < 0 ? next() : prev();
    } else {
      goTo(current);
    }
    startAuto();
  });

  // ── Touch (mobile swipe) ──
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
    startAuto();
  });

  // ── Keyboard ──
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
  });

  // Init
  goTo(0, false);
  startAuto();
}


/* ─────────────────────────────────────────────────────────────
   07. SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────────────────────────── */
function initScrollReveal() {
  // Inject base reveal styles
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(36px);
      transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1),
                  transform 0.75s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .reveal-left {
      opacity: 0;
      transform: translateX(-44px);
      transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1),
                  transform 0.75s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal-left.visible {
      opacity: 1;
      transform: translateX(0);
    }
    .reveal-scale {
      opacity: 0;
      transform: scale(0.94);
      transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1),
                  transform 0.7s cubic-bezier(0.22,1,0.36,1);
    }
    .reveal-scale.visible {
      opacity: 1;
      transform: scale(1);
    }
  `;
  document.head.appendChild(style);

  // Tag elements with reveal classes
  const revealMap = [
    { sel: '.section-eyebrow, .section-title',            cls: 'reveal'       },
    { sel: '.service-card',                               cls: 'reveal'       },
    { sel: '.wine-card',                                  cls: 'reveal-scale' },
    { sel: '.desc-text',                                  cls: 'reveal'       },
    { sel: '.desc-visual',                                cls: 'reveal-left'  },
    { sel: '.stat-item',                                  cls: 'reveal'       },
    { sel: '.learn-card',                                 cls: 'reveal'       },
    { sel: '.review-card',                                cls: 'reveal-scale' },
    { sel: '.rating-overview',                            cls: 'reveal'       },
    { sel: '.contact-info, .contact-form',                cls: 'reveal'       },
    { sel: '.hero-eyebrow, .hero-title, .hero-body',      cls: 'reveal'       },
    { sel: '.hero-cta, .hero-services, .hero-hours',      cls: 'reveal'       },
    { sel: '.desc-box--large, .desc-box--small',          cls: 'reveal-scale' },
  ];

  revealMap.forEach(({ sel, cls }) => {
    qsa(sel).forEach((el, i) => {
      // Skip hero elements that already have CSS animation
      if (el.closest('.hero')) return;
      el.classList.add(cls);
      // Stagger siblings in the same parent
      el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  qsa('.reveal, .reveal-left, .reveal-scale').forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────────────────────────────
   08. STATS COUNTER ANIMATION
───────────────────────────────────────────────────────────── */
function initCounters() {
  const statNums = qsa('.stat-num');
  if (!statNums.length) return;

  function animateCounter(el) {
    const raw      = el.innerText.replace(/[^0-9.]/g, '');
    const target   = parseFloat(raw);
    const sup      = el.querySelector('sup');
    const supText  = sup ? sup.innerText : '';
    const isFloat  = raw.includes('.');
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      // Ease out expo
      const eased    = 1 - Math.pow(1 - progress, 4);
      const current  = isFloat
        ? (target * eased).toFixed(1)
        : Math.round(target * eased);

      el.innerText = current;
      if (sup) {
        const newSup = document.createElement('sup');
        newSup.innerText = supText;
        el.appendChild(newSup);
      }

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNums.forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────────────────────────────
   09. PARALLAX — HERO AMBIENT ORB
───────────────────────────────────────────────────────────── */
function initParallax() {
  const hero = qs('.hero');
  if (!hero) return;

  // Subtle orb movement on mouse move
  hero.addEventListener('mousemove', (e) => {
    const { clientX, clientY } = e;
    const { innerWidth: w, innerHeight: h } = window;
    const rx = ((clientX / w) - 0.5) * 2;  // -1 to 1
    const ry = ((clientY / h) - 0.5) * 2;

    hero.style.setProperty('--orb-x', `${rx * 40}px`);
    hero.style.setProperty('--orb-y', `${ry * 24}px`);
  });

  // Parallax scroll on hero content
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      const content = qs('.hero-content');
      if (content) {
        content.style.transform = `translateY(${y * 0.18}px)`;
        content.style.opacity   = `${1 - y / (window.innerHeight * 0.9)}`;
      }
    }
  }, { passive: true });
}


/* ─────────────────────────────────────────────────────────────
   10. PAGE ROUTING (data-page links)
       — currently navigates by href; ready for SPA routing later
───────────────────────────────────────────────────────────── */
function initPageRouting() {
  const pageLinks = qsa('[data-page]');

  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const page = link.dataset.page;
      const href = link.getAttribute('href');

      // If target page doesn't exist yet, show a polished "coming soon" toast
      // Remove this guard once the pages are built
      if (href && !href.startsWith('#')) {
        // Page routing ready — will follow href naturally
        // Add a subtle page-exit transition
        document.body.style.transition = 'opacity 0.28s ease';
        document.body.style.opacity    = '0';
        setTimeout(() => {
          document.body.style.opacity = '1';
        }, 300);
      }
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   11. CONTACT FORM — LIVE VALIDATION + TOAST
───────────────────────────────────────────────────────────── */
function initContactForm() {
  const form = qs('#contact-form');
  if (!form) return;

  // ── Toast system ──
  function showToast(message, type = 'success') {
    let toastEl = qs('#toast-container');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'toast-container';
      toastEl.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        pointer-events: none;
      `;
      document.body.appendChild(toastEl);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success'
      ? 'rgba(201,168,76,0.92)'
      : 'rgba(180,60,60,0.92)';

    toast.style.cssText = `
      background: ${bgColor};
      color: #0a0a0a;
      font-family: 'Jost', sans-serif;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0.9rem 1.6rem;
      border-radius: 40px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.35s ease, transform 0.35s ease;
      pointer-events: none;
      backdrop-filter: blur(12px);
    `;
    toast.innerText = message;
    toastEl.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  // ── Live field validation ──
  function validateField(input) {
    const val = input.value.trim();
    let error = '';

    if (input.type === 'email') {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(val)) error = 'Please enter a valid email address.';
    } else if (input.required && !val) {
      error = 'This field is required.';
    }

    const existing = input.parentElement.querySelector('.field-error');
    if (error) {
      input.style.borderColor = 'rgba(200,80,80,0.6)';
      if (!existing) {
        const msg = document.createElement('span');
        msg.className = 'field-error';
        msg.style.cssText = `
          font-size: 0.6rem;
          color: rgba(200,100,100,0.85);
          letter-spacing: 0.1em;
          margin-top: 0.2rem;
        `;
        msg.innerText = error;
        input.parentElement.appendChild(msg);
      } else {
        existing.innerText = error;
      }
      return false;
    } else {
      input.style.borderColor = 'rgba(201,168,76,0.4)';
      if (existing) existing.remove();
      return true;
    }
  }

  qsa('input, textarea', form).forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.style.borderColor.includes('200')) validateField(input);
    });
  });

  // ── Submit ──
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = qsa('input, textarea', form);
    const allValid = [...fields].every(f => validateField(f));

    if (!allValid) {
      showToast('Please fix the errors above.', 'error');
      return;
    }

    // Simulate sending
    const btn = form.querySelector('button[type="submit"]');
    btn.innerText = 'Sending…';
    btn.disabled  = true;
    btn.style.opacity = '0.6';

    setTimeout(() => {
      showToast('Message sent — we\'ll be in touch soon! 🍷', 'success');
      form.reset();
      qsa('input, textarea', form).forEach(f => {
        f.style.borderColor = '';
      });
      btn.innerText = 'Send Message';
      btn.disabled  = false;
      btn.style.opacity = '1';
    }, 1400);
  });
}


/* ─────────────────────────────────────────────────────────────
   12. CUSTOM GOLD CURSOR TRAIL
───────────────────────────────────────────────────────────── */
function initCursorTrail() {
  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const trail = document.createElement('div');
  trail.id = 'cursor-trail';
  trail.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: rgba(201,168,76,0.65);
    pointer-events: none;
    z-index: 99999;
    transform: translate(-50%, -50%);
    transition: transform 0.08s linear, opacity 0.3s ease;
    mix-blend-mode: screen;
  `;

  const ring = document.createElement('div');
  ring.id = 'cursor-ring';
  ring.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.35);
    pointer-events: none;
    z-index: 99998;
    transform: translate(-50%, -50%);
    transition: transform 0.18s cubic-bezier(0.22,1,0.36,1),
                width 0.25s ease, height 0.25s ease,
                border-color 0.25s ease, opacity 0.3s ease;
    mix-blend-mode: screen;
  `;

  document.body.appendChild(trail);
  document.body.appendChild(ring);

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    trail.style.left = mx + 'px';
    trail.style.top  = my + 'px';
  });

  // Lagging ring
  function tickRing() {
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tickRing);
  }
  tickRing();

  // Expand ring on interactive hover
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .wine-card, .service-card, .hero-service-btn');
    if (target) {
      ring.style.width        = '60px';
      ring.style.height       = '60px';
      ring.style.borderColor  = 'rgba(201,168,76,0.7)';
      trail.style.transform   = 'translate(-50%, -50%) scale(1.8)';
      trail.style.background  = 'rgba(201,168,76,0.85)';
    } else {
      ring.style.width        = '36px';
      ring.style.height       = '36px';
      ring.style.borderColor  = 'rgba(201,168,76,0.35)';
      trail.style.transform   = 'translate(-50%, -50%) scale(1)';
      trail.style.background  = 'rgba(201,168,76,0.65)';
    }
  });
}


/* ─────────────────────────────────────────────────────────────
   13. ACTIVE NAV LINK — SCROLL SPY
───────────────────────────────────────────────────────────── */
function initScrollSpy() {
  const sections = qsa('section[id], div[id]').filter(el =>
    qsa(`a[href="#${el.id}"]`, document).length > 0
  );
  const navLinks = qsa('.nav-link[href^="#"]');
  if (!navLinks.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const matches = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', matches);
          });
        }
      });
    },
    {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach(s => observer.observe(s));
}


/* ─────────────────────────────────────────────────────────────
   14. MAGNETIC CTA BUTTONS
───────────────────────────────────────────────────────────── */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;

  const btns = qsa('.btn-primary, .btn-ghost, .hero-service-btn');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.28;
      const dy     = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform   = '';
      btn.style.transition  = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   15. SEARCH — LIVE EXPAND & KEYBOARD SHORTCUT
───────────────────────────────────────────────────────────── */
function initSearch() {
  const searchInput = qs('#search-input');
  if (!searchInput) return;

  // "/" shortcut to focus search
  document.addEventListener('keydown', (e) => {
    if (
      e.key === '/' &&
      document.activeElement.tagName !== 'INPUT' &&
      document.activeElement.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.blur();
      searchInput.value = '';
    }
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        // Placeholder for future search page routing
        console.log(`[Search] Query: "${query}" — search page not yet built.`);
        searchInput.blur();
      }
    }
  });
}


/* ─────────────────────────────────────────────────────────────
   16. LIVE HOURS STATUS BADGE
───────────────────────────────────────────────────────────── */
function initHoursStatus() {
  const dot = qs('.dot');
  if (!dot) return;

  function isOpen() {
    const now  = new Date();
    const day  = now.getDay();   // 0=Sun … 6=Sat
    const hour = now.getHours();
    const min  = now.getMinutes();
    const time = hour + min / 60;

    const isWeekday  = day >= 1 && day <= 5; // Mon–Fri
    const isWeekend  = day === 0 || day === 6;

    if (isWeekday  && time >= 10  && time < 23) return true;
    if (isWeekend  && time >= 12  && time < 22) return true;
    return false;
  }

  function updateDot() {
    if (isOpen()) {
      dot.style.background = 'var(--gold)';
      dot.style.boxShadow  = '0 0 8px var(--gold)';
      dot.title = 'We\'re open now!';
    } else {
      dot.style.background = 'rgba(245,240,232,0.25)';
      dot.style.boxShadow  = 'none';
      dot.title = 'Currently closed';
    }
  }

  updateDot();
  setInterval(updateDot, 60000); // re-check every minute
}


/* ─────────────────────────────────────────────────────────────
   17. 3D TILT ON SERVICE CARDS
───────────────────────────────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = qsa('.service-card, .review-card');

  cards.forEach(card => {
    card.style.transformStyle  = 'preserve-3d';
    card.style.willChange      = 'transform';
    card.style.perspective     = '800px';

    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const rx    = ((e.clientY - cy) / (rect.height / 2)) * -6;
      const ry    = ((e.clientX - cx) / (rect.width  / 2)) *  6;

      card.style.transition = 'transform 0.1s ease';
      card.style.transform  =
        `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
      card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   18. ADD-TO-CART MICRO-FEEDBACK
───────────────────────────────────────────────────────────── */
function initCartButtons() {
  const cartBtns = qsa('.card-btn');

  cartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const original = btn.innerText;
      if (btn.dataset.adding) return;
      btn.dataset.adding = 'true';

      // Burst particle
      createBurst(e.clientX, e.clientY);

      btn.innerText         = '✓ Added';
      btn.style.borderColor = 'var(--gold)';
      btn.style.color       = 'var(--gold)';
      btn.style.transform   = 'scale(0.95)';

      setTimeout(() => {
        btn.innerText         = original;
        btn.style.borderColor = '';
        btn.style.color       = '';
        btn.style.transform   = '';
        delete btn.dataset.adding;
      }, 1800);
    });
  });
}

function createBurst(x, y) {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const angle    = (i / count) * 360;
    const distance = 28 + Math.random() * 24;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px; height: 4px;
      border-radius: 50%;
      background: var(--gold);
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: all 0.55s cubic-bezier(0.22,1,0.36,1);
      opacity: 1;
    `;
    document.body.appendChild(particle);

    const rad = (angle * Math.PI) / 180;
    const tx  = Math.cos(rad) * distance;
    const ty  = Math.sin(rad) * distance;

    requestAnimationFrame(() => {
      particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      particle.style.opacity   = '0';
    });

    setTimeout(() => particle.remove(), 600);
  }
}


/* ─────────────────────────────────────────────────────────────
   19. KEYBOARD ACCESSIBILITY
───────────────────────────────────────────────────────────── */
function initA11y() {
  // Visible focus ring only on keyboard nav
  const style = document.createElement('style');
  style.textContent = `
    :focus:not(:focus-visible) { outline: none; }
    :focus-visible {
      outline: 2px solid var(--gold) !important;
      outline-offset: 3px;
    }
  `;
  document.head.appendChild(style);

  // Skip-to-content link
  const skip = document.createElement('a');
  skip.href = '#home';
  skip.innerText = 'Skip to content';
  skip.style.cssText = `
    position: fixed;
    top: -100px; left: 1rem;
    background: var(--gold);
    color: var(--black);
    font-family: 'Jost', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.7rem 1.4rem;
    border-radius: 0 0 4px 4px;
    z-index: 99999;
    transition: top 0.2s ease;
    font-weight: 500;
  `;
  skip.addEventListener('focus', () => { skip.style.top = '0'; });
  skip.addEventListener('blur',  () => { skip.style.top = '-100px'; });
  document.body.prepend(skip);
}


/* ─────────────────────────────────────────────────────────────
   20. SMOOTH ANCHOR SCROLLING (override default)
───────────────────────────────────────────────────────────── */
function initSmoothAnchors() {
  const NAV_H = 72;

  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id     = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - NAV_H - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   20. RATING BARS — animate width on scroll
───────────────────────────────────────────────────────────── */
function initRatingBars() {
  const bars = qsa('.bar-fill');
  if (!bars.length) return;

  // Store target widths then reset to 0
  bars.forEach(bar => {
    bar.dataset.target = bar.style.width;
    bar.style.width = '0%';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          setTimeout(() => {
            bar.style.width = bar.dataset.target;
          }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach(bar => observer.observe(bar));
}


/* ─────────────────────────────────────────────────────────────
   INIT — wire everything together
───────────────────────────────────────────────────────────── */
function init() {
  initNavbar();
  initBurger();
  initNavDropdown();
  initMobileAccordion();
  initSlider();
  initScrollReveal();
  initCounters();
  initParallax();
  initPageRouting();
  initContactForm();
  initCursorTrail();
  initScrollSpy();
  initMagneticButtons();
  initSearch();
  initHoursStatus();
  initCardTilt();
  initCartButtons();
  initA11y();
  initSmoothAnchors();
  initRatingBars();

  // Console signature
  console.log(
    '%c Vigne & Co. %c script.js loaded ',
    'background:#c9a84c;color:#0a0a0a;font-family:serif;font-size:13px;padding:4px 8px;border-radius:3px 0 0 3px;font-weight:bold;',
    'background:#1e1e1e;color:#c9a84c;font-family:monospace;font-size:12px;padding:4px 8px;border-radius:0 3px 3px 0;'
  );

}

const bgMusic = document.getElementById("bgMusic");

function startMusic() {
    bgMusic.play().catch(err => console.log(err));

    window.removeEventListener("scroll", startMusic);
    window.removeEventListener("click", startMusic);
    window.removeEventListener("touchstart", startMusic);
}

window.addEventListener("scroll", startMusic);
window.addEventListener("click", startMusic);
window.addEventListener("touchstart", startMusic);