import { useState } from 'react';
import { ArrowUp, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ChatComposer({ onSend, onAnalyze, sending, importing, mode, setMode }) {
  const [value, setValue] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!value.trim() || sending) return;
    onSend(value.trim());
    setValue('');
  };

  const handleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    setValue(text);
  };

  if (mode === 'extrato') {
    return (
      <div className="border-t hairline bg-white/85 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium">
              <FileSpreadsheet className="h-4 w-4 text-accent" strokeWidth={1.75} />
              Colar extrato do banco
            </p>
            <button
              onClick={() => setMode('chat')}
              aria-label="Fechar"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={'Ex.:\n05/10  SUPERMERCADO PAO DE ACUCAR  -184,90\n05/10  PIX RECEBIDO JOAO  +350,00'}
            className="min-h-[150px] resize-none rounded-2xl bg-white text-[13px] leading-relaxed"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="cursor-pointer text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground">
              Enviar arquivo .csv / .ofx
              <input
                type="file"
                accept=".csv,.txt,.ofx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
            <Button
              onClick={() => onAnalyze(value)}
              disabled={!value.trim() || importing}
              className="rounded-full px-5"
            >
              {importing ? 'Organizando…' : 'Organizar extrato'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="border-t hairline bg-white/85 px-4 py-3.5 backdrop-blur sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border hairline bg-white p-2 pl-3 shadow-[0_2px_10px_-6px_rgba(20,40,33,0.25)]">
        <button
          type="button"
          onClick={() => setMode('extrato')}
          aria-label="Colar extrato"
          title="Colar extrato do banco"
          className="mb-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          <FileSpreadsheet className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
          rows={1}
          placeholder="Pergunte sobre gastos, metas ou investimentos…"
          className="max-h-32 min-h-[38px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-[15px] shadow-none focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim() || sending}
          className="h-9 w-9 shrink-0 rounded-full"
          aria-label="Enviar"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}