import { cn } from "@/lib/utils";

export type CellInfo = {
    // className for the tile
    tileStyle?: string;
    // inner content of the tile
    inner?: React.ReactNode; 
    // action to perform when the tile is clicked
    cellAction?: (() => void);
}

export interface ChessboardProps {
    cells: CellInfo[][],
}

// wrapper for a chessboard-like grid
export default function Chessboard({ cells }: ChessboardProps) {
    let rows = [];
    for (let i = 0; i < cells.length; i++) {
        let row = [];
        for (let j = 0; j < cells[i].length; j++) {
            const cellClassName = "w-8 h-8 border flex items-center justify-center select-none";
            const tileStyle = cn(cellClassName, cells[i][j].tileStyle);
            row.push(<div key={`${i}-${j}`} className={tileStyle} onClick={cells[i][j].cellAction}>{cells[i][j].inner}</div>);
        }
        rows.push(<div key={i} className="inline-flex flex-row flex-shrink">{row}</div>);
    }
    return <div className="inline-flex flex-col border-2">
        {rows}
    </div>;
}
