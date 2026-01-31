"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { useEffect } from "react";
import Image from "@tiptap/extension-image";

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const IconButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-white text-black shadow-sm"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-950 border border-zinc-800 rounded-t-2xl sticky top-0 z-10 select-none">
      <div className="flex gap-1 pr-2 border-r border-zinc-800">
        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
          </svg>
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" x2="10" y1="4" y2="4" />
            <line x1="14" x2="5" y1="20" y2="20" />
            <line x1="15" x2="9" y1="4" y2="20" />
          </svg>
        </IconButton>
      </div>

      <div className="flex gap-1 pr-2 border-r border-zinc-800">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" x2="3" y1="6" y2="6" />
            <line x1="15" x2="3" y1="12" y2="12" />
            <line x1="17" x2="3" y1="18" y2="18" />
          </svg>
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" x2="3" y1="6" y2="6" />
            <line x1="19" x2="5" y1="12" y2="12" />
            <line x1="21" x2="3" y1="18" y2="18" />
          </svg>
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" x2="3" y1="6" y2="6" />
            <line x1="21" x2="9" y1="12" y2="12" />
            <line x1="21" x2="7" y1="18" y2="18" />
          </svg>
        </IconButton>
      </div>

      <div className="flex gap-1 pr-2 border-r border-zinc-800">
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12h8" />
            <path d="M4 18V6" />
            <path d="M12 18V6" />
            <path d="m17 12 3-2v8" />
          </svg>
        </IconButton>
        <IconButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12h8" />
            <path d="M4 18V6" />
            <path d="M12 18V6" />
            <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
          </svg>
        </IconButton>
      </div>

      <div className="flex items-center gap-2 ml-1">
        <div className="relative flex items-center justify-center w-6 h-6 rounded hover:bg-zinc-800 cursor-pointer group">
          <svg
            className="absolute text-zinc-400 group-hover:text-zinc-200 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18.375 2.625a3.875 3.875 0 0 0-5.48 5.48L5.25 15.75a3 3 0 0 0-.879 2.121V21h3.121a3 3 0 0 0 2.121-.879l7.645-7.645a3.875 3.875 0 0 0 5.48-5.48Z" />
            <path d="M14 6l4 4" />
          </svg>
          <input
            type="color"
            title="Text Color"
            onInput={(event: any) => {
              editor.chain().focus().setColor(event.target.value).run();
            }}
            value={editor.getAttributes("textStyle").color || "#ffffff"}
            className="opacity-0 w-full h-full cursor-pointer"
          />
        </div>

        <IconButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          title="Highlight"
        >
          <svg
            className={editor.isActive("highlight") ? "text-yellow-600" : ""}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 11-6 6v3h9l3-3" />
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
          </svg>
        </IconButton>
      </div>

      <div className="flex gap-1 ml-auto">
        <IconButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
};

export default function Tiptap({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],

    content: content || ``,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[400px] p-8 text-black",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content) {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-[#f5f5f5] shadow-xl overflow-hidden">
      <Toolbar editor={editor} />

      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
        }
        .ProseMirror p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        .ProseMirror ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ProseMirror mark {
          background-color: #facc15;
          color: black;
          padding: 0 2px;
          border-radius: 2px;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #3f3f46;
          padding-left: 1rem;
          font-style: italic;
          color: #a1a1aa;
        }
      `}</style>

      <EditorContent editor={editor} />
    </div>
  );
}
