"use server";

import {
  GET_AUTHOR_DETAILS,
  SEARCH_BOOKS_BY_AUTHOR_QUERY,
  SEARCH_BOOKS_QUERY,
  SUGGEST_AUTHORS,
} from "@/constants/hardcover-gql-queries";
import { Author } from "@/lib/generated/prisma/client";
import { hardCoverClient } from "@/lib/hardcover-client";
import { prisma } from "@/prisma/prisma";
import { HardcoverBooksResponse, IBook } from "@/types/interface";
import { mapBooksResponse } from "@/utils/bookUtils";
import { gql } from "graphql-request";

export async function getAllBooks() {
  try {
    const result = await prisma.userBook.findMany({
      where: {
        userId: undefined,
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
              genres: b.cached_tags["Genre"].map((t) => t.tag),
              reviewsCount: b.reviews_count,
              tags: b.cached_tags["Tag"].map((t) => t.tag),
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
