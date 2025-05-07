import MarkdownWrapper from "../markdown-wrapper";

const content = `
## Introduction
This site mainly focuses on game theory, and in particular combinatorial game theory. Combinatorial
game theory studies games with *perfect information*, meaning that all players know the complete
state of the game at all times. Additionally the games are *deterministic*, meaning that the
outcome of the game is completely determined by the players' moves, and there is no element of
chance. This is in contrast to games like poker, where players do not know the cards of their
opponents, and there is an element of chance in the form of the shuffled deck.  
This site hones in on games that the [**Sprague-Grundy Theorem**](/articles/sprague-grundy) applies to (more on this later). 
Some additional properties of this class of games are:
- There are two players.
- Each player takes turns making moves.
- **Zero-sum** - One player's gain is the other player's loss. This means that
the players are in direct competition with each other. 
- **No draws** - One player wins and one player loses, so there are no draws.
- **Finite** - The game has a finite number of moves (it isn't possible to play forever).
- **Impartial** - The possible moves depend only on the current state of the game, not on which player
is making the move. This means that the same moves are available to both players, regardless of who is playing.
This is in contrast to games like chess, where the possible moves depend on the player's pieces and position.  

This set of premises immediately rules out a lot of games, such as chess, checkers, and poker. It also
has some interesting implications:
- The game is completely determined by the
initial state of the game. This means that if one player has a winning strategy, they can always win.
- The game can be represented as a directed acyclic graph (DAG), where each node is a state of the game, 
and each edge is a possible move that leads to a new state. The game ends when a player reaches a terminal state, which is a state where
there are no possible moves left. The terminal states are the leaves of the DAG.
- Every state of the game can be classified as either a winning state or a losing state. A winning state
is a state where the player whose turn it is can force a win, while a losing state is a state where the player whose turn it is cannot force a win.
`;
export default function Introduction() {
    return <div className="m-4"><MarkdownWrapper content={content} /></div>;
}
