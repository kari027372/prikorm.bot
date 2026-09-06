/* ============================================================
   safety.js
   Безопасность прикорма (синхронизирован с актуальными данными продуктов)
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

    choking: {
        title: "Риск удушья",
        description: "Некоторые продукты могут быть опасны из-за формы, размера, твёрдости или способа подачи.",
        alwaysShow: true
    },

    allergens: {
        title: "Аллергены",
        description: "Аллергенные продукты вводятся с учётом индивидуальной ситуации ребёнка.",
        alwaysShow: true
    },

    preparation: {
        title: "Приготовление",
        description: "Для некоторых продуктов важны достаточная термическая обработка и безопасная форма подачи.",
        alwaysShow: true
    },

    saltSugar: {
        title: "Соль и сахар",
        description: "В приложении не нужно специально добавлять соль или сахар в блюда малыша."
    },

    honey: {
        title: "Мёд",
        warning: "Мёд не дают детям младше 12 месяцев из-за риска ботулизма."
    },

    cowMilk: {
        title: "Коровье молоко",
        warning: "Коровье молоко как основной напиток не используется в рационе ребёнка первого года жизни."
    }
};

/* ============================================================
   БАЗОВЫЕ ПРОДУКТЫ С ОСОБЫМ РИСКОМ (расширенный список)
   ============================================================ */

const HIGH_CHOKING_RISK = [
    "виноград", "черри", "помидор черри", "орехи", "арахис",
    "попкорн", "сосиска", "колбаса", "морковь сырая", "яблоко сырое",
    "леденец", "конфета", "мармелад", "семечки",
    "цельные орехи", "цельный виноград", "вишня", "цельные бобы",
    "твёрдое сырое яблоко"
];

/* ============================================================
   ПРОДУКТЫ, КОТОРЫЕ НУЖНО ИЗМЕНЯТЬ ПО ФОРМЕ
   ============================================================ */

const FORM_DEPENDENT_PRODUCTS = {
    "виноград": {
        warning: "Целые виноградины представляют риск удушья.",
        safeForms: ["разрезан вдоль", "размят", "в составе подходящего блюда"],
        unsafeForms: ["целый"]
    },
    "помидор черри": {
        warning: "Целые маленькие круглые помидоры могут быть опасны.",
        safeForms: ["разрезан на подходящие части", "размят"]
    },
    "черри": {
        warning: "Целые круглые помидоры могут быть опасны.",
        safeForms: ["разрезан", "размят"],
        unsafeForms: ["целый", "с косточкой"]
    },
    "орехи": {
        warning: "Цельные орехи представляют риск удушья.",
        safeForms: ["гладкая ореховая паста", "мелко измельчённые"],
        unsafeForms: ["цельный", "крупный кусок"]
    },
    "арахис": {
        warning: "Цельный арахис представляет риск удушья.",
        safeForms: ["гладкая арахисовая паста", "мелко измельчённый"],
        unsafeForms: ["цельный"]
    },
    "яблоко": {
        warning: "Твёрдые сырые куски яблока могут быть опасны.",
        safeForms: ["мягко приготовленное", "тёртое/измельчённое", "пюре"],
        unsafeForms: ["сырое твёрдое яблоко"]
    },
    "морковь": {
        warning: "Твёрдая сырая морковь представляет риск удушья.",
        safeForms: ["хорошо приготовленная", "мягкая", "пюре"],
        unsafeForms: ["сырая морковь кружками"]
    },
    "вишня": {
        warning: "Целая вишня с косточкой представляет риск удушья.",
        safeForms: ["без косточки, разрезанная на 4 части"],
        unsafeForms: ["целая", "с косточкой"]
    },
    "цельные бобы": {
        warning: "Цельные бобы могут быть опасны из-за размера.",
        safeForms: ["размятые", "пюре"],
        unsafeForms: ["цельные"]
    }
};

/* ============================================================
   АЛЛЕРГЕНЫ
   ============================================================ */

const COMMON_ALLERGENS = [
    "молоко", "яйцо", "арахис", "орехи", "пшеница",
    "глютен", "соя", "рыба", "кунжут", "креветка", "ракообразные"
];

/* ============================================================
   ПОИСК АЛЛЕРГЕНА
   ============================================================ */

