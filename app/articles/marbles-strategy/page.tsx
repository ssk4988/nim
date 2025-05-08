import MarkdownWrapper from "../markdown-wrapper";

const content = `
## Marbles: Strategy
### Determining Winning and Losing States
You can determine the strategy for the game of Marbles by determining the winning and losing states.
In the following table, the moves column shows how many marbles you can remove and whether the resulting 
state is winning (W) or losing (L):
| Number of Marbles | Winning State? | Moves | Winning Move |
|-------------------|----------------|-------|--------------|
| 0 | No | | |
| 1 | Yes | 1L | 1 |
| 2 | Yes | 1W, 2L | 2 |
| 3 | Yes | 1W, 2W, 3L | 3 |
| 4 | No | 1W, 2W, 3W | |
| 5 | Yes | 1L, 2W, 3W | 1 |
| 6 | Yes | 1W, 2L, 3W | 2 |
| 7 | Yes | 1W, 2W, 3L | 3 |
| 8 | No | 1W, 2W, 3W | |
| 9 | Yes | 1L, 2W, 3W | 1 |
| 10 | Yes | 1W, 2L, 3W | 2 |
| 11 | Yes | 1W, 2W, 3L | 3 |
| 12 | No | 1W, 2W, 3W | |
  
It should be clear now that the losing states are ones where the number of marbles is a multiple of 4.
This is because any other state can transition to a losing state by removing 1, 2, or 3 marbles. A losing
state itself cannot transition to another losing state since removing 4 marbles isn't a valid move.

### Using Mirroring
The game of Marbles is a perfect example of a game that can be played with the mirroring strategy.
For every action of removing 1-3 marbles from a pile, there is a mirrored move.
The mirrored move is to remove 4 - x marbles, where x is the number of marbles in the move you are mirroring.
This groups every pair of moves into a group of 4. Therefore if the number of marbles is a multiple of 4,
you are in a losing position since your opponent can always mirror your move. If the number of marbles is not
a multiple of 4, you can always make a move that will leave your opponent with a multiple of 4 marbles.
`;
export default function MarblesStrategy() {
    return <div className="m-4"><MarkdownWrapper content={content} /></div>;
}
