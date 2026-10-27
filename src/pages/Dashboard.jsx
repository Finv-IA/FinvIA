import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatBRL } from '@/lib/format';
import StatCard from '@/components/dashboard/StatCard';
import MonthlyChart from '@/components/dashboard/MonthlyChart';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import TransactionRow from '@/components/transactions/TransactionRow';

export default function Dashboard() {
  const [state, setState] = useState({
    loading: true,
    income: 0,
    expense: 0,
    count: 0,
    categories: [],
    recent: [],
    all: [],
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [typeAgg, catAgg, recentPage, samplePage] = await Promise.all([
          base44.entities.Transaction.aggregate({ groupBy: 'type', sum: ['amount'] }),
          base44.entities.Transaction.aggregate({
            query: { type: 'expense' },
            groupBy: 'category',
            sum: ['amount'],
          }),
          base44.entities.Transaction.filter({}, { sort: '-date', limit: 6 }),
          base44.entities.Transaction.filter({}, { sort: '-date', limit: 300 }),
        ]);
        if (!active) return;
        const rows = typeAgg.rows || [];
        const incomeRow = rows.find((r) => r.type === 'income');
        const expenseRow = rows.find((r) => r.type === 'expense');
        setState({
          loading: false,
          income: Number(incomeRow?.sum_amount) || 0,
          expense: Number(expenseRow?.sum_amount) || 0,
          count: rows.reduce((sum, r) => sum + (Number(r.count) || 0), 0),
          categories: catAgg.rows || [],
          recent: recentPage.items || [],
          all: samplePage.items || [],
        });
      } catch {
        if (active) setState((prev) => ({ ...prev, loading: false }));
      }
    };

    load();
    const unsubscribe = base44.entities.Transaction.subscribe(() => load());

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const balance = state.income - state.expense;
  const savingsRate = state.income ? Math.round((balance / state.income) * 100) : 0;

  if (state.loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-secondary border-t-primary" />
      </div>
    );
  }

  return (
    <div className="scroll-slim h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              visão geral
            </p>
            <h1 className="display mt-2 text-4xl leading-none sm:text-5xl">Seu painel</h1>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {state.count > 0
                ? `${state.count} lançamentos organizados`
                : 'Nenhum lançamento ainda'}
            </p>
          </div>
          <Link
            to="/transacoes"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:gap-2.5 transition-all"
          >
            Ver transações <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {state.count === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-12 text-center">
            <p className="display text-2xl">Seu painel nasce do extrato</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Volte para a conversa, cole o extrato do banco e a IA organiza cada lançamento por
              categoria.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Colar meu extrato
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Receitas" value={formatBRL(state.income)} />
              <StatCard label="Despesas" value={formatBRL(state.expense)} />
              <StatCard
                label="Saldo"
                value={formatBRL(balance)}
                hint={balance >= 0 ? 'sobrou no período' : 'gastou mais que entrou'}
              />
              <StatCard
                label="Taxa de poupança"
                value={`${savingsRate}%`}
                hint="da renda que ficou com você"
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <div className="rounded-2xl border hairline bg-white p-5 lg:col-span-3">
                <p className="text-sm font-medium">Receitas e despesas</p>
                <p className="mb-3 text-[11px] text-muted-foreground">últimos 6 meses</p>
                <MonthlyChart transactions={state.all} />
              </div>
              <div className="rounded-2xl border hairline bg-white p-5 lg:col-span-2">
                <p className="text-sm font-medium">Onde seu dinheiro foi</p>
                <p className="mb-4 text-[11px] text-muted-foreground">por categoria</p>
                <CategoryBreakdown rows={state.categories} />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border hairline bg-white p-5">
              <p className="mb-1 text-sm font-medium">Últimos lançamentos</p>
              <div className="mt-2">
                {state.recent.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}