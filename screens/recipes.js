// screens/recipes.js — экран "Рецепты"
function renderRecipes() {
    // Получаем активного ребёнка
    const child = window.getCurrentChild ? window.getCurrentChild() : null;

    // Нет активного ребёнка
    if (!child || !child.id) {
        return `
        <div class="screen">
            <div class="page-header"><h1>Рецепты</h1></div>
            <div class="empty-state"><div class="empty-icon">👶</div><h3>Нет активного ребёнка</h3><p>Выберите ребёнка, чтобы увидеть подходящие рецепты.</p></div>
        </div>`;
    }

    // Сервис не загружен
    if (!window.recipeService) {
        return `
        <div class="screen">
            <div class="page-header"><h1>Рецепты</h1></div>
            <div class="empty-state"><div class="empty-icon">⚠️</div><h3>Сервис рецептов недоступен</h3><p>Пожалуйста, обновите страницу.</p></div>
        </div>`;
    }

    // Получаем рецепты (только safe + caution, без block)
    const recipesData = window.recipeService.getRecipesForChild(child.id, { onlySafe: true });

    return `
    <div class="screen">
        <div class="page-header"><h1>Рецепты</h1></div>
        ${recipesData.length ? recipesData.map((item, index) => {
            const recipe = item.recipe;
            const safety = item.safety || 'unknown';
            const allIntroduced = item.allIntroduced === true;
            const warnings = item.warnings || [];

            // Идентификатор для open-recipe (совместимость с существующим handlers)
            const recipeId = recipe.id || recipe.name || 'rec_' + index;

            // Иконка безопасности
            let safetyIcon = '';
            if (safety === 'safe') safetyIcon = '✅';
            else if (safety === 'caution') safetyIcon = '⚠️';
            else if (safety === 'block') safetyIcon = '⛔';
            else safetyIcon = '❓';

            // Пометка о введённости
            const introducedLabel = allIntroduced ? '' : ' (требуется введение)';

            // Предупреждения (если есть)
            const warningText = warnings.length ? `<div class="recipe-warnings">${warnings.join('<br>')}</div>` : '';

            return `
            <div class="recipe-card" data-action="open-recipe" data-recipe-id="${recipeId}">
                <h3>${recipe.name} ${safetyIcon}</h3>
                <p>${recipe.desc || ''}</p>
                <div class="meta">с ${recipe.age || 0} мес.${introducedLabel}</div>
                ${warningText}
            </div>
            `;
        }).join('') : `
            <div class="empty-state"><div class="empty-icon">🍲</div><h3>Нет подходящих рецептов</h3><p>Попробуйте ввести больше продуктов или изменить фильтры.</p></div>
        `}
    </div>`;
}

window.renderRecipes = renderRecipes;