// app.js — полная версия с Action Sheet, кормлением, интерактивным планом

// ================================================================
// 1. ХРАНЕНИЕ ПРОФИЛЯ
// ================================================================

const STORAGE_KEY = 'prikorm_app_v3';
let profile = null;

function loadProfile() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            profile = JSON.parse(raw);
            return;
        }
    } catch (e) {}
    profile = null;
}

function saveProfile() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function resetProfile() {
    localStorage.removeItem(STORAGE_KEY);
    profile = null;
    location.reload();
}

// ================================================================
// 2. DOM-ЭЛЕМЕНТЫ (создаём динамически)
// ================================================================

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
                <p style="color:#7a6e66; margin-bottom:20px;">Давайте познакомимся с малышом и настроим приложение.</p>
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

    // Создаём все экраны
    const screens = ['home', 'plan', 'products', 'diary', 'recipes', 'profile'];
    const screenTitles = {
        home: 'Главная',
        plan: 'План',
        products: 'Продукты',
        diary: 'Дневник',
        recipes: 'Рецепты',
        profile: 'Профиль'
    };

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
        <!-- Кнопка + -->
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
            <div id="productFilter" style="margin-bottom:12px;">
                <select id="categoryFilter" style="width:100%; padding:8px 12px; border:1px solid #efe8e0; border-radius:10px; background:#faf6f0; font-size:14px;">
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
            <div id="recipeFilter" style="margin-bottom:12px;">
                <select id="recipeAgeFilter" style="width:100%; padding:8px 12px; border:1px solid #efe8e0; border-radius:10px; background:#faf6f0; font-size:14px;">
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

    // Нижняя навигация (6 вкладок)
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
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button>
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button>
                    </div>
                </div>
                <div class="readiness-question" data-q="2">
                    <p>2. Может сидеть с поддержкой или самостоятельно?</p>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button>
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button>
                    </div>
                </div>
                <div class="readiness-question" data-q="3">
                    <p>3. Проявляет интерес к еде (смотрит, тянется)?</p>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button>
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button>
                    </div>
                </div>
                <div class="readiness-question" data-q="4">
                    <p>4. Исчез рефлекс выталкивания ложки языком?</p>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button>
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button>
                    </div>
                </div>
                <div class="readiness-question" data-q="5">
                    <p>5. Может брать предметы и направлять их ко рту?</p>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="yes">Да</button>
                        <button class="btn btn-sm btn-outline readiness-answer" data-answer="no">Нет</button>
                    </div>
                </div>
                <div id="readinessResult" style="margin-top:12px; display:none;"></div>
                <button class="btn mt-8" id="readinessSubmit" style="display:none;">Сохранить результат</button>
            </div>
        </div>
    `;
    container.appendChild(readinessModal);

    // Модалка добавления кормления (расширенная)
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
                <label>Бренд</label>
                <input type="text" id="storeBrand" placeholder="Бренд">
                <label>Название</label>
                <input type="text" id="storeName" placeholder="Название">
            </div>
            <div class="input-group">
                <label>Дата</label>
                <input type="text" id="feedingDate" placeholder="ДД.ММ.ГГГГ">
            </div>
            <div class="input-group">
                <label>Реакция</label>
                <select id="feedingReaction"><option value="Всё хорошо">🟢 Всё хорошо</option><option value="Незначительные изменения">🟡 Незначительные изменения</option><option value="Подозрительная реакция">🟠 Подозрительная реакция</option><option value="Выраженная реакция">🔴 Выраженная реакция</option></select>
            </div>
            <div class="input-group">
                <label>Заметка</label>
                <input type="text" id="feedingNotes" placeholder="Необязательно">
            </div>
            <button class="btn" id="saveFeedingBtn">Сохранить кормление</button>
        </div>
    `;
    container.appendChild(feedingModal);

    // Action Sheet (overlay)
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

    // Сохраняем ссылки
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
        actionSheet
    };
}

// ================================================================
// 3. ИНИЦИАЛИЗАЦИЯ
// ================================================================

function init() {
    buildApp();
    loadProfile();
    setupEventListeners();
    render();
}

// ================================================================
// 4. СОБЫТИЯ
// ================================================================

