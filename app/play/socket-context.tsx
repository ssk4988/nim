'use client';

import { ClientToServerEvents, ServerToClientEvents } from "@/types/websocket";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { createContext, useContext } from "react";
import { Socket } from "socket.io";
import { io } from "socket.io-client";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
    socket: TypedSocket | null;
    setSocket: React.Dispatch<React.SetStateAction<TypedSocket | null>>;
}

export const SocketContext = createContext<SocketContextType>({socket: null, setSocket: () => {}});
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = React.useState<TypedSocket | null>(null);
    const { data: session } = useSession();
    const token = session?.user?.token;

    useEffect(() => {
        console.log("Connecting to WebSocket server at ", process.env.NEXT_PUBLIC_WEBSOCKET_URL);
        if (!token) {
            console.error("No token found in session, not creating socket");
            return;
        }
        // Create a new WebSocket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
            auth: {
                token: token
            }
        }) as unknown as TypedSocket;

        // Check if the connection was established after a short delay
        const connectionTimeout = setTimeout(() => {
            if (!socketInstance.connected) {
                console.error("WebSocket connection failed.");
            }
        }, 3000);
        setSocket(socketInstance);
        // cleanup function to disconnect the socket when the component unmounts
        return () => {
            console.log("Socket disconnected");
            socketInstance.disconnect();
            clearTimeout(connectionTimeout);
            setSocket(null);
        };
    }, [token]);

    return (
        <SocketContext value={{ socket, setSocket }}>
            {children}
        </SocketContext>
    );
};
