// components.jsx — shared layout pieces

// Sidebar -----------------------------------------------------------------
function Sidebar({ active, onNav }) {
  const item = (id, icon, label) => (
    <button type="button" className={'nav-item' + (active === id ? ' nav-item--active' : '')}
            onClick={() => onNav(id)}>
      {icon} <span>{label}</span>
    </button>
  );
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><IconBrand style={{ width: 18, height: 18 }} /></div>
        <div className="brand-name">Daybook</div>
      </div>

      <nav className="nav">
        {item('home',      <IconHome />,      'Home')}
        {item('templates', <IconTemplates />, 'Templates')}
        {item('library',   <IconLibrary />,   'My Boards')}
      </nav>

      <div>
        <div className="nav-section">Family</div>
        <nav className="nav">
          <button className="nav-item" type="button">
            <span style={{
              width: 18, height: 18, borderRadius: 6,
              background: 'var(--cat-routine-bg)', color: 'var(--cat-routine)',
              display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
            }}>S</span>
            Sam, 7
          </button>
          <button className="nav-item" type="button">
            <span style={{
              width: 18, height: 18, borderRadius: 6,
              background: 'var(--cat-social-bg)', color: 'var(--cat-social)',
              display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
            }}>R</span>
            Riley, 4
          </button>
          <button className="nav-item" type="button">
            <IconPlus /> Add a child
          </button>
        </nav>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button className="nav-item" type="button"><IconShared /> Shared with me</button>
        <button className="nav-item" type="button"><IconSettings /> Settings</button>
        <button className="nav-item" type="button"><IconHelp /> Help</button>

        <div style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 12,
          background: 'var(--paper)', border: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--cat-social-bg)', color: 'var(--cat-social)',
            display: 'grid', placeItems: 'center',
            fontWeight: 700, fontSize: 13,
          }}>M</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Maya Cohen</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Parent · Free plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Topbar — used by content screens (Home, Templates, Library)
function Topbar({ title, subtitle, actions }) {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="h1">{title}</div>
        {subtitle && <div className="meta">{subtitle}</div>}
      </div>
      <div className="spacer" />
      {actions}
    </header>
  );
}

// Page container with consistent padding + max width
function Page({ children, pad = 28, maxW = 1240 }) {
  return (
    <div className="scroll" style={{
      flex: 1, padding: `28px ${pad}px 48px`,
      overflow: 'auto',
    }}>
      <div style={{ maxWidth: maxW, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

// Category pill (used everywhere) ---------------------------------------
function CategoryPill({ id, size = 'sm' }) {
  const c = CATEGORIES[id]; if (!c) return null;
  return (
    <span className="pill" style={{ background: c.bg, color: c.ink, height: size === 'lg' ? 26 : 22, padding: size === 'lg' ? '0 12px' : '2px 9px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}

// Step card — the single most-used component ----------------------------
function StepCard({ step, idx, selected, onSelect, showNumber = true, showTime = true, large = false }) {
  const cat = CATEGORIES[step.category] || CATEGORIES.routine;
  const hasPhoto = !!(step.photo && step.photo.thumb);
  return (
    <div className={'step-card' + (selected ? ' step-card--selected' : '')}
         onClick={onSelect}
         style={{ '--cat-bg': cat.bg, '--cat-ink': cat.ink }}>
      <div className="step-art" style={hasPhoto ? { background: '#1f1f1f' } : undefined}>
        {showNumber && idx != null && <div className="step-num">{idx + 1}</div>}
        {hasPhoto ? (
          <img src={step.photo.thumb} alt={step.photo.title || step.title}
               style={{
                 position: 'absolute', inset: 0, width: '100%', height: '100%',
                 objectFit: 'cover',
               }} />
        ) : (
          <Icon name={step.icon} />
        )}
      </div>
      <div className="step-meta">
        <div className="step-title" style={{ fontSize: large ? 18 : 16 }}>{step.title}</div>
        {showTime && (
          <div className="step-sub">
            <IconClock style={{ width: 14, height: 14, opacity: .6 }} />
            <span>{step.time}</span>
            <span style={{ color: 'var(--ink-mute)' }}>·</span>
            <span>{step.duration} min</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Template card (gallery) -----------------------------------------------
function TemplateCard({ tpl, onOpen }) {
  const cat = CATEGORIES[tpl.category] || CATEGORIES.routine;
  return (
    <div className="card" style={{ cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
         onClick={onOpen}>
      <div style={{
        aspectRatio: '5 / 3',
        background: cat.bg, color: cat.ink,
        padding: 14, display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
      }}>
        {tpl.icons.slice(0, 6).map((ic, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,.55)', borderRadius: 8,
            display: 'grid', placeItems: 'center',
            color: cat.ink,
          }}>
            <Icon name={ic} style={{ width: '46%', height: '46%' }} />
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div className="h3">{tpl.title}</div>
          <CategoryPill id={tpl.category} />
        </div>
        <div className="meta" style={{ fontSize: 13 }}>{tpl.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="meta" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{tpl.steps} steps</span>
          <button className="btn btn--ghost" style={{ height: 28, padding: '0 10px', fontSize: 13 }} type="button">
            Use template <IconArrowR style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mini avatar stack ------------------------------------------------------
function AvatarStack({ initials, size = 22 }) {
  return (
    <div style={{ display: 'flex' }}>
      {initials.map((c, i) => (
        <div key={i} style={{
          width: size, height: size, borderRadius: '50%',
          background: ['#E4ECDE','#E2EBF1','#E8E0F0','#F0E4D1'][i % 4],
          color: ['#3D4A3D','#3F5664','#564A6B','#6E5232'][i % 4],
          marginLeft: i ? -6 : 0,
          border: '2px solid var(--paper)',
          display: 'grid', placeItems: 'center',
          fontSize: 10.5, fontWeight: 700,
        }}>{c}</div>
      ))}
    </div>
  );
}

// Progress bar -----------------------------------------------------------
function Progress({ value, total, color = 'var(--sage)' }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{
      height: 8, borderRadius: 999, background: 'var(--bg-tint)',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, width: pct + '%',
        background: color, borderRadius: 999,
        transition: 'width .3s',
      }} />
    </div>
  );
}

Object.assign(window, {
  Sidebar, Topbar, Page, CategoryPill, StepCard, TemplateCard, AvatarStack, Progress,
});
