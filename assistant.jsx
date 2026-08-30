// assistant.jsx — "KindCue Assistant": a small in-browser AI helper that
// operates the app (create/edit boards & steps, open/start routines) via
// validated structured actions. Runs entirely on-device via WebLLM —
// lazy-loaded only when the caregiver opts in, cached as one singleton
// engine instance for the rest of the session. Never runs model output as
// code — every action is parsed, whitelisted, and dispatched through the
// existing store/router functions.

const ASSISTANT_MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
const WEBLLM_CDN = 'https://esm.run/@mlc-ai/web-llm@0.2.79';

// ── Tool whitelist ────────────────────────────────────────────────────
// Every field the model is allowed to send, per tool. Anything else in a
// model response is ignored; a tool name outside this list is rejected.
const TOOLS = {
  create_board:   { required: ['title'], optional: ['category', 'schedule'] },
  add_step:       { required: ['title'], optional: ['boardId', 'boardTitle', 'category', 'icon', 'time', 'duration', 'note'] },
  edit_step:      { required: [],        optional: ['boardId', 'boardTitle', 'stepId', 'stepTitle', 'title', 'category', 'icon', 'time', 'duration', 'note'] },
  delete_step:    { required: [],        optional: ['boardId', 'boardTitle', 'stepId', 'stepTitle'] },
  move_step:      { required: ['toIndex'], optional: ['boardId', 'boardTitle', 'stepId', 'stepTitle'] },
  rename_board:   { required: ['title'], optional: ['boardId', 'boardTitle'] },
  assign_child:   { required: [],        optional: ['boardId', 'boardTitle', 'childId', 'childName'] },
  open_board:     { required: [],        optional: ['boardId', 'boardTitle'] },
  start_routine:  { required: [],        optional: ['boardId', 'boardTitle'] },
};

