"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

type Post = {
  id: string;
  title: string;
  thumbnail: string;
  excerpt: string;
  date: string;
};

export default function PostCard({
  post,
  categorySlug,
  index,
}: {
  post: Post;
  categorySlug: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
    >
      <Link
        href={`/post/${post.id}`}
        className="group block overflow-hidden rounded-xl border border-line bg-surface transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="p-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
            {post.date}
          </span>
          <h3 className="mt-1 font-display text-lg text-text">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 font-body text-sm text-text-muted">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
