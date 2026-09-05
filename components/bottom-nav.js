// components/bottom-nav.js – красивые SVG-иконки
window.renderBottomNav = function(active) {
    const items = [
        { 
            id: 'home', 
            label: 'Главная',
            svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/></svg>`
        },
        { 
            id: 'products', 
            label: 'Продукты',
            svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
        },
        { 
            id: 'diary', 
            label: 'Дневник',
            svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`
        },
        { 
            id: 'recipes', 
            label: 'Рецепты',
            svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8"/><path d="M8 12h6"/><path d="M8 16h4"/></svg>`
        },
        { 
            id: 'more', 
            label: 'Ещё',
            svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>`
        }
    ];

    let html = `<div class="bottom-navigation">`;
    items.forEach(item => {
        const isActive = (active === item.id);
        html += `
            <button class="nav-item ${isActive ? 'active' : ''}" data-action="navigate" data-screen="${item.id}">
                <span class="nav-icon">${item.svg}</span>
                <span class="nav-label">${item.label}</span>
                ${isActive ? '<span class="nav-dot"></span>' : ''}
            </button>
        `;
    });
    html += `</div>`;
    return html;
};