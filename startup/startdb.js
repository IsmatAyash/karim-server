import mongoose from "mongoose";
import { DB } from "../config/index.js";
import consola from "consola";

export default function () {
  try {
    mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    consola.success({ badge: true, message: `🚀 DB Connected Successfully` });
  } catch (error) {
    consola.error({ badge: false, message: `👎 fail to connect to DB` });
  }
}
