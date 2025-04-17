import { createServer } from "http";
import { Server as WebSocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenInfo } from "next-auth";
import { Game, WSState } from "../types/websocket";
import { GameTypeEnum } from "@/types/games";
import { gameGen } from "@/games/gameUtils";
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

// Middleware to check for authentication token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("No token provided");
    return next(new Error("No token provided"));
  }
  jwt.verify(token, process.env.JWT_SECRET!, (err: any) => {
    if (err) {
      console.log("Invalid token");
      return next(new Error("Invalid token"));
    }
    next();
  });
});


// Map of connections
const connections: Map<string, WSState> = new Map();

// queue of unpaired connections for games
const queue: Map<GameTypeEnum, string[]> = new Map();
queue.set(GameTypeEnum.NIM, []);

// map of games
const games: Map<string, Game<any>> = new Map();



console.log("JWT Secret:", process.env.JWT_SECRET);

function makeGame(game: GameTypeEnum, player1: string, player2: string) {
  let gameCode = "";
  // Generate a random game code of 6 letters
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 6; i++) {
    gameCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  console.log(`Game code: ${gameCode}`);
  // Create a new game state
  const gameState = gameGen(game);
  const player1State = connections.get(player1);
  const player2State = connections.get(player2);
  if (!player1State || !player2State) {
    console.log(`Error retrieving player states for game ${game}`);
    return;
  }
  const player1Socket = io.sockets.sockets.get(player1State.socketId);
  const player2Socket = io.sockets.sockets.get(player2State.socketId);
  if (!player1Socket || !player2Socket) {
    console.log(`Error retrieving player sockets for game ${game}`);
    return;
  }
  
  const player1Data = {
    userId: player1State.userId,
    name: player1State.userEmail,
  };
  const player2Data = {
    userId: player2State.userId,
    name: player2State.userEmail,
  };
  const gameData = {
    players: [player1Data, player2Data],
    gameState: gameState,
    sidePicker: Math.floor(Math.random() * 2),
    pickedSide: null,
    winner: null,
    code: gameCode,
    gameType: game,
  };
  console.log(`Game data:`, gameData);
  
  // add the game code to the connections
  player1State.gameCode = gameCode;
  player2State.gameCode = gameCode;
  // Store the game in the map
  games.set(gameCode, gameData);
  // Emit the game data to both players
  player1Socket.emit("game_start", gameData);
  player2Socket.emit("game_start", gameData);
}

function pairGamesInQueue(game: GameTypeEnum) {
  const queueList = queue.get(game);
  if (!queueList) {
    console.log(`No queue for game ${game}`);
    return;
  }
  if (queueList.length < 2) {
    console.log(`Not enough players in queue for game ${game}`);
    return;
  }
  const player1 = queueList.shift();
  const player2 = queueList.shift();
  if (!player1 || !player2) {
    console.log(`Error pairing players for game ${game}`);
    return;
  }
  console.log(`Pairing players ${player1} and ${player2} for game ${game}`);
  // create the game
  makeGame(game, player1, player2);
}


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
    currentQueue: null,
    gameCode: null,
  };
  connections.set(wsKey, wsState);
  console.log(`WebSocket connection stored in map for user ${userId}:`, wsState);

  // Log all incoming events for debugging purposes
  socket.onAny((event, ...args) => {
    console.log(`Event: ${event}`, args);
  });

  // Handle incoming messages
  socket.on("message", (data) => {
    console.log(`Message from ${socket.id}:`, data);

    // Broadcast the message to all connected clients
    socket.broadcast.emit("message", data);
  });

  // Add to queue
  socket.on("queue", (game) => {
    if(!game) {
      socket.emit("queue_error", "Game is required");
      return;
    }
    console.log(`User ${userId} added to queue for game ${game}`);
    const queueList = queue.get(game);
    if (!queueList) {
      socket.emit("queue_error", "Game is not supported");
      return;
    }
    // Check if the user is already in the queue
    if (wsState.currentQueue) {
      socket.emit("queue_error", `User is already in queue for ${wsState.currentQueue}`);
      return;
    }
    // Add the user to the queue
    queueList.push(wsKey);
    wsState.currentQueue = game;
    socket.emit("queue_success", `User ${userId} added to queue for game ${game}`);
    console.log(`Queue for game ${game}:`, queueList);

    // pair players from the queue
    pairGamesInQueue(game);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`WebSocket connection closed: ${socket.id}`);
    // Remove the user from the queue if they are in it
    if (wsState.currentQueue) {
      const queueList = queue.get(wsState.currentQueue);
      if (queueList) {
        const index = queueList.indexOf(wsKey);
        if (index !== -1) {
          queueList.splice(index, 1);
          console.log(`User ${userId} removed from queue for game ${wsState.currentQueue}`);
        }
      }
    }
    // Remove the connection from the map
    connections.delete(wsKey);
  });
});


// Start the WebSocket server
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
});
