"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-line px-5 py-3 font-body text-sm text-text-muted transition-colors hover:border-gold hover:text-gold"
    >
      로그아웃
    </button>
  );
}
