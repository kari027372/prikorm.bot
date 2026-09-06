// services/recipe-service.js – Stage 8
(function() {
  'use strict';

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================

  /**
   * Находит продукт по названию (регистронезависимо)
   * Возвращает объект продукта или null
   */
  function findProductByName(name) {
    if (!name) return null;
    const products = window.PRODUCTS || [];
    const normalized = name.trim().toLowerCase();
    for (const p of products) {
      if (p.name && p.name.trim().toLowerCase() === normalized) {
        return p;
      }
    }
    return null;
  }

  /**
   * Определяет агрегированный статус рецепта на основе статусов продуктов
   * Возвращает: 'safe', 'caution', 'block'
   */
  function aggregateStatus(productStatuses) {
    let hasBlock = false;
    let hasCaution = false;
    for (const s of productStatuses) {
      if (s === 'block' || s === 'not_appropriate') hasBlock = true;
      if (s === 'caution' || s === 'review') hasCaution = true;
    }
    if (hasBlock) return 'block';
    if (hasCaution) return 'caution';
    return 'safe';
  }

  /**
   * Собирает уникальные группы и нутриенты из массива продуктов
   */
  function collectNutritionFromProducts(products) {
    const groups = new Set();
    const nutrients = new Set();
    for (const product of products) {
      const gs = window.products.getProductGroups(product) || [];
      for (const g of gs) {
        if (!['allergens', 'other'].includes(g)) {
          groups.add(g);
        }
      }
      const sources = getNutrientSources(product);
      for (const n of sources) {
        nutrients.add(n);
      }
    }
    return {
      groupCount: groups.size,
      nutrientCount: nutrients.size,
      groups: Array.from(groups),
      nutrients: Array.from(nutrients)
    };
  }

  /**
   * Извлекает нутриенты из продукта (аналог getNutrientSources из nutrition-engine)
   */
  function getNutrientSources(product) {
    const sources = [];
    const SUPPORTED_NUTRIENTS = ['iron', 'protein', 'calcium', 'vitamin_c', 'omega3', 'fiber', 'zinc'];
    if (Array.isArray(product.nutrients)) {
      for (const nutrient of product.nutrients) {
        if (SUPPORTED_NUTRIENTS.includes(nutrient)) {
          sources.push(nutrient);
        }
      }
    }
    if (product.iron === true && !sources.includes('iron')) {
      sources.push('iron');
    }
    return sources;
  }

  // ============================================================
  // ОСНОВНАЯ ФУНКЦИЯ – ОЦЕНКА ОДНОГО РЕЦЕПТА
  // ============================================================

  /**
   * Оценивает один рецепт для конкретного ребёнка
   * @param {string} childId - ID ребёнка (если не указан, используется активный)
   * @param {object} recipe - объект рецепта из RECIPES
   * @returns {object} Оценка рецепта
   */
  function evaluateRecipeInternal(childId, recipe) {
    // Получить профиль
    let profile = null;
    if (childId) {
      profile = window.childService.getChildProfile(childId);
    } else {
      // если не передан, берём активного
      const active = window.getCurrentChild ? window.getCurrentChild() : null;
      if (active) {
        profile = window.childService.getChildProfile(active.id);
      }
    }
    if (!profile) {
      return {
        recipe: recipe,
        productIds: [],
        safety: 'block',
        warnings: ['Не удалось получить профиль ребёнка'],
        nutrition: { groupCount: 0, nutrientCount: 0, groups: [], nutrients: [] },
        allIntroduced: false,
        invalid: true
      };
    }

    const childIdActual = profile.identity.id;

    // Получить Product State (для проверки introduced)
    const productState = window.productStateService.getProductState(childIdActual, 'dummy') || {};

    // Получить список продуктов из рецепта (названия)
    const productNames = recipe.products || [];
    const productIds = [];
    const productObjects = [];
    const safetyResults = [];
    const warnings = [];

    // Проходим по каждому продукту
    for (const name of productNames) {
      const product = findProductByName(name);
      if (!product) {
        warnings.push(`Продукт "${name}" не найден в каталоге`);
        continue;
      }
      productObjects.push(product);
      productIds.push(product.id);

      // Вызвать Safety Engine
      const safetyResult = window.safetyEngine.evaluateProductSafety(profile, product, null);
      safetyResults.push({
        productId: product.id,
        productName: product.name,
        status: safetyResult.status,
        reasons: safetyResult.reasons || [],
        recommendation: safetyResult.recommendation || {}
      });
      if (safetyResult.reasons && safetyResult.reasons.length) {
        warnings.push(...safetyResult.reasons);
      }
    }

    // Если нет валидных продуктов, рецепт считается невалидным
    if (productIds.length === 0) {
      return {
        recipe: recipe,
        productIds: [],
        safety: 'block',
        warnings: warnings.length ? warnings : ['Нет валидных продуктов в рецепте'],
        nutrition: { groupCount: 0, nutrientCount: 0, groups: [], nutrients: [] },
        allIntroduced: false,
        invalid: true
      };
    }

    // Агрегированный статус
    const statuses = safetyResults.map(r => r.status);
    const safety = aggregateStatus(statuses);

    // Проверка allIntroduced
    let allIntroduced = true;
    for (const id of productIds) {
      const state = window.productStateService.getProductState(childIdActual, id);
      if (!state || state.status !== 'introduced') {
        allIntroduced = false;
        break;
      }
    }

    // Дополнительная возрастная проверка (recipe.age)
    if (recipe.age && typeof recipe.age === 'number') {
      const ageMonths = profile.calculated?.correctedAgeMonths ?? profile.calculated?.chronologicalAgeMonths ?? 0;
      if (ageMonths < recipe.age) {
        warnings.push(`Рекомендуемый возраст для этого рецепта — ${recipe.age} мес., а ребёнку ${Math.round(ageMonths)} мес.`);
        // Не меняем статус, только добавляем предупреждение
      }
    }

    // Собрать nutrition (группы и нутриенты)
    const nutrition = collectNutritionFromProducts(productObjects);

    // Собрать все предупреждения (уникальные)
    const uniqueWarnings = [...new Set(warnings)];

    return {
      recipe: recipe,
      productIds: productIds,
      safety: safety,
      warnings: uniqueWarnings,
      nutrition: nutrition,
      allIntroduced: allIntroduced,
      invalid: false,
      // дополнительные поля для отладки
      productResults: safetyResults
    };
  }

  // ============================================================
  // ПУБЛИЧНЫЕ ФУНКЦИИ
  // ============================================================

  /**
   * Получить все рецепты для ребёнка с применением фильтров
   * @param {string} childId - ID ребёнка (опционально)
   * @param {object} filters - { onlySafe, onlyIntroduced, maxProducts }
   * @returns {Array} массив оценок рецептов
   */
  function getRecipesForChild(childId, filters = {}) {
    const recipes = window.RECIPES || [];
    if (!recipes.length) {
      return [];
    }

    const results = [];
    for (const recipe of recipes) {
      const evaluation = evaluateRecipeInternal(childId, recipe);
      if (evaluation.invalid) {
        continue; // пропускаем невалидные рецепты
      }
      results.push(evaluation);
    }

    // Применяем фильтры
    let filtered = results;

    if (filters.onlySafe) {
      filtered = filtered.filter(r => r.safety === 'safe' || r.safety === 'caution');
    }

    if (filters.onlyIntroduced) {
      filtered = filtered.filter(r => r.allIntroduced === true);
    }

    if (filters.maxProducts && typeof filters.maxProducts === 'number') {
      filtered = filtered.filter(r => r.productIds.length <= filters.maxProducts);
    }

    return filtered;
  }

  /**
   * Оценить конкретный рецепт по его id (или по объекту)
   * @param {string} childId - ID ребёнка (опционально)
   * @param {string|object} recipeIdOrObject - id рецепта или сам объект рецепта
   * @returns {object} оценка рецепта или null
   */
  function evaluateRecipe(childId, recipeIdOrObject) {
    let recipe = null;
    if (typeof recipeIdOrObject === 'string') {
      const recipes = window.RECIPES || [];
      recipe = recipes.find(r => r.id === recipeIdOrObject);
      if (!recipe) {
        console.warn(`Рецепт с id "${recipeIdOrObject}" не найден`);
        return null;
      }
    } else if (typeof recipeIdOrObject === 'object' && recipeIdOrObject.name) {
      recipe = recipeIdOrObject;
    } else {
      console.warn('Неверный параметр recipeIdOrObject');
      return null;
    }

    const evaluation = evaluateRecipeInternal(childId, recipe);
    if (evaluation.invalid) {
      return null;
    }
    return evaluation;
  }

  // ============================================================
  // ПУБЛИЧНЫЙ API
  // ============================================================

  window.recipeService = {
    getRecipesForChild: getRecipesForChild,
    evaluateRecipe: evaluateRecipe
  };

  console.log('✅ recipe-service загружен');
})();