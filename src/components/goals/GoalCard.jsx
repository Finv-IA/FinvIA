import { useState } from 'react';
import { Plus, Target, Trash2 } from 'lucide-react';
import { formatBRL } from '@/lib/format';

export default function GoalCard({ goal, onContribute, onDelete }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const target = Number(goal.target_amount) || 0;
  const saved = Number(goal.saved_amount) || 0;
  const pct = Math.min(100, Math.round((saved / (target || 1)) * 100));
  const remaining = Math.max(target - saved, 0);

  const contribute = async () => {
    const value = Math.abs(Number(String(amount).replace(',', '.')));
    if (!value) return;
    setSaving(true);
    try {
      await onContribute(goal, value);
      setAmount('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border hairline bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-medium leading-tight">{goal.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {goal.deadline ? `até ${goal.deadline.split('-').reverse().join('/')}` : 'sem prazo'}
              {remaining > 0 ? ` · faltam ${formatBRL(remaining)}` : ' · meta atingida'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          aria-label="Excluir meta"
          className="text-muted-foreground/60 transition-colors hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">
            <span className="text-sm font-medium text-foreground">{formatBRL(saved)}</span> de{' '}
            {formatBRL(target)}
          </span>
          <span className="font-medium tabular-nums">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="Quanto guardar agora"
          className="h-9 min-w-0 flex-1 rounded-full border hairline bg-white px-3.5 text-xs outline-none transition-colors focus:border-primary/40"
        />
        <button
          onClick={contribute}
          disabled={saving || !amount}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Guardar
        </button>
      </div>
    </div>
  );
}