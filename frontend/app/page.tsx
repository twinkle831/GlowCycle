'use client'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,196,184,0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-8%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(143,175,138,0.25) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <section style={{
        maxWidth: 800, margin: '0 auto',
        padding: '80px 2rem 60px',
        textAlign: 'center',
        position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.8s ease both',
      }}>
        <p style={{
          fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--rose-deep)', marginBottom: 24,
          fontWeight: 500,
        }}>Your intelligent skincare companion</p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(48px, 8vw, 88px)',
          fontWeight: 300,
          color: 'var(--mocha)',
          lineHeight: 1.05,
          marginBottom: 28,
        }}>
          Skin that learns<br />
          <em style={{ color: 'var(--rose-deep)', fontStyle: 'italic' }}>with you.</em>
        </h1>

        <p style={{
          fontSize: 17, color: 'var(--muted)', lineHeight: 1.8,
          maxWidth: 520, margin: '0 auto 48px',
          fontWeight: 300,
        }}>
          Glow Cycle observes your skin daily, predicts your breakout patterns,
          and adapts your routine in real time — like a dermatologist who actually
          knows your life.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/checkin" style={{
            background: 'var(--mocha)',
            color: 'var(--cream)',
            padding: '14px 36px',
            borderRadius: 'var(--radius-full)',
            fontSize: 14, fontWeight: 500,
            letterSpacing: '0.05em',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'inline-block',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.transform = 'translateY(-2px)'
            ;(e.target as HTMLElement).style.boxShadow = 'var(--shadow-md)'
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.transform = ''
            ;(e.target as HTMLElement).style.boxShadow = ''
          }}>
            Start daily check-in →
          </Link>
          <Link href="/cycle" style={{
            background: 'transparent',
            color: 'var(--mocha)',
            padding: '14px 36px',
            borderRadius: 'var(--radius-full)',
            fontSize: 14, fontWeight: 400,
            letterSpacing: '0.05em',
            border: '1px solid var(--border-strong)',
            transition: 'background 0.2s',
            display: 'inline-block',
          }}>
            View my cycle
          </Link>
        </div>
      </section>

      {/* Stat strip */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '0 2rem 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        animation: 'fadeUp 0.8s 0.2s ease both',
      }}>
        {[
          { icon: '◎', stat: '7-day', label: 'skin trend analysis' },
          { icon: '◑', stat: 'Cycle-aware', label: 'breakout prediction' },
          { icon: '✦', stat: 'Real-time', label: 'routine adaptation' },
          { icon: '◇', stat: 'Budget-first', label: 'product recommendations' },
        ].map(item => (
          <div key={item.label} style={{
            background: 'var(--warm-white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-soft)',
          }}>
            <div style={{ fontSize: 24, marginBottom: 12, color: 'var(--rose-deep)' }}>{item.icon}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 26,
              fontWeight: 400, color: 'var(--mocha)', lineHeight: 1,
              marginBottom: 6,
            }}>{item.stat}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.03em' }}>{item.label}</div>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '0 2rem 100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 20,
        animation: 'fadeUp 0.8s 0.35s ease both',
      }}>
        {[
          {
            href: '/checkin', bg: 'var(--rose-pale)',
            title: 'Daily Check-in',
            desc: 'Upload a selfie and log your lifestyle. Your AI agent analyses your skin in seconds.',
            cta: 'Check in today →',
          },
          {
            href: '/routine', bg: 'var(--sage-pale)',
            title: "Today's Routine",
            desc: 'See your personalised AM + PM routine, what\'s paused and exactly why.',
            cta: 'See routine →',
          },
          {
            href: '/products', bg: 'var(--blush)',
            title: 'Product Shelf',
            desc: 'Compare ingredients, find budget alternatives, and track what works for your skin.',
            cta: 'Browse products →',
          },
        ].map(card => (
          <Link key={card.href} href={card.href} style={{
            background: card.bg,
            borderRadius: 'var(--radius-lg)',
            padding: '36px 28px',
            border: '1px solid var(--border)',
            display: 'block',
            transition: 'transform 0.25s, box-shadow 0.25s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = ''
            ;(e.currentTarget as HTMLElement).style.boxShadow = ''
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 26,
              fontWeight: 400, color: 'var(--mocha)', marginBottom: 12,
            }}>{card.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
              {card.desc}
            </p>
            <span style={{
              fontSize: 13, fontWeight: 500, color: 'var(--rose-deep)',
              letterSpacing: '0.04em',
            }}>{card.cta}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}