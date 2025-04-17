import { LoneKnightMove, MultiKnightMove } from "@/types/knight";
import { knightValidMoves, knightDirections, knightGrundyValues, knightShortestPath } from "./knight";

const boardWidth = 8;
const boardHeight = 8;
/** Represents the state of the Knight game */
export class MultiKnightState {
    public static boardWidth = boardWidth;
    public static boardHeight = boardHeight;
    public grid: number[][];
    public turn: boolean; // true if it's the player's turn, false if it's the computer's turn
    public moves: MultiKnightMove[];

    constructor(
        grid: number[][] = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0)),
        turn: boolean = true,
        moves: MultiKnightMove[] = []
    ) {
        this.grid = grid;
        this.turn = turn;
        this.moves = moves;
    }

    /** Clones the game state */
    clone(): MultiKnightState {
        return new MultiKnightState(
            { ...this.grid },
            this.turn,
            [...this.moves]
        );
    }

    /** Generates a random game state */
    static gen(): MultiKnightState {
        let numberOfKnights = Math.floor(Math.random() * 5) + 3; // Random number of knights between 3 and 7
        let grid = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
        for (let i = 0; i < numberOfKnights; i++) {
            let row = 0, col = 0;
            // Ensure the knight has at least one valid move
            do {
                row = Math.floor(Math.random() * boardHeight);
                col = Math.floor(Math.random() * boardWidth);
            } while (knightShortestPath[row][col] <= 1);
            grid[row][col] += 1;
        }
        const turn = false; // Player's turn
        return new MultiKnightState(grid, turn);
    }

    /** Checks if the game is over */
    isGameOver(): boolean {
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                if (this.grid[i][j] > 0 &&
                    knightValidMoves(i, j).length > 0) {
                    return false; // Game is not over
                }
            }
        }
        return true;
    }

    /** Applies a move to the game state */
    applyMove(action: MultiKnightMove): boolean {
        const { row, col, direction } = action;
        if (this.grid[row][col] <= 0) {
            return false; // Invalid move
        }
        const move = knightDirections[direction];
        const newRow = row + move.row;
        const newCol = col + move.col;

        if (newRow < 0 || newRow >= boardHeight || newCol < 0 || newCol >= boardWidth) {
            return false; // Invalid move
        }

        this.grid[row][col] -= 1; // Remove a knight from the current position
        this.grid[newRow][newCol] += 1; // Add a knight to the new position
        this.turn = !this.turn;
        this.moves.push(action);
        return true;
    }

    /** Calculates the Grundy value of the current state */
    grundyValue(): number {
        let grundy = 0;
        for (let i = 0; i < boardHeight; i++) {
            for (let j = 0; j < boardWidth; j++) {
                if (this.grid[i][j] % 2 === 1) {
                    grundy ^= knightGrundyValues[i][j];
                }
            }
        }
        return grundy;
    }

    /** Calculates the optimal move for the current state */
    optimalMove(): MultiKnightMove {
        const grundy = this.grundyValue();

        const validMoves = [];
        for(let i = 0; i < boardHeight; i++) {
            for(let j = 0; j < boardWidth; j++) {
                if (this.grid[i][j] > 0) {
                    const moves = knightValidMoves(i, j);
                    for (const move of moves) {
                        validMoves.push({
                            row: i,
                            col: j,
                            direction: move.direction
                        });
                    }
                }
            }
        }
                            
        if (grundy === 0) {
            // Every move loses, pick an arbitrary move
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        for (const move of validMoves) {
            const { row, col, direction } = move;
            const { row: dr, col: dc } = knightDirections[direction];
            const newRow = row + dr;
            const newCol = col + dc;
            const newGrundy = grundy ^ knightGrundyValues[row][col] ^ knightGrundyValues[newRow][newCol];
            if (newGrundy == 0) {
                return move; // Found a winning move
            }
        }

        throw new Error("No valid move found");
    }

    /** Undoes the last move */
    undoMove(): void {
        const lastMove = this.moves.pop();
        if (lastMove) {
            const { row, col, direction } = lastMove;
            const move = knightDirections[direction];
            this.grid[row][col] += 1; // Add a knight back to the original position
            this.grid[row + move.row][col + move.col] -= 1; // Remove a knight from the new position
            this.turn = !this.turn;
        }
    }
}
