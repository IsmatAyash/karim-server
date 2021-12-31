import { gql } from "apollo-server-express"

export default gql`
  scalar Upload
  extend type Query {
    getProduct(id: ID!): Product!
    products(cat: String!, page: Int, limit: Int): ProductPaginator!
    tags: [Tags]
    productsTag(tag: String!): [Product]
  }

  extend type Mutation {
    delProductById(id: ID!): ProdNotification!
    createProduct(newProduct: ProductInput): Product!
    editProductById(updatedProduct: ProductInput, id: ID!): Product!
    imageUpload(file: Upload!): File
  }

  type Tags {
    id: ID!
    tags: [String]
  }

  type File {
    filename: String!
    mimetype: String!
    url: String!
  }

  type Product {
    id: ID!
    title: String!
    unit: String!
    price: Float
    image: String!
    category: Category!
    inventory: Int
    featured: Boolean
    oldPrice: Float
    rating: Int
    avgRating: Float
    description: [ProdDesc]
    tags: [String!]
    seller: User!
  }

  type ProdDesc {
    title: String
    detail: String
  }

  enum Category {
    Veges
    Fruit
  }

  input ProdDescInput {
    title: String
    detail: String
  }

  type ProductPaginator {
    products: [Product!]!
    paginator: ProdLabels
  }

  type ProdLabels {
    productCount: Int
    perPage: Int!
    pageCount: Int!
    currentPage: Int!
    slNo: Int!
    hasPrevPage: Boolean
    hasNextPage: Boolean
    prev: Int
    next: Int
  }

  input ProductInput {
    title: String!
    unit: String!
    price: Float
    image: String!
    category: String!
    inventory: Int
    featured: Boolean
    oldPrice: Float
    description: [ProdDescInput]
    tags: [String!]
    sellerId: ID
  }

  type ProdNotification {
    id: ID!
    message: String!
    success: Boolean
  }
`
