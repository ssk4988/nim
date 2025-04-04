'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Welcome to Nim Hub</h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Challenge yourself with classic mathematical games and learn the principles of game theory.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/games">Play Games</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/articles">Read Articles</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
