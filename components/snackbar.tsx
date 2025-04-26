'use client';
import { ReactNode, FC, createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

type SnackbarMessage = {
    id: number;
    text: string;
    error: boolean; // Optional error flag
    duration: number; // Duration in milliseconds (default: 3000)
};
type SnackbarInput = {
    text: string;
    error?: boolean; // Optional error flag
    duration?: number; // Duration in milliseconds (default: 3000)
};
type SnackbarContextType = {
    addSnackbarMessage: (msg: SnackbarInput) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<SnackbarMessage[]>([]);
    const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

    const addSnackbarMessage = useCallback(({text, duration = 5000, error = false}: SnackbarInput) => {
        const id = Date.now(); // Unique ID for the message
        setMessages((prev) => [...prev, { id, text, duration, error }]);

        if (duration === Infinity) return;
        // Automatically remove the message after the duration
        const timeout = setTimeout(() => {
            console.log("Clearing timeout for message:", id);
            setMessages((prev) => prev.filter((msg) => msg.id !== id));
            timeoutsRef.current.delete(id);
        }, duration);

        timeoutsRef.current.set(id, timeout);
    }, []);

    useEffect(() => {
        return () => {
            // Clear all timeouts when the component unmounts
            console.log("Clearing all timeouts in SnackbarProvider");
            timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
            timeoutsRef.current.clear();
        };
    }, []);

    return (
        <SnackbarContext.Provider value={{ addSnackbarMessage }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${msg.error ? "bg-red-500" : "bg-gray-800"} text-white px-4 py-2 rounded shadow-lg animate-slide-in-from-bottom`}
                    >
                        {msg.text}
                    </div>
                ))}
            </div>
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = (): SnackbarContextType => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
};
