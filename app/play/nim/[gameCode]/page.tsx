'use client';
import { useRouter, useParams } from "next/navigation";
import { useContext, useState } from "react";
import { GameContext } from "../../game-context";
import { NimState } from "@/games/nim";

export default function NimLive() {
    const router = useRouter();
    const params = useParams();
    const { gameData: initGameData } = useContext(GameContext);
    const [gameData, setGameData] = useState(initGameData);
    const gameCodeP = params.gameCode;
    if(!gameCodeP || !initGameData) {
        router.replace("/play");
        return null;
    }
    const [gameState, setGameState] = useState<NimState>(initGameData.gameState);

    const gameCode = gameCodeP as string;
    return <div>
        <p>{gameCode} </p>
        <p>{JSON.stringify(initGameData)}</p>
    </div>
}
