import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asBlocks, plainTextFromBlocks, firstImageUrl } from "@/lib/blocks";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const blocks = asBlocks(body.blocks) ?? [];
  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title: body.title,
      content: plainTextFromBlocks(blocks),
      blocks,
      thumbnail: firstImageUrl(blocks),
      ...(body.category && { category: { connect: { slug: body.category } } }),
    },
  });
  revalidateTag("posts");
  return NextResponse.json(post);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  revalidateTag("posts");
  return NextResponse.json({ ok: true });
}
