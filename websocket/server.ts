import { createServer } from "http";
import { Server as WebSocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenInfo } from "next-auth";
import { Game, WSState } from "../types/websocket";
import { GameInterface, GameTypeEnum } from "@/types/games";
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

// Switch players if needed
function adjustGameForPlayer<GameState extends GameInterface<any, any>>(game: Game<GameState>, flip: boolean) {
  let adjustedGame: Game<GameState> = {...game, gameState: game.gameState.clone()};
  if (flip) {
    adjustedGame.players = [game.players[1], game.players[0]];
    adjustedGame.gameState.turn = !game.gameState.turn;
    adjustedGame.firstPlayer = game.firstPlayer === 0 ? 1 : 0;
    if (game.winner !== null) {
      adjustedGame.winner = game.winner === 0 ? 1 : game.winner === 1 ? 0 : null;
    }
  }
  return adjustedGame;
}

function makeGame(game: GameTypeEnum, player1: string, player2: string) {
  let gameCode = "";
  // Generate a random game code of 6 letters
  do {
    gameCode = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 6; i++) {
      gameCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } while (games.has(gameCode));
  console.log(`Game code: ${gameCode}`);
  // Create a new game state
  const gameState = gameGen(game);
  const player1State = connections.get(player1);
  const player2State = connections.get(player2);
  if (!player1State || !player2State) {
    console.log(`Error retrieving player states for game ${game}`);
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
    firstPlayer: Math.floor(Math.random() * 2),
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
  
  const player1Socket = player1State.socketId ? io.sockets.sockets.get(player1State.socketId) : null;
  const player2Socket = player2State.socketId ? io.sockets.sockets.get(player2State.socketId) : null;
  // Emit the game data to both players
  player1Socket?.emit("game_info", adjustGameForPlayer(gameData, false));
  player2Socket?.emit("game_info", adjustGameForPlayer(gameData, true));
  console.log(`Game data sent to players ${player1} and ${player2}`);
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
  // remove the players from the queue
  const player1State = connections.get(player1);
  const player2State = connections.get(player2);
  if (!player1State || !player2State) {
    console.log(`Error retrieving player states for game ${game}`);
    return;
  }
  player1State.currentQueue = null;
  player2State.currentQueue = null;
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
  let token_info: TokenInfo | null = null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded token:", decoded);
    token_info = decoded;
  } catch (err) {
    console.error("Invalid token:", err);
  }

  if(!token_info) {
    console.error("Token info is undefined");
    socket.emit("connection_error", "Token info is null");
    socket.disconnect();
    return;
  }

  // Store the websocket information in Redis
  const userId = token_info.id;
  const userEmail = token_info.email;
  const wsKey = `ws:${userId}`;
  const keyExists = connections.has(wsKey);
  let wsStateTemp: WSState;
  if (keyExists) {
    wsStateTemp = connections.get(wsKey)!;
    let wsExists = wsStateTemp.socketId !== null;
    if (wsExists) {
      console.log(`WebSocket connection already exists for user ${userId}`);
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
      currentQueue: null,
      gameCode: null,
    };
    connections.set(wsKey, wsStateTemp);
  }
  const wsState = connections.get(wsKey)!;
  console.log(`WebSocket connection stored in map for user ${userId}:`, wsState);

  // Send game info if the user is already in a game
  if (wsState.gameCode) {
    const gameData = games.get(wsState.gameCode);
    if (!gameData) {
      console.log(`Game not found for user ${userId} even though they are in a game`);
      return;
    }
    const adjustedGameData = adjustGameForPlayer(gameData, gameData.players[0].userId !== userId);
    socket.emit("game_info", adjustedGameData);
    console.log(`Game data sent to user ${userId}:`, adjustedGameData);
  }

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
    // Check if the user is already in a game
    if (wsState.gameCode) {
      socket.emit("queue_error", "User is already in a game");
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

  // handle game info requests
  socket.on("request_game_info", (gameCode) => {
    console.log(`User ${userId} requested game info for game code ${gameCode}`);
    const gameData = games.get(gameCode);
    if (!gameData) {
      socket.emit("game_info_error", "Game not found");
      return;
    }
    const inGame = wsState.gameCode === gameCode;
    if(!inGame) {
      socket.emit("game_info_error", "User is not in the game");
      return;
    }
    const adjustedGameData = adjustGameForPlayer(gameData, gameData.players[0].userId !== userId);
    socket.emit("game_info", adjustedGameData);
    console.log(`Game data sent to user ${userId}:`, adjustedGameData);
  });

  // Handle game moves
  socket.on("game_move", (gameCode, move) => {
    console.log(`User ${userId} made a move in game ${gameCode}:`, move);
    const gameData = games.get(gameCode);
    if (!gameData) {
      socket.emit("game_move_error", "Game not found");
      return;
    }
    const inGame = wsState.gameCode === gameCode;
    if(!inGame) {
      socket.emit("game_move_error", "User is not in the game");
      return;
    }
    // Apply the move to the game state
    const newGameState = gameData.gameState.clone();
    if (!newGameState.applyMove(move)) {
      socket.emit("game_move_error", "Invalid move");
      return;
    }
    // Update the game state
    gameData.gameState = newGameState;

    // Find the connection for both players
    const player1Key = `ws:${gameData.players[0].userId}`;
    const player2Key = `ws:${gameData.players[1].userId}`;
    const player1State = connections.get(player1Key);
    const player2State = connections.get(player2Key);
    
    // Check if the game is over
    if (gameData.gameState.isGameOver()) {
      gameData.winner = gameData.gameState.turn ? 1 : 0;
      console.log(`Game over! Player ${gameData.winner} wins!`);
      if (player1State) {
        player1State.gameCode = null;
      }
      if (player2State) {
        player2State.gameCode = null;
      }
      // Remove the game from the map
      games.delete(gameCode);
    }
    
    // Emit the updated game state to both players
    const player1Socket = player1State?.socketId ? io.sockets.sockets.get(player1State.socketId) : null;
    const player2Socket = player2State?.socketId ? io.sockets.sockets.get(player2State.socketId) : null;
    player1Socket?.emit("game_info", adjustGameForPlayer(gameData, false));
    player2Socket?.emit("game_info", adjustGameForPlayer(gameData, true));
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
      wsState.currentQueue = null;
    }
    // Remove the socket from the connections map
    wsState.socketId = null;
  });
});


// Start the WebSocket server
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
});
