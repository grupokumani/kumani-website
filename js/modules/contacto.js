/**
 * KUMANI — Página /contacto
 * Formulário "inteligente": se vier de um pedido de orçamento a partir
 * de um projecto do portfólio (?origem=projecto&slug=...&categoria=...),
 * mostra o contexto e inclui-o na mensagem enviada.
 */

import { qs } from '../utils/dom.js';
import { mostrarMensagem } from '../utils/form-feedback.js';

const NUMERO_WHATSAPP = '258877335506';

function getContexto() {
  const params = new URLSearchParams(window.location.search);
  const origem = params.get('origem');
  if (!origem) return null;
  return {
    origem,
    slug: params.get('slug') || '',
    categoria: params.get('categoria') || '',
  };
}

function mostrarBannerContexto(contexto) {
  const banner = qs('[data-contact-context]');
  if (!banner || !contexto) return;
  banner.textContent = contexto.categoria
    ? `A pedir orçamento para um projecto semelhante a: ${contexto.categoria}`
    : 'A pedir orçamento para um projecto semelhante.';
  banner.style.display = 'block';
}

function montarMensagemContacto(dados, contexto) {
  const linhaContexto = contexto
    ? `Origem: Pedido de orçamento (categoria: ${contexto.categoria || 'n/d'})\n`
    : '';

  return (
    `Olá! Vim pelo site da KUMANI e gostaria de falar convosco:\n` +
    linhaContexto +
    `\nNome: ${dados.nome}\n` +
    `Empresa: ${dados.empresa || '(não indicado)'}\n` +
    `Área de actuação: ${dados.areaActuacao || '(não indicado)'}\n` +
    `Telefone: ${dados.telefone}\n` +
    `Email: ${dados.email}\n` +
    `Orçamento disponível: ${dados.orcamento || '(não indicado)'}\n\n` +
    `Mensagem:\n${dados.mensagem}`
  );
}

export function initContacto() {
  const form = qs('[data-contact-form]');
  if (!form) return;

  const contexto = getContexto();
  mostrarBannerContexto(contexto);

  const submitBtn = qs('[data-contact-submit]', form);
  const messageEl = qs('[data-contact-message]', form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageEl.innerHTML = '';

    const dados = {
      nome: qs('[name="nome"]', form).value.trim(),
      empresa: qs('[name="empresa"]', form).value.trim(),
      areaActuacao: qs('[name="areaActuacao"]', form).value.trim(),
      email: qs('[name="email"]', form).value.trim(),
      telefone: qs('[name="telefone"]', form).value.trim(),
      tipoNecessidade: contexto ? `Orçamento — ${contexto.categoria || 'projecto do portfólio'}` : 'Contacto Geral',
      orcamento: qs('[name="orcamento"]', form).value,
      mensagem: qs('[name="mensagem"]', form).value.trim(),
      consentimento: qs('[name="consentimento"]', form).checked,
    };

    if (!dados.nome || !dados.email || !dados.telefone || !dados.mensagem || !dados.consentimento) {
      mostrarMensagem(messageEl, 'error', 'Preencha todos os campos obrigatórios e aceite o uso dos dados.');
      return;
    }

    const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(montarMensagemContacto(dados, contexto))}`;
    window.open(linkWhatsapp, '_blank', 'noopener');

    submitBtn.setAttribute('data-loading', 'true');
    submitBtn.disabled = true;

        try {
      await fetch('/api/enviar-cotacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
    } catch (error) {
      console.error('Erro ao enviar contacto por email (WhatsApp já foi enviado)', error);
    } finally {
      window.location.href = '/sucesso.html';
    }
  });
}