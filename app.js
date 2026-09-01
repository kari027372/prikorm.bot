/* ============================================================
   app.js
   Главная точка запуска приложения
   ============================================================ */


/* ============================================================
   APPLICATION
   ============================================================ */

const APP_CONFIG = {

    name: "Прикорм",

    version: "4.0.0",

    defaultScreen: "home"

};


/* ============================================================
   INIT
   ============================================================ */

function initApp() {

    console.log(
        `🌸 ${APP_CONFIG.name} v${APP_CONFIG.version}`
    );


    /*
       1. Проверяем контейнер приложения
    */

    const app =
        document.getElementById("app");


    if (!app) {

        console.error(
            "❌ Не найден #app"
        );

        return;
    }


    /*
       2. Загружаем состояние
    */

    initializeState();


    /*
       3. Инициализируем тему
    */

    if (
        typeof initTheme ===
        "function"
    ) {

        initTheme();
    }


    /*
       4. Создаём базовую структуру
    */

    buildAppShell();


    /*
       5. Подключаем обработчики
    */

    if (
        typeof setupEventListeners ===
        "function"
    ) {

        setupEventListeners();
    }


    /*
       6. Первый экран
    */

    const screen =
        STATE.ui?.screen ||
        APP_CONFIG.defaultScreen;


    showScreen(
        screen
    );


    /*
       7. Обновляем интерфейс
    */

    updateProfileUI();


    console.log(
        "✅ Приложение запущено"
    );
}


/* ============================================================
   STATE INITIALIZATION
   ============================================================ */

function initializeState() {

    /*
       Новый STATE
    */

    if (
        typeof loadState ===
        "function"
    ) {

        loadState();

    } else {

        /*
           На случай если state.js
           ещё не подключён.
        */

        if (
            typeof STATE ===
            "undefined"
        ) {

            window.STATE = {
                baby: {},
                diary: [],
                products: {
                    introduced: [],
                    favorites: []
                },
                recipes: [],
                settings: {
                    notifications: true
                },
                ui: {
                    screen:
                        APP_CONFIG.defaultScreen
                }
            };
        }
    }


    /*
       Проверяем обязательные поля,
       чтобы приложение не падало
       на старых данных.
    */

    normalizeState();
}


/* ============================================================
   NORMALIZE STATE
   ============================================================ */

function normalizeState() {

    if (!window.STATE) {

        window.STATE = {};
    }


    if (!STATE.baby) {

        STATE.baby = {};
    }


    if (!Array.isArray(
        STATE.diary
    )) {

        STATE.diary = [];
    }


    if (!STATE.products) {

        STATE.products = {};
    }


    if (!Array.isArray(
        STATE.products.introduced
    )) {

        STATE.products.introduced = [];
    }


    if (!Array.isArray(
        STATE.products.favorites
    )) {

        STATE.products.favorites = [];
    }


    if (!STATE.settings) {

        STATE.settings = {};
    }


    if (
        typeof STATE.settings.notifications !==
        "boolean"
    ) {

        STATE.settings.notifications =
            true;
    }


    if (!STATE.ui) {

        STATE.ui = {};
    }


    if (!STATE.ui.screen) {

        STATE.ui.screen =
            APP_CONFIG.defaultScreen;
    }


    /*
       Дополнительные поля,
       которые нужны новой системе.
    */

    if (
        !Array.isArray(
            STATE.brands
        )
    ) {

        STATE.brands = [];
    }


    if (
        !Array.isArray(
            STATE.notes
        )
    ) {

        STATE.notes = [];
    }


    if (
        !Array.isArray(
            STATE.waterLog
        )
    ) {

        STATE.waterLog = [];
    }
}


/* ============================================================
   APP SHELL
   ============================================================ */

function buildAppShell() {

    const app =
        document.getElementById(
            "app"
        );


    if (!app) {
        return;
    }


    /*
       Не создаём постоянную навигацию
       здесь — rendering.js создаёт её
       вместе с экраном.

       Здесь только базовые контейнеры.
    */

    app.innerHTML = `

        <div
            id="app-content"
            class="app-content">
        </div>


        <div
            id="modal-root">
        </div>


        <div
            id="toast-root"
            aria-live="polite">
        </div>

    `;
}


/* ============================================================
   SCREEN
   ============================================================ */

