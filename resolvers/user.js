import { ApolloError, UserInputError } from "apollo-server-express";
import { compare, hash } from "bcrypt";
import { issueToken, serializeUser } from "../functions/index.js";
import { sendEmail } from "../functions/sendEmail.js";
import { v4 as uuid } from "uuid";
import {
  UserRegistrationRules,
  UserAuthenticationRules,
} from "../validators/user.js";

const myCustomLabels = {
  totalDocs: "userCount",
  docs: "users",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator",
};

export default {
  Query: {
    login: async (_, { email, password }, { User }) => {
      await UserAuthenticationRules.validate(
        { email, password },
        { abortEarly: false }
      );
      try {
        let user = await User.findOne({ email });
        if (!user) throw new ApolloError("Invalid credentials");

        // check password
        const isMatch = await compare(password, user.password);
        if (!isMatch) throw new ApolloError("Invalid credentials");

        // issue token
        user = user.toObject();
        user.id = user._id;
        user = serializeUser(user);
        const token = await issueToken(user);
        return { token, user };
      } catch (error) {
        // console.log("ERROR", error)
        throw new ApolloError(error, 400);
        // console.log(formatYupError(error))
        // throw new Error(formatYupError(error))
      }
    },
    users: async (parent, { page, limit }, { User }) => {
      try {
        const options = {
          limit: limit || 10,
          page: page || 1,
          sort: { name: 1 },
          populate: "sellerProducts",
          customLabels: myCustomLabels,
        };
        const users = await User.paginate({}, options);
        return users;
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    getUser: async (_, { id }, { User }) =>
      await User.findById(id).populate("sellerProducts").exec(),
    sellers: async (_, { page, limit }, { User }) => {
      try {
        const options = {
          limit: limit || 10,
          page: page || 1,
          sort: { name: 1 },
          populate: "sellerProducts",
          customLabels: myCustomLabels,
        };
        const sellers = await User.paginate({ userType: "Seller" }, options);
        return sellers;
      } catch (err) {
        console.log(err.message);
        throw new ApolloError(err.message, 400);
      }
    },
    // passCode: async (_, { newUser }) => {
    //   await UserRegistrationRules.validate(newUser, { abortEarly: false })
    //   try {
    //     const passCode = Math.floor(1000 + Math.random() * 9000).toString()
    //     await sendEmail(
    //       newUser.email,
    //       `Please use this code ${passCode} to confirm your email and register`
    //     )
    //     return passCode
    //   } catch (err) {
    //     console.log(err)
    //     throw new UserInputError(err.message, 400)
    //   }
    // },
  },
  Mutation: {
    passCode: async (_, { newUser }, { User }) => {
      await UserRegistrationRules.validate(newUser, { abortEarly: false });
      try {
        const { email } = newUser;
        // check email uniqueness in the database
        let user = await User.findOne({ email });
        if (user) throw new ApolloError("Email is already registered", 403);

        const passCode = Math.floor(1000 + Math.random() * 9000).toString();
        await sendEmail(
          newUser.email,
          `Please use this code ${passCode} to confirm your email and register`
        );
        return passCode;
      } catch (err) {
        // console.log(err)
        throw new UserInputError(err.message, 400);
      }
    },
    register: async (_, { newUser }, { User }) => {
      try {
        const { password } = newUser;

        // Create new user
        let user = new User(newUser);

        // hash the password
        user.password = await hash(password, 12);

        // save user to the database
        let res = await user.save();
        res = res.toObject();
        res.id = res._id;
        res = serializeUser(res);

        // Issue the access token
        const token = await issueToken(res);
        return { token, user: res };
      } catch (error) {
        throw new ApolloError(error.message, 400);
      }
    },
    forgotPassword: async (_, { id, email }, { User }) => {
      try {
        const usr = await User.findById(id);
        if (usr.email !== email)
          throw new ApolloError("Entered email doesn't exist in our records");

        // generate random 6 digits code
        const token = uuid();
        usr.passwordToken = token;
        await usr.save();
        // write token to the database user record

        // await redis.set(
        //   "forget-password:" + token,
        //   usr.id,
        //   "ex",
        //   1000 * 3600 * 24 * 3 // 3 days to expire
        // );
        // save generated code in the database
        // send an email

        await sendEmail(
          email,
          `<a href="http://localhost/3000/change-password/${token}">reset password</a>`
        );
        return usr;
      } catch (error) {
        throw new ApolloError(error.message, 400);
      }
    },
    changePassword: async (_, { token, newPassword }, { User }) => {
      try {
        let user = await User.findOne({ passwordToken: token });
        if (!user)
          throw new ApolloError(
            "token is incorrect or user is no longer exist"
          );

        user.password = await hash(newPassword, 12);
        user.passwordToken = null;
        let res = await user.save();
        res = res.toObject();
        res.id = res._id;
        res = serializeUser(res);
        return res;
      } catch (error) {
        console.log(error.message);
        throw new ApolloError(error.message, 400);
      }
    },
    editUserById: async (_, { updatedUser, id }, { User }) => {
      return await User.findByIdAndUpdate(
        id,
        { ...updatedUser },
        { new: true }
      );
    },
    delUserById: async (_, { id }, { User }) => {
      const deletedUser = await User.findByIdAndDelete(id);
      return {
        success: true,
        id: deletedUser.id,
        message: "User was deleted successfully.",
      };
    },
  },
};
