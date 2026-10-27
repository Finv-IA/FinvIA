import { useEffect, useState } from 'react';
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
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const page = await base44.entities.Goal.filter({}, { sort: '-created_date', limit: 50 });
        if (active) setGoals(page.items || []);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const unsubscribe = base44.entities.Goal.subscribe(() => load());
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const create = async (values) => {
    setSaving(true);
    try {
      const created = await base44.entities.Goal.create({ ...values, saved_amount: 0 });
      setGoals((prev) => [created, ...prev]);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const contribute = async (goal, amount) => {
    const updated = await base44.entities.Goal.update(goal.id, {
      saved_amount: (Number(goal.saved_amount) || 0) + amount,
    });
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
  };

  const remove = async (id) => {
    await base44.entities.Goal.delete(id);
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <div className="scroll-slim h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">metas</p>
            <h1 className="display mt-2 text-4xl leading-none sm:text-5xl">O que você quer</h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Cada valor guardado te aproxima do objetivo.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-full px-4">
            <Plus className="mr-1.5 h-4 w-4" /> Nova meta
          </Button>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {loading ? (
            [0, 1].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-secondary/70" />
            ))
          ) : goals.length === 0 ? (
            <div className="sm:col-span-2 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center">
              <p className="display text-2xl">Nenhuma meta ainda</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Reserva de emergência, uma viagem, sair das dívidas: escreva o objetivo e acompanhe
                o progresso.
              </p>
            </div>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={contribute}
                onDelete={remove}
              />
            ))
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Nova meta</DialogTitle>
            <DialogDescription className="sr-only">
              Crie uma meta financeira com valor e prazo.
            </DialogDescription>
          </DialogHeader>
          <GoalForm onSubmit={create} onCancel={() => setOpen(false)} saving={saving} />
        </DialogContent>
      </Dialog>
    </div>
  );
}