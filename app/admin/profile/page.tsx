import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin");
  return <ProfileForm />;
}
