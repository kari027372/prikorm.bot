/* ============================================================
   handlers.js
   Все интерактивные действия приложения
   ============================================================ */


/* ============================================================
   ОСНОВНОЙ LISTENER
   ============================================================ */

function setupEventListeners() {

    document.addEventListener(
        "click",
        handleDocumentClick
    );


    document.addEventListener(
        "input",
        handleDocumentInput
    );


    document.addEventListener(
        "change",
        handleDocumentChange
    );


    /*
       Закрытие модалки по Escape
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();
            }
        }
    );


    /*
       Если состояние изменилось —
       обновляем интерфейс.
    */

    window.addEventListener(
        "prikorm:statechange",
        () => {

            updateProfileUI();

            if (
                typeof render ===
                "function"
            ) {

                render(
                    STATE.ui?.screen ||
                    "home"
                );
            }
        }
    );
}


/* ============================================================
   CLICK
   ============================================================ */

function handleDocumentClick(
    event
) {

    const target =
        event.target.closest(
            "[data-action]"
        );


    if (!target) {
        return;
    }


    const action =
        target.dataset.action;


    /*
       Не даём клику по внутренним
       элементам модалки закрывать её.
    */

    if (
        target.hasAttribute(
            "data-modal-content"
        )
    ) {

        return;
    }


    switch (action) {


        /* ------------------------------------------------------
           NAVIGATION
           ------------------------------------------------------ */

        case "navigate":

            navigateHandler(
                target.dataset.screen
            );

            break;


        case "back":

            showScreen(
                "home"
            );

            break;


        /* ------------------------------------------------------
           BABY
           ------------------------------------------------------ */

        case "open-baby":

            showScreen(
                "baby"
            );

            break;


        case "edit-baby":

            openBabyEditModal();

            break;


        /* ------------------------------------------------------
           FOOD
           ------------------------------------------------------ */

        case "add-food":

            openAddFoodModal();

            break;


        case "open-product":

            openProductFromCard(
                target.dataset.productId
            );

            break;


        case "choose-product":

            // УСЛОВНЫЙ ВЫЗОВ openProductPicker
            if (typeof openProductPicker === 'function') {
                openProductPicker();
            } else {
                showToast('Функция выбора продукта временно недоступна');
            }
            break;


        case "toggle-favorite":

            toggleFavoriteHandler(
                target.dataset.productId
            );

            break;


        case "products-tab":

            changeProductsTab(
                target.dataset.tab
            );

            break;


        case "product-category":

            changeProductCategory(
                target.dataset.category,
                target
            );

            break;


        case "clear-search":

            clearProductSearch();

            break;


        /* ------------------------------------------------------
           FOOD SOURCE
           ------------------------------------------------------ */

        case "food-source":

            changeFoodSource(
                target.dataset.source
            );

            break;


        case "set-liked":

            setLikedHandler(
                target.dataset.liked ===
                "true",
                target
            );

            break;


        case "save-food":

            saveFoodHandler();

            break;


        case "scan-label":

            showToast(
                "Фото этикетки можно добавить после подключения камеры.",
                "default"
            );

            break;


        /* ------------------------------------------------------
           DIARY
           ------------------------------------------------------ */

        case "add-diary":

            openDiaryAddModal();

            break;


        case "edit-diary":

            openDiaryEditModal(
                target.dataset.entryId
            );

            break;


        case "diary-filter":

            openDiaryFilter();

            break;


        case "diary-calendar":

            openDiaryCalendar();

            break;


        /* ------------------------------------------------------
           TODAY (ПЛАН)
           ------------------------------------------------------ */

        case "previous-day":
            if (typeof CURRENT_DATE !== 'undefined') {
                CURRENT_DATE = new Date(CURRENT_DATE);
                CURRENT_DATE.setDate(CURRENT_DATE.getDate() - 1);
                render('today');
            } else {
                showToast('Ошибка: дата не определена', 'error');
            }
            break;


        case "next-day":
            if (typeof CURRENT_DATE !== 'undefined') {
                CURRENT_DATE = new Date(CURRENT_DATE);
                CURRENT_DATE.setDate(CURRENT_DATE.getDate() + 1);
                render('today');
            } else {
                showToast('Ошибка: дата не определена', 'error');
            }
            break;


        case "select-date":
            openDatePicker();
            break;


        case "add-meal":
            showToast('Форма добавления приёма пищи откроется в следующем обновлении', 'default');
            break;


        case "remove-meal":
            const idx = parseInt(target.dataset.index);
            const dateStr = (typeof CURRENT_DATE !== 'undefined') ? CURRENT_DATE.toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
            if (!isNaN(idx) && typeof removeMealFromPlan === 'function') {
                removeMealFromPlan(dateStr, idx);
                render('today');
            } else {
                showToast('Ошибка удаления', 'error');
            }
            break;


        /* ------------------------------------------------------
           RECIPES
           ------------------------------------------------------ */

        case "recipe-category":

            changeRecipeCategory(
                target.dataset.category,
                target
            );

            break;


        /* ------------------------------------------------------
           SETTINGS
           ------------------------------------------------------ */

        case "settings":

            openSetting(
                target.dataset.setting
            );

            break;


        case "reset-data":

            confirmReset();

            break;


        /* ------------------------------------------------------
           SAVE BABY (из модалки)
           ------------------------------------------------------ */

        case "save-baby":
            const name = document.getElementById('baby-name')?.value?.trim();
            const birthDate = document.getElementById('baby-birth')?.value;
            const feedingType = document.getElementById('baby-feeding')?.value;
            if (name || birthDate || feedingType) {
                const age = birthDate ? calcAge(birthDate) : { months:0, days:0 };
                if (typeof updateBaby === 'function') {
                    updateBaby({ name, birthDate, feedingType, ageMonths: age.months, ageDays: age.days });
                    closeModal();
                    render('baby');
                    showToast('Профиль сохранён', 'success');
                } else {
                    showToast('Ошибка: updateBaby не найдена', 'error');
                }
            } else {
                showToast('Заполните хотя бы одно поле', 'error');
            }
            break;


        /* ------------------------------------------------------
           MODAL
           ------------------------------------------------------ */

        case "close-modal":

            /*
               Закрываем только если кликнули
               непосредственно по overlay
            */

            if (
                target.classList.contains(
                    "modal-overlay"
                ) ||
                target.classList.contains(
                    "icon-button"
                )
            ) {

                closeModal();
            }

            break;
    }
}


