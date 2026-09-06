/* ============================================================
   ui.js
   UI / DOM-конструктор приложения ПРИКОРМ
   ============================================================ */

// ===== ДОБАВЛЕННЫЕ ИМПОРТЫ =====
import { getCategoryGroups } from '../data/products.js';
import { evaluateProductSafety } from '../services/safety-engine.js';
import { getChildAgeMonths, getCurrentChildId } from '../services/child-service.js';
import { isProductIntroduced, isProductExcluded } from '../services/product-state.js';
import state from '../state.js';

const UI = {
    app: null,
    screens: {},
    modal: null,
    toastTimer: null
};

/* ============================================================
   БАЗОВЫЕ HTML-ПОМОЩНИКИ
   ============================================================ */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function icon(name) {
    const icons = {
        home: "⌂",
        today: "☀️",
        products: "🥑",
        diary: "📖",
        recipes: "🍲",
        baby: "👶",
        plus: "+",
        search: "⌕",
        back: "‹",
        close: "×",
        arrow: "›",
        check: "✓",
        heart: "♡",
        filledHeart: "♥",
        warning: "⚠️",
        cart: "🛒",
        homemade: "🏠",
        clock: "◷",
        calendar: "▣",
        filter: "☷",
        edit: "✎",
        delete: "⌫"
    };
    return icons[name] || "";
}

/* ============================================================
   ОСНОВНАЯ ОБОЛОЧКА
   ============================================================ */

function buildApp() {
    const root = document.getElementById("app") || document.body;
    root.innerHTML = `
        <div id="prikorm-app" class="prikorm-app">
            <main id="app-content" class="app-content"></main>
            <nav id="bottom-nav" class="bottom-nav">
                ${navButton("home", "Главная", "home")}
                ${navButton("today", "Сегодня", "today")}
                ${navButton("products", "Продукты", "products")}
                ${navButton("diary", "Дневник", "diary")}
                ${navButton("recipes", "Рецепты", "recipes")}
            </nav>
            <div id="modal-root" class="modal-root"></div>
            <div id="toast-root" class="toast-root"></div>
        </div>
    `;
    UI.app = document.getElementById("prikorm-app");
    UI.screens = {
        home: createHomeScreen(),
        today: createTodayScreen(),
        products: createProductsScreen(),
        diary: createDiaryScreen(),
        recipes: createRecipesScreen(),
        baby: createBabyScreen()
    };
    Object.values(UI.screens).forEach(screen =>
        document.getElementById("app-content").appendChild(screen)
    );
    showScreen(STATE?.ui?.screen || "home");
    return UI.app;
}

function navButton(id, label, iconName) {
    return `
        <button type="button" class="nav-button" data-action="navigate" data-screen="${id}">
            <span class="nav-icon">${icon(iconName)}</span>
            <span class="nav-label">${label}</span>
        </button>
    `;
}

function createHeader({ title = "", subtitle = "", back = false, action = "", actionLabel = "" } = {}) {
    return `
        <header class="screen-header">
            <div class="header-left">
                ${back ? `<button type="button" class="icon-button" data-action="back">${icon("back")}</button>` : ""}
                <div>
                    <h1>${escapeHTML(title)}</h1>
                    ${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ""}
                </div>
            </div>
            ${action ? `<button type="button" class="header-action" data-action="${action}">${actionLabel || icon("plus")}</button>` : ""}
        </header>
    `;
}

/* ============================================================
   ЭКРАН — ГЛАВНАЯ (оставлен без изменений)
   ============================================================ */
