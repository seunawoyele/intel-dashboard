'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { TokenAlert } from '@/lib/types'

const SENTIMENT_COLORS: Record<string, string> = {
  bullish: '#34d399',
  bearish: '#f87171',
  mixed: '#f59e0b',
  unclear: '#64748b',
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const color = SENTIMENT_COLORS[sentiment] || '#64748b'
  return (
    <span
      className="text-2xs font-mono px-1.5 py-0.5 rounded border uppercase tracking-wide"
      style={{ color, borderColor: `${color}40`, background: `${color}15` }}
    >
      {sentiment}
    </span>
  )
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<TokenAlert[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/seunawoyele/intel-dashboard-data/main/token_alerts.json')
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => {})
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Token Alerts</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">
            {alerts.length} alerts · fires when a token is NER-tagged 3+ times in 7 days
            and hasn&apos;t been seen before (excludes established majors)
          </p>
        </div>
      </div>

      <div className="mb-4 text-2xs text-muted font-mono border border-border rounded px-3 py-2 bg-surface">
        Signal scorecards — mention velocity, sentiment read on source text, fundamentals,
        KOL activity, and best-effort price data. Not trade or position advice.
      </div>

      {alerts.length === 0 && (
        <div className="text-sm text-muted font-mono py-12 text-center">
          No alerts yet — this fires automatically as the archive picks up repeat mentions.
        </div>
      )}

      <div className="space-y-2">
        {alerts.map((a) => {
          const isOpen = expanded === a.id
          return (
            <div
              key={a.id}
              className="border border-border rounded bg-surface hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : a.id)}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text">{a.name}</span>
                  <SentimentBadge sentiment={a.sentiment} />
                  <span className="text-2xs text-muted font-mono">
                    {a.mention_count} mentions / {a.window_days}d
                  </span>
                </div>
                <span className="text-2xs text-muted font-mono">
                  {formatDistanceToNow(new Date(a.alerted_at + 'Z'), { addSuffix: true })}
                </span>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-border">
                  <pre className="text-xs text-muted font-mono whitespace-pre-wrap leading-relaxed">
                    {a.summary}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
