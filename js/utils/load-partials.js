/**
 * KUMANI — Carregamento de partials HTML (header, footer, etc.)
 * Cada elemento com [data-partial="nome"] é substituído pelo conteúdo
 * de /partials/nome.html. Dispara o evento "partial:loaded" com o nome
 * do partial no `detail`, para que outros módulos possam inicializar-se
 * só depois do HTML estar realmente no DOM.
 */

export async function loadPartial(name, targetElement) {
  try {
    const response = await fetch(`/partials/${name}.html`);

    if (!response.ok) {
      throw new Error(`Falha ao carregar partial "${name}": ${response.status}`);
    }

    const html = await response.text();
    targetElement.outerHTML = html;

    document.dispatchEvent(
      new CustomEvent('partial:loaded', { detail: { name } })
    );
  } catch (error) {
    console.error(error);
  }
}

export async function loadAllPartials() {
  const targets = Array.from(document.querySelectorAll('[data-partial]'));

  await Promise.all(
    targets.map((el) => loadPartial(el.dataset.partial, el))
  );
}