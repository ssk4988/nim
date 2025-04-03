'use client';
import GameTile from "./gametile";

export default function GamePicker() {
    const games = [
        { name: 'Nim', path: '/games/nim' },
        { name: 'Marbles', path: '/games/marbles' },
    ];
    const gameTiles = games.map((game) => (
        <GameTile game={game.name} path={game.path} key={game.name} />
    ));
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gameTiles}
        </div>
    );
}
