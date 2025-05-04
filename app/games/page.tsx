'use client';
import Link from "next/link";
import GameTile from "./game-tile";
import { gameInfo } from "./game-info";



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
