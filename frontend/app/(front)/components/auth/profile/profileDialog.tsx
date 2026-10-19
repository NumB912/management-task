"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "../../ui/label";
import {
  useDeleteFile,
  useUpdateProfile,
  useUploadFile,
} from "@/app/(front)/feature/hook/useUpdateProfile.Mutate";
import useUserState from "@/app/(front)/feature/store/user/user.state";
import { MAX_VALUE_REG } from "recharts/types/util/ChartUtils";
import AvatarEditor from "../../avatar.component";
import { axiosInstance } from "@/app/(front)/lib/axios";
export function getInitials(name: string, email: string) {
  const parts = (name.trim() || email).split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const NAME_MAX = 50;
const DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface ProfileDialogProps {
  name: string;
  email: string;
  avatar?: string | null;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogout?: () => void | Promise<void>;
}

const ProfileDialog = ({
  name,
  email,
  avatar,
  children,
  open,
  onOpenChange,
  onLogout,
}: ProfileDialogProps) => {
  const nameId = useId();
  const [draft, setDraft] = useState(name);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const { setUser, user } = useUserState();
  const [loggingOut, setLoggingOut] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [googleMessage, setGoogleMessage] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("google_link");
    if (!result) return;
    setGoogleMessage(result === "success" ? "Liên kết Google thành công. Bạn có thể đăng nhập bằng Google."
      : result === "email_mismatch" ? "Vui lòng chọn tài khoản Google có cùng email với hồ sơ."
      : "Liên kết chưa thành công hoặc đã bị hủy. Vui lòng thử lại.");
    useUserState.getState().setOpen(true);
    onOpenChange?.(true);
    void useUserState.getState().fetchUser();
    url.searchParams.delete("google_link");
    window.history.replaceState(null, "", url.toString());
  }, []);

  async function linkGoogle() {
    setLinkingGoogle(true);
    setGoogleMessage("");
    try {
      const { data } = await axiosInstance.post<{ url: string }>("/auth/google/link", {});
      window.location.assign(data.url);
    } catch {
      setGoogleMessage("Không thể bắt đầu liên kết. Hãy kiểm tra phiên đăng nhập và thử lại.");
      setLinkingGoogle(false);
    }
  }
  const { mutate: update } = useUpdateProfile();
  const { mutateAsync: upLoadFile } = useUploadFile();
  const {mutateAsync:deleteFile} = useDeleteFile()
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setDraft(value);
    setStatus("idle");
  }

  async function handleUpdateFile(file: File) {
    const fileReview = URL.createObjectURL(file);
    const prevAvatar = user?.avatar;
    setUser({
      avatar: fileReview,
    });

    try {
       await upLoadFile(file);
    } catch (error) {
      setUser({
        avatar: prevAvatar,
      });
      URL.revokeObjectURL(fileReview)
      console.error("Lỗi trong quá trình cập nhật hình");
    }
  }

  async function handleDeleteFile(){
    const prevAvatar = user?.avatar;
    setUser({
      avatar:undefined
    })  
    
    try {
      await deleteFile();
    } catch (error) {
      setUser({
        avatar: prevAvatar,
      });
      
      console.error("Lỗi trong quá trình cập nhật hình");
    }

  }

  async function handleSubmit() {
    setUser({
      name: draft,
    });
    update(
      {
        name: draft,
      },
    );
  }

  useEffect(() => {
    if (draft.length == 0 || draft.length >= NAME_MAX) return;
    const fn = setTimeout(() => {
      handleSubmit();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(fn);
    };
  }, [draft]);

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(name);
      setStatus("idle");
    }
    onOpenChange?.(next);
  }

  async function handleLogout() {
    if (!onLogout) return;
    setLoggingOut(true);
    try {
      await onLogout();
      onOpenChange?.(false);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="sm:max-w-xl shadow-2xs">
        <DialogHeader>
          <DialogTitle className="sr-only">Hồ sơ</DialogTitle>
          <DialogDescription className="sr-only">
            Thông tin tài khoản của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-10 py-2">
          <div className="flex flex-col gap-2 items-center">
            <div className="w-full">
              <AvatarEditor
                name={name}
                avatar={avatar}
                className=""
                onRemove={handleDeleteFile}
                onUpload={handleUpdateFile}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-muted-foreground text-xs">
                Hình ảnh chỉ được có kích cỡ từ 0Mb tới 4Mb thôi
              </div>
            </div>
          </div>
          <div className="w-full space-y-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor={nameId} className="font-bold">
                Tên
              </Label>
              <Input
                id={nameId}
                value={draft}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter"}
                maxLength={NAME_MAX}
                autoComplete="name"
                className="rounded bg-transparent! p-2! mt-1"
                aria-invalid={status === "error"}
                aria-describedby={`${nameId}-hint`}
              />
              <div className="flex w-full justify-end">
                <span className="text-muted-foreground text-sm">
                  {draft.length}/{NAME_MAX}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold">Email</span>
              <p className="truncate font-light mt-1">{email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div className="font-medium">Liên kết Google</div>
          <p className="text-sm text-muted-foreground">
            {user?.googleLinked ? "Đã liên kết Google. Bạn có thể đăng nhập bằng email hoặc Google."
              : "Chưa liên kết Google. Liên kết tài khoản Google có cùng email để đăng nhập thuận tiện hơn."}
          </p>
          {!user?.googleLinked && <Button type="button" variant="outline" onClick={linkGoogle} disabled={linkingGoogle || !user}>
            {linkingGoogle ? "Đang chuyển đến Google…" : "Liên kết với Google"}
          </Button>}
          {googleMessage && <p role="status" className="text-sm">{googleMessage}</p>}
        </div>

        {onLogout && (
          <DialogFooter className="bg-transparent p-2">
            <Button
              variant="destructive"
              className="border! bg-transparent! hover:bg-neutral-300!"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
