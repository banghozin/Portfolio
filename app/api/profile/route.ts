import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { asSections } from "@/lib/profile";

// Always fresh: the admin form reads this right after saving.
export const dynamic = "force-dynamic";

const PROFILE_ID = "profile";

export async function GET() {
  const profile = await prisma.profile.findUnique({
    where: { id: PROFILE_ID },
  });
  return NextResponse.json({
    imageUrl: profile?.imageUrl ?? "",
    headline: profile?.headline ?? "",
    sections: asSections(profile?.sections),
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const imageUrl = String(body.imageUrl ?? "");
  const headline = String(body.headline ?? "");
  const sections = asSections(body.sections);

  const profile = await prisma.profile.upsert({
    where: { id: PROFILE_ID },
    create: { id: PROFILE_ID, imageUrl, headline, sections },
    update: { imageUrl, headline, sections },
  });

  revalidateTag("profile");
  return NextResponse.json(profile);
}
