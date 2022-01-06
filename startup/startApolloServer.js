import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginInlineTrace,
} from "apollo-server-core";
import { applyMiddleware } from "graphql-middleware";
import { ApolloServer } from "apollo-server-express";
import * as AppModels from "../models/index.js";
import resolvers from "../resolvers/index.js";
import typeDefs from "../typeDefs/index.js";
import permissions from "../permissions.js";
import { graphqlUploadExpress } from "graphql-upload";
import { DEV_URL } from "../config/index.js";

export default async function (app, httpServer) {
  try {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const schemaWithMiddleware = applyMiddleware(schema, permissions);
    const server = new ApolloServer({
      schema: schemaWithMiddleware,
      context: ({ req }) => {
        const user = req.user || null;
        return { user, ...AppModels };
      },
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginInlineTrace(),
      ],
      introspection: process.env.NODE_ENV !== "production",
    });

    app.use(graphqlUploadExpress());
    await server.start();
    server.applyMiddleware({ app, path: "/graphql" });

    consola.success({
      badge: true,
      message: `🚀 Apollo Server started on ${DEV_URL}${
        process.env.PORT || 4000
      }${server.graphqlPath}`,
    });
  } catch (err) {
    console.log(err.message);
    consola.error({ badge: false, message: err.message });
  }
}
