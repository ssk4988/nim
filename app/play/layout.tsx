'use client';
import { SocketProvider } from "./socket-context";

export const timerUpdatePeriod = 500;

export default function Layout({ children }: { children: React.ReactNode }) {
    return <SocketProvider>
        {children}
    </SocketProvider>
}
