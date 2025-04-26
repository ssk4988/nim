export enum GameTypeEnum {
    NIM = "nim",
    MARBLES = "marbles",
    LONE_KNIGHT = "loneknight",
    MULTI_KNIGHT = "multiknight",
};

export interface GameInterface<GameState, Move> {
    moves: Move[]; // move history
    turn: boolean; // true if it's the player's turn, false if it's the computer's turn, only used client side
    clone(): GameState; // clone the game state
    isGameOver(): boolean; // check if the game is over
    applyMove(action: Move): boolean; // apply a move to the game state
    grundyValue(): number; // calculate the grundy value of the game state
    optimalMove(): Move; // calculate the optimal move for the current player
    undoMove(): void; // undo the last move
}

export enum TimeControlEnum {
    MIN5 = "5m",
    MIN1 = "1m",
    SEC30 = "30s",
    SEC15 = "15s",
}

export function timeControlToMilliseconds(timeControl: TimeControlEnum): number {
    switch (timeControl) {
        case TimeControlEnum.MIN5:
            return 5 * 60 * 1000;
        case TimeControlEnum.MIN1:
            return 1 * 60 * 1000;
        case TimeControlEnum.SEC30:
            return 30 * 1000;
        case TimeControlEnum.SEC15:
            return 15 * 1000;
        default:
            throw new Error("Invalid time control");
    }
}

export function displayGameType(type: GameTypeEnum): string {
    switch (type) {
        case GameTypeEnum.NIM:
            return "Nim";
        case GameTypeEnum.MARBLES:
            return "Marbles";
        case GameTypeEnum.LONE_KNIGHT:
            return "Lone Knight";
        case GameTypeEnum.MULTI_KNIGHT:
            return "Multi Knight";
        default:
            throw new Error("Invalid game type");
    }
}

export function displayTimeControl(timeControl: TimeControlEnum): string {
    switch (timeControl) {
        case TimeControlEnum.MIN5:
            return "5 min";
        case TimeControlEnum.MIN1:
            return "1 min";
        case TimeControlEnum.SEC30:
            return "30 sec";
        case TimeControlEnum.SEC15:
            return "15 sec";
        default:
            throw new Error("Invalid time control");
    }
}

export function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000); // Get total minutes
    const seconds = Math.floor((ms % 60000) / 1000); // Get remaining seconds
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export interface GameConfig {
    timeControl: TimeControlEnum;
    gameType: GameTypeEnum;
}
