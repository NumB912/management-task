"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Edit2, Eye, Trash, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ShareContentProps {
  listId: string;
  onClose?: () => void;
}

type Status = "pending" | "accepted" | "cancelled" | "expired";
type Role = "owner" | "editor" | "viewer";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  status: Status;
}

interface Contact {
  name: string;
  email: string;
  avatar?: string;
}

const STATUS_LABEL: Record<Status, string> = {
  pending: "Đang chờ",
  accepted: "Đồng ý",
  cancelled: "Hủy",
  expired: "Hết hạn",
};

const ROLE_LABEL: Record<Role, string> = {
  owner: "Chủ sở hữu",
  editor: "Chỉnh sửa",
  viewer: "Chỉ xem",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// dữ liệu mẫu: thành viên của list này
const INITIAL_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "a@gmail.com",
    role: "owner",
    status: "accepted",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "b@gmail.com",
    role: "editor",
    status: "pending",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "c@gmail.com",
    role: "viewer",
    status: "expired",
  },
];

// dữ liệu mẫu: những người chủ đã mời ở các list khác
// TODO: lấy từ API (distinct member.user của mọi list mà owner là chủ)
const KNOWN_CONTACTS: Contact[] = [
  { name: "Phạm Thị D", email: "d@gmail.com" },
  { name: "Hoàng Văn E", email: "e@gmail.com" },
  { name: "Vũ Minh F", email: "f@gmail.com" },
];

function initialsOf(text: string) {
  return text[0]?.toUpperCase() ?? "?";
}