function setupEventListeners() {
    document.getElementById('startBtn')?.addEventListener('click', openModal);
    document.getElementById('editProfileBtn')?.addEventListener('click', openModal);
    document.getElementById('saveBtn')?.addEventListener('click', saveProfileHandler);

    document.getElementById('modal')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });
    document.getElementById('readinessModal')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });
    document.getElementById('feedingModal')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });
    document.getElementById('actionSheet')?.addEventListener('click', function(e) {
        if (e.target === this) this.style.display = 'none';
    });

    document.getElementById('addDiaryBtn')?.addEventListener('click', openDiaryModal);
    document.getElementById('saveDiaryBtn')?.addEventListener('click', saveDiaryHandler);

    document.getElementById('resetData')?.addEventListener('click', function() {
        if (confirm('Удалить все данные?')) resetProfile();
    });

    // Навигация
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
            const target = document.getElementById('screen-' + tabName);
            if (target) target.classList.add('active');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Фильтры
    document.getElementById('categoryFilter')?.addEventListener('change', renderProducts);
    document.getElementById('recipeAgeFilter')?.addEventListener('change', renderRecipes);

    // Опросник готовности
    document.getElementById('readinessBtn')?.addEventListener('click', openReadinessModal);
    document.getElementById('readinessBtnProfile')?.addEventListener('click', openReadinessModal);

    document.querySelectorAll('.readiness-answer').forEach(btn => {
        btn.addEventListener('click', function() {
            const q = this.closest('.readiness-question');
            q.dataset.answer = this.dataset.answer;
            q.querySelectorAll('.readiness-answer').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const allQuestions = document.querySelectorAll('.readiness-question');
            let allAnswered = true;
            allQuestions.forEach(q => { if (!q.dataset.answer) allAnswered = false; });
            if (allAnswered) {
                document.getElementById('readinessSubmit').style.display = 'block';
            }
        });
    });

    document.getElementById('readinessSubmit')?.addEventListener('click', function() {
        const questions = document.querySelectorAll('.readiness-question');
        let score = 0;
        questions.forEach(q => { if (q.dataset.answer === 'yes') score++; });
        if (!profile) profile = {};
        profile.readiness_score = score;
        profile.readiness_passed = score >= 4;
        profile.readiness_date = new Date().toLocaleDateString('ru-RU');
        saveProfile();
        const resultDiv = document.getElementById('readinessResult');
        resultDiv.style.display = 'block';
        const verdict = score >= 4 ? '🟢 Готовность высокая! Можно начинать прикорм.' : '🟡 Признаков пока недостаточно. Попробуйте позже.';
        resultDiv.innerHTML = `<div class="card"><p><strong>Результат: ${score}/5</strong></p><p>${verdict}</p></div>`;
        document.getElementById('readinessSubmit').style.display = 'none';
        setTimeout(() => {
            document.getElementById('readinessModal').style.display = 'none';
            render();
        }, 2000);
    });

    // Кнопка + (Action Sheet)
    document.getElementById('addActionBtn')?.addEventListener('click', openActionSheet);
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            document.getElementById('actionSheet').style.display = 'none';
            if (action === 'feeding') {
                openFeedingModal();
            } else if (action === 'product') {
                // Открыть модалку добавления продукта (можно позже)
                alert('Добавление нового продукта через форму будет позже.');
            } else if (action === 'water') {
                if (!profile) return;
                if (!profile.water_log) profile.water_log = [];
                profile.water_log.push({
                    date: new Date().toLocaleDateString('ru-RU'),
                    type: 'предложила'
                });
                saveProfile();
                render();
                alert('💧 Запись о воде добавлена.');
            } else if (action === 'reaction') {
                // Открыть модалку реакции (можно позже)
                alert('Запись реакции будет позже.');
            } else if (action === 'photo') {
                alert('📷 Добавление фото будет позже.');
            } else if (action === 'note') {
                const note = prompt('📝 Введите заметку:');
                if (note && profile) {
                    if (!profile.notes) profile.notes = [];
                    profile.notes.push({
                        date: new Date().toLocaleDateString('ru-RU'),
                        text: note
                    });
                    saveProfile();
                    render();
                }
            }
        });
    });
    document.getElementById('closeActionSheet')?.addEventListener('click', function() {
        document.getElementById('actionSheet').style.display = 'none';
    });

    // Добавление кормления
    // Поиск продукта
    document.getElementById('feedingProduct')?.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        const recentContainer = document.getElementById('recentProducts');
        if (query.length < 2) {
            renderRecentProducts();
            return;
        }
        const matches = PRODUCTS.filter(p => p.name.toLowerCase().includes(query)).slice(0, 10);
        recentContainer.innerHTML = matches.map(p => `
            <button class="btn btn-sm btn-outline product-suggestion" data-product="${p.name}">${p.name}</button>
        `).join('');
        recentContainer.querySelectorAll('.product-suggestion').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('feedingProduct').value = this.dataset.product;
                renderRecentProducts();
            });
        });
    });

    function renderRecentProducts() {
        const recentContainer = document.getElementById('recentProducts');
        const introduced = profile?.introduced_foods || [];
        const recent = introduced.slice(-5).reverse();
        if (recent.length === 0) {
            recentContainer.innerHTML = '<span style="font-size:13px; color:#b0a69e;">Недавних продуктов нет</span>';
            return;
        }
        recentContainer.innerHTML = recent.map(p => `
            <button class="btn btn-sm btn-outline product-suggestion" data-product="${p}">${p}</button>
        `).join('');
        recentContainer.querySelectorAll('.product-suggestion').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('feedingProduct').value = this.dataset.product;
                renderRecentProducts();
            });
        });
    }

    // Выбор способа приготовления
    document.querySelectorAll('.prep-method').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.prep-method').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Выбор формы
    document.querySelectorAll('.form-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.form-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Выбор количества
    document.querySelectorAll('.amount-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.amount-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Выбор источника
    document.querySelectorAll('.source-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.source-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.source === 'store') {
                document.getElementById('storeFields').style.display = 'block';
            } else {
                document.getElementById('storeFields').style.display = 'none';
            }
        });
    });

    document.getElementById('saveFeedingBtn')?.addEventListener('click', saveFeedingHandler);

    // План: навигация по неделе
    let weekOffset = 0;
    document.getElementById('prevWeek')?.addEventListener('click', function() {
        weekOffset--;
        renderWeek();
    });
    document.getElementById('nextWeek')?.addEventListener('click', function() {
        weekOffset++;
        renderWeek();
    });

    // Синхронизация с ботом (заглушка)
    document.getElementById('syncFromBot')?.addEventListener('click', function() {
        alert('Синхронизация с ботом будет доступна позже.');
    });
}

