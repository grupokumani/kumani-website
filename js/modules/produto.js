/**
 * KUMANI — Página /produto/produto.html
 */

import { qs, on } from '../utils/dom.js';
import { adicionarItem } from './cart.js';

function getSlugFromURL() {
  return new URLSearchParams(window.location.search).get('slug');
}

function formatPrice(value, currency) {
  return `${value.toLocaleString('pt-PT')} ${currency}`;
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
    ? `background-image:url('${produto.imagem}');background-size:cover;background-position:center;`
    : `background-color:${produto.corPlaceholder};`;

  if (produto.badge) {
    qs('[data-product-badge]').textContent = produto.badge;
    qs('[data-product-badge]').style.display = 'inline-block';
  }

  qs('[data-product-name]').textContent = produto.nome;
  qs('[data-product-price]').textContent = formatPrice(produto.preco, produto.moeda);
  qs('[data-product-descricao]').textContent = produto.descricao;

  let quantidade = 1;
  const qtyValueEl = qs('[data-qty-value]');

  on(qs('[data-qty-decrease]'), 'click', () => {
    quantidade = Math.max(1, quantidade - 1);
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