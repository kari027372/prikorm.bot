/* ============================================================
   app.js
   Главная точка запуска приложения
   ============================================================ */

// Используем глобальный APP_CONFIG из config.js
const DEFAULT_SCREEN = "home";

/* ============================================================
   ЗАЩИТА ОТ ОТСУТСТВИЯ buildApp
   ============================================================ */
if (typeof buildApp === 'undefined') {
    console.warn('⚠️ buildApp не определена, создаём заглушку');
    window.buildApp = function() {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div id="app-content"></div>
                <div id="modal-root"></div>
                <div id="toast-root"></div>
            `;
        }
        console.log('✅ buildApp (заглушка) выполнена');
    };
}

/* ============================================================
   INIT
   ============================================================ */
function initApp() {
    console.log(`🌸 ${APP_CONFIG.app.name} v${APP_CONFIG.app.version}`);
    const app = document.getElementById('app');
    if (!app) {
        console.error("❌ Не найден #app");
        return;
    }
    initializeState();
    if (typeof initTheme === "function") initTheme();
    if (typeof buildApp === 'function') buildApp();
    else {
        console.warn('⚠️ buildApp не найдена, создаём заглушку вручную');
        app.innerHTML = `
            <div id="app-content"></div>
            <div id="modal-root"></div>
            <div id="toast-root"></div>
        `;
    }
    if (typeof setupEventListeners === "function") setupEventListeners();
    else console.warn('⚠️ setupEventListeners не найдена');
    const screen = (typeof STATE !== 'undefined' && STATE.ui && STATE.ui.screen) ? STATE.ui.screen : DEFAULT_SCREEN;
    if (typeof showScreen === 'function') showScreen(screen);
    else if (typeof render === 'function') render(screen);
    else console.error('❌ render или showScreen не найдены!');
    if (typeof updateProfileUI === 'function') updateProfileUI();
    console.log("✅ Приложение запущено");
}

/* ============================================================
   STATE INITIALIZATION
   ============================================================ */
function initializeState() {
    if (typeof loadState === "function") {
        loadState();
    } else {
        if (typeof STATE === "undefined") {
            window.STATE = {
                baby: {},
                diary: [],
                products: { introduced: [], favorites: [] },
                settings: { notifications: true },
                ui: { screen: DEFAULT_SCREEN },
                onboarding: {
                    readiness: {},
                    allergies: [],
                    diet: [],
                    favoriteFoods: [],
                    worries: [],
                    confidence: ''
                }
            };
        }
    }
    normalizeState();
}

/* ============================================================
   NORMALIZE STATE
   ============================================================ */
function normalizeState() {
    if (!window.STATE) window.STATE = {};
    if (!STATE.baby) STATE.baby = {};
    if (!Array.isArray(STATE.diary)) STATE.diary = [];
    if (!STATE.products) STATE.products = { introduced: [], favorites: [] };
    if (!Array.isArray(STATE.products.introduced)) STATE.products.introduced = [];
    if (!Array.isArray(STATE.products.favorites)) STATE.products.favorites = [];
    if (!STATE.settings) STATE.settings = { notifications: true };
    if (!STATE.ui) STATE.ui = { screen: DEFAULT_SCREEN };
    if (!STATE.onboarding) STATE.onboarding = {
        readiness: {},
        allergies: [],
        diet: [],
        favoriteFoods: [],
        worries: [],
        confidence: ''
    };
    if (!Array.isArray(STATE.brands)) STATE.brands = [];
    if (!Array.isArray(STATE.notes)) STATE.notes = [];
    if (!Array.isArray(STATE.waterLog)) STATE.waterLog = [];
}

/* ============================================================
   ОНБОРДИНГ (расширенный)
   ============================================================ */
function renderOnboarding() {
    const app = document.getElementById('app');
    if (!app) return;
    let step = 0;
    // Общее количество шагов теперь 11 (было 5)
    const totalSteps = 11;

    const renderStep = (stepIndex) => {
        let html = `<div class="onboarding">`;
        html += `<div class="step-indicators">`;
        for (let i = 0; i < totalSteps; i++) {
            html += `<span class="${i === stepIndex ? 'active' : ''}"></span>`;
        }
        html += `</div>`;

        // Содержимое шага – порядок: 
        // 0 – имя, 1 – дата, 2 – вскармливание, 3 – начало прикорма, 4 – подход,
        // 5 – признаки готовности (новый), 6 – аллергии (новый), 7 – диета (новый), 
        // 8 – любимые продукты (новый), 9 – страхи (новый), 10 – уверенность (новый)
        switch (stepIndex) {
            case 0: // имя
                html += `
                    <div class="emoji-big">👶</div>
                    <h1>Как зовут малыша?</h1>
                    <p>Вы можете пропустить</p>
                    <input type="text" id="onboarding-name" placeholder="Имя" value="${STATE.baby.name || ''}">
                    <button class="skip" data-action="skip-name">Пропустить →</button>
                `;
                break;
            case 1: // дата
                html += `
                    <div class="emoji-big">📅</div>
                    <h1>Дата рождения</h1>
                    <p>Мы рассчитаем возраст</p>
                    <input type="date" id="onboarding-birth" value="${STATE.baby.birthDate || ''}">
                `;
                break;
            case 2: // вскармливание
                html += `
                    <div class="emoji-big">🍼</div>
                    <h1>Тип вскармливания</h1>
                    <div class="btn-group">
                        <button class="primary" data-value="ГВ">🤱 Грудное</button>
                        <button class="primary" data-value="ИВ">🍼 Искусственное</button>
                        <button class="primary" data-value="Смешанное">🤍 Смешанное</button>
                    </div>
                `;
                break;
            case 3: // начало прикорма
                html += `
                    <div class="emoji-big">🌱</div>
                    <h1>Вы уже начали прикорм?</h1>
                    <div class="btn-group">
                        <button class="primary" data-value="yes">Да</button>
                        <button class="primary" data-value="no">Нет</button>
                    </div>
                    <div id="start-date-field" style="display:none; margin-top:16px;">
                        <label>Дата начала прикорма</label>
                        <input type="date" id="onboarding-start-date">
                    </div>
                `;
                break;
            case 4: // подход
                html += `
                    <div class="emoji-big">🥄</div>
                    <h1>Выберите подход</h1>
                    <p>Можно изменить позже</p>
                    <div class="btn-group">
                        <button class="primary" data-value="puree">🥄 Пюре</button>
                        <button class="primary" data-value="blw">🖐 BLW</button>
                        <button class="primary" data-value="mixed">🥣 Комбинированный</button>
                        <button class="secondary" data-value="unknown">🤷 Пока не знаю</button>
                    </div>
                `;
                break;
            // НОВЫЕ ШАГИ
            case 5: // признаки готовности
                const r = STATE.onboarding.readiness || {};
                html += `
                    <div class="emoji-big">🧸</div>
                    <h1>Признаки готовности</h1>
                    <p>Какие признаки вы замечаете? (выберите все)</p>
                    <div class="btn-group" style="flex-direction:column; gap:8px;">
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="readiness-sit" ${r.sitSupport ? 'checked' : ''}> Сидит с поддержкой
                        </label>
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="readiness-head" ${r.headControl ? 'checked' : ''}> Уверенно держит голову
                        </label>
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="readiness-reach" ${r.reachesFood ? 'checked' : ''}> Тянется к еде
                        </label>
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="readiness-mouth" ${r.opensMouth ? 'checked' : ''}> Открывает рот при виде еды
                        </label>
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="readiness-notsure" ${r.notSure ? 'checked' : ''}> Пока не уверена
                        </label>
                    </div>
                `;
                break;
            case 6: // аллергии
                const allergies = STATE.onboarding.allergies || [];
                const allAllergens = ['Egg','Dairy','Tree nuts','Fish','Wheat','Soy','Sesame','Citrus fruits'];
                html += `
                    <div class="emoji-big">⚠️</div>
                    <h1>Аллергии</h1>
                    <p>Есть ли у малыша аллергия на что-то?</p>
                    <div class="btn-group" style="flex-direction:column; gap:8px;">
                        ${allAllergens.map(a => `
                            <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                                <input type="checkbox" class="allergy-check" value="${a}" ${allergies.includes(a) ? 'checked' : ''}> ${a}
                            </label>
                        `).join('')}
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="allergy-none" ${allergies.length === 0 ? 'checked' : ''}> Нет
                        </label>
                    </div>
                `;
                break;
            case 7: // диета
                const diet = STATE.onboarding.diet || [];
                const dietOpts = ['Reflux','Dairy-free','Gluten-free','Eczema-friendly','Pork-free','Rich iron','Grain-free'];
                html += `
                    <div class="emoji-big">🥗</div>
                    <h1>Диета</h1>
                    <p>Есть ли особенности питания?</p>
                    <div class="btn-group" style="flex-direction:column; gap:8px;">
                        ${dietOpts.map(d => `
                            <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                                <input type="checkbox" class="diet-check" value="${d}" ${diet.includes(d) ? 'checked' : ''}> ${d}
                            </label>
                        `).join('')}
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="diet-none" ${diet.length === 0 ? 'checked' : ''}> Нет
                        </label>
                    </div>
                `;
                break;
            case 8: // любимые продукты
                const favs = STATE.onboarding.favoriteFoods || [];
                const foodOpts = ['Banana','Mango','Cucumber','Chicken','Apple','Cheese','Egg','Avocado','Strawberry'];
                html += `
                    <div class="emoji-big">🍎</div>
                    <h1>Любимые продукты</h1>
                    <p>Что бы вы хотели предложить малышу в первую неделю?</p>
                    <div class="btn-group" style="flex-direction:column; gap:8px;">
                        ${foodOpts.map(f => `
                            <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                                <input type="checkbox" class="fav-check" value="${f}" ${favs.includes(f) ? 'checked' : ''}> ${f}
                            </label>
                        `).join('')}
                        <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                            <input type="checkbox" id="fav-none" ${favs.length === 0 ? 'checked' : ''}> Не знаю
                        </label>
                    </div>
                `;
                break;
            case 9: // страхи
                const worries = STATE.onboarding.worries || [];
                const worryOpts = ['Choking & Gagging','Allergic reactions','Baby refusing food','Getting enough iron & nutrients','Doing something wrong'];
                html += `
                    <div class="emoji-big">😰</div>
                    <h1>Что вас беспокоит?</h1>
                    <p>Выберите все, что вас волнует</p>
                    <div class="btn-group" style="flex-direction:column; gap:8px;">
                        ${worryOpts.map(w => `
                            <label style="display:flex; align-items:center; gap:10px; font-weight:400; font-size:16px; background:#fafafa; padding:12px; border-radius:12px;">
                                <input type="checkbox" class="worry-check" value="${w}" ${worries.includes(w) ? 'checked' : ''}> ${w}
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
            case 10: // уверенность
                const confidence = STATE.onboarding.confidence || '';
                html += `
                    <div class="emoji-big">💪</div>
                    <h1>Как вы себя чувствуете?</h1>
                    <p>Готовы начать прикорм?</p>
                    <div class="btn-group">
                        <button class="${confidence === 'nervous' ? 'primary' : ''}" data-value="nervous">😰 Нервничаю</button>
                        <button class="${confidence === 'overwhelmed' ? 'primary' : ''}" data-value="overwhelmed">😵 Растеряна</button>
                        <button class="${confidence === 'confident' ? 'primary' : ''}" data-value="confident">😊 Уверена</button>
                        <button class="${confidence === 'very' ? 'primary' : ''}" data-value="very">💪 Очень уверена</button>
                    </div>
                `;
                break;
        }

        // Кнопки навигации
        html += `<div class="nav-buttons">`;
        if (stepIndex > 0) html += `<button class="prev" data-action="prev-step">← Назад</button>`;
        else html += `<div></div>`;
        if (stepIndex < totalSteps - 1) html += `<button class="next" data-action="next-step">Далее →</button>`;
        else html += `<button class="next" data-action="finish-onboarding">🚀 Начать!</button>`;
        html += `</div></div>`;
        app.innerHTML = html;

        // Обработчики для навигации
        document.querySelectorAll('[data-action="next-step"]').forEach(btn => {
            btn.addEventListener('click', () => {
                saveCurrentStepData(stepIndex);
                step = stepIndex + 1;
                renderStep(step);
            });
        });
        document.querySelectorAll('[data-action="prev-step"]').forEach(btn => {
            btn.addEventListener('click', () => {
                saveCurrentStepData(stepIndex);
                step = stepIndex - 1;
                renderStep(step);
            });
        });

        // Обработчики для выбора (кнопки, чекбоксы)
        document.querySelectorAll('[data-value]').forEach(btn => {
            btn.addEventListener('click', function() {
                const val = this.dataset.value;
                if (stepIndex === 2) {
                    STATE.baby.feedingType = val;
                    saveState();
                    document.querySelectorAll('.btn-group button').forEach(b => b.style.border = 'none');
                    this.style.border = '3px solid #d4a373';
                }
                if (stepIndex === 3) {
                    if (val === 'yes') {
                        STATE.baby.feedingStarted = true;
                        document.getElementById('start-date-field').style.display = 'block';
                    } else {
                        STATE.baby.feedingStarted = false;
                        STATE.baby.feedingStartDate = '';
                        document.getElementById('start-date-field').style.display = 'none';
                    }
                    saveState();
                    this.style.border = '3px solid #d4a373';
                }
                if (stepIndex === 4) {
                    STATE.baby.approach = val;
                    saveState();
                    document.querySelectorAll('.btn-group button').forEach(b => b.style.border = 'none');
                    this.style.border = '3px solid #d4a373';
                }
                if (stepIndex === 10) {
                    STATE.onboarding.confidence = val;
                    saveState();
                    document.querySelectorAll('.btn-group button').forEach(b => b.style.border = 'none');
                    this.style.border = '3px solid #d4a373';
                }
            });
        });

        // Обработчик даты начала прикорма
        document.getElementById('onboarding-start-date')?.addEventListener('change', function() {
            STATE.baby.feedingStartDate = this.value;
            saveState();
        });

        // Пропуск имени
        document.querySelector('[data-action="skip-name"]')?.addEventListener('click', function() {
            step = 1;
            renderStep(step);
        });

        // Финиш
        document.querySelector('[data-action="finish-onboarding"]')?.addEventListener('click', function() {
            saveCurrentStepData(stepIndex);
            STATE.onboardingCompleted = true;
            saveState();
            renderApp();
        });
    };

    // Функция сохранения данных текущего шага (для чекбоксов)
    function saveCurrentStepData(stepIndex) {
        if (stepIndex === 0) {
            STATE.baby.name = document.getElementById('onboarding-name')?.value.trim() || '';
            saveState();
        }
        if (stepIndex === 1) {
            STATE.baby.birthDate = document.getElementById('onboarding-birth')?.value || '';
            if (STATE.baby.birthDate) {
                STATE.baby.ageMonths = calcAge(STATE.baby.birthDate).months;
            }
            saveState();
        }
        if (stepIndex === 5) {
            const r = STATE.onboarding.readiness;
            r.sitSupport = document.getElementById('readiness-sit')?.checked || false;
            r.headControl = document.getElementById('readiness-head')?.checked || false;
            r.reachesFood = document.getElementById('readiness-reach')?.checked || false;
            r.opensMouth = document.getElementById('readiness-mouth')?.checked || false;
            r.notSure = document.getElementById('readiness-notsure')?.checked || false;
            saveState();
        }
        if (stepIndex === 6) {
            const checks = document.querySelectorAll('.allergy-check:checked');
            STATE.onboarding.allergies = Array.from(checks).map(el => el.value);
            if (document.getElementById('allergy-none')?.checked) STATE.onboarding.allergies = [];
            saveState();
        }
        if (stepIndex === 7) {
            const checks = document.querySelectorAll('.diet-check:checked');
            STATE.onboarding.diet = Array.from(checks).map(el => el.value);
            if (document.getElementById('diet-none')?.checked) STATE.onboarding.diet = [];
            saveState();
        }
        if (stepIndex === 8) {
            const checks = document.querySelectorAll('.fav-check:checked');
            STATE.onboarding.favoriteFoods = Array.from(checks).map(el => el.value);
            if (document.getElementById('fav-none')?.checked) STATE.onboarding.favoriteFoods = [];
            saveState();
        }
        if (stepIndex === 9) {
            const checks = document.querySelectorAll('.worry-check:checked');
            STATE.onboarding.worries = Array.from(checks).map(el => el.value);
            saveState();
        }
    }

    renderStep(0);
}

/* ============================================================
   ОСНОВНОЕ ПРИЛОЖЕНИЕ (рендеринг)
   ============================================================ */
function renderApp() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!STATE.onboardingCompleted || !STATE.baby.birthDate) {
        renderOnboarding();
        return;
    }

    // Здесь остаётся ваш существующий рендеринг главного экрана
    // (можно оставить без изменений, так как он использует STATE и продукты)
    // Для краткости я показываю упрощённую версию, но вы можете оставить свою.
    // Ниже пример, но можно использовать ваш код из предыдущих версий.
    const age = calcAge(STATE.baby.birthDate);
    const nextProduct = getNextProduct ? getNextProduct() : null;
    const progress = getProgress ? getProgress() : 0;
    const diaryCount = STATE.diary.length;

    let html = `
        <div class="dashboard">
            <div class="welcome-card">
                <div class="info">
                    <h1>🌸 Привет, ${STATE.baby.name || 'Малыш'}!</h1>
                    <p>${age.months} мес. · ${STATE.baby.feedingType}</p>
                </div>
                <div class="avatar">👶</div>
            </div>
            <div class="status-card">
                <div class="row"><span class="label">Статус прикорма</span><span class="value">${STATE.baby.feedingStarted ? '🌱 Активно' : '⏳ Ещё не начат'}</span></div>
                ${STATE.baby.feedingStarted && STATE.baby.feedingStartDate ? `<div class="row" style="margin-top:4px;"><span class="label">Начало</span><span class="value">${STATE.baby.feedingStartDate}</span></div>` : ''}
            </div>
            <div class="progress-card">
                <div class="header"><span>Прогресс</span><span>${STATE.products.introduced.length} из ${PRODUCTS.length} продуктов</span></div>
                <div class="track"><div class="fill" style="width:${progress}%;"></div></div>
            </div>
            <div class="quick-grid">
                <div class="quick-card" data-action="add-product"><span class="icon">🥣</span><div class="label">Добавить продукт</div><div class="desc">В дневник</div></div>
                <div class="quick-card" data-action="products"><span class="icon">🥑</span><div class="label">Продукты</div><div class="desc">Смотреть базу</div></div>
                <div class="quick-card" data-action="diary"><span class="icon">📖</span><div class="label">Дневник</div><div class="desc">${diaryCount} записей</div></div>
                <div class="quick-card" data-action="recipes"><span class="icon">🍲</span><div class="label">Рецепты</div><div class="desc">Идеи</div></div>
            </div>
            ${nextProduct ? `
            <div class="recommendation-card">
                <div class="icon">🌱</div>
                <div class="content">
                    <div class="tag">Следующий шаг</div>
                    <h3>Попробуйте ${nextProduct.name}</h3>
                    <p>${nextProduct.cat}, с ${nextProduct.min_age} мес.</p>
                </div>
                <button class="action" data-action="add-specific" data-id="${nextProduct.id}">➕ Добавить</button>
            </div>` : `
            <div class="recommendation-card">
                <div class="icon">🎉</div>
                <div class="content">
                    <div class="tag">Отлично!</div>
                    <h3>Все продукты введены</h3>
                    <p>Поздравляем!</p>
                </div>
            </div>`}
            <div class="tab-bar">
                <button class="active" data-tab="home">Главная</button>
                <button data-tab="products">Продукты</button>
                <button data-tab="diary">Дневник</button>
                <button data-tab="recipes">Рецепты</button>
                <button data-tab="baby">Малыш</button>
            </div>
            <div id="page-home" class="page active"><div style="background:#fafafa;padding:16px;border-radius:12px;margin-top:8px;"><p style="font-size:14px;color:#555;">Здесь будет подробная информация о сегодняшнем дне.</p></div></div>
            <div id="page-products" class="page">${renderProductsHTML ? renderProductsHTML() : '<p>Продукты</p>'}</div>
            <div id="page-diary" class="page">${renderDiaryHTML ? renderDiaryHTML() : '<p>Дневник</p>'}</div>
            <div id="page-recipes" class="page">${renderRecipesHTML ? renderRecipesHTML() : '<p>Рецепты</p>'}</div>
            <div id="page-baby" class="page">${renderBabyHTML ? renderBabyHTML() : '<p>Профиль</p>'}</div>
        </div>
    `;

    app.innerHTML = html;

    // Обработчики табов (как раньше)
    document.querySelectorAll('.tab-bar button').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            document.querySelectorAll('.tab-bar button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const page = document.getElementById('page-' + tab);
            if (page) page.classList.add('active');
        });
    });

    // Обработчики действий (добавление продуктов и т.д.) – оставить прежние
    // (здесь не дублирую для краткости, они должны быть из вашего кода)
}

/* ============================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (calcAge, isIntroduced, getNextProduct, getProgress)
   должны быть определены ранее в utils или здесь
   ============================================================ */
function calcAge(birthDate) {
    if (!birthDate) return { months: 0 };
    const birth = new Date(birthDate);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    if (today.getDate() < birth.getDate()) months--;
    return { months: Math.max(0, months) };
}

function isIntroduced(id) {
    return STATE.products.introduced && Array.isArray(STATE.products.introduced) && STATE.products.introduced.includes(id);
}

function getNextProduct() {
    const age = STATE.baby.birthDate ? calcAge(STATE.baby.birthDate).months : 0;
    const available = PRODUCTS.filter(p => p.min_age <= age && !isIntroduced(p.id));
    return available.length ? available[0] : null;
}

function getProgress() {
    const total = PRODUCTS.length;
    const introduced = STATE.products.introduced ? STATE.products.introduced.length : 0;
    return total ? Math.round((introduced / total) * 100) : 0;
}

// (Остальные функции рендеринга страниц – renderProductsHTML, renderDiaryHTML и т.д. должны быть определены ранее)
// Для совместимости добавьте их или используйте свои.

/* ============================================================
   ЗАПУСК
   ============================================================ */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

window.initApp = initApp;