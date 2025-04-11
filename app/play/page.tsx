'use client';
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function PlayPage() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [wsError, setWsError] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const { data: session } = useSession();
    console.log("Session data: ", session);
    const token = session?.user?.token;

    useEffect(() => {
        console.log("Connecting to WebSocket server at ", process.env.NEXT_PUBLIC_WEBSOCKET_URL);
        if (!token) {
            console.error("No token found in session");
            return;
        }
        // Create a new WebSocket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
            auth: {
                token: token
            }
        });
        setSocket(socketInstance);

        // Listen for messages
        socketInstance.on("message", (data: string) => {
            setMessages((prev) => [...prev, data]);
        });
        socketInstance.send("message", "Hello from client");

        // Handle connection errors
        socketInstance.on("connection_error", (error) => {
            console.error("Error:", error);
            setWsError(error);
        });
        socketInstance.on("disconnect", (error) => {
            console.error("Disconnect:", error);
            setSocket(null);
        });

        // Cleanup on component unmount
        return () => {
            socketInstance.disconnect();
            setSocket(null);
        };

    }, [session]);

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
        </div>
    );
}
