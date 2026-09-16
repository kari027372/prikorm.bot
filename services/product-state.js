// services/product-state.js – финальная версия
(function() {
  'use strict';

  // ============================================================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================================

  function getChild(childId) {
    const children = window.STATE?.children || [];
    return children.find(c => c.id === childId) || null;
  }

  function saveState() {
    if (typeof window.saveState === 'function') {
      window.saveState();
    } else if (window.STATE) {
      try {
        localStorage.setItem('kenora_state', JSON.stringify(window.STATE));
      } catch (e) {
        console.warn('⚠️ Не удалось сохранить состояние:', e);
      }
    }
  }

  function getDefaultState() {
    return {
      status: 'notIntroduced',
      preference: null,
      firstOffered: null,
      lastOffered: null,
      timesOffered: 0,
      notes: '',
      reactions: []
    };
  }

  // ============================================================
  // ПРАВИЛА ПЕРЕХОДОВ СТАТУСОВ
  // ============================================================

  function canMarkAsIntroduced(currentStatus) {
    const allowed = ['notIntroduced', 'planned', 'introduced'];
    return allowed.includes(currentStatus);
  }

  // ============================================================
  // ОСНОВНЫЕ ФУНКЦИИ
  // ============================================================

  function getProductState(childId, productId) {
    if (!childId || !productId) return null;

    const child = getChild(childId);
    if (!child) return null;

    if (!child.productState) {
      child.productState = {};
    }

    const state = child.productState[productId];
    if (!state) {
      return getDefaultState();
    }

    return {
      status: state.status || 'notIntroduced',
      preference: state.preference || null,
      firstOffered: state.firstOffered || null,
      lastOffered: state.lastOffered || null,
      timesOffered: state.timesOffered || 0,
      notes: state.notes || '',
      reactions: Array.isArray(state.reactions) ? state.reactions : []
    };
  }

  function setStatus(childId, productId, status, options = {}) {
    if (!childId || !productId || !status) return false;

    const child = getChild(childId);
    if (!child) return false;

    if (status === 'confirmedAllergy') {
      const source = options.source || 'unknown';
      if (source !== 'parent' && source !== 'medicalProfile') {
        console.warn('⚠️ confirmedAllergy можно установить только с source: "parent" или "medicalProfile"');
        return false;
      }
    }

    const current = child.productState[productId] || {};
    child.productState[productId] = {
      status: status,
      preference: current.preference || null,
      firstOffered: current.firstOffered || null,
      lastOffered: current.lastOffered || null,
      timesOffered: current.timesOffered || 0,
      notes: Object.prototype.hasOwnProperty.call(options, 'notes') ? options.notes : (current.notes || ''),
      reactions: Array.isArray(current.reactions) ? current.reactions : []
    };

    saveState();
    return true;
  }

  function setPreference(childId, productId, preference) {
    if (!childId || !productId) return false;
    if (!['liked', 'disliked', 'refused', null].includes(preference)) return false;

    const child = getChild(childId);
    if (!child) return false;

    if (!child.productState) {
      child.productState = {};
    }

    const current = child.productState[productId] || {};
    child.productState[productId] = {
      status: current.status || 'notIntroduced',
      preference: preference,
      firstOffered: current.firstOffered || null,
      lastOffered: current.lastOffered || null,
      timesOffered: current.timesOffered || 0,
      notes: current.notes || '',
      reactions: Array.isArray(current.reactions) ? current.reactions : []
    };

    saveState();
    return true;
  }

  function markAsIntroduced(childId, productId, date) {
    if (!childId || !productId) return false;

    const child = getChild(childId);
    if (!child) return false;

    if (!child.productState) {
      child.productState = {};
    }

    const current = child.productState[productId] || {};
    const currentStatus = current.status || 'notIntroduced';

    if (!canMarkAsIntroduced(currentStatus)) {
      console.warn(`⚠️ Невозможно изменить статус "${currentStatus}" на "introduced" через markAsIntroduced`);
      return false;
    }

    child.productState[productId] = {
      status: 'introduced',
      preference: current.preference || null,
      firstOffered: current.firstOffered || null,
      lastOffered: current.lastOffered || null,
      timesOffered: current.timesOffered || 0,
      notes: current.notes || '',
      reactions: Array.isArray(current.reactions) ? current.reactions : []
    };

    saveState();
    return true;
  }

  function recordOffer(childId, productId, date) {
    if (!childId || !productId) return false;

    const child = getChild(childId);
    if (!child) return false;

    if (!child.productState) {
      child.productState = {};
    }

    const current = child.productState[productId] || {};
    const offerDate = date || new Date().toISOString().split('T')[0];
    const firstDate = current.firstOffered || offerDate;

    child.productState[productId] = {
      status: current.status || 'notIntroduced',
      preference: current.preference || null,
      firstOffered: firstDate,
      lastOffered: offerDate,
      timesOffered: (current.timesOffered || 0) + 1,
      notes: current.notes || '',
      reactions: Array.isArray(current.reactions) ? current.reactions : []
    };

    saveState();
    return true;
  }

  function addReaction(childId, productId, reaction, options) {
    if (!childId || !productId || !reaction) return false;

    const child = getChild(childId);
    if (!child) return false;

    if (!child.productState) {
      child.productState = {};
    }

    const current = child.productState[productId] || {};
    const reactions = Array.isArray(current.reactions) ? current.reactions : [];

    const newReaction = {
      date: reaction.date || new Date().toISOString().split('T')[0],
      symptoms: reaction.symptoms || [],
      severity: (reaction.severity === undefined) ? 'mild' : reaction.severity,
      action: reaction.action || 'monitor',
      notes: reaction.notes || ''
    };

    reactions.push(newReaction);

    let newStatus = current.status || 'notIntroduced';

    if (newStatus === 'introduced') {
      const classification = options && options.classification;

      if (classification === 'isolated_local_contact') {
        // status остаётся introduced
      } else if (classification === 'temporary_exclusion') {
        newStatus = 'suspectedReaction';
      } else if (classification === 'no_status_change') {
        // status остаётся introduced
      } else {
        newStatus = 'suspectedReaction';
      }
    }

    child.productState[productId] = {
      status: newStatus,
      preference: current.preference || null,
      firstOffered: current.firstOffered || null,
      lastOffered: current.lastOffered || null,
      timesOffered: current.timesOffered || 0,
      notes: current.notes || '',
      reactions: reactions
    };

    saveState();
    return true;
  }

  function getAllForChild(childId) {
    const child = getChild(childId);
    if (!child) return {};

    if (!child.productState) {
      child.productState = {};
    }

    const result = {};
    for (const [productId, state] of Object.entries(child.productState)) {
      result[productId] = {
        status: state.status || 'notIntroduced',
        preference: state.preference || null,
        firstOffered: state.firstOffered || null,
        lastOffered: state.lastOffered || null,
        timesOffered: state.timesOffered || 0,
        notes: state.notes || '',
        reactions: Array.isArray(state.reactions) ? state.reactions : []
      };
    }
    return result;
  }

  function getProductsByStatus(childId, status) {
    const all = getAllForChild(childId);
    const result = [];

    for (const [productId, state] of Object.entries(all)) {
      if (state.status === status) {
        result.push(productId);
      }
    }

    return result;
  }

  function wasIntroduced(state) {
    if (!state) return false;
    if (state.firstOffered) return true;
    if ((state.timesOffered || 0) > 0) return true;
    return false;
  }

  function getProductsByPreference(childId, preference) {
    const all = getAllForChild(childId);
    const result = [];

    for (const [productId, state] of Object.entries(all)) {
      if (state.preference === preference) {
        result.push(productId);
      }
    }

    return result;
  }

  function migrateGlobalData() {
    const state = window.STATE;
    if (!state) return;

    if (state.productStateMigrationVersion === 1) {
      console.log('ℹ️ Миграция productState уже выполнена');
      return;
    }

    const children = state.children || [];

    if (children.length === 0) {
      state.productStateMigrationVersion = 1;
      saveState();
      return;
    }

    const globalIntroduced = state.products?.introduced || [];
    const globalFavorites = state.products?.favorites || [];

    if (globalIntroduced.length === 0 && globalFavorites.length === 0) {
      state.productStateMigrationVersion = 1;
      saveState();
      return;
    }

    if (children.length === 1) {
      const child = children[0];

      if (!child.productState) {
        child.productState = {};
      }

      for (const productId of globalIntroduced) {
        if (!child.productState[productId]) {
          child.productState[productId] = {
            status: 'introduced',
            preference: null,
            firstOffered: null,
            lastOffered: null,
            timesOffered: 0,
            notes: '',
            reactions: []
          };
        }
      }

      for (const productId of globalFavorites) {
        if (child.productState[productId]) {
          child.productState[productId].preference = 'liked';
        } else {
          child.productState[productId] = {
            status: 'notIntroduced',
            preference: 'liked',
            firstOffered: null,
            lastOffered: null,
            timesOffered: 0,
            notes: '',
            reactions: []
          };
        }
      }

      state.productStateMigrationVersion = 1;
      saveState();
    } else {
      state.productStateMigrationVersion = 1;
      saveState();
    }
  }

  window.productStateService = {
    getProductState: getProductState,
    setStatus: setStatus,
    setPreference: setPreference,
    markAsIntroduced: markAsIntroduced,
    recordOffer: recordOffer,
    addReaction: addReaction,
    getAllForChild: getAllForChild,
    getProductsByStatus: getProductsByStatus,
    getProductsByPreference: getProductsByPreference,
    wasIntroduced: wasIntroduced,
    migrateGlobalData: migrateGlobalData
  };

  console.log('✅ product-state загружен');
})();