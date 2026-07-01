'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'
import type { TopicData, TopicsData, PostContent, TopicPostsData } from '@/lib/types'
import { TOPIC_COLORS, CHANNEL_DISPLAY } from '@/lib/colors'
import PostDrawer from '@/components/PostDrawer'

function VelocityBadge({ v }: { v: number }) {
  if (v >= 2) return <span className="text-2xs font-mono text-accent bg-accent/10 px-1.5 rounded">{v.toFixed(1)}× HOT</span>
  if (v >= 1.3) return <span className="text-2xs font-mono text-bull bg-bull/10 px-1.5 rounded">{v.toFixed(1)}× UP</span>
  if (v <= 0.7) return <span className="text-2xs font-mono text-bear bg-bear/10 px-1.5 rounded">{v.toFixed(1)}× DOWN</span>
  return <span className="text-2xs font-mono text-muted px-1.5 rounded">{v.toFixed(1)}×</span>
}

function TopicCard({ topic, expanded, onToggle, onViewPosts }: { topic: TopicData; expanded: boolean; onToggle: () => void; onViewPosts?: () => void }) {
  const color = TOPIC_COLORS[topic.topic] || '#64748b'
  const pct = Math.min(100, (topic.recent / Math.max(topic.baseline, 1)) * 100)

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-current/30 transition-colors"
      style={{ '--tw-border-opacity': expanded ? 1 : undefined, borderColor: expanded ? `${color}40` : undefined } as React.CSSProperties}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full flex-none" style={{ background: color }} />
            <span className="text-sm font-medium text-text">{topic.topic}</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <VelocityBadge v={topic.velocity} />
            <span className="text-2xs text-muted font-mono">{topic.total.toLocaleString()} total</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="text-lg font-mono font-semibold" style={{ color }}>
            {topic.recent.toLocaleString()}
          </div>
          <div className="text-2xs text-muted font-mono">last 7d</div>
          {onViewPosts && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewPosts() }}
              className="text-2xs font-mono text-muted hover:text-accent border border-border hover:border-accent/30 px-2 py-0.5 rounded transition-colors mt-0.5"
            >
              posts →
            </button>
          )}
        </div>
      </div>

      {/* Activity bar */}
      <div className="mb-3">
        <div className="flex justify-between text-2xs text-muted font-mono mb-1">
          <span>Recent vs baseline</span>
          <span>{topic.baseline.toLocaleString()} baseline (30d)</span>
        </div>
        <div className="flex gap-1 items-end h-6">
          <div className="flex-1 h-full bg-surface rounded overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{ width: '100%', background: `${color}40` }}
            />
          </div>
          <div className="flex-none text-2xs text-muted font-mono">base</div>
          <div className="flex-1 h-full bg-surface rounded overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
          <div className="flex-none text-2xs text-muted font-mono">now</div>
        </div>
      </div>

      {/* Channel breakdown */}
      {topic.by_channel && (
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(topic.by_channel)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([ch, cnt]) => (
              <span key={ch} className="text-2xs font-mono text-muted border border-border rounded px-1.5 py-0.5">
                {CHANNEL_DISPLAY[ch] || ch} {cnt}
              </span>
            ))}
        </div>
      )}

      {/* Expanded time series */}
      {expanded && topic.series && topic.series.length > 0 && (
        <div className="mt-4">
          <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-2">Daily Volume (90d)</div>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={topic.series} margin={{ top: 2, right: 2, bottom: 2, left: -20 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(topic.series.length / 4)}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#64748b', fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#1a2232', border: '1px solid #1e2d42', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: '#64748b' }}
                itemStyle={{ color }}
              />
              <Area
                dataKey="count"
                stroke={color}
                fill={`${color}20`}
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default function TopicsPage() {
  const [data, setData] = useState<TopicsData | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sort, setSort] = useState<'velocity' | 'volume'>('velocity')
  const [drawerTopic, setDrawerTopic] = useState<string | null>(null)
  const [topicPostsCache, setTopicPostsCache] = useState<TopicPostsData | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  useEffect(() => {
    fetch('/data/topics.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  const openPostsDrawer = useCallback(async (topic: string) => {
    setDrawerTopic(topic)
    if (!topicPostsCache) {
      setDrawerLoading(true)
      try {
        const d: TopicPostsData = await fetch('/data/topic_posts.json').then((r) => r.json())
        setTopicPostsCache(d)
      } catch {}
      setDrawerLoading(false)
    }
  }, [topicPostsCache])

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center text-muted font-mono text-sm">
        Loading topics...
      </div>
    )
  }

  const sorted = [...(data.topics || [])].sort((a, b) =>
    sort === 'velocity' ? b.velocity - a.velocity : b.total - a.total
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Topics</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">
            {sorted.length} topics · velocity vs 30-day baseline · click to expand
          </p>
        </div>
        <div className="flex gap-1">
          {(['velocity', 'volume'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs font-mono px-3 py-1 rounded border transition-colors ${
                sort === s
                  ? 'border-accent/40 text-accent bg-accent/10'
                  : 'border-border text-muted hover:text-text'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sorted.map((topic) => (
          <TopicCard
            key={topic.topic}
            topic={topic}
            expanded={expanded === topic.topic}
            onToggle={() => setExpanded((e) => (e === topic.topic ? null : topic.topic))}
            onViewPosts={() => openPostsDrawer(topic.topic)}
          />
        ))}
        {sorted.length === 0 && (
          <div className="col-span-2 text-muted text-sm py-12 text-center border border-border rounded-lg bg-surface">
            No topic data yet
          </div>
        )}
      </div>

      {drawerTopic && (
        <PostDrawer
          title={drawerTopic}
          subtitle="Most recent source posts for this topic"
          posts={topicPostsCache?.[drawerTopic] ?? []}
          loading={drawerLoading}
          onClose={() => setDrawerTopic(null)}
        />
      )}
    </div>
  )
}