function createHomeScreen() {
    const section = document.createElement("section");
    section.id = "screen-home";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Прикорм", subtitle: "Спокойно, понятно, по шагам" })}
        <div class="home-content">
            <section class="baby-card" data-action="open-baby">
                <div class="baby-avatar">👶</div>
                <div class="baby-info">
                    <span class="eyebrow">Малыш</span>
                    <strong id="home-baby-name">Ваш малыш</strong>
                    <span id="home-baby-age">Заполните профиль</span>
                </div>
                <span class="card-arrow">${icon("arrow")}</span>
            </section>
            <section class="today-card">
                <div class="section-heading">
                    <div>
                        <span class="eyebrow">Сегодня</span>
                        <h2>План прикорма</h2>
                    </div>
                    <button type="button" class="text-button" data-action="navigate" data-screen="today">Открыть</button>
                </div>
                <div id="home-today-preview" class="today-preview">
                    ${emptyState("☀️", "Пока ничего не запланировано", "Откройте «Сегодня», чтобы посмотреть рекомендации.")}
                </div>
            </section>
            <div class="quick-actions">
                ${quickAction("🥑", "Добавить продукт", "add-food")}
                ${quickAction("📖", "Записать в дневник", "add-diary")}
                ${quickAction("🍲", "Найти рецепт", "navigate", "recipes")}
                ${quickAction("👶", "Профиль малыша", "open-baby")}
            </div>
            <section class="home-section">
                <div class="section-heading"><h2>Быстрый доступ</h2></div>
                <div class="feature-grid">
                    ${featureCard("🥕", "Новые продукты", "Что можно попробовать", "products-new")}
                    ${featureCard("⚠️", "Безопасность", "Аллергены и ограничения", "safety")}
                    ${featureCard("❤️", "Любимые", "Что нравится малышу", "favorites")}
                    ${featureCard("📊", "Мой дневник", "История прикорма", "navigate", "diary")}
                </div>
            </section>
        </div>
    `;
    return section;
}

function quickAction(emoji, label, action, value = "") {
    return `<button type="button" class="quick-action" data-action="${action}" ${value ? `data-screen="${value}"` : ""}>
        <span class="quick-action-icon">${emoji}</span>
        <span>${label}</span>
    </button>`;
}

function featureCard(emoji, title, subtitle, action, value = "") {
    return `<button type="button" class="feature-card" data-action="${action}" ${value ? `data-screen="${value}"` : ""}>
        <span class="feature-icon">${emoji}</span>
        <span class="feature-title">${title}</span>
        <span class="feature-subtitle">${subtitle}</span>
        <span class="feature-arrow">${icon("arrow")}</span>
    </button>`;
}

/* ============================================================
   ЭКРАН — СЕГОДНЯ (оставлен без изменений)
   ============================================================ */
function createTodayScreen() {
    const section = document.createElement("section");
    section.id = "screen-today";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Сегодня", subtitle: "Ваш план прикорма" })}
        <div class="screen-body">
            <div class="date-selector">
                <button type="button" class="icon-button" data-action="previous-day">‹</button>
                <button type="button" class="date-main" data-action="select-date">
                    <span id="today-date">Сегодня</span>
                    <small>Нажмите, чтобы выбрать дату</small>
                </button>
                <button type="button" class="icon-button" data-action="next-day">›</button>
            </div>
            <div id="daily-plan" class="daily-plan">${loadingState()}</div>
            <button type="button" class="floating-add" data-action="add-food">${icon("plus")}<span>Добавить</span></button>
        </div>
    `;
    return section;
}

/* ============================================================
   ЭКРАН — ПРОДУКТЫ (ПЕРЕРАБОТАН)
   ============================================================ */
