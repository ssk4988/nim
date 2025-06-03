'use client';
import { Button } from "@/components/ui/button";
import { MarblesState } from "@/games/marbles";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { GameMenu } from "../game-menu";
import { GameSidebar } from "../game-sidebar";
import TurnPrompt from "../turn-prompt";
import MarblesRenderer from "./marbles-renderer";
import { computerThinkingTime, DEBUG } from "@/lib/constants";

export default function MarblesPlayer() {
    const { data: session } = useSession();
    // Initialize game state
    let [board, setBoard] = useState<MarblesState>(MarblesState.gen());
    let [pickedSide, setPickedSide] = useState<boolean>(false);
    let [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    let computerRef = useRef<NodeJS.Timeout | null>(null);

    // Computer Logic
    useEffect(() => {
        if (board.turn || !pickedSide || board.isGameOver()) return;
        let timer = setTimeout(() => {
            if (board.turn || !pickedSide || board.isGameOver()) return;
            let move = board.optimalMove();
            const newBoard = board.clone();
            if (!newBoard.applyMove(move)) {
                console.error("Invalid computer move: ", move);
            }
            setBoard(newBoard);
        }, computerThinkingTime);
        computerRef.current = timer;
    }, [board, pickedSide]);

    // Print out game state for debugging
    if (DEBUG) {
        useEffect(() => {
            console.log("Game State: ", board);
            console.log("Grundy Value: ", board.grundyValue());
        }, [board]);
    }

    let marblesRenderer = <MarblesRenderer gameState={board} submitter={(move) => {
        const newBoard = board.clone();
        if (!newBoard.applyMove(move)) {
            console.error("Invalid move: ", move);
        }
        setBoard(newBoard);
    }} />

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
            setBoard(MarblesState.gen());
            setPickedSide(false);
            setSidebarOpen(false);
            if (DEBUG) console.log("New game started");
        }}
        onUndo={() => {
            if (computerRef.current) {
                clearTimeout(computerRef.current);
                computerRef.current = null;
            }
            const newBoard = board.clone();
            if (newBoard.turn) {
                if (DEBUG) console.log("Player turn, undoing move");
                newBoard.undoMove();
            }
            if (DEBUG) console.log("Computer turn, undoing move");
            newBoard.undoMove();
            setBoard(newBoard);
        }}
    />

    let sidebar = <GameSidebar open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <h2 className="text-lg font-bold">Rules</h2>
        <p>
            Players take turns removing 1 to {board.maxMarblesPerTurn} marbles from a pile of marbles. The player who takes the last marble wins.
        </p>
    </GameSidebar>

    return (
        <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(100vh - var(--navbar-height))" }}>
            <h1 className="text-2xl font-bold my-8">Marbles</h1>
            {menu}
            <div className="text-lg">{statusMessage}</div>
            {!pickedSide && turnPrompt}
            {marblesRenderer}
            {sidebar}
        </div>
    );
}
