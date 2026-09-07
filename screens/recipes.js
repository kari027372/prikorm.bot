// screens/recipes.js — экран "Рецепты"
function renderRecipes() {
  const child = window.getCurrentChild ? window.getCurrentChild() : null;

  // --- ИЗМЕНЕНИЕ: SVG-иконка "назад" вместо ⌂ ---
  const homeIcon = `
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/>
    </svg>
  `;

  if (!child || !child.id) {
    return `
      <div class="page-header">
        <h1 class="header-title">Рецепты</h1>
        <button class="icon-button" data-action="navigate" data-screen="home">${homeIcon}</button>
      </div>
      <div class="empty-state">
        <h3>Нет активного ребёнка</h3>
        <p>Выберите ребёнка, чтобы увидеть подходящие рецепты.</p>
      </div>
    `;
  }

  if (!window.recipeService) {
    return `
      <div class="page-header">
        <h1 class="header-title">Рецепты</h1>
        <button class="icon-button" data-action="navigate" data-screen="home">${homeIcon}</button>
      </div>
      <div class="empty-state">
        <h3>⚠️ Сервис рецептов недоступен</h3>
        <p>Пожалуйста, обновите страницу.</p>
      </div>
    `;
  }

  const recipesData = window.recipeService.getRecipesForChild(child.id, { onlySafe: true });

  return `
    <div class="page-header">
      <h1 class="header-title">Рецепты</h1>
      <button class="icon-button" data-action="navigate" data-screen="home">${homeIcon}</button>
    </div>

    ${recipesData.length ? recipesData.map((item, index) => {
      const recipe = item.recipe;
      const safety = item.safety || 'unknown';
      const allIntroduced = item.allIntroduced === true;
      const warnings = item.warnings || [];
      const recipeId = recipe.id || recipe.name || 'rec_' + index;

      let safetyIcon = '';
      if (safety === 'safe') safetyIcon = '✅';
      else if (safety === 'caution') safetyIcon = '⚠️';
      else if (safety === 'block') safetyIcon = '⛔';
      else safetyIcon = '❓';

      const introducedLabel = allIntroduced ? '' : ' (требуется введение)';
      const warningText = warnings.length ? `
        <div style="margin-top:8px;font-size:13px;color:var(--kenora-text-muted);">
          ${warnings.join(' · ')}
        </div>
      ` : '';

      return `
        <div class="recipe-card" data-action="open-recipe" data-recipe-id="${recipeId}">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h3 style="font-weight:600;font-size:18px;">${recipe.name} ${safetyIcon}</h3>
          </div>
          <div style="font-size:14px;color:var(--kenora-text-secondary);margin-top:4px;">
            ${recipe.desc || ''}
          </div>
          <div style="font-size:13px;color:var(--kenora-text-muted);margin-top:6px;">
            с ${recipe.age || 0} мес.${introducedLabel}
          </div>
          ${warningText}
        </div>
      `;
    }).join('') : `
      <div class="empty-state">
        <h3>Нет подходящих рецептов</h3>
        <p>Попробуйте ввести больше продуктов или изменить фильтры.</p>
      </div>
    `}
  `;
}
window.renderRecipes = renderRecipes;