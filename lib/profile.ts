// Profile/resume sections. Stored as JSON on Profile.sections, editable from
// /admin/profile and rendered on /profile.
export type SkillItem = { name: string; level: number }; // level 1..5

export type ProfileSection =
  | { type: "text"; title: string; value: string } // markdown body
  | { type: "skills"; title: string; items: SkillItem[] };

export type ProfileSectionType = ProfileSection["type"];

// level 1..5 → label
export const SKILL_LABELS = ["하", "중하", "중", "중상", "상"];

export function skillLabel(level: number): string {
  return SKILL_LABELS[Math.min(5, Math.max(1, level)) - 1];
}

export function emptySection(type: ProfileSectionType): ProfileSection {
  return type === "text"
    ? { type: "text", title: "", value: "" }
    : { type: "skills", title: "", items: [] };
}

// Defensive normalize of unknown JSON into ProfileSection[].
export function asSections(value: unknown): ProfileSection[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (s): s is ProfileSection =>
      !!s &&
      typeof s === "object" &&
      ["text", "skills"].includes((s as ProfileSection).type)
  );
}
