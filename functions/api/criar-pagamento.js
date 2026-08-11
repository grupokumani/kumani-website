/**
 * KUMANI — Cloudflare Pages Function
 * Cria o pagamento na PaySuite e guarda a encomenda em KV com
 * estado "pendente", para a webhook a poder actualizar mais tarde.
 *
 * Variáveis de ambiente necessárias (configurar no painel do
 * Cloudflare Pages, nunca no código): PAYSUITE_API_TOKEN, SITE_URL.
 * Binding de KV necessário: ORDERS_KV (ver instruções no fim da Fase 10).
 */

function gerarReferencia() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KUM-${timestamp}-${random}`;
}

function validarPedido(dados) {
  const erros = [];

  if (!dados.cliente?.nome || dados.cliente.nome.trim().length < 2) {
    erros.push('Nome é obrigatório.');
  }
  if (!dados.cliente?.telefone || dados.cliente.telefone.trim().length < 6) {
    erros.push('Telefone é obrigatório.');
  }
  if (!dados.cliente?.morada || dados.cliente.morada.trim().length < 5) {
    erros.push('Morada de entrega é obrigatória.');
  }
  if (!Array.isArray(dados.itens) || dados.itens.length === 0) {
    erros.push('Carrinho vazio.');
  }

  return erros;
}

export async function onRequestPost({ request, env }) {
  let dados;

  try {
    dados = await request.json();
  } catch {
    return new Response(JSON.stringify({ erro: 'Pedido inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const erros = validarPedido(dados);
  if (erros.length > 0) {
    return new Response(JSON.stringify({ erro: erros.join(' ') }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const total = dados.itens.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );
  const referencia = gerarReferencia();
  const siteUrl = env.SITE_URL || 'https://grupokumani.com';

  const descricao = dados.itens
    .map((item) => `${item.nome} x${item.quantidade}`)
    .join(', ');

  try {
    const respostaPaysuite = await fetch('https://paysuite.tech/api/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSUITE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        amount: total.toFixed(2),
        reference: referencia,
        description: descricao.slice(0, 200),
        return_url: `${siteUrl}/encomenda-confirmada.html?ref=${referencia}`,
        callback_url: `${siteUrl}/api/confirmar-pagamento`,
      }),
    });

    if (!respostaPaysuite.ok) {
      const detalhe = await respostaPaysuite.text();
      console.error('Falha ao criar pagamento na PaySuite:', detalhe);
      return new Response(
        JSON.stringify({ erro: 'Não foi possível iniciar o pagamento agora.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resultadoPaysuite = await respostaPaysuite.json();

    // Guarda a encomenda em KV com estado "pendente" — a webhook
    // (confirmar-pagamento.js) actualiza este registo quando a
    // PaySuite confirmar o pagamento.
    await env.ORDERS_KV.put(
      referencia,
      JSON.stringify({
        referencia,
        estado: 'pendente',
        total,
        cliente: dados.cliente,
        itens: dados.itens,
        paysuiteId: resultadoPaysuite.id || null,
        criadoEm: new Date().toISOString(),
      }),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30 dias
    );

    return new Response(
      JSON.stringify({ checkoutUrl: resultadoPaysuite.checkout_url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao contactar a PaySuite:', error);
    return new Response(
      JSON.stringify({ erro: 'Erro de rede ao iniciar o pagamento.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}