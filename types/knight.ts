/** Represents a move in the Lone Knight game */
export interface LoneKnightMove {
    direction: number; // Direction of the knight's move (0-3 since restricted movement)
};

/** Represents a move in the Multi Knight game */
export interface MultiKnightMove {
    row: number; // Row of the knight's move
    col: number; // Column of the knight's move
    direction: number; // Direction of the knight's move (0-3 since restricted movement)
};

export interface Cell {
    row: number;
    col: number;
}
