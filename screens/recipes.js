// screens/recipes.js — экран "Рецепты"
function renderRecipes() {
    const recipes = getRecipes();
    return `
    <div class="screen">
        <div class="page-header"><h1>Рецепты</h1></div>
        ${recipes.length ? recipes.map(r => `
            <div class="recipe-card" data-action="open-recipe" data-recipe-id="${r.id || ''}">
                <h3>${r.name}</h3>
                <p>${r.desc || ''}</p>
                <div class="meta">с ${r.age || 0} мес.</div>
            </div>
        `).join('') : `
            <div class="empty-state"><div class="empty-icon">🍲</div><h3>Рецептов пока нет</h3><p>Добавьте свои рецепты.</p></div>
        `}
    </div>`;
}

window.renderRecipes = renderRecipes;