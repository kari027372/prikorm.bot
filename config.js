// config.js — центральная конфигурация
const APP_CONFIG = {
    app: {
        name: "Прикорм",
        version: "2.0.0",
        language: "ru",
        storageKey: "prikorm_app_state",
        themeStorageKey: "prikorm_theme"
    },
    navigation: { tabs: [], quickAdd: [] },
    feedingStages: {
        notStarted: { id: "not_started", title: "Прикорм ещё не начат" },
        starting: { id: "starting", title: "Начало прикорма" },
        exploring: { id: "exploring", title: "Знакомство с продуктами" },
        expanding: { id: "expanding", title: "Расширяем рацион" },
        familyFood: { id: "family_food", title: "Переход к семейной еде" }
    },
    feedingApproaches: {
        puree: { id: "puree", title: "Пюре", icon: "🥄" },
        blw: { id: "blw", title: "BLW", icon: "🖐️" },
        mixed: { id: "mixed", title: "Смешанный", icon: "🍲" }
    },
    productSources: {
        homemade: { id: "homemade", title: "Приготовила сама", icon: "🏠" },
        purchased: { id: "purchased", title: "Купила готовым", icon: "🛒" }
    },
    preparationMethods: [
        { id: "steamed", title: "На пару", icon: "♨️" },
        { id: "boiled", title: "Варка", icon: "🍲" },
        { id: "baked", title: "Запекание", icon: "🔥" },
        { id: "stewed", title: "Тушение", icon: "🥘" },
        { id: "raw", title: "Без приготовления", icon: "🥒" },
        { id: "other", title: "Другое", icon: "🍽️" }
    ],
    servingForms: [
        { id: "puree", title: "Пюре", icon: "🥣" },
        { id: "mashed", title: "Размятое", icon: "🥔" },
        { id: "soft_pieces", title: "Мягкие кусочки", icon: "🍌" },
        { id: "finger_food", title: "Finger food", icon: "🖐️" },
        { id: "mixed_dish", title: "В составе блюда", icon: "🍲" },
        { id: "other", title: "Другое", icon: "🍽️" }
    ],
    productStatuses: {
        notTried: { id: "not_tried", title: "Не пробовали", icon: "🟡" },
        planned: { id: "planned", title: "Запланирован", icon: "🔵" },
        introducing: { id: "introducing", title: "Знакомимся", icon: "🟠" },
        introduced: { id: "introduced", title: "Знаком", icon: "🟢" },
        loved: { id: "loved", title: "Любимый", icon: "❤️" },
        disliked: { id: "disliked", title: "Не понравился", icon: "😐" },
        reaction: { id: "reaction", title: "Была реакция", icon: "⚠️" },
        excluded: { id: "excluded", title: "Исключён", icon: "🚫" }
    },
    eatingResults: [
        { id: "tried", title: "Попробовал", icon: "🌱" },
        { id: "little", title: "Съел немного", icon: "🥄" },
        { id: "good", title: "Съел хорошо", icon: "😊" },
        { id: "portion", title: "Съел порцию", icon: "🍽️" },
        { id: "refused", title: "Отказался", icon: "🙅" },
        { id: "not_measured", title: "Не измеряла", icon: "—" }
    ],
    reactions: [
        { id: "none", title: "Всё хорошо", icon: "😊", severity: "none" },
        { id: "skin", title: "Кожа", icon: "🌸", severity: "attention" },
        { id: "digestive", title: "ЖКТ / стул", icon: "💩", severity: "attention" },
        { id: "vomiting", title: "Рвота", icon: "🤢", severity: "urgent" },
        { id: "breathing", title: "Дыхание", icon: "🫁", severity: "urgent" },
        { id: "swelling", title: "Отёк", icon: "⚠️", severity: "urgent" },
        { id: "behavior", title: "Поведение", icon: "😣", severity: "attention" },
        { id: "other", title: "Другое", icon: "📝", severity: "attention" }
    ],
    allergens: [
        { id: "egg", title: "Яйцо", icon: "🥚" },
        { id: "peanut", title: "Арахис", icon: "🥜" },
        { id: "tree_nuts", title: "Орехи", icon: "🌰" },
        { id: "milk", title: "Молоко", icon: "🥛" },
        { id: "wheat", title: "Пшеница / глютен", icon: "🌾" },
        { id: "soy", title: "Соя", icon: "🫘" },
        { id: "fish", title: "Рыба", icon: "🐟" },
        { id: "shellfish", title: "Ракообразные", icon: "🦐" },
        { id: "sesame", title: "Кунжут", icon: "🌱" }
    ],
    allergenStatuses: {
        notIntroduced: { id: "not_introduced", title: "Не введён", icon: "🟡" },
        planned: { id: "planned", title: "Запланирован", icon: "🔵" },
        introduced: { id: "introduced", title: "Введён", icon: "🟢" },
        reaction: { id: "reaction", title: "Была реакция", icon: "⚠️" },
        excluded: { id: "excluded", title: "Исключён", icon: "🚫" }
    },
    productCategories: [
        { id: "vegetables", title: "Овощи", icon: "🥦" },
        { id: "fruits", title: "Фрукты", icon: "🍎" },
        { id: "berries", title: "Ягоды", icon: "🫐" },
        { id: "meat", title: "Мясо", icon: "🥩" },
        { id: "fish", title: "Рыба", icon: "🐟" },
        { id: "eggs", title: "Яйца", icon: "🥚" },
        { id: "grains", title: "Крупы", icon: "🌾" },
        { id: "legumes", title: "Бобовые", icon: "🫘" },
        { id: "dairy", title: "Молочные продукты", icon: "🥛" },
        { id: "nuts", title: "Орехи и семена", icon: "🥜" },
        { id: "oils", title: "Масла", icon: "🫒" },
        { id: "other", title: "Другое", icon: "🍽️" }
    ],
    textures: [
        { id: "smooth", title: "Гладкое пюре", level: 1 },
        { id: "thick_puree", title: "Густое пюре", level: 2 },
        { id: "mashed", title: "Размятая пища", level: 3 },
        { id: "soft_lumps", title: "Мягкие комочки", level: 4 },
        { id: "soft_pieces", title: "Мягкие кусочки", level: 5 },
        { id: "finger_food", title: "Finger food", level: 6 }
    ],
    ironRichCategories: ["meat", "fish", "eggs", "legumes"],
    amountOptions: [
        { id: "not_measured", title: "Не измеряла" },
        { id: "taste", title: "Попробовал" },
        { id: "little", title: "Немного" },
        { id: "medium", title: "Средняя порция" },
        { id: "portion", title: "Порция" },
        { id: "custom", title: "Своё количество" }
    ],
    planning: {
        defaultMealTypes: [
            { id: "breakfast", title: "Завтрак", icon: "🌅" },
            { id: "lunch", title: "Обед", icon: "☀️" },
            { id: "snack", title: "Полдник", icon: "🍎" },
            { id: "dinner", title: "Ужин", icon: "🌙" }
        ],
        allowReplace: true,
        allowMove: true,
        allowDelete: true,
        allowCustomMeal: true
    },
    productFilters: [
        { id: "all", title: "Все" },
        { id: "not_tried", title: "Не пробовали" },
        { id: "introduced", title: "Знакомы" },
        { id: "favorites", title: "❤️ Избранное" },
        { id: "allergens", title: "Аллергены" },
        { id: "iron", title: "Железо" },
        { id: "blw", title: "BLW" },
        { id: "puree", title: "Пюре" }
    ],
    homeBlocks: [
        { id: "baby_header", title: "Профиль малыша", enabled: true },
        { id: "next_step", title: "Следующий шаг", enabled: true },
        { id: "today_meals", title: "Сегодня", enabled: true },
        { id: "recommendation", title: "Персональная рекомендация", enabled: true },
        { id: "at_home", title: "Что есть дома", enabled: true },
        { id: "progress", title: "Прогресс", enabled: true }
    ],
    notifications: {
        enabledByDefault: false,
        types: ["planned_meal", "new_product", "reaction_observation", "water", "preparation", "shopping"]
    },
    safety: {
        showChokingWarnings: true,
        showPreparationWarnings: true,
        showAllergenWarnings: true,
        showUrgentReactionWarning: true,
        medicalDisclaimer: true
    },
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
    defaults: {
        approach: "mixed",
        notifications: false,
        homeBlocks: ["baby_header", "next_step", "today_meals", "recommendation", "at_home", "progress"],
        showAmount: false,
        showWater: true,
        showRecipes: true,
        showProgress: true,
        showRecommendations: true
    }
};

const CONFIG = APP_CONFIG;
window.APP_CONFIG = APP_CONFIG;
window.CONFIG = CONFIG;