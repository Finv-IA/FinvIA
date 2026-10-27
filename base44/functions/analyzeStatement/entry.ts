import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { CATEGORY_VALUES, CATEGORY_LABELS } from '../../shared/categories.ts';

const MAX_CHARS = 30000;

const normalize = (item, fallbackDate) => {
  const amount = Math.abs(Number(String(item?.amount ?? '').replace(',', '.')));
  const description = String(item?.description ?? '').trim();
  if (!amount || !description) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(item?.date ?? ''))
    ? item.date
    : fallbackDate;
  const type = item?.type === 'income' ? 'income' : 'expense';
  const category = CATEGORY_VALUES.includes(item?.category) ? item.category : 'outros';
  return { description: description.slice(0, 140), amount, date, type, category, source: 'extrato' };
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === 'string' ? body.text.slice(0, MAX_CHARS) : '';
    if (text.trim().length < 8) {
      return Response.json({ error: 'Cole as linhas do extrato.' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const prompt = `Você extrai lançamentos de extratos bancários brasileiros.

Regras:
- Retorne APENAS os lançamentos reais do extrato, na ordem em que aparecem.
- "amount" sempre positivo, sem símbolo de moeda.
- "type": "income" para créditos/entradas/recebimentos; "expense" para débitos/saídas/pagamentos.
- "date" no formato YYYY-MM-DD. Se o ano não aparecer, use ${today.slice(0, 4)}.
- "category" deve ser exatamente um destes valores: ${CATEGORY_VALUES.join(', ')}.
- Ignore saldos, totais, cabeçalhos, linhas de "saldo anterior", tarifas sem valor e qualquer linha sem valor.
- Descrição curta e legível, sem códigos longos.
- Nunca invente lançamentos.

EXTRATO:
${text}`;

    const schema = {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              amount: { type: 'number' },
              date: { type: 'string' },
              type: { type: 'string', enum: ['income', 'expense'] },
              category: { type: 'string', enum: CATEGORY_VALUES },
            },
            required: ['description', 'amount', 'date', 'type', 'category'],
          },
        },
      },
      required: ['transactions'],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    const raw = Array.isArray(result?.transactions) ? result.transactions : [];
    const clean = raw
      .slice(0, 300)
      .map((item) => normalize(item, today))
      .filter(Boolean);

    if (!clean.length) {
      const summary =
        'Não encontrei lançamentos nesse texto. Cole apenas as linhas do extrato (data, descrição e valor), uma por linha, e tente novamente.';
      await base44.entities.ChatMessage.create({ role: 'assistant', content: summary, kind: 'extrato' });
      return Response.json({ imported: 0, summary });
    }

    await base44.entities.Transaction.bulkCreate(clean);

    const income = clean
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = clean
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = {};
    clean
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      });
    const top = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const brl = (value) =>
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const topText = top.length
      ? `\nMaiores gastos: ${top
          .map(([key, value]) => `${CATEGORY_LABELS[key]} (${brl(value)})`)
          .join(', ')}.`
      : '';

    const summary = `Organizei ${clean.length} lançamentos do seu extrato.\n\nReceitas: ${brl(
      income,
    )}\nDespesas: ${brl(expense)}\nSaldo do período: ${brl(income - expense)}${topText}\n\nJá está tudo no seu painel por categoria. Quer que eu sugira onde cortar gastos e como investir o que sobrou?`;

    await base44.entities.ChatMessage.create({ role: 'assistant', content: summary, kind: 'extrato' });

    return Response.json({ imported: clean.length, summary, income, expense });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}