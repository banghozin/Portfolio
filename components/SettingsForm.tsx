"use client";

import { useEffect, useState } from "react";

export default function SettingsForm() {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setHeroTitle(s.heroTitle ?? "");
        setHeroSubtitle(s.heroSubtitle ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroTitle, heroSubtitle }),
    });
    setStatus(res.ok ? "saved" : "error");
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
        Settings
      </p>
      <h1 className="mt-3 font-display text-3xl text-text">홈 화면 문구</h1>
      <p className="mt-3 font-body text-sm text-text-muted">
        홈 첫 화면에 크게 보이는 제목과 그 아래 문구를 여기서 바꿀 수 있어요.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-text-muted">
            제목 (예: 이름)
          </label>
          <input
            value={heroTitle}
            onChange={(e) => {
              setHeroTitle(e.target.value);
              setStatus("idle");
            }}
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
            placeholder="방호진"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-text-muted">
            아래 문구
          </label>
          <input
            value={heroSubtitle}
            onChange={(e) => {
              setHeroSubtitle(e.target.value);
              setStatus("idle");
            }}
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
            placeholder="포트폴리오 사이트"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-lg bg-gold px-6 py-3 font-body text-sm font-medium text-bg transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {status === "saving" ? "저장하는 중..." : "저장하기"}
          </button>
          {status === "saved" && (
            <span className="font-body text-sm text-text-muted">
              저장됐어요.
            </span>
          )}
          {status === "error" && (
            <span className="font-body text-sm text-gold">
              저장하지 못했어요.
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
