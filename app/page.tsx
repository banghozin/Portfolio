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

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <ConstellationBackground />
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pt-24">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          Portfolio
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl italic leading-tight text-text md:text-7xl">
          네 갈래의 별자리를
          <br />
          <span className="not-italic text-gold">한 사람이</span> 그립니다.
        </h1>
        <p className="mt-6 max-w-xl font-body text-base text-text-muted md:text-lg">
          디자인, 영상, AI, 웹 — 각각의 작업물이 모여 하나의 궤적을
          이룹니다. 별자리를 골라 들어가 보세요.
        </p>

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
