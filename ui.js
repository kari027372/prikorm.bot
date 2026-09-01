/* ============================================================
   ui.js
   UI / DOM-конструктор приложения ПРИКОРМ
   ============================================================ */

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

    const root =
        document.getElementById("app") ||
        document.body;


    root.innerHTML = `

        <div id="prikorm-app"
             class="prikorm-app">

            <main
                id="app-content"
                class="app-content">
            </main>


            <nav
                id="bottom-nav"
                class="bottom-nav">

                ${navButton(
                    "home",
                    "Главная",
                    "home"
                )}

                ${navButton(
                    "today",
                    "Сегодня",
                    "today"
                )}

                ${navButton(
                    "products",
                    "Продукты",
                    "products"
                )}

                ${navButton(
                    "diary",
                    "Дневник",
                    "diary"
                )}

                ${navButton(
                    "recipes",
                    "Рецепты",
                    "recipes"
                )}

            </nav>


            <div
                id="modal-root"
                class="modal-root">
            </div>


            <div
                id="toast-root"
                class="toast-root">
            </div>

        </div>
    `;


    UI.app =
        document.getElementById(
            "prikorm-app"
        );


    UI.screens = {

        home:
            createHomeScreen(),

        today:
            createTodayScreen(),

        products:
            createProductsScreen(),

        diary:
            createDiaryScreen(),

        recipes:
            createRecipesScreen(),

        baby:
            createBabyScreen()
    };


    Object.values(
        UI.screens
    ).forEach(
        screen =>
            document
                .getElementById(
                    "app-content"
                )
                .appendChild(
                    screen
                )
    );


    showScreen(
        STATE?.ui?.screen ||
        "home"
    );


    return UI.app;
}


/* ============================================================
   НИЖНЯЯ НАВИГАЦИЯ
   ============================================================ */

function navButton(
    id,
    label,
    iconName
) {

    return `

        <button
            type="button"
            class="nav-button"
            data-action="navigate"
            data-screen="${id}">

            <span class="nav-icon">
                ${icon(iconName)}
            </span>

            <span class="nav-label">
                ${label}
            </span>

        </button>
    `;
}


/* ============================================================
   ОБЩИЙ HEADER
   ============================================================ */

function createHeader({
    title = "",
    subtitle = "",
    back = false,
    action = "",
    actionLabel = ""
} = {}) {

    return `

        <header
            class="screen-header">

            <div
                class="header-left">

                ${
                    back
                        ? `
                            <button
                                type="button"
                                class="icon-button"
                                data-action="back">

                                ${icon("back")}

                            </button>
                          `
                        : ""
                }

                <div>

                    <h1>
                        ${escapeHTML(title)}
                    </h1>

                    ${
                        subtitle
                            ? `
                                <p>
                                    ${escapeHTML(
                                        subtitle
                                    )}
                                </p>
                              `
                            : ""
                    }

                </div>

            </div>


            ${
                action
                    ? `
                        <button
                            type="button"
                            class="header-action"
                            data-action="${action}">

                            ${
                                actionLabel ||
                                icon("plus")
                            }

                        </button>
                      `
                    : ""
            }

        </header>
    `;
}


/* ============================================================
   ЭКРАН — ГЛАВНАЯ
   ============================================================ */

