'use client';
import { useRouter, useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { MarblesState } from "@/games/marbles";
import { PublicGame } from "@/types/websocket";
import { SocketContext } from "../../socket-context";
import MarblesRenderer from "@/app/games/marbles/marbles-renderer";
import { useSnackbar } from "@/components/snackbar";
import { DEBUG, timerUpdatePeriod } from "@/lib/constants";
import PlayerTiles from "../../player-tiles";
import LoadingScreen from "@/components/ui/loading";


export default function MarblesLive() {
    const router = useRouter();
    const params = useParams();
    const { socket } = useContext(SocketContext);
    const { addSnackbarMessage } = useSnackbar();
    const [gameData, setGameData] = useState<PublicGame<any> | null>(null);
    const gameCodeP = params.gameCode;
    // redirects to /live if no game code is provided
    useEffect(() => {
        if (!gameCodeP) {
            router.replace("/live");
        }
    });
    const gameCode = gameCodeP as string;
    const [gameState, setGameState] = useState<MarblesState | null>(null);
    const [displayTimers, setDisplayTimers] = useState<[number, number]>([0, 0]);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    // update timers
    useEffect(() => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        setTimerInterval(setInterval(() => {
            setDisplayTimers((prevTimers) => {
                if (!gameData) return prevTimers;
                // If the game is over, stop updating the timers
                if (gameData.winner !== null) return prevTimers;
                let newTimers: [number, number] = [...gameData.playerTimes];
                let currentPlayer = gameState?.turn ? 0 : 1;
                newTimers[currentPlayer] = Math.max(0, newTimers[currentPlayer] - (Date.now() - gameData.lastUpdated));
                return newTimers;
            });
        }, timerUpdatePeriod));
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        }
    }, [gameState, gameData]);

    // load initial game data
    useEffect(() => {
        if (!socket) return;
        socket.on("game_info", (data: PublicGame<any>) => {
            if (DEBUG) console.log("Game Info:", data);
            setGameData(data);
            // create game state using class constructor
            let tempGameState = new MarblesState(data.gameState.marbles, data.gameState.turn);
            setGameState(tempGameState);
            setDisplayTimers(data.playerTimes);
        });
        socket.on("game_info_error", (error: string) => {
            addSnackbarMessage({ text: error, error: true });
        });
        socket.emit("request_game_info", gameCode);
        return () => {
            socket.removeAllListeners("game_info");
            socket.removeAllListeners("game_info_error");
        }
    }, [socket, gameCode]);


    const loaded = gameData !== null && gameState !== null;
    if (!loaded) {
        return <LoadingScreen text="Loading game..." />;
    }

    let playerTiles = <PlayerTiles players={gameData.players} timers={displayTimers} winner={gameData.winner} turn={gameState.turn} />;
    
    let marblesRenderer = <MarblesRenderer gameState={gameState} submitter={(move) => {
        // Update local game state
        const newGameState = gameState.clone();
        if (!newGameState.applyMove(move)) {
            console.error("Invalid move: ", move);
            return;
        }
        setGameState(newGameState);
        // Send move to server
        if (!socket) return;
        socket.emit("game_move", gameCode, move);
    }} />

    return <div>
        <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(99.9vh - var(--navbar-height))" }}>
            <h1 className="text-2xl font-bold my-8">Marbles</h1>
            {playerTiles}
            {marblesRenderer}
        </div>
    </div>
}
