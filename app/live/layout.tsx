'use client';
import { useEffect } from "react";
import { SocketProvider } from "./socket-context";
import { useSnackbar } from "@/components/snackbar";
import { useSession } from "next-auth/react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const { addSnackbarMessage } = useSnackbar();
    // Send an error message if user is not logged in
    useEffect(() => {
        if (!session) {
            const timeout = setTimeout(() => {
                console.error("Session not found");
                addSnackbarMessage({ text: "You must be logged in to play live games", error: true, duration: Infinity });
            }, 2000);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [session]);
    return <SocketProvider>
        {children}
    </SocketProvider>
}
