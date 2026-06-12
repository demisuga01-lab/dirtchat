export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-6xl items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-pulse-soft bg-foreground/30" />
        </div>
        <span>Loading…</span>
      </div>
    </div>
  );
}
