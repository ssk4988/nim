'use client';
import Link from "next/link";
import GameTile from "./game-tile";
import { displayGameType, GameTypeEnum } from "@/types/games";

export const gameInfo = [
    { game: displayGameType(GameTypeEnum.NIM), path: '/games/nim', description: 'Remove stones from any pile', img: 'nim', gameType: GameTypeEnum.NIM },
    { game: displayGameType(GameTypeEnum.MARBLES), path: '/games/marbles', description: 'Remove 1-3 marbles at a time', img: 'marbles', gameType: GameTypeEnum.MARBLES },
    { game: displayGameType(GameTypeEnum.LONE_KNIGHT), path: '/games/loneknight', description: 'Move one knight', img: 'loneknight', gameType: GameTypeEnum.LONE_KNIGHT },
    { game: displayGameType(GameTypeEnum.MULTI_KNIGHT), path: '/games/multiknight', description: 'Move multiple knights', img: 'multiknight', gameType: GameTypeEnum.MULTI_KNIGHT },
];

export default function GamePicker() {
    const gameTiles = gameInfo.map((game) => (
        <Link href={game.path} key={game.game}>
            <GameTile {...game} />
        </Link>
    ));
    return (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
            {gameTiles}
        </div>
    );
}