/* ============================================================
   INPUT
   ============================================================ */

function handleDocumentInput(
    event
) {

    const id =
        event.target.id;


    switch (id) {


        case "product-search":

            searchProducts(
                event.target.value
            );

            break;


        case "picker-search":

            searchProductPicker(
                event.target.value
            );

            break;


        case "recipe-search":

            searchRecipes(
                event.target.value
            );

            break;
    }
}


/* ============================================================
   CHANGE
   ============================================================ */

function handleDocumentChange(
    event
) {

    const target =
        event.target;


    if (
        target.id ===
        "food-new-product"
    ) {

        return;
    }


    if (
        target.id ===
        "food-preparation"
    ) {

        return;
    }


    if (
        target.id ===
        "food-form"
    ) {

        return;
    }
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function navigateHandler(
    screen
) {

    if (!screen) {
        return;
    }


    showScreen(
        screen
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ============================================================
   PRODUCT
   ============================================================ */

function getProductById(
    id
) {

    if (
        !id ||
        typeof PRODUCTS ===
        "undefined"
    ) {

        return null;
    }


    return PRODUCTS.find(
        product =>
            String(
                product.id
            ) ===
            String(id)
    ) || null;
}


function getProductByName(
    name
) {

    if (
        !name ||
        typeof PRODUCTS ===
        "undefined"
    ) {

        return null;
    }


    return PRODUCTS.find(
        product =>
            String(
                product.name
            ).toLowerCase() ===
            String(name).toLowerCase()
    ) || null;
}


function openProductFromCard(
    productId
) {

    const product =
        getProductById(
            productId
        );


    if (!product) {

        showToast(
            "Продукт пока не найден в базе.",
            "error"
        );

        return;
    }


    openProductDetails(
        product
    );
}


/* ============================================================
   PRODUCT DETAILS
   ============================================================ */

function openProductDetails(
    product
) {

    const root =
        document.getElementById(
            "modal-root"
        );


    if (!root) {
        return;
    }


    const safety =
        typeof getSafetyWarning ===
        "function"
            ? getSafetyWarning(
                product.name
            )
            : null;


    const introduced =
        STATE.products
            .introduced
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
                            class="product-large-emoji">

                            ${
                                product.emoji ||
                                "🥣"
                            }

                        </span>

                        <h2>
                            ${escapeHTML(
                                product.name
                            )}
                        </h2>

                    </div>

                    <button
                        type="button"
                        class="icon-button"
                        data-action="close-modal">

                        ×

                    </button>

                </div>


                <div
                    class="modal-body">

                    <div
                        class="product-info-grid">

                        <div>
                            <span>
                                Категория
                            </span>

                            <strong>
                                ${escapeHTML(
                                    product.cat ||
                                    product.category ||
                                    "—"
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Возраст
                            </span>

                            <strong>
                                ${
                                    product.min_age
                                        ? `${product.min_age}+ мес.`
                                        : "—"
                                }
                            </strong>
                        </div>


                        <div>
                            <span>
                                Железо
                            </span>

                            <strong>
                                ${
                                    product.iron
                                        ? "✓"
                                        : "—"
                                }
                            </strong>
                        </div>

                    </div>


                    ${
                        product.desc
                            ? `
                                <div
                                    class="info-block">

                                    <h3>
                                        О продукте
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            product.desc
                                        )}
                                    </p>

                                </div>
                              `
                            : ""
                    }


                    ${
                        safety
                            ? `
                                <div
                                    class="warning-block">

                                    <strong>
                                        ⚠️ Безопасность
                                    </strong>

                                    <p>
                                        ${escapeHTML(
                                            safety.warning ||
                                            safety
                                        )}
                                    </p>

                                </div>
                              `
                            : ""
                    }


                    ${
                        product.allergen
                            ? `
                                <div
                                    class="warning-block">

                                    <strong>
                                        ⚠️ Аллерген
                                    </strong>

                                    <p>
                                        Вводите продукт
                                        внимательно и
                                        наблюдайте за
                                        реакцией малыша.
                                    </p>

                                </div>
                              `
                            : ""
                    }


                    <div
                        class="modal-actions">

                        ${
                            introduced
                                ? `
                                    <div
                                        class="success-box">

                                        ✓ Этот продукт
                                        уже знаком малышу

                                    </div>
                                  `
                                : `
                                    <button
                                        type="button"
                                        class="primary-button full-width"
                                        data-action="add-food"
                                        data-product-id="${escapeHTML(
                                            product.id
                                        )}">

                                        + Добавить продукт

                                    </button>
                                  `
                        }

                    </div>

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   FAVORITES
   ============================================================ */

function toggleFavoriteHandler(
    productId
) {

    if (!productId) {
        return;
    }


    toggleFavoriteProduct(
        productId
    );


    const isFavorite =
        STATE.products.favorites
            .includes(
                productId
            );


    showToast(
        isFavorite
            ? "Добавлено в любимые ❤️"
            : "Убрано из любимых",
        "success"
    );


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts();
    }
}


/* ============================================================
   PRODUCTS TABS
   ============================================================ */

let CURRENT_PRODUCTS_TAB =
    "all";


function changeProductsTab(
    tab
) {

    CURRENT_PRODUCTS_TAB =
        tab ||
        "all";


    document
        .querySelectorAll(
            ".product-tab"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.tab ===
                    CURRENT_PRODUCTS_TAB
                );
            }
        );


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts();
    }
}


/* ============================================================
   PRODUCT CATEGORY
   ============================================================ */

let CURRENT_PRODUCT_CATEGORY =
    "all";


function changeProductCategory(
    category,
    clickedButton
) {

    CURRENT_PRODUCT_CATEGORY =
        category ||
        "all";


    document
        .querySelectorAll(
            "[data-action='product-category']"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                    CURRENT_PRODUCT_CATEGORY
                );
            }
        );


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts();
    }
}


