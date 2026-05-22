// components.jsx — shared layout pieces (Sidebar/Topbar removed in favor of top-nav.jsx)

// Page container with consistent padding + max width
function Page({ children, pad = 28, maxW = 1240 }) {
  return (
    <div className="scroll page-pad" style={{
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
  // Show a meta row only when there's something to show — otherwise we'd
  // render a bare clock icon with no text, which looks broken.
  const hasMeta = showTime && (step.time || step.duration);
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
        {hasMeta ? (
          <div className="step-sub">
            <IconClock style={{ width: 14, height: 14, opacity: .6, flexShrink: 0 }} />
            {step.time && <span>{step.time}</span>}
            {step.time && step.duration ? (
              <span style={{ color: 'var(--ink-mute)' }}>·</span>
            ) : null}
            {step.duration ? <span>{step.duration} min</span> : null}
          </div>
        ) : (
          <div className="step-sub" style={{ color: 'var(--ink-mute)', fontStyle: 'italic' }}>
            No time set
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
  Page, CategoryPill, StepCard, TemplateCard, AvatarStack, Progress,
});
