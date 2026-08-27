/**
 * KUMANI — Módulo do Hero
 * Decide entre modo vídeo e modo fallback (crossfade de imagens), e
 * dispara o reveal palavra-a-palavra do headline ("efeito cortina")
 * assim que a página estiver pronta a mostrar conteúdo.
 */

import { qs } from '../utils/dom.js';

const VIDEO_TIMEOUT_MS = 3000;

function prepararHeadlineParaReveal(hero) {
  const headlineEl = qs('.hero__headline', hero);
  if (!headlineEl || headlineEl.dataset.split === 'true') return;

  const textoOriginal = headlineEl.textContent.trim();
  const palavras = textoOriginal.split(/\s+/);

  headlineEl.setAttribute('aria-label', textoOriginal);
  headlineEl.innerHTML = palavras
    .map(
      (palavra, index) => `
        <span class="hero__headline-mask" aria-hidden="true">
          <span class="hero__headline-word" style="transition-delay:${index * 80}ms">${palavra}</span>
        </span>
      `
    )
    .join(' ');

  headlineEl.dataset.split = 'true';
}

function dispararReveal(hero) {
  // requestAnimationFrame duplo garante que o browser já pintou o
  // estado inicial (invisível) antes de aplicarmos a classe que activa
  // a transição — sem isto, a animação às vezes "salta" sem se ver.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.classList.add('hero--words-visible');
    });
  });

  setTimeout(() => {
    hero.classList.add('hero--content-visible');
  }, 500);
}

export function initHero() {
  const hero = qs('[data-hero]');
  if (!hero) return;

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  prepararHeadlineParaReveal(hero);

  if (prefersReduced) {
    hero.classList.add('hero--words-visible', 'hero--content-visible');
  } else {
    dispararReveal(hero);
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