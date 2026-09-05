/* ============================================================
   screens/rendering.js
   Рендер экранов приложения — только IIFE, без модулей
   ============================================================ */

(function() {
    'use strict';

    /*
     * ============================================================
     * Получаем АКТУАЛЬНЫЙ STATE
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
     * Находим контейнер именно для содержимого экрана (не #app)
     * ============================================================
     */
    function getAppContent() {
        var content = document.getElementById('app-content');
        if (content) {
            return content;
        }

        var app = document.getElementById('app');
        if (!app) {
            return null;
        }

        content = document.createElement('div');
        content.id = 'app-content';
        content.className = 'app-content';

        var modalRoot = document.getElementById('modal-root');
        if (modalRoot && modalRoot.parentElement === app) {
            app.insertBefore(content, modalRoot);
        } else {
            app.appendChild(content);
        }

        return content;
    }

    /*
     * ============================================================
     * Основная функция рендеринга
     * ============================================================
     */
    window.render = function(screen) {
        var state = getCurrentState();
        var appContent = getAppContent();

        if (!appContent) {
            console.error('❌ Не найден #app-content');
            return '';
        }

        var previousScreen = state.navigation?.currentScreen || 'home';
        screen = screen || state.navigation?.currentScreen || 'home';

        var validScreens = [
            'home', 'products', 'today', 'diary',
            'recipes', 'baby', 'settings', 'onboarding'
        ];

        if (!validScreens.includes(screen)) {
            console.warn('⚠️ Неизвестный экран:', screen);
            screen = 'home';
        }

        if (!state.navigation) {
            state.navigation = {
                currentScreen: 'home',
                previousScreen: null,
                modal: null
            };
        }

        if (state.navigation.currentScreen !== screen) {
            state.navigation.previousScreen = previousScreen;
        }
        state.navigation.currentScreen = screen;

        if (!state.ui) {
            state.ui = {};
        }
        state.ui.screen = screen;

        var html = '';

        try {
            switch (screen) {
                case 'home':
                    if (typeof window.renderHome === 'function') {
                        html = window.renderHome();
                    }
                    break;
                case 'products':
                    if (typeof window.renderProducts === 'function') {
                        html = window.renderProducts();
                    }
                    break;
                case 'today':
                    if (typeof window.renderToday === 'function') {
                        html = window.renderToday();
                    }
                    break;
                case 'diary':
                    if (typeof window.renderDiary === 'function') {
                        html = window.renderDiary();
                    }
                    break;
                case 'recipes':
                    if (typeof window.renderRecipes === 'function') {
                        html = window.renderRecipes();
                    }
                    break;
                case 'baby':
                    if (typeof window.renderBaby === 'function') {
                        html = window.renderBaby();
                    }
                    break;
                case 'settings':
                    if (typeof window.renderSettings === 'function') {
                        html = window.renderSettings();
                    }
                    break;
                case 'onboarding':
                    if (typeof window.renderOnboarding === 'function') {
                        html = window.renderOnboarding();
                    }
                    break;
                default:
                    if (typeof window.renderHome === 'function') {
                        html = window.renderHome();
                    }
                    break;
            }
        } catch (error) {
            console.error('❌ Ошибка рендера:', screen, error);
            html = `
                <div class="screen active">
                    <div class="empty-state">
                        <span class="empty-icon">⚠️</span>
                        <h3>Что-то пошло не так</h3>
                        <p>Не удалось загрузить этот экран.</p>
                    </div>
                </div>
            `;
        }

        appContent.innerHTML = html;

        // Обновляем UI
        if (window.ui && typeof window.ui === 'object') {
            window.ui.previousScreen = previousScreen;
            window.ui.screen = screen;
        }

        if (typeof window.updateProfileUI === 'function') {
            try {
                window.updateProfileUI();
            } catch (e) {
                console.warn('⚠️ updateProfileUI:', e);
            }
        }

        // Логи для отладки
        if (screen === 'baby') {
            console.log('👶 render("baby"): children =', state.children?.length || 0, 'currentChildId =', state.currentChildId);
        }
        if (screen === 'onboarding') {
            console.log('🌱 render("onboarding"): _onboardingChildId =', state._onboardingChildId);
        }

        return html;
    };

    // Алиас
    window.renderScreen = window.render;

    console.log('✅ rendering.js загружен — рендеринг через #app-content');
})();