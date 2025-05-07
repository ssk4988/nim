'use client';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GameTileProps {
    game: string;
    description?: string;
    img: string;
    children?: React.ReactNode;
};

export default function GameTile({ game, description, img, children }: GameTileProps) {
    const imgPath = `/images/${img}.png`;
    return <Card className="flex flex-col items-center w-full">
        <CardHeader className="flex flex-col items-center">
            <CardTitle>{game}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <div className="flex items-center justify-center w-16 h-16 m-4">
            <img src={imgPath} alt="Game Icon" className="w-16 h-16" />
        </div>
        {children}
    </Card>
}
