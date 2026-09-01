/* ============================================================
   safety.js
   Безопасность прикорма
   ============================================================ */


/* ============================================================
   УРОВНИ РИСКА
   ============================================================ */

const SAFETY_LEVELS = {

    SAFE: {
        id: "safe",
        title: "Обычно подходит",
        icon: "✓",
        className: "safe"
    },

    ATTENTION: {
        id: "attention",
        title: "Нужна осторожность",
        icon: "!",
        className: "attention"
    },

    HIGH: {
        id: "high",
        title: "Повышенное внимание",
        icon: "⚠",
        className: "high"
    },

    DANGER: {
        id: "danger",
        title: "Опасно в такой форме",
        icon: "⚠",
        className: "danger"
    }
};


/* ============================================================
   ОБЩИЕ ПРИНЦИПЫ
   ============================================================ */

const SAFETY_RULES = {

    /* ----------------------------------------------------------
       УДУШЬЕ
       ---------------------------------------------------------- */

    choking: {

        title: "Риск удушья",

        description:
            "Некоторые продукты могут быть опасны из-за формы, размера, твёрдости или способа подачи.",

        alwaysShow: true
    },


    /* ----------------------------------------------------------
       АЛЛЕРГЕНЫ
       ---------------------------------------------------------- */

    allergens: {

        title: "Аллергены",

        description:
            "Аллергенные продукты вводятся с учётом индивидуальной ситуации ребёнка.",

        alwaysShow: true
    },


    /* ----------------------------------------------------------
       ПРИГОТОВЛЕНИЕ
       ---------------------------------------------------------- */

    preparation: {

        title: "Приготовление",

        description:
            "Для некоторых продуктов важны достаточная термическая обработка и безопасная форма подачи.",

        alwaysShow: true
    },


    /* ----------------------------------------------------------
       СОЛЬ И САХАР
       ---------------------------------------------------------- */

    saltSugar: {

        title: "Соль и сахар",

        description:
            "В приложении не нужно специально добавлять соль или сахар в блюда малыша."
    },


    /* ----------------------------------------------------------
       МЁД
       ---------------------------------------------------------- */

    honey: {

        title: "Мёд",

        warning:
            "Мёд не дают детям младше 12 месяцев из-за риска ботулизма."
    },


    /* ----------------------------------------------------------
       ЦЕЛЬНОЕ КОРОВЬЕ МОЛОКО
       ---------------------------------------------------------- */

    cowMilk: {

        title: "Коровье молоко",

        warning:
            "Коровье молоко как основной напиток не используется в рационе ребёнка первого года жизни."
    }
};


/* ============================================================
   БАЗОВЫЕ ПРОДУКТЫ С ОСОБЫМ РИСКОМ
   ============================================================ */

const HIGH_CHOKING_RISK = [

    "виноград",

    "черри",

    "помидор черри",

    "орехи",

    "арахис",

    "попкорн",

    "сосиска",

    "колбаса",

    "морковь сырая",

    "яблоко сырое",

    "леденец",

    "конфета",

    "мармелад",

    "семечки"
];


/* ============================================================
   ПРОДУКТЫ, КОТОРЫЕ НУЖНО ИЗМЕНЯТЬ ПО ФОРМЕ
   ============================================================ */

const FORM_DEPENDENT_PRODUCTS = {

    "виноград": {

        warning:
            "Целые виноградины представляют риск удушья.",

        safeForms: [
            "разрезан вдоль",
            "размят",
            "в составе подходящего блюда"
        ]
    },

    "помидор черри": {

        warning:
            "Целые маленькие круглые помидоры могут быть опасны.",

        safeForms: [
            "разрезан на подходящие части",
            "размят"
        ]
    },

    "черри": {

        warning:
            "Целые круглые помидоры могут быть опасны.",

        safeForms: [
            "разрезан",
            "размят"
        ]
    },

    "орехи": {

        warning:
            "Цельные орехи представляют риск удушья.",

        safeForms: [
            "гладкая ореховая паста",
            "мелко измельчённые"
        ]
    },

    "арахис": {

        warning:
            "Цельный арахис представляет риск удушья.",

        safeForms: [
            "гладкая арахисовая паста",
            "мелко измельчённый"
        ]
    },

    "яблоко": {

        warning:
            "Твёрдые сырые куски яблока могут быть опасны.",

        safeForms: [
            "мягко приготовленное",
            "тёртое/измельчённое",
            "пюре"
        ]
    },

    "морковь": {

        warning:
            "Твёрдая сырая морковь представляет риск удушья.",

        safeForms: [
            "хорошо приготовленная",
            "мягкая",
            "пюре"
        ]
    }
};


