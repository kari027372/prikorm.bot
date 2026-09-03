/* ============================================================
   app.js
   Главная точка запуска приложения (исправлен)
   ============================================================ */

var DEFAULT_SCREEN = "home";

if (typeof buildApp === 'undefined') {
    console.warn('⚠️ buildApp не определена, создаём заглушку');
    window.buildApp = function() {
        var app = document.getElementById('app');
        if (app) {
            app.innerHTML = '<div id="app-content"></div><div id="modal-root"></div><div id="toast-root"></div>';
        }
        console.log('✅ buildApp (заглушка) выполнена');
    };
}

function initApp() {
    console.log('🌸 Запуск приложения...');
    var app = document.getElementById('app');
    if (!app) {
        console.error('❌ Не найден #app');
        return;
    }

    initializeState();

    // ===== СИНХРОНИЗАЦИЯ UI.SCREEN =====
    if (STATE.navigation && STATE.navigation.currentScreen && STATE.ui) {
        STATE.ui.screen = STATE.navigation.currentScreen;
        console.log('🔄 ui.screen синхронизирован с navigation.currentScreen:', STATE.ui.screen);
    }

    if (typeof initTheme === 'function') {
        initTheme();
    }

    if (typeof STATE.onboardingCompleted !== 'boolean') {
        STATE.onboardingCompleted = false;
    }
    // Если режим добавления не активен и онбординг не завершён – запускаем
    if (!STATE._onboardingMode && STATE.onboardingCompleted === false) {
        console.log('🔄 Онбординг не завершён, запускаем...');
        if (typeof renderOnboarding === 'function') {
            renderOnboarding();
            return;
        } else {
            console.warn('⚠️ Функция renderOnboarding не найдена, пропускаем');
            STATE.onboardingCompleted = true;
            if (typeof saveState === 'function') saveState();
        }
    }

    if (typeof buildApp === 'function') {
        buildApp();
    } else {
        console.warn('⚠️ buildApp не найдена, создаём заглушку вручную');
        app.innerHTML = '<div id="app-content"></div><div id="modal-root"></div><div id="toast-root"></div>';
    }

    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    } else {
        console.warn('⚠️ setupEventListeners не найдена');
    }

    var screen = (STATE && STATE.ui && STATE.ui.screen) ? STATE.ui.screen : DEFAULT_SCREEN;
    if (typeof showScreen === 'function') {
        showScreen(screen);
    } else if (typeof render === 'function') {
        render(screen);
        setTimeout(function() {
            render(screen);
        }, 200);
    } else {
        console.error('❌ render или showScreen не найдены!');
    }

    if (typeof updateProfileUI === 'function') {
        updateProfileUI();
    }

    console.log('✅ Приложение запущено');
}

function initializeState() {
    if (typeof loadState === 'function') {
        loadState();
    } else {
        if (typeof STATE === 'undefined') {
            window.STATE = {
                baby: {},
                diary: [],
                products: { introduced: [], favorites: [] },
                settings: { notifications: true },
                ui: { screen: DEFAULT_SCREEN },
                navigation: { currentScreen: DEFAULT_SCREEN, previousScreen: null, modal: null },
                onboarding: {
                    readiness: {},
                    allergies: [],
                    diet: [],
                    favoriteFoods: [],
                    worries: [],
                    confidence: ''
                },
                onboardingCompleted: false
            };
        }
    }

    normalizeState();

    if (!window.STATE) {
        window.STATE = {
            baby: {},
            diary: [],
            products: { introduced: [], favorites: [] },
            settings: { notifications: true },
            ui: { screen: DEFAULT_SCREEN },
            navigation: { currentScreen: DEFAULT_SCREEN, previousScreen: null, modal: null },
            onboarding: {
                readiness: {},
                allergies: [],
                diet: [],
                favoriteFoods: [],
                worries: [],
                confidence: ''
            },
            onboardingCompleted: false
        };
    }

    // ===== СИНХРОНИЗАЦИЯ UI.SCREEN (если navigation уже есть) =====
    if (STATE.navigation && STATE.navigation.currentScreen && STATE.ui) {
        STATE.ui.screen = STATE.navigation.currentScreen;
    }

    if (typeof STATE.onboardingCompleted !== 'boolean') {
        STATE.onboardingCompleted = false;
    }
}

