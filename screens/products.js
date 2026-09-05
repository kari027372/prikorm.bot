// screens/products.js
import { PRODUCTS, CATEGORIES, CATEGORY_LABELS } from '../data/products.js';
import { getCurrentChild, getProductEntriesForChild } from '../services/child-service.js';

/**
 * Рендеринг экрана «Продукты»
 * @param {Object} state - глобальный STATE
 */
export function renderProducts(state) {
  const child = getCurrentChild(state);
  const enteredProductIds = child ? getProductEntriesForChild(child.id).map(e => e.productId) : [];

  // Получаем параметры фильтрации из URL или из состояния (пока просто используем состояние)
  const currentCategory = state.productsFilterCategory || 'все';
  const searchQuery = state.productsSearchQuery || '';

  // Фильтруем продукты
  let filtered = PRODUCTS;
  if (currentCategory !== 'все') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }

  // Сортируем: сначала те, что уже введены (чтобы видеть прогресс)
  filtered = filtered.sort((a, b) => {
    const aEntered = enteredProductIds.includes(a.id);
    const bEntered = enteredProductIds.includes(b.id);
    if (aEntered && !bEntered) return -1;
    if (!aEntered && bEntered) return 1;
    return a.name.localeCompare(b.name);
  });

  // HTML для фильтров
  let filterButtons = `
    <div class="products-filters">
      <button class="filter-btn ${currentCategory === 'все' ? 'active' : ''}" data-category="все">Все</button>
  `;
  CATEGORIES.forEach(cat => {
    const label = CATEGORY_LABELS[cat] || cat;
    filterButtons += `
      <button class="filter-btn ${currentCategory === cat ? 'active' : ''}" data-category="${cat}">${label}</button>
    `;
  });
  filterButtons += `</div>`;

  // Поиск
  const searchHtml = `
    <div class="products-search">
      <input type="text" id="productsSearchInput" placeholder="🔍 Найти продукт..." value="${searchQuery}">
    </div>
  `;

  // Карточки продуктов
  let cardsHtml = '';
  if (filtered.length === 0) {
    cardsHtml = `<div class="empty-state">Ничего не найдено 😕</div>`;
  } else {
    filtered.forEach(product => {
      const isEntered = enteredProductIds.includes(product.id);
      const ageMonths = child ? child.ageMonths || 0 : 0;
      const isAvailable = ageMonths >= product.min_age_months;
      const cardClass = isEntered ? 'product-card entered' : 'product-card';
      const enteredBadge = isEntered ? `<span class="entered-badge">✅ Введён</span>` : '';
      const ageBadge = !isAvailable ? `<span class="age-badge">⏳ с ${product.min_age_months} мес.</span>` : '';

      cardsHtml += `
        <div class="${cardClass}" data-product-id="${product.id}" data-entered="${isEntered}">
          <div class="product-emoji">${product.emoji}</div>
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-desc">${product.desc}</div>
            <div class="product-meta">
              <span class="product-category">${CATEGORY_LABELS[product.category] || product.category}</span>
              ${product.iron ? '<span class="badge-iron">⚡ Железо</span>' : ''}
              ${product.allergen ? '<span class="badge-allergen">⚠️ Аллерген</span>' : ''}
              ${ageBadge}
            </div>
          </div>
          <div class="product-status">
            ${enteredBadge}
            <button class="btn-add-entry ${isEntered ? 'btn-remove' : ''}" data-product-id="${product.id}">
              ${isEntered ? '🗑️' : '➕'}
            </button>
          </div>
        </div>
      `;
    });
  }

  const html = `
    <div class="screen products-screen">
      <div class="screen-header">
        <h2>Продукты</h2>
      </div>
      ${searchHtml}
      ${filterButtons}
      <div class="products-grid">
        ${cardsHtml}
      </div>
    </div>
  `;

  // После рендера привязываем события (через делегирование или обработчики)
  // Это будет сделано в handlers.js, но можно добавить здесь временно
  // Но мы вернём HTML, а в handlers.js повесим обработчики

  return html;
}