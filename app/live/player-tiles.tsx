import { formatDuration } from "@/types/games";
import { PublicPlayerData } from "@/types/websocket";
import { Crown } from "lucide-react";

export interface PlayerTilesProps {
    players: [PublicPlayerData, PublicPlayerData];
    timers: [number, number];
    winner: number | null;
    turn: boolean;
};

export default function PlayerTiles({ players, timers, winner, turn }: PlayerTilesProps) {
    return <div className="grid grid-cols-2 gap-4 w-5/6">
        {players.map((player, index) => {
            let pfp = <div className={`w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center ${index === 0 ? "mr-2" : "ml-2"}`}>
                {player.name[0]}
            </div>;
            let name = <div className="max-w-[250px] overflow-hidden text-ellipsis">
                {player.name}
            </div>;
            let timer = timers[index];
            let timerFormatted = formatDuration(timer);
            let crown = winner !== null && winner == index ? <Crown className="ml-2 text-yellow-500" fill="currentColor" /> : null;
            let timerColor = turn == (index === 0) ? "bg-white" : "bg-gray-300";
            let timerDisplay = <div className={`w-12 h-12 rounded-sm border flex items-center justify-center ${timerColor} justify-self-${index === 0 ? "end" : "start"}`}>
                {timerFormatted}
            </div>;
            return <div key={index} className={`flex flex-row items-center justify-between border p-2 rounded-lg`}>
                <div className="flex flex-row items-center">
                    {index == 0 ? [pfp, name, crown] : [timerDisplay]}
                </div>
                <div className="flex flex-row items-center">
                    {index == 0 ? [timerDisplay] : [crown, name, pfp]}
                </div>
            </div>
        })}
    </div>
}
