// screens/home.jsx — caregiver landing
function HomeScreen({ onNav, onOpenBoard, tweaks }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // The "today" board is the morning routine, mid-way through.
  const today = RECENT_BOARDS[0];

  return (
    <>
      <Topbar
        title={`${greeting}, Maya`}
        subtitle="Tuesday, March 18 · A quiet morning so far."
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
        {/* ── Today block ────────────────────────────────────────────────── */}
        <section className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: 240 }}>
            <div style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="eyebrow">In progress · Sam</span>
                <span className="pill pill--dot" style={{ background: 'var(--sage-soft)', color: 'var(--sage-deep)' }}>
                  Step 5 of 8
                </span>
              </div>

              <div className="display" style={{ fontSize: 28 }}>{today.title}</div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="meta">Eat breakfast — in progress</span>
                  <span className="meta" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, color: 'var(--ink)' }}>
                    {today.stepsDone}/{today.stepsTotal}
                  </span>
                </div>
                <Progress value={today.stepsDone} total={today.stepsTotal} />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button className="btn btn--primary btn--lg" type="button" onClick={() => onNav('preview')}>
                  <IconPlay /> Read with Sam
                </button>
                <button className="btn btn--soft btn--lg" type="button" onClick={() => onNav('builder')}>
                  Edit board
                </button>
              </div>
            </div>

            {/* Mini step strip on the right */}
            <div style={{
              padding: 24,
              background: 'linear-gradient(180deg, var(--sage-tint) 0%, var(--bg-tint) 100%)',
              borderLeft: '1px solid var(--hairline)',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
              alignContent: 'center',
            }}>
              {MORNING_ROUTINE.steps.map((s, i) => {
                const cat = CATEGORIES[s.category];
                const done = i < today.stepsDone;
                const active = i === today.stepsDone;
                return (
                  <div key={s.id} style={{
                    aspectRatio: '1 / 1', borderRadius: 12,
                    background: done ? 'var(--paper)' : cat.bg,
                    color: cat.ink,
                    opacity: done ? .55 : 1,
                    border: active ? '2px solid var(--sage)' : '1px solid var(--hairline)',
                    display: 'grid', placeItems: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {s.photo ? (
                      <img src={s.photo.thumb} alt={s.photo.title || s.title}
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

        {/* ── Quick templates ──────────────────────────────────────────── */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="h2">Start from a template</h2>
            <button className="btn btn--ghost" style={{ height: 28, padding: '0 10px', fontSize: 13 }}
                    type="button" onClick={() => onNav('templates')}>
              Browse all <IconArrowR style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          }}>
            {TEMPLATES.slice(0, 4).map((t) => (
              <TemplateCard key={t.id} tpl={t}
                            onOpen={() => onNav(t.id === 'morning' ? 'builder' : 'builder')} />
            ))}
          </div>
        </section>

        {/* ── Recent boards ────────────────────────────────────────────── */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 className="h2">Your boards</h2>
            <button className="btn btn--ghost" style={{ height: 28, padding: '0 10px', fontSize: 13 }}
                    type="button" onClick={() => onNav('library')}>
              See all <IconArrowR style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {RECENT_BOARDS.map((b, i) => {
              const cat = CATEGORIES[b.category];
              return (
                <div key={b.id}
                     onClick={() => onNav('builder')}
                     style={{
                       display: 'grid',
                       gridTemplateColumns: '46px 1.4fr 1fr 1fr auto',
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
                    <Icon name={MORNING_ROUTINE.steps[i % MORNING_ROUTINE.steps.length].icon}
                          style={{ width: 22, height: 22 }} />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AvatarStack initials={b.shared} />
                    <IconArrowR style={{ width: 16, height: 16, color: 'var(--ink-mute)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Tips strip ──────────────────────────────────────────────── */}
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
            <div className="h3">A tip for visual schedules</div>
            <div className="meta">Keep each step short and concrete. One verb, one object — and an image that matches your home.</div>
          </div>
          <button className="btn btn--ghost" type="button">More tips</button>
        </section>
      </Page>
    </>
  );
}

Object.assign(window, { HomeScreen });
