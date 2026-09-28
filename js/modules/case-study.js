/**
 * KUMANI — Página /projectos/projecto.html
 */

import { qs, resolveAssetPath } from '../utils/dom.js';

function getSlugFromURL() {
  return new URLSearchParams(window.location.search).get('slug');
}

function renderGalleryItem(item) {
  const style = item.imagem
    ? `background-image:url('${resolveAssetPath(item.imagem)}');background-size:cover;background-position:center;`
    : `background-color:${item.corPlaceholder || 'var(--color-neutral-800)'};`;
  return `<div class="case-gallery__item" style="${style}"></div>`;
}

export async function initCaseStudy() {
  const root = qs('[data-case-study]');
  if (!root) return;

  const slug = getSlugFromURL();
  if (!slug) {
    window.location.href = '/portfolio.html';
    return;
  }

  let portfolio = [];
  try {
    const response = await fetch('/data/portfolio.json');
    portfolio = await response.json();
  } catch (error) {
    console.error('Falha ao carregar portfolio.json', error);
    return;
  }

  const projeto = portfolio.find((item) => item.slug === slug);
  if (!projeto) {
    window.location.href = '/portfolio.html';
    return;
  }

  // Título interno — só para a aba do browser/SEO, não aparece na página.
  const tituloInterno =
    projeto.nome ||
    projeto.cliente ||
    projeto.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  document.title = `${tituloInterno} — Case Study — KUMANI`;
  qs('[data-case-client]').textContent = tituloInterno;

  const localAno = [projeto.local, projeto.ano].filter(Boolean).join(' | ');
  qs('[data-case-meta]').textContent = localAno;

  const heroMedia = qs('[data-case-hero-media]');
  heroMedia.style.cssText = projeto.imagem
    ? `background-image:url('${resolveAssetPath(projeto.imagem)}');background-size:cover;background-position:center;`
    : `background-color:${projeto.corPlaceholder || 'var(--color-neutral-800)'};`;

  qs('[data-case-descricao]').textContent = projeto.descricao || '';

  const galeria = Array.isArray(projeto.galeria) ? projeto.galeria : [];
  qs('[data-case-gallery]').innerHTML = galeria.map(renderGalleryItem).join('');

  // Passa o contexto do projecto para o formulário de orçamento (ponto 4)
  const ctaLink = qs('[data-case-quote-link]');
  if (ctaLink) {
    ctaLink.href = `/contacto.html?origem=projecto&slug=${encodeURIComponent(projeto.slug)}&categoria=${encodeURIComponent(projeto.categoriaLabel || '')}`;
  }
}