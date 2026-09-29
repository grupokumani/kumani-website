/**
 * KUMANI — Página /produto/produto.html
 */

import { qs, on, resolveAssetPath } from '../utils/dom.js';
import { adicionarItem } from './cart.js';

function getSlugFromURL() {
  return new URLSearchParams(window.location.search).get('slug');
}

function formatPrice(value, currency) {
  return `${value.toLocaleString('pt-PT')} ${currency}`;
}

function renderBadges(produto) {
  const el = qs('[data-product-badge]');
  if (!el) return;

  const maisVendido = produto.maisVendido || (produto.badge && /mais vendido/i.test(produto.badge));
  const badges = [];
  if (produto.promocao) badges.push('<span class="product-card__badge product-card__badge--promo">Promoção</span>');
  if (maisVendido) badges.push('<span class="product-card__badge product-card__badge--best">Mais vendido</span>');
  if (!produto.promocao && !maisVendido && produto.badge) {
    badges.push(`<span class="product-card__badge">${produto.badge}</span>`);
  }

  if (badges.length === 0) return;
  el.innerHTML = badges.join('');
  el.style.display = 'inline-flex';
}

function renderPreco(produto) {
  const el = qs('[data-product-price]');
  if (produto.promocao && produto.promocao.precoOriginal) {
    el.innerHTML = `
      <span class="product-card__price--old">${formatPrice(produto.promocao.precoOriginal, produto.moeda)}</span>
      <span class="product-card__price--now">${formatPrice(produto.preco, produto.moeda)}</span>`;
  } else {
    el.textContent = formatPrice(produto.preco, produto.moeda);
  }
}

export async function initProdutoDetalhe() {
  const root = qs('[data-product-detail]');
  if (!root) return;

  const slug = getSlugFromURL();
  if (!slug) {
    window.location.href = '/loja.html';
    return;
  }

  let produtos = [];
  try {
    const response = await fetch('/data/produtos.json');
    produtos = await response.json();
  } catch (error) {
    console.error('Falha ao carregar produtos.json', error);
    return;
  }

  const produto = produtos.find((p) => p.slug === slug);
  if (!produto) {
    window.location.href = '/loja.html';
    return;
  }

  document.title = `${produto.nome} — Loja KUMANI`;

  const mediaEl = qs('[data-product-media]');
  mediaEl.style.cssText = produto.imagem
    ? `background-image:url('${resolveAssetPath(produto.imagem)}');background-size:cover;background-position:center;`
    : `background-color:${produto.corPlaceholder || 'var(--color-neutral-200)'};`;

  renderBadges(produto);
  renderPreco(produto);

  qs('[data-product-name]').textContent = produto.nome;
  qs('[data-product-descricao]').textContent = produto.descricao;

  const qtdMinima = produto.quantidadeMinima || 1;
  const minQtyEl = qs('[data-product-min-qty]');
  if (minQtyEl) minQtyEl.textContent = `Quantidade mínima: ${qtdMinima}`;

  let quantidade = qtdMinima;
  const qtyValueEl = qs('[data-qty-value]');
  qtyValueEl.textContent = quantidade;

  on(qs('[data-qty-decrease]'), 'click', () => {
    quantidade = Math.max(qtdMinima, quantidade - 1);
    qtyValueEl.textContent = quantidade;
  });

  on(qs('[data-qty-increase]'), 'click', () => {
    quantidade += 1;
    qtyValueEl.textContent = quantidade;
  });

  on(qs('[data-add-to-cart]'), 'click', () => {
    adicionarItem(produto, quantidade);
    window.location.href = '/carrinho.html';
  });
}