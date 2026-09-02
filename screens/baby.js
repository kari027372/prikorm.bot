// screens/baby.js — список детей + добавление/переключение/удаление
window.renderBaby = function() {
    const state = window.STATE || {};
    const children = state.children || [];
    const current = window.getCurrentChild ? window.getCurrentChild() : null;

    let html = `
        <div class="screen active">
            <div class="page-header">
                <h1>👶 Малыши</h1>
                <button class="icon-button" data-action="navigate" data-screen="home">⌂</button>
            </div>
    `;

    if (children.length === 0) {
        html += `
            <div class="empty-state">
                <span class="empty-icon">👶</span>
                <h3>Нет добавленных детей</h3>
                <p>Пройдите онбординг или нажмите «Добавить ребёнка»</p>
            </div>
        `;
    } else {
        // Список детей
        children.forEach(child => {
            const isActive = current && current.id === child.id;
            const age = (child.birthDate && typeof window.formatAge === 'function') 
                ? window.formatAge(child.birthDate) 
                : 'Возраст не указан';
            html += `
                <div class="settings-row" style="${isActive ? 'border: 2px solid var(--bg-primary);' : ''}" data-action="switch-child" data-child-id="${child.id}">
                    <span>${child.sex === 'male' ? '👦' : child.sex === 'female' ? '👧' : '👶'}</span>
                    <div>
                        <strong>${child.name || 'Без имени'}</strong>
                        <small>${age}</small>
                    </div>
                    ${isActive ? '<span>✔</span>' : ''}
                    <button class="icon-button" data-action="delete-child" data-child-id="${child.id}">🗑️</button>
                </div>
            `;
        });
    }

    // Кнопка добавления ребёнка
    html += `
        <button class="primary-button" data-action="open-add-child" style="margin-top: 16px;">➕ Добавить ребёнка</button>
    `;

    html += `</div>`;
    return html;
};