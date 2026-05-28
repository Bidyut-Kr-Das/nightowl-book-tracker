/**
 * Store Mode — Mock Search Data & Functions
 * ──────────────────────────────────────────
 * Provides realistic mock data for the Store search mode.
 * Three separate search functions, each querying its own pool.
 * All entries follow the IBook interface from @/types/interface.
 *
 * These will be replaced with real API calls later.
 */

import { IBook } from "@/types/interface";

/* ═══════════════════════════════════════════════
   Mock Data Pools
   ═══════════════════════════════════════════════ */

const SIMULATED_DELAY = 300; // ms

/**
 * Shared helper — builds a partial IBook with sensible store defaults.
 * Store books have no user progress/status since they aren't in the library.
 */
function storeBook(
  overrides: Partial<IBook> & Pick<IBook, "id" | "title" | "coverImage" | "authors" | "genres">,
): IBook {
  return {
    // Defaults
    hardcoverId: null,
    subtitle: null,
    slug: null,
    description: null,
    headline: null,
    releaseDate: null,
    pages: null,
    mood: [],
    averageRating: null,
    ratingsCount: 0,
    reviewsCount: 0,
    tags: [],
    series: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    addedAt: new Date(),
    // Store books aren't in user library
    progress: null,
    status: null,
    // Caller overrides
    ...overrides,
  } as IBook;
}

/* ─────────────────────────────────────────────
   Pool 1 — Search by Name (diverse titles)
   ───────────────────────────────────────────── */
