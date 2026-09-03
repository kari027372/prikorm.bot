// screens/baby.js

window.renderBaby = function() {

    /*
     * Всегда берём самое актуальное состояние.
     */
    const state =
        typeof window.getState === 'function'
            ? window.getState()
            : (window.STATE || {});

    const children =
        Array.isArray(state.children)
            ? state.children
            : [];

    const current =
        typeof window.getCurrentChild === 'function'
            ? window.getCurrentChild()
            : (
                children.find(function(child) {
                    return child.id === state.currentChildId;
                }) || null
            );

    console.log(
        '👶 renderBaby:',
        'children =',
        children.length,
        'current =',
        current?.name || 'нет'
    );

    let html = `
        <div class="screen active">
            <div class="page-header">
                <h1>👶 Малыши</h1>
                <button
                    class="icon-button"
                    data-action="navigate"
                    data-screen="home"
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
                            ? 'border:2px solid var(--bg-primary);'
                            : ''
                    }"
                    data-action="switch-child"
                    data-child-id="${escapeHTML(
                        child.id || ''
                    )}"
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
                            ${escapeHTML(
                                child.name ||
                                'Без имени'
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                String(age)
                            )}
                        </small>
                    </div>

                    ${
                        isActive
                            ? '<span>✔</span>'
                            : ''
                    }

                    <button
                        type="button"
                        class="icon-button"
                        data-action="delete-child"
                        data-child-id="${escapeHTML(
                            child.id || ''
                        )}"
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
            style="margin-top:16px;"
        >
            ➕ Добавить ребёнка
        </button>
    `;

    html += `
        </div>
    `;

    return html;
};