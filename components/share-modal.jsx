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
  // camera at it. Long boards make long URLs; QR capacity tops out, so we
  // fail gracefully and just show the copy field in that case.
  const qrDataUrl = React.useMemo(() => {
    if (!open || !url || typeof window.qrcode !== 'function') return null;
    try {
      const qr = window.qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      return qr.createDataURL(5, 12);
    } catch (e) {
      return null; // too much data for a QR — copy link instead
    }
  }, [open, url]);

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

        {qrDataUrl && (
          <div style={{ padding: '16px 24px 0' }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Scan with a phone</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: 14, borderRadius: 14,
              background: 'var(--bg-tint)', border: '1px solid var(--hairline)',
            }}>
              <img src={qrDataUrl} alt="QR code for this board"
                   style={{ width: 116, height: 116, borderRadius: 8, background: '#fff', flexShrink: 0 }} />
              <div className="meta" style={{ fontSize: 12.5 }}>
                Point a camera at the code to open this board on another device —
                handy for a teacher or therapist. No app or login needed.
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
