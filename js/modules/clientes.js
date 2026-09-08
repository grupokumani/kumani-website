/**
 * KUMANI — Página /clientes
 */

import { qs } from '../utils/dom.js';

function renderClientLogo(item) {
  const label = item.nome || 'Cliente';
  const content = item.logo
    ? `<img src="${item.logo}" alt="${label}" loading="lazy" onerror="this.style.display='none'">`
    : '';
  return `<div class="clients-grid__logo" aria-label="${label}">${content}</div>`;
}

export async function initClientesPage() {
  const gridEl = qs('[data-clients-grid]');
  if (!gridEl) return;

  try {
    const response = await fetch('/data/clientes.json');
    const clientes = await response.json();
    gridEl.innerHTML = clientes.map(renderClientLogo).join('');
  } catch (error) {
    console.error('Falha ao carregar clientes.json', error);
  }
}