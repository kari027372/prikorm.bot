/* ============================================================
   ui.js – финальная адаптированная версия (без импортов, использует только существующие глобальные объекты)
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
        products: "📋",
        diary: "📖",
        recipes: "🍳",
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
        <div id="prikorm-app">
            <div id="app-content"></div>
            <div id="toast-root"></div>
            <div id="modal-root"></div>
            <div id="bottom-nav"></div>
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

    // showScreen(STATE?.ui?.screen || "home"); // УДАЛЕН (экран показывает initApp)

    return UI.app;
}

// Функция navButton оставлена для совместимости, но НЕ используется для построения bottom navigation
function navButton(id, label, iconName) {
    return `
        <button class="nav-button" data-screen="${id}">
            ${icon(iconName)}
            ${label}
        </button>
    `;
}

function createHeader({ title = "", subtitle = "", back = false, action = "", actionLabel = "" } = {}) {
    return `
        <div class="screen-header">
            ${back ? `<button class="back-btn" data-action="navigate" data-target="home">${icon("back")}</button>` : ""}
            <h2>${escapeHTML(title)}</h2>
            ${subtitle ? `<p class="subtitle">${escapeHTML(subtitle)}</p>` : ""}
            ${action ? `<button class="action-btn" data-action="${action}">${actionLabel || icon("plus")}</button>` : ""}
        </div>
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

        <div class="home-baby-card" data-action="navigate" data-target="baby">
            <div class="baby-avatar">👶</div>
            <div class="baby-info">
                <span class="baby-name" id="home-baby-name">Малыш</span>
                <span class="baby-age" id="home-baby-age">Заполните профиль</span>
            </div>
            ${icon("arrow")}
        </div>

        <div class="home-today-preview" data-action="navigate" data-target="today">
            <div class="preview-header">
                <span class="preview-title">Сегодня</span>
                <span class="preview-action">Открыть ${icon("arrow")}</span>
            </div>
            <div class="preview-content">
                <h3>План прикорма</h3>
                ${emptyState("☀️", "Пока ничего не запланировано", "Откройте «Сегодня», чтобы посмотреть рекомендации.")}
            </div>
        </div>

        <div class="quick-actions">
            ${quickAction("🍽️", "Добавить продукт", "add-food")}
            ${quickAction("📝", "Записать в дневник", "add-diary")}
            ${quickAction("🔍", "Найти рецепт", "navigate", "recipes")}
            ${quickAction("👶", "Профиль малыша", "open-baby")}
        </div>

        <div class="home-features">
            <h3>Быстрый доступ</h3>
            ${featureCard("🌱", "Новые продукты", "Что можно попробовать", "products-new")}
            ${featureCard("⚠️", "Безопасность", "Аллергены и ограничения", "safety")}
            ${featureCard("❤️", "Любимые", "Что нравится малышу", "favorites")}
            ${featureCard("📖", "Мой дневник", "История прикорма", "navigate", "diary")}
        </div>
    `;
    return section;
}

function quickAction(emoji, label, action, value = "") {
    return `
        <button class="quick-action" data-action="${action}" data-value="${value}">
            <span class="qa-emoji">${emoji}</span>
            <span class="qa-label">${label}</span>
        </button>
    `;
}

function featureCard(emoji, title, subtitle, action, value = "") {
    return `
        <div class="feature-card" data-action="${action}" data-value="${value}">
            <div class="fc-emoji">${emoji}</div>
            <div class="fc-content">
                <div class="fc-title">${title}</div>
                <div class="fc-subtitle">${subtitle}</div>
            </div>
            ${icon("arrow")}
        </div>
    `;
}

function createTodayScreen() {
    const section = document.createElement("section");
    section.id = "screen-today";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Сегодня", subtitle: "Ваш план прикорма" })}

        <div class="today-date-selector">
            <button class="date-nav" data-action="today-prev">‹</button>
            <span class="today-date">Сегодня</span>
            <button class="date-nav" data-action="today-next">›</button>
            <span class="today-date-hint">Нажмите, чтобы выбрать дату</span>
        </div>

        <div id="today-content">
            ${loadingState()}
        </div>

        <button class="fab-today" data-action="add-diary">
            ${icon("plus")}Добавить
        </button>
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

        <div class="diary-stats">
            <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">записей</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">продуктов</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">реакций</span>
            </div>
        </div>

        <div class="diary-toolbar">
            <button class="toolbar-btn" data-action="filter-diary">${icon("filter")}Фильтр</button>
            <button class="toolbar-btn" data-action="sort-diary">${icon("calendar")}По дате</button>
        </div>

        <div id="diary-list">
            ${emptyState("📭", "Дневник пока пуст", "Добавьте первый приём пищи.")}
        </div>

        <button class="fab-diary" data-action="add-diary">
            ${icon("plus")}Записать
        </button>
    `;
    return section;
}

function createRecipesScreen() {
    const section = document.createElement("section");
    section.id = "screen-recipes";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Рецепты", subtitle: "Идеи для малыша" })}

        <div class="recipes-search">
            <input type="text" placeholder="Поиск рецептов..." id="recipes-search-input">
            ${icon("search")}
        </div>

        <div class="recipes-categories">
            ${categoryChip("all", "Все", true)}
            ${categoryChip("breakfast", "🍳 Завтрак")}
            ${categoryChip("lunch", "🥗 Обед")}
            ${categoryChip("dinner", "🍲 Ужин")}
            ${categoryChip("snack", "🍎 Перекус")}
        </div>

        <div id="recipes-list">
            ${loadingState()}
        </div>
    `;
    return section;
}

function categoryChip(id, label, active = false) {
    return `
        <button class="chip ${active ? 'active' : ''}" data-category="${id}">${label}</button>
    `;
}

function createBabyScreen() {
    const section = document.createElement("section");
    section.id = "screen-baby";
    section.className = "screen";
    section.innerHTML = `
        ${createHeader({ title: "Малыш", subtitle: "Профиль и настройки", back: true })}

        <div class="baby-profile-card">
            <div class="baby-avatar-large">👶</div>
            <div class="baby-profile-name" id="profile-name">Ваш малыш</div>
            <div class="baby-profile-age" id="profile-age">Заполните данные</div>
            <button class="edit-profile-btn" data-action="edit-baby">${icon("edit")} Редактировать</button>
        </div>

        <div class="baby-settings">
            <h3>Прикорм</h3>
            ${settingsRow("📅", "Дата начала прикорма", "prikorm-start")}
            ${settingsRow("🍼", "Тип кормления", "feeding-type")}
            ${settingsRow("🥄", "Подход к прикорму", "approach")}
            ${settingsRow("✅", "Готовность к прикорму", "readiness")}

            <h3>Настройки</h3>
            ${settingsRow("🔔", "Уведомления", "notifications")}
            ${settingsRow("🎨", "Оформление", "theme")}

            <button class="danger-btn" data-action="reset-data">🗑 Сбросить данные</button>
        </div>
    `;
    return section;
}

function settingsRow(emoji, title, action) {
    return `
        <div class="settings-row" data-action="${action}">
            <span class="sr-emoji">${emoji}</span>
            <span class="sr-title">${title}</span>
            ${icon("arrow")}
        </div>
    `;
}

/* ============================================================
   НОВЫЕ ФУНКЦИИ ДЛЯ ПРОДУКТОВ (адаптированы под вашу структуру)
   ============================================================ */

