import { Cell, LoneKnightMove } from "@/types/knight";
import { knightValidMoves, knightDirections, knightGrundyValues, knightShortestPath } from "./knight";

const boardWidth = 8;
const boardHeight = 8;
/** Represents the state of the Knight game */
export class KnightState {
    public static boardWidth = boardWidth;
    public static boardHeight = boardHeight;
    public knightPosition: Cell;
    public turn: boolean; // true if it's the player's turn, false if it's the computer's turn
    public moves: LoneKnightMove[];

    constructor(
        knightPosition: Cell = { row: 0, col: 0 },
        turn: boolean = true,
        moves: LoneKnightMove[] = []
    ) {
        this.knightPosition = knightPosition;
        this.turn = turn;
        this.moves = moves;
    }

    /** Clones the game state */
    clone(): KnightState {
        return new KnightState(
            { ...this.knightPosition },
            this.turn,
            [...this.moves]
        );
    }

    /** Generates a random game state */
    static gen(): KnightState {
        let position: Cell = { row: 0, col: 0 };
        let hasMove = false;
        // Ensure the knight has at least one valid move
        do {
            position = {
                row: Math.floor(Math.random() * boardHeight),
                col: Math.floor(Math.random() * boardWidth),
            };
        } while (knightShortestPath[position.row][position.col] <= 1);
        const turn = true; // Player's turn
        return new KnightState(position, turn);
    }

    /** Checks if the game is over */
    isGameOver(): boolean {
        return knightValidMoves(this.knightPosition.row, this.knightPosition.col).length === 0;
    }

    /** Applies a move to the game state */
    applyMove(action: LoneKnightMove): boolean {
        const direction = action.direction;
        const move = knightDirections[direction];
        const newRow = this.knightPosition.row + move.row;
        const newCol = this.knightPosition.col + move.col;

        if (newRow < 0 || newRow >= boardHeight || newCol < 0 || newCol >= boardWidth) {
            return false; // Invalid move
        }

        this.knightPosition.row = newRow;
        this.knightPosition.col = newCol;
        this.turn = !this.turn;
        this.moves.push(action);
        return true;
    }

    /** Calculates the Grundy value of the current state */
    grundyValue(): number {
        return knightGrundyValues[this.knightPosition.row][this.knightPosition.col];
    }

    /** Calculates the optimal move for the current state */
    optimalMove(): LoneKnightMove {
        const grundy = this.grundyValue();

        const validMoves = knightValidMoves(this.knightPosition.row, this.knightPosition.col);
        if (grundy === 0) {
            // Every move loses, pick an arbitrary move
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        for (const move of validMoves) {
            const newRow = this.knightPosition.row + knightDirections[move.direction].row;
            const newCol = this.knightPosition.col + knightDirections[move.direction].col;
            const newGrundy = knightGrundyValues[newRow][newCol];
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
            const direction = lastMove.direction;
            const move = knightDirections[direction];
            this.knightPosition.row -= move.row;
            this.knightPosition.col -= move.col;
            this.turn = !this.turn;
        }
    }
}
