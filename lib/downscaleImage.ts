// Client-side image downscaling. Runs in the browser before upload so large
// phone photos comfortably fit under Vercel's 4.5MB serverless body limit and
// portfolio pages load faster. Preserves PNG (keeps transparency); everything
// else is re-encoded to JPEG. Falls back to the original file if the browser
// can't decode it (e.g. HEIC outside Safari).
export async function downscaleImage(
  file: File,
  maxDim = 2000,
  maxBytes = 4_000_000
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const biggest = Math.max(bitmap.width, bitmap.height);

    // Already small enough — keep the original to avoid quality loss.
    if (biggest <= maxDim && file.size <= maxBytes) {
      bitmap.close?.();
      return file;
    }

    const scale = Math.min(1, maxDim / biggest);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, type, type === "image/jpeg" ? 0.85 : undefined)
    );
    if (!blob) return file;

    const name =
      type === "image/png"
        ? file.name
        : file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type });
  } catch {
    return file;
  }
}
