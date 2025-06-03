'use client';
import { MultiKnightState } from "@/games/multiknight";
import MarkdownWrapper from "../markdown-wrapper";
import { useState } from "react";
import { Cell } from "@/types/knight";
import MultiKnightRenderer from "@/app/games/multiknight/multiknight-renderer";

const content = `
## How to Play Multi Knight
### Rules
Multi Knight is a modified version of [Lone Knight](/articles/loneknight-how) where there are multiple
knights on the same board. In each turn, the player must move one of the knights. Multiple knights can
occupy the same square without interfering with each other. If multiple knights are on the same square,
you can only move one of them at a time. The game ends when there are no more valid moves left for any knight.

### Using this Site
When playing Multi Knight on this website, you will see a chessboard with multiple knights on it.
When it is your turn, you can click on one of the squares with a knight on it. Then a set of possible
moves for that knight will be highligted. Click one of the highlighted squares to make the move.
Try viewing possible moves for each knight on the board below!  
  
`;
export default function HowToPlayMultiKnight() {
    let grid: number[][] = [];
    for (let i = 0; i < 8; i++) {
        let row: number[] = [];
        for (let j = 0; j < 8; j++) {
            row.push(0);
        }
        grid.push(row);
    }
    grid[0][5] = 1;
    grid[3][4] = 2;
    grid[2][6] = 1;
    grid[7][2] = 1;
    const multiKnightState = new MultiKnightState(grid, true);
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
    return <div className="m-4">
        <MarkdownWrapper content={content} />
        <div className="mt-4">
            <MultiKnightRenderer gameState={multiKnightState} selectedCell={selectedCell} setSelectedCell={setSelectedCell} />
        </div>
    </div>;
}
