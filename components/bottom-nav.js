// components/bottom-nav.js – KENORA 2.0 (SVG-иконки, сохранён порядок)
window.renderBottomNav = function(active) {
  // Порядок сохранён: Главная → Продукты → Дневник → Рецепты → Ещё
  const items = [
    {
      id: 'home',
      label: 'Главная',
      svg: `<svg viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/></svg>`
    },
    {
      id: 'products',
      label: 'Продукты',
      svg: `<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="15" r="2"/><path d="M5 5l3 3M19 19l-3-3"/></svg>`
    },
    {
      id: 'diary',
      label: 'Дневник',
      svg: `<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h6M8 16h4"/></svg>`
    },
    {
      id: 'recipes',
      label: 'Рецепты',
      svg: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-2 19.5V22l2-2 2 2v-.5A10 10 0 0012 2z"/><path d="M8 10l4 4 4-4"/></svg>`
    },
    {
      id: 'more',
      label: 'Ещё',
      svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>`
    }
  ];

  let html = `<div class="bottom-navigation">`;
  items.forEach(item => {
    const isActive = (active === item.id);
    html += `
      <button class="nav-item ${isActive ? 'active' : ''}" data-action="navigate" data-screen="${item.id}">
        <span class="nav-icon">${item.svg}</span>
        <span class="nav-label">${item.label}</span>
        <span class="nav-dot"></span>
      </button>
    `;
  });
  html += `</div>`;
  return html;
};