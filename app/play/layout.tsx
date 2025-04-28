'use client';
import { SocketProvider } from "./socket-context";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <SocketProvider>
        {children}
    </SocketProvider>
}