function showScreen(
    screen
) {

    const validScreens = [

        "home",

        "products",

        "today",

        "diary",

        "recipes",

        "baby",

        "settings"

    ];


    if (
        !validScreens.includes(
            screen
        )
    ) {

        screen =
            APP_CONFIG.defaultScreen;
    }


    /*
       Сохраняем текущий экран.
    */

    if (window.STATE) {

        STATE.ui =
            STATE.ui || {};

        STATE.ui.screen =
            screen;
    }


    /*
       Запоминаем состояние.
    */

    if (
        typeof saveState ===
        "function"
    ) {

        saveState();
    }


    /*
       Вызываем главный renderer.
    */

    if (
        typeof render ===
        "function"
    ) {

        render(
            screen
        );

    } else {

        console.error(
            "❌ render() не найден"
        );
    }


    /*
       Аккуратно возвращаемся
       в начало страницы.
    */

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });
}


/* ============================================================
   MODAL
   ============================================================ */

function openModal(
    content
) {

    const root =
        document.getElementById(
            "modal-root"
        );


    if (!root) {
        return;
    }


    root.innerHTML = content;


    document.body.classList.add(
        "modal-open"
    );
}


function closeModal() {

    const root =
        document.getElementById(
            "modal-root"
        );


    if (root) {

        root.innerHTML = "";
    }


    document.body.classList.remove(
        "modal-open"
    );
}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(
    message,
    type = "default"
) {

    const root =
        document.getElementById(
            "toast-root"
        );


    if (!root) {

        /*
           fallback
        */

        console.log(
            message
        );

        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    toast.textContent =
        message;


    root.appendChild(
        toast
    );


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "visible"
            );
        }
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "visible"
            );


            setTimeout(
                () => {

                    toast.remove();

                },
                250
            );

        },
        2800
    );
}


/* ============================================================
   BABY
   ============================================================ */

function setBaby(
    data
) {

    if (!window.STATE) {
        return;
    }


    STATE.baby =
        {
            ...(STATE.baby || {}),
            ...(data || {})
        };


    if (
        typeof saveState ===
        "function"
    ) {

        saveState();
    }


    window.dispatchEvent(
        new CustomEvent(
            "prikorm:statechange"
        )
    );
}


/* ============================================================
   FAVORITES
   ============================================================ */

function toggleFavoriteProduct(
    productId
) {

    if (!STATE?.products) {
        return;
    }


    if (
        !Array.isArray(
            STATE.products.favorites
        )
    ) {

        STATE.products.favorites =
            [];
    }


    const index =
        STATE.products.favorites
            .indexOf(
                productId
            );


    if (index >= 0) {

        STATE.products.favorites
            .splice(
                index,
                1
            );

    } else {

        STATE.products.favorites
            .push(
                productId
            );
    }


    if (
        typeof saveState ===
        "function"
    ) {

        saveState();
    }


    window.dispatchEvent(
        new CustomEvent(
            "prikorm:statechange"
        )
    );
}


/* ============================================================
   RESET
   ============================================================ */

function resetState() {

    try {

        localStorage.removeItem(
            "prikorm_state"
        );

        localStorage.removeItem(
            "prikorm_profile"
        );

    } catch (error) {

        console.warn(
            "Не удалось очистить localStorage",
            error
        );
    }


    window.STATE = {

        baby: {},

        diary: [],

        products: {

            introduced: [],

            favorites: []

        },

        recipes: [],

        brands: [],

        notes: [],

        waterLog: [],

        settings: {

            notifications: true

        },

        ui: {

            screen: "home"

        }

    };


    if (
        typeof saveState ===
        "function"
    ) {

        saveState();
    }
}


/* ============================================================
   LEGACY PROFILE MIGRATION
   ============================================================ */

