import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import typeDefs from "./typeDefs/index.js";
import resolvers from "./resolvers/index.js";
import * as AppModels from "./models/index.js";

import { DB } from "./config/index.js";
import consola from "consola";

async function startApolloServer() {
  // Required logic for integrating with Express
  const app = express();
  const httpServer = createServer(app);

  // Same ApolloServer initialization as before, plus the drain plugin.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ req }) => {
      const user = req.user || null;
      return { user, ...AppModels };
    },
  });

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: "/",
  });

  // Modified server startup
  await new Promise((resolve) =>
    httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
  );
  if (process.env.NODE_ENV !== "production")
    consola.success({
      badge: true,
      message: `🚀 Server started on http://localhost:4000${server.graphqlPath}`,
    });
}

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
consola.success({ badge: true, message: `🚀 DB Connected Successfully` });

startApolloServer();
