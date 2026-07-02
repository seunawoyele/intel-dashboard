'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { SignalWindowsData, SignalWindow } from '@/lib/types'
import { TOPIC_COLORS, CHANNEL_DISPLAY } from '@/lib/colors'

const WINDOW_KEYS = ['1h', '2h', '4h', '6h', '12h'] as const
type WindowKey = (typeof WINDOW_KEYS)[number]

function VelocityBadge({ v }: { v: number }) {
  const color = v >= 2 ? 'text-accent bg-accent/10' : 'text-bull bg-bull/10'
  return <span className={`text-2xs font-mono px-1.5 rounded ${color}`}>{v.toFixed(1)}×</span>
}

function DirectionArrow({ direction, delta }: { direction: string; delta: number }) {
  const up = delta > 0
  const color = direction === 'bull' ? (up ? 'text-bull' : 'text-bear') : direction === 'bear' ? (up ? 'text-bear' : 'text-bull') : 'text-muted'
  return (
    <span className={`text-2xs font-mono ${color}`}>
      {up ? '▲' : '▼'} {(Math.abs(delta) * 100).toFixed(1)}pp
    </span>
  )
}

function WindowPanel({ data }: { data: SignalWindow }) {
  const hasAny = data.trending_topics.length > 0 || data.convergence.length > 0 || data.thesis_movers.length > 0

  return (
    <div className="space-y-3">
      <div className="text-2xs font-mono text-muted">
        {data.new_posts} new post{data.new_posts !== 1 ? 's' : ''} in this window
      </div>

      {!hasAny && (
        <div className="text-xs text-muted py-6 text-center border border-border rounded-lg bg-surface">
          No high-conviction signal in this window
        </div>
      )}

      {data.trending_topics.length > 0 && (
        <div>
          <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Trending topics</div>
          <div className="flex flex-wrap gap-1.5">
            {data.trending_topics.map((t) => {
              const color = TOPIC_COLORS[t.topic] || '#64748b'
              return (
                <div
                  key={t.topic}
                  className="flex items-center gap-1.5 text-2xs font-mono px-2 py-1 rounded border"
                  style={{ color, borderColor: `${color}40`, background: `${color}15` }}
                >
                  <span>{t.topic}</span>
                  <span className="opacity-60">{t.count}</span>
                  <VelocityBadge v={t.velocity} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {data.convergence.length > 0 && (
        <div>
          <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Cross-channel convergence</div>
          <div className="space-y-1">
            {data.convergence.map((c) => (
              <div key={c.topic} className="flex items-center justify-between text-xs bg-surface border border-border rounded px-2 py-1.5">
                <span className="text-text">{c.topic}</span>
                <div className="flex items-center gap-1.5">
                  {c.channel_list.map((ch) => (
                    <span key={ch} className="text-2xs font-mono text-muted border border-border rounded px-1">
                      {CHANNEL_DISPLAY[ch] || ch}
                    </span>
                  ))}
                  <span className="text-2xs font-mono text-cyan">{c.posts}p</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.thesis_movers.length > 0 && (
        <div>
          <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Thesis movers</div>
          <div className="space-y-1">
            {data.thesis_movers.map((t) => (
              <div key={t.id} className="flex items-start justify-between gap-2 text-xs bg-surface border border-border rounded px-2 py-1.5">
                <span className="text-text/80 leading-snug flex-1">
                  {t.crossed && (
                    <span className={`mr-1.5 text-2xs font-mono px-1 rounded ${t.crossed === 'up' ? 'text-bull bg-bull/10' : 'text-bear bg-bear/10'}`}>
                      {t.crossed === 'up' ? 'CONFIRMED' : 'BROKEN'}
                    </span>
                  )}
                  {t.statement}
                </span>
                <DirectionArrow direction={t.direction} delta={t.delta} />
              </div>
            ))}
          </div>
        </div>
      )}

      {!data.thesis_history_available && (
        <div className="text-2xs text-muted/50 font-mono italic">
          Thesis deltas: building history for this window — check back soon
        </div>
      )}
    </div>
  )
}

export default function SignalWindows() {
  const [data, setData] = useState<SignalWindowsData | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [active, setActive] = useState<WindowKey>('4h')

  useEffect(() => {
    const load = () => {
      fetch(`/data/signal_windows.json?t=${Date.now()}`)
        .then((r) => r.json())
        .then((d) => {
          setData(d)
          setLastFetch(new Date())
        })
        .catch(() => {})
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!data) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 text-muted text-sm text-center">
        Loading signal windows...
      </div>
    )
  }

  const updatedAgo = lastFetch
    ? formatDistanceToNow(new Date(data.updated), { addSuffix: true })
    : ''

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-xs font-mono text-muted uppercase tracking-wider">Headline Signals</div>
        <div className="text-2xs font-mono text-muted/50">synced {updatedAgo}</div>
      </div>

      <div className="flex gap-1 mb-4">
        {WINDOW_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`text-xs font-mono px-3 py-1 rounded-lg border transition-colors ${
              active === k
                ? 'border-accent/40 text-accent bg-accent/10'
                : 'border-border text-muted hover:text-text'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <WindowPanel data={data.windows[active]} />
    </div>
  )
}
