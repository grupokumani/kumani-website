/**
 * KUMANI — Pesquisa global com tolerância ortográfica (fuzzy search)
 * Cobre: produtos, serviços, portfólio, páginas.
 * Algoritmo: similaridade por bigrama + Levenshtein normalizado.
 */

import { qs } from '../utils/dom.js';

// ── Algoritmo de similaridade ──────────────────────────────────────
function normalizar(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

function bigramas(str) {
  const s = normalizar(str);
  const set = new Set();
  for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
  return set;
}

function similaridadeBigrama(a, b) {
  const sa = bigramas(a);
  const sb = bigramas(b);
  if (!sa.size || !sb.size) return 0;
  let intersecao = 0;
  sa.forEach((g) => { if (sb.has(g)) intersecao++; });
  return (2 * intersecao) / (sa.size + sb.size);
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function score(query, texto) {
  const q = normalizar(query);
  const t = normalizar(texto);

  // Correspondência exacta ou contém
  if (t.includes(q)) return 1;

  // Cada palavra da query contra o texto
  const palavras = q.split(/\s+/).filter(Boolean);
  let totalScore = 0;

  for (const palavra of palavras) {
    const palavrasTexto = t.split(/\s+/).filter(Boolean);
    let melhor = 0;
    for (const pt of palavrasTexto) {
      const bigrama = similaridadeBigrama(palavra, pt);
      const maxLen = Math.max(palavra.length, pt.length);
      const lev = maxLen > 0 ? 1 - levenshtein(palavra, pt) / maxLen : 0;
      melhor = Math.max(melhor, bigrama * 0.6 + lev * 0.4);
    }
    totalScore += melhor;
  }

  return palavras.length > 0 ? totalScore / palavras.length : 0;
}

// ── Índice de conteúdo ─────────────────────────────────────────────
const PAGINAS_ESTATICAS = [
  { titulo: 'Sobre a KUMANI', url: '/sobre.html', descricao: 'Quem somos, missão, valores, equipa e história da KUMANI' },
  { titulo: 'Portfólio', url: '/portfolio.html', descricao: 'Trabalhos e projectos realizados pela KUMANI' },
  { titulo: 'Contacto', url: '/contacto.html', descricao: 'Fale connosco, pedido de orçamento' },
  { titulo: 'Eventos', url: '/eventos.html', descricao: 'Organização cobertura media secretariado protocolo de eventos' },
  { titulo: 'Recursos', url: '/recursos.html', descricao: 'Guias dicas artigos perguntas frequentes clientes' },
  { titulo: 'Programas', url: '/programas.html', descricao: 'Educação cultura sustentabilidade responsabilidade social' },
  { titulo: 'Publicidade', url: '/servicos/publicidade.html', descricao: 'Campanhas painéis outdoors publicidade exterior sinalização' },
  { titulo: 'Imagem Corporativa', url: '/servicos/imagem-corporativa.html', descricao: 'Identidade visual logótipo branding manual de normas' },
  { titulo: 'Gestão de Redes Sociais', url: '/servicos/gestao-redes-sociais.html', descricao: 'Social media instagram facebook tiktok conteúdo marketing digital' },
  { titulo: 'Websites', url: '/servicos/websites.html', descricao: 'Criação de sites web design desenvolvimento' },
  { titulo: 'Relações Públicas', url: '/servicos/relacoes-publicas.html', descricao: 'Comunicação institucional assessoria imprensa reputação protocolo' },
  { titulo: 'Loja — Gráfica', url: '/loja.html', descricao: 'Produtos impressão gráfica cartões flyers brochuras brindes' },
];

async function construirIndice() {
  const indice = [...PAGINAS_ESTATICAS];

  try {
    const [produtos, portfolio] = await Promise.all([
      fetch('/data/produtos.json').then((r) => r.json()).catch(() => []),
      fetch('/data/portfolio.json').then((r) => r.json()).catch(() => []),
    ]);

    produtos.forEach((p) => {
      indice.push({
        titulo: p.nome,
        url: `/produto/produto.html?slug=${p.slug}`,
        descricao: `${p.descricao || ''} ${p.moeda || ''} loja gráfica impressão`,
        preco: p.preco ? `${p.preco} MZN` : '',
        tipo: 'produto',
      });
    });

    portfolio.forEach((p) => {
      indice.push({
        titulo: p.categoriaLabel || p.slug,
        url: `/portfolio.html#${p.categoriaSlug || ''}`,
        descricao: `${p.descricao || ''} ${p.local || ''} ${p.ano || ''}`,
        tipo: 'portfolio',
      });
    });
  } catch (e) {
    console.warn('Search: erro ao carregar índice dinâmico', e);
  }

  return indice;
}

function renderResultados(resultados, query) {
  if (!resultados.length) {
    return `<div class="search-panel__empty">
      <p>Nenhum resultado para "<strong>${query}</strong>".</p>
      <p class="search-panel__hint">Tente palavras como "cartões", "publicidade", "social media"…</p>
    </div>`;
  }

  return resultados
    .map((item) => `
      <a href="${item.url}" class="search-result">
        ${item.tipo === 'produto' ? '<span class="search-result__badge search-result__badge--produto">Produto</span>' : ''}
        ${item.tipo === 'portfolio' ? '<span class="search-result__badge search-result__badge--portfolio">Portfólio</span>' : ''}
        <span class="search-result__title">${item.titulo}</span>
        ${item.preco ? `<span class="search-result__price">${item.preco}</span>` : ''}
        <span class="search-result__desc">${item.descricao?.slice(0, 80)}…</span>
      </a>
    `)
    .join('');
}

export async function initSearch() {
  const toggleBtns = document.querySelectorAll('[data-search-toggle]');
  const panel = qs('[data-search-panel]');
  const input = qs('[data-search-input]');
  const results = qs('[data-search-results]');
  const closeBtn = qs('[data-search-close]');

  if (!panel || !input) return;

  let indice = null;
  let debounceTimer = null;

  // Abrir/fechar painel
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const isOpen = panel.classList.toggle('is-open');
      if (isOpen) {
        input.focus();
        if (!indice) {
          results.innerHTML = '<div class="search-panel__loading">A carregar…</div>';
          indice = await construirIndice();
          results.innerHTML = '';
        }
      }
    });
  });

  closeBtn?.addEventListener('click', () => {
    panel.classList.remove('is-open');
    input.value = '';
    results.innerHTML = '';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      panel.classList.remove('is-open');
      input.value = '';
      results.innerHTML = '';
    }
  });

  // Pesquisa com debounce
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();

    if (query.length < 2) {
      results.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(() => {
      if (!indice) return;

      const scored = indice
        .map((item) => ({
          ...item,
          score: score(query, `${item.titulo} ${item.descricao || ''}`),
        }))
        .filter((item) => item.score > 0.25)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      results.innerHTML = renderResultados(scored, query);
    }, 220);
  });

  // Fechar ao clicar num resultado
  results.addEventListener('click', () => {
    panel.classList.remove('is-open');
    input.value = '';
    results.innerHTML = '';
  });
}