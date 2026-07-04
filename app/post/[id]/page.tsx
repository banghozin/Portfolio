import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PostGallery from "@/components/PostGallery";
import PostBlocks from "@/components/PostBlocks";
import { asBlocks } from "@/lib/blocks";

// Cached per id; busted on any post change via revalidateTag("posts").
const getPost = unstable_cache(
  async (id: string) => {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return null;
    return {
      id: post.id,
      title: post.title,
      categoryId: post.categoryId,
      date: `${post.createdAt.getFullYear()}.${String(
        post.createdAt.getMonth() + 1
      ).padStart(2, "0")}`,
      content: post.content,
      blocks: asBlocks(post.blocks),
      images: post.images,
      youtubeUrl: post.youtubeUrl ?? "",
    };
  },
  ["post"],
  { tags: ["posts"] }
);

// Ordered post ids in a category (same order as the category grid) so the
// post page can offer prev/next arrows without going back and forth.
const getCategoryPostIds = unstable_cache(
  async (categoryId: string) => {
    const posts = await prisma.post.findMany({
      where: { categoryId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    return posts.map((p) => p.id);
  },
  ["category-post-ids"],
  { tags: ["posts"] }
);

function getYoutubeEmbedId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPost(params.id);
  if (!post) notFound();
  const embedId = post.youtubeUrl ? getYoutubeEmbedId(post.youtubeUrl) : null;
  const session = await getServerSession(authOptions);

  const siblingIds = await getCategoryPostIds(post.categoryId);
  const idx = siblingIds.indexOf(post.id);
  const prevId = idx > 0 ? siblingIds[idx - 1] : null;
  const nextId = idx >= 0 && idx < siblingIds.length - 1 ? siblingIds[idx + 1] : null;

  return (
    <article className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-32">
      {prevId && (
        <Link
          href={`/post/${prevId}`}
          aria-label="이전 작품"
          className="fixed left-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/80 font-mono text-xl text-text-muted backdrop-blur-sm transition-colors hover:border-gold hover:text-gold md:left-6"
        >
          ‹
        </Link>
      )}
      {nextId && (
        <Link
          href={`/post/${nextId}`}
          aria-label="다음 작품"
          className="fixed right-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/80 font-mono text-xl text-text-muted backdrop-blur-sm transition-colors hover:border-gold hover:text-gold md:right-6"
        >
          ›
        </Link>
      )}
      <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
        {post.date}
      </span>
      <h1 className="mt-3 font-display text-4xl text-text md:text-5xl">
        {post.title}
      </h1>

      {session && (
        <Link
          href={`/admin/edit/${post.id}`}
          className="mt-4 inline-flex items-center gap-1 rounded-lg border border-line px-4 py-2 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:border-gold hover:text-gold"
        >
          이 글 수정하기
        </Link>
      )}

      {post.blocks ? (
        // New block-based posts.
        <PostBlocks blocks={post.blocks} title={post.title} />
      ) : (
        // Legacy posts: single youtube embed + text + image gallery.
        <>
          {embedId && (
            <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-xl border border-line">
              <iframe
                src={`https://www.youtube.com/embed/${embedId}`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )}

          <div className="mt-10 space-y-6 font-body text-base leading-relaxed text-text-muted">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <PostGallery images={post.images} title={post.title} />
        </>
      )}
    </article>
  );
}
