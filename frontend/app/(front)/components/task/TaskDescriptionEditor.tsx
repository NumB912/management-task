"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  ["bold", "Bôi đậm (Ctrl+B)", Bold],
  ["italic", "In nghiêng (Ctrl+I)", Italic],
  ["insertUnorderedList", "Danh sách dấu đầu dòng", List],
  ["insertOrderedList", "Danh sách đánh số", ListOrdered],
] as const;
type Command = (typeof tools)[number][0];

function cleanHtml(html: string): string {
  const source = new DOMParser().parseFromString(html, "text/html");
  const output = document.createElement("div");
  const copy = (node: Node, parent: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent ?? ""));
      return;
    }
    if (!(node instanceof Element)) return;
    const tag = node.tagName.toLowerCase();
    if (["script", "style", "iframe", "object", "svg", "math", "template"].includes(tag)) return;
    const normalized = tag === "b" ? "strong" : tag === "i" ? "em" : tag;
    const allowed = ["p", "div", "br", "strong", "em", "ul", "ol", "li"].includes(normalized);
    const target = allowed ? document.createElement(normalized) : parent;
    if (allowed) parent.appendChild(target);
    node.childNodes.forEach(child => copy(child, target));
  };
  source.body.childNodes.forEach(node => copy(node, output));
  return output.textContent?.trim() ? output.innerHTML : "";
}

function loadDescription(value: string): string {
  if (/^\s*<(?:p|div|strong|em|b|i|ul|ol|li|br)(?:\s|>|\/)/i.test(value)) return cleanHtml(value);
  const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (text: string) => escape(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/_([^_]+)_/g, "<em>$1</em>");
  const lines = value.split("\n");
  let html = "";
  for (let index = 0; index < lines.length;) {
    const ordered = /^\d+\. /.test(lines[index]);
    if (ordered || /^- /.test(lines[index])) {
      const tag = ordered ? "ol" : "ul";
      html += `<${tag}>`;
      while (index < lines.length && (ordered ? /^\d+\. / : /^- /).test(lines[index])) {
        html += `<li>${inline(lines[index++].replace(ordered ? /^\d+\. / : /^- /, ""))}</li>`;
      }
      html += `</${tag}>`;
    } else {
      html += `<div>${inline(lines[index++]) || "<br>"}</div>`;
    }
  }
  return value ? html : "";
}

export default function TaskDescriptionEditor({ value, onSave }: {
  value: string;
  onSave: (description: string) => void;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const selection = useRef<Range | null>(null);
  const savedHtml = useRef("");
  const dirtyRef = useRef(false);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [empty, setEmpty] = useState(!value);
  const [active, setActive] = useState<Partial<Record<Command, boolean>>>({});

  useEffect(() => {
    if (editing) editor.current?.focus();
  }, [editing]);

  useEffect(() => {
    const field = editor.current;
    if (!field) return;
    const next = loadDescription(value);
    if (!dirtyRef.current || next === cleanHtml(field.innerHTML)) {
      if (field.innerHTML !== next) field.innerHTML = next;
      savedHtml.current = next;
      dirtyRef.current = false;
      setDirty(false);
      setEmpty(!field.textContent?.trim());
    }
  }, [value]);

  useEffect(() => {
    const remember = () => {
      const current = window.getSelection();
      if (!current?.rangeCount || !editor.current?.contains(current.anchorNode)
        || !editor.current.contains(current.focusNode)) return;
      selection.current = current.getRangeAt(0).cloneRange();
      setActive(Object.fromEntries(tools.map(([command]) => [command, document.queryCommandState(command)])));
    };
    document.addEventListener("selectionchange", remember);
    return () => document.removeEventListener("selectionchange", remember);
  }, []);

  const changed = () => {
    const field = editor.current;
    if (!field) return;
    dirtyRef.current = cleanHtml(field.innerHTML) !== savedHtml.current;
    setDirty(dirtyRef.current);
    setEmpty(!field.textContent?.trim());
  };

  const format = (command: Command) => {
    const field = editor.current;
    if (!field) return;
    field.focus();
    if (selection.current && field.contains(selection.current.commonAncestorContainer)) {
      const current = window.getSelection();
      current?.removeAllRanges();
      current?.addRange(selection.current);
    }
  
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command, false);
    setActive(Object.fromEntries(tools.map(([tool]) => [tool, document.queryCommandState(tool)])));
    changed();
  };

  const cancel = () => {
    if (editor.current) {
      const html = loadDescription(value);
      editor.current.innerHTML = html;
      savedHtml.current = html;
      setEmpty(!editor.current.textContent?.trim());
    }
    selection.current = null;
    dirtyRef.current = false;
    setDirty(false);
    setActive({});
    setEditing(false);
  };

  return (
    <div className={`rounded-md overflow-hidden ${editing ? "border" : "border border-transparent hover:border-border"}`}>
      {editing && <div role="toolbar" aria-label="Định dạng mô tả" className="flex flex-wrap items-center gap-1 border-b p-1">
        {tools.map(([command, label, Icon]) => (
          <Button key={command} type="button" variant={active[command] ? "secondary" : "ghost"} size="icon"
            aria-label={label} aria-pressed={!!active[command]} title={label}
            onMouseDown={event => event.preventDefault()} onClick={() => format(command)}>
            <Icon className="size-4" />
          </Button>
        ))}
      </div>}
      <div className="relative min-h-30">
        {empty && <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">{editing ? "Nhập mô tả công việc…" : "Thêm mô tả…"}</span>}
        <div ref={editor} contentEditable={editing} suppressContentEditableWarning
          role={editing ? "textbox" : "button"} tabIndex={0} aria-multiline={editing ? true : undefined}
          aria-label={editing ? "Mô tả công việc" : "Chỉnh sửa mô tả công việc"}
          onClick={() => { if (!editing) setEditing(true); }} onInput={changed}
          onPaste={event => {
            if (!editing) return;
            event.preventDefault();
            document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
            changed();
          }}
          onDrop={event => event.preventDefault()}
          onKeyDown={event => {
            if (!editing) {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setEditing(true);
              }
              return;
            }
            if ((event.ctrlKey || event.metaKey) && ["b", "i"].includes(event.key.toLowerCase())) {
              event.preventDefault();
              format(event.key.toLowerCase() === "b" ? "bold" : "italic");
            }
          }}
          className={`${editing ? "min-h-28" : "min-h-12 cursor-text"} max-h-60 overflow-y-auto p-3 text-sm whitespace-pre-wrap wrap-break-word outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_strong]:font-bold [&_em]:italic`} />
      </div>
      {editing && <div className="flex items-center justify-between gap-2 border-t p-2">
        <span className="text-xs text-muted-foreground">Chọn đoạn chữ rồi định dạng.</span>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={cancel}>Hủy</Button>
          <Button type="button" size="sm" disabled={!dirty} onClick={() => {
            if (editor.current) {
              onSave(cleanHtml(editor.current.innerHTML));
              selection.current = null;
              setActive({});
              setEditing(false);
            }
          }}>Lưu mô tả</Button>
        </div>
      </div>}
    </div>
  );
}
