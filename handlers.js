// ============================================================
// handlers.js — централизованный обработчик событий
// ============================================================

(function() {
    'use strict';

    // ===== БЕЗОПАСНЫЙ ВЫЗОВ ФУНКЦИЙ =====
    function safeCall(fn, fallback) {
        if (typeof fn === 'function') {
            try { return fn(); } catch (e) { console.warn('Ошибка вызова:', e); }
        }
        if (typeof fallback === 'function') return fallback();
        return null;
    }

    function safeCallWith(fn, arg, fallback) {
        if (typeof fn === 'function') {
            try { return fn(arg); } catch (e) { console.warn('Ошибка вызова:', e); }
        }
        if (typeof fallback === 'function') return fallback(arg);
        return null;
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
            } else {
                console.warn('Неизвестная функция навигации, screen:', screen);
            }
            return;
        }

        // ===== ОСТАЛЬНЫЕ ДЕЙСТВИЯ =====
        switch (action) {
            // ===== ПРОДУКТЫ =====
            case 'select-product':
                if (productId && typeof window.showProductDetailModal === 'function') {
                    window.showProductDetailModal(productId);
                }
                break;

            case 'add-product-intro':
                if (productId) {
                    var childId = null;
                    if (typeof window.getCurrentChildId === 'function') {
                        childId = window.getCurrentChildId();
                    } else if (window.STATE && typeof window.STATE.currentChildId !== 'undefined') {
                        childId = window.STATE.currentChildId;
                    }
                    if (!childId) {
                        console.warn('Нет активного ребёнка для введения продукта');
                        break;
                    }
                    if (window.productStateService && typeof window.productStateService.markAsIntroduced === 'function') {
                        var result = window.productStateService.markAsIntroduced(childId, productId);
                        if (result === true) {
                            if (typeof window.updateProductsList === 'function') {
                                window.updateProductsList();
                            } else if (typeof updateProductsList === 'function') {
                                updateProductsList();
                            }
                        } else {
                            console.warn('Не удалось отметить продукт как введённый');
                        }
                    } else {
                        console.warn('productStateService.markAsIntroduced не доступен');
                    }
                }
                break;

            case 'show-product-menu':
                if (productId && typeof window.showProductMenu === 'function') {
                    window.showProductMenu(productId);
                } else {
                    console.warn('showProductMenu не определён');
                }
                break;

            case 'filter-products':
                var state = window.STATE || {};
                if (filter !== null && filter !== undefined) {
                    state.productsFilter = filter;
                }
                if (category !== null && category !== undefined) {
                    state.productsCategoryFilter = category || null;
                }
                if (age !== null && age !== undefined) {
                    state.productsAgeFilter = age || null;
                }
                if (typeof window.updateProductsList === 'function') {
                    window.updateProductsList();
                } else if (typeof updateProductsList === 'function') {
                    updateProductsList();
                } else {
                    console.warn('updateProductsList не определён');
                }
                if (typeof window.updateChipsActiveState === 'function') {
                    window.updateChipsActiveState();
                } else if (typeof updateChipsActiveState === 'function') {
                    updateChipsActiveState();
                }
                break;

            // ===== ФИЛЬТРЫ (только открытие модалки) =====
            case 'toggle-suitable':
                window.CURRENT_PRODUCT_SUITABLE = !window.CURRENT_PRODUCT_SUITABLE;
                var toggleEl = document.querySelector('[data-action="toggle-suitable"]');
                if (toggleEl) {
                    toggleEl.classList.toggle('active', window.CURRENT_PRODUCT_SUITABLE === true);
                }
                if (typeof window.updateProductsList === 'function') {
                    window.updateProductsList();
                } else if (typeof updateProductsList === 'function') {
                    updateProductsList();
                }
                break;

            case 'open-filters':
                var filtersFn = window.openFiltersModal || window.openProductFiltersModal;
                if (filtersFn) filtersFn();
                else console.warn('openFiltersModal не определён');
                break;

            case 'open-product-filters':
                var productFiltersFn = window.openProductFiltersModal || window.openFiltersModal;
                if (productFiltersFn) productFiltersFn();
                else console.warn('openProductFiltersModal не определён');
                break;

            // ===== ПОИСК =====
            case 'search-products':
                var query = target.value || '';
                window.CURRENT_PRODUCT_SEARCH = query;
                if (typeof window.updateProductsList === 'function') window.updateProductsList();
                break;

            case 'clear-search':
                var searchInput = document.getElementById('product-search');
                if (searchInput) {
                    searchInput.value = '';
                    window.CURRENT_PRODUCT_SEARCH = '';
                    if (typeof window.updateProductsList === 'function') window.updateProductsList();
                }
                break;

            // ===== ДНЕВНИК =====
            case 'add-diary':
            case 'add-diary-entry':
                if (typeof window.openAddFoodModal === 'function') {
                    window.openAddFoodModal();
                } else {
                    console.warn('openAddFoodModal не определён');
                }
                break;

            case 'save-food':
                // Сохранение записи в дневник текущего ребёнка
                var childId = window.STATE?.currentChildId;
                if (!childId) {
                    if (typeof window.showToast === 'function') window.showToast('Выберите ребёнка', 'error');
                    break;
                }
                var child = window.STATE.children.find(function(c) { return c.id === childId; });
                if (!child) break;
                if (!Array.isArray(child.diary)) child.diary = [];

                // Получаем данные из формы
                var productId = document.getElementById('food-product-id')?.value;
                var amount = document.getElementById('food-amount')?.value;
                var preparation = document.getElementById('food-preparation')?.value;
                var notes = document.getElementById('food-notes')?.value;
                var isNewProduct = document.getElementById('food-new-product')?.checked || false;

                // Определяем liked
                var liked = null;
                var likedTrueBtn = document.querySelector('[data-liked="true"]');
                var likedFalseBtn = document.querySelector('[data-liked="false"]');
                if (likedTrueBtn && likedTrueBtn.classList.contains('active')) liked = true;
                else if (likedFalseBtn && likedFalseBtn.classList.contains('active')) liked = false;

                // Определяем source
                var source = 'homemade';
                var sourceHomemade = document.querySelector('[data-source="homemade"]');
                var sourceStore = document.querySelector('[data-source="store"]');
                if (sourceStore && sourceStore.classList.contains('active')) source = 'store';
                else if (sourceHomemade && sourceHomemade.classList.contains('active')) source = 'homemade';

                // Определяем название продукта
                var productName = '';
                var selectedLabel = document.getElementById('selected-product-label');
                var productTitleField = document.getElementById('food-product-title');
                if (selectedLabel && selectedLabel.textContent && selectedLabel.textContent !== 'Выберите продукт') {
                    productName = selectedLabel.textContent;
                } else if (productTitleField && productTitleField.value && productTitleField.value.trim() !== '') {
                    productName = productTitleField.value.trim();
                } else {
                    productName = 'Продукт';
                }

                // Создаём запись
                var entry = {
                    id: 'diary_' + Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().slice(0, 5),
                    productId: productId || null,
                    productName: productName,
                    source: source,
                    amount: amount ? parseFloat(amount) : null,
                    unit: 'г',
                    preparation: preparation || '',
                    liked: liked,
                    isNewProduct: isNewProduct,
                    notes: notes || '',
                    hasReaction: false,
                    reaction: null,
                    createdAt: new Date().toISOString()
                };
                child.diary.push(entry);

                // Если это новый продукт и есть productId — отмечаем как введённый
                if (isNewProduct && productId && window.productStateService && typeof window.productStateService.markAsIntroduced === 'function') {
                    window.productStateService.markAsIntroduced(childId, productId);
                }

                if (typeof window.saveState === 'function') window.saveState();
                if (typeof window.closeModal === 'function') window.closeModal();

                // Обновляем экран Diary, если он открыт
                if (window.STATE?.ui?.screen === 'diary' && typeof window.showScreen === 'function') {
                    window.showScreen('diary');
                }
                break;

            case 'select-diary-entry':
                if (entryId && typeof window.showDiaryEntryDetail === 'function') {
                    window.showDiaryEntryDetail(entryId);
                }
                break;

            // ===== РЕЦЕПТЫ =====
            case 'open-recipe':
                if (recipeId && typeof window.showRecipeDetail === 'function') {
                    window.showRecipeDetail(recipeId);
                } else {
                    console.warn('showRecipeDetail не реализован');
                    if (typeof window.showToast === 'function') {
                        window.showToast('Рецепт временно недоступен', 'error');
                    }
                }
                break;

            // ===== РЕБЁНОК =====
            case 'switch-child':
                if (childId && typeof window.switchChild === 'function') {
                    window.switchChild(childId);
                }
                break;

            case 'delete-child':
                if (childId && typeof window.deleteChild === 'function') {
                    if (confirm('Удалить этого ребёнка?')) {
                        window.deleteChild(childId);
                    }
                }
                break;

            case 'add-child':
                if (typeof window.showAddChildModal === 'function') {
                    window.showAddChildModal();
                }
                break;

            case 'edit-baby':
                if (typeof window.showEditBabyModal === 'function') {
                    window.showEditBabyModal();
                }
                break;

            // ===== НАСТРОЙКИ =====
            case 'toggle-notifications':
                if (window.STATE) {
                    window.STATE.settings.notifications = !window.STATE.settings.notifications;
                    if (typeof window.saveState === 'function') window.saveState();
                    var settingsContainer = document.getElementById('screen-settings');
                    if (settingsContainer && typeof window.renderSettings === 'function') {
                        settingsContainer.innerHTML = window.renderSettings();
                    }
                }
                break;

            case 'toggle-theme':
                if (window.STATE) {
                    window.STATE.settings.theme = (window.STATE.settings.theme === 'dark') ? 'light' : 'dark';
                    if (typeof window.saveState === 'function') window.saveState();
                    document.documentElement.setAttribute('data-theme', window.STATE.settings.theme);
                    var settingsContainer2 = document.getElementById('screen-settings');
                    if (settingsContainer2 && typeof window.renderSettings === 'function') {
                        settingsContainer2.innerHTML = window.renderSettings();
                    }
                }
                break;

            case 'configure-home':
                if (typeof window.showHomeConfigModal === 'function') {
                    window.showHomeConfigModal();
                }
                break;

            case 'reset-data':
                if (confirm('Вы уверены? Все данные будут сброшены!')) {
                    if (typeof window.resetAllData === 'function') {
                        window.resetAllData();
                    }
                }
                break;

            // ===== ОБЩЕЕ =====
            case 'start-meal':
                var mealFn = window.showAddDiaryModal || window.startMeal;
                if (mealFn) mealFn();
                else console.warn('showAddDiaryModal не определён');
                break;

            case 'settings':
                var navFn = window.navigateTo || window.renderScreen || window.showScreen;
                if (navFn) navFn('settings');
                break;

            // ===== НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ФИЛЬТРОВ =====
            case 'product-filter-age':
                if (typeof window.updateTempAgeFilter === 'function') {
                    window.updateTempAgeFilter(target.getAttribute('data-value'));
                }
                break;

            case 'product-filter-safety':
                if (typeof window.updateTempSafetyFilter === 'function') {
                    window.updateTempSafetyFilter(target.getAttribute('data-value'));
                }
                break;

            case 'product-filter-apply':
                if (typeof window.applyProductFilters === 'function') {
                    window.applyProductFilters();
                }
                break;

            case 'product-filter-reset':
                if (typeof window.resetProductFilters === 'function') {
                    window.resetProductFilters();
                }
                break;

            case 'close-modal':
                if (typeof window.closeModal === 'function') {
                    window.closeModal();
                } else {
                    var modalRoot = document.getElementById('modal-root');
                    if (modalRoot) modalRoot.innerHTML = '';
                }
                break;

            // ===== ПОКАЗ ВВЕДЁННЫХ ПРОДУКТОВ =====
            case 'show-introduced-products':
                var currentChildId = null;
                if (typeof window.getCurrentChildId === 'function') {
                    currentChildId = window.getCurrentChildId();
                } else if (window.STATE && typeof window.STATE.currentChildId !== 'undefined') {
                    currentChildId = window.STATE.currentChildId;
                }
                if (!currentChildId) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Выберите ребёнка', 'error');
                    }
                    break;
                }
                var products = window.PRODUCTS || [];
                var introducedProducts = [];
                products.forEach(function(p) {
                    var status = window.getProductStatusForChild ? window.getProductStatusForChild(p.id, currentChildId) : null;
                    if (status === 'introduced') {
                        introducedProducts.push(p);
                    }
                });
                if (introducedProducts.length === 0) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Нет введённых продуктов', 'info');
                    }
                    break;
                }
                var modalContent = '<div class="modal-sheet" style="max-width:400px;margin:0 auto;background:var(--kenora-white);border-radius:var(--kenora-radius-xl) var(--kenora-radius-xl) 0 0;">';
                modalContent += '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid var(--kenora-border);">';
                modalContent += '<h2 style="font-size:20px;font-weight:600;margin:0;color:var(--kenora-text);">Введённые продукты</h2>';
                modalContent += '<button class="btn-close-modal" data-action="close-modal" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--kenora-text-secondary);padding:4px 8px;">×</button>';
                modalContent += '</div>';
                modalContent += '<div style="padding:16px 20px;max-height:50vh;overflow-y:auto;">';
                introducedProducts.forEach(function(p) {
                    var emoji = p.emoji || '🍽️';
                    modalContent += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--kenora-border);">';
                    modalContent += '<span style="font-size:24px;">' + emoji + '</span>';
                    modalContent += '<span style="font-weight:600;color:var(--kenora-text);">' + p.name + '</span>';
                    modalContent += '</div>';
                });
                modalContent += '</div>';
                modalContent += '</div>';

                var modalRoot = document.getElementById('modal-root');
                if (modalRoot) {
                    modalRoot.innerHTML = '<div class="modal-overlay active" style="align-items:center;justify-content:center;">' + modalContent + '</div>';
                }
                break;

            // ===== НОВЫЕ: ИСКЛЮЧИТЬ / ВЕРНУТЬ ПРОДУКТ =====
            case 'exclude-product':
                if (productId && window.productStateService && typeof window.productStateService.setStatus === 'function') {
                    var childId = window.STATE?.currentChildId;
                    if (!childId) {
                        if (typeof window.showToast === 'function') window.showToast('Выберите ребёнка', 'error');
                        break;
                    }
                    window.productStateService.setStatus(childId, productId, 'parentExcluded');
                    if (typeof window.saveState === 'function') window.saveState();
                    if (typeof window.updateProductsList === 'function') window.updateProductsList();
                    if (typeof window.closeModal === 'function') window.closeModal();
                }
                break;

            case 'include-product':
                if (productId && window.productStateService && typeof window.productStateService.setStatus === 'function') {
                    var childId = window.STATE?.currentChildId;
                    if (!childId) {
                        if (typeof window.showToast === 'function') window.showToast('Выберите ребёнка', 'error');
                        break;
                    }
                    window.productStateService.setStatus(childId, productId, 'notIntroduced');
                    if (typeof window.saveState === 'function') window.saveState();
                    if (typeof window.updateProductsList === 'function') window.updateProductsList();
                    if (typeof window.closeModal === 'function') window.closeModal();
                }
                break;

            default:
                console.warn('Неизвестное действие:', action, target);
        }
    }

    // ===== РЕГИСТРАЦИЯ ОБРАБОТЧИКОВ =====
    document.addEventListener('click', handleDocumentClick);

    // ===== ЦЕНТРАЛИЗОВАННЫЙ ОБРАБОТЧИК ПОИСКА (input) =====
    document.addEventListener('input', function(e) {
        var target = e.target.closest('#product-search');
        if (target) {
            var query = target.value || '';
            if (typeof window.setProductsSearch === 'function') {
                window.setProductsSearch(query);
            }
        }
    });

    console.log('✅ handlers.js загружен (централизованный, безопасный)');
})();