// components/auth-modal.jsx — sign in / create account (email/password + Google)

function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function AuthModal({ open, onClose }) {
  const { user, available, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = React.useState('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [info, setInfo] = React.useState('');
  const insideHost = typeof window !== 'undefined' && window.parent !== window;

  // Once a session exists, the modal's job is done.
  React.useEffect(() => { if (open && user) onClose(); }, [open, user, onClose]);

  React.useEffect(() => {
    if (!open) return;
    setErr(''); setInfo(''); setBusy(false);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setInfo('');
    if (!email.trim() || !password) { setErr('Enter your email and a password.'); return; }
    if (mode === 'signup' && password.length < 6) { setErr('Use at least 6 characters for your password.'); return; }
    setBusy(true);
    const { data, error } = await (mode === 'signin' ? signIn : signUp)(email.trim(), password);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    // Confirm-email ON: signUp returns a user but no session.
    if (mode === 'signup' && data && data.user && !data.session) {
      setInfo('Account created. Check your email to confirm, then sign in.');
      setMode('signin');
      return;
    }
    // Otherwise onAuthStateChange sets the user and the effect above closes us.
  };

  const google = async () => {
    setErr('');
    const { error } = await signInWithGoogle();
    if (error) setErr(error.message);
  };

  const field = {
    appearance: 'none', width: '100%', height: 44, padding: '0 14px',
    border: '1px solid var(--hairline)', borderRadius: 12,
    background: 'var(--paper)', fontFamily: 'inherit', fontSize: 15,
    color: 'var(--ink)', outline: 'none',
  };

  return (
    <div role="dialog" aria-modal="true" className="modal-overlay"
         style={{
           position: 'fixed', inset: 0, zIndex: 1200,
           background: 'rgba(20, 18, 14, .45)', backdropFilter: 'blur(6px)',
           display: 'grid', placeItems: 'center', padding: 28,
         }}
         onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="modal-shell"
           style={{
             width: 'min(100%, 440px)', background: 'var(--paper)', borderRadius: 18,
             boxShadow: '0 30px 80px rgba(20, 18, 14, .25)',
             display: 'flex', flexDirection: 'column', overflow: 'hidden',
           }}>

        <div style={{ padding: '22px 26px 8px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div className="stack-tight" style={{ flex: 1 }}>
            <div className="h2">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</div>
            <div className="meta" style={{ fontSize: 13 }}>
              Sign in to save your routines to the cloud and open them on any device.
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn--ghost btn--icon" aria-label="Close">
            <IconClose />
          </button>
        </div>

        <div style={{ padding: '10px 26px 4px' }}>
          <button type="button" onClick={google} className="btn btn--soft"
                  style={{ width: '100%', height: 46, fontSize: 15, justifyContent: 'center', gap: 10 }}>
            <GoogleG /> Continue with Google
          </button>
          {insideHost && (
            <div className="meta" style={{ fontSize: 11.5, marginTop: 8, color: 'var(--ink-3)', textAlign: 'center' }}>
              Google sign-in opens on your live site — inside this preview, use email &amp; password.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 26px 4px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
          <span className="meta" style={{ fontSize: 12, color: 'var(--ink-3)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
        </div>

        <form onSubmit={submit} style={{ padding: '8px 26px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label className="eyebrow" htmlFor="auth-email">Email</label>
          <input id="auth-email" type="email" autoComplete="email" value={email}
                 onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={field} />
          <label className="eyebrow" htmlFor="auth-pass" style={{ marginTop: 4 }}>Password</label>
          <input id="auth-pass" type="password"
                 autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                 value={password} onChange={(e) => setPassword(e.target.value)}
                 placeholder={mode === 'signin' ? 'Your password' : 'At least 6 characters'} style={field} />

          {err && (
            <div style={{
              fontSize: 13, color: '#8a3b2f', background: 'var(--cat-food-bg)',
              border: '1px solid rgba(185,122,111,.35)', borderRadius: 10, padding: '9px 12px',
            }}>{err}</div>
          )}
          {info && (
            <div style={{
              fontSize: 13, color: 'var(--sage-deep)', background: 'var(--sage-soft)',
              borderRadius: 10, padding: '9px 12px',
            }}>{info}</div>
          )}

          <button type="submit" disabled={busy} className="btn btn--primary btn--lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 6, opacity: busy ? .7 : 1 }}>
            {busy ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <div style={{ padding: '14px 26px 22px', textAlign: 'center' }}>
          <span className="meta" style={{ fontSize: 13 }}>
            {mode === 'signin' ? "New to KindCue? " : 'Already have an account? '}
          </span>
          <button type="button"
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); setInfo(''); }}
                  style={{
                    appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: 'var(--sage-deep)',
                    textDecoration: 'underline', padding: 0,
                  }}>
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthModal });
