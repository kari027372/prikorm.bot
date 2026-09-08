/* ============================================================
   screens/products.js — новый UX, совместимый с non-module архитектурой
   Исправления: статусы, возраст, рекомендации, фильтры, единый источник
   ============================================================ */

(function() {
    'use strict';

    // ===== ГЛОБАЛЬНЫЕ ДАННЫЕ =====
    var PRODUCTS = window.PRODUCTS || [];
    var CATEGORIES = window.CATEGORIES || [];

    // Если CATEGORIES не заданы, вычислим из PRODUCTS (с id и label)
    if (!CATEGORIES.length && PRODUCTS.length) {
        var catMap = {};
        PRODUCTS.forEach(function(p) {
            if (p.category) catMap[p.category] = true;
        });
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
        CATEGORIES = defaultCats.filter(function(c) {
            return catMap[c.id] || c.id === 'другое';
        });
        var existingIds = CATEGORIES.map(function(c) { return c.id; });
        Object.keys(catMap).forEach(function(id) {
            if (existingIds.indexOf(id) === -1) {
                var label = id.charAt(0).toUpperCase() + id.slice(1);
                CATEGORIES.push({ id: id, label: label, icon: '📂' });
            }
        });
    }

    // ===== ГЛОБАЛЬНЫЕ UI-ПЕРЕМЕННЫЕ (НЕ В STATE) =====
    window.CURRENT_PRODUCT_SUITABLE = window.CURRENT_PRODUCT_SUITABLE === true;
    window.CURRENT_PRODUCT_SAFETY_FILTER = window.CURRENT_PRODUCT_SAFETY_FILTER || 'all';

    // ===== КАРТА КАТЕГОРИЙ → EMOJI (FALLBACK) =====
    var categoryEmojiMap = {};
    CATEGORIES.forEach(function(cat) {
        categoryEmojiMap[cat.id] = cat.icon || '📂';
    });
    var fallbackMap = {
        'овощи': '🥦',
        'фрукты': '🍎',
        'крупы': '🌾',
        'мясо': '🍗',
        'рыба': '🐟',
        'молочные': '🥛',
        'аллергены': '⚠️',
        'другое': '🍽'
    };
    Object.keys(fallbackMap).forEach(function(key) {
        if (!categoryEmojiMap[key]) categoryEmojiMap[key] = fallbackMap[key];
    });

    var invalidEmojis = ['🫃'];

    function getProductEmoji(product) {
        if (product.emoji && invalidEmojis.indexOf(product.emoji) === -1) {
            return product.emoji;
        }
        return categoryEmojiMap[product.category] || '🍽';
    }

    // ===== НОРМАЛИЗАЦИЯ ВОЗРАСТА ПРОДУКТА =====
    function getProductMinAgeMonths(product) {
        if (product.introduction && product.introduction.fromMonths) {
            return parseInt(product.introduction.fromMonths, 10) || 0;
        }
        if (product.min_age_months) {
            return parseInt(product.min_age_months, 10) || 0;
        }
        if (product.min_age) {
            return parseInt(product.min_age, 10) || 0;
        }
        if (product.ageMinMonths) {
            return parseInt(product.ageMinMonths, 10) || 0;
        }
        return 0;
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    function getCurrentChildId() {
        return window.STATE ? window.STATE.currentChildId : null;
    }

    function getChildProfile(childId) {
        if (window.childService && typeof window.childService.getChildProfile === 'function') {
            try {
                return window.childService.getChildProfile(childId);
            } catch (e) {
                console.warn('⚠️ childService.getChildProfile error:', e);
            }
        }
        if (window.STATE && window.STATE.children) {
            var child = window.STATE.children.find(function(c) { return c.id === childId; });
            if (child) {
                var profile = {
                    id: child.id,
                    name: child.name,
                    birthDate: child.birthDate,
                    sex: child.sex,
                    feedingType: child.feedingType,
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
        if (!profile) return { status: 'allow', reasons: [] };
        try {
            if (window.safetyEngine && typeof window.safetyEngine.evaluateProductSafety === 'function') {
                var result = window.safetyEngine.evaluateProductSafety(profile, product, null);
                if (result && typeof result === 'object') {
                    if (result.status === undefined && result.decision !== undefined) {
                        result.status = result.decision;
                    }
                    return result;
                }
            }
        } catch (e) {
            console.warn('⚠️ Safety Engine error for', product.name, e);
        }
        return { status: 'allow', reasons: [] };
    }

    // ===== ПОЛУЧЕНИЕ СТАТУСА ПРОДУКТА (единый источник) =====
    function getProductStatusForChild(productId, childId) {
        if (
            window.productStateService &&
            typeof window.productStateService.getProductState === 'function'
        ) {
            try {
                var state = window.productStateService.getProductState(
                    childId,
                    productId
                );
                if (state && typeof state === 'object') {
                    return state.status || 'notIntroduced';
                }
                if (typeof state === 'string') {
                    return state;
                }
            } catch (error) {
                console.warn(
                    '[Products] Не удалось получить состояние продукта:',
                    error
                );
            }
        }
        return 'notIntroduced';
    }

    // ============================================================
    // KENORA 2.0: SVG-ИКОНКИ КАТЕГОРИЙ (вместо эмодзи)
    // ============================================================
    var categoryIcons = {
        'овощи': `<svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 0-5 5v8a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/><path d="M12 7v10"/><path d="M8 12h8"/></svg>`,
        'фрукты': `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/><path d="M4 4l2 2M20 4l-2 2M4 20l2-2M20 20l-2-2"/></svg>`,
        'крупы': `<svg viewBox="0 0 24 24"><path d="M6 14l3-3 3 3 3-3 3 3"/><path d="M6 10l3-3 3 3 3-3 3 3"/><path d="M3 18h18"/><path d="M3 6h18"/></svg>`,
        'мясо': `<svg viewBox="0 0 24 24"><path d="M18 6l-4 4M14 10l-4 4M10 14l-4 4"/><circle cx="18" cy="6" r="2"/><circle cx="14" cy="10" r="2"/><circle cx="10" cy="14" r="2"/><circle cx="6" cy="18" r="2"/></svg>`,
        'рыба': `<svg viewBox="0 0 24 24"><path d="M2 12c0-3.3 4-6 10-6s10 2.7 10 6-4 6-10 6-10-2.7-10-6z"/><circle cx="10" cy="12" r="1.5"/></svg>`,
        'молочные': `<svg viewBox="0 0 24 24"><path d="M6 8l2-4h8l2 4-2 10H8z"/><path d="M8 18h8"/><path d="M10 18v2"/><path d="M14 18v2"/></svg>`,
        'аллергены': `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>`,
        'другое': `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`
    };

    // ===== РЕНДЕРИНГ КАРТОЧКИ ПРОДУКТА (с поддержкой всех статусов) =====
    function renderProductCard(product) {
        var childId = getCurrentChildId();
        if (!childId) {
            return '<div class="product-card">Выберите ребёнка</div>';
        }

        var status = getProductStatusForChild(product.id, childId);
        var safety = safeEvaluate(product, childId);

        var statusText = '';
        var statusClass = '';
        var actionButton = '';
        var showIntroButton = false;
        var statusDotClass = '';

        switch (status) {
            case 'notIntroduced':
                statusText = 'Ещё не введён';
                statusClass = 'status-not-introduced';
                statusDotClass = 'dot wait';
                showIntroButton = true;
                break;
            case 'planned':
                statusText = 'Запланирован';
                statusClass = 'status-planned';
                statusDotClass = 'dot wait';
                showIntroButton = true;
                break;
            case 'introduced':
                statusText = 'Введён';
                statusClass = 'status-introduced';
                statusDotClass = 'dot ok';
                showIntroButton = false;
                break;
            case 'suspectedReaction':
                statusText = 'Была реакция';
                statusClass = 'status-suspected';
                statusDotClass = 'dot warning';
                showIntroButton = false;
                break;
            case 'confirmedAllergy':
                statusText = 'Аллергия';
                statusClass = 'status-allergy';
                statusDotClass = 'dot warning';
                showIntroButton = false;
                break;
            case 'parentExcluded':
                statusText = 'Не хочу вводить';
                statusClass = 'status-excluded';
                statusDotClass = 'dot wait';
                showIntroButton = false;
                break;
            default:
                statusText = 'Ещё не введён';
                statusClass = 'status-not-introduced';
                statusDotClass = 'dot wait';
                showIntroButton = true;
        }

        var emoji = getProductEmoji(product);
        var age = getProductMinAgeMonths(product);
        var ageLabel = age ? age + '+ мес' : '';

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
            actionButton = '<span class="product-status"><span class="' + statusDotClass + '"></span> ' + statusText + '</span>';
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

    // ===== БЛОК «РЕКОМЕНДОВАНО СЕЙЧАС» УДАЛЁН =====
    // Функция renderRecommendedProducts() и все её вызовы удалены

    // ===== СЕТКА КАТЕГОРИЙ (KENORA 2.0: SVG вместо эмодзи) =====
    function renderCategoryGrid() {
        var categories = CATEGORIES || [];
        return categories
            .map(function(cat) {
                var icon = categoryIcons[cat.id] || categoryIcons['другое'];
                if (!icon) icon = cat.icon || '📂';
                return '<div class="category-kenora" data-action="filter-products" data-category="' + cat.id + '">' +
                    '<span class="cat-icon">' + icon + '</span>' +
                    '<span class="cat-label">' + escapeHTML(cat.label) + '</span>' +
                '</div>';
            })
            .join('');
    }

    // ===== ФИЛЬТРАЦИЯ ПРОДУКТОВ (с новыми статусами, suitable, safety) =====
    function getFilteredProducts() {
        var childId = getCurrentChildId();
        if (!childId) return [];

        var filtered = PRODUCTS.slice();
        var statusFilter = (window.STATE && window.STATE.productsFilter) || 'all';
        var categoryFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        var ageFilter = (window.STATE && window.STATE.productsAgeFilter) || null;
        var query = window.CURRENT_PRODUCT_SEARCH || '';

        // 1. Фильтр по статусу (новые статусы)
        if (statusFilter === 'not_introduced') {
            filtered = filtered.filter(function(p) {
                return getProductStatusForChild(p.id, childId) === 'notIntroduced';
            });
        } else if (statusFilter === 'planned') {
            filtered = filtered.filter(function(p) {
                return getProductStatusForChild(p.id, childId) === 'planned';
            });
        } else if (statusFilter === 'introduced') {
            filtered = filtered.filter(function(p) {
                return getProductStatusForChild(p.id, childId) === 'introduced';
            });
        } else if (statusFilter === 'reaction') {
            filtered = filtered.filter(function(p) {
                var status = getProductStatusForChild(p.id, childId);
                return status === 'suspectedReaction' || status === 'confirmedAllergy';
            });
        }
        // 'all' – без фильтрации по статусу

        // 2. Фильтр «Подходит моему ребёнку сейчас»
        if (window.CURRENT_PRODUCT_SUITABLE === true) {
            filtered = filtered.filter(function(p) {
                var status = getProductStatusForChild(p.id, childId);
                if (status !== 'notIntroduced') return false;
                if (getProductMinAgeMonths(p) > getChildAgeMonths(childId)) return false;
                var safety = safeEvaluate(p, childId);
                return safety.status === 'allow' || safety.status === 'caution';
            });
        }

        // 3. Фильтр по категории (существующий)
        if (categoryFilter) {
            filtered = filtered.filter(function(p) {
                return p.category === categoryFilter;
            });
        }

        // 4. Фильтр по возрасту (существующий)
        if (ageFilter) {
            var ageLimit = parseInt(ageFilter, 10);
            if (!isNaN(ageLimit)) {
                filtered = filtered.filter(function(p) {
                    return getProductMinAgeMonths(p) >= ageLimit;
                });
            }
        }

        // 5. Фильтр по безопасности (новый)
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

        // 6. Поиск (существующий)
        if (query.trim()) {
            var q = query.trim().toLowerCase();
            filtered = filtered.filter(function(p) {
                return p.name.toLowerCase().includes(q);
            });
        }

        return filtered;
    }

    // ===== ОБНОВЛЕНИЕ СПИСКА ПРОДУКТОВ =====
    function updateProductsList() {
        var container = document.getElementById('products-list');
        if (!container) return;

        var filtered = getFilteredProducts();
        if (filtered.length === 0) {
            var message = '';
            if (window.CURRENT_PRODUCT_SEARCH && window.CURRENT_PRODUCT_SEARCH.trim()) {
                message = 'Ничего не нашли по вашему запросу.';
            } else if (window.CURRENT_PRODUCT_SUITABLE === true) {
                message = 'Пока нет подходящих продуктов для введения.';
            } else {
                message = 'Нет продуктов с такими фильтрами.';
            }
            container.innerHTML = '<div class="empty-state"><span class="empty-icon">🥑</span><h3>' + message + '</h3><p>Попробуйте изменить фильтры или поиск.</p></div>';
        } else {
            container.innerHTML = filtered.map(renderProductCard).join('');
        }

        // Обновление прогресса
        var countEl = document.getElementById('products-introduced-count');
        if (countEl) {
            var childId = getCurrentChildId();
            var introducedCount = 0;
            if (childId) {
                introducedCount = PRODUCTS.filter(function(p) {
                    return getProductStatusForChild(p.id, childId) === 'introduced';
                }).length;
            }
            countEl.textContent = introducedCount;
        }

        // Блок рекомендаций удалён
        updateChipsActiveState();
    }

    // ===== ОБНОВЛЕНИЕ АКТИВНЫХ ЧИПСОВ =====
    function updateChipsActiveState() {
        var statusFilter = (window.STATE && window.STATE.productsFilter) || 'all';
        var categoryFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        var ageFilter = (window.STATE && window.STATE.productsAgeFilter) || null;

        document.querySelectorAll('#status-filters .chip').forEach(function(chip) {
            var filter = chip.dataset.filter;
            chip.classList.toggle('active', filter === statusFilter);
        });
        document.querySelectorAll('#category-filters .chip').forEach(function(chip) {
            var cat = chip.dataset.category || '';
            chip.classList.toggle('active', cat === (categoryFilter || ''));
        });
        document.querySelectorAll('#age-filters .chip').forEach(function(chip) {
            var age = chip.dataset.age || '';
            chip.classList.toggle('active', age === (ageFilter || ''));
        });
        var suitableToggle = document.querySelector('[data-action="toggle-suitable"]');
        if (suitableToggle) {
            suitableToggle.classList.toggle('active', window.CURRENT_PRODUCT_SUITABLE === true);
        }
    }

    // ===== МОДАЛКА ФИЛЬТРОВ (без локальных обработчиков) =====
    function openProductFiltersModal() {
        var tempAgeFilter = window.STATE.productsAgeFilter || null;
        var tempSafetyFilter = window.CURRENT_PRODUCT_SAFETY_FILTER || 'all';

        // Глобальные функции для handlers.js
        window.updateTempAgeFilter = function(value) {
            tempAgeFilter = value || null;
            updateModalChipsActiveState();
        };
        window.updateTempSafetyFilter = function(value) {
            tempSafetyFilter = value || 'all';
            updateModalChipsActiveState();
        };
        window.applyProductFilters = function() {
            window.STATE.productsAgeFilter = tempAgeFilter;
            window.CURRENT_PRODUCT_SAFETY_FILTER = tempSafetyFilter;
            closeModal();
            if (typeof updateProductsList === 'function') updateProductsList();
            if (typeof updateChipsActiveState === 'function') updateChipsActiveState();
        };
        window.resetProductFilters = function() {
            tempAgeFilter = null;
            tempSafetyFilter = 'all';
            window.STATE.productsAgeFilter = null;
            window.CURRENT_PRODUCT_SAFETY_FILTER = 'all';
            closeModal();
            if (typeof updateProductsList === 'function') updateProductsList();
            if (typeof updateChipsActiveState === 'function') updateChipsActiveState();
        };

        function updateModalChipsActiveState() {
            document.querySelectorAll('#modal-age-filters .chip').forEach(function(chip) {
                var value = chip.dataset.value;
                chip.classList.toggle('active', value === (tempAgeFilter || ''));
            });
            document.querySelectorAll('#modal-safety-filters .chip').forEach(function(chip) {
                var value = chip.dataset.value;
                chip.classList.toggle('active', value === (tempSafetyFilter || 'all'));
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
        sheet.style.cssText = 'background:white; border-radius:20px; padding:24px; max-width:100%; width:100%; max-height:90vh; overflow-y:auto;';
        sheet.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="margin:0; font-size:24px; font-weight:900; color:#4A3A30;">Фильтры</h2>
                <button class="btn-close-modal" data-action="close-modal" style="background:transparent; border:none; font-size:28px; cursor:pointer; color:#8A7A6A;">×</button>
            </div>
            <div style="margin-bottom:20px;">
                <h3 style="font-size:16px; font-weight:800; margin-bottom:8px; color:#4A3A30;">Возраст введения</h3>
                <div class="chips-group" id="modal-age-filters">${ageHtml}</div>
            </div>
            <div style="margin-bottom:20px;">
                <h3 style="font-size:16px; font-weight:800; margin-bottom:8px; color:#4A3A30;">Безопасность</h3>
                <div class="chips-group" id="modal-safety-filters">${safetyHtml}</div>
            </div>
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button class="btn-secondary" data-action="product-filter-reset" style="flex:1; padding:12px; border:1px solid #F0DED6; background:transparent; border-radius:14px; font-weight:700; cursor:pointer;">Сбросить</button>
                <button class="btn-primary" data-action="product-filter-apply" style="flex:2; padding:12px; border:none; background:#F5A88C; border-radius:14px; font-weight:700; color:white; cursor:pointer;">Применить</button>
            </div>
        `;

        // OVERLAY БЕЗ DATA-ACTION
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(74,58,48,0.4); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; box-sizing:border-box; overflow:hidden; pointer-events:auto; overscroll-behavior:contain;';
        overlay.appendChild(sheet);
        modalRoot.appendChild(overlay);

        // Инициализация активных состояний чипов
        updateModalChipsActiveState();
    }

    // ===== ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ЭКРАНА =====
    function renderProducts() {
        var childId = getCurrentChildId();
        var child = childId ? window.STATE.children.find(c => c.id === childId) : null;
        var childName = child ? child.name : 'Ребёнок';
        var childAge = child && childId ? getChildAgeMonths(childId) : 0;
        var ageText = childAge > 0 ? childAge + ' мес' : '';

        var introducedCount = 0;
        if (childId) {
            introducedCount = PRODUCTS.filter(function(p) {
                return getProductStatusForChild(p.id, childId) === 'introduced';
            }).length;
        }

        var statusFilter = (window.STATE && window.STATE.productsFilter) || 'all';
        var categoryFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        var ageFilter = (window.STATE && window.STATE.productsAgeFilter) || null;

        var html = '';
        html += '<div class="products-screen" id="screen-products">';
        // HEADER с именем и возрастом
        html += '  <div class="products-header" style="display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;">';
        html += '    <div class="child-info">';
        html += '      <span style="font-size:20px;font-weight:600;color:var(--kenora-text);">' + escapeHTML(childName) + '</span>';
        html += '      <span style="font-size:14px;font-weight:500;color:var(--kenora-text-secondary);margin-left:8px;">' + escapeHTML(ageText) + '</span>';
        html += '    </div>';
        html += '  </div>';

        // Прогресс с data-action
        var progressPercent = PRODUCTS.length > 0 ? Math.round((introducedCount / PRODUCTS.length) * 100) : 0;
        html += '    <div class="progress-kenora" style="margin-top:8px;cursor:pointer;" data-action="show-introduced-products">';
        html += '      <div class="progress-info">';
        html += '        <div class="progress-number-kenora">' + introducedCount + ' <span>/ ' + PRODUCTS.length + '</span></div>';
        html += '        <div class="progress-label-kenora">Продуктов в рационе</div>';
        html += '      </div>';
        html += '      <div class="progress-track-kenora">';
        html += '        <div class="progress-fill-kenora" style="width: ' + progressPercent + '%;"></div>';
        html += '      </div>';
        html += '    </div>';

        // Поиск
        html += '  <div class="search-box">';
        html += '    <span>🔍</span>';
        html += '    <input id="product-search" type="search" placeholder="Найти продукт..." autocomplete="off" data-action="search-products" />';
        html += '    <button class="clear-search" data-action="clear-search">✕</button>';
        html += '  </div>';

        // Переключатель "Подходит"
        var suitableActive = window.CURRENT_PRODUCT_SUITABLE === true ? ' active' : '';
        html += '  <div class="suitable-toggle">';
        html += '    <span class="chip' + suitableActive + '" data-action="toggle-suitable">✨ Подходит моему ребёнку сейчас</span>';
        html += '  </div>';

        // Кнопка открытия фильтров (добавлена)
        html += '  <div class="filter-trigger" data-action="open-product-filters">⚙️ Фильтры</div>';

        // Рекомендации УДАЛЕНЫ

        // Категории
        html += '  <section class="categories-section">';
        html += '    <h2 class="h2">Категории</h2>';
        html += '    <div id="category-grid" class="categories-kenora">';
        html +=        renderCategoryGrid();
        html += '    </div>';
        html += '  </section>';

        // Видимые фильтры УДАЛЕНЫ

        // Основной каталог
        html += '  <section class="products-list-section">';
        html += '    <h2 class="h2">Все продукты</h2>';
        html += '    <div id="products-list" class="products-list">';
        var filtered = getFilteredProducts();
        if (filtered.length === 0) {
            var msg = '';
            if (window.CURRENT_PRODUCT_SEARCH && window.CURRENT_PRODUCT_SEARCH.trim()) {
                msg = 'Ничего не нашли по вашему запросу.';
            } else if (window.CURRENT_PRODUCT_SUITABLE === true) {
                msg = 'Пока нет подходящих продуктов для введения.';
            } else {
                msg = 'Нет продуктов с такими фильтрами.';
            }
            html += '<div class="empty-state"><span class="empty-icon">🥑</span><h3>' + msg + '</h3><p>Попробуйте изменить фильтры или поиск.</p></div>';
        } else {
            html += filtered.map(renderProductCard).join('');
        }
        html += '    </div>';
        html += '  </section>';

        html += '  <button class="floating-add" data-action="add-diary">➕ <span>Добавить в дневник</span></button>';
        html += '</div>';

        return html;
    }

    // ===== ФУНКЦИИ ДЛЯ ОБНОВЛЕНИЯ ФИЛЬТРОВ И ПОИСКА =====
    window.setProductsFilter = function(category) {
        if (window.STATE) {
            window.STATE.productsCategoryFilter = category || null;
        }
        updateProductsList();
    };

    window.setProductsSearch = function(query) {
        window.CURRENT_PRODUCT_SEARCH = query || '';
        updateProductsList();
    };

    window.updateProductsList = updateProductsList;
    window.renderProducts = renderProducts;
    window.openProductFiltersModal = openProductFiltersModal;
    window.updateChipsActiveState = updateChipsActiveState; // ДОБАВЛЕН ЭКСПОРТ
    window.getProductStatusForChild = getProductStatusForChild; // ДОБАВЛЕНО

    console.log('✅ products.js загружен (исправленный, non-module)');
})();