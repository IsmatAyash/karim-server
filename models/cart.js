import mongoose from "mongoose";

const { model, Schema } = mongoose;
const cartItem = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "products" },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: { unique: true },
    },
    items: [cartItem],
  },
  { timestamps: true }
);

const Cart = model("carts", cartSchema);

export default Cart;
