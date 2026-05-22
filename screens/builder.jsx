// screens/builder.jsx — the core editor
function BuilderScreen({ onNav, tweaks }) {
  const [steps, setSteps] = React.useState(MORNING_ROUTINE.steps);
  const [selId, setSelId] = React.useState('s5'); // Eat breakfast selected
  const [view, setView] = React.useState('grid'); // grid | strip
  const [libTab, setLibTab] = React.useState('icons');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const sel = steps.find((s) => s.id === selId);
  const selIdx = steps.findIndex((s) => s.id === selId);

  const updateSel = (patch) => setSteps((cur) => cur.map((s) => s.id === selId ? { ...s, ...patch } : s));

  const openSearch = (q) => { setSearchQuery(q || sel?.title || ''); setSearchOpen(true); };
  const pickFromSearch = (result) => {
    // Store the photo on the selected step so StepCard renders it as a
    // photo-style tile instead of the category-tinted icon.
    updateSel({ photo: result });
    setSearchOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: 0 }}>
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="topbar" style={{ padding: '12px 22px' }}>
        <button className="btn btn--ghost btn--icon" type="button" onClick={() => onNav('templates')}
                title="Back to templates">
          <IconArrowL />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'var(--cat-routine-bg)', color: 'var(--cat-routine)',
            display: 'grid', placeItems: 'center',
          }}>
            <Icon name="sun" style={{ width: 22, height: 22 }} />
          </div>
          <div className="stack-tight" style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="h2" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Morning Routine
                <IconChevD style={{ width: 14, height: 14, opacity: .5 }} />
              </div>
              <CategoryPill id="routine" />
            </div>
            <div className="meta" style={{ fontSize: 12 }}>
              For Sam · Weekdays · starts 7:00 AM · Saved 2 min ago
            </div>
          </div>
        </div>

        <div className="spacer" />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'var(--bg-tint)', padding: 3, borderRadius: 10,
          marginRight: 6,
        }}>
          <button type="button"
                  className={'btn ' + (view === 'grid' ? 'btn--soft' : 'btn--ghost')}
                  style={{ height: 28, padding: '0 10px', fontSize: 13, boxShadow: view === 'grid' ? 'var(--shadow-card)' : 'none' }}
                  onClick={() => setView('grid')}>
            <IconGrid style={{ width: 14, height: 14 }} /> Grid
          </button>
          <button type="button"
                  className={'btn ' + (view === 'strip' ? 'btn--soft' : 'btn--ghost')}
                  style={{ height: 28, padding: '0 10px', fontSize: 13, boxShadow: view === 'strip' ? 'var(--shadow-card)' : 'none' }}
                  onClick={() => setView('strip')}>
            <IconList style={{ width: 14, height: 14 }} /> Strip
          </button>
        </div>

        <button className="btn btn--soft" type="button"><IconShare />Share</button>
        <button className="btn btn--soft" type="button" onClick={() => onNav('print')}><IconPrint />Print</button>
        <button className="btn btn--primary" type="button" onClick={() => onNav('preview')}>
          <IconPlay />Preview
        </button>
      </header>

      {/* ── Main 3-column workspace ────────────────────────────────────── */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '264px 1fr 320px',
      }}>
        <BuilderLibrary tab={libTab} setTab={setLibTab} onOpenSearch={openSearch} />
        <BuilderCanvas
          steps={steps} setSteps={setSteps}
          selId={selId} setSelId={setSelId}
          view={view}
        />
        <BuilderInspector
          step={sel} idx={selIdx} total={steps.length}
          onChange={updateSel}
          onOpenSearch={openSearch}
          onDelete={() => {
            const nextSteps = steps.filter((s) => s.id !== selId);
            setSteps(nextSteps);
            setSelId(nextSteps[Math.max(0, selIdx - 1)]?.id);
          }}
          onDuplicate={() => {
            const nu = { ...sel, id: 's' + Date.now() };
            const arr = [...steps]; arr.splice(selIdx + 1, 0, nu);
            setSteps(arr); setSelId(nu.id);
          }}
        />
      </div>

      <ImageSearchModal
        open={searchOpen}
        query={searchQuery}
        onSelect={pickFromSearch}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

