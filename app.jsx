// app.jsx — top-level router + provider wiring

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "regular",
  "textScale": 100,
  "categoryColors": true,
  "showTimes": true,
  "accent": "#3D4A3D"
}/*EDITMODE-END*/;

function AppInner() {
  const { route, navigate } = useRouter();
  const store = useStore();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authOpen, setAuthOpen] = React.useState(false);
  const backupInputRef = React.useRef(null);

  // Apply tweaks ────────────────────────────────────────────────────
  React.useEffect(() => {
    const r = document.documentElement;
    const scale = (t.textScale || 100) / 100;
    r.style.setProperty('--text-scale', scale);
    document.body.style.fontSize = (15 * scale) + 'px';

    if (!t.categoryColors) {
      const grey = '#F0EDE5', greyInk = '#5A6058';
      ['routine','hygiene','school','social','food','calm'].forEach((c) => {
        r.style.setProperty('--cat-' + c + '-bg', grey);
        r.style.setProperty('--cat-' + c, greyInk);
      });
    } else {
      ['routine','hygiene','school','social','food','calm'].forEach((c) => {
        r.style.removeProperty('--cat-' + c + '-bg');
        r.style.removeProperty('--cat-' + c);
      });
    }
    r.style.setProperty('--sage-deep', t.accent);
  }, [t.textScale, t.categoryColors, t.accent]);

  const densityStyle = {
    compact: { '--space': '12px' },
    regular: { '--space': '16px' },
    comfy:   { '--space': '22px' },
  }[t.density] || {};

  // Focused-mode screens take over the viewport (no global nav, no sidebar)
  const isFocused = route.name === 'preview' || route.name === 'print';

  return (
    <div className={'app' + (isFocused ? ' child-mode' : '')}
         data-screen-label={({
           home: '01 Home',
           templates: '02 Templates',
           about: '08 About',
           library: '03 My Boards',
           builder: '04 Builder',
           preview: '05 Child View',
           print: '06 Print Preview',
           import: '07 Import',
         })[route.name]}
         style={densityStyle}>

      <TopNav route={route} navigate={navigate} scope={store} onOpenAuth={() => setAuthOpen(true)} />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, flex: 1 }}>
        {route.name === 'home'      && <HomeScreen route={route} navigate={navigate} />}
        {route.name === 'templates' && <TemplatesScreen route={route} navigate={navigate} />}
        {route.name === 'about'     && <AboutScreen route={route} navigate={navigate} />}
        {route.name === 'library'   && <LibraryScreen route={route} navigate={navigate} />}
        {route.name === 'builder'   && <BuilderScreen route={route} navigate={navigate} tweaks={t} />}
        {route.name === 'preview'   && <PreviewScreen route={route} navigate={navigate} tweaks={t} />}
        {route.name === 'print'     && <PrintScreen route={route} navigate={navigate} tweaks={t} />}
        {route.name === 'import'    && <ImportScreen route={route} navigate={navigate} />}
      </div>

      <TweaksPanel title="KindCue tweaks">
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

        <TweakSection label="Data" />
        <TweakButton label="Download backup" secondary
                     onClick={() => {
                       const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' });
                       const url = URL.createObjectURL(blob);
                       const a = document.createElement('a');
                       a.href = url; a.download = 'kindcue-backup-' + new Date().toISOString().slice(0, 10) + '.json';
                       document.body.appendChild(a); a.click(); a.remove();
                       setTimeout(() => URL.revokeObjectURL(url), 2000);
                     }} />
        <TweakButton label="Restore from file" secondary
                     onClick={() => backupInputRef.current?.click()} />
        <input ref={backupInputRef} type="file" accept="application/json,.json" hidden
               onChange={async (e) => {
                 const file = e.target.files?.[0];
                 e.target.value = '';
                 if (!file) return;
                 try {
                   const data = JSON.parse(await file.text());
                   if (!data || typeof data !== 'object') throw new Error('bad file');
                   if (!confirm('Restore this backup? It replaces all boards and children on this device.')) return;
                   store.restoreBackup(data);
                   alert('Backup restored.');
                 } catch {
                   alert("Couldn't read that backup file.");
                 }
               }} />
        <TweakButton label="Reset everything to demo"
                     secondary
                     onClick={() => {
                       if (confirm('Reset all boards and progress to the starter demo? This can\'t be undone.')) {
                         store.resetAll();
                         navigate('/');
                       }
                     }} />
      </TweaksPanel>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <StandaloneTweaksButton />
      <InstallAppButton />
      <AssistantWidget store={store} navigate={navigate} route={route} />
    </div>
  );
}

// Floating "Install app" button — appears only when the browser fires
// beforeinstallprompt (Android/desktop Chrome-family) and the app isn't
// already installed. iOS/Safari has no such event; those users install via
// Share → Add to Home Screen instead.
function InstallAppButton() {
  const [deferred, setDeferred] = React.useState(null);
  const [installed, setInstalled] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  );
  React.useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  if (installed || !deferred) return null;
  return (
    <button type="button"
            onClick={async () => { await deferred.prompt(); setDeferred(null); }}
            style={{
              position: 'fixed', left: 18, bottom: 18, zIndex: 2147483645,
              appearance: 'none', border: 0, cursor: 'pointer',
              padding: '10px 16px 10px 12px', borderRadius: 999,
              background: 'var(--sage-deep)', color: '#fff',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(20, 18, 14, .25)',
            }}>
      <IconDownload style={{ width: 16, height: 16 }} />
      Install app
    </button>
  );
}

// Floating "Customize" button — shown only when running outside the design
// tool (i.e. on GitHub Pages), so the user still has a way to open Tweaks.
function StandaloneTweaksButton() {
  const [open, setOpen] = React.useState(false);
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

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppInner />
      </StoreProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
