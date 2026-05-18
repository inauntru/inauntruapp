"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  TextB, TextItalic, TextUnderline, TextAlignLeft, TextAlignCenter,
  TextAlignRight, ListBullets, ListNumbers, Quotes, Link as LinkIcon,
  TextHOne, TextHTwo, ArrowCounterClockwise, ArrowClockwise,
} from "@phosphor-icons/react";
import { useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

export interface RichTextEditorHandle {
  insertText: (text: string) => void;
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-forest-green text-white"
          : "text-secondary-text hover:bg-light-green hover:text-deep-green"
      }`}
    >
      {children}
    </button>
  );
}

const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor({ content, onChange, placeholder = "Scrie aici...", minHeight = "200px" }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Underline,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-forest-green underline" } }),
        Placeholder.configure({ placeholder }),
      ],
      content,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: "prose prose-sm max-w-none focus:outline-none font-body text-on-surface",
          style: `min-height: ${minHeight}; padding: 12px;`,
        },
      },
    });

    useImperativeHandle(ref, () => ({
      insertText: (text: string) => {
        editor?.chain().focus().insertContent(text).run();
      },
    }));

    // Sync content if controlled from outside
    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);

    const setLink = useCallback(() => {
      if (!editor) return;
      const prev = editor.getAttributes("link").href as string ?? "";
      const url = window.prompt("URL link:", prev);
      if (url === null) return;
      if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
      <div className="border border-sage-border rounded-xl overflow-hidden focus-within:border-forest-green transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-sage-border bg-light-green/40">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
            <TextB size={15} weight="bold" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
            <TextItalic size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Subliniat">
            <TextUnderline size={15} />
          </ToolbarButton>

          <div className="w-px h-5 bg-sage-border mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Titlu mare">
            <TextHOne size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Titlu mic">
            <TextHTwo size={15} />
          </ToolbarButton>

          <div className="w-px h-5 bg-sage-border mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Aliniere stânga">
            <TextAlignLeft size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Centrare">
            <TextAlignCenter size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Aliniere dreapta">
            <TextAlignRight size={15} />
          </ToolbarButton>

          <div className="w-px h-5 bg-sage-border mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Listă puncte">
            <ListBullets size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Listă numerotată">
            <ListNumbers size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citat">
            <Quotes size={15} />
          </ToolbarButton>

          <div className="w-px h-5 bg-sage-border mx-1" />

          <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Inserează link">
            <LinkIcon size={15} />
          </ToolbarButton>

          <div className="w-px h-5 bg-sage-border mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Anulează">
            <ArrowCounterClockwise size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refă">
            <ArrowClockwise size={15} />
          </ToolbarButton>
        </div>

        {/* Editor area */}
        <EditorContent editor={editor} />
      </div>
    );
  }
);

export default RichTextEditor;
