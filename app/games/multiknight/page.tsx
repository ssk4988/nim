'use client';
import { Button } from "@/components/ui/button";
import { KnightState } from "@/games/multiknight";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { GameMenu } from "../game-menu";
import { GameSidebar } from "../game-sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "@radix-ui/themes";
import { knightDirections, knightValidMoves } from "@/games/knight";

type Cell = {
    row: number;
    col: number;
};

export default function MultiKnightPlayer() {
    const { data: session } = useSession();
    // Initialize game state
    let [board, setBoard] = useState<KnightState>(KnightState.gen());
    let [pickedSide, setPickedSide] = useState<boolean>(false);
    let [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    let computerRef = useRef<NodeJS.Timeout | null>(null);
    let [selectedCell, setSelectedCell] = useState<Cell | null>(null);


    // Computer AI
    useEffect(() => {
        if (board.turn || !pickedSide || board.isGameOver()) return;
        let timer = setTimeout(() => {
            if (board.turn || !pickedSide || board.isGameOver()) return;
            let move = board.optimalMove();
            const newBoard = board.clone();
            if (!newBoard.applyMove(move)) {
                console.log("Invalid computer move: ", move);
            }
            setBoard(newBoard);
        }, 1000);
        computerRef.current = timer;
    }, [board, pickedSide]);

    // Print out game state for debugging
    useEffect(() => {
        console.log("Game State: ", board);
        console.log("Grundy Value: ", board.grundyValue());
    }, [board]);

    // mark that a game has been played
    useEffect(() => {
        if (!session) return;
        if (!pickedSide) return;
        if (!board.isGameOver()) return;
        console.log("Game over, marking game as played");
        const markGamePlayed = async () => {
            const response = await fetch("/api/games/track", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Game marked as played: ", data);
            } else {
                console.error("Failed to mark game as played");
                const errorData = await response.json();
                console.error("Error: ", errorData);
            }
        };
        markGamePlayed();
    }, [session, board, pickedSide]);

    let isPlayerTurn = board.turn && pickedSide;
    let moveSpots: {row: number, col: number, direction: number}[] = [];
    if(isPlayerTurn && selectedCell != null){
        let { row, col } = selectedCell;
        moveSpots = knightValidMoves(row, col).map(move => {
            return {
                row: row + knightDirections[move.direction].row,
                col: col + knightDirections[move.direction].col,
                direction: move.direction
            }
        });
    }
    let rows = [];
    for (let i = 0; i < KnightState.boardHeight; i++) {
        let row = [];
        for (let j = 0; j < KnightState.boardWidth; j++) {
            let hasKnight = board.grid[i][j] > 0;
            let isMoveSpot = moveSpots.some(spot => spot.row === i && spot.col === j);
            let className = "w-8 h-8 border flex items-center justify-center";
            let tileColor = 'bg-gray-200';
            let cell = null;
            let clickAction = () => {};
            if(isMoveSpot) {
                let direction = moveSpots.find(spot => spot.row === i && spot.col === j)!.direction;
                clickAction = () => {
                    let newBoard = board.clone();
                    newBoard.applyMove({ row: selectedCell!.row, col: selectedCell!.col, direction });
                    setBoard(newBoard);
                    setSelectedCell(null);
                }
                tileColor = "bg-green-200";
            } else if(hasKnight) {
                clickAction = () => {
                    if (isPlayerTurn) {
                        setSelectedCell(selectedCell => {
                            if(selectedCell?.row === i && selectedCell?.col === j) return null;
                            return { row: i, col: j };
                        });
                    }
                }
                if (selectedCell?.row === i && selectedCell?.col === j) {
                    tileColor = "bg-blue-300";
                } else {
                    tileColor = "bg-blue-500";
                }
            }
            if(hasKnight) {
                cell = <Button onClick={clickAction}>
                    ♞
                    <Badge className="text-xs">{board.grid[i][j]}</Badge>
                </Button>
            } else if(moveSpots.some(spot => spot.row === i && spot.col === j)) {
                cell = <Button onClick={clickAction}>•</Button>;
            }
            className = cn(className, tileColor);
            row.push(<div key={`${i}-${j}`} className={className}>{cell}</div>);
        }
        rows.push(<div key={i} className="flex">{row}</div>);
    }
    let grid = <div className="flex flex-col">
        {rows}
    </div>;
    let statusMessage = "";
    if (!pickedSide) {
        statusMessage = "Would you like to play first or second?";
    } else if (board.isGameOver()) {
        statusMessage = board.turn ? "You lose!" : "You win!";
    } else {
        statusMessage = board.turn ? "It's your turn!" : "Computer is thinking...";
    }

    let turnPrompt = <div className="flex justify-center mt-4 gap-2">
        <Button variant="outline" className="w-20" onClick={() => setPickedSide(true)}>First</Button>
        <Button variant="outline" className="w-20" onClick={() => {
            setPickedSide(true);
            setBoard(board => {
                board.turn = false;
                return board;
            });
        }}>Second</Button>
    </div>

    let menu = <GameMenu
        onHelp={() => setSidebarOpen(!sidebarOpen)}
        onRestart={() => {
            setBoard(KnightState.gen());
            setPickedSide(false);
            setSidebarOpen(false);
            console.log("New game started");
        }}
        onUndo={() => {
            if(computerRef.current) {
                clearTimeout(computerRef.current);
                computerRef.current = null;
            }
            const newBoard = board.clone();
            if (newBoard.turn) {
                console.log("Player turn, undoing move");
                newBoard.undoMove();
            }
            console.log("Computer turn, undoing move");
            newBoard.undoMove();
            setBoard(newBoard);
        }}
    />

    let sidebar = <GameSidebar open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <h2 className="text-lg font-bold">Rules</h2>
        <p>Players take turns moving any knight on the board. The player who makes the last move wins.</p>
        <h2 className="text-lg font-bold">How to Play</h2>
        <p>
            To play, click on a knight and then select the square you want to move the knight to. A knight can move 
            in an L shape, like in chess. However, it is restricted to moves that increase its distance from the 
            upper left corner of the board. If a knight has no more available moves, you can't move it anymore.
            The game ends when all knights are unable to move anymore.
        </p>
    </GameSidebar>

    return (
        <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(100vh - var(--navbar-height))" }}>
            <h1 className="text-2xl font-bold my-8">Multi Knight</h1>
            {menu}
            <div className="text-lg">{statusMessage}</div>
            {!pickedSide && turnPrompt}
            <div className="flex flex-row items-end justify-center gap-9 mt-8 min-h-[200px]">
                {grid}
            </div>
            {sidebar}
        </div>
    );
}
