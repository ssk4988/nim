'use client';
import { useRouter, useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { GameContext } from "../../game-context";
import { NimState } from "@/games/nim";
import { Game } from "@/types/websocket";
import { SocketContext } from "../../socket-context";
import { NimMove } from "@/types/nim";
import NimRenderer from "@/app/games/nim/nim-renderer";
import { Crown } from "lucide-react";

export default function NimLive() {
    const router = useRouter();
    const params = useParams();
    const { socket } = useContext(SocketContext);
    const [gameData, setGameData] = useState<Game<any> | null>(null);
    const gameCodeP = params.gameCode;
    if (!gameCodeP || !socket) {
        router.replace("/play");
        return null;
    }
    const gameCode = gameCodeP as string;
    const [gameState, setGameState] = useState<NimState | null>(null);

    // load initial game data
    useEffect(() => {
        socket.on("game_info", (data: Game<any>) => {
            console.log("Game Info:", data);
            setGameData(data);
            let tempGameState = new NimState(data.gameState.piles, data.gameState.turn);
            setGameState(tempGameState);
        });
        socket.emit("request_game_info", gameCode);
        return () => {
            socket.off("game_info");
        }
    }, [socket, gameCode]);


    const loaded = gameData !== null && gameState !== null;
    if (!loaded) {
        return <div>Loading...</div>
    }
    let statusMessage = "";
    if (gameState.isGameOver()) {
        statusMessage = gameState.turn ? "You lose!" : "You win!";
    } else {
        statusMessage = gameState.turn ? "It's your turn!" : "It's the other player's turn...";
    }

    let playerTiles = <div className="grid grid-cols-2 gap-4 w-5/6">
        {gameData.players.map((player, index) => {
            let pfp = <div className={`w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center ${index === 0 ? "mr-2" : "ml-2"}`}>
                {player.name[0]}
            </div>;
            let name = <div className="max-w-[250px] overflow-hidden text-ellipsis">
                {player.name}
            </div>;
            let crown = gameData.winner !== null && gameData.winner == index ? <Crown className="ml-2 text-yellow-500" fill="currentColor"/> : null;
            let timerColor = gameState.turn == (index === 0) ? "bg-white" : "bg-gray-300";
            let timer = <div className={`w-12 h-12 rounded-sm border flex items-center justify-center ${timerColor} justify-self-${index === 0 ? "end" : "start"}`}>
                5:00
            </div>;
            return (
                <div key={index} className={`flex flex-row items-center justify-between border p-2 rounded-lg`}>
                    <div className="flex flex-row items-center">
                        {index == 0 ? [pfp, name, crown] : [timer]}
                    </div>
                    <div className="flex flex-row items-center">
                        {index == 0 ? [timer] : [crown, name, pfp]}
                    </div>
                </div>
            )
        })}
    </div>

    let nimRenderer = <NimRenderer gameState={gameState} submitter={(move) => {
        // Update local game state
        const newGameState = gameState.clone();
        if (!newGameState.applyMove(move)) {
            console.log("Invalid move: ", move);
            return;
        }
        setGameState(newGameState);
        // Send move to server
        socket.emit("game_move", gameCode, move);
    }} />

    return <div>
        <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(100vh - var(--navbar-height))" }}>
            <h1 className="text-2xl font-bold my-8">Nim Game</h1>
            {playerTiles}
            {nimRenderer}
        </div>
    </div>
}
