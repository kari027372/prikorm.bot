// utils.js — ВСЕ вспомогательные функции

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
    const feeding = profile.feeding_type || 'ГВ';
    const minAge = getMinAge(feeding);
    return products.filter(p => p.min_age <= age && p.min_age >= minAge);
}

function getAvailableProducts(profile, products) {
    const introduced = profile.introduced_foods || [];
    const excluded = profile.excluded_foods || [];
    const allergies = profile.allergies || [];
    const age = profile.age_months || 0;
    const feeding = profile.feeding_type || 'ГВ';
    const minAge = getMinAge(feeding);
    return products.filter(p =>
        p.min_age <= age &&
        p.min_age >= minAge &&
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

    // 1. Приоритет: источники железа
    const iron = available.filter(p => p.iron);
    if (iron.length > 0) {
        // Сортируем по возрасту введения
        iron.sort((a, b) => a.min_age - b.min_age);
        return iron[0];
    }

    // 2. Аллергены (если возраст >= 6 мес.)
    if (profile.age_months >= 6) {
        const allergens = available.filter(p => p.allergen);
        if (allergens.length > 0) {
            allergens.sort((a, b) => a.min_age - b.min_age);
            return allergens[0];
        }
    }

    // 3. Остальные, с учётом категорий (ротация)
    const rest = available.filter(p => !p.iron && !p.allergen);
    if (rest.length > 0) {
        // Группируем по категориям, чтобы не повторять одно и то же
        const introduced = profile.introduced_foods || [];
        const categories = [...new Set(rest.map(p => p.cat))];
        // Сначала выбираем категории, которых мало в рационе
        const categoryCount = {};
        introduced.forEach(name => {
            const product = products.find(p => p.name === name);
            if (product) {
                categoryCount[product.cat] = (categoryCount[product.cat] || 0) + 1;
            }
        });
        // Находим категорию с наименьшим количеством
        let minCount = Infinity;
        let selectedCategory = categories[0];
        for (const cat of categories) {
            const count = categoryCount[cat] || 0;
            if (count < minCount) {
                minCount = count;
                selectedCategory = cat;
            }
        }
        const candidates = rest.filter(p => p.cat === selectedCategory);
        candidates.sort((a, b) => a.min_age - b.min_age);
        return candidates[0];
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

    // Если нет введённых продуктов или все продукты введены
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

    // Берём уже введённые продукты для основы
    const knownProducts = introduced.map(name => products.find(p => p.name === name)).filter(Boolean);
    // И новые продукты для введения
    const newProducts = available.slice(0, Math.min(meals, available.length));

    // Распределяем по приёмам пищи (не более 1 нового продукта в день)
    const times = ['🌅 Завтрак', '☀️ Обед', '🌙 Ужин', '🍼 Перекус'];
    let newIndex = 0;

    for (let i = 0; i < meals && i < times.length; i++) {
        const meal = { time: times[i], foods: [], description: '', isNew: false };

        // Добавляем 1–2 знакомых продукта
        const known = knownProducts.filter(p => p);
        if (known.length > 0) {
            const idx = i % known.length;
            meal.foods.push(known[idx].name);
            meal.description = known[idx].texture[age >= 10 ? 10 : age >= 8 ? 8 : 6] || 'пюре';
        }

        // Добавляем 1 новый продукт (если есть)
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
