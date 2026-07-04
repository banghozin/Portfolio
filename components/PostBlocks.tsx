"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Block, youtubeEmbedId } from "@/lib/blocks";
import Markdown from "@/components/Markdown";
import LinkCard from "@/components/LinkCard";

// Renders a post's content blocks in order. Images are full content-width and
// open in a lightbox that cycles through all image blocks.
export default function PostBlocks({
  blocks,
  title,
}: {
  blocks: Block[];
  title: string;
}) {
  const imageUrls = blocks
    .filter((b): b is Extract<Block, { type: "image" }> => b.type === "image")
    .map((b) => b.url);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight")
        setOpenIndex((i) => (i === null ? i : (i + 1) % imageUrls.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) =>
          i === null ? i : (i - 1 + imageUrls.length) % imageUrls.length
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, imageUrls.length]);

  return (
    <div className="mt-10 space-y-8">
      {blocks.map((b, i) => {
        if (b.type === "text") {
          return <Markdown key={i}>{b.value}</Markdown>;
        }
        if (b.type === "image") {
          const idx = imageUrls.indexOf(b.url);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(idx)}
              className="block w-full overflow-hidden rounded-xl border border-line"
              aria-label={`${title} 이미지 크게 보기`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.url} alt="" className="h-auto w-full" />
            </button>
          );
        }
        if (b.type === "video") {
          const id = youtubeEmbedId(b.url);
          if (!id) return null;
          return (
            <div
              key={i}
              className="relative aspect-video w-full overflow-hidden rounded-xl border border-line"
            >
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          );
        }
        if (b.type === "link") {
          return (
            <LinkCard
              key={i}
              url={b.url}
              title={b.title}
              subtitle={b.subtitle}
            />
          );
        }
        return null;
      })}

      <AnimatePresence>
        {openIndex !== null && imageUrls[openIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 p-6 backdrop-blur-sm"
            onClick={() => setOpenIndex(null)}
          >
            <button
              onClick={() => setOpenIndex(null)}
              aria-label="닫기"
              className="absolute right-6 top-6 font-mono text-sm text-text-muted transition-colors hover:text-gold"
            >
              닫기 ✕
            </button>

            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex(
                      (i) => (i! - 1 + imageUrls.length) % imageUrls.length
                    );
                  }}
                  aria-label="이전 이미지"
                  className="absolute left-4 font-mono text-2xl text-text-muted transition-colors hover:text-gold md:left-8"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) => (i! + 1) % imageUrls.length);
                  }}
                  aria-label="다음 이미지"
                  className="absolute right-4 font-mono text-2xl text-text-muted transition-colors hover:text-gold md:right-8"
                >
                  ›
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative flex h-full max-h-[85vh] w-full max-w-4xl items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrls[openIndex]}
                alt=""
                className="max-h-[85vh] w-auto max-w-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
