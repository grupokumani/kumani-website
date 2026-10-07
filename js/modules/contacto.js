/**
 * KUMANI — Formulário de contacto / pedido de orçamento
 * - WhatsApp + email (Resend via /api/enviar-cotacao)
 * - Até 5 anexos opcionais (convertidos para base64 no envio por email)
 * - Validação com avisos por campo
 * - Redirecção para /sucesso.html após envio
 */

import { qs } from '../utils/dom.js';
import { mostrarMensagem } from '../utils/form-feedback.js';
import { initLocationSelector } from '../utils/location-selector.js';

const NUMERO_WHATSAPP = '258877335506';
const MAX_ANEXOS = 5;
const MAX_TAMANHO_MB = 10; // por ficheiro
const TIPOS_ACEITES = [
  'image/jpeg','image/png','image/webp','image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// ── Contexto (origem=projecto/servico) ───────────────────────────────
function getContexto() {
  const p = new URLSearchParams(window.location.search);
  const origem = p.get('origem');
  if (!origem) return null;
  return { origem, slug: p.get('slug') || '', categoria: p.get('categoria') || '' };
}

function mostrarBannerContexto(contexto) {
  const banner = qs('[data-contact-context]');
  if (!banner || !contexto) return;
  banner.textContent = contexto.categoria
    ? `A pedir orçamento para: ${contexto.categoria}`
    : 'A pedir orçamento para um projecto semelhante.';
  banner.style.display = 'block';
}

// ── Mensagem WhatsApp ────────────────────────────────────────────────
function montarMensagem(dados, contexto, nAnexos) {
  const ctx = contexto
    ? `Origem: ${contexto.categoria || 'Portfólio'}\n` : '';
  const anexosInfo = nAnexos > 0
    ? `\n📎 ${nAnexos} anexo(s) enviado(s) por email.` : '';

  return (
    `Olá KUMANI! 👋\n\n` +
    ctx +
    `Nome: ${dados.nome}\n` +
    `Empresa: ${dados.empresa || '—'}\n` +
    `Telefone: ${dados.telefone}\n` +
    `Email: ${dados.email}\n` +
    `Sector: ${dados.sector || '—'}\n` +
    `País: ${dados.pais || '—'}` +
    (dados.provincia ? `\nProvíncia: ${dados.provincia}` : '') +
    (dados.distrito ? `\nDistrito: ${dados.distrito}` : '') +
    `\nOrçamento: ${dados.orcamento || '—'}\n\n` +
    `Mensagem:\n${dados.mensagem}` +
    anexosInfo
  );
}

// ── Validação com marcação de campos ─────────────────────────────────
function validarCampo(campo) {
  const wrapper = campo.closest('.field');
  const erro = wrapper?.querySelector('.field__error');

  const vazio = !campo.value.trim() && campo.required;
  const emailInvalido = campo.type === 'email' && campo.value &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campo.value);
  const invalido = vazio || emailInvalido;

  campo.classList.toggle('field__input--error', invalido);
  if (erro) {
    erro.textContent = vazio
      ? 'Este campo é obrigatório.'
      : emailInvalido ? 'Introduza um email válido.' : '';
    erro.style.display = invalido ? 'block' : 'none';
  }
  return !invalido;
}

function validarFormulario(form) {
  const campos = form.querySelectorAll('input[required], textarea[required], select[required]');
  let valido = true;
  campos.forEach((c) => { if (!validarCampo(c)) valido = false; });

  const check = form.querySelector('[name="consentimento"]');
  if (check && !check.checked) {
    const wrapper = check.closest('.field');
    const erro = wrapper?.querySelector('.field__error');
    if (erro) { erro.textContent = 'É necessário aceitar o uso dos dados.'; erro.style.display = 'block'; }
    check.classList.add('field__input--error');
    valido = false;
  } else if (check) {
    const wrapper = check.closest('.field');
    const erro = wrapper?.querySelector('.field__error');
    if (erro) erro.style.display = 'none';
    check.classList.remove('field__input--error');
  }

  return valido;
}

// ── Anexos ────────────────────────────────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ nome: file.name, tipo: file.type, base64: reader.result.split(',')[1] });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function initAnexos(form) {
  const input = qs('[data-anexos-input]', form);
  const lista = qs('[data-anexos-lista]', form);
  const aviso = qs('[data-anexos-aviso]', form);
  if (!input) return;

  input.addEventListener('change', () => {
    const ficheiros = Array.from(input.files);
    const erros = [];

    if (ficheiros.length > MAX_ANEXOS) {
      erros.push(`Máximo de ${MAX_ANEXOS} ficheiros.`);
    }

    ficheiros.forEach((f) => {
      if (f.size > MAX_TAMANHO_MB * 1024 * 1024) {
        erros.push(`"${f.name}" excede ${MAX_TAMANHO_MB}MB.`);
      }
      if (!TIPOS_ACEITES.includes(f.type)) {
        erros.push(`"${f.name}" tem um formato não suportado.`);
      }
    });

    if (aviso) {
      aviso.textContent = erros.join(' ');
      aviso.style.display = erros.length ? 'block' : 'none';
    }

    if (lista) {
      lista.innerHTML = ficheiros.slice(0, MAX_ANEXOS).map((f) => `
        <span class="anexo-tag">
          📎 ${f.name} <small>(${(f.size / 1024).toFixed(0)}KB)</small>
        </span>`).join('');
    }
  });
}

