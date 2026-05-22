// store.jsx — global state + localStorage persistence
//
// Single source of truth for boards, children, and per-board progress.
// Persists everything under one key (`daybook.v1`) so it's easy to inspect
// and easy to clear (Settings · Reset).
//
// All write helpers accept a function or an object patch (like useState),
// and every mutation bumps the board's updatedAt so the Library can sort
// most-recent first.

const STORAGE_KEY = 'daybook.v1';
const STORE_VERSION = 1;

function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

// ── Seeds ─────────────────────────────────────────────────────────────
// First-run defaults — what a brand-new user sees.

const SEED_CHILDREN = [
  { id: 'child_sam',   name: 'Sam',   age: 7, color: 'routine' },
  { id: 'child_riley', name: 'Riley', age: 4, color: 'social' },
];

function seedMorningRoutine() {
  return {
    id: 'board_morning_demo',
    title: 'Morning Routine',
    childId: 'child_sam',
    category: 'routine',
    schedule: 'Weekdays · starts 7:00 AM',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 60000 * 8,
    steps: [
      { id: uid('s'), icon: 'sun',      title: 'Wake up',         time: '7:00',  duration: 5,  category: 'routine', note: 'Open the curtains and stretch.' },
      { id: uid('s'), icon: 'bathroom', title: 'Use the bathroom',time: '7:05',  duration: 5,  category: 'hygiene', note: 'Flush and wash hands after.' },
      { id: uid('s'), icon: 'tooth',    title: 'Brush teeth',     time: '7:10',  duration: 3,  category: 'hygiene', note: 'Two minutes — hum the song.' },
      { id: uid('s'), icon: 'shirt',    title: 'Get dressed',     time: '7:15',  duration: 10, category: 'routine', note: 'Clothes are laid out on the chair.' },
      { id: uid('s'), icon: 'bowl',     title: 'Eat breakfast',   time: '7:25',  duration: 15, category: 'food',    note: 'Choice: cereal or toast.' },
      { id: uid('s'), icon: 'backpack', title: 'Pack backpack',   time: '7:40',  duration: 5,  category: 'school',  note: 'Check: folder, water, snack.' },
      { id: uid('s'), icon: 'shoe',     title: 'Put on shoes',    time: '7:45',  duration: 3,  category: 'routine', note: 'Velcro first, then the other.' },
      { id: uid('s'), icon: 'wave',     title: 'Hug & go',        time: '7:50',  duration: 2,  category: 'social',  note: 'Big hug. See you at 3!' },
    ],
  };
}

function seedBedtime() {
  return {
    id: uid('board'),
    title: 'Bedtime Routine',
    childId: 'child_sam',
    category: 'routine',
    schedule: 'Every night · starts 7:30 PM',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000,
    steps: [
      { id: uid('s'), icon: 'bath',  title: 'Take a bath',     time: '7:30', duration: 15, category: 'hygiene', note: 'Warm water. Bubbles if you want.' },
      { id: uid('s'), icon: 'tooth', title: 'Brush teeth',     time: '7:50', duration: 3,  category: 'hygiene', note: 'Top, bottom, all around.' },
      { id: uid('s'), icon: 'shirt', title: 'Put on pajamas',  time: '7:55', duration: 5,  category: 'routine', note: 'On the bed in the basket.' },
      { id: uid('s'), icon: 'book',  title: 'Read a story',    time: '8:00', duration: 15, category: 'calm',    note: 'You pick the book.' },
      { id: uid('s'), icon: 'calm',  title: 'Quiet cuddles',   time: '8:15', duration: 5,  category: 'calm',    note: 'Slow breaths. I love you.' },
      { id: uid('s'), icon: 'bed',   title: 'Lights out',      time: '8:20', duration: 1,  category: 'routine', note: 'Goodnight!' },
    ],
  };
}

function freshState() {
  return {
    v: STORE_VERSION,
    children: SEED_CHILDREN,
    currentChildId: 'child_sam',
    boards: [seedMorningRoutine(), seedBedtime()],
    progress: {
      'board_morning_demo': { doneStepIds: [], updatedAt: Date.now() },
    },
  };
}

// ── Persistence ───────────────────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== STORE_VERSION) return freshState();
    // Be a little forgiving with missing fields
    return {
      v: STORE_VERSION,
      children: parsed.children?.length ? parsed.children : SEED_CHILDREN,
      currentChildId: parsed.currentChildId || parsed.children?.[0]?.id || 'child_sam',
      boards: parsed.boards || [],
      progress: parsed.progress || {},
    };
  } catch (e) {
    console.warn('Daybook: failed to load state, resetting.', e);
    return freshState();
  }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('Daybook: failed to save state.', e); }
}