// ================================================================
// 5. МОДАЛКИ
// ================================================================

function openModal() {
    if (profile) {
        document.getElementById('inpMother').value = profile.mother_name || '';
        document.getElementById('inpBaby').value = profile.baby_name || '';
        document.getElementById('inpBirth').value = profile.birth_date || '';
        document.getElementById('inpFeeding').value = profile.feeding_type || 'ГВ';
        document.getElementById('inpGender').value = profile.gender || 'Мальчик';
    } else {
        document.getElementById('inpMother').value = '';
        document.getElementById('inpBaby').value = '';
        document.getElementById('inpBirth').value = '';
        document.getElementById('inpFeeding').value = 'ГВ';
        document.getElementById('inpGender').value = 'Мальчик';
    }
    document.getElementById('modal').style.display = 'flex';
}

function saveProfileHandler() {
    const mother = document.getElementById('inpMother').value.trim();
    const baby = document.getElementById('inpBaby').value.trim();
    const birth = document.getElementById('inpBirth').value.trim();
    const feeding = document.getElementById('inpFeeding').value;
    const gender = document.getElementById('inpGender').value;
    if (!mother || !baby || !birth) {
        alert('Заполните все поля');
        return;
    }
    const parts = birth.split('.');
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        alert('Введите дату в формате ДД.ММ.ГГГГ');
        return;
    }
    const age = calcAge(birth);
    if (!profile) profile = {};
    profile.mother_name = mother;
    profile.baby_name = baby;
    profile.birth_date = birth;
    profile.feeding_type = feeding;
    profile.gender = gender;
    profile.age_months = age.months;
    profile.age_days = age.days;
    profile.prematurity = profile.prematurity || 'Доношенный';
    profile.feeding_strategy = profile.feeding_strategy || 'Комбинированный';
    profile.introduced_foods = profile.introduced_foods || [];
    profile.excluded_foods = profile.excluded_foods || [];
    profile.allergies = profile.allergies || [];
    profile.food_history = profile.food_history || [];
    profile.prikorm_started = profile.prikorm_started || false;
    profile.prikorm_start_date = profile.prikorm_start_date || '';
    profile.active_product = profile.active_product || null;
    profile.observation_start = profile.observation_start || null;
    profile.observation_days = profile.observation_days || 2;
    profile.loved_foods = profile.loved_foods || [];
    profile.disliked_foods = profile.disliked_foods || [];
    profile.readiness_score = profile.readiness_score || 0;
    profile.readiness_passed = profile.readiness_passed || false;
    profile.water_log = profile.water_log || [];
    profile.notes = profile.notes || [];
    saveProfile();
    document.getElementById('modal').style.display = 'none';
    render();
}

function openReadinessModal() {
    document.querySelectorAll('.readiness-question').forEach(q => {
        q.dataset.answer = '';
        q.querySelectorAll('.readiness-answer').forEach(b => b.classList.remove('active'));
    });
    document.getElementById('readinessResult').style.display = 'none';
    document.getElementById('readinessSubmit').style.display = 'none';
    document.getElementById('readinessModal').style.display = 'flex';
}

function openDiaryModal() {
    document.getElementById('diaryProduct').value = '';
    document.getElementById('diaryDate').value = new Date().toLocaleDateString('ru-RU');
    document.getElementById('diaryReaction').value = 'Всё хорошо';
    document.getElementById('diaryNotes').value = '';
    document.getElementById('diaryModal').style.display = 'flex';
}

function saveDiaryHandler() {
    const product = document.getElementById('diaryProduct').value.trim();
    const date = document.getElementById('diaryDate').value.trim();
    const reaction = document.getElementById('diaryReaction').value;
    const notes = document.getElementById('diaryNotes').value.trim();
    if (!product || !date) {
        alert('Заполните продукт и дату');
        return;
    }
    if (!profile) return;
    if (!profile.food_history) profile.food_history = [];
    profile.food_history.push({ product, date, reaction, notes });
    if (!profile.introduced_foods.includes(product)) {
        profile.introduced_foods.push(product);
        profile.active_product = product;
        const info = PRODUCTS.find(p => p.name === product);
        profile.observation_days = (info && info.allergen) ? 3 : 2;
        profile.observation_start = date;
    }
    saveProfile();
    document.getElementById('diaryModal').style.display = 'none';
    render();
}

