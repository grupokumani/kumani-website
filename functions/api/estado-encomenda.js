/**
 * KUMANI — Cloudflare Pages Function
 * Consultada pela página de confirmação (encomenda-confirmada.html)
 * para saber o estado actual de uma encomenda.
 */

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const referencia = url.searchParams.get('ref');

  if (!referencia) {
    return new Response(JSON.stringify({ erro: 'Referência em falta.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encomendaRaw = await env.ORDERS_KV.get(referencia);

  if (!encomendaRaw) {
    return new Response(JSON.stringify({ estado: 'nao-encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encomenda = JSON.parse(encomendaRaw);

  return new Response(JSON.stringify({ estado: encomenda.estado }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}