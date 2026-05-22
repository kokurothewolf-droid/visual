// screens/home.jsx — caregiver landing
function HomeScreen({ route, navigate }) {
  const store = useStore();
  const { boards, currentChildId, children } = store.state;
  const child = children.find((c) => c.id === currentChildId) || children[0];

  const myBoards = boards.filter((b) => !b.childId || b.childId === currentChildId);
  const todayBoard = myBoards[0]; // most recent for this child
  const recentBoards = myBoards.slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const progress = todayBoard ? store.getProgress(todayBoard.id) : null;
  const stepsDone = progress ? progress.doneStepIds.length : 0;
  const stepsTotal = todayBoard?.steps.length || 0;

  return (
    <>
      <PageHeader
        title={`${greeting}, friend`}
        subtitle={`Building boards for ${child?.name || 'your family'} today.`}
        actions={
          <button className="btn btn--primary" type="button" onClick={() => navigate('/templates')}>
            <IconPlus /><span className="btn-label">New board</span>
          </button>
        }
      />

      <Page>
        {todayBoard ? (
          <section className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
            <div className="today-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: 240 }}>
              <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CategoryPill id={todayBoard.category} />
                  {stepsDone > 0 && stepsDone < stepsTotal && (
                    <span className="pill pill--dot"
                          style={{ background: 'var(--sage-soft)', color: 'var(--sage-deep)' }}>
                      Step {stepsDone + 1} of {stepsTotal}
                    </span>
                  )}
                  {stepsDone === 0 && (
                    <span className="pill pill--ghost">Not started</span>
                  )}
                  {stepsDone === stepsTotal && stepsTotal > 0 && (
                    <span className="pill" style={{ background: 'var(--sage-soft)', color: 'var(--sage-deep)' }}>
                      <IconCheck style={{ width: 11, height: 11 }} /> All done
                    </span>
                  )}
                </div>

                <div className="display" style={{ fontSize: 28 }}>{todayBoard.title}</div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="meta">
                      {todayBoard.schedule || todayBoard.steps.length + ' steps'}
                    </span>
                    <span className="meta" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--ink)' }}>
                      {stepsDone}/{stepsTotal}
                    </span>
                  </div>
                  <Progress value={stepsDone} total={stepsTotal} />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 'auto', flexWrap: 'wrap' }}>
                  <button className="btn btn--primary btn--lg" type="button"
                          onClick={() => navigate('/b/' + todayBoard.id + '/preview')}>
                    <IconPlay /> Read with {child?.name || 'them'}
                  </button>
                  <button className="btn btn--soft btn--lg" type="button"
                          onClick={() => navigate('/b/' + todayBoard.id)}>
                    Edit board
                  </button>
                </div>
              </div>

              <div className="today-tiles" style={{
                padding: 24,
                background: 'linear-gradient(180deg, var(--sage-tint) 0%, var(--bg-tint) 100%)',
                borderLeft: '1px solid var(--hairline)',
                display: 'grid',
                gridTemplateColumns: 'repeat(' + Math.min(4, Math.max(2, Math.ceil(todayBoard.steps.length / 2))) + ', 1fr)',
                gap: 10,
                alignContent: 'center',
              }}>
                {todayBoard.steps.slice(0, 8).map((s) => {
                  const cat = CATEGORIES[s.category] || CATEGORIES.routine;
                  const done = progress?.doneStepIds.includes(s.id);
                  return (
                    <div key={s.id} style={{
                      aspectRatio: '1 / 1', borderRadius: 12,
                      background: done ? 'var(--paper)' : (s.photo ? '#1f1f1f' : cat.bg),
                      color: cat.ink,
                      opacity: done ? .5 : 1,
                      border: '1px solid var(--hairline)',
                      display: 'grid', placeItems: 'center',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {s.photo && !done ? (
                        <img src={s.photo.thumb} alt={s.title}
                             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Icon name={s.icon} style={{ width: '52%', height: '52%' }} />
                      )}
                      {done && (
                        <div style={{
                          position: 'absolute', top: 4, right: 4,
                          width: 18, height: 18, borderRadius: '50%',
                          background: 'var(--sage)', color: '#fff',
                          display: 'grid', placeItems: 'center',
                        }}>
                          <IconCheck style={{ width: 11, height: 11 }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <section className="card" style={{
            padding: '36px 32px', marginBottom: 28, textAlign: 'center',
            background: 'var(--sage-tint)', borderColor: 'var(--sage-soft)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'var(--sage-soft)', color: 'var(--sage-deep)',
              display: 'grid', placeItems: 'center', margin: '0 auto 16px',
            }}>
              <IconSparkle style={{ width: 28, height: 28 }} />
            </div>
            <div className="h1" style={{ marginBottom: 6 }}>No boards yet for {child?.name}</div>
            <div className="meta" style={{ marginBottom: 18 }}>Start with a template — every routine adapts to your family.</div>
            <button className="btn btn--primary btn--lg" type="button" onClick={() => navigate('/templates')}>
              <IconPlus /> Build your first board
            </button>
          </section>
        )}

        {/* Quick templates */}
        <section style={{ marginBottom: 28 }}>
          <SectionHead title="Start from a template" onMore={() => navigate('/templates')} moreLabel="Browse all" />
          <div className="grid-cards">
            {TEMPLATES.slice(0, 4).map((t) => (
              <TemplateCard key={t.id} tpl={t} onOpen={() => useFromTemplate(store, navigate, t)} />
            ))}
          </div>
        </section>

        {/* Your boards */}
        {recentBoards.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <SectionHead title={`${child?.name || 'Your'} boards`} onMore={() => navigate('/library')} moreLabel="See all" />
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {recentBoards.map((b, i) => {
                const cat = CATEGORIES[b.category] || CATEGORIES.routine;
                const p = store.getProgress(b.id);
                const done = p.doneStepIds.length;
                const total = b.steps.length;
                return (
                  <div key={b.id}
                       onClick={() => navigate('/b/' + b.id)}
                       className="row-board"
                       style={{
                         display: 'grid',
                         gridTemplateColumns: '46px minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) auto',
                         gap: 16, alignItems: 'center',
                         padding: '14px 18px',
                         borderTop: i ? '1px solid var(--hairline)' : 0,
                         cursor: 'pointer',
                         transition: 'background .12s',
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = '#FBF8F1'}
                       onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: cat.bg, color: cat.ink,
                      display: 'grid', placeItems: 'center',
                    }}>
                      <Icon name={b.steps[0]?.icon || 'sun'} style={{ width: 22, height: 22 }} />
                    </div>
                    <div className="stack-tight">
                      <div className="h3" style={{ fontSize: 15 }}>{b.title}</div>
                      <div className="meta" style={{ fontSize: 12 }}>{relativeTime(b.updatedAt)}</div>
                    </div>
                    <CategoryPill id={b.category} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 140 }}>
                        <Progress value={done} total={total} color={cat.ink} />
                      </div>
                      <span className="meta" style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, minWidth: 28 }}>
                        {done}/{total}
                      </span>
                    </div>
                    <IconArrowR style={{ width: 16, height: 16, color: 'var(--ink-mute)' }} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Tip */}
        <section className="card" style={{
          padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18,
          background: 'var(--sage-tint)', borderColor: 'var(--sage-soft)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--sage-soft)', color: 'var(--sage-deep)',
            display: 'grid', placeItems: 'center',
          }}>
            <IconSparkle style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="h3">Made for sharing</div>
            <div className="meta">Built a board you love? Open it, tap Share, and send the link to a sitter or grandparent — they get an editable copy.</div>
          </div>
        </section>
      </Page>
    </>
  );
}

// Helper used here and in Templates — create a new board from a template
// dataset entry and navigate into the builder.
function useFromTemplate(store, navigate, tpl) {
  // Convert the lightweight TEMPLATES entry into a board the store accepts.
  // Each template's `icons` array becomes the steps' icons; we fill plausible
  // titles for ones that don't ship with real step content.
  const labelByIcon = {
    sun: 'Wake up', tooth: 'Brush teeth', shirt: 'Get dressed', bowl: 'Eat',
    backpack: 'Pack bag', wave: 'Say goodbye', bath: 'Take a bath',
    book: 'Read a book', bed: 'Get into bed', star: 'All done!',
    wash: 'Wash', bus: 'Bus / school', heart: 'Big feelings',
    calm: 'Take a breath', pencil: 'Schoolwork', hand: 'Hand washing',
    car: 'Car ride', cup: 'Drink',
  };
  const seedSteps = tpl.icons.map((ic) => ({
    icon: ic,
    title: labelByIcon[ic] || 'Step',
    time: '',
    duration: 5,
    category: tpl.category,
    note: '',
  }));
  const id = store.createBoard({
    title: tpl.title,
    category: tpl.category,
    schedule: '',
    steps: seedSteps,
  });
  navigate('/b/' + id);
}

// ── Shared sub-bits ────────────────────────────────────────────────
function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-head" style={{
      padding: '24px 28px 18px',
      display: 'flex', alignItems: 'flex-end', gap: 14,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display">{title}</div>
        {subtitle && <div className="meta" style={{ marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>
    </header>
  );
}

function SectionHead({ title, onMore, moreLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 className="h2">{title}</h2>
      {onMore && (
        <button className="btn btn--ghost" style={{ height: 28, padding: '0 10px', fontSize: 13 }}
                type="button" onClick={onMore}>
          {moreLabel || 'See all'} <IconArrowR style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  );
}

// Relative time formatter — "Just now", "5 min ago", "Yesterday", etc.
function relativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return Math.round(diff / 60_000) + ' min ago';
  if (diff < 86_400_000) return Math.round(diff / 3_600_000) + ' hr ago';
  if (diff < 172_800_000) return 'Yesterday';
  if (diff < 7 * 86_400_000) return Math.round(diff / 86_400_000) + ' days ago';
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

Object.assign(window, { HomeScreen, PageHeader, SectionHead, relativeTime, useFromTemplate });
