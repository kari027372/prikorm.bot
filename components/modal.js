// components/modal.js

(function () {
  'use strict';

  /**
   * Показать модалку с деталями продукта
   *
   * @param {Object} product
   * Объект продукта из data/products.js
   */
  function showProductDetailModal(product) {
    if (!product) return;

    const statusLabels = {
      recommended: '🟢 Подходит',
      caution: '🟡 С осторожностью',
      avoid: '🔴 Не рекомендуется',
      age_limited: '⏳ Возрастное ограничение'
    };

    const ageText =
      product.introduction &&
      product.introduction.fromMonths
        ? `с ${product.introduction.fromMonths} мес.`
        : 'не указан';

    // Польза
    const highlightsHtml = product.highlights
      ? product.highlights
          .map(function (h) {
            return `<li>${h}</li>`;
          })
          .join('')
      : '';

    // Безопасные формы
    const safeFormsHtml =
      product.safeForms && product.safeForms.length
        ? product.safeForms
            .map(function (f) {
              return `<li>✅ ${f}</li>`;
            })
            .join('')
        : '<li>Нет данных</li>';

    // Небезопасные формы
    const unsafeFormsHtml =
      product.unsafeForms && product.unsafeForms.length
        ? product.unsafeForms
            .map(function (f) {
              return `<li>❌ ${f}</li>`;
            })
            .join('')
        : '<li>Нет данных</li>';

    // Проверка состава магазинного продукта
    let labelChecksHtml = '';

    if (
      product.commercialProduct &&
      product.labelChecks &&
      product.labelChecks.length
    ) {
      labelChecksHtml = `
        <div class="modal-section">

          <h4>🛒 Проверьте состав</h4>

          <ul>
            ${product.labelChecks
              .map(function (check) {

                const labels = {
                  addedSugar: 'добавленный сахар',
                  addedSalt: 'добавленная соль',
                  honey: 'мёд',
                  sweeteners: 'подсластители',
                  unpasteurized: 'непастеризовано'
                };

                return `
                  <li>
                    ⚠️ ${labels[check] || check}
                  </li>
                `;
              })
              .join('')}
          </ul>

        </div>
      `;
    }

    // Аллерген
    let allergenHtml = '';

    if (
      product.allergen &&
      product.allergenType &&
      product.allergenType.length
    ) {
      allergenHtml = `
        <div class="modal-section allergen-section">

          <h4>⚠️ Аллерген</h4>

          <p>
            Продукт может вызвать аллергическую реакцию.
            Тип: ${product.allergenType.join(', ')}.
          </p>

          <p>
            При наличии аллергии в анамнезе —
            проконсультируйтесь с врачом.
          </p>

        </div>
      `;
    }

    // Риск удушья
    let chokingHtml = '';

    if (
      product.chokingRisk &&
      product.chokingRisk !== 'none'
    ) {
      const riskLabels = {
        low: 'низкий',
        medium: 'средний',
        high: 'высокий'
      };

      chokingHtml = `
        <div class="modal-section choking-section">

          <h4>
            🚨 Риск удушья:
            ${riskLabels[product.chokingRisk] ||
              product.chokingRisk}
          </h4>

          <p>
            Обратите внимание на форму подачи.
          </p>

        </div>
      `;
    }

    // Приготовление
    const prepHtml = product.preparation
      ? `
        <div class="modal-section">

          <h4>👩‍🍳 Как приготовить</h4>

          <p>
            ${product.preparation}
          </p>

        </div>
      `
      : '';

    // Интересный факт
    const factHtml = product.interestingFact
      ? `
        <div class="modal-section fact-section">

          <h4>💡 Интересный факт</h4>

          <p>
            ${product.interestingFact}
          </p>

        </div>
      `
      : '';

    // Медицинская заметка
    const medicalHtml = product.medicalNote
      ? `
        <div class="modal-section medical-note">

          <h4>⚕️ Важно</h4>

          <p>
            ${product.medicalNote}
          </p>

        </div>
      `
      : '';

    const content = `
      <div class="product-detail-modal">

        <div class="modal-header">

          <span class="modal-emoji">
            ${product.emoji}
          </span>

          <h3>
            ${product.name}
          </h3>

          <span class="modal-status ${product.status}">
            ${statusLabels[product.status] ||
              product.status}
          </span>

        </div>

        <div class="modal-body">

          <div class="modal-section">

            <h4>📅 Возраст введения</h4>

            <p>
              ${ageText}
            </p>

          </div>

          ${
            highlightsHtml
              ? `
                <div class="modal-section">

                  <h4>🧠 Что даёт?</h4>

                  <ul>
                    ${highlightsHtml}
                  </ul>

                </div>
              `
              : ''
          }

          ${allergenHtml}

          ${chokingHtml}

          <div class="modal-section">

            <h4>✅ Безопасные формы</h4>

            <ul>
              ${safeFormsHtml}
            </ul>

          </div>

          <div class="modal-section">

            <h4>❌ Небезопасные формы</h4>

            <ul>
              ${unsafeFormsHtml}
            </ul>

          </div>

          ${prepHtml}

          ${factHtml}

          ${labelChecksHtml}

          ${medicalHtml}

        </div>

        <div class="modal-footer">

          <button class="btn-close-modal">
            Закрыть
          </button>

          <span class="disclaimer">
            Информация не заменяет консультацию врача.
          </span>

        </div>

      </div>
    `;

    // Используем существующую систему модалок
    if (typeof window.showModal === 'function') {
      window.showModal(content);
      return;
    }

    // Fallback
    const overlay = document.createElement('div');

    overlay.className = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal-content product-detail-modal">
        ${content}
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {

      if (
        e.target === overlay ||
        e.target.closest('.btn-close-modal')
      ) {
        overlay.remove();
      }

    });
  }

  // Глобально
  window.showProductDetailModal =
    showProductDetailModal;

  console.log(
    '✅ components/modal.js загружен'
  );

})();