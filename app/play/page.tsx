'use client';
import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { SocketContext } from "./socket-context";
import { GameContext } from "./game-context";
import { Game } from "@/types/websocket";
import { useRouter } from "next/navigation";

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

        socket.on("game_info", (data: Game<any>) => {
            console.log("Game Start:", data);
            const gameCode = data.code;
            setGameData(data);
            router.push("/play/nim/" + gameCode);
        });

        // Cleanup on component unmount
        return () => {
            socket.off("message");
            socket.off("connection_error");
            socket.off("queue_error");
            socket.off("disconnect");
            socket.off("queue_success");
            socket.off("game_start");
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
                socket.emit("queue", "nim");
            }}>
                Add to Queue
            </Button>}
        </div>
    );
}
