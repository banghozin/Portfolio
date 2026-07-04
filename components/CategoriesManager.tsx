"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  slug: string;
  label: string;
};

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function slugify(text: string) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setError(null);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, slug: slugify(label) }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "추가하지 못했어요.");
      return;
    }

    setLabel("");
    load();
  }

  async function handleDelete(slug: string) {
    setError(null);
    const res = await fetch(`/api/categories/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "삭제하지 못했어요.");
      return;
    }
    load();
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= categories.length) return;
    const next = [...categories];
    [next[i], next[j]] = [next[j], next[i]];
    setCategories(next); // optimistic
    await fetch("/api/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: next.map((c) => c.slug) }),
    });
  }

  return (
    <section className="mx-auto min-h-screen max-w-xl px-6 pb-24 pt-32">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">
        Admin
      </p>
      <h1 className="mt-3 font-display text-3xl text-text">카테고리 관리</h1>
      <p className="mt-2 font-body text-sm text-text-muted">
        홈 화면에 표시되는 별자리(카테고리)를 추가하거나 제거해요.
      </p>

      <form onSubmit={handleAdd} className="mt-8 flex gap-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="예: 사진, 일러스트"
          className="flex-1 rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
        />
        <button
          type="submit"
          className="rounded-lg bg-gold px-5 py-3 font-body text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
        >
          추가
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 font-body text-sm text-gold">
          {error}
        </p>
      )}

      <ul className="mt-8 space-y-2">
        {loading && (
          <p className="font-body text-sm text-text-muted">불러오는 중...</p>
        )}
        {!loading && categories.length === 0 && (
          <p className="font-body text-sm text-text-muted">
            아직 카테고리가 없어요.
          </p>
        )}
        {categories.map((c, i) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <span className="font-body text-text">{c.label}</span>
              <span className="ml-2 font-mono text-xs text-text-muted">
                /{c.slug}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="위로"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-gold disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="아래로"
                disabled={i === categories.length - 1}
                onClick={() => move(i, 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-gold disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ↓
              </button>
              <button
                onClick={() => handleDelete(c.slug)}
                className="ml-2 font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-gold"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
