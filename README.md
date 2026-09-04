# KUMANI — Website

Site institucional + loja da KUMANI. HTML/CSS/JS puro, hospedado em
Cloudflare Pages (plano gratuito).

## Variáveis de ambiente (Cloudflare Pages → Settings → Environment variables)

| Nome | Onde obter | Usado em |
|---|---|---|
| `RESEND_API_KEY` | resend.com → API Keys | `functions/api/enviar-cotacao.js` |
| `PAYSUITE_API_TOKEN` | conta PaySuite | `functions/api/criar-pagamento.js` |
| `PAYSUITE_WEBHOOK_SECRET` | conta PaySuite | `functions/api/confirmar-pagamento.js` |
| `SITE_URL` | `https://grupokumani.com` | `functions/api/criar-pagamento.js` |

## KV Namespace necessário

Nome do binding: `ORDERS_KV`
Criar em: Cloudflare Dashboard → Workers & Pages → KV → Create namespace →
depois ligar ao projecto em Settings → Functions → KV namespace bindings.
Usado para guardar o estado das encomendas (pendente/pago/falhado).

## Estrutura

- `partials/` — header e footer, carregados via `js/utils/load-partials.js`
- `data/*.json` — conteúdo de portfólio, produtos, serviços e clientes
- `functions/api/` — Cloudflare Pages Functions (backend serverless)
- `css/main.css` — importa todos os módulos de `css/tokens`, `base`,
  `layout`, `components`, `pages`, `utilities`

## Desenvolvimento local

Abrir a pasta `kumani-website` (a que contém `index.html`) directamente
no VS Code — não a pasta pai — e usar a extensão Live Server.