function getProductAllergens(product) {
    if (!product) return [];
    const allergens = [];

    // Данные самой базы
    if (product.allergen === true) {
        if (Array.isArray(product.allergens) && product.allergens.length) {
            allergens.push(...product.allergens);
        } else {
            // Используем allergenType, если есть
            if (Array.isArray(product.allergenType) && product.allergenType.length) {
                allergens.push(...product.allergenType);
            } else {
                allergens.push(product.name);
            }
        }
    } else {
        // Если allergen=false, но allergenType заполнен – всё равно считаем аллергеном
        if (Array.isArray(product.allergenType) && product.allergenType.length) {
            allergens.push(...product.allergenType);
        }
    }

    // Проверяем по названию
    const name = String(product.name || "").toLowerCase();
    COMMON_ALLERGENS.forEach(allergen => {
        if (name.includes(allergen) && !allergens.includes(allergen)) {
            allergens.push(allergen);
        }
    });

    return [...new Set(allergens)];
}

/* ============================================================
   ПРОВЕРКА НА АЛЛЕРГЕН
   ============================================================ */

function isAllergenProduct(product) {
    return getProductAllergens(product).length > 0;
}

/* ============================================================
   ПРОВЕРКА РИСКА УДУШЬЯ (УЛУЧШЕННАЯ)
   ============================================================ */

function getChokingRisk(product) {
    if (!product) {
        return {
            level: SAFETY_LEVELS.SAFE,
            warning: "",
            safeForms: [],
            unsafeForms: []
        };
    }

    let riskLevel = null;
    let warning = "";
    let safeForms = [];
    let unsafeForms = [];

    // 1. Проверяем product.rules.safety.chokingRisk
    if (product.rules?.safety?.chokingRisk) {
        const val = product.rules.safety.chokingRisk;
        if (val === 'high') riskLevel = 'high';
        else if (val === 'medium') riskLevel = 'medium';
        else if (val === 'low') riskLevel = 'low';
    }

    // 2. product.chokingRisk
    if (!riskLevel && product.chokingRisk) {
        if (product.chokingRisk === 'high') riskLevel = 'high';
        else if (product.chokingRisk === 'medium') riskLevel = 'medium';
        else if (product.chokingRisk === 'low') riskLevel = 'low';
    }

    // 3. Старое поле product.choking (boolean)
    if (!riskLevel && product.choking === true) {
        riskLevel = 'high';
    }

    // 4. Поиск в FORM_DEPENDENT_PRODUCTS
    const name = String(product.name || "").toLowerCase();
    if (!riskLevel) {
        for (const key of Object.keys(FORM_DEPENDENT_PRODUCTS)) {
            if (name.includes(key)) {
                const data = FORM_DEPENDENT_PRODUCTS[key];
                riskLevel = 'high';
                warning = data.warning || "";
                safeForms = data.safeForms || [];
                unsafeForms = data.unsafeForms || [];
                break;
            }
        }
    }

    // 5. Поиск в HIGH_CHOKING_RISK (если ещё не определён)
    if (!riskLevel) {
        if (HIGH_CHOKING_RISK.some(item => name.includes(item))) {
            riskLevel = 'high';
            warning = "Этот продукт требует особого внимания к форме и текстуре.";
        }
    }

    // Если риск не определён, считаем low
    if (!riskLevel) {
        riskLevel = 'low';
    }

    // Если у продукта есть свои safeForms/unsafeForms, они имеют приоритет над найденными из FORM_DEPENDENT_PRODUCTS
    if (Array.isArray(product.safeForms) && product.safeForms.length) {
        safeForms = product.safeForms.slice();
    }
    if (Array.isArray(product.unsafeForms) && product.unsafeForms.length) {
        unsafeForms = product.unsafeForms.slice();
    }

    // Определяем уровень
    let level = SAFETY_LEVELS.SAFE;
    if (riskLevel === 'high') level = SAFETY_LEVELS.HIGH;
    else if (riskLevel === 'medium') level = SAFETY_LEVELS.ATTENTION;

    return {
        level: level,
        warning: warning,
        safeForms: safeForms,
        unsafeForms: unsafeForms
    };
}

/* ============================================================
   ПРОВЕРКА ФОРМЫ ПОДАЧИ (УЛУЧШЕННАЯ)
   ============================================================ */

