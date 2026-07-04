import { unstable_cache } from "next/cache";
import ConstellationBackground from "@/components/ConstellationBackground";
import CategoryCard from "@/components/CategoryCard";
import { prisma } from "@/lib/prisma";

// Optional short blurbs shown under each category label. Falls back to a
// generic line if a category doesn't have a curated description below.
const DESCRIPTIONS: Record<string, string> = {
  design: "브랜딩, 그래픽, UI 작업",
  video: "모션 그래픽, 편집",
  ai: "AI를 활용한 실험과 프로젝트",
  web: "웹 페이지, 프론트엔드 작업",
};

// Cached so navigating home doesn't hit the DB every time. Busted whenever a
// category is added/removed via revalidateTag("categories").
const getCategories = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    return categories.map((c) => ({
      slug: c.slug,
      label: c.label,
      ko: c.label,
      desc: DESCRIPTIONS[c.slug] ?? "선택한 작업물 모음",
    }));
  },
  ["home-categories"],
  { tags: ["categories"] }
);

// Hero title/subtitle, editable at /admin/settings. Cached, busted on save.
const getSettings = unstable_cache(
  async () => {
    const s = await prisma.siteSettings.findUnique({ where: { id: "site" } });
    return {
      heroTitle: s?.heroTitle ?? "",
      heroSubtitle: s?.heroSubtitle ?? "",
    };
  },
  ["home-settings"],
  { tags: ["settings"] }
);

export default async function HomePage() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSettings(),
  ]);

  return (
    <>
      <ConstellationBackground />
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          Portfolio
        </p>
        <h1 className="mt-4 break-keep font-display text-4xl leading-tight text-text sm:text-6xl md:text-7xl">
          {settings.heroTitle || "포트폴리오 사이트"}
        </h1>
        {settings.heroSubtitle && (
          <p className="mt-4 break-keep font-body text-base text-text-muted sm:text-lg">
            {settings.heroSubtitle}
          </p>
        )}

        {categories.length === 0 ? (
          <p className="mt-16 font-body text-text-muted">
            아직 카테고리가 없어요. 관리자 페이지에서 별자리를 만들어보세요.
          </p>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {categories.map((c, i) => (
              <CategoryCard key={c.slug} category={c} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
