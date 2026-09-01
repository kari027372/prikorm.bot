/* ============================================================
   config.js
   Центральная конфигурация приложения по прикорму
   ============================================================ */

const APP_CONFIG = {

    /* ----------------------------------------------------------
       Приложение
       ---------------------------------------------------------- */

    app: {
        name: "Прикорм",
        version: "2.0.0",
        language: "ru",
        storageKey: "prikorm_app_state",
        themeStorageKey: "prikorm_theme"
    },


    /* ----------------------------------------------------------
       НАВИГАЦИЯ
       ---------------------------------------------------------- */

    navigation: {
        tabs: [
            {
                id: "home",
                title: "Сегодня",
                icon: "home"
            },
            {
                id: "plan",
                title: "План",
                icon: "calendar"
            },
            {
                id: "products",
                title: "Продукты",
                icon: "food"
            },
            {
                id: "food",
                title: "Еда",
                icon: "meal"
            },
            {
                id: "baby",
                title: "Малыш",
                icon: "baby"
            }
        ],

        quickAdd: [
            {
                id: "feeding",
                title: "Кормление",
                icon: "🥣"
            },
            {
                id: "product",
                title: "Новый продукт",
                icon: "🥕"
            },
            {
                id: "water",
                title: "Вода",
                icon: "💧"
            },
            {
                id: "reaction",
                title: "Реакция",
                icon: "🌸"
            },
            {
                id: "photo",
                title: "Фото",
                icon: "📷"
            },
            {
                id: "note",
                title: "Заметка",
                icon: "📝"
            }
        ]
    },


    /* ----------------------------------------------------------
       ЭТАПЫ ПРИКОРМА
       
       ВАЖНО:
       возраст не используется как автоматическое разрешение
       или запрет на прикорм.
       ---------------------------------------------------------- */

    feedingStages: {

        notStarted: {
            id: "not_started",
            title: "Прикорм ещё не начат"
        },

        starting: {
            id: "starting",
            title: "Начало прикорма"
        },

        exploring: {
            id: "exploring",
            title: "Знакомство с продуктами"
        },

        expanding: {
            id: "expanding",
            title: "Расширяем рацион"
        },

        familyFood: {
            id: "family_food",
            title: "Переход к семейной еде"
        }
    },


    /* ----------------------------------------------------------
       ПОДХОД К ПРИКОРМУ
       ---------------------------------------------------------- */

    feedingApproaches: {

        puree: {
            id: "puree",
            title: "Пюре",
            icon: "🥄"
        },

        blw: {
            id: "blw",
            title: "BLW",
            icon: "🖐️"
        },

        mixed: {
            id: "mixed",
            title: "Смешанный",
            icon: "🍲"
        }
    },


    /* ----------------------------------------------------------
       СПОСОБ ПОЛУЧЕНИЯ ПРОДУКТА
       ---------------------------------------------------------- */

    productSources: {

        homemade: {
            id: "homemade",
            title: "Приготовила сама",
            icon: "🏠"
        },

        purchased: {
            id: "purchased",
            title: "Купила готовым",
            icon: "🛒"
        }
    },


    /* ----------------------------------------------------------
       СПОСОБ ПРИГОТОВЛЕНИЯ
       ---------------------------------------------------------- */

    preparationMethods: [
        {
            id: "steamed",
            title: "На пару",
            icon: "♨️"
        },
        {
            id: "boiled",
            title: "Варка",
            icon: "🍲"
        },
        {
            id: "baked",
            title: "Запекание",
            icon: "🔥"
        },
        {
            id: "stewed",
            title: "Тушение",
            icon: "🥘"
        },
        {
            id: "raw",
            title: "Без приготовления",
            icon: "🥒"
        },
        {
            id: "other",
            title: "Другое",
            icon: "🍽️"
        }
    ],


    /* ----------------------------------------------------------
       ФОРМЫ ПОДАЧИ
       ---------------------------------------------------------- */

    servingForms: [
        {
            id: "puree",
            title: "Пюре",
            icon: "🥣"
        },
        {
            id: "mashed",
            title: "Размятое",
            icon: "🥔"
        },
        {
            id: "soft_pieces",
            title: "Мягкие кусочки",
            icon: "🍌"
        },
        {
            id: "finger_food",
            title: "Finger food",
            icon: "🖐️"
        },
        {
            id: "mixed_dish",
            title: "В составе блюда",
            icon: "🍲"
        },
        {
            id: "other",
            title: "Другое",
            icon: "🍽️"
        }
    ],


    /* ----------------------------------------------------------
       СТАТУСЫ ПРОДУКТА
       ---------------------------------------------------------- */

    productStatuses: {

        notTried: {
            id: "not_tried",
            title: "Не пробовали",
            icon: "🟡"
        },

        planned: {
            id: "planned",
            title: "Запланирован",
            icon: "🔵"
        },

        introducing: {
            id: "introducing",
            title: "Знакомимся",
            icon: "🟠"
        },

        introduced: {
            id: "introduced",
            title: "Знаком",
            icon: "🟢"
        },

        loved: {
            id: "loved",
            title: "Любимый",
            icon: "❤️"
        },

        disliked: {
            id: "disliked",
            title: "Не понравился",
            icon: "😐"
        },

        reaction: {
            id: "reaction",
            title: "Была реакция",
            icon: "⚠️"
        },

        excluded: {
            id: "excluded",
            title: "Исключён",
            icon: "🚫"
        }
    },


    /* ----------------------------------------------------------
       ОЦЕНКА КОРМЛЕНИЯ
       ---------------------------------------------------------- */

    eatingResults: [
        {
            id: "tried",
            title: "Попробовал",
            icon: "🌱"
        },
        {
            id: "little",
            title: "Съел немного",
            icon: "🥄"
        },
        {
            id: "good",
            title: "Съел хорошо",
            icon: "😊"
        },
        {
            id: "portion",
            title: "Съел порцию",
            icon: "🍽️"
        },
        {
            id: "refused",
            title: "Отказался",
            icon: "🙅"
        },
        {
            id: "not_measured",
            title: "Не измеряла",
            icon: "—"
        }
    ],


    /* ----------------------------------------------------------
       РЕАКЦИИ
       ---------------------------------------------------------- */

    reactions: [
        {
            id: "none",
            title: "Всё хорошо",
            icon: "😊",
            severity: "none"
        },
        {
            id: "skin",
            title: "Кожа",
            icon: "🌸",
            severity: "attention"
        },
        {
            id: "digestive",
            title: "ЖКТ / стул",
            icon: "💩",
            severity: "attention"
        },
        {
            id: "vomiting",
            title: "Рвота",
            icon: "🤢",
            severity: "urgent"
        },
        {
            id: "breathing",
            title: "Дыхание",
            icon: "🫁",
            severity: "urgent"
        },
        {
            id: "swelling",
            title: "Отёк",
            icon: "⚠️",
            severity: "urgent"
        },
        {
            id: "behavior",
            title: "Поведение",
            icon: "😣",
            severity: "attention"
        },
        {
            id: "other",
            title: "Другое",
            icon: "📝",
            severity: "attention"
        }
    ],


    /* ----------------------------------------------------------
       АЛЛЕРГЕНЫ
       ---------------------------------------------------------- */

    allergens: [
        {
            id: "egg",
            title: "Яйцо",
            icon: "🥚"
        },
        {
            id: "peanut",
            title: "Арахис",
            icon: "🥜"
        },
        {
            id: "tree_nuts",
            title: "Орехи",
            icon: "🌰"
        },
        {
            id: "milk",
            title: "Молоко",
            icon: "🥛"
        },
        {
            id: "wheat",
            title: "Пшеница / глютен",
            icon: "🌾"
        },
        {
            id: "soy",
            title: "Соя",
            icon: "🫘"
        },
        {
            id: "fish",
            title: "Рыба",
            icon: "🐟"
        },
        {
            id: "shellfish",
            title: "Ракообразные",
            icon: "🦐"
        },
        {
            id: "sesame",
            title: "Кунжут",
            icon: "🌱"
        }
    ],


    /* ----------------------------------------------------------
       СТАТУС АЛЛЕРГЕНА
       ---------------------------------------------------------- */

    allergenStatuses: {
        notIntroduced: {
            id: "not_introduced",
            title: "Не введён",
            icon: "🟡"
        },

        planned: {
            id: "planned",
            title: "Запланирован",
            icon: "🔵"
        },

        introduced: {
            id: "introduced",
            title: "Введён",
            icon: "🟢"
        },

        reaction: {
            id: "reaction",
            title: "Была реакция",
            icon: "⚠️"
        },

        excluded: {
            id: "excluded",
            title: "Исключён",
            icon: "🚫"
        }
    },


    /* ----------------------------------------------------------
       КАТЕГОРИИ ПРОДУКТОВ
       ---------------------------------------------------------- */

    productCategories: [
        {
            id: "vegetables",
            title: "Овощи",
            icon: "🥦"
        },
        {
            id: "fruits",
            title: "Фрукты",
            icon: "🍎"
        },
        {
            id: "berries",
            title: "Ягоды",
            icon: "🫐"
        },
        {
            id: "meat",
            title: "Мясо",
            icon: "🥩"
        },
        {
            id: "fish",
            title: "Рыба",
            icon: "🐟"
        },
        {
            id: "eggs",
            title: "Яйца",
            icon: "🥚"
        },
        {
            id: "grains",
            title: "Крупы",
            icon: "🌾"
        },
        {
            id: "legumes",
            title: "Бобовые",
            icon: "🫘"
        },
        {
            id: "dairy",
            title: "Молочные продукты",
            icon: "🥛"
        },
        {
            id: "nuts",
            title: "Орехи и семена",
            icon: "🥜"
        },
        {
            id: "oils",
            title: "Масла",
            icon: "🫒"
        },
        {
            id: "other",
            title: "Другое",
            icon: "🍽️"
        }
    ],


    /* ----------------------------------------------------------
       ТЕКСТУРЫ
       ---------------------------------------------------------- */

    textures: [
        {
            id: "smooth",
            title: "Гладкое пюре",
            level: 1
        },
        {
            id: "thick_puree",
            title: "Густое пюре",
            level: 2
        },
        {
            id: "mashed",
            title: "Размятая пища",
            level: 3
        },
        {
            id: "soft_lumps",
            title: "Мягкие комочки",
            level: 4
        },
        {
            id: "soft_pieces",
            title: "Мягкие кусочки",
            level: 5
        },
        {
            id: "finger_food",
            title: "Finger food",
            level: 6
        }
    ],


    /* ----------------------------------------------------------
       ИСТОЧНИКИ ЖЕЛЕЗА
       ---------------------------------------------------------- */

    ironRichCategories: [
        "meat",
        "fish",
        "eggs",
        "legumes"
    ],


    /* ----------------------------------------------------------
       КОЛИЧЕСТВО
       
       Не используем обязательную схему:
       1/2 ложки → 1 ложка → 2 ложки.
       
       Количество пользователь может указать добровольно.
       ---------------------------------------------------------- */

    amountOptions: [
        {
            id: "not_measured",
            title: "Не измеряла"
        },
        {
            id: "taste",
            title: "Попробовал"
        },
        {
            id: "little",
            title: "Немного"
        },
        {
            id: "medium",
            title: "Средняя порция"
        },
        {
            id: "portion",
            title: "Порция"
        },
        {
            id: "custom",
            title: "Своё количество"
        }
    ],


    /* ----------------------------------------------------------
       ПЛАНИРОВАНИЕ
       ---------------------------------------------------------- */

    planning: {

        defaultMealTypes: [
            {
                id: "breakfast",
                title: "Завтрак",
                icon: "🌅"
            },
            {
                id: "lunch",
                title: "Обед",
                icon: "☀️"
            },
            {
                id: "snack",
                title: "Полдник",
                icon: "🍎"
            },
            {
                id: "dinner",
                title: "Ужин",
                icon: "🌙"
            }
        ],

        allowReplace: true,
        allowMove: true,
        allowDelete: true,
        allowCustomMeal: true
    },


    /* ----------------------------------------------------------
       ФИЛЬТРЫ ПРОДУКТОВ
       ---------------------------------------------------------- */

    productFilters: [
        {
            id: "all",
            title: "Все"
        },
        {
            id: "not_tried",
            title: "Не пробовали"
        },
        {
            id: "introduced",
            title: "Знакомы"
        },
        {
            id: "favorites",
            title: "❤️ Избранное"
        },
        {
            id: "allergens",
            title: "Аллергены"
        },
        {
            id: "iron",
            title: "Железо"
        },
        {
            id: "blw",
            title: "BLW"
        },
        {
            id: "puree",
            title: "Пюре"
        }
    ],


    /* ----------------------------------------------------------
       ПЕРСОНАЛИЗАЦИЯ TODAY
       ---------------------------------------------------------- */

    homeBlocks: [
        {
            id: "baby_header",
            title: "Профиль малыша",
            enabled: true
        },
        {
            id: "next_step",
            title: "Следующий шаг",
            enabled: true
        },
        {
            id: "today_meals",
            title: "Сегодня",
            enabled: true
        },
        {
            id: "recommendation",
            title: "Персональная рекомендация",
            enabled: true
        },
        {
            id: "at_home",
            title: "Что есть дома",
            enabled: true
        },
        {
            id: "progress",
            title: "Прогресс",
            enabled: true
        }
    ],


    /* ----------------------------------------------------------
       НАПОМИНАНИЯ
       ---------------------------------------------------------- */

    notifications: {
        enabledByDefault: false,

        types: [
            "planned_meal",
            "new_product",
            "reaction_observation",
            "water",
            "preparation",
            "shopping"
        ]
    },


    /* ----------------------------------------------------------
       НАСТРОЙКИ БЕЗОПАСНОСТИ
       ---------------------------------------------------------- */

    safety: {

        showChokingWarnings: true,

        showPreparationWarnings: true,

        showAllergenWarnings: true,

        showUrgentReactionWarning: true,

        medicalDisclaimer: true
    },


    /* ----------------------------------------------------------
       ЛОКАЛЬНОЕ ХРАНЕНИЕ
       ---------------------------------------------------------- */

    storage: {

        version: 2,

        keys: {
            state: "prikorm_app_state",
            child: "prikorm_child",
            products: "prikorm_products",
            diary: "prikorm_diary",
            plan: "prikorm_plan",
            reactions: "prikorm_reactions",
            recipes: "prikorm_recipes",
            shopping: "prikorm_shopping",
            settings: "prikorm_settings"
        }
    },


    /* ----------------------------------------------------------
       DEFAULT SETTINGS
       ---------------------------------------------------------- */

    defaults: {

        approach: "mixed",

        notifications: false,

        homeBlocks: [
            "baby_header",
            "next_step",
            "today_meals",
            "recommendation",
            "at_home",
            "progress"
        ],

        showAmount: false,

        showWater: true,

        showRecipes: true,

        showProgress: true,

        showRecommendations: true
    }

};


