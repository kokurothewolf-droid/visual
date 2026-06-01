// screens/about.jsx — the story behind KindCue
//
// A warm, calm page: what it is, why it was built (the founder's letter),
// who it's for, how it works, and how to get in touch. Styled to match the
// app — sage, paper, Atkinson Hyperlegible, soft cards, generous space.

function AboutScreen({ route, navigate }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%' }}>
      {/* Hero */}
      <section style={{
        maxWidth: 820, margin: '0 auto', padding: '64px 24px 40px', textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: '0 auto 22px',
          background: 'var(--sage-deep)', color: '#fff',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 10px 30px rgba(48,40,20,.14)'
        }}>
          <IconBrand style={{ width: 34, height: 34 }} />
        </div>
        <div className="eyebrow" style={{
          fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--sage-deep)', marginBottom: 14
        }}>About KindCue</div>
        <h1 style={{
          margin: 0, fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.12, fontWeight: 700,
          color: 'var(--ink)', letterSpacing: '-.01em', textWrap: 'balance'
        }}>
          Calmer days, clearer expectations, more confident kids.
        </h1>
        <p style={{
          margin: '20px auto 0', maxWidth: 600,
          fontSize: 'clamp(17px, 2.4vw, 20px)', lineHeight: 1.55, color: 'var(--ink-2)',
          textWrap: 'pretty'
        }}>
          KindCue is a free, calm, sensory-friendly tool for building
          <strong style={{ color: 'var(--ink)' }}> visual schedules</strong> and
          <strong style={{ color: 'var(--ink)' }}> personalized social narratives</strong> —
          designed to be easy to customize, update, and share.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate('/templates')}>
            Start from a template
          </button>
          <button type="button" className="btn btn--soft btn--lg" onClick={() => navigate('/library')}>
            See my boards
          </button>
        </div>
      </section>

      {/* What it is — three ideas */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '20px 24px 8px' }}>
        <div style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
        }}>
          {[
          { icon: <IconList />, cat: 'routine', title: 'Visual schedules',
            body: 'Lay out a day step by step with clear pictures and simple words, so what comes next is never a surprise.' },
          { icon: <IconBook />, cat: 'hygiene', title: 'Social narratives',
            body: 'Build gentle, personalized stories that walk a child through new or tricky situations before they happen.' },
          { icon: <IconStar />, cat: 'school', title: 'Run it together',
            body: 'A calm child view with check-offs, a visual timer, and small rewards turns a plan into a shared, doable routine.' }].
          map((c, i) => {
            const cat = CATEGORIES[c.cat];
            return (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 12, marginBottom: 16,
                  background: cat.bg, color: cat.ink,
                  display: 'grid', placeItems: 'center'
                }}>
                  {React.cloneElement(c.icon, { style: { width: 24, height: 24 } })}
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--ink-2)', textWrap: 'pretty' }}>{c.body}</p>
              </div>);

          })}
        </div>
      </section>

      {/* The letter — why I built it */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 8px' }}>
        <div style={{
          background: 'var(--paper)', border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)',
          padding: 'clamp(28px, 5vw, 48px)'
        }}>
          <div className="eyebrow" style={{
            fontSize: 13, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--sage-deep)', marginBottom: 18
          }}>Why I built it</div>

          <div style={{ fontSize: 'clamp(16px, 2.2vw, 18px)', lineHeight: 1.7, color: 'var(--ink)' }}>
            <p style={{ margin: '0 0 18px', textWrap: 'pretty' }}>
              KindCue was created by a dad who understands how much the right support can matter.
            </p>
            <p style={{ margin: '0 0 18px', textWrap: 'pretty' }}>
              My son, Aiden, has Level&nbsp;2 autism, and like many autistic children, he benefits from
              clear expectations, predictable routines, and visual tools that help him understand what
              comes next. But creating those supports can take time, energy, and resources that many
              caregivers, teachers, and therapists simply do not have enough of.
            </p>
            <p style={{ margin: '0 0 18px', textWrap: 'pretty' }}>
              I built KindCue to be a free, calm, sensory-friendly tool for creating visual schedules and
              personalized social narratives. It was inspired by the printable supports used in autism
              centers, schools, and therapy settings — but designed to be easier to customize, update,
              and share.
            </p>
            <p style={{ margin: '0 0 18px', textWrap: 'pretty' }}>
              This project comes from my own experience as a parent trying to support my child the best
              way I can. My hope is that KindCue can make life a little easier for other families,
              educators, therapists, and support teams who are helping neurodiverse children navigate
              their day.
            </p>
            <p style={{ margin: 0, textWrap: 'pretty' }}>
              KindCue exists to help create calmer days, clearer expectations, and more confident kids —
              one kind cue at a time.
            </p>
          </div>

          {/* Signature */}
          <div style={{
            marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--hairline)',
            display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--cat-social-bg, #EAE4F1)', color: 'var(--cat-social, #9783B0)',
              display: 'grid', placeItems: 'center'
            }}>
              <IconHeart style={{ width: 22, height: 22 }} />
            </div>
            <div>
              {/* Replace [Your name] with how you'd like to be credited. */}
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Ryan</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>Founder of KindCue · Aiden's dad</div>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 8px' }}>
        <h2 style={{
          margin: '0 0 4px', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: 'var(--ink)',
          textAlign: 'center'
        }}>Made for the people doing the work</h2>
        <p style={{ margin: '0 auto 26px', maxWidth: 540, textAlign: 'center', color: 'var(--ink-2)', fontSize: 16, lineHeight: 1.55 }}>
          If you're helping a neurodiverse child move through their day, KindCue is for you.
        </p>
        <div style={{
          display: 'grid', gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
        }}>
          {[
          { icon: <IconKids />, label: 'Families & caregivers', body: 'Build a morning routine once, then run it together every day.' },
          { icon: <IconTemplates />, label: 'Teachers', body: 'Create classroom supports and send a copy home in seconds.' },
          { icon: <IconCalm />, label: 'Therapists & SLPs', body: 'Tailor narratives to a session and share them with the family.' },
          { icon: <IconShared />, label: 'Support teams', body: 'Keep everyone on the same page with one shared, editable board.' }].
          map((c, i) =>
          <div key={i} style={{
            background: 'var(--paper)', border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)', padding: 20, boxShadow: 'var(--shadow-card)'
          }}>
              <div style={{ color: 'var(--sage-deep)', marginBottom: 12 }}>
                {React.cloneElement(c.icon, { style: { width: 24, height: 24 } })}
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)', textWrap: 'pretty' }}>{c.body}</div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 8px' }}>
        <h2 style={{
          margin: '0 0 24px', fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 700, color: 'var(--ink)',
          textAlign: 'center'
        }}>How it works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
          { n: 1, title: 'Start from a template — or a blank board', body: 'Morning routines, bedtime, first-day-of-school stories, and more. Pick one and make it yours.' },
          { n: 2, title: 'Customize with words and pictures', body: 'Add steps, drop in photos or library icons, set times and durations, and read each step aloud.' },
          { n: 3, title: 'Run it in the calm child view', body: 'One step at a time, with a feelings check-in, a visual timer, check-offs, and gentle rewards.' },
          { n: 4, title: 'Print or share', body: 'Print a clean copy for the fridge, or share a link or QR code so the whole team has the same board.' }].
          map((s) =>
          <div key={s.n} style={{
            display: 'flex', gap: 18, alignItems: 'flex-start',
            background: 'var(--paper)', border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)', padding: '18px 20px', boxShadow: 'var(--shadow-card)'
          }}>
              <div style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: '50%',
              background: 'var(--sage-soft)', color: 'var(--sage-deep)',
              display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 700
            }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)', textWrap: 'pretty' }}>{s.body}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Closing / get in touch */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{
          background: 'var(--sage-deep)', color: '#fff',
          borderRadius: 'var(--r-lg)', padding: 'clamp(30px, 5vw, 46px)', textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700, color: '#fff' }}>
            Always free for the families who need it.
          </h2>
          <p style={{ margin: '0 auto 26px', maxWidth: 520, fontSize: 16.5, lineHeight: 1.6, color: 'rgba(255,255,255,.85)', textWrap: 'pretty' }}>
            KindCue is a labor of love, and it grows with your feedback. If it's helped your family or
            classroom — or if there's something you wish it did — I'd love to hear from you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:hello@kindcue.app"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9, textDecoration: 'none',
              height: 48, padding: '0 24px', borderRadius: 999,
              background: '#fff', color: 'var(--sage-deep)', fontWeight: 700, fontSize: 15
            }}>
              <IconHeart style={{ width: 18, height: 18 }} />
              Share feedback
            </a>
            <button type="button" onClick={() => navigate('/templates')}
            style={{
              appearance: 'none', border: '1px solid rgba(255,255,255,.35)', cursor: 'pointer',
              height: 48, padding: '0 24px', borderRadius: 999, fontFamily: 'inherit',
              background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 15
            }}>
              Build your first board
            </button>
          </div>
          {/* Replace with your real contact address before publishing. */}
          <div style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,.6)' }}>

          </div>
        </div>
      </section>
    </div>);

}

Object.assign(window, { AboutScreen });