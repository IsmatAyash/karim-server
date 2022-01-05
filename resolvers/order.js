import { ApolloError } from "apollo-server-express";
import mongoose from "mongoose";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const myCustomLabels = {
  totalDocs: "orderCount",
  docs: "orders",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
};

const paginateOptions = (page, limit) => ({
  limit: limit || 10,
  page: page || 1,
  sort: { createdAt: -1 },
  populate: "buyer",
  customLabels: myCustomLabels,
});

export default {
  Query: {
    getOrder: async (_, { id }, { Order }) =>
      await Order.findById(id).populate("buyer"),
    orders: async (parent, { page, limit }, { Order }) => {
      try {
        const options = paginateOptions(page, limit);
        const orders = await Order.paginate({}, options);
        if (!orders) throw new ApolloError("Unable to query orders.");
        return orders;
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    ordersByStatus: async (_, { page, limit, orderStat }, { Order }) => {
      try {
        const options = paginateOptions(page, limit);
        const orders = await Order.paginate(
          { orderStatus: orderStat },
          options
        );
        if (!orders) throw new ApolloError(`There are no ${orderStat} orders.`);
        return orders;
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    orderedProductsByStatus: async (
      _,
      { page, limit, itemStat },
      { Order }
    ) => {
      try {
        const options = paginateOptions(page, limit);
        const orderedProds = await Order.paginate(
          { "details.itemStatus": itemStat },
          options
        );
        if (!orderedProds)
          throw new ApolloError(`There are no ${itemStat} ordered products.`);
        return orderedProds;
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    orderedProductsBySeller: async (
      _,
      { page, limit, sellerId, sellerName },
      { Order }
    ) => {
      try {
        const options = paginateOptions(page, limit);
        const docs = await Order.paginate(
          { details: { $elemMatch: { sellerId } } },
          options
        );
        if (!docs)
          throw new ApolloError(
            `There are no ordered products for ${sellerName}.`
          );
        return docs;
      } catch (err) {
        // console.log(err.message)
        throw new ApolloError(err.message, 400);
      }
    },
    productsOrdered: async (_, { page, limit, sellerId }, { Order }) => {
      try {
        const options = {
          page: page || 1,
          limit: limit || 10,
          sort: { createdAt: -1 },
          customLabels: myCustomLabels,
        };

        const orders = await Order.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "buyer",
              foreignField: "_id",
              as: "buyer",
            },
          },
          { $unwind: "$buyer" },
          {
            $group: {
              _id: "$_id",
              orders: {
                $push: {
                  _id: "$_id",
                  orderStatus: "$orderStatus",
                  name: "$buyer.name",
                  email: "$buyer.email",
                  details: {
                    $filter: {
                      input: "$details",
                      as: "det",
                      cond: {
                        $eq: [
                          "$$det.sellerId",
                          mongoose.Types.ObjectId(sellerId),
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        ]);
        console.log("ORDERS AFTER LOOKUP", orders);
        await Order.aggregatePaginate(orders, options);
        return orders;
      } catch (error) {
        console.log(error.message);
        throw new ApolloError(error.message);
      }
    },
  },
  Mutation: {
    addOrder: async (_, { newOrder }, { Order, user }) => {
      try {
        // add new order
        const order = await Order.create({
          details: [...newOrder],
          buyer: user.sub,
        });
        return await order.populate("buyer");
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    processPayment: async (_, { total, token }, { user }) => {
      try {
        await stripe.charges.create({
          amount: parseFloat(total) * 100,
          currency: "usd",
          source: token,
          description: `Order ${new Date()} by ${user.email}`,
        });
        return true;
      } catch (error) {
        console.log(error.message);
        throw new ApolloError(error.message, 400);
      }
    },
    shipit: async (_, { id, shipDet }, { Order }) => {
      const {
        fromAddress,
        toAddress,
        trackingNo,
        shippedAt,
        itemStatus,
        productId,
      } = shipDet;
      try {
        const order = await Order.findOneAndUpdate(
          {
            _id: id,
            "details.productId": productId,
          },
          {
            $set: {
              "details.$.fromAddress": fromAddress,
              "details.$.toAddress": toAddress,
              "details.$.trackingNo": trackingNo,
              "details.$.itemStatus": itemStatus,
              "details.$.shippedAt": shippedAt,
            },
          },
          { new: true }
        );
        if (!order)
          throw new ApolloError(
            "Order was not found shipment details wasn't updated!"
          );
        return order.populate("buyer");
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
  },
};