function extractJSON(text) {
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

function resolveBoard(store, route, args) {
  if (args.boardId) { const b = store.getBoard(args.boardId); if (b) return b; }
  if (args.boardTitle) {
    const t = String(args.boardTitle).toLowerCase();
    const found = store.state.boards.find((b) => b.title.toLowerCase().includes(t));
    if (found) return found;
  }
  if (route?.params?.boardId) return store.getBoard(route.params.boardId);
  return null;
}

function resolveStep(board, args) {
  if (!board) return null;
  if (args.stepId) { const s = board.steps.find((st) => st.id === args.stepId); if (s) return s; }
  if (args.stepTitle) {
    const t = String(args.stepTitle).toLowerCase();
    return board.steps.find((st) => st.title.toLowerCase().includes(t)) || null;
  }
  return null;
}

// Runs one validated tool call against the real store/router. Never
// executes model-provided code — only known store methods with checked args.
function runTool(name, args, ctx) {
  const { store, navigate } = ctx;
  const cats = Object.keys(CATEGORIES);
  const cleanCat = (c) => cats.includes(c) ? c : undefined;

  switch (name) {
    case 'create_board': {
      const board = store.createBoard({ title: args.title, category: cleanCat(args.category) || 'routine', schedule: args.schedule || '' });
      navigate('/b/' + board.id);
      return { ok: true, message: 'Created "' + board.title + '". Opening it now.' };
    }
    case 'add_step': {
      const board = resolveBoard(store, ctx.route, args);
      if (!board) return { ok: false, message: "I need to know which board — say its name or open it first." };
      store.addStep(board.id, {
        title: args.title, category: cleanCat(args.category) || board.category,
        icon: args.icon || undefined, time: args.time || '', duration: args.duration ? Number(args.duration) : 5,
        note: args.note || '',
      });
      return { ok: true, message: 'Added "' + args.title + '" to ' + board.title + '.' };
    }
    case 'edit_step': {
      const board = resolveBoard(store, ctx.route, args);
      const step = resolveStep(board, args);
      if (!board || !step) return { ok: false, message: "I couldn't find that step." };
      const patch = {};
      if (args.title) patch.title = args.title;
      if (cleanCat(args.category)) patch.category = args.category;
      if (args.icon) patch.icon = args.icon;
      if (args.time) patch.time = args.time;
      if (args.duration) patch.duration = Number(args.duration);
      if (args.note != null) patch.note = args.note;
      store.updateStep(board.id, step.id, patch);
      return { ok: true, message: 'Updated "' + step.title + '".' };
    }
    case 'delete_step': {
      const board = resolveBoard(store, ctx.route, args);
      const step = resolveStep(board, args);
      if (!board || !step) return { ok: false, message: "I couldn't find that step to delete." };
      store.deleteStep(board.id, step.id);
      return { ok: true, message: 'Deleted "' + step.title + '".' };
    }
    case 'move_step': {
      const board = resolveBoard(store, ctx.route, args);
      const step = resolveStep(board, args);
      if (!board || !step) return { ok: false, message: "I couldn't find that step to move." };
      const fromIdx = board.steps.findIndex((s) => s.id === step.id);
      const toIdx = Math.max(0, Math.min(board.steps.length - 1, Number(args.toIndex)));
      store.reorderSteps(board.id, fromIdx, toIdx);
      return { ok: true, message: 'Moved "' + step.title + '".' };
    }
    case 'rename_board': {
      const board = resolveBoard(store, ctx.route, args);
      if (!board) return { ok: false, message: "I need to know which board to rename." };
      store.updateBoard(board.id, { title: args.title });
      return { ok: true, message: 'Renamed it to "' + args.title + '".' };
    }
    case 'assign_child': {
      const board = resolveBoard(store, ctx.route, args);
      if (!board) return { ok: false, message: "I need to know which board." };
      let child = null;
      if (args.childId) child = store.state.children.find((c) => c.id === args.childId);
      if (!child && args.childName) {
        const t = String(args.childName).toLowerCase();
        child = store.state.children.find((c) => c.name.toLowerCase().includes(t));
      }
      if (!child) return { ok: false, message: "I couldn't find that child." };
      store.updateBoard(board.id, { childId: child.id });
      return { ok: true, message: 'Assigned "' + board.title + '" to ' + child.name + '.' };
    }
    case 'open_board': {
      const board = resolveBoard(store, ctx.route, args);
      if (!board) return { ok: false, message: "I couldn't find that board." };
      navigate('/b/' + board.id);
      return { ok: true, message: 'Opening "' + board.title + '".' };
    }
    case 'start_routine': {
      const board = resolveBoard(store, ctx.route, args);
      if (!board) return { ok: false, message: "I couldn't find that board to start." };
      navigate('/b/' + board.id + '/preview');
      return { ok: true, message: 'Starting "' + board.title + '".' };
    }
    default:
      return { ok: false, message: "I can only help operate KindCue — create boards, add or edit steps, rename, assign a child, open, or start a routine." };
  }
}

function buildSystemPrompt(ctx) {
  const { store, route } = ctx;
  const cats = Object.keys(CATEGORIES).join(', ');
  const board = route?.params?.boardId ? store.getBoard(route.params.boardId) : null;
  const boardsList = store.state.boards.slice(0, 12).map((b) => '- ' + b.id + ': "' + b.title + '"').join('\n') || 'none';
  const childrenList = store.state.children.map((c) => '- ' + c.id + ': ' + c.name).join('\n') || 'none';
  const currentBoardBlock = board
    ? 'Current open board: "' + board.title + '" (id ' + board.id + '), steps:\n' +
      board.steps.map((s, i) => (i + 1) + '. "' + s.title + '" (id ' + s.id + ', category ' + s.category + ')').join('\n')
    : 'No board currently open.';

  return [
    'You are the KindCue Assistant, embedded in a visual-schedule app for caregivers.',
    'You ONLY operate the app — you never chat generally, give advice, or discuss anything else.',
    'Respond with EXACTLY one JSON object and nothing else — no markdown, no explanation, no code.',
    'Shape: {"tool":"<name>","arguments":{...}}',
    'Valid tools and arguments:',
    '- create_board {title, category?, schedule?}',
    '- add_step {title, boardTitle?, category?, time?, duration?, note?}',
    '- edit_step {stepTitle, boardTitle?, title?, category?, time?, duration?, note?}',
    '- delete_step {stepTitle, boardTitle?}',
    '- move_step {stepTitle, toIndex, boardTitle?}',
    '- rename_board {title, boardTitle?}',
    '- assign_child {childName, boardTitle?}',
    '- open_board {boardTitle}',
    '- start_routine {boardTitle}',
    'Valid categories: ' + cats + '.',
    'If the request is unrelated to operating the app, or you are unsure, respond with {"tool":"none","arguments":{}}.',
    currentBoardBlock,
    'All boards:\n' + boardsList,
    'Children:\n' + childrenList,
  ].join('\n');
}

// ── WebLLM engine (lazy singleton) ────────────────────────────────────
let enginePromise = null;
async function getEngine(onProgress) {
  if (!enginePromise) {
    enginePromise = (async () => {
      const webllm = await import(WEBLLM_CDN);
      return webllm.CreateMLCEngine(ASSISTANT_MODEL_ID, { initProgressCallback: onProgress });
    })();
  }
  return enginePromise;
}

function webgpuSupported() {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}

// ── UI ─────────────────────────────────────────────────────────────────
function AssistantIcon(p) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6" y="9" width="20" height="15" rx="4" />
      <circle cx="12.5" cy="16.5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="16.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M16 9 V5 M13 5 H19" />
      <path d="M3 15 V19 M29 15 V19" />
    </svg>
  );
}

