import { gql } from "graphql-request";

export const SEARCH_BOOKS_QUERY = gql`
  query SearchBooks($query: String!) {
    search(query: $query, query_type: "Book", per_page: 10) {
      results
      error
    }
  }
`;

export const SEARCH_BOOKS_BY_AUTHOR_QUERY = gql`
  query BooksByAuthor($authorName: String!) {
    books(
      where: {
        contributions: { author: { name: { _eq: $authorName } } }
        editions: { language: { language: { _eq: "English" } } }
      }
    ) {
      id
      slug
      title
      subtitle
      description
      headline

      release_date
      pages

      image {
        url
      }

      cached_tags

      rating
      ratings_count
      reviews_count
      contributions {
        author {
          id
          name
        }
      }

      book_series {
        series {
          id
          name
          description
        }
      }
    }
  }
`;

export const GET_AUTHOR_DETAILS = gql`
  query GetAuthorsDetails($authorHardCoverIds: [Int!]!) {
    authors(where: { id: { _in: $authorHardCoverIds } }) {
      id
      bio
      name
      image {
        url
      }
    }
  }
`;

export const SUGGEST_AUTHORS = gql`
  query BooksByAuthor($authorName: String!) {
    search(query: $authorName, query_type: "Author", per_page: 10, page: 1) {
      results
    }
  }
`;

export const GET_BOOKS_BY_IDS = gql`
  query BooksByIds($bookIds: [Int!]!) {
    books(where: { id: { _in: $bookIds } }) {
      id
      slug
      title
      subtitle
      description
      headline
      release_date
      pages
      image {
        url
      }
      cached_tags
      rating
      ratings_count
      reviews_count
      contributions {
        author {
          id
          name
          image {
            url
          }
          bio
        }
      }
      book_series {
        series {
          id
          name
          description
        }
      }
    }
  }
`;
