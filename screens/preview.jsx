// screens/preview.jsx — child-facing "run the routine" view
//
// Modes:
//   • Steps      — one big card at a time, with a visual countdown timer
//   • First→Then — the classic two-card support: what's now, what's next
//
// Extras: a feelings check-in before starting, a star/reward tracker that
// fills as steps are finished, "Read to me" speech, and a confetti
// celebration when every step is done.

function PreviewScreen({ route, navigate }) {
  const store = useStore();
  const boardId = route.params.boardId;
  const board = store.getBoard(boardId);

  const [idx, setIdx] = React.useState(0);
  const [mode, setMode] = React.useState('steps'); // steps | firstThen
  const [showFeelings, setShowFeelings] = React.useState(false);
  const [switchScanning, setSwitchScanning] = React.useState(() => localStorage.getItem('kindcue.switchScanning') === '1');
  React.useEffect(() => { localStorage.setItem('kindcue.switchScanning', switchScanning ? '1' : '0'); }, [switchScanning]);

  // Initial position: first un-done step. Also decide whether to show the
  // feelings check-in (only on a fresh run — nothing done, no mood yet).
  React.useEffect(() => {
    if (!board) return;
    const p = store.getProgress(board.id);
    const doneSet = new Set(p.doneStepIds);
    const next = board.steps.findIndex((s) => !doneSet.has(s.id));
    setIdx(next >= 0 ? next : 0);
    setShowFeelings(p.doneStepIds.length === 0 && !p.mood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  // Everything below is computed defensively (board may still be null, or
  // have zero steps) — hooks must run unconditionally, in the same order,
  // every render, so the "not found" / "no steps" views can only be
  // returned further down, after all hooks are declared.
  const steps = board?.steps || [];
  const step = steps[idx] || steps[0];
  const cat = CATEGORIES[step?.category] || CATEGORIES.routine;
  const progress = board ? store.getProgress(board.id) : { doneStepIds: [], updatedAt: 0 };
  const doneSet = new Set(progress.doneStepIds);
  const doneCount = progress.doneStepIds.length;
  const allDone = steps.length > 0 && steps.every((s) => doneSet.has(s.id));
  const reward = board?.reward || null;
  const goal = reward?.goal || steps.length;
  const child = board ? store.state.children.find((c) => c.id === board.childId) : null;
  const streak = computeStreak(progress.completions);

  const markDoneAndAdvance = () => {
    if (!board || !step) return;
    store.setStepDone(board.id, step.id, true);
    setIdx((i) => Math.min(steps.length - 1, i + 1));
  };
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const reset = () => { if (!board) return; store.resetProgress(board.id); setIdx(0); setShowFeelings(true); };

  // Kokoro TTS (in-browser), falls back to the browser's speechSynthesis
  // automatically if Kokoro can't load — see tts.jsx.
  const [ttsBusy, setTtsBusy] = React.useState(false);
  const speak = (s = step) => {
    if (!s) return;
    const text = s.note ? s.title + '. ' + s.note : s.title;
    setTtsBusy(true);
    window.KindCueTTS.speakStep(text, {
      onStart: () => setTtsBusy(false),
      onEnd: () => setTtsBusy(false),
    });
  };

  // Log a completion (for the streak) the moment every step is done.
  React.useEffect(() => {
    if (board && allDone) store.logCompletion(board.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, board?.id]);

  // ── Switch-access scanning ──────────────────────────────────────────
  // Cycles a highlight through the available actions; any tap/click or a
  // Space/Enter press activates whichever one is lit — the standard
  // single-switch AAC access pattern for kids who use one external switch
  // instead of pointing at a specific button. Off by default; a caregiver
  // flips it on per-device from the header.
  const scanTargets = React.useMemo(() => {
    if (!board || steps.length === 0) return [];
    if (allDone) return ['again', 'editback'];
    if (mode !== 'steps') return [];
    const list = ['speak'];
    if (idx > 0) list.push('prev');
    list.push('done');
    if (idx < steps.length - 1) list.push('next');
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, allDone, mode, idx, steps.length]);

  const [scanTick, setScanTick] = React.useState(0);
  React.useEffect(() => {
    setScanTick(0);
    if (!switchScanning || !scanTargets.length) return;
    const t = setInterval(() => setScanTick((v) => (v + 1) % scanTargets.length), 1600);
    return () => clearInterval(t);
  }, [switchScanning, scanTargets.length, idx, mode]);
  const scanKey = switchScanning && scanTargets.length ? scanTargets[scanTick % scanTargets.length] : null;
  const scanRing = (key) => scanKey === key
    ? { boxShadow: '0 0 0 4px rgba(255,255,255,.95), 0 0 0 8px var(--sage-deep)', transform: 'scale(1.07)' }
    : null;
  const activateScan = () => {
    const key = scanTargets[scanTick % scanTargets.length];
    if (key === 'speak') speak();
    else if (key === 'prev') prev();
    else if (key === 'done') markDoneAndAdvance();
    else if (key === 'next') setIdx((i) => Math.min(steps.length - 1, i + 1));
    else if (key === 'again') reset();
    else if (key === 'editback' && board) navigate('/b/' + board.id);
  };

  React.useEffect(() => {
    const onKey = (e) => {
      if (showFeelings || !board) return;
      if (switchScanning) {
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); activateScan(); }
        return;
      }
      if (allDone || mode !== 'steps') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setIdx((i) => Math.min(steps.length - 1, i + 1)); }
      else if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); markDoneAndAdvance(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchScanning, scanTick, scanTargets, showFeelings, allDone, mode, idx, steps.length, board?.id]);

  if (!board) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div className="h1">Board not found</div>
        <button className="btn btn--primary btn--lg" type="button" onClick={() => navigate('/library')}
                style={{ marginTop: 16 }}>
          Back to my boards
        </button>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div className="h1" style={{ marginBottom: 8 }}>This board has no steps yet</div>
        <div className="meta" style={{ marginBottom: 20 }}>Add some in the builder, then come back.</div>
        <button className="btn btn--primary btn--lg" type="button" onClick={() => navigate('/b/' + board.id)}>
          Open builder
        </button>
      </div>
    );
  }

  const isDone = doneSet.has(step.id);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh', minHeight: '100dvh',
      background: cat.bg,
      transition: 'background .4s',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`@keyframes popIn{0%{transform:scale(.96)}100%{transform:scale(1)}}`}</style>

      <Confetti fire={allDone} />

      {switchScanning && scanTargets.length > 0 && !showFeelings && (
        <div onClick={activateScan}
             title="Tap anywhere to choose the highlighted button"
             style={{ position: 'fixed', inset: 0, zIndex: 500, cursor: 'pointer' }} />
      )}

      {/* Feelings check-in overlay */}
      {showFeelings && !allDone && (
        <FeelingsCheckIn
          childName={child?.name}
          catInk={cat.ink} catBg={cat.bg}
          onPick={(mood) => { store.setMood(board.id, mood); setShowFeelings(false); }}
          onSkip={() => setShowFeelings(false)} />
      )}

      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 24px', flexWrap: 'wrap',
      }}>
        <button type="button" onClick={() => navigate('/b/' + board.id)}
                style={previewButtonStyle(cat.ink)}>
          <IconArrowL /> Back to edit
        </button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999,
            background: 'rgba(255,255,255,.7)', color: cat.ink,
            fontWeight: 700, fontSize: 14, maxWidth: '60vw',
          }}>
            <Icon name={steps[0]?.icon || 'sun'} style={{ width: 18, height: 18 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {board.title}{child ? ' · ' + child.name : ''}
            </span>
          </div>
        </div>

        {/* Star tally */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,.7)', color: cat.ink,
          fontWeight: 700, fontSize: 14,
        }} title={doneCount + ' of ' + goal + ' stars'}>
          <IconStar style={{ width: 18, height: 18 }} />
          {Math.min(doneCount, goal)}<span style={{ opacity: .5 }}>/{goal}</span>
        </div>

        {streak >= 2 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,.7)', color: cat.ink,
            fontWeight: 700, fontSize: 14,
          }} title={streak + '-day streak'}>
            <IconFlame style={{ width: 18, height: 18 }} />
            {streak}-day streak!
          </div>
        )}

        <button type="button" onClick={() => setSwitchScanning((v) => !v)}
                title="Switch-access scanning: highlights one button at a time — any tap or Space selects it"
                style={{
                  ...previewButtonStyle(cat.ink),
                  background: switchScanning ? cat.ink : 'rgba(255,255,255,.7)',
                  color: switchScanning ? '#fff' : cat.ink,
                }}>
          <IconScan style={{ width: 16, height: 16 }} /> {switchScanning ? 'Scanning on' : 'Scanning'}
        </button>

        <button type="button" onClick={() => speak()} disabled={ttsBusy} style={{ ...previewButtonStyle(cat.ink), ...(scanRing('speak') || {}), ...(ttsBusy ? { opacity: .7, cursor: 'wait' } : null) }}>
          <IconSpeaker /> {ttsBusy ? 'Loading…' : 'Read to me'}
        </button>
      </header>

      {/* Mode toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{
          display: 'flex', gap: 4, padding: 4, borderRadius: 999,
          background: 'rgba(255,255,255,.55)',
        }}>
          {[
            { id: 'steps', label: 'Steps', icon: <IconGrid style={{ width: 14, height: 14 }} /> },
            { id: 'firstThen', label: 'First → Then', icon: <IconArrowR style={{ width: 14, height: 14 }} /> },
          ].map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} type="button" onClick={() => setMode(m.id)}
                      style={{
                        appearance: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        height: 38, padding: '0 18px', borderRadius: 999,
                        background: on ? '#fff' : 'transparent',
                        color: cat.ink, fontWeight: 700, fontSize: 14,
                        boxShadow: on ? '0 2px 8px rgba(48,40,20,.12)' : 'none',
                        transition: 'background .15s',
                      }}>
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reward bar — only when a reward goal is configured */}
      {reward && !allDone && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 24px 0' }}>
          <RewardBar doneCount={doneCount} goal={goal} label={reward.label} catInk={cat.ink} />
        </div>
      )}

      {/* Progress dots */}
      {mode === 'steps' && !allDone && (
        <div style={{ padding: '14px 24px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '10px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,.55)', backdropFilter: 'blur(6px)',
            maxWidth: '90vw', overflowX: 'auto',
          }}>
            {steps.map((s, i) => {
              const stepDone = doneSet.has(s.id);
              const isCurr = i === idx;
              const c = CATEGORIES[s.category] || CATEGORIES.routine;
              return (
                <button key={s.id} type="button" onClick={() => setIdx(i)} title={s.title}
                        style={{
                          width: isCurr ? 44 : 36, height: isCurr ? 44 : 36, borderRadius: '50%',
                          background: stepDone ? c.ink : isCurr ? '#fff' : 'rgba(255,255,255,.55)',
                          color: stepDone ? '#fff' : c.ink,
                          border: isCurr ? `2px solid ${c.ink}` : '0',
                          display: 'grid', placeItems: 'center',
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all .25s', flexShrink: 0,
                        }}>
                  {stepDone
                    ? <IconCheck style={{ width: 18, height: 18 }} />
                    : <Icon name={s.icon} style={{ width: isCurr ? 22 : 18, height: isCurr ? 22 : 18 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, padding: '28px 24px', display: 'grid', placeItems: 'center' }}>
        {allDone ? (
          <AllDoneCard catInk={cat.ink} catBg={cat.bg} reward={reward}
                       starCount={doneCount} scanKey={scanKey}
                       onReset={reset} onBackToEdit={() => navigate('/b/' + board.id)} />
        ) : mode === 'firstThen' ? (
          <FirstThenView steps={steps} idx={idx} doneSet={doneSet}
                         onDid={markDoneAndAdvance} onSpeak={speak} ttsBusy={ttsBusy} />
        ) : (
          <StepCardBig step={step} idx={idx} total={steps.length} cat={cat} />
        )}
      </main>

      {/* Footer controls — Steps mode only */}
      {!allDone && mode === 'steps' && (
        <footer style={{
          padding: '16px 24px 30px',
          display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center',
        }}>
          <button type="button" onClick={prev} disabled={idx === 0}
                  style={{ ...previewRoundButtonStyle(cat.ink, idx === 0), ...(scanRing('prev') || {}) }}>
            <IconArrowL style={{ width: 28, height: 28 }} />
          </button>

          <button type="button" onClick={markDoneAndAdvance}
                  style={{
                    appearance: 'none', border: 0, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 12,
                    height: 64, padding: '0 36px', borderRadius: 999,
                    background: cat.ink, color: '#fff',
                    fontWeight: 700, fontSize: 22, fontFamily: 'inherit',
                    boxShadow: '0 8px 24px rgba(48, 40, 20, .15)',
                    ...(scanRing('done') || {}),
                  }}>
            <IconCheck style={{ width: 26, height: 26 }} />
            {idx === steps.length - 1 ? 'All done!' : "I did it"}
          </button>

          <button type="button" onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}
                  disabled={idx === steps.length - 1}
                  style={{ ...previewRoundButtonStyle(cat.ink, idx === steps.length - 1), ...(scanRing('next') || {}) }}>
            <IconArrowR style={{ width: 28, height: 28 }} />
          </button>
        </footer>
      )}
    </div>
  );
}

// ── Steps mode: one big card with a countdown timer ────────────────────
function StepCardBig({ step, idx, total, cat }) {
  return (
    <div style={{
      width: '100%', maxWidth: 720,
      background: 'var(--paper)', borderRadius: 28, overflow: 'hidden',
      boxShadow: '0 24px 60px rgba(48, 40, 20, .12), 0 1px 0 rgba(255,255,255,.6) inset',
      border: '1px solid rgba(255,255,255,.6)',
      animation: 'popIn .35s ease',
    }}>
      <div style={{
        aspectRatio: '5 / 3',
        background: photoFrameBg(step.photo, cat.bg),
        color: cat.ink, position: 'relative',
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {step.photo ? (
          <img src={step.photo.thumb} alt={step.photo.title || step.title}
               style={photoImgStyle(step.photo)} />
        ) : (
          <Icon name={step.icon} style={{ width: '36%', height: '54%' }} />
        )}
        <div style={{
          position: 'absolute', top: 22, left: 24,
          fontSize: 14, fontWeight: 700,
          color: (step.photo && !isSymbolPhoto(step.photo)) ? '#fff' : cat.ink, opacity: .85,
          textShadow: (step.photo && !isSymbolPhoto(step.photo)) ? '0 1px 4px rgba(0,0,0,.5)' : 'none',
        }}>STEP {idx + 1} OF {total}</div>
      </div>

      <div style={{ padding: '30px 36px 28px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.1, fontWeight: 700, color: 'var(--ink)' }}>
          {step.title}
        </h1>
        {step.note && (
          <p style={{
            marginTop: 14, fontSize: 20, lineHeight: 1.45, color: 'var(--ink-2)',
            maxWidth: 520, marginLeft: 'auto', marginRight: 'auto',
          }}>{step.note}</p>
        )}
        {step.duration ? (
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
            <TimerRing key={step.id} minutes={step.duration} catInk={cat.ink} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Countdown timer ring ───────────────────────────────────────────────
// A "time timer" — the colored arc depletes as the minutes count down. The
// child taps play to start. Keyed by step id so it resets per step.
function TimerRing({ minutes, catInk }) {
  const total = Math.max(1, minutes) * 60;
  const [left, setLeft] = React.useState(total);
  const [running, setRunning] = React.useState(false);
  const tickRef = React.useRef(null);

  React.useEffect(() => {
    if (!running) return;
    tickRef.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(tickRef.current); setRunning(false); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [running]);

  const R = 34, C = 2 * Math.PI * R;
  const frac = left / total;
  const mm = Math.floor(left / 60);
  const ss = left % 60;
  const done = left === 0;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        <svg viewBox="0 0 88 88" style={{ width: 88, height: 88, transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(0,0,0,.07)" strokeWidth="8" />
          <circle cx="44" cy="44" r={R} fill="none" stroke={catInk} strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - frac)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontSize: 18, fontWeight: 700, color: done ? catInk : 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {done ? 'Done' : `${mm}:${String(ss).padStart(2, '0')}`}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button type="button" onClick={() => { if (done) { setLeft(total); } setRunning((r) => !r); }}
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 44, padding: '0 18px', borderRadius: 999,
                  background: catInk, color: '#fff', fontWeight: 700, fontSize: 15,
                }}>
          {running ? <IconPause style={{ width: 18, height: 18 }} /> : <IconPlay style={{ width: 18, height: 18 }} />}
          {running ? 'Pause' : done ? 'Again' : left < total ? 'Resume' : 'Start timer'}
        </button>
        {left < total && !done && (
          <button type="button" onClick={() => { setRunning(false); setLeft(total); }}
                  style={{
                    appearance: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                    background: 'transparent', color: 'var(--ink-3)', fontSize: 13, fontWeight: 700,
                  }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ── First → Then view ──────────────────────────────────────────────────
function FirstThenView({ steps, idx, doneSet, onDid, onSpeak, ttsBusy }) {
  const first = steps[idx];
  const then = steps[idx + 1] || null;
  const firstCat = CATEGORIES[first.category] || CATEGORIES.routine;
  const thenCat = then ? (CATEGORIES[then.category] || CATEGORIES.routine) : null;

  const Panel = ({ label, step: s, cat, faded }) => (
    <div style={{
      flex: 1, minWidth: 0,
      background: 'var(--paper)', borderRadius: 28, overflow: 'hidden',
      boxShadow: '0 18px 44px rgba(48,40,20,.10)',
      opacity: faded ? .82 : 1,
      display: 'flex', flexDirection: 'column',
      animation: 'popIn .35s ease',
    }}>
      <div style={{
        padding: '14px 0', textAlign: 'center',
        fontSize: 15, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
        color: cat ? cat.ink : 'var(--ink-3)', background: cat ? cat.bg : 'var(--bg-tint)',
      }}>{label}</div>
      <div style={{
        aspectRatio: '1 / 1',
        background: s && s.photo ? photoFrameBg(s.photo) : (cat ? cat.bg : 'var(--bg-tint)'),
        color: cat ? cat.ink : 'var(--ink-3)',
        position: 'relative', display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {s ? (
          s.photo ? (
            <img src={s.photo.thumb} alt={s.title}
                 style={photoImgStyle(s.photo)} />
          ) : <Icon name={s.icon} style={{ width: '46%', height: '46%' }} />
        ) : (
          <IconStar style={{ width: '40%', height: '40%' }} />
        )}
      </div>
      <div style={{ padding: '20px 22px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.12 }}>
          {s ? s.title : 'All done!'}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: 880, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 'clamp(12px, 3vw, 28px)' }}>
        <Panel label="First" step={first} cat={firstCat} />
        <div style={{ display: 'grid', placeItems: 'center', color: 'rgba(0,0,0,.35)', flexShrink: 0 }}>
          <IconArrowR style={{ width: 36, height: 36 }} />
        </div>
        <Panel label="Then" step={then} cat={thenCat} faded />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button type="button" onClick={() => onSpeak(first)} disabled={ttsBusy} style={{ ...previewButtonStyle(firstCat.ink), ...(ttsBusy ? { opacity: .7, cursor: 'wait' } : null) }}>
          <IconSpeaker /> {ttsBusy ? 'Loading…' : 'Read to me'}
        </button>
        <button type="button" onClick={onDid}
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  height: 64, padding: '0 36px', borderRadius: 999,
                  background: firstCat.ink, color: '#fff', fontWeight: 700, fontSize: 22,
                  boxShadow: '0 8px 24px rgba(48,40,20,.15)',
                }}>
          <IconCheck style={{ width: 26, height: 26 }} />
          First is done
        </button>
      </div>
    </div>
  );
}

// ── Reward progress bar ─────────────────────────────────────────────────
function RewardBar({ doneCount, goal, label, catInk }) {
  const filled = Math.min(doneCount, goal);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '10px 18px', borderRadius: 999,
      background: 'rgba(255,255,255,.7)', maxWidth: '92vw',
    }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {Array.from({ length: goal }).map((_, i) => (
          <IconStar key={i}
                    style={{
                      width: 24, height: 24,
                      color: i < filled ? catInk : 'rgba(0,0,0,.16)',
                      fill: i < filled ? catInk : 'none',
                      transition: 'color .3s',
                    }} />
        ))}
      </div>
      {label && (
        <div style={{ fontSize: 14, fontWeight: 700, color: catInk, whiteSpace: 'nowrap' }}>
          {filled >= goal ? 'You earned it!' : 'Earn: ' + label}
        </div>
      )}
    </div>
  );
}

function AllDoneCard({ catInk, catBg, reward, starCount, scanKey, onReset, onBackToEdit }) {
  const ring = (key) => scanKey === key
    ? { boxShadow: '0 0 0 4px rgba(255,255,255,.95), 0 0 0 8px ' + catInk, transform: 'scale(1.05)' }
    : null;
  return (
    <div style={{
      width: '100%', maxWidth: 560,
      background: 'var(--paper)', borderRadius: 28,
      boxShadow: '0 24px 60px rgba(48, 40, 20, .12)',
      padding: '48px 36px', textAlign: 'center',
      animation: 'popIn .4s ease',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: catBg, color: catInk,
        display: 'grid', placeItems: 'center', margin: '0 auto 20px',
      }}>
        <IconStar style={{ width: 56, height: 56, fill: catInk }} />
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>
        All done!
      </div>
      <div style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: reward ? 18 : 24 }}>
        Great work — every step is finished.
      </div>

      {reward?.label && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 16, marginBottom: 24,
          background: catBg, color: catInk, fontWeight: 700, fontSize: 18,
        }}>
          <IconHeart style={{ width: 22, height: 22 }} />
          You earned: {reward.label}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={onReset}
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer',
                  height: 52, padding: '0 28px', borderRadius: 999,
                  background: catInk, color: '#fff',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  ...(ring('again') || {}),
                }}>
          Do it again
        </button>
        <button type="button" onClick={onBackToEdit}
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer',
                  height: 52, padding: '0 28px', borderRadius: 999,
                  background: 'transparent', color: 'var(--ink-2)',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
                  ...(ring('editback') || {}),
                }}>
          Back to edit
        </button>
      </div>
    </div>
  );
}

function previewButtonStyle(color) {
  return {
    appearance: 'none', border: 0, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    height: 44, padding: '0 16px', borderRadius: 999,
    background: 'rgba(255,255,255,.7)', color,
    fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
    backdropFilter: 'blur(6px)',
  };
}
function previewRoundButtonStyle(color, disabled) {
  return {
    appearance: 'none', border: 0,
    cursor: disabled ? 'default' : 'pointer',
    width: 64, height: 64, borderRadius: '50%',
    background: 'rgba(255,255,255,.7)', color,
    display: 'grid', placeItems: 'center',
    opacity: disabled ? .35 : 1, fontFamily: 'inherit',
  };
}

Object.assign(window, { PreviewScreen });
