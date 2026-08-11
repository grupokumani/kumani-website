/**
 * KUMANI — Utilitário de scroll reveal
 * Adiciona a classe "is-visible" a qualquer elemento com
 * [data-reveal] quando entra ~20% no viewport. Usa IntersectionObserver
 * (leve, sem listener contínuo de scroll). Se o browser não suportar
 * IntersectionObserver, os elementos ficam sempre visíveis (degradação
 * segura, nunca conteúdo escondido para sempre).
 */

export function initRevealOnScroll(selector = '[data-reveal]') {
  const elements = Array.from(document.querySelectorAll(selector));
  if (elements.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((el) => observer.observe(el));
}