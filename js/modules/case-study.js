/**
 * KUMANI — Página /projetos/projeto.html
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

  document.title = `${projeto.cliente} — Case Study — KUMANI`;

  qs('[data-case-category]').textContent = projeto.categoriaLabel;
  qs('[data-case-client]').textContent = projeto.cliente;

  const heroMedia = qs('[data-case-hero-media]');
  heroMedia.style.cssText = projeto.imagem
    ? `background-image:url('${projeto.imagem}');background-size:cover;background-position:center;`
    : `background-color:${projeto.corPlaceholder};`;

  qs('[data-case-problema]').textContent = projeto.problema;
  qs('[data-case-objectivo]').textContent = projeto.objectivo;
  qs('[data-case-estrategia]').textContent = projeto.estrategia;
  qs('[data-case-execucao]').textContent = projeto.execucao;
  qs('[data-case-resultado]').textContent = projeto.resultado;

  qs('[data-case-gallery]').innerHTML = projeto.galeria
    .map(renderGalleryItem)
    .join('');
}