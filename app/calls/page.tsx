'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { ChannelCall } from '@/lib/types'

// Same date-parsing hazard as the alerts page: channel_calls.py's timestamps
// come from a mix of sqlite's bare "YYYY-MM-DD HH:MM:SS" default and Python's
// isoformat() with an explicit offset — never append 'Z' to either. Guarded
// so a bad timestamp degrades to plain text instead of crashing the page.
function relativeTime(raw: string | null): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  try {
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return raw
  }
}

function formatPrice(p: number | null): string {
  if (p === null || p === undefined) return '—'
  if (p === 0) return '$0'
  if (p < 0.000001) return `$${p.toExponential(2)}`
  if (p < 1) return `$${p.toPrecision(3)}`
  return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

function formatMultiple(m: number | null): { label: string; color: string } {
  if (m === null || m === undefined) return { label: '—', color: '#64748b' }
  if (m >= 2) return { label: `${m.toFixed(2)}x`, color: '#34d399' }
  if (m >= 1) return { label: `+${((m - 1) * 100).toFixed(0)}%`, color: '#34d399' }
  return { label: `${((m - 1) * 100).toFixed(0)}%`, color: '#f87171' }
}

const STATUS_COLORS: Record<string, string> = {
  open: '#34d399',
  rugged: '#f87171',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#64748b'
  return (
    <span
      className="text-2xs font-mono px-1.5 py-0.5 rounded border uppercase tracking-wide"
      style={{ color, borderColor: `${color}40`, background: `${color}15` }}
    >
      {status}
    </span>
  )
}

const FILTERS = ['ALL', 'OPEN', 'RUGGED', 'UNGRADED'] as const
type Filter = (typeof FILTERS)[number]

export default function CallsPage() {
  const [calls, setCalls] = useState<ChannelCall[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/seunawoyele/intel-dashboard-data/main/channel_calls.json')
      .then((r) => r.json())
      .then(setCalls)
      .catch(() => {})
  }, [])

  const filtered = calls
    .filter((c) => {
      if (filter === 'OPEN') return c.status === 'open'
      if (filter === 'RUGGED') return c.status === 'rugged'
      if (filter === 'UNGRADED') return c.multiple === null
      return true
    })
    .sort((a, b) => {
      if (a.multiple === null && b.multiple === null) return 0
      if (a.multiple === null) return 1
      if (b.multiple === null) return -1
      return b.multiple - a.multiple
    })

  const openCount = calls.filter((c) => c.status === 'open').length
  const ruggedCount = calls.filter((c) => c.status === 'rugged').length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Channel Calls</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">
            {calls.length} calls tracked · {openCount} open · {ruggedCount} rugged
          </p>
        </div>
      </div>

      <div className="mb-4 text-2xs text-muted font-mono border border-border rounded px-3 py-2 bg-surface">
        Automatic call grading for tracked alpha channels (currently @shiroalpha) — entry vs.
        current price via real market data (DexScreener + GeckoTerminal), regraded every 12h.
        A call with no stated entry price is logged but left ungraded, never estimated.
      </div>

      <div className="flex gap-1 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
              filter === f
                ? 'border-accent/40 text-accent bg-accent/10'
                : 'border-border text-muted hover:text-text'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-sm text-muted font-mono py-12 text-center">
          No calls in this filter yet.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((c) => {
          const isOpen = expanded === c.id
          const mult = formatMultiple(c.multiple)
          const peakMult = formatMultiple(c.peak_multiple)
          return (
            <div
              key={c.id}
              className="border border-border rounded bg-surface hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : c.id)}
            >
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-text">{c.ticker}</span>
                  <StatusBadge status={c.status} />
                  {c.resolution_status === 'unresolved' && (
                    <span className="text-2xs font-mono px-1.5 py-0.5 rounded border uppercase tracking-wide text-muted border-border">
                      unresolved
                    </span>
                  )}
                  <span className="text-2xs text-muted font-mono truncate">
                    {c.channel} · called {relativeTime(c.call_datetime)}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-none">
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold" style={{ color: mult.color }}>
                      {mult.label}
                    </div>
                    <div className="text-2xs text-muted font-mono">now</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold" style={{ color: peakMult.color }}>
                      {peakMult.label}
                    </div>
                    <div className="text-2xs text-muted font-mono">peak</div>
                  </div>
                </div>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-2">
                  <p className="text-xs text-muted font-mono leading-relaxed">{c.entry_context}</p>
                  <div className="grid grid-cols-3 gap-3 text-2xs font-mono">
                    <div>
                      <div className="text-muted">Entry</div>
                      <div className="text-text">{formatPrice(c.entry_price_usd)}</div>
                    </div>
                    <div>
                      <div className="text-muted">Last ({relativeTime(c.last_graded_at)})</div>
                      <div className="text-text">{formatPrice(c.last_price_usd)}</div>
                    </div>
                    <div>
                      <div className="text-muted">Peak ({relativeTime(c.peak_at)})</div>
                      <div className="text-text">{formatPrice(c.peak_price_usd)}</div>
                    </div>
                  </div>
                  <div className="text-2xs text-muted font-mono">
                    {c.entry_price_source} · {c.resolved_chain_id ?? 'unresolved'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
