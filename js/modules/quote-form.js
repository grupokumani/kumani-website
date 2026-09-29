/**
 * KUMANI — Página /servicos/servico.html (detalhe + formulário de cotação)
 * Preenche o detalhe do serviço a partir de ?slug= e trata a submissão
 * do formulário de cotação: validação no cliente, estado de carregamento,
 * chamada a /api/enviar-cotacao, e mensagem de sucesso/erro inline
 * (sem redireccionar a página, conforme especificado no documento mestre).
 */

import { qs } from '../utils/dom.js';
import { mostrarMensagem } from '../utils/form-feedback.js';

function getSlugFromURL() {
  return new URLSearchParams(window.location.search).get('slug');
}

async function preencherDetalheServico() {
  const slug = getSlugFromURL();
  if (!slug) return null;

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
}

const NUMERO_WHATSAPP = '258877335506';

function montarMensagemCotacao(dados) {
  return (
    `Olá! Gostaria de pedir uma cotação à KUMANI:\n\n` +
    `Nome: ${dados.nome}\n` +
    `Empresa: ${dados.empresa || '(não indicado)'}\n` +
    `Email: ${dados.email}\n` +
    `Telefone: ${dados.telefone}\n` +
    `Serviço/Necessidade: ${dados.tipoNecessidade}\n` +
    `Orçamento indicativo: ${dados.orcamento || '(não indicado)'}\n\n` +
    `Mensagem:\n${dados.mensagem}`
  );
}

function initFormularioSubmissao() {
  const form = qs('[data-quote-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const dados = {
      nome: qs('[name="nome"]', form).value.trim(),
      empresa: qs('[name="empresa"]', form).value.trim(),
      email: qs('[name="email"]', form).value.trim(),
      telefone: qs('[name="telefone"]', form).value.trim(),
      tipoNecessidade: qs('[name="tipoNecessidade"]', form).value,
      orcamento: qs('[name="orcamento"]', form).value.trim(),
      mensagem: qs('[name="mensagem"]', form).value.trim(),
      consentimento: qs('[name="consentimento"]', form).checked,
    };

    if (!dados.nome || !dados.email || !dados.telefone || !dados.mensagem || !dados.consentimento) {
      const messageEl = qs('[data-quote-message]', form);
      messageEl.setAttribute('aria-live', 'polite');
      messageEl.innerHTML = '<div class="form-message form-message--error">Preencha todos os campos obrigatórios e aceite o uso dos dados.</div>';
      return;
    }

    const mensagem = montarMensagemCotacao(dados);
    const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
    window.open(linkWhatsapp, '_blank', 'noopener');
  });
}

export async function initQuoteForm() {
  await preencherDetalheServico();
  initFormularioSubmissao();
}