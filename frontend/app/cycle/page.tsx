'use client'
import { useEffect, useState } from 'react'
import { getCycleForecast, getSkinHistory, MOCK_USER_ID, scoreColor } from '@/lib/api'
import Card from '@/components/ui/Card'

interface ForecastDay {
  date: string
  stress_probability: number
  event?: string
  cycle_day?: number
}

interface HistoryEntry {
  created_at: string
  overall_skin_health: number
  acne_severity: number
  redness: number
}

// Demo data when API not connected
const DEMO_FORECAST: ForecastDay[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const prob = i === 4 ? 0.82 : i === 5 ? 0.75 : i === 13 ? 0.6 : Math.random() * 0.35 + 0.05
  return {
    date: d.toISOString().slice(0, 10),
    stress_probability: Math.round(prob * 100) / 100,
    cycle_day: (18 + i) % 28 + 1,
    event: i === 4 ? 'Predicted breakout window' : i === 13 ? 'Period start predicted' : undefined,
  }
})

const DEMO_HISTORY: HistoryEntry[] = Array.from({ length: 10 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - i)
  return {
    created_at: d.toISOString(),
    overall_skin_health: Math.round(Math.random() * 3 + 5),
    acne_severity: Math.round(Math.random() * 4 + 1),
    redness: Math.round(Math.random() * 3 + 1),
  }
})

export default function CyclePage() {
  const [forecast, setForecast] = useState<ForecastDay[]>(DEMO_FORECAST)
  const [history, setHistory] = useState<HistoryEntry[]>(DEMO_HISTORY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCycleForecast(MOCK_USER_ID).catch(() => null),
      getSkinHistory(MOCK_USER_ID, 10).catch(() => null),
    ]).then(([fc, hist]) => {
      if (fc?.days) setForecast(fc.days)
      if (hist?.history) setHistory(hist.history)
    }).finally(() => setLoading(false))
  }, [])

  const maxProb = Math.max(...forecast.map(d => d.stress_probability))

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 1.5rem 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40, animation: 'fadeUp 0.6s ease both' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--rose-deep)', marginBottom: 8 }}>
          AI prediction
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300, color: 'var(--mocha)', lineHeight: 1.1 }}>
          Your glow<br /><em>cycle</em>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 12, maxWidth: 480 }}>
          Predicted skin stress events for the next 14 days based on your hormonal cycle, historical patterns, and lifestyle trends.
        </p>
      </div>

      {/* Forecast bar chart */}
      <Card style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.1s ease both', overflowX: 'auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--mocha)', marginBottom: 8 }}>
          14-day stress forecast
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>
          Higher bars = higher predicted skin stress probability
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, minWidth: 460 }}>
          {forecast.map((day, i) => {
            const pct = day.stress_probability / maxProb
            const isHigh = day.stress_probability > 0.6
            const isPeak = day.stress_probability === maxProb
            const label = new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })

            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {isPeak && (
                  <span style={{
                    fontSize: 9, color: '#A03030', letterSpacing: '0.06em',
                    textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>peak</span>
                )}
                <div
                  title={`${Math.round(day.stress_probability * 100)}% stress probability${day.event ? '\n' + day.event : ''}`}
                  style={{
                    width: '100%',
                    height: `${Math.max(pct * 110, 6)}px`,
                    background: isPeak ? '#A03030' : isHigh ? '#C07840' : 'var(--rose)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.8s cubic-bezier(0.16,1,0.3,1)',
                    cursor: 'default',
                    opacity: 0.85,
                  }}
                />
                <span style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.2 }}>
                  {label.split(' ').map((l, li) => <span key={li} style={{ display: 'block' }}>{l}</span>)}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Upcoming events */}
      <Card style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.2s ease both' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--mocha)', marginBottom: 20 }}>
          Upcoming events
        </h2>
        {forecast.filter(d => d.event || d.stress_probability > 0.55).slice(0, 5).map((day, i) => {
          const isHigh = day.stress_probability > 0.6
          const daysAway = Math.round((new Date(day.date).getTime() - Date.now()) / 86400000)
          return (
            <div key={day.date} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '14px 0',
              borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            }}>
              {/* Date pill */}
              <div style={{
                background: isHigh ? 'rgba(160,48,48,0.08)' : 'var(--rose-pale)',
                border: `1px solid ${isHigh ? 'rgba(160,48,48,0.2)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px', textAlign: 'center', minWidth: 64, flexShrink: 0,
              }}>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: isHigh ? '#A03030' : 'var(--mocha)' }}>
                  {new Date(day.date).getDate()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {new Date(day.date).toLocaleDateString('en-GB', { month: 'short' })}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--charcoal)', marginBottom: 2 }}>
                  {day.event || `Elevated skin stress`}
                </p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Cycle day {day.cycle_day} · {daysAway === 0 ? 'today' : daysAway === 1 ? 'tomorrow' : `in ${daysAway} days`}
                </p>
              </div>

              <div style={{
                fontSize: 14, fontWeight: 500,
                color: isHigh ? '#A03030' : 'var(--muted)',
              }}>
                {Math.round(day.stress_probability * 100)}%
              </div>
            </div>
          )
        })}
      </Card>

      {/* Historical skin score */}
      <Card style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.3s ease both' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, color: 'var(--mocha)', marginBottom: 8 }}>
          Skin health — last 10 days
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
          Overall skin health score from daily analyses. Higher is better.
        </p>

        {[...history].reverse().map((entry, i) => {
          const date = new Date(entry.created_at)
          const label = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
          const score = entry.overall_skin_health
          const pct = (score / 10) * 100

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 64 }}>{label}</span>
              <div style={{ flex: 1, height: 6, background: 'rgba(200,170,155,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: scoreColor(10 - score),
                  borderRadius: 99,
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--mocha)', minWidth: 28, textAlign: 'right' }}>
                {score}
              </span>
            </div>
          )
        })}
      </Card>

      {/* Info card */}
      <Card tint="var(--sage-pale)" style={{ animation: 'fadeUp 0.6s 0.4s ease both' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--sage-deep)', marginBottom: 12 }}>
          How predictions improve
        </h3>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
          The cycle predictor learns from your daily check-ins. After 30 days of data, it identifies 
          your personal stress patterns — hormonal breakouts, stress acne, sleep-related dullness — 
          and warns you 3–5 days in advance so you can adapt your routine proactively.
        </p>
      </Card>
    </div>
  )
}