function openActionSheet() {
    document.getElementById('actionSheet').style.display = 'flex';
}

function openFeedingModal() {
    document.getElementById('feedingProduct').value = '';
    document.getElementById('feedingDate').value = new Date().toLocaleDateString('ru-RU');
    document.getElementById('feedingReaction').value = 'Всё хорошо';
    document.getElementById('feedingNotes').value = '';
    document.querySelectorAll('.prep-method').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.form-option').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.amount-option').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.source-option').forEach(b => b.classList.remove('active'));
    document.getElementById('storeFields').style.display = 'none';
    renderRecentProducts();
    document.getElementById('feedingModal').style.display = 'flex';
}

function saveFeedingHandler() {
    const product = document.getElementById('feedingProduct').value.trim();
    const date = document.getElementById('feedingDate').value.trim();
    const reaction = document.getElementById('feedingReaction').value;
    const notes = document.getElementById('feedingNotes').value.trim();
    if (!product || !date) {
        alert('Заполните продукт и дату');
        return;
    }
    if (!profile) return;

    const prepMethod = document.querySelector('.prep-method.active')?.dataset.method || 'Не указано';
    const form = document.querySelector('.form-option.active')?.dataset.form || 'Не указано';
    const amount = document.querySelector('.amount-option.active')?.dataset.amount || 'Не указано';
    const source = document.querySelector('.source-option.active')?.dataset.source || 'home';
    const storeBrand = document.getElementById('storeBrand').value.trim();
    const storeName = document.getElementById('storeName').value.trim();

    if (!profile.food_history) profile.food_history = [];
    profile.food_history.push({
        product,
        date,
        reaction,
        notes,
        prepMethod,
        form,
        amount,
        source,
        storeBrand: source === 'store' ? storeBrand : '',
        storeName: source === 'store' ? storeName : '',
        timestamp: new Date().toISOString()
    });

    if (!profile.introduced_foods.includes(product)) {
        profile.introduced_foods.push(product);
        profile.active_product = product;
        const info = PRODUCTS.find(p => p.name === product);
        profile.observation_days = (info && info.allergen) ? 3 : 2;
        profile.observation_start = date;
    }

    saveProfile();
    document.getElementById('feedingModal').style.display = 'none';
    render();
}

// ================================================================
// 6. ПЛАН (ИНТЕРАКТИВНЫЙ КАЛЕНДАРЬ)
// ================================================================

let weekOffset = 0;

function renderWeek() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setDate(today.getDate() + weekOffset * 7);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    document.getElementById('weekLabel').textContent = `Неделя ${startOfWeek.toLocaleDateString('ru-RU')} — ${new Date(startOfWeek.getTime() + 6*24*60*60*1000).toLocaleDateString('ru-RU')}`;

    const daysContainer = document.getElementById('weekDays');
    daysContainer.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayStr = day.toLocaleDateString('ru-RU');
        const isToday = day.toDateString() === new Date().toDateString();
        const btn = document.createElement('button');
        btn.className = `btn btn-sm btn-outline ${isToday ? 'active' : ''}`;
        btn.textContent = `${day.getDate()} ${day.toLocaleString('ru', {weekday:'short'})}`;
        btn.dataset.date = dayStr;
        btn.addEventListener('click', function() {
            renderDailyPlan(dayStr);
            document.querySelectorAll('#weekDays .btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
        daysContainer.appendChild(btn);
    }
    const todayStr = new Date().toLocaleDateString('ru-RU');
    renderDailyPlan(todayStr);
}

function renderDailyPlan(dateStr) {
    const container = document.getElementById('dailyPlanContent');
    const plan = generateDailyPlan(profile, PRODUCTS);
    if (!plan || plan.length === 0) {
        container.innerHTML = '<span class="sub">На сегодня плана нет. Добавьте кормления!</span>';
        return;
    }
    container.innerHTML = `
        <div style="font-size:14px; font-weight:500; margin-bottom:8px;">${dateStr}</div>
        ${plan.map(meal => `
            <div class="plan-item">
                <span class="time">${meal.time}</span>
                <span class="food">${meal.foods.join(' + ')} ${meal.isNew ? '<span class="new-badge">🆕</span>' : ''}</span>
                <span class="desc">${meal.description}</span>
                <button class="btn btn-sm btn-outline mark-done" data-meal="${meal.time}">✅</button>
            </div>
        `).join('')}
    `;
    container.querySelectorAll('.mark-done').forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = '✅';
            this.disabled = true;
            this.style.opacity = 0.5;
        });
    });
}

// ================================================================
// 7. РЕНДЕРИНГ
// ================================================================

