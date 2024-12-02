import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  timestamp: number;
  rate: number;
}

interface PollingGraphProps {
  data: DataPoint[];
}

export function PollingGraph({ data }: PollingGraphProps) {
  return (
    <div className="w-full h-[200px] gaming-gradient backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 neon-border">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(time) => format(time, 'HH:mm:ss')}
            stroke="#64748b"
          />
          <YAxis stroke="#64748b" />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900/90 border border-slate-700 p-2 rounded-lg shadow-lg neon-border">
                    <p className="text-cyan-400 font-bold">
                      {payload[0].value} Hz
                    </p>
                    <p className="text-slate-400 text-sm">
                      {format(payload[0].payload.timestamp, 'HH:mm:ss')}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#00f3ff"
            strokeWidth={2}
            fill="url(#rateGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}