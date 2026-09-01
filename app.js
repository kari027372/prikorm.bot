// app.js — точка входа (исправлен)
function initApp() {
    console.log('🌸 Запуск приложения...');
    if (typeof buildApp === 'function') {
        buildApp();
    } else {
        console.error('❌ buildApp не найдена!');
        return;
    }
    if (typeof loadState === 'function') loadState();
    if (typeof initTheme === 'function') initTheme();
    if (typeof setupEventListeners === 'function') setupEventListeners();
    const screen = (STATE && STATE.ui && STATE.ui.screen) ? STATE.ui.screen : 'home';
    if (typeof showScreen === 'function') {
        showScreen(screen);
    } else if (typeof render === 'function') {
        render(screen);
    }
    if (typeof updateProfileUI === 'function') updateProfileUI();
    console.log('✅ Приложение запущено');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
window.initApp = initApp;