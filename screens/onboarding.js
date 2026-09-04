// screens/onboarding.js – ФИНАЛЬНАЯ ВЕРСИЯ (встроенная логика)
(function () {
    'use strict';

    // ============================================================
    // 1. СПРАВОЧНИКИ
    // ============================================================

    const ALLERGENS_LIST = [
        'Яйцо', 'Молоко', 'Арахис', 'Другие орехи', 'Рыба',
        'Пшеница', 'Соя', 'Кунжут', 'Другие'
    ];

    const DIET_OPTIONS = [
        'Есть медицинские ограничения по питанию',
        'Есть назначенная врачом диета',
        'Есть проблемы с кормлением',
        'Другое',
        'Нет',
        'Не знаю'
    ];

    const FAVORITE_FOODS = [
        'Овощи', 'Фрукты', 'Каши и злаки', 'Мясо', 'Рыба',
        'Яйцо', 'Молочные продукты', 'Пока не знаю'
    ];

    const WORRY_OPTIONS = [
        'Удушье и попёрхивание',
        'Аллергические реакции',
        'Отказ от еды',
        'Нехватка железа и питательных веществ',
        'Боюсь сделать что-то неправильно'
    ];

    const FEEDING_PROBLEMS_OPTIONS = [
        'Часто давится/кашляет во время кормления',
        'Есть проблемы с глотанием',
        'Есть выраженные трудности с кормлением',
        'Есть диагностированные особенности',
        'Нет',
        'Не уверена'
    ];

    // ============================================================
    // 2. ШАГИ (13)
    // ============================================================

    const STEPS = [
        {
            id: 'name',
            emoji: '👶',
            title: 'Как зовут малыша?',
            desc: 'Имя можно пропустить',
            type: 'input',
            inputType: 'text',
            placeholder: 'Имя',
            key: 'name',
            skipable: true
        },
        {
            id: 'birth',
            emoji: '📅',
            title: 'Когда родился малыш?',
            desc: 'По этой дате мы будем рассчитывать возраст',
            type: 'input',
            inputType: 'date',
            key: 'birthDate'
        },
        {
            id: 'gestational',
            emoji: '🤰',
            title: 'На каком сроке родился малыш?',
            desc: 'Срок беременности считают в неделях и днях. Если не знаете — отметьте "Не знаю".',
            type: 'gestational',
            key: 'gestational'
        },
        {
            id: 'feeding_type',
            emoji: '🍼',
            title: 'Как малыш получает молоко?',
            desc: '',
            type: 'choice',
            options: ['Грудное вскармливание', 'Искусственное вскармливание', 'Смешанное вскармливание'],
            values: ['breast', 'formula', 'mixed'],
            key: 'feedingType'
        },
        {
            id: 'started',
            emoji: '🌱',
            title: 'Начал ли ребёнок прикорм?',
            desc: '',
            type: 'choice',
            options: ['Да', 'Нет'],
            key: 'feedingStarted',
            extra: 'start-date-field'
        },
        {
            id: 'approach',
            emoji: '🥄',
            title: 'Какой подход к прикорму вам ближе?',
            desc: 'Это предпочтение, а не строгое правило',
            type: 'choice',
            options: ['Пюре', 'BLW', 'Комбинированный', 'Пока не знаю'],
            key: 'approach'
        },
        {
            id: 'readiness',
            emoji: '🧸',
            title: 'Признаки готовности к прикорму',
            desc: 'Оцените каждый навык. Это поможет понять, что уже сформировано, а что ещё развивается.',
            type: 'readiness_checkboxes',
            key: 'readiness',
            questions: [
                {
                    label: 'Контроль головы и шеи – малыш уверенно удерживает голову и шею?',
                    id: 'headControl',
                    options: ['Уверенно', 'Иногда теряет положение', 'Пока не удерживает', 'Не уверена']
                },
                {
                    label: 'Положение тела – может ли малыш находиться в достаточно вертикальном положении с хорошей поддержкой туловища?',
                    id: 'bodyPosition',
                    options: ['Да, устойчиво', 'С поддержкой, но иногда заваливается', 'Пока нет', 'Не уверена']
                },
                {
                    label: 'Интерес к еде – проявляет ли малыш интерес к еде, тянется к ней?',
                    id: 'foodInterest',
                    options: ['Да', 'Иногда', 'Нет', 'Не уверена']
                },
                {
                    label: 'Открывание рта – открывает ли малыш рот, когда ему предлагают еду?',
                    id: 'opensMouth',
                    options: ['Да', 'Иногда', 'Нет', 'Не уверена']
                },
                {
                    label: 'Приём и проглатывание пищи – если малыш уже пробовал небольшое количество пищи, что обычно происходит?',
                    id: 'foodHandling',
                    options: [
                        'Спокойно принимает и проглатывает',
                        'Иногда выталкивает языком',
                        'Почти всегда выталкивает пищу',
                        'Кашляет/давится при попытке еды',
                        'Пока не пробовал',
                        'Не уверена'
                    ]
                }
            ]
        },
        {
            id: 'feeding_problems',
            emoji: '🩺',
            title: 'Были ли у малыша выраженные проблемы с кормлением?',
            desc: 'Отметьте всё, что наблюдали',
            type: 'checkboxes',
            options: FEEDING_PROBLEMS_OPTIONS,
            key: 'feedingProblems'
        },
        {
            id: 'allergies',
            emoji: '⚠️',
            title: 'Есть ли у малыша известные пищевые аллергии?',
            desc: 'Отметьте только то, что уже известно',
            type: 'checkboxes',
            options: [...ALLERGENS_LIST, 'Нет известных пищевых аллергий', 'Не знаю'],
            key: 'allergies'
        },
        {
            id: 'diet',
            emoji: '🥗',
            title: 'Есть ли особенности питания?',
            desc: 'Например, назначенная врачом диета или ограничения',
            type: 'checkboxes',
            options: DIET_OPTIONS,
            key: 'diet'
        },
        {
            id: 'favorites',
            emoji: '🍎',
            title: 'Какие продукты вам было бы интересно готовить малышу?',
            desc: 'Это ваши предпочтения, а не обязательный план',
            type: 'checkboxes',
            options: FAVORITE_FOODS,
            key: 'favoriteFoods'
        },
        {
            id: 'worries',
            emoji: '💛',
            title: 'Что вас больше всего беспокоит?',
            desc: 'Можно выбрать несколько вариантов',
            type: 'checkboxes',
            options: WORRY_OPTIONS,
            key: 'worries'
        },
        {
            id: 'confidence',
            emoji: '💪',
            title: 'Насколько уверенно вы чувствуете себя в вопросах прикорма?',
            desc: '',
            type: 'choice',
            options: ['Нервничаю', 'Растеряна', 'Уверена', 'Очень уверена'],
            key: 'confidence'
        }
    ];

    // ============================================================
    // 3. СОСТОЯНИЕ ONBOARDING
    // ============================================================

    let currentStep = 0;
    let tempData = {};
    let targetChildId = null;

    // ============================================================
    // 4. УТИЛИТЫ
    // ============================================================

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getState() {
        return window.STATE || {};
    }

    function getTargetChild() {
        const state = getState();
        const id = targetChildId || state._onboardingChildId || state.currentChildId;
        if (!id) return null;
        const children = Array.isArray(state.children) ? state.children : [];
        return children.find(child => child.id === id) || null;
    }

    // ============================================================
    // 5. МЕДИЦИНСКАЯ ЛОГИКА (ВСТРОЕННАЯ)
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

    function evaluateReadiness(childData) {
        const {
            birthDate,
            gestationalAgeWeeks,
            birthTermCategory,
            readiness: rawReadiness,
            feedingProblems = [],
        } = childData;

        const age = calculateAge(birthDate);
        const chronologicalMonths = age.months;
        const chronologicalDays = age.days;

        let safeWeeks = 40;
        if (typeof gestationalAgeWeeks === 'number' && gestationalAgeWeeks >= 20 && gestationalAgeWeeks <= 43) {
            safeWeeks = gestationalAgeWeeks;
        }
        const termCategory = birthTermCategory || 'unknown';
        const isPreterm = termCategory === 'preterm' || (safeWeeks < 37);
        const correctedAgeMonths = calculateCorrectedAge(chronologicalMonths, safeWeeks);

        const parsed = parseReadinessAnswers(rawReadiness || {});
        const {
            headControl = 'unknown',
            bodyPosition = 'unknown',
            foodInterest = 'unknown',
            opensMouth = 'unknown',
            foodHandling = 'unknown'
        } = parsed;

        const keySkills = {
            headControl: headControl === 'yes',
            bodyPosition: bodyPosition === 'yes' || bodyPosition === 'partial',
            safeSwallowing: foodHandling === 'Спокойно принимает и проглатывает' || foodHandling === 'Иногда выталкивает языком'
        };
        const hasKeySkills = keySkills.headControl && keySkills.bodyPosition && keySkills.safeSwallowing;

        const seriousProblems = feedingProblems.some(p =>
            p === 'Часто давится/кашляет во время кормления' ||
            p === 'Есть проблемы с глотанием' ||
            p === 'Есть выраженные трудности с кормлением'
        );

        let overallStatus = 'unknown';
        let overallMessage = '';
        let overallRecommendation = '';

        if (chronologicalMonths < 4) {
            overallStatus = 'too_young';
            overallMessage = '🔵 Возраст пока очень маленький';
            overallRecommendation = 'Прикорм в таком возрасте обычно не начинают. Продолжайте наблюдать за развитием.';
        } else if (seriousProblems) {
            overallStatus = 'needs_review';
            overallMessage = '🟠 Нужна консультация специалиста';
            overallRecommendation = 'В анкете отмечены особенности кормления, которые важно обсудить с педиатром.';
        } else {
            const ageReady = chronologicalMonths >= 6;
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
            } else if (chronologicalMonths >= 4 && chronologicalMonths < 6) {
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

        if (isPreterm && overallStatus !== 'needs_review' && overallStatus !== 'too_young') {
            overallMessage += ' (учтена недоношенность)';
            overallRecommendation = 'Для недоношенных детей особенно важно учитывать развитие. ' + overallRecommendation;
        }

        return {
            ageBlock: {
                chronologicalMonths: chronologicalMonths,
                chronologicalDays: chronologicalDays,
                correctedMonths: isPreterm ? correctedAgeMonths : null,
                isPreterm: isPreterm
            },
            termBlock: {
                category: termCategory,
                label: getTermLabel(termCategory),
                weeks: safeWeeks
            },
            readinessBlock: {
                headControl: headControl,
                bodyPosition: bodyPosition,
                foodInterest: foodInterest,
                opensMouth: opensMouth,
                foodHandling: foodHandling,
                keySkills: keySkills,
                hasKeySkills: hasKeySkills
            },
            safetyBlock: {
                hasFeedingProblems: feedingProblems.length > 0,
                seriousProblems: seriousProblems,
                problemsList: feedingProblems.filter(p => p !== 'Нет' && p !== 'Не уверена')
            },
            overallStatus: overallStatus,
            overallMessage: overallMessage,
            overallRecommendation: overallRecommendation,
            originalReadiness: rawReadiness || {}
        };
    }

    // ============================================================
    // 6. ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений)
    // ============================================================

    function saveCurrentStep() {
        const step = STEPS[currentStep];
        if (!step) return;

        if (step.type === 'input') {
            const input = document.getElementById('onboarding-input');
            if (input) tempData[step.key] = input.value.trim();
            return;
        }

        if (step.type === 'choice') {
            const selected = document.querySelector(`.btn-group button[data-choice="${step.key}"].primary`);
            if (selected) tempData[step.key] = selected.dataset.value;
            if (step.key === 'feedingStarted') {
                const started = tempData.feedingStarted === 'Да';
                const dateInput = document.getElementById('onboarding-start-date');
                if (started && dateInput) tempData.feedingStartDate = dateInput.value || '';
                else if (!started) tempData.feedingStartDate = '';
            }
            return;
        }

        if (step.type === 'checkboxes' || step.type === 'readiness_checkboxes') {
            if (step.type === 'readiness_checkboxes') {
                const readiness = {};
                const questions = step.questions || [];
                questions.forEach(q => {
                    const selected = document.querySelector(`input[name="readiness_${q.id}"]:checked`);
                    readiness[q.id] = selected ? selected.value : 'Не выбрано';
                });
                tempData.readiness = readiness;
                return;
            }

            const checks = document.querySelectorAll('.step-checkbox:checked');
            const values = Array.from(checks).map(el => el.value);
            tempData[step.key] = values;
            return;
        }

        if (step.type === 'gestational') {
            const weeks = document.getElementById('gestational-weeks')?.value;
            const days = document.getElementById('gestational-days')?.value;
            const unknown = document.getElementById('gestational-unknown')?.checked || false;
            tempData.gestationalWeeks = weeks !== '' ? parseInt(weeks, 10) : '';
            tempData.gestationalDays = days !== '' ? parseInt(days, 10) : '';
            tempData.gestationalUnknown = unknown;
        }
    }

    function renderStep() {
        const step = STEPS[currentStep];
        if (!step) return '';

        const child = getTargetChild();
        if (!child) {
            return `
                <div class="onboarding">
                    <div class="emoji-big">👶</div>
                    <h1>Ребёнок не найден</h1>
                    <p>Не удалось определить малыша для этого онбординга.</p>
                    <button class="primary-button" data-action="navigate" data-screen="baby" type="button">Вернуться к малышам</button>
                </div>
            `;
        }

        const birthDate = tempData.birthDate || child.birthDate;
        const age = calculateAge(birthDate);
        const ageMonths = age.months;
        const progress = ((currentStep + 1) / STEPS.length * 100).toFixed(0);

        let html = `<div class="onboarding">`;

        html += `
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progress}%;"></div>
                <span class="progress-label">${currentStep + 1} / ${STEPS.length}</span>
            </div>
        `;

        html += `
            <div class="step-emoji">${step.emoji}</div>
            <h1 class="step-title">${escapeHtml(step.title)}</h1>
            ${step.desc ? `<p class="step-desc">${escapeHtml(step.desc)}</p>` : ''}
        `;

        if (step.type === 'input') {
            const value = tempData[step.key] !== undefined ? tempData[step.key] : (child[step.key] || '');
            html += `
                <div class="input-group">
                    <input type="${step.inputType}" id="onboarding-input" class="onboarding-input" placeholder="${escapeHtml(step.placeholder || '')}" value="${escapeHtml(value)}" autocomplete="${step.key === 'name' ? 'name' : 'off'}">
                </div>
            `;
            if (step.skipable) {
                html += `<button class="skip-button" data-action="skip-step" type="button">Пропустить →</button>`;
            }
        }

        if (step.type === 'choice') {
            html += `<div class="btn-group" role="group">`;
            step.options.forEach((option, index) => {
                let currentValue = tempData[step.key] !== undefined ? tempData[step.key] : '';
                if (!currentValue && step.key === 'feedingType') {
                    const existing = child.feedingType;
                    const reverse = { breast: 'Грудное вскармливание', formula: 'Искусственное вскармливание', mixed: 'Смешанное вскармливание' };
                    currentValue = reverse[existing] || '';
                }
                if (!currentValue && step.key === 'feedingStarted') {
                    currentValue = child.feedingStarted ? 'Да' : '';
                }
                if (!currentValue && child[step.key]) {
                    currentValue = child[step.key];
                }
                const value = step.values ? step.values[index] : option;
                const selected = currentValue === option || currentValue === value;
                html += `
                    <button class="choice-btn ${selected ? 'primary' : ''}" data-value="${escapeHtml(option)}" data-choice="${escapeHtml(step.key)}" type="button">
                        ${escapeHtml(option)}
                    </button>
                `;
            });
            html += `</div>`;

            if (step.extra === 'start-date-field') {
                const started = tempData.feedingStarted !== undefined ? tempData.feedingStarted : (child.feedingStarted ? 'Да' : '');
                const startDate = tempData.feedingStartDate !== undefined ? tempData.feedingStartDate : (child.feedingStartDate || '');
                html += `
                    <div id="start-date-field" style="display:${started === 'Да' ? 'block' : 'none'}; margin-top:16px;">
                        <label>Дата начала прикорма</label>
                        <input type="date" id="onboarding-start-date" value="${escapeHtml(startDate)}">
                    </div>
                `;
            }

            if (step.id === 'started' && tempData.feedingStarted === 'Да' && ageMonths < 4) {
                html += `
                    <div class="warning-box">
                        ⚠️ <strong>Прикорм уже начат раньше обычного возрастного диапазона</strong>
                        <p>Если прикорм был назначен врачом по индивидуальным показаниям, следуйте этому плану. Если решение было принято самостоятельно, обсудите ситуацию с педиатром.</p>
                    </div>
                `;
            } else if (step.id === 'started' && tempData.feedingStarted === 'Да' && ageMonths >= 4 && ageMonths < 6) {
                html += `
                    <div class="info-box">
                        🌱 <strong>Прикорм уже начат</strong>
                        <p>Вы начали прикорм до основного возрастного ориентира около 6 месяцев. Если вы начали после обсуждения с педиатром, продолжайте следовать индивидуальным рекомендациям.</p>
                    </div>
                `;
            }
        }

        if (step.type === 'gestational') {
            const weeks = tempData.gestationalWeeks !== undefined ? tempData.gestationalWeeks : (child.gestationalAgeWeeks ?? '');
            const days = tempData.gestationalDays !== undefined ? tempData.gestationalDays : (child.gestationalAgeDays ?? '');
            const unknown = tempData.gestationalUnknown !== undefined ? tempData.gestationalUnknown : (child.birthTermCategory === 'unknown');
            html += `
                <div class="gestational-group">
                    <div class="gestational-row">
                        <label>
                            Недели
                            <input type="number" id="gestational-weeks" min="20" max="43" value="${escapeHtml(weeks)}" placeholder="39">
                        </label>
                        <label>
                            Дни
                            <input type="number" id="gestational-days" min="0" max="6" value="${escapeHtml(days)}" placeholder="0">
                        </label>
                    </div>
                    <label class="checkbox-label">
                        <input type="checkbox" id="gestational-unknown" ${unknown ? 'checked' : ''}>
                        Не знаю
                    </label>
                    <small class="hint">Например: 39 недель 2 дня. Если срок неизвестен — это нормально.</small>
                </div>
            `;
            if (!unknown && weeks !== '') {
                const cat = getBirthTermCategory(weeks, days);
                const msg = getTermLabel(cat);
                if (cat !== 'unknown') {
                    html += `
                        <div class="info-box">
                            ${escapeHtml(msg)}
                        </div>
                    `;
                }
            }
        }

        if (step.type === 'checkboxes') {
            let selected = tempData[step.key] !== undefined ? tempData[step.key] : (child.onboarding?.[step.key] || []);
            if (!Array.isArray(selected)) selected = [];
            html += `<div class="checkbox-group">`;
            step.options.forEach(option => {
                const checked = selected.includes(option);
                html += `
                    <label class="checkbox-label">
                        <input type="checkbox" class="step-checkbox" value="${escapeHtml(option)}" ${checked ? 'checked' : ''}>
                        ${escapeHtml(option)}
                    </label>
                `;
            });
            html += `</div>`;
        }

        if (step.type === 'readiness_checkboxes') {
            const readiness = tempData.readiness || {};
            const questions = step.questions || [];
            html += `<div class="readiness-group">`;
            questions.forEach(q => {
                const selected = readiness[q.id] || '';
                html += `
                    <div class="readiness-item">
                        <p class="readiness-question">${escapeHtml(q.label)}</p>
                        <div class="readiness-options">
                            ${q.options.map(opt => `
                                <label class="radio-label">
                                    <input type="radio" name="readiness_${q.id}" value="${escapeHtml(opt)}" ${selected === opt ? 'checked' : ''}>
                                    ${escapeHtml(opt)}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        html += `<div class="nav-buttons">`;
        if (currentStep > 0) {
            html += `<button class="prev-btn" data-action="prev-step" type="button">← Назад</button>`;
        } else {
            html += `<div></div>`;
        }
        if (currentStep < STEPS.length - 1) {
            html += `<button class="next-btn" data-action="next-step" type="button">Далее →</button>`;
        } else {
            html += `<button class="finish-btn" data-action="finish-onboarding" type="button">🚀 Посмотреть результат</button>`;
        }
        html += `</div>`;
        html += `</div>`;

        return html;
    }

    window.renderOnboarding = function() {
        const state = getState();
        if (!targetChildId) {
            targetChildId = state._onboardingChildId || state.currentChildId || null;
            if (!targetChildId && Array.isArray(state.children) && state.children.length > 0) {
                targetChildId = state.children[0].id;
            }
        }
        return renderStep();
    };

    function refreshOnboarding() {
        if (typeof render === 'function') render('onboarding');
    }

    document.addEventListener('click', function(event) {
        const choiceBtn = event.target.closest('.choice-btn[data-choice]');
        if (!choiceBtn) return;
        const key = choiceBtn.dataset.choice;
        const value = choiceBtn.dataset.value;
        tempData[key] = value;
        refreshOnboarding();
    });

    document.addEventListener('click', function(event) {
        const checkbox = event.target.closest('.step-checkbox');
        if (!checkbox) return;
        const step = STEPS[currentStep];
        if (!step || step.type !== 'checkboxes') return;
        setTimeout(function() {
            const allChecks = document.querySelectorAll('.step-checkbox');
            const checkedValues = Array.from(allChecks).filter(cb => cb.checked).map(cb => cb.value);
            const noOptions = ['Нет', 'Нет известных пищевых аллергий', 'Не знаю'];
            const hasNo = step.options.some(opt => noOptions.includes(opt));
            if (hasNo) {
                if (checkedValues.some(v => noOptions.includes(v))) {
                    allChecks.forEach(cb => {
                        if (!noOptions.includes(cb.value)) cb.checked = false;
                    });
                } else if (checkedValues.some(v => !noOptions.includes(v))) {
                    allChecks.forEach(cb => {
                        if (noOptions.includes(cb.value)) cb.checked = false;
                    });
                }
            }
            const finalValues = Array.from(document.querySelectorAll('.step-checkbox:checked')).map(cb => cb.value);
            tempData[step.key] = finalValues;
            refreshOnboarding();
        }, 0);
    });

    document.addEventListener('change', function(event) {
        const radio = event.target.closest('input[type="radio"][name^="readiness_"]');
        if (radio) {
            const step = STEPS[currentStep];
            if (!step || step.type !== 'readiness_checkboxes') return;
            const questions = step.questions || [];
            const readiness = {};
            questions.forEach(q => {
                const input = document.querySelector(`input[name="readiness_${q.id}"]:checked`);
                readiness[q.id] = input ? input.value : 'Не выбрано';
            });
            tempData.readiness = readiness;
            refreshOnboarding();
            return;
        }
    });

    document.addEventListener('click', function(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        if (!['next-step', 'prev-step', 'skip-step', 'finish-onboarding'].includes(action)) return;
        const onboarding = document.querySelector('.onboarding');
        if (!onboarding) return;
        const step = STEPS[currentStep];
        if (!step) return;
        saveCurrentStep();
        if (action === 'skip-step') {
            currentStep++;
            if (currentStep >= STEPS.length) currentStep = STEPS.length - 1;
            refreshOnboarding();
            return;
        }
        if (action === 'prev-step') {
            if (currentStep > 0) currentStep--;
            refreshOnboarding();
            return;
        }
        if (action === 'next-step') {
            currentStep++;
            if (currentStep >= STEPS.length) currentStep = STEPS.length - 1;
            refreshOnboarding();
            return;
        }
        if (action === 'finish-onboarding') {
            finishOnboardingAndShowResult();
        }
    });

    function finishOnboardingAndShowResult() {
        const state = getState();
        if (!targetChildId) {
            targetChildId = state._onboardingChildId || state.currentChildId || null;
            if (!targetChildId && Array.isArray(state.children) && state.children.length > 0) {
                targetChildId = state.children[0].id;
            }
        }
        const child = getTargetChild();
        if (!child) {
            console.error('❌ onboarding: ребёнок не найден');
            return;
        }

        if (tempData.name !== undefined) child.name = tempData.name;
        if (tempData.birthDate !== undefined) child.birthDate = tempData.birthDate;
        if (tempData.feedingType !== undefined) {
            const map = {
                'Грудное вскармливание': 'breast',
                'Искусственное вскармливание': 'formula',
                'Смешанное вскармливание': 'mixed',
                'ГВ': 'breast',
                'ИВ': 'formula',
                'Смешанное': 'mixed'
            };
            child.feedingType = map[tempData.feedingType] || tempData.feedingType;
        }
        if (tempData.feedingStarted !== undefined) {
            child.feedingStarted = tempData.feedingStarted === 'Да';
        }
        if (tempData.feedingStartDate !== undefined) {
            child.feedingStartDate = tempData.feedingStartDate;
        }
        if (tempData.approach !== undefined) child.approach = tempData.approach;

        if (tempData.gestationalUnknown) {
            child.gestationalAgeWeeks = null;
            child.gestationalAgeDays = null;
            child.birthTermCategory = 'unknown';
        } else {
            const weeks = tempData.gestationalWeeks;
            const days = tempData.gestationalDays || 0;
            if (weeks !== '' && weeks !== undefined && weeks !== null) {
                const parsedWeeks = parseInt(weeks, 10);
                if (!isNaN(parsedWeeks) && parsedWeeks >= 20 && parsedWeeks <= 43) {
                    child.gestationalAgeWeeks = parsedWeeks;
                    child.gestationalAgeDays = parseInt(days, 10) || 0;
                    child.birthTermCategory = getBirthTermCategory(child.gestationalAgeWeeks, child.gestationalAgeDays);
                } else {
                    child.gestationalAgeWeeks = null;
                    child.gestationalAgeDays = null;
                    child.birthTermCategory = 'unknown';
                }
            } else {
                child.gestationalAgeWeeks = null;
                child.gestationalAgeDays = null;
                child.birthTermCategory = 'unknown';
            }
        }

        if (tempData.readiness !== undefined) child.readiness = tempData.readiness;
        if (tempData.feedingProblems !== undefined) child.feedingProblems = tempData.feedingProblems;
        if (!child.onboarding) child.onboarding = {};
        if (tempData.allergies !== undefined) child.onboarding.allergies = tempData.allergies;
        if (tempData.diet !== undefined) child.onboarding.diet = tempData.diet;
        if (tempData.favoriteFoods !== undefined) child.onboarding.favoriteFoods = tempData.favoriteFoods;
        if (tempData.worries !== undefined) child.onboarding.worries = tempData.worries;
        if (tempData.confidence !== undefined) child.onboarding.confidence = tempData.confidence;

        const age = calculateAge(child.birthDate);
        const correctedAge = calculateCorrectedAge(age.months, child.gestationalAgeWeeks || 40);
        child.correctedAgeMonths = Math.round(correctedAge * 10) / 10;

        // Вызываем встроенную оценку
        const assessment = evaluateReadiness(child);
        child.readinessAssessment = assessment;

        child.profileVersion = 2;
        child.onboarding.completedAt = new Date().toISOString();

        if (typeof saveState === 'function') saveState();

        showResultScreen(child, assessment);
    }

    function showResultScreen(child, assessment) {
        if (!assessment || typeof assessment !== 'object') {
            console.error('❌ Оценка не получена');
            const container = document.querySelector('.onboarding');
            if (container) {
                container.innerHTML = `
                    <div class="onboarding result-screen">
                        <div class="result-header">
                            <div class="result-emoji">⚠️</div>
                            <h1 class="result-title">Ошибка оценки</h1>
                            <p>Не удалось получить оценку готовности. Пожалуйста, попробуйте ещё раз.</p>
                        </div>
                        <div class="nav-buttons">
                            <button class="finish-btn" data-action="complete-onboarding" type="button">Перейти в приложение →</button>
                        </div>
                    </div>
                `;
                const btn = container.querySelector('[data-action="complete-onboarding"]');
                if (btn) btn.addEventListener('click', completeOnboarding);
            }
            return;
        }

        const {
            ageBlock = { chronologicalMonths: 0, chronologicalDays: 0, correctedMonths: null, isPreterm: false },
            termBlock = { category: 'unknown', label: 'Срок не указан', weeks: 40 },
            safetyBlock = { hasFeedingProblems: false, seriousProblems: false, problemsList: [] },
            overallStatus = 'unknown',
            overallMessage = '🔵 Данных недостаточно',
            overallRecommendation = 'Пожалуйста, проверьте подключение сервиса оценки.',
            originalReadiness = {}
        } = assessment;

        const chronologicalMonths = ageBlock.chronologicalMonths || 0;
        const correctedMonths = ageBlock.correctedMonths;
        const isPreterm = ageBlock.isPreterm || false;

        let ageText;
        if (isPreterm && correctedMonths !== null) {
            ageText = `${chronologicalMonths} мес (скорректированный ${correctedMonths.toFixed(1)} мес)`;
        } else if (isPreterm && correctedMonths === null) {
            ageText = `${chronologicalMonths} мес (скорректированный возраст не рассчитан)`;
        } else {
            ageText = `${chronologicalMonths} мес`;
        }

        const termText = termBlock.label + (termBlock.weeks ? ` (${termBlock.weeks} нед)` : '');

        const readinessItems = [
            { label: 'Контроль головы', value: originalReadiness.headControl || 'Не выбрано' },
            { label: 'Положение тела', value: originalReadiness.bodyPosition || 'Не выбрано' },
            { label: 'Интерес к еде', value: originalReadiness.foodInterest || 'Не выбрано' },
            { label: 'Открывает рот', value: originalReadiness.opensMouth || 'Не выбрано' },
            { label: 'Приём/глотание', value: originalReadiness.foodHandling || 'Не выбрано' }
        ];

        const statusColorMap = {
            'ready': 'green',
            'possible': 'yellow',
            'developing': 'yellow',
            'needs_review': 'orange',
            'too_young': 'blue',
            'not_yet': 'blue',
            'started_very_early': 'orange',
            'unknown': 'gray'
        };
        const statusColor = statusColorMap[overallStatus] || 'gray';

        let html = `
            <div class="onboarding result-screen">
                <div class="result-header">
                    <div class="result-emoji">🍼</div>
                    <h1 class="result-title">Оценка готовности к прикорму</h1>
                </div>
                <div class="result-card">
                    <div class="result-section">
                        <div class="section-icon">📅</div>
                        <div class="section-content">
                            <div class="section-label">Возраст</div>
                            <div class="section-value">${ageText}</div>
                            <div class="section-status ${isPreterm ? 'status-warning' : 'status-ok'}">
                                ${isPreterm ? '🟡 Скорректированный возраст учтён' : '🟢 Календарный возраст'}
                            </div>
                        </div>
                    </div>
                    <div class="result-section">
                        <div class="section-icon">👶</div>
                        <div class="section-content">
                            <div class="section-label">Срок рождения</div>
                            <div class="section-value">${termText}</div>
                            <div class="section-status ${termBlock.category === 'preterm' ? 'status-warning' : 'status-ok'}">
                                ${termBlock.category === 'preterm' ? '🟡 Недоношенный' : '🟢 Доношенный'}
                            </div>
                        </div>
                    </div>
                    <div class="result-section">
                        <div class="section-icon">🧠</div>
                        <div class="section-content">
                            <div class="section-label">Навыки</div>
                            <ul class="skill-list">
                                ${readinessItems.map(item => {
                                    const statusClass = getSkillStatusClass(item.value);
                                    const label = statusClass === 'ok' ? '🟢' : statusClass === 'partial' ? '🟡' : statusClass === 'no' ? '🔴' : '⚪';
                                    return `<li><span class="skill-badge ${statusClass}">${label}</span> ${item.label}: ${escapeHtml(item.value)}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                    ${safetyBlock.hasFeedingProblems ? `
                    <div class="result-section">
                        <div class="section-icon">🩺</div>
                        <div class="section-content">
                            <div class="section-label">Проблемы с кормлением</div>
                            <div class="section-status status-warning">🟠 Отмечены особенности</div>
                            <ul class="skill-list">
                                ${safetyBlock.problemsList.map(p => `<li>• ${escapeHtml(p)}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    ` : ''}
                    <div class="result-section result-overall">
                        <div class="section-icon">🥄</div>
                        <div class="section-content">
                            <div class="section-label">Итог</div>
                            <div class="overall-status status-${statusColor}">${overallMessage}</div>
                            <div class="overall-recommendation">${overallRecommendation}</div>
                        </div>
                    </div>
                </div>
                <div class="nav-buttons">
                    <button class="finish-btn" data-action="complete-onboarding" type="button">Перейти в приложение →</button>
                </div>
            </div>
        `;

        const container = document.querySelector('.onboarding');
        if (container) {
            container.innerHTML = html;
            const completeBtn = container.querySelector('[data-action="complete-onboarding"]');
            if (completeBtn) completeBtn.addEventListener('click', completeOnboarding);
        } else {
            const state = getState();
            state.ui = state.ui || {};
            state.ui.screen = 'home';
            if (typeof render === 'function') render('home');
        }
    }

    function getSkillStatusClass(value) {
        const positive = ['Уверенно', 'Да', 'Да, устойчиво', 'Спокойно принимает и проглатывает', 'Иногда выталкивает языком'];
        const partial = ['Иногда', 'С поддержкой, но иногда заваливается', 'Иногда теряет положение'];
        const negative = ['Нет', 'Пока не удерживает', 'Пока нет', 'Почти всегда выталкивает пищу', 'Кашляет/давится при попытке еды'];
        if (positive.includes(value)) return 'ok';
        if (partial.includes(value)) return 'partial';
        if (negative.includes(value)) return 'no';
        return 'unknown';
    }

    function completeOnboarding() {
        const state = getState();
        const child = getTargetChild();
        if (!child) {
            console.error('❌ onboarding: ребёнок не найден при завершении');
            return;
        }
        state.currentChildId = child.id;
        state._onboardingChildId = null;
        state._onboardingMode = null;
        if (state.children.length === 1 && state.onboardingCompleted === false) {
            state.onboardingCompleted = true;
        }
        state.ui = state.ui || {};
        state.navigation = state.navigation || {};
        state.ui.screen = 'home';
        state.navigation.currentScreen = 'home';
        if (typeof saveState === 'function') saveState();
        currentStep = 0;
        tempData = {};
        targetChildId = null;
        if (typeof render === 'function') render('home');
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        console.log('✅ onboarding завершён, переход на Home');
    }

    document.addEventListener('click', function(event) {
        const target = event.target.closest('[data-action="complete-onboarding"]');
        if (target) completeOnboarding();
    });

    console.log('✅ onboarding.js загружен – ФИНАЛЬНАЯ ВЕРСИЯ С ВСТРОЕННОЙ ЛОГИКОЙ');
})();