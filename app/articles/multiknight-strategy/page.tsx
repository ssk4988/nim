'use client'
import { useState } from "react";
import MarkdownWrapper from "../markdown-wrapper";
import { Button } from "@/components/ui/button";
import Chessboard, { CellInfo } from "@/components/ui/chessboard";
import { LoneKnightState } from "@/games/loneknight";
import { knightGrundyValues } from "@/games/knight";

const initialContent = `
## Multi Knight: Strategy
### Determining Winning and Losing States
To determine the winning and losing states for Multi Knight, we will have to use the Sprague-Grundy theorem
and calculate the Grundy values for the positions we care about.
### Observation of Independent Games
The key observation in Multi Knight is that each knight is independent of the others and is its own game.
Each of these games is actually a game of Lone Knight. There are only 64 positions in Lone Knight, so
we can calculate the Grundy values for all of them. Try to calculate the Grundy values for the positions
on your own before looking at the solution. Hint: Start with the positions that have no valid moves.
`;

const hiddenContent = `
The Grundy numbers are as follows:
`;

const hiddenContent2 = `
### Strategy
For each knight, calculate the Grundy number of the position and play nim on the equivalent piles of stones.
`;
export default function MultiKnightStrategy() {
    const [showMore, setShowMore] = useState(false);
    const rows: CellInfo[][] = [];
    for (let i = 0; i < LoneKnightState.boardHeight; i++) {
        const row: CellInfo[] = [];
        for (let j = 0; j < LoneKnightState.boardWidth; j++) {
            row.push({
                tileStyle: "bg-board-square",
                inner: knightGrundyValues[i][j]
            });
        }
        rows.push(row);
    }
    return <div className="m-4">
        <MarkdownWrapper content={initialContent} />
        <Button onClick={() => setShowMore((previous) => !previous)} className="mt-4 mb-4">{showMore ? "Hide" : "Show"} More</Button>
        {showMore && <MarkdownWrapper content={hiddenContent} />}
        {showMore && <Chessboard cells={rows} />}
        {showMore && <MarkdownWrapper content={hiddenContent2} />}
    </div>;
}
