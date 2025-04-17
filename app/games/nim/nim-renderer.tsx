import { NimState } from "@/games/nim";
import { NimMove } from "@/types/nim";

export default function NimRenderer({ gameState, submitter }: { gameState: NimState, submitter: (move: NimMove) => void }) {
    let piles = gameState.piles.map((pile, index) => {
        if (pile === 0) return null;
        let stones = [];
        let disabled = !gameState.turn;
        for (let i = 1; i <= pile; i++) {
            stones.push(
                <button
                    key={i}
                    className={`stone-button ${disabled ? "no-hover" : ""}`}
                    onClick={() => {
                        console.log("Clicked pile: ", index, " amount: ", i);
                        if (disabled) return;
                        let move: NimMove = { pile: index, amount: i };
                        submitter(move);
                    }}
                    disabled={disabled}
                ></button>
            );
        }
        stones.reverse();
        return (<div key={index} className="flex flex-col-reverse items-center justify-center">{stones}</div>);
    });
    return <div className="flex flex-row items-end justify-center gap-9 mt-8 min-h-[200px]">
        {piles}
    </div>
}