/* ============================================================
   АЛЛЕРГЕНЫ
   ============================================================ */

const COMMON_ALLERGENS = [

    "молоко",

    "яйцо",

    "арахис",

    "орехи",

    "пшеница",

    "глютен",

    "соя",

    "рыба",

    "кунжут",

    "креветка",

    "ракообразные"
];


/* ============================================================
   ПОИСК АЛЛЕРГЕНА
   ============================================================ */

function getProductAllergens(product) {

    if (!product) {
        return [];
    }

    const allergens = [];


    /* Данные самой базы */

    if (product.allergen === true) {

        if (
            Array.isArray(product.allergens) &&
            product.allergens.length
        ) {

            allergens.push(
                ...product.allergens
            );

        } else {

            allergens.push(
                product.name
            );
        }
    }


    /* Проверяем название */

    const name =
        String(product.name || "")
            .toLowerCase();

    COMMON_ALLERGENS.forEach(
        allergen => {

            if (
                name.includes(allergen) &&
                !allergens.includes(allergen)
            ) {

                allergens.push(
                    allergen
                );
            }
        }
    );


    return [
        ...new Set(allergens)
    ];
}


/* ============================================================
   ПРОВЕРКА НА АЛЛЕРГЕН
   ============================================================ */

function isAllergenProduct(product) {

    return getProductAllergens(product)
        .length > 0;
}


/* ============================================================
   ПРОВЕРКА РИСКА УДУШЬЯ
   ============================================================ */

function getChokingRisk(product) {

    if (!product) {

        return {

            level: SAFETY_LEVELS.SAFE,

            warning: "",

            safeForms: []
        };
    }


    if (product.choking === true) {

        return {

            level:
                SAFETY_LEVELS.HIGH,

            warning:
                "У продукта есть особенности безопасной подачи.",

            safeForms:
                []
        };
    }


    const name =
        String(product.name || "")
            .toLowerCase();


    for (
        const key of Object.keys(
            FORM_DEPENDENT_PRODUCTS
        )
    ) {

        if (name.includes(key)) {

            const data =
                FORM_DEPENDENT_PRODUCTS[key];

            return {

                level:
                    SAFETY_LEVELS.HIGH,

                warning:
                    data.warning,

                safeForms:
                    data.safeForms
            };
        }
    }


    if (
        HIGH_CHOKING_RISK.some(
            item =>
                name.includes(item)
        )
    ) {

        return {

            level:
                SAFETY_LEVELS.HIGH,

            warning:
                "Этот продукт требует особого внимания к форме и текстуре.",

            safeForms:
                []
        };
    }


    return {

        level:
            SAFETY_LEVELS.SAFE,

        warning: "",

        safeForms: []
    };
}


/* ============================================================
   ПРОВЕРКА ФОРМЫ ПОДАЧИ
   ============================================================ */

function checkServingSafety(
    product,
    servingForm,
    preparation
) {

    const choking =
        getChokingRisk(product);

    const warnings = [];


    if (
        choking.level.id !==
        SAFETY_LEVELS.SAFE.id
    ) {

        warnings.push(
            choking.warning
        );
    }


    if (
        product &&
        product.allergen === true
    ) {

        warnings.push(
            "Это потенциальный аллерген. Наблюдайте за ребёнком после употребления."
        );
    }


    if (
        preparation === "raw" &&
        product &&
        product.choking === true
    ) {

        warnings.push(
            "Для этого продукта сырая форма может быть неподходящей."
        );
    }


    return {

        safe:
            warnings.length === 0,

        warnings:

            [
                ...new Set(
                    warnings.filter(Boolean)
                )
            ],

        choking,

        servingForm:

            servingForm || null,

        preparation:

            preparation || null
    };
}


/* ============================================================
   ПОЛНАЯ ПРОВЕРКА ПРОДУКТА
   ============================================================ */

