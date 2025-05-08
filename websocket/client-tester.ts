import { ClientToServerEvents, ServerToClientEvents } from "@/types/websocket";
import { io, Socket } from "socket.io-client";


type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

try {
    const socket = io("wss://nimgames.net/");
    socket.on("connect", () => {
        console.log("Connected to WebSocket server");
    });
    socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
    });
} catch (error) {
    console.error("Error connecting to WebSocket server:", error);
}
