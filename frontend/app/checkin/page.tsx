'use client'
import { useState, useRef, useCallback } from 'react'
import {
  streamCheckin, CheckinSSEEvent, SkinReport, RoutineResult,
  scoreColor, scoreLabel, MOCK_USER_ID,
} from '@/lib/api'
import ScoreBar from '@/components/ui/ScoreBar'
import Card from '@/components/ui/Card'

const DIET_FLAGS = ['high_sugar', 'dairy', 'alcohol', 'spicy', 'processed', 'caffeine']

const STEPS: Record<string, string> = {
  analyzing_skin:    'Analysing your skin…',
  skin_done:         'Skin analysis complete ✓',
  fetching_context:  'Checking weather, cycle & trends…',
  planning_routine:  'Building your routine…',
  done:              'All done ✓',
}

export default function CheckinPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  // Lifestyle form
  const [sleep, setSleep] = useState(7)
  const [water, setWater] = useState(2000)
  const [stress, setStress] = useState(3)
  const [exercise, setExercise] = useState(false)
  const [makeup, setMakeup] = useState(0)
  const [dietFlags, setDietFlags] = useState<string[]>([])

  // Result state
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [skinReport, setSkinReport] = useState<SkinReport | null>(null)
  const [routine, setRoutine] = useState<RoutineResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setSkinReport(null)
    setRoutine(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }, [])

  const toggleDiet = (flag: string) =>
    setDietFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag])

  const handleSubmit = async () => {
    if (!imageFile) return
    setLoading(true)
    setError(null)
    setSkinReport(null)
    setRoutine(null)

    try {
      const stream = streamCheckin(imageFile, {
        user_id: MOCK_USER_ID,
        lifestyle: {
          sleep_hours: sleep,
          water_ml: water,
          stress_level: stress,
          exercise_done: exercise,
          diet_flags: dietFlags,
          makeup_hours: makeup,
        },
      })

      for await (const event of stream) {
        setCurrentStep(event.step)
        if (event.step === 'skin_done' && event.report) setSkinReport(event.report)
        if (event.step === 'done' && event.routine) setRoutine(event.routine)
      }
    } catch (e) {
      setError('Could not reach the AI backend. Is your AMD VM running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 1.5rem 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 40, animation: 'fadeUp 0.6s ease both' }}>
        <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--rose-deep)', marginBottom: 8 }}>
          Daily ritual
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300, color: 'var(--mocha)', lineHeight: 1.1 }}>
          How's your skin<br /><em>today?</em>
        </h1>
      </div>

      {/* Selfie Upload */}
      <Card style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.1s ease both' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--mocha)', marginBottom: 16 }}>
          Upload a selfie
        </h2>

        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--rose-deep)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            padding: imageUrl ? '0' : '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            background: dragging ? 'var(--rose-pale)' : 'transparent',
            overflow: 'hidden',
            minHeight: imageUrl ? 'auto' : 180,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {imageUrl ? (
            <div style={{ position: 'relative', width: '100%' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Skin selfie" style={{
                width: '100%', maxHeight: 320, objectFit: 'cover',
                display: 'block', borderRadius: 'var(--radius-md)',
              }} />
              <div style={{
                position: 'absolute', bottom: 12, right: 12,
                background: 'rgba(44,36,32,0.7)', color: '#fff',
                fontSize: 12, padding: '4px 12px', borderRadius: 99,
                backdropFilter: 'blur(8px)',
              }}>
                tap to change
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>✦</div>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                Drop a selfie here or <span style={{ color: 'var(--rose-deep)', textDecoration: 'underline' }}>browse</span>
              </p>
              <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
                Natural lighting, no filter, front-facing
              </p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </Card>

      {/* Lifestyle Form */}
      <Card style={{ marginBottom: 24, animation: 'fadeUp 0.6s 0.2s ease both' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--mocha)', marginBottom: 24 }}>
          How was your day?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>

          {/* Sleep */}
          <div>
            <label style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
              Sleep — {sleep}h
            </label>
            <input type="range" min={3} max={12} step={0.5} value={sleep}
              onChange={e => setSleep(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--rose-deep)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              <span>3h</span><span>12h</span>
            </div>
          </div>

          {/* Stress */}
          <div>
            <label style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
              Stress level — {stress}/10
            </label>
            <input type="range" min={1} max={10} step={1} value={stress}
              onChange={e => setStress(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--rose-deep)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              <span>calm</span><span>very stressed</span>
            </div>
          </div>

          {/* Water */}
          <div>
            <label style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
              Water — {water}ml
            </label>
            <input type="range" min={500} max={4000} step={250} value={water}
              onChange={e => setWater(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--sage-deep)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              <span>500ml</span><span>4L</span>
            </div>
          </div>

          {/* Makeup */}
          <div>
            <label style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
              Makeup worn — {makeup}h
            </label>
            <input type="range" min={0} max={16} step={0.5} value={makeup}
              onChange={e => setMakeup(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--sage-deep)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              <span>none</span><span>16h</span>
            </div>
          </div>
        </div>

        {/* Exercise toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <button
            onClick={() => setExercise(!exercise)}
            style={{
              width: 44, height: 26, borderRadius: 99,
              background: exercise ? 'var(--sage)' : 'rgba(200,170,155,0.3)',
              position: 'relative', transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3,
              left: exercise ? 22 : 3,
              width: 20, height: 20, borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
          <span style={{ fontSize: 14, color: 'var(--charcoal)' }}>
            Exercised today
          </span>
        </div>

        {/* Diet flags */}
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>
            Diet triggers (select all that apply)
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DIET_FLAGS.map(flag => (
              <button key={flag} onClick={() => toggleDiet(flag)} style={{
                padding: '6px 16px',
                borderRadius: 99,
                border: `1px solid ${dietFlags.includes(flag) ? 'var(--rose-deep)' : 'var(--border-strong)'}`,
                background: dietFlags.includes(flag) ? 'var(--rose-pale)' : 'transparent',
                color: dietFlags.includes(flag) ? 'var(--rose-deep)' : 'var(--muted)',
                fontSize: 12, fontWeight: dietFlags.includes(flag) ? 500 : 400,
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}>
                {flag.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!imageFile || loading}
        style={{
          width: '100%', padding: '16px',
          background: !imageFile || loading ? 'rgba(200,170,155,0.3)' : 'var(--mocha)',
          color: !imageFile || loading ? 'var(--muted)' : 'var(--cream)',
          borderRadius: 'var(--radius-full)',
          fontSize: 15, fontWeight: 500, letterSpacing: '0.05em',
          transition: 'all 0.2s', cursor: !imageFile || loading ? 'not-allowed' : 'pointer',
          marginBottom: 32, animation: 'fadeUp 0.6s 0.3s ease both',
        }}
      >
        {loading ? `${STEPS[currentStep || 'analyzing_skin']}` : 'Analyse my skin →'}
      </button>

      {/* Loading progress */}
      {loading && (
        <Card tint="var(--rose-pale)" style={{ marginBottom: 24, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '2px solid var(--rose)',
              borderTopColor: 'var(--rose-deep)',
              animation: 'spin 0.8s linear infinite',
              flexShrink: 0,
            }} />
            <div>
              <p style={{ fontSize: 14, color: 'var(--mocha)', fontWeight: 500 }}>
                {STEPS[currentStep || 'analyzing_skin']}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                Your AI agents are working…
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card tint="rgba(200,60,60,0.08)" style={{ marginBottom: 24, borderColor: 'rgba(200,60,60,0.2)' }}>
          <p style={{ fontSize: 14, color: '#A03030' }}>{error}</p>
        </Card>
      )}

      {/* Skin Report */}
      {skinReport && (
        <div style={{ animation: 'fadeUp 0.6s ease both' }}>
          <Card tint="var(--rose-pale)" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--mocha)' }}>
                Skin analysis
              </h2>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 300,
                  color: scoreColor(10 - skinReport.overall_skin_health),
                }}>
                  {skinReport.overall_skin_health}/10
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  overall health
                </div>
              </div>
            </div>

            {skinReport.barrier_stress && (
              <div style={{
                background: 'rgba(192,120,64,0.12)', border: '1px solid rgba(192,120,64,0.3)',
                borderRadius: 'var(--radius-sm)', padding: '10px 16px', marginBottom: 20,
                fontSize: 13, color: '#8B5E2A',
              }}>
                ⚠ Barrier stress detected — actives paused tonight
              </div>
            )}

            <ScoreBar label="Acne" score={skinReport.acne_severity} />
            <ScoreBar label="Oiliness" score={skinReport.oiliness} />
            <ScoreBar label="Dryness" score={skinReport.dryness} />
            <ScoreBar label="Redness" score={skinReport.redness} />
            <ScoreBar label="Texture" score={skinReport.texture_roughness} />
            <ScoreBar label="Pigmentation" score={skinReport.pigmentation} />
            <ScoreBar label="Dark circles" score={skinReport.dark_circles} />

            {skinReport.observations.length > 0 && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
                  Observations
                </p>
                {skinReport.observations.map((obs, i) => (
                  <p key={i} style={{ fontSize: 13, color: 'var(--charcoal)', lineHeight: 1.6, marginBottom: 6 }}>
                    · {obs}
                  </p>
                ))}
              </div>
            )}

            <p style={{
              marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)',
              fontSize: 14, color: 'var(--mocha)', fontStyle: 'italic',
              fontFamily: 'var(--font-display)', lineHeight: 1.6,
            }}>
              "{skinReport.immediate_concern}"
            </p>
          </Card>

          {/* Zone breakdown */}
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--mocha)', marginBottom: 16 }}>
              Zone breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {Object.entries(skinReport.zones).map(([zone, scores]) => (
                <div key={zone} style={{
                  background: 'var(--rose-pale)', borderRadius: 'var(--radius-md)',
                  padding: '16px',
                }}>
                  <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'capitalize', color: 'var(--rose-deep)', fontWeight: 500, marginBottom: 10 }}>
                    {zone}
                  </p>
                  {Object.entries(scores).map(([key, val]) => (
                    <ScoreBar key={key} label={key} score={val as number} />
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Routine Result */}
      {routine && (
        <div style={{ animation: 'fadeUp 0.6s ease both' }}>
          {/* Skin message */}
          <Card tint="var(--sage-pale)" style={{ marginBottom: 20 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
              color: 'var(--sage-deep)', lineHeight: 1.5, fontStyle: 'italic',
            }}>
              "{routine.skin_message}"
            </p>
            <div style={{
              display: 'inline-block', marginTop: 12,
              padding: '4px 14px', borderRadius: 99,
              background: routine.urgency === 'high' ? 'rgba(160,48,48,0.1)' :
                          routine.urgency === 'medium' ? 'rgba(192,120,64,0.1)' : 'rgba(74,122,68,0.1)',
              color: routine.urgency === 'high' ? '#A03030' :
                     routine.urgency === 'medium' ? '#C07840' : 'var(--sage-deep)',
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {routine.urgency} urgency
            </div>
          </Card>

          {/* AM / PM Routines */}
          {(['am_routine', 'pm_routine'] as const).map(key => (
            <Card key={key} style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: 'var(--mocha)', marginBottom: 20 }}>
                {key === 'am_routine' ? '☀ Morning routine' : '◑ Evening routine'}
              </h3>
              {routine[key].map((step, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, marginBottom: 16,
                  paddingBottom: i < routine[key].length - 1 ? 16 : 0,
                  borderBottom: i < routine[key].length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--rose-pale)', color: 'var(--rose-deep)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 500, flexShrink: 0,
                  }}>{step.step}</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--charcoal)', marginBottom: 4 }}>
                      {step.product_type}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{step.reason}</p>
                    <span style={{
                      fontSize: 11, background: 'var(--sage-pale)', color: 'var(--sage-deep)',
                      padding: '2px 10px', borderRadius: 99, letterSpacing: '0.05em',
                    }}>
                      {step.key_ingredient}
                    </span>
                  </div>
                </div>
              ))}
            </Card>
          ))}

          {/* Paused actives */}
          {routine.paused_today.length > 0 && (
            <Card tint="rgba(192,120,64,0.06)" style={{ marginBottom: 20, borderColor: 'rgba(192,120,64,0.25)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: '#8B5E2A', marginBottom: 16 }}>
                Paused tonight
              </h3>
              {routine.paused_today.map(active => (
                <div key={active} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '10px 0', borderBottom: '1px solid rgba(192,120,64,0.15)',
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: 500, color: '#8B5E2A',
                    textTransform: 'capitalize', minWidth: 100,
                  }}>{active.replace('_', ' ')}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right', flex: 1, paddingLeft: 16 }}>
                    {routine.pause_reasons[active]}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* Lifestyle flags */}
          {routine.lifestyle_flags.length > 0 && (
            <Card style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--mocha)', marginBottom: 12 }}>
                Lifestyle notes
              </h3>
              {routine.lifestyle_flags.map((flag, i) => (
                <p key={i} style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}>
                  · {flag}
                </p>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
