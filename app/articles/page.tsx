import Link from "next/link";
import ArticleTile from "./article-tile";
import { title } from "process";

const articles = [
    { title: "Introduction to Game Theory", slug: "introduction" },
    { title: "Game Theory Concepts", slug: "game-theory-concepts" },
    { title: "How to Play Marbles", slug: "marbles-how" },
    { title: "Marbles: Strategy", slug: "marbles-strategy" },
    { title: "How to Play Nim", slug: "nim-how" },
    { title: "Nim: Strategy", slug: "nim-strategy" },
    { title: "How to Play Lone Knight", slug: "loneknight-how" },
    { title: "Lone Knight: Strategy", slug: "loneknight-strategy" },
    { title: "Sprague-Grundy Theorem", slug: "sprague-grundy" },
    { title: "How to Play Multi Knight", slug: "multiknight-how" },
    { title: "Multi Knight: Strategy", slug: "multiknight-strategy" },

];

export default function Articles() {
    const articleTiles = articles.map((article) => (
        <Link href={`/articles/${article.slug}`} key={article.slug}>
            <ArticleTile {...article} />
        </Link>
    ));
    return <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
        {articleTiles}
    </div>
}
