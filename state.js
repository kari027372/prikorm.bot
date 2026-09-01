/* ============================================================
   state.js
   Единое состояние приложения
   ============================================================ */

const DEFAULT_STATE = {

    /* ----------------------------------------------------------
       Версия данных
       ---------------------------------------------------------- */

    version: 2,


    /* ----------------------------------------------------------
       Малыш
       ---------------------------------------------------------- */

    baby: {

        id: null,

        name: "",

        birthDate: "",

        sex: "",

        feedingType: "",

        feedingStarted: false,

        feedingStartDate: "",

        approach: "mixed",

        readiness: {},

        notes: "",

        photo: ""
    },


    /* ----------------------------------------------------------
       Текущий экран
       ---------------------------------------------------------- */

    navigation: {

        currentScreen: "home",

        previousScreen: null,

        modal: null
    },


    /* ----------------------------------------------------------
       ПРОДУКТЫ
       ---------------------------------------------------------- */

    products: {

        /* Продукты, которые ребёнок уже пробовал */

        introduced: [],

        /* Продукты, которые планируются */

        planned: [],

        /* Любимые */

        favorites: [],

        /* Исключённые */

        excluded: [],

        /* Продукты с зарегистрированной реакцией */

        reactions: [],

        /* Пользовательские продукты */

        custom: []
    },


    /* ----------------------------------------------------------
       ДНЕВНИК
       ---------------------------------------------------------- */

    diary: [],


    /* ----------------------------------------------------------
       ПЛАН
       ---------------------------------------------------------- */

    plan: {

        days: {}
    },


    /* ----------------------------------------------------------
       РЕАКЦИИ
       ---------------------------------------------------------- */

    reactions: [],


    /* ----------------------------------------------------------
       РЕЦЕПТЫ
       ---------------------------------------------------------- */

    recipes: {

        favorites: [],

        custom: []
    },


    /* ----------------------------------------------------------
       ЧТО ЕСТЬ ДОМА
       ---------------------------------------------------------- */

    pantry: [],


    /* ----------------------------------------------------------
       СПИСОК ПОКУПОК
       ---------------------------------------------------------- */

    shopping: [],


    /* ----------------------------------------------------------
       ВОДА
       ---------------------------------------------------------- */

    water: {

        records: []
    },


    /* ----------------------------------------------------------
       ФОТО
       ---------------------------------------------------------- */

    photos: [],


    /* ----------------------------------------------------------
       ЗАМЕТКИ
       ---------------------------------------------------------- */

    notes: [],


    /* ----------------------------------------------------------
       НАСТРОЙКИ
       ---------------------------------------------------------- */

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


    /* ----------------------------------------------------------
       СЕССИЯ
       ---------------------------------------------------------- */

    session: {

        selectedProduct: null,

        selectedDate: null,

        selectedMeal: null,

        searchQuery: "",

        activeCategory: "all",

        activeFilter: "all"
    }
};


/* ============================================================
   ГЛУБОКОЕ КОПИРОВАНИЕ
   ============================================================ */

function deepClone(object) {

    return JSON.parse(JSON.stringify(object));
}


/* ============================================================
   СОЗДАНИЕ STATE
   ============================================================ */

let STATE = deepClone(DEFAULT_STATE);


/* ============================================================
   MERGE
   ============================================================ */

function mergeState(defaultState, savedState) {

    if (!savedState || typeof savedState !== "object") {
        return deepClone(defaultState);
    }

    const result = deepClone(defaultState);

    Object.keys(savedState).forEach(key => {

        if (
            savedState[key] &&
            typeof savedState[key] === "object" &&
            !Array.isArray(savedState[key]) &&
            result[key] &&
            typeof result[key] === "object" &&
            !Array.isArray(result[key])
        ) {

            result[key] = mergeState(
                result[key],
                savedState[key]
            );

        } else {

            result[key] = savedState[key];

        }
    });

    return result;
}


/* ============================================================
   ЗАГРУЗКА
   ============================================================ */

function loadState() {

    try {

        const raw =
            localStorage.getItem(
                APP_CONFIG.storage.keys.state
            );

        if (!raw) {

            STATE = deepClone(DEFAULT_STATE);

            return STATE;
        }

        const saved =
            JSON.parse(raw);

        STATE =
            mergeState(
                DEFAULT_STATE,
                saved
            );

        return STATE;

    } catch (error) {

        console.error(
            "Не удалось загрузить состояние:",
            error
        );

        STATE =
            deepClone(DEFAULT_STATE);

        return STATE;
    }
}


/* ============================================================
   СОХРАНЕНИЕ
   ============================================================ */

function saveState() {

    try {

        localStorage.setItem(

            APP_CONFIG.storage.keys.state,

            JSON.stringify(STATE)

        );

        return true;

    } catch (error) {

        console.error(
            "Не удалось сохранить состояние:",
            error
        );

        return false;
    }
}


/* ============================================================
   RESET
   ============================================================ */

function resetState() {

    STATE =
        deepClone(DEFAULT_STATE);

    saveState();

    emitStateChange();

    return STATE;
}


