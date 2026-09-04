// screens/onboarding.js
(function () {
    'use strict';

    // ============================================================
    // СПРАВОЧНИКИ (без изменений)
    // ============================================================

    const ALLERGENS_LIST = [
        'Яйцо',
        'Молоко',
        'Арахис',
        'Другие орехи',
        'Рыба',
        'Пшеница',
        'Соя',
        'Кунжут',
        'Другие'
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
        'Отказ от еды',
        'Нехватка железа и питательных веществ',
        'Боюсь сделать что-то неправильно'
    ];

    // ============================================================
    // ШАГИ (12)
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
            desc: 'Срок беременности считают в неделях и днях. Если вы не знаете точный срок — это нормально.',
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
            desc: 'Отметьте то, что действительно наблюдаете',
            type: 'readiness_checkboxes',
            key: 'readiness',
            questions: [
                {
                    label: 'Малыш уверенно удерживает голову и шею?',
                    id: 'headControl'
                },
                {
                    label: 'Малыш может находиться в достаточно вертикальном положении с хорошей поддержкой туловища?',
                    id: 'sitSupport'
                },
                {
                    label: 'Малыш интересуется едой и тянется к ней?',
                    id: 'foodInterest'
                },
                {
                    label: 'Малыш открывает рот, когда ему предлагают еду?',
                    id: 'opensMouth'
                },
                {
                    label: 'Малыш способен принять пищу, не выталкивая её постоянно языком?',
                    id: 'swallowing'
                },
                {
                    label: 'Во время кормления нет выраженных проблем с дыханием или координацией сосание–глотание–дыхание?',
                    id: 'breathingCoordination'
                }
            ],
            options: ['Да', 'Нет', 'Не уверена']
        },
        {
            id: 'allergies',
            emoji: '⚠️',
            title: 'Есть ли у малыша известные аллергии?',
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
            desc: 'Это просто ваши предпочтения, а не обязательный план',
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
    // СОСТОЯНИЕ ONBOARDING
    // ============================================================

    let currentStep = 0;
    let tempData = {};
    let targetChildId = null;

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

    function getTermMessage(category) {
        const map = {
            'preterm': 'Малыш родился раньше срока. Поэтому при оценке начала прикорма мы дополнительно учитываем скорректированный возраст и развитие.',
            'early_term': 'Малыш родился на раннем доношенном сроке. Обычно это не требует особых корректировок, но важно следить за развитием.',
            'full_term': 'Малыш родился в доношенный срок.',
            'late_term': 'Малыш родился на позднем доношенном сроке.',
            'post_term': 'Малыш родился после срока.',
            'unknown': 'Срок рождения не указан. Мы будем ориентироваться на календарный возраст и развитие.'
        };
        return map[category] || '';
    }

    // ============================================================
    // ОЦЕНКА ГОТОВНОСТИ
    // ============================================================

    function assessReadiness(readiness, ageMonths, birthTermCategory) {
        if (!readiness || typeof readiness !== 'object') {
            return {
                status: 'developing',
                message: 'Некоторые навыки ещё формируются. Это нормально. Можно продолжать наблюдать за развитием малыша и постепенно готовиться к прикорму.'
            };
        }

        const {
            headControl = false,
            sitSupport = false,
            foodInterest = false,
            opensMouth = false,
            swallowing = false,
            breathingCoordination = false
        } = readiness;

        const core = [headControl, sitSupport, foodInterest, opensMouth].filter(Boolean).length;
        const safety = swallowing && breathingCoordination;

        if (!breathingCoordination || !swallowing) {
            return {
                status: 'needs_review',
                message: 'Перед началом прикорма стоит обсудить готовность малыша с педиатром / специалистом по кормлению, особенно в части координации глотания и дыхания.'
            };
        }

        const isPreterm = (birthTermCategory === 'preterm');

        if (ageMonths < 4) {
            if (isPreterm) {
                return {
                    status: 'developing',
                    message: 'Малыш родился раньше срока, и сейчас календарный возраст менее 4 месяцев. Обычно прикорм не начинают так рано, но окончательное решение принимает педиатр, знающий историю ребёнка.'
                };
            }
            return {
                status: 'developing',
                message: 'Малышу меньше 4 месяцев. Обычно прикорм рекомендуют начинать с 6 месяцев. Пока можно наблюдать за развитием.'
            };
        }

        if (ageMonths >= 4 && ageMonths < 6) {
            if (isPreterm) {
                return {
                    status: 'needs_review',
                    message: 'Малыш родился раньше срока, и сейчас возраст от 4 до 6 месяцев. Признаки готовности частично сформированы. Рекомендуем обсудить начало прикорма с педиатром.'
                };
            }
            if (core >= 3 && safety) {
                return {
                    status: 'ready',
                    message: 'По указанным вами признакам малыш демонстрирует основные навыки, необходимые для знакомства с прикормом. Возраст 4–6 месяцев – это период, когда многие специалисты допускают начало прикорма, но важно учитывать индивидуальное развитие.'
                };
            }
            return {
                status: 'developing',
                message: 'Некоторые навыки ещё формируются. Это нормально. Можно продолжать наблюдать за развитием малыша и постепенно готовиться к прикорму.'
            };
        }

        // age >= 6
        if (isPreterm) {
            if (core >= 3 && safety) {
                return {
                    status: 'needs_review',
                    message: 'Признаки готовности уже появляются, но поскольку малыш родился раньше срока, подходящее время начала прикорма лучше обсудить с педиатром, который знает историю ребёнка.'
                };
            }
            return {
                status: 'developing',
                message: 'Некоторые навыки ещё не сформированы. Для недоношенных детей особенно важно учитывать развитие и безопасное кормление. Рекомендуем консультацию со специалистом.'
            };
        }

        // доношенные >= 6
        if (core >= 3 && safety) {
            return {
                status: 'ready',
                message: 'По указанным вами признакам малыш демонстрирует основные навыки, необходимые для знакомства с прикормом. Возраст подходит, и признаки готовности хорошие.'
            };
        }
        return {
            status: 'developing',
            message: 'Некоторые навыки ещё формируются. Это нормально. Можно продолжать наблюдать за развитием малыша и постепенно готовиться к прикорму.'
        };
    }

    // ============================================================
    // СОХРАНЕНИЕ ТЕКУЩЕГО ШАГА
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
                    const input = document.querySelector(`input[name="readiness_${q.id}"]:checked`);
                    readiness[q.id] = input ? input.value === 'Да' : false;
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

        const birthDate = tempData.birthDate || child.birthDate;
        const age = calculateAge(birthDate);
        const ageMonths = age.months;

        let html = `<div class="onboarding">`;

        // Прогресс
        html += `<div class="step-indicators">`;
        for (let i = 0; i < STEPS.length; i++) {
            html += `<span class="${i === currentStep ? 'active' : ''}"></span>`;
        }
        html += `</div>`;

        html += `
            <div class="emoji-big">${step.emoji}</div>
            <h1>${escapeHtml(step.title)}</h1>
            ${step.desc ? `<p>${escapeHtml(step.desc)}</p>` : ''}
        `;

        // --- INPUT ---
        if (step.type === 'input') {
            const value = tempData[step.key] !== undefined ? tempData[step.key] : (child[step.key] || '');
            html += `
                <input type="${step.inputType}" id="onboarding-input" placeholder="${escapeHtml(step.placeholder || '')}" value="${escapeHtml(value)}" autocomplete="${step.key === 'name' ? 'name' : 'off'}">
            `;
            if (step.skipable) {
                html += `<button class="skip" data-action="skip-step" type="button">Пропустить →</button>`;
            }
        }

        // --- CHOICE ---
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

            // --- ИСПРАВЛЕНИЕ: предупреждение только если выбран "Да" И возраст < 4 ---
            if (step.id === 'started' && tempData.feedingStarted === 'Да' && ageMonths < 4) {
                html += `
                    <div style="background:#fef9e7; padding:12px; border-radius:8px; margin-top:12px; border-left:4px solid #f1c40f;">
                        ⚠️ <strong>Обратите внимание</strong><br>
                        Вы указали, что прикорм уже начат в очень раннем возрасте. В приложении мы не отменяем рекомендации вашего врача. Если начало прикорма было назначено медицинским специалистом, следуйте его плану. Если врач не рекомендовал ранний прикорм, обсудите ситуацию с педиатром.
                    </div>
                `;
            }
        }

        // --- GESTATIONAL ---
        if (step.type === 'gestational') {
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
                <small style="display:block; margin-top:10px; opacity:.7;">Например: 39 недель 2 дня. Если срок неизвестен — это нормально.</small>
            `;
            if (!unknown && weeks !== '') {
                const cat = getBirthTermCategory(weeks, days);
                const msg = getTermMessage(cat);
                if (cat !== 'unknown') {
                    html += `
                        <div style="background:#eaf2f8; padding:10px; border-radius:6px; margin-top:12px; font-size:0.9rem;">
                            ${escapeHtml(msg)}
                        </div>
                    `;
                }
            }
        }

        // --- CHECKBOXES (обычные) ---
        if (step.type === 'checkboxes') {
            let selected = tempData[step.key] !== undefined ? tempData[step.key] : (child.onboarding?.[step.key] || []);
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
        }

        // --- READINESS ---
        if (step.type === 'readiness_checkboxes') {
            const readiness = tempData.readiness || {};
            const questions = step.questions || [];
            html += `<div style="display:flex; flex-direction:column; gap:16px; margin-top:12px;">`;
            questions.forEach(q => {
                const value = readiness[q.id] !== undefined ? (readiness[q.id] ? 'Да' : 'Нет') : '';
                html += `
                    <div style="background:#f9f9f9; padding:12px; border-radius:8px;">
                        <p style="margin:0 0 8px 0; font-weight:500;">${escapeHtml(q.label)}</p>
                        <div style="display:flex; gap:12px;">
                            ${['Да', 'Нет', 'Не уверена'].map(opt => `
                                <label style="display:flex; align-items:center; gap:4px;">
                                    <input type="radio" name="readiness_${q.id}" value="${opt}" ${value === opt ? 'checked' : ''}>
                                    ${opt}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;

            const readinessData = tempData.readiness;
            if (readinessData && Object.keys(readinessData).length === questions.length) {
                const assessment = assessReadiness(
                    readinessData,
                    ageMonths,
                    child.birthTermCategory || 'unknown'
                );
                if (assessment.message) {
                    const statusColor = assessment.status === 'ready' ? '#d4edda' :
                                       assessment.status === 'needs_review' ? '#f8d7da' : '#fff3cd';
                    html += `
                        <div style="background:${statusColor}; padding:12px; border-radius:8px; margin-top:16px; border-left:4px solid ${assessment.status === 'ready' ? '#28a745' : assessment.status === 'needs_review' ? '#dc3545' : '#ffc107'};">
                            ${escapeHtml(assessment.message)}
                        </div>
                    `;
                }
            }
        }

        // --- НАВИГАЦИЯ ---
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
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================================

    // SINGLE CHOICE – мгновенное обновление
    document.addEventListener('click', function(event) {
        const choiceBtn = event.target.closest('.btn-group button[data-choice]');
        if (!choiceBtn) return;
        const key = choiceBtn.dataset.choice;
        const value = choiceBtn.dataset.value;
        tempData[key] = value;
        refreshOnboarding();
    });

    // --- ИСПРАВЛЕНИЕ: ОТДЕЛЬНЫЙ ОБРАБОТЧИК ДЛЯ ЧЕКБОКСОВ (по клику) ---
    document.addEventListener('click', function(event) {
        const checkbox = event.target.closest('.step-checkbox');
        if (!checkbox) return;

        const step = STEPS[currentStep];
        if (!step || step.type !== 'checkboxes') return;

        // Даем браузеру обработать изменение состояния чекбокса
        // Но мы должны прочитать новое состояние после события
        // Используем setTimeout, чтобы дождаться изменения
        setTimeout(function() {
            const allChecks = document.querySelectorAll('.step-checkbox');
            const checkedValues = Array.from(allChecks).filter(cb => cb.checked).map(cb => cb.value);

            // Взаимоисключение для "Нет" и "Не знаю"
            const noOptions = ['Нет', 'Нет известных пищевых аллергий', 'Не знаю'];
            const hasNo = step.options.some(opt => noOptions.includes(opt));

            if (hasNo) {
                // Если выбрано "Нет" или "Не знаю" – снимаем конкретные
                if (checkedValues.some(v => noOptions.includes(v))) {
                    allChecks.forEach(cb => {
                        if (!noOptions.includes(cb.value)) cb.checked = false;
                    });
                } else if (checkedValues.some(v => !noOptions.includes(v))) {
                    // Если выбраны конкретные – снимаем "Нет" и "Не знаю"
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

    // Обработчик change для радио-кнопок readiness
    document.addEventListener('change', function(event) {
        const radio = event.target.closest('input[type="radio"][name^="readiness_"]');
        if (radio) {
            const step = STEPS[currentStep];
            if (!step || step.type !== 'readiness_checkboxes') return;
            const questions = step.questions || [];
            const readiness = {};
            questions.forEach(q => {
                const input = document.querySelector(`input[name="readiness_${q.id}"]:checked`);
                readiness[q.id] = input ? input.value === 'Да' : false;
            });
            tempData.readiness = readiness;
            refreshOnboarding();
            return;
        }
    });

    // Навигация
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
            finishOnboarding();
        }
    });

    // ============================================================
    // ЗАВЕРШЕНИЕ ОНБОРДИНГА
    // ============================================================

    function finishOnboarding() {
        const state = getState();
        if (!targetChildId) {
            targetChildId = state._onboardingChildId || state.currentChildId || null;
        }

        const child = getTargetChild();
        if (!child) {
            console.error('❌ onboarding: ребёнок не найден');
            return;
        }

        // --- Основные данные ---
        if (tempData.name !== undefined) child.name = tempData.name;
        if (tempData.birthDate !== undefined) child.birthDate = tempData.birthDate;

        // --- Тип вскармливания ---
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

        // --- Оценка готовности ---
        if (child.readiness) {
            child.readinessAssessment = assessReadiness(
                child.readiness,
                age.months,
                child.birthTermCategory
            );
        }

        // --- Версия ---
        child.profileVersion = 2;
        child.onboarding.completedAt = new Date().toISOString();

        // --- Активный ребёнок ---
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

        console.log('✅ onboarding завершён', {
            childId: child.id,
            childName: child.name,
            ageMonths: age.months,
            readiness: child.readinessAssessment?.status || 'unknown'
        });
    }

    console.log('✅ onboarding.js загружен — исправленная версия (чекбоксы + предупреждение)');
})();