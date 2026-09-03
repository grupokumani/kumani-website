/**
 * KUMANI — Ponto de entrada JS (versão final)
 */

import { loadAllPartials } from './utils/load-partials.js';
import { initNav } from './modules/nav.js';
import { initHero } from './modules/hero.js';
import { initHomepage } from './modules/homepage.js';
import { initPortfolioFilter } from './modules/portfolio-filter.js';
import { initCaseStudy } from './modules/case-study.js';
import { initServicos } from './modules/servicos.js';
import { initQuoteForm } from './modules/quote-form.js';
import { initLoja } from './modules/loja.js';
import { initProdutoDetalhe } from './modules/produto.js';
import { initCarrinho } from './modules/carrinho.js';
import { initCheckout } from './modules/checkout.js';
import { initConfirmacao } from './modules/confirmacao.js';
import { initContacto } from './modules/contacto.js';
import { initClientesPage } from './modules/clientes.js';
import { initSearch } from './modules/search.js';
import { initWhatsappFloat } from './modules/whatsapp-float.js';
import { initRevealOnScroll } from './utils/reveal-on-scroll.js';

async function bootstrap() {
  await loadAllPartials();
  initNav();
  initSearch();
  initWhatsappFloat();

  const page = document.body.dataset.page;

  if (page === 'home') {
    initHero();
    await initHomepage();
  }
  if (page === 'portfolio') await initPortfolioFilter();
  if (page === 'case-study') await initCaseStudy();
  if (page === 'servicos') await initServicos();
  if (page === 'servico-detalhe') await initQuoteForm();
  if (page === 'loja') await initLoja();
  if (page === 'produto') await initProdutoDetalhe();
  if (page === 'carrinho') initCarrinho();
  if (page === 'checkout') initCheckout();
  if (page === 'confirmacao') await initConfirmacao();
  if (page === 'contacto') initContacto();
  if (page === 'clientes') await initClientesPage();

  initRevealOnScroll();
}

document.addEventListener('DOMContentLoaded', bootstrap);