function createHomeScreen() {

    const section =
        document.createElement("section");


    section.id =
        "screen-home";

    section.className =
        "screen";


    section.innerHTML = `

        ${createHeader({
            title: "Прикорм",
            subtitle: "Спокойно, понятно, по шагам"
        })}


        <div class="home-content">

            <section
                class="baby-card"
                data-action="open-baby">

                <div class="baby-avatar">
                    👶
                </div>

                <div class="baby-info">

                    <span class="eyebrow">
                        Малыш
                    </span>

                    <strong
                        id="home-baby-name">
                        Ваш малыш
                    </strong>

                    <span
                        id="home-baby-age">
                        Заполните профиль
                    </span>

                </div>

                <span class="card-arrow">
                    ${icon("arrow")}
                </span>

            </section>


            <section
                class="today-card">

                <div
                    class="section-heading">

                    <div>

                        <span
                            class="eyebrow">
                            Сегодня
                        </span>

                        <h2>
                            План прикорма
                        </h2>

                    </div>

                    <button
                        type="button"
                        class="text-button"
                        data-action="navigate"
                        data-screen="today">

                        Открыть

                    </button>

                </div>


                <div
                    id="home-today-preview"
                    class="today-preview">

                    ${emptyState(
                        "☀️",
                        "Пока ничего не запланировано",
                        "Откройте «Сегодня», чтобы посмотреть рекомендации."
                    )}

                </div>

            </section>


            <div
                class="quick-actions">

                ${quickAction(
                    "🥑",
                    "Добавить продукт",
                    "add-food"
                )}

                ${quickAction(
                    "📖",
                    "Записать в дневник",
                    "add-diary"
                )}

                ${quickAction(
                    "🍲",
                    "Найти рецепт",
                    "navigate",
                    "recipes"
                )}

                ${quickAction(
                    "👶",
                    "Профиль малыша",
                    "open-baby"
                )}

            </div>


            <section
                class="home-section">

                <div
                    class="section-heading">

                    <h2>
                        Быстрый доступ
                    </h2>

                </div>


                <div
                    class="feature-grid">

                    ${featureCard(
                        "🥕",
                        "Новые продукты",
                        "Что можно попробовать",
                        "products-new"
                    )}

                    ${featureCard(
                        "⚠️",
                        "Безопасность",
                        "Аллергены и ограничения",
                        "safety"
                    )}

                    ${featureCard(
                        "❤️",
                        "Любимые",
                        "Что нравится малышу",
                        "favorites"
                    )}

                    ${featureCard(
                        "📊",
                        "Мой дневник",
                        "История прикорма",
                        "navigate",
                        "diary"
                    )}

                </div>

            </section>

        </div>
    `;


    return section;
}


/* ============================================================
   БЫСТРЫЕ ДЕЙСТВИЯ
   ============================================================ */

function quickAction(
    emoji,
    label,
    action,
    value = ""
) {

    return `

        <button
            type="button"
            class="quick-action"
            data-action="${action}"
            ${
                value
                    ? `data-screen="${value}"`
                    : ""
            }>

            <span
                class="quick-action-icon">

                ${emoji}

            </span>

            <span>
                ${label}
            </span>

        </button>
    `;
}


/* ============================================================
   КАРТОЧКА ФУНКЦИИ
   ============================================================ */

function featureCard(
    emoji,
    title,
    subtitle,
    action,
    value = ""
) {

    return `

        <button
            type="button"
            class="feature-card"
            data-action="${action}"
            ${
                value
                    ? `data-screen="${value}"`
                    : ""
            }>

            <span
                class="feature-icon">

                ${emoji}

            </span>

            <span
                class="feature-title">

                ${title}

            </span>

            <span
                class="feature-subtitle">

                ${subtitle}

            </span>

            <span
                class="feature-arrow">

                ${icon("arrow")}

            </span>

        </button>
    `;
}


/* ============================================================
   ЭКРАН — СЕГОДНЯ
   ============================================================ */

function createTodayScreen() {

    const section =
        document.createElement("section");


    section.id =
        "screen-today";

    section.className =
        "screen";


    section.innerHTML = `

        ${createHeader({
            title: "Сегодня",
            subtitle: "Ваш план прикорма"
        })}


        <div class="screen-body">

            <div
                class="date-selector">

                <button
                    type="button"
                    class="icon-button"
                    data-action="previous-day">

                    ‹

                </button>


                <button
                    type="button"
                    class="date-main"
                    data-action="select-date">

                    <span
                        id="today-date">
                        Сегодня
                    </span>

                    <small>
                        Нажмите, чтобы выбрать дату
                    </small>

                </button>


                <button
                    type="button"
                    class="icon-button"
                    data-action="next-day">

                    ›

                </button>

            </div>


            <div
                id="daily-plan"
                class="daily-plan">

                ${loadingState()}

            </div>


            <button
                type="button"
                class="floating-add"
                data-action="add-food">

                ${icon("plus")}

                <span>
                    Добавить
                </span>

            </button>

        </div>
    `;


    return section;
}


