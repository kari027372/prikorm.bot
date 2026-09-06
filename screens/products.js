/* ============================================================
   screens/products.js — новый UX раздела «Продукты»
   ============================================================ */

import { getCurrentChild, getChildAgeMonths } from '../services/child-service.js';
import { getProductState } from '../services/product-state.js';
import safetyEngine from '../services/safety-engine.js';
import { PRODUCTS } from '../data/products.js';
import STATE from '../state.js';

// ===== ЛОКАЛЬНЫЕ ПЕРЕМЕННЫЕ ФИЛЬТРОВ =====
let currentStatusFilter = 'all';      // 'all' | 'current' | 'introduced'
let currentCategoryFilter = null;
let currentAgeFilter = null;
let currentSearchQuery = '';

// ===== КАРТА КАТЕГОРИЙ → EMOJI (FALLBACK) =====
const categoryEmojiMap = {
    'Овощи': '🥦',
    'Фрукты': '🍎',
    'Крупы': '🌾',
    'Мясо': '🍗',
    'Рыба': '🐟',
    'Молочные': '🥛',
    'Аллергены': '⚠️',
    'Другое': '🍽'
};

const invalidEmojis = ['🤰😂'];

function getProductEmoji(product) {
    if (product.emoji && !invalidEmojis.includes(product.emoji)) {
        return product.emoji;
    }
    return categoryEmojiMap[product.category] || '🍽';
}

// ===== БЕЗОПАСНАЯ ОБЁРТКА ДЛЯ SAFETY ENGINE =====
function safeEvaluate(product, childId) {
    const child = STATE.children.find(c => c.id === childId);
    if (!child) return { decision: 'allow', reason: '' };
    try {
        const result = safetyEngine.evaluateProductSafety(child, product, null);
        return result || { decision: 'allow', reason: '' };
    } catch (e) {
        console.warn('⚠️ Safety Engine error for', product.name, e);
        return { decision: 'allow', reason: '' };
    }
}

// ===== РЕНДЕРИНГ КАРТОЧКИ =====
function renderProductCard(product, childId) {
    const status = getProductState(childId, product.id);
    const safety = safeEvaluate(product, childId);

    let statusText = '○ Ещё не введён';
    let statusClass = 'status-not-introduced';
    if (status === 'introduced') {
        statusText = '✅ Введён';
        statusClass = 'status-introduced';
    } else if (status === 'parentExcluded') {
        statusText = '❌ Не хочу';
        statusClass = 'status-excluded';
    }

    const emoji = getProductEmoji(product);
    const ageLabel = product.ageMinMonths ? `${product.ageMinMonths}+ мес` : '';

    let warningBadge = '';
    if (safety.decision === 'caution') {
        warningBadge = `<span class="badge badge-caution">⚠️ ${safety.reason || 'С осторожностью'}</span>`;
    } else if (safety.decision === 'review') {
        warningBadge = `<span class="badge badge-review">ℹ️ ${safety.reason || 'Требует внимания'}</span>`;
    }

    let actionButton = '';
    if (status === 'notIntroduced') {
        actionButton = `<button class="btn-primary" data-action="add-product-intro" data-product-id="${product.id}">＋ Ввести продукт</button>`;
    } else {
        actionButton = `<span class="status-label ${statusClass}">${statusText}</span>`;
    }

    return `
        <div class="card product-card" data-action="select-product" data-product-id="${product.id}">
            <div class="product-card-header">
                <span class="product-emoji">${emoji}</span>
                <h3 class="product-name">${escapeHTML(product.name)}</h3>
                ${warningBadge}
            </div>
            <div class="product-card-body">
                <div class="product-meta">
                    <span class="product-category">${escapeHTML(product.category)}</span>
                    ${ageLabel ? `<span class="product-age">${ageLabel}</span>` : ''}
                </div>
                <div class="product-actions">
                    ${actionButton}
                    <button class="btn-icon" data-action="show-product-menu" data-product-id="${product.id}">⋯</button>
                </div>
            </div>
        </div>
    `;
}

