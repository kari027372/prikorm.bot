/* ============================================================
   onboarding.js
   ============================================================ */

const ALLERGENS_LIST = [
    'Яйцо',
    'Молочные продукты',
    'Орехи',
    'Рыба',
    'Пшеница',
    'Соя',
    'Кунжут',
    'Цитрусовые'
];

const DIET_OPTIONS = [
    'Рефлюкс',
    'Без молочных',
    'Без глютена',
    'При экземе',
    'Без свинины',
    'Богатое железом',
    'Без злаков'
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

function renderOnboarding() {
    try {
        const app = document.getElementById('app');
        if (!app) return;

        let step = 0;
        const totalSteps = 11;

        const renderStep = (stepIndex) => {
            let html = `<div class="onboarding">`;
            html += `<div class="step-indicators">`;
            for (let i = 0; i < totalSteps; i++) {
                html += `<span class="${i === stepIndex ? 'active' : ''}"></span>`;
            }
            html += `</div>`;

            switch (stepIndex) {
                case 0:
                    html += `
                        <div class="emoji-big">👶</div>
                        <h1>Как зовут малыша?</h1>
                        <p>Вы можете пропустить</p>
                        <input type="text" id="onboarding-name" placeholder="Имя" value="${STATE.baby.name || ''}">
                        <button class="skip" data-action="skip-name">Пропустить →</button>
                    `;
                    break;
                case 1:
                    html += `
                        <div class="emoji-big">📅</div>
                        <h1>Дата рождения</h1>
                        <p>Мы рассчитаем возраст</p>
                        <input type="date" id="onboarding-birth" value="${STATE.baby.birthDate || ''}">
                    `;
                    break;
                case 2:
                    html += `
                        <div class="emoji-big">🍼</div>
                        <h1>Тип вскармливания</h1>
                        <div class="btn-group">
                            <button class="primary" data-value="ГВ">🤱 Грудное</button>
                            <button class="primary" data-value="ИВ">🍼 Искусственное</button>
                            <button class="primary" data-value="Смешанное">🤍 Смешанное</button>
                        </div>
                    `;
                    break;
                case 3:
                    html += `
                        <div class="emoji-big">🌱</div>
                        <h1>Вы уже начали прикорм?</h1>
                        <div class="btn-group">
                            <button class="primary" data-value="yes">Да</button>
                            <button class="primary" data-value="no">Нет</button>
                        </div>
                        <div id="start-date-field" style="display:none; margin-top:16px;">
                            <label>Дата начала прикорма</label>
                            <input type="date" id="onboarding-start-date">
                        </div>
                    `;
                    break;
                case 4:
                    html += `
                        <div class="emoji-big">🥄</div>
                        <h1>Выберите подход</h1>
                        <p>Можно изменить позже</p>
                        <div class="btn-group">
                            <button class="primary" data-value="puree">🥄 Пюре</button>
                            <button class="primary" data-value="blw">🖐 BLW</button>
                            <button class="primary" data-value="mixed">🥣 Комбинированный</button>
                            <button class="secondary" data-value="unknown">🤷 Пока не знаю</button>
                        </div>
                    `;
                    break;
                case 5:
                    const r = STATE.onboarding.readiness || {};
                    html += `
                        <div class="emoji-big">🧸</div>
                        <h1>Признаки готовности</h1>
                        <p>Какие признаки вы замечаете? (выберите все)</p>
                        <div class="btn-group" style="flex-direction:column; gap:8px;">
                            <label><input type="checkbox" id="readiness-sit" ${r.sitSupport ? 'checked' : ''}> Сидит с поддержкой</label>
                            <label><input type="checkbox" id="readiness-head" ${r.headControl ? 'checked' : ''}> Уверенно держит голову</label>
                            <label><input type="checkbox" id="readiness-reach" ${r.reachesFood ? 'checked' : ''}> Тянется к еде</label>
                            <label><input type="checkbox" id="readiness-mouth" ${r.opensMouth ? 'checked' : ''}> Открывает рот при виде еды</label>
                            <label><input type="checkbox" id="readiness-notsure" ${r.notSure ? 'checked' : ''}> Пока не уверена</label>
                        </div>
                    `;
                    break;
                case 6:
                    const allergies = STATE.onboarding.allergies || [];
                    html += `
                        <div class="emoji-big">⚠️</div>
                        <h1>Аллергии</h1>
                        <p>Есть ли у малыша аллергия на что-то?</p>
                        <div class="btn-group" style="flex-direction:column; gap:8px;">
                            ${ALLERGENS_LIST.map(a => `
                                <label><input type="checkbox" class="allergy-check" value="${a}" ${allergies.includes(a) ? 'checked' : ''}> ${a}</label>
                            `).join('')}
                            <label><input type="checkbox" id="allergy-none" ${allergies.length === 0 ? 'checked' : ''}> Нет</label>
                        </div>
                    `;
                    break;
                case 7:
                    const diet = STATE.onboarding.diet || [];
                    html += `
                        <div class="emoji-big">🥗</div>
                        <h1>Диета</h1>
                        <p>Есть ли особенности питания?</p>
                        <div class="btn-group" style="flex-direction:column; gap:8px;">
                            ${DIET_OPTIONS.map(d => `
                                <label><input type="checkbox" class="diet-check" value="${d}" ${diet.includes(d) ? 'checked' : ''}> ${d}</label>
                            `).join('')}
                            <label><input type="checkbox" id="diet-none" ${diet.length === 0 ? 'checked' : ''}> Нет</label>
                        </div>
                    `;
                    break;
                case 8:
                    const favs = STATE.onboarding.favoriteFoods || [];
                    html += `
                        <div class="emoji-big">🍎</div>
                        <h1>Любимые продукты</h1>
                        <p>Что бы вы хотели предложить малышу в первую неделю?</p>
                        <div class="btn-group" style="flex-direction:column; gap:8px;">
                            ${FAVORITE_FOODS.map(f => `
                                <label><input type="checkbox" class="fav-check" value="${f}" ${favs.includes(f) ? 'checked' : ''}> ${f}</label>
                            `).join('')}
                            <label><input type="checkbox" id="fav-none" ${favs.length === 0 ? 'checked' : ''}> Не знаю</label>
                        </div>
                    `;
                    break;
                case 9:
                    const worries = STATE.onboarding.worries || [];
                    html += `
                        <div class="emoji-big">😰</div>
                        <h1>Что вас беспокоит?</h1>
                        <p>Выберите все, что вас волнует</p>
                        <div class="btn-group" style="flex-direction:column; gap:8px;">
                            ${WORRY_OPTIONS.map(w => `
                                <label><input type="checkbox" class="worry-check" value="${w}" ${worries.includes(w) ? 'checked' : ''}> ${w}</label>
                            `).join('')}
                        </div>
                    `;
                    break;
                case 10:
                    const confidence = STATE.onboarding.confidence || '';
                    html += `
                        <div class="emoji-big">💪</div>
                        <h1>Как вы себя чувствуете?</h1>
                        <p>Готовы начать прикорм?</p>
                        <div class="btn-group">
                            <button class="${confidence === 'nervous' ? 'primary' : ''}" data-value="nervous">😰 Нервничаю</button>
                            <button class="${confidence === 'overwhelmed' ? 'primary' : ''}" data-value="overwhelmed">😵 Растеряна</button>
                            <button class="${confidence === 'confident' ? 'primary' : ''}" data-value="confident">😊 Уверена</button>
                            <button class="${confidence === 'very' ? 'primary' : ''}" data-value="very">💪 Очень уверена</button>
                        </div>
                    `;
                    break;
            }

            html += `<div class="nav-buttons">`;
            if (stepIndex > 0) html += `<button class="prev" data-action="prev-step">← Назад</button>`;
            else html += `<div></div>`;
            if (stepIndex < totalSteps - 1) html += `<button class="next" data-action="next-step">Далее →</button>`;
            else html += `<button class="next" data-action="finish-onboarding">🚀 Начать!</button>`;
            html += `</div></div>`;
            app.innerHTML = html;

            document.querySelectorAll('[data-action="next-step"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    saveCurrentStepData(stepIndex);
                    step = stepIndex + 1;
                    renderStep(step);
                });
            });
            document.querySelectorAll('[data-action="prev-step"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    saveCurrentStepData(stepIndex);
                    step = stepIndex - 1;
                    renderStep(step);
                });
            });

            document.querySelectorAll('[data-value]').forEach(btn => {
                btn.addEventListener('click', function () {
                    const val = this.dataset.value;
                    if (stepIndex === 2) {
                        STATE.baby.feedingType = val;
                        saveState();
                        document.querySelectorAll('.btn-group button').forEach(b => b.style.border = 'none');
                        this.style.border = '3px solid #d4a373';
                    }
                    if (stepIndex === 3) {
                        if (val === 'yes') {
                            STATE.baby.feedingStarted = true;
                            document.getElementById('start-date-field').style.display = 'block';
                        } else {
                            STATE.baby.feedingStarted = false;
                            STATE.baby.feedingStartDate = '';
                            document.getElementById('start-date-field').style.display = 'none';
                        }
                        saveState();
                        this.style.border = '3px solid #d4a373';
                    }
                    if (stepIndex === 4) {
                        STATE.baby.approach = val;
                        saveState();
                        document.querySelectorAll('.btn-group button').forEach(b => b.style.border = 'none');
                        this.style.border = '3px solid #d4a373';
                    }
                    if (stepIndex === 10) {
                        STATE.onboarding.confidence = val;
                        saveState();
                        document.querySelectorAll('.btn-group button').forEach(b => b.style.border = 'none');
                        this.style.border = '3px solid #d4a373';
                    }
                });
            });

            document.getElementById('onboarding-start-date')?.addEventListener('change', function () {
                STATE.baby.feedingStartDate = this.value;
                saveState();
            });

            document.querySelector('[data-action="skip-name"]')?.addEventListener('click', function () {
                step = 1;
                renderStep(step);
            });

            document.querySelector('[data-action="finish-onboarding"]')?.addEventListener('click', function () {
                saveCurrentStepData(stepIndex);
                STATE.onboardingCompleted = true;
                saveState();
                renderApp();
            });
        };

        function saveCurrentStepData(stepIndex) {
            if (stepIndex === 0) {
                STATE.baby.name = document.getElementById('onboarding-name')?.value.trim() || '';
                saveState();
            }
            if (stepIndex === 1) {
                STATE.baby.birthDate = document.getElementById('onboarding-birth')?.value || '';
                if (STATE.baby.birthDate) {
                    STATE.baby.ageMonths = calcAge(STATE.baby.birthDate).months;
                }
                saveState();
            }
            if (stepIndex === 5) {
                const r = STATE.onboarding.readiness;
                r.sitSupport = document.getElementById('readiness-sit')?.checked || false;
                r.headControl = document.getElementById('readiness-head')?.checked || false;
                r.reachesFood = document.getElementById('readiness-reach')?.checked || false;
                r.opensMouth = document.getElementById('readiness-mouth')?.checked || false;
                r.notSure = document.getElementById('readiness-notsure')?.checked || false;
                saveState();
            }
            if (stepIndex === 6) {
                const checks = document.querySelectorAll('.allergy-check:checked');
                STATE.onboarding.allergies = Array.from(checks).map(el => el.value);
                if (document.getElementById('allergy-none')?.checked) STATE.onboarding.allergies = [];
                saveState();
            }
            if (stepIndex === 7) {
                const checks = document.querySelectorAll('.diet-check:checked');
                STATE.onboarding.diet = Array.from(checks).map(el => el.value);
                if (document.getElementById('diet-none')?.checked) STATE.onboarding.diet = [];
                saveState();
            }
            if (stepIndex === 8) {
                const checks = document.querySelectorAll('.fav-check:checked');
                STATE.onboarding.favoriteFoods = Array.from(checks).map(el => el.value);
                if (document.getElementById('fav-none')?.checked) STATE.onboarding.favoriteFoods = [];
                saveState();
            }
            if (stepIndex === 9) {
                const checks = document.querySelectorAll('.worry-check:checked');
                STATE.onboarding.worries = Array.from(checks).map(el => el.value);
                saveState();
            }
        }

        renderStep(0);
    } catch (e) {
        console.error('Ошибка в renderOnboarding:', e);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `<div style="padding:20px;color:red;">Ошибка в онбординге: ${e.message}</div>`;
        }
    }
}

window.renderOnboarding = renderOnboarding;