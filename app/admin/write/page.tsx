import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import WriteForm from "@/components/WriteForm";

// Server-side auth check — same pattern app/admin/page.tsx already uses
// successfully in production. Avoids Edge middleware's JWT decoding,
// which behaved unreliably behind Vercel's proxy.
export default async function WritePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin");
  return <WriteForm />;
}
