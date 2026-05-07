import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SeriesPoint { axis: string; current: number; target: number; benchmark?: number }

export function MaturityRadar({ data, height = 320, showBenchmark = true }: { data: SeriesPoint[]; height?: number; showBenchmark?: boolean }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="78%">
          <defs>
            <linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="targetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="#1B3358" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#475569', fontSize: 10 }} stroke="#1B3358" />
          {showBenchmark && (
            <Radar name="Industry benchmark" dataKey="benchmark" stroke="#475569" strokeDasharray="4 4" fill="none" />
          )}
          <Radar name="Target" dataKey="target" stroke="#06B6D4" strokeWidth={2} fill="url(#targetFill)" />
          <Radar name="Current" dataKey="current" stroke="#3B82F6" strokeWidth={2.4} fill="url(#currentFill)" />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8', paddingTop: 8 }} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

const tooltipStyle = {
  background: '#0A1628',
  border: '1px solid #234070',
  borderRadius: 8,
  fontSize: 12,
  color: '#E2E8F0',
};