/* ============================================================
   ЭКРАН — ПРОДУКТЫ
   ============================================================ */

function createProductsScreen() {

    const section =
        document.createElement("section");


    section.id =
        "screen-products";

    section.className =
        "screen";


    section.innerHTML = `

        ${createHeader({
            title: "Продукты",
            subtitle: "Знакомство с едой"
        })}


        <div class="screen-body">

            <div
                class="search-box">

                <span>
                    ${icon("search")}
                </span>

                <input
                    id="product-search"
                    type="search"
                    placeholder="Найти продукт..."
                    autocomplete="off"
                />

                <button
                    type="button"
                    class="clear-search"
                    data-action="clear-search">

                    ${icon("close")}

                </button>

            </div>


            <div
                id="product-categories"
                class="horizontal-scroll">

                ${categoryChip(
                    "all",
                    "Все",
                    true
                )}

                ${categoryChip(
                    "vegetables",
                    "🥕 Овощи"
                )}

                ${categoryChip(
                    "fruits",
                    "🍎 Фрукты"
                )}

                ${categoryChip(
                    "grains",
                    "🌾 Крупы"
                )}

                ${categoryChip(
                    "meat",
                    "🥩 Мясо"
                )}

                ${categoryChip(
                    "fish",
                    "🐟 Рыба"
                )}

                ${categoryChip(
                    "dairy",
                    "🥛 Молочное"
                )}

                ${categoryChip(
                    "allergens",
                    "⚠️ Аллергены"
                )}

            </div>


            <div
                class="products-tabs">

                <button
                    type="button"
                    class="product-tab active"
                    data-action="products-tab"
                    data-tab="all">

                    Все продукты

                </button>

                <button
                    type="button"
                    class="product-tab"
                    data-action="products-tab"
                    data-tab="new">

                    Новые

                </button>

                <button
                    type="button"
                    class="product-tab"
                    data-action="products-tab"
                    data-tab="introduced">

                    Уже пробовали

                </button>

            </div>


            <div
                id="products-list"
                class="products-list">

                ${loadingState()}

            </div>


            <button
                type="button"
                class="floating-add"
                data-action="add-food">

                ${icon("plus")}

                <span>
                    Добавить
                </span>

            </button>

        </div>
    `;


    return section;
}


/* ============================================================
   КАТЕГОРИЯ
   ============================================================ */

function categoryChip(
    id,
    label,
    active = false
) {

    return `

        <button
            type="button"
            class="category-chip ${
                active ? "active" : ""
            }"
            data-action="product-category"
            data-category="${id}">

            ${label}

        </button>
    `;
}


/* ============================================================
   ЭКРАН — ДНЕВНИК
   ============================================================ */

function createDiaryScreen() {

    const section =
        document.createElement("section");


    section.id =
        "screen-diary";

    section.className =
        "screen";


    section.innerHTML = `

        ${createHeader({
            title: "Дневник",
            subtitle: "История питания"
        })}


        <div class="screen-body">

            <div
                class="diary-summary"
                id="diary-summary">

                <div class="summary-item">

                    <strong id="diary-total">
                        0
                    </strong>

                    <span>
                        записей
                    </span>

                </div>


                <div class="summary-item">

                    <strong id="diary-products">
                        0
                    </strong>

                    <span>
                        продуктов
                    </span>

                </div>


                <div class="summary-item">

                    <strong id="diary-reactions">
                        0
                    </strong>

                    <span>
                        реакций
                    </span>

                </div>

            </div>


            <div
                class="diary-filters">

                <button
                    type="button"
                    class="filter-button"
                    data-action="diary-filter">

                    ${icon("filter")}

                    Фильтр

                </button>

                <button
                    type="button"
                    class="filter-button"
                    data-action="diary-calendar">

                    ${icon("calendar")}

                    По дате

                </button>

            </div>


            <div
                id="diary-list"
                class="diary-list">

                ${emptyState(
                    "📖",
                    "Дневник пока пуст",
                    "Добавьте первый приём пищи."
                )}

            </div>


            <button
                type="button"
                class="floating-add"
                data-action="add-diary">

                ${icon("plus")}

                <span>
                    Записать
                </span>

            </button>

        </div>
    `;


    return section;
}


