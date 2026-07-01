'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts'
import type {
  KolsData,
  KolTrending,
  KolWatchlist,
  KolConnected,
  KolThesis,
  PostContent,
} from '@/lib/types'
import { TOPIC_COLORS } from '@/lib/colors'
import PostDrawer from '@/components/PostDrawer'

// ── Helpers ───────────────────────────────────────────────────────────────────

function VelocityBadge({ v }: { v: number }) {
  if (v >= 2)
    return <span className="text-2xs font-mono text-accent bg-accent/10 px-1.5 rounded">{v.toFixed(1)}× HOT</span>
  if (v >= 1.3)
    return <span className="text-2xs font-mono text-bull bg-bull/10 px-1.5 rounded">{v.toFixed(1)}× UP</span>
  return null
}

function TopicDot({ topic }: { topic: string }) {
  const color = TOPIC_COLORS[topic] || '#64748b'
  return (
    <span
      key={topic}
      title={topic}
      className="inline-flex items-center gap-1 text-2xs font-mono px-1.5 py-0.5 rounded border border-border"
      style={{ color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: color }} />
      {topic.split('/')[0]}
    </span>
  )
}

function DirectionBadge({ direction, conviction }: { direction: string; conviction: number }) {
  const color = direction === 'bull' ? 'text-bull bg-bull/10' : direction === 'bear' ? 'text-bear bg-bear/10' : 'text-muted bg-surface'
  return (
    <span className={`text-2xs font-mono px-1.5 py-0.5 rounded ${color}`}>
      {direction === 'bull' ? '▲' : direction === 'bear' ? '▼' : '◆'} {(conviction * 100).toFixed(0)}%
    </span>
  )
}

function Sparkline({ data, color = '#f59e0b' }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={28}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area dataKey="v" stroke={color} fill={`${color}20`} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ background: '#1a2232', border: '1px solid #1e2d42', borderRadius: 4, fontSize: 10 }}
          itemStyle={{ color }}
          labelFormatter={() => ''}
          formatter={(v: number) => [v, 'mentions']}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Stat bar ─────────────────────────────────────────────────────────────────

