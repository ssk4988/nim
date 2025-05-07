import MarkdownWrapper from "../markdown-wrapper";

const content = `
## Nim: Strategy
### Xor
Xor (denoted with $\\oplus$) is a binary operation (like addition or multiplication) that takes two numbers and returns a number.
Imagine first that xor is only defined on 0 and 1, and that it is defined as follows:

| $a$ | $b$ | $a \\oplus b$ |
|---|---|---------|
| 0 | 0 | 0       |
| 0 | 1 | 1       |
| 1 | 0 | 1       |
| 1 | 1 | 0       |
  
The table above shows the truth table for xor. The result of xor is 1 if the two bits are different, and 0 if they are the same.
Now, we can extend this to larger numbers. The xor of two numbers is the xor of their binary representations, bit by bit.  
For example:
- $5 = 101_2$
- $3 = 011_2$
- $5 \\oplus 3 = 110_2 = 6$
- $7 = 111_2$
- $7 \\oplus 3 = 100_2 = 4$
- $7 \\oplus 5 = 010_2 = 2$
  
There are a few more interesting properties of xor:
- $a \\oplus 0 = a$ (xor with 0 does nothing)
- $a \\oplus a = 0$ (xor with itself is 0)
- $a \\oplus b \\oplus a = b$ (xor is reversible)
- $(a \\oplus b) \\oplus c = a \\oplus (b \\oplus c)$ (xor is associative)
- $a \\oplus b = b \\oplus a$ (xor is commutative)
- Each bit of the result is the xor of the corresponding bits of the inputs. This is inherent in the definition
of xor but is worth noting.
### Strategy
What does this have to do with Nim? The xor of the sizes of the piles is called the **nim-sum**. 
The nim-sum is a powerful tool for determining the winning strategy in Nim.  
Here's an example of the calculation of the nim-sum:
- Suppose we have the following piles: $[4, 1, 5, 3]$.
- The binary representations of the piles are:
    - $4 = 100_2$, $1 = 001_2$, $5 = 101_2$, $3 = 011_2$.
- The nim-sum is calculated as follows:
    - $4 \\oplus 1 \\oplus 5 \\oplus 3 = 100_2 \\oplus 001_2 \\oplus 101_2 \\oplus 011_2$.
- The calculation is done bit by bit:
    - $100_2 \\oplus 001_2 = 101_2$ (which is 5)
    - $101_2 \\oplus 101_2 = 000_2$ (which is 0)
    - $000_2 \\oplus 011_2 = 011_2$ (which is 3)
- So the nim-sum is $3$.
  
Determining winning and losing positions is simple:
- If the nim-sum is $0$, then the position is a losing position for the player whose turn it is.
- If the nim-sum is not $0$, then the position is a winning position for the player whose turn it is.
Knowing this fact is sufficient to execute a winning strategy and you do not need to know the proof.
The proof is a bit more complicated and is listed below for completeness.

#### Proof
We need to show two things:
1. If the nim-sum is $0$, then we can't make a move that will keep the nim-sum $0$ (i.e. a losing position can't transition to another losing position).
2. If the nim-sum is not $0$, then we can make a move that will make the nim-sum $0$ (i.e. a winning position can transition to a losing position).

Let's say that the nim-sum is $x$. Suppose that we have a pile of size $a$ and we want to change it to $b$.
The nim-sum after the move will be $x \\oplus a \\oplus b$.

For the first part, we have $x = 0$. We want to show that there is no $b$ such that $x \\oplus a \\oplus b = 0$.
Since $b < a$, $a \\oplus b$ must not be $0$ because the only way for $a \\oplus b$ to be $0$ is if $a = b$.  
  
  
For the second part, we have $x \\ne 0$. We want to show that there is a $b$ such that $x \\oplus a \\oplus b = 0$.
We can rearrange this to $b = x \\oplus a$ by xor-ing both sides with $b$. Since we need $b < a$ for this to
be a valid move, we need to show that $x \\oplus a < a$. Consider the binary representations of $x$ and $a$.
The xor of two numbers is the xor of their binary representations, bit by bit. The bit that determines
whether $x \\oplus a$ is greater than or less than $a$ is the most significant one bit (the leftmost one bit) 
of $x$. Every bit to the left of it in $x \\oplus a$ will be the same as in $a$.
Since the most significant one bit of $x$ is $1$, that bit in $a$ will be toggled in $x \\oplus a$.  
Consider the following examples that illustrate this:

Example 1:
- $x = 11 = 0001011_2$, $a = 82 = 1010010_2$, $x \\oplus a = 89 = 1011001_2$.

| $x$ | $a$ | $x \\oplus a$ |
|---|---|---------|
| 0 | 1 | 1       |
| 0 | 0 | 0       |
| 0 | 1 | 1       |
| 1 | 0 | 1       |
| 0 | 0 | 0       |
| 1 | 1 | 0       |
| 1 | 0 | 1       |

Notice that the three leftmost bits of $x \\oplus a$ are the same as in $a$, but the next bit changes from $0$ to $1$.
Therefore, $x \\oplus a$ is greater than $a$.

Example 2:
- $x = 11 = 0001011_2$, $a = 90 = 1011010_2$, $x \\oplus a = 81 = 1010001_2$.

| $x$ | $a$ | $x \\oplus a$ |
|---|---|---------|
| 0 | 1 | 1       |
| 0 | 0 | 0       |
| 0 | 1 | 1       |
| 1 | 1 | 0       |
| 0 | 0 | 0       |
| 1 | 1 | 0       |
| 1 | 0 | 1       |

Notice that the three leftmost bits of $x \\oplus a$ are the same as in $a$, but the next bit changes from $1$ to $0$.
Therefore, $x \\oplus a$ is less than $a$.
  
These examples show that the $x \\oplus a$ is less than $a$ if the most significant one bit of $x$ is $1$ in $a$.
Conversely, $x \\oplus a$ is greater than $a$ if the most significant one bit of $x$ is $0$ in $a$.  

Finally, this leads us to our optimal move. We can find a pile $a$ such that $x \\oplus a < a$ by finding
a pile $a$ such that the most significant one bit of $x$ is $1$ in $a$. There will always be such a pile
due to the properties of xor.
`;
export default function NimStrategy() {
    return <div className="m-4"><MarkdownWrapper content={content} /></div>;
}
