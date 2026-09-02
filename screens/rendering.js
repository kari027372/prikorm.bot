/* ============================================================
   rendering.js v2.1.3 — диспетчер рендеринга
   (функции экранов перенесены в папку screens/)
   ============================================================ */

(function() {
    'use strict';

    const DEFAULT_SCREEN = 'home';
    const VALID_SCREENS = ['home', 'products', 'today', 'diary', 'recipes', 'baby', 'settings', 'onboarding'];

    function getState() {
        return window.STATE || {};
    }
    function getBaby() {
        return getState().baby || {};
    }
    function getDiary() {
        return getState().diary || [];
    }
    function getProducts() {
        const products = window.PRODUCTS || window.PRODUCT_DATABASE || [];
        if (!products.length) {
            console.warn('⚠️ PRODUCTS не загружены или пусты. Проверьте data/products.js');
        }
        return products;
    }
    function getRecipes() {
        return window.RECIPES || [];
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
        if (typeof saveState === 'function') saveState();
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
        const content = document.getElementById('app');
        if (!content) {
            console.error('❌ #app не найден');
            return;
        }
        let html = '';
        try {
            switch (screen) {
                case 'home': html = window.renderHome ? window.renderHome() : renderErrorScreen('Ошибка: renderHome не определён'); break;
                case 'products': html = window.renderProducts ? window.renderProducts() : renderErrorScreen('Ошибка: renderProducts не определён'); break;
                case 'diary': html = renderDiary(); break;
                case 'recipes': html = renderRecipes(); break;
                case 'today': html = renderToday(); break;
                case 'baby': html = renderBaby(); break;
                case 'settings': html = renderSettings(); break;
                case 'onboarding': html = renderOnboarding(); break;
                default: html = window.renderHome ? window.renderHome() : '';
            }
        } catch (e) {
            console.error('❌ Ошибка рендера экрана ' + screen + ':', e);
            html = renderErrorScreen('Не удалось загрузить экран');
        }
        content.innerHTML = html + renderBottomNavigation(screen);
        window.scrollTo({ top: 0, behavior: 'instant' });
        const ui = getUIState();
        ui.previousScreen = ui.screen;
        ui.screen = screen;
    }

    function renderErrorScreen(message) {
        return '<div class="screen"><div class="error-screen"><div class="error-icon">😔</div><h2>Что-то пошло не так</h2><p>' + (message || 'Неизвестная ошибка') + '</p><button onclick="location.reload()" class="primary-button">Перезагрузить</button></div></div>';
    }

    /* ============================================================
       ОСТАЛЬНЫЕ ЭКРАНЫ (ещё не перенесены в папку screens/)
    ============================================================ */

    /* ----- DIARY ----- */
    function renderDiary() {
        const diary = [...getDiary()].sort((a, b) => ((b.date || '') + (b.time || '')).localeCompare((a.date || '') + (a.time || '')));
        const stats = getDiaryStats();

        return `
        <div class="screen">
            <div class="page-header"><h1>Дневник</h1><button class="icon-button" data-action="add-diary">➕</button></div>
            <div style="display:flex;gap:16px;background:var(--bg-card);padding:14px;border-radius:var(--radius);margin-bottom:16px;border:1px solid var(--border-color)">
                <div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:700">${stats.totalEntries}</div><div style="font-size:12px;color:var(--text-muted)">записей</div></div>
                <div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:700">${stats.uniqueProducts}</div><div style="font-size:12px;color:var(--text-muted)">продуктов</div></div>
            </div>
            ${diary.length ? diary.map(e => `
                <div class="diary-entry">
                    <div class="diary-entry-icon">${e.source === 'store' ? '🛒' : '🥣'}</div>
                    <div class="diary-entry-content">
                        <div class="diary-entry-header"><strong>${e.productName || 'Продукт'}</strong><span>${e.time || ''}</span></div>
                        <div class="diary-entry-meta">${e.amount ? e.amount + ' г' : ''} ${e.preparation || ''} ${e.liked === true ? '❤️' : e.liked === false ? '🤍' : ''}</div>
                    </div>
                    <button class="icon-button" data-action="edit-diary" data-entry-id="${e.id}">⋯</button>
                </div>
            `).join('') : `
                <div class="empty-state"><div class="empty-icon">📖</div><h3>Дневник пуст</h3><p>Добавьте первый приём пищи.</p></div>
            `}
        </div>`;
    }

    /* ----- RECIPES ----- */
    function renderRecipes() {
        const recipes = getRecipes();
        return `
        <div class="screen">
            <div class="page-header"><h1>Рецепты</h1></div>
            ${recipes.length ? recipes.map(r => `
                <div class="recipe-card" data-action="open-recipe" data-recipe-id="${r.id || ''}">
                    <h3>${r.name}</h3>
                    <p>${r.desc || ''}</p>
                    <div class="meta">с ${r.age || 0} мес.</div>
                </div>
            `).join('') : `
                <div class="empty-state"><div class="empty-icon">🍲</div><h3>Рецептов пока нет</h3><p>Добавьте свои рецепты.</p></div>
            `}
        </div>`;
    }

    /* ----- TODAY ----- */
    function renderToday() {
        const dateStr = new Date().toISOString().slice(0, 10);
        const plan = getPlanForDate(dateStr);
        const meals = Array.isArray(plan) ? plan : [];
        let mealsHtml = '';
        if (meals.length) {
            mealsHtml = meals.map((meal, idx) => `
                <div class="meal-item">
                    <div><strong>${meal.name || 'Приём пищи'}</strong><span>${meal.products ? meal.products.join(', ') : '—'}</span></div>
                    <button class="icon-button" data-action="remove-meal" data-index="${idx}">✕</button>
                </div>
            `).join('');
        } else {
            mealsHtml = `<div class="empty-state"><div class="empty-icon">📅</div><h3>Ничего не запланировано</h3><p>Добавьте приём пищи на сегодня.</p></div>`;
        }
        return `
        <div class="screen">
            <div class="page-header"><h1>Сегодня</h1></div>
            <div class="date-navigation"><button data-action="previous-day">‹</button><span id="today-date">Сегодня</span><button data-action="next-day">›</button></div>
            <div class="daily-plan">${mealsHtml}<button class="primary-button" data-action="add-meal" style="margin-top:12px">➕ Добавить приём пищи</button></div>
        </div>`;
    }

    /* ----- BABY ----- */
    function renderBaby() {
        const baby = getBaby();
        return `
        <div class="screen">
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

    /* ----- SETTINGS ----- */
    function renderSettings() {
        const settings = getSettings();
        return `
        <div class="screen">
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

    /* ----- ONBOARDING (заглушка, будет перенесена) ----- */
    function renderOnboarding() {
        return `
        <div class="screen">
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

    /* ----- BOTTOM NAVIGATION ----- */
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
       ЭКСПОРТЫ
       (оставляем только те функции, которые ещё определены в этом файле)
    ============================================================ */
    window.render = render;
    // renderHome и renderProducts теперь экспортируются из screens/home.js и screens/products.js
    // поэтому убираем их из этого файла
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