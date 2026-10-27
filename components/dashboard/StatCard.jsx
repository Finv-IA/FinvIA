import { cn } from '@/lib/utils';

export default function StatCard({ label, value, hint, accent }) {
  return (
    <div className="rounded-2xl border hairline bg-white p-4 shadow-[0_1px_2px_rgba(20,40,33,0.04)]">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={cn('mt-2 text-xl font-medium tabular-nums sm:text-2xl', accent)}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}