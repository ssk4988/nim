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
import { Card } from "@radix-ui/themes";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { displayGameType, displayTimeControl, GameTypeEnum, TimeControlEnum } from "@/types/games";
import { Switch } from "@/components/ui/switch";
import { User } from "lucide-react";

export default function PlayPage() {
    const { socket, setSocket } = useContext(SocketContext);
    const { addSnackbarMessage } = useSnackbar();
    const router = useRouter();
    const { data: session } = useSession();
    console.log("Session data: ", session);
    const token = session?.user?.token;
    const [selectedGame, setSelectedGame] = useState<GameTypeEnum>(GameTypeEnum.NIM);
    const [timeControl, setTimeControl] = useState<TimeControlEnum>(TimeControlEnum.MIN5);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [playRandom, setPlayRandom] = useState(true);
    const handleCreateGame = () => {
        if (!socket || !session) return;
        if (isCreatingRoom) {
            console.log("Canceling room creation");
            socket.emit("clear_queue");
            setIsCreatingRoom(false);
            return;
        }
        setIsCreatingRoom(true);
        socket?.emit("queue", {
            gameType: selectedGame,
            timeControl: timeControl
        });
    };

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
    

    const gameOptions = liveGameTypes.map((game) => {
        return <SelectItem key={game} value={game}>{displayGameType(game)}</SelectItem>;
    });

    const timeControlOptions = liveTimeControlTypes.map((timeControl) => {
        return <SelectItem key={timeControl} value={timeControl}>{displayTimeControl(timeControl)}</SelectItem>;
    });

    if (!socket) {
        return <LoadingScreen text="Connecting to WebSocket server..." />;
    }

    return <div className="w-full flex flex-col items-center">
        <Card className="border-2 rounded-lg p-4 mb-4">
            <CardHeader className="flex flex-col items-center">
                <CardTitle className="text-2xl font-bold">Live Games</CardTitle>
                <CardContent>
                    <CardDescription>
                        Select a game type and time control to join a live game.
                    </CardDescription>
                </CardContent>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="game-select">Select Game</Label>
                    <Select value={selectedGame} onValueChange={(value: GameTypeEnum) => setSelectedGame(value)}>
                        <SelectTrigger id="game-select" className="w-full">
                            <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Games</SelectLabel>
                                {gameOptions}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="time-control">Time Control</Label>
                    <Select value={timeControl} onValueChange={(value: TimeControlEnum) => setTimeControl(value)}>
                        <SelectTrigger id="time-control" className="w-full">
                            <SelectValue placeholder="Select time control" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Time Controls</SelectLabel>
                                {timeControlOptions}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="ranked-mode" checked={playRandom} onCheckedChange={setPlayRandom} />
                  <Label htmlFor="ranked-mode" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Random Opponent
                  </Label>
                </div>

            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleCreateGame} disabled={!socket}>
                    {isCreatingRoom ? <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full mr-2  "></div> : null}
                    {isCreatingRoom ? "Looking for Opponent... (Click to Cancel)" : "Play Game"}
                </Button>
            </CardFooter>
        </Card>
    </div>
}
