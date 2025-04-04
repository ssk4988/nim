'use client';
import { Button } from "@/components/ui/button";
import { NimState } from "@/games/nim";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { GameMenu } from "../game-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function NimPlayer() {
    const { data: session } = useSession();
    const user = session?.user;
    // Initialize game state
    let [board, setBoard] = useState<NimState>(NimState.gen());
    let [pickedSide, setPickedSide] = useState<boolean>(false);
    let [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    // Computer AI
    useEffect(() => {
        if (board.turn || !pickedSide || board.isGameOver()) return;
        setTimeout(() => {
            setBoard(board => {
                if (board.turn || !pickedSide || board.isGameOver()) return board;
                let move = board.optimalMove();
                const newBoard = new NimState([...board.piles], board.turn, [...board.moves]);
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

    let piles = board.piles.map((pile, index) => {
        if (pile === 0) return null;
        let stones = [];
        let disabled = !board.turn || !pickedSide;
        for (let i = 1; i <= pile; i++) {
            stones.push(
                <button
                    key={i}
                    className={`stone-button ${disabled ? "no-hover":""}`}
                    onClick={() => {
                        console.log("Clicked pile: ", index, " amount: ", i);
                        if (disabled) return;
                        let move = { pile: index, amount: i };
                        const newBoard = new NimState([...board.piles], board.turn, [...board.moves]);
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
        return (<div key={index} className="flex flex-col-reverse items-center justify-center">{stones}</div>);
    });

    let statusMessage = "";
    if (!pickedSide) {
        statusMessage = "Would you like to play first or second?";
    } else if (board.isGameOver()) {
        statusMessage = board.turn ? "You lose!" : "You win!";
    } else {
        statusMessage = board.turn ? "It's your turn!" : "Computer is thinking...";
    }

    let sidebar = (
        <dialog
            open={sidebarOpen}
            className="w-[20rem] bg-opacity-50 padding-4 margin-4 border-1">
            <h2>Rules</h2>
            <p>
                Nim is a mathematical game of strategy in which two players take turns removing stones from piles. On each turn, a player must pick a pile and remove at least one stone from it. The goal of the game is to be the player who removes the last stone.
            </p>
            <h2>How to Play</h2>
            <p>
                To play, select a pile and remove any number of stones from it. The player who removes the last stone wins the game.
            </p>
            <p>
                For more information, visit
                <a
                    href="https://brilliant.org/wiki/nim/"
                    target="_
                        blank"
                >
                    Brilliant's Article on Nim
                </a>
            </p>
        </dialog>
    );

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
            setBoard(NimState.gen());
            setPickedSide(false);
            setSidebarOpen(false);
            console.log("New game started");
        }}
        onUndo={() => {
            const newBoard = new NimState([...board.piles], board.turn, [...board.moves]);
            if (newBoard.turn) {
                console.log("Player turn, undoing move");
                newBoard.undoMove();
            }
            console.log("Computer turn, undoing move");
            newBoard.undoMove();
            setBoard(newBoard);
        }}
    />

    let sheet = <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[20rem]">
            <h2 className="text-lg font-bold">Rules</h2>
            <p>
                Nim is a mathematical game of strategy in which two players take turns removing stones from piles. On each turn, a player must pick a pile and remove at least one stone from it. The goal of the game is to be the player who removes the last stone.
            </p>
            <h2 className="text-lg font-bold">How to Play</h2>
            <p>
                To play, select a pile and remove any number of stones from it. The player who removes the last stone wins the game.
            </p>
            <p>
                For more information, visit&nbsp;
                <a
                    href="https://brilliant.org/wiki/nim/"
                    target="_blank"
                    className="text-blue-500 hover:underline"
                >
                    Brilliant's Article on Nim
                </a>
            </p>
        </SheetContent>
    </Sheet>

    return (
        <div className="container mx-auto flex flex-col items-center h-screen relative">
            <h1 className="text-2xl font-bold my-8">Nim Game</h1>
            {menu}
            <div className="text-lg">{statusMessage}</div>
            {!pickedSide && turnPrompt}
                <div className="flex flex-row items-end justify-center gap-9 mt-8">
                    {piles}
                </div>
            {sidebar}
            {sheet}
        </div>
    );
}
