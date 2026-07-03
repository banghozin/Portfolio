import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.label || !body.slug) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { slug: body.slug, label: body.label, order: count },
  });
  revalidateTag("categories");
  return NextResponse.json(category, { status: 201 });
}
