// screens/home.js – KENORA главная
window.renderHome = function() {
  const state = window.STATE || {};
  const currentChild = window.getCurrentChild ? window.getCurrentChild() : (state.baby || {});
  const baby = currentChild || {};

  const diary = typeof getDiary === 'function' ? getDiary() : [];
  const introduced = state.products?.introduced || [];
  const totalIntroduced = introduced.length;
  const totalProducts = (window.PRODUCTS || []).length;

  let ageText = 'Возраст не указан';
  if (baby.birthDate && typeof window.formatAge === 'function') {
    ageText = window.formatAge(baby.birthDate);
  } else if (baby.birthDate) {
    const birth = new Date(baby.birthDate);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months--;
    months = Math.max(0, months);
    ageText = months + ' мес.';
  }

  const weight = baby.weight || '';
  const weightText = weight ? weight + ' кг' : '';

  // --- ИЗМЕНЕНИЕ: SVG-аватар вместо эмодзи ---
  const avatarSvg = `
    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  `;

  // --- ИЗМЕНЕНИЕ: SVG-иконка "Начать" вместо эмодзи ---
  const startIcon = `
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  `;

  // --- ИЗМЕНЕНИЕ: SVG для кнопки редактирования ---
  const editIcon = `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  `;

  // Последний приём пищи
  const lastEntry = diary.length ? diary[diary.length - 1] : null;
  let lastMealHtml = '';
  if (lastEntry) {
    const food = lastEntry.productName || 'Продукт';
    const amount = lastEntry.amount ? lastEntry.amount + ' г' : '';
    const status = 'Хорошо';
    const time = lastEntry.time || '12:30';
    lastMealHtml = `
      <div class="last-meal">
        <div class="last-meal-header">
          <span>Последний приём пищи</span>
          <span class="last-meal-time">${time}</span>
        </div>
        <div class="last-meal-content">
          <span class="last-meal-food">${food}</span>
          ${amount ? `<span class="last-meal-amount">${amount}</span>` : ''}
          <span class="last-meal-status">${status}</span>
        </div>
      </div>
    `;
  } else {
    lastMealHtml = `
      <div class="last-meal">
        <div class="last-meal-header">Нет записей</div>
        <div class="last-meal-content">Добавьте первый приём пищи</div>
      </div>
    `;
  }

  return `
    <div class="baby-profile-card">
      <div class="baby-avatar">${avatarSvg}</div>
      <div>
        <strong>${baby.name || 'Малыш'}</strong>
        <div class="muted">${ageText}${weightText ? ' • ' + weightText : ''}</div>
      </div>
      <button class="icon-button" style="margin-left:auto;" data-action="edit-baby">${editIcon}</button>
    </div>

    <div class="today-product">
      <span class="today-product-label">Сегодня новый продукт</span>
      <span class="today-product-name">Цветная капуста</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${diary.length}</span>
        <span class="stat-label">Приёмов пищи</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${baby.feedingType === 'breast' ? '4' : '3'}</span>
        <span class="stat-label">Грудное молоко</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${totalIntroduced}</span>
        <span class="stat-label">Продуктов</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">✅</span>
        <span class="stat-label">Самочувствие</span>
      </div>
    </div>

    ${lastMealHtml}

    <button class="start-btn" data-action="start-meal">
      ${startIcon} Начать
    </button>
  `;
};