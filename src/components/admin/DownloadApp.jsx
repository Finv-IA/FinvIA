import { Download, Package } from 'lucide-react';

// Bump this whenever public/finvia-app.zip is regenerated so browsers fetch the new file.
const ZIP_VERSION = '2026-10-27';

export default function DownloadApp() {
  return (
    <div className="mt-4 rounded-2xl border hairline bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
          <Package className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-medium">Baixar o app completo (.zip)</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Todo o código do FinvIA em um arquivo: telas, componentes, entidades e funções de
            backend, com o passo a passo para rodar em outro lugar.
          </p>
        </div>
      </div>

      <a
        href={`/finvia-app.zip?v=${ZIP_VERSION}`}
        download
        className="mt-4 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Download className="mr-1.5 h-4 w-4" />
        Baixar app (.zip)
      </a>
    </div>
  );
}