function createProductsScreen() {
    const section = document.createElement("section");
    section.id = "screen-products";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Продукты", subtitle: "Знакомство с едой" })}
        <div class="screen-body">
            <!-- Заголовок счётчика -->
            <div class="products-header">
                <h1 class="h1">Продукты</h1>
                <div class="introduced-counter" data-action="filter-products" data-filter="introduced">
                    ✅ Введено: <span id="products-introduced-count">0</span>
                </div>
            </div>

            <!-- Поиск -->
            <div class="search-box">
                <span>${icon("search")}</span>
                <input id="product-search" type="search" placeholder="Найти продукт..." autocomplete="off" />
                <button type="button" class="clear-search" data-action="clear-search">${icon("close")}</button>
            </div>

            <!-- Рекомендовано сейчас -->
            <section class="recommended-section">
                <h2 class="h2">✨ Рекомендовано сейчас</h2>
                <div id="recommended-products" class="recommended-grid"></div>
            </section>

            <!-- Категории -->
            <section class="categories-section">
                <h2 class="h2">Категории</h2>
                <div id="category-grid" class="categories-grid"></div>
            </section>

            <!-- Фильтры -->
            <section class="filters-section">
                <div class="filter-group">
                    <span class="filter-label">Статус:</span>
                    <div class="chips-group" id="status-filters">
                        <span class="chip active" data-action="filter-products" data-filter="all">Все</span>
                        <span class="chip" data-action="filter-products" data-filter="current">✨ Сейчас</span>
                        <span class="chip" data-action="filter-products" data-filter="introduced">✅ Введены</span>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Категория:</span>
                    <div class="chips-group" id="category-filters">
                        <span class="chip active" data-action="filter-products" data-category="">Все</span>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Возраст:</span>
                    <div class="chips-group" id="age-filters">
                        <span class="chip active" data-action="filter-products" data-age="">Все</span>
                        <span class="chip" data-action="filter-products" data-age="6">6+</span>
                        <span class="chip" data-action="filter-products" data-age="7">7+</span>
                        <span class="chip" data-action="filter-products" data-age="8">8+</span>
                        <span class="chip" data-action="filter-products" data-age="9">9+</span>
                        <span class="chip" data-action="filter-products" data-age="10">10+</span>
                    </div>
                </div>
            </section>

            <!-- Список продуктов -->
            <section class="products-list-section">
                <h2 class="h2">Все продукты</h2>
                <div id="products-list" class="products-list">${loadingState()}</div>
            </section>

            <button type="button" class="floating-add" data-action="add-food">${icon("plus")}<span>Добавить</span></button>
        </div>
    `;
    return section;
}

/* ============================================================
   ЭКРАН — ДНЕВНИК (оставлен без изменений)
   ============================================================ */
function createDiaryScreen() {
    const section = document.createElement("section");
    section.id = "screen-diary";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Дневник", subtitle: "История питания" })}
        <div class="screen-body">
            <div class="diary-summary" id="diary-summary">
                <div class="summary-item"><strong id="diary-total">0</strong><span>записей</span></div>
                <div class="summary-item"><strong id="diary-products">0</strong><span>продуктов</span></div>
                <div class="summary-item"><strong id="diary-reactions">0</strong><span>реакций</span></div>
            </div>
            <div class="diary-filters">
                <button type="button" class="filter-button" data-action="diary-filter">${icon("filter")}Фильтр</button>
                <button type="button" class="filter-button" data-action="diary-calendar">${icon("calendar")}По дате</button>
            </div>
            <div id="diary-list" class="diary-list">${emptyState("📖", "Дневник пока пуст", "Добавьте первый приём пищи.")}</div>
            <button type="button" class="floating-add" data-action="add-diary">${icon("plus")}<span>Записать</span></button>
        </div>
    `;
    return section;
}

/* ============================================================
   ЭКРАН — РЕЦЕПТЫ (оставлен без изменений)
   ============================================================ */
function createRecipesScreen() {
    const section = document.createElement("section");
    section.id = "screen-recipes";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Рецепты", subtitle: "Идеи для малыша" })}
        <div class="screen-body">
            <div class="search-box">
                <span>${icon("search")}</span>
                <input id="recipe-search" type="search" placeholder="Найти рецепт..." autocomplete="off" />
            </div>
            <div class="horizontal-scroll">
                ${categoryChip("all", "Все", true)}
                ${categoryChip("breakfast", "🌞 Завтрак")}
                ${categoryChip("lunch", "🍲 Обед")}
                ${categoryChip("dinner", "🌙 Ужин")}
                ${categoryChip("snack", "🍌 Перекус")}
            </div>
            <div id="recipes-list" class="recipes-list">${loadingState()}</div>
        </div>
    `;
    return section;
}

function categoryChip(id, label, active = false) {
    return `<button type="button" class="category-chip ${active ? "active" : ""}" data-action="product-category" data-category="${id}">${label}</button>`;
}

/* ============================================================
   ЭКРАН — ПРОФИЛЬ (оставлен без изменений)
   ============================================================ */
function createBabyScreen() {
    const section = document.createElement("section");
    section.id = "screen-baby";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Малыш", subtitle: "Профиль и настройки", back: true })}
        <div class="screen-body">
            <section class="profile-hero">
                <div class="profile-avatar">👶</div>
                <div><h2 id="profile-name">Ваш малыш</h2><p id="profile-age">Заполните данные</p></div>
                <button type="button" class="icon-button" data-action="edit-baby">${icon("edit")}</button>
            </section>
            <section class="settings-group">
                <h3>Прикорм</h3>
                ${settingsRow("📅", "Дата начала прикорма", "prikorm-start")}
                ${settingsRow("🥛", "Тип кормления", "feeding-type")}
                ${settingsRow("🍽️", "Подход к прикорму", "approach")}
                ${settingsRow("✓", "Готовность к прикорму", "readiness")}
            </section>
            <section class="settings-group">
                <h3>Настройки</h3>
                ${settingsRow("🔔", "Уведомления", "notifications")}
                ${settingsRow("🎨", "Оформление", "theme")}
            </section>
            <button type="button" class="danger-button" data-action="reset-data">Сбросить данные</button>
        </div>
    `;
    return section;
}

