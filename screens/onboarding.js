// screens/onboarding.js
(function() {
    'use strict';

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

    const SKIP_VALUES = ['Нет', 'Не знаю', 'Пропустить'];

    const STEPS = [
        { id: 'name', emoji: '👶', title: 'Как зовут малыша?', desc: 'Вы можете пропустить', type: 'input', inputType: 'text', placeholder: 'Имя', key: 'name', skipable: true },
        { id: 'birth', emoji: '📅', title: 'Дата рождения', desc: 'Мы рассчитаем возраст', type: 'input', inputType: 'date', key: 'birthDate' },
        { id: 'feeding_type', emoji: '🍼', title: 'Тип вскармливания', desc: '', type: 'choice', options: ['ГВ', 'ИВ', 'Смешанное'], key: 'feedingType' },
        { id: 'started', emoji: '🌱', title: 'Вы уже начали прикорм?', desc: '', type: 'choice', options: ['Да', 'Нет'], key: 'feedingStarted', extra: 'start-date-field' },
        { id: 'approach', emoji: '🥄', title: 'Выберите подход', desc: 'Можно изменить позже', type: 'choice', options: ['Пюре', 'BLW', 'Комбинированный', 'Пока не знаю'], key: 'approach' },
        { id: 'readiness', emoji: '🧸', title: 'Признаки готовности', desc: 'Какие признаки вы замечаете? (выберите все)', type: 'checkboxes', options: ['Сидит с поддержкой', 'Уверенно держит голову', 'Тянется к еде', 'Открывает рот при виде еды', 'Пока не уверена'], key: 'readiness', mapping: { 'Сидит с поддержкой': 'sitSupport', 'Уверенно держит голову': 'headControl', 'Тянется к еде': 'reachesFood', 'Открывает рот при виде еды': 'opensMouth', 'Пока не уверена': 'notSure' } },
        { id: 'allergies', emoji: '⚠️', title: 'Аллергии', desc: 'Есть ли у малыша аллергия на что-то?', type: 'checkboxes', options: [...ALLERGENS_LIST, 'Нет', 'Не знаю'], key: 'allergies' },
        { id: 'diet', emoji: '🥗', title: 'Диета', desc: 'Есть ли особенности питания?', type: 'checkboxes', options: [...DIET_OPTIONS, 'Нет', 'Не знаю'], key: 'diet' },
        { id: 'favorites', emoji: '🍎', title: 'Любимые продукты', desc: 'Что бы вы хотели предложить малышу в первую неделю?', type: 'checkboxes', options: [...FAVORITE_FOODS, 'Не знаю', 'Пропустить'], key: 'favoriteFoods' },
        { id: 'worries', emoji: '😰', title: 'Что вас беспокоит?', desc: 'Выберите все, что вас волнует', type: 'checkboxes', options: WORRY_OPTIONS, key: 'worries' },
        { id: 'confidence', emoji: '💪', title: 'Как вы себя чувствуете?', desc: 'Готовы начать прикорм?', type: 'choice', options: ['Нервничаю', 'Растеряна', 'Уверена', 'Очень уверена'], key: 'confidence' }
    ];

    let currentStep = 0;
    let tempData = {};

    function calcAge(birthDate) {
        if (!birthDate) return { months: 0 };
        const birth = new Date(birthDate);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        return { months: Math.max(0, months) };
    }

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

        if (step.type === 'input') {
            const val = tempData[step.key] || (STATE.baby ? STATE.baby[step.key] : '') || '';
            html += `<input type="${step.inputType}" id="onboarding-input" placeholder="${step.placeholder || ''}" value="${val}">`;
            if (step.skipable) {
                html += `<button class="skip" data-action="skip-step">Пропустить →</button>`;
            }
        }

        if (step.type === 'choice') {
            html += `<div class="btn-group">`;
            step.options.forEach(opt => {
                const selected = (tempData[step.key] || (STATE.baby ? STATE.baby[step.key] : '') || '') === opt;
                html += `<button class="${selected ? 'primary' : ''}" data-value="${opt}" data-choice="${step.key}">${opt}</button>`;
            });
            html += `</div>`;
            if (step.extra === 'start-date-field') {
                html += `<div id="start-date-field" style="display:${tempData.feedingStarted ? 'block' : 'none'}; margin-top:16px;">
                            <label>Дата начала прикорма</label>
                            <input type="date" id="onboarding-start-date" value="${STATE.baby ? STATE.baby.feedingStartDate || '' : ''}">
                        </div>`;
            }
        }

        if (step.type === 'checkboxes') {
            const selected = tempData[step.key] || (STATE.onboarding ? STATE.onboarding[step.key] : []) || [];
            html += `<div class="btn-group" style="flex-direction:column; gap:8px;">`;
            step.options.forEach(opt => {
                const checked = selected.includes(opt);
                html += `<label><input type="checkbox" class="step-checkbox" value="${opt}" ${checked ? 'checked' : ''}> ${opt}</label>`;
            });
            html += `</div>`;
        }

        html += `<div class="nav-buttons">`;
        if (currentStep > 0) html += `<button class="prev" data-action="prev-step">← Назад</button>`;
        else html += `<div></div>`;
        if (currentStep < STEPS.length - 1) html += `<button class="next" data-action="next-step">Далее →</button>`;
        else html += `<button class="next" data-action="finish-onboarding">🚀 Начать!</button>`;
        html += `</div></div>`;

        app.innerHTML = html;

        document.querySelectorAll('[data-choice]').forEach(btn => {
            btn.addEventListener('click', function() {
                const key = this.dataset.choice;
                const value = this.dataset.value;
                tempData[key] = value;
                if (key === 'feedingStarted') {
                    const started = (value === 'Да');
                    tempData.feedingStarted = started;
                    const field = document.getElementById('start-date-field');
                    if (field) field.style.display = started ? 'block' : 'none';
                    if (!started) {
                        document.getElementById('onboarding-start-date').value = '';
                    }
                }
                document.querySelectorAll(`[data-choice="${key}"]`).forEach(b => b.style.border = 'none');
                this.style.border = '3px solid #d4a373';
            });
        });

        document.getElementById('onboarding-start-date')?.addEventListener('change', function() {
            tempData.feedingStartDate = this.value;
        });

        document.querySelector('[data-action="skip-step"]')?.addEventListener('click', function() {
            goToStep(currentStep + 1);
        });

        document.querySelector('[data-action="next-step"]')?.addEventListener('click', function() {
            saveCurrentStepData();
            goToStep(currentStep + 1);
        });

        document.querySelector('[data-action="prev-step"]')?.addEventListener('click', function() {
            saveCurrentStepData();
            goToStep(currentStep - 1);
        });

        document.querySelector('[data-action="finish-onboarding"]')?.addEventListener('click', function() {
            saveCurrentStepData();
            finishOnboarding();
        });
    }

    function goToStep(index) {
        if (index < 0 || index >= STEPS.length) return;
        currentStep = index;
        renderStep();
    }

    function saveCurrentStepData() {
        const step = STEPS[currentStep];
        if (!step) return;

        if (step.type === 'input') {
            const input = document.getElementById('onboarding-input');
            if (input) {
                const val = input.value.trim();
                if (step.key === 'name') {
                    if (STATE.baby) STATE.baby.name = val;
                    else tempData.name = val;
                }
                if (step.key === 'birthDate') {
                    if (STATE.baby) {
                        STATE.baby.birthDate = val;
                        if (val) STATE.baby.ageMonths = calcAge(val).months;
                    } else tempData.birthDate = val;
                }
            }
        }

        if (step.type === 'choice') {
            const key = step.key;
            const value = tempData[key];
            if (key === 'feedingType') { if (STATE.baby) STATE.baby.feedingType = value; else tempData.feedingType = value; }
            if (key === 'approach') { if (STATE.baby) STATE.baby.approach = value; else tempData.approach = value; }
            if (key === 'confidence') {
                if (STATE.onboarding) STATE.onboarding.confidence = value;
                else tempData.confidence = value;
            }
            if (key === 'feedingStarted') {
                const started = (value === 'Да');
                if (STATE.baby) {
                    STATE.baby.feedingStarted = started;
                    if (started && tempData.feedingStartDate) STATE.baby.feedingStartDate = tempData.feedingStartDate;
                    else STATE.baby.feedingStartDate = '';
                } else {
                    tempData.feedingStarted = started;
                    tempData.feedingStartDate = started ? tempData.feedingStartDate : '';
                }
            }
        }

        if (step.type === 'checkboxes') {
            const checks = document.querySelectorAll('.step-checkbox:checked');
            const values = Array.from(checks).map(el => el.value);
            const key = step.key;
            if (key === 'readiness') {
                const r = STATE.onboarding ? STATE.onboarding.readiness || {} : {};
                const mapping = step.mapping || {};
                Object.keys(mapping).forEach(k => r[mapping[k]] = false);
                values.forEach(val => {
                    if (mapping[val]) r[mapping[val]] = true;
                });
                if (STATE.onboarding) STATE.onboarding.readiness = r;
            } else {
                const filtered = values.filter(v => !SKIP_VALUES.includes(v));
                if (STATE.onboarding) STATE.onboarding[key] = filtered;
                else tempData[key] = filtered;
            }
        }

        if (typeof window.saveState === 'function') {
            window.saveState();
        }
    }

    // === ИСПРАВЛЕННАЯ ФУНКЦИЯ ЗАВЕРШЕНИЯ (добавлена установка currentChildId) ===
    function finishOnboarding() {
        const childData = {
            name: tempData.name || '',
            birthDate: tempData.birthDate || '',
            sex: tempData.sex || '',
            feedingType: tempData.feedingType || '',
            feedingStarted: (tempData.feedingStarted === 'Да'),
            feedingStartDate: tempData.feedingStartDate || '',
            approach: tempData.approach || 'mixed',
            readiness: STATE.onboarding?.readiness || {},
            notes: '',
            photo: ''
        };

        // Режим добавления нового ребёнка
        if (STATE._onboardingMode === 'add-child') {
            if (STATE.children && STATE.children.length > 0) {
                var lastChild = STATE.children[STATE.children.length - 1];
                if (lastChild) {
                    Object.assign(lastChild, childData);
                    // Устанавливаем нового ребёнка как текущего
                    STATE.currentChildId = lastChild.id;
                } else {
                    // Если почему-то нет – добавляем нового
                    if (typeof window.addChild === 'function') {
                        window.addChild(childData);
                    } else {
                        STATE.children.push({ id: 'child_' + Date.now(), ...childData });
                    }
                }
            } else {
                // Если детей нет – создаём первого
                if (typeof window.addChild === 'function') {
                    window.addChild(childData);
                } else {
                    STATE.children = STATE.children || [];
                    STATE.children.push({ id: 'child_' + Date.now(), ...childData });
                    STATE.currentChildId = STATE.children[0].id;
                }
            }
            delete STATE.baby;
            STATE._onboardingMode = null;
            if (typeof window.saveState === 'function') window.saveState();
            if (typeof window.render === 'function') window.render('baby');
            return;
        }

        // Обычный режим (первый запуск)
        if (typeof window.addChild === 'function') {
            window.addChild(childData);
        } else {
            if (!STATE.children) STATE.children = [];
            STATE.children.push({ id: 'child_' + Date.now(), ...childData });
            STATE.currentChildId = STATE.children[0].id;
        }
        delete STATE.baby;
        STATE.onboardingCompleted = true;
        STATE._onboardingMode = null;
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof window.render === 'function') window.render('home');
    }

    window.renderOnboarding = function() {
        currentStep = 0;
        tempData = {};
        renderStep();
    };

    console.log('✅ onboarding.js загружен, шагов:', STEPS.length);
})();