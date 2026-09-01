/* ============================================================
   rendering.js
   Отрисовка экранов приложения (исправлен для работы с #app-content)
   ============================================================ */

function render(screen) {
    screen = screen || STATE?.ui?.screen || 'home';
    const content = document.getElementById('app-content');
    if (!content) return;
    let html = '';
    switch(screen) {
        case 'home': html = renderHome(); break;
        case 'products': html = renderProducts(); break;
        case 'diary': html = renderDiary(); break;
        case 'recipes': html = renderRecipes(); break;
        case 'today': html = renderToday(); break;
        case 'baby': html = renderBaby(); break;
        case 'settings': html = renderSettings(); break;
        default: html = renderHome();
    }
    content.innerHTML = html + renderBottomNavigation(screen);
    // Сохраняем текущий экран в STATE
    if (screen !== STATE?.ui?.screen) {
        if (!STATE.ui) STATE.ui = {};
        STATE.ui.screen = screen;
        saveState();
    }
}

// ----- HOME -----
function renderHome() {
    const baby = STATE?.baby || {};
    const age = baby.ageMonths ? `${baby.ageMonths} мес.` : 'Возраст не указан';
    const diaryCount = STATE?.diary?.length || 0;
    return `
        <div class="screen active">
            <div class="page-header"><h1>🌸 Прикорм</h1><button class="icon-button" data-action="navigate" data-screen="settings">⚙️</button></div>
            <div class="baby-profile-card">
                <div class="baby-avatar">👶</div>
                <div><strong>${baby.name || 'Малыш'}</strong><br><span class="muted">${age}</span></div>
                <button class="icon-button" data-action="navigate" data-screen="baby">✏️</button>
            </div>
            <div class="progress-card">
                <div class="section-heading"><span>Дневник</span><span>${diaryCount} записей</span></div>
                <div class="progress-track"><div class="progress-fill" style="width:${Math.min(diaryCount*10,100)}%"></div></div>
            </div>
            <div class="quick-actions">
                <button class="quick-action" data-action="add-food"><span>🥣</span><strong>Добавить продукт</strong><small>Записать в дневник</small></button>
                <button class="quick-action" data-action="navigate" data-screen="products"><span>🥑</span><strong>Продукты</strong><small>База продуктов</small></button>
                <button class="quick-action" data-action="navigate" data-screen="diary"><span>📖</span><strong>Дневник</strong><small>История</small></button>
                <button class="quick-action" data-action="navigate" data-screen="recipes"><span>🍲</span><strong>Рецепты</strong><small>Идеи</small></button>
            </div>
        </div>
    `;
}