function StatBar({ stats, updatedAgo }: { stats: KolsData['stats']; updatedAgo: string }) {
  const tiles = [
    { label: 'Trending (24h)', value: stats.trending_posts_24h, accent: true },
    { label: 'Watchlist signals (24h)', value: stats.watchlist_posts_24h * 10, accent: false },
    { label: 'Intel crossings (7d)', value: stats.connected_signals, accent: true },
    { label: 'Untracked names', value: stats.untracked_names, accent: false },
  ]
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {tiles.map(({ label, value, accent }) => (
        <div key={label} className="bg-card border border-border rounded-xl px-4 py-3">
          <div className={`text-2xl font-mono font-semibold ${accent ? 'text-accent' : 'text-text'}`}>
            {value.toLocaleString()}
          </div>
          <div className="text-2xs text-muted font-mono mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Connected signals ─────────────────────────────────────────────────────────

function ConnectedCard({ item }: { item: KolConnected }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-cyan/30 transition-colors"
      style={{ borderColor: open ? '#06b6d430' : undefined }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-text text-sm">{item.name}</span>
            {item.handle && (
              <span className="text-2xs font-mono text-muted">@{item.handle}</span>
            )}
            <span className="text-2xs font-mono text-cyan bg-cyan/10 px-1.5 rounded">{item.entity_type}</span>
          </div>
          <div className="text-2xs text-muted font-mono mt-1">{item.kol_signal}</div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(item.theses ?? []).map((t) => (
            <DirectionBadge key={t.id} direction={t.direction} conviction={t.conviction} />
          ))}
        </div>
      </div>

      {item.topics.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {(item.topics ?? []).slice(0, 4).map((t) => <TopicDot key={t} topic={t} />)}
        </div>
      )}

      {open && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {item.theses.length > 0 && (
            <div>
              <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Thesis matches</div>
              {item.theses.map((t) => (
                <div key={t.id} className="text-xs text-text/80 leading-snug mb-1.5 pl-2 border-l-2"
                  style={{ borderColor: t.direction === 'bull' ? '#10b981' : '#ef4444' }}>
                  {t.statement}
                  <span className="ml-1 text-2xs text-muted">{t.horizon}</span>
                </div>
              ))}
            </div>
          )}
          {item.co_mentions.length > 0 && (
            <div>
              <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Co-mentioned with</div>
              <div className="flex gap-1.5 flex-wrap">
                {item.co_mentions.slice(0, 6).map((c) => (
                  <span key={c.name} className="text-2xs font-mono border border-border rounded px-1.5 py-0.5 text-muted">
                    {c.name} ×{c.co_occurrence}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── KOL card (trending) ───────────────────────────────────────────────────────

function KolCard({ item, onViewPosts }: { item: KolTrending; onViewPosts?: (posts: PostContent[]) => void }) {
  const [open, setOpen] = useState(false)
  const isNew = !item.entity_id
  const v7 = item.appearances_7d || 0
  const velocity = v7 / Math.max((item.appearances_7d + item.appearances_24h) / 2, 0.5)

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-accent/20 transition-colors"
      style={{ borderColor: open ? '#f59e0b30' : undefined }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-text text-sm truncate">{item.name}</span>
            {isNew && (
              <span className="text-2xs font-mono text-muted/60 bg-surface border border-border px-1.5 rounded">NEW</span>
            )}
          </div>
          <div className="text-2xs text-muted font-mono mt-0.5">@{item.handle}</div>
        </div>
        <div className="text-right ml-2 flex-none">
          <div className="text-base font-mono font-semibold text-accent">{item.kol_followers_max}</div>
          <div className="text-2xs text-muted font-mono">KOLs</div>
          {item.profile_url && (
            <a
              href={item.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-2xs font-mono text-cyan/60 hover:text-cyan transition-colors"
            >
              ↗ X
            </a>
          )}
        </div>
      </div>

      <div className="mb-2">
        <Sparkline data={item.sparkline} color="#f59e0b" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {(item.topics ?? []).slice(0, 3).map((t) => <TopicDot key={t} topic={t} />)}
        </div>
        <div className="flex items-center gap-1.5 text-2xs font-mono text-muted">
          {item.intel_post_count != null && item.intel_post_count > 0 && (
            <span className="bg-surface border border-border rounded px-1.5 py-0.5">
              {item.intel_post_count} posts
            </span>
          )}
          {v7 > 0 && <VelocityBadge v={v7} />}
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: '24h', value: item.appearances_24h },
              { label: '7d', value: item.appearances_7d },
              { label: 'First seen', value: item.first_seen.slice(5) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-lg p-2">
                <div className="text-sm font-mono text-text">{value}</div>
                <div className="text-2xs text-muted">{label}</div>
              </div>
            ))}
          </div>
          {(item.theses ?? []).length > 0 && (
            <div>
              <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Thesis matches</div>
              {(item.theses ?? []).map((t) => (
                <div key={t.id} className="text-xs text-text/80 leading-snug mb-1.5 pl-2 border-l-2"
                  style={{ borderColor: t.direction === 'bull' ? '#10b981' : '#ef4444' }}>
                  {t.statement}
                </div>
              ))}
            </div>
          )}
          {(item.co_mentions ?? []).length > 0 && (
            <div>
              <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-1.5">Co-mentions</div>
              <div className="flex gap-1.5 flex-wrap">
                {(item.co_mentions ?? []).slice(0, 6).map((c) => (
                  <span key={c.name} className="text-2xs font-mono border border-border rounded px-1.5 py-0.5 text-muted">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {item.signal_posts && item.signal_posts.length > 0 && onViewPosts && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewPosts(item.signal_posts) }}
              className="text-2xs font-mono text-accent border border-accent/20 bg-accent/5 hover:bg-accent/10 px-3 py-1.5 rounded transition-colors w-full mt-1"
            >
              View {item.signal_posts.length} source post{item.signal_posts.length !== 1 ? 's' : ''} →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Watchlist table ───────────────────────────────────────────────────────────

function WatchlistTable({ items }: { items: KolWatchlist[] }) {
  const [sort, setSort] = useState<'7d' | 'rank' | '24h'>('7d')
  const [expanded, setExpanded] = useState<string | null>(null)

  const sorted = [...items].sort((a, b) => {
    if (sort === '7d') return b.mentions_7d - a.mentions_7d
    if (sort === '24h') return b.mentions_24h - a.mentions_24h
    return a.best_rank - b.best_rank
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-muted font-mono">{items.length} names tracked</div>
        <div className="flex gap-1">
          {(['7d', '24h', 'rank'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-2xs font-mono px-2 py-1 rounded border transition-colors ${
                sort === s ? 'border-accent/40 text-accent bg-accent/10' : 'border-border text-muted hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[24px_1fr_48px_48px_48px_100px_120px] gap-0 text-2xs font-mono text-muted uppercase tracking-wider px-3 py-2 border-b border-border">
          <span>#</span>
          <span>Name</span>
          <span className="text-right">24h</span>
          <span className="text-right">7d</span>
          <span className="text-right">Rank</span>
          <span>Topics</span>
          <span>Trend</span>
        </div>

        {sorted.slice(0, 80).map((item, idx) => {
          const isOpen = expanded === item.name
          const rankColor = item.best_rank <= 3 ? 'text-accent' : 'text-muted'
          return (
            <div key={item.name}>
              <div
                className="grid grid-cols-[24px_1fr_48px_48px_48px_100px_120px] gap-0 px-3 py-2 border-b border-border/50 hover:bg-surface/50 cursor-pointer transition-colors items-center"
                onClick={() => setExpanded(isOpen ? null : item.name)}
              >
                <span className="text-2xs font-mono text-muted/50">{idx + 1}</span>
                <div className="min-w-0">
                  <div className="text-xs text-text font-medium truncate">{item.name}</div>
                  {item.entity_type && (
                    <span className="text-2xs text-muted/60">{item.entity_type}</span>
                  )}
                </div>
                <span className="text-right text-2xs font-mono text-text">{item.mentions_24h || '-'}</span>
                <span className="text-right text-2xs font-mono text-text">{item.mentions_7d}</span>
                <span className={`text-right text-2xs font-mono ${rankColor}`}>#{item.best_rank}</span>
                <div className="flex gap-0.5 flex-wrap">
                  {(item.topics ?? []).slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="text-2xs px-1 rounded"
                      style={{ color: TOPIC_COLORS[t] || '#64748b', background: `${TOPIC_COLORS[t] || '#64748b'}15` }}
                    >
                      {t.split('/')[0].slice(0, 6)}
                    </span>
                  ))}
                </div>
                <div className="h-6">
                  <Sparkline data={item.sparkline} color="#06b6d4" />
                </div>
              </div>

              {isOpen && (
                <div className="px-4 py-3 bg-surface/60 border-b border-border text-xs text-muted space-y-2">
                  <div className="flex gap-4">
                    <span>Avg rank: <span className="text-text">#{item.avg_rank}</span></span>
                    <span>Last seen: <span className="text-text">{item.last_seen}</span></span>
                    {item.intel_post_count != null && (
                      <span>Intel posts: <span className="text-text">{item.intel_post_count}</span></span>
                    )}
                  </div>
                  {(item.topics ?? []).length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {(item.topics ?? []).map((t) => <TopicDot key={t} topic={t} />)}
                    </div>
                  )}
                  {(item.co_mentions ?? []).length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {(item.co_mentions ?? []).map((c) => (
                        <span key={c.name} className="font-mono border border-border rounded px-1.5 py-0.5">
                          {c.name} ×{c.co_occurrence}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KolsPage() {
  const [data, setData] = useState<KolsData | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [section, setSection] = useState<'trending' | 'watchlist'>('trending')
  const [drawer, setDrawer] = useState<{ name: string; posts: PostContent[] } | null>(null)

  const load = useCallback(() => {
    fetch(`/data/kols.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLastFetch(new Date())
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    // Poll every 60s for fresh data post-deploy
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center text-muted font-mono text-sm">
        Loading KOL intelligence...
      </div>
    )
  }

  const updatedAgo = data.updated && lastFetch
    ? `${Math.round((lastFetch.getTime() - new Date(data.updated).getTime()) / 60000)}m ago`
    : 'syncing...'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">KOL Intelligence</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">
            Real-time attention graph — who crypto researchers are following and why
            <span className="ml-2 text-muted/50">· synced {updatedAgo}</span>
          </p>
        </div>
        {lastFetch && (
          <div className="text-2xs font-mono text-muted/50">
            live · refreshes every 60s
          </div>
        )}
      </div>

      {/* Stat bar */}
      <StatBar stats={data.stats} updatedAgo={updatedAgo} />

      {/* Connected signals — hero */}
      {data.connected.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-muted uppercase tracking-wider">Intel crossings</span>
            <span className="text-2xs font-mono text-cyan bg-cyan/10 px-1.5 rounded">
              KOL signal × archive match
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.connected.map((item) => (
              <ConnectedCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Section toggle */}
      <div className="flex gap-2 mb-4">
        {(['trending', 'watchlist'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`text-sm font-mono px-4 py-1.5 rounded-lg border transition-colors ${
              section === s
                ? 'border-accent/40 text-accent bg-accent/10'
                : 'border-border text-muted hover:text-text'
            }`}
          >
            {s === 'trending'
              ? `Trending accounts (${data.trending.length})`
              : `Watchlist names (${data.watchlist.length})`}
          </button>
        ))}
      </div>

      {/* Trending grid */}
      {section === 'trending' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {data.trending.slice(0, 60).map((item) => (
            <KolCard
              key={item.handle}
              item={item}
              onViewPosts={(posts) => setDrawer({ name: item.name, posts })}
            />
          ))}
          {data.trending.length === 0 && (
            <div className="col-span-3 text-muted text-sm py-12 text-center border border-border rounded-lg bg-surface">
              No trending alerts yet
            </div>
          )}
        </div>
      )}

      {/* Watchlist table */}
      {section === 'watchlist' && <WatchlistTable items={data.watchlist} />}

      {drawer && (
        <PostDrawer
          title={drawer.name}
          subtitle="Source posts from KOL intelligence feed"
          posts={drawer.posts}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  )
}
