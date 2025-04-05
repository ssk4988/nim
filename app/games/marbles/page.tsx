'use client';
import { Button } from "@/components/ui/button";
import { MarblesState } from "@/games/marbles";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { GameMenu } from "../game-menu";
import { GameSidebar } from "../game-sidebar";

export default function MarblesPlayer() {
    const { data: session } = useSession();
    // Initialize game state
    let [board, setBoard] = useState<MarblesState>(MarblesState.gen());
    let [pickedSide, setPickedSide] = useState<boolean>(false);
    let [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    // Computer AI
    useEffect(() => {
        if (board.turn || !pickedSide || board.isGameOver()) return;
        setTimeout(() => {
            setBoard(board => {
                if (board.turn || !pickedSide || board.isGameOver()) return board;
                let move = board.optimalMove();
                const newBoard = board.clone();
                if (!newBoard.applyMove(move)) {
                    console.log("Invalid computer move: ", move);
                }
                return newBoard;
            });
        }, 1000);
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

    let stones = [];
    let disabled = !board.turn || !pickedSide;
    for (let i = 1; i <= board.marbles; i++) {
        stones.push(
            <button
                key={i}
                className={`stone-button ${disabled || i > board.maxMarblesPerTurn ? "no-hover" : ""}`}
                onClick={() => {
                    console.log("Clicked stone:", i);
                    if (disabled) return;
                    let functionalAmount = Math.min(board.maxMarblesPerTurn, i);
                    let move = { amount: functionalAmount };
                    const newBoard = board.clone();
                    if (!newBoard.applyMove(move)) {
                        console.log("Invalid move: ", move);
                    }
                    setBoard(newBoard);
                }}
                disabled={disabled}
            ></button>
        );
    }
    stones.reverse();

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
            setBoard(MarblesState.gen());
            setPickedSide(false);
            setSidebarOpen(false);
            console.log("New game started");
        }}
        onUndo={() => {
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
        <p>
            Players take turns removing 1 to {board.maxMarblesPerTurn} stones from a pile of stones. The player who takes the last stone wins.
        </p>
    </GameSidebar>

    return (
        <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(100vh - var(--navbar-height))" }}>
            <h1 className="text-2xl font-bold my-8">Marbles Game</h1>
            {menu}
            <div className="text-lg">{statusMessage}</div>
            {!pickedSide && turnPrompt}
            <div className="flex flex-row items-end justify-center gap-9 mt-8 min-h-[200px]">
                {stones}
            </div>
            {sidebar}
        </div>
    );
}
