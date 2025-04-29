import { createServer } from "http";
import { Socket, Server as WebSocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TokenInfo } from "next-auth";
import { TypedSocket, Game, WSState, PlayerData } from "../types/websocket";
import { GameConfig, GameInterface, GameTypeEnum, TimeControlEnum, timeControlToMilliseconds } from "@/types/games";
import { KeyMap } from "./key-map";
import { flipGamePerspective, gameStateFactory, liveGameTypes, makePublicGame, shouldGameEnd, synchronizeGameTime, liveTimeControlTypes } from "./game-util";
import { PrismaClient } from "@prisma/client";
dotenv.config();

const PORT = process.env.WS_PORT || 4000;

// Create a Prisma Client instance
const prisma = new PrismaClient();

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


const EPSILON = 10; // 10ms

// Map of connections
const connections: Map<string, WSState> = new Map();

// queue of unpaired connections for games
const queue: KeyMap<GameConfig, string[]> = new KeyMap();

// Initialize the queue for each game type and time control
for (const gameType of liveGameTypes) {
  for (const timeControl of liveTimeControlTypes) {
    queue.set({ gameType: gameType, timeControl: timeControl }, []);
  }
}

// map of games
const games: Map<string, Game<GameInterface<any, any>>> = new Map();

// map of game timeouts
const gameTimeouts: Map<string, NodeJS.Timeout> = new Map();

// Creates a timeout for a game
function createGameTimeout(gameData: Game<GameInterface<any, any>>) {
  let gameCode = gameData.code;
  let prevGameTimeout = gameTimeouts.get(gameCode);
  if (prevGameTimeout) {
    clearTimeout(prevGameTimeout);
    gameTimeouts.delete(gameCode);
  }
  synchronizeGameTime(gameData);
  let timeToEnd = gameData.playerTimes[gameData.playerTurn];
  let gameTimeout = setTimeout(() => {
    console.log(`Game ${gameCode} timed out!`);
    gameTimeouts.delete(gameCode);
    const tmpGameData = games.get(gameCode);
    if (!tmpGameData) {
      console.log(`Game ${gameCode} not found`);
      return;
    }

    // Check if the game is over
    if (tmpGameData.winner !== null) {
      return;
    }
    synchronizeGameTime(tmpGameData);

    // Assume game should end

    // let shouldEnd = shouldGameEnd(tmpGameData);
    // if (!shouldEnd) { 
    //   console.log(`Game room ${gameCode} is still ongoing`);
    //   return; 
    // }

    // End the game
    endGameRoom(tmpGameData.code);
  }
    , timeToEnd + EPSILON);
  gameTimeouts.set(gameCode, gameTimeout);
}

// creates a game room for two players given the websocket keys
function makeGameRoom(game: GameConfig, player1: string, player2: string) {
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
  const gameState = gameStateFactory(game.gameType);
  const player1State = connections.get(player1);
  const player2State = connections.get(player2);
  if (!player1State || !player2State) {
    console.log(`Error retrieving player states for game ${game}`);
    return;
  }

  const player1Data: PlayerData = {
    userId: player1State.userId,
    name: player1State.userEmail,
  };
  const player2Data: PlayerData = {
    userId: player2State.userId,
    name: player2State.userEmail,
  };
  let firstPlayer = Math.floor(Math.random() * 2);
  let timeMs = timeControlToMilliseconds(game.timeControl);
  const gameData = {
    players: [player1Data, player2Data] as [PlayerData, PlayerData],
    gameState: gameState,
    firstPlayer: firstPlayer,
    playerTurn: firstPlayer,
    winner: null,
    code: gameCode,
    gameConfig: game,
    playerTimes: [timeMs, timeMs] as [number, number],
    lastUpdated: Date.now(),
  };
  gameData.gameState.turn = firstPlayer == 0;
  createGameTimeout(gameData);
  console.log(`Game data:`, gameData);

  // add the game code to the connections
  player1State.gameCode = gameCode;
  player2State.gameCode = gameCode;
  // Store the game in the map
  games.set(gameCode, gameData);

  const player1Socket = player1State.socketId ? io.sockets.sockets.get(player1State.socketId) : null;
  const player2Socket = player2State.socketId ? io.sockets.sockets.get(player2State.socketId) : null;

  // Emit the game data to both players
  const publicGameData = makePublicGame(gameData);
  player1Socket?.emit("game_info", flipGamePerspective(publicGameData, false));
  player2Socket?.emit("game_info", flipGamePerspective(publicGameData, true));
  console.log(`Game data sent to players ${player1} and ${player2}`);
}

