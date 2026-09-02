/* ============================================================
   app.js
   Главная точка запуска приложения
   ============================================================ */

// Используем глобальный APP_CONFIG из config.js
const DEFAULT_SCREEN = "home";

/* ============================================================
   ЗАЩИТА ОТ ОТСУТСТВИЯ buildApp
   ============================================================ */
if (typeof buildApp === 'undefined') {
    console.warn('⚠️ buildApp не определена, создаём заглушку');
    window.buildApp = function() {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div id="app-content"></div>
                <div id="modal-root"></div>
                <div id="toast-root"></div>
            `;
        }
        console.log('✅ buildApp (заглушка) выполнена');
    };
}

/* ============================================================
   INIT
   ============================================================ */
function initApp() {
    console.log(`🌸 ${APP_CONFIG.app.name} v${APP_CONFIG.app.version}`);
    const app = document.getElementById('app');
    if (!app) {
        console.error("❌ Не найден #app");
        return;
    }
    initializeState();
    if (typeof initTheme === "function") initTheme();
    if (typeof buildApp === 'function') buildApp();
    else {
        console.warn('⚠️ buildApp не найдена, создаём заглушку вручную');
        app.innerHTML = `
            <div id="app-content"></div>
            <div id="modal-root"></div>
            <div id="toast-root"></div>
        `;
    }
    if (typeof setupEventListeners === "function") setupEventListeners();
    else console.warn('⚠️ setupEventListeners не найдена');
    const screen = (typeof STATE !== 'undefined' && STATE.ui && STATE.ui.screen) ? STATE.ui.screen : DEFAULT_SCREEN;
    if (typeof showScreen === 'function') showScreen(screen);
    else if (typeof render === 'function') render(screen);
    else console.error('❌ render или showScreen не найдены!');
    if (typeof updateProfileUI === 'function') updateProfileUI();

    // Проверка обновлений (добавлено)
    if (typeof initUpdater === 'function') {
        initUpdater();
    }

    console.log("✅ Приложение запущено");
}

/* ============================================================
   STATE INITIALIZATION
   ============================================================ */
function initializeState() {
    if (typeof loadState === "function") {
        loadState();
    } else {
        if (typeof STATE === "undefined") {
            window.STATE = {
                baby: {},
                diary: [],
                products: { introduced: [], favorites: [] },
                settings: { notifications: true },
                ui: { screen: DEFAULT_SCREEN },
                onboarding: {
                    readiness: {},
                    allergies: [],
                    diet: [],
                    favoriteFoods: [],
                    worries: [],
                    confidence: ''
                }
            };
        }
    }
    normalizeState();
}

/* ============================================================
   NORMALIZE STATE
   ============================================================ */
function normalizeState() {
    if (!window.STATE) window.STATE = {};
    if (!STATE.baby) STATE.baby = {};
    if (!Array.isArray(STATE.diary)) STATE.diary = [];
    if (!STATE.products) STATE.products = { introduced: [], favorites: [] };
    if (!Array.isArray(STATE.products.introduced)) STATE.products.introduced = [];
    if (!Array.isArray(STATE.products.favorites)) STATE.products.favorites = [];
    if (!STATE.settings) STATE.settings = { notifications: true };
    if (!STATE.ui) STATE.ui = { screen: DEFAULT_SCREEN };
    if (!STATE.onboarding) {
        STATE.onboarding = {
            readiness: {},
            allergies: [],
            diet: [],
            favoriteFoods: [],
            worries: [],
            confidence: ''
        };
    }
    if (!STATE.onboarding.readiness) STATE.onboarding.readiness = {};
    if (!Array.isArray(STATE.onboarding.allergies)) STATE.onboarding.allergies = [];
    if (!Array.isArray(STATE.onboarding.diet)) STATE.onboarding.diet = [];
    if (!Array.isArray(STATE.onboarding.favoriteFoods)) STATE.onboarding.favoriteFoods = [];
    if (!Array.isArray(STATE.onboarding.worries)) STATE.onboarding.worries = [];
    if (typeof STATE.onboarding.confidence !== 'string') STATE.onboarding.confidence = '';
    if (!Array.isArray(STATE.brands)) STATE.brands = [];
    if (!Array.isArray(STATE.notes)) STATE.notes = [];
    if (!Array.isArray(STATE.waterLog)) STATE.waterLog = [];
}

/* ============================================================
   APP SHELL
   ============================================================ */
function buildAppShell() {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
        <div id="app-content" class="app-content"></div>
        <div id="modal-root"></div>
        <div id="toast-root" aria-live="polite"></div>
    `;
}

/* ============================================================
   SCREEN
   ============================================================ */
function showScreen(screen) {
    const validScreens = [
        "home",
        "products",
        "today",
        "diary",
        "recipes",
        "baby",
        "settings"
    ];
    if (!validScreens.includes(screen)) {
        screen = DEFAULT_SCREEN;
    }
    if (window.STATE) {
        STATE.ui = STATE.ui || {};
        STATE.ui.screen = screen;
    }
    if (typeof saveState === "function") saveState();
    if (typeof render === "function") {
        render(screen);
    } else {
        console.error("❌ render() не найден");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
}

/* ============================================================
   MODAL
   ============================================================ */
function openModal(content) {
    const root = document.getElementById("modal-root");
    if (!root) return;
    root.innerHTML = content;
    document.body.classList.add("modal-open");
}

function closeModal() {
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = "";
    document.body.classList.remove("modal-open");
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, type = "default") {
    const root = document.getElementById("toast-root");
    if (!root) {
        console.log(message);
        return;
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    root.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

/* ============================================================
   BABY
   ============================================================ */
function setBaby(data) {
    if (!window.STATE) return;
    STATE.baby = { ...(STATE.baby || {}), ...(data || {}) };
    if (typeof saveState === "function") saveState();
    window.dispatchEvent(new CustomEvent("prikorm:statechange"));
}

/* ============================================================
   FAVORITES
   ============================================================ */
function toggleFavoriteProduct(productId) {
    if (!STATE?.products) return;
    if (!Array.isArray(STATE.products.favorites)) STATE.products.favorites = [];
    const index = STATE.products.favorites.indexOf(productId);
    if (index >= 0) STATE.products.favorites.splice(index, 1);
    else STATE.products.favorites.push(productId);
    if (typeof saveState === "function") saveState();
    window.dispatchEvent(new CustomEvent("prikorm:statechange"));
}

/* ============================================================
   RESET
   ============================================================ */
function resetState() {
    try {
        localStorage.removeItem("prikorm_state");
        localStorage.removeItem("prikorm_profile");
    } catch (error) {
        console.warn("Не удалось очистить localStorage", error);
    }
    window.STATE = {
        baby: {},
        diary: [],
        products: { introduced: [], favorites: [] },
        recipes: [],
        brands: [],
        notes: [],
        waterLog: [],
        settings: { notifications: true },
        ui: { screen: "home" }
    };
    if (typeof saveState === "function") saveState();
}

/* ============================================================
   LEGACY PROFILE MIGRATION
   ============================================================ */
function migrateLegacyProfile() {
    try {
        const raw = localStorage.getItem("prikorm_profile");
        if (!raw) return;
        const oldProfile = JSON.parse(raw);
        if (!oldProfile) return;
        if (!STATE.baby.name && oldProfile.baby_name) STATE.baby.name = oldProfile.baby_name;
        if (!STATE.baby.birthDate && oldProfile.birth_date) STATE.baby.birthDate = oldProfile.birth_date;
        if (!STATE.baby.feedingType && oldProfile.feeding_type) STATE.baby.feedingType = oldProfile.feeding_type;
        if (oldProfile.feeding_strategy) STATE.baby.feedingStrategy = oldProfile.feeding_strategy;
        if (Array.isArray(oldProfile.introduced_foods)) {
            oldProfile.introduced_foods.forEach(name => {
                const product = typeof PRODUCTS !== "undefined" ? PRODUCTS.find(p => p.name === name) : null;
                const value = product ? { id: product.id, name: product.name } : { name };
                const exists = STATE.products.introduced.some(item => (item.id || item.name) === (value.id || value.name));
                if (!exists) STATE.products.introduced.push(value);
            });
        }
        if (Array.isArray(oldProfile.loved_foods)) {
            oldProfile.loved_foods.forEach(name => {
                const product = typeof PRODUCTS !== "undefined" ? PRODUCTS.find(p => p.name === name) : null;
                if (product && !STATE.products.favorites.includes(product.id)) STATE.products.favorites.push(product.id);
            });
        }
        if (Array.isArray(oldProfile.food_history) && STATE.diary.length === 0) {
            STATE.diary = oldProfile.food_history.map(item => ({
                id: `legacy_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                date: item.date || "",
                time: "",
                productName: item.product || "",
                liked: null,
                notes: item.notes || "",
                reaction: item.reaction || null,
                source: "legacy"
            }));
        }
        if (Array.isArray(oldProfile.water_log)) STATE.waterLog = oldProfile.water_log;
        if (Array.isArray(oldProfile.notes)) STATE.notes = oldProfile.notes;
        saveState();
        console.log("✅ Старые данные перенесены");
    } catch (error) {
        console.warn("Не удалось перенести старые данные:", error);
    }
}

/* ============================================================
   GLOBAL EVENTS
   ============================================================ */
window.addEventListener("prikorm:themechange", event => {
    console.log("🎨 Тема:", event.detail?.theme);
});

/* ============================================================
   START
   ============================================================ */
function startApplication() {
    initApp();
    migrateLegacyProfile();
    if (typeof render === "function") {
        render(STATE.ui?.screen || DEFAULT_SCREEN);
    }
}

/* ============================================================
   DOM READY
   ============================================================ */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApplication, { once: true });
} else {
    startApplication();
}

/* ============================================================
   EXPORT
   ============================================================ */
window.initApp = initApp;
window.startApplication = startApplication;
window.showScreen = showScreen;
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.setBaby = setBaby;
window.toggleFavoriteProduct = toggleFavoriteProduct;
window.resetState = resetState;
window.migrateLegacyProfile = migrateLegacyProfile;