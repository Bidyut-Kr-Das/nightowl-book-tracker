// export type BookStatus = "reading" | "completed" | "wishlist" | "unread";
import { IBook } from "@/types/interface";
// import { Book, ReadingStatus } from "./generated/prisma/client";
import { getBooksByStatus } from "@/utils/bookUtils";
import { ReadingStatus } from "./generated/prisma/enums";
// export interface IBook extends Book {}
export const books: IBook[] = [
  // Currently Reading
  {
    id: 1,
    title: "Assassin's Apprentice",
    series: [
      {
        name: "The Farseer Trilogy",
        hardcoverId: NaN,
        description:
          "The Farseer Trilogy follows the life of FitzChivalry Farseer, a royal bastard with a magical connection to animals. As he grows up in the shadow of the royal court, Fitz must navigate political intrigue, dangerous magic, and his own identity while training to become an assassin for the kingdom.",
      },
    ],
    // seriesOrder: 1,
    authors: [
      {
        name: "Robin Hobb",
        image: "",
        hardcoverId: NaN,
      },
    ],
    indexInSeries: 0,
    mood: ["Fantasy", "Epic Fantasy"],
    hardcoverId: NaN,
    averageRating: 4.2,
    headline: "",
    pages: 400,
    createdAt: new Date("2026-04-20"),
    updatedAt: new Date("2026-04-20"),
    ratingsCount: 500000,
    reviewsCount: 25000,
    releaseDate: new Date("1995-06-01"),
    slug: "assassins-apprentice",
    subtitle: "The Farseer Trilogy, Book 1",
    tags: ["Fantasy", "Epic Fantasy"],

    genres: ["Fantasy", "Epic Fantasy"],
    // releaseYear: 1995,
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1673728072i/77197.jpg",
    status: ReadingStatus.READING,
    progress: 67,
    // currentPage: 268,
    // totalPages: 400,
    // dateStarted: "2026-04-28",
    addedAt: new Date("2026-04-20"),
    description:
      "Young Fitz is the bastard son of the noble Prince Chivalry, raised in the shadow of the royal court.",
  },
  {
    id: 2,
    title: "Project Hail Mary",
    series: null,
    authors: [
      {
        name: "Andy Weir",
        image: "",
        hardcoverId: NaN,
      },
    ],
    indexInSeries: 0,

    hardcoverId: NaN,
    averageRating: 4.5,
    mood: ["Science Fiction", "Thriller"],
    headline: "",
    pages: 476,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-10"),
    ratingsCount: 800000,
    reviewsCount: 50000,
    releaseDate: new Date("2021-05-04"),
    slug: "project-hail-mary",
    subtitle: "",
    tags: ["Science Fiction", "Thriller"],
    genres: ["Science Fiction", "Thriller"],
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
    status: ReadingStatus.READING,
    progress: 34,
    addedAt: new Date("2026-05-01"),
    description:
      "Ryland Grace is the sole survivor on a desperate, last-chance mission.",
  },

  {
    id: 3,
    title: "Piranesi",
    series: null,
    authors: [
      {
        name: "Susanna Clarke",
        image: "",
        hardcoverId: NaN,
      },
    ],
    hardcoverId: NaN,
    averageRating: 4.3,
    mood: ["Fantasy", "Literary Fiction"],
    headline: "",
    pages: 250,
    indexInSeries: 0,

    createdAt: new Date("2026-04-15"),
    updatedAt: new Date("2026-05-02"),
    ratingsCount: 300000,
    reviewsCount: 20000,
    releaseDate: new Date("2020-09-15"),
    slug: "piranesi",
    subtitle: "",
    tags: ["Fantasy", "Literary Fiction"],
    genres: ["Fantasy", "Literary Fiction"],
    coverImage: "https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg",
    status: ReadingStatus.READING,
    progress: 82,
    addedAt: new Date("2026-04-15"),
    description: "Piranesi lives in the House. Perhaps he always has.",
  },

  {
    id: 4,
    title: "The Name of the Wind",
    series: [
      { name: "The Kingkiller Chronicle", hardcoverId: NaN, description: "" },
    ],
    authors: [
      {
        name: "Patrick Rothfuss",
        image: "",
        hardcoverId: NaN,
      },
    ],
    hardcoverId: NaN,
    averageRating: 4.5,
    mood: ["Fantasy", "Epic Fantasy"],
    headline: "",
    pages: 662,
    indexInSeries: 0,

    createdAt: new Date("2026-02-20"),
    updatedAt: new Date("2026-03-20"),
    ratingsCount: 900000,
    reviewsCount: 60000,
    releaseDate: new Date("2007-03-27"),
    slug: "the-name-of-the-wind",
    subtitle: "The Kingkiller Chronicle, Book 1",
    tags: ["Fantasy", "Epic Fantasy"],
    genres: ["Fantasy", "Epic Fantasy"],
    coverImage:
      "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1270352123i/186074.jpg",
    status: ReadingStatus.COMPLETED,
    progress: 100,
    addedAt: new Date("2026-02-20"),
    description:
      "Told in Kvothe's own voice, this is the tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.",
  },
];