function render() {
    if (!profile || !profile.baby_name) {
        document.getElementById('screen-onboarding').classList.add('active');
        document.getElementById('screens-container').style.display = 'none';
        document.getElementById('bottomNav').style.display = 'none';
        return;
    }
    document.getElementById('screen-onboarding').classList.remove('active');
    document.getElementById('screens-container').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'flex';

    const age = calcAge(profile.birth_date);
    profile.age_months = age.months;
    profile.age_days = age.days;
    saveProfile();

    const feeding = profile.feeding_type || 'ГВ';
    const prikormDays = getPrikormDays(profile);
    const stage = getStage(prikormDays);
    const texture = getTextureStage(age.months, prikormDays);

    document.getElementById('greeting').textContent = `👋 ${profile.mother_name || 'мама'}`;

    document.getElementById('motherName').textContent = profile.mother_name || 'мама';
    document.getElementById('babyInfo').textContent = `👶 ${profile.baby_name} — ${age.months} мес. ${age.days} дн. (${feeding})`;
    document.getElementById('stageInfo').innerHTML = `📌 Этап: <span class="stage-badge">${stage}</span>`;

    const activeContent = document.getElementById('activeContent');
    const active = profile.active_product;
    if (active) {
        const start = profile.observation_start ? new Date(profile.observation_start.split('.').reverse().join('-')) : null;
        const days = profile.observation_days || 2;
        const passed = start ? Math.floor((new Date() - start) / (1000 * 60 * 60 * 24)) : 0;
        const left = Math.max(0, days - passed);
        const progress = Math.min(100, (passed / days) * 100);
        activeContent.innerHTML = `
            <div><strong>${active}</strong></div>
            <div style="font-size:14px; color:#7a6e66;">День ${passed + 1} из ${days}</div>
            <div class="progress-bar"><div class="fill" style="width:${progress}%;"></div></div>
            ${left > 0 ? `<div style="font-size:13px; color:#b0a69e;">Осталось ${left} дн.</div>` : '<div style="font-size:13px; color:#2d7a5a;">✅ Наблюдение завершено</div>'}
        `;
    } else {
        activeContent.innerHTML = `<span class="sub">Нет активного продукта</span>`;
    }

    const recContent = document.getElementById('recommendContent');
    const nextProduct = getNextProduct(profile, PRODUCTS);
    if (nextProduct) {
        const tags = [];
        if (nextProduct.iron) tags.push('🩸 железо');
        if (nextProduct.allergen) tags.push('⚠️ аллерген');
        if (nextProduct.choking) tags.push('🚫 риск удушья');
        const textureLabel = nextProduct.texture[age.months >= 10 ? 10 : age.months >= 8 ? 8 : 6] || 'пюре';
        recContent.innerHTML = `
            <div><strong>${nextProduct.name}</strong> ${tags.map(t => `<span class="tag">${t}</span>`).join(' ')}</div>
            <div style="font-size:14px; color:#7a6e66; margin-top:4px;">${nextProduct.desc || ''}</div>
            <div style="font-size:13px; color:#b0a69e;">Текстура: ${textureLabel}</div>
        `;
    } else {
        recContent.innerHTML = `<span class="sub">🌸 Все подходящие продукты уже введены!</span>`;
    }

    const planEl = document.getElementById('todayPlan');
    const dailyPlan = generateDailyPlan(profile, PRODUCTS);
    if (dailyPlan.length > 0) {
        planEl.innerHTML = `
            <div style="font-size:14px; color:#7a6e66; margin-bottom:6px;">🍼 ${feeding} — основное питание</div>
            ${dailyPlan.map(meal => `
                <div class="plan-item">
                    <span class="time">${meal.time}</span>
                    <span class="food">${meal.foods.join(' + ')} ${meal.isNew ? '<span class="new-badge">🆕</span>' : ''}</span>
                    <span class="desc">${meal.description}</span>
                </div>
            `).join('')}
            <div style="margin-top:8px;font-size:13px;color:#b0a69e;">💧 Предлагайте воду из чашки во время еды.</div>
        `;
    } else {
        planEl.innerHTML = `<span class="sub">План формируется...</span>`;
    }

    document.getElementById('textureContent').innerHTML = `
        <div style="font-size:14px; color:#7a6e66;">Сейчас: <strong>${texture}</strong></div>
        <div style="font-size:13px; color:#b0a69e; margin-top:4px;">Переход к более сложной текстуре по мере роста навыков.</div>
    `;

    const planFull = document.getElementById('planContent');
    const stageDesc = STAGE_TIPS[stage] || '';
    const nextProducts = getAvailableProducts(profile, PRODUCTS).slice(0, 5);
    planFull.innerHTML = `
        <div style="font-size:14px; color:#7a6e66;">Этап: <strong>${stage}</strong></div>
        <div style="font-size:14px; margin:8px 0;">${stageDesc}</div>
        <div style="font-size:13px; color:#b0a69e;">🍼 ${feeding} — продолжает быть важным источником питания.</div>
        ${nextProducts.length > 0 ? `
            <div style="margin-top:8px; font-weight:500;">Следующие продукты для введения:</div>
            ${nextProducts.map(p => `<div class="plan-item"><span class="food">${p.name}</span><span class="desc">${p.texture[age.months >= 10 ? 10 : age.months >= 8 ? 8 : 6] || 'пюре'}</span></div>`).join('')}
        ` : '<div class="sub">Все продукты введены.</div>'}
        <div style="margin-top:8px;font-size:13px;color:#b0a69e;">💧 Вода предлагается во время еды.</div>
    `;

    renderProducts();
    renderDiary();
    renderRecipes();
    renderProfile();
    renderWeek();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    const age = profile.age_months || 0;
    const feeding = profile.feeding_type || 'ГВ';
    const filter = document.getElementById('categoryFilter').value;

    let products = PRODUCTS.filter(p => p.min_age <= age && p.min_age >= getMinAge(feeding));
    if (filter !== 'all') products = products.filter(p => p.cat === filter);

    if (products.length === 0) {
        grid.innerHTML = '<span class="sub" style="grid-column:1/-1;">Нет продуктов для этого возраста</span>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const status = getProductStatus(profile, p.name);
        const tags = [];
        if (p.iron) tags.push('🩸');
        if (p.allergen) tags.push('⚠️');
        if (p.choking) tags.push('🚫');
        const statusLabels = {
            'introduced': '✅ введён',
            'loved': '❤️ любит',
            'disliked': '😐 не нравится',
            'excluded': '🚫 исключён',
            'allergy': '⚠️ аллергия',
            'new': 'рекомендуется'
        };
        const textureLabel = p.texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || '—';
        const isIntroduced = profile.introduced_foods && profile.introduced_foods.includes(p.name);
        const isLoved = profile.loved_foods && profile.loved_foods.includes(p.name);
        const isDisliked = profile.disliked_foods && profile.disliked_foods.includes(p.name);
        const isExcluded = profile.excluded_foods && profile.excluded_foods.includes(p.name);
        const isAllergy = profile.allergies && profile.allergies.includes(p.name);

        let buttons = '';
        if (!isIntroduced && !isExcluded && !isAllergy) {
            buttons = `<button class="btn btn-sm btn-outline introduce-btn" data-product="${p.name}">➕ Ввести</button>`;
        }
        if (isIntroduced && !isLoved && !isDisliked) {
            buttons = `
                <button class="btn btn-sm btn-outline love-btn" data-product="${p.name}">❤️ Любит</button>
                <button class="btn btn-sm btn-outline dislike-btn" data-product="${p.name}">😐 Не нравится</button>
            `;
        }
        if (isIntroduced && (isLoved || isDisliked)) {
            buttons = `<span class="tag">${isLoved ? '❤️ любит' : '😐 не нравится'}</span>`;
        }
        if (isExcluded) {
            buttons = `<span class="tag tag-status">🚫 исключён</span>`;
        }
        if (isAllergy) {
            buttons = `<span class="tag tag-allergen">⚠️ аллергия</span>`;
        }

        return `
            <div class="product-card" data-product="${p.name}">
                <div class="name">${p.name}</div>
                <div class="meta">
                    ${tags.map(t => `<span class="tag">${t}</span>`).join(' ')}
                    <span class="tag tag-status">${statusLabels[status] || status}</span>
                </div>
                <div style="font-size:12px; color:#b0a69e; margin-top:4px;">${textureLabel}</div>
                <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
                    ${buttons}
                    ${!isExcluded && !isAllergy && isIntroduced ? `<button class="btn btn-sm btn-outline exclude-btn" data-product="${p.name}">🚫 Исключить</button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.introduce-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (!profile.introduced_foods) profile.introduced_foods = [];
            if (!profile.introduced_foods.includes(product)) {
                profile.introduced_foods.push(product);
                profile.active_product = product;
                const info = PRODUCTS.find(p => p.name === product);
                profile.observation_days = (info && info.allergen) ? 3 : 2;
                profile.observation_start = new Date().toLocaleDateString('ru-RU');
                if (!profile.food_history) profile.food_history = [];
                profile.food_history.push({
                    product: product,
                    date: new Date().toLocaleDateString('ru-RU'),
                    reaction: 'Всё хорошо',
                    notes: 'Введён через список продуктов'
                });
                saveProfile();
                render();
            }
        });
    });

    grid.querySelectorAll('.love-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (!profile.loved_foods) profile.loved_foods = [];
            if (!profile.loved_foods.includes(product)) {
                profile.loved_foods.push(product);
                if (profile.disliked_foods && profile.disliked_foods.includes(product)) {
                    profile.disliked_foods = profile.disliked_foods.filter(p => p !== product);
                }
                saveProfile();
                render();
            }
        });
    });

    grid.querySelectorAll('.dislike-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (!profile.disliked_foods) profile.disliked_foods = [];
            if (!profile.disliked_foods.includes(product)) {
                profile.disliked_foods.push(product);
                if (profile.loved_foods && profile.loved_foods.includes(product)) {
                    profile.loved_foods = profile.loved_foods.filter(p => p !== product);
                }
                saveProfile();
                render();
            }
        });
    });

    grid.querySelectorAll('.exclude-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.dataset.product;
            if (confirm(`Исключить ${product} из рациона?`)) {
                if (!profile.excluded_foods) profile.excluded_foods = [];
                if (!profile.excluded_foods.includes(product)) {
                    profile.excluded_foods.push(product);
                    if (profile.introduced_foods && profile.introduced_foods.includes(product)) {
                        profile.introduced_foods = profile.introduced_foods.filter(p => p !== product);
                    }
                    if (profile.loved_foods && profile.loved_foods.includes(product)) {
                        profile.loved_foods = profile.loved_foods.filter(p => p !== product);
                    }
                    if (profile.disliked_foods && profile.disliked_foods.includes(product)) {
                        profile.disliked_foods = profile.disliked_foods.filter(p => p !== product);
                    }
                    saveProfile();
                    render();
                }
            }
        });
    });
}

