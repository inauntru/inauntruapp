import { type AdminUser } from "./mockData";

export function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/ă/g, "a").replace(/â/g, "a").replace(/î/g, "i")
    .replace(/[șş]/g, "s").replace(/[țţ]/g, "t")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getFacilitators(users: AdminUser[]) {
  return users
    .filter((u) => u.role === "facilitator" && u.facilitatorProfile)
    .map((u) => {
      const fp = u.facilitatorProfile!;
      return {
        id: u.id,
        slug: toSlug(u.name),
        name: u.name,
        title: fp.title,
        specialty: fp.title,
        bio: fp.bio,
        photo: fp.photo || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
        image: fp.photo || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
        tags: fp.specialties,
        specialties: fp.specialties,
        rating: 5.0,
        reviews: 0,
        sessions: 0,
        practiceDuration: "—",
        certifications: [] as string[],
      };
    });
}
