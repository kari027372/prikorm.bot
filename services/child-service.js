(function() {
    'use strict';

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
        if (typeof window.addChild === 'function') {
            return window.addChild(data);
        }
        console.error('❌ addChild не доступен');
        return null;
    }

    function setActiveChild(childId) {
        if (typeof window.switchChild === 'function') {
            return window.switchChild(childId);
        }
        // Fallback
        const child = getChild(childId);
        if (!child) return false;
        window.STATE.currentChildId = childId;
        if (typeof window.saveState === 'function') window.saveState();
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        return true;
    }

    function updateChild(childId, updates) {
        if (typeof window.updateChild === 'function') {
            return window.updateChild(childId, updates);
        }
        // Fallback
        const child = getChild(childId);
        if (!child) return false;
        Object.assign(child, updates);
        if (typeof window.saveState === 'function') window.saveState();
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        return true;
    }

    function deleteChild(childId) {
        if (typeof window.deleteChild === 'function') {
            return window.deleteChild(childId);
        }
        // Fallback (реализован в state.js, но если нет – делаем сами)
        if (!window.STATE || !Array.isArray(window.STATE.children)) return false;
        const index = window.STATE.children.findIndex(c => c.id === childId);
        if (index === -1) return false;
        window.STATE.children.splice(index, 1);
        if (window.STATE.currentChildId === childId) {
            window.STATE.currentChildId = window.STATE.children.length ? window.STATE.children[0].id : null;
        }
        if (typeof window.saveState === 'function') window.saveState();
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        return true;
    }

    function getChild(childId) {
        const children = getChildren();
        return children.find(c => c.id === childId) || null;
    }

    function ensureActiveChild() {
        const children = getChildren();
        if (!children.length) {
            if (window.STATE) window.STATE.currentChildId = null;
            if (typeof window.saveState === 'function') window.saveState();
            return null;
        }
        const state = window.STATE;
        if (!state) return null;
        const exists = children.some(c => c.id === state.currentChildId);
        if (!exists) {
            state.currentChildId = children[0].id;
            if (typeof window.saveState === 'function') window.saveState();
            console.log('🔄 child-service: currentChildId скорректирован на первого ребёнка');
            return children[0];
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

    console.log('✅ child-service загружен (исправлен, без синхронизации baby)');
})();