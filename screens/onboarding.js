// screens/onboarding.js
(function () {
    'use strict';

    /*
     * PRIKORM.BOT — ONBOARDING
     * Версия 2.1 (исправления по замечаниям)
     */

    // ============================================================
    // СПРАВОЧНИКИ
    // ============================================================

    const ALLERGENS_LIST = [
        'Яйцо',
        'Арахис',
        'Орехи',
        'Рыба',
        'Моллюски',
        'Пшеница',
        'Соя',
        'Кунжут',
        'Молочные продукты'
    ];

    const DIET_OPTIONS = [
        'Нет особенностей',
        'Без молочных продуктов',
        'Без глютена',
        'Другая специальная диета'
    ];

    const FAVORITE_FOODS = [
        'Овощи',
        'Фрукты',
        'Каши и злаки',
        'Мясо',
        'Рыба',
        'Яйцо',
        'Молочные продукты',
        'Пока не знаю'
    ];

    const WORRY_OPTIONS = [
        'Удушье и попёрхивание',
        'Аллергические реакции',
        'Ребёнок отказывается от еды',
        'Не понимаю, с чего начать',
        'Боюсь дать слишком много',
        'Боюсь дать слишком рано',
        'Переживаю из-за железа и питательных веществ',
        'Не понимаю, какие продукты выбирать'
    ];

    // ============================================================
    // ШАГИ ОНБОРДИНГА
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
            desc: 'По этой дате мы рассчитаем возраст',
            type: 'input',
            inputType: 'date',
            key: 'birthDate'
        },
        {
            id: 'gestational',
            emoji: '🤰',
            title: 'На каком сроке родился малыш?',
            desc: 'Это поможет точнее учитывать особенности ребёнка',
            type: 'gestational',
            key: 'gestational'
        },
        {
            id: 'feeding_type',
            emoji: '🍼',
            title: 'Как малыш получает молоко?',
            desc: 'Можно изменить позже',
            type: 'choice',
            options: [
                'Грудное молоко',
                'Смесь',
                'Грудное молоко + смесь'
            ],
            values: [
                'breast',
                'formula',
                'mixed'
            ],
            key: 'feedingType'
        },
        {
            id: 'started',
            emoji: '🌱',
            title: 'Вы уже начали прикорм?',
            desc: '',
            type: 'choice',
            options: [
                'Да',
                'Нет'
            ],
            key: 'feedingStarted',
            extra: 'start-date-field'
        },
        {
            id: 'approach',
            emoji: '🥄',
            title: 'Какой способ вам ближе?',
            desc: 'Это предпочтение, а не обязательный выбор',
            type: 'choice',
            options: [
                'Пюре',
                'BLW',
                'Комбинированный',
                'Пока не знаю'
            ],
            key: 'approach'
        },
        {
            id: 'readiness',
            emoji: '🧸',
            title: 'Проверим признаки готовности',
            desc: 'Отметьте всё, что действительно наблюдаете',
            type: 'checkboxes',
            options: [
                'Уверенно держит голову и шею',
                'Может сидеть с поддержкой и сохранять положение тела',
                'Может удерживать пищу во рту и проглатывать её',
                'Открывает рот, когда предлагают еду',
                'Тянется к еде или проявляет интерес к еде',
                'Берёт предметы и подносит их ко рту',
                'Не уверена / не знаю'
            ],
            key: 'readiness',
            mapping: {
                'Уверенно держит голову и шею': 'headControl',
                'Может сидеть с поддержкой и сохранять положение тела': 'sitSupport',
                'Может удерживать пищу во рту и проглатывать её': 'swallowing',
                'Открывает рот, когда предлагают еду': 'opensMouth',
                'Тянется к еде или проявляет интерес к еде': 'foodInterest',
                'Берёт предметы и подносит их ко рту': 'bringsObjectsToMouth',
                'Не уверена / не знаю': 'notSure'
            }
        },
        {
            id: 'allergies',
            emoji: '⚠️',
            title: 'Есть ли у малыша известные аллергии?',
            desc: 'Отметьте только то, что уже известно',
            type: 'checkboxes',
            options: [
                ...ALLERGENS_LIST,
                'Нет известных аллергий',
                'Не знаю'
            ],
            key: 'allergies'
        },
        {
            id: 'diet',
            emoji: '🥗',
            title: 'Есть ли особенности питания?',
            desc: 'Например, уже назначенная врачом диета',
            type: 'checkboxes',
            options: [
                ...DIET_OPTIONS,
                'Не знаю'
            ],
            key: 'diet'
        },
        {
            id: 'favorites',
            emoji: '🍎',
            title: 'Что вам хотелось бы попробовать?',
            desc: 'Это ваши предпочтения — приложение не считает их обязательным планом прикорма',
            type: 'checkboxes',
            options: [
                ...FAVORITE_FOODS
            ],
            key: 'favoriteFoods'
        },
        {
            id: 'worries',
            emoji: '💛',
            title: 'Что вас сейчас больше всего беспокоит?',
            desc: 'Можно выбрать несколько вариантов',
            type: 'checkboxes',
            options: WORRY_OPTIONS,
            key: 'worries'
        },
        {
            id: 'confidence',
            emoji: '💪',
            title: 'Насколько уверенно вы чувствуете себя?',
            desc: '',
            type: 'choice',
            options: [
                'Очень переживаю',
                'Немного растеряна',
                'В целом уверена',
                'Полностью уверена'
            ],
            key: 'confidence'
        }
    ];

    // ============================================================
    // СОСТОЯНИЕ ONBOARDING
    // ============================================================

    let currentStep = 0;
    let tempData = {};
    let targetChildId = null;
    let ageMonths = 0; // будем хранить актуальный возраст

    // ============================================================
    // УТИЛИТЫ
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
        if (!id) {
            console.error('❌ onboarding: child id не найден');
            return null;
        }
        const children = Array.isArray(state.children) ? state.children : [];
        return children.find(child => child.id === id) || null;
    }

    function calculateAge(birthDate) {
        if (!birthDate) {
            return { months: 0, days: 0 };
        }
        const birth = new Date(birthDate);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        const safeMonths = Math.max(0, months);
        return {
            months: safeMonths,
            days: Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))
        };
    }

    // ============================================================
    // СРОК РОЖДЕНИЯ
    // ============================================================

    function getBirthTermCategory(weeks, days) {
        if (weeks === '' || weeks === null || weeks === undefined) {
            return 'unknown';
        }
        const totalDays = parseInt(weeks, 10) * 7 + (parseInt(days, 10) || 0);
        if (totalDays < 259) return 'preterm';
        if (totalDays < 273) return 'early_term';
        if (totalDays < 287) return 'full_term';
        if (totalDays < 294) return 'late_term';
        return 'post_term';
    }

    // ============================================================
    // ОЦЕНКА ГОТОВНОСТИ
    // ============================================================

    function assessReadiness(readiness, ageMonths, birthTermCategory) {
        if (!readiness || typeof readiness !== 'object') {
            return { status: 'unknown', reason: 'no_data' };
        }
        if (readiness.notSure) {
            return { status: 'unknown', reason: 'parent_not_sure' };
        }
        const headControl = !!readiness.headControl;
        const swallowing = !!readiness.swallowing;
        const sitSupport = !!readiness.sitSupport;
        const foodInterest = !!readiness.foodInterest;
        const opensMouth = !!readiness.opensMouth;

        const coreCount = [headControl, swallowing, sitSupport].filter(Boolean).length;
        const additionalCount = [foodInterest, opensMouth].filter(Boolean).length;

        if (ageMonths < 4) {
            return {
                status: 'too_early',
                reason: 'age_under_4_months',
                coreCount,
                additionalCount,
                message: 'Малышу меньше 4 месяцев. Обычно прикорм начинают с 6 месяцев. Пока можно наблюдать и готовиться.'
            };
        }
        if (coreCount >= 2 && additionalCount >= 1) {
            if (birthTermCategory === 'preterm') {
                return {
                    status: 'needs_pediatrician_review',
                    reason: 'preterm_with_readiness_signs',
                    coreCount,
                    additionalCount,
                    message: 'Вы отметили признаки готовности, но ребёнок родился недоношенным. Рекомендуем обсудить начало прикорма с педиатром.'
                };
            }
            if (ageMonths >= 6) {
                return {
                    status: 'ready',
                    reason: 'age_and_readiness',
                    coreCount,
                    additionalCount,
                    message: 'Возраст подходит, и вы отметили признаки готовности. Можно начинать знакомство с прикормом!'
                };
            }
            return {
                status: 'likely_ready',
                reason: 'readiness_before_6_months',
                coreCount,
                additionalCount,
                message: 'Вы отметили признаки готовности, но возраст ещё не достиг 6 месяцев. Если вы планируете начать прикорм раньше, обсудите это с педиатром.'
            };
        }
        return {
            status: 'not_yet',
            reason: 'insufficient_readiness_signs',
            coreCount,
            additionalCount,
            message: 'Пока отмечено недостаточно признаков готовности. Продолжайте наблюдать за малышом.'
        };
    }

    // ============================================================
    // СОХРАНЕНИЕ ТЕКУЩЕГО ШАГА
    // ============================================================

    function saveCurrentStep() {
        const step = STEPS[currentStep];
        if (!step) return;

        // INPUT
        if (step.type === 'input') {
            const input = document.getElementById('onboarding-input');
            if (input) tempData[step.key] = input.value.trim();
            return;
        }

        // CHOICE
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

        // CHECKBOXES
        if (step.type === 'checkboxes') {
            const checks = document.querySelectorAll('.step-checkbox:checked');
            const values = Array.from(checks).map(el => el.value);
            if (step.key === 'readiness') {
                const mapping = step.mapping || {};
                const readiness = {};
                Object.keys(mapping).forEach(label => { readiness[mapping[label]] = false; });
                values.forEach(value => {
                    const key = mapping[value];
                    if (key) readiness[key] = true;
                });
                tempData.readiness = readiness;
            } else {
                // Сохраняем ВСЕ выбранные, включая "Не знаю", "Нет" и т.д.
                tempData[step.key] = values;
            }
            return;
        }

        // GESTATIONAL
        if (step.type === 'gestational') {
            const weeks = document.getElementById('gestational-weeks')?.value;
            const days = document.getElementById('gestational-days')?.value;
            const unknown = document.getElementById('gestational-unknown')?.checked || false;
            tempData.gestationalWeeks = weeks !== '' ? parseInt(weeks, 10) : '';
            tempData.gestationalDays = days !== '' ? parseInt(days, 10) : '';
            tempData.gestationalUnknown = unknown;
        }
    }

    // ============================================================
    // РЕНДЕР
    // ============================================================

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

        // Вычисляем возраст для текущего шага (если есть дата рождения)
        if (tempData.birthDate) {
            ageMonths = calculateAge(tempData.birthDate).months;
        } else if (child.birthDate) {
            ageMonths = calculateAge(child.birthDate).months;
        } else {
            ageMonths = 0;
        }

        let html = `<div class="onboarding">`;

        // Прогресс
        html += `<div class="step-indicators" aria-label="Прогресс онбординга">`;
        for (let i = 0; i < STEPS.length; i++) {
            html += `<span class="${i === currentStep ? 'active' : ''}"></span>`;
        }
        html += `</div>`;

        html += `
            <div class="emoji-big">${step.emoji}</div>
            <h1>${escapeHtml(step.title)}</h1>
            ${step.desc ? `<p>${escapeHtml(step.desc)}</p>` : ''}
        `;

        // --------------------------------------------------------
        // СПЕЦИАЛЬНАЯ ОБРАБОТКА: если возраст < 4 мес и шаг "started"
        // --------------------------------------------------------
        if (step.id === 'started' && ageMonths < 4) {
            html += `
                <div style="background:#f0f4ff; padding:16px; border-radius:8px; margin:12px 0;">
                    <p style="margin:0; color:#1a3a5c;">
                        🌱 Малышу меньше 4 месяцев. Обычно прикорм рекомендуют начинать с 6 месяцев. 
                        Пока вы можете наблюдать за готовностью, а мы подскажем, когда будет подходящее время.
                    </p>
                </div>
                <p style="color:#666; font-size:0.9rem;">Этот вопрос будет пропущен, так как сейчас слишком рано для прикорма.</p>
            `;
            // Пропускаем вопрос – просто кнопка Далее
            // Но мы не сохраняем ответ, он будет проигнорирован.
            // Вместо этого мы можем автоматически установить feedingStarted = false
            tempData.feedingStarted = 'Нет';
            tempData.feedingStartDate = '';
        } else if (step.type === 'input') {
            // обычный input
            const value = tempData[step.key] !== undefined ? tempData[step.key] : (child[step.key] || '');
            html += `
                <input type="${step.inputType}" id="onboarding-input" placeholder="${escapeHtml(step.placeholder || '')}" value="${escapeHtml(value)}" autocomplete="${step.key === 'name' ? 'name' : 'off'}">
            `;
            if (step.skipable) {
                html += `<button class="skip" data-action="skip-step" type="button">Пропустить →</button>`;
            }
        } else if (step.type === 'choice') {
            // choice
            html += `<div class="btn-group" role="group">`;
            step.options.forEach((option, index) => {
                let currentValue = tempData[step.key] !== undefined ? tempData[step.key] : '';
                if (!currentValue && step.key === 'feedingType') {
                    const existing = child.feedingType;
                    const reverse = { breast: 'Грудное молоко', formula: 'Смесь', mixed: 'Грудное молоко + смесь' };
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
                    <button class="${selected ? 'primary' : ''}" data-value="${escapeHtml(option)}" data-choice="${escapeHtml(step.key)}" type="button">
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
        } else if (step.type === 'checkboxes') {
            // checkboxes
            let selected = tempData[step.key] !== undefined ? tempData[step.key] : (child.onboarding?.[step.key] || []);
            if (step.key === 'readiness' && selected && !Array.isArray(selected)) {
                const mapping = step.mapping || {};
                selected = Object.keys(mapping).filter(label => selected[mapping[label]]);
            }
            if (!Array.isArray(selected)) selected = [];

            html += `<div class="btn-group" style="flex-direction:column; gap:8px;">`;
            step.options.forEach(option => {
                const checked = selected.includes(option);
                html += `
                    <label>
                        <input type="checkbox" class="step-checkbox" value="${escapeHtml(option)}" ${checked ? 'checked' : ''}>
                        ${escapeHtml(option)}
                    </label>
                `;
            });
            html += `</div>`;

            // Для readiness – показываем оценку
            if (step.key === 'readiness' && tempData.readiness) {
                const assessment = assessReadiness(
                    tempData.readiness,
                    ageMonths,
                    child.birthTermCategory || 'unknown'
                );
                if (assessment.message) {
                    html += `
                        <div style="background:#f0f7ff; padding:12px; border-radius:8px; margin-top:12px; font-size:0.9rem;">
                            💡 ${escapeHtml(assessment.message)}
                        </div>
                    `;
                }
            }
        } else if (step.type === 'gestational') {
            // gestational
            const weeks = tempData.gestationalWeeks !== undefined ? tempData.gestationalWeeks : (child.gestationalAgeWeeks ?? '');
            const days = tempData.gestationalDays !== undefined ? tempData.gestationalDays : (child.gestationalAgeDays ?? '');
            const unknown = tempData.gestationalUnknown !== undefined ? tempData.gestationalUnknown : (child.birthTermCategory === 'unknown');
            html += `
                <div style="display:flex; gap:12px; margin-top:12px;">
                    <label>
                        Недели
                        <input type="number" id="gestational-weeks" min="20" max="43" value="${escapeHtml(weeks)}" placeholder="39">
                    </label>
                    <label>
                        Дни
                        <input type="number" id="gestational-days" min="0" max="6" value="${escapeHtml(days)}" placeholder="0">
                    </label>
                </div>
                <label style="display:block; margin-top:12px;">
                    <input type="checkbox" id="gestational-unknown" ${unknown ? 'checked' : ''}>
                    Не знаю
                </label>
                <small style="display:block; margin-top:10px; opacity:.7;">
                    Например: 39 недель 2 дня. Если срок неизвестен — это нормально.
                </small>
            `;
        }

        // ============================================================
        // НАВИГАЦИЯ
        // ============================================================
        html += `<div class="nav-buttons">`;
        if (currentStep > 0) {
            html += `<button class="prev" data-action="prev-step" type="button">← Назад</button>`;
        } else {
            html += `<div></div>`;
        }
        if (currentStep < STEPS.length - 1) {
            html += `<button class="next" data-action="next-step" type="button">Далее →</button>`;
        } else {
            html += `<button class="next" data-action="finish-onboarding" type="button">🚀 Начать!</button>`;
        }
        html += `</div>`;
        html += `</div>`;

        return html;
    }

    // ============================================================
    // PUBLIC RENDER
    // ============================================================

    window.renderOnboarding = function() {
        const state = getState();
        if (!targetChildId) {
            targetChildId = state._onboardingChildId || state.currentChildId || null;
        }
        return renderStep();
    };

    function refreshOnboarding() {
        if (typeof render === 'function') render('onboarding');
    }

    // ============================================================
    // CHOICE — SINGLE SELECT
    // ============================================================

    document.addEventListener('click', function(event) {
        const choiceBtn = event.target.closest('.btn-group button[data-choice]');
        if (!choiceBtn) return;
        const key = choiceBtn.dataset.choice;
        const value = choiceBtn.dataset.value;
        tempData[key] = value;
        refreshOnboarding();
    });

    // ============================================================
    // CHECKBOX LOGIC (включая взаимоисключение)
    // ============================================================

    document.addEventListener('change', function(event) {
        const checkbox = event.target.closest('.step-checkbox');
        if (!checkbox) return;

        const step = STEPS[currentStep];
        if (!step || step.type !== 'checkboxes') return;

        // Читаем все чекбоксы на текущем шаге
        const allChecks = document.querySelectorAll('.step-checkbox');
        const checkedValues = Array.from(allChecks).filter(cb => cb.checked).map(cb => cb.value);

        // Определяем, есть ли в опциях "Нет" или "Не знаю"
        const noOptions = ['Нет', 'Нет известных аллергий', 'Не знаю'];
        const hasNo = step.options.some(opt => noOptions.includes(opt));

        if (step.key === 'readiness') {
            // Для readiness – особый случай: если выбрано "Не уверена / не знаю", снимаем все остальные
            if (checkedValues.includes('Не уверена / не знаю')) {
                allChecks.forEach(cb => {
                    if (cb.value !== 'Не уверена / не знаю') cb.checked = false;
                });
            }
            // Обновляем tempData
            const finalValues = Array.from(document.querySelectorAll('.step-checkbox:checked')).map(cb => cb.value);
            const mapping = step.mapping || {};
            const readiness = {};
            Object.keys(mapping).forEach(label => { readiness[mapping[label]] = false; });
            finalValues.forEach(value => {
                const key = mapping[value];
                if (key) readiness[key] = true;
            });
            tempData.readiness = readiness;
            refreshOnboarding();
            return;
        }

        // Для остальных checkboxes (allergies, diet, favorites, worries)
        // Если есть "Нет"/"Не знаю" в опциях – применяем взаимоисключение
        if (hasNo) {
            const noValues = ['Нет', 'Нет известных аллергий', 'Не знаю'];
            // Если выбрано "Нет" или "Не знаю" – снимаем все остальные
            if (noValues.includes(checkbox.value) && checkbox.checked) {
                allChecks.forEach(cb => {
                    if (!noValues.includes(cb.value)) cb.checked = false;
                });
            } else if (!noValues.includes(checkbox.value) && checkbox.checked) {
                // Если выбран конкретный вариант – снимаем "Нет" и "Не знаю"
                allChecks.forEach(cb => {
                    if (noValues.includes(cb.value)) cb.checked = false;
                });
            }
        }

        // Сохраняем все выбранные (без фильтрации)
        const finalValues = Array.from(document.querySelectorAll('.step-checkbox:checked')).map(cb => cb.value);
        tempData[step.key] = finalValues;
        refreshOnboarding();
    });

    // ============================================================
    // NAVIGATION
    // ============================================================

    document.addEventListener('click', function(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        if (!['next-step', 'prev-step', 'skip-step', 'finish-onboarding'].includes(action)) return;

        const onboarding = document.querySelector('.onboarding');
        if (!onboarding) return;

        const step = STEPS[currentStep];
        if (!step) return;

        // Всегда сохраняем состояние перед переходом
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
            // Если текущий шаг "started" и возраст < 4, пропускаем его (уже установлено feedingStarted = 'Нет')
            if (step.id === 'started' && ageMonths < 4) {
                // ничего не делаем, просто переходим дальше
            }
            currentStep++;
            if (currentStep >= STEPS.length) currentStep = STEPS.length - 1;
            refreshOnboarding();
            return;
        }

        if (action === 'finish-onboarding') {
            finishOnboarding();
        }
    });

    // ============================================================
    // FINISH
    // ============================================================

    function finishOnboarding() {
        const state = getState();
        if (!targetChildId) {
            targetChildId = state._onboardingChildId || state.currentChildId || null;
        }

        const child = getTargetChild();
        if (!child) {
            console.error('❌ onboarding: ребёнок не найден', { targetChildId, currentChildId: state.currentChildId, children: state.children });
            return;
        }

        // --- Основные данные ---
        if (tempData.name !== undefined) child.name = tempData.name;
        if (tempData.birthDate !== undefined) child.birthDate = tempData.birthDate;

        // --- Тип вскармливания ---
        if (tempData.feedingType !== undefined) {
            const map = {
                'Грудное молоко': 'breast',
                'Смесь': 'formula',
                'Грудное молоко + смесь': 'mixed',
                'ГВ': 'breast',
                'ИВ': 'formula',
                'Смешанное': 'mixed'
            };
            child.feedingType = map[tempData.feedingType] || tempData.feedingType;
        }

        // --- Начало прикорма ---
        if (tempData.feedingStarted !== undefined) {
            child.feedingStarted = tempData.feedingStarted === 'Да';
        }
        if (tempData.feedingStartDate !== undefined) {
            child.feedingStartDate = tempData.feedingStartDate;
        }

        // --- Подход ---
        if (tempData.approach !== undefined) child.approach = tempData.approach;

        // --- Срок беременности ---
        if (tempData.gestationalUnknown) {
            child.gestationalAgeWeeks = null;
            child.gestationalAgeDays = null;
            child.birthTermCategory = 'unknown';
        } else {
            const weeks = tempData.gestationalWeeks;
            const days = tempData.gestationalDays || 0;
            if (weeks !== '' && weeks !== undefined && weeks !== null) {
                child.gestationalAgeWeeks = parseInt(weeks, 10);
                child.gestationalAgeDays = parseInt(days, 10) || 0;
                child.birthTermCategory = getBirthTermCategory(child.gestationalAgeWeeks, child.gestationalAgeDays);
            } else {
                child.gestationalAgeWeeks = null;
                child.gestationalAgeDays = null;
                child.birthTermCategory = 'unknown';
            }
        }

        // --- Готовность ---
        if (tempData.readiness !== undefined) child.readiness = tempData.readiness;

        // --- Onboarding объект ---
        if (!child.onboarding) child.onboarding = {};
        if (tempData.allergies !== undefined) child.onboarding.allergies = tempData.allergies;
        if (tempData.diet !== undefined) child.onboarding.diet = tempData.diet;
        if (tempData.favoriteFoods !== undefined) child.onboarding.favoriteFoods = tempData.favoriteFoods;
        if (tempData.worries !== undefined) child.onboarding.worries = tempData.worries;
        if (tempData.confidence !== undefined) child.onboarding.confidence = tempData.confidence;

        // --- Возраст ---
        const age = calculateAge(child.birthDate);
        ageMonths = age.months;

        // --- Оценка готовности ---
        child.readinessAssessment = assessReadiness(
            child.readiness,
            age.months,
            child.birthTermCategory
        );

        // --- Версия профиля ---
        child.profileVersion = 1;
        child.onboarding.completedAt = new Date().toISOString();

        // --- Активный ребёнок ---
        state.currentChildId = child.id;
        state._onboardingChildId = null;
        state._onboardingMode = null;

        // --- Глобальный флаг ---
        if (state.children.length === 1 && state.onboardingCompleted === false) {
            state.onboardingCompleted = true;
        }

        // --- Переход на Home ---
        state.ui = state.ui || {};
        state.navigation = state.navigation || {};
        state.ui.screen = 'home';
        state.navigation.currentScreen = 'home';

        if (typeof saveState === 'function') saveState();

        // --- Сброс локального состояния ---
        currentStep = 0;
        tempData = {};
        targetChildId = null;
        ageMonths = 0;

        if (typeof render === 'function') render('home');
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));

        console.log('✅ onboarding завершён', {
            childId: child.id,
            childName: child.name,
            ageMonths: age.months,
            readiness: child.readinessAssessment,
            totalChildren: state.children.length
        });
    }

    console.log('✅ onboarding.js загружен — PRIKORM.BOT Onboarding v2.1');
})();