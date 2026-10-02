/**
 * KUMANI — Hero: animação de entrada + reveal de secções
 */

export function initHero() {
  // Anima o conteúdo do hero ao carregar
  const heroContent = document.querySelector('[data-reveal-hero]');
  if (heroContent) {
    requestAnimationFrame(() => {
      setTimeout(() => heroContent.classList.add('is-visible'), 200);
    });
  }

  // Intersection Observer — revela qualquer [data-reveal]
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('is-visible'), index * 80);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => revealObserver.observe(el));
  }

  // Contador animado para os indicadores
  function animateCounter(el, target, suffix, duration = 1800) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const indicatorItems = document.querySelectorAll('.indicators__item');
  if (!indicatorItems.length) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');

        const valueEl = entry.target.querySelector('.indicators__value');
        if (!valueEl) return;

        const text = valueEl.textContent.trim();
        const match = text.match(/^(\d+)(.*)$/);
        if (!match) return;

        const target = parseInt(match[1], 10);
        const suffix = match[2];
        animateCounter(valueEl, target, suffix);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  indicatorItems.forEach((el) => counterObserver.observe(el));
} 