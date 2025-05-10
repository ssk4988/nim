import Chessboard, { CellInfo } from "@/components/ui/chessboard";
import { knightDirections, knightValidMoves } from "@/games/knight";
import { MultiKnightState } from "@/games/multiknight";
import { cn } from "@/lib/utils";
import { Cell, MultiKnightMove } from "@/types/knight";
import { Badge } from "@radix-ui/themes";
import { SetStateAction } from "react";

export interface MultiKnightRendererProps {
    gameState: MultiKnightState;
    selectedCell: Cell | null;
    submitter?: (move: MultiKnightMove) => void;
    setSelectedCell: (value: SetStateAction<Cell | null>) => void;
}

export default function MultiKnightRenderer({ gameState, selectedCell, submitter, setSelectedCell }: MultiKnightRendererProps) {
    let isPlayerTurn = gameState.turn;
    let moveSpots: { row: number, col: number, direction: number }[] = [];
    if (isPlayerTurn && selectedCell != null) {
        let { row, col } = selectedCell;
        moveSpots = knightValidMoves(row, col).map(move => {
            return {
                row: row + knightDirections[move.direction].row,
                col: col + knightDirections[move.direction].col,
                direction: move.direction
            }
        });
    }
    let rows: CellInfo[][] = [];
    for (let i = 0; i < MultiKnightState.boardHeight; i++) {
        let row: CellInfo[] = [];
        for (let j = 0; j < MultiKnightState.boardWidth; j++) {
            let hasKnight = gameState.grid[i][j] > 0;
            let isMoveSpot = moveSpots.some(spot => spot.row === i && spot.col === j);
            let tileStyle = "bg-board-square hover:bg-board-square-hover";
            let cell = undefined;
            let cellAction = undefined; 
            if (isMoveSpot) {
                let direction = moveSpots.find(spot => spot.row === i && spot.col === j)!.direction;
                let move: MultiKnightMove = { row: selectedCell!.row, col: selectedCell!.col, direction };
                cellAction = submitter ? () => { submitter(move); } : undefined;
                tileStyle = "cursor-pointer bg-board-square-action hover:bg-board-square-action-hover";
            } else if (hasKnight) {
                cellAction = () => {
                    if (isPlayerTurn) {
                        setSelectedCell(selectedCell => {
                            if (selectedCell?.row === i && selectedCell?.col === j) return null;
                            return { row: i, col: j };
                        });
                    }
                }
                tileStyle = "cursor-pointer bg-board-square-piece hover:bg-board-square-piece-hover";
            }
            if (hasKnight) {
                cell = <div>
                    ♞
                    <Badge className="text-xs">{gameState.grid[i][j]}</Badge>
                </div>
            } else if (moveSpots.some(spot => spot.row === i && spot.col === j)) {
                cell = "•";
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