function settingsRow(emoji, title, action) {
    return `<button type="button" class="settings-row" data-action="settings" data-setting="${action}">
        <span class="settings-icon">${emoji}</span>
        <span class="settings-title">${title}</span>
        <span class="settings-arrow">${icon("arrow")}</span>
    </button>`;
}

/* ============================================================
   НОВЫЕ ФУНКЦИИ ДЛЯ ПРОДУКТОВ (переработанные)
   ============================================================ */

// Карта категорий → эмодзи (fallback)
const categoryEmojiMap = {
    'Овощи': '🥦',
    'Фрукты': '🍎',
    'Крупы': '🌾',
    'Мясо': '🍗',
    'Рыба': '🐟',
    'Молочные': '🥛',
    'Аллергены': '⚠️',
    'Другое': '🍽'
};

// Известные некорректные emoji
const invalidEmojis = ['🤰😂'];

function getProductEmoji(product) {
    if (product.emoji && !invalidEmojis.includes(product.emoji)) {
        return product.emoji;
    }
    return categoryEmojiMap[product.category] || '🍽';
}

// Новая карточка продукта (информационная)
export function renderProductCard(product, childId) {
    const age = getChildAgeMonths(childId);
    const safety = evaluateProductSafety(product, age);
    const introduced = isProductIntroduced(childId, product.id);
    const excluded = isProductExcluded(childId, product.id);

    let statusText = '○ Ещё не введён';
    let statusClass = 'status-not-introduced';
    if (introduced) {
        statusText = '✅ Введён';
        statusClass = 'status-introduced';
    } else if (excluded) {
        statusText = '❌ Не хочу';
        statusClass = 'status-excluded';
    }

    const emoji = getProductEmoji(product);
    const ageLabel = product.ageMinMonths ? `${product.ageMinMonths}+ мес` : '';

    let warningBadge = '';
    if (safety.decision === 'caution') {
        warningBadge = `<span class="badge badge-caution">⚠️ ${safety.reason || 'С осторожностью'}</span>`;
    } else if (safety.decision === 'review') {
        warningBadge = `<span class="badge badge-review">ℹ️ ${safety.reason || 'Требует внимания'}</span>`;
    }

    let actionButton = '';
    if (!introduced && !excluded) {
        actionButton = `<button class="btn-primary" data-action="add-product-intro" data-product-id="${product.id}">＋ Ввести продукт</button>`;
    } else {
        actionButton = `<span class="status-label ${statusClass}">${statusText}</span>`;
    }

    return `
        <div class="card product-card" data-action="select-product" data-product-id="${product.id}">
            <div class="product-card-header">
                <span class="product-emoji">${emoji}</span>
                <h3 class="product-name">${escapeHTML(product.name)}</h3>
                ${warningBadge}
            </div>
            <div class="product-card-body">
                <div class="product-meta">
                    <span class="product-category">${escapeHTML(product.category)}</span>
                    ${ageLabel ? `<span class="product-age">${ageLabel}</span>` : ''}
                </div>
                <div class="product-actions">
                    ${actionButton}
                    <button class="btn-icon" data-action="show-product-menu" data-product-id="${product.id}">⋯</button>
                </div>
            </div>
        </div>
    `;
}

