/**
 * KUMANI — Checkout v2
 * Passo 1: dados de entrega
 * Passo 2: método de pagamento (transferência + WhatsApp; M-Pesa/e-Mola em breve)
 */

import { qs, qsa } from '../utils/dom.js';
import { obterItens, calcularTotal, limparCarrinho } from './cart.js';

const NUMERO_WHATSAPP = '258877335506';
const EMAIL_VENDAS   = 'vendas@grupokumani.com';

// ── Utilitários ──────────────────────────────────────────────────────
function formatPrice(v) {
  return `${v.toLocaleString('pt-PT')} MZN`;
}

function gerarRef() {
  return 'KUM-' + Date.now().toString(36).toUpperCase();
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res({ nome: file.name, tipo: file.type, base64: r.result.split(',')[1] });
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ── Renderizar resumo ────────────────────────────────────────────────
function renderResumo(itens) {
  const itemsEl = qs('[data-checkout-items]');
  const totalEl = qs('[data-checkout-total]');
  if (!itemsEl || !totalEl) return;

  itemsEl.innerHTML = itens.map((item) => `
    <div class="ck-summary__item">
      <div>
        <div class="ck-summary__item-name">${item.nome}</div>
        <div class="ck-summary__item-qty">Qtd: ${item.quantidade}</div>
      </div>
      <div class="ck-summary__item-price">${formatPrice(item.preco * item.quantidade)}</div>
    </div>`).join('');

  totalEl.textContent = formatPrice(calcularTotal());
}

// ── Navegação entre passos ───────────────────────────────────────────
function activarPasso(n) {
  document.querySelectorAll('[data-step]').forEach((s) => {
    s.hidden = parseInt(s.dataset.step) !== n;
  });

  document.querySelectorAll('[data-step-btn]').forEach((btn) => {
    const num = parseInt(btn.dataset.stepBtn);
    btn.classList.toggle('ck-progress__step--active', num === n);
    btn.classList.toggle('ck-progress__step--done',   num < n);
    if (num > n) btn.setAttribute('disabled', '');
    else         btn.removeAttribute('disabled');
  });

  // Mostrar referência no resumo quando chega ao passo 2
  const refNota = qs('#ck-ref-nota');
  if (refNota) refNota.style.display = n === 2 ? 'block' : 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Validação ────────────────────────────────────────────────────────
function mostrarErro(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  const input = el.previousElementSibling || el.closest('.ck-field')?.querySelector('.ck-input');
  input?.classList.add('ck-input--error');
}

function limparErro(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  const input = el.previousElementSibling || el.closest('.ck-field')?.querySelector('.ck-input');
  input?.classList.remove('ck-input--error');
}

function validarEntrega(dados) {
  let ok = true;
  limparErro('ck-nome-err'); limparErro('ck-whatsapp-err');

  if (!dados.nome) { mostrarErro('ck-nome-err', 'O nome é obrigatório.'); ok = false; }
  if (!dados.whatsapp || dados.whatsapp.replace(/\D/g, '').length < 8) {
    mostrarErro('ck-whatsapp-err', 'Introduza um número WhatsApp válido.'); ok = false;
  }
  if (dados.tipoEntrega === 'entrega' && !dados.morada) {
    ok = false;
  }
  return ok;
}

// ── Montar mensagem WhatsApp ─────────────────────────────────────────
function montarMensagemWA(itens, dados, ref) {
  const linhas = itens.map((i) =>
    `• ${i.nome} × ${i.quantidade} = ${formatPrice(i.preco * i.quantidade)}`
  ).join('\n');

  return (
    `🛒 *Nova encomenda KUMANI — ${ref}*\n\n` +
    `*Cliente:* ${dados.nome}\n` +
    `*WhatsApp:* +258${dados.whatsapp}\n` +
    (dados.email ? `*Email:* ${dados.email}\n` : '') +
    `*Entrega:* ${dados.tipoEntrega === 'recolha' ? 'Recolha na loja' : 'Entrega ao domicílio'}\n` +
    (dados.morada ? `*Morada:* ${dados.morada}\n` : '') +
    (dados.nota ? `*Nota:* ${dados.nota}\n` : '') +
    `\n*Produtos:*\n${linhas}\n` +
    `\n*Total: ${formatPrice(calcularTotal())}*\n` +
    `\n_Referência: ${ref}_`
  );
}

// ── Submeter pagamento ───────────────────────────────────────────────
async function submeterPagamento(itens, dadosEntrega, ref) {
  const metodo  = document.querySelector('input[name="metodoPagamento"]:checked')?.value;
  const termosEl = qs('#ck-termos');
  const termosErr = qs('#ck-termos-err');

  if (!termosEl?.checked) {
    if (termosErr) termosErr.textContent = 'É necessário aceitar os termos.';
    return;
  }
  if (termosErr) termosErr.textContent = '';

  const btn = qs('#ck-btn-pagar');
  btn.disabled = true;
  btn.textContent = 'A processar…';

  // WhatsApp (sempre abre — é síncrono antes dos awaits)
  const msgWA = montarMensagemWA(itens, dadosEntrega, ref);
  const linkWA = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msgWA)}`;

  if (metodo === 'whatsapp') {
    window.open(linkWA, '_blank', 'noopener');
    limparCarrinho();
    window.location.href = '/sucesso.html';
    return;
  }

  // Transferência: recolher comprovativo
  let comprovativo = null;
  if (metodo === 'transferencia') {
    const fileInput = qs('#ck-comprovativo-input');
    const comprovativoErr = qs('#ck-comprovativo-err');
    if (!fileInput?.files?.length) {
      if (comprovativoErr) comprovativoErr.textContent = 'Anexe o comprovativo de transferência.';
      btn.disabled = false;
      btn.textContent = 'Confirmar encomenda';
      return;
    }
    if (comprovativoErr) comprovativoErr.textContent = '';
    try {
      comprovativo = await fileToBase64(fileInput.files[0]);
    } catch (e) {
      console.warn('Erro ao ler comprovativo:', e);
    }
  }

  // Enviar email
  const linhas = itens.map((i) =>
    `• ${i.nome} × ${i.quantidade} = ${formatPrice(i.preco * i.quantidade)}`
  ).join('\n');

  try {
    await fetch('/api/enviar-cotacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: dadosEntrega.nome,
        email: dadosEntrega.email || 'sem-email@encomenda.com',
        telefone: '+258' + dadosEntrega.whatsapp,
        tipoNecessidade: `Encomenda Loja — ${ref}`,
        mensagem:
          `Referência: ${ref}\n` +
          `Método: ${metodo}\n` +
          `Entrega: ${dadosEntrega.tipoEntrega === 'recolha' ? 'Recolha na loja' : 'Domicílio'}\n` +
          (dadosEntrega.morada ? `Morada: ${dadosEntrega.morada}\n` : '') +
          (dadosEntrega.nota ? `Nota: ${dadosEntrega.nota}\n` : '') +
          `\nProdutos:\n${linhas}\n` +
          `\nTotal: ${formatPrice(calcularTotal())}`,
        consentimento: true,
        anexos: comprovativo ? [comprovativo] : [],
      }),
    });
  } catch (e) {
    console.warn('Email falhou (continuando):', e);
  }

  // Também envia por WhatsApp (abre em nova aba para não perder a página)
  window.open(linkWA, '_blank', 'noopener');

  limparCarrinho();
  window.location.href = '/sucesso.html';
}

// ── Init ─────────────────────────────────────────────────────────────
export function initCheckout() {
  if (!qs('[data-checkout-items]')) return;

  const itens = obterItens();
  if (!itens.length) { window.location.href = '/carrinho.html'; return; }

  renderResumo(itens);

  // Gerar referência única
  const ref = gerarRef();
  const refDisplay = qs('#ck-ref-display');
  const refAside   = qs('#ck-ref-aside');
  if (refDisplay) refDisplay.textContent = ref;
  if (refAside)   refAside.textContent   = ref;

  activarPasso(1);

  // Botões de navegação por step
  document.querySelectorAll('[data-step-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.stepBtn);
      if (n < parseInt(document.querySelector('[data-step]:not([hidden])')?.dataset.step || 1)) {
        activarPasso(n);
      }
    });
  });

  // Mostrar/esconder morada
  document.querySelectorAll('input[name="tipoEntrega"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const wrap = qs('#ck-morada-wrap');
      if (wrap) wrap.style.display = radio.value === 'entrega' ? 'block' : 'none';
    });
  });

  // Upload comprovativo — label feedback
  const fileInput = qs('#ck-comprovativo-input');
  const fileLabel = qs('#ck-comprovativo-label');
  fileInput?.addEventListener('change', () => {
    if (fileLabel) fileLabel.textContent = fileInput.files[0]?.name || 'Seleccionar ficheiro';
  });

  // Copiar NIB
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(btn.dataset.copy).then(() => {
        const orig = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = orig; }, 1500);
      });
    });
  });

  // PASSO 1: Submeter dados de entrega
  const formEntrega = qs('#ck-form-entrega');
  formEntrega?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome   = (qs('#ck-nome')?.value || '').trim();
    const email  = (qs('#ck-email')?.value || '').trim();
    const wa     = (qs('#ck-whatsapp')?.value || '').trim();
    const tipo   = document.querySelector('input[name="tipoEntrega"]:checked')?.value || 'recolha';
    const morada = (qs('#ck-morada')?.value || '').trim();
    const nota   = (qs('#ck-nota')?.value || '').trim();

    const dados = { nome, email, whatsapp: wa, tipoEntrega: tipo, morada, nota };
    if (!validarEntrega(dados)) return;

    // Guardar para o passo 2
    formEntrega.dataset.dadosJson = JSON.stringify(dados);
    activarPasso(2);
  });

  // PASSO 2: Confirmar encomenda
  qs('#ck-btn-pagar')?.addEventListener('click', () => {
    const dados = JSON.parse(formEntrega?.dataset.dadosJson || '{}');
    submeterPagamento(itens, dados, ref);
  });
}