/* ============================================================
   rendering.js
   Отрисовка экранов приложения
   ============================================================ */


/* ============================================================
   ОСНОВНОЙ RENDER
   ============================================================ */

function render(screen) {

    const app =
        document.getElementById("app");

    if (!app) return;


    switch (screen) {

        case "home":
            renderHome();
            break;

        case "products":
            renderProducts();
            break;

        case "diary":
            renderDiary();
            break;

        case "recipes":
            renderRecipes();
            break;

        case "today":
            renderToday();
            break;

        case "baby":
            renderBaby();
            break;

        case "settings":
            renderSettings();
            break;

        default:
            renderHome();
    }


    updateProfileUI();
}


/* ============================================================
   HOME
   ============================================================ */

function renderHome() {

    const app =
        document.getElementById("app");

    const baby =
        STATE.baby || {};

    const age =
        getBabyAgeText();


    app.innerHTML = `

        <div class="screen home-screen">

            ${renderHeader()}


            <main class="page-content">

                <section class="welcome-card">

                    <div>

                        <span class="eyebrow">
                            ПРИКОРМ
                        </span>

                        <h1>
                            ${escapeHTML(
                                baby.name ||
                                "Малыш"
                            )}
                        </h1>

                        <p>
                            ${age}
                        </p>

                    </div>

                    <div class="baby-avatar">
                        🐣
                    </div>

                </section>


                ${renderTodayProgress()}


                <section class="quick-actions">

                    <button
                        class="quick-action"
                        data-action="add-food">

                        <span>🥣</span>

                        <strong>
                            Добавить продукт
                        </strong>

                        <small>
                            Записать в дневник
                        </small>

                    </button>


                    <button
                        class="quick-action"
                        data-action="navigate"
                        data-screen="products">

                        <span>🥑</span>

                        <strong>
                            Продукты
                        </strong>

                        <small>
                            Смотреть базу
                        </small>

                    </button>


                    <button
                        class="quick-action"
                        data-action="navigate"
                        data-screen="recipes">

                        <span>🍲</span>

                        <strong>
                            Рецепты
                        </strong>

                        <small>
                            По возрасту малыша
                        </small>

                    </button>


                    <button
                        class="quick-action"
                        data-action="navigate"
                        data-screen="diary">

                        <span>📖</span>

                        <strong>
                            Дневник
                        </strong>

                        <small>
                            История прикорма
                        </small>

                    </button>

                </section>


                ${renderNextProductCard()}


                ${renderRecommendationCard()}

            </main>


            ${renderBottomNavigation("home")}

        </div>
    `;
}


/* ============================================================
   HEADER
   ============================================================ */

function renderHeader() {

    return `

        <header class="app-header">

            <div>

                <span class="app-kicker">
                    🌸 ПРИКОРМ
                </span>

                <h2>
                    Каждый день — маленький шаг
                </h2>

            </div>


            <button
                class="header-button"
                data-action="navigate"
                data-screen="settings">

                ⚙️

            </button>

        </header>
    `;
}


/* ============================================================
   TODAY PROGRESS
   ============================================================ */

function renderTodayProgress() {

    const diary =
        STATE.diary || [];

    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    const todayEntries =
        diary.filter(
            item =>
                item.date === today
        );


    const count =
        todayEntries.length;


    return `

        <section class="progress-card">

            <div class="section-heading">

                <div>

                    <span class="eyebrow">
                        СЕГОДНЯ
                    </span>

                    <h3>
                        Прикорм
                    </h3>

                </div>

                <span class="progress-number">
                    ${count}
                </span>

            </div>


            <div class="progress-track">

                <div
                    class="progress-fill"
                    style="width:${Math.min(
                        count * 33,
                        100
                    )}%">
                </div>

            </div>


            <p class="muted">
                ${
                    count === 0
                        ? "Пока ничего не записано"
                        : `Записей сегодня: ${count}`
                }
            </p>

        </section>
    `;
}


/* ============================================================
   NEXT PRODUCT
   ============================================================ */