// ── CSS dinâmico para erros e anexos ─────────────────────────────────
function injectStyles() {
  if (document.getElementById('contacto-styles')) return;
  const style = document.createElement('style');
  style.id = 'contacto-styles';
  style.textContent = `
    .field__input--error { border-color: var(--color-danger) !important; }
    .field__error {
      display: none;
      color: var(--color-danger);
      font-size: var(--fs-xs);
      margin-top: 4px;
    }
    .anexo-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--color-bg-subtle);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      padding: 4px 10px;
      font-size: var(--fs-xs);
      margin: 4px 4px 0 0;
    }
    .field__anexos-aviso {
      color: var(--color-danger);
      font-size: var(--fs-xs);
      margin-top: 4px;
      display: none;
    }
    .field__anexos-label {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      cursor: pointer;
      padding: var(--space-3) var(--space-4);
      border: 1.5px dashed var(--color-border-strong);
      border-radius: var(--radius-card);
      transition: border-color 150ms ease;
    }
    .field__anexos-label:hover { border-color: var(--kumani-green); }
    .field__anexos-label input { display: none; }
  `;
  document.head.appendChild(style);
}

// ── Init principal ────────────────────────────────────────────────────
export function initContacto() {
  const form = qs('[data-contact-form]');
  if (!form) return;

  injectStyles();
  initLocationSelector(qs('[data-location-selector]', form));
  initAnexos(form);

  const contexto = getContexto();
  mostrarBannerContexto(contexto);

  const submitBtn = qs('[data-contact-submit]', form);
  const messageEl = qs('[data-contact-message]', form);

  // Validação em tempo real campo a campo
  form.querySelectorAll('input, textarea, select').forEach((campo) => {
    campo.addEventListener('blur', () => validarCampo(campo));
    campo.addEventListener('input', () => {
      if (campo.classList.contains('field__input--error')) validarCampo(campo);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (messageEl) messageEl.innerHTML = '';

    // Validação completa
    if (!validarFormulario(form)) {
      const primeiroCampoErro = form.querySelector('.field__input--error');
      primeiroCampoErro?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const dados = {
      nome:          qs('[name="nome"]',      form)?.value.trim() || '',
      empresa:       qs('[name="empresa"]',   form)?.value.trim() || '',
      email:         qs('[name="email"]',     form)?.value.trim() || '',
      telefone:      qs('[name="telefone"]',  form)?.value.trim() || '',
      areaActuacao:  qs('[name="areaActuacao"]', form)?.value.trim() || '',
      sector:        qs('[name="sector"]',    form)?.value || '',
      pais:          qs('[name="pais"]',      form)?.value || '',
      provincia:     qs('[name="provincia"]', form)?.value || '',
      distrito:      qs('[name="distrito"]',  form)?.value || '',
      orcamento:     qs('[name="orcamento"]', form)?.value || '',
      mensagem:      qs('[name="mensagem"]',  form)?.value.trim() || '',
      tipoNecessidade: contexto
        ? `Orçamento — ${contexto.categoria || 'portfólio'}`
        : 'Contacto Geral',
      consentimento: qs('[name="consentimento"]', form)?.checked || false,
    };

    // Processar anexos
    const inputFicheiros = qs('[data-anexos-input]', form);
    let anexos = [];
    if (inputFicheiros?.files?.length) {
      const ficheiros = Array.from(inputFicheiros.files).slice(0, MAX_ANEXOS);
      try {
        anexos = await Promise.all(ficheiros.map(fileToBase64));
      } catch (e) {
        console.warn('Erro ao processar anexos', e);
      }
    }

    // 1. Abrir WhatsApp imediatamente (síncrono, antes do await)
    const msgWA = montarMensagem(dados, contexto, anexos.length);
    const linkWA = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msgWA)}`;
    window.open(linkWA, '_blank', 'noopener');

    // 2. Desactivar botão
    if (submitBtn) { submitBtn.disabled = true; submitBtn.setAttribute('data-loading', 'true'); }

    // 3. Enviar email (não bloqueia a redirecção se falhar)
    try {
      await fetch('/api/enviar-cotacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dados, anexos }),
      });
    } catch (err) {
      console.error('Email falhou (WhatsApp já enviado):', err);
    }

    // 4. Ir para página de sucesso
    window.location.href = '/sucesso.html';
  });
}