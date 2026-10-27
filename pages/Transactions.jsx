import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TransactionRow from '@/components/transactions/TransactionRow';
import TransactionForm from '@/components/transactions/TransactionForm';
import { CATEGORIES } from '@/lib/categories';

const FILTERS = [
  { value: 'all', label: 'Tudo' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
];

export default function Transactions() {
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const buildQuery = () => {
    const query = {};
    if (type !== 'all') query.type = type;
    if (category !== 'all') query.category = category;
    return query;
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Transaction.filter(buildQuery(), {
        sort: '-date',
        limit: 25,
      });
      setItems(page.items || []);
      setCursor(page.next_cursor);
      setHasMore(Boolean(page.has_more));
    } finally {
      setLoading(false);
    }
  }, [type, category]);

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.Transaction.subscribe(() => load());
    return unsubscribe;
  }, [load]);

  const loadMore = async () => {
    const page = await base44.entities.Transaction.filter(buildQuery(), {
      sort: '-date',
      limit: 25,
      cursor,
    });
    setItems((prev) => [...prev, ...(page.items || [])]);
    setCursor(page.next_cursor);
    setHasMore(Boolean(page.has_more));
  };

  const create = async (values) => {
    setSaving(true);
    try {
      const created = await base44.entities.Transaction.create({
        description: values.description,
        amount: values.amount,
        date: values.date,
        type: values.type,
        category: values.category,
        notes: values.notes,
        source: 'manual',
      });
      setItems((prev) => [created, ...prev]);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.Transaction.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="scroll-slim h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              lançamentos
            </p>
            <h1 className="display mt-2 text-4xl leading-none sm:text-5xl">Transações</h1>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-full px-4">
            <Plus className="mr-1.5 h-4 w-4" /> Novo
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border hairline bg-white p-1">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setType(filter.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  type === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[190px] rounded-full bg-white text-xs">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 rounded-2xl border hairline bg-white px-5 py-2">
          {loading ? (
            <div className="space-y-3 py-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-secondary/70" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-14 text-center text-sm text-muted-foreground">
              Nenhum lançamento encontrado. Cole um extrato na conversa ou adicione manualmente.
            </p>
          ) : (
            items.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onDelete={remove}
              />
            ))
          )}
        </div>

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={loadMore} className="rounded-full">
              Carregar mais
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Novo lançamento</DialogTitle>
            <DialogDescription className="sr-only">
              Registre uma receita ou despesa manualmente.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={create}
            onCancel={() => setOpen(false)}
            saving={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}