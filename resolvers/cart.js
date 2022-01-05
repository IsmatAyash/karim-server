import { ApolloError } from "apollo-server-express";

const UpdCartItemQty = async (Cart, user, item) => {
  return await Cart.findOneAndUpdate(
    {
      buyer: user.sub,
      "items.product": item.product,
    },
    { $inc: { "items.$.quantity": item.quantity } },
    { new: true }
  )
    .populate("buyer")
    .populate({ path: "items.product", populate: { path: "seller" } });
};

const prodNotDeleted = (productId) => ({
  id: productId,
  message: `Cart item wasn't found cannot delete!!`,
  success: false,
});

export default {
  Query: {
    carts: async (parent, args, { Cart }) => {
      try {
        const carts = await Cart.find()
          .populate("buyer")
          .populate({
            path: "items.product",
            populate: { path: "seller" },
          })
          .exec();
        if (!carts) throw new ApolloError("Unable to query carts.");
        return carts;
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    getCart: async (_, { buyer }, { Cart }) => {
      try {
        return await Cart.findOne({ buyer })
          .populate("buyer")
          .populate({
            path: "items.product",
            populate: { path: "seller" },
          });
      } catch (error) {
        console.log(error);
        throw new ApolloError(error.message, 400);
      }
    },
  },
  Mutation: {
    addCartItem: async (_, { newCart }, { Cart, user }) => {
      try {
        let cartItem = await UpdCartItemQty(Cart, user, newCart);
        if (!cartItem) {
          cartItem = await Cart.findOneAndUpdate(
            {
              buyer: user.sub,
            },
            { $push: { items: newCart } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          )
            .populate("buyer")
            .populate({
              path: "items.product",
              populate: { path: "seller" },
            });
        }
        return cartItem;
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    updCartItem: async (_, { updatedCartItem }, { Cart, user }) => {
      try {
        return await UpdCartItemQty(Cart, user, updatedCartItem);
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    delCartItem: async (_, { productId }, { Cart, user }) => {
      try {
        let cartItem = await Cart.findOneAndUpdate(
          {
            buyer: user.sub,
            "items.product": productId,
          },
          { $pull: { items: { product: productId } } },
          { new: true }
        );

        if (!cartItem) return prodNotDeleted(productId);

        return {
          id: productId,
          message: "Cart item was deleted successfuly.",
          success: true,
        };
      } catch (err) {
        console.log(err.message);
        return prodNotDeleted(productId);
      }
    },
    delCart: async (_, { id }, { Cart, user }) => {
      try {
        const cartItem = await Cart.findByIdAndRemove(id);
        if (!cartItem) throw new ApolloError("Cart wasn't deleted!");
        return {
          id: cartItem.id,
          message: "Cart was deleted successfuly.",
          success: true,
        };
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
  },
};
