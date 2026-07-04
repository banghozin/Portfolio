import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Reorder categories: body { slugs: string[] } sets order = index for each.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const slugs: string[] = Array.isArray(body.slugs) ? body.slugs : [];
  if (!slugs.length) {
    return NextResponse.json({ error: "no slugs" }, { status: 400 });
  }

  await prisma.$transaction(
    slugs.map((slug, i) =>
      prisma.category.update({ where: { slug }, data: { order: i } })
    )
  );

  revalidateTag("categories");
  return NextResponse.json({ ok: true });
}
