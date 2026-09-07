/**
 * KUMANI — Feedback de formulários (sucesso/erro)
 * Partilhado entre contacto.js e quote-form.js. Usa aria-live para
 * que leitores de ecrã anunciem a mensagem automaticamente.
 */
export function mostrarMensagem(container, tipo, texto) {
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  container.innerHTML = `<div class="form-message form-message--${tipo}">${texto}</div>`;
}