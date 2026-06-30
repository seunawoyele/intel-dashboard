'use client'

import { useEffect, useState, useCallback } from 'react'
import MiniSearch from 'minisearch'
import { formatDistanceToNow } from 'date-fns'
import { TOPIC_COLORS, CHANNEL_DISPLAY } from '@/lib/colors'

interface PostIndex {
  id: number
  channel: string
  datetime: string
  text: string
  topics: string[]
}

interface SearchResult extends PostIndex {
  score?: number
  match?: Record<string, string[]>
}

let miniSearch: MiniSearch | null = null
let indexedPosts: PostIndex[] = []

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

export default function SearchPage() {
  const [loaded, setLoaded] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [indexSize, setIndexSize] = useState(0)

  useEffect(() => {
    if (miniSearch) {
      setLoaded(true)
      setLoading(false)
      return
    }
    fetch('/data/search-index.json')
      .then((r) => r.json())
      .then((posts: PostIndex[]) => {
        indexedPosts = posts
        miniSearch = new MiniSearch({
          fields: ['text', 'channel', 'topics'],
          storeFields: ['id', 'channel', 'datetime', 'text', 'topics'],
          searchOptions: {
            boost: { text: 2, topics: 1.5 },
            fuzzy: 0.2,
            prefix: true,
          },
        })
        miniSearch.addAll(posts)
        setIndexSize(posts.length)
        setLoaded(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const doSearch = useCallback(
    (q: string) => {
      if (!miniSearch || !q.trim()) {
        setResults(
          indexedPosts
            .slice(0, 20)
            .map((p) => ({ ...p }))
        )
        return
      }
      const res = (miniSearch.search(q) as unknown as SearchResult[]).slice(0, 50)
      setResults(res)
    },
    []
  )

  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => doSearch(query), 150)
    return () => clearTimeout(t)
  }, [query, loaded, doSearch])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Search</h1>
        <p className="text-xs text-muted mt-0.5 font-mono">
          {loading ? 'Loading index...' : `${indexSize.toLocaleString()} posts indexed · client-side full-text search`}
        </p>
      </div>

      <input
        type="text"
        placeholder="Search posts, topics, channels..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text placeholder:text-muted font-mono focus:outline-none focus:border-accent/50 mb-4"
      />

      {loading && (
        <div className="text-muted text-sm text-center py-8 font-mono">
          Building search index...
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-muted text-sm text-center py-8">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}

      <div className="space-y-2">
        {results.map((post) => (
          <div key={post.id} className="bg-card border border-border rounded-lg px-4 py-3 hover:border-accent/20 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono text-muted">
                {CHANNEL_DISPLAY[post.channel] || post.channel}
              </span>
              <span className="text-muted/40">·</span>
              <span className="text-xs font-mono text-muted">
                {post.datetime
                  ? formatDistanceToNow(new Date(post.datetime), { addSuffix: true })
                  : ''}
              </span>
              <span className="text-muted/40">·</span>
              <span className="text-2xs font-mono text-muted/60">#{post.id}</span>
            </div>
            <p className="text-sm text-text/90 leading-snug">{post.text}</p>
            {post.topics && post.topics.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {post.topics.map((t) => (
                  <TopicPill key={t} topic={t} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