function renderNextProductCard() {

    if (
        typeof getNextProduct !==
        "function" ||
        typeof PRODUCTS ===
        "undefined"
    ) {
        return "";
    }


    const product =
        getNextProduct(
            STATE.baby,
            PRODUCTS
        );


    if (!product) {
        return "";
    }


    return `

        <section class="recommendation-card">

            <div class="recommendation-icon">
                ${product.emoji || "🥑"}
            </div>


            <div class="recommendation-content">

                <span class="eyebrow">
                    МОЖНО ПОПРОБОВАТЬ
                </span>

                <h3>
                    ${escapeHTML(
                        product.name
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        product.desc ||
                        "Подходит для следующего знакомства."
                    )}
                </p>

            </div>


            <button
                class="small-button"
                data-action="open-product"
                data-product-id="${escapeHTML(
                    product.id
                )}">

                Подробнее

            </button>

        </section>
    `;
}


/* ============================================================
   RECOMMENDATION
   ============================================================ */

function renderRecommendationCard() {

    const baby =
        STATE.baby || {};


    const age =
        Number(
            baby.ageMonths || 0
        );


    let text =
        "Следите за признаками готовности малыша.";


    if (age >= 6) {

        text =
            "В этом возрасте особенно важно постепенно расширять разнообразие продуктов и текстур.";
    }


    if (age >= 8) {

        text =
            "Постепенно увеличивайте разнообразие текстур и продуктов, подходящих малышу.";
    }


    return `

        <section class="info-card">

            <span class="info-icon">
                💡
            </span>

            <div>

                <strong>
                    Совет на сегодня
                </strong>

                <p>
                    ${text}
                </p>

            </div>

        </section>
    `;
}


/* ============================================================
   PRODUCTS
   ============================================================ */

function renderProducts() {

    const app =
        document.getElementById("app");

    if (!app) return;


    let products =
        typeof PRODUCTS !== "undefined"
            ? [...PRODUCTS]
            : [];


    /*
       Поиск
    */

    if (
        typeof CURRENT_PRODUCT_SEARCH !==
        "undefined" &&
        CURRENT_PRODUCT_SEARCH
    ) {

        products =
            products.filter(
                product =>
                    String(
                        product.name || ""
                    )
                        .toLowerCase()
                        .includes(
                            CURRENT_PRODUCT_SEARCH
                        )
            );
    }


    /*
       Категория
    */

    if (
        typeof CURRENT_PRODUCT_CATEGORY !==
        "undefined" &&
        CURRENT_PRODUCT_CATEGORY !== "all"
    ) {

        products =
            products.filter(
                product =>
                    product.cat ===
                    CURRENT_PRODUCT_CATEGORY ||
                    product.category ===
                    CURRENT_PRODUCT_CATEGORY
            );
    }


    /*
       Избранные
    */

    if (
        typeof CURRENT_PRODUCTS_TAB !==
        "undefined" &&
        CURRENT_PRODUCTS_TAB ===
        "favorites"
    ) {

        products =
            products.filter(
                product =>
                    STATE.products.favorites
                        .includes(
                            product.id
                        )
            );
    }


    /*
       Уже пробовали
    */

    if (
        typeof CURRENT_PRODUCTS_TAB !==
        "undefined" &&
        CURRENT_PRODUCTS_TAB ===
        "introduced"
    ) {

        products =
            products.filter(
                product =>
                    STATE.products.introduced
                        .some(
                            item =>
                                (
                                    typeof item ===
                                    "object"
                                        ? item.id
                                        : item
                                ) ===
                                product.id
                        )
            );
    }


    app.innerHTML = `

        <div class="screen products-screen">

            ${renderPageHeader(
                "Продукты",
                "Вся база продуктов для прикорма"
            )}


            <main class="page-content">

                <div class="search-box">

                    🔎

                    <input
                        id="product-search"
                        type="search"
                        placeholder="Найти продукт..."
                        value="${escapeHTML(
                            typeof CURRENT_PRODUCT_SEARCH !==
                            "undefined"
                                ? CURRENT_PRODUCT_SEARCH
                                : ""
                        )}"
                    />

                </div>


                <div class="tabs">

                    ${renderTab(
                        "all",
                        "Все"
                    )}

                    ${renderTab(
                        "favorites",
                        "❤️ Любимые"
                    )}

                    ${renderTab(
                        "introduced",
                        "✓ Пробовали"
                    )}

                </div>


                <div class="category-scroll">

                    ${renderProductCategory(
                        "all",
                        "Все"
                    )}

                    ${renderProductCategory(
                        "овощ",
                        "🥕 Овощи"
                    )}

                    ${renderProductCategory(
                        "фрукт",
                        "🍎 Фрукты"
                    )}

                    ${renderProductCategory(
                        "каша",
                        "🥣 Каши"
                    )}

                    ${renderProductCategory(
                        "мясо",
                        "🥩 Мясо"
                    )}

                    ${renderProductCategory(
                        "рыба",
                        "🐟 Рыба"
                    )}

                    ${renderProductCategory(
                        "яйцо",
                        "🥚 Яйцо"
                    )}

                    ${renderProductCategory(
                        "молочное",
                        "🥛 Молочное"
                    )}

                </div>


                <div class="products-grid">

                    ${
                        products.length
                            ? products
                                .map(
                                    product =>
                                        renderProductCard(
                                            product
                                        )
                                )
                                .join("")
                            : emptyState(
                                "🥑",
                                "Ничего не нашли",
                                "Попробуйте изменить поиск или категорию."
                            )
                    }

                </div>

            </main>


            ${renderBottomNavigation(
                "products"
            )}

        </div>
    `;
}


