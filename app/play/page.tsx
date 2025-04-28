'use client';
import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { SocketContext } from "./socket-context";
import { PublicGame } from "@/types/websocket";
import { useRouter } from "next/navigation";
import { liveGameTypes, liveTimeControlTypes } from "@/websocket/game-util";
import GameTile from "../games/game-tile";
import { gameInfo } from "../games/page";
import { useSnackbar } from "@/components/snackbar";
import LoadingScreen from "@/components/ui/loading";

export default function PlayPage() {
    const { socket, setSocket } = useContext(SocketContext);
    const { addSnackbarMessage } = useSnackbar();
    const router = useRouter();
    const { data: session } = useSession();
    console.log("Session data: ", session);
    const token = session?.user?.token;

    // Send an error message if user is not logged in
    useEffect(() => {
        if (!session) {
            const timeout = setTimeout(() => {
                console.log("Session not found");
                addSnackbarMessage({ text: "You must be logged in to play live games", error: true, duration: Infinity });
            }, 2000);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [session]);

    useEffect(() => {
        if (!socket) {
            console.log("Socket doesn't exist");
            return;
        }

        // Listen for messages
        socket.on("message", (data: string) => {
            addSnackbarMessage({ text: data });
        });

        // Handle connection errors
        socket.on("connection_error", (error) => {
            console.error("Error:", error);
            addSnackbarMessage({ text: "Connection error: " + error, error: true, duration: Infinity });
        });
        // handle queueing errors
        socket.on("queue_error", (error) => {
            console.error("Queue Error:", error);
            addSnackbarMessage({ text: "Queue error: " + error, error: true });
        });
        // Handle disconnection
        socket.on("disconnect", (error) => {
            console.log("Disconnect:", error);
            setSocket(null);
        });

        // handle queue success - event for successfully adding player to queue
        socket.on("queue_success", (data: string) => {
            console.log("Queue Success:", data);
            addSnackbarMessage({ text: "Queue success: " + data });
        });

        socket.on("game_info", (data: PublicGame<any>) => {
            console.log("Game Start:", data);
            const gameCode = data.code;
            const gameType = data.gameConfig.gameType;
            router.push(`/play/${gameType}/${gameCode}`);
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

    let gameTiles = liveGameTypes.map((game) => {
        let timeControls = liveTimeControlTypes.map((timeControl) => <Button key={timeControl} onClick={() => {
            socket?.emit("queue", {
                gameType: game,
                timeControl: timeControl
            });
        }}>{timeControl}</Button>);
        let infoForGame = gameInfo.find((info) => info.gameType === game)!;
        return <GameTile key={game} {...infoForGame}>
            <div className="flex flex-row mb-4 gap-2">
                {timeControls}
            </div>
        </GameTile>;
    });

    if (!socket) {
        return <LoadingScreen text="Connecting to WebSocket server..." />;
    }

    return (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
            {gameTiles}
        </div>
    );
}
