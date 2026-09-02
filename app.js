/* ============================================================
   app.js v2.1.1 — улучшенная точка запуска
   Исправления:
   • Убран двойной рендер
   • Исправлены ключи localStorage (соответствуют config.js)
   • Добавлена защита от недоступного localStorage
   • Graceful degradation при отсутствии модулей
   • Оптимизирован normalizeState
   • Добавлены обработчики online/offline
   • buildAppShell используется корректно
   ============================================================ */

(function() {
    'use strict';

    const DEFAULT_SCREEN = 'home';
    const STORAGE_KEYS = {
        state: 'prikorm_app_state',
        child: 'prikorm_child',
        products: 'prikorm_products',
        diary: 'prikorm_diary',
        plan: 'prikorm_plan',
        reactions: 'prikorm_reactions',
        recipes: 'prikorm_recipes',
        shopping: 'prikorm_shopping',
        settings: 'prikorm_settings',
        theme: 'prikorm_theme'
    };

    /* ============================================================
       БЕЗОПАСНЫЙ localStorage
       ============================================================ */
    const Storage = {
        _available: null,
        isAvailable() {
            if (this._available !== null) return this._available;
            try {
                const test = '__prikorm_test__';
                localStorage.setItem(test, '1');
                localStorage.removeItem(test);
                this._available = true;
                return true;
            } catch (e) {
                this._available = false;
                console.warn('⚠️ localStorage недоступен (приватный режим?)');
                return false;
            }
        },
        get(key) {
            if (!this.isAvailable()) return null;
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('Ошибка чтения localStorage:', e);
                return null;
            }
        },
        set(key, value) {
            if (!this.isAvailable()) return false;
            try {
                localStorage.setItem(key, value);
                return true;
            } catch (e) {
                console.warn('Ошибка записи localStorage:', e);
                return false;
            }
        },
        remove(key) {
            if (!this.isAvailable()) return false;
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Ошибка удаления localStorage:', e);
                return false;
            }
        },
        clearAll() {
            if (!this.isAvailable()) return false;
            try {
                Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
                // Legacy keys
                localStorage.removeItem('prikorm_state');
                localStorage.removeItem('prikorm_profile');
                return true;
            } catch (e) {
                console.warn('Ошибка очистки localStorage:', e);
                return false;
            }
        }
    };

    /* ============================================================
       БЕЗОПАСНЫЙ ДОСТУП К ГЛОБАЛЬНЫМ МОДУЛЯМ
       ============================================================ */
    function safeGlobal(name, fallback) {
        return typeof window[name] !== 'undefined' ? window[name] : fallback;
    }

    function safeCall(fnName, ...args) {
        const fn = window[fnName];
        if (typeof fn === 'function') {
            try {
                return fn(...args);
            } catch (e) {
                console.error(`❌ Ошибка в ${fnName}:`, e);
                return undefined;
            }
        }
        return undefined;
    }

    /* ============================================================
       APP SHELL
       ============================================================ */
    function buildAppShell() {
        const app = document.getElementById('app');
        if (!app) {
            console.error('❌ Не найден #app');
            return false;
        }
        app.innerHTML = `
            <div id="app-content" class="app-content"></div>
            <div id="modal-root" aria-hidden="true"></div>
            <div id="toast-root" aria-live="polite" aria-atomic="true"></div>
            <div id="offline-indicator" class="offline-indicator hidden" role="status">
                <span>📴 Нет подключения к интернету</span>
            </div>
        `;
        return true;
    }

    /* ============================================================
       STATE
       ============================================================ */
    function getDefaultState() {
        return {
            baby: {},
            diary: [],
            products: { introduced: [], favorites: [] },
            recipes: [],
            brands: [],
            notes: [],
            waterLog: [],
            settings: {
                notifications: false,
                theme: 'light',
                homeBlocks: safeGlobal('APP_CONFIG', {}).defaults?.homeBlocks || [
                    'baby_header', 'next_step', 'today_meals',
                    'recommendation', 'at_home', 'progress'
                ]
            },
            ui: { screen: DEFAULT_SCREEN, previousScreen: null },
            onboarding: {
                completed: false,
                readiness: {},
                allergies: [],
                diet: [],
                favoriteFoods: [],
                worries: [],
                confidence: ''
            },
            _version: safeGlobal('APP_CONFIG', {}).storage?.version || 2,
            _lastSync: null
        };
    }

    function normalizeState(state) {
        const defaults = getDefaultState();
        const merged = deepMerge(defaults, state || {});

        // Гарантируем массивы
        const arrayFields = ['diary', 'recipes', 'brands', 'notes', 'waterLog'];
        arrayFields.forEach(field => {
            if (!Array.isArray(merged[field])) merged[field] = [];
        });

        // Гарантируем вложенные объекты
        if (!merged.products) merged.products = { introduced: [], favorites: [] };
        if (!Array.isArray(merged.products.introduced)) merged.products.introduced = [];
        if (!Array.isArray(merged.products.favorites)) merged.products.favorites = [];

        if (!merged.settings) merged.settings = defaults.settings;
        if (!merged.ui) merged.ui = { screen: DEFAULT_SCREEN, previousScreen: null };
        if (!merged.onboarding) merged.onboarding = defaults.onboarding;

        // Миграция версии
        const currentVersion = safeGlobal('APP_CONFIG', {}).storage?.version || 2;
        if (merged._version !== currentVersion) {
            console.log(`🔄 Миграция состояния: v${merged._version} → v${currentVersion}`);
            merged._version = currentVersion;
        }

        return merged;
    }

    function deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(target[key] || {}, source[key]);
            } else if (source[key] !== undefined) {
                result[key] = source[key];
            }
        }
        return result;
    }

    function initializeState() {
        let loaded = null;

        if (typeof window.loadState === 'function') {
            try {
                window.loadState();
                loaded = window.STATE || null;
            } catch (e) {
                console.error('❌ Ошибка loadState:', e);
            }
        }

        // Если loadState не сработал — пробуем загрузить вручную
        if (!loaded) {
            const raw = Storage.get(STORAGE_KEYS.state);
            if (raw) {
                try {
                    loaded = JSON.parse(raw);
                } catch (e) {
                    console.warn('⚠️ Повреждённые данные в localStorage, сброс');
                    Storage.remove(STORAGE_KEYS.state);
                }
            }
        }

        window.STATE = normalizeState(loaded);
        console.log('✅ Состояние инициализировано');
    }

    /* ============================================================
       INIT
       ============================================================ */
    function initApp() {
        const appName = safeGlobal('APP_CONFIG', { app: { name: 'Прикорм', version: '2.1.1' } }).app;
        console.log(`🌸 ${appName.name} v${appName.version}`);

        if (!buildAppShell()) return;

        initializeState();

        // Инициализация темы
        safeCall('initTheme');

        // События
        safeCall('setupEventListeners');

        // Первый экран
        const screen = window.STATE?.ui?.screen || DEFAULT_SCREEN;
        showScreen(screen);

        // UI обновления
        safeCall('updateProfileUI');

        // Проверка обновлений (если есть)
        safeCall('initUpdater');

        // Онбординг
        if (!window.STATE?.onboarding?.completed && typeof window.showOnboarding === 'function') {
            window.showOnboarding();
        }

        console.log('✅ Приложение запущено');
    }

    /* ============================================================
       SCREEN NAVIGATION
       ============================================================ */
    const VALID_SCREENS = [
        'home', 'products', 'today', 'diary',
        'recipes', 'baby', 'settings', 'onboarding'
    ];

    function showScreen(screen) {
        if (!VALID_SCREENS.includes(screen)) {
            console.warn(`⚠️ Неизвестный экран "${screen}", перенаправление на home`);
            screen = DEFAULT_SCREEN;
        }

        if (window.STATE) {
            const prev = window.STATE.ui?.screen;
            window.STATE.ui = window.STATE.ui || {};
            window.STATE.ui.previousScreen = prev;
            window.STATE.ui.screen = screen;
        }

        safeCall('saveState');

        if (typeof window.render === 'function') {
            try {
                window.render(screen);
            } catch (e) {
                console.error('❌ Ошибка рендера:', e);
                showErrorScreen('Не удалось отобразить экран');
            }
        } else {
            console.error('❌ render() не найден');
            showErrorScreen('Модуль рендера не загружен');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function showErrorScreen(message) {
        const content = document.getElementById('app-content');
        if (!content) return;
        content.innerHTML = `
            <div class="error-screen">
                <div class="error-icon">😔</div>
                <h2>Что-то пошло не так</h2>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn-primary">Перезагрузить</button>
            </div>
        `;
    }

    function goBack() {
        const prev = window.STATE?.ui?.previousScreen;
        if (prev && prev !== window.STATE.ui.screen) {
            showScreen(prev);
        } else {
            showScreen(DEFAULT_SCREEN);
        }
    }

    /* ============================================================
       MODAL
       ============================================================ */
    function openModal(content) {
        const root = document.getElementById('modal-root');
        if (!root) return;
        root.innerHTML = content;
        root.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Закрытие по Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    function closeModal() {
        const root = document.getElementById('modal-root');
        if (root) {
            root.innerHTML = '';
            root.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('modal-open');
    }

    /* ============================================================
       TOAST
       ============================================================ */
    function showToast(message, type = 'default') {
        const root = document.getElementById('toast-root');
        if (!root) {
            console.log(`[Toast ${type}]: ${message}`);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.textContent = message;

        root.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        setTimeout(() => {
            toast.classList.remove('visible');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
            // Fallback
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }

    /* ============================================================
       BABY & FAVORITES
       ============================================================ */
    function setBaby(data) {
        if (!window.STATE) return;
        window.STATE.baby = { ...(window.STATE.baby || {}), ...(data || {}) };
        safeCall('saveState');
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
    }

    function toggleFavoriteProduct(productId) {
        if (!window.STATE?.products) return;
        const favs = window.STATE.products.favorites;
        if (!Array.isArray(favs)) window.STATE.products.favorites = [];

        const index = window.STATE.products.favorites.indexOf(productId);
        if (index >= 0) {
            window.STATE.products.favorites.splice(index, 1);
            showToast('Удалено из избранного', 'info');
        } else {
            window.STATE.products.favorites.push(productId);
            showToast('Добавлено в избранное', 'success');
        }
        safeCall('saveState');
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
    }

    /* ============================================================
       RESET
       ============================================================ */
    function resetState() {
        Storage.clearAll();
        window.STATE = getDefaultState();
        safeCall('saveState');
        showToast('Все данные сброшены', 'info');
        setTimeout(() => location.reload(), 1000);
    }

    /* ============================================================
       LEGACY MIGRATION
       ============================================================ */
    function migrateLegacyProfile() {
        const raw = Storage.get('prikorm_profile');
        if (!raw) return;

        try {
            const old = JSON.parse(raw);
            if (!old) return;

            window.STATE = window.STATE || getDefaultState();

            // Профиль малыша
            if (!window.STATE.baby) window.STATE.baby = {};
            if (!window.STATE.baby.name && old.baby_name) window.STATE.baby.name = old.baby_name;
            if (!window.STATE.baby.birthDate && old.birth_date) window.STATE.baby.birthDate = old.birth_date;
            if (!window.STATE.baby.feedingType && old.feeding_type) window.STATE.baby.feedingType = old.feeding_type;
            if (old.feeding_strategy) window.STATE.baby.feedingStrategy = old.feeding_strategy;

            // Введённые продукты
            if (Array.isArray(old.introduced_foods)) {
                const PRODUCTS = safeGlobal('PRODUCTS', []);
                old.introduced_foods.forEach(name => {
                    const product = PRODUCTS.find(p => p.name === name);
                    const value = product ? { id: product.id, name: product.name } : { name };
                    const exists = window.STATE.products.introduced.some(
                        item => (item.id || item.name) === (value.id || value.name)
                    );
                    if (!exists) window.STATE.products.introduced.push(value);
                });
            }

            // Любимые
            if (Array.isArray(old.loved_foods)) {
                const PRODUCTS = safeGlobal('PRODUCTS', []);
                old.loved_foods.forEach(name => {
                    const product = PRODUCTS.find(p => p.name === name);
                    if (product && !window.STATE.products.favorites.includes(product.id)) {
                        window.STATE.products.favorites.push(product.id);
                    }
                });
            }

            // Дневник
            if (Array.isArray(old.food_history) && window.STATE.diary.length === 0) {
                window.STATE.diary = old.food_history.map(item => ({
                    id: `legacy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    date: item.date || '',
                    time: '',
                    productName: item.product || '',
                    liked: null,
                    notes: item.notes || '',
                    reaction: item.reaction || null,
                    source: 'legacy'
                }));
            }

            if (Array.isArray(old.water_log)) window.STATE.waterLog = old.water_log;
            if (Array.isArray(old.notes)) window.STATE.notes = old.notes;

            safeCall('saveState');
            console.log('✅ Старые данные перенесены');
        } catch (error) {
            console.warn('Не удалось перенести старые данные:', error);
        }
    }

    /* ============================================================
       ONLINE / OFFLINE
       ============================================================ */
    function updateOnlineStatus() {
        const indicator = document.getElementById('offline-indicator');
        if (!indicator) return;

        if (navigator.onLine) {
            indicator.classList.add('hidden');
            indicator.classList.remove('visible');
        } else {
            indicator.classList.remove('hidden');
            indicator.classList.add('visible');
            showToast('Нет подключения к интернету', 'warning');
        }
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    /* ============================================================
       GLOBAL EVENTS
       ============================================================ */
    window.addEventListener('prikorm:themechange', event => {
        console.log('🎨 Тема изменена:', event.detail?.theme);
    });

    window.addEventListener('prikorm:statechange', () => {
        // Можно добавить синхронизацию здесь
    });

    /* ============================================================
       START
       ============================================================ */
    function startApplication() {
        initApp();
        migrateLegacyProfile();
        updateOnlineStatus();
    }

    /* ============================================================
       DOM READY
       ============================================================ */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApplication, { once: true });
    } else {
        startApplication();
    }

    /* ============================================================
       EXPORTS
       ============================================================ */
    window.initApp = initApp;
    window.startApplication = startApplication;
    window.showScreen = showScreen;
    window.goBack = goBack;
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showToast = showToast;
    window.setBaby = setBaby;
    window.toggleFavoriteProduct = toggleFavoriteProduct;
    window.resetState = resetState;
    window.migrateLegacyProfile = migrateLegacyProfile;
    window.Storage = Storage;

})();
