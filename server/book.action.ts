"use server";

import { BookFormData } from "@/components/book-form-dialog/types";
import {
  GET_AUTHOR_DETAILS,
  GET_BOOKS_BY_IDS,
  SEARCH_BOOKS_BY_AUTHOR_QUERY,
  SEARCH_BOOKS_QUERY,
  SUGGEST_AUTHORS,
} from "@/constants/hardcover-gql-queries";
import { REDIS_KEYS } from "@/constants/redis-keys";
import { Author, ReadingStatus } from "@/lib/generated/prisma/client";
import { hardCoverClient } from "@/lib/hardcover-client";
import { hashids } from "@/lib/hashids";
import { redis } from "@/lib/redis";
import { prisma } from "@/prisma/prisma";
import {
  CachedAuthor,
  CachedSeries,
  HardcoverBooksResponse,
  IBook,
} from "@/types/interface";
import { mapBooksResponse } from "@/utils/bookUtils";
import { currentUser } from "@clerk/nextjs/server";
import { gql } from "graphql-request";
import { BookImage } from "lucide-react";

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
                id: true,
                name: true,
                hardcoverId: true,
                description: true,
              },
            },
            authors: {
              select: {
                id: true,
                name: true,
                image: true,
                hardcoverId: true,
              },
            },
          },
        },
      },
      orderBy: {
        book: {
          createdAt: "desc",
        },
      },
    });

    // normalise result
    const normalised: IBook[] = result.map((ub) => {
      return {
        ...ub.book,
        ...(ub.bookImage ? { coverImage: ub.bookImage } : {}),
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

export async function addBookToLibraryAction({
  hardCoverBookIds,
  ids,
  userId,
}: {
  hardCoverBookIds: number[] | null;
  ids: number[] | null;
  userId?: string;
}) {
  try {
    const session = await currentUser();
    if (!session) {
      throw new Error("user not authenticated");
    }

    //if ids are present create a final list which will be used at the end.
    //this list will be extended as the logic required
    let final_list =
      ids && ids.length
        ? ids.map((i) => ({
            id: i,
            hardcoverId: null as number | null,
            bookImage: null,
          }))
        : [];
    //step 1: CHECK OUR DB IF THE BOOK IS AVAILABLE BASED ON HARDCOVER ID
    if (hardCoverBookIds && hardCoverBookIds.length) {
      const uniqueSets = new Set(hardCoverBookIds);

      let db_books = await prisma.book.findMany({
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
        //push to final list for tracking
        final_list.push({ ...book, bookImage: null });
      }

      //if there is no new books to fetch dont call the hardcover api
      if (uniqueSets.size > 0) {
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
          // const new_entries = [...db_books, ...createdBooks];
          final_list = [
            ...final_list,
            ...createdBooks.map((cb) => ({
              ...cb,
              bookImage: null,
            })),
          ];
        }
        // return res;
      }
    }
    if (userId) {
      const user = hashids.decode(userId);
      const coverImageList = await Promise.all(
        final_list.map(async (item) => {
          return prisma.userBook.findUnique({
            where: {
              userId_bookId: {
                userId: user as unknown as number,
                bookId: item.id,
              },
              bookImage: {
                not: null,
              },
            },
            select: {
              bookId: true,
              bookImage: true,
            },
          });
        }),
      );
      final_list.forEach((item) => {
        const matched = coverImageList.find((i) => i?.bookId === item.id);
        return {
          ...item,
          BookImage: matched ? matched.bookImage : null,
        };
      });
    }

    //create userbook entries for each new book connection
    const res = await prisma.userBook.createManyAndReturn({
      data: final_list.map((e) => {
        return {
          userId: Number(session.externalId),
          bookId: e.id,
          status: ReadingStatus.WISHLIST,
          bookImage: e.bookImage,
        };
      }),
      include: {
        book: {
          include: {
            series: {
              select: {
                id: true,
                name: true,
                hardcoverId: true,
                description: true,
              },
            },
            authors: {
              select: {
                id: true,
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
        coverImage: ub.bookImage ?? ub.book.coverImage,
      };
    });

    return normalised;
  } catch (error) {
    console.error("Error While fetching books by id", error);
  }
}

export async function getBookBySlugAction(slug: string, userId?: string) {
  try {
    const res = await prisma.book.findUnique({
      where: {
        slug: slug,
      },
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
    });

    if (userId && res) {
      const user = hashids.decode(userId);
      const coverImage = await prisma.userBook.findUnique({
        where: {
          userId_bookId: {
            userId: user as unknown as number,
            bookId: res.id,
          },
        },
        select: {
          bookImage: true,
        },
      });
      if (coverImage) res.coverImage = coverImage.bookImage;
    }

    return {
      ...res,
      addedAt: new Date(),
      progress: null,
      status: ReadingStatus.WANT_TO_READ,
    } as IBook;
  } catch (error) {}
}

export async function createUpdateBookAction(data: BookFormData) {
  const {
    fileId,
    coverImage,
    coverFile,
    id,
    status,
    authors,
    series,
    ...bookData
  } = data;

  const user = await currentUser();
  if (!user) {
    throw new Error("User Not authenticated");
  }

  if (authors.find((a) => a.id < 0)) {
    await redis.del(REDIS_KEYS.AUTHORS_ALL);
  }
  if (series.find((s) => s.id < 0)) {
    await redis.del(REDIS_KEYS.SERIES_ALL);
  }
  try {
    const [book, userBook] = await prisma.$transaction(
      async () => {
        const created_book = await (id < 0
          ? prisma.book.create({
              data: {
                ...bookData,
                releaseDate: bookData.releaseDate
                  ? new Date(bookData.releaseDate)
                  : null,
                slug:
                  bookData.slug ??
                  bookData.title.toLowerCase().split(" ").join("-"),
                authors: {
                  // set: [],
                  connectOrCreate: authors.map((a) => ({
                    where: {
                      id: a.id,
                    },
                    create: {
                      name: a.name,
                      hardcoverId: a.hardcoverId ?? null,
                      bio: null,
                      image: a.image ?? null,
                    },
                  })),
                },
                series: {
                  // set: [],
                  connectOrCreate: series.map((s) => ({
                    where: {
                      id: s.id,
                    },
                    create: {
                      name: s.name,
                      description: s.description,
                      hardcoverId: s.hardcoverId,
                    },
                  })),
                },
              },
              include: {
                series: {
                  select: {
                    id: true,
                    name: true,
                    hardcoverId: true,
                    description: true,
                  },
                },
                authors: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    hardcoverId: true,
                  },
                },
              },
            })
          : prisma.book.update({
              where: {
                id: data.id,
              },
              data: {
                ...bookData,
                releaseDate: bookData.releaseDate
                  ? new Date(bookData.releaseDate)
                  : null,
                slug:
                  bookData.slug ??
                  bookData.title.toLowerCase().split(" ").join("-"),
                authors: {
                  set: [],
                  connectOrCreate: authors.map((a) => ({
                    where: {
                      id: a.id,
                    },
                    create: {
                      name: a.name,
                      hardcoverId: a.hardcoverId ?? null,
                      bio: null,
                      image: a.image ?? null,
                    },
                  })),
                },
                series: {
                  set: [],
                  connectOrCreate: series.map((s) => ({
                    where: {
                      id: s.id,
                    },
                    create: {
                      name: s.name,
                      description: s.description,
                      hardcoverId: s.hardcoverId,
                    },
                  })),
                },
              },
              include: {
                series: {
                  select: {
                    id: true,
                    name: true,
                    hardcoverId: true,
                    description: true,
                  },
                },
                authors: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    hardcoverId: true,
                  },
                },
              },
            }));

        const created_userBook = await prisma.userBook.upsert({
          where: {
            userId_bookId: {
              userId: Number(user.externalId),
              bookId: created_book.id,
            },
          },
          update: {
            bookImageId: fileId,
            bookImage: coverImage,
            status: status,
          },
          create: {
            userId: Number(user.externalId),
            bookId: created_book.id,
            status: status ?? ReadingStatus.WISHLIST,
            bookImage: coverImage ?? null,
            bookImageId: fileId ?? null,
          },
        });
        return [created_book, created_userBook];
      },

      {
        timeout: 10000,
      },
    );
    console.log(userBook);

    const cover = "bookImage" in userBook ? userBook.bookImage : undefined;
    const progress = "progress" in userBook ? userBook.progress : null;
    const statusNew =
      "status" in userBook ? userBook.status : ReadingStatus.WISHLIST;

    return {
      ...book,
      ...(cover ? { coverImage: cover } : {}),
      addedAt: userBook.createdAt,
      progress: progress,
      status: statusNew,
    } as IBook;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllAuthorsAction() {
  try {
    const cached = await redis.get<CachedAuthor[]>(REDIS_KEYS.AUTHORS_ALL);

    if (cached) {
      return cached;
    }

    const res = await prisma.author.findMany({
      select: {
        id: true,
        name: true,
        // image: true,
        // bio: true,
        hardcoverId: true,
      },
    });

    await redis.set(
      REDIS_KEYS.AUTHORS_ALL,
      res.map((a) => ({
        id: a.id,
        hardcoverId: a.hardcoverId,
        name: a.name,
      })),
    );
    return res;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch authors");
  }
}

export async function getAllSeriesAction() {
  try {
    const cached_res = await redis.get<CachedSeries[]>(REDIS_KEYS.SERIES_ALL);

    if (cached_res) {
      return cached_res;
    }

    const res = await prisma.series.findMany({
      select: {
        id: true,
        name: true,
        // description: true,
        hardcoverId: true,
      },
    });

    await redis.set(
      REDIS_KEYS.SERIES_ALL,
      res.map((s) => ({
        id: s.id,
        name: s.name,
        hardcoverId: s.hardcoverId,
      })),
    );
    return res;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch authors");
  }
}

export async function getSharedById() {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }
    const sharedBy = hashids.encode(Number(user.externalId));

    return sharedBy;
  } catch (error) {
    console.error(error);
  }
}
