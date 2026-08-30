// components/board-menu.jsx — dropdown menu attached to a board title

function BoardMenu({ board, anchor, onClose, navigate }) {
  const store = useStore();
  const [shareOpen, setShareOpen] = React.useState(false);

  // Position the menu next to the anchor button. Re-measure on resize.
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  React.useEffect(() => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, [anchor]);

  if (!board) return null;

  const child = store.state.children.find((c) => c.id === board.childId);

  return (
    <>
      <div onClick={onClose}
           style={{ position: 'fixed', inset: 0, zIndex: 70 }} />
      <div style={{
        position: 'fixed', top: pos.top, left: pos.left, zIndex: 71,
        minWidth: 240, background: 'var(--paper)',
        border: '1px solid var(--hairline)', borderRadius: 12,
        boxShadow: 'var(--shadow-pop)', padding: 6,
      }}>
        <MenuItem icon={<IconText />} label="Rename"
                  onClick={() => {
                    const nu = prompt('Rename board', board.title);
                    if (nu?.trim()) store.updateBoard(board.id, { title: nu.trim() });
                    onClose();
                  }} />
        <MenuItem icon={<IconShare />} label="Share via link"
                  onClick={() => { setShareOpen(true); }} />
        <MenuItem icon={<IconCopy />} label="Duplicate"
                  onClick={() => {
                    const newId = store.duplicateBoard(board.id);
                    onClose();
                    if (newId) navigate('/b/' + newId);
                  }} />
        <MenuItem icon={<IconPrint />} label="Open print preview"
                  onClick={() => { onClose(); navigate('/b/' + board.id + '/print'); }} />
        <MenuItem icon={<IconCalendar />} label="Add to calendar"
                  onClick={() => { downloadICS(board); onClose(); }} />
        <MenuItem icon={<IconStar />} label={board.reward ? 'Edit reward goal' : 'Set a reward goal'}
                  onClick={() => {
                    const goalStr = prompt('How many steps to earn the reward?', String(board.reward?.goal || board.steps.length));
                    if (goalStr === null) { onClose(); return; }
                    const goal = Math.max(1, parseInt(goalStr, 10) || board.steps.length);
                    const label = prompt('What\u2019s the reward? (e.g. "10 min tablet")', board.reward?.label || '');
                    if (label === null) { onClose(); return; }
                    store.updateBoard(board.id, { reward: label.trim() ? { goal, label: label.trim() } : null });
                    onClose();
                  }} />

        <div style={{ height: 1, background: 'var(--hairline)', margin: '6px 4px' }} />

        {store.state.children.length > 0 && (
          <>
            <div style={{ padding: '6px 10px 4px', fontSize: 10.5, fontWeight: 700, letterSpacing: '.10em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
              For
            </div>
            {store.state.children.map((c) => {
              const cc = CATEGORIES[c.color] || CATEGORIES.routine;
              const isCur = c.id === board.childId;
              return (
                <button key={c.id} type="button"
                        onClick={() => { store.updateBoard(board.id, { childId: c.id }); onClose(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '7px 10px', borderRadius: 8,
                          border: 0, background: isCur ? 'var(--sage-soft)' : 'transparent',
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                          fontSize: 13,
                        }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: cc.bg, color: cc.ink,
                    display: 'grid', placeItems: 'center',
                    fontSize: 10.5, fontWeight: 700,
                  }}>{c.name[0]}</span>
                  <span style={{ flex: 1 }}>{c.name}</span>
                  {isCur && <IconCheck style={{ width: 13, height: 13, color: 'var(--sage-deep)' }} />}
                </button>
              );
            })}

            <div style={{ height: 1, background: 'var(--hairline)', margin: '6px 4px' }} />
          </>
        )}

        <MenuItem icon={<IconTrash />} label="Delete board"
                  danger
                  onClick={() => {
                    if (confirm(`Delete "${board.title}"? This can't be undone.`)) {
                      store.deleteBoard(board.id);
                      onClose();
                      navigate('/library');
                    }
                  }} />
      </div>

      <ShareModal open={shareOpen} board={board} onClose={() => { setShareOpen(false); onClose(); }} />
    </>
  );
}

function MenuItem({ icon, label, onClick, danger = false }) {
  return (
    <button type="button" onClick={onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 10px', borderRadius: 8,
              border: 0, background: 'transparent', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left',
              fontSize: 13, fontWeight: 500,
              color: danger ? 'var(--cat-food)' : 'var(--ink)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = danger ? 'var(--cat-food-bg)' : 'rgba(0,0,0,.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <span style={{ display: 'grid', placeItems: 'center', width: 18 }}>
        {React.cloneElement(icon, { style: { width: 15, height: 15 } })}
      </span>
      {label}
    </button>
  );
}

// .ics export — a recurring daily VEVENT per step, in the caregiver's
// local ("floating") time, inferred from the board's schedule text. No
// server, no account needed.
function icsEscape(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
function boardToICS(board) {
  const pad = (n) => String(n).padStart(2, '0');
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const today = new Date();
  const dateStr = today.getFullYear() + pad(today.getMonth() + 1) + pad(today.getDate());
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KindCue//Visual Schedules//EN', 'CALSCALE:GREGORIAN'];
  board.steps.forEach((s, i) => {
    const t = parseStepTime(s.time, board.schedule);
    if (!t) return;
    const dur = Math.max(1, s.duration || 5);
    const endTotal = t.h * 60 + t.m + dur;
    const endH = Math.floor(endTotal / 60) % 24, endM = endTotal % 60;
    lines.push(
      'BEGIN:VEVENT',
      'UID:kindcue-' + board.id + '-' + (s.id || i) + '@kindcue.site',
      'DTSTAMP:' + dtstamp,
      'DTSTART:' + dateStr + 'T' + pad(t.h) + pad(t.m) + '00',
      'DTEND:' + dateStr + 'T' + pad(endH) + pad(endM) + '00',
      'RRULE:FREQ=DAILY',
      'SUMMARY:' + icsEscape(s.title + ' — ' + board.title),
    );
    if (s.note) lines.push('DESCRIPTION:' + icsEscape(s.note));
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
function downloadICS(board) {
  const ics = boardToICS(board);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = (board.title || 'routine').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

Object.assign(window, { BoardMenu });
