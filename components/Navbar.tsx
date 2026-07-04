"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { slug: "design", label: "Design" },
  { slug: "video", label: "Video" },
  { slug: "ai", label: "AI" },
  { slug: "web", label: "Web" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-line bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg tracking-tight text-text"
        >
          방호진<span className="text-gold">.</span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden gap-8 md:flex">
          {CATEGORIES.map((c) => (
            <NavLink key={c.slug} href={`/category/${c.slug}`}>
              {c.label}
            </NavLink>
          ))}
          <NavLink href="/profile">Profile</NavLink>
        </nav>

        <div className="hidden md:block">
          <Link
            href="/admin"
            className="font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-gold"
          >
            Admin
          </Link>
        </div>

        {/* mobile toggle */}
        <button
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <motion.span
            animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="h-px w-6 bg-text"
          />
          <motion.span
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            className="h-px w-6 bg-text"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="h-px w-6 bg-text"
          />
        </button>
      </div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="py-2 font-body text-base text-text"
                >
                  {c.label}
                </Link>
              ))}
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="py-2 font-body text-base text-text"
              >
                Profile
              </Link>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="py-2 font-mono text-xs uppercase tracking-widest text-text-muted"
              >
                Admin
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="group relative font-body text-sm text-text">
      {children}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}
