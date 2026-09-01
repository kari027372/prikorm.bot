// handlers.js
function setupEventListeners() {
  const app = document.getElementById('app');
  if (!app) return;

  // Делегирование кликов по вкладкам
  app.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      const tab = tabBtn.dataset.tab;
      switchTab(tab);
      return;
    }

    // Клик по продукту (если есть класс product-item)
    const productEl = e.target.closest('.product-item');
    if (productEl) {
      const name = productEl.dataset.name;
      if (name) showProductCard(name);
      return;
    }

    // Закрытие модалки
    const closeBtn = e.target.closest('.close-modal');
    if (closeBtn) {
      closeModal();
      return;
    }

    // Кнопка "Добавить продукт" (пример)
    const addBtn = e.target.closest('.add-product-btn');
    if (addBtn) {
      const productName = addBtn.dataset.name;
      if (productName && profile) {
        if (!profile.introduced_products) profile.introduced_products = [];
        if (!profile.introduced_products.includes(productName)) {
          profile.introduced_products.push(productName);
          profile.current_product = productName;
          saveProfile();
          render();
        }
      }
      return;
    }

    // Сохранение профиля (кнопка в форме)
    const saveProfileBtn = e.target.closest('#save-profile-btn');
    if (saveProfileBtn) {
      saveProfileHandler();
      return;
    }
  });

  // Обработка изменения даты рождения (input)
  app.addEventListener('change', (e) => {
    if (e.target.id === 'birth-date') {
      // Можно обновить профиль автоматически
    }
  });

  console.log('Event listeners attached');
}

// Вспомогательные функции для навигации
function switchTab(tab) {
  document.querySelectorAll('.screen').forEach(el => el.style.display = 'none');
  const target = document.getElementById(`screen-${tab}`);
  if (target) target.style.display = 'block';
  render(); // Перерисовываем содержимое активной вкладки
}

// Открытие модалки
function openModal(content) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  if (overlay && body) {
    body.innerHTML = content;
    overlay.style.display = 'flex';
  }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

// Показ карточки продукта
function showProductCard(productName) {
  const product = PRODUCTS.find(p => p.name === productName);
  if (!product) return;
  const html = `
    <h3>${product.name}</h3>
    <p>Категория: ${product.cat}</p>
    <p>Минимальный возраст: ${product.min_age} мес.</p>
    <p>Железо: ${product.iron} мг</p>
    <p>Описание: ${product.desc}</p>
    <button class="add-product-btn" data-name="${product.name}">Ввести в прикорм</button>
  `;
  openModal(html);
}

// Сохранение профиля (обработчик)
function saveProfileHandler() {
  const nameInput = document.getElementById('profile-name');
  const birthInput = document.getElementById('birth-date');
  const feedingSelect = document.getElementById('feeding-type');
  if (!profile) profile = {};
  if (nameInput) profile.name = nameInput.value;
  if (birthInput) profile.birth_date = birthInput.value;
  if (feedingSelect) profile.feeding_type = feedingSelect.value;
  if (!profile.introduced_products) profile.introduced_products = [];
  if (!profile.start_date) profile.start_date = new Date().toISOString().split('T')[0];
  saveProfile();
  render();
}