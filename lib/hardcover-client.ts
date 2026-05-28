import { GraphQLClient, gql } from "graphql-request";

export const hardCoverClient = new GraphQLClient(
  `${process.env.HARDCOVER_API_URL}`,
  {
    headers: {
      authorization: `${process.env.HARDCOVER_API_KEY}`,
    },
  },
);
