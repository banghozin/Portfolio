import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PostGallery from "@/components/PostGallery";

async function getPost(id: string) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return null;
  return {
    id: post.id,
    title: post.title,
    date: `${post.createdAt.getFullYear()}.${String(
      post.createdAt.getMonth() + 1
    ).padStart(2, "0")}`,
    content: post.content,
    images: post.images,
    youtubeUrl: post.youtubeUrl ?? "",
  };
}

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

  return (
    <article className="mx-auto min-h-screen max-w-3xl px-6 pb-24 pt-32">
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
    </article>
  );
}
