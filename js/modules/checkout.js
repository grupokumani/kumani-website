/**
 * KUMANI — Página /checkout
 * Recolhe dados de entrega e envia o pedido via WhatsApp.
 * A integração PaySuite (M-Pesa/e-Mola/cartão) fica pronta em
 * functions/api/criar-pagamento.js para ser reactivada no futuro —
 * este ficheiro, por agora, não a chama.
 */

import { qs } from '../utils/dom.js';
import { obterItens, calcularTotal, limparCarrinho } from './cart.js';

const NUMERO_WHATSAPP = '258877335506';

function formatPrice(value) {
  return `${value.toLocaleString('pt-PT')} MZN`;
}

function renderResumo() {
  const items = obterItens();
  const listEl = qs('[data-checkout-items]');
  const totalEl = qs('[data-checkout-total]');

  listEl.innerHTML = items
    .map(
      (item) => `
        <div class="checkout-summary__item">
          <span>${item.nome} × ${item.quantidade}</span>
          <span>${formatPrice(item.preco * item.quantidade)}</span>
        </div>
      `
    )
    .join('');

  totalEl.textContent = formatPrice(calcularTotal());
}

function mostrarErro(mensagem) {
  const el = qs('[data-checkout-error]');
  el.textContent = mensagem;
  el.style.display = 'block';
}

function montarMensagemPedido(cliente, itens, total) {
  const linhas = itens
    .map((item) => `- ${item.nome} x${item.quantidade} (${formatPrice(item.preco * item.quantidade)})`)
    .join('\n');

  return (
    `Olá! Gostaria de finalizar este pedido na Loja KUMANI:\n\n` +
    `${linhas}\n\n` +
    `Total: ${formatPrice(total)}\n\n` +
    `Dados de entrega:\n` +
    `Nome: ${cliente.nome}\n` +
    `Telefone: ${cliente.telefone}\n` +
    `Email: ${cliente.email}\n` +
    `Morada: ${cliente.morada}`
  );
}

export function initCheckout() {
  const form = qs('[data-checkout-form]');
  if (!form) return;

  const items = obterItens();
  if (items.length === 0) {
    window.location.href = '/carrinho.html';
    return;
  }

  renderResumo();

  const submitBtn = qs('[data-checkout-submit]', form);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    qs('[data-checkout-error]').style.display = 'none';

    const dadosCliente = {
      nome: qs('[name="nome"]', form).value.trim(),
      telefone: qs('[name="telefone"]', form).value.trim(),
      email: qs('[name="email"]', form).value.trim(),
      morada: qs('[name="morada"]', form).value.trim(),
    };

    if (!dadosCliente.nome || !dadosCliente.telefone || !dadosCliente.morada) {
      mostrarErro('Preencha nome, telefone e morada de entrega.');
      return;
    }

    const itensAtuais = obterItens();
    const total = calcularTotal();
    const mensagem = montarMensagemPedido(dadosCliente, itensAtuais, total);
    const linkWhatsapp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    // O carrinho só é limpo depois de o link do WhatsApp estar montado
    // e prestes a abrir — a encomenda passa a ser confirmada
    // manualmente pela equipa KUMANI na conversa do WhatsApp.
    limparCarrinho();
    window.open(linkWhatsapp, '_blank', 'noopener');
    window.location.href = '/encomenda-confirmada.html';
  });
}