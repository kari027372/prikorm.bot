// screens/products.js
(function () {
    'use strict';

    var currentCategory = 'all';
    var searchQuery = '';

    function getProducts() {
        return Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
    }

    function getCategories() {
        return Array.isArray(window.CATEGORIES) ? window.CATEGORIES : [];
    }

    function getChildFromState(state) {
        state = state || window.STATE || {};

        if (
            Array.isArray(state.children) &&
            state.currentChildId
        ) {
            return state.children.find(function (child) {
                return child.id === state.currentChildId;
            }) || null;
        }

        if (typeof window.getCurrentChild === 'function') {
            try {
                return window.getCurrentChild(state);
            } catch (error) {
                console.warn('Не удалось получить текущего ребёнка:', error);
            }
        }

        return null;
    }

    function renderProducts(state) {
        var products = getProducts();
        var categories = getCategories();

        var child = getChildFromState(state);
        var childAgeMonths = child && typeof child.ageMonths === 'number'
            ? child.ageMonths
            : 0;

        var filtered = products.slice();

        if (currentCategory !== 'all') {
            filtered = filtered.filter(function (product) {
                return product.category === currentCategory;
            });
        }

        if (searchQuery.trim()) {
            var query = searchQuery.toLowerCase().trim();

            filtered = filtered.filter(function (product) {
                var nameMatch =
                    product.name &&
                    product.name.toLowerCase().includes(query);

                var highlightMatch =
                    Array.isArray(product.highlights) &&
                    product.highlights.some(function (highlight) {
                        return highlight.toLowerCase().includes(query);
                    });

                var factMatch =
                    product.interestingFact &&
                    product.interestingFact.toLowerCase().includes(query);

                return nameMatch || highlightMatch || factMatch;
            });
        }

        var statusOrder = {
            recommended: 0,
            caution: 1,
            age_limited: 2,
            avoid: 3
        };

        filtered.sort(function (a, b) {
            return (
                (statusOrder[a.status] ?? 99) -
                (statusOrder[b.status] ?? 99)
            );
        });

        var html = '';

        html += '<div class="screen products-screen">';

        html +=
            '<div class="screen-header">' +
            '<h2>Продукты</h2>' +
            '<span class="product-count">' +
            filtered.length +
            ' из ' +
            products.length +
            '</span>' +
            '</div>';

        html +=
            '<div class="products-search">' +
            '<input ' +
            'type="text" ' +
            'id="productSearch" ' +
            'placeholder="🔍 Поиск (название, польза...)" ' +
            'value="' +
            escapeHtml(searchQuery) +
            '">' +
            '</div>';

        html += '<div class="products-filters">';

        html +=
            '<button class="filter-btn ' +
            (currentCategory === 'all' ? 'active' : '') +
            '" data-category="all">Все</button>';

        categories.forEach(function (category) {
            html +=
                '<button class="filter-btn ' +
                (currentCategory === category.id ? 'active' : '') +
                '" data-category="' +
                escapeHtml(category.id) +
                '">' +
                (category.icon || '') +
                ' ' +
                escapeHtml(category.label) +
                '</button>';
        });

        html += '</div>';

        html += '<div class="products-grid">';

        if (!filtered.length) {
            html +=
                '<div class="empty-state">' +
                '😕 Ничего не найдено' +
                '</div>';
        } else {
            filtered.forEach(function (product) {
                var introduction =
                    product.introduction &&
                    typeof product.introduction.fromMonths === 'number'
                        ? product.introduction.fromMonths
                        : null;

                var ageOk =
                    introduction === null ||
                    childAgeMonths >= introduction;

                var hasIron =
                    Array.isArray(product.nutrients) &&
                    product.nutrients.includes('iron');

                var hasOmega =
                    Array.isArray(product.nutrients) &&
                    product.nutrients.includes('omega3');

                var isHighChoking =
                    product.chokingRisk === 'high';

                var isAllergen = product.allergen === true;
                var isCommercial = product.commercialProduct === true;

                var statusIcon = '';

                if (product.status === 'recommended') {
                    statusIcon = '🟢';
                } else if (product.status === 'caution') {
                    statusIcon = '🟡';
                } else if (product.status === 'avoid') {
                    statusIcon = '🔴';
                } else if (product.status === 'age_limited') {
                    statusIcon = '⏳';
                }

                var badges = '';

                if (introduction !== null) {
                    if (ageOk) {
                        badges +=
                            '<span class="badge age-ok">' +
                            '✅ с ' +
                            introduction +
                            ' мес.' +
                            '</span>';
                    } else {
                        badges +=
                            '<span class="badge age-not">' +
                            '⏳ с ' +
                            introduction +
                            ' мес.' +
                            '</span>';
                    }
                }

                if (isAllergen) {
                    badges +=
                        '<span class="badge allergen">' +
                        '⚠️ Аллерген' +
                        '</span>';
                }

                if (hasIron) {
                    badges +=
                        '<span class="badge iron">' +
                        '⚡ Железо' +
                        '</span>';
                }

                if (hasOmega) {
                    badges +=
                        '<span class="badge omega">' +
                        '🧠 Омега-3' +
                        '</span>';
                }

                if (isHighChoking) {
                    badges +=
                        '<span class="badge choking">' +
                        '🚨 Риск удушья' +
                        '</span>';
                }

                if (isCommercial) {
                    badges +=
                        '<span class="badge commercial">' +
                        '🏷️ Магазинный' +
                        '</span>';
                }

                var highlights = '';

                if (
                    Array.isArray(product.highlights) &&
                    product.highlights.length
                ) {
                    highlights = product.highlights
                        .slice(0, 2)
                        .map(function (highlight) {
                            return (
                                '<span class="highlight">' +
                                escapeHtml(highlight) +
                                '</span>'
                            );
                        })
                        .join(' ');
                }

                html +=
                    '<div class="product-card" ' +
                    'data-product-id="' +
                    escapeHtml(product.id) +
                    '" ' +
                    'data-status="' +
                    escapeHtml(product.status || '') +
                    '">' +

                    '<div class="product-emoji">' +
                    (product.emoji || '🍽️') +
                    '</div>' +

                    '<div class="product-info">' +

                    '<div class="product-name">' +
                    escapeHtml(product.name) +
                    ' <span class="status-icon">' +
                    statusIcon +
                    '</span>' +
                    '</div>' +

                    '<div class="product-highlights">' +
                    highlights +
                    '</div>' +

                    '<div class="product-badges">' +
                    badges +
                    '</div>' +

                    '</div>' +

                    '<div class="product-arrow">›</div>' +

                    '</div>';
            });
        }

        html += '</div>';

        html +=
            '<div class="disclaimer">' +
            '⚕️ Информация носит справочный характер. ' +
            'При наличии аллергии или сомнений проконсультируйтесь с врачом.' +
            '</div>';

        html += '</div>';

        return html;
    }

    function setProductsFilter(category) {
        currentCategory = category || 'all';
    }

    function setProductsSearch(query) {
        searchQuery = query || '';
    }

    function getProductsFilter() {
        return {
            category: currentCategory,
            search: searchQuery
        };
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.renderProducts = renderProducts;
    window.setProductsFilter = setProductsFilter;
    window.setProductsSearch = setProductsSearch;
    window.getProductsFilter = getProductsFilter;

    console.log('✅ screens/products.js загружен');
})();