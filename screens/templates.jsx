// screens/templates.jsx — gallery
function TemplatesScreen({ onNav }) {
  const [cat, setCat] = React.useState('all');
  const cats = ['all', ...Object.keys(CATEGORIES)];

  const list = TEMPLATES.filter((t) => cat === 'all' || t.category === cat);

  return (
    <>
      <Topbar
        title="Templates"
        subtitle="Start with a tested routine or social story — every one is customizable."
        actions={
          <>
            <button className="btn btn--soft" type="button"><IconSearch />Search templates</button>
            <button className="btn btn--primary" type="button" onClick={() => onNav('builder')}>
              <IconPlus />Blank board
            </button>
          </>
        }
      />

      <Page>
        {/* Hero strip */}
        <section className="card" style={{
          padding: '24px 28px', marginBottom: 24,
          background: 'linear-gradient(135deg, var(--sage-tint) 0%, var(--paper) 70%)',
          borderColor: 'var(--sage-soft)',
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'center',
        }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--sage-deep)' }}>New this week</span>
            <div className="display" style={{ marginTop: 6, marginBottom: 8 }}>
              Big Feelings — a 5-step calming story
            </div>
            <p className="meta" style={{ maxWidth: 460 }}>
              Co-written with school psychologists. Notice, name, breathe, choose, settle —
              with simple language and gentle pictures.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn btn--primary btn--lg" type="button" onClick={() => onNav('builder')}>
                Open story
              </button>
              <button className="btn btn--ghost btn--lg" type="button">Preview</button>
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
          }}>
            {['calm','heart','wave','hand','star'].map((ic, i) => {
              const tint = ['var(--cat-calm-bg)','var(--cat-food-bg)','var(--cat-routine-bg)','var(--cat-hygiene-bg)','var(--cat-social-bg)'][i];
              const ink  = ['var(--cat-calm)','var(--cat-food)','var(--cat-routine)','var(--cat-hygiene)','var(--cat-social)'][i];
              return (
                <div key={ic} style={{
                  aspectRatio: '1 / 1', borderRadius: 14,
                  background: tint, color: ink,
                  display: 'grid', placeItems: 'center',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 6, left: 8,
                    fontSize: 11, fontWeight: 700, color: ink, opacity: .7,
                  }}>{i + 1}</div>
                  <Icon name={ic} style={{ width: '55%', height: '55%' }} />
                </div>
              );
            })}
          </div>
        </section>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {cats.map((c) => {
            const isAll = c === 'all';
            const C = CATEGORIES[c];
            const active = cat === c;
            return (
              <button key={c} type="button"
                      className={'chip' + (active ? ' chip--active' : '')}
                      onClick={() => setCat(c)}
                      style={!active && !isAll ? {
                        background: C.bg, color: C.ink, boxShadow: 'none',
                      } : undefined}>
                {isAll ? null : <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: active ? '#fff' : C.dot,
                }} />}
                {isAll ? 'All templates' : C.label}
                <span style={{ opacity: .6, fontWeight: 400 }}>
                  · {isAll ? TEMPLATES.length : TEMPLATES.filter((t) => t.category === c).length}
                </span>
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          <button className="btn btn--ghost" style={{ height: 28, padding: '0 10px', fontSize: 13 }} type="button">
            <IconGrid /> Grid
          </button>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
        }}>
          {list.map((t) => (
            <TemplateCard key={t.id} tpl={t} onOpen={() => onNav('builder')} />
          ))}
        </div>
      </Page>
    </>
  );
}

Object.assign(window, { TemplatesScreen });
