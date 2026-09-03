/* ============================================================
   services/child-service.js
   Централизованные операции с детьми
   ============================================================ */

(function() {
    'use strict';

    // ============================================================
    // ОБЁРТКИ НАД СУЩЕСТВУЮЩИМИ ФУНКЦИЯМИ
    // ============================================================

    function getChildren() {
        return window.STATE?.children || [];
    }

    function getActiveChild() {
        if (typeof window.getCurrentChild === 'function') {
            return window.getCurrentChild();
        }
        return null;
    }

    function createChild(data) {
        if (typeof window.addChild !== 'function') {
            console.error('❌ addChild не определена');
            return null;
        }
        return window.addChild(data);
    }

    function setActiveChild(childId) {
        if (typeof window.switchChild !== 'function') {
            console.error('❌ switchChild не определена');
            return false;
        }
        return window.switchChild(childId);
    }

    function updateChild(childId, updates) {
        const child = getChild(childId);
        if (!child) {
            console.warn('Ребёнок не найден:', childId);
            return false;
        }
        Object.assign(child, updates);
        if (typeof window.saveState === 'function') {
            window.saveState();
        }
        if (typeof window.emitStateChange === 'function') {
            window.emitStateChange();
        }
        return true;
    }

    function deleteChild(childId) {
        if (typeof window.deleteChild !== 'function') {
            console.error('❌ deleteChild не определена');
            return false;
        }
        return window.deleteChild(childId);
    }

    function getChild(childId) {
        const children = getChildren();
        return children.find(c => c.id === childId) || null;
    }

    // ============================================================
    // ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ
    // ============================================================

    function ensureActiveChild() {
        const children = getChildren();
        if (!children.length) {
            // Нет детей – обнуляем активного
            const state = window.STATE;
            if (state) {
                state.currentChildId = null;
                if (typeof window.saveState === 'function') window.saveState();
            }
            return null;
        }

        const state = window.STATE;
        if (!state) return null;

        const exists = children.some(c => c.id === state.currentChildId);
        if (!exists) {
            // Если активный не существует, выбираем первого
            const firstChild = children[0];
            state.currentChildId = firstChild.id;
            if (typeof window.saveState === 'function') window.saveState();
            console.log('🔄 child-service: currentChildId скорректирован на первого ребёнка');
            return firstChild;
        }

        return getActiveChild();
    }

    // ============================================================
    // ПУБЛИЧНЫЙ API
    // ============================================================

    window.childService = {
        getChildren: getChildren,
        getActiveChild: getActiveChild,
        createChild: createChild,
        setActiveChild: setActiveChild,
        updateChild: updateChild,
        deleteChild: deleteChild,
        getChild: getChild,
        ensureActiveChild: ensureActiveChild
    };

    console.log('✅ child-service загружен');
})();
