'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import type { ThesisSnapshot } from '@/lib/types'

interface Props {
  snapshots: ThesisSnapshot[]
  color?: string
  height?: number
  mini?: boolean
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-card border border-border rounded px-2 py-1.5">
      <div className="text-2xs text-muted font-mono">{d.payload.date}</div>
      <div className="text-xs font-mono text-text font-semibold">
        {(d.value * 100).toFixed(1)}%
      </div>
    </div>
  )
}

export default function ConvictionChart({ snapshots, color = '#f59e0b', height = 80, mini = false }: Props) {
  if (!snapshots?.length) {
    return (
      <div
        className="flex items-center justify-center text-muted text-xs font-mono border border-border rounded"
        style={{ height }}
      >
        no data
      </div>
    )
  }

  const last = snapshots[snapshots.length - 1]?.conviction ?? 0

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={snapshots} margin={{ top: 4, right: 4, bottom: 4, left: mini ? -24 : -8 }}>
        {/* Conviction zones */}
        <ReferenceArea y1={0} y2={0.4} fill="#ef444408" />
        <ReferenceArea y1={0.6} y2={1} fill="#10b98108" />
        <ReferenceLine y={0.5} stroke="#1e2d42" strokeDasharray="3 3" />

        {!mini && (
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={(v: string) => v.slice(5)}
          />
        )}
        <YAxis
          domain={[0, 1]}
          tick={{ fontSize: 9, fill: '#64748b', fontFamily: 'monospace' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          ticks={mini ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]}
        />
        {!mini && <Tooltip content={<CustomTooltip />} />}
        <Line
          dataKey="conviction"
          stroke={last >= 0.65 ? '#f59e0b' : last >= 0.5 ? '#06b6d4' : '#64748b'}
          strokeWidth={mini ? 1.5 : 2}
          dot={false}
          activeDot={mini ? false : { r: 3, fill: color, stroke: '#0a0e14' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
