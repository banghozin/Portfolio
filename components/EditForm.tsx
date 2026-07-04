"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Block, asBlocks, legacyToBlocks } from "@/lib/blocks";
import BlockEditor from "@/components/BlockEditor";

type Category = { slug: string; label: string };

export default function EditForm({ id }: { id: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/posts/${id}`).then((r) => r.json()),
    ]).then(([cats, post]) => {
      setCategories(cats);
      setTitle(post.title ?? "");
      setCategory(
        post.categoryId ? post.category?.slug ?? cats[0]?.slug : cats[0]?.slug
      );
      // Prefer stored blocks; otherwise convert a legacy post into blocks.
      setBlocks(asBlocks(post.blocks) ?? legacyToBlocks(post));
      setLoading(false);
    });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, blocks }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    router.push(`/post/${id}`);
  }

  async function handleDelete() {
    if (!confirm("이 게시글을 정말 삭제할까요? 되돌릴 수 없어요.")) return;
    setDeleting(true);
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
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

        <Field label="내용">
          <BlockEditor blocks={blocks} onChange={setBlocks} />
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
