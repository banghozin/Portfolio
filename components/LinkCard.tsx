// A link button block. Sizes to its content (moderate width). With a subtitle
// it shows title + subtitle stacked; without one, just the title, centered.
export default function LinkCard({
  url,
  title,
  subtitle,
}: {
  url: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <a
      href={url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex min-w-[220px] max-w-full items-center justify-between gap-5 rounded-xl border border-line bg-surface px-5 py-4 transition-colors hover:border-gold hover:bg-surface-hover"
    >
      <span className="flex flex-col">
        <span className="font-body text-base font-medium text-text">
          {title || "링크"}
        </span>
        {subtitle ? (
          <span className="mt-0.5 font-body text-sm text-text-muted">
            {subtitle}
          </span>
        ) : null}
      </span>
      <span className="font-mono text-gold transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </a>
  );
}