/* ============================================================
   ОБРАТНАЯ СОВМЕСТИМОСТЬ
   Если старый код обращается к CONFIG,
   приложение не должно сразу ломаться.
   ============================================================ */

const CONFIG = APP_CONFIG;


/* ============================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================================ */

function getProductStatusConfig(status) {
    return (
        Object.values(APP_CONFIG.productStatuses)
            .find(item => item.id === status)
        || APP_CONFIG.productStatuses.notTried
    );
}


function getAllergenStatusConfig(status) {
    return (
        Object.values(APP_CONFIG.allergenStatuses)
            .find(item => item.id === status)
        || APP_CONFIG.allergenStatuses.notIntroduced
    );
}


function getCategoryConfig(category) {
    return (
        APP_CONFIG.productCategories
            .find(item => item.id === category)
        || APP_CONFIG.productCategories[
            APP_CONFIG.productCategories.length - 1
        ]
    );
}


function getApproachConfig(approach) {
    return (
        Object.values(APP_CONFIG.feedingApproaches)
            .find(item => item.id === approach)
        || APP_CONFIG.feedingApproaches.mixed
    );
}


function getProductSourceConfig(source) {
    return (
        Object.values(APP_CONFIG.productSources)
            .find(item => item.id === source)
        || APP_CONFIG.productSources.homemade
    );
}


