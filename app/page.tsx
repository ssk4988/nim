import Link from "next/link";

export default function Home() {
  return (
    <Link href="/games">
      <button>
        Games
      </button>
    </Link>
  );
}
