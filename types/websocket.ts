import { Socket } from "socket.io";
import { GameConfig, GameInterface, GameTypeEnum } from "./games";

// ws:userid
export type WSID = string;

export interface PlayerData {
    userId: number; // ID of the player
    name: string; // Name of the player
}

export interface PublicPlayerData {
    name: string; // Name of the player
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

// state of the current connection
export interface WSState {
    socketId: string | null; // the socket ID of the connection
    userId: number;
    userEmail: string;
    currentQueue: GameConfig | null; // the game the user is currently queued for
    gameCode: string | null; // the game code of the current game
}

export interface ServerToClientEvents {
    "message": (data: any) => void;
    "connection_error": (error: string) => void;
    "queue": (gameConfig: GameConfig) => void;
    "queue_error": (error: string) => void;
    "queue_success": (message: string) => void;
    "request_game_info": (gameCode: string) => void;
    "game_info": (data: PublicGame<any>) => void;
    "game_info_error": (error: string) => void;
    "game_move": (gameCode: string, move: any) => void;
    "game_move_error": (error: string) => void;
}

export interface ClientToServerEvents {
    "message": (data: any) => void;
    "queue": (game: GameConfig) => void;
    "request_game_info": (gameCode: string) => void;
    "game_move": (gameCode: string, move: any) => void;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
