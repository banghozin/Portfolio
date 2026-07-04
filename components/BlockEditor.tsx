"use client";

import { useEffect, useState } from "react";
import { Block, BlockType, youtubeEmbedId } from "@/lib/blocks";
import { downscaleImage } from "@/lib/downscaleImage";
import Markdown from "@/components/Markdown";
import LinkCard from "@/components/LinkCard";

const ADD_OPTIONS: { type: BlockType; label: string }[] = [
  { type: "text", label: "텍스트" },
  { type: "image", label: "이미지" },
  { type: "video", label: "영상" },
  { type: "link", label: "링크 버튼" },
];

function emptyBlock(type: BlockType): Block {
  switch (type) {
    case "text":
      return { type: "text", value: "" };
    case "image":
      return { type: "image", url: "" };
    case "video":
      return { type: "video", url: "" };
    case "link":
      return { type: "link", url: "", title: "", subtitle: "" };
  }
}

export default function BlockEditor({
  blocks,
  onChange,
  thumbnail,
  onThumbnailChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  thumbnail: string | null;
  onThumbnailChange: (url: string) => void;
}) {
  const [uploadingAt, setUploadingAt] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  function update(i: number, patch: Partial<Block>) {
    onChange(
      blocks.map((b, idx) => (idx === i ? ({ ...b, ...patch } as Block) : b))
    );
  }
  function remove(i: number) {
    onChange(blocks.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function add(type: BlockType) {
    onChange([...blocks, emptyBlock(type)]);
    setAddOpen(false);
  }

  async function uploadFile(file: File): Promise<string> {
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
    return url as string;
  }

  // Upload one or more files into image block `i`: the first fills this block,
  // the rest are inserted as new image blocks right after it.
  async function uploadImages(i: number, files: File[]) {
    setUploadingAt(i);
    const urls: string[] = [];
    for (const f of files) {
      try {
        urls.push(await uploadFile(f));
      } catch (err) {
        alert(`업로드 실패: ${(err as Error).message}`);
      }
    }
    setUploadingAt(null);
    if (!urls.length) return;
    onChange(
      blocks.flatMap((b, idx) =>
        idx === i ? urls.map((url) => ({ type: "image", url } as Block)) : [b]
      )
    );
  }

  // Paste an image anywhere on the page (Ctrl/Cmd+V) to append image blocks.
  useEffect(() => {
    async function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const it of Array.from(items)) {
        if (it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) files.push(f);
        }
      }
      if (!files.length) return;
      e.preventDefault();
      const urls: string[] = [];
      for (const f of files) {
        try {
          urls.push(await uploadFile(f));
        } catch (err) {
          alert(`업로드 실패: ${(err as Error).message}`);
        }
      }
      if (urls.length)
        onChange([
          ...blocks,
          ...urls.map((url) => ({ type: "image", url } as Block)),
        ]);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, onChange]);

  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <div
          key={i}
          className="rounded-xl border border-line bg-surface/50 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
              {ADD_OPTIONS.find((o) => o.type === b.type)?.label}
            </span>
            <div className="flex items-center gap-1">
              <IconBtn
                label="위로"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </IconBtn>
              <IconBtn
                label="아래로"
                disabled={i === blocks.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </IconBtn>
              <IconBtn label="삭제" onClick={() => remove(i)}>
                ✕
              </IconBtn>
            </div>
          </div>

          {b.type === "text" && (
            <div className="space-y-2">
              <textarea
                value={b.value}
                onChange={(e) => update(i, { value: e.target.value })}
                rows={5}
                placeholder="마크다운 사용 가능: **굵게**, # 제목, - 목록, [링크](url)"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
              />
              {b.value.trim() && (
                <div className="rounded-lg border border-line bg-bg/40 p-3">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                    미리보기
                  </p>
                  <Markdown>{b.value}</Markdown>
                </div>
              )}
            </div>
          )}

          {b.type === "image" && (
            <div className="space-y-2">
              {b.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.url}
                  alt=""
                  className="max-h-72 w-full rounded-lg object-contain"
                />
              ) : null}
              {b.url && (
                <button
                  type="button"
                  onClick={() => onThumbnailChange(b.url)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                    thumbnail === b.url
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-line text-text-muted hover:border-gold hover:text-gold"
                  }`}
                >
                  {thumbnail === b.url ? "★ 대표 썸네일" : "☆ 썸네일로 지정"}
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const fs = e.target.files;
                  if (fs && fs.length) uploadImages(i, Array.from(fs));
                }}
                className="w-full font-body text-xs text-text-muted"
              />
              <p className="font-mono text-[10px] text-text-muted">
                여러 장 선택 가능 · 이미지 복사 후 Ctrl+V로 붙여넣기도 돼요
              </p>
              {uploadingAt === i && (
                <p className="font-mono text-xs text-text-muted">
                  업로드 중...
                </p>
              )}
            </div>
          )}

          {b.type === "video" && (
            <div className="space-y-2">
              <input
                value={b.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
              />
              {youtubeEmbedId(b.url) ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-line">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeEmbedId(
                      b.url
                    )}`}
                    title="preview"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : b.url ? (
                <p className="font-body text-xs text-gold">
                  유튜브 링크를 인식하지 못했어요.
                </p>
              ) : null}
            </div>
          )}

          {b.type === "link" && (
            <div className="space-y-2">
              <input
                value={b.url}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="연결할 주소 (https://...)"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
              />
              <input
                value={b.title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="제목"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
              />
              <input
                value={b.subtitle ?? ""}
                onChange={(e) => update(i, { subtitle: e.target.value })}
                placeholder="부제목 (선택)"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-body text-sm text-text"
              />
              {(b.title || b.url) && (
                <div className="pt-1">
                  <LinkCard url={b.url} title={b.title} subtitle={b.subtitle} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setAddOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 font-body text-sm text-text-muted transition-colors hover:border-gold hover:text-gold"
        >
          + 블록 추가
        </button>
        {addOpen && (
          <div className="absolute left-1/2 z-10 mt-2 flex -translate-x-1/2 gap-1 rounded-lg border border-line bg-surface p-1 shadow-lg">
            {ADD_OPTIONS.map((o) => (
              <button
                key={o.type}
                type="button"
                onClick={() => add(o.type)}
                className="rounded-md px-3 py-2 font-body text-sm text-text transition-colors hover:bg-surface-hover hover:text-gold"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
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
