import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatBRL, monthLabel } from '@/lib/format';

function buildSeries(transactions) {
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: monthLabel(d),
      receitas: 0,
      despesas: 0,
    });
  }
  transactions.forEach((t) => {
    const bucket = months.find((m) => m.key === String(t.date || '').slice(0, 7));
    if (!bucket) return;
    if (t.type === 'income') bucket.receitas += Number(t.amount) || 0;
    else bucket.despesas += Number(t.amount) || 0;
  });
  return months;
}

export default function MonthlyChart({ transactions }) {
  const data = buildSeries(transactions || []);

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="hsl(40 16% 90%)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'hsl(160 8% 46%)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={54}
            tick={{ fontSize: 10, fill: 'hsl(160 8% 46%)' }}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
          />
          <Tooltip
            cursor={{ fill: 'hsl(40 24% 94% / 0.6)' }}
            formatter={(value, name) => [formatBRL(value), name]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(40 16% 88%)',
              fontSize: 12,
              boxShadow: '0 8px 24px -16px rgba(20,40,33,0.5)',
            }}
          />
          <Bar dataKey="receitas" name="Receitas" fill="hsl(160 40% 22%)" radius={[5, 5, 0, 0]} maxBarSize={22} />
          <Bar dataKey="despesas" name="Despesas" fill="hsl(26 64% 52%)" radius={[5, 5, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}