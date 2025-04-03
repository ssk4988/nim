'use client';
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;
    const userName = user?.name || "Guest";
    console.log(session);
    return (
        <nav>
            <p>Navbar: Hello, {userName}</p>
        </nav>
    );
}
