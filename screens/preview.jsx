// screens/preview.jsx — child-facing view of a board
function PreviewScreen({ route, navigate }) {
  const store = useStore();
  const boardId = route.params.boardId;
  const board = store.getBoard(boardId);

  const [idx, setIdx] = React.useState(0);
  // Initial position: first un-done step
  React.useEffect(() => {
    if (!board) return;
    const progress = store.getProgress(board.id);
    const doneSet = new Set(progress.doneStepIds);
    const next = board.steps.findIndex((s) => !doneSet.has(s.id));
    setIdx(next >= 0 ? next : 0);
    // We only want to compute this on board change, not on every progress
    // update — otherwise marking a step done jumps the user forward via
    // this effect AND via the explicit setIdx in next(). Listing only
    // boardId in deps keeps progress changes from re-triggering.
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
  const allDone = steps.every((s) => doneSet.has(s.id));

  const child = store.state.children.find((c) => c.id === board.childId);

  const next = () => {
    store.setStepDone(board.id, step.id, true);
    setIdx((i) => Math.min(steps.length - 1, i + 1));
  };
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const reset = () => { store.resetProgress(board.id); setIdx(0); };

  // Speech synthesis — built into every modern browser, free, no key.
  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = step.note ? step.title + '. ' + step.note : step.title;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: cat.bg,
      transition: 'background .4s',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 28px',
      }}>
        <button type="button" onClick={() => navigate('/b/' + board.id)}
                style={previewButtonStyle(cat.ink)}>
          <IconArrowL /> Back to edit
        </button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999,
            background: 'rgba(255,255,255,.7)', color: cat.ink,
            fontWeight: 700, fontSize: 14,
            maxWidth: '60vw',
          }}>
            <Icon name={steps[0]?.icon || 'sun'} style={{ width: 18, height: 18 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {board.title}{child ? ' · ' + child.name : ''}
            </span>
          </div>
        </div>

        <button type="button" onClick={speak} style={previewButtonStyle(cat.ink)}>
          <IconSpeaker /> Read to me
        </button>
      </header>

      {/* Progress dots */}
      <div style={{ padding: '8px 28px 0', display: 'flex', justifyContent: 'center' }}>
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
              <button key={s.id} type="button" onClick={() => setIdx(i)}
                      title={s.title}
                      style={{
                        width: isCurr ? 44 : 36, height: isCurr ? 44 : 36,
                        borderRadius: '50%',
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

      {/* Big card */}
      <main style={{ flex: 1, padding: '32px 28px', display: 'grid', placeItems: 'center' }}>
        {allDone ? (
          <AllDoneCard catInk={cat.ink} catBg={cat.bg} onReset={reset} onBackToEdit={() => navigate('/b/' + board.id)} />
        ) : (
          <div style={{
            width: '100%', maxWidth: 720,
            background: 'var(--paper)', borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(48, 40, 20, .12), 0 1px 0 rgba(255,255,255,.6) inset',
            border: '1px solid rgba(255,255,255,.6)',
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
              }}>STEP {idx + 1} OF {steps.length}</div>
              {step.duration ? (
                <div style={{
                  position: 'absolute', top: 22, right: 24,
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 14, fontWeight: 700,
                  color: step.photo ? '#fff' : cat.ink, opacity: .85,
                  textShadow: step.photo ? '0 1px 4px rgba(0,0,0,.5)' : 'none',
                }}>
                  <IconClock style={{ width: 14, height: 14 }} /> {step.duration} min
                </div>
              ) : null}
            </div>

            <div style={{ padding: '32px 36px 28px', textAlign: 'center' }}>
              <h1 style={{
                margin: 0, fontSize: 44, lineHeight: 1.1, fontWeight: 700,
                color: 'var(--ink)',
              }}>{step.title}</h1>
              {step.note && (
                <p style={{
                  marginTop: 14, fontSize: 20, lineHeight: 1.45, color: 'var(--ink-2)',
                  maxWidth: 520, marginLeft: 'auto', marginRight: 'auto',
                }}>{step.note}</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer controls */}
      {!allDone && (
        <footer style={{
          padding: '20px 28px 32px',
          display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center',
        }}>
          <button type="button" onClick={prev}
                  disabled={idx === 0}
                  style={previewRoundButtonStyle(cat.ink, idx === 0)}>
            <IconArrowL style={{ width: 28, height: 28 }} />
          </button>

          <button type="button" onClick={next}
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

function AllDoneCard({ catInk, catBg, onReset, onBackToEdit }) {
  return (
    <div style={{
      width: '100%', maxWidth: 560,
      background: 'var(--paper)', borderRadius: 28,
      boxShadow: '0 24px 60px rgba(48, 40, 20, .12)',
      padding: '48px 36px', textAlign: 'center',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: catBg, color: catInk,
        display: 'grid', placeItems: 'center',
        margin: '0 auto 20px',
      }}>
        <IconStar style={{ width: 56, height: 56 }} />
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>
        All done!
      </div>
      <div style={{ fontSize: 16, color: 'var(--ink-2)', marginBottom: 24 }}>
        Great work — every step is finished.
      </div>
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
