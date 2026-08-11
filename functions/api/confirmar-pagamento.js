/**
 * KUMANI — Cloudflare Pages Function
 * Recebe a webhook da PaySuite (callback_url), valida a assinatura
 * HMAC SHA256 (cabeçalho X-Webhook-Signature) e actualiza o estado
 * da encomenda em KV.
 *
 * Variável de ambiente necessária: PAYSUITE_WEBHOOK_SECRET.
 */

async function validarAssinatura(corpoTexto, assinaturaRecebida, segredo) {
  const encoder = new TextEncoder();
  const chave = await crypto.subtle.importKey(
    'raw',
    encoder.encode(segredo),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const assinaturaBuffer = await crypto.subtle.sign(
    'HMAC',
    chave,
    encoder.encode(corpoTexto)
  );

  const assinaturaCalculada = Array.from(new Uint8Array(assinaturaBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Comparação em tempo constante evita ataques de timing.
  if (assinaturaCalculada.length !== assinaturaRecebida.length) return false;
  let diferenca = 0;
  for (let i = 0; i < assinaturaCalculada.length; i++) {
    diferenca |= assinaturaCalculada.charCodeAt(i) ^ assinaturaRecebida.charCodeAt(i);
  }
  return diferenca === 0;
}

export async function onRequestPost({ request, env }) {
  const corpoTexto = await request.text();
  const assinatura = request.headers.get('X-Webhook-Signature') || '';

  const assinaturaValida = await validarAssinatura(
    corpoTexto,
    assinatura,
    env.PAYSUITE_WEBHOOK_SECRET
  );

  if (!assinaturaValida) {
    console.error('Webhook PaySuite com assinatura inválida.');
    return new Response('Assinatura inválida.', { status: 401 });
  }

  let evento;
  try {
    evento = JSON.parse(corpoTexto);
  } catch {
    return new Response('Corpo inválido.', { status: 400 });
  }

  const referencia = evento.reference;
  if (!referencia) {
    return new Response('Referência em falta.', { status: 400 });
  }

  const encomendaRaw = await env.ORDERS_KV.get(referencia);
  if (!encomendaRaw) {
    console.error(`Encomenda ${referencia} não encontrada em KV.`);
    return new Response('Encomenda não encontrada.', { status: 404 });
  }

  const encomenda = JSON.parse(encomendaRaw);

  // O nome exacto do campo de estado no payload da PaySuite deve ser
  // confirmado contra a documentação real assim que tiveres acesso à
  // conta — "status"/"completed" é o padrão mais comum neste tipo de
  // gateway, mas ajusta esta linha se a PaySuite usar outro nome.
  encomenda.estado = evento.status === 'completed' ? 'pago' : 'falhado';
  encomenda.actualizadoEm = new Date().toISOString();

  await env.ORDERS_KV.put(referencia, JSON.stringify(encomenda), {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  return new Response('OK', { status: 200 });
}