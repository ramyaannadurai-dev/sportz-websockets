import express from "express";
import { matchesRouter } from "./route/matches.js";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";
const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from express server!");
});
app.use(securityMiddleware());
app.use("/matches", matchesRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`server is running at ${baseUrl}`);
  console.log(
    `Websocket Server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
