import { createServer } from "http";
import { Server as WebSocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenInfo } from "next-auth";
dotenv.config();

const PORT = process.env.WS_PORT || 4000;

// Create an HTTP server for the WebSocket server
const httpServer = createServer();

// Initialize the WebSocket server
const io = new WebSocketServer(httpServer, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "POST"],
  },
});

// Map of connections
const connections: Map<string, WSState> = new Map();

// state of the current connection
type WSState = {
  socketId: string;
  userId: number;
  userEmail: string;
};

console.log("JWT Secret:", process.env.JWT_SECRET);

io.on("connection", (socket) => {
  console.log(`New WebSocket connection: ${socket.id}`);
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("No token provided, dropping connection");
    socket.emit("connection_error", "No token provided");
    socket.disconnect();
    return;
  }
  // Verify the token
  let token_info: TokenInfo | undefined = undefined;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded token:", decoded);
    token_info = decoded;
  } catch (err) {
    console.error("Invalid token:", err);
  }

  if(!token_info) {
    console.error("Token info is undefined");
    socket.emit("connection_error", "Token info is undefined");
    socket.disconnect();
    return;
  }

  // Store the websocket information in Redis
  const userId = token_info.id;
  const userEmail = token_info.email;
  const wsKey = `ws:${userId}`;
  const keyExists = connections.has(wsKey);
  if (keyExists) {
    console.log(`WebSocket connection already exists for user ${userId}`);
    socket.emit("connection_error", "WebSocket connection already exists");
    socket.disconnect();
    return;
  }
  const wsState: WSState = {
    socketId: socket.id,
    userId: userId,
    userEmail: userEmail,
  };
  connections.set(wsKey, wsState);
  console.log(`WebSocket connection stored in map for user ${userId}:`, wsState);


  // Handle incoming messages
  socket.on("message", (data) => {
    console.log(`Message from ${socket.id}:`, data);

    // Broadcast the message to all connected clients
    socket.broadcast.emit("message", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`WebSocket connection closed: ${socket.id}`);
    // Remove the connection from the map
    connections.delete(wsKey);
  });
});


// Start the WebSocket server
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
});
