// screens/templates.jsx — gallery; clicking a template creates a real board
function TemplatesScreen({ route, navigate }) {
  const store = useStore();
  const [cat, setCat] = React.useState('all');
  const cats = ['all', ...Object.keys(CATEGORIES)];

  const list = TEMPLATES.filter((t) => cat === 'all' || t.category === cat);

  return (
    <>
      <PageHeader
        title="Templates"
        subtitle="Start with a tested routine or social story — every one is customizable."
        actions={
          <button className="btn btn--primary" type="button"
                  onClick={() => {
                    const board = store.createBoard({
                      title: 'New board', category: 'routine', steps: [],
                    });
                    navigate('/b/' + board.id);
                  }}>
            <IconPlus /><span className="btn-label">Blank board</span>
          </button>
        }
      />

      <Page>
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
        </div>

        {/* Grid */}
        <div className="grid-cards--lg">
          {list.map((t) => (
            <TemplateCard key={t.id} tpl={t}
                          onOpen={() => useFromTemplate(store, navigate, t)} />
          ))}
        </div>
      </Page>
    </>
  );
}

Object.assign(window, { TemplatesScreen });
