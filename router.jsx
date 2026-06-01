// router.jsx — hash-based router
//
// Routes:
//   #/                      → Home
//   #/templates             → Templates gallery
//   #/about                 → About
//   #/library               → My boards
//   #/b/:boardId            → Builder
//   #/b/:boardId/preview    → Child view
//   #/b/:boardId/print      → Print preview
//   #/import?d=...          → Import shared board
//
// Returns { name, params, query, path } and exposes navigate(path).

function parseHash() {
  const raw = (window.location.hash || '#/').replace(/^#/, '') || '/';
  const [path, queryStr] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryStr || ''));
  const segs = path.replace(/^\//, '').split('/').filter(Boolean);

  if (segs.length === 0)                    return { name: 'home',      params: {},                  query, path };
  if (segs[0] === 'templates')               return { name: 'templates', params: {},                  query, path };
  if (segs[0] === 'about')                   return { name: 'about',     params: {},                  query, path };
  if (segs[0] === 'library')                 return { name: 'library',   params: {},                  query, path };
  if (segs[0] === 'import')                  return { name: 'import',    params: {},                  query, path };
  if (segs[0] === 'b' && segs.length === 2)  return { name: 'builder',   params: { boardId: segs[1] }, query, path };
  if (segs[0] === 'b' && segs[2] === 'preview') return { name: 'preview', params: { boardId: segs[1] }, query, path };
  if (segs[0] === 'b' && segs[2] === 'print')   return { name: 'print',   params: { boardId: segs[1] }, query, path };
  return { name: 'home', params: {}, query, path };
}

function navigate(path, { replace = false } = {}) {
  const hash = '#' + (path.startsWith('/') ? path : '/' + path);
  if (replace) window.history.replaceState(null, '', hash);
  else window.location.hash = hash;
  // Fire popstate manually for replaceState — listeners only watch hashchange
  // and popstate, and replaceState fires neither.
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function useRouter() {
  const [route, setRoute] = React.useState(parseHash);
  React.useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);
  return { route, navigate };
}

Object.assign(window, { useRouter, navigate, parseHash });
