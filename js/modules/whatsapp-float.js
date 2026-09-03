/**
 * KUMANI — Botão flutuante WhatsApp
 * Injectado por JS em todas as páginas (não precisa de tocar em cada
 * ficheiro HTML). 
 */

const NUMERO_WHATSAPP = '258877335506'; 
const MENSAGEM_PREDEFINIDA = 'Olá! Gostaria de saber mais sobre os serviços da KUMANI.';

export function initWhatsappFloat() {
  if (document.querySelector('[data-whatsapp-float]')) return;

  const link = document.createElement('a');
  link.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAGEM_PREDEFINIDA)}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.className = 'whatsapp-float';
  link.setAttribute('data-whatsapp-float', '');
  link.setAttribute('aria-label', 'Falar connosco no WhatsApp');
  link.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.14c-.24.68-1.4 1.3-1.93 1.36-.51.06-1.03.31-3.45-.72-2.92-1.25-4.8-4.18-4.94-4.37-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.35 1.44.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.93.29.15.48.22.55.34.07.13.07.75-.17 1.43z"/>
    </svg>
  `;

  document.body.appendChild(link);
}