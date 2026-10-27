export default function TypingDots() {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-primary" />
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border hairline bg-white px-4 py-4">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}