"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { useAdminData } from "../AdminContext";
import { Input, Select } from "../ui";

function ToolButton({ active, onClick, label, children, disabled }: { active?: boolean; onClick: () => void; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-8 rounded-md px-2 py-1 text-sm font-semibold transition disabled:opacity-40 ${active ? "bg-[#050505] text-white" : "text-zinc-700 hover:bg-zinc-200"}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, minimal = false, id }: { value: string; onChange: (html: string) => void; minimal?: boolean; id?: string }) {
  const { pages } = useAdminData();
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: minimal ? false : { levels: [2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        bulletList: minimal ? false : undefined,
        orderedList: minimal ? false : undefined,
        listItem: minimal ? false : undefined,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rich prose-admin min-h-[7rem] px-3.5 py-3 text-[15px] leading-relaxed text-zinc-900 outline-none",
        ...(id ? { id } : {}),
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? "" : e.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            link: e.isActive("link"),
          }
        : null,
  });

  if (!editor) {
    return <div className="min-h-[9rem] rounded-xl border border-zinc-300 bg-white" />;
  }

  const openLink = () => {
    setHref((editor.getAttributes("link").href as string) ?? "");
    setLinkOpen(true);
  };
  const applyLink = () => {
    const clean = href.trim();
    if (!clean) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(clean)) editor.chain().focus().extendMarkRange("link").setLink({ href: clean }).run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: `https://${clean}` }).run();
    setLinkOpen(false);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-sm focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-[#fece00]/50">
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        {!minimal && (
          <>
            <ToolButton label="Tussenkop" active={state?.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolButton>
            <ToolButton label="Kleine tussenkop" active={state?.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolButton>
            <span className="mx-1 h-5 w-px bg-zinc-300" />
          </>
        )}
        <ToolButton label="Vet" active={state?.bold} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolButton>
        <ToolButton label="Cursief" active={state?.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolButton>
        {!minimal && (
          <>
            <ToolButton label="Opsomming" active={state?.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lijst</ToolButton>
            <ToolButton label="Genummerde lijst" active={state?.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Lijst</ToolButton>
          </>
        )}
        <span className="mx-1 h-5 w-px bg-zinc-300" />
        <ToolButton label="Link toevoegen" active={state?.link} onClick={openLink}>Link</ToolButton>
        <span className="ml-auto" />
        <ToolButton label="Ongedaan maken" onClick={() => editor.chain().focus().undo().run()}>↶</ToolButton>
        <ToolButton label="Opnieuw" onClick={() => editor.chain().focus().redo().run()}>↷</ToolButton>
      </div>
      {linkOpen && (
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-[#fffbe6] px-3 py-2">
          <Select aria-label="Link naar een pagina" className="w-auto py-1.5 text-sm" value="" onChange={(e) => e.target.value && setHref(e.target.value)}>
            <option value="">Kies een pagina…</option>
            {pages.map((p) => (
              <option key={p.id} value={p.slug ? `/${p.slug}` : "/"}>
                {p.title}
              </option>
            ))}
          </Select>
          <Input aria-label="Of plak een webadres" placeholder="of https://… / mailto:…" value={href} onChange={(e) => setHref(e.target.value)} className="min-w-48 flex-1 py-1.5 text-sm" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } }} />
          <button type="button" className="rounded-lg bg-[#050505] px-3 py-1.5 text-sm font-semibold text-white" onClick={applyLink}>Toepassen</button>
          <button type="button" className="rounded-lg px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200" onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); setLinkOpen(false); }}>Link weghalen</button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