/* ============================================================
   ЭКРАН — РЕЦЕПТЫ
   ============================================================ */

function createRecipesScreen() {

    const section =
        document.createElement("section");


    section.id =
        "screen-recipes";

    section.className =
        "screen";


    section.innerHTML = `

        ${createHeader({
            title: "Рецепты",
            subtitle: "Идеи для малыша"
        })}


        <div class="screen-body">

            <div
                class="search-box">

                <span>
                    ${icon("search")}
                </span>

                <input
                    id="recipe-search"
                    type="search"
                    placeholder="Найти рецепт..."
                    autocomplete="off"
                />

            </div>


            <div
                class="horizontal-scroll">

                ${categoryChip(
                    "all",
                    "Все",
                    true
                )}

                ${categoryChip(
                    "breakfast",
                    "🌞 Завтрак"
                )}

                ${categoryChip(
                    "lunch",
                    "🍲 Обед"
                )}

                ${categoryChip(
                    "dinner",
                    "🌙 Ужин"
                )}

                ${categoryChip(
                    "snack",
                    "🍌 Перекус"
                )}

            </div>


            <div
                id="recipes-list"
                class="recipes-list">

                ${loadingState()}

            </div>

        </div>
    `;


    return section;
}


/* ============================================================
   ЭКРАН — ПРОФИЛЬ
   ============================================================ */

function createBabyScreen() {

    const section =
        document.createElement("section");


    section.id =
        "screen-baby";

    section.className =
        "screen";


    section.innerHTML = `

        ${createHeader({
            title: "Малыш",
            subtitle: "Профиль и настройки",
            back: true
        })}


        <div class="screen-body">

            <section
                class="profile-hero">

                <div
                    class="profile-avatar">

                    👶

                </div>

                <div>

                    <h2
                        id="profile-name">
                        Ваш малыш
                    </h2>

                    <p
                        id="profile-age">
                        Заполните данные
                    </p>

                </div>

                <button
                    type="button"
                    class="icon-button"
                    data-action="edit-baby">

                    ${icon("edit")}

                </button>

            </section>


            <section
                class="settings-group">

                <h3>
                    Прикорм
                </h3>


                ${settingsRow(
                    "📅",
                    "Дата начала прикорма",
                    "prikorm-start"
                )}

                ${settingsRow(
                    "🥛",
                    "Тип кормления",
                    "feeding-type"
                )}

                ${settingsRow(
                    "🍽️",
                    "Подход к прикорму",
                    "approach"
                )}

                ${settingsRow(
                    "✓",
                    "Готовность к прикорму",
                    "readiness"
                )}

            </section>


            <section
                class="settings-group">

                <h3>
                    Настройки
                </h3>


                ${settingsRow(
                    "🔔",
                    "Уведомления",
                    "notifications"
                )}

                ${settingsRow(
                    "🎨",
                    "Оформление",
                    "theme"
                )}

            </section>


            <button
                type="button"
                class="danger-button"
                data-action="reset-data">

                Сбросить данные

            </button>

        </div>
    `;


    return section;
}


/* ============================================================
   СТРОКА НАСТРОЕК
   ============================================================ */