function renderDiary() {
    const list = document.getElementById('diaryList');
    const history = profile.food_history || [];
    if (history.length === 0) {
        list.innerHTML = '<span class="sub">Пока нет записей</span>';
        return;
    }
    list.innerHTML = history.slice().reverse().map(item => `
        <div class="diary-item">
            <div class="top"><span class="product">${item.product}</span><span class="date">${item.date}</span></div>
            <div class="reaction">${item.reaction || 'Реакция не указана'} ${item.notes ? '📝 ' + item.notes : ''}</div>
        </div>
    `).join('');
}

function renderRecipes() {
    const grid = document.getElementById('recipeGrid');
    const age = profile.age_months || 0;
    const filter = document.getElementById('recipeAgeFilter').value;

    let recipes = RECIPES.filter(r => r.age <= age);
    if (filter !== 'all') recipes = recipes.filter(r => r.age >= parseInt(filter));

    if (recipes.length === 0) {
        grid.innerHTML = '<span class="sub" style="grid-column:1/-1;">Нет рецептов для этого возраста</span>';
        return;
    }

    // Добавляем стили для сетки рецептов, если их нет
    if (!document.querySelector('.recipe-grid')) {
        const style = document.createElement('style');
        style.textContent = `
            .recipe-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
            }
            .recipe-card {
                background: #faf6f0;
                border-radius: 12px;
                padding: 12px;
                border: 1px solid #efe8e0;
            }
            .recipe-card .name {
                font-weight: 500;
                font-size: 15px;
            }
            .recipe-card .meta {
                font-size: 13px;
                color: #7a6e66;
                margin-top: 4px;
            }
            .recipe-card .prep {
                font-size: 13px;
                color: #555;
                margin-top: 6px;
            }
        `;
        document.head.appendChild(style);
    }

    grid.innerHTML = recipes.map(r => `
        <div class="recipe-card">
            <div class="name">${r.name}</div>
            <div class="meta">Возраст: ${r.age}+ мес | ${r.texture} | ${r.approach.join(', ')}</div>
            <div class="prep"><strong>Ингредиенты:</strong> ${r.ingredients.join(', ')}</div>
            <div class="prep"><strong>Приготовление:</strong> ${r.prep}</div>
            ${r.storage ? `<div class="prep"><strong>Хранение:</strong> ${r.storage}</div>` : ''}
            ${r.allergens && r.allergens.length ? `<div class="prep"><strong>⚠️ Аллергены:</strong> ${r.allergens.join(', ')}</div>` : ''}
            ${r.iron ? '<div class="prep">🩸 Источник железа</div>' : ''}
        </div>
    `).join('');
}

