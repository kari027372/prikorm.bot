// services/feeding-readiness-service.js
(function() {
    'use strict';

    // ============================================================
    // 1. ВОЗРАСТ
    // ============================================================

    function calculateAge(birthDate) {
        if (!birthDate) return { months: 0, days: 0 };
        const birth = new Date(birthDate);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        return {
            months: Math.max(0, months),
            days: Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))
        };
    }

    // ============================================================
    // 2. СРОК РОЖДЕНИЯ
    // ============================================================

    function getBirthTermCategory(weeks, days) {
        if (weeks === '' || weeks === null || weeks === undefined) return 'unknown';
        const totalDays = parseInt(weeks, 10) * 7 + (parseInt(days, 10) || 0);
        if (totalDays < 259) return 'preterm';
        if (totalDays < 273) return 'early_term';
        if (totalDays < 287) return 'full_term';
        if (totalDays < 294) return 'late_term';
        return 'post_term';
    }

    function getTermLabel(category) {
        const map = {
            'preterm': 'Родился раньше срока',
            'early_term': 'Ранний доношенный срок',
            'full_term': 'Доношенный',
            'late_term': 'Поздний доношенный срок',
            'post_term': 'После срока',
            'unknown': 'Срок не указан'
        };
        return map[category] || '';
    }

    // ============================================================
    // 3. СКОРРЕКТИРОВАННЫЙ ВОЗРАСТ
    // ============================================================

    function calculateCorrectedAge(chronologicalMonths, gestationalWeeks) {
        let safeWeeks = 40;
        if (typeof gestationalWeeks === 'number' && gestationalWeeks >= 20 && gestationalWeeks <= 43) {
            safeWeeks = gestationalWeeks;
        }
        if (safeWeeks >= 37) {
            return chronologicalMonths;
        }
        const weeksEarly = 40 - safeWeeks;
        const monthsEarly = weeksEarly / 4.345;
        return Math.max(0, chronologicalMonths - monthsEarly);
    }

    // ============================================================
    // 4. ПАРСИНГ ОТВЕТОВ НА ВОПРОСЫ ГОТОВНОСТИ
    // ============================================================

    function parseReadinessAnswers(rawAnswers) {
        const result = {};
        const keys = ['headControl', 'bodyPosition', 'foodInterest', 'opensMouth', 'foodHandling'];
        keys.forEach(key => {
            const val = rawAnswers[key];
            if (key === 'foodHandling') {
                result[key] = val || 'unknown';
            } else {
                const map = {
                    'Уверенно': 'yes',
                    'Иногда теряет положение': 'partial',
                    'Пока не удерживает': 'no',
                    'Не уверена': 'unknown',
                    'Да': 'yes',
                    'Иногда': 'partial',
                    'Нет': 'no',
                    'Не уверена': 'unknown',
                    'Да, устойчиво': 'yes',
                    'С поддержкой, но иногда заваливается': 'partial',
                    'Пока нет': 'no'
                };
                result[key] = map[val] || 'unknown';
            }
        });
        return result;
    }

    // ============================================================
    // 5. КОМПЛЕКСНАЯ ОЦЕНКА ГОТОВНОСТИ
    // ============================================================

    function evaluateReadiness(childData) {
        const {
            birthDate,
            gestationalAgeWeeks,
            birthTermCategory,
            readiness: rawReadiness,
            feedingProblems = [],
            feedingStarted,
        } = childData;

        // 1. Возраст
        const age = calculateAge(birthDate);
        const chronologicalAgeMonths = age.months;
        const chronologicalAgeDays = age.days;

        // 2. Срок рождения
        let safeGestationalWeeks = 40;
        if (typeof gestationalAgeWeeks === 'number' && gestationalAgeWeeks >= 20 && gestationalAgeWeeks <= 43) {
            safeGestationalWeeks = gestationalAgeWeeks;
        }
        const termCategory = birthTermCategory || 'unknown';
        const isPreterm = termCategory === 'preterm' || (safeGestationalWeeks < 37);
        const correctedAgeMonths = calculateCorrectedAge(chronologicalAgeMonths, safeGestationalWeeks);

        // 3. Признаки готовности
        const parsed = parseReadinessAnswers(rawReadiness || {});
        const {
            headControl = 'unknown',
            bodyPosition = 'unknown',
            foodInterest = 'unknown',
            opensMouth = 'unknown',
            foodHandling = 'unknown'
        } = parsed;

        // 4. Ключевые навыки безопасности
        const keySkills = {
            headControl: headControl === 'yes',
            bodyPosition: bodyPosition === 'yes' || bodyPosition === 'partial',
            safeSwallowing: foodHandling === 'Спокойно принимает и проглатывает' || foodHandling === 'Иногда выталкивает языком'
        };
        const hasKeySkills = keySkills.headControl && keySkills.bodyPosition && keySkills.safeSwallowing;

        // 5. Проблемы с кормлением
        const seriousProblems = feedingProblems.some(p =>
            p === 'Часто давится/кашляет во время кормления' ||
            p === 'Есть проблемы с глотанием' ||
            p === 'Есть выраженные трудности с кормлением'
        );

        // 6. Формирование итога
        let overallStatus = 'unknown';
        let overallMessage = '';
        let overallRecommendation = '';

        if (chronologicalAgeMonths < 4) {
            overallStatus = 'too_young';
            overallMessage = '🔵 Возраст пока очень маленький';
            overallRecommendation = 'Прикорм в таком возрасте обычно не начинают. Продолжайте наблюдать за развитием.';
        } else if (seriousProblems) {
            overallStatus = 'needs_review';
            overallMessage = '🟠 Нужна консультация специалиста';
            overallRecommendation = 'В анкете отмечены особенности кормления, которые важно обсудить с педиатром.';
        } else {
            const ageReady = chronologicalAgeMonths >= 6;
            const correctedReady = isPreterm ? correctedAgeMonths >= 6 : false;

            if (ageReady || (isPreterm && correctedReady)) {
                if (hasKeySkills) {
                    overallStatus = 'ready';
                    overallMessage = '🟢 Основные признаки готовности присутствуют';
                    overallRecommendation = 'Возраст и основные навыки соответствуют началу прикорма.';
                } else {
                    overallStatus = 'developing';
                    overallMessage = '🟡 Некоторые важные навыки ещё формируются';
                    overallRecommendation = 'Возраст подходит, но один или несколько ключевых навыков пока не сформированы. Продолжайте наблюдать.';
                }
            } else if (chronologicalAgeMonths >= 4 && chronologicalAgeMonths < 6) {
                if (hasKeySkills) {
                    overallStatus = 'possible';
                    overallMessage = '🟡 Большинство признаков готовности присутствует';
                    overallRecommendation = 'Возраст немного меньше основного ориентира, но навыки сформированы. Если планируете начало до 6 месяцев, обсудите с педиатром.';
                } else {
                    overallStatus = 'developing';
                    overallMessage = '🟡 Некоторые навыки ещё формируются';
                    overallRecommendation = 'Возраст ещё не достиг основного ориентира, и не все ключевые навыки сформированы. Продолжайте наблюдать.';
                }
            } else {
                overallStatus = 'not_yet';
                overallMessage = '🔵 Данных недостаточно или возраст ещё не подходит';
                overallRecommendation = 'Продолжайте наблюдать за ребёнком.';
            }
        }

        // Если недоношенный – добавляем пометку
        if (isPreterm && overallStatus !== 'needs_review' && overallStatus !== 'too_young') {
            overallMessage += ' (учтена недоношенность)';
            overallRecommendation = 'Для недоношенных детей особенно важно учитывать развитие. ' + overallRecommendation;
        }

        // Возвращаем структурированный объект
        return {
            ageBlock: {
                chronologicalMonths,
                chronologicalDays,
                correctedMonths: isPreterm ? correctedAgeMonths : null,
                isPreterm
            },
            termBlock: {
                category: termCategory,
                label: getTermLabel(termCategory),
                weeks: safeGestationalWeeks
            },
            readinessBlock: {
                headControl,
                bodyPosition,
                foodInterest,
                opensMouth,
                foodHandling,
                keySkills,
                hasKeySkills
            },
            safetyBlock: {
                hasFeedingProblems: feedingProblems.length > 0,
                seriousProblems,
                problemsList: feedingProblems.filter(p => p !== 'Нет' && p !== 'Не уверена')
            },
            overallStatus,
            overallMessage,
            overallRecommendation,
            originalReadiness: rawReadiness || {}
        };
    }

    // ============================================================
    // 6. ПУБЛИЧНЫЙ API
    // ============================================================

    window.feedingReadiness = {
        calculateAge,
        getBirthTermCategory,
        getTermLabel,
        calculateCorrectedAge,
        parseReadinessAnswers,
        evaluateReadiness
    };

    console.log('✅ feeding-readiness-service загружен');
})();