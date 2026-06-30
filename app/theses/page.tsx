import { getThesesData } from '@/lib/data'
import ConvictionChart from '@/components/ConvictionChart'
import { CHANNEL_DISPLAY } from '@/lib/colors'
import { formatDistanceToNow } from 'date-fns'
import type { Thesis } from '@/lib/types'

export const revalidate = 7200

function DirectionBadge({ direction }: { direction: string }) {
  if (direction === 'bull') return <span className="text-xs font-mono px-2 py-0.5 rounded text-bull bg-bull/10">BULL</span>
  if (direction === 'bear') return <span className="text-xs font-mono px-2 py-0.5 rounded text-bear bg-bear/10">BEAR</span>
  return <span className="text-xs font-mono px-2 py-0.5 rounded text-muted bg-surface">NEUTRAL</span>
}

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.001) return null
  const up = delta > 0
  return (
    <span className={`text-xs font-mono ${up ? 'text-bull' : 'text-bear'}`}>
      {up ? '▲' : '▼'} {(Math.abs(delta) * 100).toFixed(1)}%
    </span>
  )
}

function ConvictionMeter({ value }: { value: number }) {
  const pct = value * 100
  const color = value >= 0.65 ? '#f59e0b' : value >= 0.5 ? '#06b6d4' : '#64748b'
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-2xl font-mono font-bold" style={{ color }}>
        {pct.toFixed(1)}%
      </span>
      <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color, transition: 'width 0.3s' }}
        />
      </div>
    </div>
  )
}

export default function ThesesPage() {
  const theses = getThesesData()
  const sorted = [...theses].sort((a, b) => b.conviction - a.conviction)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Theses</h1>
        <p className="text-xs text-muted mt-0.5 font-mono">
          {theses.length} active · sigmoid conviction scoring · 30-day evidence window
        </p>
      </div>

      {sorted.length === 0 && (
        <div className="text-muted text-sm py-12 text-center border border-border rounded-lg bg-surface">
          No theses yet — run thesis scoring in the loop
        </div>
      )}

      <div className="space-y-4">
        {sorted.map((thesis: Thesis) => (
          <div
            key={thesis.id}
            className="bg-card border rounded-xl p-5"
            style={{
              borderColor: thesis.conviction >= 0.65 ? '#f59e0b40' : thesis.conviction >= 0.5 ? '#06b6d440' : '#1e2d42',
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xs font-mono text-muted">T{thesis.id}</span>
                  <DirectionBadge direction={thesis.direction} />
                  <DeltaBadge delta={thesis.delta_7d} />
                  {thesis.horizon && (
                    <span className="text-2xs font-mono text-muted border border-border rounded px-1.5 py-0.5">
                      {thesis.horizon}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text leading-snug">{thesis.statement}</p>
              </div>
              <div className="flex-none">
                <ConvictionMeter value={thesis.conviction} />
              </div>
            </div>

            {/* Chart */}
            {thesis.snapshots && thesis.snapshots.length > 1 && (
              <div className="mb-4">
                <ConvictionChart snapshots={thesis.snapshots} height={90} />
              </div>
            )}

            {/* Evidence */}
            {thesis.evidence && thesis.evidence.length > 0 && (
              <div>
                <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-2">
                  Evidence ({thesis.evidence.length} posts)
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {thesis.evidence.slice(0, 5).map((ev) => (
                    <div
                      key={ev.post_id}
                      className="flex items-start gap-2 px-2.5 py-2 bg-surface border border-border rounded text-xs"
                    >
                      <span
                        className={`text-2xs font-mono mt-0.5 flex-none ${
                          ev.polarity_contribution > 0 ? 'text-bull' : 'text-bear'
                        }`}
                      >
                        {ev.polarity_contribution > 0 ? '▲' : '▼'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-text/80 leading-snug line-clamp-2">{ev.snippet}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-muted font-mono">
                            {CHANNEL_DISPLAY[ev.channel] || ev.channel}
                          </span>
                          <span className="text-muted/50">·</span>
                          <span className="text-muted font-mono">
                            {ev.datetime
                              ? formatDistanceToNow(new Date(ev.datetime), { addSuffix: true })
                              : ''}
                          </span>
                          <span className="text-muted/50">·</span>
                          <span className="text-muted font-mono">
                            sim {(ev.similarity * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
