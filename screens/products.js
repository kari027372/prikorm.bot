// screens/products.js — экран "Продукты"
function renderProducts() {
    const products = getProducts();
    const ui = getUIState();
    const search = (ui.productSearch || '').toLowerCase();
    const currentCat = ui.productCategory || 'all';
    let filtered = products;
    if (search) filtered = filtered.filter(p => p.name && p.name.toLowerCase().includes(search));
    const cats = ['овощ', 'фрукт', 'каша', 'мясо', 'рыба', 'яйцо', 'молочное', 'бобовые', 'орехи'];
    if (currentCat !== 'all') filtered = filtered.filter(p => p.cat === currentCat);

    return `
    <div class="screen">
        <div class="page-header"><h1>Продукты</h1></div>
        <div class="search-box">🔎 <input id="product-search" type="search" placeholder="Найти продукт..." value="${ui.productSearch || ''}"></div>
        <div class="category-scroll">
            <button class="category-chip ${currentCat === 'all' ? 'active' : ''}" data-action="product-category" data-category="all">Все</button>
            ${cats.map(c => `<button class="category-chip ${currentCat === c ? 'active' : ''}" data-action="product-category" data-category="${c}">${c}</button>`).join('')}
        </div>
        <div class="products-grid">
            ${filtered.length ? filtered.map(p => `
                <div class="product-card ${isProductIntroduced(p.id) ? 'introduced' : ''}" data-action="open-product" data-product-id="${p.id}">
                    <span class="product-emoji">${p.emoji || '🥣'}</span>
                    <h3>${p.name}</h3>
                    <div class="product-tags"><span>${p.min_age || 0}+ мес.</span>${p.iron ? '<span>🩸 Железо</span>' : ''}${p.allergen ? '<span>⚠️ Аллерген</span>' : ''}</div>
                    ${isProductIntroduced(p.id) ? '<div class="introduced-label">✓ Пробовали</div>' : ''}
                </div>
            `).join('') : `
                <div class="empty-state"><div class="empty-icon">🔍</div><h3>Ничего не найдено</h3><p>Попробуйте изменить фильтр</p></div>
            `}
        </div>
    </div>`;
}

// Экспорт в глобальную область
window.renderProducts = renderProducts;