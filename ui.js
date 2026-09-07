/* ============================================================
   ui.js – финальная адаптированная версия
   (без импортов, использует только существующие глобальные объекты)
   ============================================================ */

const UI = {
    app: null,
    screens: {},
    modal: null,
    toastTimer: null
};

/* ============================================================
   БАЗОВЫЕ ПОМОЩНИКИ (без изменений)
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
   ОБОЛОЧКА (с изменённой навигацией)
   ============================================================ */

function buildApp() {
    const root = document.getElementById("app") || document.body;
    root.innerHTML = `
        <div id="prikorm-app" class="prikorm-app">
            <main id="app-content" class="app-content"></main>
            <nav id="bottom-nav" class="bottom-nav"></nav>
            <div id="modal-root" class="modal-root"></div>
            <div id="toast-root" class="toast-root"></div>
        </div>
    `;
    UI.app = document.getElementById("prikorm-app");
    UI.screens = {
        home: createHomeScreen(),
        today: createTodayScreen(),
        // products: createProductsScreen(), // УДАЛЕН (дублирующий экран)
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

// Функция navButton оставлена для совместимости, но НЕ используется для построения bottom navigation
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
   ЭКРАНЫ (без изменений, кроме удалённого Products)
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

// ===== ЭКРАН ПРОДУКТОВ ПОЛНОСТЬЮ УДАЛЁН (используется screens/products.js) =====
// function createProductsScreen() { ... } удалена

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
   НОВЫЕ ФУНКЦИИ ДЛЯ ПРОДУКТОВ (адаптированы под вашу структуру)
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

const invalidEmojis = ['🤰😂'];

function getProductEmoji(product) {
    if (product.emoji && !invalidEmojis.includes(product.emoji)) {
        return product.emoji;
    }
    return categoryEmojiMap[product.category] || '🍽';
}

// Получить возраст ребёнка в месяцах
function getChildAgeMonths(childId) {
    const child = STATE.children.find(c => c.id === childId);
    if (!child || !child.birthDate) return 0;
    const birth = new Date(child.birthDate);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12;
    months += now.getMonth() - birth.getMonth();
    if (now.getDate() < birth.getDate()) months--;
    return Math.max(0, months);
}

// Проверить, исключён ли продукт
function isProductExcluded(childId, productId) {
    const child = STATE.children.find(c => c.id === childId);
    if (!child || !child.productState) return false;
    return child.productState[productId] === 'parentExcluded';
}

// Получить категории из продуктов
function getCategoryGroups() {
    const products = window.PRODUCTS || [];
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
}

// Безопасный вызов evaluateProductSafety
function evaluateProductSafetySafe(product, childId) {
    const child = STATE.children.find(c => c.id === childId);
    if (!child) return { decision: 'allow', reason: '' };
    if (window.safetyEngine && typeof window.safetyEngine.evaluateProductSafety === 'function') {
        try {
            const result = window.safetyEngine.evaluateProductSafety(child, product, null);
            return result || { decision: 'allow', reason: '' };
        } catch (e) {
            console.warn('evaluateProductSafety error:', e);
            return { decision: 'allow', reason: '' };
        }
    }
    return { decision: 'allow', reason: '' };
}

// Новая карточка продукта
function renderProductCard(product, childId) {
    const safety = evaluateProductSafetySafe(product, childId);
    const introduced = typeof isProductIntroduced === 'function'
        ? isProductIntroduced(childId, product.id)
        : false;
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

// ===== ФУНКЦИЯ renderRecommendedProducts() УДАЛЕНА =====
// (отдельный блок рекомендаций больше не используется в Products 2.0)

// Сетка категорий (исправлены классы)
function renderCategoryGrid() {
    const groups = getCategoryGroups();
    return groups
        .map(cat => {
            const emoji = categoryEmojiMap[cat] || '📂';
            return `
                <div class="category-kenora" data-action="filter-products" data-category="${cat}">
                    <span class="cat-icon">${emoji}</span>
                    <span class="cat-label">${escapeHTML(cat)}</span>
                </div>
            `;
        })
        .join('');
}

// Обновление списка продуктов
function updateProductsList() {
    const childId = STATE.currentChildId;
    if (!childId) {
        console.warn('Нет активного ребёнка');
        return;
    }
    const products = window.PRODUCTS || [];
    const age = getChildAgeMonths(childId);

    let filtered = products;

    // Статус
    if (STATE.productsFilter === 'current') {
        filtered = filtered.filter(p => {
            const safety = evaluateProductSafetySafe(p, childId);
            return safety.decision === 'allow' || safety.decision === 'caution';
        });
    } else if (STATE.productsFilter === 'introduced') {
        filtered = filtered.filter(p =>
            typeof isProductIntroduced === 'function' && isProductIntroduced(childId, p.id)
        );
    }

    // Категория
    if (STATE.productsCategoryFilter) {
        filtered = filtered.filter(p => p.category === STATE.productsCategoryFilter);
    }

    // Возраст
    if (STATE.productsAgeFilter) {
        const ageLimit = parseInt(STATE.productsAgeFilter, 10);
        if (!isNaN(ageLimit)) {
            filtered = filtered.filter(p => (p.ageMinMonths || 0) >= ageLimit);
        }
    }

    // Поиск
    const searchQuery = window.CURRENT_PRODUCT_SEARCH || '';
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }

    const container = document.getElementById('products-list');
    if (container) {
        if (filtered.length === 0) {
            container.innerHTML = `<p class="text-secondary">Нет продуктов, соответствующих фильтрам.</p>`;
        } else {
            container.innerHTML = filtered.map(p => renderProductCard(p, childId)).join('');
        }
    }

    // Счётчик введённых
    const countEl = document.getElementById('products-introduced-count');
    if (countEl) {
        const introducedCount = products.filter(p =>
            typeof isProductIntroduced === 'function' && isProductIntroduced(childId, p.id)
        ).length;
        countEl.textContent = introducedCount;
    }

    // Категории
    const catGrid = document.getElementById('category-grid');
    if (catGrid) catGrid.innerHTML = renderCategoryGrid();

    // Рекомендованные – УДАЛЕНА (больше нет блока)
    // const recContainer = document.getElementById('recommended-products');
    // if (recContainer) recContainer.innerHTML = renderRecommendedProducts(childId);

    // Активные чипсы
    updateChipsActiveState();
}

function updateChipsActiveState() {
    document.querySelectorAll('#status-filters .chip').forEach(chip => {
        const filter = chip.dataset.filter;
        chip.classList.toggle('active', filter === STATE.productsFilter);
    });
    document.querySelectorAll('#category-filters .chip').forEach(chip => {
        const cat = chip.dataset.category || '';
        chip.classList.toggle('active', cat === (STATE.productsCategoryFilter || ''));
    });
    document.querySelectorAll('#age-filters .chip').forEach(chip => {
        const age = chip.dataset.age || '';
        chip.classList.toggle('active', age === (STATE.productsAgeFilter || ''));
    });
}

// Старая функция productCard для совместимости
function productCard(product, status) {
    const childId = STATE.currentChildId;
    return renderProductCard(product, childId);
}

/* ============================================================
   ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений)
   ============================================================ */

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

    // === НОВОЕ: обновление нижней навигации через renderBottomNav ===
    if (typeof render === "function") render(screenName);

    // === НОВОЕ: обновление нижней навигации через renderBottomNav ===
    const bottomNav = document.getElementById("bottom-nav");
    if (bottomNav && typeof window.renderBottomNav === "function") {
        bottomNav.innerHTML = window.renderBottomNav(screenName);
    }
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

function openAddFoodModal(product = null) {
    const oldModal = document.querySelector('.modal-overlay');
    if (oldModal) oldModal.remove();

    const root = document.getElementById("modal-root");
    if (!root) return;

    // Убрали data-action="close-modal" с overlay, оставили только на крестике
    root.innerHTML = `
        <div class="modal-overlay">
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
        <div class="modal-overlay">
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
    // Используем data-action="choose-picker-product" для выбора продукта в дневник
    container.innerHTML = filtered.map(p => `
        <button class="picker-product" data-action="choose-picker-product" data-product-id="${p.id}" style="display:flex; align-items:center; gap:12px; width:100%; padding:12px; border:none; background:transparent; border-bottom:1px solid #eee; cursor:pointer; text-align:left;">
            <span style="font-size:24px;">${p.emoji || '🥣'}</span>
            <div style="flex:1;"><strong>${escapeHTML(p.name)}</strong><br><span style="font-size:13px; color:#888;">${p.cat || ''}</span></div>
            <span>›</span>
        </button>
    `).join('');
}

// ===== ВНИМАНИЕ: КОНФЛИКТУЮЩИЙ LISTENER УДАЛЁН =====
// Старый document.addEventListener для select-product полностью удалён.

/* ============================================================
   НОВАЯ ФУНКЦИЯ: getDiary() — возвращает записи дневника текущего ребёнка
   ============================================================ */
function getDiary() {
    var childId = window.STATE.currentChildId;
    if (!childId) return [];
    var child = window.STATE.children.find(function(c) { return c.id === childId; });
    return child && Array.isArray(child.diary) ? child.diary : [];
}

/* ============================================================
   ГЛОБАЛЬНЫЕ ФУНКЦИИ (экспорт)
   ============================================================ */
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
// window.renderRecommendedProducts = renderRecommendedProducts; // УДАЛЕН
window.renderCategoryGrid = renderCategoryGrid;
window.renderProductCard = renderProductCard;
window.getDiary = getDiary;