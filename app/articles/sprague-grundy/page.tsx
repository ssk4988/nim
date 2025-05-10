import MarkdownWrapper from "../markdown-wrapper";

const content = `
## Sprague-Grundy Theorem
The Sprague-Grundy theorem is a fundamental result in combinatorial game theory.
It states that every game with the conditions discussed in the [introduction](/articles/introduction)
is equivalent to a pile of stones in nim. That may not make much sense at first, but after reading
the rest of this article, it will be clear what that means.

### Grundy Numbers
The Sprague-Grundy theorem states that every position in a game can be assigned a **Grundy number** (or **nimber**).
This number is a non-negative integer that represents how many stones in a pile of nim the position is equivalent to.
The Grundy number of a position is defined recursively. If the position is a terminal position (no moves left),
its Grundy number is 0, since 0 stones in a pile in a game of nim is also a terminal position.
If the position is not a terminal position, its Grundy number is the minimum excluded value (mex)
of the Grundy numbers of all positions that can be reached from it by making a legal move.

### Mex
The **mex** of a set of non-negative integers is the smallest non-negative integer that is not in the set.
For example, the mex of the set {0, 1, 2} is 3, and the mex of the set {0, 0, 2, 3} is 1. The mex can
also be 0 if the set is empty or only contains positive integers.

### Why this works
Think about what the Grundy number of a position means. Just like how you can change the number of 
stones in a pile in nim by taking
some stones away, you can change the Grundy number of a position by making a move. If the Grundy 
number of a position is $g$, the position is equivalent to a pile of $g$ stones in nim. Because we have
defined the Grundy number of a position as the mex of the Grundy numbers of all positions that can
be reached from it, we know that the position can transition to a position with a Grundy number of 0, 1
, ..., all the way up to $g-1$. This is akin to how in nim, you remove anywhere from 1 to $g$ stones
from a pile of $g$ stones to transition to a pile of 0 to $g-1$ stones.  
  
However, there is one more case to consider. Even if the Grundy number of a position is $g$, it may have
transitions to positions with Grundy numbers greater than $g$. This is because the mex doesn't account
for larger numbers than the one that is missing. However, this is not a problem. If the current player
transitions to a position with a Grundy number which greater than $g$, the opponent can transition back to a
position with a Grundy number of $g$. This transition is guaranteed to exist because of the definition
of the mex. Because the game is finite, transitioning back to $g$ will eventually lead to a position
where there are no transitions to a position with a Grundy number larger than $g$. 

We've now established that a position with a Grundy number of $g$ has the same set of moves as a pile of
$g$ stones in nim. Therefore the two positions are equivalent. 

### Computing Grundy Numbers
Since the Grundy number of a position is defined recursively and the graph of the game positions is
acyclic, the Grundy number of a state can be computed by exploring the graph of the game states.

### Winning and Losing States
A position is a **winning** position if its Grundy number is non-zero, and a position is a **losing** position
if its Grundy number is zero.

### Nim-Sum
In nim, when you have multiple piles of stones, the **nim-sum** is the XOR of the sizes of all the piles.
Each of the piles can be thought of as a separate game since moves in one pile do not affect the other piles.
In every turn, the player must choose a pile to make a move in. An equivalent scenario with Grundy numbers
is if there are multiple independent games (each with their own Grundy number) and in each turn the 
player must choose one of the games to make a move in. The nim-sum of the position (which is the 
Grundy number of the combined games) is the XOR of the Grundy numbers of each independent game.

### Example
[Multi Knight](/articles/multiknight-how) is a modified version of Lone Knight where there are
multiple knights on the board. Try to use the Sprague-Grundy theorem to determine the Grundy number
of any board position.
`;
export default function SpragueGrundy() {
    return <div className="m-4"><MarkdownWrapper content={content} /></div>;
}
