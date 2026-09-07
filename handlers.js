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
            // Попробуем разные варианты переключения экранов
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
                    // Получить текущего ребёнка
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
                            // Обновить список продуктов
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
                // Обновить список
                if (typeof window.updateProductsList === 'function') {
                    window.updateProductsList();
                } else if (typeof updateProductsList === 'function') {
                    updateProductsList();
                } else {
                    console.warn('updateProductsList не определён');
                }
                // Обновить активные чипсы
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
                var diaryFn = window.showAddDiaryModal || window.showAddDiary;
                if (diaryFn) diaryFn();
                else console.warn('showAddDiaryModal не определён');
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
                    // Временно заглушка, пока нет реализации
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
                // Навигация в settings
                var navFn = window.navigateTo || window.renderScreen || window.showScreen;
                if (navFn) navFn('settings');
                break;

            default:
                console.warn('Неизвестное действие:', action, target);
        }
    }

    // ===== РЕГИСТРАЦИЯ ОБРАБОТЧИКА =====
    document.addEventListener('click', handleDocumentClick);

    console.log('✅ handlers.js загружен (централизованный, безопасный)');
})();