import { GameInterface, GameTypeEnum } from "./games";

// ws:userid
export type WSID = string;

export interface PlayerData {
    userId: number; // ID of the player
    name: string; // Name of the player
}

// state of the game board, along with metadata about the game
export interface Game<GameState extends GameInterface<any, any>> {
    players: PlayerData[]; // List of players in the game (2 exactly)
    gameState: GameState; // The current state of the game
    firstPlayer: number; // The player who goes first
    winner: number | null; // the index of the player who won, or null if the game is still ongoing
    code: string; // the game code
    gameType: GameTypeEnum; // the type of game
};

// state of the current connection
export interface WSState {
    socketId: string | null; // the socket ID of the connection
    userId: number;
    userEmail: string;
    currentQueue: GameTypeEnum | null; // the game the user is currently queued for
    gameCode: string | null; // the game code of the current game
};