function settingsRow(
    emoji,
    title,
    action
) {

    return `

        <button
            type="button"
            class="settings-row"
            data-action="settings"
            data-setting="${action}">

            <span
                class="settings-icon">

                ${emoji}

            </span>

            <span
                class="settings-title">

                ${title}

            </span>

            <span
                class="settings-arrow">

                ${icon("arrow")}

            </span>

        </button>
    `;
}


/* ============================================================
   КАРТОЧКА ПРОДУКТА
   ============================================================ */

function productCard(
    product,
    status = "new"
) {

    if (!product) {
        return "";
    }


    const isIntroduced =
        status === "introduced";


    const allergen =
        Boolean(
            product.allergen
        );


    return `

        <article
            class="product-card"
            data-product-id="${escapeHTML(
                product.id
            )}">

            <button
                type="button"
                class="product-card-main"
                data-action="open-product"
                data-product-id="${escapeHTML(
                    product.id
                )}">

                <div
                    class="product-emoji">

                    ${
                        product.emoji ||
                        "🥣"
                    }

                </div>


                <div
                    class="product-card-info">

                    <div
                        class="product-title-row">

                        <h3>
                            ${escapeHTML(
                                product.name
                            )}
                        </h3>

                        ${
                            allergen
                                ? `
                                    <span
                                        class="allergen-badge">
                                        ⚠️
                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <p>

                        ${
                            product.category ||
                            "Продукт"
                        }

                    </p>


                    ${
                        isIntroduced
                            ? `
                                <span
                                    class="introduced-badge">

                                    ✓ Уже пробовали

                                </span>
                              `
                            : `
                                <span
                                    class="new-badge">

                                    Новый продукт

                                </span>
                              `
                    }

                </div>


                <span
                    class="product-arrow">

                    ${icon("arrow")}

                </span>

            </button>


            <button
                type="button"
                class="favorite-button"
                data-action="toggle-favorite"
                data-product-id="${escapeHTML(
                    product.id
                )}">

                ${icon("heart")}

            </button>

        </article>
    `;
}


/* ============================================================
   КАРТОЧКА ДНЕВНИКА
   ============================================================ */

function diaryCard(
    entry
) {

    if (!entry) {
        return "";
    }


    const isStore =
        entry.source ===
        "store";


    return `

        <article
            class="diary-card"
            data-entry-id="${escapeHTML(
                entry.id
            )}">

            <div
                class="diary-card-top">

                <div
                    class="diary-product-icon">

                    ${
                        isStore
                            ? icon("cart")
                            : icon("homemade")
                    }

                </div>


                <div
                    class="diary-card-title">

                    <h3>
                        ${escapeHTML(
                            entry.productName ||
                            "Продукт"
                        )}
                    </h3>


                    ${
                        isStore &&
                        entry.brand
                            ? `
                                <span>
                                    ${escapeHTML(
                                        entry.brand
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>


                <button
                    type="button"
                    class="icon-button small"
                    data-action="edit-diary"
                    data-entry-id="${escapeHTML(
                        entry.id
                    )}">

                    ${icon("edit")}

                </button>

            </div>


            <div
                class="diary-card-meta">

                ${
                    entry.amount != null
                        ? `
                            <span>
                                ⚖️
                                ${escapeHTML(
                                    entry.amount
                                )}
                                ${escapeHTML(
                                    entry.unit || "г"
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    entry.servingForm
                        ? `
                            <span>
                                🥣
                                ${escapeHTML(
                                    entry.servingForm
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    entry.time
                        ? `
                            <span>
                                ${icon("clock")}
                                ${escapeHTML(
                                    entry.time
                                )}
                            </span>
                          `
                        : ""
                }

            </div>


            ${
                entry.liked === true
                    ? `
                        <div
                            class="reaction-positive">

                            ❤️ Понравилось

                        </div>
                      `
                    : ""
            }


            ${
                entry.liked === false
                    ? `
                        <div
                            class="reaction-negative">

                            Не понравилось

                        </div>
                      `
                    : ""
            }


            ${
                entry.hasReaction ||
                entry.reaction ||
                (
                    entry.reactionSymptoms &&
                    entry.reactionSymptoms.length
                )
                    ? `
                        <div
                            class="reaction-warning">

                            ⚠️ Есть отмеченная реакция

                        </div>
                      `
                    : ""
            }

        </article>
    `;
}


/* ============================================================
   МОДАЛКА ДОБАВЛЕНИЯ ЕДЫ
   ============================================================ */

function openAddFoodModal(
    product = null
) {

    const root =
        document.getElementById(
            "modal-root"
        );


    if (!root) {
        return;
    }


    root.innerHTML = `

        <div
            class="modal-overlay"
            data-action="close-modal">

            <div
                class="modal-sheet"
                data-modal-content>

                <div
                    class="modal-header">

                    <div>

                        <span
                            class="eyebrow">

                            Новый приём пищи

                        </span>

                        <h2>
                            Добавить продукт
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="icon-button"
                        data-action="close-modal">

                        ${icon("close")}

                    </button>

                </div>


                <div
                    class="modal-body">

                    ${
                        product
                            ? `
                                <div
                                    class="selected-product">

                                    <span>
                                        ${
                                            product.emoji ||
                                            "🥣"
                                        }
                                    </span>

                                    <strong>
                                        ${escapeHTML(
                                            product.name
                                        )}
                                    </strong>

                                    <input
                                        type="hidden"
                                        id="food-product-id"
                                        value="${escapeHTML(
                                            product.id
                                        )}"
                                    />

                                </div>
                              `
                            : `
                                <label
                                    class="form-label">

                                    Продукт

                                    <button
                                        type="button"
                                        class="select-field"
                                        data-action="choose-product">

                                        <span
                                            id="selected-product-label">

                                            Выберите продукт

                                        </span>

                                        <span>
                                            ${icon("arrow")}
                                        </span>

                                    </button>

                                    <input
                                        type="hidden"
                                        id="food-product-id"
                                        value=""
                                    />

                                </label>
                              `
                    }


                    <div
                        class="source-selector">

                        <span
                            class="form-label-title">

                            Как приготовили?

                        </span>


                        <div
                            class="segmented-control">

                            <button
                                type="button"
                                class="segment active"
                                data-action="food-source"
                                data-source="homemade">

                                🏠
                                Приготовила сама

                            </button>


                            <button
                                type="button"
                                class="segment"
                                data-action="food-source"
                                data-source="store">

                                🛒
                                Купила

                            </button>

                        </div>

                    </div>


                    <div
                        id="store-fields"
                        class="conditional-fields"
                        hidden>

                        <label
                            class="form-label">

                            Бренд

                            <input
                                id="food-brand"
                                type="text"
                                placeholder="Например, Gerber"
                                autocomplete="off"
                            />

                        </label>


                        <label
                            class="form-label">

                            Название продукта

                            <input
                                id="food-product-title"
                                type="text"
                                placeholder="Например, Яблоко"
                            />

                        </label>


                        <label
                            class="form-label">

                            Объём упаковки

                            <div
                                class="input-with-unit">

                                <input
                                    id="food-package-size"
                                    type="number"
                                    min="0"
                                    placeholder="80"
                                />

                                <span>
                                    г
                                </span>

                            </div>

                        </label>


                        <label
                            class="form-label">

                            Состав

                            <textarea
                                id="food-ingredients"
                                rows="3"
                                placeholder="Можно переписать с упаковки">
                            </textarea>

                        </label>


                        <button
                            type="button"
                            class="secondary-button"
                            data-action="scan-label">

                            📷
                            Сфотографировать этикетку

                        </button>

                    </div>


                    <div
                        id="homemade-fields"
                        class="conditional-fields">

                        <label
                            class="form-label">

                            Способ приготовления

                            <select
                                id="food-preparation">

                                <option value="">
                                    Выберите
                                </option>

                                <option value="boiled">
                                    Варила
                                </option>

                                <option value="steam">
                                    На пару
                                </option>

                                <option value="baked">
                                    Запекала
                                </option>

                                <option value="other">
                                    Другое
                                </option>

                            </select>

                        </label>

                    </div>


                    <div
                        class="form-row">

                        <label
                            class="form-label">

                            Сколько съел?

                            <div
                                class="input-with-unit">

                                <input
                                    id="food-amount"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="Не обязательно"
                                />

                                <span>
                                    г
                                </span>

                            </div>

                        </label>


                        <label
                            class="form-label">

                            Форма

                            <select
                                id="food-form">

                                <option value="">
                                    Выберите
                                </option>

                                <option value="puree">
                                    Пюре
                                </option>

                                <option value="mashed">
                                    Размятое
                                </option>

                                <option value="soft">
                                    Мягкие кусочки
                                </option>

                                <option value="finger-food">
                                    Finger food
                                </option>

                            </select>

                        </label>

                    </div>


                    <div
                        class="form-label">

                        <span
                            class="form-label-title">

                            Понравилось?

                        </span>


                        <div
                            class="like-selector">

                            <button
                                type="button"
                                class="like-option"
                                data-action="set-liked"
                                data-liked="true">

                                ❤️
                                Понравилось

                            </button>


                            <button
                                type="button"
                                class="like-option"
                                data-action="set-liked"
                                data-liked="false">

                                🙅🏻‍♀️
                                Не понравилось

                            </button>

                        </div>

                    </div>


                    <label
                        class="form-label">

                        Заметка

                        <textarea
                            id="food-notes"
                            rows="3"
                            placeholder="Например: ел с удовольствием">
                        </textarea>

                    </label>


                    <label
                        class="checkbox-row">

                        <input
                            id="food-new-product"
                            type="checkbox"
                            checked
                        />

                        <span>
                            Это новый продукт для малыша
                        </span>

                    </label>


                    <button
                        type="button"
                        class="primary-button full-width"
                        data-action="save-food">

                        Добавить в дневник

                    </button>

                </div>

            </div>

        </div>
    `;


    UI.modal = root;
}


