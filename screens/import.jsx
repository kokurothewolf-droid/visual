// screens/import.jsx — receives a shared board, prompts to add to library

function ImportScreen({ route, navigate }) {
  const store = useStore();
  const board = React.useMemo(() => {
    const encoded = route.query.d;
    if (!encoded) return null;
    return decodeBoardFromShare(encoded);
  }, [route.query.d]);

  if (!board) {
    return (
      <Page>
        <div className="card" style={{ padding: '40px 32px', maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--cat-food-bg)', color: 'var(--cat-food)',
            display: 'grid', placeItems: 'center', margin: '0 auto 16px',
          }}>
            <IconClose style={{ width: 28, height: 28 }} />
          </div>
          <div className="h1" style={{ fontSize: 22, marginBottom: 8 }}>Couldn't read this link</div>
          <p className="meta" style={{ marginBottom: 20 }}>
            The share link is missing or doesn't look right.
            Ask the sender to copy it again.
          </p>
          <button className="btn btn--primary btn--lg" type="button"
                  onClick={() => navigate('/')}>
            Go to home
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div style={{ maxWidth: 720, margin: '40px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="eyebrow">Someone shared a board with you</span>
          <div className="display" style={{ marginTop: 8 }}>{board.title}</div>
          <div className="meta" style={{ marginTop: 8 }}>
            {board.steps.length} steps{board.schedule ? ' · ' + board.schedule : ''}
          </div>
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Steps</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {board.steps.map((s, i) => {
              const cat = CATEGORIES[s.category] || CATEGORIES.routine;
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{
                    aspectRatio: '1 / 1', borderRadius: 10,
                    background: photoFrameBg(s.photo, cat.bg), color: cat.ink,
                    display: 'grid', placeItems: 'center', position: 'relative',
                    overflow: 'hidden', border: '1px solid var(--hairline)',
                  }}>
                    {s.photo ? (
                      <img src={s.photo.thumb} alt={s.title}
                           style={photoImgStyle(s.photo)} />
                    ) : (
                      <Icon name={s.icon} style={{ width: '50%', height: '50%' }} />
                    )}
                    <div style={{
                      position: 'absolute', top: 6, left: 8,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(255,255,255,.92)', color: cat.ink,
                      display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
                    }}>{i + 1}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'center' }}>{s.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn--soft btn--lg" type="button"
                  onClick={() => navigate('/')}>
            Cancel
          </button>
          <button className="btn btn--primary btn--lg" type="button"
                  onClick={() => {
                    const id = store.importBoard(board);
                    navigate('/b/' + id);
                  }}>
            <IconPlus /> Add to my boards
          </button>
        </div>

        <div className="meta" style={{ fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          You'll get your own editable copy. The original sender's board is not affected.
        </div>
      </div>
    </Page>
  );
}

Object.assign(window, { ImportScreen });