/* ============================================================
   SEARCH PRODUCTS
   ============================================================ */

let CURRENT_PRODUCT_SEARCH =
    "";


function searchProducts(
    value
) {

    CURRENT_PRODUCT_SEARCH =
        String(
            value || ""
        ).trim().toLowerCase();


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts();
    }
}


function clearProductSearch() {

    const input =
        document.getElementById(
            "product-search"
        );


    if (input) {

        input.value = "";
    }


    CURRENT_PRODUCT_SEARCH =
        "";


    if (
        typeof renderProducts ===
        "function"
    ) {

        renderProducts();
    }
}


/* ============================================================
   FOOD SOURCE
   ============================================================ */

let CURRENT_FOOD_SOURCE =
    "homemade";


function changeFoodSource(
    source
) {

    CURRENT_FOOD_SOURCE =
        source ||
        "homemade";


    document
        .querySelectorAll(
            "[data-action='food-source']"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.source ===
                    CURRENT_FOOD_SOURCE
                );
            }
        );


    const storeFields =
        document.getElementById(
            "store-fields"
        );


    const homemadeFields =
        document.getElementById(
            "homemade-fields"
        );


    if (storeFields) {

        storeFields.hidden =
            CURRENT_FOOD_SOURCE !==
            "store";
    }


    if (homemadeFields) {

        homemadeFields.hidden =
            CURRENT_FOOD_SOURCE !==
            "homemade";
    }
}


