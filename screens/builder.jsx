// screens/builder.jsx — the core editor (full CRUD, drag-reorder)
function BuilderScreen({ route, navigate, tweaks }) {
  const store = useStore();
  const boardId = route.params.boardId;
  const board = store.getBoard(boardId);

  const [selId, setSelId] = React.useState(null);
  const [view, setView] = React.useState('grid'); // grid | strip
  const [libTab, setLibTab] = React.useState('icons');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const [shareOpen, setShareOpen] = React.useState(false);
  // Drawer state — used on mobile/tablet; on desktop these are always
  // visible regardless via CSS.
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  // Drag-and-drop state for reorder
  const [dragId, setDragId] = React.useState(null);
  const [dropIdx, setDropIdx] = React.useState(null);

  // Initialize selection to the first step once the board loads.
  React.useEffect(() => {
    if (board && !selId && board.steps[0]) setSelId(board.steps[0].id);
  }, [board, selId]);

  if (!board) {
    return (
      <Page>
        <div className="card" style={{ padding: '40px 32px', maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div className="h1" style={{ marginBottom: 8 }}>Board not found</div>
          <p className="meta" style={{ marginBottom: 20 }}>
            This board may have been deleted or the link is incorrect.
          </p>
          <button className="btn btn--primary btn--lg" type="button" onClick={() => navigate('/library')}>
            Back to my boards
          </button>
        </div>
      </Page>
    );
  }

  const steps = board.steps;
  const sel = steps.find((s) => s.id === selId);
  const selIdx = steps.findIndex((s) => s.id === selId);
  const child = store.state.children.find((c) => c.id === board.childId);

  const updateSel = (patch) => { if (sel) store.updateStep(board.id, sel.id, patch); };
  const openSearch = (q) => { setSearchQuery(q || sel?.title || ''); setSearchOpen(true); };
  const pickFromSearch = (result) => {
    if (sel) store.updateStep(board.id, sel.id, { photo: result });
    setSearchOpen(false);
  };

  // Compute total minutes — handy footer info
  const totalMinutes = steps.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <BuilderSubHeader
        board={board} child={child}
        onTitleClick={(e) => setMenuAnchor(e.currentTarget)}
        view={view} setView={setView}
        onBack={() => navigate('/library')}
        onShare={() => setShareOpen(true)}
        onPrint={() => navigate('/b/' + board.id + '/print')}
        onPreview={() => navigate('/b/' + board.id + '/preview')}
        onOpenLeft={() => setLeftOpen(true)}
        onOpenRight={() => setRightOpen(true)}
        hasSelection={!!sel}
      />

      <div className="builder-workspace">
        <aside className={'builder-rail-left' + (leftOpen ? ' open' : '')}>
          <BuilderLibrary tab={libTab} setTab={setLibTab}
                          onClose={() => setLeftOpen(false)}
                          onOpenSearch={(q) => { setLeftOpen(false); openSearch(q); }}
                          onAddIcon={(it) => {
                            store.addStep(board.id, {
                              icon: it.id, title: it.label, category: it.category, duration: 5,
                            });
                            Promise.resolve().then(() => {
                              const fresh = store.getBoard(board.id);
                              setSelId(fresh?.steps[fresh.steps.length - 1]?.id);
                              setLeftOpen(false);
                            });
                          }} />
        </aside>

        <BuilderCanvas
          board={board} steps={steps} totalMinutes={totalMinutes}
          selId={selId} setSelId={(id) => { setSelId(id); setRightOpen(true); }}
          view={view}
          dragId={dragId} setDragId={setDragId}
          dropIdx={dropIdx} setDropIdx={setDropIdx}
          onReorder={(fromIdx, toIdx) => store.reorderSteps(board.id, fromIdx, toIdx)}
          onAddStep={() => {
            store.addStep(board.id, {
              icon: 'star', title: 'New step', category: board.category, duration: 5,
            });
            Promise.resolve().then(() => {
              const fresh = store.getBoard(board.id);
              setSelId(fresh?.steps[fresh.steps.length - 1]?.id);
            });
          }}
        />

        <aside className={'builder-rail-right' + (rightOpen ? ' open' : '')}>
          <BuilderInspector
            board={board} step={sel} idx={selIdx} total={steps.length}
            onChange={updateSel}
            onClose={() => setRightOpen(false)}
            onOpenSearch={openSearch}
            onMoveUp={selIdx > 0
              ? () => store.reorderSteps(board.id, selIdx, selIdx - 1)
              : null}
            onMoveDown={selIdx < steps.length - 1
              ? () => store.reorderSteps(board.id, selIdx, selIdx + 1)
              : null}
            onDelete={() => {
              if (!sel) return;
              const idx = selIdx;
              store.deleteStep(board.id, sel.id);
              Promise.resolve().then(() => {
                const fresh = store.getBoard(board.id);
                setSelId(fresh?.steps[Math.max(0, idx - 1)]?.id);
              });
            }}
            onDuplicate={() => {
              if (!sel) return;
              const newId = store.duplicateStep(board.id, sel.id);
              if (newId) setSelId(newId);
            }}
          />
        </aside>

        <div className={'builder-rail-scrim' + ((leftOpen || rightOpen) ? ' open' : '')}
             onClick={() => { setLeftOpen(false); setRightOpen(false); }} />
      </div>

      <ImageSearchModal open={searchOpen} query={searchQuery}
                        onSelect={pickFromSearch} onClose={() => setSearchOpen(false)} />
      {menuAnchor && (
        <BoardMenu board={board} anchor={menuAnchor}
                   onClose={() => setMenuAnchor(null)} navigate={navigate} />
      )}
      <ShareModal open={shareOpen} board={board} onClose={() => setShareOpen(false)} />
    </div>
  );
}

// ── Sub-header for the builder ──────────────────────────────────────
function BuilderSubHeader({ board, child, onTitleClick, view, setView,
                            onBack, onShare, onPrint, onPreview,
                            onOpenLeft, onOpenRight, hasSelection }) {
  return (
    <header className="topbar" style={{
      padding: '10px 22px',
      position: 'static', background: 'var(--paper)',
    }}>
      <button className="btn btn--ghost btn--icon" type="button" onClick={onBack}
              title="Back to my boards">
        <IconArrowL />
      </button>

      {/* Mobile/tablet: open the step library drawer */}
      <button className="btn btn--soft btn--icon builder-drawer-only" type="button"
              onClick={onOpenLeft} title="Add step / library"
              aria-label="Open step library">
        <IconPlus />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '0 1 auto' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: 'var(--cat-' + board.category + '-bg)',
          color: 'var(--cat-' + board.category + ')',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name={board.steps[0]?.icon || 'sun'} style={{ width: 20, height: 20 }} />
        </div>
        <div className="stack-tight" style={{ minWidth: 0 }}>
          <button type="button" onClick={onTitleClick}
                  style={{
                    appearance: 'none', border: 0, background: 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '2px 6px', margin: '-2px -6px',
                    borderRadius: 6, color: 'var(--ink)',
                    minWidth: 0, maxWidth: '100%',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span className="h2" style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{board.title}</span>
            <IconChevD style={{ width: 14, height: 14, opacity: .5, flexShrink: 0 }} />
          </button>
          <div className="meta builder-desktop-only" style={{ fontSize: 12 }}>
            {child ? 'For ' + child.name + ' · ' : ''}
            {board.schedule || 'No schedule'} · Saved {relativeTime(board.updatedAt)}
          </div>
        </div>
        <span className="builder-desktop-only"><CategoryPill id={board.category} /></span>
      </div>

      <div className="spacer" />

      <div className="builder-desktop-only" style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'var(--bg-tint)', padding: 3, borderRadius: 10,
        marginRight: 6,
      }}>
        {[
          { id: 'grid',  label: 'Grid',  icon: <IconGrid style={{ width: 14, height: 14 }} /> },
          { id: 'strip', label: 'Strip', icon: <IconList style={{ width: 14, height: 14 }} /> },
        ].map((v) => (
          <button key={v.id} type="button"
                  onClick={() => setView(v.id)}
                  style={{
                    height: 28, padding: '0 10px', fontSize: 13, fontWeight: 700,
                    borderRadius: 8, border: 0, cursor: 'pointer', fontFamily: 'inherit',
                    background: view === v.id ? 'var(--paper)' : 'transparent',
                    boxShadow: view === v.id ? 'var(--shadow-card)' : 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink)',
                  }}>{v.icon} {v.label}</button>
        ))}
      </div>

      <button className="btn btn--soft" type="button" onClick={onShare}>
        <IconShare /><span className="btn-label">Share</span>
      </button>
      <button className="btn btn--soft" type="button" onClick={onPrint}>
        <IconPrint /><span className="btn-label">Print</span>
      </button>
      <button className="btn btn--primary" type="button" onClick={onPreview}>
        <IconPlay /><span className="btn-label">Preview</span>
      </button>
      {/* Mobile/tablet: re-open the step editor drawer if a step is selected */}
      {hasSelection && (
        <button className="btn btn--soft btn--icon builder-drawer-only" type="button"
                onClick={onOpenRight} title="Edit selected step"
                aria-label="Edit step">
          <IconText />
        </button>
      )}
    </header>
  );
}

