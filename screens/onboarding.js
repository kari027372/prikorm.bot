// screens/onboarding.js
(function() {
    'use strict';

    // ============================================================
    // ДАННЫЕ ДЛЯ ШАГОВ (можно вынести в config.js, если нужно)
    // ============================================================
    const ALLERGENS_LIST = [
        'Яйцо', 'Молочные продукты', 'Орехи', 'Рыба',
        'Пшеница', 'Соя', 'Кунжут', 'Цитрусовые'
    ];

    const DIET_OPTIONS = [
        'Рефлюкс', 'Без молочных', 'Без глютена',
        'При экземе', 'Без свинины', 'Богатое железом', 'Без злаков'
    ];

    const FAVORITE_FOODS = [
        'Банан', 'Манго', 'Огурец', 'Курица', 'Яблоко',
        'Сыр', 'Яйцо', 'Авокадо', 'Клубника'
    ];

    const WORRY_OPTIONS = [
        'Удушье и попёрхивание',
        'Аллергические реакции',
        'Отказ от еды',
        'Нехватка железа и питательных веществ',
        'Делаю что-то не так'
    ];

    // ============================================================
    // ОПИСАНИЕ ШАГОВ (массив объектов)
    // ============================================================
    const STEPS = [
        {
            id: 'name',
            emoji: '👶',
            title: 'Как зовут малыша?',
            desc: 'Вы можете пропустить',
            type: 'input',
            inputType: 'text',
            placeholder: 'Имя',
            key: 'name',
            skipable: true
        },
        {
            id: 'birth',
            emoji: '📅',
            title: 'Дата рождения',
            desc: 'Мы рассчитаем возраст',
            type: 'input',
            inputType: 'date',
            key: 'birthDate'
        },
        {
            id: 'feeding_type',
            emoji: '🍼',
            title: 'Тип вскармливания',
            desc: '',
            type: 'choice',
            options: ['ГВ', 'ИВ', 'Смешанное'],
            key: 'feedingType'
        },
        {
            id: 'started',
            emoji: '🌱',
            title: 'Вы уже начали прикорм?',
            desc: '',
            type: 'choice',
            options: ['Да', 'Нет'],
            key: 'feedingStarted',  // будет установлено true/false
            extra: 'start-date-field' // дополнительное поле
        },
        {
            id: 'approach',
            emoji: '🥄',
            title: 'Выберите подход',
            desc: 'Можно изменить позже',
            type: 'choice',
            options: ['Пюре', 'BLW', 'Комбинированный', 'Пока не знаю'],
            key: 'approach'
        },
        {
            id: 'readiness',
            emoji: '🧸',
            title: 'Признаки готовности',
            desc: 'Какие признаки вы замечаете? (выберите все)',
            type: 'checkboxes',
            options: ['Сидит с поддержкой', 'Уверенно держит голову', 'Тянется к еде', 'Открывает рот при виде еды', 'Пока не уверена'],
            key: 'readiness',
            mapping: {
                'Сидит с поддержкой': 'sitSupport',
                'Уверенно держит голову': 'headControl',
                'Тянется к еде': 'reachesFood',
                'Открывает рот при виде еды': 'opensMouth',
                'Пока не уверена': 'notSure'
            }
        },
        {
            id: 'allergies',
            emoji: '⚠️',
            title: 'Аллергии',
            desc: 'Есть ли у малыша аллергия на что-то?',
            type: 'checkboxes',
            options: ALLERGENS_LIST,
            key: 'allergies'
        },
        {
            id: 'diet',
            emoji: '🥗',
            title: 'Диета',
            desc: 'Есть ли особенности питания?',
            type: 'checkboxes',
            options: DIET_OPTIONS,
            key: 'diet'
        },
        {
            id: 'favorites',
            emoji: '🍎',
            title: 'Любимые продукты',
            desc: 'Что бы вы хотели предложить малышу в первую неделю?',
            type: 'checkboxes',
            options: FAVORITE_FOODS,
            key: 'favoriteFoods'
        },
        {
            id: 'worries',
            emoji: '😰',
            title: 'Что вас беспокоит?',
            desc: 'Выберите все, что вас волнует',
            type: 'checkboxes',
            options: WORRY_OPTIONS,
            key: 'worries'
        },
        {
            id: 'confidence',
            emoji: '💪',
            title: 'Как вы себя чувствуете?',
            desc: 'Готовы начать прикорм?',
            type: 'choice',
            options: ['Нервничаю', 'Растеряна', 'Уверена', 'Очень уверена'],
            key: 'confidence'
        }
    ];

    // ============================================================
    // СОСТОЯНИЕ ОНБОРДИНГА
    // ============================================================
    let currentStep = 0;
    let tempData = {}; // временные данные (для чекбоксов и прочего)

    // ============================================================
    // ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ РАСЧЁТА ВОЗРАСТА (если нет в utils)
    // ============================================================
    function calcAge(birthDate) {
        if (!birthDate) return { months: 0 };
        const birth = new Date(birthDate);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        return { months: Math.max(0, months) };
    }

    // ============================================================
    // ФУНКЦИЯ РЕНДЕРИНГА ТЕКУЩЕГО ШАГА
    // ============================================================
    function renderStep() {
        const step = STEPS[currentStep];
        if (!step) return;

        const app = document.getElementById('app');
        if (!app) return;

        let html = `<div class="onboarding">`;
        html += `<div class="step-indicators">`;
        for (let i = 0; i < STEPS.length; i++) {
            html += `<span class="${i === currentStep ? 'active' : ''}"></span>`;
        }
        html += `</div>`;

        html += `<div class="emoji-big">${step.emoji}</div>`;
        html += `<h1>${step.title}</h1>`;
        if (step.desc) html += `<p>${step.desc}</p>`;

        // Рендеринг в зависимости от типа
        if (step.type === 'input') {
            const val = tempData[step.key] || STATE.baby[step.key] || '';
            html += `<input type="${step.inputType}" id="onboarding-input" placeholder="${step.placeholder || ''}" value="${val}">`;
            if (step.skipable) {
                html += `<button class="skip" data-action="skip-step">Пропустить →</button>`;
            }
        }

        if (step.type === 'choice') {
            html += `<div class="btn-group">`;
            step.options.forEach(opt => {
                const selected = (tempData[step.key] || STATE.baby[step.key] || '') === opt;
                html += `<button class="${selected ? 'primary' : ''}" data-value="${opt}" data-choice="${step.key}">${opt}</button>`;
            });
            html += `</div>`;
            if (step.extra === 'start-date-field') {
                html += `<div id="start-date-field" style="display:${tempData.feedingStarted ? 'block' : 'none'}; margin-top:16px;">
                            <label>Дата начала прикорма</label>
                            <input type="date" id="onboarding-start-date" value="${STATE.baby.feedingStartDate || ''}">
                        </div>`;
            }
        }

        if (step.type === 'checkboxes') {
            const selected = tempData[step.key] || STATE.onboarding[step.key] || [];
            html += `<div class="btn-group" style="flex-direction:column; gap:8px;">`;
            step.options.forEach(opt => {
                const checked = selected.includes(opt);
                html += `<label><input type="checkbox" class="step-checkbox" value="${opt}" ${checked ? 'checked' : ''}> ${opt}</label>`;
            });
            html += `</div>`;
        }

        // Навигационные кнопки
        html += `<div class="nav-buttons">`;
        if (currentStep > 0) html += `<button class="prev" data-action="prev-step">← Назад</button>`;
        else html += `<div></div>`;
        if (currentStep < STEPS.length - 1) html += `<button class="next" data-action="next-step">Далее →</button>`;
        else html += `<button class="next" data-action="finish-onboarding">🚀 Начать!</button>`;
        html += `</div></div>`;

        app.innerHTML = html;

        // Обработчики для кнопок выбора
        document.querySelectorAll('[data-choice]').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.dataset.choice;
                const value = this.dataset.value;
                tempData[key] = value;
                // Если это шаг "feedingStarted" – обрабатываем отдельно
                if (key === 'feedingStarted') {
                    const started = (value === 'Да');
                    tempData.feedingStarted = started;
                    const field = document.getElementById('start-date-field');
                    if (field) field.style.display = started ? 'block' : 'none';
                    if (!started) {
                        document.getElementById('onboarding-start-date').value = '';
                    }
                }
                // Подсветка выбранного
                document.querySelectorAll(`[data-choice="${key}"]`).forEach(b => b.style.border = 'none');
                this.style.border = '3px solid #d4a373';
            });
        });

        // Обработчик даты начала прикорма
        document.getElementById('onboarding-start-date')?.addEventListener('change', function() {
            tempData.feedingStartDate = this.value;
        });

        // Пропуск шага
        document.querySelector('[data-action="skip-step"]')?.addEventListener('click', function() {
            goToStep(currentStep + 1);
        });

        // Навигация
        document.querySelector('[data-action="next-step"]')?.addEventListener('click', function() {
            saveCurrentStepData();
            goToStep(currentStep + 1);
        });

        document.querySelector('[data-action="prev-step"]')?.addEventListener('click', function() {
            saveCurrentStepData();
            goToStep(currentStep - 1);
        });

        // Завершение
        document.querySelector('[data-action="finish-onboarding"]')?.addEventListener('click', function() {
            saveCurrentStepData();
            finishOnboarding();
        });
    }

    // ============================================================
    // ПЕРЕХОД К ШАГУ
    // ============================================================
    function goToStep(index) {
        if (index < 0 || index >= STEPS.length) return;
        currentStep = index;
        renderStep();
    }

    // ============================================================
    // СОХРАНЕНИЕ ДАННЫХ ТЕКУЩЕГО ШАГА В STATE
    // ============================================================
    function saveCurrentStepData() {
        const step = STEPS[currentStep];
        if (!step) return;

        // Обработка input
        if (step.type === 'input') {
            const input = document.getElementById('onboarding-input');
            if (input) {
                const val = input.value.trim();
                if (step.key === 'name') STATE.baby.name = val;
                if (step.key === 'birthDate') {
                    STATE.baby.birthDate = val;
                    if (val) STATE.baby.ageMonths = calcAge(val).months;
                }
            }
        }

        // Обработка choice
        if (step.type === 'choice') {
            const key = step.key;
            const value = tempData[key];
            if (key === 'feedingType') STATE.baby.feedingType = value;
            if (key === 'approach') STATE.baby.approach = value;
            if (key === 'confidence') STATE.onboarding.confidence = value;
            if (key === 'feedingStarted') {
                STATE.baby.feedingStarted = (value === 'Да');
                if (STATE.baby.feedingStarted && tempData.feedingStartDate) {
                    STATE.baby.feedingStartDate = tempData.feedingStartDate;
                } else {
                    STATE.baby.feedingStartDate = '';
                }
            }
        }

        // Обработка checkboxes
        if (step.type === 'checkboxes') {
            const checks = document.querySelectorAll('.step-checkbox:checked');
            const values = Array.from(checks).map(el => el.value);
            const key = step.key;
            if (key === 'readiness') {
                // маппинг на булевы флаги
                const r = STATE.onboarding.readiness || {};
                const mapping = step.mapping || {};
                // Сброс всех флагов
                Object.keys(mapping).forEach(k => r[mapping[k]] = false);
                values.forEach(val => {
                    if (mapping[val]) r[mapping[val]] = true;
                });
                STATE.onboarding.readiness = r;
            } else {
                STATE.onboarding[key] = values;
            }
        }

        // Сохраняем STATE
        if (typeof window.saveState === 'function') {
            window.saveState();
        }
    }

    // ============================================================
    // ЗАВЕРШЕНИЕ ОНБОРДИНГА
    // ============================================================
    function finishOnboarding() {
        // Устанавливаем флаг завершения
        STATE.onboardingCompleted = true;
        if (typeof window.saveState === 'function') {
            window.saveState();
        }
        console.log('✅ Онбординг завершён, переходим на главный экран');
        // Переход на главный экран через render
        if (typeof window.render === 'function') {
            window.render('home');
        } else {
            console.error('❌ render() не определена');
        }
    }

    // ============================================================
    // ГЛАВНАЯ ФУНКЦИЯ (вызывается из app.js)
    // ============================================================
    window.renderOnboarding = function() {
        // Загружаем временные данные из STATE, если они уже есть
        // (чтобы при возврате шагов данные не терялись)
        currentStep = 0;
        renderStep();
    };

    console.log('✅ onboarding.js (рефакторинг) загружен, шагов:', STEPS.length);
})();