/* ============================================================
   PRODUCT CARD
   ============================================================ */

function renderProductCard(
    product
) {

    const isFavorite =
        STATE.products.favorites
            .includes(
                product.id
            );


    const introduced =
        STATE.products.introduced
            .some(
                item =>
                    (
                        typeof item ===
                        "object"
                            ? item.id
                            : item
                    ) ===
                    product.id
            );


    return `

        <article
            class="product-card"
            data-action="open-product"
            data-product-id="${escapeHTML(
                product.id
            )}">

            <div class="product-card-top">

                <span class="product-emoji">
                    ${product.emoji || "🥣"}
                </span>


                <button
                    type="button"
                    class="favorite-button ${
                        isFavorite
                            ? "active"
                            : ""
                    }"
                    data-action="toggle-favorite"
                    data-product-id="${escapeHTML(
                        product.id
                    )}"
                    onclick="event.stopPropagation()">

                    ${
                        isFavorite
                            ? "♥"
                            : "♡"
                    }

                </button>

            </div>


            <h3>
                ${escapeHTML(
                    product.name
                )}
            </h3>


            <div class="product-tags">

                ${
                    product.min_age
                        ? `
                            <span>
                                ${product.min_age}+ мес.
                            </span>
                          `
                        : ""
                }


                ${
                    product.iron
                        ? `
                            <span>
                                🩸 Железо
                            </span>
                          `
                        : ""
                }


                ${
                    product.allergen
                        ? `
                            <span>
                                ⚠️ Аллерген
                            </span>
                          `
                        : ""
                }

            </div>


            ${
                introduced
                    ? `
                        <div class="introduced-label">
                            ✓ Уже пробовали
                        </div>
                      `
                    : ""
            }

        </article>
    `;
}


/* ============================================================
   PRODUCT TABS
   ============================================================ */

function renderTab(
    tab,
    label
) {

    const active =
        (
            typeof CURRENT_PRODUCTS_TAB !==
            "undefined"
                ? CURRENT_PRODUCTS_TAB
                : "all"
        ) === tab;


    return `

        <button
            type="button"
            class="tab-button ${
                active
                    ? "active"
                    : ""
            }"
            data-action="products-tab"
            data-tab="${tab}">

            ${label}

        </button>
    `;
}


/* ============================================================
   PRODUCT CATEGORY
   ============================================================ */

function renderProductCategory(
    category,
    label
) {

    const active =
        (
            typeof CURRENT_PRODUCT_CATEGORY !==
            "undefined"
                ? CURRENT_PRODUCT_CATEGORY
                : "all"
        ) === category;


    return `

        <button
            type="button"
            class="category-chip ${
                active
                    ? "active"
                    : ""
            }"
            data-action="product-category"
            data-category="${category}">

            ${label}

        </button>
    `;
}


/* ============================================================
   DIARY
   ============================================================ */

