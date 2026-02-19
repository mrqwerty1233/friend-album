export type DemoPhoto = {
  id: string;
  src: string;
  alt: string;
  note?: string;
};

export type DemoAlbum = {
  id: string;
  title: string;
  subtitle?: string;
  cover: string;
  photos: DemoPhoto[];
};

export const SWEET_MESSAGES: string[] = [
  "You make ordinary days feel like magic.",
  "Small moments with you are my favorite.",
  "Your smile is my comfort place.",
  "I’m proud of you—always.",
  "Thank you for being you.",
  "If home had a feeling, it would be you.",
  "Somehow you make everything softer.",
  "I’m lucky in a quiet, constant way.",
  "You’re the best part of the day.",
  "Even on tough days—still you.",
];

// Replace these image paths later with your real ones or Supabase URLs.
// For now, put sample images in /public/demo/ (or change these paths).
export const DEMO_ALBUMS: DemoAlbum[] = [
  {
    id: "a1",
    title: "Us",
    subtitle: "Little snapshots of big love",
    cover: "/demo/cover-1.jpg",
    photos: Array.from({ length: 30 }).map((_, i) => ({
      id: `a1-p${i + 1}`,
      src: `/demo/us-${(i % 10) + 1}.jpg`,
      alt: `Us photo ${i + 1}`,
      note: i % 4 === 0 ? "I love this moment." : undefined,
    })),
  },
  {
    id: "a2",
    title: "Family",
    subtitle: "The warmest people",
    cover: "/demo/cover-2.jpg",
    photos: Array.from({ length: 18 }).map((_, i) => ({
      id: `a2-p${i + 1}`,
      src: `/demo/fam-${(i % 6) + 1}.jpg`,
      alt: `Family photo ${i + 1}`,
      note: i % 5 === 0 ? "This one makes me smile." : undefined,
    })),
  },
  {
    id: "a3",
    title: "Random Smiles",
    subtitle: "Tiny joys, saved forever",
    cover: "/demo/cover-3.jpg",
    photos: Array.from({ length: 22 }).map((_, i) => ({
      id: `a3-p${i + 1}`,
      src: `/demo/smile-${(i % 7) + 1}.jpg`,
      alt: `Random smile ${i + 1}`,
    })),
  },
];
