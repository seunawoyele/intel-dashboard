import { getBriefData } from '@/lib/data'
import { TOPIC_COLORS, CHANNEL_DISPLAY } from '@/lib/colors'
import { formatDistanceToNow } from 'date-fns'
import type { Signal } from '@/lib/types'
import RecentPostsFeed from '@/components/RecentPostsFeed'
import SignalWindows from '@/components/SignalWindows'

export const revalidate = 7200

function SignalBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    trending_topic: { label: 'TREND', cls: 'text-cyan border-cyan/30 bg-cyan/10' },
    convergence: { label: 'CONV', cls: 'text-accent border-accent/30 bg-accent/10' },
    thesis_mover: { label: 'THESIS', cls: 'text-bull border-bull/30 bg-bull/10' },
    new_source: { label: 'SOURCE', cls: 'text-text/60 border-border bg-surface' },
  }
  const d = map[type] || { label: type.toUpperCase(), cls: 'text-muted border-border' }
  return (
    <span className={`text-2xs font-mono border px-1.5 py-0.5 rounded ${d.cls}`}>
      {d.label}
    </span>
  )
}

function ConvictionBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = value >= 0.65 ? '#f59e0b' : value >= 0.5 ? '#06b6d4' : '#64748b'
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-2xs font-mono text-muted">{pct}%</span>
    </div>
  )
}

function TopicPill({ topic }: { topic: string }) {
  const color = TOPIC_COLORS[topic] || '#64748b'
  return (
    <span
      className="text-2xs font-mono px-1.5 py-0.5 rounded border"
      style={{ color, borderColor: `${color}40`, background: `${color}15` }}
    >
      {topic}
    </span>
  )
}

export default function BriefPage() {
  const brief = getBriefData()
  const { signals, stats, recent_posts, top_thesis } = brief

  const genAt = brief.generated_at
    ? formatDistanceToNow(new Date(brief.generated_at), { addSuffix: true })
    : 'loading...'

  const highSignals = signals.filter((s) => s.conviction >= 0.5).slice(0, 12)
  const latestPosts = recent_posts.slice(0, 20)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Intelligence Brief</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">Generated {genAt}</p>
        </div>
        <div className="flex gap-6 text-right">
          {[
            { label: 'Posts (7d)', value: (stats.posts_7d || 0).toLocaleString() },
            { label: 'Today', value: (stats.posts_today || 0).toLocaleString() },
            { label: 'High conviction', value: stats.theses_high_conviction || 0 },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-lg font-mono font-semibold text-accent">{value}</div>
              <div className="text-2xs text-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <SignalWindows />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Signals column */}
        <div className="col-span-2 space-y-2">
          <div className="text-xs font-mono text-muted uppercase tracking-wider mb-3">
            Active Signals
          </div>
          {highSignals.length === 0 && (
            <div className="text-muted text-sm py-8 text-center border border-border rounded-lg bg-surface">
              No signals yet — run the loop to generate data
            </div>
          )}
          {highSignals.map((sig: Signal, i: number) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg px-4 py-3 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <SignalBadge type={sig.type} />
                    {sig.topic && <TopicPill topic={sig.topic} />}
                    {sig.velocity && (
                      <span className="text-2xs font-mono text-accent">
                        {sig.velocity.toFixed(1)}×
                      </span>
                    )}
                    {sig.delta !== undefined && sig.delta > 0 && (
                      <span className="text-2xs font-mono text-bull">+{(sig.delta * 100).toFixed(1)}%</span>
                    )}
                  </div>
                  <p className="text-sm text-text leading-snug">{sig.label}</p>
                  {sig.action && (
                    <p className="text-xs text-muted mt-1 italic">{sig.action}</p>
                  )}
                  {sig.channels && sig.channels.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {sig.channels.map((ch) => (
                        <span key={ch} className="text-2xs text-muted font-mono bg-surface border border-border rounded px-1">
                          {CHANNEL_DISPLAY[ch] || ch}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-none pt-0.5">
                  <ConvictionBar value={sig.conviction} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top thesis card */}
          {top_thesis && (
            <div className="bg-card border border-accent/30 rounded-lg p-4">
              <div className="text-2xs font-mono text-accent uppercase tracking-wider mb-2">
                Highest Conviction
              </div>
              <p className="text-sm text-text leading-snug mb-3">{top_thesis.statement}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    top_thesis.direction === 'bull'
                      ? 'text-bull bg-bull/10'
                      : top_thesis.direction === 'bear'
                      ? 'text-bear bg-bear/10'
                      : 'text-muted bg-surface'
                  }`}
                >
                  {top_thesis.direction?.toUpperCase()}
                </span>
                <span className="text-lg font-mono font-semibold text-accent">
                  {(top_thesis.conviction * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          <RecentPostsFeed posts={latestPosts} />
        </div>
      </div>
    </div>
  )
}
