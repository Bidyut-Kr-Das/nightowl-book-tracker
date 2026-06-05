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