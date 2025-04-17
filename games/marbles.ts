import { MarblesMove } from "@/types/marbles";

/** Represents the state of the Marbles game */
export class MarblesState {
    public marbles: number;
    public turn: boolean; // true if it's the player's turn, false if it's the computer's turn
    public moves: MarblesMove[];
    public maxMarblesPerTurn: number;

    constructor(marbles: number, turn: boolean, maxMarblesPerTurn: number = 3, moves: MarblesMove[] = []) {
        this.marbles = marbles;
        this.turn = turn;
        this.maxMarblesPerTurn = maxMarblesPerTurn;
        this.moves = moves;
    }

    /** Clones the game state */
    clone(): MarblesState {
        return new MarblesState(this.marbles, this.turn, this.maxMarblesPerTurn, [...this.moves]);
    }

    /** Generates a random game state */
    static gen(): MarblesState {
        const marbles = Math.floor(Math.random() * (20 - 10 + 1)) + 10; // Random number between 10 and 20
        const turn = false;
        return new MarblesState(marbles, turn);
    }

    /** Checks if the game is over */
    isGameOver(): boolean {
        return this.marbles <= 0;
    }

    /** Applies a move to the game state */
    applyMove(action: MarblesMove): boolean {
        const { amount } = action;

        if (amount > this.maxMarblesPerTurn || amount <= 0 || this.marbles < amount) {
            return false;
        }

        this.marbles -= amount;
        this.turn = !this.turn;
        this.moves.push(action);
        return true;
    }

    /** Calculates the Grundy value of the current state */
    grundyValue(): number {
        return this.marbles % (this.maxMarblesPerTurn + 1);
    }

    /** Calculates the optimal move for the current state */
    optimalMove(): MarblesMove {
        const grundy = this.grundyValue();

        if (grundy === 0) {
            // Every move loses, pick an arbitrary move
            return { amount: 1 };
        }

        return { amount: grundy };
    }

    /** Undoes the last move */
    undoMove(): void {
        const lastMove = this.moves.pop();
        if (lastMove) {
            this.marbles += lastMove.amount;
            this.turn = !this.turn;
        }
    }
}
