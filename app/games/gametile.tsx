'use client';
import Link from "next/link";

export default function GameTile({ game, path }: { game: string; path: string }) {
    const imgPath = `/images/${game.toLowerCase()}.png`; 
    return <div>
        <Link href={path} className="flex flex-col items-center justify-center w-full h-full p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-200">
                <img src={imgPath} alt="Game Icon" className="w-12 h-12" />
            </div>
        </Link>
    </div>
}