// ----- PRODUCTS -----
function renderProducts() {
    const products = PRODUCTS || [];
    const search = window.CURRENT_PRODUCT_SEARCH || '';
    let filtered = products;
    if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    const cats = ['овощ','фрукт','каша','мясо','рыба','яйцо','молочное','бобовые','орехи'];
    const currentCat = window.CURRENT_PRODUCT_CATEGORY || 'all';
    if (currentCat !== 'all') filtered = filtered.filter(p => p.cat === currentCat);
    const html = `
        <div class="screen active">
            <div class="page-header"><h1>Продукты</h1></div>
            <div class="search-box">🔎 <input id="product-search" type="search" placeholder="Найти продукт..." value="${search}"></div>
            <div class="category-scroll" style="display:flex; gap:8px; overflow-x:auto; padding:8px 0;">
                <button class="category-chip ${currentCat==='all'?'active':''}" data-action="product-category" data-category="all">Все</button>
                ${cats.map(c => `<button class="category-chip ${currentCat===c?'active':''}" data-action="product-category" data-category="${c}">${c}</button>`).join('')}
            </div>
            <div class="products-grid">
                ${filtered.map(p => `
                    <div class="product-card" data-action="open-product" data-product-id="${p.id}">
                        <span class="product-emoji">${p.emoji || '🥣'}</span>
                        <h3>${p.name}</h3>
                        <div class="product-tags"><span>${p.min_age}+ мес.</span>${p.iron ? '<span>🩸 Железо</span>' : ''}${p.allergen ? '<span>⚠️ Аллерген</span>' : ''}</div>
                        ${isProductIntroduced(p.id) ? '<div class="introduced-label">✓ Уже пробовали</div>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    return html;
}

// ----- DIARY -----
function renderDiary() {
    const diary = [...(STATE?.diary || [])].sort((a,b) => (b.date||'').localeCompare(a.date||''));
    const stats = getDiaryStats ? getDiaryStats() : { totalEntries: diary.length, uniqueProducts: new Set(diary.map(e=>e.productId)).size };
    return `
        <div class="screen active">
            <div class="page-header"><h1>Дневник</h1><button class="icon-button" data-action="add-diary">➕</button></div>
            <div style="display:flex; gap:16px; background:#fff; padding:12px; border-radius:12px; margin-bottom:16px;">
                <div><strong>${stats.totalEntries}</strong> записей</div>
                <div><strong>${stats.uniqueProducts}</strong> продуктов</div>
            </div>
            ${diary.length ? diary.map(e => `
                <div class="diary-entry">
                    <div class="diary-entry-icon">${e.source === 'store' ? '🛒' : '🥣'}</div>
                    <div class="diary-entry-content">
                        <div class="diary-entry-header"><strong>${e.productName || 'Продукт'}</strong><span>${e.time || ''}</span></div>
                        <div class="diary-entry-meta">${e.amount ? e.amount+' г' : ''} ${e.preparation || ''} ${e.liked === true ? '❤️' : e.liked === false ? '🤍' : ''}</div>
                    </div>
                    <button class="icon-button" data-action="edit-diary" data-entry-id="${e.id}">⋯</button>
                </div>
            `).join('') : '<div class="empty-state"><div class="empty-icon">📖</div><h3>Дневник пуст</h3><p>Добавьте первый приём пищи.</p></div>'}
        </div>
    `;
}

// ----- RECIPES -----
function renderRecipes() {
    const recipes = RECIPES || [];
    return `
        <div class="screen active">
            <div class="page-header"><h1>Рецепты</h1></div>
            ${recipes.map(r => `
                <div class="product-card" style="margin-bottom:8px;">
                    <h3>${r.name}</h3>
                    <p style="font-size:14px;color:#666;">${r.desc || ''}</p>
                    <div style="font-size:13px;color:#888;">с ${r.age} мес.</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ----- TODAY (ПЛАН) -----
function renderToday() {
    const dateStr = new Date().toISOString().slice(0,10);
    const plan = getPlanForDate(dateStr);
    const meals = Array.isArray(plan) ? plan : [];
    let mealsHtml = '';
    if (meals.length) {
        mealsHtml = meals.map((meal, index) => `
            <div class="meal-item" style="background:#f9f6f2; border-radius:12px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${meal.name || 'Приём пищи'}</strong>
                    <span style="font-size:14px; color:#888; display:block;">${meal.products ? meal.products.join(', ') : '—'}</span>
                </div>
                <button class="icon-button" data-action="remove-meal" data-index="${index}">✕</button>
            </div>
        `).join('');
    } else {
        mealsHtml = '<div class="empty-state"><div class="empty-icon">📅</div><h3>Ничего не запланировано</h3><p>Добавьте приём пищи на сегодня.</p></div>';
    }
    return `
        <div class="screen active">
            <div class="page-header"><h1>Сегодня</h1></div>
            <div class="date-navigation">
                <button data-action="previous-day">‹</button>
                <span id="today-date">Сегодня</span>
                <button data-action="next-day">›</button>
            </div>
            <div class="daily-plan">
                ${mealsHtml}
                <button class="primary-button full-width" data-action="add-meal" style="margin-top:8px;">➕ Добавить приём пищи</button>
            </div>
        </div>
    `;
}

// ----- BABY -----
function renderBaby() {
    const baby = STATE?.baby || {};
    return `
        <div class="screen active">
            <div class="page-header"><h1>Малыш</h1></div>
            <div class="baby-profile-card">
                <div class="baby-avatar">👶</div>
                <div><strong>${baby.name || 'Имя не указано'}</strong><br><span class="muted">${baby.ageMonths ? baby.ageMonths+' мес.' : 'Возраст не указан'}</span></div>
                <button class="icon-button" data-action="edit-baby">✏️</button>
            </div>
            <div class="settings-list">
                <button class="settings-row" data-action="settings" data-setting="feeding-type"><span>🍼</span><div><strong>Тип кормления</strong><small>${baby.feedingType || 'Не указан'}</small></div><span>›</span></button>
                <button class="settings-row" data-action="settings" data-setting="prikorm-start"><span>📅</span><div><strong>Начало прикорма</strong><small>${baby.prikormStartDate || 'Не указано'}</small></div><span>›</span></button>
                <button class="settings-row" data-action="settings" data-setting="approach"><span>🥄</span><div><strong>Подход</strong><small>Можно настроить</small></div><span>›</span></button>
            </div>
            <button class="danger-button" data-action="reset-data">Сбросить все данные</button>
        </div>
    `;
}

// ----- SETTINGS -----
function renderSettings() {
    return `
        <div class="screen active">
            <div class="page-header"><h1>Настройки</h1><button class="icon-button" data-action="navigate" data-screen="home">⌂</button></div>
            <div class="settings-list">
                <button class="settings-row" data-action="settings" data-setting="notifications"><span>🔔</span><div><strong>Уведомления</strong><small>Напоминания</small></div><span>›</span></button>
                <button class="settings-row" data-action="settings" data-setting="theme"><span>🎨</span><div><strong>Тема</strong><small>Светлая / тёмная</small></div><span>›</span></button>
            </div>
            <button class="danger-button" data-action="reset-data">Сбросить данные</button>
        </div>
    `;
}

// ----- НИЖНЯЯ НАВИГАЦИЯ -----
function renderBottomNavigation(active) {
    const items = [
        { id:'home', icon:'⌂', label:'Главная' },
        { id:'products', icon:'🥑', label:'Продукты' },
        { id:'today', icon:'📅', label:'Сегодня' },
        { id:'diary', icon:'📖', label:'Дневник' },
        { id:'baby', icon:'👶', label:'Малыш' }
    ];
    return `<nav class="bottom-navigation">${items.map(it => `<button class="nav-item ${active===it.id?'active':''}" data-action="navigate" data-screen="${it.id}"><span>${it.icon}</span><small>${it.label}</small></button>`).join('')}</nav>`;
}

// ----- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПЛАНА -----
function getPlanForDate(dateStr) {
    if (!STATE.plan) STATE.plan = { days: {} };
    if (!STATE.plan.days) STATE.plan.days = {};
    return STATE.plan.days[dateStr] || [];
}

function setPlanForDate(dateStr, meals) {
    if (!STATE.plan) STATE.plan = { days: {} };
    if (!STATE.plan.days) STATE.plan.days = {};
    STATE.plan.days[dateStr] = Array.isArray(meals) ? meals : [];
    saveState();
    emitStateChange();
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

function renderDailyPlan(dateStr) {
    render('today');
}

// ЭКСПОРТ
window.render = render;
window.renderHome = renderHome;
window.renderProducts = renderProducts;
window.renderDiary = renderDiary;
window.renderRecipes = renderRecipes;
window.renderToday = renderToday;
window.renderBaby = renderBaby;
window.renderSettings = renderSettings;
window.renderBottomNavigation = renderBottomNavigation;
window.renderDailyPlan = renderDailyPlan;
window.getPlanForDate = getPlanForDate;
window.setPlanForDate = setPlanForDate;
window.addMealToPlan = addMealToPlan;
window.removeMealFromPlan = removeMealFromPlan;

// Функция для проверки, введён ли продукт
function isProductIntroduced(productId) {
    return STATE?.products?.introduced?.some(i => (i.id || i) === productId) || false;
}
window.isProductIntroduced = isProductIntroduced;