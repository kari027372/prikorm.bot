/* ============================================================
   state.js – Единый источник данных
   ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // ДЕФОЛТНОЕ СОСТОЯНИЕ
    // ============================================================

    const DEFAULT_STATE = {
        children: [],
        currentChildId: null,
        _onboardingChildId: null,
        _onboardingMode: null,
        onboardingCompleted: false,
        baby: null,
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
        productStateMigrationVersion: 0,
        // Новые поля для фильтрации продуктов
        productsCategoryFilter: null,
        productsAgeFilter: null,
        productsFilter: 'all'
    };

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ window.STATE
    // ============================================================

    if (!window.STATE) {
        window.STATE = deepClone(DEFAULT_STATE);
    }

    if (typeof STATE === 'undefined') {
        window.STATE = window.STATE;
    } else {
        if (window.STATE !== STATE) {
            window.STATE = STATE;
        }
    }

    // ============================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function getCurrentChild() {
        if (!window.STATE || !window.STATE.currentChildId) return null;
        return window.STATE.children.find(c => c.id === window.STATE.currentChildId) || null;
    }

    function getState() {
        return window.STATE;
    }

    // ============================================================
    // СОХРАНЕНИЕ И ЗАГРУЗКА
    // ============================================================

    function saveState() {
        if (typeof storageService !== 'undefined' && storageService.saveState) {
            storageService.saveState(window.STATE);
        } else {
            try {
                localStorage.setItem('prikorm_state', JSON.stringify(window.STATE));
            } catch (e) {
                console.warn('Не удалось сохранить STATE:', e);
            }
        }
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        }
    }

    function loadState() {
        let loaded = null;
        if (typeof storageService !== 'undefined' && storageService.loadState) {
            loaded = storageService.loadState();
        } else {
            try {
                const raw = localStorage.getItem('prikorm_state');
                if (raw) loaded = JSON.parse(raw);
            } catch (e) {
                console.warn('Не удалось загрузить STATE:', e);
            }
        }
        if (loaded && typeof loaded === 'object') {
            window.STATE = mergeDeep(deepClone(DEFAULT_STATE), loaded);
        } else {
            window.STATE = deepClone(DEFAULT_STATE);
        }
        if (typeof STATE !== 'undefined') {
            // для совместимости
        }
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        }
        return window.STATE;
    }

    function mergeDeep(target, source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    mergeDeep(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    // ============================================================
    // ОПЕРАЦИИ С ДЕТЬМИ
    // ============================================================

    function addChild(data) {
        if (!window.STATE) window.STATE = deepClone(DEFAULT_STATE);
        if (!Array.isArray(window.STATE.children)) window.STATE.children = [];

        const newChild = {
            id: 'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
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
        if (!window.STATE || !Array.isArray(window.STATE.children)) return false;
        const index = window.STATE.children.findIndex(c => c.id === childId);
        if (index === -1) return false;
        window.STATE.children.splice(index, 1);
        if (window.STATE.currentChildId === childId) {
            window.STATE.currentChildId = window.STATE.children.length ? window.STATE.children[0].id : null;
        }
        saveState();
        return true;
    }

    function switchChild(childId) {
        if (!window.STATE) return false;
        const child = window.STATE.children.find(c => c.id === childId);
        if (!child) return false;
        window.STATE.currentChildId = childId;
        saveState();
        return true;
    }

    function updateChild(childId, updates) {
        const child = window.STATE.children.find(c => c.id === childId);
        if (!child) return false;
        Object.assign(child, updates);
        saveState();
        return true;
    }

    // ============================================================
    // ПУБЛИЧНЫЙ API
    // ============================================================

    window.STATE = window.STATE;
    window.getState = getState;
    window.getCurrentChild = getCurrentChild;
    window.saveState = saveState;
    window.loadState = loadState;
    window.addChild = addChild;
    window.deleteChild = deleteChild;
    window.switchChild = switchChild;
    window.updateChild = updateChild;

    if (typeof STATE === 'undefined') {
        var STATE = window.STATE;
    }

    loadState();

    console.log('✅ state.js загружен (единый STATE)');
})();