/* ============================================================
   LIKE
   ============================================================ */

let CURRENT_LIKED =
    null;


function setLikedHandler(
    liked,
    clicked
) {

    CURRENT_LIKED =
        liked;


    document
        .querySelectorAll(
            "[data-action='set-liked']"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.liked ===
                    String(liked)
                );
            }
        );
}


/* ============================================================
   SAVE FOOD
   ============================================================ */

function saveFoodHandler() {

    const productId =
        document.getElementById(
            "food-product-id"
        )?.value;


    const product =
        getProductById(
            productId
        );


    /*
       Если продукт выбран из базы.
    */

    const customName =
        document.getElementById(
            "food-product-title"
        )?.value?.trim();


    const productName =
        product?.name ||
        customName;


    if (!productName) {

        showToast(
            "Сначала выберите или укажите продукт.",
            "error"
        );

        return;
    }


    const amount =
        document.getElementById(
            "food-amount"
        )?.value;


    const form =
        document.getElementById(
            "food-form"
        )?.value;


    const preparation =
        document.getElementById(
            "food-preparation"
        )?.value;


    const notes =
        document.getElementById(
            "food-notes"
        )?.value?.trim();


    const brand =
        document.getElementById(
            "food-brand"
        )?.value?.trim();


    const packageSize =
        document.getElementById(
            "food-package-size"
        )?.value;


    const ingredients =
        document.getElementById(
            "food-ingredients"
        )?.value?.trim();


    const isNew =
        document.getElementById(
            "food-new-product"
        )?.checked;


    const entry = {

        id:
            `diary_${Date.now()}`,

        date:
            new Date()
                .toISOString()
                .slice(0, 10),

        time:
            new Date()
                .toLocaleTimeString(
                    "ru-RU",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                ),

        productId:
            product?.id ||
            null,

        productName,

        source:
            CURRENT_FOOD_SOURCE,

        brand:
            CURRENT_FOOD_SOURCE ===
            "store"
                ? brand || ""
                : "",

        packageSize:
            packageSize
                ? Number(packageSize)
                : null,

        ingredients:
            CURRENT_FOOD_SOURCE ===
            "store"
                ? ingredients || ""
                : "",

        preparation:
            CURRENT_FOOD_SOURCE ===
            "homemade"
                ? preparation || ""
                : "",

        amount:
            amount
                ? Number(amount)
                : null,

        unit:
            "г",

        servingForm:
            form || "",

        liked:
            CURRENT_LIKED,

        isNewProduct:
            Boolean(isNew),

        notes:
            notes || "",

        hasReaction:
            false,

        reaction:
            null,

        createdAt:
            new Date()
                .toISOString()
    };


    updateState(
        state => {

            state.diary.push(
                entry
            );


            if (
                isNew &&
                product?.id
            ) {

                const exists =
                    state.products
                        .introduced
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


                if (!exists) {

                    state.products
                        .introduced
                        .push({

                            id:
                                product.id,

                            name:
                                product.name,

                            introducedAt:
                                entry.date
                        });
                }
            }


            if (
                CURRENT_FOOD_SOURCE ===
                "store" &&
                brand
            ) {

                const exists =
                    state.brands.some(
                        item =>
                            String(item)
                                .toLowerCase() ===
                            brand.toLowerCase()
                    );


                if (!exists) {

                    state.brands.push(
                        brand
                    );
                }
            }
        }
    );


    closeModal();


    CURRENT_LIKED =
        null;


    showToast(
        "Запись добавлена в дневник ❤️",
        "success"
    );


    showScreen(
        "diary"
    );
}


