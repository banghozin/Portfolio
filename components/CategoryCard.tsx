"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Category = {
  slug: string;
  label: string;
  ko: string;
  desc: string;
};

export default function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link
        href={`/category/${category.slug}`}
        className="group relative block overflow-hidden rounded-xl border border-line bg-surface/60 p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-surface-hover"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/0 blur-2xl transition-all duration-500 group-hover:bg-gold/10" />
        <span className="font-mono text-xs uppercase tracking-widest text-text-muted">
          {category.label}
        </span>
        <h2 className="mt-2 font-display text-2xl text-text">
          {category.ko}
        </h2>
        <p className="mt-2 font-body text-sm text-text-muted">
          {category.desc}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          살펴보기 →
        </span>
      </Link>
    </motion.div>
  );
}
