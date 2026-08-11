/**
 * KUMANI — Módulo da Homepage
 * Busca portfolio.json, produtos.json e clientes.json e constrói o
 * HTML das secções "O nosso trabalho", Loja e Parceiros. Mantém o
 * conteúdo como dados, nunca escrito à mão no HTML — acrescentar um
 * projecto, produto ou cliente passa a ser só editar o JSON.
 */

import { qs } from '../utils/dom.js';

async function fetchJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function renderWorkBlock(item) {
  const sizeClass =
    item.tamanho === 'large' ? 'work-block--large' : 'work-block--small';
  const mediaStyle = item.imagem
    ? `background-image:url('${item.imagem}');background-size:cover;background-position:center;`
    : `background-color:${item.corPlaceholder};`;

  const playIcon = item.temVideo
    ? `<div class="work-block__play" aria-hidden="true">
         <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
       </div>`
    : '';

  return `
    <a href="/projectos/projecto.html?slug=${item.slug}" class="work-block ${sizeClass}" data-reveal aria-label="Ver case study: ${item.cliente}">
      <div class="work-block__media" style="${mediaStyle}"></div>
      <div class="work-block__overlay"></div>
      ${playIcon}
      <div class="work-block__caption">
        <div class="work-block__client">${item.cliente}</div>
        <div class="work-block__category">${item.categoria}</div>
      </div>
    </a>
  `;
}

function renderWorkGrid(items) {
  const large = items.find((item) => item.tamanho === 'large');
  const small = items.filter((item) => item.tamanho === 'small');

  return `
    ${large ? renderWorkBlock(large) : ''}
    <div class="work-grid__stack">
      ${small.map(renderWorkBlock).join('')}
    </div>
  `;
}

function formatPrice(value, currency) {
  return `${value.toLocaleString('pt-PT')} ${currency}`;
}

function renderProductCard(item) {
  const mediaStyle = item.imagem
    ? `background-image:url('${item.imagem}');background-size:cover;background-position:center;`
    : `background-color:${item.corPlaceholder};`;

  const badge = item.badge
    ? `<span class="product-card__badge">${item.badge}</span>`
    : '';

  return `
    <article class="product-card" data-reveal>
      <a href="/produto/produto.html?slug=${item.slug}" aria-label="Ver produto: ${item.nome}">
        <div class="product-card__media" style="${mediaStyle}">
          ${badge}
        </div>
      </a>
      <div class="product-card__body">
        <h3 class="product-card__name">${item.nome}</h3>
        <div class="product-card__footer">
          <span class="product-card__price">${formatPrice(item.preco, item.moeda)}</span>
          <button type="button" class="btn btn--primary btn--sm" data-add-to-cart="${item.id}">
            Pedir agora
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderClientLogo(item) {
  const content = item.logo
    ? `<img src="${item.logo}" alt="${item.nome}" loading="lazy">`
    : '';

  return `<div class="clients-grid__logo">${content}</div>`;
}

export async function initHomepage() {
  const workGridEl = qs('[data-work-grid]');
  const productGridEl = qs('[data-product-grid]');
  const clientsGridEl = qs('[data-clients-grid]');

  if (workGridEl) {
   const portfolio = await fetchJSON('/data/portfolio.json');
   const destaques = portfolio.filter((item) => item.destaqueHome);
   workGridEl.innerHTML = renderWorkGrid(destaques);
  }

  if (productGridEl) {
    const produtos = await fetchJSON('/data/produtos.json');
    productGridEl.innerHTML = produtos.map(renderProductCard).join('');
  }

  if (clientsGridEl) {
    const clientes = await fetchJSON('/data/clientes.json');
    clientsGridEl.innerHTML = clientes.map(renderClientLogo).join('');
  }
}