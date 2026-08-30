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
// Bumped to 2 — the v1 seed shipped with two example children (Sam, Riley).
// Bumping invalidates that cached state so returning users come back to a
// clean slate matching the v2 seed.
const STORE_VERSION = 2;

function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

// ── Seeds ─────────────────────────────────────────────────────────────
// First-run defaults — what a brand-new user sees.

// No seed children — users add their own from the top-nav child picker.
const SEED_CHILDREN = [];

function seedMorningRoutine() {
  return {
    id: 'board_morning_demo',
    title: 'Morning Routine',
    childId: null,
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
    id: 'board_bedtime_demo',
    title: 'Bedtime Routine',
    childId: null,
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
    currentChildId: null,
    boards: [seedMorningRoutine(), seedBedtime()],
    progress: {
      'board_morning_demo': { doneStepIds: [], updatedAt: Date.now() },
    },
    // User uploads — kept as data URLs so they persist offline. We cap the
    // count (newest-first) to keep localStorage under the ~5MB browser limit.
    uploads: [],
  };
}

const MAX_UPLOADS = 24;

// ── Persistence ───────────────────────────────────────────────────────
// Be a little forgiving with missing fields — used for both the localStorage
// cache and the cloud (Supabase) copy.
function normalizeState(parsed) {
  return {
    v: STORE_VERSION,
    children: parsed.children || [],
    currentChildId: parsed.currentChildId || parsed.children?.[0]?.id || null,
    boards: parsed.boards || [],
    progress: parsed.progress || {},
    uploads: parsed.uploads || [],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== STORE_VERSION) return freshState();
    return normalizeState(parsed);
  } catch (e) {
    console.warn('KindCue: failed to load state, resetting.', e);
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
  const { user, ready } = useAuth();
  const [state, setState] = React.useState(loadState);
  // Cloud sync indicator: idle | loading | saving | saved | error
  const [syncStatus, setSyncStatus] = React.useState('idle');

  // localStorage is always the offline cache — logged in or not.
  React.useEffect(() => { saveState(state); }, [state]);

  // ── Cloud sync (Supabase) ───────────────────────────────────────────
  // One row per user in `user_state` holds the whole store as JSON.
  const loadedUserRef = React.useRef(null); // which user's row is loaded
  const hydratingRef = React.useRef(false);  // skip the save that a hydrate triggers
  const [cloudReady, setCloudReady] = React.useState(false); // gate saves until load finishes

  // Login / logout: hydrate from the cloud (or seed it), or clear on sign-out.
  React.useEffect(() => {
    if (!ready || !window.sb) return;
    const uid = user ? user.id : null;
    const prev = loadedUserRef.current;
    if (uid === prev) return;
    loadedUserRef.current = uid;
    setCloudReady(false);

    if (!uid) {
      // Signed out — clear to a fresh slate so the next person on this
      // device doesn't see the previous account's routines.
      if (prev) { hydratingRef.current = true; setState(freshState()); }
      setSyncStatus('idle');
      return;
    }

    let cancelled = false;
    (async () => {
      setSyncStatus('loading');
      try {
        const { data, error } = await window.sb
          .from('user_state').select('data').eq('user_id', uid).maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        if (data && data.data && data.data.v) {
          hydratingRef.current = true;
          setState(normalizeState(data.data));
        } else {
          // First sign-in: push whatever is on this device up as the seed.
          const seed = loadState();
          const { error: upErr } = await window.sb.from('user_state')
            .upsert({ user_id: uid, data: seed, updated_at: new Date().toISOString() });
          if (upErr) throw upErr;
          hydratingRef.current = true;
        }
        if (!cancelled) { setSyncStatus('saved'); setCloudReady(true); }
      } catch (e) {
        console.warn('KindCue: cloud load failed', e);
        if (!cancelled) setSyncStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [ready, user]);

  // Debounced push to the cloud on any change (only while signed in).
  React.useEffect(() => {
    if (!ready || !user || !window.sb || !cloudReady) return;
    if (hydratingRef.current) { hydratingRef.current = false; return; }
    const t = setTimeout(async () => {
      setSyncStatus('saving');
      try {
        const { error } = await window.sb.from('user_state')
          .upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() });
        if (error) throw error;
        setSyncStatus('saved');
      } catch (e) {
        console.warn('KindCue: cloud save failed', e);
        setSyncStatus('error');
      }
    }, 800);
    return () => clearTimeout(t);
  }, [state, user, ready, cloudReady]);

  // ── Board operations ────────────────────────────────────────────────
  const api = React.useMemo(() => ({
    state,
    syncStatus,

    // Children
    setCurrentChild: (id) => setState((s) => ({ ...s, currentChildId: id })),
    addChild: (child) => setState((s) => {
      const newChild = { id: uid('child'), age: null, color: 'routine', ...child };
      return {
        ...s,
        children: [...s.children, newChild],
        // First child added becomes the current selection automatically.
        currentChildId: s.currentChildId || newChild.id,
      };
    }),

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
      return board;
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
      progress: { ...s.progress, [boardId]: { doneStepIds: [], mood: null, updatedAt: Date.now() } },
    })),

    // Mood check-in (child view). Stored alongside progress so a caregiver
    // can see how the child arrived at the routine.
    setMood: (boardId, mood) => setState((s) => {
      const cur = s.progress[boardId] || { doneStepIds: [], updatedAt: 0 };
      return { ...s, progress: { ...s.progress, [boardId]: { ...cur, mood, updatedAt: Date.now() } } };
    }),

    // Streak tracking — a day-key log of full completions, separate from
    // doneStepIds (which resets every run). Dedupes same-day calls.
    logCompletion: (boardId) => setState((s) => {
      const cur = s.progress[boardId] || { doneStepIds: [], updatedAt: 0 };
      const today = dayKey(Date.now());
      const completions = cur.completions || [];
      if (completions[completions.length - 1] === today) return s;
      return { ...s, progress: { ...s.progress, [boardId]: { ...cur, completions: [...completions, today] } } };
    }),

    // Whole-store
    resetAll: () => setState(freshState()),
    restoreBackup: (data) => setState(normalizeState(data)),

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

    // ── Uploads ─────────────────────────────────────────────────────
    // Store a data-URL upload so it can be picked as a step image. We
    // newest-first cap the list to MAX_UPLOADS so a long photo library
    // doesn't blow localStorage. Returns the stored upload record.
    addUpload: (file, dataURL) => {
      const upload = {
        id: uid('up'),
        title: (file.name || 'Photo').replace(/\.[^.]+$/, ''),
        src: 'uploaded',
        thumb: dataURL,
        full: dataURL,
        descriptionUrl: null,
        license: 'Your photo',
        artist: 'You',
        w: 0, h: 0,
        addedAt: Date.now(),
      };
      setState((s) => ({
        ...s,
        uploads: [upload, ...(s.uploads || [])].slice(0, MAX_UPLOADS),
      }));
      return upload;
    },
    removeUpload: (id) => setState((s) => ({
      ...s, uploads: (s.uploads || []).filter((u) => u.id !== id),
    })),
  }), [state, syncStatus]);

  // One-time per session: if the two starter demo boards are still on their
  // default line icons — a fresh install, or one that hasn't been online
  // yet — fetch real ARASAAC pictures for them in the background. Once a
  // board's steps have photos this is a no-op, so it's safe to check every
  // mount.
  const seededPicsRef = React.useRef(false);
  React.useEffect(() => {
    if (seededPicsRef.current) return;
    seededPicsRef.current = true;
    ['board_morning_demo', 'board_bedtime_demo'].forEach((bid) => {
      const b = api.getBoard(bid);
      if (b && b.steps.some((s) => !s.photo) && window.hydrateStepsPictograms) {
        window.hydrateStepsPictograms(api, bid, b.steps);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    reward: board.reward || undefined,
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

// ── Streak + time helpers ─────────────────────────────────────────────
// Steps store a plain "H:MM" string with no AM/PM marker — we infer it
// from the board's schedule text (e.g. "starts 7:30 PM"), the only place
// that context lives, defaulting to a literal reading otherwise. Shared by
// the calendar export and step-time reminders.
function dayKey(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function computeStreak(completions) {
  if (!completions || !completions.length) return 0;
  const days = new Set(completions);
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
function parseStepTime(timeStr, scheduleStr) {
  if (!timeStr) return null;
  const m = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 12 && /\bpm\b/i.test(scheduleStr || '')) h += 12;
  return { h, m: min };
}

Object.assign(window, {
  StoreProvider, StoreContext, useStore,
  encodeBoardForShare, decodeBoardFromShare,
  dayKey, computeStreak, parseStepTime,
});
