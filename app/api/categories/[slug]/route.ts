import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { _count: { select: { posts: true } } },
  });

  if (!category) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (category._count.posts > 0) {
    return NextResponse.json(
      {
        error:
          "이 카테고리에는 아직 게시글이 있어요. 먼저 게시글을 옮기거나 삭제해주세요.",
      },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { slug: params.slug } });
  return NextResponse.json({ ok: true });
}
