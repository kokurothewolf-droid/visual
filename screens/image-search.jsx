// screens/image-search.jsx — image search + AI generation modal
//
// Two tabs:
//   • Search   — Wikimedia Commons (real, free, CORS-enabled images)
//   • Generate — Pollinations.ai (free AI image generation, no key, CORS-open)
//
// Both produce the same result shape so the rest of the app doesn't care
// where the image came from:
//   { title, src, thumb, full, license, artist }

const WIKI_API = 'https://commons.wikimedia.org/w/api.php';

async function fetchImages(query, { limit = 24 } = {}) {
  if (!query || !query.trim()) return [];
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*',
    generator: 'search', gsrnamespace: '6',
    gsrsearch: `${query.trim()} filetype:bitmap`,
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '360',
  });
  const res = await fetch(`${WIKI_API}?${params.toString()}`);
  if (!res.ok) throw new Error('Search failed (HTTP ' + res.status + ')');
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return [];
  return Object.values(pages)
    .filter((p) => p.imageinfo && p.imageinfo[0])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((p) => {
      const i = p.imageinfo[0];
      const title = p.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/_/g, ' ');
      const meta = i.extmetadata || {};
      const license = meta.LicenseShortName?.value || meta.License?.value || '';
      return {
        id: p.pageid,
        title,
        src: 'commons.wikimedia.org',
        thumb: i.thumburl || i.url,
        full: i.url,
        descriptionUrl: i.descriptionurl,
        w: i.thumbwidth || i.width,
        h: i.thumbheight || i.height,
        license,
      };
    });
}

// Pollinations style presets — appended to the user's prompt so generations
// stay consistent and child-friendly across a board.
const AI_STYLES = [
  { id: 'illustration', label: 'Illustration',
    suffix: 'soft, friendly children\'s book illustration, simple shapes, clean white background, warm colors',
    hint: 'Best for routines — cohesive, gentle.' },
  { id: 'photo',        label: 'Photo',
    suffix: 'clear, well-lit photograph, plain neutral background, sharp focus',
    hint: 'Like a real object in good light.' },
  { id: 'line',         label: 'Line drawing',
    suffix: 'simple black line drawing on pure white background, clean even lines, no shading, coloring-book style',
    hint: 'Print-friendly, very low ink.' },
  { id: 'watercolor',   label: 'Watercolor',
    suffix: 'soft watercolor painting, gentle pastel colors, minimal background, warm and calm',
    hint: 'Cozy bedtime / calm-down boards.' },
];

