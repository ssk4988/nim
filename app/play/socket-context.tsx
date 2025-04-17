'use client';

import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
}

export const SocketContext = createContext<SocketContextType>({socket: null, setSocket: () => {}});
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = React.useState<Socket | null>(null);
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
        });

        // Check if the connection was established after a short delay
        const connectionTimeout = setTimeout(() => {
            if (!socketInstance.connected) {
                console.error("WebSocket connection failed.");
            }
        }, 3000);
        setSocket(socketInstance);
        // cleanup function to disconnect the socket when the component unmounts
        return () => {
            if (socket) {
                socket.disconnect();
                console.log("Socket disconnected");
            }
            clearTimeout(connectionTimeout);
            console.log("Connection timeout cleared");
            setSocket(null);
        };
    }, [token]);

    return (
        <SocketContext value={{ socket, setSocket }}>
            {children}
        </SocketContext>
    );
};
