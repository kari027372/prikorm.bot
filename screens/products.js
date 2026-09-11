/* ============================================================
   screens/products.js — KENORA 2.0 Products
   Разметка приведена в соответствие с styles/products.css:
   - header: child-name + child-meta + introduced-count
   - search-row: search-box (search-icon + input + btn-recommendations) + btn-filter
   - recommendations bottom sheet
   Логика фильтров, статусов, карточек, safety — не изменена.
   ============================================================ */

(function() {
    'use strict';

    // ===== ГЛОБАЛЬНЫЕ ДАННЫЕ =====
    var PRODUCTS = window.PRODUCTS || [];
    var CATEGORIES = window.CATEGORIES || [];

    if (!CATEGORIES.length && PRODUCTS.length) {
        var catMap = {};
        PRODUCTS.forEach(function(p) { if (p.category) catMap[p.category] = true; });
        var defaultCats = [
            { id: 'овощи', label: 'Овощи', icon: '🥦' },
            { id: 'фрукты', label: 'Фрукты', icon: '🍎' },
            { id: 'крупы', label: 'Крупы', icon: '🌾' },
            { id: 'мясо', label: 'Мясо', icon: '🍗' },
            { id: 'рыба', label: 'Рыба', icon: '🐟' },
            { id: 'молочные', label: 'Молочные', icon: '🥛' },
            { id: 'аллергены', label: 'Аллергены', icon: '⚠️' },
            { id: 'другое', label: 'Другое', icon: '🍽' }
        ];
        CATEGORIES = defaultCats.filter(function(c) { return catMap[c.id] || c.id === 'другое'; });
        var existingIds = CATEGORIES.map(function(c) { return c.id; });
        Object.keys(catMap).forEach(function(id) {
            if (existingIds.indexOf(id) === -1) {
                CATEGORIES.push({ id: id, label: id.charAt(0).toUpperCase() + id.slice(1), icon: '📂' });
            }
        });
    }

    window.CURRENT_PRODUCT_SUITABLE = window.CURRENT_PRODUCT_SUITABLE === true;
    window.CURRENT_PRODUCT_SAFETY_FILTER = window.CURRENT_PRODUCT_SAFETY_FILTER || 'all';

    var categoryEmojiMap = {};
    CATEGORIES.forEach(function(cat) { categoryEmojiMap[cat.id] = cat.icon || '📂'; });
    var fallbackMap = {
        'овощи': '🥦', 'фрукты': '🍎', 'крупы': '🌾',
        'мясо': '🍗', 'рыба': '🐟', 'молочные': '🥛',
        'аллергены': '⚠️', 'другое': '🍽'
    };
    Object.keys(fallbackMap).forEach(function(key) {
        if (!categoryEmojiMap[key]) categoryEmojiMap[key] = fallbackMap[key];
    });

    var invalidEmojis = ['🫃'];
    function getProductEmoji(product) {
        if (product.emoji && invalidEmojis.indexOf(product.emoji) === -1) return product.emoji;
        return categoryEmojiMap[product.category] || '🍽';
    }

    function getProductMinAgeMonths(product) {
        if (product.introduction && product.introduction.fromMonths) return parseInt(product.introduction.fromMonths, 10) || 0;
        if (product.min_age_months) return parseInt(product.min_age_months, 10) || 0;
        if (product.min_age) return parseInt(product.min_age, 10) || 0;
        if (product.ageMinMonths) return parseInt(product.ageMinMonths, 10) || 0;
        return 0;
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ =====
    function getCurrentChildId() { return window.STATE ? window.STATE.currentChildId : null; }

    function getChildProfile(childId) {
        if (window.childService && typeof window.childService.getChildProfile === 'function') {
            try { return window.childService.getChildProfile(childId); } catch (e) { console.warn(e); }
        }
        if (window.STATE && window.STATE.children) {
            var child = window.STATE.children.find(function(c) { return c.id === childId; });
            if (child) {
                var profile = {
                    id: child.id, name: child.name, birthDate: child.birthDate,
                    sex: child.sex, feedingType: child.feedingType,
                    ageMonths: getChildAgeMonths(childId)
                };
                if (child.allergies) profile.allergies = child.allergies;
                if (child.readiness) profile.readiness = child.readiness;
                return profile;
            }
        }
        return null;
    }

    function getChildAgeMonths(childId) {
        if (!window.STATE || !window.STATE.children) return 0;
        var child = window.STATE.children.find(function(c) { return c.id === childId; });
        if (!child || !child.birthDate) return 0;
        var birth = new Date(child.birthDate);
        var now = new Date();
        var months = (now.getFullYear() - birth.getFullYear()) * 12;
        months += now.getMonth() - birth.getMonth();
        if (now.getDate() < birth.getDate()) months--;
        return Math.max(0, months);
    }

    function safeEvaluate(product, childId) {
        var profile = getChildProfile(childId);
        if (!profile) return { status: 'review', reasons: ['Нет профиля ребёнка'] };
        try {
            if (window.safetyEngine && typeof window.safetyEngine.evaluateProductSafety === 'function') {
                var result = window.safetyEngine.evaluateProductSafety(profile, product, null);
                if (result && typeof result === 'object') {
                    if (result.status === undefined && result.decision !== undefined) result.status = result.decision;
                    return result;
                }
            }
        } catch (e) { console.warn('Safety Engine error', e); }
        return { status: 'review', reasons: ['Ошибка оценки безопасности'] };
    }

    function getProductStatusForChild(productId, childId) {
        if (window.productStateService && typeof window.productStateService.getProductState === 'function') {
            try {
                var state = window.productStateService.getProductState(childId, productId);
                if (state && typeof state === 'object') return state.status || 'notIntroduced';
                if (typeof state === 'string') return state;
            } catch (error) { console.warn('[Products] getProductState error', error); }
        }
        return 'notIntroduced';
    }

    // ===== НОВОЕ: SVG для search / filter =====
    var uiIcons = {
        search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16 16l4 4"/></svg>',
        filter: '<svg viewBox="0 0 24 24"><path d="M4 6h16M6 12h12M8 18h8"/></svg>'
    };

    // ============================================================
    // КАРТОЧКА — структура и классы НЕ тронуты
    // ============================================================
    function renderProductCard(product) {
        var childId = getCurrentChildId();
        if (!childId) return '<div class="product-card">Выберите ребёнка</div>';

        var status = getProductStatusForChild(product.id, childId);
        var safety = safeEvaluate(product, childId);

        var statusText = '', statusClass = '', actionButton = '', showIntroButton = false;
        switch (status) {
            case 'notIntroduced': statusText = 'Не введено'; statusClass = 'status-not-introduced'; showIntroButton = true; break;
            case 'planned': statusText = 'Запланировано'; statusClass = 'status-planned'; showIntroButton = true; break;
            case 'introduced': statusText = 'Введён'; statusClass = 'status-introduced'; showIntroButton = false; break;
            case 'suspectedReaction': statusText = 'Была реакция'; statusClass = 'status-suspected'; showIntroButton = false; break;
            case 'confirmedAllergy': statusText = 'Аллергия'; statusClass = 'status-allergy'; showIntroButton = false; break;
            case 'parentExcluded': statusText = 'Не хочу вводить'; statusClass = 'status-excluded'; showIntroButton = false; break;
            default: statusText = 'Не введено'; statusClass = 'status-not-introduced'; showIntroButton = true;
        }

        var emoji = getProductEmoji(product);
        var age = getProductMinAgeMonths(product);
        var ageLabel = age ? 'с ' + age + ' мес' : '';

        var warningBadge = '';
        if (safety.status === 'caution') {
            var reasons = safety.reasons && safety.reasons.length ? safety.reasons.join(', ') : 'С осторожностью';
            warningBadge = '<span class="badge badge-caution">⚠️ ' + reasons + '</span>';
        } else if (safety.status === 'review') {
            var reasonsReview = safety.reasons && safety.reasons.length ? safety.reasons.join(', ') : 'Требует внимания';
            warningBadge = '<span class="badge badge-review">ℹ️ ' + reasonsReview + '</span>';
        }

        if (showIntroButton) {
            actionButton = '<button class="btn-primary" data-action="add-product-intro" data-product-id="' + product.id + '">＋ Ввести продукт</button>';
        } else {
            actionButton = '<span class="product-status ' + statusClass + '"><span class="dot"></span>' + statusText + '</span>';
        }

        var escape = typeof escapeHTML === 'function' ? escapeHTML : function(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        };

        return '<div class="product-card" data-action="select-product" data-product-id="' + product.id + '">' +
            '<div class="product-card-header">' +
                '<span class="product-emoji">' + emoji + '</span>' +
                '<h3 class="product-name">' + escape(product.name) + '</h3>' +
                warningBadge +
            '</div>' +
            '<div class="product-card-body">' +
                '<div class="product-meta">' +
                    '<span class="product-category">' + escape(getCategoryLabel(product.category)) + '</span>' +
                    (ageLabel ? '<span class="product-age">' + ageLabel + '</span>' : '') +
                '</div>' +
                '<div class="product-actions">' +
                    actionButton +
                    '<button class="btn-icon" data-action="show-product-menu" data-product-id="' + product.id + '">⋯</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function getCategoryLabel(catId) {
        if (!catId) return 'Продукт';
        var found = CATEGORIES.find(function(c) { return c.id === catId; });
        return found ? found.label : catId.charAt(0).toUpperCase() + catId.slice(1);
    }

    // ===== ПРОГРЕСС (для header) =====
    function getIntroducedProductsCount(childId) {
        if (!childId || !PRODUCTS.length) return 0;
        return PRODUCTS.filter(function(p) {
            return getProductStatusForChild(p.id, childId) === 'introduced';
        }).length;
    }
    function getProductsProgressPercent(childId) {
        if (!childId || !PRODUCTS.length) return 0;
        return Math.min(100, Math.round((getIntroducedProductsCount(childId) / PRODUCTS.length) * 100));
    }

    // ===== КАТЕГОРИИ =====
    // Правка PASS 2.1: эмодзи из categoryEmojiMap, active-класс из STATE.
    function renderCategoryGrid() {
        var categories = CATEGORIES || [];
        var currentFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        return categories.map(function(cat) {
            var emoji = categoryEmojiMap[cat.id] || cat.icon || '🍽';
            var activeClass = (currentFilter === cat.id) ? ' active' : '';
            return '<div class="category-kenora' + activeClass + '" data-action="filter-products" data-category="' + cat.id + '">' +
                '<span class="cat-icon" aria-hidden="true">' + emoji + '</span>' +
                '<span class="cat-label">' + escapeHTML(cat.label) + '</span>' +
            '</div>';
        }).join('');
    }

    // ===== ФИЛЬТРАЦИЯ (без изменений) =====
    function getFilteredProducts() {
        var childId = getCurrentChildId();
        if (!childId) return [];

        var filtered = PRODUCTS.slice();
        var statusFilter = (window.STATE && window.STATE.productsFilter) || 'all';
        var categoryFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        var ageFilter = (window.STATE && window.STATE.productsAgeFilter) || null;
        var query = window.CURRENT_PRODUCT_SEARCH || '';

        if (statusFilter === 'not_introduced') {
            filtered = filtered.filter(function(p) { return getProductStatusForChild(p.id, childId) === 'notIntroduced'; });
        } else if (statusFilter === 'planned') {
            filtered = filtered.filter(function(p) { return getProductStatusForChild(p.id, childId) === 'planned'; });
        } else if (statusFilter === 'introduced') {
            filtered = filtered.filter(function(p) { return getProductStatusForChild(p.id, childId) === 'introduced'; });
        } else if (statusFilter === 'reaction') {
            filtered = filtered.filter(function(p) {
                var s = getProductStatusForChild(p.id, childId);
                return s === 'suspectedReaction' || s === 'confirmedAllergy';
            });
        }

        if (window.CURRENT_PRODUCT_SUITABLE === true) {
            filtered = filtered.filter(function(p) {
                if (getProductStatusForChild(p.id, childId) !== 'notIntroduced') return false;
                if (getProductMinAgeMonths(p) > getChildAgeMonths(childId)) return false;
                var safety = safeEvaluate(p, childId);
                return safety.status === 'allow' || safety.status === 'caution';
            });
        }

        if (categoryFilter) {
            filtered = filtered.filter(function(p) { return p.category === categoryFilter; });
        }

        if (ageFilter) {
            var ageLimit = parseInt(ageFilter, 10);
            if (!isNaN(ageLimit)) {
                filtered = filtered.filter(function(p) { return getProductMinAgeMonths(p) >= ageLimit; });
            }
        }

        if (window.CURRENT_PRODUCT_SAFETY_FILTER && window.CURRENT_PRODUCT_SAFETY_FILTER !== 'all') {
            filtered = filtered.filter(function(p) {
                var safety = safeEvaluate(p, childId);
                if (window.CURRENT_PRODUCT_SAFETY_FILTER === 'allow') return safety.status === 'allow';
                if (window.CURRENT_PRODUCT_SAFETY_FILTER === 'caution') return safety.status === 'caution';
                if (window.CURRENT_PRODUCT_SAFETY_FILTER === 'not_allowed') {
                    return safety.status === 'review' || safety.status === 'block' || safety.status === 'not_appropriate';
                }
                return true;
            });
        }

        if (query.trim()) {
            var q = query.trim().toLowerCase();
            filtered = filtered.filter(function(p) { return p.name.toLowerCase().indexOf(q) !== -1; });
        }

        return filtered;
    }

    // ===== Правка PASS 2.1: синхронизация active-состояния категорий =====
    var __prevActiveCat = undefined;

    function updateCategoryActiveState() {
        var current = (window.STATE && window.STATE.productsCategoryFilter) || null;
        document.querySelectorAll('.category-kenora').forEach(function(el) {
            el.classList.toggle('active', el.dataset.category === current);
        });
        if (__prevActiveCat !== current) {
            __prevActiveCat = current;
            requestAnimationFrame(scrollActiveCategoryIntoView);
        }
    }

    function scrollActiveCategoryIntoView() {
        var active = document.querySelector('.category-kenora.active');
        if (!active) return;
        var container = active.parentElement;
        if (!container) return;
        var cRect = container.getBoundingClientRect();
        var aRect = active.getBoundingClientRect();
        if (aRect.left >= cRect.left && aRect.right <= cRect.right) return;
        try {
            active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        } catch (e) {
            active.scrollIntoView(false);
        }
    }

    // ===== ОБНОВЛЕНИЕ СПИСКА =====
    function updateProductsList() {
        var container = document.getElementById('products-list');
        if (!container) return;

        var filtered = getFilteredProducts();
        if (filtered.length === 0) {
            var message = '';
            if (window.CURRENT_PRODUCT_SEARCH && window.CURRENT_PRODUCT_SEARCH.trim()) message = 'Ничего не нашли по вашему запросу.';
            else if (window.CURRENT_PRODUCT_SUITABLE === true) message = 'Пока нет подходящих продуктов для введения.';
            else message = 'Нет продуктов с такими фильтрами.';
            container.innerHTML = '<div class="empty-state"><span class="empty-icon">🥑</span><h3>' + message + '</h3><p>Попробуйте изменить фильтры или поиск.</p></div>';
        } else {
            container.innerHTML = filtered.map(renderProductCard).join('');
        }

        // Синхронизировать счётчик в header
        var countBtn = document.querySelector('.introduced-count');
        if (countBtn) {
            var childId = getCurrentChildId();
            countBtn.textContent = getIntroducedProductsCount(childId) + ' введено';
        }

        updateChipsActiveState();
        updateCategoryActiveState();  // ← Правка PASS 2.1
    }

    // ===== ЧИПСЫ (без изменений) =====
    function updateChipsActiveState() {
        var statusFilter = (window.STATE && window.STATE.productsFilter) || 'all';
        var categoryFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        var ageFilter = (window.STATE && window.STATE.productsAgeFilter) || null;
        document.querySelectorAll('#status-filters .chip').forEach(function(chip) {
            chip.classList.toggle('active', chip.dataset.filter === statusFilter);
        });
        document.querySelectorAll('#category-filters .chip').forEach(function(chip) {
            var cat = chip.dataset.category || '';
            chip.classList.toggle('active', cat === (categoryFilter || ''));
        });
        document.querySelectorAll('#age-filters .chip').forEach(function(chip) {
            var age = chip.dataset.age || '';
            chip.classList.toggle('active', age === (ageFilter || ''));
        });
    }

    // ===== МОДАЛКА ФИЛЬТРОВ (без изменений) =====
    function openProductFiltersModal() {
        var tempAgeFilter = window.STATE.productsAgeFilter || null;
        var tempSafetyFilter = window.CURRENT_PRODUCT_SAFETY_FILTER || 'all';

        window.updateTempAgeFilter = function(value) { tempAgeFilter = value || null; updateModalChipsActiveState(); };
        window.updateTempSafetyFilter = function(value) { tempSafetyFilter = value || 'all'; updateModalChipsActiveState(); };
        window.applyProductFilters = function() {
            window.STATE.productsAgeFilter = tempAgeFilter;
            window.CURRENT_PRODUCT_SAFETY_FILTER = tempSafetyFilter;
            if (typeof window.closeModal === 'function') window.closeModal();
            updateProductsList();
            updateChipsActiveState();
        };
        window.resetProductFilters = function() {
            tempAgeFilter = null; tempSafetyFilter = 'all';
            window.STATE.productsAgeFilter = null;
            window.CURRENT_PRODUCT_SAFETY_FILTER = 'all';
            if (typeof window.closeModal === 'function') window.closeModal();
            updateProductsList();
            updateChipsActiveState();
        };

        function updateModalChipsActiveState() {
            document.querySelectorAll('#modal-age-filters .chip').forEach(function(chip) {
                chip.classList.toggle('active', chip.dataset.value === (tempAgeFilter || ''));
            });
            document.querySelectorAll('#modal-safety-filters .chip').forEach(function(chip) {
                chip.classList.toggle('active', chip.dataset.value === (tempSafetyFilter || 'all'));
            });
        }

        var modalRoot = document.getElementById('modal-root');
        if (!modalRoot) return;
        modalRoot.innerHTML = '';

        var ageOptions = ['', '6', '7', '8', '9', '10'];
        var ageLabels = ['Все', '6+', '7+', '8+', '9+', '10+'];
        var ageHtml = ageOptions.map(function(age, idx) {
            var active = (tempAgeFilter === age || (age === '' && tempAgeFilter === null)) ? ' active' : '';
            return '<span class="chip' + active + '" data-action="product-filter-age" data-value="' + age + '">' + ageLabels[idx] + '</span>';
        }).join('');

        var safetyOptions = ['all', 'allow', 'caution', 'not_allowed'];
        var safetyLabels = ['Все', 'Можно', 'С осторожностью', 'Нельзя сейчас'];
        var safetyHtml = safetyOptions.map(function(opt, idx) {
            var active = (tempSafetyFilter === opt) ? ' active' : '';
            return '<span class="chip' + active + '" data-action="product-filter-safety" data-value="' + opt + '">' + safetyLabels[idx] + '</span>';
        }).join('');

        var sheet = document.createElement('div');
        sheet.className = 'modal-sheet';
        sheet.innerHTML = '' +
            '<div class="filters-header"><h2 class="filters-title">Фильтры</h2>' +
              '<button class="btn-close-modal" data-action="close-modal">×</button></div>' +
            '<div class="filters-group"><h3 class="filters-group-title">Возраст введения</h3>' +
              '<div class="chips-group" id="modal-age-filters">' + ageHtml + '</div></div>' +
            '<div class="filters-group"><h3 class="filters-group-title">Безопасность</h3>' +
              '<div class="chips-group" id="modal-safety-filters">' + safetyHtml + '</div></div>' +
            '<div class="filters-actions">' +
              '<button class="btn-secondary" data-action="product-filter-reset">Сбросить</button>' +
              '<button class="btn-primary" data-action="product-filter-apply">Применить</button>' +
            '</div>';

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.appendChild(sheet);
        modalRoot.appendChild(overlay);

        updateModalChipsActiveState();
    }

    // ============================================================
    // НОВОЕ: РЕКОМЕНДАЦИИ ✨
    // ============================================================
    function getRecommendations(childId) {
        if (!childId || !PRODUCTS.length) return { safe: [], caution: [] };
        var childAge = getChildAgeMonths(childId);

        var scored = PRODUCTS.map(function(p) {
            if (getProductStatusForChild(p.id, childId) !== 'notIntroduced') return null;
            var productAge = getProductMinAgeMonths(p);
            if (productAge > childAge) return null;
            var safety = safeEvaluate(p, childId);
            if (safety.status !== 'allow' && safety.status !== 'caution') return null;
            return {
                product: p,
                safety: safety.status,
                ageDiff: Math.abs(productAge - childAge)
            };
        }).filter(Boolean);

        scored.sort(function(a, b) { return a.ageDiff - b.ageDiff; });

        var safeList = scored.filter(function(s) { return s.safety === 'allow'; });
        var cautionList = scored.filter(function(s) { return s.safety === 'caution'; });

        safeList = diversifyByCategory(safeList, 10);
        cautionList = diversifyByCategory(cautionList, 3);

        return {
            safe: safeList.map(function(s) { return s.product; }),
            caution: cautionList.map(function(s) { return s.product; })
        };
    }

    function diversifyByCategory(scoredItems, max) {
        var result = [];
        var seenCategories = {};
        for (var i = 0; i < scoredItems.length && result.length < max; i++) {
            var cat = scoredItems[i].product.category || 'другое';
            if (!seenCategories[cat]) {
                seenCategories[cat] = true;
                result.push(scoredItems[i]);
            }
        }
        for (var j = 0; j < scoredItems.length && result.length < max; j++) {
            if (result.indexOf(scoredItems[j]) === -1) result.push(scoredItems[j]);
        }
        return result;
    }

    function renderRecommendationItem(product, isCaution) {
        var emoji = getProductEmoji(product);
        var age = getProductMinAgeMonths(product);
        var ageLabel = age ? 'с ' + age + ' мес' : '';
        var categoryLabel = getCategoryLabel(product.category);
        var cls = isCaution ? ' is-caution' : '';
        var escape = typeof escapeHTML === 'function' ? escapeHTML : function(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        };
        return '<div class="recommendation-item' + cls + '" data-action="select-product" data-product-id="' + product.id + '">' +
            '<div class="rec-emoji">' + emoji + '</div>' +
            '<div class="rec-info">' +
                '<div class="rec-name">' + escape(product.name) + '</div>' +
                '<div class="rec-meta">' + escape(categoryLabel) + (ageLabel ? ' · ' + ageLabel : '') + '</div>' +
            '</div>' +
        '</div>';
    }

    function showRecommendationsPanel() {
        var childId = getCurrentChildId();
        var modalRoot = document.getElementById('modal-root');
        if (!modalRoot) return;

        var recs = getRecommendations(childId);
        var totalCount = recs.safe.length + recs.caution.length;

        var bodyHtml;
        if (!childId) {
            bodyHtml = '<div class="recommendations-empty">Сначала выберите ребёнка.</div>';
        } else if (totalCount === 0) {
            bodyHtml = '<div class="recommendations-empty">Пока нет продуктов для рекомендации.<br>Заполните данные малыша и начните отмечать введённые продукты.</div>';
        } else {
            bodyHtml = '';
            if (recs.safe.length > 0) {
                bodyHtml += '<div class="recommendations-list">';
                recs.safe.forEach(function(p) { bodyHtml += renderRecommendationItem(p, false); });
                bodyHtml += '</div>';
            }
            if (recs.caution.length > 0) {
                bodyHtml += '<div class="recommendations-caution-title">С осторожностью</div>';
                bodyHtml += '<div class="recommendations-list recommendations-list-caution">';
                recs.caution.forEach(function(p) { bodyHtml += renderRecommendationItem(p, true); });
                bodyHtml += '</div>';
            }
        }

        var subtitle = (childId && totalCount > 0)
            ? 'Подобрали продукты для вашего малыша с учётом возраста и данных прикорма.'
            : 'Подберём продукты для вашего малыша с учётом возраста и данных прикорма.';

        var sheet = document.createElement('div');
        sheet.className = 'modal-sheet recommendations-sheet';
        sheet.innerHTML = '' +
            '<div class="recommendations-header">' +
              '<div>' +
                '<h2 class="recommendations-heading">Ваши рекомендации</h2>' +
                '<p class="recommendations-subtitle">' + subtitle + '</p>' +
              '</div>' +
              '<button class="btn-close-modal" data-action="close-modal">×</button>' +
            '</div>' +
            bodyHtml;

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.appendChild(sheet);
        modalRoot.innerHTML = '';
        modalRoot.appendChild(overlay);
    }

    // ============================================================
    // ГЛАВНЫЙ РЕНДЕР
    // ============================================================
    function renderProducts() {
        var state = window.STATE || {};
        var children = Array.isArray(state.children) ? state.children : [];
        var childId = getCurrentChildId();
        var child = childId ? children.find(function(c) { return c.id === childId; }) : null;
        var childName = (child && child.name) ? child.name : 'Ребёнок';

        var childAgeMonths = childId ? getChildAgeMonths(childId) : 0;
        var ageText = childAgeMonths > 0 ? childAgeMonths + ' мес' : '';
        var feedingLabel = (child && child.feedingStarted) ? 'прикорм' : '';
        var metaText = [ageText, feedingLabel].filter(Boolean).join(' · ');

        var introducedCount = getIntroducedProductsCount(childId);

        var html = '';
        html += '<div class="products-screen" id="screen-products">';

        // Header
        html += '  <div class="products-header">';
        html += '    <div class="child-info">';
        html += '      <span class="child-name">' + escapeHTML(childName) + '</span>';
        if (metaText) html += '      <span class="child-meta">' + escapeHTML(metaText) + '</span>';
        html += '    </div>';
        html += '    <button class="introduced-count" type="button" data-action="show-introduced-products">' + introducedCount + ' введено</button>';
        html += '  </div>';

        // Search row
        html += '  <div class="search-row">';
        html += '    <div class="search-box">';
        html += '      <span class="search-icon">' + uiIcons.search + '</span>';
        html += '      <input id="product-search" type="search" placeholder="Найти продукт..." autocomplete="off" />';
        html += '      <button class="btn-recommendations" type="button" data-action="show-recommendations" aria-label="Рекомендации">✨</button>';
        html += '    </div>';
        html += '    <button class="btn-filter" type="button" data-action="open-product-filters" aria-label="Фильтры">' + uiIcons.filter + '</button>';
        html += '  </div>';

        // Categories
        html += '  <section class="categories-section">';
        html += '    <div id="category-grid" class="categories-kenora">';
        html +=        renderCategoryGrid();
        html += '    </div>';
        html += '  </section>';

        // Products list
        html += '  <section class="products-list-section">';
        html += '    <h2 class="h2">Все продукты</h2>';
        html += '    <div id="products-list" class="products-list">';
        var filtered = getFilteredProducts();
        if (filtered.length === 0) {
            var msg = (window.CURRENT_PRODUCT_SEARCH && window.CURRENT_PRODUCT_SEARCH.trim())
                ? 'Ничего не нашли по вашему запросу.'
                : 'Нет продуктов с такими фильтрами.';
            html += '<div class="empty-state"><span class="empty-icon">🥑</span><h3>' + msg + '</h3><p>Попробуйте изменить фильтры или поиск.</p></div>';
        } else {
            html += filtered.map(renderProductCard).join('');
        }
        html += '    </div>';
        html += '  </section>';

        html += '  <button class="floating-add" type="button" data-action="add-diary">➕ <span>Добавить в дневник</span></button>';
        html += '</div>';

        return html;
    }

    // ============================================================
    // РЕЖИМ ПОИСКА + делегированный ✨
    // ============================================================
    function attachSearchModeHandlers() {
        document.addEventListener('focusin', function(e) {
            if (e.target && e.target.id === 'product-search') {
                var screen = document.querySelector('.products-screen');
                if (screen) screen.classList.add('is-searching');
            }
        });

        document.addEventListener('focusout', function(e) {
            if (e.target && e.target.id === 'product-search') {
                setTimeout(function() {
                    var input = document.getElementById('product-search');
                    var screen = document.querySelector('.products-screen');
                    if (!screen || !input) return;
                    if (input.value.trim() === '') screen.classList.remove('is-searching');
                }, 120);
            }
        });

        document.addEventListener('input', function(e) {
            if (e.target && e.target.id === 'product-search') {
                var screen = document.querySelector('.products-screen');
                if (!screen) return;
                if (e.target.value.trim() !== '') screen.classList.add('is-searching');
                else screen.classList.remove('is-searching');
                window.CURRENT_PRODUCT_SEARCH = e.target.value || '';
                updateProductsList();
            }
        });
    }

    function attachRecommendationsHandler() {
        document.addEventListener('click', function(e) {
            var target = e.target.closest('[data-action="show-recommendations"]');
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();
            showRecommendationsPanel();
        }, true);
    }

    if (!window.__KENORA_PRODUCTS_HANDLERS_ATTACHED__) {
        window.__KENORA_PRODUCTS_HANDLERS_ATTACHED__ = true;
        attachSearchModeHandlers();
        attachRecommendationsHandler();
    }

    // ===== ЭКСПОРТ =====
    window.setProductsFilter = function(category) {
        if (window.STATE) window.STATE.productsCategoryFilter = category || null;
        updateProductsList();
    };
    window.setProductsSearch = function(query) {
        window.CURRENT_PRODUCT_SEARCH = query || '';
        updateProductsList();
    };

    window.updateProductsList = updateProductsList;
    window.renderProducts = renderProducts;
    window.openProductFiltersModal = openProductFiltersModal;
    window.updateChipsActiveState = updateChipsActiveState;
    window.updateCategoryActiveState = updateCategoryActiveState;   // ← экспорт для внешних вызовов
    window.getProductStatusForChild = getProductStatusForChild;
    window.showRecommendationsPanel = showRecommendationsPanel;

    console.log('✅ products.js загружен (KENORA 2.0: header + search-row + recommendations)');
})();