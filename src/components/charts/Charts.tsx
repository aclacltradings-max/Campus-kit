import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';

function useChartTheme() {
  const { resolved } = useTheme();
  const dark = resolved === 'dark';
  return {
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(28,24,16,0.08)',
    axis: dark ? '#6B6B7B' : '#8A857A',
    tooltipBg: dark ? 'rgba(19,19,23,0.96)' : 'rgba(255,255,255,0.98)',
    tooltipBorder: dark ? 'rgba(212,175,55,0.3)' : 'rgba(150,116,22,0.3)',
    text: dark ? '#EDEDF1' : '#181612',
    gold: '#D4AF37',
    goldSoft: '#EFCE64',
    emerald: '#34D399',
    rose: '#FB7185',
    sky: '#38BDF8',
    violet: '#A78BFA',
  };
}

function tooltipStyle(theme: ReturnType<typeof useChartTheme>) {
  return {
    backgroundColor: theme.tooltipBg,
    border: `1px solid ${theme.tooltipBorder}`,
    borderRadius: 12,
    fontSize: 12,
    padding: '8px 12px',
    color: theme.text,
    boxShadow: '0 18px 40px -24px rgba(0,0,0,0.9)',
  } as const;
}

export function ProductivityTrendChart({
  data,
}: {
  data: Array<{ label: string; created: number; completed: number }>;
}) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="ck-completed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.gold} stopOpacity={0.5} />
            <stop offset="100%" stopColor={theme.gold} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="ck-created" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.sky} stopOpacity={0.3} />
            <stop offset="100%" stopColor={theme.sky} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.axis }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: theme.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle(theme)} cursor={{ stroke: theme.gold, strokeOpacity: 0.25 }} />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke={theme.gold}
          strokeWidth={2.2}
          fill="url(#ck-completed)"
        />
        <Area
          type="monotone"
          dataKey="created"
          name="Created"
          stroke={theme.sky}
          strokeWidth={1.6}
          strokeDasharray="4 4"
          fill="url(#ck-created)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBreakdownChart({
  data,
}: {
  data: Array<{ name: string; total: number; completed: number; color: string }>;
}) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.axis }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: theme.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle(theme)} cursor={{ fill: theme.grid }} />
        <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]} fill={theme.gold} fillOpacity={0.28} />
        <Bar dataKey="completed" name="Completed" radius={[6, 6, 0, 0]} fill={theme.emerald} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PriorityRadarChart({
  data,
}: {
  data: Array<{ label: string; total: number; completed: number }>;
}) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={theme.grid} />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: theme.axis }} />
        <Radar name="Total" dataKey="total" stroke={theme.gold} fill={theme.gold} fillOpacity={0.22} />
        <Radar name="Completed" dataKey="completed" stroke={theme.emerald} fill={theme.emerald} fillOpacity={0.18} />
        <Tooltip contentStyle={tooltipStyle(theme)} />
        <Legend wrapperStyle={{ fontSize: 11, color: theme.axis }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function WeekdayChart({ data }: { data: Array<{ day: string; completed: number }> }) {
  const theme = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: theme.axis }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: theme.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle(theme)} />
        <Line
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke={theme.gold}
          strokeWidth={2.4}
          dot={{ r: 3, fill: theme.gold }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = ['#D4AF37', '#EFCE64', '#34D399', '#38BDF8', '#A78BFA', '#FB7185', '#F59E0B', '#94A3B8'];

export function StatusDonutChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  const theme = useChartTheme();
  const filtered = data.filter((d) => d.value > 0);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={3}
          stroke="none"
        >
          {filtered.map((entry, index) => (
            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle(theme)} />
        <Legend wrapperStyle={{ fontSize: 11, color: theme.axis }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
