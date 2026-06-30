import fs from 'fs'
import path from 'path'
import type { BriefData, Thesis, TopicsData, Entity, Source, Meta } from './types'

function read<T>(name: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), 'public', 'data', `${name}.json`)
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T
  } catch {
    return fallback
  }
}

export function getBriefData(): BriefData {
  return read<BriefData>('brief', {
    generated_at: new Date().toISOString(),
    signals: [],
    stats: { posts_today: 0, posts_7d: 0, top_topic: '', top_topic_velocity: 0, theses_high_conviction: 0, new_entities_7d: 0 },
    top_thesis: null,
    recent_posts: [],
  })
}

export function getThesesData(): Thesis[] {
  return read<Thesis[]>('theses', [])
}

export function getTopicsData(): TopicsData {
  return read<TopicsData>('topics', { topics: [], channels: [] })
}

export function getEntitiesData(): Entity[] {
  return read<Entity[]>('entities', [])
}

export function getSourcesData(): Source[] {
  return read<Source[]>('sources', [])
}

export function getMeta(): Meta {
  return read<Meta>('meta', { updated: '', post_count: 0, ner_coverage: 0, build_id: '' })
}
