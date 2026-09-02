// screens/home.js – главная страница с динамическими данными
window.renderHome = function() {
    const state = window.STATE || {};
    const baby = state.baby || {};
    const introduced = state.products?.introduced || [];
    const diary = state.diary || [];
    const totalIntroduced = introduced.length;

    // Рассчитываем возраст
    let ageText = 'Возраст не указан';
    if (baby.birthDate) {
        // Используем глобальную функцию getAgeInMonths из state.js (если есть)
        const months = typeof window.getAgeInMonths === 'function'
            ? window.getAgeInMonths(baby.birthDate)
            : (() => {
                const birth = new Date(baby.birthDate);
                const now = new Date();
                let m = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
                if (now.getDate() < birth.getDate()) m--;
                return Math.max(0, m);
            })();
        ageText = months + ' мес.';
    }

    // Получаем общее количество продуктов (из глобального массива PRODUCTS)
    const allProducts = window.PRODUCTS || [];
    const totalProducts = allProducts.length;

    // Прогресс (максимум 100%)
    const progressPercent = totalProducts > 0 ? Math.min(100, (totalIntroduced / totalProducts) * 100) : 0;

    // Последние 3 записи (сначала новые)
    const recentEntries = diary.slice(-3).reverse();

    let recentHtml = '';
    if (recentEntries.length === 0) {
        recentHtml = `
            <div class="empty-state">
                <span class="empty-icon">📭</span>
                <h3>Нет записей</h3>
                <p>Добавьте первый прикорм в дневник</p>
            </div>
        `;
    } else {
        recentHtml = recentEntries.map(entry => `
            <div class="diary-entry">
                <span class="diary-entry-icon">${entry.emoji || '🍽️'}</span>
                <div class="diary-entry-content">
                    <div class="diary-entry-header">
                        <strong>${entry.productName || 'Продукт'}</strong>
                        <span>${entry.date || ''}</span>
                    </div>
                    <div class="diary-entry-meta">
                        ${entry.amount || ''}
                        ${entry.reaction ? '⚠️ ' + entry.reaction : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Пол и эмодзи аватара
    const avatarEmoji = baby.sex === 'male' ? '👦' : baby.sex === 'female' ? '👧' : '👶';

    return `
        <div class="screen active">
            <!-- Приветствие -->
            <div class="page-header">
                <h1>🌸 Прикорм</h1>
                <button class="icon-button" data-action="toggleTheme">🌓</button>
            </div>

            <!-- Карточка малыша -->
            <div class="baby-profile-card" id="babyCard">
                <div class="baby-avatar">${avatarEmoji}</div>
                <div>
                    <strong id="babyName">${baby.name || 'Малыш'}</strong>
                    <div class="muted" id="babyAge">${ageText}</div>
                </div>
                <button class="icon-button" style="margin-left:auto;" data-action="navigate" data-screen="baby">✎</button>
            </div>

            <!-- Прогресс введения продуктов -->
            <div class="progress-card">
                <div class="header">
                    <span>📊 Прогресс введения</span>
                    <span id="progressCount">${totalIntroduced} / ${totalProducts}</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" id="progressFill" style="width:${Math.round(progressPercent)}%;"></div>
                </div>
            </div>

            <!-- Быстрые действия -->
            <div class="quick-actions">
                <div class="quick-action" data-action="navigate" data-screen="today">
                    <span>📅</span>
                    <strong>План на сегодня</strong>
                    <small>Что дать малышу</small>
                </div>
                <div class="quick-action" data-action="navigate" data-screen="diary">
                    <span>📖</span>
                    <strong>Дневник</strong>
                    <small>Записать прикорм</small>
                </div>
                <div class="quick-action" data-action="navigate" data-screen="products">
                    <span>🥑</span>
                    <strong>Продукты</strong>
                    <small>Выбрать новый</small>
                </div>
                <div class="quick-action" data-action="navigate" data-screen="recipes">
                    <span>🍲</span>
                    <strong>Рецепты</strong>
                    <small>Идеи для блюд</small>
                </div>
            </div>

            <!-- Последние записи в дневнике -->
            <div class="section-heading">
                <span>🕒 Последние записи</span>
                <button class="icon-button" data-action="navigate" data-screen="diary">→</button>
            </div>
            <div id="recentEntries">
                ${recentHtml}
            </div>
        </div>
    `;
};