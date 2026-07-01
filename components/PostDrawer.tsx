'use client'

import { useEffect } from 'react'
import type { PostContent } from '@/lib/types'
import PostCard from './PostCard'

interface Props {
  title: string
  subtitle?: string
  posts: PostContent[]
  loading?: boolean
  onClose: () => void
}

export default function PostDrawer({ title, subtitle, posts, loading, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[480px] max-w-[90vw] bg-surface border-l border-border z-50 flex flex-col shadow-2xl">
        <div className="flex items-start justify-between px-4 py-3 border-b border-border flex-none">
          <div>
            <div className="text-sm font-medium text-text">{title}</div>
            {subtitle && (
              <div className="text-2xs font-mono text-muted mt-0.5">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text text-xl leading-none ml-3 flex-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading && (
            <p className="text-muted text-xs text-center py-8 font-mono">Loading posts...</p>
          )}
          {!loading && posts.length === 0 && (
            <p className="text-muted text-xs text-center py-8 font-mono">No source posts available</p>
          )}
          {!loading && posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </div>
    </>
  )
}
