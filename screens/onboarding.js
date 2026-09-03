// screens/onboarding.js
(function() {
    'use strict';

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
        'Банан',
        'Манго',
        'Огурец',
        'Курица',
        'Яблоко',
        'Сыр',
        'Яйцо',
        'Авокадо',
        'Клубника'
    ];

    const WORRY_OPTIONS = [
        'Удушье и попёрхивание',
        'Аллергические реакции',
        'Отказ от еды',
        'Нехватка железа и питательных веществ',
        'Делаю что-то не так'
    ];

    const SKIP_VALUES = [
        'Нет',
        'Не знаю',
        'Пропустить'
    ];

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
            options: [
                'ГВ',
                'ИВ',
                'Смешанное'
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
            title: 'Выберите подход',
            desc: 'Можно изменить позже',
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
            title: 'Признаки готовности',
            desc: 'Какие признаки вы замечаете? (выберите все)',
            type: 'checkboxes',
            options: [
                'Сидит с поддержкой',
                'Уверенно держит голову',
                'Тянется к еде',
                'Открывает рот при виде еды',
                'Пока не уверена'
            ],
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
            options: [
                ...ALLERGENS_LIST,
                'Нет',
                'Не знаю'
            ],
            key: 'allergies'
        },

        {
            id: 'diet',
            emoji: '🥗',
            title: 'Диета',
            desc: 'Есть ли особенности питания?',
            type: 'checkboxes',
            options: [
                ...DIET_OPTIONS,
                'Нет',
                'Не знаю'
            ],
            key: 'diet'
        },

        {
            id: 'favorites',
            emoji: '🍎',
            title: 'Любимые продукты',
            desc: 'Что бы вы хотели предложить малышу в первую неделю?',
            type: 'checkboxes',
            options: [
                ...FAVORITE_FOODS,
                'Не знаю',
                'Пропустить'
            ],
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
            options: [
                'Нервничаю',
                'Растеряна',
                'Уверена',
                'Очень уверена'
            ],
            key: 'confidence'
        }
    ];

    let currentStep = 0;
    let tempData = {};
    let targetChildId = null;

    function calcAge(birthDate) {
        if (!birthDate) {
            return {
                months: 0
            };
        }

        const birth = new Date(birthDate);
        const now = new Date();

        let months =
            (now.getFullYear() - birth.getFullYear()) * 12 +
            (now.getMonth() - birth.getMonth());

        if (now.getDate() < birth.getDate()) {
            months--;
        }

        return {
            months: Math.max(0, months)
        };
    }

    /*
     * ============================================================
     * ВАЖНО
     *
     * Всегда используем именно STATE.
     * Не window.getState(), потому что state.js может
     * переassign-ить внутренний STATE.
     * ============================================================
     */

    function getState() {
        if (typeof STATE !== 'undefined') {
            return STATE;
        }

        return window.STATE || {};
    }

    /*
     * ============================================================
     * Получаем ребёнка, для которого сейчас идёт онбординг
     * ============================================================
     */

    function getTargetChild() {
        const state = getState();

        /*
         * Сначала берём локальный targetChildId,
         * если он уже установлен.
         *
         * Если нет — берём его из STATE.
         */
        const id =
            targetChildId ||
            state._onboardingChildId;

        if (!id) {
            console.error(
                '❌ Нет _onboardingChildId',
                state
            );

            return null;
        }

        const children =
            Array.isArray(state.children)
                ? state.children
                : [];

        const child =
            children.find(function(child) {
                return child.id === id;
            }) || null;

        if (!child) {
            console.error(
                '❌ Ребёнок не найден',
                {
                    targetChildId: id,
                    children: children.map(
                        function(c) {
                            return c.id;
                        }
                    )
                }
            );
        }

        return child;
    }

    /*
     * ============================================================
     * РЕНДЕР ШАГА
     * ============================================================
     */

    function renderStep() {
        const step = STEPS[currentStep];

        if (!step) {
            return '';
        }

        const child = getTargetChild();

        if (!child) {
            return `
                <div class="onboarding">
                    <div class="emoji-big">👶</div>
                    <h1>Ребёнок не найден</h1>
                    <p>
                        Не удалось определить малыша
                        для этого онбординга.
                    </p>

                    <button
                        class="primary-button"
                        data-action="navigate"
                        data-screen="baby"
                        type="button"
                    >
                        Вернуться к малышам
                    </button>
                </div>
            `;
        }

        let html = `
            <div class="onboarding">
        `;

        /*
         * Индикаторы шагов
         */
        html += `
            <div class="step-indicators">
        `;

        for (
            let i = 0;
            i < STEPS.length;
            i++
        ) {
            html += `
                <span
                    class="${i === currentStep ? 'active' : ''}"
                ></span>
            `;
        }

        html += `
            </div>
        `;

        html += `
            <div class="emoji-big">
                ${step.emoji}
            </div>

            <h1>
                ${step.title}
            </h1>
        `;

        if (step.desc) {
            html += `
                <p>
                    ${step.desc}
                </p>
            `;
        }

        /*
         * ========================================================
         * INPUT
         * ========================================================
         */

        if (step.type === 'input') {
            const val =
                tempData[step.key] !== undefined
                    ? tempData[step.key]
                    : (child[step.key] || '');

            html += `
                <input
                    type="${step.inputType}"
                    id="onboarding-input"
                    placeholder="${step.placeholder || ''}"
                    value="${val}"
                >
            `;

            if (step.skipable) {
                html += `
                    <button
                        class="skip"
                        data-action="skip-step"
                        type="button"
                    >
                        Пропустить →
                    </button>
                `;
            }
        }

        /*
         * ========================================================
         * CHOICE
         * ========================================================
         */

        if (step.type === 'choice') {
            html += `
                <div class="btn-group">
            `;

            step.options.forEach(function(opt) {
                const currentValue =
                    tempData[step.key] !== undefined
                        ? tempData[step.key]
                        : (
                            step.key === 'feedingStarted'
                                ? (
                                    child.feedingStarted
                                        ? 'Да'
                                        : ''
                                )
                                : (child[step.key] || '')
                        );

                const selected =
                    currentValue === opt;

                html += `
                    <button
                        class="${selected ? 'primary' : ''}"
                        data-value="${opt}"
                        data-choice="${step.key}"
                        type="button"
                    >
                        ${opt}
                    </button>
                `;
            });

            html += `
                </div>
            `;

            /*
             * Дата начала прикорма
             */
            if (step.extra === 'start-date-field') {
                const started =
                    tempData.feedingStarted !== undefined
                        ? tempData.feedingStarted
                        : (
                            child.feedingStarted
                                ? 'Да'
                                : ''
                        );

                const startDate =
                    tempData.feedingStartDate !== undefined
                        ? tempData.feedingStartDate
                        : (child.feedingStartDate || '');

                html += `
                    <div
                        id="start-date-field"
                        style="
                            display:${started === 'Да' ? 'block' : 'none'};
                            margin-top:16px;
                        "
                    >
                        <label>
                            Дата начала прикорма
                        </label>

                        <input
                            type="date"
                            id="onboarding-start-date"
                            value="${startDate}"
                        >
                    </div>
                `;
            }
        }

        /*
         * ========================================================
         * CHECKBOXES
         * ========================================================
         */

        if (step.type === 'checkboxes') {
            let selected =
                tempData[step.key] !== undefined
                    ? tempData[step.key]
                    : (
                        child.onboarding?.[step.key] ||
                        []
                    );

            /*
             * readiness хранится объектом,
             * поэтому превращаем его в список выбранных.
             */
            if (
                step.key === 'readiness' &&
                selected &&
                !Array.isArray(selected)
            ) {
                const mapping =
                    step.mapping || {};

                selected = Object.keys(mapping)
                    .filter(function(label) {
                        return Boolean(
                            selected[mapping[label]]
                        );
                    });
            }

            if (!Array.isArray(selected)) {
                selected = [];
            }

            html += `
                <div
                    class="btn-group"
                    style="
                        flex-direction:column;
                        gap:8px;
                    "
                >
            `;

            step.options.forEach(function(opt) {
                const checked =
                    selected.includes(opt);

                html += `
                    <label>
                        <input
                            type="checkbox"
                            class="step-checkbox"
                            value="${opt}"
                            ${checked ? 'checked' : ''}
                        >
                        ${opt}
                    </label>
                `;
            });

            html += `
                </div>
            `;
        }

        /*
         * ========================================================
         * НАВИГАЦИЯ
         * ========================================================
         */

        html += `
            <div class="nav-buttons">
        `;

        if (currentStep > 0) {
            html += `
                <button
                    class="prev"
                    data-action="prev-step"
                    type="button"
                >
                    ← Назад
                </button>
            `;
        } else {
            html += `
                <div></div>
            `;
        }

        if (currentStep < STEPS.length - 1) {
            html += `
                <button
                    class="next"
                    data-action="next-step"
                    type="button"
                >
                    Далее →
                </button>
            `;
        } else {
            html += `
                <button
                    class="next"
                    data-action="finish-onboarding"
                    type="button"
                >
                    🚀 Начать!
                </button>
            `;
        }

        html += `
            </div>
        `;

        html += `
            </div>
        `;

        return html;
    }

    /*
     * ============================================================
     * ПУБЛИЧНЫЙ РЕНДЕР (ИЗМЕНЕНО: добавлен fallback на currentChildId)
     * ============================================================
     */

    window.renderOnboarding = function() {
        const state = getState();

        /*
         * Сохраняем ID локально.
         *
         * Это важно: после переходов между шагами
         * мы больше не зависим от того,
         * что происходит с _onboardingChildId.
         */
        if (!targetChildId) {
            targetChildId = state._onboardingChildId || null;
            // fallback на currentChildId, если _onboardingChildId не задан
            if (!targetChildId && state.currentChildId) {
                targetChildId = state.currentChildId;
                console.log('🔄 Онбординг: используем currentChildId как fallback', targetChildId);
            }
        }

        return renderStep();
    };

    function refreshOnboarding() {
        if (typeof render === 'function') {
            render('onboarding');
        }
    }

    /*
     * ============================================================
     * ОБРАБОТКА КЛИКОВ ОНБОРДИНГА
     * ============================================================
     */

    document.addEventListener(
        'click',
        function(e) {
            const target =
                e.target.closest(
                    '[data-action]'
                );

            if (!target) {
                return;
            }

            const action =
                target.dataset.action;

            const onboardingEl =
                document.querySelector(
                    '.onboarding'
                );

            if (!onboardingEl) {
                return;
            }

            /*
             * Эти действия относятся к шагам онбординга.
             */
            if (
                action !== 'next-step' &&
                action !== 'prev-step' &&
                action !== 'skip-step' &&
                action !== 'finish-onboarding'
            ) {
                return;
            }

            const step =
                STEPS[currentStep];

            if (!step) {
                return;
            }

            /*
             * ====================================================
             * INPUT
             * ====================================================
             */

            if (step.type === 'input') {
                const input =
                    document.getElementById(
                        'onboarding-input'
                    );

                if (input) {
                    tempData[step.key] =
                        input.value.trim();
                }
            }

            /*
             * ====================================================
             * CHOICE
             * ====================================================
             */

            if (step.type === 'choice') {
                const key =
                    step.key;

                const selected =
                    document.querySelector(
                        `.btn-group button[data-choice="${key}"].primary`
                    );

                if (selected) {
                    tempData[key] =
                        selected.dataset.value;
                }

                /*
                 * Сохраняем дату начала прикорма.
                 */
                if (
                    key ===
                    'feedingStarted'
                ) {
                    const started =
                        tempData.feedingStarted ===
                        'Да';

                    const dateInput =
                        document.getElementById(
                            'onboarding-start-date'
                        );

                    if (
                        started &&
                        dateInput
                    ) {
                        tempData.feedingStartDate =
                            dateInput.value || '';
                    } else if (!started) {
                        tempData.feedingStartDate =
                            '';
                    }

                    const field =
                        document.getElementById(
                            'start-date-field'
                        );

                    if (field) {
                        field.style.display =
                            started
                                ? 'block'
                                : 'none';
                    }
                }
            }

            /*
             * ====================================================
             * CHECKBOXES
             * ====================================================
             */

            if (step.type === 'checkboxes') {
                const checks =
                    document.querySelectorAll(
                        '.step-checkbox:checked'
                    );

                const values =
                    Array.from(checks).map(
                        function(el) {
                            return el.value;
                        }
                    );

                const key =
                    step.key;

                /*
                 * READINESS
                 */
                if (key === 'readiness') {
                    const mapping =
                        step.mapping || {};

                    const r = {};

                    Object.keys(mapping).forEach(
                        function(k) {
                            r[mapping[k]] =
                                false;
                        }
                    );

                    values.forEach(
                        function(val) {
                            if (
                                mapping[val]
                            ) {
                                r[
                                    mapping[val]
                                ] = true;
                            }
                        }
                    );

                    tempData.readiness =
                        r;
                } else {
                    const filtered =
                        values.filter(
                            function(v) {
                                return !SKIP_VALUES.includes(
                                    v
                                );
                            }
                        );

                    tempData[key] =
                        filtered;
                }
            }

            /*
             * ====================================================
             * ПРОПУСТИТЬ
             * ====================================================
             */

            if (action === 'skip-step') {
                currentStep++;

                if (
                    currentStep >=
                    STEPS.length
                ) {
                    currentStep =
                        STEPS.length - 1;
                }

                refreshOnboarding();

                return;
            }

            /*
             * ====================================================
             * НАЗАД
             * ====================================================
             */

            if (action === 'prev-step') {
                if (currentStep > 0) {
                    currentStep--;
                }

                refreshOnboarding();

                return;
            }

            /*
             * ====================================================
             * ДАЛЕЕ
             * ====================================================
             */

            if (action === 'next-step') {
                currentStep++;

                if (
                    currentStep >=
                    STEPS.length
                ) {
                    currentStep =
                        STEPS.length - 1;
                }

                refreshOnboarding();

                return;
            }

            /*
             * ====================================================
             * ЗАВЕРШЕНИЕ
             * ====================================================
             */

            if (
                action ===
                'finish-onboarding'
            ) {
                finishOnboarding();

                return;
            }
        }
    );

    /*
     * ============================================================
     * ЗАВЕРШЕНИЕ ОНБОРДИНГА (ИСПРАВЛЕНО)
     * ============================================================
     */

    function finishOnboarding() {
        const state =
            typeof STATE !== 'undefined'
                ? STATE
                : window.STATE;

        if (
            !targetChildId &&
            state
        ) {
            targetChildId =
                state._onboardingChildId ||
                null;
        }

        const child =
            getTargetChild();

        if (!child || !state) {
            console.error(
                '❌ Ребёнок не найден для завершения онбординга',
                {
                    targetChildId:
                        targetChildId,
                    stateOnboardingChildId:
                        state?._onboardingChildId,
                    currentChildId:
                        state?.currentChildId,
                    children:
                        state?.children?.map(
                            function(c) {
                                return {
                                    id: c.id,
                                    name: c.name
                                };
                            }
                        )
                }
            );

            if (
                typeof render ===
                'function'
            ) {
                state.ui =
                    state.ui || {};

                state.navigation =
                    state.navigation || {};

                state.ui.screen =
                    'baby';

                state.navigation.currentScreen =
                    'baby';

                render('baby');
            }

            return;
        }

        /*
         * ========================================================
         * ОСНОВНЫЕ ДАННЫЕ
         * ========================================================
         */

        if (
            tempData.name !==
            undefined
        ) {
            child.name =
                tempData.name;
        }

        if (
            tempData.birthDate !==
            undefined
        ) {
            child.birthDate =
                tempData.birthDate;
        }

        if (
            tempData.sex !==
            undefined
        ) {
            child.sex =
                tempData.sex;
        }

        if (
            tempData.feedingType !==
            undefined
        ) {
            child.feedingType =
                tempData.feedingType;
        }

        if (
            tempData.feedingStarted !==
            undefined
        ) {
            child.feedingStarted =
                tempData.feedingStarted ===
                'Да';
        }

        if (
            tempData.feedingStartDate !==
            undefined
        ) {
            child.feedingStartDate =
                tempData.feedingStartDate;
        }

        if (
            tempData.approach !==
            undefined
        ) {
            child.approach =
                tempData.approach;
        }

        if (
            tempData.readiness !==
            undefined
        ) {
            child.readiness =
                tempData.readiness;
        }

        /*
         * ========================================================
         * ONBOARDING ДАННЫЕ
         * ========================================================
         */

        if (!child.onboarding) {
            child.onboarding = {};
        }

        if (
            tempData.allergies !==
            undefined
        ) {
            child.onboarding.allergies =
                tempData.allergies;
        }

        if (
            tempData.diet !==
            undefined
        ) {
            child.onboarding.diet =
                tempData.diet;
        }

        if (
            tempData.favoriteFoods !==
            undefined
        ) {
            child.onboarding.favoriteFoods =
                tempData.favoriteFoods;
        }

        if (
            tempData.worries !==
            undefined
        ) {
            child.onboarding.worries =
                tempData.worries;
        }

        if (
            tempData.confidence !==
            undefined
        ) {
            child.onboarding.confidence =
                tempData.confidence;
        }

        /*
         * ========================================================
         * ДЕЛАЕМ ЭТОГО РЕБЁНКА ТЕКУЩИМ
         * ========================================================
         */

        state.currentChildId =
            child.id;

        /*
         * Онбординг завершён.
         */
        state._onboardingChildId =
            null;

        /*
         * Сбрасываем режим онбординга (если он используется)
         */
        state._onboardingMode =
            null;

        /*
         * Первый ребёнок:
         * завершаем общий onboarding.
         *
         * Второй/третий и т.д.:
         * onboardingCompleted уже true,
         * поэтому это значение не меняем.
         */
        if (
            state.children.length ===
                1 &&
            state.onboardingCompleted ===
                false
        ) {
            state.onboardingCompleted =
                true;
        }

        /*
         * ========================================================
         * ПЕРЕХОД НА ГЛАВНУЮ (home)
         * ========================================================
         */

        state.ui =
            state.ui || {};

        state.navigation =
            state.navigation || {};

        state.ui.screen =
            'home';

        state.navigation.currentScreen =
            'home';

        /*
         * Сохраняем состояние.
         */
        if (
            typeof saveState ===
            'function'
        ) {
            saveState();
        }

        /*
         * ========================================================
         * ОЧИЩАЕМ ВРЕМЕННЫЕ ДАННЫЕ
         * ========================================================
         */

        currentStep = 0;
        tempData = {};
        targetChildId = null;

        /*
         * ========================================================
         * РЕНДЕР ГЛАВНОЙ
         * ========================================================
         */

        if (
            typeof render ===
            'function'
        ) {
            render('home');
        }

        /*
         * Уведомляем остальные части приложения,
         * что STATE изменился.
         */
        window.dispatchEvent(
            new CustomEvent(
                'prikorm:statechange'
            )
        );

        console.log(
            '✅ Онбординг завершён (переход на home):',
            {
                childId: child.id,
                childName: child.name,
                totalChildren:
                    state.children.length
            }
        );
    }

    console.log(
        '✅ onboarding.js загружен (финальная версия, переход на home)'
    );
})();