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
        <div class="screen active">
            <div class="page-header">
                <h1>👶 Малыши</h1>

                <button
                    class="icon-button"
                    data-action="navigate"
                    data-screen="home"
                    type="button"
                >
                    ⌂
                </button>
            </div>
    `;

    if (children.length === 0) {
        html += `
            <div class="empty-state">
                <span class="empty-icon">👶</span>

                <h3>Нет добавленных детей</h3>

                <p>
                    Пройдите онбординг или нажмите
                    «Добавить ребёнка»
                </p>
            </div>
        `;
    } else {
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

            html += `
                <div
                    class="settings-row"
                    style="${
                        isActive
                            ? 'border: 2px solid var(--bg-primary);'
                            : ''
                    }"
                    data-action="switch-child"
                    data-child-id="${child.id}"
                >

                    <span>
                        ${
                            child.sex === 'male'
                                ? '👦'
                                : child.sex === 'female'
                                    ? '👧'
                                    : '👶'
                        }
                    </span>

                    <div>
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
                            ? '<span>✔</span>'
                            : ''
                    }

                    <button
                        class="icon-button"
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
    }

    html += `
        <button
            class="primary-button"
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