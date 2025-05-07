import MarkdownWrapper from "../markdown-wrapper";

const content = `
## How to Play Marbles
### Rules
Marbles is a game played with a number of marbles arranged in a row. Each player takes turns where
they must remove between 1 and 3 marbles from the row. The player who removes the last marble wins.
Equivalently, the player who cannot make any moves (remove any marbles) loses.

### Using this Site
When playing Marbles on this website, you will see some marbles arranged in a row.
When it is your turn, you can click a marble and every marble to the right of the clicked marble 
(including the clicked marble) will be removed. Hovering over a marble will highlight
the marbles that will be removed if you click that marble. Since you can only remove between 1 and 3 marbles,
the number of marbles that will be removed is capped at 3.
  
Try out the hovering below!
  
[dummy-marbles]
`;
export default function HowToPlayMarbles() {
    return <div className="m-4"><MarkdownWrapper content={content} /></div>;
}