function pairGamesInQueue(game: GameConfig) {
  const queueList = queue.get(game);
  if (!queueList) {
    console.log(`No queue for game ${game}`);
    return;
  }
  if (queueList.length < 2) {
    console.log(`Not enough players in queue for game ${JSON.stringify(game)}`);
    return;
  }
  const player1 = queueList.shift();
  const player2 = queueList.shift();
  if (!player1 || !player2) {
    console.log(`Error pairing players for game ${JSON.stringify(game)}`);
    return;
  }
  console.log(`Pairing players ${player1} and ${player2} for game ${JSON.stringify(game)}`);
  // remove the players from the queue
  const player1State = connections.get(player1);
  const player2State = connections.get(player2);
  if (!player1State || !player2State) {
    console.log(`Error retrieving player states for game ${JSON.stringify(game)}`);
    return;
  }
  player1State.currentQueue = null;
  player2State.currentQueue = null;
  // create the game
  makeGameRoom(game, player1, player2);
}


// End the game room and remove it from the map
function endGameRoom(gameCode: string): boolean {
  console.log(`Ending game room ${gameCode}`);
  const gameData = games.get(gameCode);
  if (!gameData) {
    console.log(`Game ${gameCode} not found`);
    return false;
  }

  // Find the connection for both players
  const player1Key = `ws:${gameData.players[0].userId}`;
  const player2Key = `ws:${gameData.players[1].userId}`;
  const player1State = connections.get(player1Key);
  const player2State = connections.get(player2Key);

  // check if the game room has already been ended
  if (gameData.winner !== null) {
    console.log(`Game room ${gameCode} has already been ended`);
    return false;
  }


  let shouldEnd = shouldGameEnd(gameData);
  if (!shouldEnd) {
    console.log(`Game room ${gameCode} is still ongoing`);
    return false;
  }
  // remove the game from the map
  games.delete(gameCode);

  // clear the game timeout
  let gameTimeout = gameTimeouts.get(gameCode);
  if (gameTimeout) {
    clearTimeout(gameTimeout);
    gameTimeouts.delete(gameCode);
  }

  gameData.winner = 1 - gameData.playerTurn; // the current player is the loser
  console.log(`Game ${gameCode} over! Player ${gameData.winner} wins!`);
  // clear the game code for both players
  if (player1State) {
    player1State.gameCode = null;
  }
  if (player2State) {
    player2State.gameCode = null;
  }

  // Emit the game data to both players
  const player1Socket = player1State?.socketId ? io.sockets.sockets.get(player1State.socketId) : null;
  const player2Socket = player2State?.socketId ? io.sockets.sockets.get(player2State.socketId) : null;
  const publicGameData = makePublicGame(gameData);
  player1Socket?.emit("game_info", flipGamePerspective(publicGameData, false));
  console.log(`Game data sent to player ${player1Key}: `, flipGamePerspective(publicGameData, false));
  player2Socket?.emit("game_info", flipGamePerspective(publicGameData, true));
  console.log(`Game data sent to player ${player2Key}: `, flipGamePerspective(publicGameData, true));
  console.log(`Game data sent to players ${player1Key} and ${player2Key}`);

  // update database
  const player1Id = gameData.players[0].userId;
  const player2Id = gameData.players[1].userId;
  const gameConfig = gameData.gameConfig;
  const gameCountToIncrement = `${gameConfig.gameType}_${gameConfig.timeControl}_games`;
  const winCountToIncrement = `${gameConfig.gameType}_${gameConfig.timeControl}_wins`;
  for (let playerId of [player1Id, player2Id]) {
    let playerIndex = playerId === player1Id ? 0 : 1;
    prisma.users.update({
      where: { userid: playerId },
      data: {
        games: {
          increment: 1,
        },
        [gameCountToIncrement]: {
          increment: 1,
        },
        ...(playerIndex === gameData.winner ? {
          [winCountToIncrement]: {
            increment: 1,
          },
        } : {}),
      }
    }).catch((err) => {
      console.log(`Error updating player ${playerId} in database: `, err);
    });
  }

  return true;
}



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
    const publicGameData = makePublicGame(gameData);
    const adjustedGameData = flipGamePerspective(publicGameData, gameData.players[0].userId !== userId);
    socket.emit("game_info", adjustedGameData);
    console.log(`Game data sent to user ${userId}:`, adjustedGameData);
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
  socket.on("queue", (gameConfig: GameConfig) => {
    if (!gameConfig || !gameConfig.gameType || !gameConfig.timeControl) {
      socket.emit("queue_error", "Game config is not formatted correctly");
      return;
    }
    console.log(`User ${userId} requested game ${JSON.stringify(gameConfig)}`);
    const queueList = queue.get(gameConfig);
    if (!queueList) {
      socket.emit("queue_error", "Game is not supported");
      return;
    }
    // Check if the user is already in the queue
    if (wsState.currentQueue) {
      // remove the user from the current queue
      const currentQueueList = queue.get(wsState.currentQueue);
      if (currentQueueList) {
        const index = currentQueueList.indexOf(wsKey);
        if (index !== -1) {
          currentQueueList.splice(index, 1);
        }
        wsState.currentQueue = null;
      }
    }
    // Check if the user is already in a game
    if (wsState.gameCode) {
      if (!games.has(wsState.gameCode)) {
        // clear the game code if it doesn't exist (shouldn't happen)
        console.log(`User ${userId} is in a game ${wsState.gameCode} but the game doesn't exist`);
        wsState.gameCode = null;
      } else {
        socket.emit("queue_error", "User is already in a game");
        return;
      }
    }
    // Add the user to the queue
    queueList.push(wsKey);
    wsState.currentQueue = gameConfig;
    socket.emit("queue_success", `User ${userId} added to queue for game ${JSON.stringify(gameConfig)}`);
    console.log(`Queue for game ${gameConfig}:`, queueList);

    // pair players from the queue
    pairGamesInQueue(gameConfig);
  });

  // remove from queue
  socket.on("clear_queue", () => {
    console.log(`User ${userId} requested to clear queue`);
    if (!wsState.currentQueue) {
      socket.emit("queue_error", "User is not in a queue");
      return;
    }
    const queueList = queue.get(wsState.currentQueue);
    if (!queueList) {
      socket.emit("queue_error", "Game is not supported");
      return;
    }
    // remove the user from the queue
    const index = queueList.indexOf(wsKey);
    if (index !== -1) {
      queueList.splice(index, 1);
      console.log(`User ${userId} removed from queue for game ${wsState.currentQueue}`);
    } else {
      console.log(`User ${userId} not found in queue for game ${wsState.currentQueue}`);
    }
    wsState.currentQueue = null;
    socket.emit("queue_success", `User ${userId} removed from queue for game ${wsState.currentQueue}`);
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
    if (!inGame) {
      socket.emit("game_info_error", "User is not in the game");
      return;
    }
    const publicGameData = makePublicGame(gameData);
    const adjustedGameData = flipGamePerspective(publicGameData, gameData.players[0].userId !== userId);
    socket.emit("game_info", adjustedGameData);
    console.log(`Game data sent to user ${userId}:`, adjustedGameData);
  });

  // Handle game moves
  socket.on("game_move", (gameCode, move) => {
    console.log(`User ${userId} made a move in game ${gameCode}:`, move);
    const gameData = games.get(gameCode);
    if (!gameData) {
      console.log(`Game not found for user ${userId}`);
      socket.emit("game_move_error", "Game not found");
      return;
    }
    const inGame = wsState.gameCode === gameCode;
    if (!inGame) {
      console.log(`User ${userId} is not in the game`);
      socket.emit("game_move_error", "User is not in the game");
      return;
    }
    // check if it's the user's turn
    const playerIndex = gameData.players.findIndex((player) => player.userId === userId);
    if (playerIndex === -1) {
      console.log(`User ${userId} is not in the game`);
      socket.emit("game_move_error", "User is not in the game");
      return;
    }
    if (gameData.playerTurn !== playerIndex) {
      console.log(`It's not user ${userId}'s turn`);
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
      console.log(`User ${userId} took too long to make a move!`);
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
    const player1Key = `ws:${gameData.players[0].userId}`;
    const player2Key = `ws:${gameData.players[1].userId}`;
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
