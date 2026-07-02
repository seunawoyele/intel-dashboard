'use client'

import { useState } from 'react'
import type { KolsData, KolWindowKey, KolWindowTrending, KolWindowWatchlist } from '@/lib/types'
import { TOPIC_COLORS } from '@/lib/colors'

const WINDOW_KEYS: { key: KolWindowKey; label: string }[] = [
  { key: '1h', label: '1h' },
  { key: '6h', label: '6h' },
  { key: '12h', label: '12h' },
  { key: 'today', label: 'Today' },
  { key: '3d', label: '3d' },
  { key: 'week', label: 'This week' },
  { key: '14d', label: '14d' },
  { key: 'month', label: 'This month' },
]

function NewBadge() {
  return (
    <span className="text-2xs font-mono text-bull bg-bull/10 border border-bull/20 px-1 rounded flex-none">
      NEW
    </span>
  )
}

function TopicDot({ topic }: { topic: string }) {
  const color = TOPIC_COLORS[topic] || '#64748b'
  return (
    <span
      key={topic}
      className="text-2xs font-mono px-1 rounded"
      style={{ color, background: `${color}15` }}
    >
      {topic.split('/')[0]}
    </span>
  )
}

function TrendingRow({ t }: { t: KolWindowTrending }) {
  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-border/50 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-text font-medium truncate">{t.name}</span>
          <span className="text-2xs font-mono text-muted">@{t.handle}</span>
          {t.is_new && <NewBadge />}
          {t.topics.slice(0, 2).map((tp) => <TopicDot key={tp} topic={tp} />)}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-none text-right">
        <span className="text-2xs font-mono text-accent">{t.kol_followers_max} KOLs</span>
        <span className="text-2xs font-mono text-muted w-8">×{t.count}</span>
      </div>
    </div>
  )
}

function WatchlistRow({ w }: { w: KolWindowWatchlist }) {
  const rankColor = w.best_rank <= 3 ? 'text-accent' : 'text-muted'
  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-border/50 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-text font-medium truncate">{w.name}</span>
          {w.is_new && <NewBadge />}
          {w.topics.slice(0, 2).map((tp) => <TopicDot key={tp} topic={tp} />)}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-none text-right">
        <span className={`text-2xs font-mono ${rankColor}`}>#{w.best_rank} best</span>
        <span className="text-2xs font-mono text-muted w-8">×{w.count}</span>
      </div>
    </div>
  )
}

export default function KolWindows({ data }: { data: KolsData }) {
  const [active, setActive] = useState<KolWindowKey>('today')
  const window = data.windows?.[active]

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-xs font-mono text-muted uppercase tracking-wider">
          Advancing Now
        </div>
        <div className="text-2xs font-mono text-muted/50">NEW = first appearance vs prior equal period</div>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {WINDOW_KEYS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`text-xs font-mono px-3 py-1 rounded-lg border transition-colors ${
              active === key
                ? 'border-accent/40 text-accent bg-accent/10'
                : 'border-border text-muted hover:text-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!window ? (
        <div className="text-muted text-sm py-6 text-center">Loading window data...</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">
              Trending accounts ({window.trending.length})
            </div>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              {window.trending.length === 0 && (
                <div className="text-2xs text-muted text-center py-4">No trending alerts in this window</div>
              )}
              {window.trending.map((t) => <TrendingRow key={t.handle} t={t} />)}
            </div>
          </div>
          <div>
            <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">
              Watchlist names ({window.watchlist.length})
            </div>
            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              {window.watchlist.length === 0 && (
                <div className="text-2xs text-muted text-center py-4">No watchlist posts in this window</div>
              )}
              {window.watchlist.map((w) => <WatchlistRow key={w.name} w={w} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
