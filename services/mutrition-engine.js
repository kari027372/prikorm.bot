// services/nutrition-engine.js – Stage 7 (финальная версия с правками)
(function() {
  'use strict';

  // ============================================================
  // КОНСТАНТЫ
  // ============================================================

  // Отслеживаемые нутриенты
  const SUPPORTED_NUTRIENTS = [
    'iron',
    'protein',
    'calcium',
    'vitamin_c',
    'omega3',
    'fiber',
    'zinc'
  ];

  // Основные пищевые группы для diversity score (не включаем allergens, other)
  const DIVERSITY_GROUPS = [
    'vegetables',
    'fruits',
    'grains',
    'meat',
    'fish',
    'dairy'
  ];

  // Пороги для групп: 0 → missing, 1 → insufficient, 2+ → introduced
  const GROUP_THRESHOLDS = {
    introduced: 2,
    insufficient: 1,
    missing: 0
  };

  // Пороги для нутриентов: 0 → missing, 1 → insufficient, 2+ → adequate
  const NUTRIENT_THRESHOLDS = {
    adequate: 2,
    insufficient: 1,
    missing: 0
  };

  // ============================================================
  // ПОСТРОЕНИЕ ИНДЕКСОВ (один проход по каталогу)
  // ============================================================

  let productIndex = null;         // productId → product
  let productGroups = null;       // productId → [group]
  let groupTotalAvailable = null; // group → количество продуктов
  let indexBuilt = false;

  function buildIndexes() {
    if (indexBuilt) return;
    const products = window.PRODUCTS || [];
    productIndex = {};
    productGroups = {};
    groupTotalAvailable = {};

    for (const product of products) {
      const id = product.id;
      productIndex[id] = product;
      const groups = window.products.getProductGroups(product) || [];
      productGroups[id] = groups;
      for (const group of groups) {
        if (!groupTotalAvailable[group]) groupTotalAvailable[group] = 0;
        groupTotalAvailable[group]++;
      }
    }
    indexBuilt = true;
  }

  function getProductById(id) {
    buildIndexes();
    return productIndex[id] || null;
  }

  function getProductGroupsById(id) {
    buildIndexes();
    return productGroups[id] || [];
  }

  function getGroupTotal(group) {
    buildIndexes();
    return groupTotalAvailable[group] || 0;
  }

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================

  function getStatusForGroup(count) {
    if (count >= GROUP_THRESHOLDS.introduced) return 'introduced';
    if (count >= GROUP_THRESHOLDS.insufficient) return 'insufficient';
    return 'missing';
  }

  function getStatusForNutrient(count) {
    if (count >= NUTRIENT_THRESHOLDS.adequate) return 'adequate';
    if (count >= NUTRIENT_THRESHOLDS.insufficient) return 'insufficient';
    return 'missing';
  }

  function getGroupMessage(group, status, count) {
    const label = {
      vegetables: 'Овощи',
      fruits: 'Фрукты',
      grains: 'Злаки/крупы',
      meat: 'Мясо',
      fish: 'Рыба',
      dairy: 'Молочные',
      allergens: 'Аллергены',
      other: 'Другое'
    }[group] || group;
    if (status === 'introduced') {
      return `Группа "${label}" представлена (${count} продукта)`;
    } else if (status === 'insufficient') {
      return `Группа "${label}" представлена недостаточно (${count} продукт)`;
    } else {
      return `Группа "${label}" отсутствует в рационе`;
    }
  }

  function getNutrientMessage(nutrient, status, count) {
    const label = {
      iron: 'железа',
      protein: 'белка',
      calcium: 'кальция',
      vitamin_c: 'витамина C',
      omega3: 'Омега-3',
      fiber: 'клетчатки',
      zinc: 'цинка'
    }[nutrient] || nutrient;

    if (status === 'adequate') {
      return `В рационе есть ${count} источника ${label} — это хорошее разнообразие`;
    } else if (status === 'insufficient') {
      return `В рационе есть ${count} источник ${label}, но можно добавить другие источники для разнообразия`;
    } else {
      return `В рационе нет источников ${label} — можно ввести продукты, богатые этим нутриентом`;
    }
  }

  function getNutrientSources(product) {
    const sources = [];
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
  // ОСНОВНАЯ ФУНКЦИЯ
  // ============================================================

  function evaluateDiet(childId) {
    // 1. Получить профиль ребёнка через childService (единый источник)
    const profile = window.childService.getChildProfile(childId);
    if (!profile) {
      return {
        summary: { overall: 'insufficient', score: 0, message: 'Не удалось получить профиль ребёнка' },
        foodGroups: {},
        nutrients: {},
        suggestions: [],
        details: { totalIntroduced: 0, totalProducts: 0, introducedGroups: [], missingGroups: [] }
      };
    }

    const childIdActual = profile.identity.id;

    // 2. Определить этап прикорма
    let feedingStage = null;
    if (window.feedingReadiness && typeof window.feedingReadiness.getFeedingStage === 'function') {
      const stageResult = window.feedingReadiness.getFeedingStage(profile);
      if (stageResult && stageResult.stage) {
        feedingStage = stageResult.stage;
      }
    }

    // 3. Получить список введённых продуктов из Product State
    const introducedIds = window.productStateService.getProductsByStatus(childIdActual, 'introduced') || [];

    // 4. Построить индексы (если ещё не построены)
    buildIndexes();

    // 5. Отфильтровать только те продукты, которые есть в каталоге (валидные)
    const validIntroducedIds = introducedIds.filter(id => getProductById(id) !== null);
    const totalIntroduced = validIntroducedIds.length;

    // 6. Инициализировать счётчики
    const groupCount = {};          // group → количество введённых продуктов
    const groupProducts = {};       // group → [productId]
    const nutrientSources = {};     // nutrient → [productId]

    // 7. Пройти по валидным введённым продуктам
    for (const id of validIntroducedIds) {
      const product = getProductById(id);
      if (!product) continue; // дополнительная защита

      // Группы
      const groups = getProductGroupsById(id);
      for (const group of groups) {
        if (!groupCount[group]) {
          groupCount[group] = 0;
          groupProducts[group] = [];
        }
        groupCount[group]++;
        groupProducts[group].push(id);
      }

      // Нутриенты
      const nutrients = getNutrientSources(product);
      for (const nutrient of nutrients) {
        if (!nutrientSources[nutrient]) {
          nutrientSources[nutrient] = [];
        }
        if (!nutrientSources[nutrient].includes(id)) {
          nutrientSources[nutrient].push(id);
        }
      }
    }

    // 8. Собрать все возможные группы (из индекса)
    const allGroups = Object.keys(groupTotalAvailable);

    // 9. Построить результат для групп
    const foodGroups = {};
    for (const group of allGroups) {
      const count = groupCount[group] || 0;
      const status = getStatusForGroup(count);
      foodGroups[group] = {
        status,
        count,
        totalAvailable: getGroupTotal(group),
        products: groupProducts[group] || [],
        message: getGroupMessage(group, status, count)
      };
    }

    // 10. Построить результат для нутриентов
    const nutrients = {};
    for (const nutrient of SUPPORTED_NUTRIENTS) {
      const sources = nutrientSources[nutrient] || [];
      const count = sources.length;
      const status = getStatusForNutrient(count);
      nutrients[nutrient] = {
        status,
        sources,
        message: getNutrientMessage(nutrient, status, count)
      };
    }

    // 11. Вычислить diversity score (только по основным группам)
    const introducedGroups = Object.keys(foodGroups).filter(g => foodGroups[g].status === 'introduced');
    const missingGroups = Object.keys(foodGroups).filter(g => foodGroups[g].status === 'missing');

    const diversityIntroduced = DIVERSITY_GROUPS.filter(g => foodGroups[g]?.status === 'introduced').length;
    const diversityTotal = DIVERSITY_GROUPS.length;
    const groupScore = diversityTotal > 0 ? (diversityIntroduced / diversityTotal) * 50 : 0;

    const adequateNutrients = Object.values(nutrients).filter(n => n.status === 'adequate').length;
    const nutrientScore = SUPPORTED_NUTRIENTS.length > 0 ? (adequateNutrients / SUPPORTED_NUTRIENTS.length) * 50 : 0;
    const score = Math.round(groupScore + nutrientScore);

    // 12. Итоговая оценка
    let overall = 'insufficient';
    if (score >= 70) overall = 'good';
    else if (score >= 40) overall = 'needs_attention';

    const summaryMessage = overall === 'good' ? 'Рацион разнообразен по основным группам и нутриентам.' :
                           overall === 'needs_attention' ? 'Есть недостающие группы или нутриенты, можно улучшить разнообразие.' :
                           'Рацион требует внимания: отсутствуют важные группы и/или нутриенты.';

    // 13. Генерация рекомендаций (новый порядок: приоритетные нутриенты → остальные нутриенты → группы)
    const suggestions = [];

    // Определяем приоритетный нутриент (железо для этапов expanding/establishing/transitioning)
    const ironPriority = ['expanding', 'establishing', 'transitioning'].includes(feedingStage);

    // --- Сначала приоритетный нутриент (железо), если актуален ---
    if (ironPriority && (nutrients.iron.status === 'missing' || nutrients.iron.status === 'insufficient')) {
      suggestions.push('🔴 ВАЖНО: введите продукты, богатые железом, чтобы разнообразить рацион.');
    }

    // --- Затем остальные нутриенты (кроме железа, если он уже добавлен) ---
    for (const nutrient of SUPPORTED_NUTRIENTS) {
      if (nutrient === 'iron' && ironPriority) continue; // уже обработано
      const status = nutrients[nutrient].status;
      if (status === 'missing' || status === 'insufficient') {
        const label = {
          iron: 'железа',
          protein: 'белка',
          calcium: 'кальция',
          vitamin_c: 'витамина C',
          omega3: 'Омега-3',
          fiber: 'клетчатки',
          zinc: 'цинка'
        }[nutrient] || nutrient;
        suggestions.push(`Введите продукты, богатые ${label}, чтобы разнообразить рацион.`);
      }
    }

    // --- Затем рекомендации по группам (кроме служебных) ---
    for (const group of missingGroups) {
      if (['allergens', 'other'].includes(group)) continue;
      const label = group.charAt(0).toUpperCase() + group.slice(1);
      suggestions.push(`Расширьте рацион: добавьте продукты из группы "${label}".`);
    }
    for (const group of Object.keys(foodGroups)) {
      if (foodGroups[group].status === 'insufficient' && !['allergens', 'other'].includes(group)) {
        const label = group.charAt(0).toUpperCase() + group.slice(1);
        suggestions.push(`Разнообразьте группу "${label}": введите больше продуктов.`);
      }
    }

    // Ограничиваем до 5 рекомендаций
    const limitedSuggestions = suggestions.slice(0, 5);

    // 14. Финальный результат
    return {
      summary: {
        overall,
        score,
        message: summaryMessage
      },
      foodGroups,
      nutrients,
      suggestions: limitedSuggestions,
      details: {
        totalIntroduced,
        totalProducts: Object.keys(productIndex).length,
        introducedGroups,
        missingGroups
      }
    };
  }

  // ============================================================
  // ПУБЛИЧНЫЙ API
  // ============================================================

  window.nutritionEngine = {
    evaluateDiet: evaluateDiet
  };

  console.log('✅ nutrition-engine загружен');
})();