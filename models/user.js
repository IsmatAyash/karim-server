import mongoose from "mongoose";
import paginator from "mongoose-paginate-v2";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    billingAddress: { type: String },
    shippingingAddress: { type: String },
    phone: { type: String, required: true },
    country: { type: String, required: true, defualt: "Kuwait" },
    userType: {
      type: String,
      enum: ["Buyer", "Seller"],
      required: true,
      default: "Buyer",
    },
    avatar: {
      type: String,
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Ffreepng%2Fuser-avatar-placeholder-black_6796227.html&psig=AOvVaw125sbx_u_MDotiSjpKZmUU&ust=1635573863338000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCKCNrsv57vMCFQAAAAAdAAAAABAD",
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    passwordToken: String,
    permissions: { type: [String], default: ["read:own_user"] },
    sellerProducts: [{ type: Schema.Types.ObjectId, ref: "products" }],
    cartProducts: [{ type: Schema.Types.ObjectId, ref: "products" }],
  },
  { timestamps: true }
);

UserSchema.plugin(paginator);

const User = model("users", UserSchema);

export default User;
