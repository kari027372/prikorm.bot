// screens/onboarding.js
(function () {
    'use strict';

    // ============================================================
    // ONBOARDING 3.0
    //
    // Медицинская логика:
    // - не использует ГВ/ИВ как самостоятельный критерий начала прикорма
    // - для доношенных учитывает календарный возраст + готовность
    // - для недоношенных учитывает календарный + скорректированный возраст
    //   + неврологическую/оральную готовность
    // - не использует искусственное правило "3 из 4 = готов"
    // - не ставит медицинские диагнозы
    // ============================================================


    // ============================================================
    // СПРАВОЧНИКИ
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

    const EXCLUSIVE_OPTIONS = [
        'Нет',
        'Нет известных пищевых аллергий',
        'Не знаю',
        'Пока не знаю'
    ];


    // ============================================================
    // ШАГИ
    // ============================================================

    const STEPS = [

        // --------------------------------------------------------
        // 1. ИМЯ
        // --------------------------------------------------------

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

        // --------------------------------------------------------
        // 2. ДАТА РОЖДЕНИЯ
        // --------------------------------------------------------

        {
            id: 'birth',
            emoji: '📅',
            title: 'Когда родился малыш?',
            desc: 'По этой дате мы рассчитаем календарный возраст',
            type: 'input',
            inputType: 'date',
            key: 'birthDate'
        },

        // --------------------------------------------------------
        // 3. ГЕСТАЦИОННЫЙ ВОЗРАСТ
        // --------------------------------------------------------

        {
            id: 'gestational',
            emoji: '🤰',
            title: 'На каком сроке родился малыш?',
            desc: 'Это особенно важно для детей, родившихся раньше срока.',
            type: 'gestational',
            key: 'gestational'
        },

        // --------------------------------------------------------
        // 4. ТИП МОЛОЧНОГО ВСКАРМЛИВАНИЯ
        // --------------------------------------------------------

        {
            id: 'feeding_type',
            emoji: '🍼',
            title: 'Как малыш получает молоко?',
            desc: 'Это поможет составить индивидуальный профиль.',
            type: 'choice',
            options: [
                'Грудное вскармливание',
                'Искусственное вскармливание',
                'Смешанное вскармливание'
            ],
            values: [
                'breast',
                'formula',
                'mixed'
            ],
            key: 'feedingType'
        },

        // --------------------------------------------------------
        // 5. НАЧАТ ЛИ ПРИКОРМ
        // --------------------------------------------------------

        {
            id: 'started',
            emoji: '🌱',
            title: 'Начал ли ребёнок прикорм?',
            desc: 'Если уже начали — это нормально указать. Мы учтём это в профиле.',
            type: 'choice',
            options: [
                'Да',
                'Нет'
            ],
            key: 'feedingStarted',
            extra: 'start-date-field'
        },

        // --------------------------------------------------------
        // 6. ПОДХОД
        // --------------------------------------------------------

        {
            id: 'approach',
            emoji: '🥄',
            title: 'Какой подход к прикорму вам ближе?',
            desc: 'Это ваше предпочтение, а не медицинское правило.',
            type: 'choice',
            options: [
                'Пюре',
                'BLW',
                'Комбинированный',
                'Пока не знаю'
            ],
            key: 'approach'
        },

        // --------------------------------------------------------
        // 7. ГОТОВНОСТЬ
        // --------------------------------------------------------

        {
            id: 'readiness',
            emoji: '🧸',
            title: 'Признаки готовности к прикорму',
            desc: 'Отвечайте по тому, что действительно наблюдаете у малыша.',
            type: 'readiness_checkboxes',
            key: 'readiness',

            questions: [

                {
                    label: 'Малыш уверенно удерживает голову и шею?',
                    id: 'headControl'
                },

                {
                    label: 'Малыш может находиться в достаточно вертикальном и устойчивом положении с поддержкой туловища?',
                    id: 'posturalStability'
                },

                {
                    label: 'Малыш проявляет интерес к еде и может целенаправленно тянуться к ней?',
                    id: 'foodInterest'
                },

                {
                    label: 'Малыш открывает рот, когда ему предлагают пищу?',
                    id: 'opensMouth'
                },

                {
                    label: 'Малыш способен перемещать пищу во рту и глотать её, а не постоянно выталкивать языком?',
                    id: 'oralMotorSkills'
                },

                {
                    label: 'Во время кормления нет выраженных проблем с координацией сосание–глотание–дыхание?',
                    id: 'breathingCoordination'
                }

            ],

            options: [
                'Да',
                'Нет',
                'Не уверена'
            ]
        },

        // --------------------------------------------------------
        // 8. АЛЛЕРГИИ
        // --------------------------------------------------------

        {
            id: 'allergies',
            emoji: '⚠️',
            title: 'Есть ли у малыша известные пищевые аллергии?',
            desc: 'Отметьте только то, что уже известно.',
            type: 'checkboxes',
            options: [
                ...ALLERGENS_LIST,
                'Нет известных пищевых аллергий',
                'Не знаю'
            ],
            key: 'allergies',
            exclusive: true
        },

        // --------------------------------------------------------
        // 9. ОСОБЕННОСТИ ПИТАНИЯ
        // --------------------------------------------------------

        {
            id: 'diet',
            emoji: '🥗',
            title: 'Есть ли особенности питания?',
            desc: 'Например, назначенная врачом диета или проблемы с кормлением.',
            type: 'checkboxes',
            options: DIET_OPTIONS,
            key: 'diet',
            exclusive: true
        },

        // --------------------------------------------------------
        // 10. ПРЕДПОЧТЕНИЯ
        // --------------------------------------------------------

        {
            id: 'favorites',
            emoji: '🍎',
            title: 'Какие продукты вам было бы интересно готовить малышу?',
            desc: 'Это ваши предпочтения, а не список обязательных первых продуктов.',
            type: 'checkboxes',
            options: FAVORITE_FOODS,
            key: 'favoriteFoods',
            exclusive: true
        },

        // --------------------------------------------------------
        // 11. ТРЕВОГИ
        // --------------------------------------------------------

        {
            id: 'worries',
            emoji: '💛',
            title: 'Что вас больше всего беспокоит?',
            desc: 'Можно выбрать несколько вариантов.',
            type: 'checkboxes',
            options: WORRY_OPTIONS,
            key: 'worries'
        },

        // --------------------------------------------------------
        // 12. УВЕРЕННОСТЬ
        // --------------------------------------------------------

        {
            id: 'confidence',
            emoji: '💪',
            title: 'Насколько уверенно вы чувствуете себя в вопросах прикорма?',
            desc: '',
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


    // ============================================================
    // СОСТОЯНИЕ
    // ============================================================

    let currentStep = 0;
    let tempData = {};
    let targetChildId = null;


    // ============================================================
    // БЕЗОПАСНЫЙ HTML
    // ============================================================

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    // ============================================================
    // STATE
    // ============================================================

    function getState() {
        return window.STATE || {};
    }


    function getTargetChild() {
        const state = getState();

        const id =
            targetChildId ||
            state._onboardingChildId ||
            state.currentChildId;

        if (!id) {
            console.error('❌ onboarding: child id не найден');
            return null;
        }

        const children =
            Array.isArray(state.children)
                ? state.children
                : [];

        const child =
            children.find(child => child.id === id) || null;

        if (!child) {
            console.error('❌ onboarding: ребёнок не найден', {
                id,
                children: children.map(c => c.id)
            });
        }

        return child;
    }


    // ============================================================
    // ДАТЫ
    // ============================================================

    function parseDateOnly(value) {
        if (!value) return null;

        const parts = String(value).split('-');

        if (parts.length !== 3) {
            return null;
        }

        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        if (
            !Number.isFinite(year) ||
            !Number.isFinite(month) ||
            !Number.isFinite(day)
        ) {
            return null;
        }

        return new Date(year, month - 1, day);
    }


    function calculateAge(birthDate) {

        const birth = parseDateOnly(birthDate);

        if (!birth) {
            return {
                valid: false,
                days: 0,
                weeks: 0,
                months: 0,
                years: 0
            };
        }

        const now = new Date();

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        if (birth > today) {
            return {
                valid: false,
                days: 0,
                weeks: 0,
                months: 0,
                years: 0
            };
        }

        const diffMs =
            today.getTime() -
            birth.getTime();

        const days =
            Math.floor(
                diffMs /
                (1000 * 60 * 60 * 24)
            );

        const weeks =
            Math.floor(days / 7);

        let months =
            (today.getFullYear() - birth.getFullYear()) * 12 +
            (today.getMonth() - birth.getMonth());

        if (today.getDate() < birth.getDate()) {
            months--;
        }

        months = Math.max(0, months);

        let years =
            today.getFullYear() -
            birth.getFullYear();

        if (
            today.getMonth() < birth.getMonth() ||
            (
                today.getMonth() === birth.getMonth() &&
                today.getDate() < birth.getDate()
            )
        ) {
            years--;
        }

        return {
            valid: true,
            days: Math.max(0, days),
            weeks: Math.max(0, weeks),
            months: Math.max(0, months),
            years: Math.max(0, years)
        };
    }


    // ============================================================
    // ГЕСТАЦИОННЫЙ ВОЗРАСТ
    // ============================================================

    function normalizeGestationalAge(weeks, days) {

        let w = parseInt(weeks, 10);
        let d = parseInt(days, 10);

        if (!Number.isFinite(w)) {
            return null;
        }

        if (!Number.isFinite(d)) {
            d = 0;
        }

        if (d < 0) d = 0;

        if (d > 6) {
            w += Math.floor(d / 7);
            d = d % 7;
        }

        return {
            weeks: w,
            days: d,
            totalDays: w * 7 + d
        };
    }


    function getBirthTermCategory(weeks, days) {

        const gestational =
            normalizeGestationalAge(
                weeks,
                days
            );

        if (!gestational) {
            return 'unknown';
        }

        const totalDays =
            gestational.totalDays;

        // WHO / стандартная акушерская классификация:
        // < 37+0 = preterm
        // 37+0 – 38+6 = early term
        // 39+0 – 40+6 = full term
        // 41+0 – 41+6 = late term
        // >= 42+0 = post term

        if (totalDays < 259) {
            return 'preterm';
        }

        if (totalDays < 273) {
            return 'early_term';
        }

        if (totalDays < 287) {
            return 'full_term';
        }

        if (totalDays < 294) {
            return 'late_term';
        }

        return 'post_term';
    }


    // ============================================================
    // НЕДОСТАЮЩИЙ СРОК ДО 40 НЕДЕЛЬ
    // ============================================================

    function calculatePrematurityGap(
        gestationalWeeks,
        gestationalDays
    ) {

        const gestational =
            normalizeGestationalAge(
                gestationalWeeks,
                gestationalDays
            );

        if (!gestational) {
            return null;
        }

        const termDays = 40 * 7;

        const gap =
            Math.max(
                0,
                termDays -
                gestational.totalDays
            );

        return gap;
    }


    // ============================================================
    // СКОРРЕКТИРОВАННЫЙ ВОЗРАСТ
    // ============================================================

    function calculateCorrectedAge(
        birthDate,
        gestationalWeeks,
        gestationalDays
    ) {

        const chronological =
            calculateAge(birthDate);

        if (!chronological.valid) {
            return {
                valid: false,
                days: 0,
                weeks: 0,
                months: 0
            };
        }

        const category =
            getBirthTermCategory(
                gestationalWeeks,
                gestationalDays
            );

        if (category !== 'preterm') {
            return {
                valid: true,
                days: chronological.days,
                weeks: chronological.weeks,
                months: chronological.months
            };
        }

        const gap =
            calculatePrematurityGap(
                gestationalWeeks,
                gestationalDays
            );

        if (gap === null) {
            return {
                valid: false,
                days: 0,
                weeks: 0,
                months: 0
            };
        }

        const correctedDays =
            Math.max(
                0,
                chronological.days - gap
            );

        return {
            valid: true,
            days: correctedDays,
            weeks: Math.floor(correctedDays / 7),
            months: Math.floor(correctedDays / 30.4375)
        };
    }


    // ============================================================
    // ИНФОРМАЦИЯ О СРОКЕ
    // ============================================================

    function getTermMessage(category) {

        const map = {

            preterm:
                'Малыш родился раньше 37 полных недель. Для оценки прикорма мы будем учитывать не только календарный, но и скорректированный возраст и признаки развития.',

            early_term:
                'Малыш родился на раннем доношенном сроке. Отдельная коррекция возраста обычно не требуется.',

            full_term:
                'Малыш родился в доношенный срок.',

            late_term:
                'Малыш родился на позднем доношенном сроке.',

            post_term:
                'Малыш родился после 42 полных недель.',

            unknown:
                'Срок рождения не указан. В таком случае мы не будем предполагать недоношенность и будем использовать доступные данные.'
        };

        return map[category] || '';
    }


    // ============================================================
    // ГОТОВНОСТЬ
    // ============================================================

    function getReadinessFlags(readiness) {

        if (!readiness || typeof readiness !== 'object') {
            return {
                headControl: null,
                posturalStability: null,
                foodInterest: null,
                opensMouth: null,
                oralMotorSkills: null,
                breathingCoordination: null
            };
        }

        return {
            headControl:
                typeof readiness.headControl === 'boolean'
                    ? readiness.headControl
                    : null,

            posturalStability:
                typeof readiness.posturalStability === 'boolean'
                    ? readiness.posturalStability
                    : null,

            foodInterest:
                typeof readiness.foodInterest === 'boolean'
                    ? readiness.foodInterest
                    : null,

            opensMouth:
                typeof readiness.opensMouth === 'boolean'
                    ? readiness.opensMouth
                    : null,

            oralMotorSkills:
                typeof readiness.oralMotorSkills === 'boolean'
                    ? readiness.oralMotorSkills
                    : null,

            breathingCoordination:
                typeof readiness.breathingCoordination === 'boolean'
                    ? readiness.breathingCoordination
                    : null
        };
    }


    function assessReadiness(
        readiness,
        birthDate,
        gestationalWeeks,
        gestationalDays
    ) {

        const age =
            calculateAge(birthDate);

        const category =
            getBirthTermCategory(
                gestationalWeeks,
                gestationalDays
            );

        const isPreterm =
            category === 'preterm';

        const corrected =
            calculateCorrectedAge(
                birthDate,
                gestationalWeeks,
                gestationalDays
            );

        const flags =
            getReadinessFlags(readiness);


        // --------------------------------------------------------
        // Нет даты рождения
        // --------------------------------------------------------

        if (!age.valid) {

            return {
                status: 'insufficient_data',

                code: 'birth_date_missing',

                message:
                    'Чтобы оценить время начала прикорма, сначала укажите дату рождения.'
            };
        }


        // --------------------------------------------------------
        // Безопасность кормления
        // --------------------------------------------------------

        if (
            flags.breathingCoordination === false ||
            flags.oralMotorSkills === false
        ) {

            return {
                status: 'needs_review',

                code: 'feeding_safety',

                message:
                    'Есть признаки, которые могут указывать на то, что навыки безопасного приёма пищи ещё не сформированы полностью. Перед началом или расширением прикорма лучше обсудить готовность малыша с педиатром или специалистом по кормлению.'
            };
        }


        // --------------------------------------------------------
        // Слишком ранний возраст
        //
        // Для доношенных:
        // ESPGHAN — не раньше 17 полных недель.
        //
        // Для недоношенных:
        // не используем 17 недель как автоматическое разрешение.
        // Главный ориентир — развитие + индивидуальная оценка.
        // --------------------------------------------------------

        if (!isPreterm && age.weeks < 17) {

            return {
                status: 'too_early',

                code: 'under_17_weeks',

                message:
                    'Сейчас малыш ещё младше 17 полных недель. Для здоровых доношенных детей прикорм обычно не начинают так рано. Пока можно наблюдать за развитием и готовностью.'
            };
        }


        // --------------------------------------------------------
        // НЕДОНОШЕННЫЙ РЕБЁНОК
        // --------------------------------------------------------

        if (isPreterm) {

            const developmentalCore = [

                flags.headControl,
                flags.posturalStability,
                flags.oralMotorSkills,
                flags.breathingCoordination

            ];

            const knownCore =
                developmentalCore.filter(
                    value => value !== null
                );

            const positiveCore =
                developmentalCore.filter(
                    value => value === true
                );

            // Если критически важные навыки неизвестны
            if (knownCore.length < 4) {

                return {
                    status: 'needs_more_information',

                    code: 'preterm_incomplete_readiness',

                    message:
                        'Малыш родился раньше срока. Для него особенно важно оценивать не только календарный возраст, но и скорректированный возраст и навыки безопасного кормления. Заполните признаки готовности максимально точно.'
                };
            }


            // Если основные безопасные навыки отрицательные
            if (positiveCore.length < 4) {

                return {
                    status: 'developing',

                    code: 'preterm_skills_developing',

                    message:
                        'У недоношенного малыша некоторые важные навыки для безопасного приёма пищи ещё формируются. Это не означает, что с ребёнком что-то не так. Продолжайте наблюдать за развитием; время начала прикорма лучше определять индивидуально.'
                };
            }


            // Если все ключевые навыки есть
            //
            // Здесь мы НЕ говорим "можно начинать прямо сейчас".
            // Потому что для недоношенных время индивидуально.
            //

            return {
                status: 'preterm_ready_to_consider',

                code: 'preterm_developmentally_ready',

                message:
                    'Основные навыки безопасного приёма пищи по вашим ответам сформированы. Поскольку малыш родился раньше срока, приложение учитывает и календарный, и скорректированный возраст. Время начала прикорма определяется индивидуально с учётом развития и состояния ребёнка.'
            };
        }


        // --------------------------------------------------------
        // ДОНОШЕННЫЙ РЕБЁНОК
        // --------------------------------------------------------

        const coreSkills = [

            flags.headControl,
            flags.posturalStability,
            flags.oralMotorSkills,
            flags.breathingCoordination

        ];

        const coreKnown =
            coreSkills.filter(
                value => value !== null
            );

        const allCorePositive =
            coreKnown.length === 4 &&
            coreSkills.every(
                value => value === true
            );


        // --------------------------------------------------------
        // 17–26 недель
        // --------------------------------------------------------

        if (age.weeks >= 17 && age.weeks < 26) {

            if (allCorePositive) {

                return {
                    status: 'possible_window',

                    code: '17_26_weeks_ready',

                    message:
                        'Малыш находится в возрастном окне, в котором для здоровых доношенных детей прикорм может рассматриваться при наличии признаков готовности. По вашим ответам основные навыки выглядят сформированными.'
                };
            }

            return {
                status: 'developing',

                code: '17_26_weeks_not_ready',

                message:
                    'Малыш находится в возрастном окне, когда прикорм может рассматриваться, но некоторые важные навыки ещё не сформированы полностью. Можно продолжать наблюдать за развитием.'
            };
        }


        // --------------------------------------------------------
        // >= 26 недель
        // --------------------------------------------------------

        if (age.weeks >= 26) {

            if (allCorePositive) {

                return {
                    status: 'appropriate_age_ready',

                    code: '26_weeks_plus_ready',

                    message:
                        'Малыш достиг примерно 6 месяцев, и по вашим ответам основные навыки безопасного приёма пищи сформированы. Это соответствует возрасту, когда прикорм обычно уже вводят.'
                };
            }

            return {
                status: 'appropriate_age_developing',

                code: '26_weeks_plus_skills_developing',

                message:
                    'Малыш достиг возраста около 6 месяцев, однако некоторые важные навыки безопасного приёма пищи ещё не сформированы полностью. Не нужно заставлять малыша есть — лучше оценить готовность и при необходимости обсудить её со специалистом.'
            };
        }


        // --------------------------------------------------------
        // FALLBACK
        // --------------------------------------------------------

        return {
            status: 'developing',

            code: 'fallback',

            message:
                'Продолжайте наблюдать за развитием малыша и признаками готовности к прикорму.'
        };
    }


    // ============================================================
    // ФОРМАТИРОВАНИЕ ВОЗРАСТА
    // ============================================================

    function formatAge(age) {

        if (!age || !age.valid) {
            return '';
        }

        if (age.months < 2) {
            return `${age.weeks} нед.`;
        }

        return `${age.months} мес.`;
    }


    // ============================================================
    // СОХРАНЕНИЕ ТЕКУЩЕГО ШАГА
    // ============================================================

    function saveCurrentStep() {

        const step =
            STEPS[currentStep];

        if (!step) return;


        // --------------------------------------------------------
        // INPUT
        // --------------------------------------------------------

        if (step.type === 'input') {

            const input =
                document.getElementById(
                    'onboarding-input'
                );

            if (input) {

                tempData[step.key] =
                    input.value.trim();
            }

            return;
        }


        // --------------------------------------------------------
        // CHOICE
        // --------------------------------------------------------

        if (step.type === 'choice') {

            const selected =
                document.querySelector(
                    `.btn-group button[data-choice="${step.key}"].primary`
                );

            if (selected) {

                tempData[step.key] =
                    selected.dataset.value;
            }


            if (step.key === 'feedingStarted') {

                const started =
                    tempData.feedingStarted === 'Да';

                const dateInput =
                    document.getElementById(
                        'onboarding-start-date'
                    );

                if (started && dateInput) {

                    tempData.feedingStartDate =
                        dateInput.value || '';

                } else if (!started) {

                    tempData.feedingStartDate = '';
                }
            }

            return;
        }


        // --------------------------------------------------------
        // CHECKBOXES
        // --------------------------------------------------------

        if (
            step.type === 'checkboxes'
        ) {

            const checks =
                document.querySelectorAll(
                    '.step-checkbox:checked'
                );

            tempData[step.key] =
                Array.from(checks)
                    .map(el => el.value);

            return;
        }


        // --------------------------------------------------------
        // READINESS
        // --------------------------------------------------------

        if (
            step.type === 'readiness_checkboxes'
        ) {

            const readiness = {};

            const questions =
                step.questions || [];

            questions.forEach(question => {

                const input =
                    document.querySelector(
                        `input[name="readiness_${question.id}"]:checked`
                    );

                if (!input) {

                    readiness[question.id] = null;

                } else {

                    readiness[question.id] =
                        input.value === 'Да';
                }
            });

            tempData.readiness =
                readiness;

            return;
        }


        // --------------------------------------------------------
        // GESTATIONAL
        // --------------------------------------------------------

        if (
            step.type === 'gestational'
        ) {

            const weeks =
                document.getElementById(
                    'gestational-weeks'
                )?.value;

            const days =
                document.getElementById(
                    'gestational-days'
                )?.value;

            const unknown =
                document.getElementById(
                    'gestational-unknown'
                )?.checked || false;

            tempData.gestationalWeeks =
                weeks !== ''
                    ? parseInt(weeks, 10)
                    : '';

            tempData.gestationalDays =
                days !== ''
                    ? parseInt(days, 10)
                    : '';

            tempData.gestationalUnknown =
                unknown;
        }
    }


    // ============================================================
    // РЕНДЕР ШАГА
    // ============================================================

    function renderStep() {

        const step =
            STEPS[currentStep];

        if (!step) {
            return '';
        }


        const child =
            getTargetChild();

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


        // --------------------------------------------------------
        // ДАННЫЕ ДЛЯ ВОЗРАСТА
        // --------------------------------------------------------

        const birthDate =
            tempData.birthDate ||
            child.birthDate ||
            '';

        const age =
            calculateAge(birthDate);


        let gestationalWeeks =
            tempData.gestationalWeeks !== undefined
                ? tempData.gestationalWeeks
                : (
                    child.gestationalAgeWeeks ??
                    ''
                );

        let gestationalDays =
            tempData.gestationalDays !== undefined
                ? tempData.gestationalDays
                : (
                    child.gestationalAgeDays ??
                    ''
                );


        const gestationalUnknown =
            tempData.gestationalUnknown !== undefined
                ? tempData.gestationalUnknown
                : (
                    child.birthTermCategory === 'unknown'
                );


        const termCategory =
            gestationalUnknown
                ? 'unknown'
                : getBirthTermCategory(
                    gestationalWeeks,
                    gestationalDays
                );


        let html =
            `<div class="onboarding">`;


        // --------------------------------------------------------
        // ПРОГРЕСС
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // HEADER
        // --------------------------------------------------------

        html += `
            <div class="emoji-big">
                ${escapeHtml(step.emoji)}
            </div>

            <h1>
                ${escapeHtml(step.title)}
            </h1>

            ${
                step.desc
                    ? `
                        <p>
                            ${escapeHtml(step.desc)}
                        </p>
                    `
                    : ''
            }
        `;


        // ========================================================
        // INPUT
        // ========================================================

        if (step.type === 'input') {

            const value =
                tempData[step.key] !== undefined
                    ? tempData[step.key]
                    : (
                        child[step.key] ||
                        ''
                    );

            html += `
                <input
                    type="${escapeHtml(step.inputType)}"
                    id="onboarding-input"
                    placeholder="${escapeHtml(step.placeholder || '')}"
                    value="${escapeHtml(value)}"
                    autocomplete="${
                        step.key === 'name'
                            ? 'name'
                            : 'off'
                    }"
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


            // ----------------------------------------------------
            // Возраст после даты
            // ----------------------------------------------------

            if (
                step.key === 'birthDate' &&
                age.valid
            ) {

                html += `
                    <div
                        style="
                            margin-top:12px;
                            padding:10px 12px;
                            border-radius:8px;
                            background:#f7f7f7;
                            font-size:.9rem;
                        "
                    >
                        Сейчас малышу примерно:
                        <strong>
                            ${escapeHtml(formatAge(age))}
                        </strong>
                    </div>
                `;
            }
        }


        // ========================================================
        // CHOICE
        // ========================================================

        if (step.type === 'choice') {

            html += `
                <div
                    class="btn-group"
                    role="group"
                >
            `;


            step.options.forEach(
                (option, index) => {

                    let currentValue =
                        tempData[step.key] !== undefined
                            ? tempData[step.key]
                            : '';


                    // --------------------------------------------
                    // Feeding type
                    // --------------------------------------------

                    if (
                        !currentValue &&
                        step.key === 'feedingType'
                    ) {

                        const reverse = {

                            breast:
                                'Грудное вскармливание',

                            formula:
                                'Искусственное вскармливание',

                            mixed:
                                'Смешанное вскармливание'
                        };

                        currentValue =
                            reverse[
                                child.feedingType
                            ] || '';
                    }


                    // --------------------------------------------
                    // Feeding started
                    // --------------------------------------------

                    if (
                        !currentValue &&
                        step.key === 'feedingStarted'
                    ) {

                        if (
                            child.feedingStarted === true
                        ) {

                            currentValue = 'Да';

                        } else if (
                            child.feedingStarted === false
                        ) {

                            currentValue = 'Нет';
                        }
                    }


                    const value =
                        step.values
                            ? step.values[index]
                            : option;


                    const selected =
                        currentValue === option ||
                        currentValue === value;


                    html += `
                        <button
                            class="${
                                selected
                                    ? 'primary'
                                    : ''
                            }"
                            data-value="${escapeHtml(option)}"
                            data-choice="${escapeHtml(step.key)}"
                            type="button"
                        >
                            ${escapeHtml(option)}
                        </button>
                    `;
                }
            );


            html += `
                </div>
            `;


            // ----------------------------------------------------
            // Дата начала прикорма
            // ----------------------------------------------------

            if (
                step.extra === 'start-date-field'
            ) {

                const started =
                    tempData.feedingStarted !== undefined
                        ? tempData.feedingStarted
                        : (
                            child.feedingStarted === true
                                ? 'Да'
                                : ''
                        );


                const startDate =
                    tempData.feedingStartDate !== undefined
                        ? tempData.feedingStartDate
                        : (
                            child.feedingStartDate ||
                            ''
                        );


                html += `
                    <div
                        id="start-date-field"
                        style="
                            display:${
                                started === 'Да'
                                    ? 'block'
                                    : 'none'
                            };
                            margin-top:16px;
                        "
                    >

                        <label>
                            Дата начала прикорма
                        </label>

                        <input
                            type="date"
                            id="onboarding-start-date"
                            value="${escapeHtml(startDate)}"
                        >

                    </div>
                `;


                // ------------------------------------------------
                // Предупреждение если уже начали очень рано
                // ------------------------------------------------

                if (
                    started === 'Да' &&
                    age.valid &&
                    termCategory !== 'preterm' &&
                    age.weeks < 17
                ) {

                    html += `
                        <div
                            style="
                                margin-top:14px;
                                padding:12px;
                                border-radius:8px;
                                background:#fff4e5;
                                border-left:4px solid #f39c12;
                            "
                        >

                            ⚠️
                            <strong>
                                Обратите внимание
                            </strong>

                            <br>

                            Вы указали, что прикорм уже начат
                            до 17 полных недель.
                            Если это не было частью
                            индивидуального плана врача,
                            обсудите это с педиатром.

                        </div>
                    `;
                }


                // ------------------------------------------------
                // Недоношенный
                // ------------------------------------------------

                if (
                    started === 'Да' &&
                    termCategory === 'preterm'
                ) {

                    html += `
                        <div
                            style="
                                margin-top:14px;
                                padding:12px;
                                border-radius:8px;
                                background:#f7f1ff;
                                border-left:4px solid #8e44ad;
                            "
                        >

                            👶
                            <strong>
                                Малыш родился раньше срока
                            </strong>

                            <br>

                            Для недоношенных время начала
                            прикорма оценивается индивидуально
                            с учётом развития и навыков
                            безопасного кормления.

                        </div>
                    `;
                }
            }
        }


        // ========================================================
        // GESTATIONAL
        // ========================================================

        if (
            step.type === 'gestational'
        ) {

            html += `
                <div
                    style="
                        display:flex;
                        gap:12px;
                        margin-top:12px;
                    "
                >

                    <label>
                        Недели

                        <input
                            type="number"
                            id="gestational-weeks"
                            min="20"
                            max="43"
                            value="${escapeHtml(gestationalWeeks)}"
                            placeholder="39"
                        >
                    </label>


                    <label>
                        Дни

                        <input
                            type="number"
                            id="gestational-days"
                            min="0"
                            max="6"
                            value="${escapeHtml(gestationalDays)}"
                            placeholder="0"
                        >
                    </label>

                </div>


                <label
                    style="
                        display:block;
                        margin-top:12px;
                    "
                >

                    <input
                        type="checkbox"
                        id="gestational-unknown"
                        ${
                            gestationalUnknown
                                ? 'checked'
                                : ''
                        }
                    >

                    Не знаю

                </label>
            `;


            if (
                !gestationalUnknown &&
                gestationalWeeks !== ''
            ) {

                const category =
                    getBirthTermCategory(
                        gestationalWeeks,
                        gestationalDays
                    );


                const message =
                    getTermMessage(category);


                html += `
                    <div
                        style="
                            margin-top:12px;
                            padding:12px;
                            border-radius:8px;
                            background:#f3f7fa;
                            font-size:.9rem;
                        "
                    >
                        ${escapeHtml(message)}
                    </div>
                `;


                // ------------------------------------------------
                // Скорректированный возраст
                // ------------------------------------------------

                if (
                    category === 'preterm' &&
                    age.valid
                ) {

                    const corrected =
                        calculateCorrectedAge(
                            birthDate,
                            gestationalWeeks,
                            gestationalDays
                        );


                    if (corrected.valid) {

                        html += `
                            <div
                                style="
                                    margin-top:10px;
                                    padding:12px;
                                    border-radius:8px;
                                    background:#f7f1ff;
                                    font-size:.9rem;
                                "
                            >

                                <strong>
                                    Скорректированный возраст:
                                </strong>

                                ${escapeHtml(
                                    formatAge(corrected)
                                )}

                                <br>

                                <small>
                                    Он рассчитывается
                                    с учётом того,
                                    сколько недель
                                    не хватило до 40 недель.
                                </small>

                            </div>
                        `;
                    }
                }
            }
        }


        // ========================================================
        // CHECKBOXES
        // ========================================================

        if (
            step.type === 'checkboxes'
        ) {

            let selected =
                tempData[step.key] !== undefined
                    ? tempData[step.key]
                    : (
                        child.onboarding?.[
                            step.key
                        ] || []
                    );


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


            step.options.forEach(option => {

                const checked =
                    selected.includes(option);


                html += `
                    <label>

                        <input
                            type="checkbox"
                            class="step-checkbox"
                            value="${escapeHtml(option)}"
                            ${
                                checked
                                    ? 'checked'
                                    : ''
                            }
                        >

                        ${escapeHtml(option)}

                    </label>
                `;
            });


            html += `
                </div>
            `;
        }


        // ========================================================
        // READINESS
        // ========================================================

        if (
            step.type === 'readiness_checkboxes'
        ) {

            const saved =
                tempData.readiness !== undefined
                    ? tempData.readiness
                    : (
                        child.readiness || {}
                    );


            html += `
                <div
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:16px;
                        margin-top:12px;
                    "
                >
            `;


            step.questions.forEach(
                question => {

                    const current =
                        saved[
                            question.id
                        ];


                    html += `
                        <div
                            style="
                                background:#f9f9f9;
                                padding:12px;
                                border-radius:8px;
                            "
                        >

                            <p
                                style="
                                    margin:
                                        0 0 8px 0;
                                    font-weight:500;
                                "
                            >
                                ${escapeHtml(
                                    question.label
                                )}
                            </p>


                            <div
                                style="
                                    display:flex;
                                    gap:12px;
                                    flex-wrap:wrap;
                                "
                            >

                                ${
                                    step.options
                                        .map(option => {

                                            let checked =
                                                false;


                                            if (
                                                current === true &&
                                                option === 'Да'
                                            ) {
                                                checked = true;
                                            }


                                            if (
                                                current === false &&
                                                option === 'Нет'
                                            ) {
                                                checked = true;
                                            }


                                            return `
                                                <label
                                                    style="
                                                        display:flex;
                                                        align-items:center;
                                                        gap:4px;
                                                    "
                                                >

                                                    <input
                                                        type="radio"
                                                        name="readiness_${escapeHtml(question.id)}"
                                                        value="${escapeHtml(option)}"
                                                        ${
                                                            checked
                                                                ? 'checked'
                                                                : ''
                                                        }
                                                    >

                                                    ${escapeHtml(option)}

                                                </label>
                                            `;
                                        })
                                        .join('')
                                }

                            </div>

                        </div>
                    `;
                }
            );


            html += `
                </div>
            `;


            // ----------------------------------------------------
            // ОЦЕНКА
            // ----------------------------------------------------

            const readinessData =
                tempData.readiness !== undefined
                    ? tempData.readiness
                    : null;


            if (
                readinessData &&
                Object.keys(readinessData).length ===
                    step.questions.length
            ) {

                const assessment =
                    assessReadiness(
                        readinessData,
                        birthDate,
                        gestationalWeeks,
                        gestationalDays
                    );


                if (
                    assessment &&
                    assessment.message
                ) {

                    let background =
                        '#fff3cd';


                    if (
                        assessment.status ===
                        'appropriate_age_ready'
                    ) {

                        background =
                            '#d4edda';

                    } else if (
                        assessment.status ===
                        'possible_window'
                    ) {

                        background =
                            '#d4edda';

                    } else if (
                        assessment.status ===
                        'needs_review'
                    ) {

                        background =
                            '#f8d7da';

                    } else if (
                        assessment.status ===
                        'too_early'
                    ) {

                        background =
                            '#fff3cd';

                    } else if (
                        assessment.status ===
                        'preterm_ready_to_consider'
                    ) {

                        background =
                            '#e8ddf5';
                    }


                    html += `
                        <div
                            style="
                                background:${background};
                                padding:12px;
                                border-radius:8px;
                                margin-top:16px;
                                font-size:.92rem;
                            "
                        >

                            ${escapeHtml(
                                assessment.message
                            )}

                        </div>
                    `;
                }
            }
        }


        // ========================================================
        // НАВИГАЦИЯ
        // ========================================================

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

            html += `<div></div>`;
        }


        if (
            currentStep <
            STEPS.length - 1
        ) {

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


    // ============================================================
    // PUBLIC RENDER
    // ============================================================

    window.renderOnboarding =
        function () {

            const state =
                getState();


            if (!targetChildId) {

                targetChildId =
                    state._onboardingChildId ||
                    state.currentChildId ||
                    null;
            }


            return renderStep();
        };


    function refreshOnboarding() {

        if (
            typeof render === 'function'
        ) {

            render('onboarding');
        }
    }


    // ============================================================
    // SINGLE CHOICE
    // ============================================================

    document.addEventListener(
        'click',
        function (event) {

            const choiceBtn =
                event.target.closest(
                    '.btn-group button[data-choice]'
                );


            if (!choiceBtn) {
                return;
            }


            const key =
                choiceBtn.dataset.choice;


            const value =
                choiceBtn.dataset.value;


            tempData[key] =
                value;


            refreshOnboarding();
        }
    );


    // ============================================================
    // CHECKBOXES
    // ============================================================

    document.addEventListener(
        'change',
        function (event) {

            const checkbox =
                event.target.closest(
                    '.step-checkbox'
                );


            if (!checkbox) {
                return;
            }


            const step =
                STEPS[currentStep];


            if (
                !step ||
                step.type !== 'checkboxes'
            ) {
                return;
            }


            const allChecks =
                document.querySelectorAll(
                    '.step-checkbox'
                );


            const noOptions =
                EXCLUSIVE_OPTIONS;


            const checkedValues =
                Array.from(allChecks)
                    .filter(cb => cb.checked)
                    .map(cb => cb.value);


            // ----------------------------------------------------
            // Взаимоисключающие варианты
            // ----------------------------------------------------

            if (step.exclusive) {

                const hasExclusive =
                    checkedValues.some(
                        value =>
                            noOptions.includes(value)
                    );


                const hasSpecific =
                    checkedValues.some(
                        value =>
                            !noOptions.includes(value)
                    );


                // Если выбрано "Нет" / "Не знаю" /
                // "Пока не знаю" — снимаем конкретные
                if (
                    hasExclusive &&
                    hasSpecific
                ) {

                    allChecks.forEach(
                        cb => {

                            if (
                                !noOptions.includes(
                                    cb.value
                                )
                            ) {

                                cb.checked = false;
                            }
                        }
                    );
                }


                // Если выбрали конкретный вариант —
                // снимаем exclusive
                else if (
                    hasSpecific &&
                    hasExclusive
                ) {

                    allChecks.forEach(
                        cb => {

                            if (
                                noOptions.includes(
                                    cb.value
                                )
                            ) {

                                cb.checked = false;
                            }
                        }
                    );
                }
            }


            const finalValues =
                Array.from(
                    document.querySelectorAll(
                        '.step-checkbox:checked'
                    )
                )
                .map(cb => cb.value);


            tempData[step.key] =
                finalValues;


            refreshOnboarding();
        }
    );


    // ============================================================
    // READINESS RADIO
    // ============================================================

    document.addEventListener(
        'change',
        function (event) {

            const radio =
                event.target.closest(
                    'input[type="radio"][name^="readiness_"]'
                );


            if (!radio) {
                return;
            }


            const step =
                STEPS[currentStep];


            if (
                !step ||
                step.type !==
                    'readiness_checkboxes'
            ) {
                return;
            }


            const readiness = {};


            step.questions.forEach(
                question => {

                    const input =
                        document.querySelector(
                            `input[name="readiness_${question.id}"]:checked`
                        );


                    if (!input) {

                        readiness[
                            question.id
                        ] = null;

                    } else {

                        readiness[
                            question.id
                        ] =
                            input.value === 'Да';
                    }
                }
            );


            tempData.readiness =
                readiness;


            refreshOnboarding();
        }
    );


    // ============================================================
    // GESTATIONAL LIVE UPDATE
    // ============================================================

    document.addEventListener(
        'change',
        function (event) {

            if (
                event.target.id ===
                'gestational-weeks'
            ) {

                const value =
                    event.target.value;


                tempData.gestationalWeeks =
                    value === ''
                        ? ''
                        : parseInt(value, 10);


                refreshOnboarding();

                return;
            }


            if (
                event.target.id ===
                'gestational-days'
            ) {

                const value =
                    event.target.value;


                tempData.gestationalDays =
                    value === ''
                        ? ''
                        : parseInt(value, 10);


                refreshOnboarding();

                return;
            }


            if (
                event.target.id ===
                'gestational-unknown'
            ) {

                tempData.gestationalUnknown =
                    event.target.checked;


                refreshOnboarding();
            }
        }
    );


    // ============================================================
    // NAVIGATION
    // ============================================================

    document.addEventListener(
        'click',
        function (event) {

            const target =
                event.target.closest(
                    '[data-action]'
                );


            if (!target) {
                return;
            }


            const action =
                target.dataset.action;


            if (
                ![
                    'next-step',
                    'prev-step',
                    'skip-step',
                    'finish-onboarding'
                ].includes(action)
            ) {

                return;
            }


            const onboarding =
                document.querySelector(
                    '.onboarding'
                );


            if (!onboarding) {
                return;
            }


            const step =
                STEPS[currentStep];


            if (!step) {
                return;
            }


            saveCurrentStep();


            // ----------------------------------------------------
            // SKIP
            // ----------------------------------------------------

            if (
                action === 'skip-step'
            ) {

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


            // ----------------------------------------------------
            // PREVIOUS
            // ----------------------------------------------------

            if (
                action === 'prev-step'
            ) {

                if (
                    currentStep > 0
                ) {

                    currentStep--;
                }


                refreshOnboarding();

                return;
            }


            // ----------------------------------------------------
            // NEXT
            // ----------------------------------------------------

            if (
                action === 'next-step'
            ) {

                if (
                    currentStep <
                    STEPS.length - 1
                ) {

                    currentStep++;
                }


                refreshOnboarding();

                return;
            }


            // ----------------------------------------------------
            // FINISH
            // ----------------------------------------------------

            if (
                action ===
                'finish-onboarding'
            ) {

                finishOnboarding();
            }
        }
    );


    // ============================================================
    // ВАЛИДАЦИЯ
    // ============================================================

    function validateBeforeFinish() {

        const errors = [];


        // --------------------------------------------------------
        // Дата рождения
        // --------------------------------------------------------

        if (!tempData.birthDate) {

            errors.push(
                'Укажите дату рождения малыша.'
            );
        }


        // --------------------------------------------------------
        // Feeding type
        // --------------------------------------------------------

        if (!tempData.feedingType) {

            errors.push(
                'Укажите тип вскармливания.'
            );
        }


        // --------------------------------------------------------
        // Gestational
        // --------------------------------------------------------

        if (
            !tempData.gestationalUnknown &&
            (
                tempData.gestationalWeeks === '' ||
                tempData.gestationalWeeks === undefined ||
                tempData.gestationalWeeks === null
            )
        ) {

            errors.push(
                'Укажите срок рождения или выберите «Не знаю».'
            );
        }


        // --------------------------------------------------------
        // Feeding started
        // --------------------------------------------------------

        if (
            tempData.feedingStarted ===
            'Да'
        ) {

            // Дата не является обязательной:
            // пользователь мог её не помнить.
            //
            // Поэтому здесь не блокируем.
        }


        return errors;
    }


    // ============================================================
    // FINISH
    // ============================================================

    function finishOnboarding() {

        const state =
            getState();


        if (!targetChildId) {

            targetChildId =
                state._onboardingChildId ||
                state.currentChildId ||
                null;
        }


        const child =
            getTargetChild();


        if (!child) {

            console.error(
                '❌ onboarding: ребёнок не найден'
            );

            return;
        }


        // Сохраняем последний шаг
        saveCurrentStep();


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        const errors =
            validateBeforeFinish();


        if (errors.length) {

            console.warn(
                '⚠️ onboarding validation',
                errors
            );


            // Никаких alert:
            // чтобы не ломать UI приложения.
            //
            // Если проект имеет собственную систему ошибок,
            // сюда можно подключить её.
            //
            // Пока показываем сообщение
            // непосредственно через render.
            //
            // Для минимального вмешательства
            // выводим в консоль и не продолжаем.

            console.error(
                '❌ Нельзя завершить onboarding:',
                errors
            );

            return;
        }


        // ========================================================
        // ОСНОВНЫЕ ДАННЫЕ
        // ========================================================

        if (
            tempData.name !== undefined
        ) {

            child.name =
                tempData.name;
        }


        if (
            tempData.birthDate !== undefined
        ) {

            child.birthDate =
                tempData.birthDate;
        }


        // ========================================================
        // ВСКАРМЛИВАНИЕ
        // ========================================================

        if (
            tempData.feedingType !== undefined
        ) {

            const map = {

                'Грудное вскармливание':
                    'breast',

                'Искусственное вскармливание':
                    'formula',

                'Смешанное вскармливание':
                    'mixed',

                'ГВ':
                    'breast',

                'ИВ':
                    'formula',

                'Смешанное':
                    'mixed'
            };


            child.feedingType =
                map[
                    tempData.feedingType
                ] ||
                tempData.feedingType;
        }


        // ========================================================
        // НАЧАЛО ПРИКОРМА
        // ========================================================

        if (
            tempData.feedingStarted !== undefined
        ) {

            child.feedingStarted =
                tempData.feedingStarted ===
                'Да';
        }


        if (
            tempData.feedingStartDate !== undefined
        ) {

            child.feedingStartDate =
                tempData.feedingStartDate ||
                '';
        }


        // ========================================================
        // ПОДХОД
        // ========================================================

        if (
            tempData.approach !== undefined
        ) {

            child.approach =
                tempData.approach;
        }


        // ========================================================
        // ГЕСТАЦИОННЫЙ ВОЗРАСТ
        // ========================================================

        if (
            tempData.gestationalUnknown
        ) {

            child.gestationalAgeWeeks =
                null;

            child.gestationalAgeDays =
                null;

            child.birthTermCategory =
                'unknown';

        } else {

            const normalized =
                normalizeGestationalAge(
                    tempData.gestationalWeeks,
                    tempData.gestationalDays
                );


            if (normalized) {

                child.gestationalAgeWeeks =
                    normalized.weeks;

                child.gestationalAgeDays =
                    normalized.days;

                child.birthTermCategory =
                    getBirthTermCategory(
                        normalized.weeks,
                        normalized.days
                    );

            } else {

                child.gestationalAgeWeeks =
                    null;

                child.gestationalAgeDays =
                    null;

                child.birthTermCategory =
                    'unknown';
            }
        }


        // ========================================================
        // ВОЗРАСТ
        // ========================================================

        const age =
            calculateAge(
                child.birthDate
            );


        child.ageSnapshot =
            age.valid
                ? {
                    days: age.days,
                    weeks: age.weeks,
                    months: age.months,
                    calculatedAt:
                        new Date().toISOString()
                }
                : null;


        // ========================================================
        // СКОРРЕКТИРОВАННЫЙ ВОЗРАСТ
        // ========================================================

        const correctedAge =
            calculateCorrectedAge(
                child.birthDate,
                child.gestationalAgeWeeks,
                child.gestationalAgeDays
            );


        if (
            child.birthTermCategory ===
            'preterm' &&
            correctedAge.valid
        ) {

            child.correctedAge =
                {
                    days:
                        correctedAge.days,

                    weeks:
                        correctedAge.weeks,

                    months:
                        correctedAge.months,

                    calculatedAt:
                        new Date().toISOString()
                };

        } else {

            child.correctedAge =
                null;
        }


        // ========================================================
        // READINESS
        // ========================================================

        if (
            tempData.readiness !== undefined
        ) {

            child.readiness =
                tempData.readiness;
        }


        // ========================================================
        // ONBOARDING
        // ========================================================

        if (!child.onboarding) {

            child.onboarding = {};
        }


        if (
            tempData.allergies !== undefined
        ) {

            child.onboarding.allergies =
                tempData.allergies;
        }


        if (
            tempData.diet !== undefined
        ) {

            child.onboarding.diet =
                tempData.diet;
        }


        if (
            tempData.favoriteFoods !== undefined
        ) {

            child.onboarding.favoriteFoods =
                tempData.favoriteFoods;
        }


        if (
            tempData.worries !== undefined
        ) {

            child.onboarding.worries =
                tempData.worries;
        }


        if (
            tempData.confidence !== undefined
        ) {

            child.onboarding.confidence =
                tempData.confidence;
        }


        // ========================================================
        // ИТОГОВАЯ ОЦЕНКА ГОТОВНОСТИ
        // ========================================================

        if (
            child.readiness &&
            child.birthDate
        ) {

            child.readinessAssessment =
                assessReadiness(
                    child.readiness,
                    child.birthDate,
                    child.gestationalAgeWeeks,
                    child.gestationalAgeDays
                );

        } else {

            child.readinessAssessment =
                null;
        }


        // ========================================================
        // ПРОФИЛЬ
        // ========================================================

        child.profileVersion =
            3;


        child.onboarding.completedAt =
            new Date().toISOString();


        // ========================================================
        // АКТИВНЫЙ РЕБЁНОК
        // ========================================================

        state.currentChildId =
            child.id;


        state._onboardingChildId =
            null;


        state._onboardingMode =
            null;


        // ========================================================
        // ОБЩИЙ ONBOARDING
        // ========================================================

        if (
            Array.isArray(state.children) &&
            state.children.length === 1 &&
            state.onboardingCompleted === false
        ) {

            state.onboardingCompleted =
                true;
        }


        // ========================================================
        // HOME
        // ========================================================

        state.ui =
            state.ui || {};


        state.navigation =
            state.navigation || {};


        state.ui.screen =
            'home';


        state.navigation.currentScreen =
            'home';


        // ========================================================
        // SAVE
        // ========================================================

        if (
            typeof saveState === 'function'
        ) {

            saveState();
        }


        // ========================================================
        // RESET
        // ========================================================

        currentStep =
            0;

        tempData =
            {};

        targetChildId =
            null;


        // ========================================================
        // RENDER
        // ========================================================

        if (
            typeof render === 'function'
        ) {

            render('home');
        }


        window.dispatchEvent(
            new CustomEvent(
                'prikorm:statechange'
            )
        );


        console.log(
            '✅ onboarding 3.0 завершён',
            {
                childId:
                    child.id,

                childName:
                    child.name,

                chronologicalAge:
                    child.ageSnapshot,

                correctedAge:
                    child.correctedAge,

                birthTermCategory:
                    child.birthTermCategory,

                readiness:
                    child.readinessAssessment?.status ||
                    'unknown'
            }
        );
    }


    // ============================================================
    // DEBUG / PUBLIC API
    // ============================================================

    window.PrikormOnboarding =
        {

            calculateAge,

            calculateCorrectedAge,

            getBirthTermCategory,

            assessReadiness,

            getTermMessage

        };


    // ============================================================
    // READY
    // ============================================================

    console.log(
        '✅ onboarding.js загружен — Onboarding 3.0'
    );

})();