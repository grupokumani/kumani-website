/**
 * KUMANI — Módulo do Hero
 * Decide entre modo vídeo e modo fallback (crossfade de imagens), e
 * dispara o reveal linha-a-linha, palavra-a-palavra do headline —
 * deliberadamente lento (não instantâneo), com o badge e o CTA a
 * entrarem só depois do headline terminar.
 */

import { qs, qsa } from '../utils/dom.js';

const VIDEO_TIMEOUT_MS = 3000;
const ATRASO_ENTRE_PALAVRAS_MS = 140;
const ATRASO_INICIAL_MS = 300;

function prepararHeadlineParaReveal(hero) {
  const linhas = qsa('[data-hero-line]', hero);
  if (linhas.length === 0 || linhas[0].dataset.split === 'true') return;

  let contadorPalavras = 0;

  linhas.forEach((linhaEl) => {
    const textoOriginal = linhaEl.textContent.trim();
    linhaEl.setAttribute('aria-label', textoOriginal);

    const palavras = textoOriginal.split(/\s+/);
    linhaEl.innerHTML = palavras
      .map((palavra) => {
        const atraso = ATRASO_INICIAL_MS + contadorPalavras * ATRASO_ENTRE_PALAVRAS_MS;
        contadorPalavras += 1;
        return `<span class="hero__word" style="transition-delay:${atraso}ms">${palavra}</span>`;
      })
      .join(' ');

    linhaEl.dataset.split = 'true';
  });

  return contadorPalavras;
}

function dispararReveal(hero, totalPalavras) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.classList.add('hero--words-visible');
    });
  });

  // O badge/CTA só entram depois de a última palavra ter começado a
  // aparecer, com uma pequena folga — nunca ao mesmo tempo que o texto.
  const atrasoConteudo = ATRASO_INICIAL_MS + totalPalavras * ATRASO_ENTRE_PALAVRAS_MS + 300;
  setTimeout(() => {
    hero.classList.add('hero--content-visible');
  }, atrasoConteudo);
}

export function initHero() {
  const hero = qs('[data-hero]');
  if (!hero) return;

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const totalPalavras = prepararHeadlineParaReveal(hero) || 0;

  if (prefersReduced) {
    hero.classList.add('hero--words-visible', 'hero--content-visible');
  } else {
    dispararReveal(hero, totalPalavras);
  }

  const video = qs('[data-hero-video]', hero);

  if (prefersReduced) {
    hero.classList.add('hero--static');
    if (video) video.pause();
    return;
  }

  if (!video) {
    hero.classList.add('hero--fallback');
    return;
  }

  const activateFallback = () => {
    hero.classList.add('hero--fallback');
  };

  video.addEventListener('error', activateFallback, true);

  setTimeout(() => {
    if (video.readyState < 2) {
      activateFallback();
    }
  }, VIDEO_TIMEOUT_MS);
}