/* ============================================================
   handlers.js
   Полный обработчик приложения KENORA
   ============================================================ */

(function () {
    "use strict";

    /* ============================================================
       ЗАЩИТА ОТ ПОВТОРНОГО ПОДКЛЮЧЕНИЯ
       ============================================================ */

    if (window.__KENORA_HANDLERS_INITIALIZED__) {
        console.log("⚠️ handlers.js уже был инициализирован");
        return;
    }

    window.__KENORA_HANDLERS_INITIALIZED__ = true;


    /* ============================================================
       ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ
       ============================================================ */

    function setupEventListeners() {

        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("input", handleDocumentInput);
        document.addEventListener("change", handleDocumentChange);

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                if (typeof closeModal === "function") {
                    closeModal();
                }
            }
        });

        window.addEventListener("prikorm:statechange", function () {

            console.log(
                "📡 prikorm:statechange",
                "screen:",
                STATE.ui?.screen,
                "children:",
                STATE.children?.length
            );

            if (typeof updateProfileUI === "function") {
                updateProfileUI();
            }

            if (typeof render === "function") {

                var screen =
                    STATE.ui?.screen ||
                    STATE.navigation?.currentScreen ||
                    "home";

                console.log(
                    "📡 Перерисовываю экран:",
                    screen
                );

                render(screen);
            }
        });
    }


    /* ============================================================
       ОСНОВНОЙ ОБРАБОТЧИК КЛИКОВ
       ============================================================ */

    function handleDocumentClick(event) {

        var clickedElement = event.target;

        /* ========================================================
           1. DATA-ACTION
           ======================================================== */

        var target = clickedElement.closest
            ? clickedElement.closest("[data-action]")
            : null;

        if (target) {

            var action = target.dataset.action;

            if (target.hasAttribute("data-modal-content")) {
                return;
            }

            switch (action) {

                /* ------------------------------------------------
                   НАВИГАЦИЯ
                   ------------------------------------------------ */

                case "navigate":

                    if (typeof navigateHandler === "function") {
                        navigateHandler(target.dataset.screen);
                    }

                    break;


                case "back":

                    if (typeof showScreen === "function") {
                        showScreen("home");
                    }

                    break;


                case "open-baby":

                    if (typeof showScreen === "function") {
                        showScreen("baby");
                    }

                    break;


                /* ------------------------------------------------
                   МАЛЫШ
                   ------------------------------------------------ */

                case "edit-baby":

                    if (typeof openBabyEditModal === "function") {
                        openBabyEditModal();
                    }

                    break;


                case "open-add-child":

                    if (typeof showAddChildModal === "function") {
                        showAddChildModal();
                    }

                    break;


                case "switch-child": {

                    var switchId =
                        target.dataset.childId;

                    if (!switchId) {
                        break;
                    }

                    if (
                        typeof window.switchChild ===
                        "function"
                    ) {

                        STATE.ui.screen = "baby";
                        STATE.navigation.currentScreen =
                            "baby";

                        window.switchChild(switchId);
                    }

                    break;
                }


                case "delete-child": {

                    var deleteId =
                        target.dataset.childId;

                    if (!deleteId) {
                        break;
                    }

                    event.stopPropagation();

                    if (
                        !confirm(
                            "Удалить этого ребёнка? Все данные по нему будут потеряны."
                        )
                    ) {
                        break;
                    }

                    console.log(
                        "🗑️ Удаление ребёнка:",
                        deleteId
                    );

                    if (
                        typeof window.deleteChild ===
                        "function"
                    ) {

                        window.deleteChild(deleteId);

                    } else {

                        STATE.children =
                            STATE.children.filter(
                                function (child) {
                                    return child.id !== deleteId;
                                }
                            );

                        if (
                            STATE.currentChildId ===
                            deleteId
                        ) {

                            STATE.currentChildId =
                                STATE.children.length
                                    ? STATE.children[0].id
                                    : null;
                        }

                        if (
                            typeof saveState ===
                            "function"
                        ) {
                            saveState();
                        }

                        window.dispatchEvent(
                            new CustomEvent(
                                "prikorm:statechange"
                            )
                        );
                    }

                    break;
                }


                /* ------------------------------------------------
                   ПРОДУКТ
                   ------------------------------------------------ */

                case "open-product":

                    event.preventDefault();

                    openProductFromCard(
                        target.dataset.productId
                    );

                    break;


                case "choose-product":

                    if (
                        typeof openProductPicker ===
                        "function"
                    ) {

                        openProductPicker();

                    } else {

                        showToast(
                            "Функция выбора продукта временно недоступна"
                        );
                    }

                    break;


                case "toggle-favorite":

                    if (
                        typeof toggleFavoriteHandler ===
                        "function"
                    ) {

                        toggleFavoriteHandler(
                            target.dataset.productId
                        );
                    }

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


                /* ------------------------------------------------
                   ЕДА / ДНЕВНИК
                   ------------------------------------------------ */

                case "add-food":

                    if (
                        typeof openAddFoodModal ===
                        "function"
                    ) {

                        var foodProductId =
                            target.dataset.productId;

                        if (foodProductId) {

                            var selectedProduct =
                                getProductById(
                                    foodProductId
                                );

                            openAddFoodModal(
                                selectedProduct
                            );

                        } else {

                            openAddFoodModal();
                        }
                    }

                    break;


                case "food-source":

                    changeFoodSource(
                        target.dataset.source
                    );

                    break;


                case "set-liked":

                    setLikedHandler(
                        target.dataset.liked === "true",
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


                case "previous-day":

                    if (
                        typeof CURRENT_DATE !==
                        "undefined"
                    ) {

                        CURRENT_DATE =
                            new Date(CURRENT_DATE);

                        CURRENT_DATE.setDate(
                            CURRENT_DATE.getDate() - 1
                        );

                        render("today");
                    }

                    break;


                case "next-day":

                    if (
                        typeof CURRENT_DATE !==
                        "undefined"
                    ) {

                        CURRENT_DATE =
                            new Date(CURRENT_DATE);

                        CURRENT_DATE.setDate(
                            CURRENT_DATE.getDate() + 1
                        );

                        render("today");
                    }

                    break;


                case "select-date":

                    openDatePicker();

                    break;


                case "add-meal":

                    showToast(
                        "Форма добавления приёма пищи откроется в следующем обновлении",
                        "default"
                    );

                    break;


                case "remove-meal": {

                    var idx =
                        parseInt(
                            target.dataset.index
                        );

                    var dateStr =
                        typeof CURRENT_DATE !==
                        "undefined"

                            ? CURRENT_DATE
                                .toISOString()
                                .slice(0, 10)

                            : new Date()
                                .toISOString()
                                .slice(0, 10);

                    if (
                        !isNaN(idx) &&
                        typeof removeMealFromPlan ===
                        "function"
                    ) {

                        removeMealFromPlan(
                            dateStr,
                            idx
                        );

                        render("today");

                    } else {

                        showToast(
                            "Ошибка удаления",
                            "error"
                        );
                    }

                    break;
                }


                /* ------------------------------------------------
                   РЕЦЕПТЫ
                   ------------------------------------------------ */

                case "recipe-category":

                    changeRecipeCategory(
                        target.dataset.category
                    );

                    break;


                /* ------------------------------------------------
                   НАСТРОЙКИ
                   ------------------------------------------------ */

                case "settings":

                    openSetting(
                        target.dataset.setting
                    );

                    break;


                case "reset-data":

                    confirmReset();

                    break;


                /* ------------------------------------------------
                   СОХРАНЕНИЕ МАЛЫША
                   ------------------------------------------------ */

                case "save-baby": {

                    var name =
                        document.getElementById(
                            "baby-name-input"
                        )?.value?.trim() ||
                        document.getElementById(
                            "baby-name"
                        )?.value?.trim() ||
                        "";

                    var birthDate =
                        document.getElementById(
                            "baby-birth-input"
                        )?.value ||
                        document.getElementById(
                            "baby-birth"
                        )?.value ||
                        "";

                    var feedingType =
                        document.getElementById(
                            "baby-feeding-input"
                        )?.value ||
                        document.getElementById(
                            "baby-feeding"
                        )?.value ||
                        "";

                    if (
                        !name &&
                        !birthDate &&
                        !feedingType
                    ) {

                        showToast(
                            "Заполните хотя бы одно поле",
                            "error"
                        );

                        break;
                    }

                    var age = {
                        months: 0,
                        days: 0
                    };

                    if (
                        birthDate &&
                        typeof calcAge ===
                        "function"
                    ) {

                        age =
                            calcAge(
                                birthDate
                            );
                    }

                    STATE.ui.screen = "baby";

                    STATE.navigation.currentScreen =
                        "baby";

                    if (
                        typeof updateBaby ===
                        "function"
                    ) {

                        updateBaby({
                            name: name,
                            birthDate: birthDate,
                            feedingType:
                                feedingType,
                            ageMonths:
                                age.months || 0,
                            ageDays:
                                age.days || 0
                        });

                    } else if (
                        typeof setBaby ===
                        "function"
                    ) {

                        setBaby({
                            name: name,
                            birthDate: birthDate,
                            feedingType:
                                feedingType,
                            ageMonths:
                                age.months || 0,
                            ageDays:
                                age.days || 0
                        });
                    }

                    closeModal();

                    showToast(
                        "Профиль сохранён ❤️",
                        "success"
                    );

                    break;
                }


                /* ------------------------------------------------
                   МОДАЛКА
                   ------------------------------------------------ */

                case "close-modal":

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


                default:

                    break;
            }

            return;
        }


        /* ========================================================
           2. ПРЯМОЙ КЛИК ПО КАРТОЧКЕ ПРОДУКТА
           
           ЭТОТ БЛОК ОСТАВЛЯЕМ СПЕЦИАЛЬНО КАК ЗАПАСНОЙ.
           Даже если data-action НЕ добавился при рендере,
           картошка/любой продукт всё равно должен открываться.
           ======================================================== */

        var productCard =
            clickedElement.closest
                ? clickedElement.closest(
                    ".product-card"
                )
                : null;

        if (productCard) {

            event.preventDefault();

            var productId =
                productCard.dataset.productId;

            console.log(
                "🥔 Клик по продукту:",
                productId
            );

            if (productId) {

                openProductFromCard(
                    productId
                );
            }

            return;
        }


        /* ========================================================
           3. НИЖНЯЯ НАВИГАЦИЯ
           ======================================================== */

        var navItem =
            clickedElement.closest
                ? clickedElement.closest(
                    ".nav-item"
                )
                : null;

        if (navItem) {

            var screen =
                navItem.dataset.screen;

            if (
                screen &&
                typeof window.render ===
                "function"
            ) {

                event.preventDefault();

                window.render(screen);

                return;
            }
        }


        /* ========================================================
           4. ФИЛЬТРЫ ПРОДУКТОВ
           ======================================================== */

        var filterBtn =
            clickedElement.closest
                ? clickedElement.closest(
                    ".filter-btn"
                )
                : null;

        if (filterBtn) {

            var category =
                filterBtn.dataset.category;

            if (
                category &&
                typeof window.setProductsFilter ===
                "function"
            ) {

                event.preventDefault();

                window.setProductsFilter(
                    category
                );

                if (
                    typeof window.render ===
                    "function"
                ) {

                    window.render(
                        "products"
                    );
                }

                return;
            }
        }


        /* ========================================================
           5. ЗАКРЫТИЕ МОДАЛКИ
           ======================================================== */

        var closeBtn =
            clickedElement.closest
                ? clickedElement.closest(
                    ".btn-close-modal"
                )
                : null;

        if (closeBtn) {

            var modal =
                closeBtn.closest(
                    ".modal-overlay"
                );

            if (modal) {

                event.preventDefault();

                modal.remove();

                return;
            }
        }


        var modalOverlay =
            clickedElement.closest
                ? clickedElement.closest(
                    ".modal-overlay"
                )
                : null;

        if (
            modalOverlay &&
            clickedElement === modalOverlay
        ) {

            modalOverlay.remove();

            return;
        }


        /* ========================================================
           6. НАЗАД
           ======================================================== */

        var backBtn =
            clickedElement.closest
                ? clickedElement.closest(
                    ".btn-back"
                )
                : null;

        if (backBtn) {

            event.preventDefault();

            if (
                window.ui &&
                window.ui.previousScreen
            ) {

                window.render(
                    window.ui.previousScreen
                );

            } else {

                window.render(
                    "home"
                );
            }

            return;
        }


        /* ========================================================
           7. ТЕМА
           ======================================================== */

        var themeBtn =
            clickedElement.closest
                ? clickedElement.closest(
                    ".theme-toggle"
                )
                : null;

        if (themeBtn) {

            event.preventDefault();

            if (
                typeof window.toggleTheme ===
                "function"
            ) {

                window.toggleTheme();
            }

            return;
        }
    }


    /* ============================================================
       INPUT
       ============================================================ */

    function handleDocumentInput(event) {

        var id =
            event.target.id;

        switch (id) {

            case "product-search":

            case "productSearch":

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

    function handleDocumentChange(event) {

        var target =
            event.target;

        if (
            target.id ===
            "food-new-product" ||
            target.id ===
            "food-preparation" ||
            target.id ===
            "food-form"
        ) {

            return;
        }
    }


    /* ============================================================
       НАВИГАЦИЯ
       ============================================================ */

    function navigateHandler(screen) {

        if (!screen) {
            return;
        }

        if (
            typeof showScreen ===
            "function"
        ) {

            showScreen(screen);

        } else if (
            typeof render ===
            "function"
        ) {

            render(screen);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* ============================================================
       ПРОДУКТЫ
       ============================================================ */

    function getProductById(id) {

        if (!id) {
            return null;
        }

        var products =
            window.PRODUCTS ||
            (
                typeof PRODUCTS !==
                "undefined"
                    ? PRODUCTS
                    : []
            );

        return products.find(
            function (product) {

                return String(product.id) ===
                    String(id);
            }
        ) || null;
    }


    function getProductByName(name) {

        if (!name) {
            return null;
        }

        var products =
            window.PRODUCTS ||
            (
                typeof PRODUCTS !==
                "undefined"
                    ? PRODUCTS
                    : []
            );

        return products.find(
            function (product) {

                return String(
                    product.name
                ).toLowerCase() ===
                    String(
                        name
                    ).toLowerCase();
            }
        ) || null;
    }


    /* ============================================================
       ОТКРЫТИЕ ПРОДУКТА
       ============================================================ */

    function openProductFromCard(productId) {

        console.log(
            "🔎 Открываем продукт:",
            productId
        );

        var product =
            getProductById(
                productId
            );

        if (!product) {

            console.error(
                "❌ Продукт не найден:",
                productId
            );

            if (
                typeof showToast ===
                "function"
            ) {

                showToast(
                    "Продукт пока не найден в базе.",
                    "error"
                );
            }

            return;
        }

        console.log(
            "✅ Продукт найден:",
            product
        );

        openProductDetails(
            product
        );
    }


    /* ============================================================
       ДЕТАЛИ ПРОДУКТА
       ============================================================ */

    function openProductDetails(product) {

        if (!product) {
            return;
        }

        /* --------------------------------------------------------
           СНАЧАЛА ПЫТАЕМСЯ ИСПОЛЬЗОВАТЬ СУЩЕСТВУЮЩУЮ МОДАЛКУ
           -------------------------------------------------------- */

        if (
            typeof window.showProductDetailModal ===
            "function"
        ) {

            console.log(
                "🪟 Открываем showProductDetailModal"
            );

            try {

                window.showProductDetailModal(
                    product
                );

                return;

            } catch (error) {

                console.warn(
                    "⚠️ showProductDetailModal(product) не сработала:",
                    error
                );

                try {

                    window.showProductDetailModal(
                        product.id
                    );

                    return;

                } catch (secondError) {

                    console.warn(
                        "⚠️ showProductDetailModal(id) тоже не сработала:",
                        secondError
                    );
                }
            }
        }


        /* --------------------------------------------------------
           РЕЗЕРВНАЯ МОДАЛКА
           -------------------------------------------------------- */

        var root =
            document.getElementById(
                "modal-root"
            );

        if (!root) {

            console.error(
                "❌ #modal-root не найден"
            );

            return;
        }


        var safety =
            typeof getSafetyWarning ===
            "function"

                ? getSafetyWarning(
                    product.name
                )

                : null;


        var introduced =
            STATE.products &&
            Array.isArray(
                STATE.products.introduced
            )

                ? STATE.products.introduced.some(
                    function (item) {

                        return (
                            typeof item ===
                            "object"

                                ? item.id
                                : item
                        ) ===
                        product.id;
                    }
                )

                : false;


        var productName =
            typeof escapeHTML ===
            "function"

                ? escapeHTML(
                    product.name ||
                    "Продукт"
                )

                : (
                    product.name ||
                    "Продукт"
                );


        var emoji =
            product.emoji ||
            "🥣";


        var category =
            product.cat ||
            product.category ||
            "—";


        var age =
            product.min_age !==
            undefined &&
            product.min_age !==
            null

                ? product.min_age +
                  "+ мес."

                : (
                    product.introduction &&
                    product.introduction.fromMonths !==
                    undefined

                        ? "с " +
                          product.introduction.fromMonths +
                          " мес."

                        : "—"
                );


        var iron =
            product.iron ||
            (
                Array.isArray(
                    product.nutrients
                ) &&
                product.nutrients.includes(
                    "iron"
                )
            );


        var description =
            product.desc ||
            product.description ||
            "";


        var allergen =
            product.allergen;


        var html = "";

        html +=
            '<div class="modal-overlay" data-action="close-modal">';

        html +=
            '<div class="modal-sheet" data-modal-content>';

        html +=
            '<div class="modal-header">';

        html +=
            "<div>";

        html +=
            '<span class="product-large-emoji">' +
            emoji +
            "</span>";

        html +=
            "<h2>" +
            productName +
            "</h2>";

        html +=
            "</div>";

        html +=
            '<button type="button" class="icon-button" data-action="close-modal">×</button>';

        html +=
            "</div>";


        html +=
            '<div class="modal-body">';


        html +=
            '<div class="product-info-grid">';


        html +=
            "<div><span>Категория</span><strong>" +
            category +
            "</strong></div>";


        html +=
            "<div><span>Возраст</span><strong>" +
            age +
            "</strong></div>";


        html +=
            "<div><span>Железо</span><strong>" +
            (
                iron
                    ? "✓"
                    : "—"
            ) +
            "</strong></div>";


        html +=
            "</div>";


        if (description) {

            html +=
                '<div class="info-block">' +
                "<h3>О продукте</h3>" +
                "<p>" +
                (
                    typeof escapeHTML ===
                    "function"

                        ? escapeHTML(
                            description
                        )

                        : description
                ) +
                "</p></div>";
        }


        if (safety) {

            var warning =
                safety.warning ||
                safety;


            html +=
                '<div class="warning-block">' +
                "<strong>⚠️ Безопасность</strong>" +
                "<p>" +
                (
                    typeof escapeHTML ===
                    "function"

                        ? escapeHTML(
                            warning
                        )

                        : warning
                ) +
                "</p></div>";
        }


        if (allergen) {

            html +=
                '<div class="warning-block">' +
                "<strong>⚠️ Аллерген</strong>" +
                "<p>Вводите продукт внимательно и наблюдайте за реакцией малыша.</p>" +
                "</div>";
        }


        html +=
            '<div class="modal-actions">';


        if (introduced) {

            html +=
                '<div class="success-box">✓ Этот продукт уже знаком малышу</div>';

        } else {

            html +=
                '<button type="button" class="primary-button full-width" data-action="add-food" data-product-id="' +
                (
                    typeof escapeHTML ===
                    "function"

                        ? escapeHTML(
                            product.id
                        )

                        : product.id
                ) +
                '">' +
                "+ Добавить продукт" +
                "</button>";
        }


        html +=
            "</div>";


        html +=
            "</div>";

        html +=
            "</div>";

        html +=
            "</div>";


        root.innerHTML =
            html;
    }


    /* ============================================================
       ИЗБРАННОЕ
       ============================================================ */

    function toggleFavoriteHandler(productId) {

        if (!productId) {
            return;
        }

        if (
            typeof toggleFavoriteProduct ===
            "function"
        ) {

            toggleFavoriteProduct(
                productId
            );
        }

        var favorites =
            STATE.products?.favorites ||
            [];

        var isFavorite =
            favorites.includes(
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
       ФИЛЬТРЫ
       ============================================================ */

    var CURRENT_PRODUCTS_TAB =
        "all";


    function changeProductsTab(tab) {

        CURRENT_PRODUCTS_TAB =
            tab || "all";

        document
            .querySelectorAll(
                ".product-tab"
            )
            .forEach(
                function (button) {

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


    var CURRENT_PRODUCT_CATEGORY =
        "all";


    function changeProductCategory(
        category,
        clickedButton
    ) {

        CURRENT_PRODUCT_CATEGORY =
            category ||
            "all";


        if (
            typeof window.setProductsFilter ===
            "function"
        ) {

            window.setProductsFilter(
                CURRENT_PRODUCT_CATEGORY
            );

            if (
                typeof window.render ===
                "function"
            ) {

                window.render(
                    "products"
                );
            }

            return;
        }


        document
            .querySelectorAll(
                "[data-action='product-category']"
            )
            .forEach(
                function (button) {

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
       ПОИСК ПРОДУКТОВ
       ============================================================ */

    var CURRENT_PRODUCT_SEARCH =
        "";


    function searchProducts(value) {

        CURRENT_PRODUCT_SEARCH =
            String(
                value || ""
            ).trim().toLowerCase();


        console.log(
            "🔎 Поиск:",
            CURRENT_PRODUCT_SEARCH
        );


        if (
            typeof window.setProductsSearch ===
            "function"
        ) {

            window.setProductsSearch(
                value
            );

            if (
                typeof window.render ===
                "function"
            ) {

                window.render(
                    "products"
                );
            }

            return;
        }


        if (
            typeof renderProducts ===
            "function"
        ) {

            renderProducts();
        }
    }


    function clearProductSearch() {

        var input =
            document.getElementById(
                "product-search"
            ) ||
            document.getElementById(
                "productSearch"
            );


        if (input) {
            input.value = "";
        }


        CURRENT_PRODUCT_SEARCH =
            "";


        if (
            typeof window.setProductsSearch ===
            "function"
        ) {

            window.setProductsSearch(
                ""
            );
        }


        if (
            typeof window.render ===
            "function"
        ) {

            window.render(
                "products"
            );

        } else if (
            typeof renderProducts ===
            "function"
        ) {

            renderProducts();
        }
    }


    /* ============================================================
       ИСТОЧНИК ЕДЫ
       ============================================================ */

    var CURRENT_FOOD_SOURCE =
        "homemade";


    function changeFoodSource(source) {

        CURRENT_FOOD_SOURCE =
            source ||
            "homemade";


        document
            .querySelectorAll(
                "[data-action='food-source']"
            )
            .forEach(
                function (button) {

                    button.classList.toggle(
                        "active",
                        button.dataset.source ===
                        CURRENT_FOOD_SOURCE
                    );
                }
            );


        var storeFields =
            document.getElementById(
                "store-fields"
            );

        var homemadeFields =
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
       LIKED
       ============================================================ */

    var CURRENT_LIKED =
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
                function (button) {

                    button.classList.toggle(
                        "active",
                        button.dataset.liked ===
                        String(liked)
                    );
                }
            );
    }


    /* ============================================================
       СОХРАНЕНИЕ ЕДЫ
       ============================================================ */

    function saveFoodHandler() {

        var productId =
            document.getElementById(
                "food-product-id"
            )?.value;


        var product =
            getProductById(
                productId
            );


        var customName =
            document.getElementById(
                "food-product-title"
            )?.value?.trim();


        var productName =
            product?.name ||
            customName;


        if (!productName) {

            showToast(
                "Сначала выберите или укажите продукт.",
                "error"
            );

            return;
        }


        var amount =
            document.getElementById(
                "food-amount"
            )?.value;


        var form =
            document.getElementById(
                "food-form"
            )?.value;


        var preparation =
            document.getElementById(
                "food-preparation"
            )?.value;


        var notes =
            document.getElementById(
                "food-notes"
            )?.value?.trim();


        var brand =
            document.getElementById(
                "food-brand"
            )?.value?.trim();


        var packageSize =
            document.getElementById(
                "food-package-size"
            )?.value;


        var ingredients =
            document.getElementById(
                "food-ingredients"
            )?.value?.trim();


        var isNew =
            document.getElementById(
                "food-new-product"
            )?.checked;


        var entry = {

            id:
                "diary_" +
                Date.now(),

            date:
                new Date()
                    .toISOString()
                    .slice(0, 10),

            time:
                new Date()
                    .toLocaleTimeString(
                        "ru-RU",
                        {
                            hour:
                                "2-digit",
                            minute:
                                "2-digit"
                        }
                    ),

            productId:
                product?.id ||
                null,

            productName:
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
                new Date().toISOString()
        };


        updateState(
            function (state) {

                state.diary.push(
                    entry
                );


                if (
                    isNew &&
                    product?.id
                ) {

                    var exists =
                        state.products.introduced.some(
                            function (item) {

                                return (
                                    typeof item ===
                                    "object"

                                        ? item.id
                                        : item
                                ) ===
                                product.id;
                            }
                        );


                    if (!exists) {

                        state.products.introduced.push(
                            {
                                id:
                                    product.id,

                                name:
                                    product.name,

                                introducedAt:
                                    entry.date
                            }
                        );
                    }
                }


                if (
                    CURRENT_FOOD_SOURCE ===
                    "store" &&
                    brand
                ) {

                    var brandExists =
                        state.brands.some(
                            function (item) {

                                return String(
                                    item
                                ).toLowerCase() ===
                                brand.toLowerCase();
                            }
                        );


                    if (!brandExists) {

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
       PICKER
       ============================================================ */

    function renderProductPicker(
        query
    ) {

        var container =
            document.getElementById(
                "picker-products"
            );


        if (!container) {
            return;
        }


        var products =
            window.PRODUCTS ||
            [];


        var normalized =
            String(
                query || ""
            )
            .trim()
            .toLowerCase();


        var list =
            products.filter(
                function (product) {

                    if (!normalized) {
                        return true;
                    }

                    return String(
                        product.name ||
                        ""
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
                    function (product) {

                        return (
                            '<button type="button" class="picker-product" data-action="select-product" data-product-id="' +
                            escapeHTML(
                                product.id
                            ) +
                            '">' +

                            "<span>" +
                            (
                                product.emoji ||
                                "🥣"
                            ) +
                            "</span>" +

                            "<strong>" +
                            escapeHTML(
                                product.name
                            ) +
                            "</strong>" +

                            "<span>" +
                            icon("arrow") +
                            "</span>" +

                            "</button>"
                        );
                    }
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
       ВЫБОР ПРОДУКТА В PICKER
       ============================================================ */

    document.addEventListener(
        "click",
        function (event) {

            var button =
                event.target.closest
                    ? event.target.closest(
                        "[data-action='select-product']"
                    )
                    : null;


            if (!button) {
                return;
            }


            var product =
                getProductById(
                    button.dataset.productId
                );


            if (!product) {
                return;
            }


            closeModal();


            if (
                typeof openAddFoodModal ===
                "function"
            ) {

                openAddFoodModal(
                    product
                );
            }
        }
    );


    /* ============================================================
       ДНЕВНИК
       ============================================================ */

    function openDiaryAddModal() {

        openAddFoodModal();
    }


    function openDiaryEditModal(
        entryId
    ) {

        var entry =
            STATE.diary.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        entryId
                    );
                }
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


    function openDiaryFilter() {

        showToast(
            "Фильтры дневника готовы для подключения.",
            "default"
        );
    }


    function openDiaryCalendar() {

        showToast(
            "Календарь дневника готов для подключения.",
            "default"
        );
    }


    /* ============================================================
       ДАТА
       ============================================================ */

    var CURRENT_DATE =
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

        var element =
            document.getElementById(
                "today-date"
            );


        if (!element) {
            return;
        }


        var today =
            new Date();


        var current =
            formatDate(
                CURRENT_DATE
            );


        if (
            current ===
            formatDate(today)
        ) {

            element.textContent =
                "Сегодня";

        } else {

            element.textContent =
                CURRENT_DATE.toLocaleDateString(
                    "ru-RU",
                    {
                        day:
                            "numeric",

                        month:
                            "long"
                    }
                );
        }
    }


    function openDatePicker() {

        var input =
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
            function () {

                if (input.value) {

                    CURRENT_DATE =
                        new Date(
                            input.value +
                            "T12:00:00"
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
       РЕЦЕПТЫ
       ============================================================ */

    var CURRENT_RECIPE_CATEGORY =
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
                function (button) {

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
       РЕДАКТИРОВАНИЕ МАЛЫША
       ============================================================ */

    function openBabyEditModal() {

        var baby =
            typeof window.getCurrentChild ===
            "function"

                ? window.getCurrentChild()

                : (
                    STATE.baby ||
                    {}
                );


        var root =
            document.getElementById(
                "modal-root"
            );


        if (!root) {
            return;
        }


        root.innerHTML =
            '<div class="modal-overlay" data-action="close-modal">' +

            '<div class="modal-sheet" data-modal-content>' +

            '<div class="modal-header">' +

            "<h2>Профиль малыша</h2>" +

            '<button type="button" class="icon-button" data-action="close-modal">×</button>' +

            "</div>" +

            '<div class="modal-body">' +

            '<label class="form-label">Имя малыша' +

            '<input id="baby-name-input" value="' +
            escapeHTML(
                baby.name ||
                ""
            ) +
            '" placeholder="Имя">' +

            "</label>" +

            '<label class="form-label">Дата рождения' +

            '<input id="baby-birth-input" type="date" value="' +
            escapeHTML(
                baby.birthDate ||
                ""
            ) +
            '">' +

            "</label>" +

            '<label class="form-label">Тип кормления' +

            '<select id="baby-feeding-input">' +

            '<option value="ГВ"' +
            (
                baby.feedingType ===
                "ГВ"
                    ? " selected"
                    : ""
            ) +
            ">Грудное вскармливание</option>" +

            '<option value="ИВ"' +
            (
                baby.feedingType ===
                "ИВ"
                    ? " selected"
                    : ""
            ) +
            ">Искусственное</option>" +

            '<option value="Смешанное"' +
            (
                baby.feedingType ===
                "Смешанное"
                    ? " selected"
                    : ""
            ) +
            ">Смешанное</option>" +

            "</select>" +

            "</label>" +

            '<button type="button" class="primary-button full-width" data-action="save-baby">Сохранить</button>' +

            "</div>" +

            "</div>" +

            "</div>";
    }


    /* ============================================================
       НАСТРОЙКИ
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
                    function (state) {

                        state.settings.notifications =
                            !state.settings.notifications;
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

                    var current =
                        typeof getTheme ===
                        "function"

                            ? getTheme()

                            : "light";


                    setTheme(
                        current ===
                        "light"
                            ? "dark"
                            : "light"
                    );
                }

                break;


            case "run-onboarding": {

                var newChild =
                    window.addChild({
                        name: "",
                        birthDate: "",
                        sex: "",
                        feedingType: "",
                        feedingStarted:
                            false,
                        feedingStartDate:
                            "",
                        approach:
                            "mixed",
                        readiness: {},
                        onboarding: {
                            allergies: [],
                            diet: [],
                            favoriteFoods: [],
                            worries: [],
                            confidence:
                                ""
                        }
                    });


                if (
                    newChild &&
                    newChild.id
                ) {

                    STATE._onboardingChildId =
                        newChild.id;

                    STATE.currentChildId =
                        newChild.id;

                    STATE.ui.screen =
                        "onboarding";

                    STATE.navigation.currentScreen =
                        "onboarding";


                    if (
                        typeof saveState ===
                        "function"
                    ) {

                        saveState();
                    }
                }


                if (
                    typeof render ===
                    "function"
                ) {

                    render(
                        "onboarding"
                    );
                }


                break;
            }
        }
    }


    /* ============================================================
       СБРОС
       ============================================================ */

    function confirmReset() {

        if (
            !window.confirm(
                "Удалить все данные прикорма? Это действие нельзя отменить."
            )
        ) {

            return;
        }


        resetState();


        showToast(
            "Данные удалены.",
            "success"
        );


        setTimeout(
            function () {

                location.reload();

            },
            300
        );
    }


    /* ============================================================
       ДОБАВЛЕНИЕ РЕБЁНКА
       ============================================================ */

    function showAddChildModal() {

        var overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "modal-overlay active";


        overlay.innerHTML = `

            <div class="modal-sheet">

                <h3>👶 Добавить ребёнка</h3>

                <div style="margin:16px 0;">

                    <label>Имя</label>

                    <input
                        type="text"
                        id="add-child-name"
                        placeholder="Имя"
                        style="width:100%;padding:12px;border:1px solid var(--border-input);border-radius:8px;margin-top:4px;"
                    >

                </div>


                <div style="margin:16px 0;">

                    <label>Дата рождения</label>

                    <input
                        type="date"
                        id="add-child-birth"
                        style="width:100%;padding:12px;border:1px solid var(--border-input);border-radius:8px;margin-top:4px;"
                    >

                </div>


                <div style="margin:16px 0;">

                    <label>Пол</label>

                    <select
                        id="add-child-sex"
                        style="width:100%;padding:12px;border:1px solid var(--border-input);border-radius:8px;margin-top:4px;"
                    >

                        <option value="">
                            Не указан
                        </option>

                        <option value="male">
                            Мальчик
                        </option>

                        <option value="female">
                            Девочка
                        </option>

                    </select>

                </div>


                <div
                    style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;"
                >

                    <button
                        class="secondary-button"
                        data-action="close-modal"
                        style="flex:1;"
                        type="button"
                    >
                        Отмена
                    </button>


                    <button
                        class="secondary-button"
                        id="skip-onboarding-btn"
                        style="flex:1;"
                        type="button"
                    >
                        Пропустить онбординг
                    </button>


                    <button
                        class="primary-button"
                        id="save-child-btn"
                        style="flex:1;"
                        type="button"
                    >
                        Сохранить
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(
            overlay
        );


        document.body.classList.add(
            "modal-open"
        );


        overlay
            .querySelector(
                '[data-action="close-modal"]'
            )
            .addEventListener(
                "click",
                function () {

                    overlay.remove();

                    document.body.classList.remove(
                        "modal-open"
                    );
                }
            );


        overlay.addEventListener(
            "click",
            function (e) {

                if (
                    e.target ===
                    overlay
                ) {

                    overlay.remove();

                    document.body.classList.remove(
                        "modal-open"
                    );
                }
            }
        );


        function createChild(
            startOnboarding
        ) {

            var name =
                document.getElementById(
                    "add-child-name"
                )?.value.trim() ||
                "Ребёнок";


            var birthDate =
                document.getElementById(
                    "add-child-birth"
                )?.value ||
                "";


            var sex =
                document.getElementById(
                    "add-child-sex"
                )?.value ||
                "";


            if (!birthDate) {

                alert(
                    "Пожалуйста, укажите дату рождения"
                );

                return;
            }


            var childData = {

                name:
                    name,

                birthDate:
                    birthDate,

                sex:
                    sex,

                feedingType:
                    "",

                feedingStarted:
                    false,

                feedingStartDate:
                    "",

                approach:
                    "mixed",

                readiness:
                    {},

                onboarding: {

                    allergies:
                        [],

                    diet:
                        [],

                    favoriteFoods:
                        [],

                    worries:
                        [],

                    confidence:
                        ""
                }
            };


            var newChild =
                null;


            if (
                typeof childService !==
                "undefined" &&
                childService.createChild
            ) {

                newChild =
                    childService.createChild(
                        childData
                    );

            } else if (
                typeof window.addChild ===
                "function"
            ) {

                newChild =
                    window.addChild(
                        childData
                    );

            } else {

                alert(
                    "Ошибка: функция создания ребёнка не найдена"
                );

                return;
            }


            overlay.remove();

            document.body.classList.remove(
                "modal-open"
            );


            if (
                newChild &&
                newChild.id
            ) {

                STATE.currentChildId =
                    newChild.id;


                if (
                    startOnboarding
                ) {

                    STATE._onboardingChildId =
                        newChild.id;

                    STATE.ui.screen =
                        "onboarding";

                    STATE.navigation.currentScreen =
                        "onboarding";

                } else {

                    STATE.ui.screen =
                        "baby";

                    STATE.navigation.currentScreen =
                        "baby";
                }


                if (
                    typeof saveState ===
                    "function"
                ) {

                    saveState();
                }
            }


            if (
                typeof render ===
                "function"
            ) {

                render(
                    startOnboarding
                        ? "onboarding"
                        : "baby"
                );
            }


            if (!startOnboarding) {

                showToast(
                    "👶 Ребёнок добавлен",
                    "success"
                );
            }
        }


        overlay
            .querySelector(
                "#skip-onboarding-btn"
            )
            .addEventListener(
                "click",
                function () {

                    createChild(
                        false
                    );
                }
            );


        overlay
            .querySelector(
                "#save-child-btn"
            )
            .addEventListener(
                "click",
                function () {

                    createChild(
                        true
                    );
                }
            );
    }


    /* ============================================================
       ГЛОБАЛЬНЫЕ ФУНКЦИИ
       ============================================================ */

    window.setupEventListeners =
        setupEventListeners;

    window.handleDocumentClick =
        handleDocumentClick;

    window.handleDocumentInput =
        handleDocumentInput;

    window.handleDocumentChange =
        handleDocumentChange;

    window.navigateHandler =
        navigateHandler;

    window.getProductById =
        getProductById;

    window.getProductByName =
        getProductByName;

    window.openProductFromCard =
        openProductFromCard;

    window.openProductDetails =
        openProductDetails;

    window.toggleFavoriteHandler =
        toggleFavoriteHandler;

    window.changeProductsTab =
        changeProductsTab;

    window.changeProductCategory =
        changeProductCategory;

    window.searchProducts =
        searchProducts;

    window.clearProductSearch =
        clearProductSearch;

    window.changeFoodSource =
        changeFoodSource;

    window.setLikedHandler =
        setLikedHandler;

    window.saveFoodHandler =
        saveFoodHandler;

    window.renderProductPicker =
        renderProductPicker;

    window.searchProductPicker =
        searchProductPicker;

    window.openDiaryAddModal =
        openDiaryAddModal;

    window.openDiaryEditModal =
        openDiaryEditModal;

    window.openDiaryFilter =
        openDiaryFilter;

    window.openDiaryCalendar =
        openDiaryCalendar;

    window.changeDay =
        changeDay;

    window.formatDate =
        formatDate;

    window.updateTodayDate =
        updateTodayDate;

    window.openDatePicker =
        openDatePicker;

    window.changeRecipeCategory =
        changeRecipeCategory;

    window.searchRecipes =
        searchRecipes;

    window.openBabyEditModal =
        openBabyEditModal;

    window.openSetting =
        openSetting;

    window.confirmReset =
        confirmReset;

    window.showAddChildModal =
        showAddChildModal;


    console.log(
        "✅ handlers.js загружен"
    );

})();