function normalizeState() {
    if (!window.STATE) window.STATE = {};
    if (!STATE.baby) STATE.baby = {};
    if (!Array.isArray(STATE.diary)) STATE.diary = [];
    if (!STATE.products) STATE.products = { introduced: [], favorites: [] };
    if (!Array.isArray(STATE.products.introduced)) STATE.products.introduced = [];
    if (!Array.isArray(STATE.products.favorites)) STATE.products.favorites = [];
    if (!STATE.settings) STATE.settings = { notifications: true };
    if (!STATE.ui) STATE.ui = { screen: DEFAULT_SCREEN };
    if (!STATE.navigation) STATE.navigation = { currentScreen: DEFAULT_SCREEN, previousScreen: null, modal: null };
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
    if (typeof STATE.onboardingCompleted !== 'boolean') STATE.onboardingCompleted = false;
    if (!Array.isArray(STATE.brands)) STATE.brands = [];
    if (!Array.isArray(STATE.notes)) STATE.notes = [];
    if (!Array.isArray(STATE.waterLog)) STATE.waterLog = [];
}

function buildAppShell() {
    var app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '<div id="app-content" class="app-content"></div><div id="modal-root"></div><div id="toast-root" aria-live="polite"></div>';
}

function showScreen(screen) {
    var validScreens = ['home', 'products', 'today', 'diary', 'recipes', 'baby', 'settings'];
    if (!validScreens.includes(screen)) {
        screen = DEFAULT_SCREEN;
    }
    if (window.STATE) {
        STATE.ui = STATE.ui || {};
        STATE.ui.screen = screen;
        STATE.navigation = STATE.navigation || {};
        STATE.navigation.currentScreen = screen;
    }
    if (typeof saveState === 'function') saveState();
    if (typeof render === 'function') {
        render(screen);
    } else {
        console.error('❌ render() не найден');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function openModal(content) {
    var root = document.getElementById('modal-root');
    if (!root) return;
    root.innerHTML = content;
    document.body.classList.add('modal-open');
}

function closeModal() {
    var root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('modal-open');
}

function showToast(message, type) {
    var root = document.getElementById('toast-root');
    if (!root) {
        console.log(message);
        return;
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'default');
    toast.textContent = message;
    root.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('visible'); });
    setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() { toast.remove(); }, 250);
    }, 2800);
}

function setBaby(data) {
    if (!window.STATE) return;
    STATE.baby = { ...(STATE.baby || {}), ...(data || {}) };
    if (typeof saveState === 'function') saveState();
    window.dispatchEvent(new CustomEvent('prikorm:statechange'));
}

function toggleFavoriteProduct(productId) {
    if (!STATE?.products) return;
    if (!Array.isArray(STATE.products.favorites)) STATE.products.favorites = [];
    var index = STATE.products.favorites.indexOf(productId);
    if (index >= 0) STATE.products.favorites.splice(index, 1);
    else STATE.products.favorites.push(productId);
    if (typeof saveState === 'function') saveState();
    window.dispatchEvent(new CustomEvent('prikorm:statechange'));
}

function resetState() {
    try {
        localStorage.removeItem('prikorm_state');
        localStorage.removeItem('prikorm_profile');
    } catch (error) {
        console.warn('Не удалось очистить localStorage', error);
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
        ui: { screen: 'home' },
        navigation: { currentScreen: 'home', previousScreen: null, modal: null },
        onboarding: {
            readiness: {},
            allergies: [],
            diet: [],
            favoriteFoods: [],
            worries: [],
            confidence: ''
        },
        onboardingCompleted: false
    };
    if (typeof saveState === 'function') saveState();
}

