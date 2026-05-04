'use client'
import { useEffect, useState } from 'react'
import { getRoutine, RoutineResult, MOCK_USER_ID } from '@/lib/api'
import Card from '@/components/ui/Card'
import Link from 'next/link'

export default function RoutinePage() {
  const [routine, setRoutine] = useState<RoutineResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRoutine(MOCK_USER_ID)
      .then(setRoutine)
      .catch(() => setError('No routine yet — complete a check-in first.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  if (error || !routine) {
    return (
      <div style={{ maxWidth: 700, margin: '60px auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--mocha)', marginBottom: 16 }}>
          No routine yet
        </p>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
          Complete your first daily check-in to get a personalised routine.
        </p>
        <Link href="/checkin" style={{
          background: 'var(--mocha)', color: 'var(--cream)',
          padding: '12px 32px', borderRadius: 99, fontSize: 14, fontWeight: 500,
        }}>
          Start check-in →
        </Link>
      </div>
    )
  }

  const urgencyColors = {
    low:    { bg: 'rgba(74,122,68,0.08)',  border: 'rgba(74,122,68,0.25)',  text: 'var(--sage-deep)' },
    medium: { bg: 'rgba(192,120,64,0.08)', border: 'rgba(192,120,64,0.25)', text: '#8B5E2A' },
    high:   { bg: 'rgba(160,48,48,0.08)',  border: 'rgba(160,48,48,0.2)',   text: '#A03030' },
  }
  const uc = urgencyColors[routine.urgency]

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 1.5rem 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40, animation: 'fadeUp 0.6s ease both' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--rose-deep)', marginBottom: 8 }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300, color: 'var(--mocha)', lineHeight: 1.1 }}>
          Today's<br /><em>routine</em>
        </h1>
      </div>

      {/* Skin message */}
      <Card tint="var(--rose-pale)" style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.1s ease both' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
          color: 'var(--mocha)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: 12,
        }}>"{routine.skin_message}"</p>
        <span style={{
          display: 'inline-block',
          padding: '4px 14px', borderRadius: 99,
          background: uc.bg, border: `1px solid ${uc.border}`,
          color: uc.text, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>{routine.urgency} urgency</span>
      </Card>

      {/* Morning */}
      <RoutineBlock
        title="☀  Morning routine"
        steps={routine.am_routine}
        tint="var(--warm-white)"
        accent="var(--rose-deep)"
        delay="0.15s"
      />

      {/* Evening */}
      <RoutineBlock
        title="◑  Evening routine"
        steps={routine.pm_routine}
        tint="var(--warm-white)"
        accent="var(--sage-deep)"
        delay="0.22s"
      />

      {/* Paused */}
      {routine.paused_today.length > 0 && (
        <Card
          tint="rgba(192,120,64,0.05)"
          style={{ marginBottom: 24, borderColor: 'rgba(192,120,64,0.2)', animation: 'fadeUp 0.6s 0.3s ease both' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: '#8B5E2A', marginBottom: 4 }}>
            Paused actives
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            These are skipped tonight to protect your barrier.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {routine.paused_today.map(active => (
              <span key={active} style={{
                padding: '6px 16px', borderRadius: 99,
                background: 'rgba(192,120,64,0.1)', color: '#8B5E2A',
                fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
              }}>{active.replace(/_/g, ' ')}</span>
            ))}
          </div>
          {Object.entries(routine.pause_reasons).map(([active, reason]) => (
            <div key={active} style={{
              padding: '10px 0', borderTop: '1px solid rgba(192,120,64,0.12)',
              display: 'flex', gap: 12,
            }}>
              <span style={{ fontSize: 13, color: '#8B5E2A', fontWeight: 500, minWidth: 100, textTransform: 'capitalize', flexShrink: 0 }}>
                {active.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{reason}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Lifestyle flags */}
      {routine.lifestyle_flags.length > 0 && (
        <Card style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.35s ease both' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--mocha)', marginBottom: 16 }}>
            Lifestyle notes
          </h2>
          {routine.lifestyle_flags.map((flag, i) => (
            <p key={i} style={{
              fontSize: 13, color: 'var(--muted)', lineHeight: 1.7,
              marginBottom: 8, paddingLeft: 16, borderLeft: '2px solid var(--rose)',
            }}>
              {flag}
            </p>
          ))}
        </Card>
      )}

      <Link href="/checkin" style={{
        display: 'block', textAlign: 'center',
        padding: '14px', borderRadius: 99,
        border: '1px solid var(--border-strong)',
        fontSize: 13, color: 'var(--muted)',
        letterSpacing: '0.05em',
        animation: 'fadeUp 0.6s 0.4s ease both',
      }}>
        Re-do today's check-in
      </Link>
    </div>
  )
}

function RoutineBlock({ title, steps, tint, accent, delay }: {
  title: string
  steps: RoutineResult['am_routine']
  tint: string
  accent: string
  delay: string
}) {
  return (
    <Card tint={tint} style={{ marginBottom: 24, animation: `fadeUp 0.6s ${delay} ease both` }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400,
        color: 'var(--mocha)', marginBottom: 24,
      }}>{title}</h2>

      {steps.map((step, i) => (
        <div key={i} style={{
          display: 'flex', gap: 16, alignItems: 'flex-start',
          paddingBottom: i < steps.length - 1 ? 20 : 0,
          marginBottom: i < steps.length - 1 ? 20 : 0,
          borderBottom: i < steps.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          {/* Step number */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            border: `1.5px solid ${accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: accent, fontWeight: 500,
          }}>{step.step}</div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--charcoal)', marginBottom: 4 }}>
              {step.product_type}
            </p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 }}>
              {step.reason}
            </p>
            <span style={{
              fontSize: 11, padding: '3px 12px', borderRadius: 99,
              background: 'var(--sage-pale)', color: 'var(--sage-deep)',
              letterSpacing: '0.04em',
            }}>
              {step.key_ingredient}
            </span>
          </div>
        </div>
      ))}
    </Card>
  )
}

function LoadingSkeleton() {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, var(--rose-pale) 25%, var(--blush) 50%, var(--rose-pale) 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 8,
  }
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 1.5rem' }}>
      <div style={{ ...shimmerStyle, height: 64, marginBottom: 16, borderRadius: 12 }} />
      <div style={{ ...shimmerStyle, height: 120, marginBottom: 16, borderRadius: 16 }} />
      <div style={{ ...shimmerStyle, height: 240, marginBottom: 16, borderRadius: 16 }} />
      <div style={{ ...shimmerStyle, height: 200, borderRadius: 16 }} />
    </div>
  )
}
