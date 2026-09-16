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

        // ============================================================
        // P1.6 — Секция «Реакции»
        //
        // Читает productState[productId].reactions[] через существующий
        // productStateService.getProductState(). Если реакций нет,
        // секция не показывается. Product State не меняется.
        // ============================================================
        var reactionsHtml = buildReactionsHtml(product);

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

            reactionsHtml +

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

    // ============================================================
    // P1.6 — Построение секции «Реакции» для Product Detail Modal.
    // Возвращает HTML-строку или '' (если реакций нет / данных нет).
    // Все пользовательские данные проходят через escapeHtml().
    // ============================================================
    function buildReactionsHtml(product) {
        if (!product || !product.id) return '';

        var childId = null;

        if (typeof window.getCurrentChildId === 'function') {
            try {
                childId = window.getCurrentChildId();
            } catch (e) {
                console.warn('buildReactionsHtml: getCurrentChildId error', e);
            }
        }

        if (!childId && window.STATE && window.STATE.currentChildId) {
            childId = window.STATE.currentChildId;
        }

        if (!childId) return '';

        if (
            !window.productStateService ||
            typeof window.productStateService.getProductState !== 'function'
        ) {
            return '';
        }

        var state = null;

        try {
            state = window.productStateService.getProductState(
                childId,
                product.id
            );
        } catch (e) {
            console.warn('buildReactionsHtml: getProductState error', e);
            return '';
        }

        if (
            !state ||
            !Array.isArray(state.reactions) ||
            !state.reactions.length
        ) {
            return '';
        }

        var symptomLabels = {
            redness: 'Покраснение',
            contact_urticaria: 'Контактная крапивница',
            hives: 'Крапивница / волдыри',
            rash: 'Сыпь',
            swelling: 'Отёк',
            vomiting: 'Рвота',
            diarrhea: 'Жидкий стул',
            blood_in_stool: 'Кровь в стуле',
            mucus_in_stool: 'Слизь в стуле',
            abdominal_pain: 'Боль / вздутие',
            cough: 'Кашель',
            cough_persistent: 'Внезапный стойкий кашель',
            wheeze: 'Свистящее дыхание',
            breathing_difficult: 'Затруднённое дыхание',
            voice_change: 'Изменение голоса / крика',
            pale: 'Резкая бледность',
            floppy: 'Обмякание',
            collapse: 'Коллапс',
            lethargy: 'Вялость',
            drooling: 'Внезапное слюнотечение',
            other: 'Другое'
        };

        var severityLabels = {
            mild: 'Лёгкая',
            moderate: 'Средняя',
            severe: 'Тяжёлая'
        };

        var itemsHtml = state.reactions.map(function (reaction) {
            if (!reaction || typeof reaction !== 'object') return '';

            var parts = [];

            if (reaction.date) {
                parts.push(
                    '<strong>Дата:</strong> ' +
                    escapeHtml(String(reaction.date))
                );
            }

            var symptomsArr = Array.isArray(reaction.symptoms)
                ? reaction.symptoms
                : [];

            if (symptomsArr.length) {
                var symptomsText = symptomsArr
                    .map(function (s) {
                        return symptomLabels[s] || String(s);
                    })
                    .join(', ');

                parts.push(
                    '<strong>Симптомы:</strong> ' +
                    escapeHtml(symptomsText)
                );
            }

            if (
                reaction.severity &&
                severityLabels[reaction.severity]
            ) {
                parts.push(
                    '<strong>Степень:</strong> ' +
                    escapeHtml(severityLabels[reaction.severity])
                );
            }

            if (
                reaction.notes &&
                String(reaction.notes).trim() !== ''
            ) {
                parts.push(
                    '<strong>Заметки:</strong> ' +
                    escapeHtml(String(reaction.notes))
                );
            }

            if (!parts.length) return '';

            return '<li>' + parts.join('<br>') + '</li>';
        }).filter(Boolean).join('');

        if (!itemsHtml) return '';

        return '<div class="modal-section">' +
                   '<h4>📋 Реакции</h4>' +
                   '<ul>' + itemsHtml + '</ul>' +
               '</div>';
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
    // P1.6 — Reaction Modal (adaptive form)
    //
    // Расширенный список симптомов, динамические уточнения
    // (встроены внутрь соответствующего symptom-блока),
    // emergency branch, severity без default.
    //
    // _meta (location, timing, count и т.д.) собирается в момент
    // сохранения через handlers.js и НЕ сохраняется в Product State.
    //
    // P1.6-UX: dynamic-question рендерится сразу после своего
    // родительского symptom-чекбокса, а не в конце формы.
    // ============================================================

    function buildReactionFormHtml(productId, productName) {
        var swellingLocationHtml = [
            { value: 'lips',         label: 'Губы' },
            { value: 'face',         label: 'Лицо' },
            { value: 'eyes',         label: 'Глаза' },
            { value: 'tongue',       label: 'Язык' },
            { value: 'mouth_throat', label: 'Рот / горло' },
            { value: 'other',        label: 'Другое' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="swelling-location" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var hivesLocationHtml = [
            { value: 'perioral', label: 'Вокруг рта' },
            { value: 'face',     label: 'Лицо' },
            { value: 'body',     label: 'Тело' },
            { value: 'multiple', label: 'Несколько областей' },
            { value: 'unknown',  label: 'Не уверена' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="hives-location" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var skinLocationHtml = [
            { value: 'perioral', label: 'Вокруг рта' },
            { value: 'other',    label: 'Другое' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="skin-location" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var vomitingCountHtml = [
            { value: '1',       label: '1 раз' },
            { value: '2+',      label: '2 и более' },
            { value: 'unknown', label: 'Не уверена' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="vomiting-count" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var diarrheaCountHtml = [
            { value: '1',        label: '1 раз' },
            { value: 'multiple', label: 'Несколько' },
            { value: 'watery',   label: 'Водянистый' },
            { value: 'unknown',  label: 'Не уверена' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="diarrhea-count" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var droolingContextHtml = [
            { value: 'ordinary',     label: 'Обычное, связано с зубами' },
            { value: 'acute_airway', label: 'Внезапное, не связано с зубами' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="drooling-context" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var dynamicBlocks = {
            swelling:
                '<div class="form-group reaction-dynamic" data-requires="swelling" style="display:none;">' +
                  '<label>Где был отёк?</label>' +
                  '<div class="reaction-options">' + swellingLocationHtml + '</div>' +
                '</div>',

            hives:
                '<div class="form-group reaction-dynamic" data-requires="hives" style="display:none;">' +
                  '<label>Где была крапивница?</label>' +
                  '<div class="reaction-options">' + hivesLocationHtml + '</div>' +
                '</div>',

            skin:
                '<div class="form-group reaction-dynamic" data-requires="redness,contact_urticaria" style="display:none;">' +
                  '<label>Где?</label>' +
                  '<div class="reaction-options">' + skinLocationHtml + '</div>' +
                '</div>',

            vomiting:
                '<div class="form-group reaction-dynamic" data-requires="vomiting" style="display:none;">' +
                  '<label>Сколько раз была рвота?</label>' +
                  '<div class="reaction-options">' + vomitingCountHtml + '</div>' +
                '</div>',

            diarrhea:
                '<div class="form-group reaction-dynamic" data-requires="diarrhea" style="display:none;">' +
                  '<label>Частота жидкого стула?</label>' +
                  '<div class="reaction-options">' + diarrheaCountHtml + '</div>' +
                '</div>',

            drooling:
                '<div class="form-group reaction-dynamic" data-requires="drooling" style="display:none;">' +
                  '<label>Характер слюнотечения</label>' +
                  '<div class="reaction-options">' + droolingContextHtml + '</div>' +
                '</div>'
        };

        var symptomGroups = [
            {
                title: 'Кожа',
                items: [
                    { value: 'redness', label: 'Покраснение' },
                    { value: 'contact_urticaria', label: 'Контактная крапивница', dynamic: 'skin' },
                    { value: 'hives', label: 'Крапивница / волдыри', dynamic: 'hives' }
                ]
            },
            {
                title: 'Отёк',
                items: [
                    { value: 'swelling', label: 'Отёк', dynamic: 'swelling' }
                ]
            },
            {
                title: 'ЖКТ',
                items: [
                    { value: 'vomiting', label: 'Рвота', dynamic: 'vomiting' },
                    { value: 'diarrhea', label: 'Жидкий стул', dynamic: 'diarrhea' },
                    { value: 'blood_in_stool', label: 'Кровь в стуле' },
                    { value: 'mucus_in_stool', label: 'Слизь в стуле' },
                    { value: 'abdominal_pain', label: 'Боль / вздутие' }
                ]
            },
            {
                title: 'Дыхание',
                items: [
                    { value: 'cough', label: 'Кашель' },
                    { value: 'cough_persistent', label: 'Внезапный стойкий кашель' },
                    { value: 'wheeze', label: 'Свистящее дыхание' },
                    { value: 'breathing_difficult', label: 'Затруднённое дыхание' },
                    { value: 'voice_change', label: 'Изменение голоса / крика' }
                ]
            },
            {
                title: 'Общее состояние',
                items: [
                    { value: 'pale', label: 'Резкая бледность' },
                    { value: 'floppy', label: 'Обмякание' },
                    { value: 'collapse', label: 'Коллапс' },
                    { value: 'lethargy', label: 'Вялость' }
                ]
            },
            {
                title: 'Другое',
                items: [
                    { value: 'drooling', label: 'Внезапное слюнотечение', dynamic: 'drooling' },
                    { value: 'other', label: 'Другое' }
                ]
            }
        ];

        var symptomsHtml = symptomGroups.map(function (group) {
            var itemsHtml = group.items.map(function (item) {
                var checkboxHtml =
                    '<label class="reaction-option">' +
                      '<input type="checkbox" name="reaction-symptom" value="' + item.value + '" />' +
                      '<span>' + escapeHtml(item.label) + '</span>' +
                    '</label>';

                var dynamicHtml =
                    (item.dynamic && dynamicBlocks[item.dynamic])
                        ? dynamicBlocks[item.dynamic]
                        : '';

                return checkboxHtml + dynamicHtml;
            }).join('');

            return '<div class="form-group">' +
                     '<label>' + escapeHtml(group.title) + '</label>' +
                     '<div class="reaction-options">' + itemsHtml + '</div>' +
                   '</div>';
        }).join('');

        var timingHtml = [
            { value: 'during',            label: 'Во время еды' },
            { value: 'immediately_after', label: 'Сразу после' },
            { value: 'delayed_1_to_4h',   label: 'Через 1–4 часа' },
            { value: 'later',             label: 'Позже в тот же день' },
            { value: 'next_day',          label: 'На следующий день' },
            { value: 'unknown',           label: 'Не знаю' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="reaction-timing" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        var severityHtml = [
            { value: 'mild',     label: 'Лёгкая' },
            { value: 'moderate', label: 'Средняя' },
            { value: 'severe',   label: 'Тяжёлая' }
        ].map(function (opt) {
            return '<label class="reaction-option">' +
                     '<input type="radio" name="reaction-severity" value="' + opt.value + '" />' +
                     '<span>' + opt.label + '</span>' +
                   '</label>';
        }).join('');

        return '' +
            '<div class="modal-overlay active">' +
              '<div class="modal-content">' +
                '<div class="modal-header">' +
                  '<h2>Реакция на «' + escapeHtml(productName) + '»</h2>' +
                  '<button class="modal-close" type="button" data-action="close-modal">×</button>' +
                '</div>' +
                '<div class="modal-body">' +
                  '<form class="reaction-form" onsubmit="return false;">' +
                    '<input type="hidden" name="reaction-product-id" value="' + escapeHtml(productId) + '" />' +

                    symptomsHtml +

                    '<div class="form-group">' +
                      '<label>Когда появилось?</label>' +
                      '<div class="reaction-options">' + timingHtml + '</div>' +
                    '</div>' +

                    '<div class="form-group">' +
                      '<label>Степень (необязательно)</label>' +
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
    }

    function updateDynamicQuestions(form) {
        var checked = {};

        form.querySelectorAll('input[name="reaction-symptom"]:checked').forEach(function (el) {
            checked[el.value] = true;
        });

        form.querySelectorAll('.reaction-dynamic').forEach(function (block) {
            var requires = block.getAttribute('data-requires');
            if (!requires) return;

            var required = requires.split(',').map(function (s) { return s.trim(); });
            var show = required.some(function (r) { return checked[r]; });

            block.style.display = show ? '' : 'none';

            if (!show) {
                block.querySelectorAll('input[type="radio"]').forEach(function (r) {
                    r.checked = false;
                });
            }
        });
    }

    function readFormState(form) {
        var symptoms = [];

        form.querySelectorAll('input[name="reaction-symptom"]:checked').forEach(function (el) {
            symptoms.push(el.value);
        });

        var severityInput = form.querySelector('input[name="reaction-severity"]:checked');
        var notesInput = form.querySelector('[name="reaction-notes"]');

        function getRadio(name) {
            var el = form.querySelector('input[name="' + name + '"]:checked');
            return el ? el.value : null;
        }

        return {
            symptoms: symptoms,
            severity: severityInput ? severityInput.value : null,
            notes: notesInput ? notesInput.value : '',
            meta: {
                swellingLocation: getRadio('swelling-location'),
                hivesLocation: getRadio('hives-location'),
                skinLocation: getRadio('skin-location'),
                vomitingCount: getRadio('vomiting-count'),
                diarrheaCount: getRadio('diarrhea-count'),
                droolingContext: getRadio('drooling-context'),
                timing: getRadio('reaction-timing')
            }
        };
    }

    function isEmergencyFromState(state) {
        var s = state.symptoms;
        var m = state.meta;

        if (s.indexOf('breathing_difficult') !== -1) return true;
        if (s.indexOf('wheeze') !== -1) return true;
        if (s.indexOf('cough_persistent') !== -1) return true;
        if (s.indexOf('voice_change') !== -1) return true;
        if (s.indexOf('collapse') !== -1) return true;
        if (s.indexOf('pale') !== -1 && s.indexOf('floppy') !== -1) return true;

        if (s.indexOf('swelling') !== -1 &&
            (m.swellingLocation === 'tongue' || m.swellingLocation === 'mouth_throat')) {
            return true;
        }

        if (s.indexOf('drooling') !== -1 && m.droolingContext === 'acute_airway') {
            return true;
        }

        return false;
    }

    function showEmergencyCard(root, productId, productName, state) {
        root.innerHTML = '' +
            '<div class="modal-overlay active">' +
              '<div class="modal-content">' +
                '<div class="modal-header">' +
                  '<h2>Возможна тяжёлая реакция</h2>' +
                '</div>' +
                '<div class="modal-body">' +
                  '<div class="modal-section">' +
                    '<p>Эти признаки могут соответствовать тяжёлой аллергической реакции.</p>' +
                    '<p><strong>Немедленно обратитесь за медицинской помощью.</strong></p>' +
                    '<p>Это не диагноз. Решение принимает врач.</p>' +
                  '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                  '<button class="btn-secondary" type="button" data-action="close-modal">Понятно</button>' +
                  '<button class="btn-primary emergency-save-btn" type="button">Сохранить запись</button>' +
                '</div>' +
              '</div>' +
            '</div>';

        var saveBtn = root.querySelector('.emergency-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var childId = (window.STATE && window.STATE.currentChildId)
                    ? window.STATE.currentChildId
                    : null;

                if (!childId) {
                    if (typeof window.showToast === 'function') {
                        window.showToast('Выберите ребёнка', 'error');
                    }
                    return;
                }

                if (!window.productStateService ||
                    typeof window.productStateService.addReaction !== 'function') {
                    console.warn('addReaction недоступен');
                    return;
                }

                var payload = {
                    date: new Date().toISOString().split('T')[0],
                    symptoms: state.symptoms,
                    severity: state.severity,
                    action: 'monitor',
                    notes: state.notes
                };

                var ok = window.productStateService.addReaction(
                    childId,
                    productId,
                    payload,
                    { classification: 'temporary_exclusion' }
                );

                if (ok) {
                    if (typeof window.saveState === 'function') {
                        window.saveState();
                    }
                    if (typeof window.closeModal === 'function') {
                        window.closeModal();
                    }
                    if (typeof window.updateProductsList === 'function') {
                        window.updateProductsList();
                    }
                } else {
                    console.warn('emergency addReaction вернул false');
                    if (typeof window.showToast === 'function') {
                        window.showToast('Не удалось сохранить реакцию', 'error');
                    }
                }
            });
        }
    }

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

        root.innerHTML = buildReactionFormHtml(productId, productName);

        var form = root.querySelector('.reaction-form');
        if (form) {
            form.addEventListener('change', function () {
                updateDynamicQuestions(form);

                var state = readFormState(form);
                if (isEmergencyFromState(state)) {
                    showEmergencyCard(root, productId, productName, state);
                }
            });
        }

        if (typeof UI !== 'undefined') {
            UI.modal = root;
        }
    }

    window.showProductDetailModal =
        showProductDetailModal;

    // P0.3 + P1.6: экспорт модалки реакции.
    window.showReactionModal = showReactionModal;

    console.log('✅ components/modal.js загружен');
})();