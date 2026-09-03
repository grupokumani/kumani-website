/**
 * KUMANI — Pesquisa global (header, todas as páginas)
 * Pesquisa em servicos.json, portfolio.json e produtos.json ao mesmo
 * tempo. Os 3 ficheiros só são pedidos na primeira vez que o painel
 * abre (cache em memória), não a cada tecla.
 */

import { qs, on } from '../utils/dom.js';
import { debounce } from '../utils/debounce.js';

let indiceCarregado = null;

async function carregarIndice() {
  if (indiceCarregado) return indiceCarregado;

  const [servicos, portfolio, produtos] = await Promise.all([
    fetch('/data/servicos.json').then((r) => r.json()).catch(() => []),
    fetch('/data/portfolio.json').then((r) => r.json()).catch(() => []),
    fetch('/data/produtos.json').then((r) => r.json()).catch(() => []),
  ]);

  indiceCarregado = [
    ...servicos.map((s) => ({
      tipo: 'Serviço',
      nome: s.nome,
      texto: `${s.nome} ${s.resumo}`.toLowerCase(),
      url: `/servicos/servico.html?slug=${s.slug}`,
    })),
    ...portfolio.map((p) => ({
      tipo: 'Portfólio',
      nome: p.cliente,
      texto: `${p.cliente} ${p.categoriaLabel}`.toLowerCase(),
      url: `/projectos/projecto.html?slug=${p.slug}`,
    })),
    ...produtos.map((p) => ({
      tipo: 'Loja',
      nome: p.nome,
      texto: p.nome.toLowerCase(),
      url: `/produto/produto.html?slug=${p.slug}`,
    })),
  ];

  return indiceCarregado;
}

function renderResultados(container, resultados) {
  if (resultados.length === 0) {
    container.innerHTML = '<p class="search-empty">Sem resultados. Tente outro termo.</p>';
    return;
  }

  container.innerHTML = resultados
    .slice(0, 8)
    .map(
      (item) => `
        <a href="${item.url}" class="search-result">
          <span class="search-result__name">${item.nome}</span>
          <span class="search-result__type">${item.tipo}</span>
        </a>
      `
    )
    .join('');
}

export function initSearch() {
  const toggle = qs('[data-search-toggle]');
  const panel = qs('[data-search-panel]');
  if (!toggle || !panel) return;

  const input = qs('[data-search-input]', panel);
  const resultsEl = qs('[data-search-results]', panel);
  const closeBtn = qs('[data-search-close]', panel);

  const abrir = async () => {
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    input.focus();
    await carregarIndice();
  };

  const fechar = () => {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    input.value = '';
    resultsEl.innerHTML = '';
  };

  on(toggle, 'click', abrir);
  on(closeBtn, 'click', fechar);

  on(panel, 'click', (event) => {
    if (event.target === panel) fechar();
  });

  on(document, 'keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) fechar();
  });

  const pesquisar = debounce(async (termo) => {
    if (termo.trim().length < 2) {
      resultsEl.innerHTML = '';
      return;
    }
    const indice = await carregarIndice();
    const termoLower = termo.toLowerCase();
    const resultados = indice.filter((item) => item.texto.includes(termoLower));
    renderResultados(resultsEl, resultados);
  }, 250);

  on(input, 'input', (event) => pesquisar(event.target.value));
}