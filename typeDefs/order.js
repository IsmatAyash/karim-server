import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    getOrder(id: ID!): Order!
    orders(page: Int, limit: Int): orderPaginator
    ordersByStatus(page: Int, limit: Int, orderStat: String): orderPaginator
    orderedProductsByStatus(
      page: Int
      limit: Int
      itemStat: String
    ): orderPaginator
    orderedProductsBySeller(
      page: Int
      limit: Int
      sellerId: ID
      sellerName: String
    ): orderPaginator
    productsOrdered(page: Int, limit: Int, sellerId: ID!): orderPaginator
  }

  extend type Mutation {
    addOrder(newOrder: [OrderInput]): Order!
    shipit(id: ID!, shipDet: ShipInput!): Order!
    processPayment(total: Float, token: String!): Boolean
  }

  type Order {
    id: ID!
    buyer: User!
    details: [OrderDetail!]!
    orderStatus: OrderStatus
  }

  type OrderDetail {
    productId: ID!
    title: String!
    unit: String!
    price: Float!
    quantity: Int!
    image: String!
    sellerId: ID!
    sellerName: String!
    itemStatus: ItemStatus
    shippedAt: String
    fromAddress: String
    toAddress: String
    trackingNo: String
  }

  type orderPaginator {
    orders: [Order!]!
    paginator: OrderLabels
  }

  type OrderLabels {
    orderCount: Int
    perPage: Int!
    pageCount: Int!
    currentPage: Int!
    slNo: Int!
    hasPrevPage: Boolean
    hasNextPage: Boolean
    prev: Int
    next: Int
  }

  input OrderInput {
    productId: ID!
    title: String!
    unit: String!
    price: Float!
    quantity: Int!
    image: String!
    sellerId: ID!
    sellerName: String!
  }

  input ShipInput {
    productId: ID!
    fromAddress: String
    toAddress: String
    shippedAt: String
    itemStatus: ItemStatus
    trackingNo: String
    sellerId: ID!
  }

  enum ItemStatus {
    Pending
    Shipped
    Delivered
    Canceled
  }

  enum OrderStatus {
    InProcess
    Completed
    Reviewed
  }
`;
