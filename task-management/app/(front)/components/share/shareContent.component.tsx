"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Edit2, Eye, Trash2, UserPlus, X } from "lucide-react";
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
import { useWorkspaceStore } from "../../states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import {
  IMemberModel,
  IRoleMember,
  IStatusMember,
} from "../../model/member.model";
import {
  useInvite,
  useRemoveMember,
  useUpdateMember,
} from "../../feature/hook/useMemberMutation.hook";
import useUserState from "../../states/user/user.state";

interface ShareContentProps {
  listId: string;
  onClose?: () => void;
}
interface Contact {
  name: string;
  email: string;
  avatar?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function initialsOf(text: string) {
  return text[0]?.toUpperCase() ?? "?";
}

const ROLE_LABEL: Record<IRoleMember, string> = {
  "can edit": "Có thể chỉnh sửa",
  "read only": "Chỉ có thể đọc",
  owner: "Chủ danh sách",
};

const STATUS_LABEL: Record<IStatusMember, string> = {
  accept: "Chấp thuận",
  deny: "Từ chối",
  pending: "Đang chờ chấp thuận",
};

export function ShareContent({ listId, onClose }: Readonly<ShareContentProps>) {
  const listIndex = useWorkspaceStore(useShallow((state) => state.listIndex));
  const { user } = useUserState();
  const list = useMemo(() => listIndex[listId], [listIndex, listId]);
  const lists = useMemo(() => Object.values(listIndex), [listIndex]);
  const [members, setMembers] = useState<IMemberModel[]>(list.members ?? []);
  const [input, setInput] = useState("");
  const [staged, setStaged] = useState<string[]>([]);
  const [error, setError] = useState("");
  const { mutate: updateMember } = useUpdateMember();
  const { mutate: Invite } = useInvite();
  const { mutate: removeMember } = useRemoveMember();
  const isOwner = true;
  const query = input.trim().toLowerCase();
  const isInviting = query.length > 0 || staged.length > 0;

  // Trạng thái của từng thành viên trong list hiện tại
  const memberStatusByEmail = useMemo(() => {
    const map = new Map<string, IStatusMember>();
    members?.forEach((m) => {
      if (m.email) map.set(m.email.toLowerCase(), m.status);
    });
    return map;
  }, [members]);

  // Chỉ chặn mời lại người ĐÃ chấp nhận. pending / deny vẫn được mời lại.
  const isAccepted = (email: string) =>
    memberStatusByEmail.get(email.toLowerCase()) === "accept";

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const result: IMemberModel[] = [];

    for (const l of lists) {
      if (l.id === listId) continue;

      for (const member of l.members) {
        const email = member.email?.toLowerCase();
        if (!email) continue;
        if (memberStatusByEmail.get(email) === "accept") continue;
        if (member.status == "pending") continue;
        if (staged.includes(email)) continue;
        if (seen.has(email)) continue;
        const matchQuery =
          query.length > 0 &&
          (email.includes(query) ||
            member.user.name.toLowerCase().includes(query));

        if (!matchQuery) continue;

        seen.add(email);
        result.push(member);
      }
    }

    return result;
  }, [lists, listId, memberStatusByEmail, staged, query]);

  const canAddTyped = EMAIL_REGEX.test(query);

  // Thêm người mới, hoặc thay thế lời mời cũ (pending/deny) bằng lời mời mới
  const addContactNow = (contact: Contact) => {
    const email = contact.email.toLowerCase();
    setMembers((prev) => [
      ...prev.filter((m) => m.email?.toLowerCase() !== email),
      {
        id: crypto.randomUUID(),
        name: contact.name,
        email: contact.email,
        avatar: contact.avatar,
        list: listId,
        user: {
          id: crypto.randomUUID(),
          name: contact.name,
          avatar: contact.avatar,
        },
        role: "can edit",
        status: "pending",
      },
    ]);
  };

  const handleInviteContact = (contact: Contact) => {
    const previousMembers = members;
    addContactNow(contact);
    setInput("");

    Invite(
      {
        email: [contact.email],
        listId,
      },
      {
        onError(error) {
          setMembers(previousMembers);
          toast.error(error.message ?? "Không thể mời người dùng này");
        },
        onSuccess() {
          toast.success(`Đã mời ${contact.email}`);
        },
      },
    );
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
      if (isAccepted(email)) {
        firstError ||= `${email} đã là thành viên`;
        continue;
      }
      if (nextStaged.includes(email)) continue;
      nextStaged.push(email);
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
    const emailsToInvite = [...staged];
    if (
      canAddTyped &&
      !emailsToInvite.includes(query) &&
      !isAccepted(query)
    ) {
      emailsToInvite.push(query);
    }
    if (emailsToInvite.length === 0) return;

    const previousMembers = members;

    // Những người đã có (pending/deny) -> đặt lại thành pending (lời mời mới thay lời cũ)
    setMembers((prev) =>
      prev.map((m) =>
        emailsToInvite.includes(m.email?.toLowerCase()) &&
        m.status !== "accept"
          ? { ...m, status: "pending" as IStatusMember }
          : m,
      ),
    );

    Invite(
      { email: emailsToInvite, listId },
      {
        onError(error) {
          setMembers(previousMembers);
          toast.error(error.message ?? "Không thể gửi lời mời");
        },
      },
    );

    toast.success(`Đã mời ${emailsToInvite.length} người`);
    resetInvite();
  };

  const pendingCount =
    staged.length +
    (canAddTyped && !staged.includes(query) && !isAccepted(query) ? 1 : 0);

  const handleRoleChange = (email: string, role: IRoleMember) => {
    const previous = members;
    setMembers((prev) =>
      prev.map((m) => (m.email === email ? { ...m, role } : m)),
    );

    updateMember(
      { email, listId, role },
      {
        onError: (error: Error) => {
          console.log(error.message);
          setMembers(previous);
          toast.error("Không thể đổi quyền, vui lòng thử lại");
        },
      },
    );
  };

  const handleRemoveMember = (email: string, status: IStatusMember) => {
    const previous = members;
    setMembers((prev) => prev.filter((m) => m.email !== email));

    removeMember(
      { listId, email },
      {
        onSuccess: () => {
          toast.success(
            status === "accept" ? "Đã xoá khỏi danh sách" : "Đã huỷ lời mời",
          );
        },
        onError: () => {
          setMembers(previous);
          toast.error("Có lỗi xảy ra, vui lòng thử lại");
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4">
      {user?.id == list.user && (
        <div className="space-y-1.5">
          <div className="relative">
            <Input
              type="email"
              className={cn("rounded-sm! p-4! pr-11!")}
              placeholder="Nhập email để thêm người dùng"
              value={input}
              disabled={user?.id != list.user}
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
      )}

      {isInviting ? (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {suggestions.length > 0 && (
            <div>
              <span className="text-sm font-medium text-neutral-400">
                Đã mời ở danh sách khác
              </span>
              <div className="divide-y">
                {suggestions.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant={"ghost"}
                    onClick={() => {
                      handleInviteContact({
                        email: c.email,
                        name: c.user.name,
                        avatar: c.user.avatar,
                      });
                      setInput("");
                    }}
                    className="flex w-full h-fit items-center gap-3 p-2! text-left hover:bg-muted/50"
                  >
                    <>
                      <Avatar className="size-9">
                        <AvatarImage src={c.user.avatar} alt={c.user.name} />
                        <AvatarFallback>
                          {initialsOf(c.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {c.user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Thêm
                      </span>
                    </>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {canAddTyped &&
            !staged.includes(query) &&
            !isAccepted(query) &&
            !suggestions.some((c) => c.email === query) && (
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
                    <AvatarImage src={m.user.avatar} alt={m.user.name} />
                    <AvatarFallback>{initialsOf(m.user.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {m.user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.status !== "accept" && `${STATUS_LABEL[m.status]} · `}
                      {m.email}
                    </p>
                  </div>

                  {isOwner && m.role !== "owner" && user?.id === list.user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-fit shrink-0 items-center justify-end gap-1 rounded-sm px-2 text-xs text-muted-foreground outline-0 hover:bg-muted data-[state=open]:bg-muted">
                        {ROLE_LABEL[m.role]}
                        <ChevronDown className="size-3.5" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-45 p-1.5">
                        <DropdownMenuRadioGroup
                          value={m.role}
                          onValueChange={(value) =>
                            handleRoleChange(m.email, value as IRoleMember)
                          }
                        >
                          <DropdownMenuRadioItem value="can edit">
                            <Edit2 className="w-2 h-2" />{" "}
                            {ROLE_LABEL["can edit"]}
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="read only">
                            <Eye className="w-2 h-2" />{" "}
                            {ROLE_LABEL["read only"]}
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(m.email, m.status)}
                        >
                          <Trash2 className="w-2 h-2" />
                          {m.status === "accept"
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