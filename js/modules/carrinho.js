/**
 * KUMANI — Página /carrinho
 */

import { qs, on } from '../utils/dom.js';
import { obterItens, actualizarQuantidade, removerItem, calcularTotal } from './cart.js';

function formatPrice(value) {
  return `${value.toLocaleString('pt-PT')} MZN`;
}

function renderCartItem(item) {
  const mediaStyle = item.imagem
    ? `background-image:url('${item.imagem}');background-size:cover;background-position:center;`
    : `background-color:${item.corPlaceholder};`;

  return `
    <div class="cart-item" data-cart-item="${item.id}">
      <div class="cart-item__media" style="${mediaStyle}"></div>
      <div>
        <div class="cart-item__name">${item.nome}</div>
        <div class="cart-item__price">${formatPrice(item.preco)} cada</div>
      </div>
      <div class="cart-item__qty">
        <button type="button" class="btn-icon" data-qty-decrease="${item.id}" aria-label="Diminuir quantidade">−</button>
        <span class="cart-item__qty-value">${item.quantidade}</span>
        <button type="button" class="btn-icon" data-qty-increase="${item.id}" aria-label="Aumentar quantidade">+</button>
      </div>
      <button type="button" class="cart-item__remove" data-remove-item="${item.id}">Remover</button>
    </div>
  `;
}

function render() {
  const listEl = qs('[data-cart-list]');
  const emptyEl = qs('[data-cart-empty]');
  const summaryEl = qs('[data-cart-summary]');
  const totalEl = qs('[data-cart-total]');
  if (!listEl) return;

  const items = obterItens();

  if (items.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    summaryEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  summaryEl.style.display = 'block';
  listEl.innerHTML = items.map(renderCartItem).join('');
  totalEl.textContent = formatPrice(calcularTotal());
}

export function initCarrinho() {
  const root = qs('[data-cart-page]');
  if (!root) return;

  render();

  on(root, 'click', (event) => {
    const decreaseId = event.target.dataset.qtyDecrease;
    const increaseId = event.target.dataset.qtyIncrease;
    const removeId = event.target.dataset.removeItem;

    if (decreaseId) {
      const item = obterItens().find((i) => i.id === decreaseId);
      if (item) actualizarQuantidade(decreaseId, item.quantidade - 1);
    }

    if (increaseId) {
      const item = obterItens().find((i) => i.id === increaseId);
      if (item) actualizarQuantidade(increaseId, item.quantidade + 1);
    }

    if (removeId) {
      removerItem(removeId);
    }
  });

  document.addEventListener('cart:updated', render);
}