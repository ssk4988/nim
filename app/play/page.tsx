'use client';
import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { SocketContext } from "./socket-context";
import { GameContext } from "./game-context";
import { PublicGame } from "@/types/websocket";
import { useRouter } from "next/navigation";
import { GameTypeEnum, TimeControlEnum } from "@/types/games";

export default function PlayPage() {
    const { socket, setSocket } = useContext(SocketContext);
    const { gameData, setGameData } = useContext(GameContext);
    const [wsError, setWsError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const router = useRouter();
    const { data: session } = useSession();
    console.log("Session data: ", session);
    const token = session?.user?.token;

    useEffect(() => {
        if (!socket) {
            console.log("Socket doesn't exist");
            return;
        }
        setWsError(null);

        // Listen for messages
        socket.on("message", (data: string) => {
            setMessages((prev) => [...prev, data]);
        });

        // Handle connection errors
        socket.on("connection_error", (error) => {
            console.error("Error:", error);
            setWsError(error);
        });
        // handle queueing errors
        socket.on("queue_error", (error) => {
            console.error("Queue Error:", error);
            setWsError(error);
        });
        // Handle disconnection
        socket.on("disconnect", (error) => {
            console.error("Disconnect:", error);
            setSocket(null);
        });

        // handle queue success - event for successfully adding player to queue
        socket.on("queue_success", (data: string) => {
            console.log("Queue Success:", data);
            setMessages((prev) => [...prev, data]);
        });

        socket.on("game_info", (data: PublicGame<any>) => {
            console.log("Game Start:", data);
            const gameCode = data.code;
            setGameData(data);
            router.push("/play/nim/" + gameCode);
        });

        // Cleanup on component unmount
        return () => {
            socket.removeAllListeners("message");
            socket.removeAllListeners("connection_error");
            socket.removeAllListeners("queue_error");
            socket.removeAllListeners("disconnect");
            socket.removeAllListeners("queue_success");
            socket.removeAllListeners("game_start");
            console.log("Socket listeners removed");
        };
    }, [socket]);

    return (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
            <div className="col-span-4">
                <h1>WebSocket Client</h1>
                <p>
                    {socket ? "Connected to WebSocket server" : "Disconnected from WebSocket server"}
                </p>
            </div>
            <div className="col-span-4">
                <h2>WebSocket Error:</h2>
                {wsError ? <p className="text-red-500">{wsError}</p> : <p className="text-green-500">No errors</p>}
            </div>
            <div className="col-span-4">
                <h2>Messages from server:</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
            <Button onClick={() => {
                if (socket) {
                    socket.emit("message", "Hello from client");
                }
            }}>
                Send Message
            </Button>
            {socket && <Button onClick={() => {
                socket.emit("queue", {
                    gameType: GameTypeEnum.NIM,
                    timeControl: TimeControlEnum.MIN5
                });
            }}>
                Add to Queue: Nim 5m
            </Button>}
        </div>
    );
}
