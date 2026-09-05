// screens/home.js – KENORA главная
window.renderHome = function() {
    const state = window.STATE || {};
    const currentChild = window.getCurrentChild ? window.getCurrentChild() : (state.baby || {});
    const baby = currentChild || {};

    const diary = state.diary || [];
    const introduced = state.products?.introduced || [];
    const totalIntroduced = introduced.length;
    const totalProducts = (window.PRODUCTS || []).length;

    let ageText = 'Возраст не указан';
    if (baby.birthDate && typeof window.formatAge === 'function') {
        ageText = window.formatAge(baby.birthDate);
    } else if (baby.birthDate) {
        const birth = new Date(baby.birthDate);
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (now.getDate() < birth.getDate()) months--;
        months = Math.max(0, months);
        ageText = months + ' мес.';
    }

    const weight = baby.weight || '';
    const weightText = weight ? weight + ' кг' : '';

    const avatarEmoji = baby.sex === 'male' ? '👦' : baby.sex === 'female' ? '👧' : '👶';

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
                <div class="last-meal-header"><span>🕐 Нет записей</span></div>
                <div class="last-meal-content"><span class="last-meal-food">Добавьте первый приём пищи</span></div>
            </div>
        `;
    }

    return `
        <div class="screen active">
            <!-- Профиль -->
            <div class="baby-profile-card">
                <div class="baby-avatar">${avatarEmoji}</div>
                <div>
                    <strong>${baby.name || 'Малыш'}</strong>
                    <div class="muted">${ageText}${weightText ? ' • ' + weightText : ''}</div>
                </div>
                <button class="icon-button" style="margin-left:auto;" data-action="navigate" data-screen="baby">✎</button>
            </div>

            <!-- Сегодняшний продукт (заглушка) -->
            <div class="today-product">
                <span class="today-product-label">Сегодня новый продукт</span>
                <span class="today-product-name">🌱 Цветная капуста</span>
            </div>

            <!-- Статистика -->
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-icon">🍽️</span>
                    <span class="stat-value">${diary.length}</span>
                    <span class="stat-label">Приёмов пищи</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">🍼</span>
                    <span class="stat-value">${baby.feedingType === 'breast' ? '4' : '3'}</span>
                    <span class="stat-label">Грудное молоко</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">📖</span>
                    <span class="stat-value">${totalIntroduced}</span>
                    <span class="stat-label">Дневник</span>
                </div>
                <div class="stat-card">
                    <span class="stat-icon">😊</span>
                    <span class="stat-value">Хорошее</span>
                    <span class="stat-label">Самочувствие</span>
                </div>
            </div>

            <!-- Последний приём пищи -->
            ${lastMealHtml}

            <!-- Кнопка "Начать" (для первого запуска) -->
            <button class="start-btn" id="start-day-btn">Начать</button>
        </div>
    `;
};