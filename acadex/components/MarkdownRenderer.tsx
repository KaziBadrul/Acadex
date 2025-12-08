// components/MarkdownRenderer.tsx
"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm"; // Good for standard tables, strikethrough etc.

interface MarkdownRendererProps {
  markdown: string;
}

export default function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    // 'prose' is a Tailwind CSS class that styles raw Markdown output for readability
    <div className="prose lg:prose-lg max-w-none p-6 bg-white border rounded-lg shadow-md">
      <ReactMarkdown
        // remarkGfm handles GitHub Flavored Markdown (tables, checklists)
        remarkPlugins={[remarkGfm]}
        // rehypeRaw allows rendering of raw HTML elements (like video embeds) within the Markdown
        rehypePlugins={[rehypeRaw]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
