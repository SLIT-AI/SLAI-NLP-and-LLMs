const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('nav');
const progress = document.querySelector('.reading-progress span');
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation menu' : 'Close navigation menu');
  nav.classList.toggle('open', !open);
});

nav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
});

const updateProgress = () => {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = available > 0 ? window.scrollY / available : 0;
  if (progress) progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
};

updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });

const revealTargets = document.querySelectorAll(
  '.overview-grid, .topic-index, .outcome-intro, .outcome-list li, .schedule-list article, .format-grid, .grading, .faculty, .assistant, .materials-grid, .references'
);

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealTargets.forEach((element) => element.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
  revealTargets.forEach((element) => revealObserver.observe(element));
}

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${visible.target.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { threshold: [0.15, 0.35, 0.6], rootMargin: '-18% 0px -58%' });

sections.forEach((section) => sectionObserver.observe(section));
