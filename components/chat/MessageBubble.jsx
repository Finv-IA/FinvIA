import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed sm:max-w-[78%]',
          isUser
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md border hairline bg-white text-foreground shadow-[0_1px_2px_rgba(20,40,33,0.05)]',
        )}
      >
        {content}
      </div>
    </div>
  );
}