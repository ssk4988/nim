export enum GameTypeEnum {
    NIM = "nim",
    MARBLES = "marbles",
    LONE_KNIGHT = "loneknight",
    MULTI_KNIGHT = "multiknight",
};

export interface GameInterface<GameState, Move> {
    moves: Move[];
    turn: boolean;
    clone(): GameState;
    isGameOver(): boolean;
    applyMove(action: Move): boolean;
    grundyValue(): number;
    optimalMove(): Move;
    undoMove(): void;
}
