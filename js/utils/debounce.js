/**
 * KUMANI — Utilitário de debounce
 * Atrasa a execução de uma função até que pare de ser chamada durante
 * "delay" ms — usado na pesquisa, para não filtrar a cada tecla.
 */

export function debounce(fn, delay = 250) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}