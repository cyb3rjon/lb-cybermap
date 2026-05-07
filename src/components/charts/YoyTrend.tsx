import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

interface Datum { year: string; overall: number; govern: number; identify: number; protect: number; detect: number; respond: number; recover: number }

export function YoyTrend({ data, height = 280 }: { data: Datum[]; height?: number }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, left: -16, right: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="areaOverall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1B3358" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#1B3358' }} />
          <YAxis domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#1B3358' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
          <Area type="monotone" dataKey="overall" name="Overall" stroke="#3B82F6" strokeWidth={2.6} fill="url(#areaOverall)" />
        </AreaChart>
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
