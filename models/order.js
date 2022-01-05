import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import paginator from "mongoose-paginate-v2";
import mongoose from "mongoose";

const { model, Schema } = mongoose;
const orderDetail = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    sellerId: { type: Schema.Types.ObjectId, required: true },
    sellerName: { type: String, required: true },
    itemStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Canceled"],
      default: "Pending",
    },
    shippedAt: Date,
    fromAddress: String,
    toAddress: String,
    trackingNo: String,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: { unique: false },
    },
    details: [orderDetail],
    orderStatus: {
      type: String,
      enum: ["InProcess", "Completed", "Reviewed"],
      default: "InProcess",
    },
  },
  { timestamps: true }
);

orderSchema.plugin(paginator);
orderSchema.plugin(aggregatePaginate);

const Order = model("orders", orderSchema);

export default Order;
