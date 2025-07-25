import { GameInterface } from "@/types/games";
import { NimMove } from "@/types/nim";

/** Represents the state of the Nim game */
export class NimState implements GameInterface<NimState, NimMove> {
    public piles: number[];
    public turn: boolean; // true if it's the player's turn, false if it's the computer's turn
    public moves: NimMove[];

    constructor(piles: number[], turn: boolean, moves: NimMove[] = []) {
        this.piles = piles;
        this.turn = turn;
        this.moves = moves;
    }

    /** Clones the game state */
    clone(): NimState {
        return new NimState([...this.piles], this.turn, [...this.moves]);
    }

    /** Generates a random game state */
    static gen(): NimState {
        const numPiles = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // Random number between 3 and 5
        const piles = Array.from({ length: numPiles }, () =>
            Math.floor(Math.random() * (6 - 1 + 1)) + 1 // Random number between 1 and 6
        );
        const turn = false;
        return new NimState(piles, turn);
    }

    /** Checks if the game is over */
    isGameOver(): boolean {
        return this.piles.every((pile) => pile === 0);
    }

    /** Applies a move to the game state */
    applyMove(action: NimMove): boolean {
        const { pile, amount } = action;

        if (pile >= this.piles.length || this.piles[pile] < amount || this.piles[pile] === 0) {
            return false;
        }

        this.piles[pile] -= amount;
        this.turn = !this.turn;
        this.moves.push(action);
        return true;
    }

    /** Calculates the Grundy value of the current state */
    grundyValue(): number {
        return this.piles.reduce((acc, pile) => acc ^ pile, 0);
    }

    /** Calculates the optimal move for the current state */
    optimalMove(): NimMove {
        const grundy = this.grundyValue();

        if (grundy === 0) {
            // Every move loses, pick an random move
            const nonEmptyPiles = [...Array(this.piles.length).keys()].filter((_, i) => this.piles[i] > 0);
            const pile = nonEmptyPiles[Math.floor(Math.random() * nonEmptyPiles.length)];
            return { pile, amount: 1 + Math.floor(Math.random() * this.piles[pile]) };
        }

        for (let i = 0; i < this.piles.length; i++) {
            const pileAmt = this.piles[i];
            if (pileAmt === 0) continue;

            const newPileAmt = pileAmt ^ grundy;
            if (newPileAmt < pileAmt) {
                return { pile: i, amount: pileAmt - newPileAmt };
            }
        }

        throw new Error("No valid move found");
    }

    /** Undoes the last move */
    undoMove(): void {
        const lastMove = this.moves.pop();
        if (lastMove) {
            const { pile, amount } = lastMove;
            this.piles[pile] += amount;
            this.turn = !this.turn;
        }
    }
}
