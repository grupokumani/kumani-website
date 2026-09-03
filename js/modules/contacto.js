/**
 * KUMANI — Página /contacto
 * Reaproveita a mesma function /api/enviar-cotacao já usada pelo
 * formulário de cotação (Fase 9) — o email chega igual, só com
 * "tipoNecessidade" fixo em "Contacto Geral".
 */

import { qs } from '../utils/dom.js';

function mostrarMensagem(container, tipo, texto) {
  container.innerHTML = `<div class="form-message form-message--${tipo}">${texto}</div>`;
}

export function initContacto() {
  const form = qs('[data-contact-form]');
  if (!form) return;

  const submitBtn = qs('[data-contact-submit]', form);
  const messageEl = qs('[data-contact-message]', form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageEl.innerHTML = '';

    const dados = {
      nome: qs('[name="nome"]', form).value.trim(),
      empresa: '',
      email: qs('[name="email"]', form).value.trim(),
      telefone: qs('[name="telefone"]', form).value.trim(),
      tipoNecessidade: 'Contacto Geral',
      orcamento: '',
      mensagem: qs('[name="mensagem"]', form).value.trim(),
      consentimento: qs('[name="consentimento"]', form).checked,
    };

    submitBtn.setAttribute('data-loading', 'true');
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/enviar-cotacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      const resultado = await response.json();

      if (!response.ok || !resultado.sucesso) {
        mostrarMensagem(messageEl, 'error', resultado.erro || 'Não foi possível enviar. Tente novamente.');
        return;
      }

      mostrarMensagem(messageEl, 'success', 'Mensagem enviada! Entramos em contacto brevemente.');
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar contacto', error);
      mostrarMensagem(messageEl, 'error', 'Erro de ligação. Tente novamente.');
    } finally {
      submitBtn.removeAttribute('data-loading');
      submitBtn.disabled = false;
    }
  });
}