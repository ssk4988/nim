import { Socket } from "socket.io";
import { GameConfig, GameInterface, GameTypeEnum } from "./games";

// ws:username
export type WSID = string;

export interface PlayerData {
    userId: number; // ID of the player
    name: string; // Name of the player
    username: string; // Username of the player
}

export interface PublicPlayerData {
    name: string; // Name of the player
    username: string; // Username of the player
}

// internal state of the game board, along with metadata about the game
export interface Game<GameState extends GameInterface<any, any>> {
    players: [PlayerData, PlayerData]; // List of players in the game (2 exactly)
    gameState: GameState; // The current state of the game
    firstPlayer: number; // The player who goes first
    playerTurn: number; // The player whose turn it is
    winner: number | null; // the index of the player who won, or null if the game is still ongoing
    code: string; // the game code
    gameConfig: GameConfig; // the type of game
    playerTimes: [number, number]; // the time remaining for each player (in milliseconds)
    lastUpdated: number; // the last time the game was updated (in milliseconds since epoch)
}

// public state of the game board, along with metadata about the game
export interface PublicGame<GameState extends GameInterface<any, any>> {
    players: [PublicPlayerData, PublicPlayerData]; // List of players in the game (2 exactly)
    gameState: GameState; // The current state of the game
    firstPlayer: number; // The player who goes first
    winner: number | null; // the index of the player who won, or null if the game is still ongoing
    code: string; // the game code
    gameConfig: GameConfig; // the type of game
    playerTimes: [number, number]; // the time remaining for each player (in milliseconds)
    lastUpdated: number; // the last time the game was updated (in milliseconds since epoch)
}

// game room with only one player
export interface Lobby {
    lobbyCode: string; // the lobby code
    gameConfig: GameConfig; // the type of game
    player: PlayerData; // the player in the lobby
}

// state of the current connection
export interface WSState {
    socketId: string | null; // the socket ID of the connection
    userId: number;
    userEmail: string;
    username: string;
    currentQueue: GameConfig | null; // the game the user is currently queued for
    currentLobby: string | null; // the game code of the current lobby
    gameCode: string | null; // the game code of the current game or lobby
}

export interface ServerToClientEvents {
    "message": (data: any) => void;
    "connection_error": (error: string) => void;
    "queue": (gameConfig: GameConfig) => void;
    "queue_lobby_error": (error: string) => void; // error when trying to queue or lobby
    "queue_lobby_success": (message: string) => void;
    "request_game_info": (gameCode: string) => void;
    "game_info": (data: PublicGame<any>) => void;
    "game_info_error": (error: string) => void;
    "game_move": (gameCode: string, move: any) => void;
    "game_move_error": (error: string) => void;
    "lobby_info": (data: Lobby) => void;
    "lobby_info_error": (error: string) => void;
}

export interface ClientToServerEvents {
    "message": (data: any) => void;
    "queue": (game: GameConfig) => void;
    "request_game_info": (gameCode: string) => void;
    "game_move": (gameCode: string, move: any) => void;
    "lobby": (gameConfig: GameConfig) => void;
    "join_lobby": (lobbyCode: string) => void;
    "clear_queue_lobby": () => void;
    "request_lobby_info": (lobbyCode: string) => void;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
