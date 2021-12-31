import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    books: [Book]
  }

  type Book {
    title: String
    author: String
  }
`;
