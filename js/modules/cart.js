/**
 * KUMANI — Módulo do Carrinho
 * Fonte única de verdade do carrinho: guarda em localStorage sob a
 * chave "kumani_cart" (o mesmo formato já lido por nav.js desde a
 * Fase 4). Todas as operações disparam o evento "cart:updated" no
 * document, para o contador do header e a página do carrinho se
 * manterem sincronizados sem reload.
 */

const CART_KEY = 'kumani_cart';

function lerCarrinho() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function gravarCarrinho(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
}

export function obterItens() {
  return lerCarrinho();
}

export function adicionarItem(produto, quantidade = 1) {
  const items = lerCarrinho();
  const existente = items.find((item) => item.id === produto.id);

  if (existente) {
    existente.quantidade += quantidade;
  } else {
    items.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      moeda: produto.moeda,
      imagem: produto.imagem || null,
      corPlaceholder: produto.corPlaceholder || '#DDDDD8',
      quantidade,
    });
  }

  gravarCarrinho(items);
}

export function actualizarQuantidade(id, quantidade) {
  let items = lerCarrinho();

  if (quantidade <= 0) {
    items = items.filter((item) => item.id !== id);
  } else {
    const item = items.find((item) => item.id === id);
    if (item) item.quantidade = quantidade;
  }

  gravarCarrinho(items);
}

export function removerItem(id) {
  const items = lerCarrinho().filter((item) => item.id !== id);
  gravarCarrinho(items);
}

export function limparCarrinho() {
  gravarCarrinho([]);
}

export function calcularTotal() {
  return lerCarrinho().reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );
}

export function contarItens() {
  return lerCarrinho().reduce((total, item) => total + item.quantidade, 0);
}