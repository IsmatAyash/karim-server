import mongoose from "mongoose";
import paginator from "mongoose-paginate-v2";

const { model, Schema } = mongoose;

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    inventory: { type: Number, default: 0 },
    featured: { type: Boolean },
    oldPrice: { type: Number },
    rating: { type: Number },
    avgRating: { type: Number },
    description: [{ type: Object }],
    tags: { type: Array },
    seller: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

productSchema.plugin(paginator);

const Product = model("products", productSchema);

export default Product;
