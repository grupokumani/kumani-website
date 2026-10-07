/**
 * KUMANI — Módulo de navegação (header)
 */

import { qs, on } from '../utils/dom.js';

const SCROLL_THRESHOLD = 80;
const CART_STORAGE_KEY = 'kumani_cart';

// ── Sticky ──────────────────────────────────────────────────────────
function initStickyBehaviour(header) {
  const updateState = () => {
    header.classList.toggle('header--scrolled', window.scrollY > SCROLL_THRESHOLD);
  };
  updateState();
  on(window, 'scroll', updateState, { passive: true });
}

// ── Focus trap ───────────────────────────────────────────────────────
function trapFocus(panel) {
  const focusable = Array.from(
    panel.querySelectorAll('a[href], button:not([disabled])')
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  on(panel, 'keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}

// ── Menu mobile ──────────────────────────────────────────────────────
function initMobileMenu(header) {
  const toggle = qs('[data-menu-toggle]', header);
  const panel  = qs('[data-mobile-panel]', header);
  if (!toggle || !panel) return;

  const openMenu = () => {
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu de navegação');
    document.body.classList.add('menu-open');
    const firstLink = qs('.header__mobile-link', panel);
    if (firstLink) firstLink.focus();
  };

  const closeMenu = () => {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu de navegação');
    document.body.classList.remove('menu-open');
    toggle.focus();
  };

  on(toggle, 'click', () => {
    toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  // Fecha ao clicar num link directo (sem dropdown)
  qs('.header__mobile-list', panel)?.addEventListener('click', (e) => {
    if (e.target.matches('.header__mobile-link:not(.header__mobile-link--parent)')) {
      closeMenu();
    }
  });

  trapFocus(panel);
}

// ── Dropdowns desktop ────────────────────────────────────────────────
function initDropdowns() {
  const items = document.querySelectorAll('.header__nav-item--has-dropdown');

  items.forEach((item) => {
    const btn      = item.querySelector('[data-dropdown-toggle]');
    const dropdown = item.querySelector('.header__dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Fecha todos os outros
      document.querySelectorAll('[data-dropdown-toggle][aria-expanded="true"]').forEach((b) => {
        if (b !== btn) b.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });

    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Fecha ao clicar fora (ignora painel mobile)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.header__mobile-panel')) return;
    document.querySelectorAll('[data-dropdown-toggle]').forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Acordeão mobile ──────────────────────────────────────────────────
function initMobileAccordion() {
  const btns = document.querySelectorAll('[data-mobile-accordion]');

  btns.forEach((btn) => {
    const sub = btn.nextElementSibling;
    if (!sub) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // impede que o painel feche
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Fecha os outros
      btns.forEach((b) => {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          const s = b.nextElementSibling;
          if (s) s.classList.remove('is-open');
        }
      });

      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      sub.classList.toggle('is-open', !isOpen);
    });
  });

  // Fecha o painel ao navegar para outra página via sub-link
  document.querySelectorAll('.header__mobile-sub-link').forEach((link) => {
    link.addEventListener('click', () => {
      const panel  = document.querySelector('[data-mobile-panel]');
      const toggle = document.querySelector('[data-menu-toggle]');
      panel?.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Carrinho ─────────────────────────────────────────────────────────
function readCartCount() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return 0;
    const items = JSON.parse(raw);
    return Array.isArray(items)
      ? items.reduce((t, i) => t + (i.quantidade || 1), 0)
      : 0;
  } catch { return 0; }
}

function initCartCount(header) {
  const countEl = qs('[data-cart-count]', header);
  const linkEl  = qs('[data-cart-link]',  header);
  if (!countEl || !linkEl) return;

  const render = () => {
    const count = readCartCount();
    countEl.textContent = String(count);
    countEl.style.display = count > 0 ? 'flex' : 'none';
    linkEl.setAttribute('aria-label', `Carrinho de compras, ${count} artigos`);
  };

  render();
  document.addEventListener('cart:updated', render);
}

// ── Ponto de entrada ─────────────────────────────────────────────────
export function initNav() {
  initDropdowns();
  initMobileAccordion();

  const header = qs('[data-nav-root]');
  if (!header) return;

  initStickyBehaviour(header);
  initMobileMenu(header);
  initCartCount(header);
}