export interface Meta {
  updated: string
  post_count: number
  ner_coverage: number
  build_id: string
}

export interface Signal {
  type: 'trending_topic' | 'convergence' | 'thesis_mover' | 'new_source'
  topic?: string
  thesis_id?: number
  thesis?: string
  label: string
  conviction: number
  velocity?: number
  channels?: string[]
  action?: string
  delta?: number
}

export interface BriefData {
  generated_at: string
  signals: Signal[]
  stats: {
    posts_today: number
    posts_7d: number
    top_topic: string
    top_topic_velocity: number
    theses_high_conviction: number
    new_entities_7d: number
  }
  top_thesis: {
    id: number
    statement: string
    conviction: number
    direction: string
  } | null
  recent_posts: {
    id: number
    channel: string
    datetime: string
    text: string
    topics: string[]
  }[]
}

export interface ThesisSnapshot {
  date: string
  conviction: number
}

export interface ThesisEvidence {
  post_id: number
  channel: string
  datetime: string
  snippet: string
  similarity: number
  polarity_contribution: number
}

export interface Thesis {
  id: number
  statement: string
  direction: 'bull' | 'bear' | 'neutral'
  horizon: string
  conviction: number
  delta_7d: number
  snapshots: ThesisSnapshot[]
  evidence: ThesisEvidence[]
}

export interface TopicDay {
  date: string
  count: number
}

export interface TopicData {
  topic: string
  color: string
  recent: number
  baseline: number
  velocity: number
  total: number
  by_channel: Record<string, number>
  series: TopicDay[]
}

export interface TopicsData {
  topics: TopicData[]
  channels: string[]
}

export interface Entity {
  id: number
  name: string
  entity_type: string
  post_count: number
  edges: { name: string; co_occurrence: number }[]
}

export interface Source {
  handle: string
  handle_type: string
  authority_score: number
  cross_channel_count: number
  avg_engagement: number
  total_posts: number
}
