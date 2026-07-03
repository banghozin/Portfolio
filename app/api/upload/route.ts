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
    // Production (Vercel): store in Vercel Blob. Vercel Blob storage must be
    // added to the project (Storage tab) for BLOB_READ_WRITE_TOKEN to exist.
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(file.name, file, { access: "public" });
      return NextResponse.json({ url: blob.url });
    }

    // On Vercel with no Blob token configured, writing to the local
    // filesystem would silently "succeed" but the file won't actually be
    // servable afterward (serverless filesystem isn't persistent/shared).
    // Fail clearly instead of producing a broken image.
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "이미지 저장소가 아직 연결되지 않았어요. Vercel 프로젝트의 Storage 탭에서 Blob을 추가해주세요.",
        },
        { status: 500 }
      );
    }

    // Local dev fallback only: no Blob token configured yet, so write
    // straight to /public/uploads instead of failing.
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
