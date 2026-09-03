/* ============================================================
   state.js
   Единое состояние приложения (с поддержкой нескольких детей)
   ============================================================ */

// ===== ИСПОЛЬЗУЕМ STORAGE SERVICE =====
// Предполагаем, что storageService уже загружен

(function() {
    'use strict';

    // Получаем ссылку на сервис
    const storage = window.storageService;
    if (!storage) {
        console.error('❌ storageService не загружен!');
        return;
    }

    // ============================================================
    // DEFAULT STATE (без изменений)
    // ============================================================
    const DEFAULT_STATE = {
        version: 2,
        onboardingCompleted: false,
        children: [],
        currentChildId: null,
        _onboardingChildId: null,
        baby: null,
        navigation: {
            currentScreen: "home",
            previousScreen: null,
            modal: null
        },
        products: {
            introduced: [],
            planned: [],
            favorites: [],
            excluded: [],
            reactions: [],
            custom: []
        },
        diary: [],        // будет мигрировано
        plan: { days: {} }, // будет мигрировано
        reactions: [],
        recipes: { favorites: [], custom: [] },
        pantry: [],
        shopping: [],
        water: { records: [] },
        photos: [],
        notes: [],
        settings: {
            approach: "mixed",
            notifications: false,
            showAmount: false,
            showWater: true,
            showRecipes: true,
            showProgress: true,
            showRecommendations: true,
            homeBlocks: [
                "baby_header",
                "next_step",
                "today_meals",
                "recommendation",
                "at_home",
                "progress"
            ]
        },
        session: {
            selectedProduct: null,
            selectedDate: null,
            selectedMeal: null,
            searchQuery: "",
            activeCategory: "all",
            activeFilter: "all"
        },
        // Удаляем поле onboarding из корня, оно будет мигрировано
    };

    // ============================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================

    function deepClone(object) {
        return JSON.parse(JSON.stringify(object));
    }

    function isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // ============================================================
    // СОЗДАНИЕ STATE
    // ============================================================

    let STATE = deepClone(DEFAULT_STATE);

    // ============================================================
    // ЗАГРУЗКА (с использованием storageService)
    // ============================================================

    function loadState() {
        console.log('📥 loadState вызвана');

        // 1. Загружаем сырые данные
        const saved = storage.loadRawState();

        // 2. Если данных нет – используем DEFAULT_STATE
        if (!saved) {
            STATE = deepClone(DEFAULT_STATE);
            // Инициализируем onboardingCompleted
            STATE.onboardingCompleted = false;
            return STATE;
        }

        // 3. Применяем миграцию
        const migrated = storage.migrateState(saved, DEFAULT_STATE);

        // 4. Устанавливаем STATE
        STATE = migrated;

        // 5. Удаляем устаревшее поле _onboardingMode, если есть
        if (STATE._onboardingMode !== undefined) {
            delete STATE._onboardingMode;
        }

        // 6. Дополнительная проверка: если есть поле baby (старое), мигрируем в children
        if (STATE.baby && Object.keys(STATE.baby).length > 0) {
            if (typeof window.migrateBabyToChildren === 'function') {
                window.migrateBabyToChildren();
            } else {
                // Ручная миграция
                const newChild = {
                    id: 'child_' + Date.now(),
                    name: STATE.baby.name || '',
                    birthDate: STATE.baby.birthDate || '',
                    sex: STATE.baby.sex || '',
                    feedingType: STATE.baby.feedingType || '',
                    feedingStarted: STATE.baby.feedingStarted || false,
                    feedingStartDate: STATE.baby.feedingStartDate || '',
                    approach: STATE.baby.approach || 'mixed',
                    readiness: STATE.baby.readiness || {},
                    notes: STATE.baby.notes || '',
                    photo: STATE.baby.photo || '',
                    onboarding: {
                        allergies: [],
                        diet: [],
                        favoriteFoods: [],
                        worries: [],
                        confidence: ''
                    },
                    diary: [],
                    plan: { days: {} }
                };
                if (!STATE.children) STATE.children = [];
                STATE.children.push(newChild);
                STATE.currentChildId = newChild.id;
                delete STATE.baby;
                console.log('🔄 Ручная миграция baby → children выполнена');
            }
        }

        // 7. Убеждаемся, что у каждого ребёнка есть необходимые поля
        if (STATE.children) {
            STATE.children.forEach(child => {
                if (!child.diary) child.diary = [];
                if (!child.plan) child.plan = { days: {} };
                if (!child.onboarding) child.onboarding = {};
                ['allergies', 'diet', 'favoriteFoods', 'worries', 'confidence'].forEach(field => {
                    if (child.onboarding[field] === undefined) child.onboarding[field] = [];
                });
            });
        }

        // 8. Корректируем currentChildId, если он невалиден или отсутствует
        if (STATE.children && STATE.children.length > 0) {
            const exists = STATE.children.some(c => c.id === STATE.currentChildId);
            if (!exists || !STATE.currentChildId) {
                STATE.currentChildId = STATE.children[0].id;
                console.log('🔄 currentChildId скорректирован на первого ребёнка');
                // Сохраняем, чтобы синхронизировать localStorage
                if (typeof saveState === 'function') saveState();
            }
        } else {
            STATE.currentChildId = null;
        }

        console.log('📥 loadState завершена, STATE.children.length =', STATE.children ? STATE.children.length : 0);
        return STATE;
    }

    // ============================================================
    // СОХРАНЕНИЕ (с использованием storageService)
    // ============================================================

    function saveState() {
        try {
            // Удаляем временные поля перед сохранением (например, _onboardingMode)
            const stateToSave = { ...STATE };
            // Можно удалить _onboardingMode, если он есть, но не обязательно
            return storage.saveRawState(stateToSave);
        } catch (error) {
            console.error('Не удалось сохранить состояние:', error);
            return false;
        }
    }

    // ============================================================
    // ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений)
    // ============================================================

    function resetState() {
        STATE = deepClone(DEFAULT_STATE);
        saveState();
        emitStateChange();
        return STATE;
    }

    function getState() { return STATE; }

    function setState(path, value) {
        const parts = path.split(".");
        let target = STATE;
        for (let i = 0; i < parts.length - 1; i++) {
            const key = parts[i];
            if (!target[key] || typeof target[key] !== "object") target[key] = {};
            target = target[key];
        }
        target[parts[parts.length - 1]] = value;
        saveState();
        emitStateChange();
        return value;
    }

    function getStateValue(path) {
        const parts = path.split(".");
        let value = STATE;
        for (const part of parts) {
            if (value === null || value === undefined) return undefined;
            value = value[part];
        }
        return value;
    }

    function addToStateArray(path, item) {
        const array = getStateValue(path);
        if (!Array.isArray(array)) { console.error(`State path "${path}" не является массивом`); return false; }
        array.push(item);
        saveState();
        emitStateChange();
        return item;
    }

    function removeFromStateArray(path, predicate) {
        const array = getStateValue(path);
        if (!Array.isArray(array)) return false;
        const index = typeof predicate === "function" ? array.findIndex(predicate) : array.findIndex(item => item === predicate);
        if (index === -1) return false;
        const removed = array.splice(index, 1)[0];
        saveState();
        emitStateChange();
        return removed;
    }

    function toggleStateArrayItem(path, item) {
        const array = getStateValue(path);
        if (!Array.isArray(array)) return false;
        const index = array.findIndex(existing => existing === item || (existing && item && existing.id && item.id && existing.id === item.id));
        if (index === -1) { array.push(item); saveState(); emitStateChange(); return true; }
        array.splice(index, 1);
        saveState();
        emitStateChange();
        return false;
    }

    const stateListeners = [];

    function subscribeToState(listener) {
        if (typeof listener !== "function") return () => {};
        stateListeners.push(listener);
        return function unsubscribe() {
            const index = stateListeners.indexOf(listener);
            if (index !== -1) stateListeners.splice(index, 1);
        };
    }

    function emitStateChange() {
        stateListeners.forEach(listener => { try { listener(STATE); } catch (error) { console.error("Ошибка state listener:", error); } });
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
    }

    // ============================================================
    // ФУНКЦИИ ДЛЯ РАБОТЫ С ДЕТЬМИ (исправлена getCurrentChild)
    // ============================================================

    function getCurrentChild() {
        // Если нет детей – возвращаем null
        if (!STATE.children || STATE.children.length === 0) {
            return null;
        }

        // Пытаемся найти по currentChildId
        const child = STATE.children.find(c => c.id === STATE.currentChildId);
        if (child) {
            return child;
        }

        // Если не найден, берём первого и корректируем currentChildId
        const firstChild = STATE.children[0];
        if (firstChild) {
            if (STATE.currentChildId !== firstChild.id) {
                STATE.currentChildId = firstChild.id;
                if (typeof saveState === 'function') saveState();
                console.log('🔄 getCurrentChild: currentChildId скорректирован на первого ребёнка');
            }
            return firstChild;
        }

        return null;
    }

    function addChild(childData) {
        const newChild = {
            id: 'child_' + Date.now(),
            name: '',
            birthDate: '',
            sex: '',
            feedingType: '',
            feedingStarted: false,
            feedingStartDate: '',
            approach: 'mixed',
            readiness: {},
            notes: '',
            photo: '',
            onboarding: {
                allergies: [],
                diet: [],
                favoriteFoods: [],
                worries: [],
                confidence: ''
            },
            diary: [],
            plan: { days: {} },
            ...childData
        };
        STATE.children.push(newChild);
        if (!STATE.currentChildId) {
            STATE.currentChildId = newChild.id;
        }
        saveState();
        emitStateChange();
        return newChild;
    }

    function switchChild(childId) {
        if (STATE.children.some(c => c.id === childId)) {
            STATE.currentChildId = childId;
            saveState();
            emitStateChange();
            return true;
        }
        return false;
    }

    function deleteChild(childId) {
        const index = STATE.children.findIndex(c => c.id === childId);
        if (index === -1) return false;
        STATE.children.splice(index, 1);
        if (STATE.currentChildId === childId) {
            STATE.currentChildId = STATE.children.length ? STATE.children[0].id : null;
        }
        saveState();
        emitStateChange();
        return true;
    }

    function migrateBabyToChildren() {
        if (STATE.baby && Object.keys(STATE.baby).length > 0) {
            const newChild = {
                id: 'child_' + Date.now(),
                name: STATE.baby.name || '',
                birthDate: STATE.baby.birthDate || '',
                sex: STATE.baby.sex || '',
                feedingType: STATE.baby.feedingType || '',
                feedingStarted: STATE.baby.feedingStarted || false,
                feedingStartDate: STATE.baby.feedingStartDate || '',
                approach: STATE.baby.approach || 'mixed',
                readiness: STATE.baby.readiness || {},
                notes: STATE.baby.notes || '',
                photo: STATE.baby.photo || '',
                onboarding: {
                    allergies: [],
                    diet: [],
                    favoriteFoods: [],
                    worries: [],
                    confidence: ''
                },
                diary: [],
                plan: { days: {} }
            };
            if (!STATE.children) STATE.children = [];
            STATE.children.push(newChild);
            STATE.currentChildId = newChild.id;
            delete STATE.baby;
            saveState();
            emitStateChange();
            console.log('✅ Миграция baby → children выполнена (state.js)');
            return true;
        }
        return false;
    }

    // ============================================================
    // ОСТАЛЬНЫЕ ФУНКЦИИ (продукты, дневник, план и т.д.)
    // Пока оставляем без изменений, но они будут переработаны позже
    // ============================================================

    function getBaby() {
        // Для обратной совместимости
        return getCurrentChild() || {};
    }

    function updateBaby(data) {
        const child = getCurrentChild();
        if (child) {
            Object.assign(child, data);
            saveState();
            emitStateChange();
        }
        return child || {};
    }

    // Заглушки для продуктов и т.д. (они будут переработаны в следующих этапах)
    function isProductIntroduced(productId) { return false; }
    function isProductFavorite(productId) { return false; }
    function isProductPlanned(productId) { return false; }
    function markProductIntroduced(product) { return false; }
    function toggleFavoriteProduct(productId) { return false; }
    function planProduct(productId) { return false; }
    function addDiaryEntry(entry) { return false; }
    function getPlanForDate(date) { return []; }
    function setPlanForDate(date, meals) { return []; }
    function addMealToPlan(date, meal) { return false; }
    function addReaction(reaction) { return false; }
    function addToPantry(product) { return false; }
    function removeFromPantry(productId) { return false; }
    function addShoppingItem(item) { return false; }
    function toggleShoppingItem(itemId) { return false; }
    function setCurrentScreen(screen) { return false; }
    function openModal(modal) { return false; }
    function closeModal() { return false; }

    // ============================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    loadState();

    // ============================================================
    // ЭКСПОРТЫ
    // ============================================================

    window.DEFAULT_STATE = DEFAULT_STATE;
    window.STATE = STATE;
    window.getState = getState;
    window.setState = setState;
    window.updateState = function(updater) { if (typeof updater === 'function') { updater(STATE); saveState(); emitStateChange(); } };
    window.getStateValue = getStateValue;
    window.saveState = saveState;
    window.loadState = loadState;
    window.resetState = resetState;
    window.subscribeToState = subscribeToState;
    window.emitStateChange = emitStateChange;
    window.getBaby = getBaby;
    window.updateBaby = updateBaby;
    window.addToStateArray = addToStateArray;
    window.removeFromStateArray = removeFromStateArray;
    window.toggleStateArrayItem = toggleStateArrayItem;
    window.isProductIntroduced = isProductIntroduced;
    window.isProductFavorite = isProductFavorite;
    window.isProductPlanned = isProductPlanned;
    window.markProductIntroduced = markProductIntroduced;
    window.toggleFavoriteProduct = toggleFavoriteProduct;
    window.planProduct = planProduct;
    window.addDiaryEntry = addDiaryEntry;
    window.getPlanForDate = getPlanForDate;
    window.setPlanForDate = setPlanForDate;
    window.addMealToPlan = addMealToPlan;
    window.addReaction = addReaction;
    window.addToPantry = addToPantry;
    window.removeFromPantry = removeFromPantry;
    window.addShoppingItem = addShoppingItem;
    window.toggleShoppingItem = toggleShoppingItem;
    window.setCurrentScreen = setCurrentScreen;
    window.openModal = openModal;
    window.closeModal = closeModal;

    // Дополнительные экспорты для детей
    window.getCurrentChild = getCurrentChild;
    window.addChild = addChild;
    window.switchChild = switchChild;
    window.deleteChild = deleteChild;
    window.migrateBabyToChildren = migrateBabyToChildren;

    console.log('✅ state.js обновлён (с использованием storage-service, исправлен getCurrentChild)');
})();