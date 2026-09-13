// screens/home.js – KENORA главная
window.renderHome = function() {
    const state = window.STATE || {};
    const currentChild = window.getCurrentChild ? window.getCurrentChild() : (state.baby || {});
    const baby = currentChild || {};

    // Дневник текущего ребёнка
    const diary = typeof window.getDiary === 'function'
        ? window.getDiary()
        : (baby.diary || state.diary || []);

    const introduced = state.products?.introduced || [];
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
    // TODO: временные mock'и до подключения реальных данных.

    // Имя ребёнка (без склонения — как в профиле)
    const childName = baby.name || 'Малыш';

    // Приветствие по времени суток (имени родителя в STATE пока нет)
    const _hNow = new Date().getHours();
    const greetingText = _hNow < 12 ? 'Доброе утро'
                       : _hNow < 18 ? 'Добрый день'
                       : 'Добрый вечер';

    // TODO: placeholder — продукт дня пока не подключён к рекомендациям
    const todayProductName = 'Кабачок';

    // TODO: placeholder — воды пока нет в STATE, значение визуальное
    const todayWaterAmount = '0 мл';

    // TODO: placeholder — рекомендация пока не подключена
    const todayRecommendationText = 'Здесь появится персональная рекомендация.';

    // Последний приём пищи
    const lastEntry = diary.length ? diary[diary.length - 1] : null;

    let lastMealHtml = '';

    if (lastEntry) {
        const food = lastEntry.productName || 'Продукт';
        const amount = lastEntry.amount ? lastEntry.amount + ' г' : '';
        const status = 'Хорошо';
        const time = lastEntry.time || '12:30';

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
                <div class="home-today-eyebrow"><span class="badge-ico" aria-hidden="true">🌿</span>Сегодня в прикорме</div>
                <div class="home-today-label">Новый продукт</div>
                <div class="home-today-name">${todayProductName}</div>
                <button class="home-today-cta" type="button">Можно попробовать сегодня<span class="arrow">→</span></button>
            </div>

            <!-- Вода -->
            <div class="home-water">
                <div class="home-water-info">
                    <span class="home-water-label"><span class="emo" aria-hidden="true">💧</span>Вода сегодня</span>
                    <span class="home-water-amount">${todayWaterAmount}</span>
                </div>
                <button class="home-water-add" type="button" aria-label="Добавить воду">+</button>
            </div>

            <!-- Для ребёнка -->
            <div class="home-for-child">
                <div class="home-for-child-label"><span class="stars" aria-hidden="true">✦<br/>✦</span> Для ${childName}</div>
                <div class="home-for-child-text">${todayRecommendationText}</div>
                <button class="home-for-child-more" type="button">Подробнее →</button>
            </div>

            ${lastBlock}

        </div>
    `;
};