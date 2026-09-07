// screens/settings.js — экран "Настройки"
function renderSettings() {
  const settings = getSettings();

  // --- ИЗМЕНЕНИЕ: SVG-иконка "назад" вместо ⌂ ---
  const homeIcon = `
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/>
    </svg>
  `;

  // --- ИЗМЕНЕНИЕ: SVG-иконка "стрелка" вместо › ---
  const arrowIcon = `
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  `;

  return `
    <div class="page-header">
      <h1 class="header-title">Настройки</h1>
      <button class="icon-button" data-action="navigate" data-screen="home">${homeIcon}</button>
    </div>

    <div class="settings-row" data-action="toggle-notifications">
      <div>
        <div style="font-weight:600;">Уведомления</div>
        <div style="font-size:13px;color:var(--kenora-text-muted);">${settings.notifications ? 'Включены' : 'Отключены'}</div>
      </div>
      ${arrowIcon}
    </div>

    <div class="settings-row" data-action="toggle-theme">
      <div>
        <div style="font-weight:600;">Тема</div>
        <div style="font-size:13px;color:var(--kenora-text-muted);">${settings.theme || 'Светлая'}</div>
      </div>
      ${arrowIcon}
    </div>

    <div class="settings-row" data-action="configure-home">
      <div>
        <div style="font-weight:600;">Главный экран</div>
        <div style="font-size:13px;color:var(--kenora-text-muted);">Настроить блоки</div>
      </div>
      ${arrowIcon}
    </div>

    <div style="margin-top:32px;padding:16px;text-align:center;font-size:13px;color:var(--kenora-text-muted);">
      Прикорм v2.1.1
    </div>

    <button class="btn-secondary" style="margin-top:16px;width:100%;padding:14px;border-radius:var(--kenora-radius-md);border:1px solid #e74c3c;color:#e74c3c;background:transparent;font-weight:600;" data-action="reset-data">
      Сбросить данные
    </button>
  `;
}
window.renderSettings = renderSettings;