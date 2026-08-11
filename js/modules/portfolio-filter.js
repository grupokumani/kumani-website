/**
 * KUMANI — Página /portfolio
 * Busca portfolio.json completo, gera a grelha + os chips de filtro
 * dinamicamente (um chip por categoria única encontrada nos dados,
 * mais "Todos"), e filtra ao clicar sem reload de página.
 */

import { qs, qsa, on } from '../utils/dom.js';

function renderCard(item) {
  const mediaStyle = item.imagem
    ? `background-image:url('${item.imagem}');background-size:cover;background-position:center;`
    : `background-color:${item.corPlaceholder};`;

  return `
    <a href="/projectos/projecto.html?slug=${item.slug}"
       class="work-block"
       data-reveal
       data-categoria="${item.categoriaSlug}"
       aria-label="Ver case study: ${item.cliente}">
      <div class="work-block__media" style="${mediaStyle}"></div>
      <div class="work-block__overlay"></div>
      <div class="work-block__caption">
        <div class="work-block__client">${item.cliente}</div>
        <div class="work-block__category">${item.categoriaLabel}</div>
      </div>
    </a>
  `;
}

function renderFilterChips(categorias, container, onSelect) {
  const chips = [{ slug: 'todos', label: 'Todos' }, ...categorias];

  container.innerHTML = chips
    .map(
      (c, index) => `
        <button
          type="button"
          class="portfolio-filter__chip"
          data-filter="${c.slug}"
          aria-pressed="${index === 0}"
        >${c.label}</button>
      `
    )
    .join('');

  qsa('[data-filter]', container).forEach((btn) => {
    on(btn, 'click', () => {
      qsa('[data-filter]', container).forEach((b) =>
        b.setAttribute('aria-pressed', 'false')
      );
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

  if (filterEl) {
    const categoriasUnicas = [
      ...new Map(
        portfolio.map((item) => [
          item.categoriaSlug,
          { slug: item.categoriaSlug, label: item.categoriaLabel },
        ])
      ).values(),
    ];

    renderFilterChips(categoriasUnicas, filterEl, (categoriaSlug) => {
      qsa('.work-block', gridEl).forEach((card) => {
        const matches =
          categoriaSlug === 'todos' || card.dataset.categoria === categoriaSlug;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  }
}