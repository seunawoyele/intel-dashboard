'use client'

import type { PostContent } from '@/lib/types'
import PostCard from './PostCard'

export default function RecentPostsFeed({ posts }: { posts: PostContent[] }) {
  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="px-3 py-2 border-b border-border">
        <span className="text-xs font-mono text-muted uppercase tracking-wider">Recent Posts</span>
      </div>
      <div className="max-h-[560px] overflow-y-auto p-2 space-y-1.5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <div className="py-4 text-xs text-muted text-center">No posts yet</div>
        )}
      </div>
    </div>
  )
}
