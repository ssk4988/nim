import { Game, Lobby, TypedSocket, WSState } from "@/types/websocket";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server as WebSocketServer } from "socket.io";
import { KeyMap } from "./key-map";
import { GameConfig, GameInterface } from "@/types/games";
import { liveGameTypes, liveTimeControlTypes } from "./game-util";


// Create a Prisma Client instance
export const prisma = new PrismaClient();

// Create an HTTP server for the WebSocket server
export const httpServer = createServer();

// Initialize the WebSocket server
export const io = new WebSocketServer(httpServer, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "POST"],
  },
});

// Map of connections
export const connections: Map<string, WSState> = new Map();

// queue of unpaired connections for games
export const queues: KeyMap<GameConfig, string[]> = new KeyMap();

// Initialize the queue for each game type and time control
for (const gameType of liveGameTypes) {
  for (const timeControl of liveTimeControlTypes) {
    queues.set({ gameType: gameType, timeControl: timeControl }, []);
  }
}

// map of games
export const games: Map<string, Game<GameInterface<any, any>>> = new Map();

// map of game timeouts
export const gameTimeouts: Map<string, NodeJS.Timeout> = new Map();

// map of lobbies
export const lobbies: Map<string, Lobby> = new Map();

export function getWsKey(userId: number): string {
  return `ws:${userId}`;
}
