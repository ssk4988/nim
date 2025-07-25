import { NimState } from "@/games/nim";
import { DEBUG } from "@/lib/constants";
import { NimMove } from "@/types/nim";

export default function NimRenderer({ gameState, submitter }: { gameState: NimState, submitter?: (move: NimMove) => void }) {
    const piles = gameState.piles.map((pile, index) => {
        if (pile === 0) return null;
        const stones = [];
        const disabled = !gameState.turn;
        for (let i = 1; i <= pile; i++) {
            const handler = submitter ? () => {
                if (DEBUG) console.log("Clicked pile: ", index, " amount: ", i);
                if (disabled) return;
                const move: NimMove = { pile: index, amount: i };
                submitter(move);
            } : undefined;
            stones.push(
                <button
                    key={i}
                    className={`stone-button stone-img ${disabled ? "no-hover" : ""}`}
                    onClick={handler}
                    disabled={disabled}
                />
            );
        }
        stones.reverse();
        return (<div key={index} className="flex flex-col-reverse items-center justify-center">
            <div className="text-md font-bold">{pile}</div>
            {stones}
        </div>);
    });
    return <div className="flex flex-row items-end justify-center gap-9 mt-8 min-h-[200px]">
        {piles}
    </div>
}
