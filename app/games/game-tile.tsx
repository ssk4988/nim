'use client';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type GameTileProps = {
    game: string;
    path: string;
    description: string;
    img: string;
};

export default function GameTile({ game, path, description, img }: GameTileProps) {
    const imgPath = `/images/${img}.png`;
    return <Link href={path}>
        <Card className="flex flex-col items-center w-full">
            <CardHeader className="flex flex-col items-center">
                <CardTitle>{game}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <div className="flex items-center justify-center w-16 h-16 m-4">
                <img src={imgPath} alt="Game Icon" className="w-16 h-16" />
            </div>
        </Card>
    </Link>
}
