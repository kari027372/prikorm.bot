/* ============================================================
   screens/products.js — новый UX, совместимый с non-module архитектурой
   Исправления: Product State, Safety Engine, childService, категории, emoji
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
        // Если какие-то категории из PRODUCTS отсутствуют, добавим их
        var existingIds = CATEGORIES.map(function(c) { return c.id; });
        Object.keys(catMap).forEach(function(id) {
            if (existingIds.indexOf(id) === -1) {
                var label = id.charAt(0).toUpperCase() + id.slice(1);
                CATEGORIES.push({ id: id, label: label, icon: '📂' });
            }
        });
    }

    // ===== КАРТА КАТЕГОРИЙ → EMOJI (FALLBACK) =====
    // Используется для продуктов без emoji
    var categoryEmojiMap = {};
    CATEGORIES.forEach(function(cat) {
        categoryEmojiMap[cat.id] = cat.icon || '📂';
    });
    // Дополнительно для известных
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

    // Проблемные emoji (исправлено)
    var invalidEmojis = ['🫃'];

    function getProductEmoji(product) {
        if (product.emoji && invalidEmojis.indexOf(product.emoji) === -1) {
            return product.emoji;
        }
        return categoryEmojiMap[product.category] || '🍽';
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (без модулей) =====

    // Получить ID текущего ребёнка
    function getCurrentChildId() {
        return window.STATE ? window.STATE.currentChildId : null;
    }

    // Получить профиль ребёнка через childService
    function getChildProfile(childId) {
        if (window.childService && typeof window.childService.getChildProfile === 'function') {
            try {
                return window.childService.getChildProfile(childId);
            } catch (e) {
                console.warn('⚠️ childService.getChildProfile error:', e);
            }
        }
        // Fallback: создать профиль из STATE
        if (window.STATE && window.STATE.children) {
            var child = window.STATE.children.find(function(c) { return c.id === childId; });
            if (child) {
                // Скопируем нужные поля
                var profile = {
                    id: child.id,
                    name: child.name,
                    birthDate: child.birthDate,
                    sex: child.sex,
                    feedingType: child.feedingType,
                    ageMonths: getChildAgeMonths(childId) // вычисляем, если нет
                };
                // Если есть allergies, etc.
                if (child.allergies) profile.allergies = child.allergies;
                if (child.readiness) profile.readiness = child.readiness;
                return profile;
            }
        }
        return null;
    }

    // Вычислить возраст в месяцах (fallback, если childService не даёт)
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

    // Безопасная обёртка для evaluateProductSafety
    function safeEvaluate(product, childId) {
        var profile = getChildProfile(childId);
        if (!profile) return { status: 'allow', reasons: [] };
        try {
            if (window.safetyEngine && typeof window.safetyEngine.evaluateProductSafety === 'function') {
                var result = window.safetyEngine.evaluateProductSafety(profile, product, null);
                // result должен иметь поле status
                if (result && typeof result === 'object') {
                    // Если нет поля status, но есть decision (старый формат) – преобразуем
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

    // Получить статус продукта для текущего ребёнка (через Product State)
    function getProductStatusForChild(productId, childId) {
        if (window.getProductState && typeof window.getProductState === 'function') {
            try {
                var state = window.getProductState(childId, productId);
                // state может быть объектом с полем status, или строкой, или null
                if (state && typeof state === 'object') {
                    return state.status || 'notIntroduced';
                } else if (typeof state === 'string') {
                    return state; // если вдруг возвращает строку
                } else {
                    return 'notIntroduced';
                }
            } catch (e) {
                console.warn('⚠️ getProductState error:', e);
            }
        }
        // Fallback – использовать старый глобальный introduced (не per-child)
        if (window.STATE && window.STATE.products && window.STATE.products.introduced) {
            var introduced = window.STATE.products.introduced || [];
            var found = introduced.some(function(item) {
                return item.id === productId || item === productId;
            });
            return found ? 'introduced' : 'notIntroduced';
        }
        return 'notIntroduced';
    }

    // ===== РЕНДЕРИНГ КАРТОЧКИ ПРОДУКТА (НОВЫЙ ДИЗАЙН) =====
    function renderProductCard(product) {
        var childId = getCurrentChildId();
        if (!childId) {
            return '<div class="product-card">Выберите ребёнка</div>';
        }

        var status = getProductStatusForChild(product.id, childId);
        var safety = safeEvaluate(product, childId);

        var statusText = '○ Ещё не введён';
        var statusClass = 'status-not-introduced';
        if (status === 'introduced') {
            statusText = '✅ Введён';
            statusClass = 'status-introduced';
        } else if (status === 'parentExcluded') {
            statusText = '❌ Не хочу';
            statusClass = 'status-excluded';
        }

        var emoji = getProductEmoji(product);
        var ageLabel = product.ageMinMonths ? product.ageMinMonths + '+ мес' : '';

        var warningBadge = '';
        // Используем safety.status и safety.reasons
        if (safety.status === 'caution') {
            var reasons = safety.reasons && safety.reasons.length ? safety.reasons.join(', ') : 'С осторожностью';
            warningBadge = '<span class="badge badge-caution">⚠️ ' + reasons + '</span>';
        } else if (safety.status === 'review') {
            var reasonsReview = safety.reasons && safety.reasons.length ? safety.reasons.join(', ') : 'Требует внимания';
            warningBadge = '<span class="badge badge-review">ℹ️ ' + reasonsReview + '</span>';
        }

        var actionButton = '';
        if (status === 'notIntroduced') {
            actionButton = '<button class="btn-primary" data-action="add-product-intro" data-product-id="' + product.id + '">＋ Ввести продукт</button>';
        } else {
            actionButton = '<span class="status-label ' + statusClass + '">' + statusText + '</span>';
        }

        // escapeHTML – глобальная функция (из ui.js или utils)
        var escape = typeof escapeHTML === 'function' ? escapeHTML : function(s) {
            return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        };

        return '<div class="card product-card" data-action="select-product" data-product-id="' + product.id + '">' +
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

    // Вспомогательная функция для получения отображаемого названия категории
    function getCategoryLabel(catId) {
        if (!catId) return 'Продукт';
        var found = CATEGORIES.find(function(c) { return c.id === catId; });
        return found ? found.label : catId.charAt(0).toUpperCase() + catId.slice(1);
    }

    // ===== БЛОК «РЕКОМЕНДОВАНО СЕЙЧАС» =====
    function renderRecommendedProducts() {
        var childId = getCurrentChildId();
        if (!childId) return '<p class="text-secondary">Выберите ребёнка</p>';

        var products = PRODUCTS || [];
        var age = getChildAgeMonths(childId);
        var recommended = products
            .map(function(p) {
                return { product: p, safety: safeEvaluate(p, childId) };
            })
            .filter(function(item) {
                // Используем safety.status
                return item.safety.status === 'allow' || item.safety.status === 'caution';
            })
            .sort(function(a, b) {
                if (a.safety.status === 'allow' && b.safety.status !== 'allow') return -1;
                if (a.safety.status !== 'allow' && b.safety.status === 'allow') return 1;
                var diffA = Math.abs((a.product.ageMinMonths || 0) - age);
                var diffB = Math.abs((b.product.ageMinMonths || 0) - age);
                return diffA - diffB;
            })
            .slice(0, 6)
            .map(function(item) { return renderProductCard(item.product); })
            .join('');

        if (!recommended) {
            return '<p class="text-secondary">Пока нет рекомендованных продуктов для этого возраста.</p>';
        }
        return '<div class="recommended-grid">' + recommended + '</div>';
    }

    // ===== СЕТКА КАТЕГОРИЙ =====
    function renderCategoryGrid() {
        var categories = CATEGORIES || [];
        return categories
            .map(function(cat) {
                var emoji = cat.icon || '📂';
                return '<div class="category-chip" data-action="filter-products" data-category="' + cat.id + '">' +
                    '<span class="category-emoji">' + emoji + '</span>' +
                    '<span class="category-name">' + escapeHTML(cat.label) + '</span>' +
                '</div>';
            })
            .join('');
    }

    // ===== ФИЛЬТРАЦИЯ ПРОДУКТОВ =====
    function getFilteredProducts() {
        var childId = getCurrentChildId();
        if (!childId) return [];

        var filtered = PRODUCTS.slice();
        var statusFilter = (window.STATE && window.STATE.productsFilter) || 'all';
        var categoryFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        var ageFilter = (window.STATE && window.STATE.productsAgeFilter) || null;
        var query = window.CURRENT_PRODUCT_SEARCH || '';

        // Фильтр по статусу
        if (statusFilter === 'current') {
            filtered = filtered.filter(function(p) {
                var safety = safeEvaluate(p, childId);
                return safety.status === 'allow' || safety.status === 'caution';
            });
        } else if (statusFilter === 'introduced') {
            filtered = filtered.filter(function(p) {
                return getProductStatusForChild(p.id, childId) === 'introduced';
            });
        }

        // Фильтр по категории (используем category id)
        if (categoryFilter) {
            filtered = filtered.filter(function(p) {
                return p.category === categoryFilter;
            });
        }

        // Фильтр по возрасту (рекомендательный)
        if (ageFilter) {
            var ageLimit = parseInt(ageFilter, 10);
            if (!isNaN(ageLimit)) {
                filtered = filtered.filter(function(p) {
                    return (p.ageMinMonths || 0) >= ageLimit;
                });
            }
        }

        // Поиск
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
            container.innerHTML = '<div class="empty-state"><span class="empty-icon">🥑</span><h3>Ничего не найдено</h3><p>Попробуйте изменить фильтры или поиск.</p></div>';
        } else {
            container.innerHTML = filtered.map(renderProductCard).join('');
        }

        // Обновляем счётчик "Введено"
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

        // Обновляем блок "Рекомендовано сейчас"
        var recContainer = document.getElementById('recommended-products');
        if (recContainer) {
            recContainer.innerHTML = renderRecommendedProducts();
        }

        // Обновляем активные чипсы фильтров
        updateChipsActiveState();
    }

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
    }

    // ===== ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ЭКРАНА =====
    function renderProducts() {
        var childId = getCurrentChildId();
        var introducedCount = 0;
        if (childId) {
            introducedCount = PRODUCTS.filter(function(p) {
                return getProductStatusForChild(p.id, childId) === 'introduced';
            }).length;
        }

        // Читаем фильтры из STATE для подсветки чипсов
        var statusFilter = (window.STATE && window.STATE.productsFilter) || 'all';
        var categoryFilter = (window.STATE && window.STATE.productsCategoryFilter) || null;
        var ageFilter = (window.STATE && window.STATE.productsAgeFilter) || null;

        var html = '';
        html += '<div class="products-screen" id="screen-products">';
        html += '  <div class="products-header">';
        html += '    <h1 class="h1">Продукты</h1>';
        html += '    <div class="introduced-counter" data-action="filter-products" data-filter="introduced">';
        html += '      ✅ Введено: <span id="products-introduced-count">' + introducedCount + '</span>';
        html += '    </div>';
        html += '  </div>';

        html += '  <div class="search-box">';
        html += '    <span>🔍</span>';
        html += '    <input id="product-search" type="search" placeholder="Найти продукт..." autocomplete="off" data-action="search-products" />';
        html += '    <button class="clear-search" data-action="clear-search">✕</button>';
        html += '  </div>';

        html += '  <section class="recommended-section">';
        html += '    <h2 class="h2">✨ Рекомендовано сейчас</h2>';
        html += '    <div id="recommended-products" class="recommended-grid">';
        html +=        renderRecommendedProducts();
        html += '    </div>';
        html += '  </section>';

        html += '  <section class="categories-section">';
        html += '    <h2 class="h2">Категории</h2>';
        html += '    <div id="category-grid" class="categories-grid">';
        html +=        renderCategoryGrid();
        html += '    </div>';
        html += '  </section>';

        html += '  <section class="filters-section">';
        html += '    <div class="filter-group">';
        html += '      <span class="filter-label">Статус:</span>';
        html += '      <div class="chips-group" id="status-filters">';
        html += '        <span class="chip' + (statusFilter === 'all' ? ' active' : '') + '" data-action="filter-products" data-filter="all">Все</span>';
        html += '        <span class="chip' + (statusFilter === 'current' ? ' active' : '') + '" data-action="filter-products" data-filter="current">✨ Сейчас</span>';
        html += '        <span class="chip' + (statusFilter === 'introduced' ? ' active' : '') + '" data-action="filter-products" data-filter="introduced">✅ Введены</span>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="filter-group">';
        html += '      <span class="filter-label">Категория:</span>';
        html += '      <div class="chips-group" id="category-filters">';
        html += '        <span class="chip' + (categoryFilter === null ? ' active' : '') + '" data-action="filter-products" data-category="">Все</span>';
        // Добавляем категории из CATEGORIES
        CATEGORIES.forEach(function(cat) {
            var active = (categoryFilter === cat.id) ? ' active' : '';
            html += '        <span class="chip' + active + '" data-action="filter-products" data-category="' + cat.id + '">' + cat.label + '</span>';
        });
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="filter-group">';
        html += '      <span class="filter-label">Возраст:</span>';
        html += '      <div class="chips-group" id="age-filters">';
        var ageOptions = ['', '6', '7', '8', '9', '10'];
        ageOptions.forEach(function(age) {
            var label = age ? age + '+' : 'Все';
            var active = (ageFilter === age || (age === '' && ageFilter === null)) ? ' active' : '';
            html += '        <span class="chip' + active + '" data-action="filter-products" data-age="' + age + '">' + label + '</span>';
        });
        html += '      </div>';
        html += '    </div>';
        html += '  </section>';

        html += '  <section class="products-list-section">';
        html += '    <h2 class="h2">Все продукты</h2>';
        html += '    <div id="products-list" class="products-list">';
        var filtered = getFilteredProducts();
        if (filtered.length === 0) {
            html += '<div class="empty-state"><span class="empty-icon">🥑</span><h3>Ничего не найдено</h3><p>Попробуйте изменить фильтры или поиск.</p></div>';
        } else {
            html += filtered.map(renderProductCard).join('');
        }
        html += '    </div>';
        html += '  </section>';

        html += '  <button class="floating-add" data-action="add-food">➕ <span>Добавить</span></button>';
        html += '</div>';

        return html;
    }

    // ===== ФУНКЦИИ ДЛЯ ОБНОВЛЕНИЯ ФИЛЬТРОВ И ПОИСКА =====

    // Установка фильтра категории (для обратной совместимости)
    window.setProductsFilter = function(category) {
        if (window.STATE) {
            window.STATE.productsCategoryFilter = category || null;
        }
        updateProductsList();
    };

    // Установка поискового запроса
    window.setProductsSearch = function(query) {
        window.CURRENT_PRODUCT_SEARCH = query || '';
        updateProductsList();
    };

    // Обновление списка (глобально)
    window.updateProductsList = updateProductsList;

    // ===== ГЛОБАЛЬНОЕ ПРИСВОЕНИЕ ДЛЯ РЕНДЕРИНГА =====
    window.renderProducts = renderProducts;

    // ===== ОБРАБОТЧИКИ КЛИКОВ ДЛЯ ПОИСКА И ОЧИСТКИ =====
    document.addEventListener('click', function(e) {
        var target = e.target.closest('[data-action="search-products"]');
        if (target && target.tagName === 'INPUT') {
            // поиск обрабатывается через input event
            return;
        }
        var clearBtn = e.target.closest('[data-action="clear-search"]');
        if (clearBtn) {
            var input = document.getElementById('product-search');
            if (input) {
                input.value = '';
                window.setProductsSearch('');
            }
            e.preventDefault();
            return;
        }
        // Обработка кликов по чипсам фильтров (если handlers.js не обработает)
        var chip = e.target.closest('[data-action="filter-products"]');
        if (chip) {
            var filter = chip.dataset.filter;
            var category = chip.dataset.category;
            var age = chip.dataset.age;
            if (filter !== undefined) {
                if (window.STATE) window.STATE.productsFilter = filter;
            }
            if (category !== undefined) {
                if (window.STATE) window.STATE.productsCategoryFilter = category || null;
            }
            if (age !== undefined) {
                if (window.STATE) window.STATE.productsAgeFilter = age || null;
            }
            updateProductsList();
            e.preventDefault();
            return;
        }
    });

    // Обработка ввода поиска
    document.addEventListener('input', function(e) {
        if (e.target.id === 'product-search') {
            window.setProductsSearch(e.target.value);
        }
    });

    // ===== ПЕРЕХВАТ СОБЫТИЯ ИЗМЕНЕНИЯ СОСТОЯНИЯ =====
    window.addEventListener('prikorm:statechange', function() {
        var screen = document.getElementById('screen-products');
        if (screen) {
            updateProductsList();
        }
    });

    console.log('✅ products.js загружен (исправленный, non-module)');
})();