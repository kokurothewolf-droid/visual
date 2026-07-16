// auth.jsx — Supabase client + auth context (email/password + Google)
//
// The anon/publishable key is meant to live in client code; Row Level
// Security on the `user_state` table is what actually protects data.

const SUPABASE_URL = 'https://jkdqylmdwqhnvjgxptsm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_x5ZLf1w0sES8TLrYIThO0Q_SpPglVlG';

let sb = null;
try {
  if (window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  } else {
    console.error('KindCue: supabase-js did not load — auth/sync disabled.');
  }
} catch (e) {
  console.error('KindCue: could not initialize Supabase.', e);
}

const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!sb) { setReady(true); return; }
    let active = true;
    sb.auth.getSession()
      .then(({ data }) => { if (active) { setSession(data && data.session ? data.session : null); setReady(true); } })
      .catch(() => { if (active) setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => { active = false; sub && sub.subscription && sub.subscription.unsubscribe(); };
  }, []);

  const api = React.useMemo(() => {
    const noClient = () => Promise.resolve({ error: { message: 'Sign-in is unavailable — Supabase failed to load.' } });
    return {
      ready,
      session,
      user: session && session.user ? session.user : null,
      available: !!sb,
      signIn: (email, password) => sb ? sb.auth.signInWithPassword({ email, password }) : noClient(),
      signUp: (email, password) => sb ? sb.auth.signUp({ email, password }) : noClient(),
      signInWithGoogle: () => sb ? sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: location.origin + location.pathname },
      }) : noClient(),
      signOut: () => sb ? sb.auth.signOut() : noClient(),
    };
  }, [session, ready]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const v = React.useContext(AuthContext);
  if (!v) throw new Error('useAuth() outside of <AuthProvider>');
  return v;
}

Object.assign(window, { sb, AuthProvider, useAuth });
