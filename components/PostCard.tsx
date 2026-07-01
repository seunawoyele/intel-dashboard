'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { PostContent } from '@/lib/types'
import { CHANNEL_DISPLAY, TOPIC_COLORS } from '@/lib/colors'

export default function PostCard({ post }: { post: PostContent }) {
  const [open, setOpen] = useState(false)

  const ago = post.datetime
    ? formatDistanceToNow(new Date(post.datetime), { addSuffix: true })
    : ''

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div
        className="px-3 py-2.5 flex items-start justify-between gap-2 cursor-pointer hover:bg-surface/50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-2xs font-mono text-accent">{CHANNEL_DISPLAY[post.channel] || post.channel}</span>
            <span className="text-2xs text-border">·</span>
            <span className="text-2xs font-mono text-muted">{ago}</span>
            {post.tweet && (
              <span className="text-2xs font-mono text-cyan border border-cyan/30 bg-cyan/10 px-1 rounded">
                tweet
              </span>
            )}
          </div>
          <p className={`text-xs text-text/80 leading-snug ${open ? '' : 'line-clamp-2'}`}>
            {post.text}
          </p>
          {post.topics && post.topics.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {post.topics.slice(0, 4).map((t) => {
                const color = TOPIC_COLORS[t] || '#64748b'
                return (
                  <span
                    key={t}
                    className="text-2xs font-mono px-1.5 py-0.5 rounded border"
                    style={{ color, borderColor: `${color}40`, background: `${color}15` }}
                  >
                    {t}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        <span className="text-muted text-xs flex-none mt-0.5 select-none">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-2 border-t border-border/50 space-y-2">
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-2xs font-mono text-accent hover:text-accent/80 border border-accent/20 bg-accent/5 px-2 py-1 rounded transition-colors"
            >
              ↗ Open source
            </a>
          )}

          {post.tweet && (
            <div className="border border-cyan/20 bg-cyan/5 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-2xs font-mono text-cyan">@{post.tweet.handle}</span>
                <span className="text-2xs text-border">·</span>
                <span className="text-2xs font-mono text-muted">
                  {post.tweet.likes}↑ {post.tweet.rts}↺ {post.tweet.replies}↩
                </span>
              </div>
              <p className="text-xs text-text/80 leading-snug mb-2">{post.tweet.text}</p>
              <a
                href={post.tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xs font-mono text-cyan/70 hover:text-cyan transition-colors"
              >
                ↗ Open on X
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