/* ============================================================
   МОДАЛКА ВЫБОРА ПРОДУКТА
   ============================================================ */

function openProductPicker() {

    const root =
        document.getElementById(
            "modal-root"
        );


    root.innerHTML = `

        <div
            class="modal-overlay"
            data-action="close-modal">

            <div
                class="modal-sheet large"
                data-modal-content>

                <div
                    class="modal-header">

                    <div>

                        <h2>
                            Выберите продукт
                        </h2>

                        <p>
                            Можно найти в базе
                        </p>

                    </div>


                    <button
                        type="button"
                        class="icon-button"
                        data-action="close-modal">

                        ${icon("close")}

                    </button>

                </div>


                <div
                    class="modal-body">

                    <div
                        class="search-box">

                        <span>
                            ${icon("search")}
                        </span>

                        <input
                            id="picker-search"
                            type="search"
                            placeholder="Поиск..."
                            autocomplete="off"
                        />

                    </div>


                    <div
                        id="picker-products"
                        class="products-list">

                        ${loadingState()}

                    </div>

                </div>

            </div>

        </div>
    `;


    UI.modal = root;


    if (
        typeof renderProductPicker ===
        "function"
    ) {

        renderProductPicker();
    }
}


/* ============================================================
   СОСТОЯНИЯ
   ============================================================ */

