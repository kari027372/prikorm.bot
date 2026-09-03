/* ============================================================
   services/storage-service.js
   Централизованное управление localStorage
   ============================================================ */

(function() {
    'use strict';

    // Ключ для хранения состояния в localStorage
    const STORAGE_KEY = 'prikorm_state';

    // ============================================================
    // БАЗОВЫЕ ОПЕРАЦИИ
    // ============================================================

    /**
     * Загружает состояние из localStorage
     * @returns {Object|null} - сохранённое состояние или null
     */
    function loadRawState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (error) {
            console.error('❌ Ошибка чтения STATE из localStorage:', error);
            return null;
        }
    }

    /**
     * Сохраняет состояние в localStorage
     * @param {Object} state - состояние для сохранения
     * @returns {boolean} - успешно ли сохранено
     */
    function saveRawState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения STATE в localStorage:', error);
            return false;
        }
    }

    /**
     * Удаляет состояние из localStorage
     * @returns {boolean} - успешно ли удалено
     */
    function resetRawState() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления STATE из localStorage:', error);
            return false;
        }
    }

    // ============================================================
    // МИГРАЦИЯ ДАННЫХ
    // ============================================================

    /**
     * Применяет миграции к загруженному состоянию
     * @param {Object} savedState - состояние из localStorage
     * @param {Object} defaultState - эталонное состояние
     * @returns {Object} - состояние после миграции
     */
    function migrateState(savedState, defaultState) {
        if (!savedState || typeof savedState !== 'object') {
            return JSON.parse(JSON.stringify(defaultState));
        }

        // Клонируем дефолтное состояние для безопасного merge
        const result = JSON.parse(JSON.stringify(defaultState));

        // Переносим существующие поля, сохраняя глубокую структуру
        Object.keys(savedState).forEach(key => {
            if (savedState[key] && typeof savedState[key] === 'object' && !Array.isArray(savedState[key]) &&
                result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                // Рекурсивное слияние для объектов
                result[key] = mergeDeep(result[key], savedState[key]);
            } else {
                result[key] = savedState[key];
            }
        });

        // ===== СПЕЦИАЛЬНЫЕ МИГРАЦИИ =====

        // 1. Перенос глобальных diary и plan в первого ребёнка (если есть)
        if (savedState.diary && Array.isArray(savedState.diary) && savedState.diary.length > 0) {
            // Если есть дети, переносим дневник в первого ребёнка (или активного)
            if (result.children && result.children.length > 0) {
                // Определяем, куда сохранять: в активного или первого
                let targetChild = null;
                if (result.currentChildId) {
                    targetChild = result.children.find(c => c.id === result.currentChildId);
                }
                if (!targetChild) {
                    targetChild = result.children[0];
                }
                if (targetChild) {
                    // Если у ребёнка нет поля diary, создаём
                    if (!targetChild.diary) targetChild.diary = [];
                    // Объединяем, избегая дублирования (по id)
                    const existingIds = new Set(targetChild.diary.map(e => e.id));
                    savedState.diary.forEach(entry => {
                        if (!existingIds.has(entry.id)) {
                            targetChild.diary.push(entry);
                        }
                    });
                    console.log('🔄 Миграция дневника: перенесено записей в ребёнка', targetChild.name || 'без имени');
                }
            }
            // После переноса удаляем глобальные поля из результата, чтобы они не остались
            delete result.diary;
        }

        if (savedState.plan && typeof savedState.plan === 'object') {
            // Аналогично для plan
            if (result.children && result.children.length > 0) {
                let targetChild = null;
                if (result.currentChildId) {
                    targetChild = result.children.find(c => c.id === result.currentChildId);
                }
                if (!targetChild) {
                    targetChild = result.children[0];
                }
                if (targetChild) {
                    if (!targetChild.plan) targetChild.plan = { days: {} };
                    // Объединяем планы (по дням)
                    const days = savedState.plan.days || {};
                    Object.keys(days).forEach(date => {
                        if (!targetChild.plan.days[date]) {
                            targetChild.plan.days[date] = [];
                        }
                        // Добавляем уникальные записи (по id)
                        const existingMeals = targetChild.plan.days[date];
                        const mealIds = new Set(existingMeals.map(m => m.id));
                        days[date].forEach(meal => {
                            if (!mealIds.has(meal.id)) {
                                existingMeals.push(meal);
                            }
                        });
                    });
                    console.log('🔄 Миграция плана: перенесено в ребёнка', targetChild.name || 'без имени');
                }
            }
            delete result.plan;
        }

        // 2. Если есть поле onboarding (глобальное), переносим в первого ребёнка (если он есть)
        if (savedState.onboarding && typeof savedState.onboarding === 'object') {
            if (result.children && result.children.length > 0) {
                const firstChild = result.children[0];
                if (!firstChild.onboarding) firstChild.onboarding = {};
                // Копируем поля, если их нет
                ['allergies', 'diet', 'favoriteFoods', 'worries', 'confidence'].forEach(field => {
                    if (savedState.onboarding[field] !== undefined && !firstChild.onboarding[field]) {
                        firstChild.onboarding[field] = savedState.onboarding[field];
                    }
                });
                console.log('🔄 Миграция глобального onboarding в первого ребёнка');
            }
            delete result.onboarding;
        }

        // 3. Убеждаемся, что у каждого ребёнка есть поля diary и plan (если отсутствуют)
        if (result.children) {
            result.children.forEach(child => {
                if (!child.diary) child.diary = [];
                if (!child.plan) child.plan = { days: {} };
                if (!child.onboarding) child.onboarding = {};
                // Гарантируем наличие поля onboarding для всех существующих полей
                ['allergies', 'diet', 'favoriteFoods', 'worries', 'confidence'].forEach(field => {
                    if (child.onboarding[field] === undefined) child.onboarding[field] = [];
                });
            });
        }

        return result;
    }

    // ============================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================

    function mergeDeep(target, source) {
        const output = { ...target };
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key]) && key in target) {
                    output[key] = mergeDeep(target[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    }

    function isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // ============================================================
    // ПУБЛИЧНЫЙ API
    // ============================================================

    window.storageService = {
        STORAGE_KEY: STORAGE_KEY,
        loadRawState: loadRawState,
        saveRawState: saveRawState,
        resetRawState: resetRawState,
        migrateState: migrateState
    };

    console.log('✅ storage-service загружен');
})();