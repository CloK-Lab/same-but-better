document.querySelectorAll<HTMLPreElement>('main pre').forEach(pre => {
  const code = pre.querySelector('code');
  if (!code) return;
  const figure = document.createElement('figure');
  figure.className = 'notebook-code';
  const caption = document.createElement('figcaption');
  const name = document.createElement('span');
  name.textContent = pre.dataset.title || pre.dataset.language || 'Code';
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'notebook-copy'; button.textContent = 'Copy';
  button.setAttribute('aria-label', 'Copy code'); button.setAttribute('aria-live', 'polite');
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(code.textContent?.replace(/\n$/, '') ?? ''); button.textContent = 'Copied'; }
    catch { button.textContent = 'Copy failed'; }
    setTimeout(() => { button.textContent = 'Copy'; }, 2000);
  });
  caption.append(name, button); pre.replaceWith(figure); figure.append(caption, pre);
});

document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((container, group) => {
  const panels = Array.from(container.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child.hasAttribute('data-tab-panel'));
  if (!panels.length) return;
  const labels: string[] = JSON.parse(container.dataset.labels || '[]');
  const list = document.createElement('div'); list.setAttribute('role', 'tablist'); list.setAttribute('aria-label', 'Examples');
  const buttons = panels.map((panel, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.setAttribute('role', 'tab');
    button.id = `tabs-${group}-${index}`; panel.id = `panel-${group}-${index}`;
    button.textContent = labels[index] || panel.dataset.label || `Tab ${index + 1}`;
    button.setAttribute('aria-controls', panel.id); panel.setAttribute('aria-labelledby', button.id);
    panel.setAttribute('role', 'tabpanel'); panel.tabIndex = 0;
    button.addEventListener('click', () => select(index));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % panels.length
        : event.key === 'ArrowLeft' ? (index + panels.length - 1) % panels.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : null;
      if (next !== null) { event.preventDefault(); select(next); buttons[next].focus(); }
    });
    list.append(button); return button;
  });
  function select(index: number) {
    panels.forEach((panel, i) => { panel.hidden = i !== index; buttons[i].setAttribute('aria-selected', String(i === index)); buttons[i].tabIndex = i === index ? 0 : -1; });
  }
  container.prepend(list);
  select(Math.max(0, Math.min(Number(container.dataset.defaultIndex) || 0, panels.length - 1)));
});

document.querySelectorAll<HTMLHeadingElement>('main :is(h2,h3,h4)[id]').forEach(heading => {
  const link = document.createElement('a'); link.href = `#${heading.id}`; link.className = 'notebook-heading-link';
  while (heading.firstChild) link.append(heading.firstChild);
  const mark = document.createElement('span'); mark.textContent = ' #'; mark.setAttribute('aria-hidden', 'true');
  link.append(mark); heading.append(link);
});

const headings = Array.from(document.querySelectorAll<HTMLElement>('main :is(h2,h3)[id]'));
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.notebook-toc-links a'));
function updateToc() {
  let active = headings[0]?.id;
  for (const heading of headings) if (heading.getBoundingClientRect().top <= 100) active = heading.id;
  for (const link of links) {
    if (decodeURIComponent(link.hash.slice(1)) === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
window.addEventListener('scroll', updateToc, { passive: true }); updateToc();


document.querySelectorAll<HTMLElement>('[data-code-preview]').forEach((root, index) => {
  const content = root.querySelector<HTMLElement>('.notebook-preview-content')!;
  const frame = root.querySelector<HTMLElement>('.notebook-preview-frame')!;
  content.id = `code-preview-${index}`;
  frame.tabIndex = 0;
  frame.setAttribute('role', 'group');
  frame.setAttribute('aria-controls', content.id);
  const update = (expanded: boolean) => {
    root.dataset.expanded = String(expanded);
    frame.setAttribute('aria-expanded', String(expanded));
    frame.setAttribute('aria-label', `${frame.dataset.title}: click or press Enter to ${expanded ? 'collapse' : 'expand'}`);
  };
  const toggle = () => {
    const expanded = root.dataset.expanded === 'true';
    if (expanded && root.getBoundingClientRect().top < 80) root.scrollIntoView({ block: 'start' });
    update(!expanded);
  };
  update(false);
  frame.addEventListener('click', event => {
    if ((event.target as Element).closest('button, a, input, textarea, select')) return;
    if (window.getSelection()?.toString()) return;
    toggle();
  });
  frame.addEventListener('keydown', event => {
    if (event.target !== frame || !['Enter', ' '].includes(event.key)) return;
    event.preventDefault(); toggle();
  });
});
