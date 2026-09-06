/* ============================================================
   state.js
   Единое состояние приложения (с поддержкой нескольких детей)
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       DEFAULT STATE
       ============================================================ */

    const DEFAULT_STATE = {
        children: [],
        currentChildId: null,

        // Технические поля онбординга
        _onboardingChildId: null,
        _onboardingMode: null,
        onboardingCompleted: false,

        // Старый профиль — сохраняем для совместимости
        baby: null,

        // Старые глобальные данные — сохраняем для совместимости
        products: {
            introduced: [],
            favorites: []
        },

        diary: [],
        plan: {},
        brands: [],

        settings: {
            theme: 'light',
            notifications: true
        },

        ui: {
            screen: 'home'
        },

        navigation: {
            currentScreen: 'home'
        },

        // Версия миграции Product State
        productStateMigrationVersion: 0,

        // Фильтры экрана продуктов
        productsFilter: 'all',
        productsCategoryFilter: null,
        productsAgeFilter: null
    };

    /* ============================================================
       ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
       ============================================================ */

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function mergeDeep(target, source) {
        for (const key in source) {
            if (!Object.prototype.hasOwnProperty.call(source, key)) continue;

            if (
                source[key] &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key])
            ) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }

                mergeDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }

        return target;
    }

    /* ============================================================
       ИНИЦИАЛИЗАЦИЯ STATE
       ============================================================ */

    if (!window.STATE) {
        window.STATE = deepClone(DEFAULT_STATE);
    }

    /* ============================================================
       СОХРАНЕНИЕ
       ============================================================ */

    function saveState() {
        if (
            typeof storageService !== 'undefined' &&
            storageService &&
            typeof storageService.saveState === 'function'
        ) {
            storageService.saveState(window.STATE);
        } else {
            try {
                localStorage.setItem(
                    'prikorm_state',
                    JSON.stringify(window.STATE)
                );
            } catch (e) {
                console.warn('Не удалось сохранить STATE:', e);
            }
        }

        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(
                new CustomEvent('prikorm:statechange')
            );
        }
    }

    /* ============================================================
       ЗАГРУЗКА
       ============================================================ */

    function loadState() {
        let loaded = null;

        if (
            typeof storageService !== 'undefined' &&
            storageService &&
            typeof storageService.loadState === 'function'
        ) {
            loaded = storageService.loadState();
        } else {
            try {
                const raw = localStorage.getItem('prikorm_state');

                if (raw) {
                    loaded = JSON.parse(raw);
                }
            } catch (e) {
                console.warn('Не удалось загрузить STATE:', e);
            }
        }

        if (loaded && typeof loaded === 'object') {
            window.STATE = mergeDeep(
                deepClone(DEFAULT_STATE),
                loaded
            );
        } else {
            window.STATE = deepClone(DEFAULT_STATE);
        }

        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(
                new CustomEvent('prikorm:statechange')
            );
        }

        return window.STATE;
    }

    /* ============================================================
       РАБОТА С ТЕКУЩИМ РЕБЁНКОМ
       ============================================================ */

    function getCurrentChild() {
        if (
            !window.STATE ||
            !window.STATE.currentChildId ||
            !Array.isArray(window.STATE.children)
        ) {
            return null;
        }

        return (
            window.STATE.children.find(
                child => child.id === window.STATE.currentChildId
            ) || null
        );
    }

    function getState() {
        return window.STATE;
    }

    /* ============================================================
       ОПЕРАЦИИ С ДЕТЬМИ
       ============================================================ */

    function addChild(data = {}) {
        if (!window.STATE) {
            window.STATE = deepClone(DEFAULT_STATE);
        }

        if (!Array.isArray(window.STATE.children)) {
            window.STATE.children = [];
        }

        const newChild = {
            id:
                'child_' +
                Date.now() +
                '_' +
                Math.random()
                    .toString(36)
                    .substr(2, 4),

            name: data.name || '',
            birthDate: data.birthDate || '',
            sex: data.sex || '',

            feedingType: data.feedingType || '',
            feedingStarted: data.feedingStarted || false,
            feedingStartDate: data.feedingStartDate || '',

            approach: data.approach || 'mixed',

            readiness: data.readiness || {},

            onboarding: data.onboarding || {
                allergies: [],
                diet: [],
                favoriteFoods: [],
                worries: [],
                confidence: ''
            },

            diary: [],
            plan: {},
            settings: {},

            // Product State принадлежит конкретному ребёнку
            productState: {}
        };

        window.STATE.children.push(newChild);

        if (!window.STATE.currentChildId) {
            window.STATE.currentChildId = newChild.id;
        }

        saveState();

        return newChild;
    }

    function deleteChild(childId) {
        if (
            !window.STATE ||
            !Array.isArray(window.STATE.children)
        ) {
            return false;
        }

        const index = window.STATE.children.findIndex(
            child => child.id === childId
        );

        if (index === -1) {
            return false;
        }

        window.STATE.children.splice(index, 1);

        if (window.STATE.currentChildId === childId) {
            window.STATE.currentChildId =
                window.STATE.children.length
                    ? window.STATE.children[0].id
                    : null;
        }

        saveState();

        return true;
    }

    function switchChild(childId) {
        if (!window.STATE) {
            return false;
        }

        const child = window.STATE.children.find(
            item => item.id === childId
        );

        if (!child) {
            return false;
        }

        window.STATE.currentChildId = childId;

        saveState();

        return true;
    }

    function updateChild(childId, updates = {}) {
        if (
            !window.STATE ||
            !Array.isArray(window.STATE.children)
        ) {
            return false;
        }

        const child = window.STATE.children.find(
            item => item.id === childId
        );

        if (!child) {
            return false;
        }

        Object.assign(child, updates);

        saveState();

        return true;
    }

    /* ============================================================
       ПУБЛИЧНЫЙ API
       ============================================================ */

    window.getState = getState;
    window.getCurrentChild = getCurrentChild;

    window.saveState = saveState;
    window.loadState = loadState;

    window.addChild = addChild;
    window.deleteChild = deleteChild;
    window.switchChild = switchChild;
    window.updateChild = updateChild;

    /*
     * Глобальная переменная STATE нужна старому коду приложения.
     * После loadState она будет ссылаться на актуальный window.STATE.
     */
    if (typeof STATE === 'undefined') {
        var STATE = window.STATE;
    }

    /* ============================================================
       ЗАПУСК
       ============================================================ */

    loadState();

    console.log('✅ state.js загружен (единый STATE)');
})();