// Карта категорий → эмодзи (fallback)
const categoryEmojiMap = {
    'Овощи': '🥕',
    'Фрукты': '🍎',
    'Крупы': '🌾',
    'Мясо': '🥩',
    'Рыба': '🐟',
    'Молочные': '🥛',
    'Аллергены': '⚠️',
    'Другое': '📦'
};

const invalidEmojis = ['', '❓', '?'];

function getProductEmoji(product) {
    if (product.emoji && !invalidEmojis.includes(product.emoji)) {
        return product.emoji;
    }
    return categoryEmojiMap[product.category] || '🍽️';
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
        warningBadge = `⚠️ ${safety.reason || 'С осторожностью'}`;
    } else if (safety.decision === 'review') {
        warningBadge = `ℹ️ ${safety.reason || 'Требует внимания'}`;
    }

    let actionButton = '';
    if (!introduced && !excluded) {
        actionButton = `＋ Ввести продукт`;
    } else {
        actionButton = `${statusText}`;
    }

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-card-header">
                <div class="product-emoji">${emoji}</div>
                <div class="product-info">
                    <div class="product-name">${escapeHTML(product.name)}</div>
                    ${warningBadge ? `<div class="product-warning">${warningBadge}</div>` : ''}
                </div>
            </div>
            <div class="product-card-body">
                <div class="product-meta">
                    <span class="product-category">${escapeHTML(product.category)}</span>
                    ${ageLabel ? `<span class="product-age">${ageLabel}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-primary" data-action="introduce-product" data-product-id="${product.id}">
                        ${actionButton}
                    </button>
                    <button class="btn-more" data-action="product-menu" data-product-id="${product.id}">⋯</button>
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
            const emoji = categoryEmojiMap[cat] || '';
            return `
                <button class="category-chip" data-category="${escapeHTML(cat)}">
                    ${emoji} ${escapeHTML(cat)}
                </button>
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
            typeof isProductIntroduced === 'function' &&
            isProductIntroduced(childId, p.id)
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
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q)
        );
    }

    const container = document.getElementById('products-list');
    if (container) {
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-emoji">🔍</span>
                    <h3>Нет продуктов</h3>
                    <p>Нет продуктов, соответствующих фильтрам.</p>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(p => renderProductCard(p, childId)).join('');
        }
    }

    // Счётчик введённых
    const countEl = document.getElementById('products-introduced-count');
    if (countEl) {
        const introducedCount = products.filter(p =>
            typeof isProductIntroduced === 'function' &&
            isProductIntroduced(childId, p.id)
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
    return `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Загружаем...</p>
        </div>
    `;
}

function emptyState(emoji, title, text) {
    return `
        <div class="empty-state">
            <span class="empty-emoji">${emoji}</span>
            <h3>${escapeHTML(title)}</h3>
            <p>${escapeHTML(text)}</p>
        </div>
    `;
}

function showToast(message, type = "default") {
    const root = document.getElementById("toast-root");
    if (!root) return;

    root.innerHTML = `
        <div class="toast ${type}">
            <span class="toast-icon">${type === "success" ? "✓" : type === "error" ? "⚠️" : "ℹ️"}</span>
            <span class="toast-message">${escapeHTML(message)}</span>
        </div>
    `;

    clearTimeout(UI.toastTimer);
    UI.toastTimer = setTimeout(() => {
        root.innerHTML = "";
    }, 3000);
}

/* ============================================================
   ОСНОВНАЯ showScreen (с поддержкой Products 2.0)
   ============================================================ */

function showScreen(screenName) {
    // Products не в UI.screens, но должен работать через screens/products.js
    const isProductsScreen = screenName === "products";

    if (
        (!UI.screens || !UI.screens[screenName]) &&
        !isProductsScreen
    ) {
        screenName = "home";
    }

    Object.entries(UI.screens).forEach(([name, element]) => {
        element.classList.toggle("active", name === screenName);
    });

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle("active", button.dataset.screen === screenName);
    });

    if (STATE?.ui) STATE.ui.screen = screenName;
    if (typeof saveState === "function") saveState();

    // Единственный вызов render перед обновлением bottom-nav
    if (typeof render === "function") render(screenName);

    // Обновление нижней навигации
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

