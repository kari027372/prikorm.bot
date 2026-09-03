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
    let targetChildId = null;

    function calcAge(birthDate) {
        if (!birthDate) return { months: 0 };
        const birth = new Date(birthDate);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        return { months: Math.max(0, months) };
    }

    function getTargetChild() {
        const id = STATE._onboardingChildId;
        if (!id) return null;
        return STATE.children.find(c => c.id === id) || null;
    }

    function renderStep() {
        const step = STEPS[currentStep];
        if (!step) return '';

        const child = getTargetChild();
        if (!child) {
            return `<div class="onboarding"><h1>Ошибка</h1><p>Ребёнок не найден для онбординга</p></div>`;
        }

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
            const val = tempData[step.key] || child[step.key] || '';
            html += `<input type="${step.inputType}" id="onboarding-input" placeholder="${step.placeholder || ''}" value="${val}">`;
            if (step.skipable) {
                html += `<button class="skip" data-action="skip-step">Пропустить →</button>`;
            }
        }

        if (step.type === 'choice') {
            html += `<div class="btn-group">`;
            step.options.forEach(opt => {
                const selected = (tempData[step.key] || child[step.key] || '') === opt;
                html += `<button class="${selected ? 'primary' : ''}" data-value="${opt}" data-choice="${step.key}">${opt}</button>`;
            });
            html += `</div>`;
            if (step.extra === 'start-date-field') {
                html += `<div id="start-date-field" style="display:${tempData.feedingStarted ? 'block' : 'none'}; margin-top:16px;">
                            <label>Дата начала прикорма</label>
                            <input type="date" id="onboarding-start-date" value="${child.feedingStartDate || ''}">
                        </div>`;
            }
        }

        if (step.type === 'checkboxes') {
            const selected = tempData[step.key] || child.onboarding?.[step.key] || [];
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

        return html;
    }

    window.renderOnboarding = function() {
        if (!targetChildId) {
            targetChildId = STATE._onboardingChildId || null;
        }
        return renderStep();
    };

    function refreshOnboarding() {
        if (typeof render === 'function') {
            render('onboarding');
        }
    }

    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;

        const onboardingEl = document.querySelector('.onboarding');
        if (!onboardingEl) return;

        if (action === 'next-step' || action === 'prev-step' || action === 'skip-step' || action === 'finish-onboarding') {
            const step = STEPS[currentStep];
            if (!step) return;

            if (step.type === 'input') {
                const input = document.getElementById('onboarding-input');
                if (input) {
                    const val = input.value.trim();
                    tempData[step.key] = val;
                }
            }
            if (step.type === 'choice') {
                const key = step.key;
                const selected = document.querySelector(`.btn-group button[data-choice="${key}"].primary`);
                if (selected) {
                    tempData[key] = selected.dataset.value;
                }
                if (key === 'feedingStarted') {
                    const started = tempData.feedingStarted === 'Да';
                    const field = document.getElementById('start-date-field');
                    if (field) field.style.display = started ? 'block' : 'none';
                    if (!started) {
                        document.getElementById('onboarding-start-date').value = '';
                    }
                }
            }
            if (step.type === 'checkboxes') {
                const checks = document.querySelectorAll('.step-checkbox:checked');
                const values = Array.from(checks).map(el => el.value);
                const key = step.key;
                if (key === 'readiness') {
                    const mapping = step.mapping || {};
                    const r = {};
                    Object.keys(mapping).forEach(k => r[mapping[k]] = false);
                    values.forEach(val => {
                        if (mapping[val]) r[mapping[val]] = true;
                    });
                    tempData.readiness = r;
                } else {
                    const filtered = values.filter(v => !SKIP_VALUES.includes(v));
                    tempData[key] = filtered;
                }
            }

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
                return;
            }
        }
    });

    function finishOnboarding() {
        const child = getTargetChild();
        if (!child) {
            console.error('❌ Ребёнок не найден для завершения онбординга');
            if (typeof render === 'function') render('home');
            return;
        }

        if (tempData.name !== undefined) child.name = tempData.name;
        if (tempData.birthDate !== undefined) child.birthDate = tempData.birthDate;
        if (tempData.sex !== undefined) child.sex = tempData.sex;
        if (tempData.feedingType !== undefined) child.feedingType = tempData.feedingType;
        if (tempData.feedingStarted !== undefined) child.feedingStarted = (tempData.feedingStarted === 'Да');
        if (tempData.feedingStartDate !== undefined) child.feedingStartDate = tempData.feedingStartDate;
        if (tempData.approach !== undefined) child.approach = tempData.approach;
        if (tempData.readiness !== undefined) child.readiness = tempData.readiness;
        if (!child.onboarding) child.onboarding = {};
        if (tempData.allergies !== undefined) child.onboarding.allergies = tempData.allergies;
        if (tempData.diet !== undefined) child.onboarding.diet = tempData.diet;
        if (tempData.favoriteFoods !== undefined) child.onboarding.favoriteFoods = tempData.favoriteFoods;
        if (tempData.worries !== undefined) child.onboarding.worries = tempData.worries;
        if (tempData.confidence !== undefined) child.onboarding.confidence = tempData.confidence;

        if (typeof saveState === 'function') saveState();

        STATE._onboardingChildId = null;

        if (STATE.children.length === 1 && !STATE.onboardingCompleted) {
            STATE.onboardingCompleted = true;
            if (typeof saveState === 'function') saveState();
        }

        currentStep = 0;
        tempData = {};
        targetChildId = null;

        if (typeof render === 'function') {
            render('baby');
        }
    }

    console.log('✅ onboarding.js загружен (исправлен)');
})();