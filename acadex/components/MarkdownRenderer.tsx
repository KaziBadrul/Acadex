// components/MarkdownRenderer.tsx
"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  markdown: string;
}

export default function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    // Styling class needs @tailwindcss/typography plugin
    <div className="prose lg:prose-lg max-w-none p-6 bg-white text-black border rounded-lg shadow-md">
      <ReactMarkdown
        // Handles GitHub Flavored Markdown (tables, checklists)
        remarkPlugins={[remarkGfm]}
        // Allows rendering of raw HTML elements (like video embeds)
        rehypePlugins={[rehypeRaw]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}