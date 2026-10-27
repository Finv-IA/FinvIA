import { FileText } from 'lucide-react';

const SUGGESTIONS = [
  'Como faço para guardar R$ 500 por mês?',
  'Onde investir R$ 1.000 hoje com segurança?',
  'Analise meus gastos e me diga onde cortar',
  'Monte um orçamento para o próximo mês',
];

export default function EmptyChat({ onPick, onOpenStatement }) {
  return (
    <div className="flex flex-col items-start gap-6 py-6">
      <div className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          mentor financeiro
        </p>
        <h1 className="display mt-3 text-4xl leading-[1.05] sm:text-5xl">
          Vamos colocar seu dinheiro em ordem.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Cole o extrato do seu banco e eu organizo cada lançamento por categoria. Depois
          conversamos sobre metas, onde investir e como fazer o mês render mais.
        </p>
      </div>

      <button
        onClick={onOpenStatement}
        className="group flex w-full items-center gap-4 rounded-2xl border border-dashed border-border bg-white/70 px-5 py-4 text-left transition-colors hover:border-accent/60 hover:bg-white"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
          <FileText className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <span>
          <span className="block text-sm font-medium">Colar extrato do banco</span>
          <span className="block text-xs text-muted-foreground">
            Copie as linhas do app do banco, ou envie um arquivo .csv / .ofx
          </span>
        </span>
      </button>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-full border hairline bg-white px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}