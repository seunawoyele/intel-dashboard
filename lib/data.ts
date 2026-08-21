import type { BriefData, Thesis, TopicsData, Entity, Source, Meta } from './types'

// 2026-08-21 fix: this used to read bundled files from public/data/ via
// fs.readFileSync, which meant every data refresh required a full Vercel
// redeploy to take effect -- the sync loop's two hourly sidecars alone were
// burning ~74/day of the account's shared 100/day free deployment quota.
// Now fetches live from a separate public data-only repo (not connected to
// Vercel) at request time, with Next.js's fetch cache set to revalidate
// every 5 minutes -- fresh enough for hourly-cadence data, no deploy needed
// per update.
const DATA_BASE = 'https://raw.githubusercontent.com/seunawoyele/intel-dashboard-data/main';

async function read<T>(name: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${DATA_BASE}/${name}.json`, { next: { revalidate: 300 } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getBriefData(): Promise<BriefData> {
  return read<BriefData>('brief', {
    generated_at: new Date().toISOString(),
    signals: [],
    stats: { posts_today: 0, posts_7d: 0, top_topic: '', top_topic_velocity: 0, theses_high_conviction: 0, new_entities_7d: 0 },
    top_thesis: null,
    recent_posts: [],
  })
}

export async function getThesesData(): Promise<Thesis[]> {
  return read<Thesis[]>('theses', [])
}

export async function getTopicsData(): Promise<TopicsData> {
  return read<TopicsData>('topics', { topics: [], channels: [] })
}

export async function getEntitiesData(): Promise<Entity[]> {
  return read<Entity[]>('entities', [])
}

export async function getSourcesData(): Promise<Source[]> {
  return read<Source[]>('sources', [])
}

export async function getMeta(): Promise<Meta> {
  return read<Meta>('meta', { updated: '', post_count: 0, ner_coverage: 0, build_id: '' })
}
