// screens/home.js – только рендер главного экрана (без баннера)
window.renderHome = function() {
    const state = window.STATE || {};
    const currentChild = window.getCurrentChild ? window.getCurrentChild() : (state.baby || {});
    const baby = currentChild || {};

    const introduced = state.products?.introduced || [];
    const diary = state.diary || [];
    const totalIntroduced = introduced.length;

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

    const allProducts = window.PRODUCTS || [];
    const totalProducts = allProducts.length;
    const progressPercent = totalProducts > 0 ? Math.min(100, (totalIntroduced / totalProducts) * 100) : 0;

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

    const avatarEmoji = baby.sex === 'male' ? '👦' : baby.sex === 'female' ? '👧' : '👶';

    return `
        <div class="screen active">
            <div class="page-header">
                <h1>🌸 Прикорм</h1>
                <button class="icon-button" data-action="toggleTheme">🌓</button>
            </div>

            <div class="baby-profile-card" id="babyCard">
                <div class="baby-avatar">${avatarEmoji}</div>
                <div>
                    <strong id="babyName">${baby.name || 'Малыш'}</strong>
                    <div class="muted" id="babyAge">${ageText}</div>
                </div>
                <button class="icon-button" style="margin-left:auto;" data-action="navigate" data-screen="baby">✎</button>
            </div>

            <div class="progress-card">
                <div class="header">
                    <span>📊 Прогресс введения</span>
                    <span id="progressCount">${totalIntroduced} / ${totalProducts}</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" id="progressFill" style="width:${Math.round(progressPercent)}%;"></div>
                </div>
            </div>

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