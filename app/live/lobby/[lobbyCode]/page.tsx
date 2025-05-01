'use client';
import { useRouter, useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Lobby, PublicGame } from "@/types/websocket";
import { SocketContext } from "../../socket-context";
import { useSnackbar } from "@/components/snackbar";
import LoadingScreen from "@/components/ui/loading";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { displayGameType, displayTimeControl } from "@/types/games";
import { Button } from "@/components/ui/button";
import { Copy, Link2 } from "lucide-react";


export default function LobbyPage() {
    const router = useRouter();
    const params = useParams();
    const { socket } = useContext(SocketContext);
    const [lobbyData, setLobbyData] = useState<Lobby | null>(null);
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
        if (!socket) return;
        socket.on("lobby_info", (data: Lobby) => {
            console.log("Lobby Info:", data);
            setLobbyData(data);
        });
        socket.on("lobby_info_error", (error: string) => {
            console.log("Lobby Error:", error);
            addSnackbarMessage({ text: error, error: true, duration: 5000 });
            // router.replace("/live");
        });
        socket.on("queue_lobby_error", (error: string) => {
            console.log("Queue Error:", error);
            addSnackbarMessage({ text: error, error: true, duration: 5000 });
        });
        socket.on("game_info", (data: PublicGame<any>) => {
            let gameConfig = data.gameConfig;
            let gameCode = data.code;
            router.push(`/live/${gameConfig.gameType}/${gameCode}`);
        });
        socket.emit("request_lobby_info", lobbyCode);
        return () => {
            socket.removeAllListeners("lobby_info");
            socket.removeAllListeners("lobby_info_error");
            socket.removeAllListeners("queue_lobby_error");
            socket.removeAllListeners("game_info");
        }
    }, [socket, lobbyCode]);

    const loaded = lobbyData !== null;
    if (!loaded) {
        return <LoadingScreen text="Loading lobby..." />;
    }
    return <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(99.9vh - var(--navbar-height))" }}>
        <Card>
            <CardHeader>
                <CardTitle>Lobby Code: {lobbyData.lobbyCode}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <div className="flex flex-row items-center mb-4">
                        <Copy className="mr-2 cursor-pointer" onClick={() => {
                            navigator.clipboard.writeText(lobbyCode);
                            addSnackbarMessage({ text: "Lobby code copied to clipboard", duration: 2000 });
                        }} />
                        <Link2 className="mr-2 cursor-pointer" onClick={() => {
                            const routeLink = `${window.location.origin}/live/join/${lobbyCode}`;
                            navigator.clipboard.writeText(routeLink);
                            addSnackbarMessage({ text: "Lobby link copied to clipboard", duration: 2000 });
                        }} />
                    </div>
                    <p className="text-lg">Game Type: {displayGameType(lobbyData.gameConfig.gameType)}</p>
                    <p className="text-lg">Time Control: {displayTimeControl(lobbyData.gameConfig.timeControl)}</p>
                    <div className="flex flex-row items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2" />
                        <p>Waiting for someone to join...</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="mt-4 w-full" onClick={() => {
                    if(!socket) return;
                    socket.emit("clear_queue_lobby");
                    router.replace("/live");
                }}>Cancel</Button>
            </CardFooter>
        </Card>
    </div>
}
