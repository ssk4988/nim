'use client';
import { SocketProvider } from "./socket-context";
import { GameProvider } from "./game-context";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <SocketProvider>
        <GameProvider>
            {children}
        </GameProvider>
    </SocketProvider>
}
