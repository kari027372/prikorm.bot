/* ============================================================
   screens/baby.js
   Экран "Малыши"
   ============================================================ */

window.renderBaby = function() {
    /*
     * Всегда берём актуальное состояние приложения.
     * Это важно после addChild / deleteChild / switchChild.
     */
    const state =
        typeof window.getState === 'function'
            ? window.getState()
            : (window.STATE || {});

    const children =
        Array.isArray(state.children)
            ? state.children
            : [];

    console.log(
        '👶 renderBaby:',
        'children.length =',
        children.length,
        'children =',
        children.map(function(child) {
            return child.name || 'Без имени';
        }).join(', ')
    );

    const current =
        typeof window.getCurrentChild === 'function'
            ? window.getCurrentChild()
            : (
                children.find(function(child) {
                    return (
                        child.id ===
                        state.currentChildId
                    );
                }) || null
            );

    let html = `
        <div class="screen active baby-screen">

            <div class="page-header baby-page-header">
                <div>
                    <span class="baby-page-eyebrow">KENORA</span>
                    <h1>👶 Малыши</h1>
                </div>

                <button
                    class="icon-button"
                    data-action="navigate"
                    data-screen="home"
                    type="button"
                    aria-label="На главную"
                >
                    ⌂
                </button>
            </div>
    `;

    if (children.length === 0) {
        html += `
            <div class="empty-state baby-empty-state">
                <span class="empty-icon">👶</span>

                <h3>Нет добавленных детей</h3>

                <p>
                    Пройдите онбординг или нажмите
                    «Добавить ребёнка»
                </p>
            </div>
        `;
    } else {
        html += `
            <div class="baby-list">
        `;

        children.forEach(function(child) {
            const isActive =
                current &&
                current.id === child.id;

            const age =
                child.birthDate &&
                typeof window.formatAge === 'function'
                    ? window.formatAge(
                          child.birthDate
                      )
                    : 'Возраст не указан';

            const avatar =
                child.sex === 'male'
                    ? '👦'
                    : child.sex === 'female'
                        ? '👧'
                        : '👶';

            html += `
                <div
                    class="settings-row baby-child-row${isActive ? ' baby-child-row-active' : ''}"
                    style="${
                        isActive
                            ? 'border: 2px solid var(--bg-primary);'
                            : ''
                    }"
                    data-action="switch-child"
                    data-child-id="${child.id}"
                >

                    <span class="baby-child-avatar">
                        ${avatar}
                    </span>

                    <div class="baby-child-info">
                        <strong>
                            ${
                                child.name ||
                                'Без имени'
                            }
                        </strong>

                        <small>
                            ${age}
                        </small>
                    </div>

                    ${
                        isActive
                            ? '<span class="baby-child-active">✔</span>'
                            : ''
                    }

                    <button
                        class="icon-button baby-child-delete"
                        type="button"
                        data-action="delete-child"
                        data-child-id="${child.id}"
                        aria-label="Удалить ребёнка"
                    >
                        🗑️
                    </button>
                </div>
            `;
        });

        html += `
            </div>
        `;
    }

    html += `
        <button
            class="primary-button baby-add-button"
            data-action="open-add-child"
            type="button"
            style="margin-top: 16px;"
        >
            ➕ Добавить ребёнка
        </button>
    `;

    html += `
        </div>
    `;

    return html;
};