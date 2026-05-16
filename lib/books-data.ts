export type BookStatus = "reading" | "completed" | "wishlist" | "unread";

export interface Book {
  id: number;
  title: string;
  author: string;
  series?: string;
  seriesOrder?: number;
  genres: string[];
  publishedYear: number;
  coverImage: string;
  status: BookStatus;
  rating?: number; // 1-5
  progress?: number; // 0-100 percentage
  currentPage?: number;
  totalPages?: number;
  dateStarted?: string;
  dateFinished?: string;
  dateAdded: string;
  description?: string;
}

export const books: Book[] = [
  // Currently Reading
  {
    id: 1,
    title: "Assassin's Apprentice",
    series: "The Farseer Trilogy",
    seriesOrder: 1,
    author: "Robin Hobb",
    genres: ["Fantasy", "Epic Fantasy"],
    publishedYear: 1995,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1673728072i/77197.jpg",
    status: "reading",
    progress: 67,
    currentPage: 268,
    totalPages: 400,
    dateStarted: "2026-04-28",
    dateAdded: "2026-04-20",
    description:
      "Young Fitz is the bastard son of the noble Prince Chivalry, raised in the shadow of the royal court.",
  },
  {
    id: 2,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genres: ["Science Fiction", "Thriller"],
    publishedYear: 2021,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
    status: "reading",
    progress: 34,
    currentPage: 160,
    totalPages: 476,
    dateStarted: "2026-05-10",
    dateAdded: "2026-05-01",
    description:
      "Ryland Grace is the sole survivor on a desperate, last-chance mission.",
  },
  {
    id: 3,
    title: "Piranesi",
    author: "Susanna Clarke",
    genres: ["Fantasy", "Literary Fiction"],
    publishedYear: 2020,
    coverImage:
      "https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg",
    status: "reading",
    progress: 82,
    currentPage: 205,
    totalPages: 250,
    dateStarted: "2026-05-02",
    dateAdded: "2026-04-15",
    description:
      "Piranesi lives in the House. Perhaps he always has.",
  },
  // Completed
  {
    id: 4,
    title: "The Name of the Wind",
    series: "The Kingkiller Chronicle",
    seriesOrder: 1,
    author: "Patrick Rothfuss",
    genres: ["Fantasy", "Epic Fantasy"],
    publishedYear: 2007,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg",
    status: "completed",
    rating: 5,
    progress: 100,
    totalPages: 662,
    dateStarted: "2026-03-01",
    dateFinished: "2026-03-20",
    dateAdded: "2026-02-20",
    description:
      "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.",
  },
  {
    id: 5,
    title: "Dune",
    series: "Dune",
    seriesOrder: 1,
    author: "Frank Herbert",
    genres: ["Science Fiction", "Epic"],
    publishedYear: 1965,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
    status: "completed",
    rating: 5,
    progress: 100,
    totalPages: 688,
    dateStarted: "2026-01-10",
    dateFinished: "2026-02-05",
    dateAdded: "2026-01-05",
    description:
      "Set on the desert planet Arrakis, Dune is the story of Paul Atreides.",
  },
  {
    id: 6,
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    genres: ["Science Fiction", "Comedy"],
    publishedYear: 1979,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1559986152i/386162.jpg",
    status: "completed",
    rating: 4,
    progress: 100,
    totalPages: 193,
    dateStarted: "2026-02-10",
    dateFinished: "2026-02-14",
    dateAdded: "2026-02-08",
    description:
      "Seconds before the Earth is demolished to make way for a galactic freeway, Arthur Dent is plucked off the planet.",
  },
  {
    id: 7,
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genres: ["Literary Fiction", "Science Fiction"],
    publishedYear: 2021,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1603206535i/54120408.jpg",
    status: "completed",
    rating: 4,
    progress: 100,
    totalPages: 303,
    dateStarted: "2026-03-25",
    dateFinished: "2026-04-05",
    dateAdded: "2026-03-20",
    description:
      "Klara is an Artificial Friend with outstanding observational qualities.",
  },
  {
    id: 8,
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    genres: ["Science Fiction", "Literary Fiction"],
    publishedYear: 1969,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1488213612i/18423.jpg",
    status: "completed",
    rating: 5,
    progress: 100,
    totalPages: 304,
    dateStarted: "2026-04-10",
    dateFinished: "2026-04-22",
    dateAdded: "2026-04-08",
    description:
      "A lone human ambassador is sent to the icebound planet of Winter.",
  },
  // Wishlist
  {
    id: 9,
    title: "Royal Assassin",
    series: "The Farseer Trilogy",
    seriesOrder: 2,
    author: "Robin Hobb",
    genres: ["Fantasy", "Epic Fantasy"],
    publishedYear: 1996,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1428234219i/25300956.jpg",
    status: "wishlist",
    dateAdded: "2026-05-10",
    totalPages: 675,
    description:
      "Fitz has survived his first harrowing mission, and now he must endure the politics of the court.",
  },
  {
    id: 10,
    title: "Assassin's Quest",
    series: "The Farseer Trilogy",
    seriesOrder: 3,
    author: "Robin Hobb",
    genres: ["Fantasy", "Epic Fantasy"],
    publishedYear: 1997,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1481883253i/33396914.jpg",
    status: "wishlist",
    dateAdded: "2026-05-10",
    totalPages: 757,
    description:
      "Fitz has been battered and poisoned, and now he must embark on a quest.",
  },
  {
    id: 11,
    title: "Neuromancer",
    author: "William Gibson",
    genres: ["Science Fiction", "Cyberpunk"],
    publishedYear: 1984,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1554437249i/6088007.jpg",
    status: "wishlist",
    dateAdded: "2026-04-30",
    totalPages: 271,
    description:
      "Case was the sharpest data-thief in the matrix — until he crossed the wrong people.",
  },
  {
    id: 12,
    title: "The Dispossessed",
    author: "Ursula K. Le Guin",
    genres: ["Science Fiction", "Political Fiction"],
    publishedYear: 1974,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1353467455i/13651.jpg",
    status: "wishlist",
    dateAdded: "2026-05-05",
    totalPages: 387,
    description:
      "Shevek, a brilliant physicist, decides to take action. He will seek answers, question the unquestionable.",
  },
  {
    id: 13,
    title: "Children of Time",
    author: "Adrian Tchaikovsky",
    genres: ["Science Fiction", "Space Opera"],
    publishedYear: 2015,
    coverImage:
      "https://covers.openlibrary.org/b/isbn/9781447273301-L.jpg",
    status: "wishlist",
    dateAdded: "2026-05-12",
    totalPages: 600,
    description:
      "The last remnants of the human race left a dying Earth, desperate to find a new home.",
  },
  {
    id: 14,
    title: "Babel",
    author: "R.F. Kuang",
    genres: ["Fantasy", "Historical Fiction"],
    publishedYear: 2022,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1677361825i/57945316.jpg",
    status: "wishlist",
    dateAdded: "2026-05-14",
    totalPages: 560,
    description:
      "Traduttore, traditore: An act of translation is always an act of betrayal.",
  },
];

export function getBooksByStatus(status: BookStatus): Book[] {
  return books.filter((b) => b.status === status);
}

export function getRecentlyAdded(count: number = 5): Book[] {
  return [...books]
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    .slice(0, count);
}

export function getBookById(id: number): Book | undefined {
  return books.find((b) => b.id === id);
}

export function getAllGenres(): string[] {
  const genres = new Set<string>();
  books.forEach((b) => b.genres.forEach((g) => genres.add(g)));
  return Array.from(genres).sort();
}

export function getReadingStats() {
  const completed = getBooksByStatus("completed");
  const reading = getBooksByStatus("reading");
  const totalPagesRead = completed.reduce(
    (sum, b) => sum + (b.totalPages || 0),
    0
  );
  const currentPagesRead = reading.reduce(
    (sum, b) => sum + (b.currentPage || 0),
    0
  );

  return {
    totalBooks: books.length,
    completed: completed.length,
    reading: reading.length,
    wishlist: getBooksByStatus("wishlist").length,
    totalPagesRead: totalPagesRead + currentPagesRead,
    avgRating:
      completed.length > 0
        ? completed.reduce((sum, b) => sum + (b.rating || 0), 0) /
          completed.length
        : 0,
  };
}
