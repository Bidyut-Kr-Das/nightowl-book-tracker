import {
  Author,
  Book,
  ReadingStatus,
  Series,
  UserBook,
} from "@/lib/generated/prisma/client";

export interface IBook extends Book, Pick<UserBook, "progress" | "status"> {
  authors: Pick<Author, "name" | "image" | "hardcoverId">[];
  series: Pick<Series, "name" | "hardcoverId" | "description">[] | null;
  addedAt: Date;
}

export type HardcoverBooksResponse = {
  books: HardcoverBook[];
};

export type HardcoverBook = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  headline: string | null;

  release_date: string | null;
  pages: number | null;

  image: {
    url: string;
  } | null;

  cached_tags: Record<
    "Genre" | "Mood" | "Tag" | "Content Warning",
    {
      tag: string;
      tagSlug: string;
      category: string;
      categorySlug: string;
      spoilerRatio: number;
      count: number;
    }[]
  >;

  rating: number | null;
  ratings_count: number;
  reviews_count: number;

  contributions: {
    author: {
      id: number;
      name: string;
      image:{
        url:string
      };
      bio:string
    };
  }[];

  book_series: {
    series: {
      id: number;
      name: string;
      description: string | null;
    };
  }[];
};

//store types
