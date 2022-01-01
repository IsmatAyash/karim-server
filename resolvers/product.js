import { ApolloError, UserInputError } from "apollo-server-express";
import { GraphQLUpload } from "graphql-upload";
import { parse } from "path";
import aws from "aws-sdk";
import { v4 as uuid } from "uuid";

import {
  SECRET_ACCESS_KEY,
  ACCESS_KEY_ID,
  S3BUCKET,
  REGION,
} from "../config/index.js";
import { ProductRules } from "../validators/product.js";

const myCustomLabels = {
  totalDocs: "productCount",
  docs: "products",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
};

export default {
  Upload: GraphQLUpload,
  Query: {
    // products: async (parent, args, { Product }) => {
    //   try {
    //     const prod = await Product.find().populate("seller").exec()
    //     if (!prod) throw new ApolloError("Unable to query products.")
    //     return prod
    //   } catch (err) {
    //     throw new ApolloError(err.message, 400)
    //   }
    // },
    getProduct: async (_, { id }, { Product }) => {
      return await Product.findById(id).populate("seller");
    },
    products: async (parent, { cat, page, limit }, { Product }) => {
      try {
        const options = {
          limit: limit || 10,
          page: page || 1,
          sort: { createdAt: 1 },
          populate: "seller",
          customLabels: myCustomLabels,
        };
        return await Product.paginate({ category: cat }, options);
      } catch (error) {
        console.log(error.message);
        throw new ApolloError(error.message, 400);
      }
    },
    tags: async (_, args, { Product }) => {
      return await Product.find();
    },
    productsTag: async (_, { tag }, { Product }) => {
      return await Product.find({ tags: { $elemMatch: { $eq: tag } } });
    },
  },
  Mutation: {
    imageUpload: async (_, { file }) => {
      let { createReadStream, filename, mimetype } = await file;
      let { ext, name } = parse(filename);

      aws.config.update({
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        region: REGION,
        signatureVersion: "v4",
        apiVersion: "latest",
      });

      name = name.replace(/([^a-z0-9 ]+)/gi, "-").replace(" ", "_");
      const key = uuid();

      const params = {
        Bucket: S3BUCKET,
        Key: `images/${key}~${name}${ext}`,
        Body: createReadStream(),
        ContentType: mimetype,
      };
      const s3 = new aws.S3();
      try {
        const data = await s3.upload(params).promise();
        return { filename, mimetype, url: data.Location };
      } catch (error) {
        console.log(error);
        throw new ApolloError(error.message, 400);
      }
      // const uploadUrl = await s3.getSignedUrlPromise("putObject", params)
      // return { mimetype, filename, url: uploadUrl }
    },
    createProduct: async (_, { newProduct }, { Product, User, user }) => {
      try {
        await ProductRules.validate(newProduct, { abortEarly: false });
        let result = await Product.create({ ...newProduct, seller: user.sub });
        if (!result) {
          throw new ApolloError("Unable to create product");
        } else {
          let usr = await User.findById(user.sub);
          usr.sellerProducts.push(result.id);
          await usr.save();
          await result.populate("seller");
          return result;
        }
      } catch (err) {
        console.log(err.message);
        throw new UserInputError(err.message, 400);
      }
    },
    editProductById: async (_, { updatedProduct, id }, { Product, user }) => {
      try {
        let editedProd = await Product.findOneAndUpdate(
          { _id: id, seller: user.sub },
          { ...updatedProduct },
          { new: true }
        );
        if (!editedProd) throw new ApolloError("Unable to update the product");
        await editedProd.populate("seller");
        return editedProd;
      } catch (err) {
        throw new ApolloError(err.message, 400);
      }
    },
    delProductById: async (_, { id }, { Product }) => {
      try {
        const deletedProd = await Product.findOneAndDelete(id);
        if (!deletedProd)
          throw new ApolloError("Unable to delete this product.");
        return {
          success: true,
          id: deletedProd.id,
          message: "Product was deleted successfully.",
        };
      } catch (err) {
        throw new ApolloError(err.message, 400);
      }
    },
  },
};
