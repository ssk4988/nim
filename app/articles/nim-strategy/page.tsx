import MarkdownWrapper from "../markdown-wrapper";

const content = `
## Nim: Strategy
### Xor
Xor (denoted with $\\oplus$) is a binary operation (like addition or multiplication) that takes two numbers and returns a number.
Imagine first that xor is only defined on 0 and 1, and that it is defined as follows:

| a | b | a $\\oplus$ b |
|---|---|---------|
| 0 | 0 | 0       |
| 0 | 1 | 1       |
| 1 | 0 | 1       |
| 1 | 1 | 0       |
  
The table above shows the truth table for xor. The result of xor is 1 if the two bits are different, and 0 if they are the same.
Now, we can extend this to larger numbers. The xor of two numbers is the xor of their binary representations, bit by bit. For example:
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
### Nim-Sum
What does this have to do with Nim? The xor of the sizes of the piles is called the nim-sum. 
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
`;
export default function NimStrategy() {
    return <div className="m-4"><MarkdownWrapper content={content} /></div>;
}
