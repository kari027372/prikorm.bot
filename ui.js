// ui.js
function buildApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Очистка
  app.innerHTML = '';

  // Навигация (вкладки)
  const nav = document.createElement('nav');
  nav.className = 'tab-bar';
  nav.innerHTML = `
    <button data-tab="profile">Профиль</button>
    <button data-tab="products">Продукты</button>
    <button data-tab="diary">Дневник</button>
    <button data-tab="recipes">Рецепты</button>
    <button data-tab="week">Неделя</button>
  `;
  app.appendChild(nav);

  // Контейнеры для каждого экрана
  const screens = ['profile', 'products', 'diary', 'recipes', 'week'];
  screens.forEach(id => {
    const div = document.createElement('div');
    div.id = `screen-${id}`;
    div.className = 'screen';
    if (id !== 'profile') div.style.display = 'none'; // по умолчанию показываем профиль
    app.appendChild(div);
  });

  // Модальное окно (общее)
  const modal = document.createElement('div');
  modal.id = 'modal-overlay';
  modal.className = 'modal-overlay';
  modal.style.display = 'none';
  modal.innerHTML = '<div class="modal-content"><span class="close-modal">&times;</span><div id="modal-body"></div></div>';
  app.appendChild(modal);

  // Сообщаем, что DOM построен
  console.log('UI built');
}