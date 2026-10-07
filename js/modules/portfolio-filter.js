/**
 * KUMANI — Portfolio com lightbox (estilo Dalima)
 * Ao clicar num card, abre modal por cima com imagem, descrição e CTA.
 */

import { qs, qsa, on } from '../utils/dom.js';

const NUMERO_WHATSAPP = '258877335506';

function renderCard(item) {
  const media = item.imagem
    ? `<img class="work-block__media" src="${item.imagem}" alt="${item.categoriaLabel || 'Trabalho KUMANI'}" loading="lazy">`
    : `<div class="work-block__media work-block__media--placeholder" style="background-color:${item.corPlaceholder || 'var(--color-neutral-800)'};"></div>`;

  const meta = (item.local && item.ano)
    ? `<div class="work-block__meta">${item.local} | ${item.ano}</div>`
    : '';

  return `
    <button type="button"
      class="work-block work-block--clickable"
      data-reveal
      data-categoria="${item.categoriaSlug}"
      data-slug="${item.slug}"
      aria-label="Ver detalhes: ${item.categoriaLabel || 'projecto'}">
      ${media}
      ${meta}
    </button>
  `;
}

function abrirModal(item) {
  const existing = document.getElementById('portfolio-modal');
  if (existing) existing.remove();

  const imgSrc = item.imagem || '';
  const mensagem = encodeURIComponent(
    `Olá! Vi o vosso trabalho "${item.categoriaLabel || 'portfólio'}" (${item.local || 'Moçambique'}, ${item.ano || ''}) e gostaria de pedir um orçamento para um projecto semelhante.\n\nServiço: ${item.categoriaLabel || ''}\nLocalização: ${item.local || ''}`
  );

  const modal = document.createElement('div');
  modal.id = 'portfolio-modal';
  modal.className = 'portfolio-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', item.categoriaLabel || 'Detalhe do projecto');
  modal.innerHTML = `
    <div class="portfolio-modal__backdrop" data-modal-close></div>
    <div class="portfolio-modal__box">
      <button class="portfolio-modal__close" data-modal-close aria-label="Fechar">✕</button>
      ${imgSrc ? `<div class="portfolio-modal__img"><img src="${imgSrc}" alt="${item.categoriaLabel || ''}"></div>` : ''}
      <div class="portfolio-modal__body">
        <div class="portfolio-modal__tags">
          ${item.categoriaLabel ? `<span class="portfolio-modal__tag">${item.categoriaLabel}</span>` : ''}
          ${item.local ? `<span class="portfolio-modal__tag portfolio-modal__tag--outline">${item.local}</span>` : ''}
          ${item.ano ? `<span class="portfolio-modal__tag portfolio-modal__tag--outline">${item.ano}</span>` : ''}
        </div>
        <p class="portfolio-modal__desc">${item.descricao || ''}</p>
        <div class="portfolio-modal__actions">
          <a href="https://wa.me/${NUMERO_WHATSAPP}?text=${mensagem}"
             class="btn btn--primary portfolio-modal__cta"
             target="_blank" rel="noopener">
            Solicitar orçamento →
          </a>
          <button type="button" class="btn btn--secondary" data-modal-close>Fechar</button>
        </div>
      </div>
    </div>
  `;

    // Expõe globalmente para a homepage também poder usar
  window.abrirPortfolioModal = abrirModal;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => modal.classList.add('is-open'));

  qsa('[data-modal-close]', modal).forEach((btn) => {
    btn.addEventListener('click', () => fecharModal(modal));
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModal(modal);
  });

  // foco no modal
  const firstFocusable = modal.querySelector('button, a');
  if (firstFocusable) firstFocusable.focus();
}

function fecharModal(modal) {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => modal.remove(), 300);
}

function renderFilterChips(categorias, container, onSelect) {
  const chips = [{ slug: 'todos', label: 'Todos' }, ...categorias];
  container.innerHTML = chips
    .map(
      (c, i) => `
        <button type="button" class="portfolio-filter__chip"
          data-filter="${c.slug}" aria-pressed="${i === 0}">
          ${c.label}
        </button>`
    )
    .join('');

  qsa('[data-filter]', container).forEach((btn) => {
    on(btn, 'click', () => {
      qsa('[data-filter]', container).forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      onSelect(btn.dataset.filter);
    });
  });
}

export async function initPortfolioFilter() {
  const gridEl = qs('[data-portfolio-grid]');
  const filterEl = qs('[data-portfolio-filter]');
  if (!gridEl) return;

  let portfolio = [];
  try {
    const response = await fetch('/data/portfolio.json');
    portfolio = await response.json();
  } catch (error) {
    console.error('Falha ao carregar portfolio.json', error);
    return;
  }

  gridEl.innerHTML = portfolio.map(renderCard).join('');

  // Filtrar automaticamente pelo parâmetro ?filter= na URL
  const urlFilter = new URLSearchParams(window.location.search).get('filter');
  if (urlFilter && filterEl) {
    const chip = filterEl.querySelector(`[data-filter="${urlFilter}"]`);
    if (chip) {
      // Simula clique no chip correspondente
      chip.click();
      // Scroll suave até à grelha
      setTimeout(() => gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }
  }

  // Abrir modal ao clicar num card
  qsa('[data-slug]', gridEl).forEach((card) => {
    on(card, 'click', () => {
      const slug = card.dataset.slug;
      const item = portfolio.find((p) => p.slug === slug);
      if (item) abrirModal(item);
    });
  });

  // Filtros
  if (filterEl) {
    const categoriasUnicas = [
      ...new Map(
        portfolio.map((item) => [
          item.categoriaSlug,
          { slug: item.categoriaSlug, label: item.categoriaLabel },
        ])
      ).values(),
    ].filter((c) => c.slug && c.label);

    renderFilterChips(categoriasUnicas, filterEl, (categoriaSlug) => {
      qsa('.work-block', gridEl).forEach((card) => {
        const matches = categoriaSlug === 'todos' || card.dataset.categoria === categoriaSlug;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  }
}