/**
 * KUMANI — Página /loja
 */

import { qs, qsa, on } from '../utils/dom.js';
import { adicionarItem } from './cart.js';

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
        <div class="product-card__media" style="${mediaStyle}">${badge}</div>
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

function mostrarToast(texto) {
  let toast = qs('[data-cart-toast]');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.setAttribute('data-cart-toast', '');
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = texto;
  toast.classList.add('is-visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('is-visible'), 2500);
}

export async function initLoja() {
  const gridEl = qs('[data-store-grid]');
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

  on(gridEl, 'click', (event) => {
    const btn = event.target.closest('[data-add-to-cart]');
    if (!btn) return;

    const produto = produtos.find((p) => p.id === btn.dataset.addToCart);
    if (!produto) return;

    adicionarItem(produto, 1);
    mostrarToast(`${produto.nome} adicionado ao carrinho.`);
  });
}