// ===== БЛОК «РЕКОМЕНДОВАНО СЕЙЧАС» =====
function renderRecommendedProducts(childId) {
    const products = PRODUCTS || [];
    const recommended = products
        .map(p => ({ product: p, safety: safeEvaluate(p, childId) }))
        .filter(({ safety }) => safety.decision === 'allow' || safety.decision === 'caution')
        .sort((a, b) => {
            if (a.safety.decision === 'allow' && b.safety.decision !== 'allow') return -1;
            if (a.safety.decision !== 'allow' && b.safety.decision === 'allow') return 1;
            const age = getChildAgeMonths(childId);
            return Math.abs((a.product.ageMinMonths || 0) - age) - Math.abs((b.product.ageMinMonths || 0) - age);
        })
        .slice(0, 6)
        .map(({ product }) => renderProductCard(product, childId))
        .join('');

    if (!recommended) {
        return `<p class="text-secondary">Пока нет рекомендованных продуктов для этого возраста.</p>`;
    }
    return `<div class="recommended-grid">${recommended}</div>`;
}

// ===== СЕТКА КАТЕГОРИЙ =====
function renderCategoryGrid() {
    const categories = Object.keys(categoryEmojiMap);
    return categories
        .map(cat => `
            <div class="category-chip" data-action="filter-products" data-category="${cat}">
                <span class="category-emoji">${categoryEmojiMap[cat]}</span>
                <span class="category-name">${escapeHTML(cat)}</span>
            </div>
        `)
        .join('');
}

// ===== ОБНОВЛЕНИЕ СПИСКА =====
function updateProductsList() {
    const childId = STATE.currentChildId;
    if (!childId) return;
    let products = PRODUCTS || [];

    if (currentStatusFilter === 'current') {
        products = products.filter(p => {
            const safety = safeEvaluate(p, childId);
            return safety.decision === 'allow' || safety.decision === 'caution';
        });
    } else if (currentStatusFilter === 'introduced') {
        products = products.filter(p => getProductState(childId, p.id) === 'introduced');
    }

    if (currentCategoryFilter) {
        products = products.filter(p => p.category === currentCategoryFilter);
    }
    if (currentAgeFilter) {
        const ageLimit = parseInt(currentAgeFilter, 10);
        if (!isNaN(ageLimit)) {
            products = products.filter(p => (p.ageMinMonths || 0) >= ageLimit);
        }
    }
    if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q));
    }

    const container = document.getElementById('products-list');
    if (container) {
        if (products.length === 0) {
            container.innerHTML = `<p class="text-secondary">Нет продуктов, соответствующих фильтрам.</p>`;
        } else {
            container.innerHTML = products.map(p => renderProductCard(p, childId)).join('');
        }
    }

    const countEl = document.getElementById('products-introduced-count');
    if (countEl) {
        const introducedCount = (PRODUCTS || []).filter(p => getProductState(childId, p.id) === 'introduced').length;
        countEl.textContent = introducedCount;
    }

    const recContainer = document.getElementById('recommended-products');
    if (recContainer) {
        recContainer.innerHTML = renderRecommendedProducts(childId);
    }

    updateChipsActiveState();
}

function updateChipsActiveState() {
    document.querySelectorAll('#status-filters .chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === currentStatusFilter);
    });
    document.querySelectorAll('#category-filters .chip').forEach(chip => {
        const cat = chip.dataset.category || '';
        chip.classList.toggle('active', cat === (currentCategoryFilter || ''));
    });
    document.querySelectorAll('#age-filters .chip').forEach(chip => {
        const age = chip.dataset.age || '';
        chip.classList.toggle('active', age === (currentAgeFilter || ''));
    });
}

