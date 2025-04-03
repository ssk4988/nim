/** Represents a move in the Nim game */
export type NimMove = {
    pile: number; // Index of the pile
    amount: number; // Number of items removed from the pile
};
