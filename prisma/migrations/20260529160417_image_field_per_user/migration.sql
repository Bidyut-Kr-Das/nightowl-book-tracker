-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "indexInSeries" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserBook" ADD COLUMN     "bookImage" TEXT;