function pollinationUrl(prompt, seed, { model = 'flux', w = 512, h = 512 } = {}) {
  const params = new URLSearchParams({
    width: String(w), height: String(h),
    seed: String(seed), nologo: 'true', model,
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

const SUGGESTED_SEARCH = ['cereal', 'toothbrush', 'backpack', 'sneakers', 'pajamas', 'school bus'];
const SUGGESTED_AI = [
  'a child brushing teeth in a bathroom',
  'a bowl of oatmeal with berries on a wooden table',
  'a yellow school bus arriving at a stop',
  'a folded outfit laid out on a chair',
  'a backpack with books and a water bottle',
];

// ── Component ───────────────────────────────────────────────────────
function ImageSearchModal({ open, query: initialQuery, onSelect, onClose }) {
  const [tab, setTab] = React.useState('search'); // search | upload | stock | generate

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

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
             width: 'min(100%, 1080px)', height: 'min(100%, 760px)',
             background: 'var(--paper)', borderRadius: 18,
             boxShadow: '0 30px 80px rgba(20, 18, 14, .25)',
             display: 'flex', flexDirection: 'column',
             overflow: 'hidden',
           }}>

        {/* Header: tabs */}
        <div style={{
          padding: '14px 22px 0',
          borderBottom: '1px solid var(--hairline)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
            <div className="stack-tight" style={{ flex: 1 }}>
              <div className="h3">Pick a picture for this step</div>
              <div className="meta" style={{ fontSize: 12 }}>
                Search the web, upload your own, choose from your library, or generate.
              </div>
            </div>
            <button type="button" onClick={onClose}
                    className="btn btn--ghost btn--icon" aria-label="Close">
              <IconClose />
            </button>
          </div>

          <div className="modal-tabs" style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            <TabButton on={tab === 'search'} onClick={() => setTab('search')}
                       icon={<IconSearch />} label="Search" sub="Wikimedia" />
            <TabButton on={tab === 'upload'} onClick={() => setTab('upload')}
                       icon={<IconImage />} label="Upload" sub="Your photos" />
            <TabButton on={tab === 'stock'} onClick={() => setTab('stock')}
                       icon={<IconLibrary />} label="Stock" sub="Curated library" />
            <TabButton on={tab === 'generate'} onClick={() => setTab('generate')}
                       icon={<IconSparkle />} label="Generate" sub="AI · Pollinations" />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {tab === 'search'   && <SearchPane initialQuery={initialQuery} onSelect={onSelect} />}
          {tab === 'upload'   && <UploadPane onSelect={onSelect} />}
          {tab === 'stock'    && <StockPane initialQuery={initialQuery} onSelect={onSelect} />}
          {tab === 'generate' && <GeneratePane initialQuery={initialQuery} onSelect={onSelect} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ on, onClick, icon, label, sub }) {
  return (
    <button type="button" onClick={onClick}
            style={{
              flex: 1, minWidth: 100,
              border: 0, padding: '10px 12px',
              borderTopLeftRadius: 10, borderTopRightRadius: 10,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              background: on ? 'var(--paper)' : 'transparent',
              borderBottom: on ? '2px solid var(--sage-deep)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: 10,
              color: on ? 'var(--ink)' : 'var(--ink-2)',
              transition: 'background .12s',
            }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: on ? 'var(--sage-soft)' : 'var(--bg-tint)',
        color: on ? 'var(--sage-deep)' : 'var(--ink-2)',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>{React.cloneElement(icon, { style: { width: 15, height: 15 } })}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ fontSize: 10.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
    </button>
  );
}

// ── Pane: Upload from device ────────────────────────────────────────
function UploadPane({ onSelect }) {
  const store = useStore();
  const uploads = store.state.uploads || [];
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef(null);

  const handleFiles = async (files) => {
    setError(null);
    if (!files || !files.length) return;
    setBusy(true);
    let last = null;
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        // Resize-as-needed to keep localStorage small. We render the
        // upload into a max 1024×1024 canvas, encoding as JPEG when the
        // source is photographic so the data URL stays under ~250KB.
        const dataURL = await fileToDataURL(file, { max: 1024 });
        last = store.addUpload(file, dataURL);
      }
    } catch (e) {
      setError(e.message || 'Couldn\'t read that file.');
    } finally {
      setBusy(false);
    }
    return last;
  };

  const onPick = async (e) => {
    await handleFiles(e.target.files);
    // Clear the input so picking the same file again still re-fires onChange
    e.target.value = '';
  };

  const onDrop = async (e) => {
    e.preventDefault(); setDragOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div style={{ padding: '14px 22px 12px' }}>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          style={{
            border: '2px dashed ' + (dragOver ? 'var(--sage)' : 'var(--hairline-strong)'),
            background: dragOver ? 'var(--sage-tint)' : 'var(--bg-tint)',
            borderRadius: 14, padding: '24px 18px',
            display: 'flex', alignItems: 'center', gap: 16,
            cursor: 'pointer', transition: 'background .12s, border-color .12s',
          }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--sage-soft)', color: 'var(--sage-deep)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <IconImage style={{ width: 22, height: 22 }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h3" style={{ marginBottom: 2 }}>
              {busy ? 'Reading photo…' : 'Upload your own photo'}
            </div>
            <div className="meta" style={{ fontSize: 12.5 }}>
              Drag &amp; drop, or click to choose. Photos are saved on this device only.
            </div>
            {error && (
              <div style={{ fontSize: 12, color: 'var(--cat-food)', marginTop: 6 }}>{error}</div>
            )}
          </div>
          <button type="button" className="btn btn--primary"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            <IconPlus />Choose file
          </button>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden
                 onChange={onPick} />
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, minHeight: 0, padding: '6px 22px 18px' }}>
        {uploads.length === 0 ? (
          <ResultsEmpty
            icon={<IconImage style={{ width: 28, height: 28 }} />}
            title="No uploads yet"
            body="Photos you upload show up here. They stay on this device — share a board's link to send the pictures to someone else." />
        ) : (
          <>
            <div className="meta" style={{ fontSize: 12, marginBottom: 12, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--ink)' }}>{uploads.length}</strong> photo{uploads.length === 1 ? '' : 's'} on this device
            </div>
            <div className="grid-search-results">
              {uploads.map((u) => (
                <UploadTile key={u.id} upload={u}
                            onSelect={() => onSelect(u)}
                            onRemove={() => store.removeUpload(u.id)} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer
        badge="Your photos"
        text="Real pictures of your bowl, your bus, your front door — usually the best match for what your child sees." />
    </>
  );
}

function UploadTile({ upload, onSelect, onRemove }) {
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={onSelect}
              style={{
                appearance: 'none', border: 0, background: 'transparent',
                cursor: 'pointer', padding: 0, textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 6,
                fontFamily: 'inherit', width: '100%',
              }}>
        <div style={{
          aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden',
          background: '#1f1f1f', boxShadow: '0 0 0 1px var(--hairline)',
        }}>
          <img src={upload.thumb} alt={upload.title}
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{
          fontSize: 12, color: 'var(--ink)', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{upload.title}</div>
      </button>
      <button type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              aria-label="Remove this photo"
              style={{
                position: 'absolute', top: 6, right: 6,
                width: 26, height: 26, borderRadius: '50%',
                border: 0, cursor: 'pointer', fontFamily: 'inherit',
                background: 'rgba(20,18,14,.75)', color: '#fff',
                display: 'grid', placeItems: 'center',
                backdropFilter: 'blur(4px)',
              }}>
        <IconTrash style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
}

// Read a File into a data URL, downscaling oversized images so we don't
// blow localStorage. Returns a JPEG when the source was JPEG (smaller),
// PNG otherwise (preserves transparency).
async function fileToDataURL(file, { max = 1024 } = {}) {
  const reader = new FileReader();
  const raw = await new Promise((res, rej) => {
    reader.onload = () => res(reader.result);
    reader.onerror = () => rej(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
  // Decode to check dimensions
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('Not a valid image'));
    i.src = raw;
  });
  // No downscale needed
  if (img.width <= max && img.height <= max && raw.length < 500_000) return raw;
  const scale = Math.min(max / img.width, max / img.height, 1);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(mime, mime === 'image/jpeg' ? 0.88 : undefined);
}

// ── Pane: Stock photo library ──────────────────────────────────────
function StockPane({ initialQuery, onSelect }) {
  const [manifest, setManifest] = React.useState(null);
  const [status, setStatus] = React.useState('loading'); // loading | done | empty | error
  const [error, setError] = React.useState(null);
  const [q, setQ] = React.useState(initialQuery || '');
  const [cat, setCat] = React.useState('all');

  // Fetch the manifest once when the pane mounts.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('assets/stock/manifest.json?t=' + Date.now());
        if (!res.ok) throw new Error('Manifest not found');
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data.photos) ? data.photos : [];
        setManifest(list);
        setStatus(list.length ? 'done' : 'empty');
      } catch (e) {
        if (cancelled) return;
        setError(e.message || 'Couldn\'t load stock library.');
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Filter
  const filtered = React.useMemo(() => {
    if (!manifest) return [];
    const query = q.trim().toLowerCase();
    return manifest.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!query) return true;
      const hay = [p.title, p.category, ...(p.tags || [])].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(query);
    });
  }, [manifest, q, cat]);

  // Build the category filter chips from whatever categories actually
  // appear in the manifest — no point showing "Mealtime" if there's no
  // food photo to pick from.
  const usedCategories = React.useMemo(() => {
    if (!manifest) return [];
    const set = new Set();
    for (const p of manifest) if (p.category) set.add(p.category);
    return Object.values(CATEGORIES).filter((c) => set.has(c.id));
  }, [manifest]);

  return (
    <>
      <div style={{ padding: '14px 22px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SearchField value={q} onChange={setQ}
                     placeholder="Search the stock library…" />
        {usedCategories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button type="button"
                    className={'chip' + (cat === 'all' ? ' chip--active' : '')}
                    onClick={() => setCat('all')}
                    style={{ height: 26, fontSize: 12 }}>All</button>
            {usedCategories.map((c) => {
              const on = cat === c.id;
              return (
                <button key={c.id} type="button" onClick={() => setCat(c.id)}
                        className={'chip' + (on ? ' chip--active' : '')}
                        style={!on ? { background: c.bg, color: c.ink, boxShadow: 'none', height: 26, fontSize: 12 }
                                   : { height: 26, fontSize: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: on ? '#fff' : c.dot }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="scroll" style={{ flex: 1, minHeight: 0, padding: '6px 22px 18px' }}>
        {status === 'loading' && <ResultsSkeleton label="Loading stock library…" />}
        {status === 'error' && (
          <ResultsEmpty
            icon={<IconClose style={{ width: 28, height: 28 }} />}
            title="Couldn't load the stock library"
            body={error || 'Make sure assets/stock/manifest.json exists and is valid JSON.'} />
        )}
        {status === 'empty' && (
          <ResultsEmpty
            icon={<IconLibrary style={{ width: 28, height: 28 }} />}
            title="No stock photos yet"
            body="Drop image files in assets/stock/ and add them to manifest.json — they'll show up here automatically." />
        )}
        {status === 'done' && filtered.length === 0 && (
          <ResultsEmpty
            icon={<IconSearch style={{ width: 28, height: 28 }} />}
            title={q ? `No matches for "${q}"` : 'No photos in this category'}
            body="Try a different search or clear the category filter." />
        )}
        {status === 'done' && filtered.length > 0 && (
          <>
            <div className="meta" style={{ fontSize: 12, marginBottom: 12, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> photo{filtered.length === 1 ? '' : 's'}
              {q ? <> matching "<strong style={{ color: 'var(--ink)' }}>{q}</strong>"</> : null}
            </div>
            <div className="grid-search-results">
              {filtered.map((p, i) => (
                <StockTile key={p.file || i} photo={p}
                           onSelect={() => onSelect(stockToResult(p))} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer
        badge="Curated"
        text="Curated stock photos served from this app. To add or update them, edit assets/stock/." />
    </>
  );
}

// Build the result object the rest of the app expects from a manifest entry.
function stockToResult(p) {
  const url = 'assets/stock/' + p.file;
  return {
    id: 'stock-' + (p.file || p.title),
    title: p.title || p.file,
    src: 'stock library',
    thumb: url, full: url,
    descriptionUrl: null,
    license: p.credit || 'Curated',
    artist: p.credit || '',
    w: 0, h: 0,
  };
}

function StockTile({ photo, onSelect }) {
  const [errored, setErrored] = React.useState(false);
  const url = 'assets/stock/' + photo.file;
  const cat = CATEGORIES[photo.category];
  return (
    <button type="button" onClick={onSelect}
            style={{
              appearance: 'none', border: 0, background: 'transparent',
              cursor: 'pointer', padding: 0, textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 6,
              fontFamily: 'inherit',
            }}>
      <div style={{
        aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden', position: 'relative',
        background: cat ? cat.bg : 'var(--bg-tint)',
        boxShadow: '0 0 0 1px var(--hairline)',
      }}>
        {errored ? (
          <div style={{
            position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
            padding: 12, textAlign: 'center', color: 'var(--ink-3)',
            fontSize: 11.5, fontWeight: 700, lineHeight: 1.3,
          }}>
            Missing file<br />
            <span style={{ fontSize: 10.5, fontWeight: 500, opacity: .8 }}>{photo.file}</span>
          </div>
        ) : (
          <img src={url} alt={photo.title} loading="lazy"
               onError={() => setErrored(true)}
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>
      <div style={{
        fontSize: 12.5, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.3,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{photo.title}</div>
      {cat && (
        <div style={{
          fontSize: 10.5, fontWeight: 700, color: cat.ink, letterSpacing: '.04em',
          textTransform: 'uppercase',
        }}>{cat.label}</div>
      )}
    </button>
  );
}

// ── Pane: Wikimedia search ────────────────────────────────────────
function SearchPane({ initialQuery, onSelect }) {
  const [q, setQ] = React.useState(initialQuery || '');
  const [results, setResults] = React.useState([]);
  const [status, setStatus] = React.useState('idle');
  const [error, setError] = React.useState(null);
  const [active, setActive] = React.useState(-1);
  const inputRef = React.useRef(null);
  const reqIdRef = React.useRef(0);

  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60); }, []);

  React.useEffect(() => {
    if (!q || !q.trim()) { setResults([]); setStatus('idle'); return; }
    const id = ++reqIdRef.current;
    setStatus('loading'); setError(null);
    const t = setTimeout(async () => {
      try {
        const items = await fetchImages(q);
        if (reqIdRef.current !== id) return;
        setResults(items);
        setStatus(items.length ? 'done' : 'empty');
      } catch (e) {
        if (reqIdRef.current !== id) return;
        setError(e.message || 'Search failed.');
        setStatus('error'); setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <div style={{ padding: '14px 22px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SearchField ref={inputRef} value={q} onChange={setQ}
                     placeholder="Search for a picture (e.g. ‘bowl of cereal’)"
                     onSubmit={() => active >= 0 && results[active] && onSelect(results[active])} />
        <SuggestedChips items={SUGGESTED_SEARCH} onPick={setQ} />
      </div>

      <div className="scroll" style={{ flex: 1, minHeight: 0, padding: '6px 22px 18px' }}>
        {status === 'idle' && (
          <ResultsEmpty icon={<IconSearch style={{ width: 28, height: 28 }} />}
                        title="Type to search"
                        body="Free, freely-licensed images from Wikimedia Commons. Concrete nouns work best." />
        )}
        {status === 'loading' && <ResultsSkeleton label="Searching Wikimedia Commons…" />}
        {status === 'error' && (
          <ResultsEmpty icon={<IconClose style={{ width: 28, height: 28 }} />}
                        title="Couldn't reach the image library"
                        body={error || 'Check your connection and try again.'} />
        )}
        {status === 'empty' && (
          <ResultsEmpty icon={<IconSearch style={{ width: 28, height: 28 }} />}
                        title={`No images for “${q}”`}
                        body="Try a different word — concrete nouns work best (‘sneaker’ beats ‘shoe’)." />
        )}
        {status === 'done' && (
          <>
            <div className="meta" style={{ fontSize: 12, marginBottom: 12, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--ink)' }}>{results.length}</strong> images for
              “<strong style={{ color: 'var(--ink)' }}>{q}</strong>”
              <span style={{ color: 'var(--ink-3)' }}> · all freely licensed</span>
            </div>
            <div className="grid-search-results">
              {results.map((r, i) => (
                <ResultCard key={r.id} idx={i} result={r}
                            active={active === i}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => onSelect(r)} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer
        badge="Freely licensed"
        text="Images come from Wikimedia Commons. License and author travel with each step, so handouts you print include the right credit." />
    </>
  );
}

// ── Pane: AI generation (Pollinations) ─────────────────────────────
function GeneratePane({ initialQuery, onSelect }) {
  const [prompt, setPrompt] = React.useState(initialQuery || '');
  const [style, setStyle] = React.useState('illustration');
  // Each card has its own seed. "Generate" rolls 4 fresh seeds at once so
  // the user sees variations side-by-side. "More" rolls 4 more.
  const [seeds, setSeeds] = React.useState([]);
  const [active, setActive] = React.useState(-1);
  const inputRef = React.useRef(null);

  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 60); }, []);

  const stylePreset = AI_STYLES.find((s) => s.id === style) || AI_STYLES[0];
  const fullPrompt = prompt.trim()
    ? `${prompt.trim()}, ${stylePreset.suffix}`
    : '';

  const generate = () => {
    if (!prompt.trim()) return;
    setSeeds(Array.from({ length: 4 }, () => Math.floor(Math.random() * 1_000_000)));
    setActive(-1);
  };
  const more = () => {
    setSeeds((cur) => [
      ...cur,
      ...Array.from({ length: 4 }, () => Math.floor(Math.random() * 1_000_000)),
    ]);
  };

  const pickGenerated = (seed) => {
    const url = pollinationUrl(fullPrompt, seed, { w: 768, h: 768 });
    onSelect({
      id: 'ai-' + seed,
      title: prompt.trim(),
      src: 'pollinations.ai',
      thumb: url, full: url,
      descriptionUrl: 'https://pollinations.ai',
      license: 'AI-generated',
      artist: 'Pollinations.ai (FLUX)',
      w: 768, h: 768,
    });
  };

  return (
    <>
      <div style={{ padding: '14px 22px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea ref={inputRef} value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); }
                      }}
                      placeholder="Describe the picture you want (e.g. ‘a child brushing teeth in a bathroom’)"
                      style={{
                        width: '100%', minHeight: 56, maxHeight: 120,
                        padding: '12px 14px',
                        border: '1px solid var(--hairline-strong)',
                        borderRadius: 14, background: 'var(--paper)',
                        fontFamily: 'inherit', fontSize: 14, color: 'var(--ink)',
                        outline: 'none', resize: 'vertical', lineHeight: 1.4,
                      }} />
          </div>
          <button type="button" onClick={generate}
                  className="btn btn--primary btn--lg"
                  disabled={!prompt.trim()}
                  style={{
                    height: 56, padding: '0 22px', borderRadius: 14,
                    opacity: prompt.trim() ? 1 : .45,
                    cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                  }}>
            <IconSparkle /> Generate
          </button>
        </div>

        {/* Style chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="meta" style={{ fontSize: 12, color: 'var(--ink-3)' }}>Style:</span>
          {AI_STYLES.map((s) => {
            const on = s.id === style;
            return (
              <button key={s.id} type="button" onClick={() => setStyle(s.id)}
                      className={'chip' + (on ? ' chip--active' : '')}
                      style={{ height: 26, fontSize: 12 }} title={s.hint}>
                {s.label}
              </button>
            );
          })}
          <div style={{ flex: 1 }} />
          {!seeds.length && (
            <>
              <span className="meta" style={{ fontSize: 12, color: 'var(--ink-3)' }}>Or try:</span>
              {SUGGESTED_AI.slice(0, 2).map((s) => (
                <button key={s} type="button" onClick={() => setPrompt(s)}
                        className="chip" style={{ height: 26, fontSize: 12 }}>{s}</button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="scroll" style={{ flex: 1, minHeight: 0, padding: '6px 22px 18px' }}>
        {!seeds.length ? (
          <GenerateEmpty onPick={(s) => setPrompt(s)} />
        ) : (
          <>
            <div className="meta" style={{ fontSize: 12, marginBottom: 12, color: 'var(--ink-2)' }}>
              <strong style={{ color: 'var(--ink)' }}>{seeds.length}</strong> variations of
              “<strong style={{ color: 'var(--ink)' }}>{prompt}</strong>”
              <span style={{ color: 'var(--ink-3)' }}> · {stylePreset.label.toLowerCase()} style</span>
            </div>
            <div className="grid-search-results">
              {seeds.map((seed, i) => (
                <GenerateTile key={seed} idx={i}
                              url={pollinationUrl(fullPrompt, seed)}
                              active={active === i}
                              onMouseEnter={() => setActive(i)}
                              onClick={() => pickGenerated(seed)} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18, gap: 10 }}>
              <button type="button" className="btn btn--soft" onClick={more}>
                <IconSparkle /> Generate 4 more
              </button>
              <button type="button" className="btn btn--ghost" onClick={generate}>
                Try fresh variations
              </button>
            </div>
          </>
        )}
      </div>

      <Footer
        badge="AI-generated"
        text="Images are generated by FLUX via Pollinations.ai. Generations are public — don't include personal info in prompts." />
    </>
  );
}

function GenerateTile({ url, active, idx, onMouseEnter, onClick }) {
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  return (
    <button type="button" onMouseEnter={onMouseEnter} onClick={onClick}
            disabled={!loaded}
            style={{
              appearance: 'none', border: 0, background: 'transparent',
              cursor: loaded ? 'pointer' : 'wait', padding: 0, textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 6,
              fontFamily: 'inherit',
            }}>
      <div style={{
        aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden', position: 'relative',
        background: 'var(--bg-tint)',
        boxShadow: active && loaded
          ? '0 0 0 2px var(--sage), 0 8px 20px rgba(0,0,0,.10)'
          : '0 0 0 1px var(--hairline)',
        transition: 'box-shadow .12s',
      }}>
        {!loaded && !errored && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', gap: 8,
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(110deg, var(--bg-tint) 30%, #eee 50%, var(--bg-tint) 70%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.4s linear infinite',
            color: 'var(--ink-3)', fontSize: 11, fontWeight: 700,
          }}>
            <span className="search-spinner" />
            Generating…
          </div>
        )}
        {errored && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
            color: 'var(--cat-food)', fontSize: 12, fontWeight: 700,
          }}>Generation failed</div>
        )}
        <img src={url} alt=""
             onLoad={() => setLoaded(true)}
             onError={() => setErrored(true)}
             style={{
               width: '100%', height: '100%', objectFit: 'cover',
               display: loaded ? 'block' : 'none',
             }} />
        {active && loaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.45) 100%)',
            display: 'flex', alignItems: 'flex-end', padding: 10,
          }}>
            <span style={{
              background: '#fff', color: 'var(--ink)',
              padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <IconCheck style={{ width: 12, height: 12, color: 'var(--sage-deep)' }} /> Use
            </span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'center' }}>
        Variation #{idx + 1}
      </div>
    </button>
  );
}

function GenerateEmpty({ onPick }) {
  return (
    <div style={{
      minHeight: 320,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', color: 'var(--ink-2)', padding: 32,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--sage-soft)', color: 'var(--sage-deep)',
        display: 'grid', placeItems: 'center', marginBottom: 14,
      }}>
        <IconSparkle style={{ width: 28, height: 28 }} />
      </div>
      <div className="h3" style={{ marginBottom: 6 }}>Describe the picture you want</div>
      <div className="meta" style={{ maxWidth: 420, marginBottom: 16 }}>
        Specific scenes work best — “a child brushing teeth in a tiled bathroom” beats “toothbrush.”
        Generation takes 5–15 seconds.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 460, width: '100%' }}>
        {SUGGESTED_AI.map((s) => (
          <button key={s} type="button" onClick={() => onPick(s)}
                  style={{
                    appearance: 'none', border: '1px solid var(--hairline)',
                    background: 'var(--paper)', cursor: 'pointer',
                    padding: '10px 14px', borderRadius: 10, fontFamily: 'inherit',
                    textAlign: 'left', color: 'var(--ink-2)', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--sage)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--hairline)'}>
            <IconSparkle style={{ width: 13, height: 13, color: 'var(--sage-deep)' }} />
            <span style={{ flex: 1 }}>{s}</span>
            <IconArrowR style={{ width: 13, height: 13, color: 'var(--ink-3)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Shared helpers ──────────────────────────────────────────────────
const SearchField = React.forwardRef(({ value, onChange, placeholder, onSubmit }, ref) => (
  <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} style={{ display: 'flex', gap: 8 }}>
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', gap: 10,
      height: 44, padding: '0 14px',
      border: '1px solid var(--hairline-strong)',
      borderRadius: 999, background: 'var(--paper)',
    }}>
      <IconSearch style={{ width: 16, height: 16, color: 'var(--ink-3)' }} />
      <input ref={ref} value={value} onChange={(e) => onChange(e.target.value)}
             placeholder={placeholder}
             style={{
               flex: 1, border: 0, outline: 0,
               fontSize: 15, color: 'var(--ink)',
               background: 'transparent', fontFamily: 'inherit',
             }} />
      {value && (
        <button type="button" onClick={() => onChange('')}
                style={{ border: 0, background: 'transparent', cursor: 'pointer',
                         color: 'var(--ink-3)', padding: 4 }}>
          <IconClose style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  </form>
));

function SuggestedChips({ items, onPick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span className="meta" style={{ fontSize: 12, color: 'var(--ink-3)' }}>Try:</span>
      {items.map((s) => (
        <button key={s} type="button" onClick={() => onPick(s)}
                className="chip"
                style={{ height: 26, fontSize: 12 }}>{s}</button>
      ))}
    </div>
  );
}

function ResultCard({ result: r, active, idx, onMouseEnter, onClick }) {
  const ratio = r.w && r.h ? r.w / r.h : 1;
  const h = Math.max(110, Math.min(220, Math.round(150 / ratio)));
  return (
    <button type="button" onMouseEnter={onMouseEnter} onClick={onClick}
            style={{
              appearance: 'none', border: 0, background: 'transparent',
              cursor: 'pointer', padding: 0, textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 6,
              fontFamily: 'inherit',
            }}>
      <div style={{
        height: h, borderRadius: 12, overflow: 'hidden', position: 'relative',
        background: 'var(--bg-tint)',
        boxShadow: active
          ? '0 0 0 2px var(--sage), 0 8px 20px rgba(0,0,0,.10)'
          : '0 0 0 1px var(--hairline)',
        transition: 'box-shadow .12s',
      }}>
        <img src={r.thumb} alt={r.title} loading="lazy"
             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {active && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.45) 100%)',
            display: 'flex', alignItems: 'flex-end', padding: 10,
          }}>
            <span style={{
              background: '#fff', color: 'var(--ink)',
              padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <IconCheck style={{ width: 12, height: 12, color: 'var(--sage-deep)' }} /> Use
            </span>
          </div>
        )}
      </div>
      <div style={{ minHeight: 30 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {r.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 10, height: 10, borderRadius: 2,
            background: 'var(--bg-tint)', border: '1px solid var(--hairline)',
            display: 'inline-block',
          }} />
          {r.src}{r.license ? <span style={{ marginLeft: 4 }}>· {r.license}</span> : null}
        </div>
      </div>
    </button>
  );
}

function ResultsEmpty({ icon, title, body }) {
  return (
    <div style={{
      minHeight: 320,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', color: 'var(--ink-2)', padding: 32,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'var(--bg-tint)', color: 'var(--ink-3)',
        display: 'grid', placeItems: 'center', marginBottom: 14,
      }}>{icon}</div>
      <div className="h3" style={{ marginBottom: 4 }}>{title}</div>
      <div className="meta" style={{ maxWidth: 360 }}>{body}</div>
    </div>
  );
}

function ResultsSkeleton({ label }) {
  const heights = [150, 168, 158, 178, 144, 164, 152, 176, 148, 160, 172, 156];
  return (
    <>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginBottom: 12, color: 'var(--ink-2)', fontSize: 12,
      }}>
        <span className="search-spinner" />
        {label || 'Loading…'}
      </div>
      <div className="grid-search-results">
        {heights.map((h, i) => (
          <div key={i} style={{
            height: h, borderRadius: 12,
            background: 'linear-gradient(110deg, var(--bg-tint) 30%, #eee 50%, var(--bg-tint) 70%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.2s linear infinite',
          }} />
        ))}
      </div>
      <style>{`
        @keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }
        .search-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid var(--hairline);
          border-top-color: var(--sage-deep);
          animation: spin .8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
}

function Footer({ badge, text }) {
  return (
    <div style={{
      borderTop: '1px solid var(--hairline)',
      padding: '12px 22px',
      background: 'var(--bg-tint)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 700, color: 'var(--sage-deep)',
        background: 'var(--sage-soft)', padding: '4px 10px', borderRadius: 999,
        whiteSpace: 'nowrap',
      }}>
        <IconCheck style={{ width: 12, height: 12 }} /> {badge}
      </span>
      <div className="meta" style={{ fontSize: 11.5, flex: 1 }}>{text}</div>
    </div>
  );
}

Object.assign(window, { ImageSearchModal });