/* ============================================================
   PRODUCT PICKER
   ============================================================ */

function renderProductPicker(
    query = ""
) {

    const container =
        document.getElementById(
            "picker-products"
        );


    if (!container) {
        return;
    }


    if (
        typeof PRODUCTS ===
        "undefined"
    ) {

        container.innerHTML =
            emptyState(
                "🥑",
                "База продуктов не подключена",
                "Добавьте данные PRODUCTS."
            );

        return;
    }


    const normalized =
        String(
            query || ""
        ).trim().toLowerCase();


    const list =
        PRODUCTS.filter(
            product => {

                if (!normalized) {
                    return true;
                }


                return String(
                    product.name || ""
                )
                    .toLowerCase()
                    .includes(
                        normalized
                    );
            }
        );


    if (!list.length) {

        container.innerHTML =
            emptyState(
                "🔎",
                "Ничего не найдено",
                "Попробуйте другое название."
            );

        return;
    }


    container.innerHTML =
        list
            .slice(0, 100)
            .map(
                product => `

                    <button
                        type="button"
                        class="picker-product"
                        data-action="select-product"
                        data-product-id="${escapeHTML(
                            product.id
                        )}">

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

                        <span>
                            ${icon("arrow")}
                        </span>

                    </button>

                `
            )
            .join("");
}


function searchProductPicker(
    query
) {

    renderProductPicker(
        query
    );
}


/* ============================================================
   SELECT PRODUCT (обработчик выбора продукта)
   ============================================================ */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action='select-product']"
            );


        if (!button) {
            return;
        }


        const product =
            getProductById(
                button.dataset.productId
            );


        if (!product) {
            return;
        }


        closeModal();


        openAddFoodModal(
            product
        );
    }
);


/* ============================================================
   DIARY ADD
   ============================================================ */

function openDiaryAddModal() {

    openAddFoodModal();
}


/* ============================================================
   DIARY EDIT
   ============================================================ */

function openDiaryEditModal(
    entryId
) {

    const entry =
        STATE.diary.find(
            item =>
                String(item.id) ===
                String(entryId)
        );


    if (!entry) {

        showToast(
            "Запись не найдена.",
            "error"
        );

        return;
    }


    showToast(
        "Редактирование записи подключим в следующем слое.",
        "default"
    );
}


/* ============================================================
   DIARY FILTER
   ============================================================ */

function openDiaryFilter() {

    showToast(
        "Фильтры дневника готовы для подключения.",
        "default"
    );
}


/* ============================================================
   DIARY CALENDAR
   ============================================================ */

