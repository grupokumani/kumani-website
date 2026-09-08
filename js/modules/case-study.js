/**
 * KUMANI — Página /projectos/projecto.html
 * Lê ?slug= do URL, encontra o projecto correspondente em
 * portfolio.json e preenche o template. Se o slug não existir,
 * redirecciona para /portfolio.html em vez de mostrar uma página vazia.
 */

import { qs } from '../utils/dom.js';

function getSlugFromURL() {
  return new URLSearchParams(window.location.search).get('slug');
}

function renderGalleryItem(item) {
  const style = item.imagem
    ? `background-image:url('${item.imagem}');background-size:cover;background-position:center;`
    : `background-color:${item.corPlaceholder};`;
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

    // Título legível: usa "nome"/"cliente" se existir nos dados;
  // senão, deriva do slug (ex: "cooperacao-alema" → "Cooperacao Alema").
  const titulo =
    projeto.nome ||
    projeto.cliente ||
    projeto.slug
      .split('-')
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');

  document.title = `${titulo} — Case Study — KUMANI`;

  qs('[data-case-category]').textContent = projeto.categoriaLabel || '';
  qs('[data-case-client]').textContent = titulo;

  const heroMedia = qs('[data-case-hero-media]');
  heroMedia.style.cssText = projeto.imagem
    ? `background-image:url('${projeto.imagem}');background-size:cover;background-position:center;`
    : `background-color:${projeto.corPlaceholder || 'var(--color-neutral-800)'};`;

  qs('[data-case-descricao]').textContent = projeto.descricao || '';

  // Alguns projectos têm "galeria": null ou false — trata como lista vazia.
  const galeria = Array.isArray(projeto.galeria) ? projeto.galeria : [];
  qs('[data-case-gallery]').innerHTML = galeria.map(renderGalleryItem).join('');
}