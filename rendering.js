/* ============================================================
   rendering.js v2.1.1
   Отрисовка экранов с graceful degradation
   ============================================================ */

(function() {
    'use strict';

    const DEFAULT_SCREEN = 'home';
    const VALID_SCREENS = ['home', 'products', 'today', 'diary', 'recipes', 'baby', 'settings', 'onboarding'];

    function safeGlobal(name, fallback) {
        return typeof window[name] !== 'undefined' ? window[name] : fallback;
    }

    function safeCall(fnName, ...args) {
        const fn = window[fnName];
        if (typeof fn === 'function') {
            try {
                return fn(...args);
            } catch (e) {
                console.error('❌ Ошибка в ' + fnName + ':', e);
                return undefined;
            }
        }
        return undefined;
    }

    function getState() {
        return window.STATE || safeGlobal('STATE', {});
    }

    function getBaby() {
        return getState().baby || {};
    }

    function getDiary() {
        return getState().diary || [];
    }

    function getProducts() {
        return safeGlobal('PRODUCTS', []);
    }

    function getRecipes() {
        return safeGlobal('RECIPES', []);
    }

    function getSettings() {
        return getState().settings || {};
    }

    function getUIState() {
        const s = getState();
        if (!s.ui) s.ui = {};
        return s.ui;
    }

    function isProductIntroduced(productId) {
        const introduced = getState().products?.introduced || [];
        return introduced.some(i => (i.id || i) === productId);
    }

    function getPlanForDate(dateStr) {
        const s = getState();
        if (!s.plan) s.plan = { days: {} };
        if (!s.plan.days) s.plan.days = {};
        return s.plan.days[dateStr] || [];
    }

    function setPlanForDate(dateStr, meals) {
        const s = getState();
        if (!s.plan) s.plan = { days: {} };
        if (!s.plan.days) s.plan.days = {};
        s.plan.days[dateStr] = Array.isArray(meals) ? meals : [];
        safeCall('saveState');
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
    }

    function addMealToPlan(dateStr, meal) {
        const plan = getPlanForDate(dateStr);
        plan.push(meal);
        setPlanForDate(dateStr, plan);
    }

    function removeMealFromPlan(dateStr, index) {
        const plan = getPlanForDate(dateStr);
        if (index >= 0 && index < plan.length) {
            plan.splice(index, 1);
            setPlanForDate(dateStr, plan);
        }
    }

    function getDiaryStats() {
        const diary = getDiary();
        return {
            totalEntries: diary.length,
            uniqueProducts: new Set(diary.map(e => e.productId || e.productName)).size
        };
    }

    function formatAge(baby) {
        if (!baby || !baby.birthDate) return 'Возраст не указан';
        try {
            const birth = new Date(baby.birthDate);
            const now = new Date();
            const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
            if (months < 0) return 'Возраст не указан';
            if (months < 12) return months + ' мес.';
            const years = Math.floor(months / 12);
            const remMonths = months % 12;
            return years + ' г. ' + remMonths + ' мес.';
        } catch (e) {
            return 'Возраст не указан';
        }
    }

    /* ============================================================
       RENDER CORE
    ============================================================ */

    function render(screen) {
        screen = screen || getUIState().screen || DEFAULT_SCREEN;
        if (!VALID_SCREENS.includes(screen)) {
            console.warn('⚠️ Неизвестный экран: ' + screen);
            screen = DEFAULT_SCREEN;
        }
        const content = document.getElementById('app-content');
        const navRoot = document.getElementById('bottom-nav-root');
        if (!content) {
            console.error('❌ #app-content не найден');
            return;
        }
        let html = '';
        try {
            switch (screen) {
                case 'home':
                    html = renderHome();
                    break;
                case 'products':
                    html = renderProducts();
                    break;
                case 'diary':
                    html = renderDiary();
                    break;
                case 'recipes':
                    html = renderRecipes();
                    break;
                case 'today':
                    html = renderToday();
                    break;
                case 'baby':
                    html = renderBaby();
                    break;
                case 'settings':
                    html = renderSettings();
                    break;
                case 'onboarding':
                    html = renderOnboarding();
                    break;
                default:
                    html = renderHome();
            }
        } catch (e) {
            console.error('❌ Ошибка рендера экрана ' + screen + ':', e);
            html = renderErrorScreen('Не удалось загрузить экран');
        }
        content.innerHTML = html;
        if (navRoot) navRoot.innerHTML = renderBottomNavigation(screen);
        window.scrollTo({ top: 0, behavior: 'instant' });
        const ui = getUIState();
        ui.previousScreen = ui.screen;
        ui.screen = screen;
    }

    function renderErrorScreen(message) {
        return '<div class="screen"><div class="error-screen"><div class="error-icon">😔</div><h2>Что-то пошло не так</h2><p>' + (message || 'Неизвестная ошибка') + '</p><button onclick="location.reload()" class="btn-primary">Перезагрузить</button></div></div>';
    }

    /* ============================================================
       HOME
    ============================================================ */

    function renderHome() {
        const baby = getBaby();
        const diary = getDiary();
        const products = getProducts();
        const introducedCount = getState().products?.introduced?.length || 0;
        const totalProducts = products.length || 1;
        const progressPct = Math.min(Math.round(introducedCount / totalProducts * 100), 100);
        const age = formatAge(baby);
        const todayEntries = diary.filter(e => e.date === new Date().toISOString().slice(0, 10));

        return `<div class="screen">
            <div class="page-header">
                <h1>🌸 Прикорм</h1>
                <button class="icon-button" data-action="navigate" data-screen="settings">⚙️</button>
            </div>
            <div class="baby-profile-card">
                <div class="baby-avatar">👶</div>
                <div><strong>${baby.name || 'Малыш'}</strong><br><span class="muted">${age}</span></div>
                <button class="icon-button" data-action="navigate" data-screen="baby">✏️</button>
            </div>
            <div class="progress-card">
                <div class="section-heading"><span>Прогресс</span><span>${introducedCount} / ${totalProducts}</span></div>
                <div class="progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
            </div>
            <div class="quick-actions">
                <button class="quick-action" data-action="add-food"><span>🥣</span><strong>Добавить</strong><small>Записать в дневник</small></button>
                <button class="quick-action" data-action="navigate" data-screen="products"><span>🥑</span><strong>Продукты</strong><small>База продуктов</small></button>
                <button class="quick-action" data-action="navigate" data-screen="diary"><span>📖</span><strong>Дневник</strong><small>${diary.length} записей</small></button>
                <button class="quick-action" data-action="navigate" data-screen="recipes"><span>🍲</span><strong>Рецепты</strong><small>Идеи</small></button>
            </div>
            ${todayEntries.length > 0 ? `<div class="status-card"><div class="row"><span class="label">Сегодня</span><span class="value">${todayEntries.length} записей</span></div></div>` : ''}
        </div>`;
    }

    /* ============================================================
       PRODUCTS
    ============================================================ */

    function renderProducts() {
        const products = getProducts();
        const ui = getUIState();
        const search = (ui.productSearch || '').toLowerCase();
        const currentCat = ui.productCategory || 'all';
        let filtered = products;
        if (search) filtered = filtered.filter(p => p.name && p.name.toLowerCase().includes(search));
        const cats = ['овощ', 'фрукт', 'каша', 'мясо', 'рыба', 'яйцо', 'молочное', 'бобовые', 'орехи'];
        if (currentCat !== 'all') filtered = filtered.filter(p => p.cat === currentCat);

        return `<div class="screen">
            <div class="page-header"><h1>Продукты</h1></div>
            <div class="search-box">🔎 <input id="product-search" type="search" placeholder="Найти продукт..." value="${ui.productSearch || ''}"></div>
            <div class="category-scroll">
                <button class="category-chip ${currentCat === 'all' ? 'active' : ''}" data-action="product-category" data-category="all">Все</button>
                ${cats.map(c => `<button class="category-chip ${currentCat === c ? 'active' : ''}" data-action="product-category" data-category="${c}">${c}</button>`).join('')}
            </div>
            <div class="products-grid">
                ${filtered.length ? filtered.map(p => `<div class="product-card ${isProductIntroduced(p.id) ? 'introduced' : ''}" data-action="open-product" data-product-id="${p.id}">
                    <span class="product-emoji">${p.emoji || '🥣'}</span>
                    <h3>${p.name}</h3>
                    <div class="product-tags"><span>${p.min_age || 0}+ мес.</span>${p.iron ? '<span>🩸 Железо</span>' : ''}${p.allergen ? '<span>⚠️ Аллерген</span>' : ''}</div>
                    ${isProductIntroduced(p.id) ? '<div class="introduced-label">✓ Пробовали</div>' : ''}
                </div>`).join('') :
                `<div class="empty-state"><div class="empty-icon">🔍</div><h3>Ничего не найдено</h3><p>Попробуйте изменить фильтр</p></div>`}
            </div>
        </div>`;
    }

    /* ============================================================
       DIARY
    ============================================================ */

    function renderDiary() {
        const diary = [...getDiary()].sort((a, b) => ((b.date || '') + (b.time || '')).localeCompare((a.date || '') + (a.time || '')));
        const stats = getDiaryStats();

        return `<div class="screen">
            <div class="page-header"><h1>Дневник</h1><button class="icon-button" data-action="add-diary">➕</button></div>
            <div style="display:flex;gap:16px;background:var(--bg-card);padding:14px;border-radius:var(--radius);margin-bottom:16px;border:1px solid var(--border-color)">
                <div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:700">${stats.totalEntries}</div><div style="font-size:12px;color:var(--text-muted)">записей</div></div>
                <div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:700">${stats.uniqueProducts}</div><div style="font-size:12px;color:var(--text-muted)">продуктов</div></div>
            </div>
            ${diary.length ? diary.map(e => `<div class="diary-entry">
                <div class="diary-entry-icon">${e.source === 'store' ? '🛒' : '🥣'}</div>
                <div class="diary-entry-content">
                    <div class="diary-entry-header"><strong>${e.productName || 'Продукт'}</strong><span>${e.time || ''}</span></div>
                    <div class="diary-entry-meta">${e.amount ? e.amount + ' г' : ''} ${e.preparation || ''} ${e.liked === true ? '❤️' : e.liked === false ? '🤍' : ''}</div>
                </div>
                <button class="icon-button" data-action="edit-diary" data-entry-id="${e.id}">⋯</button>
            </div>`).join('') :
            `<div class="empty-state"><div class="empty-icon">📖</div><h3>Дневник пуст</h3><p>Добавьте первый приём пищи.</p></div>`}
        </div>`;
    }

    /* ============================================================
       RECIPES
    ============================================================ */

    function renderRecipes() {
        const recipes = getRecipes();
        return `<div class="screen">
            <div class="page-header"><h1>Рецепты</h1></div>
            ${recipes.length ? recipes.map(r => `<div class="recipe-card" data-action="open-recipe" data-recipe-id="${r.id || ''}">
                <h3>${r.name}</h3>
                <p>${r.desc || ''}</p>
                <div class="meta">с ${r.age || 0} мес.</div>
            </div>`).join('') :
            `<div class="empty-state"><div class="empty-icon">🍲</div><h3>Рецептов пока нет</h3><p>Добавьте свои рецепты.</p></div>`}
        </div>`;
    }

    /* ============================================================
       TODAY (PLAN)
    ============================================================ */

    function renderToday() {
        const dateStr = new Date().toISOString().slice(0, 10);
        const plan = getPlanForDate(dateStr);
        const meals = Array.isArray(plan) ? plan : [];
        let mealsHtml = '';
        if (meals.length) {
            mealsHtml = meals.map((meal, idx) => `<div class="meal-item">
                <div><strong>${meal.name || 'Приём пищи'}</strong><span>${meal.products ? meal.products.join(', ') : '—'}</span></div>
                <button class="icon-button" data-action="remove-meal" data-index="${idx}">✕</button>
            </div>`).join('');
        } else {
            mealsHtml = `<div class="empty-state"><div class="empty-icon">📅</div><h3>Ничего не запланировано</h3><p>Добавьте приём пищи на сегодня.</p></div>`;
        }
        return `<div class="screen">
            <div class="page-header"><h1>Сегодня</h1></div>
            <div class="date-navigation"><button data-action="previous-day">‹</button><span id="today-date">Сегодня</span><button data-action="next-day">›</button></div>
            <div class="daily-plan">${mealsHtml}<button class="primary-button" data-action="add-meal" style="margin-top:12px">➕ Добавить приём пищи</button></div>
        </div>`;
    }

    /* ============================================================
       BABY
    ============================================================ */

    function renderBaby() {
        const baby = getBaby();
        return `<div class="screen">
            <div class="page-header"><h1>Малыш</h1></div>
            <div class="baby-profile-card">
                <div class="baby-avatar">👶</div>
                <div><strong>${baby.name || 'Имя не указано'}</strong><br><span class="muted">${formatAge(baby)}</span></div>
                <button class="icon-button" data-action="edit-baby">✏️</button>
            </div>
            <div class="settings-list">
                <button class="settings-row" data-action="settings" data-setting="feeding-type"><span>🍼</span><div><strong>Тип кормления</strong><small>${baby.feedingType || 'Не указан'}</small></div><span>›</span></button>
                <button class="settings-row" data-action="settings" data-setting="prikorm-start"><span>📅</span><div><strong>Начало прикорма</strong><small>${baby.prikormStartDate || 'Не указано'}</small></div><span>›</span></button>
                <button class="settings-row" data-action="settings" data-setting="approach"><span>🥄</span><div><strong>Подход</strong><small>${baby.approach || 'Можно настроить'}</small></div><span>›</span></button>
            </div>
            <button class="danger-button" data-action="reset-data">Сбросить все данные</button>
        </div>`;
    }

    /* ============================================================
       SETTINGS
    ============================================================ */

    function renderSettings() {
        const settings = getSettings();
        return `<div class="screen">
            <div class="page-header"><h1>Настройки</h1><button class="icon-button" data-action="navigate" data-screen="home">⌂</button></div>
            <div class="settings-list">
                <button class="settings-row" data-action="settings" data-setting="notifications"><span>🔔</span><div><strong>Уведомления</strong><small>${settings.notifications ? 'Включены' : 'Отключены'}</small></div><span>›</span></button>
                <button class="settings-row" data-action="settings" data-setting="theme"><span>🎨</span><div><strong>Тема</strong><small>${settings.theme || 'Светлая'}</small></div><span>›</span></button>
                <button class="settings-row" data-action="settings" data-setting="home-blocks"><span>🏠</span><div><strong>Главный экран</strong><small>Настроить блоки</small></div><span>›</span></button>
            </div>
            <div style="margin-top:24px;padding:16px;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border-color)">
                <div style="font-size:14px;color:var(--text-muted);text-align:center"><div>🌸 Прикорм</div><div style="margin-top:4px">v2.1.1</div></div>
            </div>
            <button class="danger-button" data-action="reset-data">Сбросить данные</button>
        </div>`;
    }

    /* ============================================================
       ONBOARDING
    ============================================================ */

    function renderOnboarding() {
        return `<div class="screen">
            <div class="onboarding">
                <div class="emoji-big">🌸</div>
                <h1>Добро пожаловать!</h1>
                <p>Приложение для ведения прикорма вашего малыша</p>
                <div class="btn-group">
                    <button class="primary" data-action="start-onboarding">Начать</button>
                    <button class="secondary" data-action="skip-onboarding">Пропустить</button>
                </div>
            </div>
        </div>`;
    }

    /* ============================================================
       BOTTOM NAVIGATION
    ============================================================ */

    function renderBottomNavigation(active) {
        const items = [
            { id: 'home', icon: '⌂', label: 'Главная' },
            { id: 'products', icon: '🥑', label: 'Продукты' },
            { id: 'today', icon: '📅', label: 'Сегодня' },
            { id: 'diary', icon: '📖', label: 'Дневник' },
            { id: 'baby', icon: '👶', label: 'Малыш' }
        ];
        return `<nav class="bottom-navigation">${items.map(it => `<button class="nav-item ${active === it.id ? 'active' : ''}" data-action="navigate" data-screen="${it.id}"><span>${it.icon}</span><small>${it.label}</small></button>`).join('')}</nav>`;
    }

    /* ============================================================
       EXPORTS
    ============================================================ */

    window.render = render;
    window.renderHome = renderHome;
    window.renderProducts = renderProducts;
    window.renderDiary = renderDiary;
    window.renderRecipes = renderRecipes;
    window.renderToday = renderToday;
    window.renderBaby = renderBaby;
    window.renderSettings = renderSettings;
    window.renderOnboarding = renderOnboarding;
    window.renderBottomNavigation = renderBottomNavigation;
    window.renderErrorScreen = renderErrorScreen;
    window.isProductIntroduced = isProductIntroduced;
    window.getPlanForDate = getPlanForDate;
    window.setPlanForDate = setPlanForDate;
    window.addMealToPlan = addMealToPlan;
    window.removeMealFromPlan = removeMealFromPlan;
    window.getDiaryStats = getDiaryStats;
    window.formatAge = formatAge;

})();