/**
 * KUMANI — Módulo de navegação (header)
 * Responsabilidades: comportamento sticky ao scroll, menu mobile
 * full-screen (abrir/fechar, foco, tecla Esc), e contador do carrinho.
 */

import { qs, on } from '../utils/dom.js';

const SCROLL_THRESHOLD = 80;
const CART_STORAGE_KEY = 'kumani_cart';

function initStickyBehaviour(header) {
  // Páginas sem hero escuro (ex.: Contacto) podem marcar o header como
  // sempre sólido desde o início, adicionando a classe "header--static"
  // directamente no elemento <header> do partial nessa página.
  const updateState = () => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('header--scrolled', scrolled);
  };

  updateState();
  on(window, 'scroll', updateState, { passive: true });
}

function trapFocus(panel) {
  const focusable = Array.from(
    panel.querySelectorAll('a[href], button:not([disabled])')
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  on(panel, 'keydown', (event) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function initMobileMenu(header) {
  const toggle = qs('[data-menu-toggle]', header);
  const panel = qs('[data-mobile-panel]', header);
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
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  on(document, 'keydown', (event) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen && event.key === 'Escape') {
      closeMenu();
    }
  });

  // Fecha o menu automaticamente ao navegar para outra página
  qs('.header__mobile-list', panel)?.addEventListener('click', (event) => {
    if (event.target.matches('.header__mobile-link')) closeMenu();
  });

  trapFocus(panel);
}

function readCartCount() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return 0;
    const items = JSON.parse(raw);
    return Array.isArray(items)
      ? items.reduce((total, item) => total + (item.quantidade || 1), 0)
      : 0;
  } catch {
    return 0;
  }
}

function initCartCount(header) {
  const countEl = qs('[data-cart-count]', header);
  const linkEl = qs('[data-cart-link]', header);
  if (!countEl || !linkEl) return;

  const render = () => {
    const count = readCartCount();
    countEl.textContent = String(count);
    countEl.style.display = count > 0 ? 'flex' : 'none';
    linkEl.setAttribute('aria-label', `Carrinho de compras, ${count} artigos`);
  };

  render();

  // O módulo cart.js (Fase 10) dispara este evento sempre que o
  // carrinho muda, para o contador se manter sincronizado sem reload.
  document.addEventListener('cart:updated', render);
}

export function initNav() {
  const header = qs('[data-nav-root]');
  if (!header) return;

  initStickyBehaviour(header);
  initMobileMenu(header);
  initCartCount(header);
}