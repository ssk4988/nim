import { Game } from "@/types/websocket";
import React, { createContext, useContext, useState } from "react";

interface GameContextType {
    gameData: Game<any> | null;
    setGameData: React.Dispatch<React.SetStateAction<any>>;
}

export const GameContext = createContext<GameContextType>({ gameData: null, setGameData: () => {} });

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameData, setGameData] = useState<any>(null);

    return (
        <GameContext.Provider value={{ gameData, setGameData }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGameContext must be used within a GameProvider");
    }
    return context;
};