function migrateLegacyProfile() {

    /*
       Старый проект использовал
       отдельный profile/localStorage.

       Мы не удаляем его автоматически.
       Только переносим то, что можем
       безопасно сопоставить.
    */

    try {

        const raw =
            localStorage.getItem(
                "prikorm_profile"
            );


        if (!raw) {
            return;
        }


        const oldProfile =
            JSON.parse(
                raw
            );


        if (!oldProfile) {
            return;
        }


        /*
           Если новый профиль пустой,
           переносим основные данные.
        */

        if (
            !STATE.baby.name &&
            oldProfile.baby_name
        ) {

            STATE.baby.name =
                oldProfile.baby_name;
        }


        if (
            !STATE.baby.birthDate &&
            oldProfile.birth_date
        ) {

            STATE.baby.birthDate =
                oldProfile.birth_date;
        }


        if (
            !STATE.baby.feedingType &&
            oldProfile.feeding_type
        ) {

            STATE.baby.feedingType =
                oldProfile.feeding_type;
        }


        if (
            oldProfile.feeding_strategy
        ) {

            STATE.baby.feedingStrategy =
                oldProfile.feeding_strategy;
        }


        /*
           Уже введённые продукты
        */

        if (
            Array.isArray(
                oldProfile.introduced_foods
            )
        ) {

            oldProfile
                .introduced_foods
                .forEach(
                    name => {

                        const product =
                            typeof PRODUCTS !==
                            "undefined"
                                ? PRODUCTS.find(
                                    p =>
                                        p.name ===
                                        name
                                )
                                : null;


                        const value =
                            product
                                ? {
                                    id:
                                        product.id,

                                    name:
                                        product.name
                                }
                                : {
                                    name
                                };


                        const exists =
                            STATE.products
                                .introduced
                                .some(
                                    item =>
                                        (
                                            item.id ||
                                            item.name
                                        ) ===
                                        (
                                            value.id ||
                                            value.name
                                        )
                                );


                        if (!exists) {

                            STATE.products
                                .introduced
                                .push(
                                    value
                                );
                        }

                    }
                );
        }


        /*
           Любимые продукты
        */

        if (
            Array.isArray(
                oldProfile.loved_foods
            )
        ) {

            oldProfile
                .loved_foods
                .forEach(
                    name => {

                        const product =
                            typeof PRODUCTS !==
                            "undefined"
                                ? PRODUCTS.find(
                                    p =>
                                        p.name ===
                                        name
                                )
                                : null;


                        if (
                            product &&
                            !STATE.products
                                .favorites
                                .includes(
                                    product.id
                                )
                        ) {

                            STATE.products
                                .favorites
                                .push(
                                    product.id
                                );
                        }

                    }
                );
        }


        /*
           История питания
        */

        if (
            Array.isArray(
                oldProfile.food_history
            ) &&
            STATE.diary.length === 0
        ) {

            STATE.diary =
                oldProfile.food_history
                    .map(
                        item => ({

                            id:
                                `legacy_${Date.now()}_${Math.random()
                                    .toString(36)
                                    .slice(2)}`,

                            date:
                                item.date ||
                                "",

                            time:
                                "",

                            productName:
                                item.product ||
                                "",

                            liked:
                                null,

                            notes:
                                item.notes ||
                                "",

                            reaction:
                                item.reaction ||
                                null,

                            source:
                                "legacy"

                        })
                    );
        }


        /*
           Вода
        */

        if (
            Array.isArray(
                oldProfile.water_log
            )
        ) {

            STATE.waterLog =
                oldProfile.water_log;
        }


        /*
           Заметки
        */

        if (
            Array.isArray(
                oldProfile.notes
            )
        ) {

            STATE.notes =
                oldProfile.notes;
        }


        saveState();


        console.log(
            "✅ Старые данные перенесены"
        );

    } catch (error) {

        console.warn(
            "Не удалось перенести старые данные:",
            error
        );
    }
}


/* ============================================================
   GLOBAL EVENTS
   ============================================================ */

window.addEventListener(
    "prikorm:themechange",
    event => {

        console.log(
            "🎨 Тема:",
            event.detail?.theme
        );
    }
);


/* ============================================================
   START
   ============================================================ */

function startApplication() {

    /*
       Если state.js имеет собственную
       загрузку — сначала она будет вызвана.
    */

    initApp();


    /*
       После инициализации пробуем
       перенести старый профиль.
    */

    migrateLegacyProfile();


    /*
       Перерисовываем экран после миграции.
    */

    if (
        typeof render ===
        "function"
    ) {

        render(
            STATE.ui?.screen ||
            APP_CONFIG.defaultScreen
        );
    }
}


/*
   DOM готов
*/

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApplication,
        {
            once: true
        }
    );

} else {

    startApplication();
}


/* ============================================================
   EXPORT
   ============================================================ */

window.initApp =
    initApp;

window.startApplication =
    startApplication;

window.showScreen =
    showScreen;

window.openModal =
    openModal;

window.closeModal =
    closeModal;

window.showToast =
    showToast;

window.setBaby =
    setBaby;

window.toggleFavoriteProduct =
    toggleFavoriteProduct;

window.resetState =
    resetState;

window.migrateLegacyProfile =
    migrateLegacyProfile;