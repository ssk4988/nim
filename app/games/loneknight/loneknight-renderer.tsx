import { knightDirections, knightValidMoves } from "@/games/knight";
import { LoneKnightState } from "@/games/loneknight";
import { cn } from "@/lib/utils";
import { LoneKnightMove } from "@/types/knight";

export interface LoneKnightRendererProps {
    gameState: LoneKnightState;
    submitter: (move: LoneKnightMove) => void;
}

export default function LoneKnightRenderer({ gameState, submitter }: LoneKnightRendererProps) {
    let isPlayerTurn = gameState.turn;
    let moveSpots: { row: number, col: number, direction: number }[] = [];
    if (isPlayerTurn) {
        moveSpots = knightValidMoves(gameState.knightPosition.row, gameState.knightPosition.col).map(move => {
            return {
                row: gameState.knightPosition.row + knightDirections[move.direction].row,
                col: gameState.knightPosition.col + knightDirections[move.direction].col,
                direction: move.direction
            }
        });
    }
    let rows = [];
    for (let i = 0; i < LoneKnightState.boardHeight; i++) {
        let row = [];
        for (let j = 0; j < LoneKnightState.boardWidth; j++) {
            let isKnight = i === gameState.knightPosition.row && j === gameState.knightPosition.col;
            let cellClassName = "w-8 h-8 border flex items-center justify-center select-none";
            let tileStyle = "bg-board-square hover:bg-board-square-hover";
            let cell = null;
            let cellAction = undefined;
            if (isKnight) {
                cell = "♞";
                tileStyle = "cursor-default bg-board-square-piece hover:bg-board-square-piece-hover";
            } else if (moveSpots.some(spot => spot.row === i && spot.col === j)) {
                let direction = moveSpots.find(spot => spot.row === i && spot.col === j)!.direction;
                cellAction = () => {
                    let move: LoneKnightMove = { direction };
                    submitter(move);
                }
                cell = "•";
                tileStyle = "cursor-pointer bg-board-square-action hover:bg-board-square-action-hover";
            }
            cellClassName = cn(cellClassName, tileStyle);
            row.push(<div key={`${i}-${j}`} className={cellClassName} onClick={cellAction}>{cell}</div>);
        }
        rows.push(<div key={i} className="flex">{row}</div>);
    }
    return <div className="flex flex-col border-2">
        {rows}
    </div>;
}
