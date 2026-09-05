(function() {
  'use strict';

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================

  function getChildren() {
    return window.STATE?.children || [];
  }

  function getActiveChild() {
    return window.getCurrentChild ? window.getCurrentChild() : null;
  }

  function getChild(id) {
    const children = getChildren();
    return children.find(c => c.id === id) || null;
  }

  function createChild(data) {
    if (!window.addChild) {
      console.error('❌ addChild не найден в window');
      return null;
    }
    return window.addChild(data);
  }

  function setActiveChild(id) {
    if (!window.switchChild) {
      console.error('❌ switchChild не найден в window');
      return false;
    }
    return window.switchChild(id);
  }

  function updateChild(id, updates) {
    if (!window.updateChild) {
      console.error('❌ updateChild не найден в window');
      return false;
    }
    return window.updateChild(id, updates);
  }

  function deleteChild(id) {
    if (!window.deleteChild) {
      console.error('❌ deleteChild не найден в window');
      return false;
    }
    return window.deleteChild(id);
  }

  function ensureActiveChild() {
    const active = getActiveChild();
    if (active) return active;
    const children = getChildren();
    if (children.length > 0) {
      setActiveChild(children[0].id);
      return children[0];
    }
    return null;
  }

  // ============================================================
  // НОРМАЛИЗОВАННЫЙ ПРОФИЛЬ РЕБЁНКА (НОВОЕ)
  // ============================================================
  function getChildProfile(childId) {
    const id = childId || window.STATE?.currentChildId;
    if (!id) return null;

    const child = getChild(id);
    if (!child) return null;

    const onboarding = child.onboarding || {};

    // 1. Identity
    const identity = {
      id: child.id,
      name: child.name || 'Ребёнок',
      birthDate: child.birthDate || null
    };

    // 2. Development
    const gestationalWeeks = child.gestationalAgeWeeks ?? 40;
    const gestationalDays = child.gestationalAgeDays ?? 0;

    const ageInfo = child.birthDate
      ? window.feedingReadiness?.calculateAge(child.birthDate) || { months: 0, days: 0 }
      : { months: 0, days: 0 };

    const correctedMonths = window.feedingReadiness?.calculateCorrectedAge(
      ageInfo.months,
      gestationalWeeks
    ) ?? ageInfo.months;

    const termCategory = window.feedingReadiness?.getBirthTermCategory(
      gestationalWeeks,
      gestationalDays
    ) ?? 'unknown';

    const development = {
      gestationalAgeWeeks: gestationalWeeks,
      gestationalAgeDays: gestationalDays,
      birthTerm: termCategory,
      readiness: child.readiness || {
        headControl: 'unknown',
        bodyPosition: 'unknown',
        foodInterest: 'unknown',
        opensMouth: 'unknown',
        foodHandling: 'unknown'
      },
      correctedAgeMonths: correctedMonths
    };

    // 3. Feeding
    const feeding = {
      type: child.feedingType || 'unknown',
      started: child.feedingStarted || false,
      startDate: child.feedingStartDate || null,
      approach: child.approach || 'unknown'
    };

    // 4. Health
    const health = {
      allergies: Array.isArray(onboarding.allergies) ? onboarding.allergies : [],
      feedingProblems: Array.isArray(child.feedingProblems) ? child.feedingProblems : [],
      dietaryRestrictions: Array.isArray(onboarding.diet) ? onboarding.diet : []
    };

    // 5. Preferences
    const preferences = {
      favoriteFoods: Array.isArray(onboarding.favoriteFoods) ? onboarding.favoriteFoods : [],
      worries: Array.isArray(onboarding.worries) ? onboarding.worries : [],
      confidence: onboarding.confidence || 'unknown'
    };

    // 6. Calculated
    let daysSinceStart = null;
    if (feeding.started && child.feedingStartDate) {
      const start = new Date(child.feedingStartDate);
      const now = new Date();
      const diffTime = now - start;
      daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    const calculated = {
      chronologicalAgeMonths: ageInfo.months,
      correctedAgeMonths: correctedMonths,
      daysSinceStart: daysSinceStart,
      birthTermCategory: termCategory
    };

    return { identity, development, feeding, health, preferences, calculated };
  }

  // ============================================================
  // ПУБЛИЧНЫЙ API
  // ============================================================
  window.childService = {
    getChildren: getChildren,
    getActiveChild: getActiveChild,
    createChild: createChild,
    setActiveChild: setActiveChild,
    updateChild: updateChild,
    deleteChild: deleteChild,
    getChild: getChild,
    ensureActiveChild: ensureActiveChild,
    getChildProfile: getChildProfile   // <-- новая функция
  };

  console.log('✅ child-service загружен');
})();