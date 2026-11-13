(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EchoesStateEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'echoes_prolog_state_v1';

  function createInitialState() {
    return {
      phase: 'epigraph', // 'epigraph' | 'prolog' | 'transition_banner' | 'freeroam' | 'rwth'
      stepId: 'adegan1_ambang',
      calmness: 75,
      focus: 65,
      hasReadDictionary: false,
      warsawPlaying: false,
      passedGermanTest: false,
      germanScore: 0,
      inspectedObjects: [],
      journalNotes: [
        'April 1955: Membawa Kalung Emas Mami (cadangan darurat) & buku De Idioot karya Dostoevsky.'
      ],
      inventory: [
        { id: 'kalung', name: 'Kalung Emas Mami', detail: 'Cadangan darurat untuk digadai bila terdesak di Jerman.' },
        { id: 'de_idioot', name: 'Buku "De Idioot"', detail: 'Novel tebal berbahasa Belanda karya Dostoevsky.' },
        { id: 'sioux', name: 'Sepatu Moccasin Sioux', detail: 'Solnya mulai berbunyi "lop-lop" saat menapaki jalanan Aachen.' }
      ],
      bangkokEventResolved: false
    };
  }

  function clampStat(val) {
    return Math.max(0, Math.min(100, val));
  }

  function recordInspected(state, objectId) {
    if (!objectId || typeof objectId !== 'string') return state;
    if (!state.inspectedObjects.includes(objectId)) {
      state.inspectedObjects = state.inspectedObjects.concat([objectId]);
    }
    if (objectId === 'german_dict') {
      state.hasReadDictionary = true;
    }
    return state;
  }

  function saveState(state, storage) {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return false;
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function loadState(storage) {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return null;
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.phase !== 'string') {
        return null;
      }
      const base = createInitialState();
      return Object.assign(base, parsed, {
        inspectedObjects: Array.isArray(parsed.inspectedObjects) ? parsed.inspectedObjects : [],
        journalNotes: Array.isArray(parsed.journalNotes) ? parsed.journalNotes : base.journalNotes,
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : base.inventory
      });
    } catch (_err) {
      return null;
    }
  }

  function clearState(storage) {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return false;
    try {
      store.removeItem(STORAGE_KEY);
      return true;
    } catch (_err) {
      return false;
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    createInitialState: createInitialState,
    clampStat: clampStat,
    recordInspected: recordInspected,
    saveState: saveState,
    loadState: loadState,
    clearState: clearState
  };
}));
