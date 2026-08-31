// app.js — точка входа
function init() {
    buildApp();
    loadProfile();
    setupEventListeners();
    render();
}

// Перенос данных и применение темы
migrateData();
if (typeof getTheme === 'function' && typeof setTheme === 'function') {
    setTheme(getTheme());
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.addEventListener('focus', function() {
    if (profile && profile.birth_date) {
        const age = calcAge(profile.birth_date);
        profile.age_months = age.months;
        profile.age_days = age.days;
        saveProfile();
        render();
    }
});