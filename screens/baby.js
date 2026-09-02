// screens/baby.js — экран "Малыш"
function renderBaby() {
    const baby = getBaby();
    return `
    <div class="screen">
        <div class="page-header"><h1>Малыш</h1></div>
        <div class="baby-profile-card">
            <div class="baby-avatar">👶</div>
            <div><strong>${baby.name || 'Имя не указано'}</strong><br><span class="muted">${formatAge(baby)}</span></div>
            <button class="icon-button" data-action="edit-baby">✏️</button>
        </div>
        <div class="settings-list">
            <button class="settings-row" data-action="settings" data-setting="feeding-type"><span>🍼</span><div><strong>Тип кормления</strong><small>${baby.feedingType || 'Не указан'}</small></div><span>›</span></button>
            <button class="settings-row" data-action="settings" data-setting="prikorm-start"><span>📅</span><div><strong>Начало прикорма</strong><small>${baby.prikormStartDate || 'Не указано'}</small></div><span>›</span></button>
            <button class="settings-row" data-action="settings" data-setting="approach"><span>🥄</span><div><strong>Подход</strong><small>${baby.approach || 'Можно настроить'}</small></div><span>›</span></button>
        </div>
        <button class="danger-button" data-action="reset-data">Сбросить все данные</button>
    </div>`;
}

// Экспорт в глобальную область
window.renderBaby = renderBaby;