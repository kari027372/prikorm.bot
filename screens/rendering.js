// screens/rendering.js
(function() {
    'use strict';

    /*
     * ============================================================
     * Получаем АКТУАЛЬНЫЙ STATE
     *
     * Важно:
     * state.js хранит настоящий STATE во внутренней переменной.
     * window.STATE может быть старой ссылкой.
     *
     * Поэтому сначала используем STATE, и только если он
     * недоступен — window.STATE.
     * ============================================================
     */
    function getState() {
        if (typeof STATE !== 'undefined') {
            return STATE;
        }

        return window.STATE || {};
    }

    /*
     * ============================================================
     * Рендер конкретного экрана
     * ============================================================
     */

    window.render = function(screen) {
        const state = getState();

        const app =
            document.getElementById('app');

        if (!app) {
            console.error(
                '❌ Не найден элемент #app'
            );
            return;
        }

        /*
         * Сохраняем предыдущий экран
         */
        const previousScreen =
            state.navigation?.currentScreen ||
            'home';

        /*
         * Если экран не передан,
         * используем текущий.
         */
        screen =
            screen ||
            state.navigation?.currentScreen ||
            'home';

        /*
         * ========================================================
         * Проверяем допустимый экран
         * ========================================================
         */

        const validScreens = [
            'home',
            'products',
            'today',
            'diary',
            'recipes',
            'baby',
            'settings',
            'onboarding'
        ];

        if (!validScreens.includes(screen)) {
            console.warn(
                '⚠️ Неизвестный экран:',
                screen
            );

            screen = 'home';
        }

        /*
         * ========================================================
         * Обновляем navigation в АКТУАЛЬНОМ STATE
         * ========================================================
         */

        if (!state.navigation) {
            state.navigation = {
                currentScreen: 'home',
                previousScreen: null,
                modal: null
            };
        }

        if (
            state.navigation.currentScreen !==
            screen
        ) {
            state.navigation.previousScreen =
                previousScreen;
        }

        state.navigation.currentScreen =
            screen;

        /*
         * ========================================================
         * Вызываем соответствующий renderer
         * ========================================================
         */

        let html = '';

        try {
            switch (screen) {

                case 'home':
                    if (
                        typeof window.renderHome ===
                        'function'
                    ) {
                        html =
                            window.renderHome();
                    }
                    break;

                case 'products':
                    if (
                        typeof window.renderProducts ===
                        'function'
                    ) {
                        html =
                            window.renderProducts();
                    }
                    break;

                case 'today':
                    if (
                        typeof window.renderToday ===
                        'function'
                    ) {
                        html =
                            window.renderToday();
                    }
                    break;

                case 'diary':
                    if (
                        typeof window.renderDiary ===
                        'function'
                    ) {
                        html =
                            window.renderDiary();
                    }
                    break;

                case 'recipes':
                    if (
                        typeof window.renderRecipes ===
                        'function'
                    ) {
                        html =
                            window.renderRecipes();
                    }
                    break;

                case 'baby':
                    if (
                        typeof window.renderBaby ===
                        'function'
                    ) {
                        html =
                            window.renderBaby();
                    }
                    break;

                case 'settings':
                    if (
                        typeof window.renderSettings ===
                        'function'
                    ) {
                        html =
                            window.renderSettings();
                    }
                    break;

                case 'onboarding':
                    if (
                        typeof window.renderOnboarding ===
                        'function'
                    ) {
                        html =
                            window.renderOnboarding();
                    }
                    break;

                default:
                    if (
                        typeof window.renderHome ===
                        'function'
                    ) {
                        html =
                            window.renderHome();
                    }
                    break;
            }

        } catch (error) {
            console.error(
                '❌ Ошибка рендера экрана:',
                screen,
                error
            );

            html = `
                <div class="screen active">
                    <div class="empty-state">
                        <span class="empty-icon">⚠️</span>
                        <h3>Что-то пошло не так</h3>
                        <p>
                            Не удалось загрузить этот экран.
                        </p>
                    </div>
                </div>
            `;
        }

        /*
         * ========================================================
         * Записываем HTML
         * ========================================================
         */

        if (
            typeof html === 'string'
        ) {
            app.innerHTML = html;
        } else {
            console.warn(
                '⚠️ Renderer вернул не строку:',
                screen,
                html
            );

            app.innerHTML = '';
        }

        /*
         * ========================================================
         * Обновляем UI-навигацию
         * ========================================================
         */

        if (
            typeof window.ui ===
            'object' &&
            window.ui
        ) {
            window.ui.previousScreen =
                previousScreen;

            window.ui.screen =
                screen;
        }

        /*
         * ========================================================
         * Дополнительная синхронизация
         * ========================================================
         */

        if (
            typeof window.updateProfileUI ===
            'function'
        ) {
            try {
                window.updateProfileUI();
            } catch (error) {
                console.warn(
                    '⚠️ Не удалось обновить профиль:',
                    error
                );
            }
        }

        /*
         * Лог для проверки детей
         */
        if (screen === 'baby') {
            console.log(
                '👶 render("baby"):',
                'children =',
                Array.isArray(state.children)
                    ? state.children.length
                    : 0,
                'currentChildId =',
                state.currentChildId
            );
        }

        /*
         * Лог для проверки onboarding
         */
        if (screen === 'onboarding') {
            console.log(
                '🌱 render("onboarding"):',
                '_onboardingChildId =',
                state._onboardingChildId,
                'children =',
                Array.isArray(state.children)
                    ? state.children.length
                    : 0
            );
        }

        return html;
    };

    /*
     * ============================================================
     * Алиас
     * ============================================================
     */

    window.renderScreen =
        window.render;

    console.log(
        '✅ rendering.js загружен'
    );
})();