export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-text-muted">
        <span className="h-2 w-2 animate-ping rounded-full bg-gold" />
        불러오는 중
      </div>
    </div>
  );
}
