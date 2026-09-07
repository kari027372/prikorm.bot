/* ============================================================
   handlers.js — финальная версия
   ============================================================ */

function setupEventListeners() {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("input", handleDocumentInput);
    document.addEventListener("change", handleDocumentChange);
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    window.addEventListener("prikorm:statechange", function() {
        console.log("📡 prikorm:statechange", "screen:", STATE.ui?.screen, "children:", STATE.children?.length);
        if (typeof updateProfileUI === "function") updateProfileUI();
        if (typeof render === "function") {
            var screen = STATE.ui?.screen || "home";
            console.log("📡 Перерисовываю экран:", screen);
            render(screen);
        }
    });
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function handleDocumentClick(event) {

    // === ЗАКРЫТИЕ МОДАЛКИ ===
    var closeBtn = event.target.closest('.btn-close-modal');
    if (closeBtn) {
        var modal = closeBtn.closest('.modal-overlay');
        if (modal) {
            event.preventDefault();
            event.stopPropagation();
            modal.remove();
            return;
        }
    }

    var modalOverlay = event.target.closest('.modal-overlay');
    if (modalOverlay && event.target === modalOverlay) {
        modalOverlay.remove();
        return;
    }

    // --- ОСНОВНАЯ ЛОГИКА ---
    var target = event.target.closest("[data-action]");

    if (target) {
        var action = target.dataset.action;

        if (target.hasAttribute("data-modal-content")) return;

        switch (action) {

            case "navigate":
                navigateHandler(target.dataset.screen);
                break;

            case "back":
                showScreen("home");
                break;

            case "open-baby":
                showScreen("baby");
                break;

            case "edit-baby":
                openBabyEditModal();
                break;

            case "open-product":
                openProductFromCard(target.dataset.productId);
                break;

            case "add-food": {
                var productId = target.dataset.productId;
                var product = productId ? getProductById(productId) : null;
                openAddFoodModal(product);
                break;
            }

            case "choose-product":
                if (typeof openProductPicker === "function") {
                    openProductPicker();
                } else {
                    showToast("Функция выбора продукта временно недоступна");
                }
                break;

            case "toggle-favorite":
                toggleFavoriteHandler(target.dataset.productId);
                break;

            case "products-tab":
                changeProductsTab(target.dataset.tab);
                break;

            case "product-category":
                changeProductCategory(target.dataset.category, target);
                break;

            case "clear-search":
                clearProductSearch();
                break;

            case "food-source":
                changeFoodSource(target.dataset.source);
                break;

            case "set-liked":
                setLikedHandler(target.dataset.liked === "true", target);
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
                openDiaryEditModal(target.dataset.entryId);
                break;

            case "diary-filter":
                openDiaryFilter();
                break;

            case "diary-calendar":
                openDiaryCalendar();
                break;

            case "previous-day":
                if (typeof CURRENT_DATE !== "undefined") {
                    CURRENT_DATE = new Date(CURRENT_DATE);
                    CURRENT_DATE.setDate(CURRENT_DATE.getDate() - 1);
                    render("today");
                } else {
                    showToast("Ошибка: дата не определена", "error");
                }
                break;

            case "next-day":
                if (typeof CURRENT_DATE !== "undefined") {
                    CURRENT_DATE = new Date(CURRENT_DATE);
                    CURRENT_DATE.setDate(CURRENT_DATE.getDate() + 1);
                    render("today");
                } else {
                    showToast("Ошибка: дата не определена", "error");
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
                var idx = parseInt(target.dataset.index);

                var dateStr = typeof CURRENT_DATE !== "undefined"
                    ? CURRENT_DATE.toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10);

                if (!isNaN(idx) && typeof removeMealFromPlan === "function") {
                    removeMealFromPlan(dateStr, idx);
                    render("today");
                } else {
                    showToast("Ошибка удаления", "error");
                }
                break;
            }

            case "recipe-category":
                changeRecipeCategory(target.dataset.category, target);
                break;

            case "settings":
                openSetting(target.dataset.setting);
                break;

            case "reset-data":
                confirmReset();
                break;

            case "save-baby": {
                var name =
                    document.getElementById("baby-name-input")?.value?.trim() ||
                    document.getElementById("baby-name")?.value?.trim() ||
                    "";

                var birthDate =
                    document.getElementById("baby-birth-input")?.value ||
                    document.getElementById("baby-birth")?.value ||
                    "";

                var feedingType =
                    document.getElementById("baby-feeding-input")?.value ||
                    document.getElementById("baby-feeding")?.value ||
                    "";

                if (!name && !birthDate && !feedingType) {
                    showToast("Заполните хотя бы одно поле", "error");
                    break;
                }

                var age = { months: 0, days: 0 };

                if (birthDate && typeof calcAge === "function") {
                    age = calcAge(birthDate);
                }

                STATE.ui.screen = "baby";
                STATE.navigation.currentScreen = "baby";

                if (typeof updateBaby === "function") {
                    updateBaby({
                        name,
                        birthDate,
                        feedingType,
                        ageMonths: age.months || 0,
                        ageDays: age.days || 0
                    });
                } else {
                    setBaby({
                        name,
                        birthDate,
                        feedingType,
                        ageMonths: age.months || 0,
                        ageDays: age.days || 0
                    });
                }

                closeModal();
                showToast("Профиль сохранён ❤️", "success");
                break;
            }

            case "switch-child": {
                var switchId = target.dataset.childId;

                if (!switchId) return;

                if (typeof window.switchChild === "function") {
                    STATE.ui.screen = "baby";
                    STATE.navigation.currentScreen = "baby";
                    window.switchChild(switchId);
                }

                break;
            }

            case "delete-child": {
                var deleteId = target.dataset.childId;

                if (!deleteId) return;

                event.stopPropagation();

                if (!confirm("Удалить этого ребёнка? Все данные по нему будут потеряны.")) {
                    return;
                }

                console.log("🗑️ Удаление ребёнка:", deleteId);

                STATE.ui.screen = "baby";
                STATE.navigation.currentScreen = "baby";

                if (typeof window.deleteChild === "function") {
                    window.deleteChild(deleteId);
                } else {
                    STATE.children = STATE.children.filter(function(child) {
                        return child.id !== deleteId;
                    });

                    if (STATE.currentChildId === deleteId) {
                        STATE.currentChildId = STATE.children.length
                            ? STATE.children[0].id
                            : null;
                    }

                    if (typeof saveState === "function") saveState();

                    window.dispatchEvent(
                        new CustomEvent("prikorm:statechange")
                    );
                }

                break;
            }

            case "open-add-child":
                showAddChildModal();
                break;

            case "close-modal":
                if (
                    target.classList.contains("modal-overlay") ||
                    target.classList.contains("icon-button")
                ) {
                    closeModal();
                }
                break;

            // ============================================================
            // ФИЛЬТРЫ ПРОДУКТОВ
            // ============================================================

            case "filter-products": {

                // Каждый фильтр изменяется независимо.
                // Поэтому статус + категория + возраст
                // теперь могут работать одновременно.

                if (target.dataset.filter !== undefined) {
                    STATE.productsFilter =
                        target.dataset.filter || "all";
                }

                if (target.dataset.category !== undefined) {
                    STATE.productsCategoryFilter =
                        target.dataset.category || null;
                }

                if (target.dataset.age !== undefined) {
                    STATE.productsAgeFilter =
                        target.dataset.age || null;
                }

                if (typeof updateProductsList === "function") {
                    updateProductsList();
                }

                break;
            }

            // ============================================================
            // ОТКРЫТИЕ КАРТОЧКИ ПРОДУКТА
            // ============================================================

            case "select-product": {
                var productId = target.dataset.productId;

                if (productId) {
                    openProductFromCard(productId);
                } else {
                    showToast(
                        "Не удалось определить продукт",
                        "error"
                    );
                }

                break;
            }

            // ============================================================
            // ВЫБОР ПРОДУКТА В ПИКЕРЕ
            // ============================================================

            case "choose-picker-product": {
                var productId = target.dataset.productId;

                if (!productId) {
                    showToast(
                        "Не удалось определить продукт",
                        "error"
                    );
                    break;
                }

                var product = getProductById(productId);

                if (!product) {
                    showToast(
                        "Продукт не найден в базе",
                        "error"
                    );
                    break;
                }

                closeModal();

                if (typeof openAddFoodModal === "function") {
                    openAddFoodModal(product);
                } else {
                    showToast(
                        "Функция добавления продукта недоступна",
                        "error"
                    );
                }

                break;
            }

            // ============================================================
            // ВВЕДЕНИЕ ПРОДУКТА
            // ============================================================

            case "add-product-intro": {

                var productId = target.dataset.productId;

                if (!productId) {
                    showToast(
                        "Не удалось определить продукт",
                        "error"
                    );
                    break;
                }

                var childId =
                    window.STATE &&
                    window.STATE.currentChildId;

                if (!childId) {
                    showToast(
                        "Сначала выберите ребёнка",
                        "error"
                    );
                    break;
                }

                var currentStatus = "notIntroduced";

                if (
                    window.productStateService &&
                    typeof window.productStateService.getProductState === "function"
                ) {
                    try {
                        var state =
                            window.productStateService.getProductState(
                                childId,
                                productId
                            );

                        if (state && typeof state === "object") {
                            currentStatus =
                                state.status || "notIntroduced";
                        }
                    } catch (e) {
                        console.warn(
                            "Не удалось получить статус продукта:",
                            e
                        );
                    }
                }

                if (
                    currentStatus !== "notIntroduced" &&
                    currentStatus !== "planned"
                ) {
                    showToast(
                        "Этот продукт уже введён или недоступен для введения",
                        "info"
                    );
                    break;
                }

                var profile = getChildProfile(childId);
                var product = getProductById(productId);

                if (
                    profile &&
                    product &&
                    window.safetyEngine
                ) {
                    var safety =
                        window.safetyEngine.evaluateProductSafety(
                            profile,
                            product,
                            null
                        );

                    if (
                        safety &&
                        (
                            safety.status === "block" ||
                            safety.status === "not_appropriate"
                        )
                    ) {
                        showToast(
                            "Этот продукт не подходит для введения сейчас (Safety Engine)",
                            "error"
                        );
                        break;
                    }
                }

                if (
                    window.productStateService &&
                    typeof window.productStateService.markAsIntroduced === "function"
                ) {
                    try {
                        var success =
                            window.productStateService.markAsIntroduced(
                                childId,
                                productId,
                                new Date().toISOString().slice(0, 10)
                            );

                        if (success) {

                            showToast(
                                "✅ Продукт отмечен как введённый",
                                "success"
                            );

                            var modalOverlay =
                                document.querySelector(".modal-overlay");

                            if (modalOverlay) {

                                var productCard =
                                    modalOverlay.querySelector(
                                        "[data-product-id]"
                                    );

                                if (
                                    productCard &&
                                    productCard.dataset.productId ===
                                    String(productId)
                                ) {
                                    modalOverlay.remove();

                                    if (product) {
                                        openProductDetails(product);
                                    }
                                }
                            }

                        } else {

                            showToast(
                                "Не удалось отметить продукт как введённый",
                                "error"
                            );

                            console.warn(
                                "markAsIntroduced вернул false для childId:",
                                childId,
                                "productId:",
                                productId
                            );
                        }

                    } catch (e) {

                        console.error(
                            "Ошибка при введении продукта:",
                            e
                        );

                        showToast(
                            "Не удалось отметить продукт как введённый",
                            "error"
                        );
                    }

                } else {

                    showToast(
                        "Сервис продуктов пока недоступен",
                        "error"
                    );
                }

                break;
            }

            // ============================================================
            // МЕНЮ ПРОДУКТА
            // ============================================================

            case "show-product-menu": {

                var productId = target.dataset.productId;

                if (!productId) {
                    showToast(
                        "Не удалось определить продукт",
                        "error"
                    );
                    break;
                }

                var childId =
                    window.STATE &&
                    window.STATE.currentChildId;

                if (!childId) {
                    showToast(
                        "Сначала выберите ребёнка",
                        "error"
                    );
                    break;
                }

                var status = "notIntroduced";

                if (
                    window.productStateService &&
                    typeof window.productStateService.getProductState === "function"
                ) {
                    try {
                        var state =
                            window.productStateService.getProductState(
                                childId,
                                productId
                            );

                        if (
                            state &&
                            typeof state === "object"
                        ) {
                            status =
                                state.status ||
                                "notIntroduced";
                        }

                    } catch (e) {
                        console.warn(
                            "Не удалось получить статус продукта:",
                            e
                        );
                    }
                }

                var menuItems = [];

                if (status === "notIntroduced") {

                    menuItems.push({
                        label: "🗓 Запланировать",
                        action: "menu-plan"
                    });

                    menuItems.push({
                        label: "❌ Не хочу вводить",
                        action: "menu-exclude"
                    });

                } else if (status === "planned") {

                    menuItems.push({
                        label: "❌ Отменить план",
                        action: "menu-unplan"
                    });

                    menuItems.push({
                        label: "❌ Не хочу вводить",
                        action: "menu-exclude"
                    });

                } else if (status === "parentExcluded") {

                    menuItems.push({
                        label: "↩️ Вернуть в список",
                        action: "menu-restore"
                    });

                } else {

                    menuItems.push({
                        label: "Закрыть",
                        action: "close-modal"
                    });
                }

                var modalRoot =
                    document.getElementById("modal-root");

                if (!modalRoot) return;

                modalRoot.innerHTML = "";

                var overlay =
                    document.createElement("div");

                overlay.className = "modal-overlay";

                overlay.style.cssText =
                    "position:fixed;" +
                    "top:0;" +
                    "left:0;" +
                    "width:100%;" +
                    "height:100%;" +
                    "background:rgba(74,58,48,0.4);" +
                    "display:flex;" +
                    "align-items:center;" +
                    "justify-content:center;" +
                    "z-index:1000;" +
                    "padding:20px;" +
                    "box-sizing:border-box;";

                overlay.addEventListener(
                    "click",
                    function(e) {
                        if (e.target === overlay) {
                            modalRoot.innerHTML = "";
                        }
                    }
                );

                var sheet =
                    document.createElement("div");

                sheet.className = "modal-sheet";

                sheet.style.cssText =
                    "background:white;" +
                    "border-radius:20px;" +
                    "padding:24px;" +
                    "max-width:400px;" +
                    "width:100%;" +
                    "margin:auto;";

                var html =
                    "<h3 style=\"margin-top:0;\">Действия с продуктом</h3>";

                menuItems.forEach(function(item) {

                    html +=
                        '<button class="btn-secondary" ' +
                        'style="width:100%; margin-bottom:10px; padding:12px; border-radius:14px; border:1px solid #F0DED6; background:transparent; font-size:16px; cursor:pointer;" ' +
                        'data-action="' +
                        item.action +
                        '">' +
                        item.label +
                        "</button>";
                });

                html +=
                    '<button class="btn-ghost" ' +
                    'style="width:100%; padding:12px; border-radius:14px; border:none; background:transparent; font-size:16px; cursor:pointer; color:#8A7A6A;" ' +
                    'data-action="close-modal">Отмена</button>';

                sheet.innerHTML = html;

                overlay.appendChild(sheet);
                modalRoot.appendChild(overlay);

                var closeMenu = function() {
                    modalRoot.innerHTML = "";
                };

                sheet
                    .querySelector('[data-action="menu-plan"]')
                    ?.addEventListener(
                        "click",
                        function() {

                            if (
                                window.productStateService &&
                                typeof window.productStateService.setStatus === "function"
                            ) {
                                try {

                                    window.productStateService.setStatus(
                                        childId,
                                        productId,
                                        "planned"
                                    );

                                    showToast(
                                        "🗓 Продукт запланирован",
                                        "info"
                                    );

                                    closeMenu();

                                } catch (e) {

                                    console.error(
                                        "Ошибка при планировании:",
                                        e
                                    );

                                    showToast(
                                        "Не удалось запланировать продукт",
                                        "error"
                                    );
                                }

                            } else {

                                showToast(
                                    "Сервис продуктов пока недоступен",
                                    "error"
                                );
                            }
                        }
                    );

                sheet
                    .querySelector('[data-action="menu-unplan"]')
                    ?.addEventListener(
                        "click",
                        function() {

                            if (
                                window.productStateService &&
                                typeof window.productStateService.setStatus === "function"
                            ) {
                                try {

                                    window.productStateService.setStatus(
                                        childId,
                                        productId,
                                        "notIntroduced"
                                    );

                                    showToast(
                                        "🗓 План отменён",
                                        "info"
                                    );

                                    closeMenu();

                                } catch (e) {

                                    console.error(
                                        "Ошибка при отмене плана:",
                                        e
                                    );

                                    showToast(
                                        "Не удалось отменить план",
                                        "error"
                                    );
                                }

                            } else {

                                showToast(
                                    "Сервис продуктов пока недоступен",
                                    "error"
                                );
                            }
                        }
                    );

                sheet
                    .querySelector('[data-action="menu-exclude"]')
                    ?.addEventListener(
                        "click",
                        function() {

                            if (
                                window.productStateService &&
                                typeof window.productStateService.setStatus === "function"
                            ) {
                                try {

                                    window.productStateService.setStatus(
                                        childId,
                                        productId,
                                        "parentExcluded"
                                    );

                                    showToast(
                                        "❌ Продукт исключён",
                                        "info"
                                    );

                                    closeMenu();

                                } catch (e) {

                                    console.error(
                                        "Ошибка при исключении:",
                                        e
                                    );

                                    showToast(
                                        "Не удалось исключить продукт",
                                        "error"
                                    );
                                }

                            } else {

                                showToast(
                                    "Сервис продуктов пока недоступен",
                                    "error"
                                );
                            }
                        }
                    );

                sheet
                    .querySelector('[data-action="menu-restore"]')
                    ?.addEventListener(
                        "click",
                        function() {

                            if (
                                window.productStateService &&
                                typeof window.productStateService.setStatus === "function"
                            ) {
                                try {

                                    window.productStateService.setStatus(
                                        childId,
                                        productId,
                                        "notIntroduced"
                                    );

                                    showToast(
                                        "↩️ Продукт возвращён в список",
                                        "info"
                                    );

                                    closeMenu();

                                } catch (e) {

                                    console.error(
                                        "Ошибка при возврате:",
                                        e
                                    );

                                    showToast(
                                        "Не удалось вернуть продукт",
                                        "error"
                                    );
                                }

                            } else {

                                showToast(
                                    "Сервис продуктов пока недоступен",
                                    "error"
                                );
                            }
                        }
                    );

                sheet
                    .querySelector('[data-action="close-modal"]')
                    ?.addEventListener(
                        "click",
                        closeMenu
                    );

                var keyHandler = function(e) {

                    if (e.key === "Escape") {

                        closeMenu();

                        document.removeEventListener(
                            "keydown",
                            keyHandler
                        );
                    }
                };

                document.addEventListener(
                    "keydown",
                    keyHandler
                );

                break;
            }

            // ============================================================
            // ФИЛЬТР "ПОДХОДИТ"
            // ============================================================

            case "toggle-suitable": {

                window.CURRENT_PRODUCT_SUITABLE =
                    !window.CURRENT_PRODUCT_SUITABLE;

                var toggleEl =
                    document.querySelector(
                        '[data-action="toggle-suitable"]'
                    );

                if (toggleEl) {
                    toggleEl.classList.toggle(
                        "active",
                        window.CURRENT_PRODUCT_SUITABLE === true
                    );
                }

                if (
                    typeof updateProductsList === "function"
                ) {
                    updateProductsList();
                }

                break;
            }

            // ============================================================
            // ОТКРЫТЬ ФИЛЬТРЫ
            // ============================================================

            case "open-product-filters": {

                window.PRODUCT_FILTER_MODAL_STATE = {
                    age: STATE.productsAgeFilter || null,
                    safety:
                        window.CURRENT_PRODUCT_SAFETY_FILTER ||
                        "all"
                };

                if (
                    typeof openProductFiltersModal === "function"
                ) {
                    openProductFiltersModal();
                } else {
                    showToast(
                        "Функция фильтров временно недоступна",
                        "error"
                    );
                }

                break;
            }

            // ============================================================
            // ВРЕМЕННЫЙ ФИЛЬТР ВОЗРАСТА
            // ============================================================

            case "product-filter-age": {

                if (!window.PRODUCT_FILTER_MODAL_STATE) {
                    window.PRODUCT_FILTER_MODAL_STATE = {
                        age: STATE.productsAgeFilter || null,
                        safety:
                            window.CURRENT_PRODUCT_SAFETY_FILTER ||
                            "all"
                    };
                }

                window.PRODUCT_FILTER_MODAL_STATE.age =
                    target.dataset.age || null;

                var ageButtons =
                    document.querySelectorAll(
                        '[data-action="product-filter-age"]'
                    );

                ageButtons.forEach(function(button) {

                    button.classList.toggle(
                        "active",
                        (button.dataset.age || null) ===
                        (
                            window.PRODUCT_FILTER_MODAL_STATE.age ||
                            null
                        )
                    );
                });

                break;
            }

            // ============================================================
            // ВРЕМЕННЫЙ ФИЛЬТР БЕЗОПАСНОСТИ
            // ============================================================

            case "product-filter-safety": {

                if (!window.PRODUCT_FILTER_MODAL_STATE) {
                    window.PRODUCT_FILTER_MODAL_STATE = {
                        age: STATE.productsAgeFilter || null,
                        safety:
                            window.CURRENT_PRODUCT_SAFETY_FILTER ||
                            "all"
                    };
                }

                window.PRODUCT_FILTER_MODAL_STATE.safety =
                    target.dataset.safety || "all";

                var safetyButtons =
                    document.querySelectorAll(
                        '[data-action="product-filter-safety"]'
                    );

                safetyButtons.forEach(function(button) {

                    button.classList.toggle(
                        "active",
                        (
                            button.dataset.safety ||
                            "all"
                        ) ===
                        (
                            window.PRODUCT_FILTER_MODAL_STATE.safety ||
                            "all"
                        )
                    );
                });

                break;
            }

            // ============================================================
            // ПРИМЕНИТЬ ФИЛЬТРЫ
            // ============================================================

            case "product-filter-apply": {

                var modalFilterState =
                    window.PRODUCT_FILTER_MODAL_STATE;

                if (modalFilterState) {

                    STATE.productsAgeFilter =
                        modalFilterState.age || null;

                    window.CURRENT_PRODUCT_SAFETY_FILTER =
                        modalFilterState.safety || "all";
                }

                window.PRODUCT_FILTER_MODAL_STATE = null;

                closeModal();

                if (
                    typeof updateProductsList === "function"
                ) {
                    updateProductsList();
                }

                if (
                    typeof updateChipsActiveState === "function"
                ) {
                    updateChipsActiveState();
                }

                break;
            }

            // ============================================================
            // СБРОСИТЬ ФИЛЬТРЫ ВНУТРИ ПАНЕЛИ
            // ============================================================

            case "product-filter-reset": {

                STATE.productsAgeFilter = null;

                window.CURRENT_PRODUCT_SAFETY_FILTER =
                    "all";

                window.PRODUCT_FILTER_MODAL_STATE =
                    null;

                closeModal();

                if (
                    typeof updateProductsList === "function"
                ) {
                    updateProductsList();
                }

                if (
                    typeof updateChipsActiveState === "function"
                ) {
                    updateChipsActiveState();
                }

                break;
            }

            default:
                break;
        }

        return;
    }

    // ============================================================
    // НИЖНЯЯ НАВИГАЦИЯ
    // ============================================================

    var navItem =
        event.target.closest(".nav-item");

    if (navItem) {

        var screen =
            navItem.dataset.screen;

        if (
            screen &&
            typeof window.render === "function"
        ) {
            event.preventDefault();
            window.render(screen);
            return;
        }
    }

    // ============================================================
    // СТАРЫЕ ФИЛЬТРЫ
    // ============================================================

    var filterBtn =
        event.target.closest(".filter-btn");

    if (filterBtn) {

        var category =
            filterBtn.dataset.category;

        if (
            category &&
            typeof window.setProductsFilter === "function"
        ) {
            event.preventDefault();

            window.setProductsFilter(category);

            if (
                typeof window.render === "function"
            ) {
                window.render("products");
            }

            return;
        }
    }

    // ============================================================
    // НАЗАД
    // ============================================================

    var backBtn =
        event.target.closest(".btn-back");

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
            window.render("home");
        }

        return;
    }

    // ============================================================
    // СОЗДАТЬ
    // ============================================================

    var createBtn =
        event.target.closest(".btn-create");

    if (createBtn) {

        event.preventDefault();

        console.log("➕ Создать (заглушка)");

        return;
    }

    // ============================================================
    // ТЕМА
    // ============================================================

    var themeBtn =
        event.target.closest(".theme-toggle");

    if (themeBtn) {

        event.preventDefault();

        if (
            typeof window.toggleTheme === "function"
        ) {
            window.toggleTheme();
        } else {
            console.warn(
                "⚠️ toggleTheme не определена"
            );
        }

        return;
    }
}

