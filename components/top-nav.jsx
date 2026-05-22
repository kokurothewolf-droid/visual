// components/top-nav.jsx — clean top navigation, replaces sidebar
//
// Layout: brand · primary nav (Home/Templates/My Boards) · child picker
//
// Each screen still renders its own page-level header underneath this for
// breadcrumb / actions, but global nav lives up here.

function TopNav({ route, navigate, scope }) {
  // Hide the global nav inside focused-mode routes (Preview, Print) — they
  // own the whole viewport.
  if (['preview', 'print'].includes(route.name)) return null;

  const item = (target, label) => {
    const active = (target === '/' && route.name === 'home')
      || (target === '/templates' && route.name === 'templates')
      || (target === '/library' && (route.name === 'library' || route.name === 'builder'));
    return (
      <button type="button" onClick={() => navigate(target)}
              className="topnav-link"
              style={{
                appearance: 'none', border: 0,
                cursor: 'pointer', fontFamily: 'inherit',
                height: 36, padding: '0 14px', borderRadius: 999,
                fontSize: 14, fontWeight: 700,
                color: active ? 'var(--ink)' : 'var(--ink-2)',
                background: active ? 'var(--paper)' : 'transparent',
                boxShadow: active ? 'var(--shadow-card)' : 'none',
                transition: 'background .12s, color .12s',
                whiteSpace: 'nowrap',
              }}>{label}</button>
    );
  };

  return (
    <header className="topnav" style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 22px',
      borderBottom: '1px solid var(--hairline)',
      background: 'rgba(242,238,230,.85)',
      backdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Brand */}
      <button type="button" onClick={() => navigate('/')}
              style={{
                appearance: 'none', border: 0, background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                padding: '4px 6px', borderRadius: 10, fontFamily: 'inherit',
                flexShrink: 0,
              }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--sage-deep)', color: '#fff',
          display: 'grid', placeItems: 'center',
        }}>
          <IconBrand style={{ width: 17, height: 17 }} />
        </div>
        <div className="topnav-brand-name" style={{
          fontSize: 16, fontWeight: 700, letterSpacing: '-.01em', color: 'var(--ink)',
        }}>Daybook</div>
      </button>

      <div className="topnav-sep" style={{ width: 1, height: 22, background: 'var(--hairline)' }} />

      <nav style={{ display: 'flex', gap: 2 }}>
        {item('/', 'Home')}
        {item('/templates', 'Templates')}
        {item('/library', 'My boards')}
      </nav>

      <div style={{ flex: 1 }} />

      <ChildPicker scope={scope} />
    </header>
  );
}

function ChildPicker({ scope }) {
  const { state, setCurrentChild, addChild } = scope;
  const [open, setOpen] = React.useState(false);
  const child = state.children.find((c) => c.id === state.currentChildId) || state.children[0];
  if (!child) return null;

  const cat = CATEGORIES[child.color] || CATEGORIES.routine;
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
              style={{
                appearance: 'none', border: '1px solid var(--hairline)',
                background: 'var(--paper)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                height: 36, padding: '0 12px 0 8px', borderRadius: 999,
                fontFamily: 'inherit', color: 'var(--ink)',
              }}>
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: cat.bg, color: cat.ink,
          display: 'grid', placeItems: 'center',
          fontSize: 11.5, fontWeight: 700,
        }}>{child.name[0]}</span>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{child.name}</span>
        {child.age != null && (
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>· {child.age}</span>
        )}
        <IconChevD style={{ width: 12, height: 12, color: 'var(--ink-3)' }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)}
               style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 61,
            minWidth: 220, background: 'var(--paper)',
            border: '1px solid var(--hairline)', borderRadius: 12,
            boxShadow: 'var(--shadow-pop)', padding: 6,
          }}>
            <div style={{
              padding: '6px 10px 4px',
              fontSize: 10.5, fontWeight: 700, letterSpacing: '.10em',
              textTransform: 'uppercase', color: 'var(--ink-3)',
            }}>Children</div>
            {state.children.map((c) => {
              const cc = CATEGORIES[c.color] || CATEGORIES.routine;
              const isCur = c.id === state.currentChildId;
              return (
                <button key={c.id} type="button"
                        onClick={() => { setCurrentChild(c.id); setOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '8px 10px', borderRadius: 8,
                          border: 0, background: isCur ? 'var(--sage-soft)' : 'transparent',
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => !isCur && (e.currentTarget.style.background = 'rgba(0,0,0,.04)')}
                        onMouseLeave={(e) => !isCur && (e.currentTarget.style.background = 'transparent')}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: cc.bg, color: cc.ink,
                    display: 'grid', placeItems: 'center',
                    fontSize: 11.5, fontWeight: 700,
                  }}>{c.name[0]}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, display: 'block' }}>{c.name}</span>
                    {c.age != null && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>Age {c.age}</span>}
                  </span>
                  {isCur && <IconCheck style={{ width: 14, height: 14, color: 'var(--sage-deep)' }} />}
                </button>
              );
            })}
            <div style={{ height: 1, background: 'var(--hairline)', margin: '6px 4px' }} />
            <button type="button"
                    onClick={() => {
                      const name = prompt('Name for this child?');
                      if (!name?.trim()) return;
                      const ageStr = prompt('Age?');
                      const age = parseInt(ageStr, 10) || null;
                      const colors = ['routine','hygiene','school','social','food','calm'];
                      const used = new Set(state.children.map((c) => c.color));
                      const color = colors.find((c) => !used.has(c)) || 'routine';
                      addChild({ name: name.trim(), age, color });
                      setOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '8px 10px', borderRadius: 8,
                      border: 0, background: 'transparent', cursor: 'pointer',
                      fontFamily: 'inherit', textAlign: 'left',
                      fontSize: 13, color: 'var(--ink-2)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <IconPlus style={{ width: 14, height: 14 }} />
              Add a child
            </button>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { TopNav, ChildPicker });
