// screens/settings.js — экран "Настройки"
function renderSettings() {
    const settings = getSettings();
    return `
    <div class="screen">
        <div class="page-header"><h1>Настройки</h1><button class="icon-button" data-action="navigate" data-screen="home">⌂</button></div>
        <div class="settings-list">
            <button class="settings-row" data-action="settings" data-setting="notifications"><span>🔔</span><div><strong>Уведомления</strong><small>${settings.notifications ? 'Включены' : 'Отключены'}</small></div><span>›</span></button>
            <button class="settings-row" data-action="settings" data-setting="theme"><span>🎨</span><div><strong>Тема</strong><small>${settings.theme || 'Светлая'}</small></div><span>›</span></button>
            <button class="settings-row" data-action="settings" data-setting="home-blocks"><span>🏠</span><div><strong>Главный экран</strong><small>Настроить блоки</small></div><span>›</span></button>
        </div>
        <div style="margin-top:24px;padding:16px;background:var(--bg-card);border-radius:var(--radius);border:1px solid var(--border-color)">
            <div style="font-size:14px;color:var(--text-muted);text-align:center"><div>🌸 Прикорм</div><div style="margin-top:4px">v2.1.1</div></div>
        </div>
        <button class="danger-button" data-action="reset-data">Сбросить данные</button>
    </div>`;
}

window.renderSettings = renderSettings;