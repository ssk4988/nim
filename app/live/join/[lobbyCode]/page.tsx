'use client';
import { useRouter, useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Lobby, PublicGame } from "@/types/websocket";
import { SocketContext } from "../../socket-context";
import { useSnackbar } from "@/components/snackbar";
import LoadingScreen from "@/components/ui/loading";
import { DEBUG } from "@/lib/constants";


// intended to only be an endpoint for joining a lobby
export default function JoinPage() {
    const router = useRouter();
    const params = useParams();
    const { socket } = useContext(SocketContext);
    const { addSnackbarMessage } = useSnackbar();
    const lobbyCodeP = params.lobbyCode;
    // redirects to /live if no lobby code is provided
    useEffect(() => {
        if (!lobbyCodeP) {
            router.replace("/live");
        }
    });
    const lobbyCode = lobbyCodeP as string;


    // load initial game data
    useEffect(() => {
        if(!socket) return;
        socket.on("queue_lobby_error", (error: string) => {
            if (DEBUG) console.log("Queue Error:", error);
            addSnackbarMessage({ text: error, error: true, duration: 5000 });
            router.replace("/live");
        });
        socket.on("game_info", (data: PublicGame<any>) => {
            let gameConfig = data.gameConfig;
            let gameCode = data.code;
            router.push(`/live/${gameConfig.gameType}/${gameCode}`);
        });
        socket.emit("join_lobby", lobbyCode);
        return () => {
            socket.removeAllListeners("queue_lobby_error");
            socket.removeAllListeners("game_info");
        }
    }, [socket, lobbyCode]);

    return <LoadingScreen text="Joining lobby..." />;
}
