// screens/print.jsx — printable export
function PrintScreen({ route, navigate, tweaks }) {
  const store = useStore();
  const boardId = route.params.boardId;
  const board = store.getBoard(boardId);
  const child = board ? store.state.children.find((c) => c.id === board.childId) : null;

  const [layout, setLayout] = React.useState('grid');
  const [cols, setCols] = React.useState(3);
  const [showTimes, setShowTimes] = React.useState(true);
  const [showFooter, setShowFooter] = React.useState(true);
  const [paper, setPaper] = React.useState('letter');
  const [shareOpen, setShareOpen] = React.useState(false);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Topbar */}
      <header className="topbar" style={{ padding: '12px 22px', position: 'static' }}>
        <button className="btn btn--ghost btn--icon" type="button"
                onClick={() => navigate('/b/' + board.id)} title="Back to builder">
          <IconArrowL />
        </button>
        <div className="stack-tight">
          <div className="h2">Print preview</div>
          <div className="meta" style={{ fontSize: 12 }}>
            {board.title} · printable handout
          </div>
        </div>
        <div className="spacer" />
        <button className="btn btn--soft" type="button" onClick={() => setShareOpen(true)}>
          <IconShare /><span className="btn-label">Send link</span>
        </button>
        <button className="btn btn--primary" type="button" onClick={() => window.print()}>
          <IconPrint /><span className="btn-label">Print</span>
        </button>
      </header>

      <div className="print-layout" style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '280px 1fr' }}>

        <aside className="print-settings" style={{
          borderRight: '1px solid var(--hairline)', background: 'var(--paper)',
          padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18,
          overflowY: 'auto',
        }}>
          <div>
            <div className="eyebrow">Layout</div>
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <LayoutSwatch active={layout === 'grid'} onClick={() => setLayout('grid')}
                            label="Grid" preview={<SwatchGrid />} />
              <LayoutSwatch active={layout === 'checklist'} onClick={() => setLayout('checklist')}
                            label="Checklist" preview={<SwatchChecklist />} />
              <LayoutSwatch active={layout === 'schedule'} onClick={() => setLayout('schedule')}
                            label="Schedule" preview={<SwatchSchedule />} />
            </div>
          </div>

          {layout === 'grid' && (
            <div>
              <div className="eyebrow">Columns</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 4, background: 'var(--bg-tint)', padding: 3, borderRadius: 9 }}>
                {[2, 3, 4].map((n) => (
                  <button key={n} type="button" onClick={() => setCols(n)}
                          style={{
                            flex: 1, height: 30, border: 0, borderRadius: 7, cursor: 'pointer',
                            background: cols === n ? 'var(--paper)' : 'transparent',
                            boxShadow: cols === n ? 'var(--shadow-card)' : 'none',
                            fontWeight: 700, fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)',
                          }}>{n}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="eyebrow">Paper</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 4, background: 'var(--bg-tint)', padding: 3, borderRadius: 9 }}>
              {[['letter', 'US Letter'], ['a4', 'A4']].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setPaper(id)}
                        style={{
                          flex: 1, height: 30, border: 0, borderRadius: 7, cursor: 'pointer',
                          background: paper === id ? 'var(--paper)' : 'transparent',
                          boxShadow: paper === id ? 'var(--shadow-card)' : 'none',
                          fontWeight: 700, fontSize: 13, fontFamily: 'inherit', color: 'var(--ink)',
                        }}>{label}</button>
              ))}
            </div>
          </div>

          <PrintToggle label="Show start times"
                       subtitle="Display 7:00, 7:05, … beside each step."
                       value={showTimes} onChange={setShowTimes} />
          <PrintToggle label="Caregiver footer"
                       subtitle="Add the family name and a notes line."
                       value={showFooter} onChange={setShowFooter} />

          <div className="hairline" />

          <div className="col" style={{ gap: 10 }}>
            <div className="eyebrow">Tip</div>
            <div className="meta" style={{ fontSize: 12 }}>
              Use Cmd/Ctrl + P to print, or save as PDF from the print dialog.
              Handouts include the board's link so recipients can open it on their phone.
            </div>
          </div>
        </aside>

        <div style={{ background: 'var(--bg-tint)', overflow: 'auto', padding: '32px 28px' }}>
          <PrintPaper
            paper={paper}
            layout={layout}
            cols={cols}
            board={board}
            child={child}
            showTimes={showTimes}
            showFooter={showFooter}
          />
        </div>
      </div>

      <ShareModal open={shareOpen} board={board} onClose={() => setShareOpen(false)} />

      <style>{`
        @media print {
          @page { size: ${paper === 'a4' ? 'A4' : 'letter'} portrait; margin: 0; }
          body { background: #fff !important; min-width: 0 !important; }
          .topbar, header, aside, .twk-panel { display: none !important; }
          .print-paper { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function LayoutSwatch({ active, onClick, label, preview }) {
  return (
    <button type="button" onClick={onClick}
            style={{
              padding: 6, borderRadius: 10, cursor: 'pointer',
              background: 'var(--paper)',
              border: active ? '2px solid var(--sage)' : '1px solid var(--hairline)',
              display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
              fontFamily: 'inherit',
            }}>
      <div style={{
        aspectRatio: '0.77 / 1', width: '100%',
        background: '#fff', border: '1px solid var(--hairline)',
        borderRadius: 5, padding: 6,
      }}>{preview}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</div>
    </button>
  );
}
const SwatchGrid = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
    <div style={{ height: 6, background: 'var(--ink-mute)', borderRadius: 1, alignSelf: 'center', width: '60%' }} />
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--cat-routine-bg)', borderRadius: 2 }} />
      ))}
    </div>
  </div>
);
const SwatchChecklist = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
    <div style={{ height: 6, background: 'var(--ink-mute)', borderRadius: 1, alignSelf: 'center', width: '60%' }} />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <div style={{ width: 6, height: 6, border: '1px solid var(--ink-mute)', borderRadius: 1 }} />
        <div style={{ width: 7, height: 7, background: 'var(--cat-routine-bg)', borderRadius: 1 }} />
        <div style={{ flex: 1, height: 2, background: 'var(--ink-mute)', borderRadius: 1, opacity: .5 }} />
      </div>
    ))}
  </div>
);
const SwatchSchedule = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
    <div style={{ height: 6, background: 'var(--ink-mute)', borderRadius: 1, alignSelf: 'center', width: '60%' }} />
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '14px 1fr', gap: 3, alignItems: 'start' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{ height: 5, background: 'var(--ink-mute)', borderRadius: 1 }} />
          <div style={{ height: 8, background: 'var(--cat-routine-bg)', borderRadius: 1 }} />
        </React.Fragment>
      ))}
    </div>
  </div>
);

function PrintToggle({ label, subtitle, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
        {subtitle && <div className="meta" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{subtitle}</div>}
      </div>
      <button type="button" onClick={() => onChange(!value)} role="switch" aria-checked={value}
              style={{
                position: 'relative', width: 34, height: 20, borderRadius: 999,
                background: value ? 'var(--sage)' : 'rgba(0,0,0,.15)',
                border: 0, cursor: 'pointer', flexShrink: 0,
              }}>
        <i style={{
          position: 'absolute', top: 2, left: 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
          transition: 'transform .15s',
          transform: value ? 'translateX(14px)' : '',
          display: 'block',
        }} />
      </button>
    </div>
  );
}

// ── The paper page ─────────────────────────────────────────────────────
function PrintPaper({ paper, layout, cols, board, child, showTimes, showFooter }) {
  const ratio = paper === 'a4' ? 1 / 1.414 : 1 / 1.294;
  // Fit to available width on narrow viewports. We scale the paper
  // by setting CSS width and computing height from the aspect ratio,
  // but cap at 760px so it still looks like a sheet on desktop.
  const width = 760;
  const height = Math.round(width / ratio);

  return (
    <div className="print-paper" style={{
      width, height, margin: '0 auto',
      maxWidth: '100%',
      background: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,.04), 0 10px 40px rgba(0,0,0,.10)',
      padding: '56px 64px',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'inherit', color: '#1A1D1A',
      position: 'relative',
    }}>
      <PaperHeader />

      <div style={{ marginTop: 22, marginBottom: 18, textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.005em' }}>{board.title}</div>
        <div style={{
          marginTop: 6, fontSize: 13, color: '#5A6058',
          display: 'inline-flex', alignItems: 'center', gap: 10,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {child && <span>For {child.name}</span>}
          {child && (board.schedule || board.steps.length) ? (
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#B1B3A8' }} />
          ) : null}
          {board.schedule ? <span>{board.schedule}</span> : null}
          {board.schedule && board.steps.length ? (
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#B1B3A8' }} />
          ) : null}
          <span>{board.steps.length} steps</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {layout === 'grid' && <PaperGrid steps={board.steps} cols={cols} showTimes={showTimes} />}
        {layout === 'checklist' && <PaperChecklist steps={board.steps} showTimes={showTimes} />}
        {layout === 'schedule' && <PaperSchedule steps={board.steps} />}
      </div>

      {showFooter && <PaperFooter child={child} />}
    </div>
  );
}

function PaperHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid #E5DECE', paddingBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: '#3D4A3D', color: '#fff',
          display: 'grid', placeItems: 'center',
        }}>
          <IconBrand style={{ width: 16, height: 16 }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Daybook</div>
          <div style={{ fontSize: 10.5, color: '#8A8E83' }}>Visual schedules for families</div>
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 10.5, color: '#8A8E83', lineHeight: 1.4 }}>
        Printed {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

function PaperFooter({ child }) {
  return (
    <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #E5DECE' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8A8E83', marginBottom: 4 }}>
            Notes for today
          </div>
          <div style={{ borderBottom: '1px solid #D8CFBB', height: 18 }} />
          <div style={{ borderBottom: '1px solid #D8CFBB', height: 18, marginTop: 6 }} />
        </div>
        {child && (
          <div style={{ minWidth: 160, textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8A8E83', marginBottom: 4 }}>
              For
            </div>
            <div style={{ fontSize: 12, color: '#1A1D1A', fontWeight: 700 }}>
              {child.name}{child.age != null ? ', age ' + child.age : ''}
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 14, fontSize: 10, color: '#B1B3A8', textAlign: 'center' }}>
        Generated with Daybook — visual schedules &amp; stories for neurodiverse families.
      </div>
    </div>
  );
}

function PaperGrid({ steps, cols, showTimes }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 14, height: '100%', alignContent: 'flex-start',
    }}>
      {steps.map((s, i) => {
        const cat = CATEGORIES[s.category] || CATEGORIES.routine;
        return (
          <div key={s.id || i} style={{ display: 'flex', flexDirection: 'column', gap: 6, breakInside: 'avoid' }}>
            <div style={{
              aspectRatio: '1 / 1',
              background: s.photo ? '#1f1f1f' : cat.bg, color: cat.ink,
              borderRadius: 10, position: 'relative',
              display: 'grid', placeItems: 'center',
              border: '1px solid #E5DECE', overflow: 'hidden',
            }}>
              {s.photo ? (
                <img src={s.photo.thumb} alt={s.photo.title || s.title}
                     style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon name={s.icon} style={{ width: '52%', height: '52%' }} />
              )}
              <div style={{
                position: 'absolute', top: 6, left: 8,
                width: 22, height: 22, borderRadius: '50%',
                background: s.photo ? 'rgba(255,255,255,.92)' : 'transparent',
                display: 'grid', placeItems: 'center',
                fontSize: 13, fontWeight: 700, color: cat.ink, opacity: .92,
              }}>{i + 1}</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 2 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D1A' }}>{s.title}</div>
              {showTimes && (s.time || s.duration) && (
                <div style={{ fontSize: 11, color: '#5A6058', marginTop: 1 }}>
                  {s.time}{s.time && s.duration ? ' · ' : ''}{s.duration ? s.duration + ' min' : ''}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaperChecklist({ steps, showTimes }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, color: '#5A6058', marginBottom: 4, fontStyle: 'italic', textAlign: 'center' }}>
        Put a check next to each step after it's finished…
      </div>
      {steps.map((s, i) => {
        const cat = CATEGORIES[s.category] || CATEGORIES.routine;
        return (
          <div key={s.id || i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 14px', border: '1px solid #E5DECE',
            borderRadius: 10, breakInside: 'avoid',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 5,
              border: '2px solid #5A6058', flexShrink: 0,
            }} />
            <div style={{
              width: 56, height: 56, borderRadius: 8,
              background: s.photo ? '#1f1f1f' : cat.bg, color: cat.ink,
              display: 'grid', placeItems: 'center', overflow: 'hidden',
              flexShrink: 0, position: 'relative',
            }}>
              {s.photo ? (
                <img src={s.photo.thumb} alt={s.photo.title || s.title}
                     style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon name={s.icon} style={{ width: 32, height: 32 }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                <span style={{ color: '#8A8E83', marginRight: 8 }}>{i + 1}.</span>{s.title}
              </div>
              {s.note && <div style={{ fontSize: 12, color: '#5A6058', marginTop: 2 }}>{s.note}</div>}
            </div>
            {showTimes && (s.time || s.duration) && (
              <div style={{ textAlign: 'right', minWidth: 76, color: '#1A1D1A' }}>
                {s.time && <div style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{s.time}</div>}
                {s.duration ? <div style={{ fontSize: 10.5, color: '#8A8E83' }}>{s.duration} min</div> : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaperSchedule({ steps }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '74px 1fr', borderTop: '2px solid #1A1D1A' }}>
      {steps.map((s, i) => {
        const cat = CATEGORIES[s.category] || CATEGORIES.routine;
        return (
          <React.Fragment key={s.id || i}>
            <div style={{
              padding: '14px 12px 14px 0',
              borderBottom: i === steps.length - 1 ? '2px solid #1A1D1A' : '1px solid #E5DECE',
              fontVariantNumeric: 'tabular-nums',
              fontSize: 16, fontWeight: 700, color: '#1A1D1A',
              textAlign: 'right',
            }}>
              {s.time || '—'}
              {s.duration ? <div style={{ fontSize: 11, color: '#8A8E83', fontWeight: 400, marginTop: 2 }}>{s.duration} min</div> : null}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 14px',
              borderBottom: i === steps.length - 1 ? '2px solid #1A1D1A' : '1px solid #E5DECE',
              borderLeft: `4px solid ${cat.ink}`,
              background: i % 2 === 0 ? 'transparent' : '#FAFAF6',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: s.photo ? '#1f1f1f' : cat.bg, color: cat.ink,
                display: 'grid', placeItems: 'center', overflow: 'hidden',
                flexShrink: 0, position: 'relative',
              }}>
                {s.photo ? (
                  <img src={s.photo.thumb} alt={s.photo.title || s.title}
                       style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Icon name={s.icon} style={{ width: 28, height: 28 }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{s.title}</div>
                {s.note && <div style={{ fontSize: 11.5, color: '#5A6058' }}>{s.note}</div>}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase',
                color: cat.ink, background: cat.bg, padding: '3px 8px', borderRadius: 999,
              }}>{cat.label}</div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, { PrintScreen });
