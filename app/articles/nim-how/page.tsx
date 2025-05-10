import NimRenderer from "@/app/games/nim/nim-renderer";
import MarkdownWrapper from "../markdown-wrapper";
import { NimState } from "@/games/nim";

const content = `
## How to Play Nim
### Rules
Nim is a two-player game in which players take turns removing stones from distinct piles.
Specifically, in one turn, a player must remove at least one stone from a single pile, but can remove
as many stones as they want from that pile.
The objective of the game is to be the player who removes the last stone.
Equivalently, the player who cannot make any moves (remove any stones) loses.

### Using this Site
When playing Nim on this website, you will see some piles of stones arranged in a row.
When it is your turn, you can click a stone from a pile, and every stone in that pile which is above
the clicked stone (including the clicked stone) will be removed. Hovering over a stone will highlight
the stones that will be removed if you click that stone.
  
Try out the hovering below!
  
`;
export default function HowToPlayNim() {
    const nimState = new NimState([4, 1, 5, 3], true);
    return <div className="m-4">
        <MarkdownWrapper content={content} />
        <NimRenderer gameState={nimState} />;
    </div>;
}