function loadingState() {

    return `

        <div
            class="loading-state">

            <div
                class="loading-spinner">
            </div>

            <span>
                Загружаем...
            </span>

        </div>
    `;
}


function emptyState(
    emoji,
    title,
    text
) {

    return `

        <div
            class="empty-state">

            <div
                class="empty-state-icon">

                ${emoji}

            </div>

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(text)}
            </p>

        </div>
    `;
}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(
    message,
    type = "default"
) {

    const root =
        document.getElementById(
            "toast-root"
        );


    if (!root) {
        return;
    }


    root.innerHTML = `

        <div
            class="toast toast-${type}">

            ${
                type === "success"
                    ? "✓"
                    : type === "error"
                        ? "⚠️"
                        : "ℹ️"
            }

            <span>
                ${escapeHTML(message)}
            </span>

        </div>
    `;


    clearTimeout(
        UI.toastTimer
    );


    UI.toastTimer =
        setTimeout(
            () => {

                root.innerHTML = "";

            },
            3000
        );
}


/* ============================================================
   НАВИГАЦИЯ
   ============================================================ */

function showScreen(
    screenName
) {

    if (
        !UI.screens ||
        !UI.screens[screenName]
    ) {

        screenName = "home";
    }


    Object.entries(
        UI.screens
    ).forEach(
        ([name, element]) => {

            element.classList.toggle(
                "active",
                name === screenName
            );
        }
    );


    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.screen ===
                    screenName
                );
            }
        );


    if (STATE?.ui) {

        STATE.ui.screen =
            screenName;
    }


    if (
        typeof saveState ===
        "function"
    ) {

        saveState();
    }


    if (
        typeof render ===
        "function"
    ) {

        render(
            screenName
        );
    }
}