function renderProfile() {
    document.getElementById('profileName').textContent = profile.baby_name || '—';
    const age = calcAge(profile.birth_date);
    document.getElementById('profileAge').textContent = `${age.months} мес. ${age.days} дн.`;
    const readinessText = profile.readiness_passed ? `✅ Пройден (${profile.readiness_score}/5)` : '❌ Не пройден';
    const fields = [
        ['Мама', profile.mother_name || '—'],
        ['Дата рождения', profile.birth_date || '—'],
        ['Пол', profile.gender || '—'],
        ['Вес', profile.current_weight ? profile.current_weight + ' г' : '—'],
        ['Рост', profile.current_length ? profile.current_length + ' см' : '—'],
        ['Тип вскармливания', profile.feeding_type || '—'],
        ['Недоношенность', profile.prematurity || 'Доношенный'],
        ['Прикорм начат', profile.prikorm_started ? `Да (с ${profile.prikorm_start_date || '—'})` : 'Нет'],
        ['Стратегия', profile.feeding_strategy || 'Комбинированный'],
        ['Введено продуктов', (profile.introduced_foods || []).length],
        ['Аллергий', (profile.allergies || []).length],
        ['Готовность', readinessText]
    ];
    document.getElementById('profileFields').innerHTML = fields.map(([label, value]) => `
        <div class="row"><span class="label">${label}</span><span class="value">${value}</span></div>
    `).join('');
}

// ================================================================
// 8. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (из utils.js — дублируем для самодостаточности)
// ================================================================

function calcAge(birthDate) {
    if (!birthDate) return { months: 0, days: 0 };
    const parts = birthDate.split('.');
    if (parts.length !== 3) return { months: 0, days: 0 };
    const birth = new Date(parts[2], parts[1] - 1, parts[0]);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) months = 0;
    return { months, days };
}

function getMinAge(feedingType) {
    return CONFIG.minAgeByFeeding[feedingType] || 6;
}

