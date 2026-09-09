/**
 * KUMANI — Utilitários DOM
 */

export const qs = (selector, scope = document) => scope.querySelector(selector);

export const qsa = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

export const on = (element, event, handler, options) => {
  element.addEventListener(event, handler, options);
};

// Garante que um caminho de imagem funciona em qualquer página do site,
// mesmo dentro de subpastas como /projectos/ ou /produto/.
export const resolveAssetPath = (path) => {
  if (!path) return path;
  return path.startsWith('/') || path.startsWith('http') ? path : `/${path}`;
};