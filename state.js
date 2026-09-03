/* ============================================================
   state.js
   Единое состояние приложения (с поддержкой нескольких детей)
   ============================================================ */

const DEFAULT_STATE = {

    version: 2,

    onboardingCompleted: false,

    children: [],
    currentChildId: null,

    // служебное поле для хранения ID ребёнка, для которого идёт онбординг
    _onboardingChildId: null,

    // (старое поле baby оставлено для обратной совместимости, но мы его мигрируем)
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

    diary: [],
    plan: { days: {} },
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

    // больше не используем STATE.onboarding – теперь данные хранятся в каждом ребёнке
    onboarding: null // оставляем null, чтобы не мешал
};

// ===== Вспомогательные функции для работы с детьми =====

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
            // Новые поля для данных онбординга
            onboarding: {
                allergies: [],
                diet: [],
                favoriteFoods: [],
                worries: [],
                confidence: ''
            }
        };
        STATE.children.push(newChild);
        STATE.currentChildId = newChild.id;
        delete STATE.baby;
        saveState();
    }
}

function getCurrentChild() {
    if (!STATE.children.length) return null;
    const child = STATE.children.find(c => c.id === STATE.currentChildId);
    return child || STATE.children[0];
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
    STATE.children = STATE.children.filter(c => c.id !== childId);
    if (STATE.currentChildId === childId) {
        STATE.currentChildId = STATE.children.length ? STATE.children[0].id : null;
    }
    saveState();
    emitStateChange();
}

// ===== Остальные функции (сохраняем как есть) =====

function deepClone(object) { return JSON.parse(JSON.stringify(object)); }

let STATE = deepClone(DEFAULT_STATE);

function mergeState(defaultState, savedState) {
    if (!savedState || typeof savedState !== "object") return deepClone(defaultState);
    const result = deepClone(defaultState);
    Object.keys(savedState).forEach(key => {
        if (savedState[key] && typeof savedState[key] === "object" && !Array.isArray(savedState[key]) &&
            result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
            result[key] = mergeState(result[key], savedState[key]);
        } else {
            result[key] = savedState[key];
        }
    });
    return result;
}

function loadState() {
    console.log('📥 loadState вызвана');
    try {
        const raw = localStorage.getItem(APP_CONFIG.storage.keys.state);
        if (!raw) {
            STATE = deepClone(DEFAULT_STATE);
            return STATE;
        }
        const saved = JSON.parse(raw);
        STATE = mergeState(DEFAULT_STATE, saved);
        if (STATE.baby && typeof STATE.baby === 'object') {
            migrateBabyToChildren();
        }
        // Убедимся, что onboarding удалён из корня
        if (STATE.onboarding && typeof STATE.onboarding === 'object') {
            // Переносим старые данные в первого ребёнка, если он есть
            if (STATE.children.length > 0) {
                const first = STATE.children[0];
                if (!first.onboarding) first.onboarding = {};
                first.onboarding.allergies = STATE.onboarding.allergies || [];
                first.onboarding.diet = STATE.onboarding.diet || [];
                first.onboarding.favoriteFoods = STATE.onboarding.favoriteFoods || [];
                first.onboarding.worries = STATE.onboarding.worries || [];
                first.onboarding.confidence = STATE.onboarding.confidence || '';
            }
            delete STATE.onboarding;
        }
        console.log('📥 loadState завершена, STATE.children.length =', STATE.children.length);
        return STATE;
    } catch (error) {
        console.error("Не удалось загрузить состояние:", error);
        STATE = deepClone(DEFAULT_STATE);
        return STATE;
    }
}

function saveState() {
    try {
        localStorage.setItem(APP_CONFIG.storage.keys.state, JSON.stringify(STATE));
        return true;
    } catch (error) {
        console.error("Не удалось сохранить состояние:", error);
        return false;
    }
}

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
    // Уведомляем подписчиков (старый механизм)
    stateListeners.forEach(listener => { try { listener(STATE); } catch (error) { console.error("Ошибка state listener:", error); } });
    // Диспатчим CustomEvent для handlers.js
    window.dispatchEvent(new CustomEvent('prikorm:statechange'));
}

