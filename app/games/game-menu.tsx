import React from "react";

interface GameMenuProps {
    onHelp: () => void;
    onRestart: () => void;
    onUndo: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onHelp, onRestart, onUndo }) => {
    return (
        <div className="absolute top-4 right-4 rounded-lg shadow-lg">
            <button onClick={onHelp} className="icon-button">
                <span className="material-icons">help_outline</span>
            </button>
            <button onClick={onRestart} className="icon-button">
                <span className="material-icons">refresh</span>
            </button>
            <button onClick={onUndo} className="icon-button">
                <span className="material-icons">undo</span>
            </button>
        </div>
    );
};
