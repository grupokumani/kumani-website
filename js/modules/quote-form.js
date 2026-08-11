/**
 * KUMANI — Página /servicos/servico.html (detalhe + formulário de cotação)
 * Preenche o detalhe do serviço a partir de ?slug= e trata a submissão
 * do formulário de cotação: validação no cliente, estado de carregamento,
 * chamada a /api/enviar-cotacao, e mensagem de sucesso/erro inline
 * (sem redireccionar a página, conforme especificado no documento mestre).
 */

import { qs } from '../utils/dom.js';

function getSlugFromURL() {
  return new URLSearchParams(window.location.search).get('slug');
}

async function preencherDetalheServico() {
  const slug = getSlugFromURL();
  if (!slug) return null;

  try {
    const response = await fetch('/data/servicos.json');
    const servicos = await response.json();
    const servico = servicos.find((item) => item.slug === slug);

    if (!servico) return null;

    document.title = `${servico.nome} — KUMANI`;
    qs('[data-service-category]').textContent = 'Serviços KUMANI';
    qs('[data-service-title]').textContent = servico.nome;
    qs('[data-service-resumo]').textContent = servico.resumo;
    qs('[data-service-paraquem]').textContent = servico.paraQuem;
    qs('[data-service-inclui]').innerHTML = servico.inclui
      .map((item) => `<li>${item}</li>`)
      .join('');

    // Pré-selecciona o serviço no <select> do formulário, para o
    // visitante não ter de repetir o que já demonstrou interesse.
    const select = qs('[data-field-necessidade]');
    if (select) select.value = servico.nome;

    return servico;
  } catch (error) {
    console.error('Falha ao carregar servicos.json', error);
    return null;
  }
}

function mostrarMensagem(container, tipo, texto) {
  container.innerHTML = `<div class="form-message form-message--${tipo}">${texto}</div>`;
}

function initFormularioSubmissao() {
  const form = qs('[data-quote-form]');
  if (!form) return;

  const submitBtn = qs('[data-quote-submit]', form);
  const messageEl = qs('[data-quote-message]', form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    messageEl.innerHTML = '';

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
        mostrarMensagem(
          messageEl,
          'error',
          resultado.erro || 'Não foi possível enviar o pedido. Tente novamente.'
        );
        return;
      }

      mostrarMensagem(
        messageEl,
        'success',
        'Pedido enviado com sucesso! A nossa equipa entra em contacto brevemente.'
      );
      form.reset();
    } catch (error) {
      console.error('Erro ao submeter formulário de cotação', error);
      mostrarMensagem(
        messageEl,
        'error',
        'Erro de ligação. Verifique a sua internet e tente novamente.'
      );
    } finally {
      submitBtn.removeAttribute('data-loading');
      submitBtn.disabled = false;
    }
  });
}

export async function initQuoteForm() {
  await preencherDetalheServico();
  initFormularioSubmissao();
}