/* ============================================================
   screens/rendering.js
   Рендер экранов приложения
   ============================================================ */

(function() {
    'use strict';

    /*
     * ============================================================
     * Получаем АКТУАЛЬНЫЙ STATE
     *
     * Важно:
     * state.js хранит настоящий STATE во внутренней переменной.
     * window.STATE может быть старой ссылкой после loadState/resetState.
     *
     * Поэтому сначала используем внутренний STATE.
     * ============================================================
     */
    function getCurrentState() {
        if (typeof STATE !== 'undefined') {
            return STATE;
        }

        return window.STATE || {};
    }

    /*
     * ============================================================
     * Находим контейнер именно для содержимого экрана
     *
     * НЕЛЬЗЯ рендерить прямо в #app:
     *
     * #app
     * ├── #app-content
     * ├── #modal-root
     * └── #toast-root
     *
     * Если заменить innerHTML у #app целиком —
     * мы удалим оболочку приложения.
     * ============================================================
     */
    function getAppContent() {
        var content =
            document.getElementById('app-content');

        /*
         * Если оболочка уже создана — используем её.
         */
        if (content) {
            return content;
        }

        /*
         * Резервный вариант:
         * если app-content почему-то отсутствует,
         * создаём его внутри #app.
         */
        var app =
            document.getElementById('app');

        if (!app) {
            return null;
        }

        content =
            document.createElement('div');

        content.id =
            'app-content';

        content.className =
            'app-content';

        /*
         * Вставляем перед modal-root,
         * чтобы сохранить существующие
         * modal-root и toast-root.
         */
        var modalRoot =
            document.getElementById('modal-root');

        if (
            modalRoot &&
            modalRoot.parentElement === app
        ) {
            app.insertBefore(
                content,
                modalRoot
            );
        } else {
            app.appendChild(content);
        }

        return content;
    }

    /*
     * ============================================================
     * Рендер конкретного экрана
     * ============================================================
     */

    window.render = function(screen) {
        var state =
            getCurrentState();

        /*
         * Получаем именно область содержимого,
         * а НЕ весь #app.
         */
        var appContent =
            getAppContent();

        if (!appContent) {
            console.error(
                '❌ Не найден #app-content и невозможно создать его внутри #app'
            );

            return '';
        }

        /*
         * Сохраняем предыдущий экран.
         */
        var previousScreen =
            state.navigation?.currentScreen ||
            'home';

        /*
         * Если экран не передан —
         * используем текущий экран.
         */
        screen =
            screen ||
            state.navigation?.currentScreen ||
            'home';

        /*
         * ========================================================
         * Допустимые экраны
         * ========================================================
         */

        var validScreens = [
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
         * Гарантируем наличие navigation
         * ========================================================
         */

        if (!state.navigation) {
            state.navigation = {
                currentScreen: 'home',
                previousScreen: null,
                modal: null
            };
        }

        /*
         * Обновляем previousScreen только
         * если действительно произошёл переход.
         */
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
         * Если есть ui.screen — синхронизируем его.
         * ========================================================
         */

        if (!state.ui) {
            state.ui = {};
        }

        state.ui.screen =
            screen;

        /*
         * ========================================================
         * Вызываем renderer нужного экрана
         * ========================================================
         */

        var html = '';

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

                        <span class="empty-icon">
                            ⚠️
                        </span>

                        <h3>
                            Что-то пошло не так
                        </h3>

                        <p>
                            Не удалось загрузить этот экран.
                        </p>

                    </div>
                </div>
            `;
        }

        /*
         * ========================================================
         * ВАЖНО:
         *
         * Меняем ТОЛЬКО #app-content.
         *
         * #app НЕ трогаем.
         *
         * Поэтому остаются:
         * - нижняя навигация;
         * - modal-root;
         * - toast-root;
         * - остальные элементы оболочки.
         * ========================================================
         */

        if (typeof html === 'string') {
            appContent.innerHTML =
                html;
        } else {

            console.warn(
                '⚠️ Renderer вернул не строку:',
                screen,
                html
            );

            appContent.innerHTML = '';
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
         * Дополнительная синхронизация профиля
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
         * ========================================================
         * Логи для проверки детей
         * ========================================================
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
         * ========================================================
         * Логи для проверки onboarding
         * ========================================================
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
        '✅ rendering.js загружен — безопасный рендер через #app-content'
    );

})();