"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { slug: string; label: string };

export default function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/posts/${params.id}`).then((r) => r.json()),
    ]).then(([cats, post]) => {
      setCategories(cats);
      setTitle(post.title ?? "");
      setContent(post.content ?? "");
      setCategory(post.categoryId ? post.category?.slug ?? cats[0]?.slug : cats[0]?.slug);
      setYoutubeUrl(post.youtubeUrl ?? "");
      setImages(post.images ?? []);
      setThumbnail(post.thumbnail ?? null);
      setLoading(false);
    });
  }, [params.id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const uploaded: string[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const { url } = await res.json();
        uploaded.push(url);
      } else {
        failed.push(file.name);
      }
    }
    setImages((prev) => [...prev, ...uploaded]);
    if (!thumbnail && uploaded.length > 0) setThumbnail(uploaded[0]);
    if (failed.length > 0) setUploadError(`업로드 실패: ${failed.join(", ")}`);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch(`/api/posts/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        category,
        youtubeUrl,
        images,
        thumbnail,
      }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    router.push(`/post/${params.id}`);
  }

  async function handleDelete() {
    if (!confirm("이 게시글을 정말 삭제할까요? 되돌릴 수 없어요.")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push(`/category/${category}`);
    } else {
      setDeleting(false);
      alert("삭제하지 못했어요.");
    }
  }

  if (loading) {
    return (
      <section className="mx-auto min-h-screen max-w-2xl px-6 pb-24 pt-32">
        <p className="font-body text-sm text-text-muted">불러오는 중...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto min-h-screen max-w-2xl px-6 pb-24 pt-32">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">
        Edit Post
      </p>
      <h1 className="mt-3 font-display text-3xl text-text">글 수정</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <Field label="카테고리">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="제목">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
          />
        </Field>

        <Field label="본문">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
          />
        </Field>

        <Field label="이미지">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="w-full font-body text-sm text-text-muted"
          />
          {uploading && (
            <p className="mt-2 font-mono text-xs text-text-muted">
              업로드 중...
            </p>
          )}
          {uploadError && (
            <p className="mt-2 font-body text-xs text-gold">{uploadError}</p>
          )}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {images.map((src) => (
                <div key={src} className="relative">
                  <button
                    type="button"
                    onClick={() => setThumbnail(src)}
                    className={`relative aspect-square w-full overflow-hidden rounded-lg border-2 ${
                      thumbnail === src ? "border-gold" : "border-line"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {thumbnail === src && (
                      <span className="absolute bottom-1 right-1 rounded bg-gold px-1.5 py-0.5 font-mono text-[10px] text-bg">
                        썸네일
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((i) => i !== src))
                    }
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-bg font-mono text-xs text-text-muted hover:text-gold"
                    aria-label="이미지 제거"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Field>

        <Field label="유튜브 링크 (선택)">
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Field>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-lg bg-gold px-6 py-3 font-body text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {status === "saving" ? "저장하는 중..." : "저장하기"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-line px-6 py-3 font-body text-sm text-text-muted transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
          >
            {deleting ? "삭제하는 중..." : "게시글 삭제"}
          </button>
        </div>
        {status === "error" && (
          <p className="font-body text-sm text-gold">
            저장하지 못했어요. 다시 시도해주세요.
          </p>
        )}
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
