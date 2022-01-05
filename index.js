import { createServer } from "http";
import expressJwt from "express-jwt";
import express from "express";

import { SECRET } from "./config/index.js";
import startdb from "./startup/startdb.js";
import startApolloServer from "./startup/startApolloServer.js";

const app = express();
const httpServer = createServer(app);
const jwt = expressJwt({
  secret: SECRET,
  algorithms: ["HS256"],
  credentialsRequired: false,
});
app.use(jwt);
startdb();
startApolloServer(app, httpServer);

await new Promise((resolve) =>
  httpServer.listen({ port: process.env.PORT || 4000 }, resolve)
);
