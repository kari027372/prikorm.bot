// utils.js — все вспомогательные функции (исправленная версия)

// ================================================================
// 1. ВОЗРАСТ
// ================================================================

function calcAge(birthDate) {
    if (!birthDate) return { months: 0, days: 0 };
    const parts = birthDate.split('.');
    if (parts.length !== 3) return { months: 0, days: 0 };
    const birth = new Date(parts[2], parts[1] - 1, parts[0]);
    const now = new Date();
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) months = 0;
    return { months, days };
}

function getAgeGroup(months) {
    for (const group of CONFIG.ageGroups) {
        if (months >= group.min && months <= group.max) {
            return group.label;
        }
    }
    return '12+ мес.';
}

// ================================================================
// 2. ПРИКОРМ
// ================================================================

function getMinAge(feedingType) {
    return CONFIG.minAgeByFeeding[feedingType] || 6;
}

function getStage(days) {
    const stages = CONFIG.stages;
    let result = 'подготовка';
    for (const [key, val] of Object.entries(stages)) {
        if (days >= val.days) {
            result = key;
        }
    }
    return result;
}

function getPrikormDays(profile) {
    if (!profile.prikorm_start_date) return 0;
    try {
        const start = new Date(profile.prikorm_start_date.split('.').reverse().join('-'));
        return Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
    } catch {
        return 0;
    }
}

// ================================================================
// 3. ПРОДУКТЫ
// ================================================================

function filterProductsByAge(profile, products) {
    const age = profile.age_months || 0;
    return products.filter(p => p.min_age <= age && p.min_age >= 4);
}

function getAvailableProducts(profile, products) {
    const introduced = profile.introduced_foods || [];
    const excluded = profile.excluded_foods || [];
    const allergies = profile.allergies || [];
    const age = profile.age_months || 0;
    // Исправлено: убираем ограничение по минимальному возрасту начала прикорма
    return products.filter(p =>
        p.min_age <= age &&
        p.min_age >= 4 && // исключаем запрещённые (min_age=999)
        !introduced.includes(p.name) &&
        !excluded.includes(p.name) &&
        !allergies.includes(p.name)
    );
}

function getProductsByCategory(products, category) {
    return products.filter(p => p.cat === category);
}

function getProductStatus(profile, productName) {
    const introduced = profile.introduced_foods || [];
    const excluded = profile.excluded_foods || [];
    const allergies = profile.allergies || [];
    const loved = profile.loved_foods || [];
    const disliked = profile.disliked_foods || [];

    if (excluded.includes(productName)) return 'excluded';
    if (allergies.includes(productName)) return 'allergy';
    if (introduced.includes(productName)) {
        if (loved.includes(productName)) return 'loved';
        if (disliked.includes(productName)) return 'disliked';
        return 'introduced';
    }
    return 'new';
}

// ================================================================
// 4. РЕКОМЕНДАЦИИ
// ================================================================

function getNextProduct(profile, products) {
    const available = getAvailableProducts(profile, products);
    if (available.length === 0) return null;

    // 1. Железо
    const iron = available.filter(p => p.iron);
    if (iron.length > 0) {
        iron.sort((a, b) => a.min_age - b.min_age);
        return iron[0];
    }

    // 2. Аллергены (если >=6 мес.)
    if (profile.age_months >= 6) {
        const allergens = available.filter(p => p.allergen);
        if (allergens.length > 0) {
            allergens.sort((a, b) => a.min_age - b.min_age);
            return allergens[0];
        }
    }

    // 3. Ротация по категориям (упрощённо: возвращаем первый)
    const rest = available.filter(p => !p.iron && !p.allergen);
    if (rest.length > 0) {
        rest.sort((a, b) => a.min_age - b.min_age);
        return rest[0];
    }

    return null;
}

// ================================================================
// 5. ПЛАН НА ДЕНЬ
// ================================================================

function generateDailyPlan(profile, products) {
    const age = profile.age_months || 0;
    const days = getPrikormDays(profile);
    const stage = getStage(days);
    const meals = CONFIG.stages[stage]?.meals || 1;
    const introduced = profile.introduced_foods || [];
    const available = getAvailableProducts(profile, products);
    const result = [];

    if (introduced.length === 0 || available.length === 0) {
        const next = getNextProduct(profile, products);
        if (next) {
            result.push({
                time: '🥄 Прикорм',
                foods: [next.name],
                description: next.texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || 'пюре',
                isNew: true
            });
        }
        return result;
    }

    const knownProducts = introduced.map(name => products.find(p => p.name === name)).filter(Boolean);
    const newProducts = available.slice(0, Math.min(meals, available.length));
    const times = ['🌅 Завтрак', '☀️ Обед', '🌙 Ужин', '🍼 Перекус'];
    let newIndex = 0;

    for (let i = 0; i < meals && i < times.length; i++) {
        const meal = { time: times[i], foods: [], description: '', isNew: false };
        const known = knownProducts.filter(p => p);
        if (known.length > 0) {
            const idx = i % known.length;
            meal.foods.push(known[idx].name);
            meal.description = known[idx].texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || 'пюре';
        }
        if (newIndex < newProducts.length) {
            const np = newProducts[newIndex];
            meal.foods.push('🆕 ' + np.name);
            meal.description = np.texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || 'пюре';
            meal.isNew = true;
            newIndex++;
        }
        if (meal.foods.length > 0) {
            result.push(meal);
        }
    }
    return result;
}

