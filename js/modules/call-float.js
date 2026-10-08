/**
 * KUMANI — Botão flutuante de chamada
 * Abre uma janela pequena, recolhe nome + telefone,
 * envia email para vendas@grupokumani.com via /api/enviar-cotacao.
 */

export function initCallFloat() {
  const toggle  = document.getElementById('call-float-toggle');
  const panel   = document.getElementById('call-float-panel');
  const closeBtn= document.getElementById('call-float-close');
  const form    = document.getElementById('call-float-form');
  const submitBtn = document.getElementById('cf-submit');
  const msgWrap = document.getElementById('cf-msg-wrap');
  const feedback= document.getElementById('cf-feedback');

  if (!toggle || !panel) return;

  const abrir = () => {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.getElementById('cf-nome')?.focus();
  };

  const fechar = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => panel.hidden ? abrir() : fechar());
  closeBtn?.addEventListener('click', fechar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) fechar();
  });

  document.addEventListener('click', (e) => {
    if (!panel.hidden &&
        !panel.contains(e.target) &&
        e.target !== toggle) fechar();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome     = document.getElementById('cf-nome')?.value.trim();
    const telefone = document.getElementById('cf-telefone')?.value.trim();

    if (!nome || !telefone) {
      feedback.textContent = 'Preencha o nome e o telefone.';
      feedback.style.color = 'var(--color-danger)';
      msgWrap.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'A enviar…';

    try {
      await fetch('/api/enviar-cotacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          telefone,
          email: 'nao-indicado@chamada.com',
          mensagem: `Pedido de chamada via website.\nNome: ${nome}\nTelefone: ${telefone}`,
          tipoNecessidade: 'Pedido de Chamada',
          consentimento: true,
        }),
      });
      feedback.textContent = '✓ Recebemos o seu pedido! Ligamos em breve.';
      feedback.style.color = 'var(--kumani-green)';
      msgWrap.style.display = 'block';
      form.reset();
      submitBtn.style.display = 'none';
      setTimeout(fechar, 3500);
    } catch {
      feedback.textContent = 'Erro ao enviar. Tente pelo WhatsApp.';
      feedback.style.color = 'var(--color-danger)';
      msgWrap.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Solicitar chamada';
    }
  });
}