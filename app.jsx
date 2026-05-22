// app.jsx — main router + tweaks panel

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "textScale": 100,
  "categoryColors": true,
  "showTimes": true,
  "darkRail": false,
  "accent": "#3D4A3D"
}/*EDITMODE-END*/;

function App() {
  const [screen, setScreen] = React.useState('builder'); // open on the builder so the image search is one click away
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks as CSS variables on the root.
  React.useEffect(() => {
    const r = document.documentElement;
    const scale = (t.textScale || 100) / 100;
    r.style.setProperty('--text-scale', scale);
    document.body.style.fontSize = (15 * scale) + 'px';

    if (!t.categoryColors) {
      r.style.setProperty('--cat-routine-bg', '#F0EDE5');
      r.style.setProperty('--cat-hygiene-bg', '#F0EDE5');
      r.style.setProperty('--cat-school-bg',  '#F0EDE5');
      r.style.setProperty('--cat-social-bg',  '#F0EDE5');
      r.style.setProperty('--cat-food-bg',    '#F0EDE5');
      r.style.setProperty('--cat-calm-bg',    '#F0EDE5');
      r.style.setProperty('--cat-routine', '#5A6058');
      r.style.setProperty('--cat-hygiene', '#5A6058');
      r.style.setProperty('--cat-school',  '#5A6058');
      r.style.setProperty('--cat-social',  '#5A6058');
      r.style.setProperty('--cat-food',    '#5A6058');
      r.style.setProperty('--cat-calm',    '#5A6058');
    } else {
      // Restore defaults
      r.style.removeProperty('--cat-routine-bg');
      r.style.removeProperty('--cat-hygiene-bg');
      r.style.removeProperty('--cat-school-bg');
      r.style.removeProperty('--cat-social-bg');
      r.style.removeProperty('--cat-food-bg');
      r.style.removeProperty('--cat-calm-bg');
      r.style.removeProperty('--cat-routine');
      r.style.removeProperty('--cat-hygiene');
      r.style.removeProperty('--cat-school');
      r.style.removeProperty('--cat-social');
      r.style.removeProperty('--cat-food');
      r.style.removeProperty('--cat-calm');
    }

    r.style.setProperty('--sage-deep', t.accent);
  }, [t.textScale, t.categoryColors, t.accent]);

  // Inject density styles
  const densityStyle = {
    compact: { '--space': '12px' },
    regular: { '--space': '16px' },
    comfy:   { '--space': '22px' },
  }[t.density] || {};

  // Child view hides chrome — just preview takes the whole viewport
  const isChildMode = screen === 'preview' || screen === 'print';

  return (
    <div className={'app' + (isChildMode ? ' child-mode' : '')}
         data-screen-label={({
           home: '01 Home',
           templates: '02 Templates',
           builder: '03 Builder',
           preview: '04 Child View',
           library: '05 My Boards',
           print: '06 Print Preview',
         })[screen]}
         style={densityStyle}>
      {!isChildMode && <Sidebar active={screen} onNav={setScreen} />}

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
        {screen === 'home'      && <HomeScreen      onNav={setScreen} tweaks={t} />}
        {screen === 'templates' && <TemplatesScreen onNav={setScreen} tweaks={t} />}
        {screen === 'builder'   && <BuilderScreen   onNav={setScreen} tweaks={t} />}
        {screen === 'preview'   && <PreviewScreen   onNav={setScreen} tweaks={t} />}
        {screen === 'library'   && <LibraryScreen   onNav={setScreen} tweaks={t} />}
        {screen === 'print'     && <PrintScreen     onNav={setScreen} tweaks={t} />}
      </div>

      <TweaksPanel title="Daybook tweaks">
        <TweakSection label="Reading & comfort" />
        <TweakSlider label="Text size" value={t.textScale} min={85} max={130} step={5} unit="%"
                     onChange={(v) => setTweak('textScale', v)} />
        <TweakRadio label="Density" value={t.density}
                    options={['compact', 'regular', 'comfy']}
                    onChange={(v) => setTweak('density', v)} />
        <TweakToggle label="Show start times" value={t.showTimes}
                     onChange={(v) => setTweak('showTimes', v)} />

        <TweakSection label="Sensory" />
        <TweakToggle label="Category colors" value={t.categoryColors}
                     onChange={(v) => setTweak('categoryColors', v)} />
        <TweakColor label="Accent" value={t.accent}
                    options={['#3D4A3D', '#3F5664', '#564A6B', '#1F2A2E']}
                    onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Navigate" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            ['home', 'Home'], ['templates', 'Templates'],
            ['builder', 'Builder'], ['library', 'My Boards'],
            ['preview', 'Child View'], ['print', 'Print'],
          ].map(([id, label]) => (
            <button key={id} type="button"
                    onClick={() => setScreen(id)}
                    style={{
                      appearance: 'none', border: 0,
                      height: 26, padding: '0 8px', borderRadius: 7, cursor: 'pointer',
                      background: screen === id ? 'rgba(0,0,0,.78)' : 'rgba(0,0,0,.06)',
                      color: screen === id ? '#fff' : 'inherit',
                      fontFamily: 'inherit', fontSize: 11.5, fontWeight: 500,
                    }}>{label}</button>
          ))}
        </div>
      </TweaksPanel>

      <StandaloneTweaksButton />
    </div>
  );
}

// When running outside the design tool (e.g. on GitHub Pages), there's no
// toolbar toggle to open the Tweaks panel. This floating button fills that
// gap by posting __activate_edit_mode at the panel's own window.message
// listener. We hide ourselves whenever the panel is open (mirroring
// __activate / __deactivate) so the button doesn't double up.
function StandaloneTweaksButton() {
  const [open, setOpen] = React.useState(false);
  // Hide entirely inside the design tool — its own toolbar provides the toggle.
  const insideHost = typeof window !== 'undefined' && window.parent !== window;

  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);
      else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (insideHost || open) return null;
  return (
    <button type="button"
            onClick={() => window.postMessage({ type: '__activate_edit_mode' }, '*')}
            aria-label="Open tweaks"
            style={{
              position: 'fixed', right: 18, bottom: 18, zIndex: 2147483645,
              appearance: 'none', border: 0, cursor: 'pointer',
              padding: '10px 16px 10px 12px', borderRadius: 999,
              background: 'rgba(20,18,14,.85)', color: '#fff',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(20, 18, 14, .25), 0 0 0 1px rgba(255,255,255,.08) inset',
            }}>
      <IconSparkle style={{ width: 16, height: 16 }} />
      Customize
    </button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
