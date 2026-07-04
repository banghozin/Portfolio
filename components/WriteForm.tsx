"use client";

import { useEffect, useState } from "react";
import { Block, resolveThumbnail } from "@/lib/blocks";
import BlockEditor from "@/components/BlockEditor";

type Category = { slug: string; label: string };

export default function WriteForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (data.length > 0) setCategory(data[0].slug);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, blocks, thumbnail }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    const post = await res.json();
    setStatus("saved");
    window.location.href = `/post/${post.id}`;
  }

  return (
    <section className="mx-auto min-h-screen max-w-2xl px-6 pb-24 pt-32">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">
        New Post
      </p>
      <h1 className="mt-3 font-display text-3xl text-text">새 글 작성</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <Field label="카테고리">
          {categories.length === 0 ? (
            <p className="font-body text-sm text-text-muted">
              카테고리가 없어요.{" "}
              <a href="/admin/categories" className="text-gold underline">
                먼저 카테고리를 추가해주세요.
              </a>
            </p>
          ) : (
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
          )}
        </Field>

        <Field label="제목">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
            placeholder="프로젝트 제목"
          />
        </Field>

        <Field label="내용">
          <BlockEditor
            blocks={blocks}
            onChange={setBlocks}
            thumbnail={resolveThumbnail(blocks, thumbnail)}
            onThumbnailChange={setThumbnail}
          />
        </Field>

        <button
          type="submit"
          disabled={status === "saving" || categories.length === 0}
          className="rounded-lg bg-gold px-6 py-3 font-body text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {status === "saving" ? "게시하는 중..." : "게시하기"}
        </button>
        {status === "error" && (
          <p className="font-body text-sm text-gold">
            게시하지 못했어요. 다시 시도해주세요.
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
