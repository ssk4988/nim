import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenInfo } from "next-auth";
import { TypedSocket, WSState } from "../types/websocket";
import { flipGamePerspective, makePublicGame, shouldGameEnd, synchronizeGameTime } from "./game-util";
import { connections, games, getWsKey, httpServer, io, lobbies, prisma } from "./init";
import { clearQueueLobbyHandler, joinLobbyHandler, lobbyHandler, queueHandler } from "./queue-lobby";
import { createGameTimeout, endGameRoom } from "./game-manager";

// Load environment variables from .env file
const envpath = `.env.${process.env.NODE_ENV}`;
console.log("ENV Path:", envpath);
dotenv.config({ path: envpath });

const PORT = (process.env.WS_PORT && parseInt(process.env.WS_PORT)) || 4000;
const BASE_URL = process.env.BASE_URL || "http://localhost";

// Middleware to check for authentication token
io.use((socket: TypedSocket, next) => {
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


io.on("connection", (socket: TypedSocket) => {
  console.log(`New WebSocket connection: ${socket.id}`);
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("No token provided, dropping connection");
    socket.emit("connection_error", "No token provided");
    socket.disconnect();
    return;
  }
  // Verify the token
  let token_info: TokenInfo | null = null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded token:", decoded);
    // @ts-ignore
    token_info = decoded;
  } catch (err) {
    console.error("Invalid token:", err);
  }

  if (!token_info) {
    console.error("Token info is undefined");
    socket.emit("connection_error", "Token info is null");
    socket.disconnect();
    return;
  }

  // Store the websocket information
  const userId = token_info.id;
  const userEmail = token_info.email;
  const username = token_info.username;
  const wsKey = getWsKey(username);
  const keyExists = connections.has(wsKey);
  let wsStateTemp: WSState;
  if (keyExists) {
    wsStateTemp = connections.get(wsKey)!;
    let wsExists = wsStateTemp.socketId !== null;
    if (wsExists) {
      console.log(`WebSocket connection already exists for user ${username}`);
      socket.emit("connection_error", "WebSocket connection already exists");
      socket.disconnect();
      return;
    }
    // Update the socket ID
    wsStateTemp.socketId = socket.id;
  } else {
    wsStateTemp = {
      socketId: socket.id,
      userId: userId,
      userEmail: userEmail,
      username: username,
      currentQueue: null,
      currentLobby: null,
      gameCode: null,
    };
    connections.set(wsKey, wsStateTemp);
  }
  const wsState = connections.get(wsKey)!;
  console.log(`WebSocket connection stored in map for user ${username}:`, wsState);

  // Send game info if the user is already in a game
  if (wsState.gameCode) {
    const gameData = games.get(wsState.gameCode);
    if (!gameData) {
      console.log(`Game not found for user ${username} even though they are in a game`);
      wsState.gameCode = null;
    } else {
      const publicGameData = makePublicGame(gameData);
      const adjustedGameData = flipGamePerspective(publicGameData, gameData.players[0].userId !== userId);
      socket.emit("game_info", adjustedGameData);
      console.log(`Game data sent to user ${username}:`, adjustedGameData);
    }
  }
  // Send lobby info if the user is already in a lobby
  else if (wsState.currentLobby) {
    const lobbyData = lobbies.get(wsState.currentLobby);
    if (!lobbyData) {
      console.log(`Lobby not found for user ${username} even though they are in a lobby`);
      wsState.currentLobby = null;
    } else {
      const playerData = lobbyData.player;
      if (playerData.userId !== userId) {
        console.log(`User ${username} is not in the lobby ${lobbyData.lobbyCode}`);
        wsState.currentLobby = null;
      } else {
        socket.emit("lobby_info", lobbyData);
        console.log(`Lobby data sent to user ${username}:`, lobbyData);
      }
    }
  }

  // Log all incoming events for debugging purposes
  socket.onAny((event, ...args) => {
    console.log(`Event: ${event}`, args);
  });

  // Handle incoming messages
  socket.on("message", (data: any) => {
    console.log(`Message from ${socket.id}:`, data);

    // Broadcast the message to all connected clients
    socket.broadcast.emit("message", data);
  });

  // Add to queue
  socket.on("queue", queueHandler(wsState, socket));

  // Make a lobby
  socket.on("lobby", lobbyHandler(wsState, socket));
  
  // remove from queue or lobby
  socket.on("clear_queue_lobby", clearQueueLobbyHandler(wsState, socket));

  // handle game info requests
  socket.on("request_game_info", (gameCode) => {
    console.log(`User ${username} requested game info for game code ${gameCode}`);
    const gameData = games.get(gameCode);
    if (!gameData) {
      socket.emit("game_info_error", "Game not found");
      return;
    }
    const inGame = wsState.gameCode === gameCode;
    if (!inGame) {
      socket.emit("game_info_error", "User is not in the game");
      return;
    }
    const publicGameData = makePublicGame(gameData);
    const adjustedGameData = flipGamePerspective(publicGameData, gameData.players[0].userId !== userId);
    socket.emit("game_info", adjustedGameData);
    console.log(`Game data sent to user ${username}:`, adjustedGameData);
  });

  // handle lobby info requests
  socket.on("request_lobby_info", (lobbyCode: string) => {
    console.log(`User ${username} requested lobby info for lobby code ${lobbyCode}`);
    const lobbyData = lobbies.get(lobbyCode);
    if (!lobbyData) {
      socket.emit("lobby_info_error", "Lobby not found");
      return;
    }
    const playerData = lobbyData.player;
    if (playerData.userId !== userId) {
      socket.emit("lobby_info_error", "User is not in the lobby");
      return;
    }
    socket.emit("lobby_info", lobbyData);
    console.log(`Lobby data sent to user ${username}:`, lobbyData);
  });

  // handle join lobby
  socket.on("join_lobby", joinLobbyHandler(wsState, socket));

  // Handle game moves
  socket.on("game_move", (gameCode, move) => {
    console.log(`User ${username} made a move in game ${gameCode}:`, move);
    const gameData = games.get(gameCode);
    if (!gameData) {
      console.log(`Game not found for user ${username}`);
      socket.emit("game_move_error", "Game not found");
      return;
    }
    const inGame = wsState.gameCode === gameCode;
    if (!inGame) {
      console.log(`User ${username} is not in the game`);
      socket.emit("game_move_error", "User is not in the game");
      return;
    }
    // check if it's the user's turn
    const playerIndex = gameData.players.findIndex((player) => player.userId === userId);
    if (playerIndex === -1) {
      console.log(`User ${username} is not in the game`);
      socket.emit("game_move_error", "User is not in the game");
      return;
    }
    if (gameData.playerTurn !== playerIndex) {
      console.log(`It's not user ${username}'s turn`);
      socket.emit("game_move_error", "It's not your turn");
      return;
    }
    // Check if the game is over
    if (gameData.winner !== null) {
      console.log(`Game is already over!`);
      socket.emit("game_move_error", "Game is over");
      return;
    }

    synchronizeGameTime(gameData);


    // Check if the move was made in time
    if (gameData.playerTimes[gameData.playerTurn] <= 0) {
      console.log(`User ${username} took too long to make a move!`);
      socket.emit("game_move_error", "Time's up!");
      return;
    }

    // Apply the move to the game state
    const newGameState = gameData.gameState.clone();
    if (!newGameState.applyMove(move)) {
      console.log(`User made an invalid move:`, move);
      socket.emit("game_move_error", "Invalid move");
      return;
    }

    console.log(`Move applied:`, newGameState);
    // Update the game state
    gameData.gameState = newGameState;
    gameData.playerTurn = 1 - gameData.playerTurn; // Switch turns
    synchronizeGameTime(gameData);

    if (shouldGameEnd(gameData)) {
      endGameRoom(gameCode);
      return;
    }

    // update the game timout
    createGameTimeout(gameData);

    // Find the connection for both players
    const player1Key = getWsKey(gameData.players[0].username);
    const player2Key = getWsKey(gameData.players[1].username);
    const player1State = connections.get(player1Key);
    const player2State = connections.get(player2Key);


    // Emit the updated game state to both players
    const player1Socket = player1State?.socketId ? io.sockets.sockets.get(player1State.socketId) : null;
    const player2Socket = player2State?.socketId ? io.sockets.sockets.get(player2State.socketId) : null;
    const publicGameData = makePublicGame(gameData);
    player1Socket?.emit("game_info", flipGamePerspective(publicGameData, false));
    player2Socket?.emit("game_info", flipGamePerspective(publicGameData, true));
  });


  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`WebSocket connection closed: ${socket.id}`);
    clearQueueLobbyHandler(wsState)();

    // Remove the socket from the connections map
    wsState.socketId = null;
  });
});


// Start the WebSocket server
io.listen(PORT);
console.log(`WebSocket server running on ${BASE_URL}:${PORT}`);


// Graceful shutdown
// process.on("SIGINT", async () => {
//   console.log("Shutting down...");
//   await prisma.$disconnect(); // Disconnect Prisma
//   httpServer.close(() => {
//     console.log("HTTP server closed");
//     process.exit(0);
//   });
// });
