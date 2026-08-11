/**
 * KUMANI — Página /encomenda-confirmada
 * Lê ?ref= do URL (a referência da encomenda), consulta
 * /api/estado-encomenda e mostra o estado real. Limpa o carrinho
 * apenas quando o estado confirmado é "pago".
 */

import { qs } from '../utils/dom.js';
import { limparCarrinho } from './cart.js';

function getRefFromURL() {
  return new URLSearchParams(window.location.search).get('ref');
}

const ESTADOS = {
  pago: {
    classe: '',
    titulo: 'Pagamento confirmado!',
    texto: 'A sua encomenda foi recebida e o pagamento confirmado. Vamos entrar em contacto para combinar a entrega.',
  },
  pendente: {
    classe: 'confirmation-page--pending',
    titulo: 'Pagamento em processamento',
    texto: 'Estamos a aguardar a confirmação do seu pagamento. Esta página actualiza-se automaticamente.',
  },
  falhado: {
    classe: 'confirmation-page--failed',
    titulo: 'Pagamento não concluído',
    texto: 'O pagamento não foi concluído. Pode tentar novamente a partir do carrinho.',
  },
};

export async function initConfirmacao() {
  const root = qs('[data-confirmation-page]');
  if (!root) return;

  const ref = getRefFromURL();
  if (!ref) {
    root.classList.add('confirmation-page--failed');
    qs('[data-confirmation-title]').textContent = 'Encomenda não encontrada';
    qs('[data-confirmation-text]').textContent =
      'Não foi possível identificar a sua encomenda. Contacte-nos se acredita que isto é um erro.';
    return;
  }

  async function verificarEstado() {
    try {
      const response = await fetch(`/api/estado-encomenda?ref=${encodeURIComponent(ref)}`);
      const resultado = await response.json();
      const estado = ESTADOS[resultado.estado] || ESTADOS.pendente;

      root.className = `confirmation-page ${estado.classe}`;
      qs('[data-confirmation-title]').textContent = estado.titulo;
      qs('[data-confirmation-text]').textContent = estado.texto;

      if (resultado.estado === 'pago') {
        limparCarrinho();
      } else if (resultado.estado === 'pendente') {
        setTimeout(verificarEstado, 4000);
      }
    } catch (error) {
      console.error('Erro ao verificar estado da encomenda', error);
    }
  }

  verificarEstado();
}