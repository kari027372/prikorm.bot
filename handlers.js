// ============================================================
// handlers.js — централизованный обработчик событий
// ============================================================

(function() {
    'use strict';

    /**
     * Основной обработчик кликов на document
     * Использует data-action для маршрутизации
     */
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

        // Если есть screen — это переход
        if (action === 'navigate') {
            navigateTo(screen);
            return;
        }

        switch (action) {
            // ===== НАВИГАЦИЯ =====
            case 'navigate':
                // уже обработано выше
                break;

            // ===== ПРОДУКТЫ =====
            case 'select-product':
                if (productId) {
                    showProductDetail(productId);
                }
                break;

            case 'add-product-intro':
                if (productId) {
                    markProductAsIntroduced(productId);
                }
                break;

            case 'show-product-menu':
                if (productId) {
                    showProductMenu(productId);
                }
                break;

            case 'filter-products':
                if (target.hasAttribute('data-filter')) {
                    window.STATE.productsFilter = filter || 'all';
                }

                if (target.hasAttribute('data-category')) {
                    window.STATE.productsCategoryFilter = category || null;
                }

                if (target.hasAttribute('data-age')) {
                    window.STATE.productsAgeFilter = age || null;
                }

                if (typeof updateProductsList === 'function') {
                    updateProductsList();
                }

                updateChipsActiveState();
                break;

            // ===== ФИЛЬТРЫ =====
            case 'toggle-suitable':
                window.CURRENT_PRODUCT_SUITABLE = !window.CURRENT_PRODUCT_SUITABLE;
                var toggleEl = document.querySelector('[data-action="toggle-suitable"]');
                if (toggleEl) {
                    toggleEl.classList.toggle('active', window.CURRENT_PRODUCT_SUITABLE === true);
                }
                if (typeof updateProductsList === 'function') {
                    updateProductsList();
                }
                break;

            case 'open-filters':
                if (typeof openFiltersModal === 'function') {
                    openFiltersModal();
                } else {
                    showToast('Фильтры временно недоступны', 'error');
                }
                break;

            case 'open-product-filters':
                if (typeof openProductFiltersModal === 'function') {
                    openProductFiltersModal();
                } else {
                    showToast('Функция фильтров временно недоступна', 'error');
                }
                break;

            case 'product-filter-age':
                var ageValue = target.getAttribute('data-value');
                window.STATE.productsAgeFilter = ageValue || null;
                if (typeof updateProductsList === 'function') updateProductsList();
                updateChipsActiveState();
                break;

            case 'product-filter-safety':
                var safetyValue = target.getAttribute('data-value');
                window.CURRENT_PRODUCT_SAFETY_FILTER = safetyValue || 'all';
                if (typeof updateProductsList === 'function') updateProductsList();
                updateChipsActiveState();
                break;

            case 'product-filter-apply':
                // Применяем фильтры из модалки
                if (typeof updateProductsList === 'function') updateProductsList();
                updateChipsActiveState();
                break;

            case 'product-filter-reset':
                window.STATE.productsAgeFilter = null;
                window.CURRENT_PRODUCT_SAFETY_FILTER = 'all';
                if (typeof updateProductsList === 'function') updateProductsList();
                updateChipsActiveState();
                break;

            // ===== ПОИСК =====
            case 'search-products':
                var query = target.value || '';
                window.CURRENT_PRODUCT_SEARCH = query;
                if (typeof updateProductsList === 'function') updateProductsList();
                break;

            case 'clear-search':
                var searchInput = document.getElementById('product-search');
                if (searchInput) {
                    searchInput.value = '';
                    window.CURRENT_PRODUCT_SEARCH = '';
                    if (typeof updateProductsList === 'function') updateProductsList();
                }
                break;

            // ===== ДНЕВНИК =====
            case 'add-diary':
                if (typeof showAddDiaryModal === 'function') {
                    showAddDiaryModal();
                } else {
                    showToast('Дневник временно недоступен', 'error');
                }
                break;

            case 'add-diary-entry':
                if (typeof showAddDiaryModal === 'function') {
                    showAddDiaryModal();
                } else {
                    showToast('Добавление записи временно недоступно', 'error');
                }
                break;

            case 'select-diary-entry':
                if (entryId && typeof showDiaryEntryDetail === 'function') {
                    showDiaryEntryDetail(entryId);
                } else {
                    showToast('Просмотр записи временно недоступен', 'error');
                }
                break;

            // ===== РЕЦЕПТЫ =====
            case 'open-recipe':
                if (recipeId && typeof showRecipeDetail === 'function') {
                    showRecipeDetail(recipeId);
                } else {
                    showToast('Рецепт временно недоступен', 'error');
                }
                break;

            // ===== РЕБЁНОК =====
            case 'switch-child':
                if (childId && typeof switchChild === 'function') {
                    switchChild(childId);
                } else {
                    showToast('Переключение ребёнка временно недоступно', 'error');
                }
                break;

            case 'delete-child':
                if (childId && typeof deleteChild === 'function') {
                    if (confirm('Удалить этого ребёнка?')) {
                        deleteChild(childId);
                    }
                } else {
                    showToast('Удаление временно недоступно', 'error');
                }
                break;

            case 'add-child':
                if (typeof showAddChildModal === 'function') {
                    showAddChildModal();
                } else {
                    showToast('Добавление ребёнка временно недоступно', 'error');
                }
                break;

            case 'edit-baby':
                if (typeof showEditBabyModal === 'function') {
                    showEditBabyModal();
                } else {
                    showToast('Редактирование временно недоступно', 'error');
                }
                break;

            // ===== НАСТРОЙКИ =====
            case 'toggle-notifications':
                window.STATE.settings.notifications = !window.STATE.settings.notifications;
                if (typeof saveState === 'function') saveState();
                if (typeof renderSettings === 'function') {
                    var settingsContainer = document.getElementById('screen-settings');
                    if (settingsContainer) settingsContainer.innerHTML = renderSettings();
                }
                break;

            case 'toggle-theme':
                window.STATE.settings.theme = (window.STATE.settings.theme === 'dark') ? 'light' : 'dark';
                if (typeof saveState === 'function') saveState();
                applyTheme(window.STATE.settings.theme);
                if (typeof renderSettings === 'function') {
                    var settingsContainer = document.getElementById('screen-settings');
                    if (settingsContainer) settingsContainer.innerHTML = renderSettings();
                }
                break;

            case 'configure-home':
                if (typeof showHomeConfigModal === 'function') {
                    showHomeConfigModal();
                } else {
                    showToast('Настройка главного экрана временно недоступна', 'error');
                }
                break;

            case 'reset-data':
                if (confirm('Вы уверены? Все данные будут сброшены!')) {
                    if (typeof resetAllData === 'function') {
                        resetAllData();
                    } else {
                        showToast('Сброс временно недоступен', 'error');
                    }
                }
                break;

            // ===== ОБЩЕЕ =====
            case 'start-meal':
                if (typeof showAddDiaryModal === 'function') {
                    showAddDiaryModal();
                } else {
                    showToast('Начать приём пищи временно недоступно', 'error');
                }
                break;

            case 'settings':
                navigateTo('settings');
                break;

            default:
                console.warn('Неизвестное действие:', action, target);
        }
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    function navigateTo(screen) {
        if (!screen) return;

        // Обновляем состояние
        if (window.STATE) {
            window.STATE.navigation = window.STATE.navigation || {};
            window.STATE.navigation.currentScreen = screen;
        }

        // Вызываем рендеринг
        if (typeof window.renderScreen === 'function') {
            window.renderScreen(screen);
        } else if (typeof renderScreen === 'function') {
            renderScreen(screen);
        } else {
            console.warn('renderScreen не найдена');
        }
    }

    function updateChipsActiveState() {
        // Просто прокси к функции, если она существует
        if (typeof window.updateChipsActiveState === 'function') {
            window.updateChipsActiveState();
        }
    }

    function showToast(message, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console.log('[Toast]', message);
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // ===== ПРОКСИ ДЛЯ ФУНКЦИЙ (если они не определены) =====
    // Эти функции должны быть определены в других файлах, но если нет — логируем
    var proxy = function(name) {
        return function() {
            console.warn('Функция не определена:', name);
        };
    };

    window.showProductDetail = window.showProductDetail || proxy('showProductDetail');
    window.markProductAsIntroduced = window.markProductAsIntroduced || proxy('markProductAsIntroduced');
    window.showProductMenu = window.showProductMenu || proxy('showProductMenu');
    window.openFiltersModal = window.openFiltersModal || proxy('openFiltersModal');
    window.openProductFiltersModal = window.openProductFiltersModal || proxy('openProductFiltersModal');
    window.showAddDiaryModal = window.showAddDiaryModal || proxy('showAddDiaryModal');
    window.showDiaryEntryDetail = window.showDiaryEntryDetail || proxy('showDiaryEntryDetail');
    window.showRecipeDetail = window.showRecipeDetail || proxy('showRecipeDetail');
    window.switchChild = window.switchChild || proxy('switchChild');
    window.deleteChild = window.deleteChild || proxy('deleteChild');
    window.showAddChildModal = window.showAddChildModal || proxy('showAddChildModal');
    window.showEditBabyModal = window.showEditBabyModal || proxy('showEditBabyModal');
    window.showHomeConfigModal = window.showHomeConfigModal || proxy('showHomeConfigModal');
    window.resetAllData = window.resetAllData || proxy('resetAllData');
    window.saveState = window.saveState || proxy('saveState');

    // ===== РЕГИСТРАЦИЯ ГЛОБАЛЬНОГО ОБРАБОТЧИКА =====
    document.addEventListener('click', handleDocumentClick);

    console.log('✅ handlers.js загружен (централизованный обработчик)');

})();