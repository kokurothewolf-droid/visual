// components/share-modal.jsx — generate a shareable URL for a board

function ShareModal({ open, board, onClose }) {
  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef(null);

  const url = React.useMemo(() => {
    if (!open || !board) return '';
    const encoded = encodeBoardForShare(board);
    return location.origin + location.pathname + '#/import?d=' + encoded;
  }, [open, board]);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.select(), 60);
  }, [open]);

  // QR code — encodes the same share URL so a parent can point a phone
  // camera at it. The URL embeds the whole board, so it's long and the code
  // is dense: we use the lowest error-correction level ('L') to keep the
  // module count down, render it large, and display it pixel-crisp so a
  // camera can actually resolve it. Past QR capacity we fall back to the
  // copy field.
  const qr = React.useMemo(() => {
    if (!open || !url || typeof window.qrcode !== 'function') return null;
    try {
      const code = window.qrcode(0, 'L');
      code.addData(url);
      code.make();
      return { src: code.createDataURL(8, 0), modules: code.getModuleCount() };
    } catch (e) {
      return null; // too much data for a QR — copy link instead
    }
  }, [open, url]);
  // A code this dense needs real screen size to scan. Warn when it's pushing
  // the limit so the expectation is set.
  const qrDense = qr && qr.modules > 120;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers
      inputRef.current?.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
    }
  };

  return (
    <div role="dialog" aria-modal="true"
         className="modal-overlay"
         style={{
           position: 'fixed', inset: 0, zIndex: 1000,
           background: 'rgba(20, 18, 14, .45)',
           backdropFilter: 'blur(6px)',
           display: 'grid', placeItems: 'center',
           padding: 28,
         }}
         onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
           className="modal-shell"
           style={{
             width: 'min(100%, 560px)',
             background: 'var(--paper)', borderRadius: 18,
             boxShadow: '0 30px 80px rgba(20, 18, 14, .25)',
             display: 'flex', flexDirection: 'column',
             overflow: 'hidden',
           }}>
        <div style={{
          padding: '20px 24px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: 'var(--sage-soft)', color: 'var(--sage-deep)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <IconShare style={{ width: 18, height: 18 }} />
          </div>
          <div className="stack-tight" style={{ flex: 1 }}>
            <div className="h2">Share this board</div>
            <div className="meta" style={{ fontSize: 13 }}>
              Anyone with the link can add a copy to their own KindCue.
              No login needed. Edits don't sync.
            </div>
          </div>
          <button type="button" onClick={onClose}
                  className="btn btn--ghost btn--icon" aria-label="Close">
            <IconClose />
          </button>
        </div>

        <div style={{ padding: '8px 24px 0' }}>
          <div className="card" style={{
            padding: 16, display: 'flex', alignItems: 'center', gap: 14,
            background: 'var(--bg-tint)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'var(--paper)',
              color: 'var(--cat-' + (board?.category || 'routine') + ')',
              display: 'grid', placeItems: 'center',
              border: '1px solid var(--hairline)', flexShrink: 0,
            }}>
              <Icon name={board?.steps?.[0]?.icon || 'sun'} style={{ width: 22, height: 22 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="h3" style={{ marginBottom: 2 }}>{board?.title}</div>
              <div className="meta" style={{ fontSize: 12 }}>
                {board?.steps?.length || 0} steps · {board?.schedule || 'No schedule set'}
              </div>
            </div>
          </div>
        </div>

        {qr && (
          <div style={{ padding: '16px 24px 0' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Scan with a phone</div>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              padding: 18, borderRadius: 14,
              background: 'var(--bg-tint)', border: '1px solid var(--hairline)',
            }}>
              <div style={{
                padding: 12, background: '#fff', borderRadius: 10,
                boxShadow: 'inset 0 0 0 1px var(--hairline)',
              }}>
                <img src={qr.src} alt="QR code for this board"
                     width="240" height="240"
                     style={{
                       display: 'block', width: 240, height: 240,
                       imageRendering: 'pixelated',
                     }} />
              </div>
              <div className="meta" style={{ fontSize: 12.5, textAlign: 'center', maxWidth: 320 }}>
                Point a phone camera at the code to open this board — handy for a
                teacher or therapist. No app or login needed.
                {qrDense && (
                  <span style={{ display: 'block', marginTop: 6, color: 'var(--ink-3)' }}>
                    This board packs a lot in, so the code is dense — hold the camera
                    close and steady, or just copy the link below.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '16px 24px 4px' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Share link</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={inputRef} value={url} readOnly
                   onClick={() => inputRef.current?.select()}
                   style={{
                     flex: 1, minWidth: 0, height: 40, padding: '0 12px',
                     border: '1px solid var(--hairline)', borderRadius: 10,
                     background: 'var(--paper)', fontFamily: 'inherit',
                     fontSize: 13, color: 'var(--ink)', outline: 'none',
                   }} />
            <button type="button" onClick={copy}
                    className="btn btn--primary"
                    style={{ height: 40 }}>
              {copied ? (<><IconCheck /> Copied!</>) : (<><IconCopy /> Copy link</>)}
            </button>
          </div>
          <div className="meta" style={{ fontSize: 11.5, marginTop: 6 }}>
            URL contains the board itself — no server needed. Long boards make long URLs.
          </div>
        </div>

        <div style={{
          padding: '14px 24px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <a href={url} target="_blank" rel="noreferrer"
             className="btn btn--soft"
             style={{ textDecoration: 'none', height: 36 }}>
            Open link in new tab
          </a>
          <div style={{ flex: 1 }} />
          <span className="meta" style={{ fontSize: 11.5 }}>
            URL is {url.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ShareModal });
