// components/recipe-card.js
(function() {
    'use strict';

    window.renderRecipeCard = function(recipe) {
        if (!recipe) return '';
        return `
            <div class="recipe-card" data-recipe-id="${recipe.id || ''}">
                <h3>${recipe.emoji || '🍲'} ${recipe.name || 'Рецепт'}</h3>
                <p>${recipe.description || ''}</p>
                <div class="meta">
                    👶 ${recipe.age || 'с 6 мес.'} • ⏱ ${recipe.time || '15 мин'}
                </div>
            </div>
        `;
    };

    console.log('✅ recipe-card.js загружен');
})();