// ===== ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА =====
export function renderProductsScreen() {
    const childId = STATE.currentChildId;
    const introducedCount = childId ? (PRODUCTS || []).filter(p => getProductState(childId, p.id) === 'introduced').length : 0;

    if (STATE.productsCategoryFilter !== undefined) {
        currentCategoryFilter = STATE.productsCategoryFilter;
    }
    if (STATE.productsAgeFilter !== undefined) {
        currentAgeFilter = STATE.productsAgeFilter;
    }

    let recommendedHtml = '';
    try {
        recommendedHtml = childId ? renderRecommendedProducts(childId) : '';
    } catch (e) {
        console.error('Ошибка в renderRecommendedProducts:', e);
        recommendedHtml = `<p class="text-secondary">Не удалось загрузить рекомендации.</p>`;
    }

    return `
        <div class="products-screen" id="screen-products">
            <div class="products-header">
                <h1 class="h1">Продукты</h1>
                <div class="introduced-counter" data-action="filter-products" data-filter="introduced">
                    ✅ Введено: <span id="products-introduced-count">${introducedCount}</span>
                </div>
            </div>

            <div class="search-box">
                <span>🔍</span>
                <input id="product-search" type="search" placeholder="Найти продукт..." autocomplete="off" data-action="search-products" />
                <button type="button" class="clear-search" data-action="clear-search">✕</button>
            </div>

            <section class="recommended-section">
                <h2 class="h2">✨ Рекомендовано сейчас</h2>
                <div id="recommended-products" class="recommended-grid">
                    ${recommendedHtml}
                </div>
            </section>

            <section class="categories-section">
                <h2 class="h2">Категории</h2>
                <div id="category-grid" class="categories-grid">
                    ${renderCategoryGrid()}
                </div>
            </section>

            <section class="filters-section">
                <div class="filter-group">
                    <span class="filter-label">Статус:</span>
                    <div class="chips-group" id="status-filters">
                        <span class="chip active" data-action="filter-products" data-filter="all">Все</span>
                        <span class="chip" data-action="filter-products" data-filter="current">✨ Сейчас</span>
                        <span class="chip" data-action="filter-products" data-filter="introduced">✅ Введены</span>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Категория:</span>
                    <div class="chips-group" id="category-filters">
                        <span class="chip active" data-action="filter-products" data-category="">Все</span>
                    </div>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Возраст:</span>
                    <div class="chips-group" id="age-filters">
                        <span class="chip active" data-action="filter-products" data-age="">Все</span>
                        <span class="chip" data-action="filter-products" data-age="6">6+</span>
                        <span class="chip" data-action="filter-products" data-age="7">7+</span>
                        <span class="chip" data-action="filter-products" data-age="8">8+</span>
                        <span class="chip" data-action="filter-products" data-age="9">9+</span>
                        <span class="chip" data-action="filter-products" data-age="10">10+</span>
                    </div>
                </div>
            </section>

            <section class="products-list-section">
                <h2 class="h2">Все продукты</h2>
                <div id="products-list" class="products-list">
                    ${childId ? updateProductsList() : '<p class="text-secondary">Выберите ребёнка</p>'}
                </div>
            </section>

            <button type="button" class="floating-add" data-action="add-food">➕ <span>Добавить</span></button>
        </div>
    `;
}

// ===== ГЛОБАЛЬНОЕ ПРИСВОЕНИЕ ДЛЯ РЕНДЕРИНГА =====
window.renderProducts = renderProductsScreen;
window.updateProductsList = updateProductsList;
window.setProductsFilters = function({ filter, category, age }) {
    if (filter !== undefined) currentStatusFilter = filter || 'all';
    if (category !== undefined) currentCategoryFilter = category || null;
    if (age !== undefined) currentAgeFilter = age || null;
    STATE.productsCategoryFilter = currentCategoryFilter;
    STATE.productsAgeFilter = currentAgeFilter;
    updateProductsList();
};
window.searchProducts = function(value) {
    currentSearchQuery = value || '';
    updateProductsList();
};
window.clearProductSearch = function() {
    const input = document.getElementById('product-search');
    if (input) input.value = '';
    currentSearchQuery = '';
    updateProductsList();
};
window.changeProductCategory = function(category) {
    currentCategoryFilter = category || null;
    updateProductsList();
};