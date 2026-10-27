import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '@/lib/categories';

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ onSubmit, onCancel, saving }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: today(),
    type: 'expense',
    category: 'alimentacao',
    notes: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const amount = Math.abs(Number(String(form.amount).replace(',', '.')));
    if (!form.description.trim() || !amount) return;
    onSubmit({ ...form, description: form.description.trim(), amount });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs">Descrição</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Supermercado, salário, aluguel…"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-xs">Valor (R$)</Label>
          <Input
            id="amount"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
            placeholder="0,00"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs">Data</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Tipo</Label>
          <Select value={form.type} onValueChange={(v) => update('type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Categoria</Label>
          <Select value={form.category} onValueChange={(v) => update('category', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs">Observação (opcional)</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="min-h-[70px] resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving} className="rounded-full px-5">
          {saving ? 'Salvando…' : 'Salvar lançamento'}
        </Button>
      </div>
    </form>
  );
}