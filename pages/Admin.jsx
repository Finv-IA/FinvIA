import { useEffect, useState } from 'react';
import { Download, Lock, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ADMIN_CODE, APP_NAME } from '@/lib/config';
import { downloadFile, toCSV } from '@/lib/download';
import PaymentRequests from '@/components/admin/PaymentRequests';
import DownloadApp from '@/components/admin/DownloadApp';

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

export default function Admin() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Auto-unlock for users with admin role (set in Base44 Dashboard > Users)
  useEffect(() => {
    if (isAdmin) setUnlocked(true);
  }, [isAdmin]);

  const gather = async () => {
    setLoading(true);
    try {
      const [tx, goals, msgs, orders, users] = await Promise.all([
        base44.entities.Transaction.filter({}, { sort: '-created_date', limit: 1000 }),
        base44.entities.Goal.filter({}, { sort: '-created_date', limit: 500 }),
        base44.entities.ChatMessage.filter({}, { sort: '-created_date', limit: 1000 }),
        base44.entities.Order.filter({}, { sort: '-created_date', limit: 500 }),
        base44.entities.User.list(),
      ]);
      setData({
        transactions: tx.items || [],
        goals: goals.items || [],
        chat_messages: msgs.items || [],
        orders: orders.items || [],
        users: users || [],
      });
    } catch (err) {
      console.error('Failed to load admin data', err);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) gather();
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked) return undefined;

    const unsubscribe = base44.entities.Order.subscribe((event) => {
      setData((prev) => {
        if (!prev) return prev;
        let orders = prev.orders;
        if (event.type === 'create') {
          orders = [event.data, ...orders];
          if (event.data.status === 'pending') {
            toast({
              title: 'Novo pedido de acesso',
              description: `${event.data.email || 'Cliente'} enviou ${event.data.reference || 'um pedido'} para aprovação.`,
            });
          }
        } else if (event.type === 'update') {
          orders = orders.map((order) =>
            order.id === event.data.id ? { ...order, ...event.data } : order,
          );
        } else {
          orders = orders.filter((order) => order.id !== event.data.id);
        }
        return { ...prev, orders };
      });
    });

    return unsubscribe;
  }, [unlocked]);

  const unlock = (event) => {
    event.preventDefault();
    if (code.trim() === ADMIN_CODE || isAdmin) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Código incorreto. Prefira definir seu usuário como "admin" no painel Base44.');
    }
  };

  const downloadBackup = () => {
    downloadFile(
      `finvia-backup-${stamp()}.json`,
      JSON.stringify({ app: APP_NAME, gerado_em: new Date().toISOString(), ...data }, null, 2),
    );
  };

  const downloadCSV = (key, filename) => {
    downloadFile(`finvia-${filename}-${stamp()}.csv`, toCSV(data[key]), 'text/csv');
  };

  const updateOrder = (updated) => {
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)),
    }));
  };

  if (!isAdmin) {
    return (
      <div className="grid h-full place-items-center px-6">
        <div className="max-w-sm rounded-2xl border hairline bg-white px-6 py-10 text-center">
          <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="display mt-3 text-2xl">Área restrita</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Este painel é exclusivo da administração do app.
          </p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="grid h-full place-items-center px-6">
        <form
          onSubmit={unlock}
          className="w-full max-w-sm rounded-2xl border hairline bg-white px-6 py-9"
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <p className="display mt-4 text-3xl leading-none">Painel do dono</p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Digite o código de acesso para aprovar pagamentos e baixar os dados do app.
          </p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de acesso"
            type="password"
            className="mt-5"
          />
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <Button type="submit" className="mt-3 w-full rounded-full">
            Desbloquear
          </Button>
        </form>
      </div>
    );
  }

  const orders = data?.orders || [];
  const pendingCount = orders.filter((order) => order.status === 'pending').length;

  return (
    <div className="scroll-slim h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          administração
        </p>
        <h1 className="display mt-2 text-4xl leading-none sm:text-5xl">Aprovações e dados</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Aprove pagamentos para liberar o app e baixe o conteúdo completo do FinvIA.
        </p>

        {loading || !data ? (
          <div className="mt-8 grid place-items-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-secondary border-t-primary" />
          </div>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Aguardando', value: pendingCount },
                { label: 'Lançamentos', value: data.transactions.length },
                { label: 'Metas', value: data.goals.length },
                { label: 'Pedidos', value: orders.length },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border hairline bg-white px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-medium tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>

            <PaymentRequests orders={orders} onUpdate={updateOrder} />

            <DownloadApp />

            <div className="mt-4 rounded-2xl border hairline bg-white p-5">
              <p className="text-sm font-medium">Backup completo</p>
              <p className="text-[11px] text-muted-foreground">
                Um único arquivo .json com tudo que foi criado no app.
              </p>
              <Button onClick={downloadBackup} className="mt-4 rounded-full">
                <Download className="mr-1.5 h-4 w-4" /> Baixar tudo (.json)
              </Button>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['transactions', 'lançamentos'],
                  ['goals', 'metas'],
                  ['chat_messages', 'conversas'],
                  ['orders', 'pedidos'],
                  ['users', 'usuários'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => downloadCSV(key, label)}
                    className="rounded-full border hairline bg-white px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    CSV · {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}