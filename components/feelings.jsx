// components/feelings.jsx — emotion check-in faces + overlay
//
// A calm "How are you feeling?" intro shown before a child runs a board.
// Faces are line-art SVGs in the same 32×32 / 2px-stroke style as icons.jsx
// so they sit naturally in the app. Mood is stored per-board in progress so
// a caregiver can see how the child arrived at the routine.

const MOODS = [
  { id: 'happy',   label: 'Happy',   color: 'routine' },
  { id: 'calm',    label: 'Calm',    color: 'hygiene' },
  { id: 'tired',   label: 'Tired',   color: 'calm'    },
  { id: 'worried', label: 'Worried', color: 'social'  },
  { id: 'upset',   label: 'Upset',   color: 'food'    },
];

const MOOD_BY_ID = Object.fromEntries(MOODS.map((m) => [m.id, m]));

// Each face is drawn in a 32×32 viewBox to match the icon set.
function MoodFace({ id, style }) {
  const props = {
    viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  const face = <circle cx="16" cy="16" r="13" />;
  switch (id) {
    case 'happy':
      return (<svg {...props}>{face}<path d="M11 13 h.01 M21 13 h.01" /><path d="M10 19 c2 3.5 10 3.5 12 0" /></svg>);
    case 'calm':
      return (<svg {...props}>{face}<path d="M10 14 c1.2 -1 2.8 -1 4 0 M18 14 c1.2 -1 2.8 -1 4 0" /><path d="M11 20 c2.5 1.6 7.5 1.6 10 0" /></svg>);
    case 'tired':
      return (<svg {...props}>{face}<path d="M10 14 h4 M18 14 h4" /><path d="M12 21 c1.5 -1.2 6.5 -1.2 8 0" /><path d="M22 9 c1.5 0 1.5 2 0 2" /></svg>);
    case 'worried':
      return (<svg {...props}>{face}<path d="M11 13 h.01 M21 13 h.01" /><path d="M12 11 l3 1.5 M20 11 l-3 1.5" /><path d="M12 21 c2 -2 6 -2 8 0" /></svg>);
    case 'upset':
      return (<svg {...props}>{face}<path d="M11 13 h.01 M21 13 h.01" /><path d="M11 22 c2.5 -2.5 7.5 -2.5 10 0" /><path d="M11 11 l3 1 M21 11 l-3 1" /></svg>);
    default:
      return (<svg {...props}>{face}</svg>);
  }
}

// Full-bleed intro overlay. onPick(moodId) is called when the child taps a
// face; onSkip dismisses without recording. catInk/catBg theme it to the
// board so it feels part of the same flow.
function FeelingsCheckIn({ childName, catInk, catBg, onPick, onSkip }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: catBg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: catInk, opacity: .7, marginBottom: 10 }}>
        Before we start
      </div>
      <h1 style={{ margin: 0, fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.1, fontWeight: 700, color: 'var(--ink)' }}>
        How are you feeling{childName ? ', ' + childName : ''}?
      </h1>
      <div style={{
        marginTop: 36, display: 'flex', gap: 'clamp(12px, 3vw, 28px)',
        flexWrap: 'wrap', justifyContent: 'center', maxWidth: 880,
      }}>
        {MOODS.map((m) => {
          const c = (window.CATEGORIES && window.CATEGORIES[m.color]) || { bg: catBg, ink: catInk };
          return (
            <button key={m.id} type="button" onClick={() => onPick(m.id)}
                    style={{
                      appearance: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
                      background: 'transparent',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                      padding: 8, borderRadius: 20,
                      transition: 'transform .12s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = ''}>
              <span style={{
                width: 'clamp(74px, 13vw, 116px)', height: 'clamp(74px, 13vw, 116px)',
                borderRadius: '50%', background: c.bg, color: c.ink,
                display: 'grid', placeItems: 'center',
                boxShadow: '0 8px 24px rgba(48,40,20,.10)',
              }}>
                <MoodFace id={m.id} style={{ width: '62%', height: '62%' }} />
              </span>
              <span style={{ fontSize: 'clamp(15px, 2.4vw, 19px)', fontWeight: 700, color: 'var(--ink)' }}>
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onSkip}
              style={{
                marginTop: 40, appearance: 'none', border: 0, cursor: 'pointer',
                background: 'rgba(255,255,255,.7)', color: catInk,
                height: 48, padding: '0 24px', borderRadius: 999,
                fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
              }}>
        Skip — just start
      </button>
    </div>
  );
}

Object.assign(window, { MOODS, MOOD_BY_ID, MoodFace, FeelingsCheckIn });
