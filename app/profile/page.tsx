import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { asSections } from "@/lib/profile";
import ProfileView from "@/components/ProfileView";

// Cached; busted when the profile is saved via revalidateTag("profile").
const getProfile = unstable_cache(
  async () => {
    const p = await prisma.profile.findUnique({ where: { id: "profile" } });
    return {
      imageUrl: p?.imageUrl ?? "",
      headline: p?.headline ?? "",
      sections: asSections(p?.sections),
    };
  },
  ["profile"],
  { tags: ["profile"] }
);

export default async function ProfilePage() {
  const profile = await getProfile();
  return (
    <ProfileView
      imageUrl={profile.imageUrl}
      headline={profile.headline}
      sections={profile.sections}
    />
  );
}