/* ===== closeModal (объединённая версия) ===== */
function closeModal() {
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = "";
    document.body.classList.remove("modal-open");
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
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Новый приём пищи</h2>
                    <button class="modal-close" data-action="close-modal">${icon("close")}</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Добавить продукт</label>
                        ${product ? `
                            <div class="selected-product" data-product-id="${product.id}">
                                <span class="sp-emoji">${product.emoji || ""}</span>
                                <span class="sp-name">${escapeHTML(product.name)}</span>
                            </div>
                        ` : `
                            <button class="product-picker-btn" data-action="open-picker">
                                <span class="ppb-icon">🔍</span>
                                Выберите продукт
                                ${icon("arrow")}
                            </button>
                        `}
                    </div>

                    <div class="form-group">
                        <label>Как приготовили?</label>
                        <div class="btn-group">
                            <button class="btn-option" data-value="homemade">🏠 Приготовила сама</button>
                            <button class="btn-option" data-value="store">🛒 Купила</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Бренд</label>
                        <input type="text" placeholder="Название продукта" class="form-input">
                        <input type="text" placeholder="Объём упаковки" class="form-input" style="width:80px">
                        <span>г</span>
                    </div>

                    <div class="form-group">
                        <label>Состав</label>
                        <button class="btn-secondary">📷 Сфотографировать этикетку</button>
                    </div>

                    <div class="form-group">
                        <label>Способ приготовления</label>
                        <div class="btn-group">
                            <button class="btn-option" data-value="boil">Варила</button>
                            <button class="btn-option" data-value="steam">На пару</button>
                            <button class="btn-option" data-value="bake">Запекала</button>
                            <button class="btn-option" data-value="other">Другое</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Сколько съел?</label>
                        <input type="number" placeholder="0" class="form-input" style="width:80px">
                        <span>г</span>
                    </div>

                    <div class="form-group">
                        <label>Форма</label>
                        <div class="btn-group">
                            <button class="btn-option" data-value="puree">Пюре</button>
                            <button class="btn-option" data-value="mashed">Размятое</button>
                            <button class="btn-option" data-value="soft">Мягкие кусочки</button>
                            <button class="btn-option" data-value="finger">Finger food</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Понравилось?</label>
                        <div class="btn-group">
                            <button class="btn-option" data-value="like">❤️ Понравилось</button>
                            <button class="btn-option" data-value="dislike">👎 Не понравилось</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Заметка</label>
                        <textarea class="form-textarea" placeholder="Ваши заметки..."></textarea>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" checked> Это новый продукт для малыша
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" data-action="save-diary">Добавить в дневник</button>
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
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Выберите продукт</h2>
                    <p class="modal-subtitle">Можно найти в базе</p>
                    <button class="modal-close" data-action="close-modal">${icon("close")}</button>
                </div>
                <div class="modal-body">
                    <div class="search-box">
                        <input type="text" placeholder="Поиск продуктов..." id="picker-search" oninput="renderProductPicker(this.value)">
                        ${icon("search")}
                    </div>
                    <div id="picker-products">
                        ${loadingState()}
                    </div>
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
        container.innerHTML = emptyState('🔍', 'Ничего не найдено', 'Попробуйте изменить запрос');
        return;
    }

    // Используем data-action="choose-picker-product" для выбора продукта в дневник
    container.innerHTML = filtered.map(p => `
        <div class="picker-item" data-action="choose-picker-product" data-product-id="${p.id}">
            <span class="pi-emoji">${p.emoji || '🍽️'}</span>
            <span class="pi-name">${escapeHTML(p.name)}</span>
            <span class="pi-category">${p.cat || ''}</span>
            <span class="pi-arrow">›</span>
        </div>
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
    var child = window.STATE.children.find(function(c) {
        return c.id === childId;
    });
    return child && Array.isArray(child.diary) ? child.diary : [];
}

/* ============================================================
   НОВАЯ ФУНКЦИЯ: showProductMenu — меню действий с продуктом
   ============================================================ */

window.showProductMenu = function(productId) {
    var product = (window.PRODUCTS || []).find(function(p) {
        return p.id === productId;
    });

    if (!product) {
        if (typeof window.showToast === 'function') {
            window.showToast('Продукт не найден', 'error');
        }
        return;
    }

    var childId = window.STATE?.currentChildId;
    var status = childId ? window.getProductStatusForChild(productId, childId) : null;
    var isIntroduced = (status === 'introduced');
    var isExcluded = (status === 'parentExcluded');

    var menuHtml = `
        <div class="modal-overlay" data-action="close-modal">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${escapeHTML(product.name)}</h2>
                    <button class="modal-close" data-action="close-modal">${icon("close")}</button>
                </div>
                <div class="modal-body">
                    <div class="product-menu-actions">
                        ${!isIntroduced ? `<button class="menu-item" data-action="introduce-product" data-product-id="${product.id}">✅ Ввести продукт</button>` : ''}
                        ${!isExcluded ? `<button class="menu-item" data-action="exclude-product" data-product-id="${product.id}">🚫 Исключить</button>` : ''}
                        ${isExcluded ? `<button class="menu-item" data-action="unexclude-product" data-product-id="${product.id}">↩️ Вернуть</button>` : ''}
                        <button class="menu-item" data-action="view-product-details" data-product-id="${product.id}">📋 Подробнее</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    var root = document.getElementById('modal-root');
    if (root) {
        root.innerHTML = menuHtml;
        UI.modal = root;
    }
};