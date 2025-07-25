'use client';
import { NimState } from "@/games/nim";
import { useEffect, useRef, useState } from "react";
import { GameMenu } from "../game-menu";
import { GameSidebar } from "../game-sidebar";
import TurnPrompt from "../turn-prompt";
import NimRenderer from "./nim-renderer";
import { computerThinkingTime, DEBUG } from "@/lib/constants";

export default function NimPlayer() {
    // Initialize game state
    const [board, setBoard] = useState<NimState>(NimState.gen());
    const [pickedSide, setPickedSide] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const computerRef = useRef<NodeJS.Timeout | null>(null);

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

    const nimRenderer = <NimRenderer gameState={board} submitter={(move) => {
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
            setBoard(NimState.gen());
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
    </GameSidebar>

    return (
        <div className="container mx-auto flex flex-col items-center relative" style={{ height: "calc(100vh - var(--navbar-height))" }}>
            <h1 className="text-2xl font-bold my-8">Nim</h1>
            {menu}
            <div className="text-lg">{statusMessage}</div>
            {!pickedSide && turnPrompt}
            {nimRenderer}
            {sidebar}
        </div>
    );
}
