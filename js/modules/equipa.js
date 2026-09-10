/**
 * KUMANI — Bloco de Equipa (página /sobre.html)
 */
import { qs, resolveAssetPath } from '../utils/dom.js';

function renderTeamCard(pessoa) {
  const linkedin = pessoa.linkedin
    ? `<a href="${pessoa.linkedin}" class="sobre-team-card__linkedin" aria-label="${pessoa.nome} no LinkedIn" target="_blank" rel="noopener">
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1.5A5.98 5.98 0 0 1 16 8z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
       </a>`
    : '';

  return `
    <div class="sobre-team-card">
      <div class="sobre-team-card__photo-wrap">
        <img class="sobre-team-card__photo" src="${resolveAssetPath(pessoa.foto)}" alt="${pessoa.nome}" loading="lazy">
      </div>
      <div class="sobre-team-card__name">${pessoa.nome}</div>
      <div class="sobre-team-card__role">${pessoa.cargo}</div>
      ${linkedin}
    </div>
  `;
}

export async function initEquipa() {
  const gridEl = qs('[data-team-grid]');
  if (!gridEl) return;

  try {
    const response = await fetch('/data/equipa.json');
    const equipa = await response.json();
    gridEl.innerHTML = equipa.map(renderTeamCard).join('');
  } catch (error) {
    console.error('Falha ao carregar equipa.json', error);
  }
}