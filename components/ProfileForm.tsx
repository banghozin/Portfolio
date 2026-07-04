"use client";

import { useEffect, useState } from "react";
import {
  ProfileSection,
  ProfileSectionType,
  SkillItem,
  SKILL_LABELS,
  asSections,
  emptySection,
} from "@/lib/profile";
import { downscaleImage } from "@/lib/downscaleImage";
import Markdown from "@/components/Markdown";

const SECTION_OPTIONS: { type: ProfileSectionType; label: string }[] = [
  { type: "text", label: "텍스트" },
  { type: "skills", label: "활용능력" },
];

export default function ProfileForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        setImageUrl(p.imageUrl ?? "");
        setHeadline(p.headline ?? "");
        setSections(asSections(p.sections));
        setLoading(false);
      });
  }, []);

  function updateSection(i: number, patch: Partial<ProfileSection>) {
    setSections((prev) =>
      prev.map((s, idx) =>
        idx === i ? ({ ...s, ...patch } as ProfileSection) : s
      )
    );
    setStatus("idle");
  }
  function removeSection(i: number) {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
  }
  function moveSection(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function addSection(type: ProfileSectionType) {
    setSections((prev) => [...prev, emptySection(type)]);
    setAddOpen(false);
  }

  function setItems(si: number, items: SkillItem[]) {
    updateSection(si, { items } as Partial<ProfileSection>);
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const resized = await downscaleImage(file);
      const form = new FormData();
      form.append("file", resized);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: res.statusText }));
        throw new Error(error || "업로드 실패");
      }
      const { url } = await res.json();
      setImageUrl(url);
      setStatus("idle");
    } catch (err) {
      alert(`업로드 실패: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, headline, sections }),
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
        Profile
      </p>
      <h1 className="mt-3 font-display text-3xl text-text">프로필 편집</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <Field label="프로필 사진">
          <div className="space-y-2">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="max-h-48 rounded-lg border border-line object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadPhoto(f);
              }}
              className="w-full font-body text-xs text-text-muted"
            />
            {uploading && (
              <p className="font-mono text-xs text-text-muted">업로드 중...</p>
            )}
          </div>
        </Field>

        <Field label="헤드라인 (예: Designer)">
          <input
            value={headline}
            onChange={(e) => {
              setHeadline(e.target.value);
              setStatus("idle");
            }}
            className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-body text-text"
            placeholder="Designer"
          />
        </Field>

        <Field label="섹션">
          <div className="space-y-4">
            {sections.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-line bg-surface/50 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                    {SECTION_OPTIONS.find((o) => o.type === s.type)?.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconBtn
                      label="위로"
                      disabled={i === 0}
                      onClick={() => moveSection(i, -1)}
                    >
                      ↑
                    </IconBtn>
                    <IconBtn
                      label="아래로"
                      disabled={i === sections.length - 1}
                      onClick={() => moveSection(i, 1)}
                    >
                      ↓
                    </IconBtn>
                    <IconBtn label="삭제" onClick={() => removeSection(i)}>
                      ✕
                    </IconBtn>
                  </div>
                </div>

                <input
                  value={s.title}
                  onChange={(e) => updateSection(i, { title: e.target.value })}
                  placeholder="제목 (예: 학력, 자격증, 이름, 연락처)"
                  className="mb-2 w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
                />

                {s.type === "text" && (
                  <div className="space-y-2">
                    <textarea
                      value={s.value}
                      onChange={(e) =>
                        updateSection(i, { value: e.target.value })
                      }
                      rows={5}
                      placeholder="마크다운 사용 가능: **굵게**, 줄바꿈으로 여러 줄"
                      className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
                    />
                    {s.value.trim() && (
                      <div className="rounded-lg border border-line bg-bg/40 p-3">
                        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                          미리보기
                        </p>
                        <Markdown>{s.value}</Markdown>
                      </div>
                    )}
                  </div>
                )}

                {s.type === "skills" && (
                  <SkillsEditor
                    items={s.items}
                    onChange={(items) => setItems(i, items)}
                  />
                )}
              </div>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setAddOpen((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 font-body text-sm text-text-muted transition-colors hover:border-gold hover:text-gold"
              >
                + 섹션 추가
              </button>
              {addOpen && (
                <div className="absolute left-1/2 z-10 mt-2 flex -translate-x-1/2 gap-1 rounded-lg border border-line bg-surface p-1 shadow-lg">
                  {SECTION_OPTIONS.map((o) => (
                    <button
                      key={o.type}
                      type="button"
                      onClick={() => addSection(o.type)}
                      className="rounded-md px-3 py-2 font-body text-sm text-text transition-colors hover:bg-surface-hover hover:text-gold"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Field>

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

function SkillsEditor({
  items,
  onChange,
}: {
  items: SkillItem[];
  onChange: (items: SkillItem[]) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <input
            value={it.name}
            onChange={(e) =>
              onChange(
                items.map((x, idx) =>
                  idx === i ? { ...x, name: e.target.value } : x
                )
              )
            }
            placeholder="프로그램/능력"
            className="min-w-[120px] flex-1 rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
          />
          <LevelPicker
            level={it.level}
            onChange={(level) =>
              onChange(items.map((x, idx) => (idx === i ? { ...x, level } : x)))
            }
          />
          <button
            type="button"
            aria-label="삭제"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="font-mono text-xs text-text-muted hover:text-gold"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { name: "", level: 3 }])}
        className="font-mono text-xs text-text-muted transition-colors hover:text-gold"
      >
        + 능력 추가
      </button>
    </div>
  );
}

function LevelPicker({
  level,
  onChange,
}: {
  level: number;
  onChange: (level: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {SKILL_LABELS.map((label, i) => {
        const lv = i + 1;
        const active = lv === level;
        return (
          <button
            key={lv}
            type="button"
            onClick={() => onChange(lv)}
            className={`rounded-md px-2 py-1.5 font-mono text-xs transition-colors ${
              active
                ? "bg-gold text-bg"
                : "bg-surface-hover text-text-muted hover:text-gold"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-gold disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
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
