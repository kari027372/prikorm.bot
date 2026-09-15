// ============================================================
// handlers.js – централизованный обработчик событий
// ============================================================

(function() {
    'use strict';

    // ===== БЕЗОПАСНЫЙ ВЫЗОВ ФУНКЦИЙ =====
    function safeCall(fn, fallback) {
        if (typeof fn === 'function') {
            try {
                return fn();
            } catch (e) {
                console.warn('Ошибка вызова:', e);
            }
        }
        if (typeof fallback === 'function') return fallback();
        return null;
    }

    function safeCallWith(fn, arg, fallback) {
        if (typeof fn === 'function') {
            try {
                return fn(arg);
            } catch (e) {
                console.warn('Ошибка вызова:', e);
            }
        }
        if (typeof fallback === 'function') return fallback(arg);
        return null;
    }

    // ============================================================
    // P0.1 — ЕДИНАЯ ПРОВЕРКА БЕЗОПАСНОСТИ ПЕРЕД ВВЕДЕНИЕМ ПРОДУКТА
    // Fail-closed: при любой проблеме введение НЕ разрешаем.
    // ============================================================
    function checkIntroSafety(childId, productId) {
        var product = Array.isArray(window.PRODUCTS)
            ? window.PRODUCTS.find(function(p) {
                return p.id === productId;
            })
            : null;

        if (!product) {
            return {
                can: false,
                reason: 'Продукт не найден'
            };
        }

        if (
            !window.childService ||
            typeof window.childService.getChildProfile !== 'function'
        ) {
            return {
                can: false,
                reason: 'Сервис профиля недоступен'
            };
        }

        var profile = null;

        try {
            profile = window.childService.getChildProfile(childId);
        } catch (e) {
            console.warn(
                'checkIntroSafety: getChildProfile error',
                e
            );

            return {
                can: false,
                reason: 'Ошибка получения профиля'
            };
        }

        if (!profile) {
            return {
                can: false,
                reason: 'Профиль ребёнка недоступен'
            };
        }

        if (
            !window.safetyEngine ||
            typeof window.safetyEngine.evaluateProductSafety !== 'function'
        ) {
            return {
                can: false,
                reason: 'Safety Engine недоступен'
            };
        }

        var result = null;

        try {
            result = window.safetyEngine.evaluateProductSafety(
                profile,
                product,
                null
            );
        } catch (e) {
            console.warn(
                'checkIntroSafety: safety error',
                e
            );

            return {
                can: false,
                reason: 'Ошибка оценки безопасности'
            };
        }

        // P0.1: некорректный результат Safety = запрет,
        // а не разрешение.
        if (!result || !result.recommendation) {
            return {
                can: false,
                reason: 'Safety вернул некорректный результат'
            };
        }

        if (result.recommendation.canRecommend === false) {
            return {
                can: false,
                reason:
                    (result.reasons && result.reasons[0]) ||
                    'Введение продукта не разрешено'
            };
        }

        return {
            can: true,
            reason: ''
        };
    }

    // ===== ОСНОВНОЙ ОБРАБОТЧИК =====
    function handleDocumentClick(event) {
        var target = event.target.closest('[data-action]');
        if (!target) return;

        var action = target.getAttribute('data-action');
        var screen = target.getAttribute('data-screen') || null;
        var productId = target.getAttribute('data-product-id') || null;
        var category = target.getAttribute('data-category') || null;
        var filter = target.getAttribute('data-filter') || null;
        var age = target.getAttribute('data-age') || null;
        var childId = target.getAttribute('data-child-id') || null;
        var entryId = target.getAttribute('data-entry-id') || null;
        var recipeId = target.getAttribute('data-recipe-id') || null;

        // ===== НАВИГАЦИЯ =====
        if (action === 'navigate' && screen) {
            if (typeof window.navigateTo === 'function') {
                window.navigateTo(screen);
            } else if (typeof window.renderScreen === 'function') {
                window.renderScreen(screen);
            } else if (typeof window.showScreen === 'function') {
                window.showScreen(screen);

                // Сохраняем состояние после переключения экрана
                if (typeof window.saveState === 'function') {
                    window.saveState();
                }
            } else {
                console.warn(
                    'Неизвестная функция навигации, screen:',
                    screen
                );
            }

            return;
        }

        // ===== ОСТАЛЬНЫЕ ДЕЙСТВИЯ =====
        switch (action) {

            // ========================================================
            // ПРОДУКТЫ
            // ========================================================

            case 'select-product':
                if (
                    productId &&
                    typeof window.showProductDetailModal === 'function'
                ) {
                    window.showProductDetailModal(productId);
                }
                break;

            // ========================================================
            // P0.1 — ВВЕДЕНИЕ ПРОДУКТА ЧЕРЕЗ SAFETY ENGINE
            // ========================================================

            case 'add-product-intro':
                if (productId) {
                    var introChildId = null;

                    if (
                        typeof window.getCurrentChildId === 'function'
                    ) {
                        introChildId =
                            window.getCurrentChildId();
                    } else if (
                        window.STATE &&
                        typeof window.STATE.currentChildId !== 'undefined'
                    ) {
                        introChildId =
                            window.STATE.currentChildId;
                    }

                    if (!introChildId) {
                        if (
                            typeof window.showToast === 'function'
                        ) {
                            window.showToast(
                                'Выберите ребёнка',
                                'error'
                            );
                        }

                        break;
                    }

                    // Сначала Safety.
                    var introGate = checkIntroSafety(
                        introChildId,
                        productId
                    );

                    if (!introGate.can) {
                        console.warn(
                            'Safety blocked intro:',
                            introGate.reason
                        );

                        if (
                            typeof window.showToast === 'function'
                        ) {
                            window.showToast(
                                introGate.reason,
                                'error'
                            );
                        }

                        break;
                    }

                    // Только после успешного Safety —
                    // изменение Product State.
                    if (
                        window.productStateService &&
                        typeof window.productStateService.markAsIntroduced === 'function'
                    ) {
                        var result =
                            window.productStateService.markAsIntroduced(
                                introChildId,
                                productId
                            );

                        if (result === true) {
                            if (
                                typeof window.updateProductsList === 'function'
                            ) {
                                window.updateProductsList();
                            } else if (
                                typeof updateProductsList === 'function'
                            ) {
                                updateProductsList();
                            }
                        } else {
                            console.warn(
                                'Не удалось отметить продукт как введённый'
                            );
                        }
                    } else {
                        console.warn(
                            'productStateService.markAsIntroduced не доступен'
                        );
                    }
                }

                break;

            case 'show-product-menu':
                if (
                    productId &&
                    typeof window.showProductMenu === 'function'
                ) {
                    window.showProductMenu(productId);
                } else {
                    console.warn(
                        'showProductMenu не определён'
                    );
                }

                break;

            case 'filter-products':
                var state = window.STATE || {};

                if (
                    filter !== null &&
                    filter !== undefined
                ) {
                    state.productsFilter = filter;
                }

                if (
                    category !== null &&
                    category !== undefined
                ) {
                    state.productsCategoryFilter =
                        category || null;
                }

                if (
                    age !== null &&
                    age !== undefined
                ) {
                    state.productsAgeFilter =
                        age || null;
                }

                if (
                    typeof window.updateProductsList === 'function'
                ) {
                    window.updateProductsList();
                } else if (
                    typeof updateProductsList === 'function'
                ) {
                    updateProductsList();
                } else {
                    console.warn(
                        'updateProductsList не определён'
                    );
                }

                if (
                    typeof window.updateChipsActiveState === 'function'
                ) {
                    window.updateChipsActiveState();
                } else if (
                    typeof updateChipsActiveState === 'function'
                ) {
                    updateChipsActiveState();
                }

                break;

            // ===== ФИЛЬТРЫ (только открытие модалки) =====

            case 'toggle-suitable':
                window.CURRENT_PRODUCT_SUITABLE =
                    !window.CURRENT_PRODUCT_SUITABLE;

                var toggleEl =
                    document.querySelector(
                        '[data-action="toggle-suitable"]'
                    );

                if (toggleEl) {
                    toggleEl.classList.toggle(
                        'active',
                        window.CURRENT_PRODUCT_SUITABLE === true
                    );
                }

                if (
                    typeof window.updateProductsList === 'function'
                ) {
                    window.updateProductsList();
                } else if (
                    typeof updateProductsList === 'function'
                ) {
                    updateProductsList();
                }

                break;

            case 'open-filters':
                var filtersFn =
                    window.openFiltersModal ||
                    window.openProductFiltersModal;

                if (filtersFn) {
                    filtersFn();
                } else {
                    console.warn(
                        'openFiltersModal не определён'
                    );
                }

                break;

            case 'open-product-filters':
                var productFiltersFn =
                    window.openProductFiltersModal ||
                    window.openFiltersModal;

                if (productFiltersFn) {
                    productFiltersFn();
                } else {
                    console.warn(
                        'openProductFiltersModal не определён'
                    );
                }

                break;

            // ===== ПОИСК =====

            case 'search-products':
                var query = target.value || '';

                window.CURRENT_PRODUCT_SEARCH =
                    query;

                if (
                    typeof window.updateProductsList === 'function'
                ) {
                    window.updateProductsList();
                }

                break;

            case 'clear-search':
                var searchInput =
                    document.getElementById(
                        'product-search'
                    );

                if (searchInput) {
                    searchInput.value = '';
                    window.CURRENT_PRODUCT_SEARCH = '';

                    if (
                        typeof window.updateProductsList === 'function'
                    ) {
                        window.updateProductsList();
                    }
                }

                break;

            // ========================================================
            // ДНЕВНИК
            // ========================================================

            case 'add-diary':
            case 'add-diary-entry':
                if (
                    typeof window.openAddFoodModal === 'function'
                ) {
                    window.openAddFoodModal();
                } else {
                    console.warn(
                        'openAddFoodModal не определён'
                    );
                }

                break;

            // ========================================================
            // P0.1 — SAVE FOOD
            //
            // Запись в дневник сохраняется.
            // Но переход продукта в introduced происходит
            // только после Safety.
            // ========================================================

            case 'save-food':
                // Сохранение записи в дневник текущего ребёнка
                var diaryChildId =
                    window.STATE?.currentChildId;

                if (!diaryChildId) {
                    if (
                        typeof window.showToast === 'function'
                    ) {
                        window.showToast(
                            'Выберите ребёнка',
                            'error'
                        );
                    }

                    break;
                }

                var child =
                    window.STATE.children.find(function(c) {
                        return c.id === diaryChildId;
                    });

                if (!child) break;

                if (!Array.isArray(child.diary)) {
                    child.diary = [];
                }

                // Получаем данные из формы
                var foodProductId =
                    document.getElementById(
                        'food-product-id'
                    )?.value;

                var amount =
                    document.getElementById(
                        'food-amount'
                    )?.value;

                var preparation =
                    document.getElementById(
                        'food-preparation'
                    )?.value;

                var notes =
                    document.getElementById(
                        'food-notes'
                    )?.value;

                var isNewProduct =
                    document.getElementById(
                        'food-new-product'
                    )?.checked || false;

                // Определяем liked
                var liked = null;

                var likedTrueBtn =
                    document.querySelector(
                        '[data-liked="true"]'
                    );

                var likedFalseBtn =
                    document.querySelector(
                        '[data-liked="false"]'
                    );

                if (
                    likedTrueBtn &&
                    likedTrueBtn.classList.contains('active')
                ) {
                    liked = true;
                } else if (
                    likedFalseBtn &&
                    likedFalseBtn.classList.contains('active')
                ) {
                    liked = false;
                }

                // Определяем source
                var source = 'homemade';

                var sourceHomemade =
                    document.querySelector(
                        '[data-source="homemade"]'
                    );

                var sourceStore =
                    document.querySelector(
                        '[data-source="store"]'
                    );

                if (
                    sourceStore &&
                    sourceStore.classList.contains('active')
                ) {
                    source = 'store';
                } else if (
                    sourceHomemade &&
                    sourceHomemade.classList.contains('active')
                ) {
                    source = 'homemade';
                }

                // Определяем название продукта
                var productName = '';

                var selectedLabel =
                    document.getElementById(
                        'selected-product-label'
                    );

                var productTitleField =
                    document.getElementById(
                        'food-product-title'
                    );

                if (
                    selectedLabel &&
                    selectedLabel.textContent &&
                    selectedLabel.textContent !==
                        'Выберите продукт'
                ) {
                    productName =
                        selectedLabel.textContent;
                } else if (
                    productTitleField &&
                    productTitleField.value &&
                    productTitleField.value.trim() !== ''
                ) {
                    productName =
                        productTitleField.value.trim();
                } else {
                    productName = 'Продукт';
                }

                // Создаём запись
                var entry = {
                    id: 'diary_' + Date.now(),
                    date:
                        new Date()
                            .toISOString()
                            .split('T')[0],
                    time:
                        new Date()
                            .toTimeString()
                            .slice(0, 5),
                    productId:
                        foodProductId || null,
                    productName:
                        productName,
                    source:
                        source,
                    amount:
                        amount
                            ? parseFloat(amount)
                            : null,
                    unit: 'г',
                    preparation:
                        preparation || '',
                    liked:
                        liked,
                    isNewProduct:
                        isNewProduct,
                    notes:
                        notes || '',
                    hasReaction:
                        false,
                    reaction:
                        null,
                    createdAt:
                        new Date().toISOString()
                };

                child.diary.push(entry);

                // ====================================================
                // P0.1:
                // новый продукт НЕ становится introduced напрямую.
                //
                // Если Safety запрещает:
                // - запись дневника сохраняется;
                // - Product State не переводится в introduced.
                // ====================================================

                if (
                    isNewProduct &&
                    foodProductId &&
                    window.productStateService &&
                    typeof window.productStateService.markAsIntroduced === 'function'
                ) {
                    var gateFromDiary =
                        checkIntroSafety(
                            diaryChildId,
                            foodProductId
                        );

                    if (gateFromDiary.can) {
                        window.productStateService.markAsIntroduced(
                            diaryChildId,
                            foodProductId
                        );
                    } else {
                        console.warn(
                            'Safety blocked intro from save-food:',
                            gateFromDiary.reason
                        );
                    }
                }

                if (
                    typeof window.saveState === 'function'
                ) {
                    window.saveState();
                }

                if (
                    typeof window.closeModal === 'function'
                ) {
                    window.closeModal();
                }

                // Отдельный re-render здесь НЕ нужен:
                // saveState() уже dispatch'ит prikorm:statechange,
                // а app.js обновляет текущий экран через этот механизм.

                break;

            case 'select-diary-entry':
                if (
                    entryId &&
                    typeof window.showDiaryEntryDetail === 'function'
                ) {
                    window.showDiaryEntryDetail(
                        entryId
                    );
                }

                break;

            // ========================================================
            // P0.3 — СОХРАНЕНИЕ РЕАКЦИИ В PRODUCT STATE
            //
            // UI-триггер здесь НЕ создаём.
            // Если существующий UI уже отдаёт
            // data-action="save-reaction",
            // этот обработчик передаст реакцию
            // в productStateService.addReaction().
            // ========================================================

            case 'save-reaction':
                var reactionChildId =
                    window.STATE &&
                    window.STATE.currentChildId
                        ? window.STATE.currentChildId
                        : null;

                if (!reactionChildId) {
                    if (
                        typeof window.showToast === 'function'
                    ) {
                        window.showToast(
                            'Выберите ребёнка',
                            'error'
                        );
                    }

                    break;
                }

                if (!productId) {
                    console.warn(
                        'save-reaction: нет data-product-id'
                    );
                    break;
                }

                if (
                    !window.productStateService ||
                    typeof window.productStateService.addReaction !== 'function'
                ) {
                    console.warn(
                        'productStateService.addReaction недоступен'
                    );
                    break;
                }

                var symptomsAttr =
                    target.getAttribute(
                        'data-symptoms'
                    ) || '';

                var severityAttr =
                    target.getAttribute(
                        'data-severity'
                    ) || 'mild';

                var notesAttr =
                    target.getAttribute(
                        'data-notes'
                    ) || '';

                var reactionPayload = {
                    date:
                        new Date()
                            .toISOString()
                            .split('T')[0],

                    symptoms:
                        symptomsAttr
                            ? symptomsAttr
                                .split(',')
                                .map(function(s) {
                                    return s.trim();
                                })
                                .filter(Boolean)
                            : [],

                    severity:
                        severityAttr,

                    action:
                        'monitor',

                    notes:
                        notesAttr
                };

                var reactionOk =
                    window.productStateService.addReaction(
                        reactionChildId,
                        productId,
                        reactionPayload
                    );

                if (reactionOk) {
                    if (
                        typeof window.saveState === 'function'
                    ) {
                        window.saveState();
                    }

                    if (
                        typeof window.closeModal === 'function'
                    ) {
                        window.closeModal();
                    }

                    if (
                        typeof window.updateProductsList === 'function'
                    ) {
                        window.updateProductsList();
                    }

                    // Home обновится автоматически
                    // через prikorm:statechange.
                } else {
                    console.warn(
                        'addReaction вернул false'
                    );

                    if (
                        typeof window.showToast === 'function'
                    ) {
                        window.showToast(
                            'Не удалось сохранить реакцию',
                            'error'
                        );
                    }
                }

                break;

            // ========================================================
            // РЕЦЕПТЫ
            // ========================================================

            case 'open-recipe':
                if (
                    recipeId &&
                    typeof window.showRecipeDetail === 'function'
                ) {
                    window.showRecipeDetail(
                        recipeId
                    );
                } else {
                    console.warn(
                        'showRecipeDetail не реализован'
                    );

                    if (
                        typeof window.showToast === 'function'
                    ) {
                        window.showToast(
                            'Рецепт временно недоступен',
                            'error'
                        );
                    }
                }

                break;

            // ========================================================
            // РЕБЁНОК
            // ========================================================

            case 'switch-child':
                if (
                    childId &&
                    typeof window.switchChild === 'function'
                ) {
                    window.switchChild(childId);
                }

                break;

            case 'delete-child':
                if (
                    childId &&
                    typeof window.deleteChild === 'function'
                ) {
                    if (
                        confirm(
                            'Удалить этого ребёнка?'
                        )
                    ) {
                        window.deleteChild(
                            childId
                        );
                    }
                }

                break;

            case 'add-child':
                if (
                    typeof window.showAddChildModal === 'function'
                ) {
                    window.showAddChildModal();
                }

                break;

            case 'edit-baby':
                if (
                    typeof window.showEditBabyModal === 'function'
                ) {
                    window.showEditBabyModal();
                }

                break;

            // ========================================================
            // НАСТРОЙКИ
            // ========================================================

            case 'toggle-notifications':
                if (window.STATE) {
                    window.STATE.settings.notifications =
                        !window.STATE.settings.notifications;

                    if (
                        typeof window.saveState === 'function'
                    ) {
                        window.saveState();
                    }

                    var settingsContainer =
                        document.getElementById(
                            'screen-settings'
                        );

                    if (
                        settingsContainer &&
                        typeof window.renderSettings === 'function'
                    ) {
                        settingsContainer.innerHTML =
                            window.renderSettings();
                    }
                }

                break;

            case 'toggle-theme':
                if (window.STATE) {
                    window.STATE.settings.theme =
                        (
                            window.STATE.settings.theme ===
                            'dark'
                        )
                            ? 'light'
                            : 'dark';

                    if (
                        typeof window.saveState === 'function'
                    ) {
                        window.saveState();
                    }

                    document.documentElement.setAttribute(
                        'data-theme',
                        window.STATE.settings.theme
                    );

                    var settingsContainer2 =
                        document.getElementById(
                            'screen-settings'
                        );

                    if (
                        settingsContainer2 &&
                        typeof window.renderSettings === 'function'
                    ) {
                        settingsContainer2.innerHTML =
                            window.renderSettings();
                    }
                }

                break;

            case 'configure-home':
                if (
                    typeof window.showHomeConfigModal === 'function'
                ) {
                    window.showHomeConfigModal();
                }

                break;

            case 'reset-data':
                if (
                    confirm(
                        'Вы уверены? Все данные будут сброшены!'
                    )
                ) {
                    if (
                        typeof window.resetAllData === 'function'
                    ) {
                        window.resetAllData();
                    }
                }

                break;

            // ========================================================
            // ОБЩЕЕ
            // ========================================================

            case 'start-meal':
                var mealFn =
                    window.showAddDiaryModal ||
                    window.startMeal;

                if (mealFn) {
                    mealFn();
                } else {
                    console.warn(
                        'showAddDiaryModal не определён'
                    );
                }

                break;

            case 'settings':
                var navFn =
                    window.navigateTo ||
                    window.renderScreen ||
                    window.showScreen;

                if (navFn) {
                    navFn('settings');
                }

                break;

            // ========================================================
            // НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ФИЛЬТРОВ
            // ========================================================

            case 'product-filter-age':
                if (
                    typeof window.updateTempAgeFilter === 'function'
                ) {
                    window.updateTempAgeFilter(
                        target.getAttribute(
                            'data-value'
                        )
                    );
                }

                break;

            case 'product-filter-safety':
                if (
                    typeof window.updateTempSafetyFilter === 'function'
                ) {
                    window.updateTempSafetyFilter(
                        target.getAttribute(
                            'data-value'
                        )
                    );
                }

                break;

            case 'product-filter-apply':
                if (
                    typeof window.applyProductFilters === 'function'
                ) {
                    window.applyProductFilters();
                }

                break;

            case 'product-filter-reset':
                if (
                    typeof window.resetProductFilters === 'function'
                ) {
                    window.resetProductFilters();
                }

                break;

            case 'close-modal':
                if (
                    typeof window.closeModal === 'function'
                ) {
                    window.closeModal();
                } else {
                    var modalRoot =
                        document.getElementById(
                            'modal-root'
                        );

                    if (modalRoot) {
                        modalRoot.innerHTML = '';
                    }
                }

                break;

            // ========================================================
            // ПОКАЗ ВВЕДЁННЫХ ПРОДУКТОВ
            // ========================================================

            case 'show-introduced-products':
                var currentChildId = null;

                if (
                    typeof window.getCurrentChildId === 'function'
                ) {
                    currentChildId =
                        window.getCurrentChildId();
                } else if (
                    window.STATE &&
                    typeof window.STATE.currentChildId !== 'undefined'
                ) {
                    currentChildId =
                        window.STATE.currentChildId;
                }

                if (!currentChildId) {
                    if (
                        typeof window.showToast === 'function'
                    ) {
                        window.showToast(
                            'Выберите ребёнка',
                            'error'
                        );
                    }

                    break;
                }

                var products =
                    window.PRODUCTS || [];

                var introducedProducts = [];

                products.forEach(function(p) {
                    var status =
                        window.getProductStatusForChild
                            ? window.getProductStatusForChild(
                                p.id,
                                currentChildId
                            )
                            : null;

                    if (status === 'introduced') {
                        introducedProducts.push(p);
                    }
                });

                if (
                    introducedProducts.length === 0
                ) {
                    if (
                        typeof window.showToast === 'function'
                    ) {
                        window.showToast(
                            'Нет введённых продуктов',
                            'info'
                        );
                    }

                    break;
                }

                var modalContent =
                    '<div class="modal-overlay active">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<h2>Введённые продукты</h2>' +
                    '<button class="modal-close" data-action="close-modal">×</button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<div class="introduced-list">';

                introducedProducts.forEach(function(p) {
                    var emoji =
                        p.emoji || '🍽️';

                    modalContent +=
                        '<div class="introduced-item">' +
                        '<span class="ii-emoji">' +
                        emoji +
                        '</span>' +
                        '<span class="ii-name">' +
                        p.name +
                        '</span>' +
                        '</div>';
                });

                modalContent +=
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

                var modalRoot =
                    document.getElementById(
                        'modal-root'
                    );

                if (modalRoot) {
                    modalRoot.innerHTML =
                        modalContent;
                }

                break;

            // ========================================================
            // ИСКЛЮЧИТЬ / ВЕРНУТЬ ПРОДУКТ
            // ========================================================

            case 'exclude-product':
                if (
                    productId &&
                    window.productStateService &&
                    typeof window.productStateService.setStatus === 'function'
                ) {
                    var excludeChildId =
                        window.STATE?.currentChildId;

                    if (!excludeChildId) {
                        if (
                            typeof window.showToast === 'function'
                        ) {
                            window.showToast(
                                'Выберите ребёнка',
                                'error'
                            );
                        }

                        break;
                    }

                    window.productStateService.setStatus(
                        excludeChildId,
                        productId,
                        'parentExcluded'
                    );

                    if (
                        typeof window.saveState === 'function'
                    ) {
                        window.saveState();
                    }

                    if (
                        typeof window.updateProductsList === 'function'
                    ) {
                        window.updateProductsList();
                    }

                    if (
                        typeof window.closeModal === 'function'
                    ) {
                        window.closeModal();
                    }
                }

                break;

            case 'include-product':
                if (
                    productId &&
                    window.productStateService &&
                    typeof window.productStateService.setStatus === 'function'
                ) {
                    var includeChildId =
                        window.STATE?.currentChildId;

                    if (!includeChildId) {
                        if (
                            typeof window.showToast === 'function'
                        ) {
                            window.showToast(
                                'Выберите ребёнка',
                                'error'
                            );
                        }

                        break;
                    }

                    window.productStateService.setStatus(
                        includeChildId,
                        productId,
                        'notIntroduced'
                    );

                    if (
                        typeof window.saveState === 'function'
                    ) {
                        window.saveState();
                    }

                    if (
                        typeof window.updateProductsList === 'function'
                    ) {
                        window.updateProductsList();
                    }

                    if (
                        typeof window.closeModal === 'function'
                    ) {
                        window.closeModal();
                    }
                }

                break;

            default:
                console.warn(
                    'Неизвестное действие:',
                    action,
                    target
                );
        }
    }

    // ===== РЕГИСТРАЦИЯ ОБРАБОТЧИКОВ =====
    document.addEventListener(
        'click',
        handleDocumentClick
    );

    // ===== ЦЕНТРАЛИЗОВАННЫЙ ОБРАБОТЧИК ПОИСКА (input) =====
    document.addEventListener(
        'input',
        function(e) {
            var target =
                e.target.closest(
                    '#product-search'
                );

            if (target) {
                var query =
                    target.value || '';

                if (
                    typeof window.setProductsSearch === 'function'
                ) {
                    window.setProductsSearch(
                        query
                    );
                }
            }
        }
    );

    console.log(
        '✅ handlers.js загружен (централизованный, безопасный)'
    );
})();