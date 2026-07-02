'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const NAV = [
  { href: '/', label: 'Brief', icon: '◉' },
  { href: '/digest', label: 'Digest', icon: '▤' },
  { href: '/timeline', label: 'Timeline', icon: '☰' },
  { href: '/theses', label: 'Theses', icon: '◈' },
  { href: '/topics', label: 'Topics', icon: '▦' },
  { href: '/kols', label: 'KOL Intel', icon: '◭' },
  { href: '/entities', label: 'Entities', icon: '◌' },
  { href: '/sources', label: 'Sources', icon: '◎' },
  { href: '/search', label: 'Search', icon: '⊘' },
]

interface Meta {
  updated: string | null
  post_count: number
  ner_coverage: number
}

export default function Sidebar({ meta }: { meta: Meta }) {
  const pathname = usePathname()

  const updatedAgo = meta.updated
    ? formatDistanceToNow(new Date(meta.updated), { addSuffix: true })
    : 'never'

  return (
    <aside className="w-52 flex-none flex flex-col border-r border-border bg-surface">
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <div className="text-accent font-mono text-xs tracking-widest uppercase">Intel Archive</div>
        <div className="text-muted text-2xs mt-1 font-mono">
          {(meta.post_count || 0).toLocaleString()} posts
        </div>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
              pathname === href
                ? 'text-text bg-card border-r-2 border-accent'
                : 'text-muted hover:text-text hover:bg-card/50'
            )}
          >
            <span className="font-mono text-xs w-3">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border">
        <div className="text-2xs text-muted font-mono">
          <div>NER {(meta.ner_coverage || 0).toFixed(1)}%</div>
          <div className="mt-0.5 opacity-60">sync {updatedAgo}</div>
        </div>
      </div>
    </aside>
  )
}