function MicIcon(p) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="12" y="4" width="8" height="16" rx="4" />
      <path d="M8 15 a8 8 0 0 0 16 0" />
      <path d="M16 23 V28 M11 28 H21" />
    </svg>
  );
}

function AssistantWidget({ store, navigate, route }) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('idle'); // idle | loading | ready | unsupported | error
  const [progress, setProgress] = React.useState({ pct: 0, text: '' });
  const [messages, setMessages] = React.useState([]); // {role, text}
  const [input, setInput] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const engineRef = React.useRef(null);
  const logRef = React.useRef(null);
  const [voicePhase, setVoicePhase] = React.useState(null); // null | listening | transcribing
  const mediaRecorderRef = React.useRef(null);
  const chunksRef = React.useRef([]);
  const voiceOk = typeof window !== 'undefined' && window.KindCueSTT && window.KindCueSTT.voiceSupported();

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, open]);

  const enable = async () => {
    if (!webgpuSupported()) { setStatus('unsupported'); return; }
    setStatus('loading');
    try {
      const engine = await getEngine((p) => setProgress({ pct: Math.round((p.progress || 0) * 100), text: p.text || '' }));
      engineRef.current = engine;
      setStatus('ready');
      setMessages([{ role: 'assistant', text: 'Ready. Try: "add a step called Brush hair" or "start the morning routine".' }]);
    } catch (e) {
      console.error('KindCue Assistant: failed to load model.', e);
      setStatus('error');
    }
  };

  const send = async (textArg, fromVoice) => {
    const text = (textArg != null ? textArg : input).trim();
    if (!text || busy || !engineRef.current) return;
    if (!fromVoice) setInput('');
    setBusy(true);
    setMessages((m) => [...m, { role: 'user', text }]);
    try {
      const ctx = { store, navigate, route };
      const system = buildSystemPrompt(ctx);
      const res = await engineRef.current.chat.completions.create({
        messages: [{ role: 'system', content: system }, { role: 'user', content: text }],
        temperature: 0,
        max_tokens: 200,
      });
      const raw = res.choices?.[0]?.message?.content || '';
      const jsonStr = extractJSON(raw);
      let reply;
      if (!jsonStr) {
        reply = "I didn't catch a valid action — try rephrasing.";
      } else {
        let parsed;
        try { parsed = JSON.parse(jsonStr); } catch { parsed = null; }
        if (!parsed || typeof parsed.tool !== 'string') {
          reply = "I didn't catch a valid action — try rephrasing.";
        } else if (parsed.tool === 'none') {
          reply = "I can only help operate KindCue — create boards, add or edit steps, rename, assign a child, open, or start a routine.";
        } else if (!TOOLS[parsed.tool]) {
          reply = "That's not something I can do yet.";
        } else {
          const args = (parsed.arguments && typeof parsed.arguments === 'object') ? parsed.arguments : {};
          const missing = TOOLS[parsed.tool].required.filter((k) => args[k] == null || args[k] === '');
          if (missing.length) {
            reply = 'I need ' + missing.join(', ') + ' for that.';
          } else {
            const result = runTool(parsed.tool, args, ctx);
            reply = result.message;
          }
        }
      }
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
      if (fromVoice) {
        setVoicePhase('speaking');
        window.KindCueTTS.speakStep(reply, { onEnd: () => setVoicePhase(null) });
      }
    } catch (e) {
      console.error('KindCue Assistant: generation failed.', e);
      setMessages((m) => [...m, { role: 'assistant', text: "Something went wrong generating a response." }]);
      if (fromVoice) setVoicePhase(null);
    } finally {
      setBusy(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setVoicePhase('transcribing');
        try {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
          const text = await window.KindCueSTT.transcribeBlob(blob);
          setVoicePhase(null);
          if (text) await send(text, true);
        } catch (e) {
          console.error('KindCue Assistant: transcription failed.', e);
          setVoicePhase(null);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setVoicePhase('listening');
    } catch (e) {
      console.error('KindCue Assistant: microphone access failed.', e);
      setVoicePhase(null);
    }
  };

  const micClick = () => {
    if (voicePhase === 'listening') { mediaRecorderRef.current?.stop(); return; }
    if (voicePhase === 'transcribing' || busy) return;
    window.KindCueTTS.stopSpeaking(); // mic while Kokoro is speaking: stop speech, start listening
    startRecording();
  };

  return (
    <>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label="KindCue Assistant"
              style={{
                position: 'fixed', right: 18, bottom: 70, zIndex: 2147483644,
                appearance: 'none', border: 0, cursor: 'pointer',
                width: 46, height: 46, borderRadius: '50%',
                background: 'var(--sage-deep)', color: '#fff',
                display: 'grid', placeItems: 'center',
                boxShadow: '0 8px 24px rgba(20,18,14,.25)',
              }}>
        <AssistantIcon style={{ width: 22, height: 22 }} />
      </button>

      {open && (
        <div style={{
          position: 'fixed', right: 18, bottom: 122, zIndex: 2147483643,
          width: 'min(92vw, 340px)', maxHeight: '70vh',
          background: 'var(--paper)', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(20,18,14,.28)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--hairline)',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--sage-soft)', color: 'var(--sage-deep)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <AssistantIcon style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>KindCue Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Runs on this device</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="btn btn--ghost btn--icon" aria-label="Close">
              <IconClose style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {status === 'idle' && (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                A small on-device assistant that can create boards, add or edit steps, and open or start routines for you — nothing leaves your device.
              </div>
              <button type="button" onClick={enable} className="btn btn--primary" style={{ height: 38 }}>Enable AI assistant</button>
            </div>
          )}

          {status === 'loading' && (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Downloading the on-device model — this happens once and is cached.</div>
              <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-tint)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: progress.pct + '%', background: 'var(--sage-deep)', transition: 'width .2s' }} />
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{progress.text || (progress.pct + '%')}</div>
            </div>
          )}

          {status === 'unsupported' && (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--ink-2)' }}>
              This browser/device can't run the on-device assistant (needs WebGPU). Everything else in KindCue still works normally.
            </div>
          )}

          {status === 'error' && (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Couldn't load the assistant. You can try again.</div>
              <button type="button" onClick={enable} className="btn btn--soft" style={{ height: 36 }}>Retry</button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <div ref={logRef} style={{ flex: 1, minHeight: 160, maxHeight: '42vh', overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%', padding: '8px 12px', borderRadius: 12,
                    fontSize: 13, lineHeight: 1.4,
                    background: m.role === 'user' ? 'var(--sage-deep)' : 'var(--bg-tint)',
                    color: m.role === 'user' ? '#fff' : 'var(--ink)',
                  }}>{m.text}</div>
                ))}
                {busy && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Thinking…</div>}
              </div>
              {voicePhase && (
                <div style={{ padding: '0 14px 8px', fontSize: 12, fontWeight: 700, color: 'var(--sage-deep)' }}>
                  {voicePhase === 'listening' ? 'Listening…' : voicePhase === 'transcribing' ? 'Transcribing…' : 'Speaking…'}
                </div>
              )}
              <div style={{ padding: 12, borderTop: '1px solid var(--hairline)', display: 'flex', gap: 8 }}>
                {voiceOk && (
                  <button type="button" onClick={micClick}
                          disabled={voicePhase === 'transcribing' || busy}
                          title={voicePhase === 'listening' ? 'Stop and send' : 'Speak to the assistant'}
                          className="btn btn--icon"
                          style={{
                            height: 38, width: 38, flexShrink: 0,
                            background: voicePhase === 'listening' ? 'var(--cat-food)' : 'var(--bg-tint)',
                            color: voicePhase === 'listening' ? '#fff' : 'var(--ink)',
                          }}>
                    <MicIcon style={{ width: 16, height: 16 }} />
                  </button>
                )}
                <input value={input} onChange={(e) => setInput(e.target.value)}
                       onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                       placeholder="e.g. add a step called Brush hair"
                       style={{ flex: 1, minWidth: 0, height: 38, padding: '0 12px', border: '1px solid var(--hairline)', borderRadius: 10, background: 'var(--paper)', fontFamily: 'inherit', fontSize: 13, outline: 'none' }} />
                <button type="button" onClick={() => send()} disabled={busy || !input.trim()} className="btn btn--primary" style={{ height: 38 }}>Send</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

Object.assign(window, { AssistantWidget });