// ── Left rail: step library ────────────────────────────────────────────
function BuilderLibrary({ tab, setTab, onOpenSearch, onAddIcon, onClose }) {
  return (
    <aside style={{
      borderRight: '1px solid var(--hairline)',
      background: 'var(--bg-tint)',
      display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1,
    }}>
      <div style={{ padding: '16px 16px 10px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div className="h3" style={{ marginBottom: 4 }}>Add a step</div>
          <div className="meta" style={{ fontSize: 12 }}>Tap any tile to append a step.</div>
        </div>
        {onClose && (
          <button className="btn btn--ghost btn--icon builder-drawer-only" type="button"
                  onClick={onClose} title="Close" aria-label="Close library">
            <IconClose />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '0 14px 8px' }}>
        {[
          { id: 'icons',  label: 'Icons',  icon: <IconSparkle style={{ width: 13, height: 13 }} /> },
          { id: 'photos', label: 'Photos', icon: <IconImage style={{ width: 13, height: 13 }} /> },
          { id: 'words',  label: 'Words',  icon: <IconText style={{ width: 13, height: 13 }} /> },
        ].map((t) => (
          <button key={t.id} type="button"
                  onClick={() => setTab(t.id)}
                  style={{
                    flex: 1, height: 30, border: 0, borderRadius: 8,
                    background: tab === t.id ? 'var(--paper)' : 'transparent',
                    color: tab === t.id ? 'var(--ink)' : 'var(--ink-2)',
                    boxShadow: tab === t.id ? 'var(--shadow-card)' : 'none',
                    fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'icons' && <LibraryIconGrid onAdd={onAddIcon} />}
      {tab === 'photos' && <LibraryPhotos onOpenSearch={onOpenSearch} />}
      {tab === 'words' && <LibraryWords />}
    </aside>
  );
}

function LibraryIconGrid({ onAdd }) {
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
            {g.items.map((it) => (
              <button key={it.id} type="button" onClick={() => onAdd(it)}
                   style={{
                     aspectRatio: '1 / 1', borderRadius: 10,
                     background: g.cat.bg, color: g.cat.ink,
                     display: 'grid', placeItems: 'center',
                     cursor: 'pointer',
                     border: '1px solid transparent', fontFamily: 'inherit',
                     position: 'relative',
                     transition: 'transform .1s, border-color .12s',
                   }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = g.cat.ink; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'transparent'; }}
                   title={'Add: ' + it.label}>
                <Icon name={it.id} style={{ width: '50%', height: '50%' }} />
                <span style={{
                  position: 'absolute', bottom: 4, left: 4, right: 4,
                  fontSize: 9.5, fontWeight: 700, textAlign: 'center',
                  color: g.cat.ink, opacity: .8,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{it.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LibraryPhotos({ onOpenSearch }) {
  return (
    <div className="scroll" style={{ flex: 1, padding: '4px 14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button type="button" onClick={() => onOpenSearch('')}
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
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Open picture picker</div>
          <div className="meta" style={{ fontSize: 11.5 }}>Search, upload, stock, or AI.</div>
        </div>
        <IconArrowR style={{ width: 16, height: 16, color: 'var(--ink-3)' }} />
      </button>
      <div className="meta" style={{ fontSize: 11.5, padding: '6px 4px' }}>
        Select a step on the canvas first, then click <strong>Search or generate</strong> in the inspector or this button to attach a picture.
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
        <div key={p}
             style={{
               padding: '9px 12px', borderRadius: 10,
               background: 'var(--paper)', border: '1px solid var(--hairline)',
               fontSize: 13, fontWeight: 700, color: 'var(--ink)',
             }}>{p}</div>
      ))}
      <div className="meta" style={{ fontSize: 11, padding: '8px 4px' }}>
        Phrase-only steps (no image) are coming soon — for now, click an icon to add a step then change the title.
      </div>
    </div>
  );
}

// ── Center: the board canvas ───────────────────────────────────────────
function BuilderCanvas({ board, steps, totalMinutes, selId, setSelId, view,
                         dragId, setDragId, dropIdx, setDropIdx,
                         onReorder, onAddStep }) {
  return (
    <main className="scroll" style={{ minHeight: 0, padding: '20px 28px 40px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div>
          <span className="eyebrow">Board</span>
          <div className="h1" style={{ fontSize: 22, marginTop: 2 }}>
            {steps.length} step{steps.length === 1 ? '' : 's'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="meta" style={{ fontSize: 12 }}>Total time</span>
          <span className="pill" style={{
            background: 'var(--paper)', boxShadow: 'inset 0 0 0 1px var(--hairline)',
            color: 'var(--ink-2)',
          }}>
            <IconClock style={{ width: 12, height: 12 }} /> {totalMinutes} min
          </span>
        </div>
      </div>

      {steps.length === 0 ? (
        <div style={{
          padding: '60px 24px', textAlign: 'center',
          border: '2px dashed var(--hairline-strong)', borderRadius: 14,
          background: 'var(--paper)',
        }}>
          <div className="h2" style={{ marginBottom: 6 }}>This board is empty</div>
          <div className="meta" style={{ marginBottom: 18 }}>
            Click an icon in the left rail to add your first step.
          </div>
          <button className="btn btn--primary btn--lg" type="button" onClick={onAddStep}>
            <IconPlus /> Add a step
          </button>
        </div>
      ) : view === 'grid' ? (
        <DraggableGrid
          steps={steps}
          selId={selId} setSelId={setSelId}
          dragId={dragId} setDragId={setDragId}
          dropIdx={dropIdx} setDropIdx={setDropIdx}
          onReorder={onReorder}
          onAddStep={onAddStep} />
      ) : (
        <StripView steps={steps} selId={selId} setSelId={setSelId} />
      )}

      <div style={{
        marginTop: 28, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        borderRadius: 12, background: 'var(--paper)', border: '1px dashed var(--hairline-strong)',
      }}>
        <IconReorder style={{ width: 18, height: 18, color: 'var(--ink-3)' }} />
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
          <strong style={{ color: 'var(--ink)' }}>Drag</strong> step cards to reorder.
          Click a card to edit, or use the icon rail on the left to add more.
          The Strip view shows your board exactly the way Sam will see it.
        </div>
      </div>
    </main>
  );
}

// ── Drag-and-drop grid ─────────────────────────────────────────────
function DraggableGrid({ steps, selId, setSelId,
                         dragId, setDragId, dropIdx, setDropIdx,
                         onReorder, onAddStep }) {
  const onDragStart = (e, id, idx) => {
    setDragId(id);
    setDropIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox to fire dragstart
    try { e.dataTransfer.setData('text/plain', id); } catch {}
  };
  const onDragOver = (e, idx) => {
    e.preventDefault();
    if (dragId) {
      // Compute insertion point based on whether we're over the left or
      // right half of the target card
      const r = e.currentTarget.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      const insert = e.clientX < mid ? idx : idx + 1;
      if (insert !== dropIdx) setDropIdx(insert);
    }
  };
  const onDrop = (e) => {
    e.preventDefault();
    if (dragId && dropIdx != null) {
      const fromIdx = steps.findIndex((s) => s.id === dragId);
      let toIdx = dropIdx;
      // Account for the slot being collapsed when we remove the dragged item
      if (toIdx > fromIdx) toIdx -= 1;
      if (fromIdx !== toIdx) onReorder(fromIdx, toIdx);
    }
    setDragId(null); setDropIdx(null);
  };
  const onDragEnd = () => { setDragId(null); setDropIdx(null); };

  return (
    <div className="grid-steps"
         onDragOver={(e) => e.preventDefault()}
         onDrop={onDrop}>
      {steps.map((s, i) => (
        <div key={s.id}
             draggable
             onDragStart={(e) => onDragStart(e, s.id, i)}
             onDragEnd={onDragEnd}
             onDragOver={(e) => onDragOver(e, i)}
             style={{
               opacity: dragId === s.id ? .35 : 1,
               position: 'relative',
               transition: 'opacity .12s',
             }}>
          {/* Drop indicator line — appears between cards as you drag */}
          {dragId && dragId !== s.id && dropIdx === i && (
            <div style={{
              position: 'absolute', left: -7, top: 0, bottom: 0,
              width: 3, background: 'var(--sage)', borderRadius: 2,
            }} />
          )}
          {dragId && dragId !== s.id && dropIdx === i + 1 && (
            <div style={{
              position: 'absolute', right: -7, top: 0, bottom: 0,
              width: 3, background: 'var(--sage)', borderRadius: 2,
            }} />
          )}
          <StepCard step={s} idx={i}
                    selected={s.id === selId}
                    onSelect={() => setSelId(s.id)} />
        </div>
      ))}
      <button type="button" onClick={onAddStep} style={{
        aspectRatio: '4 / 3.55', minHeight: 200,
        border: '2px dashed var(--hairline-strong)',
        borderRadius: 'var(--r-md)',
        background: 'transparent', color: 'var(--ink-2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: 'pointer', fontFamily: 'inherit',
      }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--sage)'; e.currentTarget.style.color = 'var(--sage-deep)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--hairline-strong)'; e.currentTarget.style.color = 'var(--ink-2)'; }}>
        <IconPlus />
        <span style={{ fontSize: 13, fontWeight: 700 }}>Add a step</span>
      </button>
    </div>
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
          const cat = CATEGORIES[s.category] || CATEGORIES.routine;
          const isSel = s.id === selId;
          return (
            <React.Fragment key={s.id}>
              <button type="button" onClick={() => setSelId(s.id)}
                      style={{
                        flex: '0 0 132px', textAlign: 'left',
                        border: isSel ? '2px solid var(--sage)' : '1px solid var(--hairline)',
                        borderRadius: 12, padding: 10, background: 'var(--paper)',
                        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8,
                        fontFamily: 'inherit',
                      }}>
                <div style={{
                  aspectRatio: '1 / 1', borderRadius: 10,
                  background: s.photo ? '#1f1f1f' : cat.bg, color: cat.ink,
                  display: 'grid', placeItems: 'center', position: 'relative',
                  overflow: 'hidden',
                }}>
                  {s.photo ? (
                    <img src={s.photo.thumb} alt={s.title}
                         style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Icon name={s.icon} style={{ width: '55%', height: '55%' }} />
                  )}
                  <div style={{
                    position: 'absolute', top: 6, left: 6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(255,255,255,.92)', color: cat.ink,
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 700,
                  }}>{i + 1}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.time || s.duration + ' min'}</div>
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
function BuilderInspector({ board, step, idx, total, onChange, onClose,
                            onDelete, onDuplicate, onOpenSearch,
                            onMoveUp, onMoveDown }) {
  if (!step) {
    return (
      <aside style={{
        borderLeft: '1px solid var(--hairline)', background: 'var(--paper)',
        padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
        color: 'var(--ink-3)', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', flex: 1,
      }}>
        <IconText style={{ width: 28, height: 28 }} />
        <div className="meta">Select a step to edit its details.</div>
      </aside>
    );
  }

  const cat = CATEGORIES[step.category] || CATEGORIES.routine;
  const swaps = STEP_LIBRARY.filter((s) => s.category === step.category).slice(0, 6);

  return (
    <aside style={{
      borderLeft: '1px solid var(--hairline)', background: 'var(--paper)',
      display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1,
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}>
        <div className="stack-tight" style={{ minWidth: 0 }}>
          <div className="eyebrow">Step {idx + 1} of {total}</div>
          <div className="h3">Edit step</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn--ghost btn--icon" type="button"
                  title="Move up" onClick={onMoveUp} disabled={!onMoveUp}
                  style={{ opacity: onMoveUp ? 1 : .3 }}>
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 style={{ width: 16, height: 16 }}>
              <path d="M7 18 L16 9 L25 18" />
            </svg>
          </button>
          <button className="btn btn--ghost btn--icon" type="button"
                  title="Move down" onClick={onMoveDown} disabled={!onMoveDown}
                  style={{ opacity: onMoveDown ? 1 : .3 }}>
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 style={{ width: 16, height: 16 }}>
              <path d="M7 14 L16 23 L25 14" />
            </svg>
          </button>
          <button className="btn btn--ghost btn--icon" type="button" title="Duplicate" onClick={onDuplicate}>
            <IconCopy />
          </button>
          <button className="btn btn--ghost btn--icon" type="button" title="Delete" onClick={onDelete}
                  style={{ color: 'var(--cat-food)' }}>
            <IconTrash />
          </button>
          {onClose && (
            <button className="btn btn--ghost btn--icon builder-drawer-only" type="button"
                    title="Close" onClick={onClose} aria-label="Close edit panel">
              <IconClose />
            </button>
          )}
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, minHeight: 0, padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Preview tile */}
        <div style={{
          aspectRatio: '4 / 3', borderRadius: 12,
          background: step.photo ? '#1f1f1f' : cat.bg, color: cat.ink,
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
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>Search or generate</div>
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
          </div>
        </div>

        {/* Title */}
        <div className="col" style={{ gap: 6 }}>
          <div className="eyebrow">Title</div>
          <input className="input" value={step.title}
                 onChange={(e) => onChange({ title: e.target.value })} />
        </div>

        {/* Time + duration */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 10 }}>
          <div className="col" style={{ gap: 6 }}>
            <div className="eyebrow">Start time</div>
            <div style={{ position: 'relative' }}>
              <IconClock style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--ink-3)' }} />
              <input className="input" style={{ paddingLeft: 30 }} value={step.time || ''}
                     placeholder="7:00"
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
          </div>
          <textarea className="input textarea" value={step.note || ''}
                    onChange={(e) => onChange({ note: e.target.value })} />
          <div className="meta" style={{ fontSize: 11 }}>What Daybook will say in the child view.</div>
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
          Saved automatically
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { BuilderScreen });
