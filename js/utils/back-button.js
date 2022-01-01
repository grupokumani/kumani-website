/**
 * KUMANI — Botão voltar
 * Insere um botão "← Voltar" no topo de todas as páginas internas
 * (qualquer página onde exista [data-back-button]).
 * Usa history.back() com fallback para a homepage.
 */
export function initBackButton() {
  const el = document.querySelector('[data-back-button]');
  if (!el) return;

  const podeVoltar = window.history.length > 1 &&
                     document.referrer &&
                     new URL(document.referrer).hostname === window.location.hostname;

  el.addEventListener('click', () => {
    if (podeVoltar) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });

  el.style.display = 'inline-flex';
}