export default function Loading() {
  return (
    <article className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-32">
      <div className="h-3 w-16 animate-pulse rounded bg-surface" />
      <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-surface" />
      <div className="mt-10 aspect-video w-full animate-pulse rounded-xl bg-surface" />
      <div className="mt-10 space-y-3">
        <div className="h-3 w-full animate-pulse rounded bg-surface" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-surface" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-surface" />
      </div>
    </article>
  );
}
