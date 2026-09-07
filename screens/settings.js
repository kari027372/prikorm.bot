// screens/settings.js — экран "Настройки"
function renderSettings() {
    const settings = getSettings();

    return `
    <div class="screen settings-screen">

        <div class="page-header settings-page-header">
            <div>
                <span class="settings-page-eyebrow">KENORA</span>
                <h1>Настройки</h1>
            </div>

            <button
                class="icon-button"
                data-action="navigate"
                data-screen="home"
                type="button"
                aria-label="На главную"
            >
                ⌂
            </button>
        </div>

        <div class="settings-list">

            <button
                class="settings-row settings-item"
                data-action="settings"
                data-setting="notifications"
                type="button"
            >
                <span class="settings-item-icon">🔔</span>

                <div>
                    <strong>Уведомления</strong>
                    <small>
                        ${settings.notifications ? 'Включены' : 'Отключены'}
                    </small>
                </div>

                <span class="settings-item-arrow">›</span>
            </button>

            <button
                class="settings-row settings-item"
                data-action="settings"
                data-setting="theme"
                type="button"
            >
                <span class="settings-item-icon">🎨</span>

                <div>
                    <strong>Тема</strong>
                    <small>
                        ${settings.theme || 'Светлая'}
                    </small>
                </div>

                <span class="settings-item-arrow">›</span>
            </button>

            <button
                class="settings-row settings-item"
                data-action="settings"
                data-setting="home-blocks"
                type="button"
            >
                <span class="settings-item-icon">🏠</span>

                <div>
                    <strong>Главный экран</strong>
                    <small>Настроить блоки</small>
                </div>

                <span class="settings-item-arrow">›</span>
            </button>

        </div>

        <div class="settings-about">
            <div class="settings-about-title">🌸 KENORA</div>
            <div class="settings-about-version">v2.1.1</div>
        </div>

        <button
            class="danger-button settings-reset-button"
            data-action="reset-data"
            type="button"
        >
            Сбросить данные
        </button>

    </div>`;
}

window.renderSettings = renderSettings;