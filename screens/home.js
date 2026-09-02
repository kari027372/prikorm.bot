// screens/home.js
window.renderHome = function() {
    return `
        <div class="screen active">
            <!-- Приветствие -->
            <div class="page-header">
                <h1>🌸 Прикорм</h1>
                <button class="icon-button" data-action="toggleTheme">🌓</button>
            </div>

            <!-- Карточка малыша (если данные есть) -->
            <div class="baby-profile-card" id="babyCard">
                <div class="baby-avatar">👶</div>
                <div>
                    <strong id="babyName">Малыш</strong>
                    <div class="muted" id="babyAge">Возраст не указан</div>
                </div>
                <button class="icon-button" style="margin-left:auto;" data-action="navigate" data-screen="baby">✎</button>
            </div>

            <!-- Прогресс введения продуктов -->
            <div class="progress-card">
                <div class="header">
                    <span>📊 Прогресс введения</span>
                    <span id="progressCount">0 / 0</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" id="progressFill" style="width:0%;"></div>
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

            <!-- Последние записи в дневнике (заглушка) -->
            <div class="section-heading">
                <span>🕒 Последние записи</span>
                <button class="icon-button" data-action="navigate" data-screen="diary">→</button>
            </div>
            <div id="recentEntries">
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <h3>Нет записей</h3>
                    <p>Добавьте первый прикорм в дневник</p>
                </div>
            </div>
        </div>
    `;
};