import { GameConfig, GameInterface, timeControlToMilliseconds } from "@/types/games";
import { Game, PlayerData } from "@/types/websocket";
import { connections, games, gameTimeouts, getWsKey, io, prisma } from "./init";
import { flipGamePerspective, gameStateFactory, makePublicGame, shouldGameEnd, synchronizeGameTime } from "./game-util";
import { EPSILON } from "@/lib/constants";

// Creates a timeout for a game
export function createGameTimeout(gameData: Game<GameInterface<any, any>>) {
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
  }, timeToEnd + EPSILON);
  gameTimeouts.set(gameCode, gameTimeout);
}



// creates a game room for two players given the websocket keys
// assumes it is valid to do so
export function makeGameRoom(game: GameConfig, player1: string, player2: string) {
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
    username: player1State.username,
  };
  const player2Data: PlayerData = {
    userId: player2State.userId,
    name: player2State.userEmail,
    username: player2State.username,
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


// End the game room and remove it from the map
export function endGameRoom(gameCode: string): boolean {
  console.log(`Ending game room ${gameCode}`);
  const gameData = games.get(gameCode);
  if (!gameData) {
    console.log(`Game ${gameCode} not found`);
    return false;
  }

  // Find the connection for both players
  const player1Key = getWsKey(gameData.players[0].username);
  const player2Key = getWsKey(gameData.players[1].username);
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
