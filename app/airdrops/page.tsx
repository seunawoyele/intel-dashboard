'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Airdrop } from '@/lib/types'

// Same date hazard as /alerts and /calls — never append 'Z' to a timestamp
// that might already carry an offset. Guarded so a bad value degrades to
// plain text instead of crashing the page.
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

const CHAIN_COLORS: Record<string, string> = {
  base: '#0052ff',
  robinhood: '#00c805',
  ethereum: '#627eea',
  polygon: '#8247e5',
  arbitrum: '#28a0f0',
  solana: '#14f195',
}

function chainColor(chain: string): string {
  const key = chain.trim().toLowerCase()
  for (const k of Object.keys(CHAIN_COLORS)) {
    if (key.includes(k)) return CHAIN_COLORS[k]
  }
  return '#64748b'
}

function ChainBadges({ chains }: { chains: string | null }) {
  if (!chains) return null
  const list = chains.split(',').map((c) => c.trim()).filter(Boolean)
  return (
    <div className="flex gap-1 flex-wrap">
      {list.map((c) => {
        const color = chainColor(c)
        return (
          <span
            key={c}
            className="text-2xs font-mono px-1.5 py-0.5 rounded border"
            style={{ color, borderColor: `${color}40`, background: `${color}15` }}
          >
            {c}
          </span>
        )
      })}
    </div>
  )
}

export default function AirdropsPage() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [chainFilter, setChainFilter] = useState<string>('ALL')

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/seunawoyele/intel-dashboard-data/main/airdrops.json')
      .then((r) => r.json())
      .then(setAirdrops)
      .catch(() => {})
  }, [])

  const allChains = Array.from(
    new Set(
      airdrops.flatMap((a) => (a.chains || '').split(',').map((c) => c.trim()).filter(Boolean))
    )
  ).sort()

  const filtered = airdrops.filter(
    (a) => chainFilter === 'ALL' || (a.chains || '').toLowerCase().includes(chainFilter.toLowerCase())
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Airdrops</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">
            {airdrops.length} active, no-task-required airdrops · Base, Robinhood Chain, Ethereum,
            Polygon, Arbitrum, Solana and similar
          </p>
        </div>
      </div>

      <div className="mb-4 text-2xs text-muted font-mono border border-border rounded px-3 py-2 bg-surface">
        Passive-qualification only — hold/already-snapshotted/wallet-check opportunities. Anything
        requiring quests, bridging-for-points, socials, or referrals is deliberately excluded.
        Cleared automatically once a source post reports the claim window closed.
      </div>

      {allChains.length > 0 && (
        <div className="flex gap-1 mb-4 flex-wrap">
          <button
            onClick={() => setChainFilter('ALL')}
            className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
              chainFilter === 'ALL'
                ? 'border-accent/40 text-accent bg-accent/10'
                : 'border-border text-muted hover:text-text'
            }`}
          >
            ALL
          </button>
          {allChains.map((c) => (
            <button
              key={c}
              onClick={() => setChainFilter(c)}
              className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                chainFilter === c
                  ? 'border-accent/40 text-accent bg-accent/10'
                  : 'border-border text-muted hover:text-text'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-sm text-muted font-mono py-12 text-center">
          No active airdrops tracked yet — this fills in automatically as the archive picks up
          genuine, no-task opportunities.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((a) => {
          const isOpen = expanded === a.id
          return (
            <div
              key={a.id}
              className="border border-border rounded bg-surface hover:border-accent/30 transition-colors cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : a.id)}
            >
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-text">{a.project_name}</span>
                  <ChainBadges chains={a.chains} />
                </div>
                <span className="text-2xs text-muted font-mono flex-none">
                  confirmed {relativeTime(a.last_confirmed_at)}
                </span>
              </div>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-border space-y-2">
                  {a.description && (
                    <p className="text-xs text-muted font-mono leading-relaxed">{a.description}</p>
                  )}
                  {a.qualification_note && (
                    <div className="text-2xs font-mono">
                      <span className="text-muted">Qualification: </span>
                      <span className="text-text">{a.qualification_note}</span>
                    </div>
                  )}
                  <div className="text-2xs text-muted font-mono">
                    via {a.source_channel ?? 'unknown'} · first seen {relativeTime(a.first_seen_at)}
                    {a.source_url && (
                      <>
                        {' · '}
                        <a
                          href={a.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          source
                        </a>
                      </>
                    )}
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
