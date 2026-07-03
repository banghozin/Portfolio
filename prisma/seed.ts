import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { slug: "design", label: "Design" },
  { slug: "video", label: "Video" },
  { slug: "ai", label: "AI" },
  { slug: "web", label: "Web" },
];

async function main() {
  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const c = DEFAULT_CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, order: i },
    });
  }
  console.log("Seeded default categories.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
