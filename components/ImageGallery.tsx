"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight")
        setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) =>
          i === null ? i : (i - 1 + images.length) % images.length
        );
    };
    window.addEventListener("keydown", handleKey);

    // lock background scroll while the lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line"
            aria-label={`${title} 이미지 ${i + 1} 크게 보기`}
          >
            <Image
              src={src}
              alt={`${title} 이미지 ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 backdrop-blur-sm"
            onClick={() => setOpenIndex(null)}
          >
            <button
              onClick={() => setOpenIndex(null)}
              aria-label="닫기"
              className="absolute right-5 top-5 font-mono text-sm text-text-muted transition-colors hover:text-gold"
            >
              닫기 ✕
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) =>
                      i === null ? i : (i - 1 + images.length) % images.length
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
                    setOpenIndex((i) =>
                      i === null ? i : (i + 1) % images.length
                    );
                  }}
                  aria-label="다음 이미지"
                  className="absolute right-4 font-mono text-2xl text-text-muted transition-colors hover:text-gold md:right-8"
                >
                  ›
                </button>
              </>
            )}

            <motion.div
              key={openIndex}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-6 h-[80vh] w-full max-w-4xl"
            >
              <Image
                src={images[openIndex]}
                alt={`${title} 이미지 ${openIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