/* ============================================================
   GET
   ============================================================ */

function getState() {

    return STATE;
}


/* ============================================================
   SET
   ============================================================ */

function setState(path, value) {

    const parts =
        path.split(".");

    let target = STATE;

    for (
        let i = 0;
        i < parts.length - 1;
        i++
    ) {

        const key = parts[i];

        if (
            !target[key] ||
            typeof target[key] !== "object"
        ) {

            target[key] = {};
        }

        target = target[key];
    }

    target[
        parts[parts.length - 1]
    ] = value;

    saveState();

    emitStateChange();

    return value;
}


/* ============================================================
   UPDATE OBJECT
   ============================================================ */

function updateState(path, updates) {

    const current =
        getStateValue(path);

    const updated = {

        ...(current || {}),

        ...updates
    };

    setState(
        path,
        updated
    );

    return updated;
}


/* ============================================================
   GET VALUE BY PATH
   ============================================================ */

function getStateValue(path) {

    const parts =
        path.split(".");

    let value = STATE;

    for (const part of parts) {

        if (
            value === null ||
            value === undefined
        ) {

            return undefined;
        }

        value =
            value[part];
    }

    return value;
}


/* ============================================================
   ARRAY HELPERS
   ============================================================ */

function addToStateArray(path, item) {

    const array =
        getStateValue(path);

    if (!Array.isArray(array)) {

        console.error(
            `State path "${path}" не является массивом`
        );

        return false;
    }

    array.push(item);

    saveState();

    emitStateChange();

    return item;
}


function removeFromStateArray(path, predicate) {

    const array =
        getStateValue(path);

    if (!Array.isArray(array)) {
        return false;
    }

    const index =
        typeof predicate === "function"

            ? array.findIndex(predicate)

            : array.findIndex(
                item => item === predicate
            );

    if (index === -1) {
        return false;
    }

    const removed =
        array.splice(index, 1)[0];

    saveState();

    emitStateChange();

    return removed;
}


function toggleStateArrayItem(path, item) {

    const array =
        getStateValue(path);

    if (!Array.isArray(array)) {
        return false;
    }

    const index =
        array.findIndex(
            existing =>
                existing === item ||
                (
                    existing &&
                    item &&
                    existing.id &&
                    item.id &&
                    existing.id === item.id
                )
        );

    if (index === -1) {

        array.push(item);

        saveState();

        emitStateChange();

        return true;
    }

    array.splice(index, 1);

    saveState();

    emitStateChange();

    return false;
}


/* ============================================================
   СОБЫТИЯ STATE
   ============================================================ */

const stateListeners = [];


function subscribeToState(listener) {

    if (typeof listener !== "function") {
        return () => {};
    }

    stateListeners.push(listener);

    return function unsubscribe() {

        const index =
            stateListeners.indexOf(listener);

        if (index !== -1) {

            stateListeners.splice(
                index,
                1
            );
        }
    };
}


function emitStateChange() {

    stateListeners.forEach(listener => {

        try {

            listener(
                STATE
            );

        } catch (error) {

            console.error(
                "Ошибка state listener:",
                error
            );
        }
    });
}


/* ============================================================
   BABY
   ============================================================ */

function getBaby() {

    return STATE.baby;
}


function updateBaby(data) {

    STATE.baby = {

        ...STATE.baby,

        ...data
    };

    saveState();

    emitStateChange();

    return STATE.baby;
}


/* ============================================================
   PRODUCT STATUS
   ============================================================ */

function isProductIntroduced(productId) {

    return STATE.products.introduced
        .some(
            item =>
                item.id === productId ||
                item === productId
        );
}


function isProductFavorite(productId) {

    return STATE.products.favorites
        .some(
            item =>
                item.id === productId ||
                item === productId
        );
}


function isProductPlanned(productId) {

    return STATE.products.planned
        .some(
            item =>
                item.id === productId ||
                item === productId
        );
}


/* ============================================================
   PRODUCT ACTIONS
   ============================================================ */

function markProductIntroduced(product) {

    if (!product || !product.id) {
        return false;
    }

    if (!isProductIntroduced(product.id)) {

        STATE.products.introduced.push({

            id: product.id,

            date:
                new Date()
                    .toISOString(),

            source:
                product.source || "homemade"
        });
    }

    STATE.products.planned =
        STATE.products.planned.filter(
            item =>
                (item.id || item) !== product.id
        );

    saveState();

    emitStateChange();

    return true;
}


function toggleFavoriteProduct(productId) {

    return toggleStateArrayItem(
        "products.favorites",
        productId
    );
}


function planProduct(productId) {

    if (isProductIntroduced(productId)) {
        return false;
    }

    if (!isProductPlanned(productId)) {

        STATE.products.planned.push({

            id: productId,

            date:
                new Date()
                    .toISOString()
        });
    }

    saveState();

    emitStateChange();

    return true;
}


/* ============================================================
   DIARY
   ============================================================ */

