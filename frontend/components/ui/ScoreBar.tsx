'use client'
import { scoreColor, scoreLabel } from '@/lib/api'

interface Props {
  label: string
  score: number
  maxScore?: number
}

export default function ScoreBar({ label, score, maxScore = 10 }: Props) {
  const pct = (score / maxScore) * 100
  const color = scoreColor(score)

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 6,
      }}>
        <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 500, letterSpacing: '0.04em' }}>
          {score}/10 · {scoreLabel(score)}
        </span>
      </div>
      <div style={{
        height: 5, background: 'rgba(200,170,155,0.2)',
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  )
}