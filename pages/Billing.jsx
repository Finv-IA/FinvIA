import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { formatBRL } from '@/lib/format';
import { APP_NAME, PIX_CITY, PIX_KEY, PIX_RECEIVER, PLANS } from '@/lib/config';
import { buildPixCode } from '@/lib/pix';
import { cn } from '@/lib/utils';

const BENEFITS = [
  'Extrato do banco organizado por categoria em segundos',
  'Painel com receitas, despesas, saldo e taxa de poupança',
  'Mentor de IA para metas, cortes de gastos e investimentos',
  'Metas com acompanhamento do quanto já guardou',
];

const PLAN_LIST = [PLANS.monthly, PLANS.annual, PLANS.lifetime];

function addInterval(date, interval) {
  const d = new Date(date);
  if (interval === 'month') d.setMonth(d.getMonth() + 1);
  else if (interval === 'year') d.setFullYear(d.getFullYear() + 1);
  else return null;
  return d.toISOString().slice(0, 10);
}

export default function Billing() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('annual');
  const [copied, setCopied] = useState('');
  const [creating, setCreating] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const plan = PLANS[selectedPlanId] || PLANS.annual;

  const pixCode = useMemo(
    () =>
      buildPixCode({
        key: PIX_KEY,
        name: PIX_RECEIVER,
        city: PIX_CITY,
        amount: plan.price,
      }),
    [plan.price],
  );

  const loadOrders = async () => {
    if (!user?.id) return;
    const page = await base44.entities.Order.filter(
      { created_by_id: user.id },
      { sort: '-created_date', limit: 15 },
    );
    setOrders(page.items || []);
  };

  useEffect(() => {
    loadOrders();
    const unsubscribe = base44.entities.Order.subscribe(() => loadOrders());
    return unsubscribe;
  }, [user?.id]);

  const paidOrder = orders.find((o) => o.status === 'paid');
  const accessGranted = user?.role === 'admin' || Boolean(paidOrder);
  const awaitingApproval =
    !accessGranted && orders.some((o) => o.status === 'pending');

  const copy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      /* ignore */
    }
  };

  const declarePayment = async (method = 'pix') => {
    if (creating || accessGranted) return;
    setCreating(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const expires_at =
        plan.interval === 'once' ? null : addInterval(today, plan.interval);

      const order = await base44.entities.Order.create({
        amount: plan.price,
        status: 'pending',
        email: user?.email,
        reference: `FNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        note: `Pagamento ${method === 'card' ? 'cartão' : 'PIX'} · plano ${plan.name}`,
        plan: plan.id,
        interval: plan.interval,
        payment_method: method,
        expires_at: expires_at || undefined,
      });
      setLastOrder(order);
      await loadOrders();
    } finally {
      setCreating(false);
    }
  };

  const payWithCard = async () => {
    if (plan.stripePaymentLink) {
      // Abre o Payment Link do Stripe; após pagar o cliente volta e confirma
      window.open(plan.stripePaymentLink, '_blank', 'noopener,noreferrer');
      await declarePayment('card');
      return;
    }
    // Sem link configurado: registra pedido e orienta
    await declarePayment('card');
  };

  if (accessGranted) {
    const planName =
      PLANS[paidOrder?.plan]?.name ||
      (user?.role === 'admin' ? 'Admin' : 'Ativo');
    return (
      <div className="scroll-slim h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-5 py-16 text-center sm:px-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <h1 className="display mt-6 text-4xl leading-none">Acesso liberado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu plano <strong>{planName}</strong> está ativo. Aproveite o {APP_NAME}.
          </p>
          <Button asChild className="mt-8 rounded-full">
            <Link to="/">Ir para a conversa</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll-slim h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          meu acesso
        </p>
        <h1 className="display mt-2 text-4xl leading-none sm:text-5xl">
          Escolha seu plano
        </h1>
        <p className="mt-2 max-w-xl text-[13px] text-muted-foreground">
          Pague com PIX ou cartão. Após o pagamento, toque em “Já fiz o pagamento”
          para a liberação (aprox. em minutos).
        </p>

        {/* Plan cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLAN_LIST.map((p) => {
            const selected = selectedPlanId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlanId(p.id)}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-5 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/[0.04] shadow-[0_8px_30px_-12px_rgba(15,45,36,0.35)]'
                    : 'hairline bg-white hover:border-primary/40',
                )}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 left-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground">
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{p.name}</p>
                  <span
                    className={cn(
                      'grid h-5 w-5 place-items-center rounded-full border-2',
                      selected ? 'border-primary bg-primary' : 'border-border',
                    )}
                  >
                    {selected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                  </span>
                </div>
                <p className="display mt-3 text-3xl leading-none">
                  {formatBRL(p.price)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{p.label}</p>
                <p className="mt-3 text-[12px] leading-snug text-muted-foreground">
                  {p.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Benefits */}
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {BENEFITS.map((item) => (
            <li key={item} className="flex gap-2 text-[13px] text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.5} />
              {item}
            </li>
          ))}
        </ul>

        {/* Payment methods */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {/* PIX */}
          <div className="rounded-2xl border hairline bg-white p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <QrCode className="h-3.5 w-3.5" />
              PIX · {plan.name}
            </div>
            <p className="mt-1 text-sm font-medium">
              {formatBRL(plan.price)} · {plan.label}
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border hairline bg-secondary/40 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  chave PIX (e-mail)
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{PIX_KEY}</p>
                  <button
                    type="button"
                    onClick={() => copy(PIX_KEY, 'key')}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary"
                  >
                    {copied === 'key' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'key' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border hairline bg-secondary/40 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  código PIX copia e cola
                </p>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <p className="break-all font-mono text-[11px] leading-relaxed text-foreground/80">
                    {pixCode.slice(0, 48)}…
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(pixCode, 'pix')}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-primary"
                  >
                    {copied === 'pix' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'pix' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                Recebedor: {PIX_RECEIVER}. Pague e toque no botão abaixo.
              </p>
            </div>

            <Button
              onClick={() => declarePayment('pix')}
              disabled={creating || awaitingApproval}
              className="mt-5 w-full rounded-full"
            >
              {awaitingApproval
                ? 'Aguardando aprovação'
                : creating
                  ? 'Registrando…'
                  : 'Já fiz o pagamento via PIX'}
            </Button>
          </div>

          {/* Card */}
          <div className="rounded-2xl border hairline bg-white p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              Cartão · {plan.name}
            </div>
            <p className="mt-1 text-sm font-medium">
              {formatBRL(plan.price)} · {plan.label}
            </p>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              {plan.stripePaymentLink
                ? 'Você será redirecionado para o checkout seguro do Stripe. Após pagar, o pedido já fica registrado para aprovação.'
                : 'Cartão via Stripe: configure o Payment Link em src/lib/config.js (campo stripePaymentLink de cada plano). Enquanto isso, use PIX ou registre o pedido abaixo após pagar manualmente.'}
            </p>

            <div className="mt-6 space-y-3">
              <Button
                onClick={payWithCard}
                disabled={creating || awaitingApproval}
                variant={plan.stripePaymentLink ? 'default' : 'outline'}
                className="w-full rounded-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {plan.stripePaymentLink
                  ? 'Pagar com cartão'
                  : 'Registrar pagamento com cartão'}
              </Button>

              {!plan.stripePaymentLink && (
                <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Crie um Payment Link no Stripe Dashboard e cole em{' '}
                  <code className="rounded bg-secondary px-1">config.js</code>.
                </p>
              )}
            </div>
          </div>
        </div>

        {lastOrder && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-[12px] text-primary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Pedido <span className="font-semibold">{lastOrder.reference}</span> (
              {PLANS[lastOrder.plan]?.name || lastOrder.plan}) enviado para aprovação.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-6 rounded-2xl border hairline bg-white p-5">
            <p className="mb-2 text-sm font-medium">Seus pedidos</p>
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b hairline py-2.5 text-[13px] last:border-b-0"
              >
                <span className="font-mono text-xs">{order.reference}</span>
                <span className="text-[11px] text-muted-foreground">
                  {PLANS[order.plan]?.name || order.plan || '—'} ·{' '}
                  {order.payment_method === 'card' ? 'cartão' : 'PIX'}
                </span>
                <span className="text-muted-foreground">{formatBRL(order.amount)}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${
                    order.status === 'paid'
                      ? 'bg-primary/10 text-primary'
                      : order.status === 'cancelled'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {order.status === 'paid'
                    ? 'aprovado'
                    : order.status === 'cancelled'
                      ? 'recusado'
                      : 'em análise'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
