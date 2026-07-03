import { unstable_cache } from "next/cache";
import PostCard from "@/components/PostCard";
import { prisma } from "@/lib/prisma";

// Cached per slug; Date is formatted to a string inside so the cached value is
// plain JSON. Busted on any post/category change via revalidateTag.
const getCategoryData = unstable_cache(
  async (slug: string) => {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { posts: { orderBy: { createdAt: "desc" } } },
    });
    if (!category) return null;
    return {
      label: category.label,
      posts: category.posts.map((p) => ({
        id: p.id,
        title: p.title,
        thumbnail: p.thumbnail || "/placeholder-thumb.jpg",
        excerpt: p.content.slice(0, 80),
        date: `${p.createdAt.getFullYear()}.${String(
          p.createdAt.getMonth() + 1
        ).padStart(2, "0")}`,
      })),
    };
  },
  ["category-data"],
  { tags: ["categories", "posts"] }
);

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategoryData(params.slug);
  const posts = category?.posts ?? [];
  const label = category?.label ?? params.slug;

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-6 pb-24 pt-32">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
        Category
      </p>
      <h1 className="mt-3 font-display text-4xl text-text md:text-5xl">
        {label}
      </h1>

      {posts.length === 0 ? (
        <p className="mt-16 font-body text-text-muted">
          아직 이 별자리에는 별이 없습니다. 관리자 페이지에서 새 글을
          추가해 보세요.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              categorySlug={params.slug}
              index={i}
            />
          ))}
        </div>
      )}
    </section>
  );
}
