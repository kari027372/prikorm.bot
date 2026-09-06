// services/safety-engine.js – новый файл
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

  // ============================================================
  // ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ – определение итогового статуса
  // ============================================================
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
  // ОСНОВНАЯ ФУНКЦИЯ – оценка безопасности продукта
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

    // ----------------------------------------------------------
    // 1. Проверка: начат ли прикорм
    // ----------------------------------------------------------
    if (!feeding.started) {
      return {
        status: 'not_appropriate',
        reasons: ['Прикорм ещё не начат'],
        recommendation: {
          canShow: true,
          canRecommend: false,
          requiresWarning: false
        },
        details: details
      };
    }

    // ----------------------------------------------------------
    // 2. НОВАЯ ПРОВЕРКА: ageRestrictions (абсолютные возрастные ограничения)
    // ----------------------------------------------------------
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

    // ----------------------------------------------------------
    // 3. НОВАЯ ПРОВЕРКА: mercuryRisk для рыбы
    // ----------------------------------------------------------
    if (product.mercuryRisk === 'avoid') {
      statuses.push('block');
      reasons.push('Высокое содержание ртути — избегать');
      details.safety = { mercuryRisk: 'avoid' };
    }

    // ----------------------------------------------------------
    // 4. Проверка возраста (из product.rules или introduction) – существующая логика
    // ----------------------------------------------------------
    let minAge = null;

    if (product.rules?.age?.minMonths !== undefined && product.rules?.age?.minMonths !== null) {
      minAge = product.rules.age.minMonths;
    } else if (product.introduction?.fromMonths !== undefined && product.introduction?.fromMonths !== null) {
      minAge = product.introduction.fromMonths;
    }

    if (childAge !== null && minAge !== null) {
      if (childAge < minAge) {
        // Если уже есть block от ageRestrictions, не добавляем дублирующий block, но добавляем причину
        if (!statuses.includes('block') || statuses.some(s => s === 'block' && reasons.some(r => r.includes('Возраст')))) {
          // Если уже есть block, просто добавляем причину
          statuses.push('block');
          reasons.push(`Возраст ${Math.round(childAge)} мес. меньше рекомендуемого минимума (${minAge} мес.)`);
        } else {
          // Если block уже есть от других причин, добавляем только причину
          reasons.push(`Возраст ${Math.round(childAge)} мес. меньше рекомендуемого минимума (${minAge} мес.)`);
        }
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

    // ----------------------------------------------------------
    // 5. Проверка аллергии (существующая логика)
    // ----------------------------------------------------------
    let isAllergen = false;
    let allergenTypes = [];

    if (product.rules?.allergy) {
      isAllergen = product.rules.allergy.isAllergen === true;
      allergenTypes = product.rules.allergy.types || [];
    } else {
      isAllergen = product.allergen === true;
      if (Array.isArray(product.allergenType)) {
        allergenTypes = product.allergenType;
      } else {
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
        reasons.push(`Продукт является потенциальным аллергеном (${allergenTypes.join(', ')})`);
        // НЕ добавляем статус 'caution' – только информационное предупреждение
        details.allergy = { status: 'informational', types: allergenTypes, childAllergies };
      }
    } else {
      details.allergy = { status: 'ok', types: [] };
    }

    // ----------------------------------------------------------
    // 6. Проверка формы подачи (если передана) – существующая логика
    // ----------------------------------------------------------
    if (servingForm) {
      let allowedForms = [];
      let blockedForms = [];
      let usingRules = false;

      if (product.rules?.serving) {
        allowedForms = product.rules.serving.allowed || [];
        blockedForms = product.rules.serving.blocked || [];
        usingRules = true;
      }

      if (usingRules) {
        const isBlocked = blockedForms.some(f => f.toLowerCase() === servingForm.toLowerCase());
        const isAllowed = allowedForms.some(f => f.toLowerCase() === servingForm.toLowerCase());

        if (isBlocked) {
          statuses.push('block');
          reasons.push(`Форма подачи "${servingForm}" явно не рекомендуется для этого продукта`);
          details.serving = { allowed: false, form: servingForm };
        } else if (isAllowed) {
          details.serving = { allowed: true, form: servingForm };
        } else {
          details.serving = { allowed: null, form: servingForm, note: 'Форма не указана в правилах' };
        }
      } else {
        const servingCheck = window.checkServingSafety ? window.checkServingSafety(product, servingForm, null) : null;
        if (servingCheck) {
          if (servingCheck.safe) {
            details.serving = { allowed: true, form: servingForm };
          } else {
            reasons.push(...servingCheck.warnings);
            details.serving = { allowed: false, form: servingForm, warnings: servingCheck.warnings };
            statuses.push('caution');
            reasons.push(`Форма подачи "${servingForm}" требует осторожности`);
          }
        }
      }
    }

    // ----------------------------------------------------------
    // 7. Риск удушья (существующая логика)
    // ----------------------------------------------------------
    let chokingRisk = 'low';
    let chokingWarning = null;

    if (product.rules?.safety?.chokingRisk) {
      chokingRisk = product.rules.safety.chokingRisk;
    } else {
      const chokingResult = window.getChokingRisk ? window.getChokingRisk(product) : null;
      if (chokingResult && chokingResult.level) {
        const levelId = chokingResult.level.id;
        chokingRisk = (levelId === 'high') ? 'high' : (levelId === 'attention') ? 'medium' : 'low';
        if (chokingResult.warning) {
          chokingWarning = chokingResult.warning;
        }
      }
    }

    if (chokingRisk === 'high') {
      reasons.push('Продукт имеет высокий риск удушья, необходима правильная форма подачи и наблюдение');
      details.safety = { chokingRisk: 'high', requiresSupervision: true };
      statuses.push('caution'); // не block, только caution
    } else if (chokingRisk === 'medium') {
      reasons.push('Продукт требует внимания при подаче');
      details.safety = { chokingRisk: 'medium', requiresSupervision: true };
      statuses.push('caution');
    } else {
      details.safety = { chokingRisk: 'low', requiresSupervision: false };
    }

    if (chokingWarning) {
      reasons.push(chokingWarning);
    }

    // ----------------------------------------------------------
    // 8. Медицинская заметка (информационная)
    // ----------------------------------------------------------
    let medicalNote = null;
    if (product.rules?.restrictions?.medical) {
      medicalNote = product.rules.restrictions.medical;
    } else if (product.medicalNote) {
      medicalNote = product.medicalNote;
    }

    if (medicalNote) {
      reasons.push(`Медицинское замечание: ${medicalNote}`);
    }

    // ----------------------------------------------------------
    // 9. НОВАЯ ПРОВЕРКА: labelChecks (добавленный сахар/соль) – только review
    // ----------------------------------------------------------
    if (product.labelChecks && Array.isArray(product.labelChecks)) {
      const warnings = [];
      if (product.labelChecks.indexOf('addedSugar') !== -1) {
        warnings.push('Содержит добавленный сахар');
      }
      if (product.labelChecks.indexOf('addedSalt') !== -1) {
        warnings.push('Содержит добавленную соль');
      }
      // Можно добавить другие проверки
      if (warnings.length > 0) {
        // Добавляем причины
        warnings.forEach(w => reasons.push(w));
        // Добавляем статус review, только если нет блока
        if (!statuses.includes('block')) {
          statuses.push('review');
        }
        details.safety = details.safety || {};
        details.safety.labelChecks = warnings;
      }
    }

    // ----------------------------------------------------------
    // 10. Определение итогового статуса
    // ----------------------------------------------------------
    if (statuses.length === 0) {
      statuses.push('allow');
    }

    const finalStatus = getHighestStatus(statuses);

    // Вычисляем requiresWarning – если есть любые предупреждения в reasons
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

    // Определяем canRecommend по таблице
    let canRecommend = false;
    if (finalStatus === 'allow' || finalStatus === 'caution') {
      canRecommend = true;
    } else {
      canRecommend = false;
    }

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

  console.log('✅ safety-engine загружен');
})();