/* ============================================================
   ОБНОВЛЕНИЕ ПРОФИЛЯ
   ============================================================ */

function updateProfileUI() {

    const baby =
        typeof getBaby ===
        "function"
            ? getBaby()
            : STATE?.baby;


    if (!baby) {
        return;
    }


    const name =
        baby.name ||
        "Ваш малыш";


    const age =
        baby.ageMonths != null
            ? `${baby.ageMonths} мес.`
            : "Заполните профиль";


    const fields = {

        "home-baby-name":
            name,

        "profile-name":
            name,

        "home-baby-age":
            age,

        "profile-age":
            age
    };


    Object.entries(
        fields
    ).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;
            }
        }
    );
}


/* ============================================================
   ЗАКРЫТЬ МОДАЛКУ
   ============================================================ */

function closeModal() {

    const root =
        document.getElementById(
            "modal-root"
        );


    if (root) {

        root.innerHTML = "";
    }


    UI.modal =
        null;
}


/* ============================================================
   ГЛОБАЛЬНЫЕ ФУНКЦИИ
   ============================================================ */

window.UI =
    UI;

window.buildApp =
    buildApp;

window.showScreen =
    showScreen;

window.updateProfileUI =
    updateProfileUI;

window.openAddFoodModal =
    openAddFoodModal;

window.openProductPicker =
    openProductPicker;

window.closeModal =
    closeModal;

window.showToast =
    showToast;

window.productCard =
    productCard;

window.diaryCard =
    diaryCard;

window.emptyState =
    emptyState;

window.loadingState =
    loadingState;

window.escapeHTML =
    escapeHTML;


/* ============================================================
   ДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ РЕНДЕРИНГА ПИКЕРА ПРОДУКТОВ
   ============================================================ */

function renderProductPicker(query) {
    const container = document.getElementById('picker-products');
    if (!container) return;
    const products = PRODUCTS || [];
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


/* ============================================================
   ОБРАБОТЧИК ВЫБОРА ПРОДУКТА В ПИКЕРЕ
   ============================================================ */

document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-action="select-product"]');
    if (!target) return;
    const productId = target.dataset.productId;
    if (!productId) return;
    const product = (PRODUCTS || []).find(p => p.id === productId);
    if (product) {
        closeModal();
        if (typeof openAddFoodModal === 'function') {
            openAddFoodModal(product);
        } else {
            showToast('Выбран продукт: ' + product.name, 'success');
        }
    }
});


window.renderProductPicker = renderProductPicker;

// ГАРАНТИЯ, ЧТО openProductPicker И renderProductPicker ДОСТУПНЫ ГЛОБАЛЬНО
if (typeof window.openProductPicker === 'undefined') {
    window.openProductPicker = openProductPicker;
}
if (typeof window.renderProductPicker === 'undefined') {
    window.renderProductPicker = renderProductPicker;
}