import { categoryColor, categoryLabel } from '@/lib/categories';
import { formatBRL } from '@/lib/format';

export default function CategoryBreakdown({ rows = [] }) {
  const total = rows.reduce((sum, row) => sum + (Number(row.sum_amount) || 0), 0);
  const top = [...rows]
    .sort((a, b) => (Number(b.sum_amount) || 0) - (Number(a.sum_amount) || 0))
    .slice(0, 6);

  if (!top.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhuma despesa registrada ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3.5">
      {top.map((row) => {
        const value = Number(row.sum_amount) || 0;
        const pct = total ? Math.round((value / total) * 100) : 0;
        return (
          <div key={row.category}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: categoryColor(row.category) }}
                />
                {categoryLabel(row.category)}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatBRL(value)} <span className="text-[11px]">· {pct}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: categoryColor(row.category),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}