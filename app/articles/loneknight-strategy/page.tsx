'use client'
import { useState } from "react";
import MarkdownWrapper from "../markdown-wrapper";
import { Button } from "@/components/ui/button";

const initialContent = `
## Lone Knight: Strategy
### Determining Winning and Losing States
You can determine the strategy for Lone Knight by determining the winning and losing states.
This is a worthwhile exercise to do yourself. A starting point is the squares on the board that 
have no valid moves:  

[knight-corner]
  
Again, try to fill in the rest of the board yourself before looking at the solution.
`;

const hiddenContent = `
The winning and losing states are as follows:
  
[knight-winlose]

### Observations
With the exception of the top left square (hopefully you didn't miss that one), the losing squares 
form 2x2 blocks that are separated by 2 rows and 2 columns. This is a consequence of the fact that 
the knight can't move 3 squares in a direction.
`;
export default function LoneKnightStrategy() {
    const [showMore, setShowMore] = useState(false);
    return <div className="m-4">
        <MarkdownWrapper content={initialContent} />
        <Button onClick={() => setShowMore((previous) => !previous)} className="mt-4 mb-4">{showMore ? "Hide" : "Show"} More</Button>
        {showMore && <MarkdownWrapper content={hiddenContent} />}
    </div>;
}
