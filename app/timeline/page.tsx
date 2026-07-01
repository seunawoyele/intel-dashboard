'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { TimelineData } from '@/lib/types'
import { CHANNEL_DISPLAY, CHANNEL_COLORS } from '@/lib/colors'
import PostCard from '@/components/PostCard'

const PAGE_SIZE = 50

export default function TimelinePage() {
  const [data, setData] = useState<TimelineData | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [channel, setChannel] = useState<string | 'all'>('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const load = useCallback(() => {
    fetch(`/data/timeline.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLastFetch(new Date())
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [load])

  const filtered = useMemo(() => {
    if (!data) return []
    if (channel === 'all') return data.posts
    return data.posts.filter((p) => p.channel === channel)
  }, [data, channel])

  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [channel])

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center text-muted font-mono text-sm">
        Loading timeline...
      </div>
    )
  }

  const updatedAgo = data.updated && lastFetch
    ? `${Math.round((lastFetch.getTime() - new Date(data.updated).getTime()) / 60000)}m ago`
    : 'syncing...'

  const shown = filtered.slice(0, visible)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Timeline</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">
            Curated cross-channel feed — {data.count} posts
            <span className="ml-2 text-muted/50">· synced {updatedAgo}</span>
          </p>
        </div>
        {lastFetch && (
          <div className="text-2xs font-mono text-muted/50">
            live · refreshes hourly
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        <button
          onClick={() => setChannel('all')}
          className={`text-2xs font-mono px-2.5 py-1 rounded-full border transition-colors ${
            channel === 'all'
              ? 'border-accent/40 text-accent bg-accent/10'
              : 'border-border text-muted hover:text-text'
          }`}
        >
          All ({data.posts.length})
        </button>
        {data.channels.map((ch) => {
          const count = data.posts.filter((p) => p.channel === ch).length
          const color = CHANNEL_COLORS[ch] || '#64748b'
          const active = channel === ch
          return (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className="text-2xs font-mono px-2.5 py-1 rounded-full border transition-colors"
              style={{
                borderColor: active ? `${color}60` : undefined,
                color: active ? color : undefined,
                background: active ? `${color}15` : undefined,
              }}
            >
              {CHANNEL_DISPLAY[ch] || ch} ({count})
            </button>
          )
        })}
      </div>

      <div className="space-y-2">
        {shown.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {shown.length === 0 && (
          <div className="text-muted text-sm py-12 text-center border border-border rounded-lg bg-surface">
            No posts for this channel yet
          </div>
        )}
      </div>

      {visible < filtered.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="text-xs font-mono text-muted hover:text-accent border border-border hover:border-accent/30 px-4 py-2 rounded-lg transition-colors"
          >
            Load more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
