import MarkdownWrapper from "../markdown-wrapper";

const content = `
## Game Theory Concepts
### Determining Winning and Losing States
The most fundamental task is determining whether a given state is winning or losing. Since the game is
finite, this can be done by recursively exploring the graph. First, any state with no moves out of it 
is a **losing** state. A state is a **winning** state if there is at least one move that leads directly
to a losing state. The reason for this is that you can win by making the move that leads to a losing state.
Your opponent will be forced to play from a losing state and cannot win.
Conversely, a state is a **losing** state if
all possible moves lead to winning states (no moves lead to losing states). This definition encompasses the
'no moves left' case as well.  

### Mirroring
The idea of mirroring is the idea that you make a move that mirrors your opponent's move in some way. For games
that meet the conditions listed in the [introductory article](/articles/introduction), if you can always make a move that 
mirrors your opponent's move, you can always win. This is because if you can always make a move and
the game is finite, your opponent will eventually run out of moves and you will win.

### Sprague-Grundy Theorem
The Sprague-Grundy theorem is complex enough to warrant its [own article](/articles/sprague-grundy).
`;
export default function GameTheoryConcepts() {
    return <div className="m-4"><MarkdownWrapper content={content} /></div>;
}
