import Markdown from "@/components/Markdown";
import SkillGauge from "@/components/SkillGauge";
import { ProfileSection } from "@/lib/profile";

// Public profile/resume view. Photo on the left (desktop), sections flow in a
// two-column masonry on the right; everything stacks on mobile.
export default function ProfileView({
  imageUrl,
  headline,
  sections,
}: {
  imageUrl: string;
  headline: string;
  sections: ProfileSection[];
}) {
  return (
    <section className="mx-auto min-h-screen max-w-6xl px-6 pb-24 pt-32">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
        Profile
      </p>
      {headline && (
        <h1 className="mt-3 font-display text-4xl text-text md:text-6xl">
          {headline}
        </h1>
      )}
      <div className="mt-8 h-px w-full bg-line" />

      {!imageUrl && sections.length === 0 ? (
        <p className="mt-16 font-body text-text-muted">
          아직 프로필이 없습니다.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {imageUrl && (
            <div className="lg:col-span-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="프로필 사진"
                className="w-full max-w-[240px] rounded-xl border border-line object-cover"
              />
            </div>
          )}
          <div className={imageUrl ? "lg:col-span-9" : "lg:col-span-12"}>
            <div className="gap-x-10 sm:columns-2 [&>*]:mb-10 [&>*]:break-inside-avoid">
              {sections.map((s, i) => (
                <SectionBlock key={i} section={s} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SectionBlock({ section }: { section: ProfileSection }) {
  return (
    <div>
      {section.title && (
        <h2 className="mb-4 font-body text-lg font-semibold text-text">
          {section.title}
        </h2>
      )}
      {section.type === "text" ? (
        <Markdown>{section.value}</Markdown>
      ) : (
        <ul className="space-y-3">
          {section.items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-4 border-b border-line pb-3"
            >
              <span className="font-body text-sm text-text-muted">
                {it.name}
              </span>
              <SkillGauge level={it.level} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
