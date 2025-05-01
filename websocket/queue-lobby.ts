import { GameConfig } from "@/types/games";
import { connections, games, getWsKey, io, lobbies, queues } from "./init";
import { Lobby, PlayerData, TypedSocket, WSState } from "@/types/websocket";
import { makeGameRoom } from "./game-manager";

// creates a lobby for a single player, given websocket key
// sends the lobby data to the player
// assumes it is valid to do so
export function makeLobby(gameConfig: GameConfig, player: string) {
    let lobbyCode = "";
    // Generate a random game code of 6 letters
    do {
        lobbyCode = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < 6; i++) {
            lobbyCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    } while (lobbies.has(lobbyCode));
    console.log(`Lobby code: ${lobbyCode}`);

    const playerState = connections.get(player);
    if (!playerState) {
        console.log(`Error retrieving connection state for player ${player}`);
        return;
    }
    const playerData: PlayerData = {
        userId: playerState.userId,
        name: playerState.userEmail,
        username: playerState.username,
    };
    const lobbyData: Lobby = {
        lobbyCode: lobbyCode,
        gameConfig: gameConfig,
        player: playerData,
    }
    // Store the lobby in the map
    lobbies.set(lobbyCode, lobbyData);
    playerState.currentLobby = lobbyCode;

    // send lobby data to the player
    const playerSocket = playerState.socketId ? io.sockets.sockets.get(playerState.socketId) : null;
    playerSocket?.emit("lobby_info", lobbyData);
    console.log(`Lobby data sent to player ${player}:`, lobbyData);
}
// add the game code to the connection

// delete a lobby without making a game
export function deleteLobby(lobbyCode: string) {
    console.log(`Deleting lobby ${lobbyCode}`);
    const lobbyData = lobbies.get(lobbyCode);
    if (!lobbyData) {
        console.log(`Lobby ${lobbyCode} not found`);
        return;
    }
    // Find the connection for the player
    const playerKey = getWsKey(lobbyData.player.username);
    const playerState = connections.get(playerKey);
    if (!playerState) {
        console.log(`Error retrieving connection state for player ${playerKey}`);
        return;
    }
    // remove the lobby from the map
    lobbies.delete(lobbyCode);
    // clear the game code for the player
    playerState.currentLobby = null;
}

// returns a handler that removes the user from the queue or lobby they are in
// emits socket events if socket is provided
export const clearQueueLobbyHandler = (wsState: WSState, socket?: TypedSocket) => {
    return () => {
        const username = wsState.username;
        const wsKey = getWsKey(username);
        console.log(`Clearing queue/lobby of User ${username}`);
        if (!wsState.currentQueue && !wsState.currentLobby) {
            if (socket) socket.emit("queue_lobby_error", "User is not in a queue or lobby");
            return;
        }
        if (wsState.currentLobby) {
            const lobbyData = lobbies.get(wsState.currentLobby);
            if (!lobbyData) {
                console.log(`Lobby not found for user ${username} even though they are in a lobby`);
                wsState.currentLobby = null;
            } else {
                // remove the user from the lobby
                let currentLobby = lobbyData.lobbyCode;
                deleteLobby(wsState.currentLobby);
                console.log(`User ${username} removed from lobby ${currentLobby}`);
                if (socket) socket.emit("queue_lobby_success", `User ${username} removed from lobby ${currentLobby}`);
                wsState.currentLobby = null; // just to be safe
            }
        }
        if (wsState.currentQueue) {
            const queueList = queues.get(wsState.currentQueue);
            if (!queueList) {
                if (socket) socket.emit("queue_lobby_error", "Game is not supported");
                return;
            }
            // remove the user from the queue
            const index = queueList.indexOf(wsKey);
            if (index !== -1) {
                queueList.splice(index, 1);
                console.log(`User ${username} removed from queue for game ${JSON.stringify(wsState.currentQueue)}`);
            } else {
                console.log(`User ${username} not found in queue for game ${JSON.stringify(wsState.currentQueue)}`);
            }
            if (socket) socket.emit("queue_lobby_success", `User ${username} removed from queue for game ${JSON.stringify(wsState.currentQueue)}`);
            wsState.currentQueue = null;
        }
    }
}

