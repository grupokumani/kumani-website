/**
 * KUMANI — Página /contacto
 * Envia o contacto por dois canais em paralelo:
 * 1) Email via /api/enviar-cotacao (Resend) — já validado na Fase 1.
 * 2) WhatsApp, com a mensagem pré-escrita, para resposta mais rápida.
 */

import { qs } from '../utils/dom.js';
import { mostrarMensagem } from '../utils/form-feedback.js';

const NUMERO_WHATSAPP = '258877335506';

function montarMensagemContacto(dados) {
  return (
    `Olá! Vim pelo site da KUMANI e gostaria de falar convosco:\n\n` +
    `Nome: ${dados.nome}\n` +
    `Telefone: ${dados.telefone}\n` +
    `Email: ${dados.email}\n\n` +
    `Mensagem:\n${dados.mensagem}`
  );
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

    if (!dados.nome || !dados.email || !dados.telefone || !dados.mensagem || !dados.consentimento) {
      mostrarMensagem(messageEl, 'error', 'Preencha todos os campos obrigatórios e aceite o uso dos dados.');
      return;
    }

    // 1) Abre o WhatsApp já, de forma síncrona, para o browser não bloquear o popup.
    const mensagemWhatsapp = montarMensagemContacto(dados);
    const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagemWhatsapp)}`;
    window.open(linkWhatsapp, '_blank', 'noopener');

    // 2) Continua a enviar por email, em paralelo.
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
        mostrarMensagem(messageEl, 'success', 'Mensagem aberta no WhatsApp. (O envio por email falhou, mas o seu contacto via WhatsApp já foi enviado.)');
        return;
      }

      mostrarMensagem(messageEl, 'success', 'Mensagem enviada por WhatsApp e por email! Entramos em contacto brevemente.');
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar contacto por email', error);
      mostrarMensagem(messageEl, 'success', 'Mensagem aberta no WhatsApp. (O envio por email falhou, mas o seu contacto via WhatsApp já foi enviado.)');
    } finally {
      submitBtn.removeAttribute('data-loading');
      submitBtn.disabled = false;
    }
  });
}