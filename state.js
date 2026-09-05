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
        baby: null, // исторически объект одного ребёнка (для совместимости)
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
        productStateMigrationVersion: 0   // <-- добавлено для Stage 6
    };

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ window.STATE
    // ============================================================

    // Если window.STATE уже существует (из localStorage), используем его,
    // иначе создаём новый.
    if (!window.STATE) {
        window.STATE = deepClone(DEFAULT_STATE);
    }

    // Для обратной совместимости: если какой-то код использует глобальную
    // переменную STATE без window, делаем её ссылкой на window.STATE.
    // Но лучше везде использовать window.STATE.
    if (typeof STATE === 'undefined') {
        window.STATE = window.STATE; // уже есть
    } else {
        // Если STATE уже определена, синхронизируем:
        // присваиваем window.STATE значение STATE (если STATE более актуальна)
        // или наоборот – но проще сделать так:
        if (window.STATE !== STATE) {
            // Если они разные – копируем из STATE в window.STATE (предполагаем, что STATE актуальнее)
            // Но лучше перезаписать window.STATE из STATE
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
    // СОХРАНЕНИЕ И ЗАГРУЗКА (через storageService)
    // ============================================================

    function saveState() {
        if (typeof storageService !== 'undefined' && storageService.saveState) {
            storageService.saveState(window.STATE);
        } else {
            // Fallback: сохраняем в localStorage напрямую
            try {
                localStorage.setItem('prikorm_state', JSON.stringify(window.STATE));
            } catch (e) {
                console.warn('Не удалось сохранить STATE:', e);
            }
        }
        // Отправляем событие об изменении
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
            // Миграция: если loaded.baby – объект, а не массив – оставляем как есть
            // Если loaded.children – массив, используем его
            // Объединяем с DEFAULT_STATE, чтобы новые поля появились
            window.STATE = mergeDeep(deepClone(DEFAULT_STATE), loaded);
        } else {
            window.STATE = deepClone(DEFAULT_STATE);
        }
        // После загрузки обновляем глобальную переменную STATE (если она используется)
        if (typeof STATE !== 'undefined') {
            // Чтобы сохранить совместимость, можно сделать STATE = window.STATE;
            // Но лучше не использовать STATE без window.
            // Однако некоторые файлы могут использовать STATE, поэтому:
            if (typeof STATE === 'undefined') {
                // Если STATE не определена, создадим её как ссылку
                window.STATE = window.STATE; // уже
            } else {
                // Если STATE определена, но мы её перезаписали, обновим её
                // Это опасно, но для совместимости делаем:
                // STATE = window.STATE; // Но мы не можем переопределить const
                // Лучше просто объявить var STATE = window.STATE; в глобальной области
                // Этого мы не можем сделать здесь, поэтому оставляем как есть.
                // Вместо этого все файлы должны использовать getState() или window.STATE.
            }
        }
        // Отправляем событие
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
            productState: {}   // <-- добавлено для Stage 6
        };

        window.STATE.children.push(newChild);
        // Устанавливаем активным, если нет активного
        if (!window.STATE.currentChildId) {
            window.STATE.currentChildId = newChild.id;
        }
        // Сохраняем и уведомляем
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

    // Обновление ребёнка (дополнительно)
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

    window.STATE = window.STATE; // уже
    window.getState = getState;
    window.getCurrentChild = getCurrentChild;
    window.saveState = saveState;
    window.loadState = loadState;
    window.addChild = addChild;
    window.deleteChild = deleteChild;
    window.switchChild = switchChild;
    window.updateChild = updateChild;

    // Для тех, кто использует STATE без window – сделаем глобальную переменную
    // (но предупреждаем, что лучше использовать window.STATE)
    if (typeof STATE === 'undefined') {
        // Создаём глобальную переменную STATE как ссылку на window.STATE
        // Используем var, чтобы можно было переопределить
        var STATE = window.STATE;
        // Но чтобы избежать конфликтов, лучше объявить через window
        window.STATE = window.STATE;
        // Для доступа через STATE (без window) – сделаем глобальную
        // В браузере глобальные переменные являются свойствами window,
        // поэтому window.STATE и STATE – одно и то же, если мы объявим var STATE = window.STATE;
        // Но var STATE в модуле не создаст глобальную, поэтому лучше:
        if (typeof window.STATE !== 'undefined') {
            // Просто убедимся, что window.STATE существует
        }
    }

    // Инициализация: загружаем состояние
    loadState();

    console.log('✅ state.js загружен (единый STATE)');
})();
