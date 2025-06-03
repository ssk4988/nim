import { MarblesState } from "@/games/marbles";
import { DEBUG } from "@/lib/constants";
import { MarblesMove } from "@/types/marbles";

export default function MarblesRenderer({ gameState, submitter }: { gameState: MarblesState, submitter?: (move: MarblesMove) => void }) {
    let marbles = [];
    let disabled = !gameState.turn;
    for (let i = 1; i <= gameState.marbles; i++) {
        let handler = submitter ? () => {
            if (DEBUG) console.log("Clicked marble: ", i);
            if (disabled) return;
            let functionalAmount = Math.min(gameState.maxMarblesPerTurn, i);
            let move: MarblesMove = { amount: functionalAmount };
            submitter(move);
        } : undefined;
        marbles.push(
            <button
                key={i}
                className={`stone-button marble-img ${disabled || i > gameState.maxMarblesPerTurn ? "no-hover" : ""}`}
                onClick={handler}
                disabled={disabled}
            />
        );
    }
    marbles.reverse();
    return <div className="flex flex-col gap-4 items-center justify-end mt-8 min-h-[200px]">
        <div className="text-lg font-bold">{gameState.marbles} marbles left</div>
        <div className="flex flex-row items-end justify-center gap-4">
            {marbles}
        </div>
    </div>
}
