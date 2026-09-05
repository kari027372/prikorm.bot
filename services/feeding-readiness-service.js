(function() {
  'use strict';

  // ============================================================
  // КОНФИГУРАЦИЯ ЭТАПОВ ПРИКОРМА (легко изменяема)
  // ============================================================

  const STAGE_RULES = {
    // Правила по возрасту (в месяцах) – приоритет
    age: [
      { min: 0, max: 5.9, stage: 'initial', label: 'Начальный этап', description: 'Первые пробы, пюреобразная пища, знакомство с новыми вкусами.' },
      { min: 6, max: 7.9, stage: 'expanding', label: 'Расширение рациона', description: 'Вводим новые группы продуктов, текстуры становятся более разнообразными.' },
      { min: 8, max: 9.9, stage: 'establishing', label: 'Установление режима', description: '3 основных приёма пищи, включаем кусочки, ребёнок учится жевать.' },
      { min: 10, max: Infinity, stage: 'transitioning', label: 'Переход к семейной еде', description: 'Ребёнок постепенно переходит на общий стол, текстуры и порции приближаются к взрослым.' }
    ],
    // Правила по стажу прикорма (в днях) – используются только если возраст не определён
    daysSinceStart: [
      { min: 0, max: 30, stage: 'initial', label: 'Начальный этап', description: 'Первые пробы, пюре.' },
      { min: 31, max: 90, stage: 'expanding', label: 'Расширение рациона', description: 'Новые группы продуктов, текстуры.' },
      { min: 91, max: 180, stage: 'establishing', label: 'Установление режима', description: '3 приёма пищи, кусочки.' },
      { min: 181, max: Infinity, stage: 'transitioning', label: 'Переход к семейной еде', description: 'Приближение к общему столу.' }
    ]
  };

  // ============================================================
  // СУЩЕСТВУЮЩИЕ ФУНКЦИИ (БЕЗ ИЗМЕНЕНИЙ)
  // ============================================================

  /**
   * Рассчитывает возраст в месяцах и днях от даты рождения
   */
  function calculateAge(birthDate) {
    if (!birthDate) return { months: 0, days: 0 };
    const now = new Date();
    const birth = new Date(birthDate);
    let months = (now.getFullYear() - birth.getFullYear()) * 12;
    months += now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) months = 0;
    return { months, days };
  }

  /**
   * Определяет категорию срока рождения по гестационным неделям и дням
   */
  function getBirthTermCategory(weeks, days) {
    const totalDays = weeks * 7 + (days || 0);
    if (totalDays < 259) return 'preterm';          // < 37 недель
    if (totalDays < 273) return 'early_term';       // 37–38,6
    if (totalDays < 294) return 'full_term';        // 39–40,6
    if (totalDays < 301) return 'late_term';        // 41–41,6
    if (totalDays < 315) return 'post_term';        // 42–42,6
    return 'unknown';
  }

  /**
   * Рассчитывает скорректированный возраст (для недоношенных)
   */
  function calculateCorrectedAge(chronologicalMonths, gestationalWeeks) {
    if (!gestationalWeeks || gestationalWeeks >= 40) {
      return chronologicalMonths;
    }
    const diff = (40 - gestationalWeeks) / 4.345; // примерно 4.345 недель в месяце
    return Math.max(0, chronologicalMonths - diff);
  }

  /**
   * Нормализует ответы на вопросы о готовности к прикорму
   */
  function parseReadinessAnswers(rawAnswers) {
    const defaults = {
      headControl: 'unknown',
      bodyPosition: 'unknown',
      foodInterest: 'unknown',
      opensMouth: 'unknown',
      foodHandling: 'unknown'
    };
    if (!rawAnswers || typeof rawAnswers !== 'object') return defaults;
    return {
      headControl: rawAnswers.headControl || 'unknown',
      bodyPosition: rawAnswers.bodyPosition || 'unknown',
      foodInterest: rawAnswers.foodInterest || 'unknown',
      opensMouth: rawAnswers.opensMouth || 'unknown',
      foodHandling: rawAnswers.foodHandling || 'unknown'
    };
  }

  /**
   * Комплексная оценка готовности к прикорму
   */
  function evaluateReadiness(childData) {
    if (!childData) {
      return { ready: false, reasons: ['Нет данных о ребёнке'], score: 0 };
    }
    const readiness = childData.readiness || {};
    const answers = parseReadinessAnswers(readiness);
    const values = Object.values(answers);
    const positive = values.filter(v => v === 'yes').length;
    const partial = values.filter(v => v === 'partial').length;
    const total = values.length;
    const score = total > 0 ? (positive + partial * 0.5) / total : 0;

    const ageInfo = childData.birthDate ? calculateAge(childData.birthDate) : { months: 0 };
    const corrected = childData.gestationalAgeWeeks
      ? calculateCorrectedAge(ageInfo.months, childData.gestationalAgeWeeks)
      : ageInfo.months;

    const reasons = [];
    if (corrected < 4) reasons.push('Возраст менее 4 месяцев (скорректированный)');
    if (positive < 3) reasons.push('Недостаточно признаков готовности');
    if (partial > 2) reasons.push('Много частичных навыков');
    if (reasons.length === 0 && score >= 0.7 && corrected >= 4) {
      return { ready: true, reasons: ['Готов к прикорму'], score };
    }
    return { ready: false, reasons: reasons.length ? reasons : ['Не все критерии выполнены'], score };
  }

  // ============================================================
  // НОВАЯ ФУНКЦИЯ – ОПРЕДЕЛЕНИЕ ЭТАПА ПРИКОРМА
  // ============================================================

  /**
   * Определяет этап прикорма на основе готового профиля ребёнка.
   * @param {Object} profile - нормализованный профиль (из childService.getChildProfile)
   * @returns {Object} { stage, label, description, basedOn, details }
   */
  function getFeedingStage(profile) {
    if (!profile) {
      return { stage: null, reason: 'no_profile' };
    }

    const { feeding, calculated } = profile;

    // Если прикорм не начат – возвращаем сразу
    if (!feeding.started) {
      return {
        stage: 'not_started',
        label: 'Прикорм не начат',
        description: 'Вы ещё не начали вводить прикорм. Ознакомьтесь с признаками готовности.',
        basedOn: 'feeding_started',
        details: { started: false }
      };
    }

    // Проверяем наличие данных для определения этапа
    const hasAge = calculated.correctedAgeMonths !== null && calculated.correctedAgeMonths !== undefined;
    const hasChronoAge = calculated.chronologicalAgeMonths !== null && calculated.chronologicalAgeMonths !== undefined;
    const hasDays = calculated.daysSinceStart !== null && calculated.daysSinceStart !== undefined;

    // Используем correctedAgeMonths приоритетно, затем chronological
    let ageToUse = null;
    let ageType = null;
    if (hasAge) {
      ageToUse = calculated.correctedAgeMonths;
      ageType = 'corrected';
    } else if (hasChronoAge) {
      ageToUse = calculated.chronologicalAgeMonths;
      ageType = 'chronological';
    }

    // Если возраст есть – определяем этап по возрасту
    if (ageToUse !== null) {
      const rules = STAGE_RULES.age;
      for (const rule of rules) {
        if (ageToUse >= rule.min && ageToUse < rule.max) {
          return {
            stage: rule.stage,
            label: rule.label,
            description: rule.description,
            basedOn: 'age',
            details: { ageMonths: ageToUse, ageType }
          };
        }
      }
      // Если ни одно правило не подошло (например, возраст отрицательный) – fallback
      return {
        stage: null,
        reason: 'age_out_of_range',
        details: { ageMonths: ageToUse, ageType }
      };
    }

    // Если возраст не определён, но есть стаж – используем стаж
    if (hasDays) {
      const days = calculated.daysSinceStart;
      const rules = STAGE_RULES.daysSinceStart;
      for (const rule of rules) {
        if (days >= rule.min && days < rule.max) {
          return {
            stage: rule.stage,
            label: rule.label,
            description: rule.description,
            basedOn: 'days',
            details: { daysSinceStart: days }
          };
        }
      }
      return {
        stage: null,
        reason: 'days_out_of_range',
        details: { daysSinceStart: days }
      };
    }

    // Если нет ни возраста, ни стажа – недостаточно данных
    return {
      stage: null,
      reason: 'insufficient_data',
      details: { hasAge, hasChronoAge, hasDays }
    };
  }

  // ============================================================
  // ПУБЛИЧНЫЙ API
  // ============================================================

  window.feedingReadiness = {
    calculateAge: calculateAge,
    getBirthTermCategory: getBirthTermCategory,
    calculateCorrectedAge: calculateCorrectedAge,
    parseReadinessAnswers: parseReadinessAnswers,
    evaluateReadiness: evaluateReadiness,
    getFeedingStage: getFeedingStage   // <-- новая функция
  };

  console.log('✅ feeding-readiness-service загружен');
})();