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
    // 2. Проверка возраста (используем corrected только для preterm)
    // ----------------------------------------------------------
    let ageMonths = null;
    const birthTerm = development.birthTerm || 'unknown';

    if (birthTerm === 'preterm' && calculated.correctedAgeMonths !== null && calculated.correctedAgeMonths !== undefined) {
      ageMonths = calculated.correctedAgeMonths;
    } else if (calculated.chronologicalAgeMonths !== null && calculated.chronologicalAgeMonths !== undefined) {
      ageMonths = calculated.chronologicalAgeMonths;
    }

    let minAge = null;

    if (product.rules?.age?.minMonths !== undefined && product.rules?.age?.minMonths !== null) {
      minAge = product.rules.age.minMonths;
    } else if (product.introduction?.fromMonths !== undefined && product.introduction?.fromMonths !== null) {
      minAge = product.introduction.fromMonths;
    }

    if (ageMonths !== null && minAge !== null) {
      if (ageMonths < minAge) {
        statuses.push('block');
        reasons.push(`Возраст ${Math.round(ageMonths)} мес. меньше рекомендуемого минимума (${minAge} мес.)`);
        details.age = { status: 'too_early', minMonths: minAge, actualMonths: ageMonths };
      } else {
        details.age = { status: 'appropriate', minMonths: minAge, actualMonths: ageMonths };
      }
    } else {
      // Если возраст не определён – не блокируем, но добавляем предупреждение
      if (minAge !== null) {
        statuses.push('review');
        reasons.push('Возраст ребёнка не определён, рекомендуется уточнить дату рождения');
        details.age = { status: 'unknown', minMonths: minAge };
      } else {
        details.age = { status: 'unknown', minMonths: null };
      }
    }

    // ----------------------------------------------------------
    // 3. Проверка аллергии (разделяем информационное и блокирующее)
    // ----------------------------------------------------------
    let isAllergen = false;
    let allergenTypes = [];

    // Сначала пытаемся взять из rules
    if (product.rules?.allergy) {
      isAllergen = product.rules.allergy.isAllergen === true;
      allergenTypes = product.rules.allergy.types || [];
    } else {
      // fallback на старые поля
      isAllergen = product.allergen === true;
      if (Array.isArray(product.allergenType)) {
        allergenTypes = product.allergenType;
      } else {
        // если нет ни того, ни другого, используем getProductAllergens
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
        // продукт аллергенен, но у ребёнка нет такой аллергии – только информационное предупреждение
        reasons.push(`Продукт является потенциальным аллергеном (${allergenTypes.join(', ')})`);
        // НЕ добавляем статус 'caution' – только информационное предупреждение
        details.allergy = { status: 'informational', types: allergenTypes, childAllergies };
      }
    } else {
      details.allergy = { status: 'ok', types: [] };
    }

    // ----------------------------------------------------------
    // 4. Проверка формы подачи (если передана)
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
          // Форма не указана ни в allowed, ни в blocked – не считаем запретом
          details.serving = { allowed: null, form: servingForm, note: 'Форма не указана в правилах' };
        }
      } else {
        // fallback через checkServingSafety (используем старую логику)
        const servingCheck = window.checkServingSafety ? window.checkServingSafety(product, servingForm, null) : null;
        if (servingCheck) {
          // checkServingSafety возвращает { safe: boolean, warnings: [] }
          if (servingCheck.safe) {
            details.serving = { allowed: true, form: servingForm };
          } else {
            // Если не safe – добавляем предупреждение, но не блокируем автоматически
            reasons.push(...servingCheck.warnings);
            details.serving = { allowed: false, form: servingForm, warnings: servingCheck.warnings };
            // Но не добавляем статус block, только caution? По логике, если форма не рекомендована, но не запрещена явно, лучше caution.
            // Однако в задании сказано: "отсутствие формы в allowed НЕ должно автоматически означать запрет". Поэтому, если servingCheck говорит не safe, мы добавляем caution.
            statuses.push('caution');
            reasons.push(`Форма подачи "${servingForm}" требует осторожности`);
          }
        }
      }
    }

    // ----------------------------------------------------------
    // 5. Риск удушья (только информационное предупреждение)
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
      // Добавляем caution (не block)
      statuses.push('caution');
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
    // 6. Медицинская заметка (информационная, не блокирует)
    // ----------------------------------------------------------
    let medicalNote = null;
    if (product.rules?.restrictions?.medical) {
      medicalNote = product.rules.restrictions.medical;
    } else if (product.medicalNote) {
      medicalNote = product.medicalNote;
    }

    if (medicalNote) {
      reasons.push(`Медицинское замечание: ${medicalNote}`);
      // не влияет на статус, только на requiresWarning
    }

    // ----------------------------------------------------------
    // 7. Определение итогового статуса
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
      r.includes('не определён')
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
        canShow: true, // показываем всегда, кроме случая отсутствия данных
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