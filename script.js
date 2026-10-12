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

// Mulberry32: seed each draw with the click's Unix timestamp in milliseconds.
function selectGroup(timestamp) {
  let seed = timestamp >>> 0;
  seed += 0x6D2B79F5;
  let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  const random = ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  return Math.floor(random * 10) + 1;
}

const groupPicker = document.querySelector('#group-picker');
const groupDialog = document.querySelector('#group-dialog');
const groupMembers = document.querySelector('#group-members');

groupPicker?.addEventListener('click', () => {
  const groupNumber = selectGroup(Date.now());
  document.querySelector('#group-dialog-title').textContent = `第 ${groupNumber} 组`;
  groupMembers.replaceChildren(...courseGroups[groupNumber - 1].map((name) => {
    const member = document.createElement('li');
    member.textContent = name;
    return member;
  }));
  groupDialog.showModal();
});

groupDialog?.querySelector('.group-dialog-close').addEventListener('click', () => groupDialog.close());
groupDialog?.addEventListener('click', (event) => {
  if (event.target !== groupDialog) return;
  const bounds = groupDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) groupDialog.close();
});
