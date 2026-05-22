// screens/preview.jsx — child-facing view of a board
function PreviewScreen({ onNav }) {
  const steps = MORNING_ROUTINE.steps;
  const [idx, setIdx] = React.useState(2); // Brush teeth — feels like mid-routine
  const [done, setDone] = React.useState(new Set([0, 1]));

  const step = steps[idx];
  const cat = CATEGORIES[step.category];

  const next = () => {
    setDone((d) => new Set([...d, idx]));
    setIdx((i) => Math.min(steps.length - 1, i + 1));
  };
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  return (
    <div style={{
      minHeight: '100vh',
      background: cat.bg,
      transition: 'background .4s',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top bar — minimal, big touch target back ----------------------- */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '20px 28px',
      }}>
        <button type="button" onClick={() => onNav('builder')}
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 44, padding: '0 16px', borderRadius: 999,
                  background: 'rgba(255,255,255,.7)', color: cat.ink,
                  fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                  backdropFilter: 'blur(6px)',
                }}>
          <IconArrowL /> Back to edit
        </button>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999,
            background: 'rgba(255,255,255,.7)', color: cat.ink,
            fontWeight: 700, fontSize: 14,
          }}>
            <Icon name="sun" style={{ width: 18, height: 18 }} /> Morning Routine · Sam
          </div>
        </div>

        <button type="button"
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  height: 44, padding: '0 16px', borderRadius: 999,
                  background: 'rgba(255,255,255,.7)', color: cat.ink,
                  fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                }}>
          <IconSpeaker /> Read to me
        </button>
      </header>

      {/* Progress strip — big visual ----------------------------------- */}
      <div style={{
        padding: '8px 28px 0',
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,.55)', backdropFilter: 'blur(6px)',
        }}>
          {steps.map((s, i) => {
            const isDone = done.has(i);
            const isCurr = i === idx;
            const c = CATEGORIES[s.category];
            return (
              <button key={s.id} type="button" onClick={() => setIdx(i)}
                      title={s.title}
                      style={{
                        width: isCurr ? 44 : 36, height: isCurr ? 44 : 36,
                        borderRadius: '50%',
                        background: isDone ? c.ink : isCurr ? '#fff' : 'rgba(255,255,255,.55)',
                        color: isDone ? '#fff' : c.ink,
                        border: isCurr ? `2px solid ${c.ink}` : '0',
                        display: 'grid', placeItems: 'center',
                        cursor: 'pointer',
                        transition: 'all .25s',
                      }}>
                {isDone
                  ? <IconCheck style={{ width: 18, height: 18 }} />
                  : <Icon name={s.icon} style={{ width: isCurr ? 22 : 18, height: isCurr ? 22 : 18 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big card ----------------------------------------------------- */}
      <main style={{
        flex: 1, padding: '32px 28px',
        display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          width: '100%', maxWidth: 720,
          background: 'var(--paper)', borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(48, 40, 20, .12), 0 1px 0 rgba(255,255,255,.6) inset',
          border: '1px solid rgba(255,255,255,.6)',
        }}>
          {/* Step image */}
          <div style={{
            aspectRatio: '5 / 3',
            background: step.photo
              ? '#1f1f1f'
              : `linear-gradient(180deg, ${cat.bg} 0%, ${cat.bg} 70%, ${cat.bg} 100%)`,
            color: cat.ink,
            display: 'grid', placeItems: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {step.photo ? (
              <img src={step.photo.thumb} alt={step.photo.title || step.title}
                   style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Icon name={step.icon} style={{ width: '36%', height: '54%' }} />
            )}
            <div style={{
              position: 'absolute', top: 22, left: 24,
              fontSize: 14, fontWeight: 700, color: cat.ink, opacity: .8,
            }}>STEP {idx + 1} OF {steps.length}</div>
            <div style={{
              position: 'absolute', top: 22, right: 24,
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 14, fontWeight: 700, color: cat.ink, opacity: .8,
            }}>
              <IconClock style={{ width: 14, height: 14 }} /> {step.duration} min
            </div>
          </div>

          <div style={{ padding: '32px 36px 28px', textAlign: 'center' }}>
            <h1 style={{
              margin: 0, fontSize: 44, lineHeight: 1.1, fontWeight: 700,
              color: 'var(--ink)',
            }}>{step.title}</h1>
            <p style={{
              marginTop: 14, fontSize: 20, lineHeight: 1.45, color: 'var(--ink-2)',
              maxWidth: 520, marginLeft: 'auto', marginRight: 'auto',
            }}>{step.note}</p>
          </div>
        </div>
      </main>

      {/* Footer controls --------------------------------------------- */}
      <footer style={{
        padding: '20px 28px 32px',
        display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center',
      }}>
        <button type="button" onClick={prev}
                disabled={idx === 0}
                style={{
                  appearance: 'none', border: 0, cursor: idx === 0 ? 'default' : 'pointer',
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(255,255,255,.7)', color: cat.ink,
                  display: 'grid', placeItems: 'center',
                  opacity: idx === 0 ? .35 : 1,
                  fontFamily: 'inherit',
                }}>
          <IconArrowL style={{ width: 28, height: 28 }} />
        </button>

        <button type="button" onClick={next}
                style={{
                  appearance: 'none', border: 0, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  height: 64, padding: '0 36px', borderRadius: 999,
                  background: cat.ink, color: '#fff',
                  fontWeight: 700, fontSize: 22,
                  boxShadow: '0 8px 24px rgba(48, 40, 20, .15)',
                  fontFamily: 'inherit',
                }}>
          <IconCheck style={{ width: 26, height: 26 }} />
          {idx === steps.length - 1 ? 'All done!' : "I did it"}
        </button>

        <button type="button" onClick={next}
                disabled={idx === steps.length - 1}
                style={{
                  appearance: 'none', border: 0, cursor: idx === steps.length - 1 ? 'default' : 'pointer',
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(255,255,255,.7)', color: cat.ink,
                  display: 'grid', placeItems: 'center',
                  opacity: idx === steps.length - 1 ? .35 : 1,
                  fontFamily: 'inherit',
                }}>
          <IconArrowR style={{ width: 28, height: 28 }} />
        </button>
      </footer>
    </div>
  );
}

Object.assign(window, { PreviewScreen });
