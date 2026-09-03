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
        if (!window.STATE) {
            console.error('STATE не определён');
            return null;
        }
        if (!Array.isArray(window.STATE.children)) {
            window.STATE.children = [];
        }
        const id = 'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        const newChild = {
            id: id,
            name: data.name || '',
            birthDate: data.birthDate || '',
            sex: data.sex || '',
            feedingType: data.feedingType || '',
            feedingStarted: data.feedingStarted || false,
            feedingStartDate: data.feedingStartDate || '',
            approach: data.approach || 'mixed',
            readiness: data.readiness || {},
            onboarding: data.onboarding || {
                allergies: [],
                diet: [],
                favoriteFoods: [],
                worries: [],
                confidence: ''
            },
            diary: [],
            plan: {},
            settings: {}
        };
        window.STATE.children.push(newChild);
        window.STATE.currentChildId = newChild.id;
        if (typeof window.saveState === 'function') {
            window.saveState();
        }
        if (typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        }
        console.log('✅ Ребёнок создан через childService:', newChild);
        return newChild;
    }

    function setActiveChild(childId) {
        if (typeof window.switchChild === 'function') {
            return window.switchChild(childId);
        }
        const child = getChild(childId);
        if (!child) return false;
        window.STATE.currentChildId = childId;
        if (typeof window.saveState === 'function') window.saveState();
        window.dispatchEvent(new CustomEvent('prikorm:statechange'));
        return true;
    }

    function updateChild(childId, updates) {
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
        const children = getChildren();
        const index = children.findIndex(c => c.id === childId);
        if (index === -1) return false;
        children.splice(index, 1);
        if (window.STATE.currentChildId === childId) {
            window.STATE.currentChildId = children.length ? children[0].id : null;
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

    console.log('✅ child-service загружен (исправленная версия)');
})();