function getStage(days) {
    const stages = CONFIG.stages;
    let result = 'подготовка';
    for (const [key, val] of Object.entries(stages)) {
        if (days >= val.days) {
            result = key;
        }
    }
    return result;
}

function getPrikormDays(profile) {
    if (!profile.prikorm_start_date) return 0;
    try {
        const start = new Date(profile.prikorm_start_date.split('.').reverse().join('-'));
        return Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
}

function getTextureStage(ageMonths, prikormDays) {
    if (prikormDays < 14) return 'жидкое пюре';
    if (prikormDays < 30) return 'густое пюре';
    if (ageMonths >= 8 && prikormDays > 30) return 'размятое';
    if (ageMonths >= 10) return 'кусочки';
    return 'размятое';
}

function getAvailableProducts(profile, products) {
    const introduced = profile.introduced_foods || [];
    const excluded = profile.excluded_foods || [];
    const allergies = profile.allergies || [];
    const age = profile.age_months || 0;
    const feeding = profile.feeding_type || 'ГВ';
    const minAge = getMinAge(feeding);
    return products.filter(p =>
        p.min_age <= age &&
        p.min_age >= minAge &&
        !introduced.includes(p.name) &&
        !excluded.includes(p.name) &&
        !allergies.includes(p.name)
    );
}

function getNextProduct(profile, products) {
    const available = getAvailableProducts(profile, products);
    if (available.length === 0) return null;
    const iron = available.filter(p => p.iron);
    if (iron.length > 0) {
        iron.sort((a, b) => a.min_age - b.min_age);
        return iron[0];
    }
    if (profile.age_months >= 6) {
        const allergens = available.filter(p => p.allergen);
        if (allergens.length > 0) {
            allergens.sort((a, b) => a.min_age - b.min_age);
            return allergens[0];
        }
    }
    const rest = available.filter(p => !p.iron && !p.allergen);
    if (rest.length > 0) {
        const introduced = profile.introduced_foods || [];
        const categories = [...new Set(rest.map(p => p.cat))];
        const categoryCount = {};
        introduced.forEach(name => {
            const product = products.find(p => p.name === name);
            if (product) {
                categoryCount[product.cat] = (categoryCount[product.cat] || 0) + 1;
            }
        });
        let minCount = Infinity;
        let selectedCategory = categories[0];
        for (const cat of categories) {
            const count = categoryCount[cat] || 0;
            if (count < minCount) {
                minCount = count;
                selectedCategory = cat;
            }
        }
        const candidates = rest.filter(p => p.cat === selectedCategory);
        candidates.sort((a, b) => a.min_age - b.min_age);
        return candidates[0];
    }
    return null;
}

function generateDailyPlan(profile, products) {
    const age = profile.age_months || 0;
    const days = getPrikormDays(profile);
    const stage = getStage(days);
    const meals = CONFIG.stages[stage]?.meals || 1;
    const introduced = profile.introduced_foods || [];
    const available = getAvailableProducts(profile, products);
    const result = [];

    if (introduced.length === 0 || available.length === 0) {
        const next = getNextProduct(profile, products);
        if (next) {
            result.push({
                time: '🥄 Прикорм',
                foods: [next.name],
                description: next.texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || 'пюре',
                isNew: true
            });
        }
        return result;
    }

    const knownProducts = introduced.map(name => products.find(p => p.name === name)).filter(Boolean);
    const newProducts = available.slice(0, Math.min(meals, available.length));
    const times = ['🌅 Завтрак', '☀️ Обед', '🌙 Ужин', '🍼 Перекус'];
    let newIndex = 0;

    for (let i = 0; i < meals && i < times.length; i++) {
        const meal = { time: times[i], foods: [], description: '', isNew: false };
        const known = knownProducts.filter(p => p);
        if (known.length > 0) {
            const idx = i % known.length;
            meal.foods.push(known[idx].name);
            meal.description = known[idx].texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || 'пюре';
        }
        if (newIndex < newProducts.length) {
            const np = newProducts[newIndex];
            meal.foods.push('🆕 ' + np.name);
            meal.description = np.texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || 'пюре';
            meal.isNew = true;
            newIndex++;
        }
        if (meal.foods.length > 0) {
            result.push(meal);
        }
    }
    return result;
}

function getProductStatus(profile, productName) {
    const introduced = profile.introduced_foods || [];
    const excluded = profile.excluded_foods || [];
    const allergies = profile.allergies || [];
    const loved = profile.loved_foods || [];
    const disliked = profile.disliked_foods || [];

    if (excluded.includes(productName)) return 'excluded';
    if (allergies.includes(productName)) return 'allergy';
    if (introduced.includes(productName)) {
        if (loved.includes(productName)) return 'loved';
        if (disliked.includes(productName)) return 'disliked';
        return 'introduced';
    }
    return 'new';
}

// ================================================================
// 9. ЗАПУСК
// ================================================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.addEventListener('focus', function() {
    if (profile && profile.birth_date) {
        const age = calcAge(profile.birth_date);
        profile.age_months = age.months;
        profile.age_days = age.days;
        saveProfile();
        render();
    }
});