'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',         label: 'Home',     icon: '◎' },
  { href: '/checkin',  label: 'Check In', icon: '✦' },
  { href: '/routine',  label: 'Routine',  icon: '◈' },
  { href: '/cycle',    label: 'Cycle',    icon: '◑' },
  { href: '/products', label: 'Products', icon: '◇' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Top bar — desktop */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(250,246,240,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--rose), var(--sage))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>✦</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 400,
            color: 'var(--mocha)',
            letterSpacing: '0.05em',
          }}>Glow Cycle</span>
        </Link>

        <nav style={{ display: 'flex', gap: '2rem' }}>
          {links.slice(1).map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: pathname === l.href ? 'var(--rose-deep)' : 'var(--muted)',
              borderBottom: pathname === l.href ? '1px solid var(--rose-deep)' : '1px solid transparent',
              paddingBottom: 2,
              transition: 'color 0.2s, border-color 0.2s',
            }}>{l.label}</Link>
          ))}
        </nav>
      </header>

      {/* Bottom nav — mobile */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(250,246,240,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        padding: '8px 0 12px',
      }}>
        {links.map(l => {
          const active = pathname === l.href
          return (
            <Link key={l.href} href={l.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              color: active ? 'var(--rose-deep)' : 'var(--muted)',
              transition: 'color 0.2s',
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{l.icon}</span>
              <span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {l.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer for fixed top bar */}
      <div style={{ height: 60 }} />

      <style>{`
        @media (min-width: 640px) {
          nav:last-of-type { display: none; }
        }
        @media (max-width: 639px) {
          header nav { display: none; }
        }
      `}</style>
    </>
  )
}