function handleDocumentInput(event) {

    var id = event.target.id;

    switch (id) {

        case "product-search":
            searchProducts(event.target.value);
            break;

        case "picker-search":
            searchProductPicker(event.target.value);
            break;

        case "recipe-search":
            searchRecipes(event.target.value);
            break;
    }
}

function handleDocumentChange(event) {

    var target = event.target;

    if (
        target.id === "food-new-product" ||
        target.id === "food-preparation" ||
        target.id === "food-form"
    ) {
        return;
    }
}

function navigateHandler(screen) {

    if (!screen) return;

    showScreen(screen);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================================
// РАБОТА С ПРОДУКТАМИ
// ============================================================

function getProductById(id) {

    if (
        !id ||
        !Array.isArray(window.PRODUCTS)
    ) {
        return null;
    }

    return (
        window.PRODUCTS.find(function(product) {
            return String(product.id) === String(id);
        }) || null
    );
}

function getProductByName(name) {

    if (
        !name ||
        !Array.isArray(window.PRODUCTS)
    ) {
        return null;
    }

    return (
        window.PRODUCTS.find(function(product) {
            return (
                String(product.name).toLowerCase() ===
                String(name).toLowerCase()
            );
        }) || null
    );
}

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПРОФИЛЯ
// ============================================================

function getChildProfile(childId) {

    if (
        window.childService &&
        typeof window.childService.getChildProfile === "function"
    ) {
        try {
            return window.childService.getChildProfile(
                childId
            );
        } catch (e) {
            console.warn(
                "⚠️ childService.getChildProfile error:",
                e
            );
        }
    }

    if (
        window.STATE &&
        window.STATE.children
    ) {

        var child =
            window.STATE.children.find(
                function(c) {
                    return c.id === childId;
                }
            );

        if (child) {

            var profile = {
                id: child.id,
                name: child.name,
                birthDate: child.birthDate,
                sex: child.sex,
                feedingType: child.feedingType,
                ageMonths:
                    getChildAgeMonths(childId)
            };

            if (child.allergies) {
                profile.allergies =
                    child.allergies;
            }

            if (child.readiness) {
                profile.readiness =
                    child.readiness;
            }

            return profile;
        }
    }

    return null;
}

function getChildAgeMonths(childId) {

    if (
        !window.STATE ||
        !window.STATE.children
    ) {
        return 0;
    }

    var child =
        window.STATE.children.find(
            function(c) {
                return c.id === childId;
            }
        );

    if (
        !child ||
        !child.birthDate
    ) {
        return 0;
    }

    var birth =
        new Date(child.birthDate);

    var now =
        new Date();

    var months =
        (
            now.getFullYear() -
            birth.getFullYear()
        ) * 12;

    months +=
        now.getMonth() -
        birth.getMonth();

    if (
        now.getDate() <
        birth.getDate()
    ) {
        months--;
    }

    return Math.max(
        0,
        months
    );
}

function openProductFromCard(productId) {

    var product =
        getProductById(productId);

    if (!product) {

        showToast(
            "Продукт пока не найден в базе.",
            "error"
        );

        return;
    }

    openProductDetails(product);
}

// ============================================================
// МОДАЛКА ПРОДУКТА
// ============================================================

function openProductDetails(product) {

    if (!product) return;

    var modalRoot =
        document.getElementById(
            "modal-root"
        );

    if (!modalRoot) return;

    modalRoot.innerHTML = "";

    var childId =
        window.STATE
            ? window.STATE.currentChildId
            : null;

    var status =
        "notIntroduced";

    if (
        childId &&
        window.productStateService &&
        typeof window.productStateService.getProductState === "function"
    ) {
        try {

            var state =
                window.productStateService.getProductState(
                    childId,
                    product.id
                );

            if (
                state &&
                typeof state === "object"
            ) {
                status =
                    state.status ||
                    "notIntroduced";
            }

        } catch (e) {

            console.warn(
                "Не удалось получить статус продукта:",
                e
            );
        }
    }

    var statusLabel = "";

    switch (status) {

        case "notIntroduced":
            statusLabel =
                "○ Ещё не введён";
            break;

        case "planned":
            statusLabel =
                "🗓 Запланирован";
            break;

        case "introduced":
            statusLabel =
                "✅ Введён";
            break;

        case "suspectedReaction":
            statusLabel =
                "⚠️ Была реакция";
            break;

        case "confirmedAllergy":
            statusLabel =
                "🚫 Аллергия";
            break;

        case "parentExcluded":
            statusLabel =
                "❌ Не хочу вводить";
            break;

        default:
            statusLabel =
                "○ Ещё не введён";
    }

    var ageText = "—";

    if (
        product.introduction &&
        product.introduction.fromMonths
    ) {

        if (
            product.introduction.fromMonths === 4 ||
            product.introduction.fromMonths === 4.5
        ) {
            ageText =
                "С начала прикорма";
        } else {
            ageText =
                "с " +
                product.introduction.fromMonths +
                " мес.";
        }

    } else if (
        product.min_age_months
    ) {

        ageText =
            "с " +
            product.min_age_months +
            " мес.";

    } else if (
        product.min_age
    ) {

        ageText =
            "с " +
            product.min_age +
            " мес.";
    }

    var categoryText =
        product.category ||
        product.cat ||
        "—";

    var ironText =
        (
            product.iron ||
            (
                product.nutrients &&
                product.nutrients.includes("iron")
            )
        )
            ? "✓"
            : "—";

    var desc =
        product.desc ||
        product.description ||
        "";

    var highlightsHtml = "";

    if (
        product.highlights &&
        product.highlights.length
    ) {

        highlightsHtml =
            "<ul>" +
            product.highlights
                .map(function(h) {
                    return (
                        "<li>" +
                        escapeHTML(h) +
                        "</li>"
                    );
                })
                .join("") +
            "</ul>";
    }

    // ============================================================
    // SAFETY ENGINE
    // ============================================================

    var profile = null;

    if (childId) {
        profile =
            getChildProfile(childId);
    }

    var safetyResult = null;

    if (
        profile &&
        window.safetyEngine
    ) {
        try {

            safetyResult =
                window.safetyEngine.evaluateProductSafety(
                    profile,
                    product,
                    null
                );

        } catch (e) {

            console.warn(
                "Safety Engine error:",
                e
            );
        }
    }

    var safetyBlocks = [];

    var reasons =
        (
            safetyResult &&
            safetyResult.reasons
        )
            ? safetyResult.reasons
            : [];

    var uniqueReasons =
        [...new Set(reasons)];

    // Персональная аллергия

    if (
        safetyResult &&
        safetyResult.status === "block" &&
        safetyResult.details?.allergy?.status === "blocked"
    ) {

        var allergenTypesArray =
            Array.isArray(
                safetyResult.details.allergy.types
            )
                ? safetyResult.details.allergy.types
                : (
                    safetyResult.details.allergy.types
                        ? [
                            safetyResult.details.allergy.types
                        ]
                        : []
                );

        var allergenTypesStr =
            allergenTypesArray.length
                ? allergenTypesArray.join(", ")
                : "продукт";

        safetyBlocks.push({
            type: "personal",
            icon: "🚫",
            title: "Не рекомендуется этому ребёнку",
            details:
                "Указана аллергия на: " +
                allergenTypesStr
        });
    }

    // Возраст

    if (
        safetyResult &&
        safetyResult.status === "block" &&
        safetyResult.details?.age?.status === "blocked_by_age"
    ) {

        var ageReason =
            safetyResult.details.age.reason ||
            "продукт не подходит для текущего возраста";

        safetyBlocks.push({
            type: "age",
            icon: "🚫",
            title: "Пока нельзя",
            details:
                "Причина: " +
                ageReason
        });

    } else if (
        safetyResult &&
        safetyResult.status === "block" &&
        safetyResult.details?.age?.status === "too_early"
    ) {

        safetyBlocks.push({
            type: "age",
            icon: "🚫",
            title: "Пока нельзя",
            details:
                "Причина: продукт не подходит для текущего возраста"
        });
    }

    // Другие ограничения

    var otherWarnings =
        uniqueReasons.filter(
            function(r) {

                if (
                    safetyBlocks.some(
                        function(block) {

                            if (
                                block.type === "personal" &&
                                r.includes("аллергия")
                            ) {
                                return true;
                            }

                            if (
                                block.type === "age" &&
                                r.includes("Возраст")
                            ) {
                                return true;
                            }

                            return false;
                        }
                    )
                ) {
                    return false;
                }

                return (
                    r.includes("ртути") ||
                    r.includes("медицинское") ||
                    r.includes("содержит добавленный сахар") ||
                    r.includes("содержит добавленную соль") ||
                    r.includes("ботулизма") ||
                    r.includes("напиток") ||
                    r.includes("мед") ||
                    r.includes("мёд") ||
                    r.includes("Мёд") ||
                    r.includes("коровье молоко")
                );
            }
        );

    if (otherWarnings.length > 0) {

        safetyBlocks.push({
            type: "other",
            icon: "⚠️",
            title: "Важно",
            details:
                otherWarnings.join(". ")
        });
    }

    // Потенциальный аллерген

    var isAllergen =
        product.allergen === true ||
        (
            product.allergenType &&
            product.allergenType.length > 0
        );

    var allergenTypes = [];

    if (product.allergenType) {

        allergenTypes =
            Array.isArray(product.allergenType)
                ? product.allergenType
                : [product.allergenType];
    }

    if (
        isAllergen &&
        !safetyBlocks.some(
            function(block) {
                return block.type === "personal";
            }
        )
    ) {

        var allergenLabel =
            allergenTypes.length > 0
                ? allergenTypes.join(", ")
                : "продукт";

        safetyBlocks.push({
            type: "allergen",
            icon: "🟡",
            title: "Потенциальный аллерген",
            details:
                "Продукт является аллергеном (" +
                allergenLabel +
                "). Вводите с осторожностью."
        });
    }

    var safetyBlocksHtml =
        safetyBlocks
            .map(function(block) {

                var colorClass = "";

                if (
                    block.type === "personal" ||
                    block.type === "age"
                ) {
                    colorClass =
                        "block-danger";
                } else if (
                    block.type === "other" ||
                    block.type === "allergen"
                ) {
                    colorClass =
                        "block-warning";
                }

                return (
                    '<div class="safety-block ' +
                    colorClass +
                    '">' +
                    "<strong>" +
                    block.icon +
                    " " +
                    block.title +
                    "</strong>" +
                    "<p>" +
                    block.details +
                    "</p>" +
                    "</div>"
                );
            })
            .join("");

    // Безопасные формы

    var safeFormsHtml = "";

    if (
        product.safeForms &&
        product.safeForms.length
    ) {

        safeFormsHtml =
            "<div>" +
            "<strong>✓ Как безопасно дать</strong>" +
            "<ul>" +
            product.safeForms
                .map(function(f) {
                    return (
                        "<li>" +
                        escapeHTML(f) +
                        "</li>"
                    );
                })
                .join("") +
            "</ul>" +
            "</div>";
    }

    // Опасные формы

    var unsafeFormsHtml = "";

    if (
        product.unsafeForms &&
        product.unsafeForms.length
    ) {

        unsafeFormsHtml =
            "<div>" +
            "<strong>⚠️ Не давать в таком виде</strong>" +
            "<ul>" +
            product.unsafeForms
                .map(function(f) {
                    return (
                        "<li>" +
                        escapeHTML(f) +
                        "</li>"
                    );
                })
                .join("") +
            "</ul>" +
            "</div>";
    }

    // Интересный факт

    var factHtml = "";

    if (product.interestingFact) {

        factHtml =
            '<div class="fact-block">' +
            "<strong>💡 Интересный факт:</strong>" +
            "<p>" +
            escapeHTML(
                product.interestingFact
            ) +
            "</p>" +
            "</div>";
    }

    // Проверка состава

    var labelChecksHtml = "";

    if (
        product.commercialProduct &&
        product.labelChecks &&
        product.labelChecks.length
    ) {

        var labelMap = {
            addedSugar: "добавленный сахар",
            addedSalt: "добавленная соль",
            honey: "мёд",
            sweeteners: "подсластители",
            unpasteurized: "непастеризовано"
        };

        labelChecksHtml =
            "<div>" +
            "<strong>🛒 Проверьте состав:</strong>" +
            "<ul>" +
            product.labelChecks
                .map(function(check) {
                    return (
                        "<li>⚠️ " +
                        escapeHTML(
                            labelMap[check] ||
                            check
                        ) +
                        "</li>"
                    );
                })
                .join("") +
            "</ul>" +
            "</div>";
    }

    // Кнопка введения

    var showIntroButton =
        status === "notIntroduced" ||
        status === "planned";

    var actionButtonHtml = "";

    if (showIntroButton) {

        actionButtonHtml =
            '<button type="button" ' +
            'class="primary-button" ' +
            'data-action="add-product-intro" ' +
            'data-product-id="' +
            escapeHTML(product.id) +
            '" ' +
            'style="width:100%; padding:12px; border-radius:30px; border:none; background:#F5A88C; color:white; font-size:16px; cursor:pointer;">' +
            "＋ Ввести продукт" +
            "</button>";

    } else {

        var label = "";

        switch (status) {

            case "introduced":
                label = "✅ Уже введён";
                break;

            case "suspectedReaction":
                label = "⚠️ Была реакция";
                break;

            case "confirmedAllergy":
                label = "🚫 Аллергия";
                break;

            case "parentExcluded":
                label = "❌ Не хочу вводить";
                break;

            default:
                label = "Действие недоступно";
        }

        actionButtonHtml =
            '<div style="text-align:center; padding:12px; background:#F5F5F5; border-radius:14px; color:#888;">' +
            label +
            "</div>";
    }

    // ============================================================
    // HTML МОДАЛКИ
    // ============================================================

    var content = `
        <div
            class="modal-sheet"
            style="
                background:white;
                border-radius:20px;
                padding:24px;
                max-width:90%;
                max-height:calc(100vh - 40px);
                overflow-y:auto;
                -webkit-overflow-scrolling:touch;
                box-shadow:0 4px 20px rgba(0,0,0,0.2);
                position:relative;
                margin:auto;
                width:100%;
                flex-shrink:1;
                min-height:0;
            "
        >
            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    margin-bottom:16px;
                "
            >
                <span style="font-size:48px;">
                    ${product.emoji || "🍽️"}
                </span>

                <h2
                    style="
                        margin:0;
                        font-size:24px;
                        flex:1;
                    "
                >
                    ${escapeHTML(product.name)}
                </h2>

                <button
                    type="button"
                    class="btn-close-modal"
                    style="
                        color:#333;
                        font-size:32px;
                        font-weight:bold;
                        background:transparent;
                        border:none;
                        cursor:pointer;
                        padding:0 8px;
                        line-height:1;
                        flex-shrink:0;
                    "
                >
                    ×
                </button>
            </div>

            <div
                style="
                    display:flex;
                    gap:8px;
                    margin-bottom:16px;
                    flex-wrap:wrap;
                "
            >
                <span style="color:#888;">
                    Категория:
                </span>

                <strong>
                    ${escapeHTML(categoryText)}
                </strong>

                <span style="color:#888;">
                    Возраст:
                </span>

                <strong>
                    ${escapeHTML(ageText)}
                </strong>

                <span style="color:#888;">
                    Железо:
                </span>

                <strong>
                    ${ironText}
                </strong>
            </div>

            <div style="margin-bottom:12px;">
                <strong>
                    Статус для ребёнка:
                </strong>

                ${statusLabel}
            </div>

            ${
                desc
                    ? `
                        <div style="margin-bottom:12px;">
                            <strong>О продукте</strong>
                            <p>${escapeHTML(desc)}</p>
                        </div>
                    `
                    : ""
            }

            ${
                highlightsHtml
                    ? `
                        <div style="margin-bottom:12px;">
                            <strong>🧠 Польза</strong>
                            ${highlightsHtml}
                        </div>
                    `
                    : ""
            }

            ${safetyBlocksHtml}

            ${safeFormsHtml}

            ${unsafeFormsHtml}

            ${factHtml}

            ${labelChecksHtml}

            <div style="margin-top:16px;">
                ${actionButtonHtml}
            </div>
        </div>
    `;

    var overlay =
        document.createElement("div");

    overlay.className =
        "modal-overlay";

    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(74, 58, 48, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 1;
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
        pointer-events: auto;
        overscroll-behavior: contain;
    `;

    overlay.innerHTML =
        content;

    overlay.addEventListener(
        "click",
        function(e) {

            if (e.target === overlay) {
                modalRoot.innerHTML = "";
            }
        }
    );

    modalRoot.appendChild(
        overlay
    );

    var keyHandler =
        function(e) {

            if (e.key === "Escape") {

                modalRoot.innerHTML = "";

                document.removeEventListener(
                    "keydown",
                    keyHandler
                );
            }
        };

    document.addEventListener(
        "keydown",
        keyHandler
    );
}

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ
// ============================================================

function toggleFavoriteHandler(productId) {

    if (!productId) return;

    toggleFavoriteProduct(
        productId
    );

    var isFavorite =
        STATE.products.favorites.includes(
            productId
        );

    showToast(
        isFavorite
            ? "Добавлено в любимые ❤️"
            : "Убрано из любимых",
        "success"
    );

    if (
        typeof renderProducts === "function"
    ) {
        renderProducts();
    }
}

var CURRENT_PRODUCTS_TAB =
    "all";

function changeProductsTab(tab) {

    CURRENT_PRODUCTS_TAB =
        tab || "all";

    document
        .querySelectorAll(".product-tab")
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.tab ===
                CURRENT_PRODUCTS_TAB
            );
        });

    if (
        typeof renderProducts === "function"
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

    if (
        typeof window.setProductsFilter === "function"
    ) {

        window.setProductsFilter(
            category
        );

        if (
            typeof window.render === "function"
        ) {
            window.render("products");
        }

        return;
    }

    CURRENT_PRODUCT_CATEGORY =
        category || "all";

    document
        .querySelectorAll(
            "[data-action='product-category']"
        )
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                CURRENT_PRODUCT_CATEGORY
            );
        });

    if (
        typeof renderProducts === "function"
    ) {
        renderProducts();
    }
}

var CURRENT_PRODUCT_SEARCH =
    "";

function searchProducts(value) {

    if (
        typeof window.setProductsSearch === "function" &&
        typeof window.updateProductsList === "function"
    ) {

        window.setProductsSearch(
            value
        );

        window.updateProductsList();

        return;
    }

    CURRENT_PRODUCT_SEARCH =
        String(value || "")
            .trim()
            .toLowerCase();

    if (
        typeof renderProducts === "function"
    ) {
        renderProducts();
    }
}

function clearProductSearch() {

    var input =
        document.getElementById(
            "product-search"
        );

    if (input) {
        input.value = "";
    }

    CURRENT_PRODUCT_SEARCH =
        "";

    if (
        typeof renderProducts === "function"
    ) {
        renderProducts();
    }
}

var CURRENT_FOOD_SOURCE =
    "homemade";

function changeFoodSource(source) {

    CURRENT_FOOD_SOURCE =
        source || "homemade";

    document
        .querySelectorAll(
            "[data-action='food-source']"
        )
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.source ===
                CURRENT_FOOD_SOURCE
            );
        });

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
            CURRENT_FOOD_SOURCE !== "store";
    }

    if (homemadeFields) {
        homemadeFields.hidden =
            CURRENT_FOOD_SOURCE !== "homemade";
    }
}

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
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.liked ===
                String(liked)
            );
        });
}

// ============================================================
// SAVE FOOD
// ============================================================

function saveFoodHandler() {

    var productId =
        document
            .getElementById(
                "food-product-id"
            )?.value;

    var product =
        getProductById(
            productId
        );

    var customName =
        document
            .getElementById(
                "food-product-title"
            )?.value
            ?.trim();

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
        document
            .getElementById(
                "food-amount"
            )?.value;

    var form =
        document
            .getElementById(
                "food-form"
            )?.value;

    var preparation =
        document
            .getElementById(
                "food-preparation"
            )?.value;

    var notes =
        document
            .getElementById(
                "food-notes"
            )?.value
            ?.trim();

    var brand =
        document
            .getElementById(
                "food-brand"
            )?.value
            ?.trim();

    var packageSize =
        document
            .getElementById(
                "food-package-size"
            )?.value;

    var ingredients =
        document
            .getElementById(
                "food-ingredients"
            )?.value
            ?.trim();

    var isNew =
        document
            .getElementById(
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
                        hour: "2-digit",
                        minute: "2-digit"
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
            CURRENT_FOOD_SOURCE === "store"
                ? brand || ""
                : "",

        packageSize:
            packageSize
                ? Number(packageSize)
                : null,

        ingredients:
            CURRENT_FOOD_SOURCE === "store"
                ? ingredients || ""
                : "",

        preparation:
            CURRENT_FOOD_SOURCE === "homemade"
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

    var childId =
        window.STATE.currentChildId;

    if (!childId) {

        showToast(
            "Не выбран ребёнок",
            "error"
        );

        return;
    }

    var child =
        window.STATE.children.find(
            function(c) {
                return c.id === childId;
            }
        );

    if (!child) {

        showToast(
            "Ребёнок не найден",
            "error"
        );

        return;
    }

    if (
        !Array.isArray(child.diary)
    ) {
        child.diary = [];
    }

    child.diary.push(
        entry
    );

    if (
        CURRENT_FOOD_SOURCE === "store" &&
        brand
    ) {

        if (
            !Array.isArray(
                window.STATE.brands
            )
        ) {
            window.STATE.brands = [];
        }

        var brandExists =
            window.STATE.brands.some(
                function(item) {

                    return (
                        String(item)
                            .toLowerCase() ===
                        brand.toLowerCase()
                    );
                }
            );

        if (!brandExists) {
            window.STATE.brands.push(
                brand
            );
        }
    }

    if (
        typeof saveState === "function"
    ) {
        saveState();
    }

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

// ============================================================
// PRODUCT PICKER
// ============================================================

function renderProductPicker(query) {

    var container =
        document.getElementById(
            "picker-products"
        );

    if (!container) return;

    if (
        !Array.isArray(
            window.PRODUCTS
        )
    ) {

        container.innerHTML =
            emptyState(
                "🥑",
                "База продуктов не подключена",
                "Добавьте данные PRODUCTS."
            );

        return;
    }

    var normalized =
        String(query || "")
            .trim()
            .toLowerCase();

    var list =
        window.PRODUCTS.filter(
            function(product) {

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
            .map(function(product) {

                return (
                    '<button type="button" ' +
                    'class="picker-product" ' +
                    'data-action="choose-picker-product" ' +
                    'data-product-id="' +
                    escapeHTML(product.id) +
                    '">' +

                    "<span>" +
                    (product.emoji || "🥣") +
                    "</span>" +

                    "<strong>" +
                    escapeHTML(product.name) +
                    "</strong>" +

                    "<span>" +
                    icon("arrow") +
                    "</span>" +

                    "</button>"
                );
            })
            .join("");
}

function searchProductPicker(
    query
) {
    renderProductPicker(
        query
    );
}

function openDiaryAddModal() {
    openAddFoodModal();
}

// ============================================================
// DIARY EDIT
// ============================================================

function openDiaryEditModal(
    entryId
) {

    var diary =
        typeof getDiary === "function"
            ? getDiary()
            : [];

    var entry =
        diary.find(
            function(item) {
                return (
                    String(item.id) ===
                    String(entryId)
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

// ============================================================
// DAILY PLAN
// ============================================================

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
        typeof renderDailyPlan === "function"
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

    if (!element) return;

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
                    day: "numeric",
                    month: "long"
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
        function() {

            if (input.value) {

                CURRENT_DATE =
                    new Date(
                        input.value +
                        "T12:00:00"
                    );

                updateTodayDate();

                if (
                    typeof renderDailyPlan === "function"
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

// ============================================================
// RECIPES
// ============================================================

var CURRENT_RECIPE_CATEGORY =
    "all";

function changeRecipeCategory(
    category
) {

    CURRENT_RECIPE_CATEGORY =
        category || "all";

    document
        .querySelectorAll(
            "[data-action='recipe-category']"
        )
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                CURRENT_RECIPE_CATEGORY
            );
        });

    if (
        typeof renderRecipes === "function"
    ) {
        renderRecipes();
    }
}

function searchRecipes(
    query
) {

    window.CURRENT_RECIPE_SEARCH =
        String(query || "")
            .trim()
            .toLowerCase();

    if (
        typeof renderRecipes === "function"
    ) {
        renderRecipes();
    }
}

// ============================================================
// BABY EDIT MODAL
// ============================================================

function openBabyEditModal() {

    var baby =
        typeof window.getCurrentChild === "function"
            ? window.getCurrentChild()
            : STATE.baby || {};

    var root =
        document.getElementById(
            "modal-root"
        );

    if (!root) return;

    root.innerHTML =

        '<div class="modal-overlay" data-action="close-modal">' +

        '<div class="modal-sheet" data-modal-content>' +

        '<div class="modal-header">' +

        "<h2>Профиль малыша</h2>" +

        '<button type="button" class="icon-button" data-action="close-modal">×</button>' +

        "</div>" +

        '<div class="modal-body">' +

        '<label class="form-label">' +
        'Имя малыша' +
        '<input id="baby-name-input" value="' +
        escapeHTML(baby.name || "") +
        '" placeholder="Имя">' +
        "</label>" +

        '<label class="form-label">' +
        'Дата рождения' +
        '<input id="baby-birth-input" type="date" value="' +
        escapeHTML(baby.birthDate || "") +
        '">' +
        "</label>" +

        '<label class="form-label">' +
        "Тип кормления" +
        '<select id="baby-feeding-input">' +

        '<option value="ГВ"' +
        (
            baby.feedingType === "ГВ"
                ? " selected"
                : ""
        ) +
        ">Грудное вскармливание</option>" +

        '<option value="ИВ"' +
        (
            baby.feedingType === "ИВ"
                ? " selected"
                : ""
        ) +
        ">Искусственное</option>" +

        '<option value="Смешанное"' +
        (
            baby.feedingType === "Смешанное"
                ? " selected"
                : ""
        ) +
        ">Смешанное</option>" +

        "</select>" +

        "</label>" +

        '<button type="button" class="primary-button full-width" data-action="save-baby">' +
        "Сохранить" +
        "</button>" +

        "</div>" +

        "</div>" +

        "</div>";
}

// ============================================================
// SETTINGS
// ============================================================

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
                typeof openReadinessModal === "function"
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
                function(state) {
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
                typeof setTheme === "function"
            ) {

                var current =
                    typeof getTheme === "function"
                        ? getTheme()
                        : "light";

                setTheme(
                    current === "light"
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
                    feedingStarted: false,
                    feedingStartDate: "",
                    approach: "mixed",
                    readiness: {},
                    onboarding: {
                        allergies: [],
                        diet: [],
                        favoriteFoods: [],
                        worries: [],
                        confidence: ""
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
                    typeof saveState === "function"
                ) {
                    saveState();
                }
            }

            if (
                typeof render === "function"
            ) {
                render(
                    "onboarding"
                );
            }

            break;
        }
    }
}

// ============================================================
// RESET
// ============================================================

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
        function() {
            location.reload();
        },
        300
    );
}

// ============================================================
// ADD CHILD MODAL
// ============================================================

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
                    style="
                        width:100%;
                        padding:12px;
                        border:1px solid var(--border-input);
                        border-radius:8px;
                        margin-top:4px;
                    "
                >
            </div>

            <div style="margin:16px 0;">
                <label>Дата рождения</label>

                <input
                    type="date"
                    id="add-child-birth"
                    style="
                        width:100%;
                        padding:12px;
                        border:1px solid var(--border-input);
                        border-radius:8px;
                        margin-top:4px;
                    "
                >
            </div>

            <div style="margin:16px 0;">
                <label>Пол</label>

                <select
                    id="add-child-sex"
                    style="
                        width:100%;
                        padding:12px;
                        border:1px solid var(--border-input);
                        border-radius:8px;
                        margin-top:4px;
                    "
                >
                    <option value="">Не указан</option>
                    <option value="male">Мальчик</option>
                    <option value="female">Девочка</option>
                </select>
            </div>

            <div
                style="
                    display:flex;
                    gap:12px;
                    margin-top:20px;
                    flex-wrap:wrap;
                "
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

    overlay.addEventListener(
        "click",
        function(e) {

            if (e.target === overlay) {

                overlay.remove();

                document.body.classList.remove(
                    "modal-open"
                );
            }
        }
    );

    overlay
        .querySelector(
            '[data-action="close-modal"]'
        )
        .addEventListener(
            "click",
            function() {

                overlay.remove();

                document.body.classList.remove(
                    "modal-open"
                );
            }
        );

    overlay
        .querySelector(
            "#skip-onboarding-btn"
        )
        .addEventListener(
            "click",
            function() {

                var name =
                    document
                        .getElementById(
                            "add-child-name"
                        )
                        ?.value
                        .trim() ||
                    "Ребёнок";

                var birthDate =
                    document
                        .getElementById(
                            "add-child-birth"
                        )
                        ?.value ||
                    "";

                var sex =
                    document
                        .getElementById(
                            "add-child-sex"
                        )
                        ?.value ||
                    "";

                if (!birthDate) {

                    alert(
                        "Пожалуйста, укажите дату рождения"
                    );

                    return;
                }

                var newChild =
                    null;

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
                        allergies: [],
                        diet: [],
                        favoriteFoods: [],
                        worries: [],
                        confidence: ""
                    }
                };

                if (
                    typeof childService !== "undefined" &&
                    childService.createChild
                ) {

                    newChild =
                        childService.createChild(
                            childData
                        );

                } else if (
                    typeof window.addChild === "function"
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

                    STATE.ui.screen =
                        "baby";

                    STATE.navigation.currentScreen =
                        "baby";

                    if (
                        typeof saveState === "function"
                    ) {
                        saveState();
                    }
                }

                if (
                    typeof render === "function"
                ) {
                    render(
                        "baby"
                    );
                }

                showToast(
                    "👶 Ребёнок добавлен (онбординг пропущен)",
                    "success"
                );
            }
        );

    overlay
        .querySelector(
            "#save-child-btn"
        )
        .addEventListener(
            "click",
            function() {

                var name =
                    document
                        .getElementById(
                            "add-child-name"
                        )
                        ?.value
                        .trim() ||
                    "Ребёнок";

                var birthDate =
                    document
                        .getElementById(
                            "add-child-birth"
                        )
                        ?.value ||
                    "";

                var sex =
                    document
                        .getElementById(
                            "add-child-sex"
                        )
                        ?.value ||
                    "";

                if (!birthDate) {

                    alert(
                        "Пожалуйста, укажите дату рождения"
                    );

                    return;
                }

                var newChild =
                    null;

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
                        allergies: [],
                        diet: [],
                        favoriteFoods: [],
                        worries: [],
                        confidence: ""
                    }
                };

                if (
                    typeof childService !== "undefined" &&
                    childService.createChild
                ) {

                    newChild =
                        childService.createChild(
                            childData
                        );

                } else if (
                    typeof window.addChild === "function"
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

                    STATE._onboardingChildId =
                        newChild.id;

                    STATE.currentChildId =
                        newChild.id;

                    STATE.ui.screen =
                        "onboarding";

                    STATE.navigation.currentScreen =
                        "onboarding";

                    if (
                        typeof saveState === "function"
                    ) {
                        saveState();
                    }
                }

                if (
                    typeof render === "function"
                ) {
                    render(
                        "onboarding"
                    );
                }
            }
        );
}

// ============================================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ============================================================

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

console.log(
    "✅ handlers.js загружен — финальная версия"
);