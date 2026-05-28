"use server";

import {
  GET_AUTHOR_DETAILS,
  GET_BOOKS_BY_IDS,
  SEARCH_BOOKS_BY_AUTHOR_QUERY,
  SEARCH_BOOKS_QUERY,
  SUGGEST_AUTHORS,
} from "@/constants/hardcover-gql-queries";
import { Author, ReadingStatus } from "@/lib/generated/prisma/client";
import { hardCoverClient } from "@/lib/hardcover-client";
import { prisma } from "@/prisma/prisma";
import { HardcoverBooksResponse, IBook } from "@/types/interface";
import { mapBooksResponse } from "@/utils/bookUtils";
import { currentUser } from "@clerk/nextjs/server";
import { gql } from "graphql-request";

export async function getAllBooks() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("user not authenticated");
    }
    const result = await prisma.userBook.findMany({
      where: {
        userId: Number(user.externalId),
      },
      include: {
        book: {
          include: {
            series: {
              select: {
                name: true,
                hardcoverId: true,
                description: true,
              },
            },
            authors: {
              select: {
                name: true,
                image: true,
                hardcoverId: true,
              },
            },
          },
        },
      },
    });

    // normalise result
    const normalised: IBook[] = result.map((ub) => {
      return {
        ...ub.book,
        addedAt: ub.createdAt,
        progress: ub.progress,
        status: ub.status,
      };
    });

    return normalised;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
}

export async function searchBookStore(
  query: string,
  queryType: "Book" | "Author" | "Series",
) {
  try {
    if (queryType === "Book") {
      const response = await hardCoverClient.request(SEARCH_BOOKS_QUERY, {
        query: query,
      });
      return {
        flag: "BOOK_RESULT" as const,
        books: mapBooksResponse(response),
      };
    } else if (queryType === "Author") {
      //step 1: find the author name in the db
      const result = await checkAuthorName(query);

      if (result) {
        //step 1.2 : If author is found in database. get the books of that author from the name
        const response = await hardCoverClient.request<HardcoverBooksResponse>(
          SEARCH_BOOKS_BY_AUTHOR_QUERY,
          {
            authorName: result.name,
          },
        );
        const sanitisedBooks: IBook[] = response.books.map(
          (b) =>
            ({
              hardcoverId: b.id,
              title: b.title,
              subtitle: b.subtitle,
              description: b.description,
              headline: b.headline,
              releaseDate: new Date(b.release_date || "17-05-2026"),
              pages: b.pages,
              authors: b.contributions.map((c) => ({
                name: c.author.name,
                hardcoverId: c.author.id,
              })),
              series: b.book_series.map((bs) => ({
                hardcoverId: bs.series.id,
                description: bs.series.description,
                name: bs.series.name,
              })),
              averageRating: b.rating,
              ratingsCount: b.ratings_count,
              coverImage: b.image?.url || null,
              genres: b.cached_tags["Genre"]?.map((t) => t.tag),
              reviewsCount: b.reviews_count,
              tags: b.cached_tags["Tag"]?.map((t) => t.tag),
              slug: b.slug,
            }) as IBook,
        );
        return { flag: "BOOK_RESULT" as const, books: sanitisedBooks };
      } else {
        const bookresponse =
          await hardCoverClient.request<HardcoverBooksResponse>(
            SEARCH_BOOKS_BY_AUTHOR_QUERY,
            {
              authorName: query,
            },
          );
        if (bookresponse.books.length > 0) {
          const sanitisedBooks: IBook[] = bookresponse.books.map(
            (b) =>
              ({
                hardcoverId: b.id,
                title: b.title,
                subtitle: b.subtitle,
                description: b.description,
                headline: b.headline,
                releaseDate: new Date(b.release_date || "17-05-2026"),
                pages: b.pages,
                authors: b.contributions.map((c) => ({
                  name: c.author.name,
                  hardcoverId: c.author.id,
                })),
                series: b.book_series?.map((bs) => ({
                  hardcoverId: bs.series.id,
                  description: bs.series.description,
                  name: bs.series.name,
                })),
                averageRating: b.rating,
                ratingsCount: b.ratings_count,
                coverImage: b.image?.url || null,
                genres: b.cached_tags["Genre"]?.map((t) => t.tag),
                reviewsCount: b.reviews_count,
                tags: b.cached_tags["Tag"]?.map((t) => t.tag),
                slug: b.slug,
              }) as IBook,
          );
          return {
            flag: "BOOK_RESULT" as const,
            books: sanitisedBooks,
          };
        }

        const response = await hardCoverClient.request(SUGGEST_AUTHORS, {
          authorName: query,
        });

        const hits = response.search.results.hits;

        if (hits.length === 0) {
          throw new Error("No Author found");
        }

        const authorIds = hits.map((a: any) => Number(a.document.id));

        const response2 = await hardCoverClient.request(GET_AUTHOR_DETAILS, {
          authorHardCoverIds: authorIds,
        });
        console.dir(response2, { depth: 4 });

        const filteredResult = response2.authors
          .filter((a: any) => a.image)
          .map((a: any) => ({
            ...a,
            image: a.image.url,
          }));
        return {
          flag: "AUTHOR_RESULT" as const,
          authors: filteredResult,
        };
      }
      //step 2 : query the hardcover author query if the result matches if the return array is null
      //step 3 : query the search author and show all the author list.
    } else {
      throw new Error(`Unhandled query type: ${queryType}`);
    }
  } catch (error) {
    console.error("Error searching encyclopedia:", error);
    throw error;
  }
}

