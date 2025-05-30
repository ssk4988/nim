'use client'
import { useState } from "react";
import MarkdownWrapper from "../markdown-wrapper";
import { Button } from "@/components/ui/button";
import Chessboard, { CellInfo } from "@/components/ui/chessboard";
import { LoneKnightState } from "@/games/loneknight";
import { knightGrundyValues } from "@/games/knight";

const initialContent = `
## Lone Knight: Strategy
### Determining Winning and Losing States
You can determine the strategy for Lone Knight by determining the winning and losing states.
This is a worthwhile exercise to do yourself. A starting point is the squares on the board that 
have no valid moves:  
`;
const initialContent2 = `
Again, try to fill in the rest of the board yourself before looking at the solution.
`;

const hiddenContent = `
The winning and losing states are as follows:
`;

const hiddenContent2 = `
### Observations
With the exception of the top left square (hopefully you didn't miss that one), the losing squares 
form 2x2 blocks that are separated by 2 rows and 2 columns. This is a consequence of the fact that 
the knight can't move 3 squares in a direction.
`;
export default function LoneKnightStrategy() {
    const [showMore, setShowMore] = useState(false);
    let rows: CellInfo[][] = [];
    for (let i = 0; i < LoneKnightState.boardHeight; i++) {
        let row: CellInfo[] = [];
        for (let j = 0; j < LoneKnightState.boardWidth; j++) {
            const bad = (i + 2 >= LoneKnightState.boardHeight && j + 2 >= LoneKnightState.boardWidth);
            row.push({
                tileStyle: "bg-board-square",
                inner: bad ? "L" : ""
            });
        }
        rows.push(row);
    }
    let rows2: CellInfo[][] = [];
    for (let i = 0; i < LoneKnightState.boardHeight; i++) {
        let row: CellInfo[] = [];
        for (let j = 0; j < LoneKnightState.boardWidth; j++) {
            const bad = knightGrundyValues[i][j] === 0;
            row.push({
                tileStyle: "bg-board-square",
                inner: bad ? "L" : "W"
            });
        }
        rows2.push(row);
    }
    return <div className="m-4">
        <MarkdownWrapper content={initialContent} />
        <div className="my-4">
            <Chessboard cells={rows} />;
        </div>
        <MarkdownWrapper content={initialContent2} />
        <Button onClick={() => setShowMore((previous) => !previous)} className="mt-4 mb-4">{showMore ? "Hide" : "Show"} More</Button>
        {showMore && <MarkdownWrapper content={hiddenContent} />}
        {showMore && <Chessboard cells={rows2} />}
        {showMore && <MarkdownWrapper content={hiddenContent2} />}
    </div>;
}
