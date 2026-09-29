/**
 * KUMANI — Página /loja
 * Hierarquia do cartão: imagem → preço → nome → qtd. mínima →
 * controlos de quantidade → badges (promoção/mais vendido).
 */

import { qs, qsa, on } from '../utils/dom.js';
import { adicionarItem } from './cart.js';

function formatPrice(value, currency) {
  return `${value.toLocaleString('pt-PT')} ${currency}`;
}

function renderBadges(item) {
  const maisVendido = item.maisVendido || (item.badge && /mais vendido/i.test(item.badge));
  const badges = [];
  if (item.promocao) badges.push('<span class="product-card__badge product-card__badge--promo">Promoção</span>');
  if (maisVendido) badges.push('<span class="product-card__badge product-card__badge--best">Mais vendido</span>');
  return badges.join('');
}

function renderPrecoBlock(item) {
  if (item.promocao && item.promocao.precoOriginal) {
    return `
      <span class="product-card__price--old">${formatPrice(item.promocao.precoOriginal, item.moeda)}</span>
      <span class="product-card__price--now">${formatPrice(item.preco, item.moeda)}</span>`;
  }
  return `<span class="product-card__price--now">${formatPrice(item.preco, item.moeda)}</span>`;
}

function renderProductCard(item) {
  const mediaStyle = item.imagem
    ? `background-image:url('${item.imagem}');background-size:cover;background-position:center;`
    : `background-color:${item.corPlaceholder || 'var(--color-neutral-200)'};`;

  const qtdMinima = item.quantidadeMinima || 1;

  return `
    <article class="product-card" data-reveal data-product-id="${item.id}">
      <a href="/produto/produto.html?slug=${item.slug}" class="product-card__media-link" aria-label="Ver produto: ${item.nome}">
        <div class="product-card__media" style="${mediaStyle}">
          ${renderBadges(item)}
        </div>
      </a>
      <div class="product-card__body">
        <div class="product-card__price">${renderPrecoBlock(item)}</div>
        <h3 class="product-card__name"><a href="/produto/produto.html?slug=${item.slug}">${item.nome}</a></h3>
        <p class="product-card__min-qty">Qtd. mínima: ${qtdMinima}</p>
        <div class="product-card__qty" data-qty-widget data-qty-min="${qtdMinima}">
          <button type="button" class="product-card__qty-btn" data-qty-decrease aria-label="Diminuir quantidade">−</button>
          <span class="product-card__qty-value" data-qty-value>${qtdMinima}</span>
          <button type="button" class="product-card__qty-btn" data-qty-increase aria-label="Aumentar quantidade">+</button>
        </div>
        <button type="button" class="btn btn--primary btn--full" data-add-to-cart>Pedir agora</button>
      </div>
    </article>
  `;
}

function initInteractions(gridEl, produtos) {
  qsa('[data-qty-widget]', gridEl).forEach((widget) => {
    const min = parseInt(widget.dataset.qtyMin, 10) || 1;
    const valueEl = qs('[data-qty-value]', widget);

    on(qs('[data-qty-decrease]', widget), 'click', () => {
      const atual = parseInt(valueEl.textContent, 10);
      if (atual > min) valueEl.textContent = atual - 1;
    });

    on(qs('[data-qty-increase]', widget), 'click', () => {
      valueEl.textContent = parseInt(valueEl.textContent, 10) + 1;
    });
  });

  qsa('[data-add-to-cart]', gridEl).forEach((btn) => {
    on(btn, 'click', () => {
      const card = btn.closest('[data-product-id]');
      const produto = produtos.find((p) => p.id === card.dataset.productId);
      if (!produto) return;
      const quantidade = parseInt(qs('[data-qty-value]', card).textContent, 10) || 1;
      adicionarItem(produto, quantidade);
    });
  });
}

export async function initLoja() {
  const gridEl = qs('[data-product-grid]');
  if (!gridEl) return;

  let produtos = [];
  try {
    const response = await fetch('/data/produtos.json');
    produtos = await response.json();
  } catch (error) {
    console.error('Falha ao carregar produtos.json', error);
    return;
  }

  gridEl.innerHTML = produtos.map(renderProductCard).join('');
  initInteractions(gridEl, produtos);
}