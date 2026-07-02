import { getBriefData } from '@/lib/data'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import SignalWindows from '@/components/SignalWindows'

export const revalidate = 7200

export default function BriefPage() {
  const brief = getBriefData()
  const { stats } = brief

  const genAt = brief.generated_at
    ? formatDistanceToNow(new Date(brief.generated_at), { addSuffix: true })
    : 'loading...'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text">Intelligence Brief</h1>
          <p className="text-xs text-muted mt-0.5 font-mono">Generated {genAt}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-6 text-right">
            {[
              { label: 'Posts (7d)', value: (stats.posts_7d || 0).toLocaleString() },
              { label: 'Today', value: (stats.posts_today || 0).toLocaleString() },
              { label: 'High conviction', value: stats.theses_high_conviction || 0 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-lg font-mono font-semibold text-accent">{value}</div>
                <div className="text-2xs text-muted">{label}</div>
              </div>
            ))}
          </div>
          <Link
            href="/digest"
            className="text-xs font-mono text-muted hover:text-accent border border-border hover:border-accent/30 px-3 py-1.5 rounded-lg transition-colors flex-none"
          >
            Full digest →
          </Link>
        </div>
      </div>

      <SignalWindows />
    </div>
  )
}
