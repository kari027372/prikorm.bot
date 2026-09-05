// components/modal.js (дописать в существующий файл)

/**
 * Показать модалку с деталями продукта
 * @param {Object} product - объект продукта из data/products.js
 */
export function showProductDetailModal(product) {
  if (!product) return;

  const statusLabels = {
    recommended: '🟢 Подходит',
    caution: '🟡 С осторожностью',
    avoid: '🔴 Не рекомендуется',
    age_limited: '⏳ Возрастное ограничение'
  };

  const ageText = product.introduction.fromMonths ? 
    `с ${product.introduction.fromMonths} мес.` : 
    'не указан';

  // Блоки для отображения
  let highlightsHtml = product.highlights ? 
    product.highlights.map(h => `<li>${h}</li>`).join('') : '';
  
  let safeFormsHtml = product.safeForms && product.safeForms.length ? 
    product.safeForms.map(f => `<li>✅ ${f}</li>`).join('') : '<li>Нет данных</li>';
  
  let unsafeFormsHtml = product.unsafeForms && product.unsafeForms.length ? 
    product.unsafeForms.map(f => `<li>❌ ${f}</li>`).join('') : '<li>Нет данных</li>';

  let labelChecksHtml = '';
  if (product.commercialProduct && product.labelChecks && product.labelChecks.length) {
    labelChecksHtml = `
      <div class="modal-section">
        <h4>🛒 Проверьте состав</h4>
        <ul>
          ${product.labelChecks.map(check => {
            const labels = {
              addedSugar: 'добавленный сахар',
              addedSalt: 'добавленная соль',
              honey: 'мёд',
              sweeteners: 'подсластители',
              unpasteurized: 'непастеризовано'
            };
            return `<li>⚠️ ${labels[check] || check}</li>`;
          }).join('')}
        </ul>
      </div>
    `;
  }

  // Аллергены
  let allergenHtml = '';
  if (product.allergen && product.allergenType && product.allergenType.length) {
    allergenHtml = `
      <div class="modal-section allergen-section">
        <h4>⚠️ Аллерген</h4>
        <p>Продукт может вызвать аллергическую реакцию. Тип: ${product.allergenType.join(', ')}.</p>
        <p>При наличии аллергии в анамнезе — проконсультируйтесь с врачом.</p>
      </div>
    `;
  }

  // Риск удушья
  let chokingHtml = '';
  if (product.chokingRisk && product.chokingRisk !== 'none') {
    const riskLabels = { low: 'низкий', medium: 'средний', high: 'высокий' };
    chokingHtml = `
      <div class="modal-section choking-section">
        <h4>🚨 Риск удушья: ${riskLabels[product.chokingRisk] || product.chokingRisk}</h4>
        <p>Обратите внимание на форму подачи.</p>
      </div>
    `;
  }

  // Подготовка
  let prepHtml = product.preparation ? `
    <div class="modal-section">
      <h4>👩‍🍳 Как приготовить</h4>
      <p>${product.preparation}</p>
    </div>
  ` : '';

  // Интересный факт
  let factHtml = product.interestingFact ? `
    <div class="modal-section fact-section">
      <h4>💡 Интересный факт</h4>
      <p>${product.interestingFact}</p>
    </div>
  ` : '';

  // Медицинская заметка
  let medicalHtml = product.medicalNote ? `
    <div class="modal-section medical-note">
      <h4>⚕️ Важно</h4>
      <p>${product.medicalNote}</p>
    </div>
  ` : '';

  const content = `
    <div class="product-detail-modal">
      <div class="modal-header">
        <span class="modal-emoji">${product.emoji}</span>
        <h3>${product.name}</h3>
        <span class="modal-status ${product.status}">${statusLabels[product.status] || product.status}</span>
      </div>

      <div class="modal-body">
        <div class="modal-section">
          <h4>📅 Возраст введения</h4>
          <p>${ageText}</p>
        </div>

        ${highlightsHtml ? `
          <div class="modal-section">
            <h4>🧠 Что даёт?</h4>
            <ul>${highlightsHtml}</ul>
          </div>
        ` : ''}

        ${allergenHtml}

        ${chokingHtml}

        <div class="modal-section">
          <h4>✅ Безопасные формы</h4>
          <ul>${safeFormsHtml}</ul>
        </div>

        <div class="modal-section">
          <h4>❌ Небезопасные формы</h4>
          <ul>${unsafeFormsHtml}</ul>
        </div>

        ${prepHtml}

        ${factHtml}

        ${labelChecksHtml}

        ${medicalHtml}
      </div>

      <div class="modal-footer">
        <button class="btn-close-modal">Закрыть</button>
        <span class="disclaimer">Информация не заменяет консультацию врача.</span>
      </div>
    </div>
  `;

  // Используем существующую функцию showModal из components/modal.js
  if (typeof window.showModal === 'function') {
    window.showModal(content);
  } else {
    // Fallback – простая модалка
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content product-detail-modal">
        ${content}
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.btn-close-modal')) {
        overlay.remove();
      }
    });
  }
}