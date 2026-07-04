import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Always fresh: the admin form reads this right after saving.
export const dynamic = "force-dynamic";

const SITE_ID = "site";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: SITE_ID },
  });
  return NextResponse.json({
    heroTitle: settings?.heroTitle ?? "",
    heroSubtitle: settings?.heroSubtitle ?? "",
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const heroTitle = String(body.heroTitle ?? "");
  const heroSubtitle = String(body.heroSubtitle ?? "");

  const settings = await prisma.siteSettings.upsert({
    where: { id: SITE_ID },
    create: { id: SITE_ID, heroTitle, heroSubtitle },
    update: { heroTitle, heroSubtitle },
  });

  revalidateTag("settings");
  return NextResponse.json(settings);
}