// Рендер блока "Рекомендовано сейчас"
export function renderRecommendedProducts(childId) {
    const age = getChildAgeMonths(childId);
    const allProducts = window.PRODUCTS || [];
    const recommended = allProducts
        .map(p => ({ product: p, safety: evaluateProductSafety(p, age) }))
        .filter(({ safety }) => safety.decision === 'allow' || safety.decision === 'caution')
        .sort((a, b) => {
            if (a.safety.decision === 'allow' && b.safety.decision !== 'allow') return -1;
            if (a.safety.decision !== 'allow' && b.safety.decision === 'allow') return 1;
            const diffA = Math.abs((a.product.ageMinMonths || 0) - age);
            const diffB = Math.abs((b.product.ageMinMonths || 0) - age);
            return diffA - diffB;
        })
        .slice(0, 6)
        .map(({ product }) => renderProductCard(product, childId))
        .join('');

    if (!recommended) {
        return `<p class="text-secondary">Пока нет рекомендованных продуктов для этого возраста.</p>`;
    }
    return `<div class="recommended-grid">${recommended}</div>`;
}

// Рендер сетки категорий
export function renderCategoryGrid() {
    const groups = getCategoryGroups();
    return groups
        .map(cat => {
            const emoji = categoryEmojiMap[cat] || '📂';
            return `
                <div class="category-chip" data-action="filter-products" data-category="${cat}">
                    <span class="category-emoji">${emoji}</span>
                    <span class="category-name">${escapeHTML(cat)}</span>
                </div>
            `;
        })
        .join('');
}

// Обновление списка продуктов (с фильтрами)
export function updateProductsList() {
    const childId = getCurrentChildId();
    const age = getChildAgeMonths(childId);
    let products = window.PRODUCTS || [];

    // Фильтр по статусу
    if (state.productsFilter === 'current') {
        products = products.filter(p => {
            const safety = evaluateProductSafety(p, age);
            return safety.decision === 'allow' || safety.decision === 'caution';
        });
    } else if (state.productsFilter === 'introduced') {
        products = products.filter(p => isProductIntroduced(childId, p.id));
    }
    // 'all' — без изменений

    // Фильтр по категории
    if (state.productsCategoryFilter) {
        products = products.filter(p => p.category === state.productsCategoryFilter);
    }

    // Фильтр по возрасту (рекомендательный)
    if (state.productsAgeFilter) {
        const ageLimit = parseInt(state.productsAgeFilter, 10);
        if (!isNaN(ageLimit)) {
            products = products.filter(p => (p.ageMinMonths || 0) >= ageLimit);
        }
    }

    // Поиск (если есть)
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(query));
    }

    // Рендерим список
    const container = document.getElementById('products-list');
    if (container) {
        if (products.length === 0) {
            container.innerHTML = `<p class="text-secondary">Нет продуктов, соответствующих фильтрам.</p>`;
        } else {
            container.innerHTML = products.map(p => renderProductCard(p, childId)).join('');
        }
    }

    // Обновляем счётчик введённых
    const countEl = document.getElementById('products-introduced-count');
    if (countEl) {
        const introducedCount = (window.PRODUCTS || []).filter(p => isProductIntroduced(childId, p.id)).length;
        countEl.textContent = introducedCount;
    }

    // Обновляем категории и рекомендованные (если контейнеры есть)
    const catGrid = document.getElementById('category-grid');
    if (catGrid) catGrid.innerHTML = renderCategoryGrid();

    const recContainer = document.getElementById('recommended-products');
    if (recContainer) recContainer.innerHTML = renderRecommendedProducts(childId);

    // Обновляем активные чипсы
    updateChipsActiveState();
}

// Вспомогательная функция для обновления активных чипсов
function updateChipsActiveState() {
    // Статус
    document.querySelectorAll('#status-filters .chip').forEach(chip => {
        const filter = chip.dataset.filter;
        chip.classList.toggle('active', filter === state.productsFilter);
    });
    // Категория
    document.querySelectorAll('#category-filters .chip').forEach(chip => {
        const cat = chip.dataset.category || '';
        chip.classList.toggle('active', cat === (state.productsCategoryFilter || ''));
    });
    // Возраст
    document.querySelectorAll('#age-filters .chip').forEach(chip => {
        const age = chip.dataset.age || '';
        chip.classList.toggle('active', age === (state.productsAgeFilter || ''));
    });
}

// Переопределяем старую функцию productCard для обратной совместимости
window.productCard = function(product, status) {
    // Используем новую реализацию, но адаптируем под старый вызов
    const childId = getCurrentChildId();
    return renderProductCard(product, childId);
};

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений)
// ============================================================

function loadingState() {
    return `<div class="loading-state"><div class="loading-spinner"></div><span>Загружаем...</span></div>`;
}

