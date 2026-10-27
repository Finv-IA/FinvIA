import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function GoalForm({ onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({ title: '', target_amount: '', deadline: '', note: '' });
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const target = Math.abs(Number(String(form.target_amount).replace(',', '.')));
    if (!form.title.trim() || !target) return;
    onSubmit({
      title: form.title.trim(),
      target_amount: target,
      deadline: form.deadline || undefined,
      note: form.note || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs">Nome da meta</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Reserva de emergência, viagem, carro…"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="target" className="text-xs">Valor da meta (R$)</Label>
          <Input
            id="target"
            inputMode="decimal"
            value={form.target_amount}
            onChange={(e) => update('target_amount', e.target.value)}
            placeholder="0,00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deadline" className="text-xs">Prazo (opcional)</Label>
          <Input
            id="deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => update('deadline', e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note" className="text-xs">Por que essa meta importa?</Label>
        <Textarea
          id="note"
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
          className="min-h-[70px] resize-none"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="rounded-full px-5">
          {saving ? 'Criando…' : 'Criar meta'}
        </Button>
      </div>
    </form>
  );
}