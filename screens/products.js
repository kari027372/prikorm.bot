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
let currentCategoryFilter = null;     // название категории или null
let currentAgeFilter = null;          // число месяцев или null
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

const invalidEmojis = ['🤰😂']; // известные некорректные

function getProductEmoji(product) {
    if (product.emoji && !invalidEmojis.includes(product.emoji)) {
        return product.emoji;
    }
    return categoryEmojiMap[product.category] || '🍽';
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getCurrentProfile() {
    const child = getCurrentChild();
    if (!child) return null;
    return {
        id: child.id,
        ageMonths: getChildAgeMonths(child.id),
        // другие поля, если нужны для safetyEngine
    };
}

function getProductStatus(childId, productId) {
    const state = getProductState(childId, productId);
    return state; // 'notIntroduced' | 'introduced' | 'parentExcluded' | ...
}

// ===== РЕНДЕРИНГ КАРТОЧКИ ПРОДУКТА =====
function renderProductCard(product, childId) {
    const status = getProductStatus(childId, product.id);
    const profile = getCurrentProfile();
    const safety = safetyEngine.evaluateProductSafety(profile, product, null);

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
    const profile = getCurrentProfile();
    const products = PRODUCTS || [];
    const recommended = products
        .map(p => ({ product: p, safety: safetyEngine.evaluateProductSafety(profile, p, null) }))
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

// ===== ОСНОВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СПИСКА =====
function updateProductsList() {
    const childId = getCurrentChild()?.id;
    if (!childId) {
        console.warn('Нет активного ребёнка');
        return;
    }

    let products = PRODUCTS || [];
    const age = getChildAgeMonths(childId);

    // Фильтр по статусу
    if (currentStatusFilter === 'current') {
        products = products.filter(p => {
            const safety = safetyEngine.evaluateProductSafety(getCurrentProfile(), p, null);
            return safety.decision === 'allow' || safety.decision === 'caution';
        });
    } else if (currentStatusFilter === 'introduced') {
        products = products.filter(p => getProductStatus(childId, p.id) === 'introduced');
    }

    // Фильтр по категории
    if (currentCategoryFilter) {
        products = products.filter(p => p.category === currentCategoryFilter);
    }

    // Фильтр по возрасту (рекомендательный)
    if (currentAgeFilter) {
        const ageLimit = parseInt(currentAgeFilter, 10);
        if (!isNaN(ageLimit)) {
            products = products.filter(p => (p.ageMinMonths || 0) >= ageLimit);
        }
    }

    // Поиск
    if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q));
    }

    // Рендерим список
    const container = document.getElementById('products-list');
    if (container) {
        if (products.length === 0) {
            container.innerHTML = `<p class="text-secondary">Нет продуктов, соответствующих фильтрам.</p>`;
        } else {
            container.innerHTML = products.map(p => renderProductCard(p, childId)).join('');
        }
    }

    // Обновляем счётчик введённых
    const countEl = document.getElementById('products-introduced-count');
    if (countEl) {
        const introducedCount = (PRODUCTS || []).filter(p => getProductStatus(childId, p.id) === 'introduced').length;
        countEl.textContent = introducedCount;
    }

    // Обновляем блок «Рекомендовано сейчас»
    const recContainer = document.getElementById('recommended-products');
    if (recContainer) {
        recContainer.innerHTML = renderRecommendedProducts(childId);
    }

    // Обновляем активные чипсы
    updateChipsActiveState();
}

// ===== ОБНОВЛЕНИЕ АКТИВНЫХ ЧИПСОВ =====
function updateChipsActiveState() {
    document.querySelectorAll('#status-filters .chip').forEach(chip => {
        const filter = chip.dataset.filter;
        chip.classList.toggle('active', filter === currentStatusFilter);
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

// ===== ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ЭКРАНА =====
export function renderProductsScreen() {
    const childId = getCurrentChild()?.id;
    const introducedCount = childId ? (PRODUCTS || []).filter(p => getProductStatus(childId, p.id) === 'introduced').length : 0;

    // Синхронизируем фильтры из STATE при первом рендере
    if (STATE.productsCategoryFilter !== undefined) {
        currentCategoryFilter = STATE.productsCategoryFilter;
    }
    if (STATE.productsAgeFilter !== undefined) {
        currentAgeFilter = STATE.productsAgeFilter;
    }

    return `
        <div class="products-screen">
            <div class="products-header">
                <h1 class="h1">Продукты</h1>
                <div class="introduced-counter" data-action="filter-products" data-filter="introduced">
                    ✅ Введено: <span id="products-introduced-count">${introducedCount}</span>
                </div>
            </div>

            <div class="search-box">
                <span>${icon('search')}</span>
                <input id="product-search" type="search" placeholder="Найти продукт..." autocomplete="off" data-action="search-products" />
                <button type="button" class="clear-search" data-action="clear-search">${icon('close')}</button>
            </div>

            <section class="recommended-section">
                <h2 class="h2">✨ Рекомендовано сейчас</h2>
                <div id="recommended-products" class="recommended-grid">
                    ${childId ? renderRecommendedProducts(childId) : ''}
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

            <button type="button" class="floating-add" data-action="add-food">${icon('plus')}<span>Добавить</span></button>
        </div>
    `;
}

// ===== ЭКСПОРТ ФУНКЦИИ ДЛЯ ОБНОВЛЕНИЯ ФИЛЬТРОВ ИЗ HANDLERS =====
export function setProductsFilters({ filter, category, age }) {
    if (filter !== undefined) {
        currentStatusFilter = filter || 'all';
    }
    if (category !== undefined) {
        currentCategoryFilter = category || null;
    }
    if (age !== undefined) {
        currentAgeFilter = age || null;
    }
    // Сохраняем в STATE для сохранения между экранами
    STATE.productsCategoryFilter = currentCategoryFilter;
    STATE.productsAgeFilter = currentAgeFilter;
    // Перерисовываем список
    updateProductsList();
}

// ===== ГЛОБАЛЬНОЕ ПРИСВОЕНИЕ ДЛЯ ИСПОЛЬЗОВАНИЯ ИЗ HANDLERS =====
window.updateProductsList = updateProductsList;
window.setProductsFilters = setProductsFilters;