function openDiaryCalendar() {

    showToast(
        "Календарь дневника готов для подключения.",
        "default"
    );
}


/* ============================================================
   TODAY (ДАТА)
   ============================================================ */

let CURRENT_DATE =
    new Date();


function changeDay(
    direction
) {

    CURRENT_DATE =
        new Date(
            CURRENT_DATE
        );


    CURRENT_DATE.setDate(
        CURRENT_DATE.getDate() +
        direction
    );


    if (
        typeof renderDailyPlan ===
        "function"
    ) {

        renderDailyPlan(
            formatDate(
                CURRENT_DATE
            )
        );
    }


    updateTodayDate();
}


function formatDate(
    date
) {

    return date
        .toISOString()
        .slice(0, 10);
}


function updateTodayDate() {

    const element =
        document.getElementById(
            "today-date"
        );


    if (!element) {
        return;
    }


    const today =
        new Date();


    const current =
        formatDate(
            CURRENT_DATE
        );


    if (
        current ===
        formatDate(today)
    ) {

        element.textContent =
            "Сегодня";

        return;
    }


    element.textContent =
        CURRENT_DATE.toLocaleDateString(
            "ru-RU",
            {
                day: "numeric",
                month: "long"
            }
        );
}


function openDatePicker() {

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "date";


    input.value =
        formatDate(
            CURRENT_DATE
        );


    input.style.position =
        "fixed";

    input.style.opacity =
        "0";


    document.body.appendChild(
        input
    );


    input.addEventListener(
        "change",
        () => {

            if (
                input.value
            ) {

                CURRENT_DATE =
                    new Date(
                        `${input.value}T12:00:00`
                    );


                updateTodayDate();


                if (
                    typeof renderDailyPlan ===
                    "function"
                ) {

                    renderDailyPlan(
                        input.value
                    );
                }
            }


            input.remove();
        }
    );


    input.click();
}


/* ============================================================
   RECIPES
   ============================================================ */

let CURRENT_RECIPE_CATEGORY =
    "all";


function changeRecipeCategory(
    category
) {

    CURRENT_RECIPE_CATEGORY =
        category ||
        "all";


    document
        .querySelectorAll(
            "[data-action='recipe-category']"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                    CURRENT_RECIPE_CATEGORY
                );
            }
        );


    if (
        typeof renderRecipes ===
        "function"
    ) {

        renderRecipes();
    }
}


function searchRecipes(
    query
) {

    window.CURRENT_RECIPE_SEARCH =
        String(
            query || ""
        )
            .trim()
            .toLowerCase();


    if (
        typeof renderRecipes ===
        "function"
    ) {

        renderRecipes();
    }
}


/* ============================================================
   BABY EDIT
   ============================================================ */

