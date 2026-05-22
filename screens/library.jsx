// screens/library.jsx — list of saved boards
function LibraryScreen({ route, navigate }) {
  const store = useStore();
  const [view, setView] = React.useState('grid');
  const [filter, setFilter] = React.useState('all'); // all | <childId>

  const allBoards = [...store.state.boards].sort((a, b) => b.updatedAt - a.updatedAt);
  const boards = filter === 'all' ? allBoards : allBoards.filter((b) => b.childId === filter);

  return (
    <>
      <PageHeader
        title="My boards"
        subtitle={`${allBoards.length} board${allBoards.length === 1 ? '' : 's'} in your library`}
        actions={
          <button className="btn btn--primary" type="button" onClick={() => navigate('/templates')}>
            <IconPlus /><span className="btn-label">New board</span>
          </button>
        }
      />

      <Page>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <button type="button"
                  className={'chip' + (filter === 'all' ? ' chip--active' : '')}
                  onClick={() => setFilter('all')}>
            All · {allBoards.length}
          </button>
          {store.state.children.map((c) => {
            const count = allBoards.filter((b) => b.childId === c.id).length;
            const active = filter === c.id;
            const cc = CATEGORIES[c.color] || CATEGORIES.routine;
            return (
              <button key={c.id} type="button"
                      className={'chip' + (active ? ' chip--active' : '')}
                      onClick={() => setFilter(c.id)}
                      style={!active ? { background: cc.bg, color: cc.ink, boxShadow: 'none' } : undefined}>
                For {c.name} · {count}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--paper)', padding: 3, borderRadius: 9,
            boxShadow: 'inset 0 0 0 1px var(--hairline)',
          }}>
            {[
              { id: 'grid', icon: <IconGrid style={{ width: 13, height: 13 }} />, label: 'Grid' },
              { id: 'list', icon: <IconList style={{ width: 13, height: 13 }} />, label: 'List' },
            ].map((v) => (
              <button key={v.id} type="button" onClick={() => setView(v.id)}
                      style={{
                        border: 0, height: 26, padding: '0 10px', fontSize: 12, fontWeight: 700,
                        borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
                        background: view === v.id ? 'var(--bg-tint)' : 'transparent',
                        color: 'var(--ink)',
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="card" style={{
            padding: '60px 32px', textAlign: 'center',
            background: 'var(--sage-tint)', borderColor: 'var(--sage-soft)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--sage-soft)', color: 'var(--sage-deep)',
              display: 'grid', placeItems: 'center', margin: '0 auto 16px',
            }}>
              <IconLibrary style={{ width: 28, height: 28 }} />
            </div>
            <div className="h1" style={{ marginBottom: 6 }}>No boards here yet</div>
            <div className="meta" style={{ marginBottom: 18 }}>Pick a template to get started.</div>
            <button className="btn btn--primary btn--lg" type="button" onClick={() => navigate('/templates')}>
              <IconPlus /> Browse templates
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid-cards--lg">
            {boards.map((b) => (
              <LibraryBoardCard key={b.id} board={b} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {boards.map((b, i) => (
              <LibraryBoardRow key={b.id} board={b} navigate={navigate} first={i === 0} />
            ))}
          </div>
        )}
      </Page>
    </>
  );
}

function LibraryBoardCard({ board, navigate }) {
  const store = useStore();
  const cat = CATEGORIES[board.category] || CATEGORIES.routine;
  const progress = store.getProgress(board.id);
  const done = progress.doneStepIds.length;
  const total = board.steps.length;
  const child = store.state.children.find((c) => c.id === board.childId);
  const previewSteps = board.steps.slice(0, 6);

  return (
    <div className="card" style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
         onClick={() => navigate('/b/' + board.id)}>
      <div style={{
        aspectRatio: '5 / 3', background: cat.bg, color: cat.ink,
        padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
      }}>
        {previewSteps.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            display: 'grid', placeItems: 'center',
            color: cat.ink, opacity: .55, fontSize: 13, fontWeight: 700,
          }}>Empty board</div>
        ) : (
          previewSteps.map((s, i) => (
            <div key={i} style={{
              background: s.photo ? '#1f1f1f' : 'rgba(255,255,255,.55)',
              borderRadius: 8, position: 'relative', overflow: 'hidden',
              display: 'grid', placeItems: 'center', color: cat.ink,
            }}>
              {s.photo ? (
                <img src={s.photo.thumb} alt=""
                     style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Icon name={s.icon} style={{ width: '46%', height: '46%' }} />
              )}
            </div>
          ))
        )}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div className="h3" style={{
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
          }}>{board.title}</div>
          <CategoryPill id={board.category} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {done > 0
              ? <Progress value={done} total={total} color={cat.ink} />
              : <div className="meta" style={{ fontSize: 12 }}>{relativeTime(board.updatedAt)}{child ? ' · for ' + child.name : ''}</div>}
          </div>
          <div className="meta" style={{ fontSize: 11.5, fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--ink-2)' }}>
            {total} step{total === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  );
}

function LibraryBoardRow({ board, navigate, first }) {
  const store = useStore();
  const cat = CATEGORIES[board.category] || CATEGORIES.routine;
  const progress = store.getProgress(board.id);
  const done = progress.doneStepIds.length;
  const total = board.steps.length;
  const child = store.state.children.find((c) => c.id === board.childId);
  return (
    <div onClick={() => navigate('/b/' + board.id)}
         className="row-board"
         style={{
           display: 'grid', gridTemplateColumns: '46px minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr) 88px auto',
           gap: 16, alignItems: 'center',
           padding: '14px 18px',
           borderTop: first ? 0 : '1px solid var(--hairline)',
           cursor: 'pointer',
         }}
         onMouseEnter={(e) => e.currentTarget.style.background = '#FBF8F1'}
         onMouseLeave={(e) => e.currentTarget.style.background = ''}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: cat.bg, color: cat.ink,
        display: 'grid', placeItems: 'center',
      }}>
        <Icon name={board.steps[0]?.icon || 'sun'} style={{ width: 22, height: 22 }} />
      </div>
      <div className="stack-tight">
        <div className="h3" style={{ fontSize: 15 }}>{board.title}</div>
        <div className="meta" style={{ fontSize: 12 }}>{relativeTime(board.updatedAt)}{child ? ' · for ' + child.name : ''}</div>
      </div>
      <CategoryPill id={board.category} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, maxWidth: 140 }}>
          <Progress value={done} total={total} color={cat.ink} />
        </div>
        <span className="meta" style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, minWidth: 28 }}>
          {done}/{total}
        </span>
      </div>
      <span className="meta" style={{ fontSize: 12, color: 'var(--ink-2)', textAlign: 'right' }}>
        {total} step{total === 1 ? '' : 's'}
      </span>
      <IconArrowR style={{ width: 16, height: 16, color: 'var(--ink-mute)' }} />
    </div>
  );
}

Object.assign(window, { LibraryScreen });
