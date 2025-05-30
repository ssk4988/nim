import { LoneKnightState } from "@/games/loneknight";
import MarkdownWrapper from "../markdown-wrapper";
import LoneKnightRenderer from "@/app/games/loneknight/loneknight-renderer";

const content = `
## How to Play Lone Knight
### Rules
Lone Knight is a game played on a 8x8 chessboard. There is one knight on the board. Each player takes turns
moving the knight. The knight moves like a knight in chess, meaning moves in an L shape (2 units in one direction
and 1 unit in a perpendicular direction). Unlike in chess, the knight is restricted to 4 possible moves instead of 8.
The knight can only move to the following squares:  
`
const content2 = `
More formally, it moves to the squares that are on a further diagonal from the top left corner of the board.
The player who cannot make a move loses.

### Using this Site
When playing Lone Knight on this website, you will see a chessboard with a lone knight on it.
When it is your turn, you can click on one of the highlighted squares to move the knight.
`;
export default function HowToPlayLoneKnight() {
    const loneKnightState = new LoneKnightState({ row: 2, col: 2 }, true);
    return <div className="m-4">
        <MarkdownWrapper content={content} />
        <div className="my-4">
            <LoneKnightRenderer gameState={loneKnightState} />
        </div>
        <MarkdownWrapper content={content2} />
    </div>;
}
