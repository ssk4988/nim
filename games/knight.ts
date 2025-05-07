import { LoneKnightMove } from "@/types/knight";

export const knightDirections = [
    { row: 2, col: -1 },
    { row: 2, col: 1 },
    { row: 1, col: 2 },
    { row: -1, col: 2 },
];
export const boardSize = 8;
export function knightValidMoves(row: number, col: number): LoneKnightMove[] {
    let validMoves: LoneKnightMove[] = [];
    for (let i = 0; i < knightDirections.length; i++) {
        const newRow = row + knightDirections[i].row;
        const newCol = col + knightDirections[i].col;
        if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
            validMoves.push({ direction: i });
        }
    }
    return validMoves;
}

let grundyValues = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
for (let diagonal = boardSize + boardSize - 2; diagonal >= 0; diagonal--) {
    for (let col = 0; col < boardSize; col++) {
        const row = diagonal - col;
        if (row < 0 || row >= boardSize) continue; // Out of bounds
        const grundySet = new Set<number>();
        const validMoves = knightValidMoves(row, col);
        for (const move of validMoves) {
            const newRow = row + knightDirections[move.direction].row;
            const newCol = col + knightDirections[move.direction].col;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                grundySet.add(grundyValues[newRow][newCol]);
            }
        }
        let grundyValue = 0;
        while (grundySet.has(grundyValue)) {
            grundyValue++;
        }
        grundyValues[row][col] = grundyValue;
    }
}

let shortestPath = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
for (let diagonal = boardSize + boardSize - 2; diagonal >= 0; diagonal--) {
    for (let col = 0; col < boardSize; col++) {
        const row = diagonal - col;
        if (row < 0 || row >= boardSize) continue; // Out of bounds
        const validMoves = knightValidMoves(row, col);
        let minDistance = Infinity;
        for (const move of validMoves) {
            const newRow = row + knightDirections[move.direction].row;
            const newCol = col + knightDirections[move.direction].col;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                minDistance = Math.min(minDistance, shortestPath[newRow][newCol]+1);
            }
        }
        shortestPath[row][col] = minDistance === Infinity ? 0 : minDistance;
    }
}

export const knightGrundyValues = grundyValues;
export const knightShortestPath = shortestPath;