function analyzeProductSafety(
    product,
    options = {}
) {

    if (!product) {

        return {

            level:
                SAFETY_LEVELS.SAFE,

            warnings: [],

            allergens: [],

            choking: null
        };
    }


    const allergens =
        getProductAllergens(product);


    const choking =
        getChokingRisk(product);


    const serving =
        checkServingSafety(

            product,

            options.servingForm,

            options.preparation
        );


    const warnings =
        [
            ...serving.warnings
        ];


    /* Мёд */

    const productName =
        String(product.name || "")
            .toLowerCase();


    if (
        productName.includes("мёд") ||
        productName.includes("мед")
    ) {

        warnings.push(
            SAFETY_RULES.honey.warning
        );
    }


    /* Коровье молоко */

    if (
        productName.includes(
            "коровье молоко"
        )
    ) {

        warnings.push(
            SAFETY_RULES.cowMilk.warning
        );
    }


    let level =
        SAFETY_LEVELS.SAFE;


    if (
        choking.level ===
        SAFETY_LEVELS.HIGH
    ) {

        level =
            SAFETY_LEVELS.HIGH;
    }


    if (
        allergens.length > 0 &&
        level === SAFETY_LEVELS.SAFE
    ) {

        level =
            SAFETY_LEVELS.ATTENTION;
    }


    return {

        level,

        warnings:
            [
                ...new Set(
                    warnings.filter(Boolean)
                )
            ],

        allergens,

        choking,

        safeForms:
            choking.safeForms || [],

        preparation:
            product.preparation || []
    };
}


/* ============================================================
   ПРЕДУПРЕЖДЕНИЕ ПЕРЕД ДОБАВЛЕНИЕМ
   ============================================================ */

function getProductWarning(
    product,
    options = {}
) {

    const result =
        analyzeProductSafety(
            product,
            options
        );


    if (
        result.warnings.length === 0 &&
        result.allergens.length === 0
    ) {

        return null;
    }


    return {

        title:
            result.level.title,

        icon:
            result.level.icon,

        level:
            result.level.id,

        warnings:
            result.warnings,

        allergens:
            result.allergens,

        safeForms:
            result.safeForms
    };
}


/* ============================================================
   СРОЧНЫЕ СИМПТОМЫ
   ============================================================ */

const URGENT_REACTION_SYMPTOMS = [

    "затрудненное дыхание",

    "затруднённое дыхание",

    "отёк языка",

    "отек языка",

    "отёк горла",

    "отек горла",

    "сильная слабость",

    "потеря сознания",

    "повторная рвота"
];


/* ============================================================
   ПРОВЕРКА РЕАКЦИИ
   ============================================================ */

function analyzeReaction(reaction = {}) {

    const symptoms = [

        ...(reaction.symptoms || []),

        reaction.description || ""
    ]
        .join(" ")
        .toLowerCase();


    const urgent =
        URGENT_REACTION_SYMPTOMS
            .some(
                symptom =>
                    symptoms.includes(
                        symptom
                    )
            );


    return {

        urgent,

        message:

            urgent

                ? "При выраженной или быстро развивающейся реакции необходима срочная медицинская помощь."

                : "Наблюдайте за ребёнком и при сомнениях обсудите реакцию с врачом."
    };
}


/* ============================================================
   ФОРМАТ ДЛЯ UI
   ============================================================ */

function getSafetyBadge(
    product,
    options = {}
) {

    const result =
        analyzeProductSafety(
            product,
            options
        );


    return {

        text:
            result.level.title,

        icon:
            result.level.icon,

        level:
            result.level.id,

        className:
            result.level.className
    };
}


/* ============================================================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
   ============================================================ */

window.SAFETY_LEVELS =
    SAFETY_LEVELS;

window.SAFETY_RULES =
    SAFETY_RULES;

window.getProductAllergens =
    getProductAllergens;

window.isAllergenProduct =
    isAllergenProduct;

window.getChokingRisk =
    getChokingRisk;

window.checkServingSafety =
    checkServingSafety;

window.analyzeProductSafety =
    analyzeProductSafety;

window.getProductWarning =
    getProductWarning;

window.analyzeReaction =
    analyzeReaction;

window.getSafetyBadge =
    getSafetyBadge;