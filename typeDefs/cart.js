import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    carts: [Cart!]!
    getCart(buyer: ID!): Cart
  }

  extend type Mutation {
    delCartItem(productId: ID!): CartNotification!
    addCartItem(newCart: CartInput): Cart!
    updCartItem(updatedCartItem: CartInput): Cart!
    delCart(id: ID!): CartNotification!
  }

  type Cart {
    id: ID!
    buyer: User!
    items: [CartItem!]!
  }

  type CartItem {
    product: Product!
    quantity: Int
  }

  input CartInput {
    product: ID!
    quantity: Int
  }

  type CartNotification {
    id: ID!
    message: String!
    success: Boolean
  }
`;