function emptyState(emoji, title, text) {
    return `<div class="empty-state"><div class="empty-state-icon">${emoji}</div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(text)}</p></div>`;
}

function showToast(message, type = "default") {
    const root = document.getElementById("toast-root");
    if (!root) return;
    root.innerHTML = `<div class="toast toast-${type}">${type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ️"}<span>${escapeHTML(message)}</span></div>`;
    clearTimeout(UI.toastTimer);
    UI.toastTimer = setTimeout(() => { root.innerHTML = ""; }, 3000);
}

function showScreen(screenName) {
    if (!UI.screens || !UI.screens[screenName]) screenName = "home";
    Object.entries(UI.screens).forEach(([name, element]) => {
        element.classList.toggle("active", name === screenName);
    });
    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle("active", button.dataset.screen === screenName);
    });
    if (STATE?.ui) STATE.ui.screen = screenName;
    if (typeof saveState === "function") saveState();
    if (typeof render === "function") render(screenName);
}

function updateProfileUI() {
    const baby = typeof getBaby === "function" ? getBaby() : STATE?.baby;
    if (!baby) return;
    const name = baby.name || "Ваш малыш";
    const age = baby.ageMonths != null ? `${baby.ageMonths} мес.` : "Заполните профиль";
    const fields = {
        "home-baby-name": name,
        "profile-name": name,
        "home-baby-age": age,
        "profile-age": age
    };
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function closeModal() {
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = "";
    UI.modal = null;
}

// Патч для модалки добавления (чтобы не было конфликтов)
function openAddFoodModal(product = null) {
    const oldModal = document.querySelector('.modal-overlay');
    if (oldModal) oldModal.remove();

    const root = document.getElementById("modal-root");
    if (!root) return;

    root.innerHTML = `
        <div class="modal-overlay" data-action="close-modal">
            <div class="modal-sheet" data-modal-content>
                <div class="modal-header">
                    <div>
                        <span class="eyebrow">Новый приём пищи</span>
                        <h2>Добавить продукт</h2>
                    </div>
                    <button type="button" class="icon-button" data-action="close-modal">${icon("close")}</button>
                </div>
                <div class="modal-body">
                    ${product ? `
                        <div class="selected-product">
                            <span>${product.emoji || "🥣"}</span>
                            <strong>${escapeHTML(product.name)}</strong>
                            <input type="hidden" id="food-product-id" value="${escapeHTML(product.id)}" />
                        </div>
                    ` : `
                        <label class="form-label">
                            Продукт
                            <button type="button" class="select-field" data-action="choose-product">
                                <span id="selected-product-label">Выберите продукт</span>
                                <span>${icon("arrow")}</span>
                            </button>
                            <input type="hidden" id="food-product-id" value="" />
                        </label>
                    `}
                    <div class="source-selector">
                        <span class="form-label-title">Как приготовили?</span>
                        <div class="segmented-control">
                            <button type="button" class="segment active" data-action="food-source" data-source="homemade">🏠 Приготовила сама</button>
                            <button type="button" class="segment" data-action="food-source" data-source="store">🛒 Купила</button>
                        </div>
                    </div>
                    <div id="store-fields" class="conditional-fields" hidden>
                        <label class="form-label">Бренд <input id="food-brand" type="text" placeholder="Например, Gerber" autocomplete="off" /></label>
                        <label class="form-label">Название продукта <input id="food-product-title" type="text" placeholder="Например, Яблоко" /></label>
                        <label class="form-label">Объём упаковки <div class="input-with-unit"><input id="food-package-size" type="number" min="0" placeholder="80" /><span>г</span></div></label>
                        <label class="form-label">Состав <textarea id="food-ingredients" rows="3" placeholder="Можно переписать с упаковки"></textarea></label>
                        <button type="button" class="secondary-button" data-action="scan-label">📷 Сфотографировать этикетку</button>
                    </div>
                    <div id="homemade-fields" class="conditional-fields">
                        <label class="form-label">Способ приготовления <select id="food-preparation"><option value="">Выберите</option><option value="boiled">Варила</option><option value="steam">На пару</option><option value="baked">Запекала</option><option value="other">Другое</option></select></label>
                    </div>
                    <div class="form-row">
                        <label class="form-label">Сколько съел? <div class="input-with-unit"><input id="food-amount" type="number" min="0" step="1" placeholder="Не обязательно" /><span>г</span></div></label>
                        <label class="form-label">Форма <select id="food-form"><option value="">Выберите</option><option value="puree">Пюре</option><option value="mashed">Размятое</option><option value="soft">Мягкие кусочки</option><option value="finger-food">Finger food</option></select></label>
                    </div>
                    <div class="form-label">
                        <span class="form-label-title">Понравилось?</span>
                        <div class="like-selector">
                            <button type="button" class="like-option" data-action="set-liked" data-liked="true">❤️ Понравилось</button>
                            <button type="button" class="like-option" data-action="set-liked" data-liked="false">🙅🏻‍♀️ Не понравилось</button>
                        </div>
                    </div>
                    <label class="form-label">Заметка <textarea id="food-notes" rows="3" placeholder="Например: ел с удовольствием"></textarea></label>
                    <label class="checkbox-row"><input id="food-new-product" type="checkbox" checked /><span>Это новый продукт для малыша</span></label>
                    <button type="button" class="primary-button full-width" data-action="save-food">Добавить в дневник</button>
                </div>
            </div>
        </div>
    `;
    UI.modal = root;
}

function openProductPicker() {
    const root = document.getElementById("modal-root");
    root.innerHTML = `
        <div class="modal-overlay" data-action="close-modal">
            <div class="modal-sheet large" data-modal-content>
                <div class="modal-header">
                    <div><h2>Выберите продукт</h2><p>Можно найти в базе</p></div>
                    <button type="button" class="icon-button" data-action="close-modal">${icon("close")}</button>
                </div>
                <div class="modal-body">
                    <div class="search-box">
                        <span>${icon("search")}</span>
                        <input id="picker-search" type="search" placeholder="Поиск..." autocomplete="off" />
                    </div>
                    <div id="picker-products" class="products-list">${loadingState()}</div>
                </div>
            </div>
        </div>
    `;
    UI.modal = root;
    if (typeof renderProductPicker === "function") renderProductPicker();
}

function renderProductPicker(query) {
    const container = document.getElementById('picker-products');
    if (!container) return;
    const products = window.PRODUCTS || [];
    const q = (query || '').trim().toLowerCase();
    const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q)) : products;
    if (!filtered.length) {
        container.innerHTML = emptyState('🥑', 'Ничего не найдено', 'Попробуйте изменить запрос');
        return;
    }
    container.innerHTML = filtered.map(p => `
        <button class="picker-product" data-action="select-product" data-product-id="${p.id}" style="display:flex; align-items:center; gap:12px; width:100%; padding:12px; border:none; background:transparent; border-bottom:1px solid #eee; cursor:pointer; text-align:left;">
            <span style="font-size:24px;">${p.emoji || '🥣'}</span>
            <div style="flex:1;"><strong>${escapeHTML(p.name)}</strong><br><span style="font-size:13px; color:#888;">${p.cat || ''}</span></div>
            <span>›</span>
        </button>
    `).join('');
}

// Обработчик выбора продукта в пикере
document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-action="select-product"]');
    if (!target) return;
    const productId = target.dataset.productId;
    if (!productId) return;
    const product = (window.PRODUCTS || []).find(p => String(p.id) === String(productId));
    if (product) {
        closeModal();
        if (typeof openAddFoodModal === 'function') {
            openAddFoodModal(product);
        } else {
            showToast('Выбран продукт: ' + product.name, 'success');
        }
    }
});

// ============================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ============================================================
window.UI = UI;
window.buildApp = buildApp;
window.showScreen = showScreen;
window.updateProfileUI = updateProfileUI;
window.openAddFoodModal = openAddFoodModal;
window.openProductPicker = openProductPicker;
window.closeModal = closeModal;
window.showToast = showToast;
window.productCard = productCard;
window.diaryCard = diaryCard;
window.emptyState = emptyState;
window.loadingState = loadingState;
window.escapeHTML = escapeHTML;
window.renderProductPicker = renderProductPicker;
window.updateProductsList = updateProductsList;
window.renderRecommendedProducts = renderRecommendedProducts;
window.renderCategoryGrid = renderCategoryGrid;
window.renderProductCard = renderProductCard;

console.log('✅ ui.js загружен — переработан раздел продуктов');