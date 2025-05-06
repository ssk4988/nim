import { MarblesState } from "@/games/marbles";
import { MarblesMove } from "@/types/marbles";

export default function MarblesRenderer({ gameState, submitter }: { gameState: MarblesState, submitter: (move: MarblesMove) => void }) {
    let stones = [];
    let disabled = !gameState.turn;
    for (let i = 1; i <= gameState.marbles; i++) {
        stones.push(
            <button
                key={i}
                className={`stone-button marble-img ${disabled || i > gameState.maxMarblesPerTurn ? "no-hover" : ""}`}
                onClick={() => {
                    console.log("Clicked stone:", i);
                    if (disabled) return;
                    let functionalAmount = Math.min(gameState.maxMarblesPerTurn, i);
                    let move: MarblesMove = { amount: functionalAmount };
                    submitter(move);
                }}
                disabled={disabled}
            ></button>
        );
    }
    stones.reverse();
    return <div className="flex flex-row items-end justify-center gap-4 mt-8 min-h-[200px]">
        {stones}
    </div>
}
