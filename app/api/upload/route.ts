import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

// Client-side upload flow: the browser uploads the file straight to Vercel
// Blob and only asks this route for a short-lived token. This bypasses the
// 4.5MB request-body limit that Vercel serverless functions impose, so large
// phone photos upload fine. BLOB_READ_WRITE_TOKEN must be set on the project
// (Storage tab → Connect Blob store) for token generation to work.
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

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only the signed-in admin may obtain an upload token.
        const session = await getServerSession(authOptions);
        if (!session) throw new Error("로그인이 필요합니다.");
        return { addRandomSuffix: true };
      },
      // Required by the API. Nothing to persist here — the returned blob URL
      // is saved with the post when the form is submitted.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "업로드에 실패했어요." },
      { status: 400 }
    );
  }
}
