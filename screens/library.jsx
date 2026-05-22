// screens/library.jsx — list of saved boards
function LibraryScreen({ onNav }) {
  const [view, setView] = React.useState('grid');
  const all = [
    ...RECENT_BOARDS,
    { id: 'e', title: 'Bedtime Wind-down',         stepsDone: 0, stepsTotal: 6, category: 'routine', lastUsed: 'Last night', shared: ['M','D'] },
    { id: 'f', title: 'Shower Steps',              stepsDone: 0, stepsTotal: 7, category: 'hygiene', lastUsed: '5 days ago', shared: ['M'] },
    { id: 'g', title: 'Riley\u2019s Lunch Choices', stepsDone: 0, stepsTotal: 4, category: 'food',    lastUsed: 'Last week', shared: ['M','D'] },
    { id: 'h', title: 'Going to the Park',         stepsDone: 0, stepsTotal: 5, category: 'social',  lastUsed: '2 weeks ago', shared: ['M','G'] },
  ];

  return (
    <>
      <Topbar
        title="My boards"
        subtitle={`${all.length} boards · 2 in progress today`}
        actions={
          <>
            <button className="btn btn--soft" type="button"><IconSearch />Search</button>
            <button className="btn btn--primary" type="button" onClick={() => onNav('templates')}>
              <IconPlus />New board
            </button>
          </>
        }
      />

      <Page>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <button className="chip chip--active" type="button">All · {all.length}</button>
          <button className="chip" type="button">For Sam · 6</button>
          <button className="chip" type="button">For Riley · 1</button>
          <button className="chip" type="button">Shared with me · 3</button>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--paper)', padding: 3, borderRadius: 9,
            boxShadow: 'inset 0 0 0 1px var(--hairline)',
          }}>
            <button type="button" onClick={() => setView('grid')}
                    style={{
                      border: 0, height: 26, padding: '0 10px', fontSize: 12, fontWeight: 700,
                      borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
                      background: view === 'grid' ? 'var(--bg-tint)' : 'transparent',
                      color: 'var(--ink)',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
              <IconGrid style={{ width: 13, height: 13 }} /> Grid
            </button>
            <button type="button" onClick={() => setView('list')}
                    style={{
                      border: 0, height: 26, padding: '0 10px', fontSize: 12, fontWeight: 700,
                      borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
                      background: view === 'list' ? 'var(--bg-tint)' : 'transparent',
                      color: 'var(--ink)',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
              <IconList style={{ width: 13, height: 13 }} /> List
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {all.map((b) => {
              const cat = CATEGORIES[b.category];
              // pick a few demo icons per category
              const sampleIcons = MORNING_ROUTINE.steps.filter((s) => s.category === b.category).map((s) => s.icon)
                .concat(['sun','tooth','shirt','bowl','star','heart']).slice(0, 6);
              return (
                <div key={b.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }}
                     onClick={() => onNav('builder')}>
                  <div style={{
                    aspectRatio: '5 / 3', background: cat.bg, color: cat.ink,
                    padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
                  }}>
                    {sampleIcons.map((ic, i) => (
                      <div key={i} style={{
                        background: 'rgba(255,255,255,.55)', borderRadius: 8,
                        display: 'grid', placeItems: 'center', color: cat.ink,
                      }}>
                        <Icon name={ic} style={{ width: '46%', height: '46%' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <div className="h3">{b.title}</div>
                      <CategoryPill id={b.category} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10 }}>
                      <div style={{ flex: 1 }}>
                        {b.stepsDone > 0
                          ? <Progress value={b.stepsDone} total={b.stepsTotal} color={cat.ink} />
                          : <div className="meta" style={{ fontSize: 12 }}>{b.lastUsed}</div>}
                      </div>
                      <AvatarStack initials={b.shared} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {all.map((b, i) => {
              const cat = CATEGORIES[b.category];
              return (
                <div key={b.id}
                     onClick={() => onNav('builder')}
                     style={{
                       display: 'grid', gridTemplateColumns: '46px 1.4fr 1fr 1fr auto auto',
                       gap: 16, alignItems: 'center',
                       padding: '14px 18px',
                       borderTop: i ? '1px solid var(--hairline)' : 0,
                       cursor: 'pointer',
                     }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: cat.bg, color: cat.ink,
                    display: 'grid', placeItems: 'center',
                  }}>
                    <Icon name="sun" style={{ width: 22, height: 22 }} />
                  </div>
                  <div className="stack-tight">
                    <div className="h3" style={{ fontSize: 15 }}>{b.title}</div>
                    <div className="meta" style={{ fontSize: 12 }}>{b.lastUsed}</div>
                  </div>
                  <CategoryPill id={b.category} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, maxWidth: 140 }}>
                      <Progress value={b.stepsDone} total={b.stepsTotal} color={cat.ink} />
                    </div>
                    <span className="meta" style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, minWidth: 28 }}>
                      {b.stepsDone}/{b.stepsTotal}
                    </span>
                  </div>
                  <AvatarStack initials={b.shared} />
                  <IconArrowR style={{ width: 16, height: 16, color: 'var(--ink-mute)' }} />
                </div>
              );
            })}
          </div>
        )}
      </Page>
    </>
  );
}

Object.assign(window, { LibraryScreen });