// returns a handler that creates a lobby for the user
export const lobbyHandler = (wsState: WSState, socket: TypedSocket) => {
    return (gameConfig: GameConfig) => {
        if (!gameConfig || !gameConfig.gameType || !gameConfig.timeControl) {
            socket.emit("queue_lobby_error", "Game config is not formatted correctly");
            return;
        }
        const username = wsState.username;
        const wsKey = getWsKey(username);
        console.log(`User ${username} requested lobby for game ${JSON.stringify(gameConfig)}`);
        // using this to check if the gameConfig is valid, queue isn't used
        const queueList = queues.get(gameConfig);
        if (!queueList) {
            socket.emit("queue_lobby_error", "Game is not supported");
            return;
        }
        // remove user from previous lobby or queue
        clearQueueLobbyHandler(wsState)();
        // Check if the user is already in a game
        if (wsState.gameCode) {
            if (!games.has(wsState.gameCode)) {
                // clear the game code if it doesn't exist (shouldn't happen)
                console.log(`User ${username} is in a game ${wsState.gameCode} but the game doesn't exist`);
                wsState.gameCode = null;
            } else {
                socket.emit("queue_lobby_error", "User is already in a game");
                return;
            }
        }
        makeLobby(gameConfig, wsKey);
    }
}

export const queueHandler = (wsState: WSState, socket: TypedSocket) => {
    return (gameConfig: GameConfig) => {
        if (!gameConfig || !gameConfig.gameType || !gameConfig.timeControl) {
            socket.emit("queue_lobby_error", "Game config is not formatted correctly");
            return;
        }
        const username = wsState.username;
        const wsKey = getWsKey(username);
        console.log(`User ${username} requested game ${JSON.stringify(gameConfig)}`);
        const queueList = queues.get(gameConfig);
        if (!queueList) {
            socket.emit("queue_lobby_error", "Game is not supported");
            return;
        }
        clearQueueLobbyHandler(wsState)();
        // Check if the user is already in a game
        if (wsState.gameCode) {
            if (!games.has(wsState.gameCode)) {
                // clear the game code if it doesn't exist (shouldn't happen)
                console.log(`User ${username} is in a game ${wsState.gameCode} but the game doesn't exist`);
                wsState.gameCode = null;
            } else {
                socket.emit("queue_lobby_error", "User is already in a game");
                return;
            }
        }

        // Add the user to the queue
        queueList.push(wsKey);
        wsState.currentQueue = gameConfig;
        socket.emit("queue_lobby_success", `User ${username} added to queue for game ${JSON.stringify(gameConfig)}`);
        console.log(`Queue for game ${gameConfig}:`, queueList);

        // pair players from the queue
        pairGamesInQueue(gameConfig);
    }
}

// join an existing lobby
export const joinLobbyHandler = (wsState: WSState, socket: TypedSocket) => {
    return (lobbyCode: string) => {
        const username = wsState.username;
        const wsKey = getWsKey(username);
        console.log(`User ${username} requested to join lobby ${lobbyCode}`);
        const lobbyData = lobbies.get(lobbyCode);
        if (!lobbyData) {
            socket.emit("queue_lobby_error", "Lobby not found");
            return;
        }
        // remove user from previous lobby or queue
        clearQueueLobbyHandler(wsState)();
        // Check if the user is already in a game
        if (wsState.gameCode) {
            if (!games.has(wsState.gameCode)) {
                // clear the game code if it doesn't exist (shouldn't happen)
                console.log(`User ${username} is in a game ${wsState.gameCode} but the game doesn't exist`);
                wsState.gameCode = null;
            } else {
                socket.emit("queue_lobby_error", "User is already in a game");
                return;
            }
        }
        
        // promote the lobby into a game
        const originalPlayerData = lobbyData.player;
        const originalWsKey = getWsKey(originalPlayerData.username);
        const originalPlayerState = connections.get(originalWsKey);
        if (!originalPlayerState) {
            console.log(`Error retrieving connection state for player ${originalWsKey}`);
            return;
        }
        clearQueueLobbyHandler(originalPlayerState)();

        makeGameRoom(lobbyData.gameConfig, originalWsKey, wsKey);
    }
}


// pair players in the queue for a given game and time control
// remove the players from the queue and create a game room
export function pairGamesInQueue(game: GameConfig) {
  const queueList = queues.get(game);
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
