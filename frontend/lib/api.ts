const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface SkinReport {
  acne_severity: number
  oiliness: number
  dryness: number
  redness: number
  dark_circles: number
  texture_roughness: number
  pigmentation: number
  overall_skin_health: number
  barrier_stress: boolean
  immediate_concern: string
  observations: string[]
  zones: {
    forehead: { acne: number; oiliness: number }
    nose:     { acne: number; oiliness: number }
    chin:     { acne: number; oiliness: number }
    cheeks:   { redness: number; dryness: number }
  }
}

export interface RoutineStep {
  step: number
  product_type: string
  reason: string
  key_ingredient: string
}

export interface RoutineResult {
  am_routine: RoutineStep[]
  pm_routine: RoutineStep[]
  paused_today: string[]
  pause_reasons: Record<string, string>
  lifestyle_flags: string[]
  skin_message: string
  urgency: 'low' | 'medium' | 'high'
}

export interface CheckinPayload {
  user_id: string
  lifestyle: {
    sleep_hours: number
    water_ml: number
    stress_level: number
    exercise_done: boolean
    diet_flags: string[]
    makeup_hours: number
  }
}

export interface CheckinSSEEvent {
  step: 'analyzing_skin' | 'skin_done' | 'fetching_context' | 'planning_routine' | 'done'
  report?: SkinReport
  routine?: RoutineResult
}

// Stream the daily check-in — returns async generator of SSE events
export async function* streamCheckin(
  imageFile: File,
  payload: CheckinPayload
): AsyncGenerator<CheckinSSEEvent> {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('data', JSON.stringify(payload))

  const response = await fetch(`${API}/api/checkin`, {
    method: 'POST',
    body: formData,
  })

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6))
          yield event as CheckinSSEEvent
        } catch {}
      }
    }
  }
}

export async function getRoutine(userId: string): Promise<RoutineResult> {
  const res = await fetch(`${API}/api/routine/${userId}`)
  if (!res.ok) throw new Error('Failed to fetch routine')
  return res.json()
}

export async function getSkinHistory(userId: string, days = 14) {
  const res = await fetch(`${API}/api/history/${userId}?days=${days}`)
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function getCycleForecast(userId: string) {
  const res = await fetch(`${API}/api/cycle/forecast?user_id=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch forecast')
  return res.json()
}

export async function searchProducts(query: string, budget?: number) {
  const params = new URLSearchParams({ query })
  if (budget) params.set('budget', String(budget))
  const res = await fetch(`${API}/api/products/search?${params}`)
  if (!res.ok) throw new Error('Failed to search products')
  return res.json()
}

// Score colour: 0=clear, 10=severe
export function scoreColor(score: number): string {
  if (score <= 2) return 'var(--sage)'
  if (score <= 5) return 'var(--rose-deep)'
  if (score <= 7) return '#C07840'
  return '#A03030'
}

export function scoreLabel(score: number): string {
  if (score <= 2) return 'Clear'
  if (score <= 4) return 'Mild'
  if (score <= 6) return 'Moderate'
  if (score <= 8) return 'High'
  return 'Severe'
}

export const MOCK_USER_ID = 'user_demo_001'