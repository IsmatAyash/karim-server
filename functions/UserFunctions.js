import jwt from "jsonwebtoken";
import { SECRET } from "../config/index.js";
import _ from "lodash";

export const issueToken = async (user) => {
  let token = await jwt.sign(
    {
      userInfo: { ...user },
    },
    SECRET,
    {
      algorithm: "HS256",
      subject: user.id.toString(),
      expiresIn: "1d",
    }
  );
  return `Bearer ${token}`;
};

export const serializeUser = (user) =>
  _.pick(user, [
    "id",
    "email",
    "name",
    "phone",
    "avatar",
    "role",
    "permissions",
    "userType",
    "billingAddress",
    "shippingAddress",
    "country",
  ]);

export const formatYupError = (err) => {
  const errors = [];
  err.inner.forEach((e) => errors.push({ path: e.path, message: e.message }));
  return errors;
};
