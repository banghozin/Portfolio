import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

// TEMP diagnostic: reports which blob credentials exist at runtime (booleans
// only, no secret values). Remove once upload is confirmed working.
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV ?? null,
    hasStoreId: !!process.env.BLOB_STORE_ID,
    hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
    hasReadWriteToken: !!process.env.BLOB_READ_WRITE_TOKEN,
  });
}

// Server-side upload to Vercel Blob. The client downscales images first so
// they fit under the 4.5MB serverless body limit. addRandomSuffix avoids
// filename collisions (and handles unicode/space filenames safely).
export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "업로드에 실패했어요." },
      { status: 500 }
    );
  }
}
