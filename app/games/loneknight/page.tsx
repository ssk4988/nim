'use client';
import { Button } from "@/components/ui/button";
import { LoneKnightState } from "@/games/loneknight";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { GameMenu } from "../game-menu";
import { GameSidebar } from "../game-sidebar";
import { cn } from "@/lib/utils";
import { knightValidMoves, knightDirections } from "@/games/knight";
import TurnPrompt from "../turn-prompt";
import { computerThinkingTime } from "@/lib/constants";

export default function LoneKnightPlayer() {
    const { data: session } = useSession();
    // Initialize game state
    let [board, setBoard] = useState<LoneKnightState>(LoneKnightState.gen());
    let [pickedSide, setPickedSide] = useState<boolean>(false);
    let [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    let computerRef = useRef<NodeJS.Timeout | null>(null);

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
        }, computerThinkingTime);
        computerRef.current = timer;
    }, [board, pickedSide]);

    // Print out game state for debugging
    useEffect(() => {
        console.log("Game State: ", board);
        console.log("Grundy Value: ", board.grundyValue());
    }, [board]);

    let isPlayerTurn = board.turn && pickedSide;
    let moveSpots: { row: number, col: number, direction: number }[] = [];
    if (isPlayerTurn) {
        moveSpots = knightValidMoves(board.knightPosition.row, board.knightPosition.col).map(move => {
            return {
                row: board.knightPosition.row + knightDirections[move.direction].row,
                col: board.knightPosition.col + knightDirections[move.direction].col,
                direction: move.direction
            }
        });
    }
    let rows = [];
    for (let i = 0; i < LoneKnightState.boardHeight; i++) {
        let row = [];
        for (let j = 0; j < LoneKnightState.boardWidth; j++) {
            let isKnight = i === board.knightPosition.row && j === board.knightPosition.col;
            let className = "w-8 h-8 border flex items-center justify-center";
            let tileColor = 'bg-gray-200';
            let cell = null;
            if (isKnight) {
                cell = "♞";
                tileColor = "bg-blue-500";
            } else if (moveSpots.some(spot => spot.row === i && spot.col === j)) {
                let direction = moveSpots.find(spot => spot.row === i && spot.col === j)!.direction;
                cell = <Button onClick={() => {
                    let newBoard = board.clone();
                    newBoard.applyMove({ direction });
                    setBoard(newBoard);
                }}>•</Button>;
                tileColor = "bg-green-200";
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

    let turnPrompt = <TurnPrompt
        firstAction={() => {
            setPickedSide(true);
            setBoard(board => {
                board.turn = true;
                return board;
            });
        }}
        secondAction={() => {
            setPickedSide(true);
            setBoard(board => {
                board.turn = false;
                return board;
            });
        }} />

    let menu = <GameMenu
        onHelp={() => setSidebarOpen(!sidebarOpen)}
        onRestart={() => {
            setBoard(LoneKnightState.gen());
            setPickedSide(false);
            setSidebarOpen(false);
            console.log("New game started");
        }}
        onUndo={() => {
            if (computerRef.current) {
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
        <p>Players take turns moving the knight on the board. The player who moves the knight last before it
            is unable to move anymore wins.</p>
        <h2 className="text-lg font-bold">How to Play</h2>
        <p>
            To play, click on the square you want to move the knight to. The knight can move in an L shape, like in chess.
            However, it is restricted to moves that increase its distance from the upper left corner of the board.
        </p>
    </GameSidebar>

    return (
        <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(100vh - var(--navbar-height))" }}>
            <h1 className="text-2xl font-bold my-8">Lone Knight</h1>
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