// ── Context + hook ────────────────────────────────────────────────────
const StoreContext = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(loadState);

  // Persist on every change
  React.useEffect(() => { saveState(state); }, [state]);

  // ── Board operations ────────────────────────────────────────────────
  const api = React.useMemo(() => ({
    state,

    // Children
    setCurrentChild: (id) => setState((s) => ({ ...s, currentChildId: id })),
    addChild: (child) => setState((s) => ({
      ...s,
      children: [...s.children, { id: uid('child'), age: null, color: 'routine', ...child }],
    })),

    // Boards
    getBoard: (id) => state.boards.find((b) => b.id === id),

    createBoard: (template) => {
      const id = uid('board');
      const board = {
        id,
        title: template?.title || 'New board',
        childId: state.currentChildId,
        category: template?.category || 'routine',
        schedule: template?.schedule || '',
        createdAt: Date.now(), updatedAt: Date.now(),
        steps: (template?.steps || []).map((s) => ({ ...s, id: uid('s') })),
      };
      setState((s) => ({ ...s, boards: [board, ...s.boards] }));
      return id;
    },

    updateBoard: (id, patch) => setState((s) => ({
      ...s,
      boards: s.boards.map((b) => b.id === id ? { ...b, ...(typeof patch === 'function' ? patch(b) : patch), updatedAt: Date.now() } : b),
    })),

    deleteBoard: (id) => setState((s) => {
      const { [id]: _, ...remainingProgress } = s.progress;
      return {
        ...s,
        boards: s.boards.filter((b) => b.id !== id),
        progress: remainingProgress,
      };
    }),

    duplicateBoard: (id) => {
      const src = state.boards.find((b) => b.id === id);
      if (!src) return null;
      const nuId = uid('board');
      const copy = {
        ...src, id: nuId,
        title: src.title + ' (copy)',
        createdAt: Date.now(), updatedAt: Date.now(),
        steps: src.steps.map((s) => ({ ...s, id: uid('s') })),
      };
      setState((s) => ({ ...s, boards: [copy, ...s.boards] }));
      return nuId;
    },

    // Steps within a board
    addStep: (boardId, step, idx) => setState((s) => ({
      ...s,
      boards: s.boards.map((b) => {
        if (b.id !== boardId) return b;
        const nu = { id: uid('s'), icon: 'star', title: 'New step', time: '', duration: 5, category: b.category, note: '', ...step };
        const steps = [...b.steps];
        steps.splice(idx == null ? steps.length : idx, 0, nu);
        return { ...b, steps, updatedAt: Date.now() };
      }),
    })),

    updateStep: (boardId, stepId, patch) => setState((s) => ({
      ...s,
      boards: s.boards.map((b) => b.id !== boardId ? b : {
        ...b,
        steps: b.steps.map((st) => st.id === stepId ? { ...st, ...patch } : st),
        updatedAt: Date.now(),
      }),
    })),

    deleteStep: (boardId, stepId) => setState((s) => ({
      ...s,
      boards: s.boards.map((b) => b.id !== boardId ? b : {
        ...b, steps: b.steps.filter((st) => st.id !== stepId), updatedAt: Date.now(),
      }),
    })),

    duplicateStep: (boardId, stepId) => {
      let newStepId = null;
      setState((s) => ({
        ...s,
        boards: s.boards.map((b) => {
          if (b.id !== boardId) return b;
          const idx = b.steps.findIndex((st) => st.id === stepId);
          if (idx < 0) return b;
          const src = b.steps[idx];
          newStepId = uid('s');
          const copy = { ...src, id: newStepId };
          const steps = [...b.steps];
          steps.splice(idx + 1, 0, copy);
          return { ...b, steps, updatedAt: Date.now() };
        }),
      }));
      return newStepId;
    },

    reorderSteps: (boardId, fromIdx, toIdx) => setState((s) => ({
      ...s,
      boards: s.boards.map((b) => {
        if (b.id !== boardId) return b;
        const steps = [...b.steps];
        const [moved] = steps.splice(fromIdx, 1);
        if (!moved) return b;
        steps.splice(Math.max(0, Math.min(steps.length, toIdx)), 0, moved);
        return { ...b, steps, updatedAt: Date.now() };
      }),
    })),

    // Progress (used by child view)
    getProgress: (boardId) => state.progress[boardId] || { doneStepIds: [], updatedAt: 0 },
    setStepDone: (boardId, stepId, done) => setState((s) => {
      const cur = s.progress[boardId] || { doneStepIds: [], updatedAt: 0 };
      const set = new Set(cur.doneStepIds);
      done ? set.add(stepId) : set.delete(stepId);
      return { ...s, progress: { ...s.progress, [boardId]: { doneStepIds: [...set], updatedAt: Date.now() } } };
    }),
    resetProgress: (boardId) => setState((s) => ({
      ...s,
      progress: { ...s.progress, [boardId]: { doneStepIds: [], updatedAt: Date.now() } },
    })),

    // Whole-store
    resetAll: () => setState(freshState()),

    // Import a board (from share URL) — preserves steps verbatim but assigns
    // new ids so we don't collide with existing entries.
    importBoard: (board) => {
      const id = uid('board');
      const copy = {
        ...board, id,
        childId: state.currentChildId,
        createdAt: Date.now(), updatedAt: Date.now(),
        steps: (board.steps || []).map((s) => ({ ...s, id: uid('s') })),
      };
      setState((s) => ({ ...s, boards: [copy, ...s.boards] }));
      return id;
    },
  }), [state]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

function useStore() {
  const v = React.useContext(StoreContext);
  if (!v) throw new Error('useStore() outside of <StoreProvider>');
  return v;
}

// ── Share URL encode/decode ───────────────────────────────────────────
// Compact, URL-safe encoding: JSON → utf-8 → base64url. With ~8 steps and
// thumbnail URLs this fits in ~1.5–2KB of URL — well under the 8000-char
// limit browsers tolerate. We strip ids before encoding (importer assigns
// fresh ones) which also lops some bytes off.
function encodeBoardForShare(board) {
  const slim = {
    title: board.title, category: board.category, schedule: board.schedule,
    steps: board.steps.map((s) => ({
      icon: s.icon, title: s.title, time: s.time, duration: s.duration,
      category: s.category, note: s.note, photo: s.photo || undefined,
    })),
  };
  const json = JSON.stringify(slim);
  // base64url: standard base64 → url-safe alphabet, strip padding
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBoardFromShare(s) {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '==='.slice(0, (4 - b64.length % 4) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json);
  } catch { return null; }
}

Object.assign(window, {
  StoreProvider, StoreContext, useStore,
  encodeBoardForShare, decodeBoardFromShare,
});
