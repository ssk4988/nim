'use client';
import { NimState } from "@/games/nim";
import { useEffect, useState } from "react";

export default function NimPlayer() {
    let [board, setBoard] = useState<NimState>(NimState.gen());
    let playerTurn = board.turn;
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

    let piles = board.piles.map((pile, index) => {
        if (pile === 0) return null;
        let stones = [];
        let disabled = !playerTurn || !pickedSide;
        for (let i = 1; i <= pile; i++) {
            stones.push(
                <button
                    key={i}
                    className="stone-button" 
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
        return (<div key={index} className="flex flex-col-reverse items-center justify-center mx-3">{stones}</div>);
    });

    let statusMessage = "";
    if (!pickedSide) {
        statusMessage = "Would you like to play first or second?";
    } else if (board.isGameOver()) {
        statusMessage = playerTurn ? "You lose!" : "You win!";
    } else {
        statusMessage = playerTurn ? "It's your turn!" : "Computer is thinking...";
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

    let turnPrompt = <div className="flex justify-center mt-4">
        <button onClick={() => setPickedSide(true)} className="turn-button">First</button>
        <button onClick={() => {
            setPickedSide(true);
            setBoard(board => {
                board.turn = false;
                return board;
            });
        }} className="turn-button">Second</button>
    </div>

    let menu = <div className="absolute top-4 right-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="icon-button">
            <span className="material-icons">help_outline</span>
        </button>
        <button onClick={() => {
            setBoard(NimState.gen());
            setPickedSide(false);
            setSidebarOpen(false);
            console.log("New game started");
        }} className="icon-button">
            <span className="material-icons">refresh</span>
        </button>
        <button onClick={() => {
            const newBoard = new NimState([...board.piles], board.turn, [...board.moves]);
            if (newBoard.turn) {
                console.log("Player turn, undoing move");
                newBoard.undoMove();
            }
            console.log("Computer turn, undoing move");
            newBoard.undoMove();
            setBoard(newBoard);
        }} className="icon-button">
            <span className="material-icons">undo</span>
        </button>
    </div>

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Nim Game</h1>
            {menu}
            <div className="flex flex-col items-center justify-center">
                <div className="text-lg font-semibold">{statusMessage}</div>
                <div className="flex flex-row items-end justify-center mb-4">
                    {piles}
                </div>
                {!pickedSide && turnPrompt}
            </div>
            {sidebar}
        </div>
    );
}
