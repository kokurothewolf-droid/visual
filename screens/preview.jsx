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

  // Initial position: first un-done step. Also decide whether to show the
  // feelings check-in (only on a fresh run — nothing done, no mood yet).
  React.useEffect(() => {
    if (!board) return;
    const progress = store.getProgress(board.id);
    const doneSet = new Set(progress.doneStepIds);
    const next = board.steps.findIndex((s) => !doneSet.has(s.id));
    setIdx(next >= 0 ? next : 0);
    setShowFeelings(progress.doneStepIds.length === 0 && !progress.mood);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

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

  const steps = board.steps;
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

  const step = steps[idx] || steps[0];
  const cat = CATEGORIES[step.category] || CATEGORIES.routine;
  const progress = store.getProgress(board.id);
  const doneSet = new Set(progress.doneStepIds);
  const isDone = doneSet.has(step.id);
  const doneCount = progress.doneStepIds.length;
  const allDone = steps.every((s) => doneSet.has(s.id));

  // Reward goal: explicit on the board, else simply finishing every step.
  const reward = board.reward || null;
  const goal = reward?.goal || steps.length;

  const child = store.state.children.find((c) => c.id === board.childId);

  const markDoneAndAdvance = () => {
    store.setStepDone(board.id, step.id, true);
    setIdx((i) => Math.min(steps.length - 1, i + 1));
  };
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const reset = () => { store.resetProgress(board.id); setIdx(0); setShowFeelings(true); };

  // Speech synthesis — built into every modern browser, free, no key.
  const speak = (s = step) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = s.note ? s.title + '. ' + s.note : s.title;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  };

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

        <button type="button" onClick={() => speak()} style={previewButtonStyle(cat.ink)}>
          <IconSpeaker /> Read to me
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
                       starCount={doneCount}
                       onReset={reset} onBackToEdit={() => navigate('/b/' + board.id)} />
        ) : mode === 'firstThen' ? (
          <FirstThenView steps={steps} idx={idx} doneSet={doneSet}
                         onDid={markDoneAndAdvance} onSpeak={speak} />
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
                  style={previewRoundButtonStyle(cat.ink, idx === 0)}>
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
                  }}>
            <IconCheck style={{ width: 26, height: 26 }} />
            {idx === steps.length - 1 ? 'All done!' : "I did it"}
          </button>

          <button type="button" onClick={() => setIdx((i) => Math.min(steps.length - 1, i + 1))}
                  disabled={idx === steps.length - 1}
                  style={previewRoundButtonStyle(cat.ink, idx === steps.length - 1)}>
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
        background: step.photo ? '#1f1f1f' : cat.bg,
        color: cat.ink, position: 'relative',
        display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {step.photo ? (
          <img src={step.photo.thumb} alt={step.photo.title || step.title}
               style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Icon name={step.icon} style={{ width: '36%', height: '54%' }} />
        )}
        <div style={{
          position: 'absolute', top: 22, left: 24,
          fontSize: 14, fontWeight: 700,
          color: step.photo ? '#fff' : cat.ink, opacity: .85,
          textShadow: step.photo ? '0 1px 4px rgba(0,0,0,.5)' : 'none',
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
function FirstThenView({ steps, idx, doneSet, onDid, onSpeak }) {
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
        background: s && s.photo ? '#1f1f1f' : (cat ? cat.bg : 'var(--bg-tint)'),
        color: cat ? cat.ink : 'var(--ink-3)',
        position: 'relative', display: 'grid', placeItems: 'center', overflow: 'hidden',
      }}>
        {s ? (
          s.photo ? (
            <img src={s.photo.thumb} alt={s.title}
                 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
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
        <button type="button" onClick={() => onSpeak(first)} style={previewButtonStyle(firstCat.ink)}>
          <IconSpeaker /> Read to me
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

function AllDoneCard({ catInk, catBg, reward, starCount, onReset, onBackToEdit }) {
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
                }}>
          Do it again
        </button>
        <button type="button" onClick={onBackToEdit}
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer',
                  height: 52, padding: '0 28px', borderRadius: 999,
                  background: 'transparent', color: 'var(--ink-2)',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
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
