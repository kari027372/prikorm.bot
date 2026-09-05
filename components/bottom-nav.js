// components/bottom-nav.js – красивые иконки для KENORA
window.renderBottomNav = function(active) {
    const items = [
        { id: 'home', icon: '🏠', label: 'Главная' },
        { id: 'products', icon: '🥑', label: 'Продукты' },
        { id: 'diary', icon: '📖', label: 'Дневник' },
        { id: 'recipes', icon: '👩‍🍳', label: 'Рецепты' },
        { id: 'more', icon: '⚡', label: 'Ещё' }
    ];

    let html = `<div class="bottom-navigation">`;
    items.forEach(item => {
        const isActive = (active === item.id);
        html += `
            <button class="nav-item ${isActive ? 'active' : ''}" data-action="navigate" data-screen="${item.id}">
                <span>${item.icon}</span>
                <span>${item.label}</span>
            </button>
        `;
    });
    html += `</div>`;
    return html;
};