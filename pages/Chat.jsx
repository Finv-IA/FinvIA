import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingDots from '@/components/chat/TypingDots';
import EmptyChat from '@/components/chat/EmptyChat';
import ChatComposer from '@/components/chat/ChatComposer';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [importing, setImporting] = useState(false);
  const [mode, setMode] = useState('chat');
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.ChatMessage.filter(
          {},
          { sort: '-created_date', limit: 60 },
        );
        setMessages([...(page.items || [])].reverse());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, importing]);

  const send = async (text) => {
    if (sending) return;
    setSending(true);
    setMessages((prev) => [
      ...prev,
      { id: `local-u-${Date.now()}`, role: 'user', content: text },
    ]);
    try {
      const res = await base44.functions.invoke('financeChat', { message: text });
      setMessages((prev) => [
        ...prev,
        { id: `local-a-${Date.now()}`, role: 'assistant', content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-e-${Date.now()}`,
          role: 'assistant',
          content: 'Não consegui responder agora. Tente novamente em alguns instantes.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const analyze = async (text) => {
    if (importing) return;
    setImporting(true);
    setMode('chat');
    setMessages((prev) => [
      ...prev,
      { id: `local-s-${Date.now()}`, role: 'user', content: 'Extrato colado — organize meus lançamentos' },
    ]);
    try {
      const res = await base44.functions.invoke('analyzeStatement', { text });
      setMessages((prev) => [
        ...prev,
        { id: `local-r-${Date.now()}`, role: 'assistant', content: res.data.summary },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-f-${Date.now()}`,
          role: 'assistant',
          content:
            'Não consegui ler esse extrato. Tente colar apenas as linhas de lançamento, uma por linha.',
        },
      ]);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b hairline bg-white/50 px-5 py-3.5 backdrop-blur">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[13px] font-semibold leading-tight">Mentor FinvIA</p>
          <p className="text-[11px] text-muted-foreground">
            Seu extrato lido, seus gastos no lugar
          </p>
        </div>
      </header>

      <div className="scroll-slim flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {loading ? (
            <div className="flex flex-col gap-3">
              <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-secondary/80" />
              <div className="ml-auto h-12 w-1/2 animate-pulse rounded-2xl bg-secondary/80" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyChat onPick={send} onOpenStatement={() => setMode('extrato')} />
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))
          )}
          {(sending || importing) && <TypingDots />}
          <div ref={endRef} />
        </div>
      </div>

      <ChatComposer
        onSend={send}
        onAnalyze={analyze}
        sending={sending}
        importing={importing}
        mode={mode}
        setMode={setMode}
      />
    </div>
  );
}