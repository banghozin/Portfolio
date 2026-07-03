import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }

  try {
    // Production (Vercel): store in Vercel Blob.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    }

    // Local dev fallback: no Blob token configured yet, so write straight
    // to /public/uploads instead of failing silently. Swap this out once
    // BLOB_READ_WRITE_TOKEN is set (e.g. via `vercel env pull`).
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, safeName), bytes);

    return NextResponse.json({ url: `/uploads/${safeName}` });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "업로드에 실패했어요. 서버 로그를 확인해주세요." },
      { status: 500 }
    );
  }
}