// ===== Остальные экспорты (сохраняем) =====

function getBaby() {
    // Для обратной совместимости: возвращаем текущего ребёнка
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

function isProductIntroduced(productId) {
    return STATE.products.introduced.some(item => item.id === productId || item === productId);
}

function isProductFavorite(productId) {
    return STATE.products.favorites.some(item => item.id === productId || item === productId);
}

function isProductPlanned(productId) {
    return STATE.products.planned.some(item => item.id === productId || item === productId);
}

function markProductIntroduced(product) {
    if (!product || !product.id) return false;
    if (!isProductIntroduced(product.id)) {
        STATE.products.introduced.push({ id: product.id, date: new Date().toISOString(), source: product.source || "homemade" });
    }
    STATE.products.planned = STATE.products.planned.filter(item => (item.id || item) !== product.id);
    saveState();
    emitStateChange();
    return true;
}

function toggleFavoriteProduct(productId) {
    return toggleStateArrayItem("products.favorites", productId);
}

function planProduct(productId) {
    if (isProductIntroduced(productId)) return false;
    if (!isProductPlanned(productId)) {
        STATE.products.planned.push({ id: productId, date: new Date().toISOString() });
    }
    saveState();
    emitStateChange();
    return true;
}

function addDiaryEntry(entry) {
    const diaryEntry = {
        id: entry.id || `diary_${Date.now()}`,
        date: entry.date || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        ...entry
    };
    STATE.diary.push(diaryEntry);
    saveState();
    emitStateChange();
    return diaryEntry;
}

function getPlanForDate(date) { return STATE.plan.days[date] || []; }

function setPlanForDate(date, meals) {
    STATE.plan.days[date] = Array.isArray(meals) ? meals : [];
    saveState();
    emitStateChange();
    return STATE.plan.days[date];
}

function addMealToPlan(date, meal) {
    if (!STATE.plan.days[date]) STATE.plan.days[date] = [];
    STATE.plan.days[date].push({ id: meal.id || `meal_${Date.now()}`, ...meal });
    saveState();
    emitStateChange();
    return meal;
}

function addReaction(reaction) {
    const record = { id: reaction.id || `reaction_${Date.now()}`, date: reaction.date || new Date().toISOString(), ...reaction };
    STATE.reactions.push(record);
    if (reaction.productId && !STATE.products.reactions.includes(reaction.productId)) {
        STATE.products.reactions.push(reaction.productId);
    }
    saveState();
    emitStateChange();
    return record;
}

function addToPantry(product) {
    if (!product || !product.id) return false;
    if (!STATE.pantry.some(item => item.id === product.id)) {
        STATE.pantry.push({ id: product.id, quantity: product.quantity || null, unit: product.unit || null, addedAt: new Date().toISOString() });
    }
    saveState();
    emitStateChange();
    return true;
}

function removeFromPantry(productId) {
    STATE.pantry = STATE.pantry.filter(item => item.id !== productId);
    saveState();
    emitStateChange();
}

function addShoppingItem(item) {
    const shoppingItem = { id: item.id || `shopping_${Date.now()}`, checked: false, ...item };
    STATE.shopping.push(shoppingItem);
    saveState();
    emitStateChange();
    return shoppingItem;
}

function toggleShoppingItem(itemId) {
    const item = STATE.shopping.find(item => item.id === itemId);
    if (!item) return false;
    item.checked = !item.checked;
    saveState();
    emitStateChange();
    return item.checked;
}

function setCurrentScreen(screen) {
    STATE.navigation.previousScreen = STATE.navigation.currentScreen;
    STATE.navigation.currentScreen = screen;
    saveState();
    emitStateChange();
}

function openModal(modal) {
    STATE.navigation.modal = modal;
    emitStateChange();
}

function closeModal() {
    STATE.navigation.modal = null;
    emitStateChange();
}

// Инициализация
loadState();

// Глобальные экспорты
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