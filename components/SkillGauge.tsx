import { skillLabel } from "@/lib/profile";

// A 5-segment skill gauge (하/중하/중/중상/상). Optionally interactive so the
// same visual works in the admin editor (click a segment to set the level).
export default function SkillGauge({
  level,
  onChange,
}: {
  level: number;
  onChange?: (level: number) => void;
}) {
  const lv = Math.min(5, Math.max(1, level));
  const interactive = !!onChange;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const seg = (
            <span
              className={`h-1.5 w-5 rounded-full ${
                i < lv ? "bg-gold" : "bg-surface-hover"
              }`}
            />
          );
          return interactive ? (
            <button
              key={i}
              type="button"
              aria-label={`레벨 ${i + 1}`}
              onClick={() => onChange!(i + 1)}
              className="py-1"
            >
              {seg}
            </button>
          ) : (
            <span key={i}>{seg}</span>
          );
        })}
      </span>
      <span className="font-mono text-xs text-text-muted">{skillLabel(lv)}</span>
    </span>
  );
}
