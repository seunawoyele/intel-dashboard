'use client'

import { useEffect, useState } from 'react'
import type { Entity } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  PERSON: '#60a5fa',
  ORG: '#a78bfa',
  PRODUCT: '#34d399',
  TOKEN: '#f59e0b',
  PROTOCOL: '#06b6d4',
  CHAIN: '#fb923c',
  CONCEPT: '#a3a3a3',
}

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || '#64748b'
  return (
    <span
      className="text-2xs font-mono px-1.5 py-0.5 rounded border"
      style={{ color, borderColor: `${color}40`, background: `${color}15` }}
    >
      {type}
    </span>
  )
}

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/data/entities.json')
      .then((r) => r.json())
      .then(setEntities)
      .catch(() => {})
  }, [])

  const types = ['ALL', ...Array.from(new Set(entities.map((e) => e.entity_type))).sort()]

  const filtered = entities
    .filter((e) => filterType === 'ALL' || e.entity_type === filterType)
    .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.post_count - a.post_count)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Entities</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">
            {entities.length} entities · NER-extracted from posts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter entities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-surface border border-border rounded px-3 py-1.5 text-sm text-text placeholder:text-muted font-mono focus:outline-none focus:border-accent/50"
        />
        <div className="flex gap-1 flex-wrap">
          {types.slice(0, 6).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                filterType === t
                  ? 'border-accent/40 text-accent bg-accent/10'
                  : 'border-border text-muted hover:text-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Entity list */}
      <div className="space-y-1.5">
        {filtered.slice(0, 100).map((entity) => (
          <div
            key={entity.id}
            className="bg-card border border-border rounded-lg px-3 py-2.5 cursor-pointer hover:border-border/80 transition-colors"
            onClick={() => setExpanded((e) => (e === entity.id ? null : entity.id))}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TypeBadge type={entity.entity_type} />
                <span className="text-sm text-text font-medium">{entity.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted">{entity.post_count} posts</span>
                {entity.edges && entity.edges.length > 0 && (
                  <span className="text-xs font-mono text-muted/60">{entity.edges.length} links</span>
                )}
              </div>
            </div>

            {/* Related entities */}
            {expanded === entity.id && entity.edges && entity.edges.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-border">
                <div className="text-2xs font-mono text-muted uppercase tracking-wider mb-2">
                  Co-mentioned with
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {entity.edges
                    .sort((a, b) => b.co_occurrence - a.co_occurrence)
                    .slice(0, 10)
                    .map((edge) => (
                      <span
                        key={edge.name}
                        className="text-xs font-mono border border-border bg-surface rounded px-2 py-0.5 text-muted"
                      >
                        {edge.name}
                        <span className="ml-1 text-muted/50">{edge.co_occurrence}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-muted text-sm py-12 text-center border border-border rounded-lg bg-surface">
            No entities found
          </div>
        )}
        {filtered.length > 100 && (
          <div className="text-center text-xs text-muted py-2">
            Showing 100 of {filtered.length}
          </div>
        )}
      </div>
    </div>
  )
}