function renderDiary() {

    const app =
        document.getElementById("app");


    const diary =
        [...(
            STATE.diary || []
        )]
        .sort(
            (a, b) =>
                String(b.date)
                    .localeCompare(
                        String(a.date)
                    )
        );


    app.innerHTML = `

        <div class="screen diary-screen">

            ${renderPageHeader(
                "Дневник",
                "История питания малыша"
            )}


            <main class="page-content">

                <button
                    class="primary-button full-width"
                    data-action="add-diary">

                    + Добавить продукт

                </button>


                <div class="diary-toolbar">

                    <button
                        data-action="diary-calendar">

                        📅 Календарь

                    </button>


                    <button
                        data-action="diary-filter">

                        ⚙ Фильтр

                    </button>

                </div>


                ${
                    diary.length
                        ? renderDiaryEntries(
                            diary
                        )
                        : emptyState(
                            "📖",
                            "Дневник пока пуст",
                            "Добавьте первый продукт малыша."
                        )
                }

            </main>


            ${renderBottomNavigation(
                "diary"
            )}

        </div>
    `;
}


/* ============================================================
   DIARY ENTRIES
   ============================================================ */

function renderDiaryEntries(
    entries
) {

    return `

        <div class="diary-list">

            ${entries
                .map(
                    entry =>
                        renderDiaryEntry(
                            entry
                        )
                )
                .join("")
            }

        </div>
    `;
}


function renderDiaryEntry(
    entry
) {

    return `

        <article
            class="diary-entry">

            <div class="diary-entry-icon">
                ${entry.source === "store"
                    ? "🛒"
                    : "🥣"}
            </div>


            <div class="diary-entry-content">

                <div
                    class="diary-entry-header">

                    <strong>
                        ${escapeHTML(
                            entry.productName ||
                            "Продукт"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            entry.time || ""
                        )}
                    </span>

                </div>


                ${
                    entry.brand
                        ? `
                            <small>
                                ${escapeHTML(
                                    entry.brand
                                )}
                            </small>
                          `
                        : ""
                }


                <div
                    class="diary-entry-meta">

                    ${
                        entry.amount
                            ? `${entry.amount} г`
                            : ""
                    }


                    ${
                        entry.preparation
                            ? ` · ${escapeHTML(
                                entry.preparation
                            )}`
                            : ""
                    }


                    ${
                        entry.liked === true
                            ? " · ❤️ понравилось"
                            : entry.liked === false
                                ? " · 🤍 не понравилось"
                                : ""
                    }

                </div>

            </div>


            <button
                class="icon-button"
                data-action="edit-diary"
                data-entry-id="${escapeHTML(
                    entry.id
                )}">

                ⋯

            </button>

        </article>
    `;
}


/* ============================================================
   RECIPES
   ============================================================ */

function renderRecipes() {

    const app =
        document.getElementById("app");


    let recipes =
        typeof RECIPES !== "undefined"
            ? [...RECIPES]
            : [];


    const search =
        window.CURRENT_RECIPE_SEARCH ||
        "";


    if (search) {

        recipes =
            recipes.filter(
                recipe =>
                    String(
                        recipe.name || ""
                    )
                        .toLowerCase()
                        .includes(
                            search
                        )
            );
    }


    app.innerHTML = `

        <div class="screen recipes-screen">

            ${renderPageHeader(
                "Рецепты",
                "Идеи блюд по возрасту"
            )}


            <main class="page-content">

                <div class="search-box">

                    🔎

                    <input
                        id="recipe-search"
                        type="search"
                        placeholder="Найти рецепт..."
                        value="${escapeHTML(
                            search
                        )}"
                    />

                </div>


                <div class="category-scroll">

                    <button
                        class="category-chip active"
                        data-action="recipe-category"
                        data-category="all">

                        Все

                    </button>

                </div>


                <div class="recipes-grid">

                    ${
                        recipes.length
                            ? recipes
                                .map(
                                    recipe =>
                                        renderRecipeCard(
                                            recipe
                                        )
                                )
                                .join("")
                            : emptyState(
                                "🍲",
                                "Рецептов пока нет",
                                "Добавим полноценную базу рецептов следующим этапом."
                            )
                    }

                </div>

            </main>


            ${renderBottomNavigation(
                "recipes"
            )}

        </div>
    `;
}


/* ============================================================
   RECIPE CARD
   ============================================================ */

function renderRecipeCard(
    recipe
) {

    return `

        <article class="recipe-card">

            <div class="recipe-image">
                ${recipe.emoji || "🍲"}
            </div>


            <div class="recipe-body">

                <h3>
                    ${escapeHTML(
                        recipe.name ||
                        "Рецепт"
                    )}
                </h3>


                ${
                    recipe.age
                        ? `
                            <span>
                                ${escapeHTML(
                                    String(
                                        recipe.age
                                    )
                                )}
                            </span>
                          `
                        : ""
                }


                ${
                    recipe.desc
                        ? `
                            <p>
                                ${escapeHTML(
                                    recipe.desc
                                )}
                            </p>
                          `
                        : ""
                }

            </div>

        </article>
    `;
}


