import { getSourcesData } from '@/lib/data'
import type { Source } from '@/lib/types'

export const revalidate = 7200

function AuthorityBar({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, (score / max) * 100)
  return (
    <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${pct}%`, transition: 'width 0.3s' }}
      />
    </div>
  )
}

function formatAuth(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toFixed(0)
}

export default function SourcesPage() {
  const sources = getSourcesData()
  const top = sources.slice(0, 100)
  const maxAuth = top.reduce((m, s) => Math.max(m, s.authority_score), 1)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text">Sources</h1>
        <p className="text-xs text-muted mt-0.5 font-mono">
          {sources.length.toLocaleString()} tracked handles · ranked by authority score
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2rem,1fr,auto,auto,auto,auto] gap-x-4 items-center px-4 py-2 border-b border-border text-2xs font-mono text-muted uppercase tracking-wider">
          <span>#</span>
          <span>Handle</span>
          <span>Type</span>
          <span>Authority</span>
          <span>Channels</span>
          <span>Posts</span>
        </div>

        {top.length === 0 && (
          <div className="text-muted text-sm py-8 text-center">
            No source data yet
          </div>
        )}

        <div className="divide-y divide-border">
          {top.map((src: Source, i: number) => (
            <div
              key={src.handle}
              className="grid grid-cols-[2rem,1fr,auto,auto,auto,auto] gap-x-4 items-center px-4 py-2.5 hover:bg-card/50 transition-colors"
            >
              <span className="text-xs font-mono text-muted/50">{i + 1}</span>
              <div className="min-w-0">
                <span className="text-sm font-mono text-text">@{src.handle}</span>
              </div>
              <span className="text-2xs font-mono text-muted border border-border rounded px-1.5 py-0.5 text-right">
                {src.handle_type || 'twitter'}
              </span>
              <div className="flex items-center gap-2 justify-end">
                <AuthorityBar score={src.authority_score} max={maxAuth} />
                <span className="text-xs font-mono text-accent w-12 text-right">
                  {formatAuth(src.authority_score)}
                </span>
              </div>
              <span className="text-xs font-mono text-muted text-right">
                {src.cross_channel_count}
              </span>
              <span className="text-xs font-mono text-muted text-right">
                {(src.total_posts || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {sources.length > 100 && (
        <p className="text-center text-xs text-muted mt-3 font-mono">
          Showing top 100 of {sources.length.toLocaleString()} handles
        </p>
      )}
    </div>
  )
}
