'use client'
import { useState } from 'react'
import { searchProducts } from '@/lib/api'
import Card from '@/components/ui/Card'

interface ProductResult {
  name: string
  inci_name: string
  category: string
  benefits: string[]
  warnings: string[]
  content: string
  score?: number
}

const QUICK_SEARCHES = [
  'gentle cleanser for sensitive skin',
  'niacinamide under ₹500',
  'retinol alternative for beginners',
  'moisturiser for dry barrier-stressed skin',
  'SPF 50 for oily skin',
  'salicylic acid for hormonal acne',
]

const BUDGET_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: 'Under ₹300', value: 300 },
  { label: 'Under ₹500', value: 500 },
  { label: 'Under ₹1000', value: 1000 },
  { label: 'Under ₹2000', value: 2000 },
]

// Demo results for when API is offline
const DEMO_RESULTS: ProductResult[] = [
  {
    name: 'Niacinamide',
    inci_name: 'Niacinamide',
    category: 'active',
    benefits: ['brightening', 'pore-minimising', 'oil-control', 'barrier-repair'],
    warnings: ['may conflict with Vitamin C at high concentrations'],
    content: 'Niacinamide (Vitamin B3) reduces pore appearance, controls sebum, fades hyperpigmentation, and strengthens the skin barrier. Effective at 2-10%. Well tolerated by most skin types including sensitive skin.',
  },
  {
    name: 'Centella Asiatica',
    inci_name: 'Centella Asiatica Extract',
    category: 'soothing',
    benefits: ['redness-reduction', 'healing', 'sensitive-skin', 'barrier-repair'],
    warnings: [],
    content: 'Centella asiatica (cica) calms inflammation, reduces redness, and accelerates healing. Excellent for post-breakout recovery and barrier stress. Safe for all skin types.',
  },
  {
    name: 'Ceramide NP',
    inci_name: 'Ceramide NP',
    category: 'barrier',
    benefits: ['barrier-repair', 'hydration', 'sensitive-skin'],
    warnings: [],
    content: 'Ceramides are lipids that form the skin barrier. Ceramide NP replenishes the protective layer, prevents water loss, and is essential for barrier repair. Ideal for dry and sensitive skin.',
  },
]

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  active:     { bg: 'rgba(200,137,110,0.12)', color: 'var(--rose-deep)' },
  soothing:   { bg: 'var(--sage-pale)',        color: 'var(--sage-deep)' },
  barrier:    { bg: 'rgba(100,150,200,0.1)',   color: '#3A6090' },
  humectant:  { bg: 'rgba(160,120,200,0.1)',   color: '#6040A0' },
  exfoliant:  { bg: 'rgba(192,120,64,0.1)',    color: '#8B5E2A' },
}

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const [budget, setBudget] = useState(0)
  const [results, setResults] = useState<ProductResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleSearch = async (q: string = query) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    setResults([])
    setQuery(q)

    try {
      const data = await searchProducts(q, budget || undefined)
      setResults(data.results || data)
    } catch {
      // Show demo results if API offline
      setResults(DEMO_RESULTS)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 1.5rem 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40, animation: 'fadeUp 0.6s ease both' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--rose-deep)', marginBottom: 8 }}>
          Ingredient intelligence
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300, color: 'var(--mocha)', lineHeight: 1.1 }}>
          Find what<br /><em>works for you</em>
        </h1>
      </div>

      {/* Search box */}
      <Card style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.1s ease both' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. niacinamide for oily skin, or SPF under ₹500…"
            style={{
              flex: 1, padding: '12px 16px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--warm-white)',
              fontSize: 14, color: 'var(--charcoal)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--rose-deep)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border-strong)')}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            style={{
              padding: '12px 24px', borderRadius: 'var(--radius-full)',
              background: query.trim() ? 'var(--mocha)' : 'rgba(200,170,155,0.3)',
              color: query.trim() ? 'var(--cream)' : 'var(--muted)',
              fontSize: 14, fontWeight: 500,
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {loading ? '…' : 'Search'}
          </button>
        </div>

        {/* Budget filter */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Budget</span>
          {BUDGET_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setBudget(opt.value)} style={{
              padding: '4px 14px', borderRadius: 99,
              border: `1px solid ${budget === opt.value ? 'var(--rose-deep)' : 'var(--border-strong)'}`,
              background: budget === opt.value ? 'var(--rose-pale)' : 'transparent',
              color: budget === opt.value ? 'var(--rose-deep)' : 'var(--muted)',
              fontSize: 12, transition: 'all 0.15s',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Quick searches */}
      {!searched && (
        <div style={{ marginBottom: 32, animation: 'fadeUp 0.6s 0.2s ease both' }}>
          <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
            Try these
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {QUICK_SEARCHES.map(qs => (
              <button key={qs} onClick={() => handleSearch(qs)} style={{
                padding: '8px 18px', borderRadius: 99,
                border: '1px solid var(--border-strong)',
                background: 'var(--warm-white)',
                color: 'var(--mocha)', fontSize: 13,
                transition: 'all 0.15s', textAlign: 'left',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--rose-pale)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--rose-deep)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--warm-white)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'
              }}>
                {qs}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2px solid var(--rose)',
            borderTopColor: 'var(--rose-deep)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Searching ingredient database…</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && (
        <Card>
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
            No results found. Try a broader search.
          </p>
        </Card>
      )}

      {!loading && results.map((result, i) => {
        const catColors = CATEGORY_COLORS[result.category] || { bg: 'var(--blush)', color: 'var(--mocha)' }
        const isExpanded = expanded === result.name

        return (
          <Card key={result.name} style={{ marginBottom: 16, animation: `fadeUp 0.4s ${i * 0.07}s ease both` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 24,
                  fontWeight: 400, color: 'var(--mocha)', marginBottom: 4,
                }}>{result.name}</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  {result.inci_name}
                </p>
              </div>
              <span style={{
                padding: '4px 14px', borderRadius: 99,
                background: catColors.bg, color: catColors.color,
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'capitalize',
                flexShrink: 0,
              }}>{result.category}</span>
            </div>

            {/* Benefits */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {result.benefits.map(b => (
                <span key={b} style={{
                  padding: '3px 12px', borderRadius: 99,
                  background: 'var(--sage-pale)', color: 'var(--sage-deep)',
                  fontSize: 11, textTransform: 'capitalize',
                }}>{b.replace(/-/g, ' ')}</span>
              ))}
            </div>

            {/* Content — expandable */}
            <p style={{
              fontSize: 13, color: 'var(--muted)', lineHeight: 1.7,
              maxHeight: isExpanded ? 'none' : '3.4em',
              overflow: 'hidden',
            }}>
              {result.content}
            </p>

            {result.content.length > 120 && (
              <button onClick={() => setExpanded(isExpanded ? null : result.name)} style={{
                fontSize: 12, color: 'var(--rose-deep)', marginTop: 6,
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              }}>
                {isExpanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'rgba(192,120,64,0.08)',
                border: '1px solid rgba(192,120,64,0.2)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <p style={{ fontSize: 12, color: '#8B5E2A', lineHeight: 1.6 }}>
                  ⚠ {result.warnings.join(' · ')}
                </p>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
