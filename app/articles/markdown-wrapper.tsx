import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles
import Link from 'next/link';

export default function MarkdownWrapper({ content }: { content: string }) {
    return <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2 mt-4" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-md font-bold mt-4" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc list-inside my-4" {...props} />,
            li: ({ node, ...props }) => <li className="list-disc list-inside" {...props} />,
            table: ({ node, ...props }) => <table className="table-auto border-collapse border border-foreground" {...props} />,
            th: ({ node, ...props }) => <th className="border border-foreground px-4 py-2" {...props} />,
            td: ({ node, ...props }) => <td className="border border-foreground px-4 py-2" {...props} />,
            a: ({ node, href, ...props }) => <Link href={href!} className='text-accent hover:underline' {...props} />,
            p: ({ node, children, ...props }) => <p {...props}>{children}</p>
        }}
    >
        {content}
    </ReactMarkdown>

}
