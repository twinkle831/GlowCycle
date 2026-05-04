import { CSSProperties, ReactNode } from 'react'

interface Props {
  children: ReactNode
  style?: CSSProperties
  tint?: string
}

export default function Card({ children, style, tint }: Props) {
  return (
    <div style={{
      background: tint || 'var(--warm-white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px 24px',
      boxShadow: 'var(--shadow-soft)',
      ...style,
    }}>
      {children}
    </div>
  )
}