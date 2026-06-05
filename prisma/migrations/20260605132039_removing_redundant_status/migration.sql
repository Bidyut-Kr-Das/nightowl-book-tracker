/*
  Warnings:

  - The values [WISHLIST,OWNED] on the enum `ReadingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;

DROP VIEW IF EXISTS follower_stats;

UPDATE "UserBook" SET status = 'WANT_TO_READ' WHERE status = 'WISHLIST'; 

CREATE TYPE "ReadingStatus_new" AS ENUM ('WANT_TO_READ', 'READING', 'COMPLETED', 'ON_HOLD', 'DROPPED');
ALTER TABLE "UserBook" ALTER COLUMN "status" TYPE "ReadingStatus_new" USING ("status"::text::"ReadingStatus_new");
ALTER TYPE "ReadingStatus" RENAME TO "ReadingStatus_old";
ALTER TYPE "ReadingStatus_new" RENAME TO "ReadingStatus";
DROP TYPE "public"."ReadingStatus_old";


CREATE VIEW follower_stats AS

SELECT
    follower.id AS follower_id,
    follower.name,

    COUNT(
      CASE
        WHEN ub.status='COMPLETED'
        THEN 1
      END
    ) AS completed_count,

    COUNT(
      CASE
        WHEN ub.status='WANT_TO_READ'
        THEN 1
      END
    ) AS tbr_count,

    uf."B" AS followed_user_id

FROM "_UserFollows" uf

JOIN "User" follower
    ON follower.id = uf."A"

LEFT JOIN "UserBook" ub
    ON ub."userId" = follower.id

GROUP BY
    follower.id,
    follower.name,
    uf."B";
COMMIT;
