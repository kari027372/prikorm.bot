// components/bottom-nav.js
(function() {
    'use strict';

    window.renderBottomNav = function(active) {
        const items = [
            { id: 'home', icon: '⌂', label: 'Главная' },
            { id: 'products', icon: '🥑', label: 'Продукты' },
            { id: 'today', icon: '📅', label: 'Сегодня' },
            { id: 'diary', icon: '📖', label: 'Дневник' },
            { id: 'baby', icon: '👶', label: 'Малыш' }
        ];
        return `<nav class="bottom-navigation">${items.map(it => `<button class="nav-item ${active === it.id ? 'active' : ''}" data-action="navigate" data-screen="${it.id}"><span>${it.icon}</span><small>${it.label}</small></button>`).join('')}</nav>`;
    };

    console.log('✅ bottom-nav.js загружен');
})();