const namePool: IBook[] = [
  storeBook({
    id: 9001,
    title: "The Midnight Library",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
    authors: [{ name: "Matt Haig", image: null, hardcoverId: null }],
    genres: ["Fiction", "Fantasy", "Contemporary"],
    description:
      "Between life and death there is a library, and within that library, the shelves go on forever.",
    pages: 288,
    averageRating: 4.0,
    ratingsCount: 1200000,
    series: null,
  }),
  storeBook({
    id: 9002,
    title: "Klara and the Sun",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1603206535i/54120408.jpg",
    authors: [{ name: "Kazuo Ishiguro", image: null, hardcoverId: null }],
    genres: ["Fiction", "Science Fiction", "Literary Fiction"],
    description:
      "Klara is an Artificial Friend with outstanding observational qualities.",
    pages: 303,
    averageRating: 3.8,
    ratingsCount: 450000,
    series: null,
  }),
  storeBook({
    id: 9003,
    title: "Circe",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1565909496i/35959740.jpg",
    authors: [{ name: "Madeline Miller", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Mythology", "Historical Fiction"],
    description:
      "In the house of Helios, god of the sun, a daughter is born.",
    pages: 393,
    averageRating: 4.3,
    ratingsCount: 800000,
    series: null,
  }),
  storeBook({
    id: 9004,
    title: "Babel",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1677361825i/57945316.jpg",
    authors: [{ name: "R.F. Kuang", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Historical Fiction", "Dark Academia"],
    description:
      "An epic historical fantasy set in 1830s Oxford about the power of translation and empire.",
    pages: 545,
    averageRating: 4.1,
    ratingsCount: 350000,
    series: null,
  }),
  storeBook({
    id: 9005,
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1636978687i/58784475.jpg",
    authors: [{ name: "Gabrielle Zevin", image: null, hardcoverId: null }],
    genres: ["Fiction", "Contemporary", "Literary Fiction"],
    description:
      "Two friends find their way back to each other and create a groundbreaking video game.",
    pages: 416,
    averageRating: 4.2,
    ratingsCount: 600000,
    series: null,
  }),
];

/* ─────────────────────────────────────────────
   Pool 2 — Search by Author (grouped by author)
   ───────────────────────────────────────────── */
const authorPool: IBook[] = [
  // Brandon Sanderson
  storeBook({
    id: 9010,
    title: "The Way of Kings",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1659905828i/7235533.jpg",
    authors: [{ name: "Brandon Sanderson", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Epic Fantasy"],
    description:
      "Widely acclaimed for his work completing Robert Jordan's Wheel of Time saga.",
    pages: 1007,
    averageRating: 4.6,
    ratingsCount: 500000,
    series: [
      {
        name: "The Stormlight Archive",
        hardcoverId: null,
        description: "Epic fantasy series",
      },
    ],
  }),
  storeBook({
    id: 9011,
    title: "Mistborn: The Final Empire",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1617768316i/68428.jpg",
    authors: [{ name: "Brandon Sanderson", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Epic Fantasy"],
    description: "In a world where ash falls from the sky and mist dominates the night.",
    pages: 541,
    averageRating: 4.5,
    ratingsCount: 700000,
    series: [
      { name: "Mistborn", hardcoverId: null, description: "Fantasy trilogy" },
    ],
  }),
  // Ursula K. Le Guin
  storeBook({
    id: 9012,
    title: "A Wizard of Earthsea",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1353424536i/13642.jpg",
    authors: [{ name: "Ursula K. Le Guin", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Classics", "Young Adult"],
    description: "Ged was the greatest sorcerer in all Earthsea.",
    pages: 183,
    averageRating: 4.0,
    ratingsCount: 300000,
    series: [
      { name: "Earthsea Cycle", hardcoverId: null, description: "Fantasy cycle" },
    ],
  }),
  storeBook({
    id: 9013,
    title: "The Left Hand of Darkness",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1488213612i/18423.jpg",
    authors: [{ name: "Ursula K. Le Guin", image: null, hardcoverId: null }],
    genres: ["Science Fiction", "Classics", "Literary Fiction"],
    description: "A lone human ambassador is sent to the icebound planet of Winter.",
    pages: 304,
    averageRating: 4.0,
    ratingsCount: 200000,
    series: null,
  }),
  // N.K. Jemisin
  storeBook({
    id: 9014,
    title: "The Fifth Season",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1386803701i/19161852.jpg",
    authors: [{ name: "N.K. Jemisin", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Science Fiction", "Dystopia"],
    description:
      "A season of endings has begun. It starts with the great red rift.",
    pages: 468,
    averageRating: 4.3,
    ratingsCount: 250000,
    series: [
      {
        name: "The Broken Earth",
        hardcoverId: null,
        description: "Hugo Award-winning trilogy",
      },
    ],
  }),
];

/* ─────────────────────────────────────────────
   Pool 3 — Search by Series
   ───────────────────────────────────────────── */
const seriesPool: IBook[] = [
  // The First Law
  storeBook({
    id: 9020,
    title: "The Blade Itself",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1651784164i/944073.jpg",
    authors: [{ name: "Joe Abercrombie", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Grimdark", "Epic Fantasy"],
    description: "Logen Ninefingers might be the most feared man in the North.",
    pages: 515,
    averageRating: 4.1,
    ratingsCount: 300000,
    series: [
      {
        name: "The First Law",
        hardcoverId: null,
        description: "Grimdark fantasy trilogy",
      },
    ],
  }),
  storeBook({
    id: 9021,
    title: "Before They Are Hanged",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1329307713i/902715.jpg",
    authors: [{ name: "Joe Abercrombie", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Grimdark", "Epic Fantasy"],
    description: "Superior Glokta has a problem. How do you defend a city?",
    pages: 543,
    averageRating: 4.3,
    ratingsCount: 180000,
    series: [
      {
        name: "The First Law",
        hardcoverId: null,
        description: "Grimdark fantasy trilogy",
      },
    ],
  }),
  // The Poppy War
  storeBook({
    id: 9022,
    title: "The Poppy War",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1513672490i/35068705.jpg",
    authors: [{ name: "R.F. Kuang", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Historical Fiction", "Military Fiction"],
    description:
      "When Rin aced the Keju—the Empire-wide test—it was a shock to everyone.",
    pages: 527,
    averageRating: 4.1,
    ratingsCount: 250000,
    series: [
      {
        name: "The Poppy War",
        hardcoverId: null,
        description: "Military fantasy trilogy",
      },
    ],
  }),
  storeBook({
    id: 9023,
    title: "The Dragon Republic",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1548090268i/41118857.jpg",
    authors: [{ name: "R.F. Kuang", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Historical Fiction", "Military Fiction"],
    description:
      "The war is over. The war has just begun.",
    pages: 658,
    averageRating: 4.2,
    ratingsCount: 120000,
    series: [
      {
        name: "The Poppy War",
        hardcoverId: null,
        description: "Military fantasy trilogy",
      },
    ],
  }),
  // Gentleman Bastard
  storeBook({
    id: 9024,
    title: "The Lies of Locke Lamora",
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1468523865i/29588376.jpg",
    authors: [{ name: "Scott Lynch", image: null, hardcoverId: null }],
    genres: ["Fantasy", "Adventure", "Heist"],
    description:
      "An orphan's life is saved by a con artist who raises him to be the perfect thief.",
    pages: 499,
    averageRating: 4.3,
    ratingsCount: 350000,
    series: [
      {
        name: "Gentleman Bastard",
        hardcoverId: null,
        description: "Fantasy heist series",
      },
    ],
  }),
];

/* ═══════════════════════════════════════════════
   Search Functions
   ═══════════════════════════════════════════════ */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fuzzyMatch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase().trim());
}

/**
 * Search store books by title.
 */
export async function searchStoreByName(query: string): Promise<IBook[]> {
  await delay(SIMULATED_DELAY);
  if (!query.trim()) return [];
  return namePool.filter((b) => fuzzyMatch(b.title, query));
}

/**
 * Search store books by author name.
 */
export async function searchStoreByAuthor(query: string): Promise<IBook[]> {
  await delay(SIMULATED_DELAY);
  if (!query.trim()) return [];
  return authorPool.filter((b) =>
    b.authors.some((a) => fuzzyMatch(a.name, query)),
  );
}

/**
 * Search store books by series name.
 */
export async function searchStoreBySeries(query: string): Promise<IBook[]> {
  await delay(SIMULATED_DELAY);
  if (!query.trim()) return [];
  return seriesPool.filter(
    (b) => b.series && b.series.some((s) => fuzzyMatch(s.name, query)),
  );
}
