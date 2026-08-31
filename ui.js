// ui.js — построение DOM
function buildApp() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'container';
    container.id = 'container';
    app.appendChild(container);

    // Шапка
    const header = document.createElement('div');
    header.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px 0;';
    header.innerHTML = `
        <h1 style="font-size:20px;">🌸 Прикорм</h1>
        <span id="greeting" style="color:#7a6e66; font-size:14px;">👋 Привет!</span>
    `;
    container.appendChild(header);

    // Онбординг
    const onboarding = document.createElement('div');
    onboarding.id = 'screen-onboarding';
    onboarding.className = 'screen active';
    onboarding.innerHTML = `
        <div class="card">
            <div class="onboarding">
                <div class="emoji-big">🌸</div>
                <h2 style="margin-bottom:8px;">Привет, мама!</h2>
                <p style="color:#7a6e66; margin-bottom:20px;">Давайте познакомимся с малышом.</p>
                <button class="btn" id="startBtn">Начать</button>
            </div>
        </div>
    `;
    container.appendChild(onboarding);

    // Основные экраны
    const screensContainer = document.createElement('div');
    screensContainer.id = 'screens-container';
    screensContainer.style.display = 'none';
    container.appendChild(screensContainer);

    // Главная
    const home = document.createElement('div');
    home.id = 'screen-home';
    home.className = 'screen active';
    home.innerHTML = `
        <div class="card">
            <h2>👋 Привет, <span id="motherName">мама</span>!</h2>
            <div class="sub" id="babyInfo"></div>
            <div class="sub" id="stageInfo" style="margin-top:6px;"></div>
            <button class="btn btn-outline mt-8" id="readinessBtn">🌸 Проверить готовность</button>
        </div>
        <div class="card" id="activeCard">
            <h2>🔍 Активный продукт</h2>
            <div id="activeContent"><span class="sub">Нет активного продукта</span></div>
        </div>
        <div class="card">
            <h2>💡 Рекомендация</h2>
            <div id="recommendContent"><span class="sub">Загрузка...</span></div>
        </div>
        <div class="card">
            <h2>📅 Сегодня</h2>
            <div id="todayPlan"><span class="sub">План загружается...</span></div>
        </div>
        <div class="card" id="textureCard">
            <h2>🍴 Текстура</h2>
            <div id="textureContent"><span class="sub">Загрузка...</span></div>
        </div>
        <button class="btn btn-secondary" id="addActionBtn" style="font-size:28px; padding:8px; border-radius:50%; width:60px; height:60px; margin:0 auto; display:flex; align-items:center; justify-content:center;">➕</button>
    `;
    screensContainer.appendChild(home);

    // План
    const plan = document.createElement('div');
    plan.id = 'screen-plan';
    plan.className = 'screen';
    plan.innerHTML = `
        <div class="card">
            <h2>📅 План на неделю</h2>
            <div id="weekNavigation" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <button class="btn btn-sm btn-outline" id="prevWeek">←</button>
                <span id="weekLabel">Неделя</span>
                <button class="btn btn-sm btn-outline" id="nextWeek">→</button>
            </div>
            <div id="weekDays" style="display:flex; gap:4px; overflow-x:auto; padding:4px 0;"></div>
            <div id="dailyPlanContent" style="margin-top:12px;"></div>
        </div>
    `;
    screensContainer.appendChild(plan);

    // Продукты
    const products = document.createElement('div');
    products.id = 'screen-products';
    products.className = 'screen';
    products.innerHTML = `
        <div class="card">
            <h2>🥕 Продукты</h2>
            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <input type="text" id="productSearch" placeholder="🔍 Поиск..." style="flex:1; padding:8px 12px; border:1px solid #efe8e0; border-radius:10px; background:#faf6f0; font-size:14px;">
                <select id="categoryFilter" style="padding:8px 12px; border:1px solid #efe8e0; border-radius:10px; background:#faf6f0; font-size:14px;">
                    <option value="all">Все категории</option>
                    ${CONFIG.categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('')}
                </select>
            </div>
            <div class="product-grid" id="productGrid"></div>
        </div>
    `;
    screensContainer.appendChild(products);

    // Дневник
    const diary = document.createElement('div');
    diary.id = 'screen-diary';
    diary.className = 'screen';
    diary.innerHTML = `
        <div class="card">
            <h2>📖 Дневник</h2>
            <div id="diaryList"><span class="sub">Пока нет записей</span></div>
        </div>
        <button class="btn btn-outline" id="addDiaryBtn" style="margin-top:8px;">➕ Добавить запись</button>
    `;
    screensContainer.appendChild(diary);

    // Рецепты
    const recipes = document.createElement('div');
    recipes.id = 'screen-recipes';
    recipes.className = 'screen';
    recipes.innerHTML = `
        <div class="card">
            <h2>🍽 Рецепты</h2>
            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <input type="text" id="recipeSearch" placeholder="🔍 Поиск..." style="flex:1; padding:8px 12px; border:1px solid #efe8e0; border-radius:10px; background:#faf6f0; font-size:14px;">
                <select id="recipeAgeFilter" style="padding:8px 12px; border:1px solid #efe8e0; border-radius:10px; background:#faf6f0; font-size:14px;">
                    <option value="all">Все возрасты</option>
                    <option value="6">6+ мес</option>
                    <option value="7">7+ мес</option>
                    <option value="8">8+ мес</option>
                    <option value="9">9+ мес</option>
                    <option value="10">10+ мес</option>
                </select>
            </div>
            <div id="recipeGrid" class="recipe-grid"></div>
        </div>
    `;
    screensContainer.appendChild(recipes);

    // Профиль
    const profileScreen = document.createElement('div');
    profileScreen.id = 'screen-profile';
    profileScreen.className = 'screen';
    profileScreen.innerHTML = `
        <div class="card">
            <div style="text-align:center; margin-bottom:12px;">
                <div style="font-size:48px;">👶</div>
                <div style="font-size:18px; font-weight:600;" id="profileName">—</div>
                <div style="color:#7a6e66; font-size:14px;" id="profileAge">—</div>
                <button class="btn btn-outline mt-8" id="readinessBtnProfile">🌸 Проверить готовность</button>
            </div>
            <div id="profileFields"></div>
            <button class="btn btn-outline mt-8" id="editProfileBtn">✏️ Редактировать</button>
            <button class="btn btn-outline mt-8" id="syncFromBot">📥 Загрузить из бота</button>
            <button class="btn btn-danger mt-8" id="resetData">🗑 Сбросить всё</button>
        </div>
    `;
    screensContainer.appendChild(profileScreen);

    // Нижняя навигация
    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    bottomNav.id = 'bottomNav';
    bottomNav.style.display = 'none';
    bottomNav.innerHTML = `
        <button class="tab active" data-tab="home"><span class="icon">🏠</span>Главная</button>
        <button class="tab" data-tab="plan"><span class="icon">📅</span>План</button>
        <button class="tab" data-tab="products"><span class="icon">🥕</span>Продукты</button>
        <button class="tab" data-tab="diary"><span class="icon">📖</span>Дневник</button>
        <button class="tab" data-tab="recipes"><span class="icon">🍽</span>Рецепты</button>
        <button class="tab" data-tab="profile"><span class="icon">👶</span>Профиль</button>
    `;
    container.appendChild(bottomNav);

    // Модалка онбординга
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-box">
            <h2>🌸 Данные малыша</h2>
            <div class="input-group"><label>Имя мамы</label><input type="text" id="inpMother" placeholder="Анна"></div>
            <div class="input-group"><label>Имя малыша</label><input type="text" id="inpBaby" placeholder="София"></div>
            <div class="input-group"><label>Дата рождения (ДД.ММ.ГГГГ)</label><input type="text" id="inpBirth" placeholder="21.02.2026"></div>
            <div class="input-group"><label>Тип вскармливания</label>
                <select id="inpFeeding"><option value="ГВ">ГВ</option><option value="ИВ">ИВ</option><option value="Смешанное">Смешанное</option></select>
            </div>
            <div class="input-group"><label>Пол</label>
                <select id="inpGender"><option value="Мальчик">Мальчик</option><option value="Девочка">Девочка</option></select>
            </div>
            <button class="btn" id="saveBtn">Сохранить</button>
        </div>
    `;
    container.appendChild(modal);

    // Модалка готовности
    const readinessModal = document.createElement('div');
    readinessModal.id = 'readinessModal';
    readinessModal.className = 'modal';
    readinessModal.innerHTML = `
        <div class="modal-box">
            <h2>🌸 Проверка готовности</h2>
            <div id="readinessQuestions">
                <p style="color:#7a6e66; margin-bottom:12px;">Ответьте на 5 вопросов:</p>
                <div class="readiness-question" data-q="1">
                    <p>1. Ребёнок уверенно держит голову и шею?</p>
                    <div class="btn-group"><button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button><button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button></div>
                </div>
                <div class="readiness-question" data-q="2">
                    <p>2. Может сидеть с поддержкой или самостоятельно?</p>
                    <div class="btn-group"><button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button><button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button></div>
                </div>
                <div class="readiness-question" data-q="3">
                    <p>3. Проявляет интерес к еде (смотрит, тянется)?</p>
                    <div class="btn-group"><button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button><button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button></div>
                </div>
                <div class="readiness-question" data-q="4">
                    <p>4. Исчез рефлекс выталкивания ложки языком?</p>
                    <div class="btn-group"><button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button><button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button></div>
                </div>
                <div class="readiness-question" data-q="5">
                    <p>5. Может брать предметы и направлять их ко рту?</p>
                    <div class="btn-group"><button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button><button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button></div>
                </div>
                <div id="readinessResult" style="margin-top:12px; display:none;"></div>
                <button class="btn mt-8" id="readinessSubmit" style="display:none;">Сохранить результат</button>
            </div>
        </div>
    `;
    container.appendChild(readinessModal);

    // Модалка кормления
    const feedingModal = document.createElement('div');
    feedingModal.id = 'feedingModal';
    feedingModal.className = 'modal';
    feedingModal.innerHTML = `
        <div class="modal-box">
            <h2>🍽 Добавить кормление</h2>
            <div class="input-group">
                <label>Продукт</label>
                <input type="text" id="feedingProduct" placeholder="Введите название" style="width:100%;">
                <div id="recentProducts" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;"></div>
            </div>
            <div class="input-group">
                <label>Способ приготовления</label>
                <div class="btn-group" id="prepMethodGroup">
                    <button class="btn btn-sm btn-outline prep-method" data-method="Пар">Пар</button>
                    <button class="btn btn-sm btn-outline prep-method" data-method="Варка">Варка</button>
                    <button class="btn btn-sm btn-outline prep-method" data-method="Запекание">Запекание</button>
                    <button class="btn btn-sm btn-outline prep-method" data-method="Тушение">Тушение</button>
                </div>
            </div>
            <div class="input-group">
                <label>Форма</label>
                <div class="btn-group" id="formGroup">
                    <button class="btn btn-sm btn-outline form-option" data-form="Пюре">Пюре</button>
                    <button class="btn btn-sm btn-outline form-option" data-form="Размятое">Размятое</button>
                    <button class="btn btn-sm btn-outline form-option" data-form="Мягкие кусочки">Кусочки</button>
                    <button class="btn btn-sm btn-outline form-option" data-form="Finger food">Finger food</button>
                </div>
            </div>
            <div class="input-group">
                <label>Количество</label>
                <div class="btn-group" id="amountGroup">
                    <button class="btn btn-sm btn-outline amount-option" data-amount="Не измеряла">Не измеряла</button>
                    <button class="btn btn-sm btn-outline amount-option" data-amount="Попробовал">Попробовал</button>
                    <button class="btn btn-sm btn-outline amount-option" data-amount="Немного">Немного</button>
                    <button class="btn btn-sm btn-outline amount-option" data-amount="Средняя порция">Средняя</button>
                    <button class="btn btn-sm btn-outline amount-option" data-amount="Хорошо поел">Хорошо поел</button>
                </div>
            </div>
            <div class="input-group">
                <label>Приготовила сама или купила?</label>
                <div class="btn-group" id="sourceGroup">
                    <button class="btn btn-sm btn-outline source-option" data-source="home">🏠 Приготовила сама</button>
                    <button class="btn btn-sm btn-outline source-option" data-source="store">🛒 Купила готовое</button>
                </div>
            </div>
            <div class="input-group" id="storeFields" style="display:none;">
                <label>Бренд</label><input type="text" id="storeBrand" placeholder="Бренд">
                <label>Название</label><input type="text" id="storeName" placeholder="Название">
            </div>
            <div class="input-group"><label>Дата</label><input type="text" id="feedingDate" placeholder="ДД.ММ.ГГГГ"></div>
            <div class="input-group"><label>Реакция</label>
                <select id="feedingReaction"><option value="Всё хорошо">🟢 Всё хорошо</option><option value="Незначительные изменения">🟡 Незначительные изменения</option><option value="Подозрительная реакция">🟠 Подозрительная реакция</option><option value="Выраженная реакция">🔴 Выраженная реакция</option></select>
            </div>
            <div class="input-group"><label>Заметка</label><input type="text" id="feedingNotes" placeholder="Необязательно"></div>
            <button class="btn" id="saveFeedingBtn">Сохранить кормление</button>
        </div>
    `;
    container.appendChild(feedingModal);

    // Карточка продукта
    const productCardModal = document.createElement('div');
    productCardModal.id = 'productCardModal';
    productCardModal.className = 'modal';
    productCardModal.innerHTML = `
        <div class="modal-box">
            <div id="productCardContent"></div>
            <button class="btn btn-outline" id="closeProductCard" style="margin-top:8px;">Закрыть</button>
        </div>
    `;
    container.appendChild(productCardModal);

    // Action Sheet
    const actionSheet = document.createElement('div');
    actionSheet.id = 'actionSheet';
    actionSheet.className = 'modal';
    actionSheet.style.justifyContent = 'flex-end';
    actionSheet.style.alignItems = 'stretch';
    actionSheet.innerHTML = `
        <div class="modal-box" style="max-width:100%; border-radius:24px 24px 0 0; margin-bottom:0; padding-bottom:env(safe-area-inset-bottom);">
            <h2 style="text-align:center; font-size:18px; margin-bottom:12px;">Что добавить?</h2>
            <button class="btn btn-outline action-item" data-action="feeding">🍽 Кормление</button>
            <button class="btn btn-outline action-item" data-action="product">🥕 Новый продукт</button>
            <button class="btn btn-outline action-item" data-action="water">💧 Вода</button>
            <button class="btn btn-outline action-item" data-action="reaction">🌸 Реакция</button>
            <button class="btn btn-outline action-item" data-action="photo">📷 Фото</button>
            <button class="btn btn-outline action-item" data-action="note">📝 Заметка</button>
            <button class="btn btn-secondary" id="closeActionSheet">Отмена</button>
        </div>
    `;
    container.appendChild(actionSheet);

    // Сохраняем ссылки для быстрого доступа
    window._elements = {
        container,
        onboarding,
        screensContainer,
        home,
        plan,
        products,
        diary,
        recipes,
        profileScreen,
        bottomNav,
        modal,
        readinessModal,
        feedingModal,
        productCardModal,
        actionSheet
    };
}