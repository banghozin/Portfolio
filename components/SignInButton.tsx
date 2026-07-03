"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="mt-8 flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-3 font-body text-sm text-text transition-colors hover:bg-surface-hover"
    >
      Google 계정으로 로그인
    </button>
  );
}
