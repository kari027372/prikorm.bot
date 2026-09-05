// screens/products.js
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { getCurrentChild } from '../services/child-service.js';

// Состояние фильтров (локальное)
let currentCategory = 'all';
let searchQuery = '';

/**
 * Рендер экрана "Продукты"
 */
export function renderProducts(state) {
  const child = getCurrentChild(state);
  const childAgeMonths = child ? child.ageMonths : 0;

  // Фильтруем продукты
  let filtered = [...PRODUCTS];
  
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }
  
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.highlights && p.highlights.some(h => h.toLowerCase().includes(q))) ||
      (p.interestingFact && p.interestingFact.toLowerCase().includes(q))
    );
  }

  // Сортировка: сначала рекомендуемые, потом осторожные, потом избегать
  const statusOrder = { recommended: 0, caution: 1, age_limited: 2, avoid: 3 };
  filtered.sort((a, b) => (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0));

  // Строим HTML
  const html = `
    <div class="screen products-screen">
      <div class="screen-header">
        <h2>Продукты</h2>
        <span class="product-count">${filtered.length} из ${PRODUCTS.length}</span>
      </div>

      <!-- Поиск -->
      <div class="products-search">
        <input type="text" id="productSearch" placeholder="🔍 Поиск (название, польза...)" value="${searchQuery}">
      </div>

      <!-- Фильтры по категориям -->
      <div class="products-filters">
        <button class="filter-btn ${currentCategory === 'all' ? 'active' : ''}" data-category="all">Все</button>
        ${CATEGORIES.map(cat => `
          <button class="filter-btn ${currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
            ${cat.icon} ${cat.label}
          </button>
        `).join('')}
      </div>

      <!-- Дополнительные фильтры (особенности) – можно добавить позже, пока упрощённо -->

      <!-- Список продуктов -->
      <div class="products-grid">
        ${filtered.length === 0 ? `
          <div class="empty-state">😕 Ничего не найдено</div>
        ` : filtered.map(product => {
          const ageOk = childAgeMonths >= product.introduction.fromMonths;
          const isAllergen = product.allergen;
          const hasIron = product.nutrients && product.nutrients.includes('iron');
          const hasOmega = product.nutrients && product.nutrients.includes('omega3');
          const isHighChoking = product.chokingRisk === 'high';
          const isCommercial = product.commercialProduct;

          let statusIcon = '';
          if (product.status === 'recommended') statusIcon = '🟢';
          else if (product.status === 'caution') statusIcon = '🟡';
          else if (product.status === 'avoid') statusIcon = '🔴';
          else if (product.status === 'age_limited') statusIcon = '⏳';

          // Бейджи
          let badges = '';
          if (ageOk) badges += `<span class="badge age-ok">✅ с ${product.introduction.fromMonths} мес.</span>`;
          else badges += `<span class="badge age-not">⏳ с ${product.introduction.fromMonths} мес.</span>`;
          if (isAllergen) badges += `<span class="badge allergen">⚠️ Аллерген</span>`;
          if (hasIron) badges += `<span class="badge iron">⚡ Железо</span>`;
          if (hasOmega) badges += `<span class="badge omega">🧠 Омега-3</span>`;
          if (isHighChoking) badges += `<span class="badge choking">🚨 Риск удушья</span>`;
          if (isCommercial) badges += `<span class="badge commercial">🏷️ Магазинный</span>`;

          // Краткий список пользы (первые 2)
          const highlights = product.highlights ? product.highlights.slice(0, 2).map(h => `<span class="highlight">${h}</span>`).join(' ') : '';

          return `
            <div class="product-card" data-product-id="${product.id}" data-status="${product.status}">
              <div class="product-emoji">${product.emoji}</div>
              <div class="product-info">
                <div class="product-name">
                  ${product.name}
                  <span class="status-icon">${statusIcon}</span>
                </div>
                <div class="product-highlights">${highlights}</div>
                <div class="product-badges">${badges}</div>
              </div>
              <div class="product-arrow">›</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Дисклеймер -->
      <div class="disclaimer">
        ⚕️ Информация носит справочный характер. При наличии аллергии или сомнений проконсультируйтесь с врачом.
      </div>
    </div>
  `;

  return html;
}

/**
 * Обновить фильтры (вызывается из обработчиков)
 */
export function setProductsFilter(category) {
  currentCategory = category;
}

export function setProductsSearch(query) {
  searchQuery = query;
}

export function getProductsFilter() {
  return { category: currentCategory, search: searchQuery };
}