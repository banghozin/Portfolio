import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInButton from "@/components/SignInButton";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <section className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-gold">
          Signed in
        </p>
        <h1 className="mt-3 font-display text-3xl text-text">
          {session.user?.name}님, 환영합니다.
        </h1>
        <div className="mt-8 flex gap-3">
          <Link
            href="/admin/write"
            className="rounded-lg bg-gold px-5 py-3 font-body text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
          >
            새 글 작성하기
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-line px-5 py-3 font-body text-sm text-text transition-colors hover:bg-surface-hover"
          >
            카테고리 관리
          </Link>
          <SignOutButton />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">
        Admin
      </p>
      <h1 className="mt-3 font-display text-3xl text-text">
        관리자만 접근할 수 있습니다.
      </h1>
      <p className="mt-3 font-body text-sm text-text-muted">
        지정된 구글 계정으로만 로그인할 수 있어요. 다른 계정으로 로그인을
        시도하면 자동으로 거부됩니다.
      </p>
      <SignInButton />
    </section>
  );
}
