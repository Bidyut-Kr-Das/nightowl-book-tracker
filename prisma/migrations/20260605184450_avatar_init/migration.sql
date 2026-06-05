-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" INTEGER;

-- CreateTable
CREATE TABLE "AvatarImages" (
    "id" SERIAL NOT NULL,
    "title" TEXT DEFAULT '',
    "url" TEXT NOT NULL,
    "fileId" TEXT,
    "metaData" JSONB,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvatarImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "AvatarImages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