function migrateLegacyProfile() {
    try {
        var raw = localStorage.getItem('prikorm_profile');
        if (!raw) return;
        var oldProfile = JSON.parse(raw);
        if (!oldProfile) return;
        if (!STATE.baby.name && oldProfile.baby_name) STATE.baby.name = oldProfile.baby_name;
        if (!STATE.baby.birthDate && oldProfile.birth_date) STATE.baby.birthDate = oldProfile.birth_date;
        if (!STATE.baby.feedingType && oldProfile.feeding_type) STATE.baby.feedingType = oldProfile.feeding_type;
        if (oldProfile.feeding_strategy) STATE.baby.feedingStrategy = oldProfile.feeding_strategy;
        if (Array.isArray(oldProfile.introduced_foods)) {
            oldProfile.introduced_foods.forEach(function(name) {
                var product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(function(p) { return p.name === name; }) : null;
                var value = product ? { id: product.id, name: product.name } : { name: name };
                var exists = STATE.products.introduced.some(function(item) { return (item.id || item.name) === (value.id || value.name); });
                if (!exists) STATE.products.introduced.push(value);
            });
        }
        if (Array.isArray(oldProfile.loved_foods)) {
            oldProfile.loved_foods.forEach(function(name) {
                var product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(function(p) { return p.name === name; }) : null;
                if (product && !STATE.products.favorites.includes(product.id)) STATE.products.favorites.push(product.id);
            });
        }
        if (Array.isArray(oldProfile.food_history) && STATE.diary.length === 0) {
            STATE.diary = oldProfile.food_history.map(function(item) {
                return {
                    id: 'legacy_' + Date.now() + '_' + Math.random().toString(36).slice(2),
                    date: item.date || '',
                    time: '',
                    productName: item.product || '',
                    liked: null,
                    notes: item.notes || '',
                    reaction: item.reaction || null,
                    source: 'legacy'
                };
            });
        }
        if (Array.isArray(oldProfile.water_log)) STATE.waterLog = oldProfile.water_log;
        if (Array.isArray(oldProfile.notes)) STATE.notes = oldProfile.notes;
        saveState();
        console.log('✅ Старые данные перенесены');
    } catch (error) {
        console.warn('Не удалось перенести старые данные:', error);
    }
}

window.addEventListener('prikorm:themechange', function(event) {
    console.log('🎨 Тема:', event.detail?.theme);
});

function startApplication() {
    initApp();
    migrateLegacyProfile();

    // ===== МИГРАЦИЯ baby → children =====
    if (STATE.baby && Object.keys(STATE.baby).length > 0) {
        console.log('🔄 Обнаружен старый объект baby, мигрируем в children...');
        if (typeof window.migrateBabyToChildren === 'function') {
            window.migrateBabyToChildren();
        } else {
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
                photo: STATE.baby.photo || ''
            };
            if (!STATE.children) STATE.children = [];
            STATE.children.push(newChild);
            STATE.currentChildId = newChild.id;
            delete STATE.baby;
            if (typeof saveState === 'function') saveState();
            console.log('✅ Миграция выполнена, создан ребёнок:', newChild);
        }
    }

    // ===== ЗАЩИТА ОТ ГЛОБАЛЬНОГО ОНБОРДИНГА =====
    if (STATE.children && STATE.children.length > 0 && STATE.onboardingCompleted === false) {
        console.log('🔄 Обнаружены дети, но онбординг не завершён. Исправляем...');
        STATE.onboardingCompleted = true;
        if (typeof saveState === 'function') saveState();
    }

    if (STATE._onboardingMode) {
        STATE._onboardingMode = null;
        if (typeof saveState === 'function') saveState();
    }

    // ===== СИНХРОНИЗАЦИЯ UI.SCREEN =====
    if (STATE.navigation && STATE.navigation.currentScreen) {
        STATE.ui.screen = STATE.navigation.currentScreen;
        console.log('🔄 ui.screen синхронизирован с navigation.currentScreen:', STATE.ui.screen);
        if (typeof saveState === 'function') saveState();
    }

    setTimeout(function() {
        if (typeof render === 'function') {
            render('home');
            console.log('🔄 Принудительный рендер home выполнен');
        }
    }, 300);
}

// Запуск приложения
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication, { once: true });
} else {
    startApplication();
}

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

window.resetOnboarding = function() {
    if (STATE) {
        STATE.onboardingCompleted = false;
        saveState();
        location.reload();
    }
};