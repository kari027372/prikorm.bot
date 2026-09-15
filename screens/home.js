// screens/home.js – KENORA главная
window.renderHome = function() {
    const state = window.STATE || {};
    const currentChild = window.getCurrentChild ? window.getCurrentChild() : (state.baby || {});
    const baby = currentChild || {};

    // Дневник текущего ребёнка
    const diary = typeof window.getDiary === 'function'
        ? window.getDiary()
        : (baby.diary || state.diary || []);

    // P0.7: количество введённых продуктов берём из Product State
    // текущего ребёнка, а не из глобального legacy STATE.
    let introduced = [];

    if (
        currentChild &&
        currentChild.id &&
        window.productStateService &&
        typeof window.productStateService.getProductsByStatus === 'function'
    ) {
        introduced =
            window.productStateService.getProductsByStatus(
                currentChild.id,
                'introduced'
            ) || [];
    } else {
        introduced = state.products?.introduced || [];
    }

    const totalIntroduced = introduced.length;
    const totalProducts = (window.PRODUCTS || []).length;

    let ageText = 'Возраст не указан';

    if (baby.birthDate && typeof window.formatAge === 'function') {
        ageText = window.formatAge(baby.birthDate);
    } else if (baby.birthDate) {
        const birth = new Date(baby.birthDate);
        const now = new Date();

        let months =
            (now.getFullYear() - birth.getFullYear()) * 12 +
            (now.getMonth() - birth.getMonth());

        if (now.getDate() < birth.getDate()) {
            months--;
        }

        months = Math.max(0, months);
        ageText = months + ' мес.';
    }

    const weight = baby.weight || '';
    const weightText = weight ? weight + ' кг' : '';

    const avatarEmoji =
        baby.sex === 'male'
            ? '👦'
            : baby.sex === 'female'
                ? '👧'
                : '👶';

    // ── Home visual refresh: только для отображения ─────────────
    // Значения ниже НЕ пишутся в STATE / storage.

    // Имя ребёнка
    const childName = baby.name || 'Малыш';

    // Склонение имени для «Для <имя>» (родительный падеж).
    // Работает по общим правилам + небольшой список исключений.
    function inclineNameToGenitive(name, sex) {
        if (!name) return name;
        const key = name.toLowerCase();
        const last = key.slice(-1);
        const beforeLast = key.slice(-2, -1);

        // Исключения и «нестандартные» имена — как мальчиков, так и девочек
        const exceptions = {
            // мужские на -а/-я, которые всё же склоняются
            'никита': 'Никиты',
            'илья':   'Ильи',
            'кузьма': 'Кузьмы',
            'фома':   'Фомы',
            'лука':   'Луки',
            'савва':  'Саввы',
            'данила': 'Данилы',
            // уменьшительные (унисекс по форме, но чаще мужские)
            'саша':   'Саши',
            'миша':   'Миши',
            'гриша':  'Гриши',
            'паша':   'Паши',
            'лёша':   'Лёши',
            'лёва':   'Лёвы',
            'дима':   'Димы',
            'ваня':   'Вани',
            'вася':   'Васи',
            'петя':   'Пети',
            'коля':   'Коли',
            'толя':   'Толи',
            'вова':   'Вовы',
            'слава':  'Славы',
            'боря':   'Бори',
            'гоша':   'Гоши',
            'костя':  'Кости',
            'сева':   'Севы',
            'рома':   'Ромы',
            // женские
            'любовь': 'Любови',
            'рахиль': 'Рахили',
            'нинель': 'Нинели',
            'марьям': 'Марьям',
            'марья':  'Марьи',
        };

        if (exceptions[key]) return exceptions[key];

        // -а: после ж, ш, ч, щ, ц → -и, иначе → -ы
        if (last === 'а') {
            if ('жшчщц'.includes(beforeLast)) {
                return name.slice(0, -1) + 'и';
            }
            return name.slice(0, -1) + 'ы';
        }

        // -я: обычно → -и (Аня → Ани, Софья → Софьи)
        if (last === 'я') {
            return name.slice(0, -1) + 'и';
        }

        // -ь: пол решает (Игорь → Игоря, Любовь → Любови)
        if (last === 'ь') {
            if (sex === 'female') {
                return name.slice(0, -1) + 'и';
            }
            return name.slice(0, -1) + 'я';
        }

        // Прочие гласные (о, е, ё, у, ы, э, ю, и) — не склоняются
        if ('оеёуыэюи'.includes(last)) {
            return name;
        }

        // Согласная → +а (Кадим → Кадима, Иван → Ивана)
        return name + 'а';
    }

    const childNameGenitive =
        inclineNameToGenitive(childName, baby.sex);

    // Приветствие по времени суток (имени родителя в STATE пока нет)
    const _hNow = new Date().getHours();

    const greetingText =
        _hNow < 12
            ? 'Доброе утро'
            : _hNow < 18
                ? 'Добрый день'
                : 'Добрый вечер';

    // ── P0.7: реальная рекомендация ────────────────────────────
    let todayProductName = 'Пока нет рекомендации';

    let todayRecommendationText =
        'Добавьте записи в дневник — появятся персональные подсказки.';

    let hasTodayRecommendation = false;

    try {
        if (typeof window.getMainRecommendation === 'function') {
            const main =
                window.getMainRecommendation();

            if (
                main &&
                main.product &&
                main.product.name
            ) {
                todayProductName =
                    main.product.name;

                hasTodayRecommendation = true;

            } else if (
                main &&
                main.type === 'empty'
            ) {
                todayProductName =
                    main.title ||
                    'Пока нет рекомендации';
            }

            if (
                main &&
                main.description
            ) {
                todayRecommendationText =
                    main.description;
            }
        }
    } catch (e) {
        console.warn(
            'Home: recommendation error',
            e
        );
    }

    // ── P0.7: вода за сегодня ─────────────────────────────────
    let todayWaterAmount = '0 мл';

    try {
        const today =
            new Date()
                .toISOString()
                .split('T')[0];

        const waterEntries =
            Array.isArray(state.waterLog)
                ? state.waterLog
                : [];

        const totalMl =
            waterEntries
                .filter(function(item) {
                    return (
                        item &&
                        item.date === today
                    );
                })
                .reduce(function(sum, item) {
                    return sum +
                        (parseFloat(item.amount) || 0);
                }, 0);

        todayWaterAmount =
            totalMl + ' мл';

    } catch (e) {
        console.warn(
            'Home: water log error',
            e
        );
    }

    // Последний приём пищи
    const lastEntry =
        diary.length
            ? diary[diary.length - 1]
            : null;

    let lastMealHtml = '';

    if (lastEntry) {
        const food =
            lastEntry.productName || 'Продукт';

        const amount =
            lastEntry.amount
                ? lastEntry.amount + ' г'
                : '';

        const status = 'Хорошо';

        const time =
            lastEntry.time || '12:30';

        lastMealHtml = `
            <div class="last-meal">
                <div class="last-meal-header">
                    <span>🕐 Последний приём пищи</span>
                    <span class="last-meal-time">${time}</span>
                </div>

                <div class="last-meal-content">
                    <span class="last-meal-food">${food}</span>
                    ${amount ? `<span class="last-meal-amount">${amount}</span>` : ''}
                    <span class="last-meal-status">${status}</span>
                </div>
            </div>
        `;
    } else {
        lastMealHtml = `
            <div class="last-meal">
                <div class="last-meal-header">
                    <span>🕐 Нет записей</span>
                </div>

                <div class="last-meal-content">
                    <span class="last-meal-food">Добавьте первый приём пищи</span>
                </div>
            </div>
        `;
    }

    // ── Новый visual layout ────────────────────────────────────
    // lastMealHtml выше сохранён как legacy (в новой разметке не используется).
    // Реакция / статус в «Последнем» не подставляются — только фактическая запись.

    const lastBlock = lastEntry
        ? `<div class="home-section-title">Последнее</div>
           <div class="home-last">
               <div class="home-last-icon">🌱</div>
               <div class="home-last-info">
                   <div class="home-last-title">${lastEntry.productName || 'Продукт'}${lastEntry.amount ? ' · ' + lastEntry.amount + ' г' : ''}${lastEntry.time ? ' · ' + lastEntry.time : ''}</div>
               </div>
           </div>`
        : `<div class="home-section-title">Последнее</div>
           <div class="home-last">
               <div class="home-last-icon">🍽️</div>
               <div class="home-last-info">
                   <div class="home-last-title">Нет записей</div>
                   <div class="home-last-meta">Добавьте первый приём пищи</div>
               </div>
           </div>`;

    return `
        <div class="screen active home-screen">

            <!-- Header -->
            <div class="home-header">
                <div class="home-header-info">
                    <span class="home-greeting">${greetingText}<span class="heart">♡</span></span>
                    <span class="home-child-meta">${childName}${ageText && ageText !== 'Возраст не указан' ? ' · ' + ageText : ''}</span>
                </div>

                <button class="home-avatar"
                        data-action="navigate"
                        data-screen="baby"
                        aria-label="Профиль ребёнка">${avatarEmoji}</button>
            </div>

            <!-- Сегодня в прикорме -->
            <div class="home-today">
                <div class="home-today-eyebrow">
                    <span class="badge-ico" aria-hidden="true">🌿</span>
                    Сегодня в прикорме
                </div>

                <div class="home-today-label">
                    Новый продукт
                </div>

                <div class="home-today-name">
                    ${todayProductName}
                </div>

                ${hasTodayRecommendation
                    ? `<button class="home-today-cta" type="button">
                           Можно попробовать сегодня
                           <span class="arrow">→</span>
                       </button>`
                    : ''}
            </div>

            <!-- Вода -->
            <div class="home-water">
                <div class="home-water-info">
                    <span class="home-water-label">
                        <span class="emo" aria-hidden="true">💧</span>
                        Вода сегодня
                    </span>

                    <span class="home-water-amount">
                        ${todayWaterAmount}
                    </span>
                </div>

                <button class="home-water-add"
                        type="button"
                        aria-label="Добавить воду">+</button>
            </div>

            <!-- Для ребёнка -->
            <div class="home-for-child">
                <div class="home-for-child-label">
                    <span class="stars" aria-hidden="true">✦<br/>✦</span>
                    Для ${childNameGenitive}
                </div>

                <div class="home-for-child-text">
                    ${todayRecommendationText}
                </div>

                <button class="home-for-child-more"
                        type="button">
                    Подробнее →
                </button>
            </div>

            ${lastBlock}

        </div>
    `;
};