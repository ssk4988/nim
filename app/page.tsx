'use client';
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user;
  const signButton = user ? (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  ) : (
    <button onClick={() => signIn("google", undefined, { prompt: "login" })}>
      Sign In
    </button>
  );
  return (
    <>
      <Link href="/games">
        <button>
          Games
        </button>
      </Link>
      {signButton}
    </>
  );
}