function addDiaryEntry(entry) {

    const diaryEntry = {

        id:
            entry.id ||
            `diary_${Date.now()}`,

        date:
            entry.date ||
            new Date()
                .toISOString()
                .slice(0, 10),

        createdAt:
            new Date()
                .toISOString(),

        ...entry
    };

    STATE.diary.push(
        diaryEntry
    );

    saveState();

    emitStateChange();

    return diaryEntry;
}


/* ============================================================
   PLAN
   ============================================================ */

function getPlanForDate(date) {

    return STATE.plan.days[date] || [];
}


function setPlanForDate(date, meals) {

    STATE.plan.days[date] =
        Array.isArray(meals)
            ? meals
            : [];

    saveState();

    emitStateChange();

    return STATE.plan.days[date];
}


function addMealToPlan(date, meal) {

    if (!STATE.plan.days[date]) {

        STATE.plan.days[date] = [];
    }

    STATE.plan.days[date].push({

        id:
            meal.id ||
            `meal_${Date.now()}`,

        ...meal
    });

    saveState();

    emitStateChange();

    return meal;
}


/* ============================================================
   REACTIONS
   ============================================================ */

function addReaction(reaction) {

    const record = {

        id:
            reaction.id ||
            `reaction_${Date.now()}`,

        date:
            reaction.date ||
            new Date()
                .toISOString(),

        ...reaction
    };

    STATE.reactions.push(
        record
    );

    if (
        reaction.productId &&
        !STATE.products.reactions.includes(
            reaction.productId
        )
    ) {

        STATE.products.reactions.push(
            reaction.productId
        );
    }

    saveState();

    emitStateChange();

    return record;
}


/* ============================================================
   PANTRY
   ============================================================ */

function addToPantry(product) {

    if (!product || !product.id) {
        return false;
    }

    if (
        !STATE.pantry.some(
            item =>
                item.id === product.id
        )
    ) {

        STATE.pantry.push({

            id: product.id,

            quantity:
                product.quantity || null,

            unit:
                product.unit || null,

            addedAt:
                new Date()
                    .toISOString()
        });
    }

    saveState();

    emitStateChange();

    return true;
}


function removeFromPantry(productId) {

    STATE.pantry =
        STATE.pantry.filter(
            item =>
                item.id !== productId
        );

    saveState();

    emitStateChange();
}


/* ============================================================
   SHOPPING
   ============================================================ */

function addShoppingItem(item) {

    const shoppingItem = {

        id:
            item.id ||
            `shopping_${Date.now()}`,

        checked: false,

        ...item
    };

    STATE.shopping.push(
        shoppingItem
    );

    saveState();

    emitStateChange();

    return shoppingItem;
}


function toggleShoppingItem(itemId) {

    const item =
        STATE.shopping.find(
            item =>
                item.id === itemId
        );

    if (!item) {
        return false;
    }

    item.checked =
        !item.checked;

    saveState();

    emitStateChange();

    return item.checked;
}


/* ============================================================
   SESSION
   ============================================================ */

function setCurrentScreen(screen) {

    STATE.navigation.previousScreen =
        STATE.navigation.currentScreen;

    STATE.navigation.currentScreen =
        screen;

    saveState();

    emitStateChange();
}


function openModal(modal) {

    STATE.navigation.modal =
        modal;

    emitStateChange();
}


function closeModal() {

    STATE.navigation.modal =
        null;

    emitStateChange();
}


/* ============================================================
   ИНИЦИАЛИЗАЦИЯ
   ============================================================ */

loadState();


/* ============================================================
   GLOBAL
   ============================================================ */

window.DEFAULT_STATE = DEFAULT_STATE;

window.STATE = STATE;

window.getState = getState;

window.setState = setState;

window.updateState = updateState;

window.getStateValue = getStateValue;

window.saveState = saveState;

window.loadState = loadState;

window.resetState = resetState;

window.subscribeToState =
    subscribeToState;

window.emitStateChange =
    emitStateChange;

window.getBaby =
    getBaby;

window.updateBaby =
    updateBaby;

window.addToStateArray =
    addToStateArray;

window.removeFromStateArray =
    removeFromStateArray;

window.toggleStateArrayItem =
    toggleStateArrayItem;

window.isProductIntroduced =
    isProductIntroduced;

window.isProductFavorite =
    isProductFavorite;

window.isProductPlanned =
    isProductPlanned;

window.markProductIntroduced =
    markProductIntroduced;

window.toggleFavoriteProduct =
    toggleFavoriteProduct;

window.planProduct =
    planProduct;

window.addDiaryEntry =
    addDiaryEntry;

window.getPlanForDate =
    getPlanForDate;

window.setPlanForDate =
    setPlanForDate;

window.addMealToPlan =
    addMealToPlan;

window.addReaction =
    addReaction;

window.addToPantry =
    addToPantry;

window.removeFromPantry =
    removeFromPantry;

window.addShoppingItem =
    addShoppingItem;

window.toggleShoppingItem =
    toggleShoppingItem;

window.setCurrentScreen =
    setCurrentScreen;

window.openModal =
    openModal;

window.closeModal =
    closeModal;
    function updateState(updater) {
    if (typeof updater === 'function') {
        updater(STATE);
        saveState();
        emitStateChange();
    }
}
window.updateState = updateState;