// ── Left rail: step library ────────────────────────────────────────────
function BuilderLibrary({ tab, setTab, onOpenSearch }) {
  return (
    <aside style={{
      borderRight: '1px solid var(--hairline)',
      background: 'var(--bg-tint)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <div style={{ padding: '16px 16px 10px' }}>
        <div className="h3" style={{ marginBottom: 4 }}>Add a step</div>
        <div className="meta" style={{ fontSize: 12 }}>Drag onto the board, or click to add.</div>
      </div>

      <div style={{
        display: 'flex', gap: 2, padding: '0 14px 8px',
      }}>
        {[
          { id: 'icons',  label: 'Icons',   icon: <IconSparkle style={{ width: 13, height: 13 }} /> },
          { id: 'photos', label: 'Photos',  icon: <IconImage style={{ width: 13, height: 13 }} /> },
          { id: 'words',  label: 'Words',   icon: <IconText style={{ width: 13, height: 13 }} /> },
        ].map((t) => (
          <button key={t.id} type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, height: 30, border: 0, borderRadius: 8,
                    background: tab === t.id ? 'var(--paper)' : 'transparent',
                    color: tab === t.id ? 'var(--ink)' : 'var(--ink-2)',
                    boxShadow: tab === t.id ? 'var(--shadow-card)' : 'none',
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 14px 10px' }}>
        <div style={{ position: 'relative' }}>
          <IconSearch style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 14, color: 'var(--ink-3)',
          }} />
          <input className="input" placeholder="Search activities…"
                 style={{ paddingLeft: 32, height: 32, fontSize: 13, background: 'var(--paper)' }} />
        </div>
      </div>

      {tab === 'icons' && <LibraryIconGrid />}
      {tab === 'photos' && <LibraryPhotos onOpenSearch={onOpenSearch} />}
      {tab === 'words' && <LibraryWords />}
    </aside>
  );
}

function LibraryIconGrid() {
  // Group by category
  const groups = Object.values(CATEGORIES).map((c) => ({
    cat: c, items: STEP_LIBRARY.filter((s) => s.category === c.id),
  })).filter((g) => g.items.length);

  return (
    <div className="scroll" style={{ flex: 1, padding: '0 14px 16px', minHeight: 0 }}>
      {groups.map((g) => (
        <div key={g.cat.id} style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ padding: '8px 4px 8px', fontSize: 10 }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: g.cat.dot, marginRight: 6, verticalAlign: 'middle',
            }} />
            {g.cat.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {g.items.map((it) => (
              <div key={it.id} draggable
                   style={{
                     aspectRatio: '1 / 1', borderRadius: 10,
                     background: g.cat.bg, color: g.cat.ink,
                     display: 'grid', placeItems: 'center',
                     cursor: 'grab',
                     border: '1px solid transparent',
                     position: 'relative',
                     transition: 'transform .1s, border-color .12s',
                   }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = g.cat.ink; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'transparent'; }}
                   title={it.label}>
                <Icon name={it.id} style={{ width: '50%', height: '50%' }} />
                <span style={{
                  position: 'absolute', bottom: 4, left: 4, right: 4,
                  fontSize: 9.5, fontWeight: 700, textAlign: 'center',
                  color: g.cat.ink, opacity: .8,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LibraryPhotos({ onOpenSearch }) {
  const [q, setQ] = React.useState('');
  return (
    <div className="scroll" style={{ flex: 1, padding: '4px 14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Web search — primary action */}
      <button type="button" onClick={() => onOpenSearch(q)}
              style={{
                width: '100%', textAlign: 'left',
                padding: 12, borderRadius: 12, cursor: 'pointer',
                background: 'var(--sage-tint)',
                border: '1px solid var(--sage-soft)',
                display: 'flex', alignItems: 'center', gap: 12,
                fontFamily: 'inherit',
              }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--sage-soft)', color: 'var(--sage-deep)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <IconSearch style={{ width: 18, height: 18 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Search the web</div>
          <div className="meta" style={{ fontSize: 11.5 }}>Free + reusable images from Google.</div>
        </div>
        <IconArrowR style={{ width: 16, height: 16, color: 'var(--ink-3)' }} />
      </button>

      {/* Upload */}
      <div style={{
        border: '1px dashed var(--hairline-strong)', borderRadius: 12,
        padding: '16px 14px', textAlign: 'center', color: 'var(--ink-2)',
        background: 'var(--paper)',
      }}>
        <div className="h3" style={{ fontSize: 13, marginBottom: 2 }}>…or use your own photo</div>
        <div className="meta" style={{ fontSize: 11.5, marginBottom: 10 }}>
          Real pictures of <em>your</em> bowl, your bus, your door.
        </div>
        <button className="btn btn--soft" style={{ height: 28, fontSize: 12 }} type="button">
          <IconPlus style={{ width: 13, height: 13 }} /> Upload
        </button>
      </div>

      <div className="eyebrow" style={{ padding: '8px 4px 2px', fontSize: 10 }}>Recent searches</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {['cereal bowl', 'toothbrush kids', 'velcro sneakers', 'school bus'].map((s) => (
          <button key={s} type="button" onClick={() => onOpenSearch(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 10px', borderRadius: 8,
                    background: 'transparent', border: 0, cursor: 'pointer',
                    color: 'var(--ink-2)', fontFamily: 'inherit', fontSize: 13,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <IconSearch style={{ width: 13, height: 13, color: 'var(--ink-3)' }} />
            <span style={{ flex: 1 }}>{s}</span>
            <span className="meta" style={{ fontSize: 11 }}>recent</span>
          </button>
        ))}
      </div>

      <div className="eyebrow" style={{ padding: '8px 4px 2px', fontSize: 10 }}>Your uploads</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        {[
          { l: "Sam's cereal",  c1: '#F4E6C7', c2: '#A57F33', ic: 'bowl' },
          { l: "Sam's brush",   c1: '#E2EBF1', c2: '#6692AB', ic: 'tooth' },
          { l: 'The blue bus',  c1: '#F1D88B', c2: '#A77614', ic: 'bus' },
          { l: 'Front door',    c1: '#EFE0B2', c2: '#9F8137', ic: 'wave' },
        ].map((u, i) => (
          <div key={i} draggable
               style={{
                 aspectRatio: '1 / 1', borderRadius: 10,
                 background: `linear-gradient(135deg, ${u.c1}, ${u.c2})`,
                 cursor: 'grab', position: 'relative', overflow: 'hidden',
                 boxShadow: '0 0 0 1px var(--hairline)',
               }} title={u.l}>
            <Icon name={u.ic} style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -55%)',
              width: '50%', height: '50%',
              color: '#fff', opacity: .9,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.15))',
            }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '12px 6px 4px',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.5))',
              fontSize: 9.5, fontWeight: 700, color: '#fff',
              textAlign: 'center',
            }}>{u.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryWords() {
  const phrases = [
    'First… then…', 'All done!', 'My turn / Your turn', 'I need a break',
    'Quiet please', 'I can do it', 'I feel calm', 'Take a deep breath',
    'Ask for help', 'I am safe',
  ];
  return (
    <div className="scroll" style={{ flex: 1, padding: '4px 14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {phrases.map((p) => (
        <div key={p} draggable
             style={{
               padding: '9px 12px', borderRadius: 10,
               background: 'var(--paper)', border: '1px solid var(--hairline)',
               fontSize: 13, fontWeight: 700, color: 'var(--ink)',
               cursor: 'grab',
             }}>{p}</div>
      ))}
    </div>
  );
}

// ── Center: the board ──────────────────────────────────────────────────
function BuilderCanvas({ steps, setSteps, selId, setSelId, view }) {
  return (
    <main className="scroll" style={{ minHeight: 0, padding: '24px 28px 40px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div>
          <span className="eyebrow">Board</span>
          <div className="h1" style={{ fontSize: 22, marginTop: 2 }}>{steps.length} steps · ends 7:52 AM</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="meta" style={{ fontSize: 12 }}>Total time</span>
          <span className="pill pill--ghost" style={{ background: 'var(--paper)', boxShadow: 'inset 0 0 0 1px var(--hairline)' }}>
            <IconClock style={{ width: 12, height: 12 }} /> 48 min
          </span>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
        }}>
          {steps.map((s, i) => (
            <StepCard key={s.id} step={s} idx={i}
                      selected={s.id === selId}
                      onSelect={() => setSelId(s.id)} />
          ))}
          <button type="button" style={{
            aspectRatio: '4 / 3.55', minHeight: 200,
            border: '2px dashed var(--hairline-strong)',
            borderRadius: 'var(--r-md)',
            background: 'transparent', color: 'var(--ink-2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer',
          }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.color = 'var(--sage-deep)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline-strong)'; e.currentTarget.style.color = 'var(--ink-2)'; }}>
            <IconPlus />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Add a step</span>
          </button>
        </div>
      ) : (
        <StripView steps={steps} selId={selId} setSelId={setSelId} />
      )}

      {/* Floating connectors hint */}
      <div style={{
        marginTop: 28, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
        borderRadius: 12, background: 'var(--paper)', border: '1px dashed var(--hairline-strong)',
      }}>
        <IconReorder style={{ width: 18, height: 18, color: 'var(--ink-3)' }} />
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
          <strong style={{ color: 'var(--ink)' }}>Tip:</strong> drag step cards to reorder, or use ↑↓ arrows when a card is selected. The "Strip" view shows your board exactly the way Sam will see it.
        </div>
      </div>
    </main>
  );
}

function StripView({ steps, selId, setSelId }) {
  return (
    <div style={{
      background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)',
      padding: '20px 22px', boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto' }}>
        {steps.map((s, i) => {
          const cat = CATEGORIES[s.category];
          const isSel = s.id === selId;
          return (
            <React.Fragment key={s.id}>
              <button type="button" onClick={() => setSelId(s.id)}
                      style={{
                        flex: '0 0 132px', textAlign: 'left',
                        border: isSel ? '2px solid var(--sage)' : '1px solid var(--hairline)',
                        borderRadius: 12, padding: 10, background: 'var(--paper)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                      }}>
                <div style={{
                  aspectRatio: '1 / 1', borderRadius: 10,
                  background: s.photo ? '#1f1f1f' : cat.bg, color: cat.ink,
                  display: 'grid', placeItems: 'center', position: 'relative',
                  overflow: 'hidden',
                }}>
                  {s.photo ? (
                    <img src={s.photo.thumb} alt={s.photo.title || s.title}
                         style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon name={s.icon} style={{ width: '55%', height: '55%' }} />
                  )}
                  <div style={{
                    position: 'absolute', top: 6, left: 6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(255,255,255,.85)', color: cat.ink,
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>{i + 1}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.time}</div>
              </button>
              {i < steps.length - 1 && (
                <div style={{ flex: '0 0 18px', display: 'grid', placeItems: 'center', color: 'var(--ink-mute)' }}>
                  <IconArrowR style={{ width: 16, height: 16 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Right rail: properties for selected step ───────────────────────────
function BuilderInspector({ step, idx, total, onChange, onDelete, onDuplicate, onOpenSearch }) {
  if (!step) return <aside style={{ borderLeft: '1px solid var(--hairline)', background: 'var(--paper)' }} />;

  const cat = CATEGORIES[step.category] || CATEGORIES.routine;

  // alternate icons within the same category, for quick swap
  const swaps = STEP_LIBRARY.filter((s) => s.category === step.category).slice(0, 6);

  return (
    <aside style={{
      borderLeft: '1px solid var(--hairline)', background: 'var(--paper)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="stack-tight">
          <div className="eyebrow">Step {idx + 1} of {total}</div>
          <div className="h3">Edit step</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn--ghost btn--icon" type="button" title="Duplicate" onClick={onDuplicate}>
            <IconCopy />
          </button>
          <button className="btn btn--ghost btn--icon" type="button" title="Delete" onClick={onDelete}
                  style={{ color: 'var(--cat-food)' }}>
            <IconTrash />
          </button>
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, minHeight: 0, padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Preview tile */}
        <div style={{
          aspectRatio: '4 / 3', borderRadius: 12,
          background: step.photo ? '#1f1f1f' : cat.bg,
          color: cat.ink,
          display: 'grid', placeItems: 'center', position: 'relative',
          overflow: 'hidden',
        }}>
          {step.photo ? (
            <img src={step.photo.thumb} alt={step.photo.title || step.title}
                 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Icon name={step.icon} style={{ width: '50%', height: '50%' }} />
          )}
          <div style={{
            position: 'absolute', top: 8, left: 10,
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(255,255,255,.92)', color: cat.ink,
            display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700,
          }}>{idx + 1}</div>
          {step.photo && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '14px 10px 6px',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.6))',
              fontSize: 10.5, fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '60%',
              }}>{step.photo.title}</span>
              <span style={{ opacity: .85 }}>
                {step.photo.license ? step.photo.license + ' · ' : ''}{step.photo.src}
              </span>
            </div>
          )}
        </div>

        {/* Image / icon picker */}
        <div className="col" style={{ gap: 8 }}>
          <div className="eyebrow">Picture</div>
          <button type="button" onClick={() => onOpenSearch?.(step.title)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: 10, borderRadius: 10, cursor: 'pointer',
                    background: 'var(--sage-tint)',
                    border: '1px solid var(--sage-soft)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontFamily: 'inherit',
                  }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'var(--paper)', color: 'var(--sage-deep)',
              display: 'grid', placeItems: 'center',
            }}>
              <IconSearch style={{ width: 14, height: 14 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>Search the web</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Find a picture of “{step.title}”</div>
            </div>
            <IconArrowR style={{ width: 14, height: 14, color: 'var(--ink-3)' }} />
          </button>
          {step.photo && (
            <button type="button" onClick={() => onChange({ photo: null })}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'transparent', border: 0, cursor: 'pointer',
                      fontFamily: 'inherit', color: 'var(--ink-2)', fontSize: 11.5,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 4px',
                    }}>
              <IconClose style={{ width: 11, height: 11 }} />
              Remove image &amp; use icon instead
            </button>
          )}
          <div className="meta" style={{ fontSize: 11, marginTop: 2 }}>Or pick an icon:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {swaps.map((s) => {
              const on = s.id === step.icon && !step.photo;
              return (
                <button key={s.id} type="button" onClick={() => onChange({ icon: s.id, photo: null })}
                        style={{
                          width: 42, height: 42, borderRadius: 10,
                          background: cat.bg, color: cat.ink,
                          border: on ? '2px solid var(--sage)' : '1px solid var(--hairline)',
                          display: 'grid', placeItems: 'center', cursor: 'pointer',
                        }} title={s.label}>
                  <Icon name={s.id} style={{ width: 20, height: 20 }} />
                </button>
              );
            })}
            <button type="button"
                    style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: 'var(--bg-tint)', color: 'var(--ink-2)',
                      border: '1px dashed var(--hairline-strong)',
                      display: 'grid', placeItems: 'center', cursor: 'pointer',
                    }} title="Upload">
              <IconImage style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="col" style={{ gap: 6 }}>
          <div className="eyebrow">Title</div>
          <input className="input" value={step.title}
                 onChange={(e) => onChange({ title: e.target.value })} />
        </div>

        {/* Time + duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 10 }}>
          <div className="col" style={{ gap: 6 }}>
            <div className="eyebrow">Start time</div>
            <div style={{ position: 'relative' }}>
              <IconClock style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--ink-3)' }} />
              <input className="input" style={{ paddingLeft: 30 }} value={step.time}
                     onChange={(e) => onChange({ time: e.target.value })} />
            </div>
          </div>
          <div className="col" style={{ gap: 6 }}>
            <div className="eyebrow">Duration</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" className="btn btn--soft btn--icon"
                      onClick={() => onChange({ duration: Math.max(1, step.duration - 1) })}
                      style={{ height: 38 }}>−</button>
              <div style={{
                flex: 1, display: 'grid', placeItems: 'center',
                height: 38, border: '1px solid var(--hairline)', borderRadius: 'var(--r-sm)',
                background: 'var(--paper)', fontWeight: 700,
              }}>{step.duration} min</div>
              <button type="button" className="btn btn--soft btn--icon"
                      onClick={() => onChange({ duration: step.duration + 1 })}
                      style={{ height: 38 }}>+</button>
            </div>
          </div>
        </div>

        {/* Read-aloud sentence */}
        <div className="col" style={{ gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="eyebrow">Read-aloud</div>
            <button type="button" className="btn btn--ghost" style={{ height: 24, padding: '0 8px', fontSize: 12 }}>
              <IconSpeaker style={{ width: 13, height: 13 }} /> Listen
            </button>
          </div>
          <textarea className="input textarea" value={step.note}
                    onChange={(e) => onChange({ note: e.target.value })} />
          <div className="meta" style={{ fontSize: 11 }}>This is what Daybook will say when Sam taps "read".</div>
        </div>

        {/* Category */}
        <div className="col" style={{ gap: 6 }}>
          <div className="eyebrow">Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.values(CATEGORIES).map((c) => {
              const on = c.id === step.category;
              return (
                <button key={c.id} type="button" onClick={() => onChange({ category: c.id })}
                        className={'chip' + (on ? ' chip--active' : '')}
                        style={!on ? { background: c.bg, color: c.ink, boxShadow: 'none' } : { background: c.ink, color: '#fff' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: on ? '#fff' : c.dot }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Extras */}
        <div className="col" style={{ gap: 8 }}>
          <div className="eyebrow">Add-ons</div>
          <AddonRow icon={<IconClock />} title="Visible timer"
                    subtitle="Show a countdown clock during this step." defaultOn />
          <AddonRow icon={<IconSparkle />} title="Choice board"
                    subtitle="Offer two options (e.g. cereal or toast)." defaultOn />
          <AddonRow icon={<IconStar />} title="Reward at end"
                    subtitle="Earn a star when this step is done." />
          <AddonRow icon={<IconSpeaker />} title="Voice note"
                    subtitle="Record yourself reading the step." />
        </div>

      </div>

      <div style={{
        padding: '12px 20px', borderTop: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-tint)',
      }}>
        <div className="meta" style={{ fontSize: 12 }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: 'var(--sage)', marginRight: 6, verticalAlign: 'middle',
          }} />
          Autosaved
        </div>
        <button type="button" className="btn btn--soft" style={{ height: 30, fontSize: 13 }}>
          Done
        </button>
      </div>
    </aside>
  );
}

function AddonRow({ icon, title, subtitle, defaultOn = false }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 10,
      background: 'var(--bg-tint)',
      border: '1px solid var(--hairline)',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: 'var(--paper)', color: 'var(--ink-2)',
        display: 'grid', placeItems: 'center',
      }}>
        {React.cloneElement(icon, { style: { width: 16, height: 16 } })}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        <div className="meta" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{subtitle}</div>
      </div>
      <button type="button"
              onClick={() => setOn(!on)}
              role="switch" aria-checked={on}
              style={{
                position: 'relative', width: 34, height: 20, borderRadius: 999,
                background: on ? 'var(--sage)' : 'rgba(0,0,0,.15)',
                border: 0, cursor: 'pointer', flexShrink: 0,
                transition: 'background .15s',
              }}>
        <i style={{
          position: 'absolute', top: 2, left: 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
          transition: 'transform .15s',
          transform: on ? 'translateX(14px)' : '',
          display: 'block',
        }} />
      </button>
    </div>
  );
}

Object.assign(window, { BuilderScreen });