/* ============================================================
   AGE HELPERS
   ============================================================ */

function getAgeInMonths(birthDate) {

    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();

    let months =
        (today.getFullYear() - birth.getFullYear()) * 12 +
        (today.getMonth() - birth.getMonth());

    if (today.getDate() < birth.getDate()) {
        months--;
    }

    return Math.max(0, months);
}


function getAgeInDays(birthDate) {

    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();

    const difference = today.getTime() - birth.getTime();

    return Math.max(
        0,
        Math.floor(difference / (1000 * 60 * 60 * 24))
    );
}


/* ============================================================
   ЭТАП ПРИКОРМА
   ============================================================ */

function getFeedingStage(child) {

    if (!child) {
        return APP_CONFIG.feedingStages.notStarted;
    }

    if (
        child.feedingStarted === false ||
        child.feedingStarted === undefined
    ) {
        return APP_CONFIG.feedingStages.notStarted;
    }

    const productsCount =
        Number(child.introducedProductsCount || 0);

    if (productsCount === 0) {
        return APP_CONFIG.feedingStages.starting;
    }

    if (productsCount < 10) {
        return APP_CONFIG.feedingStages.exploring;
    }

    if (productsCount < 30) {
        return APP_CONFIG.feedingStages.expanding;
    }

    return APP_CONFIG.feedingStages.familyFood;
}