export async function checkAuthorName(query: string) {
  try {
    const result = await prisma.author.findFirst({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new Error("Error while checking for author name");
  }
}

export async function addBookToLibraryAction(hardCoverBookIds: number[]) {
  try {
    const session = await currentUser();
    if (!session) {
      throw new Error("user not authenticated");
    }
    //step 1: CHECK OUR DB IF THE BOOK IS AVAILABLE BASED ON HARDCOVER ID
    const uniqueSets = new Set(hardCoverBookIds);

    const db_books = await prisma.book.findMany({
      where: {
        hardcoverId: {
          in: [...uniqueSets],
        },
      },
      select: {
        id: true,
        hardcoverId: true,
      },
    });

    //remove all the hardcover ids already present in the db
    for (const book of db_books) {
      if (book.hardcoverId) uniqueSets.delete(book.hardcoverId);
    }

    //get all the unavailable books
    const response = await hardCoverClient.request<HardcoverBooksResponse>(
      GET_BOOKS_BY_IDS,
      {
        bookIds: [...uniqueSets],
      },
    );

    // for each new books create an entry and connect or create to existing series and authors.
    if (response.books.length) {
      const createdBooks = await Promise.all(
        response.books.map((b) => {
          return prisma.book.create({
            data: {
              hardcoverId: b.id,
              title: b.title,
              subtitle: b.subtitle,
              description: b.description,
              headline: b.headline,
              releaseDate: new Date(b.release_date || "17-05-2026"),
              pages: b.pages,
              authors: {
                connectOrCreate: b.contributions.map((c) => ({
                  where: {
                    hardcoverId: c.author.id,
                  },
                  create: {
                    name: c.author.name,
                    image: c.author.image ? c.author.image.url : null,
                    hardcoverId: c.author.id,
                    bio: c.author.bio,
                  },
                })),
              },
              series: {
                connectOrCreate: b.book_series.map((bs) => ({
                  where: {
                    hardcoverId: bs.series.id,
                  },
                  create: {
                    hardcoverId: bs.series.id,
                    description: bs.series.description,
                    name: bs.series.name,
                  },
                })),
              },
              averageRating: Number(b.rating?.toFixed(1)),
              ratingsCount: b.ratings_count,
              coverImage: b.image?.url || null,
              genres: b.cached_tags["Genre"]?.map((t: any) => t.tag),
              reviewsCount: b.reviews_count,
              tags: b.cached_tags["Tag"]?.map((t: any) => t.tag),
              slug: b.slug,
            },
            select: {
              hardcoverId: true,
              id: true,
            },
          });
        }),
      );

      //combine with all the old books and new books
      const new_entries = [...db_books, ...createdBooks];

      //create userbook entries for each new book connection
      const res = await prisma.userBook.createManyAndReturn({
        data: new_entries.map((e) => ({
          userId: Number(session.externalId),
          bookId: e.id,
          status: ReadingStatus.WANT_TO_READ,
        })),
        include: {
          book: {
            include: {
              series: {
                select: {
                  name: true,
                  hardcoverId: true,
                  description: true,
                },
              },
              authors: {
                select: {
                  name: true,
                  image: true,
                  hardcoverId: true,
                },
              },
            },
          },
        },
      });

      const normalised: IBook[] = res.map((ub) => {
        return {
          ...ub.book,
          addedAt: ub.createdAt,
          progress: ub.progress,
          status: ub.status,
        };
      });

      return normalised;
      // return res;
    }
  } catch (error) {
    console.error("Error While fetching books by id", error);
  }
}
