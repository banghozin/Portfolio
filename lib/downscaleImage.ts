// Client-side image downscaling. Runs in the browser before upload so images
// comfortably fit under Vercel's 4.5MB serverless body limit and portfolio
// pages load fast.
//
// - Small images (already under the byte cap and not huge) are kept as-is,
//   preserving original format/quality (e.g. transparent PNG logos).
// - Larger images are re-encoded to JPEG and shrunk iteratively until they
//   fit the byte cap. PNG can't be quality-compressed, so big PNGs become
//   JPEG (transparent areas flattened onto white). This is fine for the
//   large photos/artwork that would otherwise blow the limit.
// - Falls back to the original file if the browser can't decode it.
export async function downscaleImage(
  file: File,
  maxBytes = 3_800_000
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const biggest = Math.max(bitmap.width, bitmap.height);

    // Already small enough — keep the original (preserves PNG transparency).
    if (file.size <= maxBytes && biggest <= 2400) {
      bitmap.close?.();
      return file;
    }

    let dim = 2000;
    let quality = 0.85;
    for (let attempt = 0; attempt < 6; attempt++) {
      const scale = Math.min(1, dim / biggest);
      const w = Math.round(bitmap.width * scale);
      const h = Math.round(bitmap.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close?.();
        return file;
      }
      // White backdrop so transparent PNG -> JPEG doesn't turn black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bitmap, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (blob && blob.size <= maxBytes) {
        bitmap.close?.();
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
      }

      // Still too big — shrink dimensions and quality, try again.
      dim = Math.round(dim * 0.8);
      quality = Math.max(0.5, quality - 0.1);
    }

    bitmap.close?.();
    return file;
  } catch {
    return file;
  }
}
