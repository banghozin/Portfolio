import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");

  const posts = await prisma.post.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.title || !body.content || !body.category) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      images: body.images ?? [],
      thumbnail: body.thumbnail ?? null,
      youtubeUrl: body.youtubeUrl || null,
      category: { connect: { slug: body.category } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
