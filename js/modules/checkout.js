/**
 * KUMANI — Página /checkout
 * Recolhe dados de entrega/facturação, chama /api/criar-pagamento
 * e redirecciona o cliente para o checkout hospedado da PaySuite.
 */

import { qs } from '../utils/dom.js';
import { obterItens, calcularTotal } from './cart.js';

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

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    qs('[data-checkout-error]').style.display = 'none';
    submitBtn.setAttribute('data-loading', 'true');
    submitBtn.disabled = true;

    const dadosCliente = {
      nome: qs('[name="nome"]', form).value.trim(),
      telefone: qs('[name="telefone"]', form).value.trim(),
      email: qs('[name="email"]', form).value.trim(),
      morada: qs('[name="morada"]', form).value.trim(),
    };

    try {
      const response = await fetch('/api/criar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: dadosCliente, itens: obterItens() }),
      });

      const resultado = await response.json();

      if (!response.ok || !resultado.checkoutUrl) {
        mostrarErro(
          resultado.erro || 'Não foi possível iniciar o pagamento. Tente novamente.'
        );
        return;
      }

      // O carrinho só é limpo depois de sabermos que o pagamento foi
      // confirmado (na página de encomenda-confirmada.html), nunca aqui —
      // se o cliente cancelar na PaySuite e voltar atrás, o carrinho
      // continua intacto.
      window.location.href = resultado.checkoutUrl;
    } catch (error) {
      console.error('Erro ao criar pagamento', error);
      mostrarErro('Erro de ligação. Verifique a sua internet e tente novamente.');
    } finally {
      submitBtn.removeAttribute('data-loading');
      submitBtn.disabled = false;
    }
  });
}