/* ============================================================
   ГОТОВНОСТЬ
   ============================================================ */

function getReadinessChecklist() {

    return [
        {
            id: "sit_support",
            title: "Ребёнок может сидеть с поддержкой",
            checked: false
        },
        {
            id: "head_control",
            title: "Уверенно контролирует голову и шею",
            checked: false
        },
        {
            id: "food_interest",
            title: "Проявляет интерес к еде",
            checked: false
        },
        {
            id: "swallowing",
            title: "Может проглатывать пищу, а не только выталкивать её языком",
            checked: false
        },
        {
            id: "reach_food",
            title: "Может тянуться к предметам и еде",
            checked: false
        }
    ];
}


/* ============================================================
   ЭКСПОРТ В GLOBAL SCOPE
   Для обычного проекта через <script>
   ============================================================ */

window.APP_CONFIG = APP_CONFIG;
window.CONFIG = CONFIG;

window.getProductStatusConfig = getProductStatusConfig;
window.getAllergenStatusConfig = getAllergenStatusConfig;
window.getCategoryConfig = getCategoryConfig;
window.getApproachConfig = getApproachConfig;
window.getProductSourceConfig = getProductSourceConfig;

window.getAgeInMonths = getAgeInMonths;
window.getAgeInDays = getAgeInDays;

window.getFeedingStage = getFeedingStage;
    window.getReadinessChecklist = getReadinessChecklist;