function openBabyEditModal() {

    const baby =
        STATE.baby;


    const root =
        document.getElementById(
            "modal-root"
        );


    root.innerHTML = `

        <div
            class="modal-overlay"
            data-action="close-modal">

            <div
                class="modal-sheet"
                data-modal-content>

                <div
                    class="modal-header">

                    <h2>
                        Профиль малыша
                    </h2>

                    <button
                        type="button"
                        class="icon-button"
                        data-action="close-modal">

                        ×

                    </button>

                </div>


                <div
                    class="modal-body">

                    <label
                        class="form-label">

                        Имя малыша

                        <input
                            id="baby-name-input"
                            value="${escapeHTML(
                                baby.name || ""
                            )}"
                            placeholder="Имя"
                        />

                    </label>


                    <label
                        class="form-label">

                        Дата рождения

                        <input
                            id="baby-birth-input"
                            type="date"
                            value="${escapeHTML(
                                baby.birthDate || ""
                            )}"
                        />

                    </label>


                    <label
                        class="form-label">

                        Тип кормления

                        <select
                            id="baby-feeding-input">

                            <option
                                value="ГВ"
                                ${
                                    baby.feedingType ===
                                    "ГВ"
                                        ? "selected"
                                        : ""
                                }>

                                Грудное вскармливание

                            </option>

                            <option
                                value="ИВ"
                                ${
                                    baby.feedingType ===
                                    "ИВ"
                                        ? "selected"
                                        : ""
                                }>

                                Искусственное

                            </option>

                            <option
                                value="Смешанное"
                                ${
                                    baby.feedingType ===
                                    "Смешанное"
                                        ? "selected"
                                        : ""
                                }>

                                Смешанное

                            </option>

                        </select>

                    </label>


                    <button
                        type="button"
                        class="primary-button full-width"
                        data-action="save-baby">

                        Сохранить

                    </button>

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   SAVE BABY (уже есть обработчик в switch, но дублируем для надёжности)
   ============================================================ */

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                "[data-action='save-baby']"
            )
        ) {

            return;
        }


        const name =
            document.getElementById(
                "baby-name-input"
            )?.value.trim();


        const birthDate =
            document.getElementById(
                "baby-birth-input"
            )?.value;


        const feedingType =
            document.getElementById(
                "baby-feeding-input"
            )?.value;


        let ageMonths =
            0;

        let ageDays =
            0;


        if (
            birthDate &&
            typeof calcAge ===
            "function"
        ) {

            const age =
                calcAge(
                    birthDate
                );


            ageMonths =
                age.months || 0;

            ageDays =
                age.days || 0;
        }


        setBaby({

            name,

            birthDate,

            feedingType,

            ageMonths,

            ageDays
        });


        closeModal();


        updateProfileUI();


        showToast(
            "Профиль сохранён ❤️",
            "success"
        );


        showScreen(
            "baby"
        );
    }
);


/* ============================================================
   SETTINGS
   ============================================================ */

function openSetting(
    setting
) {

    switch (setting) {

        case "prikorm-start":

            showToast(
                "Дата начала прикорма",
                "default"
            );

            break;


        case "feeding-type":

            openBabyEditModal();

            break;


        case "approach":

            showToast(
                "Здесь будет выбор подхода к прикорму.",
                "default"
            );

            break;


        case "readiness":

            if (
                typeof openReadinessModal ===
                "function"
            ) {

                openReadinessModal();

            } else {

                showToast(
                    "Проверка готовности пока не подключена.",
                    "default"
                );
            }

            break;


        case "notifications":

            updateState(
                state => {

                    state.settings
                        .notifications =
                        !state.settings
                            .notifications;
                }
            );


            showToast(
                STATE.settings.notifications
                    ? "Уведомления включены 🔔"
                    : "Уведомления выключены",
                "success"
            );

            break;


        case "theme":

            if (
                typeof setTheme ===
                "function"
            ) {

                const current =
                    typeof getTheme ===
                    "function"
                        ? getTheme()
                        : "light";


                setTheme(
                    current === "light"
                        ? "dark"
                        : "light"
                );

            }

            break;
    }
}


/* ============================================================
   RESET
   ============================================================ */

function confirmReset() {

    const answer =
        window.confirm(
            "Удалить все данные прикорма? Это действие нельзя отменить."
        );


    if (!answer) {
        return;
    }


    resetState();


    showToast(
        "Данные удалены.",
        "success"
    );


    setTimeout(
        () => {

            location.reload();

        },
        300
    );
}


/* ============================================================
   EXPORT
   ============================================================ */

window.setupEventListeners =
    setupEventListeners;

window.handleDocumentClick =
    handleDocumentClick;

window.openProductDetails =
    openProductDetails;

window.openProductPicker =
    openProductPicker;

window.renderProductPicker =
    renderProductPicker;

window.saveFoodHandler =
    saveFoodHandler;

window.changeFoodSource =
    changeFoodSource;

window.searchProducts =
    searchProducts;

window.clearProductSearch =
    clearProductSearch;

window.changeProductsTab =
    changeProductsTab;

window.changeProductCategory =
    changeProductCategory;

window.openBabyEditModal =
    openBabyEditModal;

window.changeDay =
    changeDay;

window.openDatePicker =
    openDatePicker;