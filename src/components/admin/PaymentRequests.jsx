import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { formatBRL } from '@/lib/format';
import { PLANS } from '@/lib/config';

const STATUS_LABEL = {
  pending: 'em análise',
  paid: 'aprovado',
  cancelled: 'recusado',
};

function OrderRow({ order, onStatus, busyId }) {
  const busy = busyId === order.id;
  const planLabel = PLANS[order.plan]?.name || order.plan || '—';
  const method = order.payment_method === 'card' ? 'cartão' : 'PIX';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b hairline py-3 text-[13px] last:border-b-0">
      <div className="min-w-0">
        <p className="font-mono text-xs">{order.reference}</p>
        <p className="truncate text-[11px] text-muted-foreground">{order.email}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {planLabel} · {method}
          {order.expires_at ? ` · até ${order.expires_at}` : ''}
        </p>
      </div>
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
        {STATUS_LABEL[order.status] || order.status}
      </span>
      <div className="flex gap-2">
        {order.status !== 'paid' && (
          <button
            onClick={() => onStatus(order, 'paid')}
            disabled={busy}
            className="rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? '…' : 'Aprovar'}
          </button>
        )}
        {order.status === 'pending' && (
          <button
            onClick={() => onStatus(order, 'cancelled')}
            disabled={busy}
            className="rounded-full border hairline px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            Recusar
          </button>
        )}
      </div>
    </div>
  );
}

export default function PaymentRequests({ orders, onUpdate }) {
  const [busyId, setBusyId] = useState('');

  const changeStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      await base44.entities.Order.update(order.id, { status });
      onUpdate({ ...order, status });
    } finally {
      setBusyId('');
    }
  };

  const pending = orders.filter((order) => order.status === 'pending');
  const others = orders.filter((order) => order.status !== 'pending');

  return (
    <div className="mt-4 rounded-2xl border hairline bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Pagamentos para aprovar</p>
        {pending.length > 0 && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground">
            {pending.length} novo{pending.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhum pedido registrado ainda.</p>
      ) : (
        <div className="mt-2">
          {pending.length === 0 && (
            <p className="py-3 text-[13px] text-muted-foreground">Nada pendente no momento.</p>
          )}
          {[...pending, ...others].map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onStatus={changeStatus}
              busyId={busyId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
