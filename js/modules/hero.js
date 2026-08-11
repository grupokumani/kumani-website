/**
 * KUMANI — Módulo do Hero
 * Decide entre modo vídeo e modo fallback (crossfade de imagens):
 * - Se o utilizador tem prefers-reduced-motion activo, usa sempre o
 *   modo estático (primeira imagem, sem animação, vídeo pausado).
 * - Caso contrário, tenta o vídeo; se falhar a carregar (ficheiro em
 *   falta, formato não suportado, erro de rede) ou não arrancar em
 *   3 segundos, recua automaticamente para o crossfade de imagens.
 */

import { qs } from '../utils/dom.js';

const VIDEO_TIMEOUT_MS = 3000;

export function initHero() {
  const hero = qs('[data-hero]');
  if (!hero) return;

  const video = qs('[data-hero-video]', hero);
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

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
    // readyState < 2 (HAVE_CURRENT_DATA) significa que o vídeo ainda
    // não tem um frame pronto a mostrar — assume-se falha silenciosa.
    if (video.readyState < 2) {
      activateFallback();
    }
  }, VIDEO_TIMEOUT_MS);
}