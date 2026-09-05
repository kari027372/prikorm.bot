// components/product-card.js
(function() {
    'use strict';

    /**
     * Рендерит карточку продукта
     * @param {Object} product - объект продукта
     * @param {string} product.id - уникальный идентификатор
     * @param {string} product.name - название
     * @param {string} product.emoji - эмодзи (опционально)
     * @param {string[]} product.tags - массив тегов (например, ['Овощи', 'Белки'])
     * @param {boolean} product.introduced - введён ли уже продукт
     * @returns {string} HTML-строка карточки
     */
    window.renderProductCard = function(product) {
        if (!product) return '';

        return `
            <div class="product-card" data-action="open-product" data-product-id="${product.id}">
                <div class="product-emoji">${product.emoji || ''}</div>
                <div class="product-info">
                    <h3>${product.name || 'Продукт'}</h3>
                    <div class="product-tags">
                        ${(product.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    ${product.introduced ? '<div class="product-status">✅ Введён</div>' : ''}
                </div>
            </div>
        `;
    };

    console.log('✅ product-card.js загружен (с data-action)');
})();