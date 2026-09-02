// screens/today.js — экран "Сегодня"
function renderToday() {
    const dateStr = new Date().toISOString().slice(0, 10);
    const plan = getPlanForDate(dateStr);
    const meals = Array.isArray(plan) ? plan : [];
    let mealsHtml = '';
    if (meals.length) {
        mealsHtml = meals.map((meal, idx) => `
            <div class="meal-item">
                <div><strong>${meal.name || 'Приём пищи'}</strong><span>${meal.products ? meal.products.join(', ') : '—'}</span></div>
                <button class="icon-button" data-action="remove-meal" data-index="${idx}">✕</button>
            </div>
        `).join('');
    } else {
        mealsHtml = `<div class="empty-state"><div class="empty-icon">📅</div><h3>Ничего не запланировано</h3><p>Добавьте приём пищи на сегодня.</p></div>`;
    }
    return `
    <div class="screen">
        <div class="page-header"><h1>Сегодня</h1></div>
        <div class="date-navigation"><button data-action="previous-day">‹</button><span id="today-date">Сегодня</span><button data-action="next-day">›</button></div>
        <div class="daily-plan">${mealsHtml}<button class="primary-button" data-action="add-meal" style="margin-top:12px">➕ Добавить приём пищи</button></div>
    </div>`;
}

// Экспорт в глобальную область
window.renderToday = renderToday;