import { Trash2 } from 'lucide-react';
import { categoryColor, categoryLabel } from '@/lib/categories';
import { formatBRL, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function TransactionRow({ transaction, onDelete }) {
  const isIncome = transaction.type === 'income';
  return (
    <div className="flex items-center gap-3 border-b hairline py-3 last:border-b-0">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: categoryColor(transaction.category) }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{transaction.description}</p>
        <p className="text-[11px] text-muted-foreground">
          {categoryLabel(transaction.category)}
          {transaction.date ? ` · ${formatDate(transaction.date)}` : ''}
        </p>
      </div>
      <p
        className={cn(
          'shrink-0 text-sm font-medium tabular-nums',
          isIncome ? 'text-emerald-700' : 'text-foreground',
        )}
      >
        {isIncome ? '+' : '−'} {formatBRL(transaction.amount)}
      </p>
      {onDelete && (
        <button
          onClick={() => onDelete(transaction.id)}
          aria-label="Excluir lançamento"
          className="shrink-0 text-muted-foreground/60 transition-colors hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}