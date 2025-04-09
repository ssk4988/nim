import React from "react";
import { HelpCircle, RotateCcw, Undo } from "lucide-react";

interface GameMenuProps {
    onHelp?: () => void;
    onRestart?: () => void;
    onUndo?: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onHelp, onRestart, onUndo }) => {
    return (
        <div className="absolute top-4 right-4 rounded-lg shadow-lg">
            {onHelp && <button onClick={onHelp} className="icon-button">
                <HelpCircle className="w-5 h-5" />
            </button>}
            {onRestart && <button onClick={onRestart} className="icon-button">
                <RotateCcw className="w-5 h-5" />
            </button>}
            {onUndo && <button onClick={onUndo} className="icon-button">
                <Undo className="w-5 h-5" />
            </button>}
        </div>
    );
};
