/**
 * KUMANI — Utilitários DOM
 */

export const qs = (selector, scope = document) => scope.querySelector(selector);

export const qsa = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

export const on = (element, event, handler, options) => {
  element.addEventListener(event, handler, options);
};