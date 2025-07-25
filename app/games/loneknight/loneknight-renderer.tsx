import Chessboard, { CellInfo } from "@/components/ui/chessboard";
import { knightDirections, knightValidMoves } from "@/games/knight";
import { LoneKnightState } from "@/games/loneknight";
import { cn } from "@/lib/utils";
import { LoneKnightMove } from "@/types/knight";

export interface LoneKnightRendererProps {
    gameState: LoneKnightState;
    submitter?: (move: LoneKnightMove) => void;
}

export default function LoneKnightRenderer({ gameState, submitter }: LoneKnightRendererProps) {
    const isPlayerTurn = gameState.turn;
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
    const rows: CellInfo[][] = [];
    for (let i = 0; i < LoneKnightState.boardHeight; i++) {
        const row: CellInfo[] = [];
        for (let j = 0; j < LoneKnightState.boardWidth; j++) {
            const isKnight = i === gameState.knightPosition.row && j === gameState.knightPosition.col;
            let tileStyle = "bg-board-square hover:bg-board-square/50";
            let cell = undefined;
            let cellAction = undefined;
            if (isKnight) {
                cell = "♞";
                tileStyle = "cursor-default bg-board-square hover:bg-board-square/50";
            } else if (moveSpots.some(spot => spot.row === i && spot.col === j)) {
                const direction = moveSpots.find(spot => spot.row === i && spot.col === j)!.direction;
                cellAction = submitter ? () => {
                    const move: LoneKnightMove = { direction };
                    submitter(move);
                } : undefined;
                cell = "•";
                tileStyle = "cursor-pointer bg-board-square-action hover:bg-board-square-action/80";
            }
            row.push({
                tileStyle: tileStyle,
                inner: cell,
                cellAction: cellAction
            });
        }
        rows.push(row);
    }
    return <Chessboard cells={rows} />;
}
