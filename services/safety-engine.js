// services/safety-engine.js – синхронизирован с актуальными данными продуктов
(function() {
  'use strict';

  // ============================================================
  // ПРИОРИТЕТ СТАТУСОВ (от высшего к низшему)
  // ============================================================
  const STATUS_PRIORITY = {
    'not_appropriate': 5,
    'block': 4,
    'review': 3,
    'caution': 2,
    'allow': 1
  };

  function getHighestStatus(statuses) {
    let highest = { status: 'allow', priority: 0 };
    for (const s of statuses) {
      const priority = STATUS_PRIORITY[s] || 0;
      if (priority > highest.priority) {
        highest = { status: s, priority };
      }
    }
    return highest.status;
  }

  // ============================================================
  // ОСНОВНАЯ ФУНКЦИЯ ОЦЕНКИ БЕЗОПАСНОСТИ
  // ============================================================
  function evaluateProductSafety(profile, product, servingForm) {
    if (!profile || !product) {
      return {
        status: 'block',
        reasons: ['Недостаточно данных для оценки'],
        recommendation: { canShow: false, canRecommend: false, requiresWarning: false },
        details: { age: null, allergy: null, safety: null, serving: null }
      };
    }

    const { feeding, health, development, calculated } = profile;
    const reasons = [];
    const statuses = [];
    const details = {
      age: null,
      allergy: null,
      safety: null,
      serving: null
    };

    // ---------- 1. Проверка начала прикорма ----------
    if (!feeding.started) {
      return {
        status: 'not_appropriate',
        reasons: ['Прикорм ещё не начат'],
        recommendation: { canShow: true, canRecommend: false, requiresWarning: false },
        details: details
      };
    }

    // ---------- 2. Абсолютное возрастное ограничение (ageRestrictions) ----------
    let childAge = null;
    const birthTerm = development.birthTerm || 'unknown';
    if (birthTerm === 'preterm' && calculated.correctedAgeMonths !== null && calculated.correctedAgeMonths !== undefined) {
      childAge = calculated.correctedAgeMonths;
    } else if (calculated.chronologicalAgeMonths !== null && calculated.chronologicalAgeMonths !== undefined) {
      childAge = calculated.chronologicalAgeMonths;
    }

    if (childAge !== null && product.ageRestrictions && Array.isArray(product.ageRestrictions)) {
      for (const restriction of product.ageRestrictions) {
        if (restriction.type === 'absolute' && childAge < restriction.untilMonths) {
          statuses.push('block');
          reasons.push(restriction.reason || 'Возрастное ограничение');
          details.age = { status: 'blocked_by_age', untilMonths: restriction.untilMonths, reason: restriction.reason };
          // Не прерываем, продолжаем сбор других причин
        }
      }
    }

    // ---------- 3. mercuryRisk: avoid ----------
    if (product.mercuryRisk === 'avoid') {
      statuses.push('block');
      reasons.push('Высокое содержание ртути — избегать');
      details.safety = { mercuryRisk: 'avoid' };
    }

    // ---------- 4. Обычный минимальный возраст ----------
    let minAge = null;
    if (product.rules?.age?.minMonths !== undefined && product.rules?.age?.minMonths !== null) {
      minAge = product.rules.age.minMonths;
    } else if (product.introduction?.fromMonths !== undefined && product.introduction?.fromMonths !== null) {
      minAge = product.introduction.fromMonths;
    }

    if (childAge !== null && minAge !== null) {
      if (childAge < minAge) {
        // Если ещё нет блока от ageRestrictions, добавляем block
        if (!statuses.includes('block')) {
          statuses.push('block');
        }
        reasons.push(`Возраст ${Math.round(childAge)} мес. меньше рекомендуемого минимума (${minAge} мес.)`);
        details.age = { status: 'too_early', minMonths: minAge, actualMonths: childAge };
      } else {
        details.age = { status: 'appropriate', minMonths: minAge, actualMonths: childAge };
      }
    } else {
      if (minAge !== null) {
        // Если возраст не определён, но есть minAge – добавляем review
        statuses.push('review');
        reasons.push('Возраст ребёнка не определён, рекомендуется уточнить дату рождения');
        details.age = { status: 'unknown', minMonths: minAge };
      } else {
        details.age = { status: 'unknown', minMonths: null };
      }
    }

    // ---------- 5. Аллергия (информационная, блок только при совпадении) ----------
    let isAllergen = false;
    let allergenTypes = [];

    // Сначала из product.rules
    if (product.rules?.allergy) {
      isAllergen = product.rules.allergy.isAllergen === true;
      allergenTypes = product.rules.allergy.types || [];
    } else {
      // Fallback на старые поля
      isAllergen = product.allergen === true;
      if (Array.isArray(product.allergenType)) {
        allergenTypes = product.allergenType;
      } else {
        // Используем getProductAllergens из safety.js, если доступен
        const allergensFromOld = window.getProductAllergens ? window.getProductAllergens(product) : [];
        if (allergensFromOld.length > 0) {
          isAllergen = true;
          allergenTypes = allergensFromOld;
        }
      }
    }

    if (isAllergen && allergenTypes.length > 0) {
      const childAllergies = health.allergies || [];
      const hasMatchingAllergy = childAllergies.some( allergy =>
        allergenTypes.some(type => allergy.toLowerCase().includes(type.toLowerCase()))
      );

      if (hasMatchingAllergy) {
        statuses.push('block');
        reasons.push(`У ребёнка отмечена аллергия на этот продукт (${allergenTypes.join(', ')})`);
        details.allergy = { status: 'blocked', types: allergenTypes, childAllergies };
      } else {
        // Только информационное предупреждение – не добавляем статус
        reasons.push(`Продукт является потенциальным аллергеном (${allergenTypes.join(', ')})`);
        details.allergy = { status: 'informational', types: allergenTypes, childAllergies };
      }
    } else {
      details.allergy = { status: 'ok', types: [] };
    }

    // ---------- 6. Форма подачи ----------
    // Сначала пытаемся использовать product.rules.serving
    let allowedForms = [];
    let blockedForms = [];
    let usingRules = false;

    if (product.rules?.serving) {
      allowedForms = product.rules.serving.allowed || [];
      blockedForms = product.rules.serving.blocked || [];
      usingRules = true;
    }

    if (servingForm) {
      if (usingRules) {
        // Проверяем явные правила
        const isBlocked = blockedForms.some(f => f.toLowerCase() === servingForm.toLowerCase());
        const isAllowed = allowedForms.some(f => f.toLowerCase() === servingForm.toLowerCase());

        if (isBlocked) {
          statuses.push('block');
          reasons.push(`Форма подачи "${servingForm}" явно не рекомендуется для этого продукта`);
          details.serving = { allowed: false, form: servingForm };
        } else if (isAllowed) {
          details.serving = { allowed: true, form: servingForm };
        } else {
          // Форма не указана ни в allowed, ни в blocked – используем safeForms/unsafeForms как fallback
          const safeForms = product.safeForms || [];
          const unsafeForms = product.unsafeForms || [];
          const isUnsafe = unsafeForms.some(f => servingForm.toLowerCase().includes(f.toLowerCase()));
          const isSafe = safeForms.some(f => servingForm.toLowerCase().includes(f.toLowerCase()));

          if (isUnsafe) {
            statuses.push('block');
            reasons.push(`Форма подачи "${servingForm}" небезопасна для этого продукта`);
            details.serving = { allowed: false, form: servingForm };
          } else if (isSafe) {
            details.serving = { allowed: true, form: servingForm };
          } else {
            // Форма неизвестна – не блокируем, только предупреждение
            details.serving = { allowed: null, form: servingForm, note: 'Форма не указана в правилах' };
            // Можно добавить caution? По заданию – не блокируем.
          }
        }
      } else {
        // Нет rules.serving – используем safeForms/unsafeForms напрямую
        const safeForms = product.safeForms || [];
        const unsafeForms = product.unsafeForms || [];
        const isUnsafe = unsafeForms.some(f => servingForm.toLowerCase().includes(f.toLowerCase()));
        const isSafe = safeForms.some(f => servingForm.toLowerCase().includes(f.toLowerCase()));

        if (isUnsafe) {
          statuses.push('block');
          reasons.push(`Форма подачи "${servingForm}" небезопасна для этого продукта`);
          details.serving = { allowed: false, form: servingForm };
        } else if (isSafe) {
          details.serving = { allowed: true, form: servingForm };
        } else {
          // Если нет ни safe ни unsafe – считаем, что форма неизвестна, не блокируем
          details.serving = { allowed: null, form: servingForm, note: 'Форма не указана' };
        }
      }
    } else {
      // Форма не передана – не проверяем
      details.serving = { allowed: null, form: null };
    }

    // ---------- 7. Риск удушья (choking) ----------
    let chokingRisk = 'low';
    let chokingWarning = null;

    // Получаем chokingRisk из продукта (используем тот же порядок, что и в safety.js)
    if (product.rules?.safety?.chokingRisk) {
      chokingRisk = product.rules.safety.chokingRisk;
    } else if (product.chokingRisk) {
      chokingRisk = product.chokingRisk;
    } else if (product.choking === true) {
      chokingRisk = 'high';
    } else {
      // Можем проверить через getChokingRisk, но она уже используется в safety.js
      // Для простоты используем продукт напрямую
    }

    // Если chokingRisk высокий, и нет уже блока от формы, добавляем caution
    if (chokingRisk === 'high' || chokingRisk === 'medium') {
      if (!statuses.includes('block')) {
        // Если нет блока, добавляем caution (не block)
        statuses.push('caution');
      }
      if (chokingRisk === 'high') {
        reasons.push('Продукт имеет высокий риск удушья, необходима правильная форма подачи и наблюдение');
        details.safety = { chokingRisk: 'high', requiresSupervision: true };
      } else {
        reasons.push('Продукт требует внимания при подаче');
        details.safety = { chokingRisk: 'medium', requiresSupervision: true };
      }
    } else {
      details.safety = { chokingRisk: 'low', requiresSupervision: false };
    }

    // ---------- 8. Медицинские заметки (информационные) ----------
    let medicalNote = null;
    if (product.rules?.restrictions?.medical) {
      medicalNote = product.rules.restrictions.medical;
    } else if (product.medicalNote) {
      medicalNote = product.medicalNote;
    }
    if (medicalNote) {
      reasons.push(`Медицинское замечание: ${medicalNote}`);
    }

    // ---------- 9. labelChecks (добавленный сахар/соль) ----------
    if (product.labelChecks && Array.isArray(product.labelChecks)) {
      const warnings = [];
      if (product.labelChecks.indexOf('addedSugar') !== -1) {
        warnings.push('Содержит добавленный сахар');
      }
      if (product.labelChecks.indexOf('addedSalt') !== -1) {
        warnings.push('Содержит добавленную соль');
      }
      if (warnings.length > 0) {
        warnings.forEach(w => reasons.push(w));
        if (!statuses.includes('block')) {
          statuses.push('review');
        }
        details.safety = details.safety || {};
        details.safety.labelChecks = warnings;
      }
    }

    // ---------- 10. Итоговый статус ----------
    if (statuses.length === 0) {
      statuses.push('allow');
    }

    const finalStatus = getHighestStatus(statuses);

    const requiresWarning = reasons.some(r =>
      r.includes('аллерген') ||
      r.includes('удушья') ||
      r.includes('медицинское') ||
      r.includes('осторожность') ||
      r.includes('не определён') ||
      r.includes('сахар') ||
      r.includes('соль') ||
      r.includes('ртути') ||
      r.includes('Возраст')
    );

    let canRecommend = (finalStatus === 'allow' || finalStatus === 'caution');

    return {
      status: finalStatus,
      reasons: reasons,
      recommendation: {
        canShow: true,
        canRecommend: canRecommend,
        requiresWarning: requiresWarning
      },
      details: details
    };
  }

  // ============================================================
  // ПУБЛИЧНЫЙ API
  // ============================================================
  window.safetyEngine = {
    evaluateProductSafety: evaluateProductSafety
  };

  console.log('✅ safety-engine загружен (синхронизирован)');
})();