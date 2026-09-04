// screens/home.js – новый дизайн главной KENORA
window.renderHome = function() {
    const state = window.STATE || {};
    const currentChild = window.getCurrentChild ? window.getCurrentChild() : (state.baby || {});
    const baby = currentChild || {};

    // Данные для карточек
    const introduced = state.products?.introduced || [];
    const diary = state.diary || [];
    const totalIntroduced = introduced.length;
    const totalProducts = (window.PRODUCTS || []).length;

    // Возраст
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

    // Вес (если есть)
    const weight = baby.weight || '9.3';
    const weightText = weight ? weight + ' кг' : '';

    // Дневник (последние 3 записи)
    const recentEntries = diary.slice(-3).reverse();
    let diaryHtml = '';
    if (recentEntries.length === 0) {
        diaryHtml = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <p>Нет записей</p>
            </div>
        `;
    } else {
        diaryHtml = recentEntries.map(entry => `
            <div class="diary-entry">
                <span class="diary-entry-icon">${entry.emoji || '🍽️'}</span>
                <div class="diary-entry-content">
                    <strong>${entry.productName || 'Продукт'}</strong>
                    <span>${entry.date || ''}</span>
                    ${entry.amount ? `<span>${entry.amount} г</span>` : ''}
                    ${entry.reaction ? `<span class="badge">⚠️ ${entry.reaction}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Аватарка
    const avatarEmoji = baby.sex === 'male' ? '👦' : baby.sex === 'female' ? '👧' : '👶';
    const name = baby.name || 'Малыш';

    return `
        <div class="screen active">
            <!-- Профиль ребёнка -->
            <div class="baby-profile-card">
                <div class="baby-avatar">${avatarEmoji}</div>
                <div>
                    <strong id="babyName">${name}</strong>
                    <div class="muted" id="babyAge">${ageText}${weightText ? ' • ' + weightText : ''}</div>
                </div>
                <button class="icon-button" style="margin-left:auto;" data-action="navigate" data-screen="baby">✎</button>
            </div>

            <!-- Сегодняшний продукт -->
            <div class="today-product">
                <span class="today-product-label">Сегодня новый продукт</span>
                <span class="today-product-name">🌱 Цветная капуста</span>
            </div>

            <!-- Статистика (4 карточки) -->
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
            <div class="last-meal">
                <div class="last-meal-header">
                    <span>🕐 Последний приём пищи</span>
                    <span class="last-meal-time">12:30</span>
                </div>
                <div class="last-meal-content">
                    <span class="last-meal-food">Кабачок</span>
                    <span class="last-meal-amount">80 г</span>
                    <span class="last-meal-status">✅ Хорошо</span>
                </div>
            </div>

            <!-- Кнопка "Начать" (для первого запуска) -->
            <button class="start-btn" id="start-day-btn">Начать</button>

            <!-- Нижняя навигация (рендерится отдельно, но оставим для совместимости) -->
            <div id="bottom-nav-placeholder"></div>
        </div>
    `;
};