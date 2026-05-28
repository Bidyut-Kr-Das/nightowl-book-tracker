import { ReadingStatus } from "@/lib/generated/prisma/enums";
import { IBook } from "@/types/interface";

export function getBooksByStatus({
  books,
  status,
}: {
  books: IBook[];
  status: ReadingStatus;
}) {
  return books.filter((book) => book.status === status);
}

export function getRecentlyAdded({
  books,
  count = 5,
}: {
  books: IBook[];
  count: number;
}): IBook[] {
  return [...books]
    .sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    )
    .slice(0, count);
}

export function getBookById({
  books,
  id,
}: {
  books: IBook[];
  id: number;
}): IBook | undefined {
  return books.find((b) => b.id === id);
}

export function getBookBySlug({
  books,
  slug,
}: {
  books: IBook[];
  slug: string;
}) {
  return books.find((b) => b.slug === slug);
}

export function getAllGenres({ books }: { books: IBook[] }): string[] {
  const genres = new Set<string>();
  books.forEach((b) => b.genres.forEach((g) => genres.add(g)));
  return Array.from(genres).sort();
}

export function getReadingStats({ books }: { books: IBook[] }) {
  const completed = getBooksByStatus({
    books: books as IBook[],
    status: ReadingStatus.COMPLETED,
  });
  const reading = getBooksByStatus({
    books: books as IBook[],
    status: ReadingStatus.READING,
  });
  const totalPagesRead = completed.reduce((sum, b) => sum + (b.pages || 0), 0);
  const currentPagesRead = reading.reduce(
    (sum, b) => sum + (b.progress || 0),
    0,
  );

  return {
    totalBooks: books.length,
    completed: completed.length,
    reading: reading.length,
    wishlist: getBooksByStatus({
      books: books as IBook[],
      status: ReadingStatus.WISHLIST,
    }).length,
    totalPagesRead: totalPagesRead + currentPagesRead,
    avgRating:
      completed.length > 0
        ? completed.reduce((sum, b) => sum + (b.averageRating || 0), 0) /
          completed.length
        : 0,
  };
}

function isValidBook(doc: any) {
  if (!doc.title) return false;

  // must have core metadata
  if (!doc.author_names?.length) return false;
  if (!doc.image?.url) return false;
  if (!doc.description) return false;
  if (!doc.genres?.length) return false;
  if (!doc.tags?.length) return false;

  // remove junk/spam/partials
  const title = doc.title.toLowerCase();

  const blockedTerms = [
    "summary",
    "coloring",
    "sticker",
    "pov",
    "adaptation",
    "collection set",
  ];

  if (blockedTerms.some((term) => title.includes(term))) {
    return false;
  }

  // optional quality thresholds
  // if ((doc.users_count ?? 0) < 5) {
  //   return false;
  // }

  return true;
}
export function mapBooksResponse(data: any): IBook[] {
  return data.search.results.hits
    .map((hit: any) => hit.document)
    .filter(isValidBook)
    .map((doc: any) => {
      // const doc = hit.document

      return {
        id: doc.id,
        title: doc.title,
        description: doc.description ?? null,
        coverImage: doc.image?.url ?? null,
        authors: doc.author_names
          ? doc.author_names.map((a: string) => ({
              name: a,
            }))
          : [],

        series: doc.series_names ?? [],

        genres: doc.genres ?? [],

        tags: doc.tags ?? [],

        rating: doc.rating ?? null,

        releaseYear: doc.release_year ?? null,

        pages: doc.pages ?? null,

        slug: doc.slug,
      };
    });
}