// ================================================================
// 6. ТЕКСТУРА
// ================================================================

function getTextureStage(ageMonths, prikormDays) {
    if (prikormDays < 14) return 'жидкое пюре';
    if (prikormDays < 30) return 'густое пюре';
    if (ageMonths >= 8 && prikormDays > 30) return 'размятое';
    if (ageMonths >= 10) return 'кусочки';
    return 'размятое';
}

function getTextureRecommendation(ageMonths, prikormDays, product) {
    const stage = getTextureStage(ageMonths, prikormDays);
    const textureMap = {
        'жидкое пюре': 'Однородное жидкое пюре (1–2 ч.л.)',
        'густое пюре': 'Густое пюре (3–4 ч.л.)',
        'размятое': 'Размятое вилкой, с небольшими мягкими комочками',
        'кусочки': 'Мягкие кусочки размером с ноготь взрослого'
    };
    return textureMap[stage] || 'Пюре';
}

// ================================================================
// 7. БЕЗОПАСНОСТЬ
// ================================================================

function getSafetyWarning(productName) {
    const rule = SAFETY_RULES[productName];
    if (!rule) return null;
    return rule.warning;
}

function isForbidden(productName) {
    return FORBIDDEN_UNDER_1.includes(productName.toLowerCase());
}

function getSafeForms(productName) {
    const rule = SAFETY_RULES[productName];
    if (!rule) return null;
    return rule.safe_forms || [];
}

// ================================================================
// 8. СТАТИСТИКА
// ================================================================

function getStats(profile) {
    const introduced = profile.introduced_foods || [];
    const history = profile.food_history || [];
    const allergies = profile.allergies || [];
    const excluded = profile.excluded_foods || [];

    const categories = {};
    introduced.forEach(name => {
        const product = PRODUCTS.find(p => p.name === name);
        if (product) {
            categories[product.cat] = (categories[product.cat] || 0) + 1;
        }
    });

    const ironCount = introduced.filter(name => {
        const p = PRODUCTS.find(p => p.name === name);
        return p && p.iron;
    }).length;

    const allergenCount = introduced.filter(name => {
        const p = PRODUCTS.find(p => p.name === name);
        return p && p.allergen;
    }).length;

    return {
        total: introduced.length,
        categories: categories,
        ironCount: ironCount,
        allergenCount: allergenCount,
        allergyCount: allergies.length,
        excludedCount: excluded.length,
        historyCount: history.length
    };
}

// ================================================================
// 9. МИГРАЦИЯ ДАННЫХ
// ================================================================

function migrateData() {
    const oldKey = 'prikorm_app_v2';
    const newKey = 'prikorm_app_v3';
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);
    if (oldData && !newData) {
        try {
            const parsed = JSON.parse(oldData);
            if (!parsed.loved_foods) parsed.loved_foods = [];
            if (!parsed.disliked_foods) parsed.disliked_foods = [];
            if (!parsed.readiness_score) parsed.readiness_score = 0;
            if (!parsed.readiness_passed) parsed.readiness_passed = false;
            if (!parsed.water_log) parsed.water_log = [];
            if (!parsed.notes) parsed.notes = [];
            localStorage.setItem(newKey, JSON.stringify(parsed));
            console.log('✅ Данные перенесены из старой версии');
        } catch (e) {
            console.log('❌ Ошибка миграции:', e);
        }
    }
}

// ================================================================
// 10. АКТИВНЫЙ ПРОДУКТ
// ================================================================

function activeProductStatus(profile) {
    const product = profile.active_product;
    if (!product) return null;
    const start = profile.observation_start ? new Date(profile.observation_start.split('.').reverse().join('-')) : null;
    const days = profile.observation_days || 2;
    if (!start) return null;
    const passed = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
    const left = Math.max(0, days - passed);
    const finished = left <= 0;
    return {
        product: product,
        passed: passed,
        left: left,
        finished: finished
    };
}