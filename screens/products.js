// screens/products.js (исправленная версия)
(function() {
    'use strict';

    // Используем глобальные данные
    var PRODUCTS = window.PRODUCTS || [];
    var CATEGORIES = window.CATEGORIES || [];

    // Состояние фильтров (локальное)
    var currentCategory = 'all';
    var searchQuery = '';

    // Функция для экранирования HTML (защита от XSS)
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Основная функция рендера экрана "Продукты"
     */
    function renderProducts() {
        var state = window.STATE || {};
        var child = state.children ? state.children.find(function(c) { return c.id === state.currentChildId; }) : null;
        var childAgeMonths = child ? child.ageMonths : 0;

        // Фильтрация
        var filtered = PRODUCTS.slice();
        if (currentCategory !== 'all') {
            filtered = filtered.filter(function(p) { return p.category === currentCategory; });
        }
        if (searchQuery.trim()) {
            var q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(function(p) {
                return p.name.toLowerCase().includes(q) ||
                    (p.highlights && p.highlights.some(function(h) { return h.toLowerCase().includes(q); })) ||
                    (p.interestingFact && p.interestingFact.toLowerCase().includes(q));
            });
        }

        // Сортировка: recommended → caution → age_limited → avoid
        var statusOrder = { recommended: 0, caution: 1, age_limited: 2, avoid: 3 };
        filtered.sort(function(a, b) {
            return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        });

        // Построение HTML
        var html = '';
        html += '<div class="screen products-screen">';
        html += '  <div class="screen-header">';
        html += '    <h2>Продукты</h2>';
        html += '    <span class="product-count">' + filtered.length + ' из ' + PRODUCTS.length + '</span>';
        html += '  </div>';

        // === ПОЛЕ ПОИСКА с id="product-search" ===
        html += '  <div class="products-search">';
        html += '    <input type="text" id="product-search" placeholder="🔍 Поиск продуктов..." value="' + escapeHtml(searchQuery) + '">';
        html += '  </div>';

        // Фильтры по категориям
        html += '  <div class="products-filters">';
        html += '    <button class="filter-btn' + (currentCategory === 'all' ? ' active' : '') + '" data-action="product-category" data-category="all">Все</button>';
        CATEGORIES.forEach(function(cat) {
            var active = currentCategory === cat.id ? ' active' : '';
            html += '    <button class="filter-btn' + active + '" data-action="product-category" data-category="' + cat.id + '">' + cat.icon + ' ' + cat.label + '</button>';
        });
        html += '  </div>';

        // Список продуктов
        html += '  <div class="products-grid">';
        if (filtered.length === 0) {
            html += '    <div class="empty-state">😕 Ничего не найдено</div>';
        } else {
            filtered.forEach(function(product) {
                var ageOk = childAgeMonths >= product.introduction.fromMonths;
                var isAllergen = product.allergen;
                var hasIron = product.nutrients && product.nutrients.indexOf('iron') !== -1;
                var hasOmega = product.nutrients && product.nutrients.indexOf('omega3') !== -1;
                var isHighChoking = product.chokingRisk === 'high';
                var isCommercial = product.commercialProduct;

                var statusIcon = '';
                if (product.status === 'recommended') statusIcon = '🟢';
                else if (product.status === 'caution') statusIcon = '🟡';
                else if (product.status === 'avoid') statusIcon = '🔴';
                else if (product.status === 'age_limited') statusIcon = '⏳';

                var badges = '';
                if (ageOk) badges += '<span class="badge age-ok">✅ с ' + product.introduction.fromMonths + ' мес.</span>';
                else badges += '<span class="badge age-not">⏳ с ' + product.introduction.fromMonths + ' мес.</span>';
                if (isAllergen) badges += '<span class="badge allergen">⚠️ Аллерген</span>';
                if (hasIron) badges += '<span class="badge iron">⚡ Железо</span>';
                if (hasOmega) badges += '<span class="badge omega">🧠 Омега-3</span>';
                if (isHighChoking) badges += '<span class="badge choking">🚨 Риск удушья</span>';
                if (isCommercial) badges += '<span class="badge commercial">🏷️ Магазинный</span>';

                var highlights = '';
                if (product.highlights && product.highlights.length) {
                    var firstTwo = product.highlights.slice(0, 2);
                    highlights = firstTwo.map(function(h) { return '<span class="highlight">' + h + '</span>'; }).join(' ');
                }

                // === КАРТОЧКА С data-action="open-product" ===
                html += '    <div class="product-card" data-action="open-product" data-product-id="' + product.id + '" data-status="' + product.status + '">';
                html += '      <div class="product-emoji">' + product.emoji + '</div>';
                html += '      <div class="product-info">';
                html += '        <div class="product-name">' + product.name + ' <span class="status-icon">' + statusIcon + '</span></div>';
                html += '        <div class="product-highlights">' + highlights + '</div>';
                html += '        <div class="product-badges">' + badges + '</div>';
                html += '      </div>';
                html += '      <div class="product-arrow">›</div>';
                html += '    </div>';
            });
        }
        html += '  </div>';

        // Дисклеймер
        html += '  <div class="disclaimer">';
        html += '    ⚕️ Информация носит справочный характер. При наличии аллергии или сомнений проконсультируйтесь с врачом.';
        html += '  </div>';
        html += '</div>';

        return html;
    }

    // Функции управления фильтрами (используются в handlers.js)
    function setProductsFilter(category) {
        currentCategory = category;
    }

    function setProductsSearch(query) {
        searchQuery = query;
    }

    function getProductsFilter() {
        return { category: currentCategory, search: searchQuery };
    }

    // Регистрируем глобально
    window.renderProducts = renderProducts;
    window.setProductsFilter = setProductsFilter;
    window.setProductsSearch = setProductsSearch;
    window.getProductsFilter = getProductsFilter;

    console.log('✅ screens/products.js загружен (с data-action и поиском)');
})();