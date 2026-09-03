/* ============================================================
   rendering.js — диспетчер рендеринга (исправлен)
   ============================================================ */

(function() {
    'use strict';

    console.log('✅ rendering.js: начало выполнения');

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
        return window.PRODUCTS || window.PRODUCT_DATABASE || [];
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

    function render(screen) {
        console.log('🔄 render() вызван с экраном:', screen, 'текущий ui.screen:', getUIState().screen);
        screen = screen || getUIState().screen || DEFAULT_SCREEN;

        if (!VALID_SCREENS.includes(screen)) {
            console.warn('⚠️ Неизвестный экран:', screen);
            screen = DEFAULT_SCREEN;
        }

        const app = document.getElementById('app');
        if (!app) {
            console.error('❌ #app не найден');
            return;
        }

        const renderFnName = 'render' + screen.charAt(0).toUpperCase() + screen.slice(1);
        const renderFn = window[renderFnName];

        let html = '';
        try {
            if (typeof renderFn === 'function') {
                html = renderFn();
                console.log('📝 HTML от ' + renderFnName + ' получен, длина:', html.length);
            } else {
                console.error('❌ Функция ' + renderFnName + ' не найдена');
                html = renderErrorScreen('Ошибка: ' + renderFnName + ' не определена');
            }
        } catch (e) {
            console.error('❌ Ошибка рендера экрана ' + screen + ':', e);
            html = renderErrorScreen('Не удалось загрузить экран');
        }

        let navHtml = '';
        if (screen !== 'onboarding') {
            navHtml = renderBottomNavigation(screen);
        }

        app.innerHTML = html + navHtml;
        app.offsetHeight;
        console.log('✅ app.innerHTML обновлён, reflow выполнен');

        const ui = getUIState();
        ui.previousScreen = ui.screen;
        ui.screen = screen;

        window.scrollTo({ top: 0, behavior: 'instant' });
        console.log('✅ render() завершён для экрана:', screen);
    }

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

    function renderErrorScreen(message) {
        return `<div class="screen"><div class="error-screen"><div class="error-icon">😔</div><h2>Что-то пошло не так</h2><p>${message || 'Неизвестная ошибка'}</p><button onclick="location.reload()" class="primary-button">Перезагрузить</button></div></div>`;
    }

    window.render = render;
    window.getState = getState;
    window.getBaby = getBaby;
    window.getDiary = getDiary;
    window.getProducts = getProducts;
    window.getRecipes = getRecipes;
    window.getSettings = getSettings;
    window.getUIState = getUIState;
    window.isProductIntroduced = isProductIntroduced;
    window.getPlanForDate = getPlanForDate;
    window.setPlanForDate = setPlanForDate;
    window.addMealToPlan = addMealToPlan;
    window.removeMealFromPlan = removeMealFromPlan;
    window.getDiaryStats = getDiaryStats;
    window.renderBottomNavigation = renderBottomNavigation;
    window.renderErrorScreen = renderErrorScreen;

    console.log('✅ render определена?', typeof window.render);
    console.log('✅ rendering.js: завершён успешно');
})();