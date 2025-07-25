'use client';
import { MultiKnightState } from "@/games/multiknight";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { GameMenu } from "../game-menu";
import { GameSidebar } from "../game-sidebar";
import { Cell } from "@/types/knight";
import TurnPrompt from "../turn-prompt";
import { computerThinkingTime, DEBUG } from "@/lib/constants";
import MultiKnightRenderer from "./multiknight-renderer";

export default function MultiKnightPlayer() {
    const { data: session } = useSession();
    // Initialize game state
    const [board, setBoard] = useState<MultiKnightState>(MultiKnightState.gen());
    const [pickedSide, setPickedSide] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const computerRef = useRef<NodeJS.Timeout | null>(null);
    const [selectedCell, setSelectedCell] = useState<Cell | null>(null);


    // Computer Logic
    useEffect(() => {
        if (board.turn || !pickedSide || board.isGameOver()) return;
        const timer = setTimeout(() => {
            if (board.turn || !pickedSide || board.isGameOver()) return;
            const move = board.optimalMove();
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

    const multiKnightRenderer = <MultiKnightRenderer gameState={board} selectedCell={selectedCell} submitter={(move) => {
        const newBoard = board.clone();
        if (!newBoard.applyMove(move)) {
            console.error("Invalid move: ", move);
        }
        setBoard(newBoard);
        setSelectedCell(null);
    }} setSelectedCell={setSelectedCell} />

    let statusMessage = "";
    if (!pickedSide) {
        statusMessage = "Would you like to play first or second?";
    } else if (board.isGameOver()) {
        statusMessage = board.turn ? "You lose!" : "You win!";
    } else {
        statusMessage = board.turn ? "It's your turn!" : "Computer is thinking...";
    }

    const turnPrompt = <TurnPrompt
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

    const menu = <GameMenu
        onHelp={() => setSidebarOpen(!sidebarOpen)}
        onRestart={() => {
            setBoard(MultiKnightState.gen());
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

    const sidebar = <GameSidebar open={sidebarOpen} onOpenChange={setSidebarOpen}>
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
                {multiKnightRenderer}
            </div>
            {sidebar}
        </div>
    );
}
