// components/modal.js
(function () {
    'use strict';

    function showProductDetailModal(productOrId) {
        var product = productOrId;

        if (typeof productOrId === 'string') {
            var products = Array.isArray(window.PRODUCTS)
                ? window.PRODUCTS
                : [];

            product = products.find(function (item) {
                return item.id === productOrId;
            });
        }

        if (!product) {
            console.warn('⚠️ Продукт не найден:', productOrId);
            return;
        }

        var statusLabels = {
            recommended: '🟢 Подходит',
            caution: '🟡 С осторожностью',
            avoid: '🔴 Не рекомендуется',
            age_limited: '⏳ Возрастное ограничение'
        };

        var ageText =
            product.introduction &&
            product.introduction.fromMonths !== undefined
                ? 'с ' + product.introduction.fromMonths + ' мес.'
                : 'не указан';

        var highlightsHtml = '';

        if (
            Array.isArray(product.highlights) &&
            product.highlights.length
        ) {
            highlightsHtml = product.highlights
                .map(function (item) {
                    return '<li>' + escapeHtml(item) + '</li>';
                })
                .join('');
        }

        var safeFormsHtml = '<li>Нет данных</li>';

        if (
            Array.isArray(product.safeForms) &&
            product.safeForms.length
        ) {
            safeFormsHtml = product.safeForms
                .map(function (item) {
                    return '<li>✅ ' + escapeHtml(item) + '</li>';
                })
                .join('');
        }

        var unsafeFormsHtml = '<li>Нет данных</li>';

        if (
            Array.isArray(product.unsafeForms) &&
            product.unsafeForms.length
        ) {
            unsafeFormsHtml = product.unsafeForms
                .map(function (item) {
                    return '<li>❌ ' + escapeHtml(item) + '</li>';
                })
                .join('');
        }

        var allergenHtml = '';

        if (
            product.allergen &&
            Array.isArray(product.allergenType) &&
            product.allergenType.length
        ) {
            allergenHtml =
                '<div class="modal-section allergen-section">' +
                '<h4>⚠️ Аллерген</h4>' +
                '<p>Продукт может вызвать аллергическую реакцию.</p>' +
                '<p>Тип: ' +
                escapeHtml(product.allergenType.join(', ')) +
                '.</p>' +
                '<p>При наличии аллергии в анамнезе — ' +
                'проконсультируйтесь с врачом.</p>' +
                '</div>';
        }

        var chokingHtml = '';

        if (
            product.chokingRisk &&
            product.chokingRisk !== 'none'
        ) {
            var riskLabels = {
                low: 'низкий',
                medium: 'средний',
                high: 'высокий'
            };

            chokingHtml =
                '<div class="modal-section choking-section">' +
                '<h4>🚨 Риск удушья: ' +
                (riskLabels[product.chokingRisk] ||
                    escapeHtml(product.chokingRisk)) +
                '</h4>' +
                '<p>Обратите внимание на форму и способ подачи.</p>' +
                '</div>';
        }

        var preparationHtml = '';

        if (product.preparation) {
            preparationHtml =
                '<div class="modal-section">' +
                '<h4>👩‍🍳 Как приготовить</h4>' +
                '<p>' +
                escapeHtml(product.preparation) +
                '</p>' +
                '</div>';
        }

        var factHtml = '';

        if (product.interestingFact) {
            factHtml =
                '<div class="modal-section fact-section">' +
                '<h4>💡 Интересный факт</h4>' +
                '<p>' +
                escapeHtml(product.interestingFact) +
                '</p>' +
                '</div>';
        }

        var labelChecksHtml = '';

        if (
            product.commercialProduct &&
            Array.isArray(product.labelChecks) &&
            product.labelChecks.length
        ) {
            var labelMap = {
                addedSugar: 'добавленный сахар',
                addedSalt: 'добавленная соль',
                honey: 'мёд',
                sweeteners: 'подсластители',
                unpasteurized: 'непастеризовано'
            };

            labelChecksHtml =
                '<div class="modal-section">' +
                '<h4>🛒 Проверьте состав</h4>' +
                '<ul>' +
                product.labelChecks
                    .map(function (check) {
                        return (
                            '<li>⚠️ ' +
                            escapeHtml(
                                labelMap[check] || check
                            ) +
                            '</li>'
                        );
                    })
                    .join('') +
                '</ul>' +
                '</div>';
        }

        var medicalHtml = '';

        if (product.medicalNote) {
            medicalHtml =
                '<div class="modal-section medical-note">' +
                '<h4>⚕️ Важно</h4>' +
                '<p>' +
                escapeHtml(product.medicalNote) +
                '</p>' +
                '</div>';
        }

        var content =
            '<div class="product-detail-modal">' +

            '<div class="modal-header">' +

            '<span class="modal-emoji">' +
            (product.emoji || '🍽️') +
            '</span>' +

            '<h3>' +
            escapeHtml(product.name) +
            '</h3>' +

            '<span class="modal-status ' +
            escapeHtml(product.status || '') +
            '">' +
            (statusLabels[product.status] ||
                escapeHtml(product.status || '')) +
            '</span>' +

            '</div>' +

            '<div class="modal-body">' +

            '<div class="modal-section">' +
            '<h4>📅 Возраст введения</h4>' +
            '<p>' +
            ageText +
            '</p>' +
            '</div>' +

            (
                highlightsHtml
                    ? '<div class="modal-section">' +
                      '<h4>🧠 Что даёт?</h4>' +
                      '<ul>' +
                      highlightsHtml +
                      '</ul>' +
                      '</div>'
                    : ''
            ) +

            allergenHtml +

            chokingHtml +

            '<div class="modal-section">' +
            '<h4>✅ Безопасные формы</h4>' +
            '<ul>' +
            safeFormsHtml +
            '</ul>' +
            '</div>' +

            '<div class="modal-section">' +
            '<h4>❌ Небезопасные формы</h4>' +
            '<ul>' +
            unsafeFormsHtml +
            '</ul>' +
            '</div>' +

            preparationHtml +

            factHtml +

            labelChecksHtml +

            medicalHtml +

            '</div>' +

            '<div class="modal-footer">' +
            '<button class="btn-close-modal">Закрыть</button>' +
            '<span class="disclaimer">' +
            'Информация не заменяет консультацию врача.' +
            '</span>' +
            '</div>' +

            '</div>';

        if (typeof window.showModal === 'function') {
            window.showModal(content);
            return;
        }

        var overlay = document.createElement('div');

        overlay.className = 'modal-overlay';

        overlay.innerHTML =
            '<div class="modal-content">' +
            content +
            '</div>';

        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (event) {
            if (
                event.target === overlay ||
                event.target.closest('.btn-close-modal')
            ) {
                overlay.remove();
            }
        });
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ============================================================
    // P0.3: минимальная модалка отметки реакции.
    // Пишет в существующий #modal-root, использует существующие
    // modal-* классы и существующий closeModal
    // (data-action="close-modal"). Собственный механизм закрытия
    // не создаётся.
    // ============================================================
    function showReactionModal(productId) {
        var root = document.getElementById('modal-root');
        if (!root) {
            console.warn('showReactionModal: #modal-root не найден');
            return;
        }

        var product = Array.isArray(window.PRODUCTS)
            ? window.PRODUCTS.find(function (p) { return p.id === productId; })
            : null;
        var productName = (product && product.name) ? product.name : 'продукт';

        var symptomOptions = [
            { value: 'rash',     label: 'Сыпь' },
            { value: 'redness',  label: 'Покраснение' },
            { value: 'vomiting', label: 'Рвота' },
            { value: 'diarrhea', label: 'Диарея' },
            { value: 'swelling', label: 'Отёк' },
            { value: 'cough',    label: 'Кашель' },
            { value: 'other',    label: 'Другое' }
        ];

        var symptomsHtml = symptomOptions.map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="checkbox" name="reaction-symptom" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var severityOptions = [
            { value: 'mild',     label: 'Лёгкая',  checked: true },
            { value: 'moderate', label: 'Средняя', checked: false },
            { value: 'severe',   label: 'Тяжёлая', checked: false }
        ];

        var severityHtml = severityOptions.map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="reaction-severity" value="' + opt.value + '"' +
                     (opt.checked ? ' checked' : '') + ' />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        root.innerHTML = '' +
            '<div class="modal-overlay active">' +
              '<div class="modal-content">' +
                '<div class="modal-header">' +
                  '<h2>Реакция на «' + escapeHtml(productName) + '»</h2>' +
                  '<button class="modal-close" type="button" data-action="close-modal">×</button>' +
                '</div>' +
                '<div class="modal-body">' +
                  '<form class="reaction-form" onsubmit="return false;">' +
                    '<input type="hidden" name="reaction-product-id" value="' + escapeHtml(productId) + '" />' +
                    '<div class="form-group">' +
                      '<label>Симптомы</label>' +
                      '<div class="reaction-options">' + symptomsHtml + '</div>' +
                    '</div>' +
                    '<div class="form-group">' +
                      '<label>Степень</label>' +
                      '<div class="reaction-options">' + severityHtml + '</div>' +
                    '</div>' +
                    '<div class="form-group">' +
                      '<label>Заметки</label>' +
                      '<textarea class="form-textarea" name="reaction-notes" rows="3" placeholder="Что вы заметили"></textarea>' +
                    '</div>' +
                  '</form>' +
                '</div>' +
                '<div class="modal-footer">' +
                  '<button class="btn-secondary" type="button" data-action="close-modal">Отмена</button>' +
                  '<button class="btn-primary" type="button" data-action="save-reaction" data-product-id="' + escapeHtml(productId) + '">Сохранить</button>' +
                '</div>' +
              '</div>' +
            '</div>';

        if (typeof UI !== 'undefined') {
            UI.modal = root;
        }
    }

    window.showProductDetailModal =
        showProductDetailModal;

    // P0.3: экспорт модалки реакции.
    window.showReactionModal = showReactionModal;

    console.log('✅ components/modal.js загружен');
})();