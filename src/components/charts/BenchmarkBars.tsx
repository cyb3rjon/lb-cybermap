import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, LabelList } from 'recharts';

interface Datum { axis: string; current: number; benchmark: number; topQuartile: number; bottomQuartile: number }

export function BenchmarkBars({ data, height = 320 }: { data: Datum[]; height?: number }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, left: -16, right: 8, bottom: 4 }}>
          <CartesianGrid stroke="#1B3358" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="axis" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#1B3358' }} />
          <YAxis domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={{ stroke: '#1B3358' }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
          <Bar dataKey="bottomQuartile" name="Lower quartile" fill="#1E3A8A" radius={[3, 3, 0, 0]} />
          <Bar dataKey="benchmark" name="Cohort average" fill="#3B82F6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="topQuartile" name="Upper quartile" fill="#06B6D4" radius={[3, 3, 0, 0]} />
          <Bar dataKey="current" name="Client" fill="#22D3EE" radius={[3, 3, 0, 0]}>
            <LabelList dataKey="current" position="top" fill="#22D3EE" style={{ fontSize: 10, fontWeight: 600 }} />
          </Bar>
        </BarChart>
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
