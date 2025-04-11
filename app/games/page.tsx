'use client';
import GameTile from "./game-tile";

export default function GamePicker() {
    const games = [
        { game: 'Nim', path: '/games/nim', description: 'Remove stones from any pile', img: 'nim' },
        { game: 'Marbles', path: '/games/marbles', description: 'Remove 1-3 marbles at a time', img: 'marbles' },
        { game: 'Lone Knight', path: '/games/loneknight', description: 'Move one knight', img: 'loneknight' },
        { game: 'Multi Knight', path: '/games/multiknight', description: 'Move multiple knights', img: 'multiknight' },
    ];
    const gameTiles = games.map((game) => (
        <GameTile {...game} key={game.game} />
    ));
    return (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
            {gameTiles}
        </div>
    );
}
