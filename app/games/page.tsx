import Link from "next/link";

function GameTile({ game, path }: { game: string; path: string }) {
    const imgPath = `/images/${game.toLowerCase()}.png`; 
    return <div>
        <Link href={path} className="flex flex-col items-center justify-center w-full h-full p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-200">
                <img src={imgPath} alt="Game Icon" className="w-12 h-12" />
                {/* <span className="mt-2 text-lg font-semibold">{game}</span> */}
            </div>
        </Link>
    </div>
}

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
