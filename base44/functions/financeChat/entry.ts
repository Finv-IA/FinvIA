import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { CATEGORY_LABELS } from '../../shared/categories.ts';

const MAX_MESSAGE = 2000;

const brl = (value) =>
  (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const message =
      typeof body?.message === 'string' ? body.message.trim().slice(0, MAX_MESSAGE) : '';
    if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

    const [txPage, goalPage, historyPage] = await Promise.all([
      base44.entities.Transaction.filter({}, { sort: '-date', limit: 150 }),
      base44.entities.Goal.filter({}, { sort: '-created_date', limit: 20 }),
      base44.entities.ChatMessage.filter({}, { sort: '-created_date', limit: 8 }),
    ]);

    const transactions = txPage.items || [];
    const goals = goalPage.items || [];
    const history = (historyPage.items || []).reverse();

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const byCategory = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + (Number(t.amount) || 0);
      });

    const categoryLines = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, value]) => `- ${CATEGORY_LABELS[key] || key}: ${brl(value)}`)
      .join('\n');

    const recentLines = transactions
      .slice(0, 12)
      .map(
        (t) =>
          `- ${t.date} | ${t.description} | ${t.type === 'income' ? '+' : '-'}${brl(
            t.amount,
          )} | ${CATEGORY_LABELS[t.category] || t.category}`,
      )
      .join('\n');

    const goalLines = goals
      .map((g) => {
        const target = Number(g.target_amount) || 0;
        const saved = Number(g.saved_amount) || 0;
        const pct = target ? Math.round((saved / target) * 100) : 0;
        return `- ${g.title}: ${brl(saved)} de ${brl(target)} (${pct}%)${
          g.deadline ? `, prazo ${g.deadline}` : ''
        }`;
      })
      .join('\n');

    const historyText = history
      .map((m) => `${m.role === 'user' ? 'Pessoa' : 'Mentor'}: ${String(m.content).slice(0, 400)}`)
      .join('\n');

    const prompt = `Você é o Mentor do FinvIA, um educador financeiro brasileiro, direto e acolhedor.

COMO RESPONDER:
- Português do Brasil, trate a pessoa por "você".
- No máximo 180 palavras. Texto corrido curto com listas usando "•", nunca markdown, nunca asteriscos.
- Use os dados reais abaixo. Se não houver dados, diga que ainda não recebeu o extrato e convide a pessoa a colar.
- Sempre termine com uma ação prática concreta para esta semana.
- Investimentos: cite no máximo 2 opções acessíveis ao investidor brasileiro (Tesouro Selic, CDB de liquidez diária, LCI/LCA, fundo DI, previdência, ETFs ou FIIs), sempre com o risco em uma frase. Nunca prometa rentabilidade nem indique ativo específico como garantia.
- Não dê conselho jurídico, contábil ou recomendação formal de investimento; quando o assunto exigir, lembre em uma frase que não é recomendação profissional.
- Se pedirem para guardar dinheiro, sugira um valor realista a partir da renda que aparecer nos dados.

RESUMO FINANCEIRO DA PESSOA
Lançamentos analisados: ${transactions.length}
Receitas: ${brl(income)}
Despesas: ${brl(expense)}
Saldo: ${brl(income - expense)}
${categoryLines ? `Gastos por categoria:\n${categoryLines}` : 'Sem despesas registradas.'}
${recentLines ? `Lançamentos recentes:\n${recentLines}` : ''}
${goalLines ? `Metas:\n${goalLines}` : 'Nenhuma meta cadastrada.'}

CONVERSA RECENTE
${historyText || 'sem histórico'}

MENSAGEM DA PESSOA
${message}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const reply =
      typeof result === 'string' ? result : result?.response || String(result || '');

    if (!reply) return Response.json({ error: 'Resposta vazia da IA' }, { status: 502 });

    await Promise.all([
      base44.entities.ChatMessage.create({ role: 'user', content: message, kind: 'text' }),
      base44.entities.ChatMessage.create({ role: 'assistant', content: reply, kind: 'text' }),
    ]);

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}