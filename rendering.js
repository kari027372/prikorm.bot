// rendering.js
function render() {
  if (!profile) {
    renderProfileSetup();
    return;
  }
  // Определяем, какая вкладка активна (по видимости)
  const visibleScreen = document.querySelector('.screen:not([style*="display: none"])');
  if (!visibleScreen) return;
  const id = visibleScreen.id;
  switch (id) {
    case 'screen-profile': renderProfile(); break;
    case 'screen-products': renderProducts(); break;
    case 'screen-diary': renderDiary(); break;
    case 'screen-recipes': renderRecipes(); break;
    case 'screen-week': renderWeek(); break;
    default: break;
  }
}

// Экран настройки профиля (если нет профиля)
function renderProfileSetup() {
  const screen = document.getElementById('screen-profile');
  if (!screen) return;
  screen.innerHTML = `
    <h2>Настройка профиля</h2>
    <label>Имя ребёнка: <input id="profile-name" type="text" placeholder="Имя"></label><br>
    <label>Дата рождения: <input id="birth-date" type="date"></label><br>
    <label>Тип вскармливания:
      <select id="feeding-type">
        <option value="ГВ">ГВ</option>
        <option value="ИВ">ИВ</option>
        <option value="Смешанное">Смешанное</option>
      </select>
    </label><br>
    <button id="save-profile-btn">Сохранить</button>
  `;
}

// Профиль (просмотр)
function renderProfile() {
  const screen = document.getElementById('screen-profile');
  if (!screen) return;
  const age = calcAge(profile.birth_date);
  const days = getPrikormDays(profile);
  const stage = getStage(days);
  screen.innerHTML = `
    <h2>Профиль</h2>
    <p><strong>Имя:</strong> ${profile.name || 'Без имени'}</p>
    <p><strong>Возраст:</strong> ${age.months} мес. ${age.days} дн.</p>
    <p><strong>Вскармливание:</strong> ${profile.feeding_type || '—'}</p>
    <p><strong>Дней прикорма:</strong> ${days}</p>
    <p><strong>Этап:</strong> ${CONFIG.stages[stage]?.label || stage}</p>
    <p><strong>Активный продукт:</strong> ${profile.current_product || 'нет'}</p>
    <button onclick="resetProfile()">Сбросить данные</button>
  `;
}

// Продукты
function renderProducts() {
  const screen = document.getElementById('screen-products');
  if (!screen) return;
  const available = getAvailableProducts(profile, PRODUCTS);
  let html = `<h2>Доступные продукты</h2><ul>`;
  available.forEach(p => {
    const status = getProductStatus(profile, p.name);
    html += `<li class="product-item" data-name="${p.name}">${p.name} (${p.cat}) — ${status}</li>`;
  });
  html += `</ul>`;
  const next = getNextProduct(profile, PRODUCTS);
  if (next) html += `<p>Следующий для ввода: <strong>${next.name}</strong></p>`;
  screen.innerHTML = html;
}

// Дневник
function renderDiary() {
  const screen = document.getElementById('screen-diary');
  if (!screen) return;
  const introduced = profile.introduced_products || [];
  let html = `<h2>Введённые продукты</h2><ul>`;
  introduced.forEach(name => {
    html += `<li>${name}</li>`;
  });
  html += `</ul>`;
  screen.innerHTML = html;
}

// Рецепты
function renderRecipes() {
  const screen = document.getElementById('screen-recipes');
  if (!screen) return;
  let html = `<h2>Рецепты</h2><ul>`;
  RECIPES.forEach(r => {
    html += `<li><strong>${r.name}</strong> (с ${r.age} мес.): ${r.products.join(', ')} — ${r.desc}</li>`;
  });
  html += `</ul>`;
  screen.innerHTML = html;
}

// Неделя (заглушка)
function renderWeek() {
  const screen = document.getElementById('screen-week');
  if (!screen) return;
  screen.innerHTML = `<h2>План на неделю</h2><p>В разработке...</p>`;
}