function checkServingSafety(product, servingForm, preparation) {
    const choking = getChokingRisk(product);
    const warnings = [];

    // Проверяем, есть ли unsafeForms
    if (choking.unsafeForms && choking.unsafeForms.length && servingForm) {
        const formLower = servingForm.toLowerCase();
        const isUnsafe = choking.unsafeForms.some(f => formLower.includes(f.toLowerCase()));
        if (isUnsafe) {
            warnings.push("Эта форма продукта небезопасна (риск удушья).");
        }
    }

    // Если есть safeForms и форма не указана, но не в unsafe – не предупреждаем, если форма неизвестна, но не запрещена
    if (choking.level === SAFETY_LEVELS.HIGH && warnings.length === 0 && servingForm) {
        if (choking.safeForms && choking.safeForms.length) {
            const isSafe = choking.safeForms.some(f => servingForm.toLowerCase().includes(f.toLowerCase()));
            if (!isSafe) {
                warnings.push("Рекомендуется использовать безопасную форму подачи.");
            }
        } else {
            // Если safeForms не указаны, но риск высокий – даём общее предупреждение
            warnings.push("Продукт требует правильной подготовки для безопасного употребления.");
        }
    }

    // Аллерген – информационное предупреждение
    if (product && isAllergenProduct(product)) {
        warnings.push("Это потенциальный аллерген. Наблюдайте за ребёнком после употребления.");
    }

    // Сырая форма
    if (preparation === "raw" && product && product.choking === true) {
        warnings.push("Для этого продукта сырая форма может быть неподходящей.");
    }

    return {
        safe: warnings.length === 0,
        warnings: [...new Set(warnings.filter(Boolean))],
        choking: choking,
        servingForm: servingForm || null,
        preparation: preparation || null
    };
}

/* ============================================================
   ПОЛНАЯ ПРОВЕРКА ПРОДУКТА
   ============================================================ */

function analyzeProductSafety(product, options = {}) {
    if (!product) {
        return {
            level: SAFETY_LEVELS.SAFE,
            warnings: [],
            allergens: [],
            choking: null,
            safeForms: [],
            preparation: []
        };
    }

    const allergens = getProductAllergens(product);
    const choking = getChokingRisk(product);
    const serving = checkServingSafety(product, options.servingForm, options.preparation);

    const warnings = [...serving.warnings];

    // Мёд
    const productName = String(product.name || "").toLowerCase();
    if (productName.includes("мёд") || productName.includes("мед")) {
        warnings.push(SAFETY_RULES.honey.warning);
    }

    // Коровье молоко
    if (productName.includes("коровье молоко")) {
        warnings.push(SAFETY_RULES.cowMilk.warning);
    }

    let level = SAFETY_LEVELS.SAFE;
    if (choking.level === SAFETY_LEVELS.HIGH) {
        level = SAFETY_LEVELS.HIGH;
    } else if (allergens.length > 0 && level === SAFETY_LEVELS.SAFE) {
        level = SAFETY_LEVELS.ATTENTION;
    }

    return {
        level: level,
        warnings: [...new Set(warnings.filter(Boolean))],
        allergens: allergens,
        choking: choking,
        safeForms: choking.safeForms || [],
        preparation: product.preparation || []
    };
}

/* ============================================================
   ПРЕДУПРЕЖДЕНИЕ ПЕРЕД ДОБАВЛЕНИЕМ
   ============================================================ */

function getProductWarning(product, options = {}) {
    const result = analyzeProductSafety(product, options);
    if (result.warnings.length === 0 && result.allergens.length === 0) {
        return null;
    }
    return {
        title: result.level.title,
        icon: result.level.icon,
        level: result.level.id,
        warnings: result.warnings,
        allergens: result.allergens,
        safeForms: result.safeForms
    };
}

/* ============================================================
   СРОЧНЫЕ СИМПТОМЫ
   ============================================================ */

const URGENT_REACTION_SYMPTOMS = [
    "затрудненное дыхание", "затруднённое дыхание",
    "отёк языка", "отек языка", "отёк горла", "отек горла",
    "сильная слабость", "потеря сознания", "повторная рвота"
];

function analyzeReaction(reaction = {}) {
    const symptoms = [...(reaction.symptoms || []), reaction.description || ""]
        .join(" ")
        .toLowerCase();

    const urgent = URGENT_REACTION_SYMPTOMS.some(symptom => symptoms.includes(symptom));

    return {
        urgent: urgent,
        message: urgent
            ? "При выраженной или быстро развивающейся реакции необходима срочная медицинская помощь."
            : "Наблюдайте за ребёнком и при сомнениях обсудите реакцию с врачом."
    };
}

/* ============================================================
   ФОРМАТ ДЛЯ UI
   ============================================================ */

function getSafetyBadge(product, options = {}) {
    const result = analyzeProductSafety(product, options);
    return {
        text: result.level.title,
        icon: result.level.icon,
        level: result.level.id,
        className: result.level.className
    };
}

/* ============================================================
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
   ============================================================ */

window.SAFETY_LEVELS = SAFETY_LEVELS;
window.SAFETY_RULES = SAFETY_RULES;
window.getProductAllergens = getProductAllergens;
window.isAllergenProduct = isAllergenProduct;
window.getChokingRisk = getChokingRisk;
window.checkServingSafety = checkServingSafety;
window.analyzeProductSafety = analyzeProductSafety;
window.getProductWarning = getProductWarning;
window.analyzeReaction = analyzeReaction;
window.getSafetyBadge = getSafetyBadge;