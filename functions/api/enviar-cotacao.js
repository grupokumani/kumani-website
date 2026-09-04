/**
 * KUMANI — Cloudflare Pages Function
 * Recebe o formulário de cotação (POST /api/enviar-cotacao) e envia
 * um email via Resend (plano gratuito: 100 emails/dia).
 * Documentação: https://resend.com/docs/api-reference/emails/send-email
 *
 * Variável de ambiente necessária: RESEND_API_KEY
 * (configurar no painel do Cloudflare Pages, nunca no código).
 */

const EMAIL_DESTINO = 'geral@grupokumani.com';
const EMAIL_ORIGEM = 'website@grupokumani.com';

function validarCampos(dados) {
  const erros = [];

  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push('Nome é obrigatório.');
  }
  if (!dados.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.push('Email inválido.');
  }
  if (!dados.telefone || dados.telefone.trim().length < 6) {
    erros.push('Telefone é obrigatório.');
  }
  if (!dados.tipoNecessidade) {
    erros.push('Tipo de necessidade é obrigatório.');
  }
  if (!dados.mensagem || dados.mensagem.trim().length < 10) {
    erros.push('Mensagem demasiado curta — descreva brevemente o que precisa.');
  }
  if (!dados.consentimento) {
    erros.push('É necessário aceitar o uso dos dados para contacto comercial.');
  }

  return erros;
}

export async function onRequestPost({ request, env }) {
  let dados;

  try {
    dados = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ sucesso: false, erro: 'Pedido inválido.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const erros = validarCampos(dados);
  if (erros.length > 0) {
    return new Response(
      JSON.stringify({ sucesso: false, erro: erros.join(' ') }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const corpoEmail = `
Novo pedido de cotação recebido pelo website KUMANI.

Nome: ${dados.nome}
Empresa: ${dados.empresa || '(não indicado)'}
Email: ${dados.email}
Telefone: ${dados.telefone}
Serviço/Necessidade: ${dados.tipoNecessidade}
Orçamento indicativo: ${dados.orcamento || '(não indicado)'}

Mensagem:
${dados.mensagem}
  `.trim();

  const payload = {
    from: `Website KUMANI <${EMAIL_ORIGEM}>`,
    to: [EMAIL_DESTINO],
    reply_to: dados.email,
    subject: `Novo pedido de cotação — ${dados.tipoNecessidade}`,
    text: corpoEmail,
  };

  try {
    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text();
      console.error('Falha no envio Resend:', detalhe);
      return new Response(
        JSON.stringify({
          sucesso: false,
          erro: 'Não foi possível enviar o pedido agora. Tente novamente ou contacte-nos por telefone.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ sucesso: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao contactar Resend:', error);
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: 'Erro de rede ao enviar o pedido. Tente novamente.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}