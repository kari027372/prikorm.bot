/* ============================================================
   screens/baby.js — Экран "Малыши"
   ============================================================ */
window.renderBaby = function() {
  const state = typeof window.getState === 'function' ? window.getState() : (window.STATE || {});
  const children = Array.isArray(state.children) ? state.children : [];

  console.log('renderBaby:', 'children.length =', children.length,
    'children =', children.map(function(child) { return child.name || 'Без имени'; }).join(', ')
  );

  const current = typeof window.getCurrentChild === 'function'
    ? window.getCurrentChild()
    : (children.find(function(child) { return child.id === state.currentChildId; }) || null);

  // --- ИЗМЕНЕНИЕ: SVG-иконка "назад" вместо ⌂ ---
  const homeIcon = `
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/>
    </svg>
  `;

  // --- ИЗМЕНЕНИЕ: SVG-иконка добавления вместо ➕ ---
  const addIcon = `
    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none">
      <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
    </svg>
  `;

  // --- ИЗМЕНЕНИЕ: SVG-иконка "галочка" вместо ✔ ---
  const checkIcon = `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="#B5C9B0" stroke-width="3" fill="none">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  `;

  // --- ИЗМЕНЕНИЕ: SVG-аватар вместо эмодзи ---
  const avatarSvg = `
    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  `;

  let html = `
    <div class="page-header">
      <h1 class="header-title">👶 Малыши</h1>
      <button class="icon-button" data-action="navigate" data-screen="home">${homeIcon}</button>
    </div>
  `;

  if (children.length === 0) {
    html += `
      <div class="empty-state">
        <h3>Нет добавленных детей</h3>
        <p>Пройдите онбординг или нажмите «Добавить ребёнка»</p>
      </div>
    `;
  } else {
    children.forEach(function(child) {
      const isActive = current && current.id === child.id;
      const age = child.birthDate && typeof window.formatAge === 'function'
        ? window.formatAge(child.birthDate)
        : 'Возраст не указан';

      html += `
        <div class="baby-profile-card" style="${isActive ? 'border-color: var(--kenora-primary-soft);' : ''}" data-action="switch-child" data-child-id="${child.id}">
          <div class="baby-avatar">${avatarSvg}</div>
          <div>
            <strong>${child.name || 'Без имени'}</strong>
            <div class="muted">${age}</div>
          </div>
          ${isActive ? `<span style="margin-left:auto;">${checkIcon}</span>` : ''}
          <button class="icon-button" style="margin-left:auto;" data-action="delete-child" data-child-id="${child.id}">🗑️</button>
        </div>
      `;
    });
  }

  html += `
    <button class="primary-button" style="margin-top:16px;" data-action="add-child">
      ${addIcon} Добавить ребёнка
    </button>
  `;

  return html;
};