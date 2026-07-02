'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { SignalWindowsData, SignalWindow, WindowTrendingTopic, WindowConvergence, WindowThesisMover, PostContent } from '@/lib/types'
import { TOPIC_COLORS, CHANNEL_DISPLAY } from '@/lib/colors'
import PostDrawer from '@/components/PostDrawer'

const WINDOW_KEYS = ['1h', '2h', '4h', '6h', '12h'] as const
type WindowKey = (typeof WINDOW_KEYS)[number]

function VelocityBadge({ v }: { v: number }) {
  const color = v >= 2 ? 'text-accent bg-accent/10' : 'text-bull bg-bull/10'
  return <span className={`text-2xs font-mono px-1.5 rounded ${color}`}>{v.toFixed(1)}×</span>
}

function EntityChips({ entities }: { entities: { name: string; type: string | null }[] }) {
  if (entities.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {entities.map((e) => (
        <span
          key={e.name}
          title={e.type || undefined}
          className="text-2xs font-mono text-cyan/90 border border-cyan/20 bg-cyan/5 rounded px-1.5 py-0.5"
        >
          {e.name}
        </span>
      ))}
    </div>
  )
}

function DirectionArrow({ direction, delta }: { direction: string; delta: number }) {
  const up = delta > 0
  const color = direction === 'bull' ? (up ? 'text-bull' : 'text-bear') : direction === 'bear' ? (up ? 'text-bear' : 'text-bull') : 'text-muted'
  return (
    <span className={`text-2xs font-mono ${color} flex-none`}>
      {up ? '▲' : '▼'} {(Math.abs(delta) * 100).toFixed(1)}pp
    </span>
  )
}

function TrendingTopicRow({ t, onOpen }: { t: WindowTrendingTopic; onOpen: () => void }) {
  const color = TOPIC_COLORS[t.topic] || '#64748b'
  return (
    <div
      className="border border-border rounded-lg p-3 cursor-pointer hover:border-current/30 transition-colors bg-surface"
      style={{ borderColor: `${color}30` }}
      onClick={onOpen}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-none" style={{ background: color }} />
          <span className="text-sm font-medium text-text">{t.topic}</span>
          <VelocityBadge v={t.velocity} />
        </div>
        <span className="text-2xs font-mono text-muted flex-none">{t.sample_posts.length} sources →</span>
      </div>
      <p className="text-xs text-muted leading-snug">{t.context}</p>
      <EntityChips entities={t.entities} />
    </div>
  )
}

function ConvergenceRow({ c, onOpen }: { c: WindowConvergence; onOpen: () => void }) {
  return (
    <div
      className="border border-border rounded-lg p-3 cursor-pointer hover:border-cyan/30 transition-colors bg-surface"
      onClick={onOpen}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-medium text-text">{c.topic}</span>
        <div className="flex items-center gap-1.5 flex-none">
          {c.channel_list.map((ch) => (
            <span key={ch} className="text-2xs font-mono text-muted border border-border rounded px-1">
              {CHANNEL_DISPLAY[ch] || ch}
            </span>
          ))}
          <span className="text-2xs font-mono text-cyan">{c.sample_posts.length} sources →</span>
        </div>
      </div>
      <p className="text-xs text-muted leading-snug">{c.context}</p>
      <EntityChips entities={c.entities} />
    </div>
  )
}

function ThesisMoverRow({ t }: { t: WindowThesisMover }) {
  return (
    <div className="border border-border rounded-lg p-3 bg-surface">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs text-text/90 leading-snug flex-1">
          {t.crossed && (
            <span className={`mr-1.5 text-2xs font-mono px-1 rounded ${t.crossed === 'up' ? 'text-bull bg-bull/10' : 'text-bear bg-bear/10'}`}>
              {t.crossed === 'up' ? 'CONFIRMED' : 'BROKEN'}
            </span>
          )}
          {t.statement}
        </span>
        <DirectionArrow direction={t.direction} delta={t.delta} />
      </div>
      {t.top_evidence && (
        <a
          href={t.top_evidence.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 pt-2 border-t border-border/50 text-2xs text-muted hover:text-accent transition-colors"
        >
          <span className="italic">&ldquo;{t.top_evidence.snippet.slice(0, 140)}{t.top_evidence.snippet.length > 140 ? '…' : ''}&rdquo;</span>
          <span className="ml-1.5 font-mono text-cyan/70">↗ source</span>
        </a>
      )}
    </div>
  )
}

function WindowPanel({ data, onOpenPosts }: { data: SignalWindow; onOpenPosts: (title: string, subtitle: string, posts: PostContent[]) => void }) {
  const hasAny = data.trending_topics.length > 0 || data.convergence.length > 0 || data.thesis_movers.length > 0

  return (
    <div className="space-y-4">
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
          <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">
            Trending topics — click to read sources
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.trending_topics.map((t) => (
              <TrendingTopicRow
                key={t.topic}
                t={t}
                onOpen={() => onOpenPosts(t.topic, t.context, t.sample_posts)}
              />
            ))}
          </div>
        </div>
      )}

      {data.convergence.length > 0 && (
        <div>
          <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">
            Cross-channel convergence — click to read sources
          </div>
          <div className="space-y-1.5">
            {data.convergence.map((c) => (
              <ConvergenceRow
                key={c.topic}
                c={c}
                onOpen={() => onOpenPosts(c.topic, c.context, c.sample_posts)}
              />
            ))}
          </div>
        </div>
      )}

      {data.thesis_movers.length > 0 && (
        <div>
          <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Thesis movers</div>
          <div className="space-y-1.5">
            {data.thesis_movers.map((t) => (
              <ThesisMoverRow key={t.id} t={t} />
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
  const [drawer, setDrawer] = useState<{ title: string; subtitle: string; posts: PostContent[] } | null>(null)

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

      <WindowPanel
        data={data.windows[active]}
        onOpenPosts={(title, subtitle, posts) => setDrawer({ title, subtitle, posts })}
      />

      {drawer && (
        <PostDrawer
          title={drawer.title}
          subtitle={drawer.subtitle}
          posts={drawer.posts}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  )
}
