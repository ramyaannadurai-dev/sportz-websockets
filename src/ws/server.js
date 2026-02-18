import { WebSocket, WebSocketServer } from "ws";

function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;

    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });
  // wss.on("connection", (socket) => {
  //   sendJson(socket, { type: "welcome" });
  //   socket.on("error", console.error);
  // });
  // wss.on("connection", (socket) => {
  //   console.log("Client connected");

  //   sendJson(socket, { type: "welcome" });

  //   socket.on("message", (message) => {
  //     console.log("Received:", message.toString());
  //   });

  //   socket.on("close", () => {
  //     console.log("Client disconnected");
  //   });

  //   socket.on("error", (err) => {
  //     console.error("Socket error:", err);
  //   });

  // });
  wss.on("connection", async (socket, req) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.subscriptions = new Set();

    sendJson(socket, { type: "welcome" });

    socket.on("message", (data) => {
      handleMessage(socket, data);
    });

    socket.on("error", () => {
      socket.terminate();
    });

    socket.on("close", () => {
      cleanupSubscriptions(socket);
    });

    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  function broadcastMatchCreated(match) {
    broadcastToAll(wss, { type: "match_created", data: match });
  }

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_Created", data: match });
  }
  return { broadcastMatchCreated };
}