export function ShareContent({ onClose }: Readonly<ShareContentProps>) {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [input, setInput] = useState("");
  const [staged, setStaged] = useState<string[]>([]);
  const [error, setError] = useState("");
  const isOwner = true;

  const query = input.trim().toLowerCase();
  const isInviting = query.length > 0 || staged.length > 0;

  const memberEmails = useMemo(
    () => new Set(members.map((m) => m.email.toLowerCase())),
    [members],
  );

  const suggestions = useMemo(
    () =>
      KNOWN_CONTACTS.filter(
        (c) =>
          !memberEmails.has(c.email) &&
          !staged.includes(c.email) &&
          query.length > 0 &&
          (c.email.includes(query) || c.name.toLowerCase().includes(query)),
      ),
    [memberEmails, staged, query],
  );
  const canAddTyped = EMAIL_REGEX.test(query);
  const addContactNow = (contact: Contact) => {
    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: contact.name,
        email: contact.email,
        avatar: contact.avatar,
        role: "editor",
        status: "pending",
      },
    ]);
    toast.success(`Đã thêm ${contact.email}`);
  };

  const submitInput = () => {
    const emails = input
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (emails.length === 0) return;

    let firstError = "";
    const nextStaged = [...staged];

    for (const email of emails) {
      if (!EMAIL_REGEX.test(email)) {
        firstError ||= `Email không hợp lệ: ${email}`;
        continue;
      }
      if (memberEmails.has(email)) {
        firstError ||= `${email} đã là thành viên`;
        continue;
      }
      if (nextStaged.includes(email)) continue;

      const known = KNOWN_CONTACTS.find((c) => c.email === email);
      if (known) {
        addContactNow(known);
      } else {
        nextStaged.push(email);
      }
    }

    setStaged(nextStaged);
    setError(firstError);
    if (!firstError) setInput("");
  };

  const removeStaged = (email: string) =>
    setStaged((prev) => prev.filter((e) => e !== email));

  const resetInvite = () => {
    setInput("");
    setStaged([]);
    setError("");
  };

  const sendInvites = () => {
    const list = [...staged];
    if (canAddTyped && !list.includes(query) && !memberEmails.has(query)) {
      list.push(query);
    }
    if (list.length === 0) return;
    setMembers((prev) => [
      ...prev,
      ...list.map<Member>((email) => ({
        id: crypto.randomUUID(),
        name: email.split("@")[0],
        email,
        role: "editor",
        status: "pending",
      })),
    ]);
    toast.success(`Đã mời ${list.length} người`);
    resetInvite();
  };

  const pendingCount =
    staged.length + (canAddTyped && !staged.includes(query) ? 1 : 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4">
      <div className="space-y-1.5">
        <div className="relative">
          <Input
            type="email"
            className={cn("rounded-sm! p-4! pr-11!")}
            placeholder="Nhập email để thêm người dùng"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitInput();
              }
            }}
          />
          <button
            type="button"
            aria-label="Thêm người dùng"
            onClick={submitInput}
            disabled={query.length === 0}
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <UserPlus className="size-4" />
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {isInviting ? (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {suggestions.length > 0 && (
            <div>
              <span className="text-sm font-medium text-neutral-400">
                Đã mời ở danh sách khác
              </span>
              <div className="divide-y">
                {suggestions.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => {
                      addContactNow(c);
                      setInput("");
                    }}
                    className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-muted/50"
                  >
                    <Avatar className="size-9">
                      <AvatarImage src={c.avatar} alt={c.name} />
                      <AvatarFallback>{initialsOf(c.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Thêm
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {canAddTyped &&
            !staged.includes(query) &&
            !memberEmails.has(query) &&
            !KNOWN_CONTACTS.some((c) => c.email === query) && (
              <button
                type="button"
                onClick={submitInput}
                className="flex w-full items-center gap-3 rounded-sm border border-dashed px-3 py-2.5 text-left hover:bg-muted/50"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <UserPlus className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Mời {query}</p>
                  <p className="text-xs text-muted-foreground">
                    Nhấn Enter để thêm vào danh sách
                  </p>
                </div>
              </button>
            )}
          {staged.length > 0 && (
            <div>
              <span className="text-sm font-medium text-neutral-400">
                Sẽ được mời ({staged.length})
              </span>
              <div className="divide-y">
                {staged.map((email) => (
                  <div key={email} className="flex items-center gap-3 py-2.5">
                    <Avatar className="size-9">
                      <AvatarFallback>{initialsOf(email)}</AvatarFallback>
                    </Avatar>
                    <p className="min-w-0 flex-1 truncate text-sm">{email}</p>
                    <button
                      type="button"
                      aria-label={`Bỏ ${email}`}
                      onClick={() => removeStaged(email)}
                      className="flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div>
            <span className="text-sm font-medium text-neutral-400">
              Thành viên ({members.length})
            </span>
            <div className="max-h-60 divide-y overflow-y-auto">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-2.5">
                  <Avatar className="size-9">
                    <AvatarImage src={m.avatar} alt={m.name} />
                    <AvatarFallback>{initialsOf(m.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.status !== "accepted" &&
                        `${STATUS_LABEL[m.status]} · `}
                      {m.email}
                    </p>
                  </div>

                  {isOwner && m.role !== "owner" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-25 shrink-0 items-center justify-end gap-1 rounded-sm px-2 text-xs text-muted-foreground outline-0 hover:bg-muted data-[state=open]:bg-muted">
                        {ROLE_LABEL[m.role]}
                        <ChevronDown className="size-3.5" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-40 p-1.5">
                        <DropdownMenuRadioGroup
                          value={m.role}
           
                        >
                          <DropdownMenuRadioItem value="editor">
                            <Edit2 className="w-2 h-2"/> {ROLE_LABEL.editor}
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="viewer">
                            <Eye/> {ROLE_LABEL.viewer}
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                        >
                          <Trash2 className="w-2 h-2"/>
                          {m.status === "accepted"
                            ? "Xóa khỏi danh sách"
                            : "Hủy lời mời"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="w-28 p-2 shrink-0 text-right text-xs text-muted-foreground">
                      {ROLE_LABEL[m.role]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {members.length <= 1 && (
            <div className="flex w-full flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <UserPlus className="size-7 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Chưa có ai được mời</p>
                  <p className="max-w-55 text-xs text-muted-foreground">
                    Nhập email phía trên để mời người khác cùng xem và chỉnh sửa
                    danh sách này
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {isInviting && (
        <div className="mt-auto flex justify-end gap-2 border-t py-3">
          <Button
            className={cn("rounded-sm")}
            variant="secondary"
            onClick={() => {
              resetInvite();
              if (staged.length === 0 && query.length === 0) onClose?.();
            }}
          >
            Hủy
          </Button>
          <Button
            className={cn("rounded-sm")}
            disabled={pendingCount === 0}
            onClick={sendInvites}
          >
            Mời tham gia{pendingCount > 0 && ` (${pendingCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}
