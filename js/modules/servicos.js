/**
 * KUMANI — Página /servicos (listagem)
 */

import { qs } from '../utils/dom.js';

function renderServiceCard(item) {
  return `
    <a href="/servicos/servico.html?slug=${item.slug}" class="service-card" data-reveal>
      <h2 class="service-card__name">${item.nome}</h2>
      <p class="service-card__resumo">${item.resumo}</p>
    </a>
  `;
}

export async function initServicos() {
  const gridEl = qs('[data-services-grid]');
  if (!gridEl) return;

  try {
    const response = await fetch('/data/servicos.json');
    const servicos = await response.json();
    gridEl.innerHTML = servicos.map(renderServiceCard).join('');
  } catch (error) {
    console.error('Falha ao carregar servicos.json', error);
  }
}