// Content blocks for a post. Stored as a JSON array on Post.blocks and
// rendered in order on the post page.
export type Block =
  | { type: "text"; value: string } // markdown
  | { type: "image"; url: string }
  | { type: "video"; url: string } // youtube url
  | { type: "link"; url: string; title: string; subtitle?: string };

export type BlockType = Block["type"];

// Extract a YouTube video id from common url shapes.
export function youtubeEmbedId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

// Plain-text excerpt/thumbnail helpers used when saving a post.
export function plainTextFromBlocks(blocks: Block[]): string {
  return blocks
    .filter((b): b is Extract<Block, { type: "text" }> => b.type === "text")
    .map((b) => b.value)
    .join("\n\n")
    .trim();
}

export function firstImageUrl(blocks: Block[]): string | null {
  const img = blocks.find(
    (b): b is Extract<Block, { type: "image" }> => b.type === "image"
  );
  return img ? img.url : null;
}

// Normalize an unknown JSON value into a Block[] (defensive on read).
export function asBlocks(value: unknown): Block[] | null {
  if (!Array.isArray(value)) return null;
  const ok = value.filter(
    (b): b is Block =>
      !!b &&
      typeof b === "object" &&
      ["text", "image", "video", "link"].includes((b as Block).type)
  );
  return ok.length ? ok : null;
}

// Convert a legacy post (content + images + youtubeUrl) into blocks so old
// posts can be edited in the block editor.
export function legacyToBlocks(post: {
  content?: string | null;
  images?: string[] | null;
  youtubeUrl?: string | null;
}): Block[] {
  const blocks: Block[] = [];
  if (post.youtubeUrl) blocks.push({ type: "video", url: post.youtubeUrl });
  if (post.content && post.content.trim())
    blocks.push({ type: "text", value: post.content });
  for (const url of post.images ?? []) blocks.push({ type: "image", url });
  return blocks;
}