/* ============================================================
   TODAY
   ============================================================ */

function renderToday() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="screen today-screen">

            ${renderPageHeader(
                "Сегодня",
                "План прикорма"
            )}


            <main class="page-content">

                <div class="date-navigation">

                    <button
                        data-action="previous-day">

                        ‹

                    </button>


                    <button
                        data-action="select-date">

                        📅

                        <span id="today-date">
                            Сегодня
                        </span>

                    </button>


                    <button
                        data-action="next-day">

                        ›

                    </button>

                </div>


                <div
                    id="daily-plan-container">

                    ${
                        typeof renderDailyPlan ===
                        "function"
                            ? renderDailyPlan(
                                formatDate(
                                    new Date()
                                )
                            )
                            : `
                                ${emptyState(
                                    "🌸",
                                    "План пока не сформирован",
                                    "Добавьте профиль малыша."
                                )}
                              `
                    }

                </div>

            </main>


            ${renderBottomNavigation(
                "today"
            )}

        </div>
    `;
}


/* ============================================================
   BABY
   ============================================================ */

function renderBaby() {

    const app =
        document.getElementById("app");


    const baby =
        STATE.baby || {};


    app.innerHTML = `

        <div class="screen baby-screen">

            ${renderPageHeader(
                "Малыш",
                "Профиль и настройки прикорма"
            )}


            <main class="page-content">

                <section class="baby-profile-card">

                    <div class="baby-avatar large">
                        🐣
                    </div>


                    <div>

                        <h2>
                            ${escapeHTML(
                                baby.name ||
                                "Малыш"
                            )}
                        </h2>

                        <p>
                            ${getBabyAgeText()}
                        </p>

                    </div>


                    <button
                        class="icon-button"
                        data-action="edit-baby">

                        ✏️

                    </button>

                </section>


                <section class="settings-list">

                    <button
                        class="settings-row"
                        data-action="settings"
                        data-setting="feeding-type">

                        <span>
                            🍼
                        </span>

                        <div>

                            <strong>
                                Тип кормления
                            </strong>

                            <small>
                                ${escapeHTML(
                                    baby.feedingType ||
                                    "Не указан"
                                )}
                            </small>

                        </div>

                        <span>
                            ›
                        </span>

                    </button>


                    <button
                        class="settings-row"
                        data-action="settings"
                        data-setting="prikorm-start">

                        <span>
                            📅
                        </span>

                        <div>

                            <strong>
                                Начало прикорма
                            </strong>

                            <small>
                                ${escapeHTML(
                                    baby.prikormStart ||
                                    "Не указано"
                                )}
                            </small>

                        </div>

                        <span>
                            ›
                        </span>

                    </button>


                    <button
                        class="settings-row"
                        data-action="settings"
                        data-setting="approach">

                        <span>
                            🥄
                        </span>

                        <div>

                            <strong>
                                Подход к прикорму
                            </strong>

                            <small>
                                Можно настроить
                            </small>

                        </div>

                        <span>
                            ›
                        </span>

                    </button>


                    <button
                        class="settings-row"
                        data-action="settings"
                        data-setting="readiness">

                        <span>
                            ✓
                        </span>

                        <div>

                            <strong>
                                Готовность к прикорму
                            </strong>

                            <small>
                                Проверить признаки готовности
                            </small>

                        </div>

                        <span>
                            ›
                        </span>

                    </button>

                </section>

            </main>


            ${renderBottomNavigation(
                "baby"
            )}

        </div>
    `;
}


/* ============================================================
   SETTINGS
   ============================================================ */

function renderSettings() {

    const app =
        document.getElementById("app");


    app.innerHTML = `

        <div class="screen settings-screen">

            ${renderPageHeader(
                "Настройки",
                "Приложение и данные"
            )}


            <main class="page-content">

                <section class="settings-list">

                    <button
                        class="settings-row"
                        data-action="settings"
                        data-setting="notifications">

                        <span>🔔</span>

                        <div>

                            <strong>
                                Уведомления
                            </strong>

                            <small>
                                Напоминания о прикорме
                            </small>

                        </div>

                        <span>
                            ›
                        </span>

                    </button>


                    <button
                        class="settings-row"
                        data-action="settings"
                        data-setting="theme">

                        <span>🎨</span>

                        <div>

                            <strong>
                                Оформление
                            </strong>

                            <small>
                                Светлая / тёмная тема
                            </small>

                        </div>

                        <span>
                            ›
                        </span>

                    </button>


                    <button
                        class="settings-row danger"
                        data-action="reset-data">

                        <span>🗑️</span>

                        <div>

                            <strong>
                                Сбросить данные
                            </strong>

                            <small>
                                Удалить данные прикорма
                            </small>

                        </div>

                    </button>

                </section>

            </main>


            ${renderBottomNavigation(
                "settings"
            )}

        </div>
    `;
}


/* ============================================================
   PAGE HEADER
   ============================================================ */

function renderPageHeader(
    title,
    subtitle
) {

    return `

        <header class="page-header">

            <div>

                <h1>
                    ${escapeHTML(
                        title
                    )}
                </h1>

                <p>
                    ${escapeHTML(
                        subtitle
                    )}
                </p>

            </div>


            <button
                class="icon-button"
                data-action="navigate"
                data-screen="home">

                ←

            </button>

        </header>
    `;
}


/* ============================================================
   BOTTOM NAVIGATION
   ============================================================ */

function renderBottomNavigation(
    active
) {

    const items = [

        {
            id: "home",
            icon: "⌂",
            label: "Главная"
        },

        {
            id: "products",
            icon: "🥑",
            label: "Продукты"
        },

        {
            id: "today",
            icon: "📅",
            label: "Сегодня"
        },

        {
            id: "diary",
            icon: "📖",
            label: "Дневник"
        },

        {
            id: "baby",
            icon: "🐣",
            label: "Малыш"
        }

    ];


    return `

        <nav class="bottom-navigation">

            ${items
                .map(
                    item => `

                        <button
                            class="nav-item ${
                                active === item.id
                                    ? "active"
                                    : ""
                            }"
                            data-action="navigate"
                            data-screen="${item.id}">

                            <span>
                                ${item.icon}
                            </span>

                            <small>
                                ${item.label}
                            </small>

                        </button>

                    `
                )
                .join("")
            }

        </nav>
    `;
}


/* ============================================================
   EMPTY STATE
   ============================================================ */

function emptyState(
    icon,
    title,
    text
) {

    return `

        <div class="empty-state">

            <div class="empty-icon">
                ${icon}
            </div>

            <h3>
                ${escapeHTML(
                    title
                )}
            </h3>

            <p>
                ${escapeHTML(
                    text
                )}
            </p>

        </div>
    `;
}


/* ============================================================
   BABY AGE
   ============================================================ */

function getBabyAgeText() {

    const baby =
        STATE.baby || {};


    if (
        baby.ageMonths !==
        undefined
    ) {

        const months =
            Number(
                baby.ageMonths || 0
            );


        const days =
            Number(
                baby.ageDays || 0
            );


        if (months) {

            return `${months} мес.${
                days
                    ? ` ${days} дн.`
                    : ""
            }`;
        }
    }


    if (
        baby.birthDate &&
        typeof calcAge ===
        "function"
    ) {

        const age =
            calcAge(
                baby.birthDate
            );


        return `${age.months || 0} мес.${
            age.days
                ? ` ${age.days} дн.`
                : ""
        }`;
    }


    return "Возраст не указан";
}


/* ============================================================
   PROFILE UI
   ============================================================ */

function updateProfileUI() {

    /*
       Эта функция намеренно безопасная.
       Она не ломает приложение,
       если конкретного элемента пока нет.
    */

    const nameElements =
        document.querySelectorAll(
            "[data-baby-name]"
        );


    nameElements.forEach(
        element => {

            element.textContent =
                STATE.baby?.name ||
                "Малыш";
        }
    );
}


/* ============================================================
   EXPORT
   ============================================================ */

window.render =
    render;

window.renderHome =
    renderHome;

window.renderProducts =
    renderProducts;

window.renderProductCard =
    renderProductCard;

window.renderDiary =
    renderDiary;

window.renderRecipes =
    renderRecipes;

window.renderToday =
    renderToday;

window.renderBaby =
    renderBaby;

window.renderSettings =
    renderSettings;

window.renderBottomNavigation =
    renderBottomNavigation;