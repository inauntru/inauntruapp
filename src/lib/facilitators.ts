export interface FacilitatorData {
  id: number;
  slug: string;
  name: string;
  specialty: string;
  bio: string;
  image: string;
  rating: number;
  sessions: number;
  tags: string[];
}

export const FACILITATORS_DATA: FacilitatorData[] = [
  {
    id: 1,
    slug: "ana-ionescu",
    name: "Ana Ionescu",
    specialty: "Terapie Somatică",
    bio: "Facilitator certificat cu 8 ani experiență",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    rating: 4.9,
    sessions: 320,
    tags: ["Anxietate", "Traumă", "Respirație"],
  },
  {
    id: 2,
    slug: "maria-constantin",
    name: "Maria Constantin",
    specialty: "Reglare Nervoasă",
    bio: "Specialist în tehnici somato-senzoriale",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    rating: 4.8,
    sessions: 280,
    tags: ["Stres", "Somn", "Corp"],
  },
  {
    id: 3,
    slug: "mihai-popescu",
    name: "Mihai Popescu",
    specialty: "Mindfulness Somatic",
    bio: "Terapeut somatic și instructor de meditație",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    rating: 4.9,
    sessions: 410,
    tags: ["Meditație", "Energie", "Claritate"],
  },
  {
    id: 4,
    slug: "elena-dumitrescu",
    name: "Elena Dumitrescu",
    specialty: "Traumă & Corp",
    bio: "Psiholog și facilitator de terapie somatică",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    rating: 5.0,
    sessions: 195,
    tags: ["Traumă", "Burnout", "Reglare"],
  },
];
