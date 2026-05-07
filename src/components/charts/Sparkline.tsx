import { Area, AreaChart, ResponsiveContainer } from 'recharts';

export function Sparkline({ data, colour = '#3B82F6' }: { data: number[]; colour?: string }) {
  const series = data.map((v, i) => ({ x: i, v }));
  return (
    <div style={{ width: '100%', height: 36 }}>
      <ResponsiveContainer>
        <AreaChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`sl-${colour}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colour} stopOpacity={0.45} />
              <stop offset="100%" stopColor={colour} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={colour} strokeWidth={1.6} fill={`url(#sl-${colour})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
